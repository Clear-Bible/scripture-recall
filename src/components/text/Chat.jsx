import React, { useState, useEffect, useRef, useContext } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ChatProvider, useChatContext } from "@/lib/ChatContext";
import ActiveSnippet from "@/components/ActiveSnippet";
// import {
//   UserMessage,
//   AssistantMessage,
//   CodeMessage,
//   TypingIndicator,
// } from "./MessageComponents";
import useOpenAI from "@/lib/useOpenAI";
import Markdown from "react-markdown";
import { saveSnippet } from "@/db/snippets";
import MemoryVerseDialog from "../memory/MemoryVerseDialog";
import { getVersesByReference } from "@/db/bible";

// import * as bcvLib from "bible-passage-reference-parser/js/en_bcv_parser";
import * as parserModule from "bible-ref-parse/js/en_bcv_parser";
const parser = new parserModule.bcv_parser();

const Chat = ({ mode, snippet, initialPrompt }) => {
  const UserMessage = ({ text }) => {
    return (
      <div className="self-end text-white bg-black dark:bg-white dark:text-black rounded-2xl px-4 py-2 max-w-[80%] break-words mt-2 mb-2">
        {text}
      </div>
    );
  };

  const [newSnippet, setNewSnippet] = useState({
    id: "",
    reference: "",
    body: "",
    status: "1",
  });

  const addSnippet = async () => {
    if (newSnippet.reference && newSnippet.body && newSnippet.status) {
      try {
        await saveSnippet(newSnippet);
        //await fetchSnippets();
        setNewSnippet({ reference: "", body: "", status: "1" });
        setIsDialogOpen(false);
      } catch (err) {
        //setError(err.message);
      }
    }
  };

  const AssistantMessage = ({ text }) => {
    //console.log(text);

    const [refTokens, setRefTokens] = useState(text.split("<ref/>"));
    const [fullText, setFullText] = useState("");
    const [buttonTokens, setButtonTokens] = useState([]);

    useEffect(() => {
      async function addVerseBodies() {
        const bcv = parser;

        bcv.set_options({
          consecutive_combination_strategy: "separate",
          osis_compaction_strategy: "bcv",
          sequence_combination_strategy: "separate",
        });

        var withBodies = await Promise.all(
          refTokens.map(async (token) => {
            if (token.includes("**")) {
              var verseRefs = token;
              // Transform GPT verse ref into database compatible range of refs
              var parsedReference = bcv.parse(verseRefs).osis();

              var separateVerses = [];
              var referenceRanges = parsedReference.split(",");

              referenceRanges.map((refRange) => {
                var rangeEnds = refRange.split("-");
                var startArr = rangeEnds[0].split(".");
                var endArr = [];
                var endVerse = "";
                if (rangeEnds.length > 1) {
                  endArr = rangeEnds[1].split(".");
                  endVerse = endArr[2];
                } else {
                  endVerse = startArr[2];
                }
                for (let i = startArr[2]; i < Number(endVerse) + 1; i++) {
                  separateVerses.push(
                    startArr[0] + "." + startArr[1] + "." + i,
                  );
                }
              });

              var databaseVerses = [];
              try {
                databaseVerses = await getVersesByReference(separateVerses); // Get verses from database
              } catch {
                databaseVerses = [{ body: "Verse reference not found." }];
              }

              var unifiedBody = "";
              databaseVerses.forEach((databaseVerse) => {
                unifiedBody += databaseVerse.body;
              });
              return token + "  \n" + unifiedBody; // Modify token
            } else {
              return token;
            }
          }),
        );

        return withBodies.join(" ");
      }

      addVerseBodies().then((withBodies) => {
        console.log("withBodies", withBodies);
        setFullText(withBodies);
      });
    }, [refTokens]);

    useEffect(() => {
      setButtonTokens(fullText.split("<button/>"));
    }, [fullText]);

    const [hiddenButtons, setHiddenButtons] = useState(
      new Array(buttonTokens.length).fill(false),
    );

    const handleAddToMemory = async (tokens, index) => {
      var verse = tokens[index - 1];

      verse = verse.replace(/\n/g, "");
      verse = verse.replace(/&nbsp;/g, "");

      var verseArray = verse.split(/\*\*/);

      var length = verseArray.length;

      newSnippet.body = verseArray[length - 1].trim();
      newSnippet.reference = verseArray[length - 2].trim();

      setIsDialogOpen(true);

      setHiddenButtons((prevHiddenButtons) =>
        prevHiddenButtons.map((isHidden, i) => (i === index ? true : isHidden)),
      );
    };

    return (
      <div className="self-start bg-gray-200 dark:bg-gray-700 dark:text-white rounded-2xl px-4 py-2 max-w-[80%] break-words mt-2 mb-2">
        {buttonTokens.map((token, index) => {
          if (token.includes("BUTTON")) {
            // Handle JSX rendering
            return (
              <button
                key={index}
                onClick={() => handleAddToMemory(buttonTokens, index)}
                hidden={hiddenButtons[index]}
                className="self-start bg-gray-300 dark:bg-gray-600 dark:text-white rounded-2xl px-4 py-2 max-w-[80%] break-words mt-2 mb-2"
              >
                Add to Memory
              </button>
            );
          } else if (typeof token === "string") {
            // Pass only valid strings to ReactMarkdown
            return <Markdown key={index}>{token}</Markdown>;
          } else {
            console.error(`Unexpected value for token: ${token}`);
            return null; // Skip non-string tokens
          }
        })}
      </div>
    );
  };

  const CodeMessage = ({ text }) => {
    return (
      <div className="self-start bg-gray-100 dark:bg-gray-800 dark:text-gray-200 rounded-2xl px-4 py-2 max-w-[80%] break-words mt-2 mb-2 font-mono">
        {text.split("\n").map((line, index) => (
          <div key={index} className="mt-1">
            <span className="text-gray-400 dark:text-gray-500 mr-2">{`${index + 1}. `}</span>
            {line}
          </div>
        ))}
      </div>
    );
  };

  const TypingIndicator = () => {
    return (
      <div className="self-start bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 max-w-[20%] py-2 mt-2 mb-2">
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    );
  };

  const Message = ({ role, text, isTyping }) => {
    if (isTyping) return <TypingIndicator />;

    switch (role) {
      case "user":
        return <UserMessage text={text} />;
      case "assistant":
        return <AssistantMessage text={text} />;
      case "code":
        return <CodeMessage text={text} />;
      default:
        return null;
    }
  };

  const ChatInput = () => {
    const { userInput, setUserInput, handleSubmit, inputDisabled } =
      useChatContext();
    const textareaRef = useRef(null);

    const handleInputChange = (e) => {
      setUserInput(e.target.value);
      adjustTextAreaHeight();
    };

    const adjustTextAreaHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="flex items-end w-full">
        <Textarea
          ref={textareaRef}
          className="flex-grow px-4 py-2 mr-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-black dark:focus:border-white resize-none min-h-[40px] max-h-[200px]"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={inputDisabled}
          rows={1}
        />
        <button
          type="submit"
          className="text-sm px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 h-10"
          disabled={inputDisabled}
        >
          <Send strokeWidth={2} stroke="currentColor" />
        </button>
      </form>
    );
  };

  const ChatMessages = () => {
    const { messages, isTyping } = useChatContext();
    const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.content} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (e) => {
    setNewSnippet({ ...newSnippet, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value) => {
    setNewSnippet({ ...newSnippet, status: value });
  };

  const handleAddOrUpdateSnippet = async () => {
    await addSnippet();
  };

  const openai = useOpenAI();
  console.log("CHAT openAI?", openai);

  if (!openai) {
    return <p>Please wait...</p>;
  }

  if (openai) {
    return (
      <ChatProvider
        mode={mode}
        snippet={snippet}
        initialPrompt={initialPrompt}
        openai={openai}
      >
        <div className="flex flex-col h-full w-full">
          {snippet && (
            <div className="flex-shrink-0 w-full p-4">
              <ActiveSnippet snippet={snippet} />
            </div>
          )}
          <div className="flex-grow overflow-hidden">
            <ChatMessages />
          </div>
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
            <ChatInput />
            <p className="text-xs px-1 mt-2 text-gray-400">
              Enter to submit. Shift + Enter for new line.
            </p>
          </div>
        </div>
        <div>
          <MemoryVerseDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            newSnippet={newSnippet}
            editingIndex={null}
            handleInputChange={handleInputChange}
            handleStatusChange={handleStatusChange}
            handleAddOrUpdateSnippet={handleAddOrUpdateSnippet}
          />
        </div>
      </ChatProvider>
    );
  }
};

export default Chat;
