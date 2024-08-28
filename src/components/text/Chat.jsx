import React, { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { createPrompt } from "@/data/prompts";
import { getSnippetById } from "@/db";
import ActiveSnippet from "@/components/ActiveSnippet";

const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content:
          "I'm going through a really tough time."
      },
    ],
  });
  
  // The thread now has a vector store in its tool resources.
console.log("thread.id:",thread.id);

const stream = openai.beta.threads.runs
  .stream(thread.id, {
    assistant_id: "asst_QfqjPRGjixNymlflcayv3cxV",
  })
  .on("textCreated", () => console.log("assistant >"))
  .on("toolCallCreated", (event) => console.log("assistant " + event.type))
  .on("messageDone", async (event) => {
    if (event.content[0].type === "text") {
      const { text } = event.content[0];
      const { annotations } = text;
      const citations = [];

      let index = 0;
      for (let annotation of annotations) {
        text.value = text.value.replace(annotation.text, "[" + index + "]");
        const { file_citation } = annotation;
        if (file_citation) {
          const citedFile = await openai.files.retrieve(file_citation.file_id);
          citations.push("[" + index + "]" + citedFile.filename);
        }
        index++;
      }

      console.log(text.value);
      console.log(citations.join("\n"));
    }
  });


const UserMessage = ({ text }) => {
  return (
    <div className="self-end text-white bg-black dark:bg-white dark:text-black rounded-2xl px-4 py-2 max-w-[80%] break-words mt-2 mb-2">
      {text}
    </div>
  );
};

const AssistantMessage = ({ text }) => {
  return (
    <div className="self-start bg-gray-200 dark:bg-gray-700 dark:text-white rounded-2xl px-4 py-2 max-w-[80%] break-words mt-2 mb-2">
      {text}
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
  if (isTyping) {
    return <TypingIndicator />;
  }

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

const Chat = ({ functionCallHandler = () => Promise.resolve("") }) => {
  // const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [threadId, setThreadId] = useState("");

  const messagesEndRef = useRef(null);

  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [userInput, setUserInput] = useState("");
  const textareaRef = useRef(null);
  console.log(
    textareaRef?.current?.style.height,
    typeof textareaRef?.current?.style.height,
  );

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const { snippetId } = useParams();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [snippet, setSnippet] = useState(null);

  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const data = await getSnippetById(snippetId);
        setSnippet(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchSnippet();
  }, []);

  useEffect(() => {
    if (snippet != undefined) {
      setPrompt(createPrompt(snippet));
    }
  }, [snippet]);

  useEffect(() => {
    const sendPrompt = async () => {
      if (prompt != null) {
        setUserInput("");
        setInputDisabled(true);
        setIsTyping(true);

        var response = await sendMessage(messages);
        console.log("response", response);
        setMessages([response]);

        setInputDisabled(false);
        setIsTyping(false);
      }
    };

    sendPrompt();
  }, [prompt]);

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages, isTyping]);

  const sendMessage = async (messages) => {
    var promptAndMessages = [{ role: "system", content: prompt }, ...messages];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: promptAndMessages,
    });

    return completion.choices[0].message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Immediately add the user's message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userInput },
    ]);

    setUserInput("");
    setInputDisabled(true);
    setIsTyping(true);
    scrollToBottom();

    try {
      // Send the message to the AI and wait for the response
      var response = await sendMessage([
        ...messages,
        { role: "user", content: userInput },
      ]);

      // Add the AI's response to the chat
      setMessages((prevMessages) => [...prevMessages, response]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally, add an error message to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "system",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setInputDisabled(false);
      setIsTyping(false);
      scrollToBottom();
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {snippet && (
        <div className="flex-shrink-0 w-full p-4">
          <ActiveSnippet snippet={snippet} />
        </div>
      )}
      <div className="flex-grow overflow-hidden">
        <div
          ref={messagesContainerRef}
          className="flex flex-col h-full overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg, index) => (
            <Message key={index} role={msg.role} text={msg.content} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
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
            className=" text-sm px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 h-10"
            disabled={inputDisabled}
          >
            <Send strokeWidth={2} stroke={"currentColor"} />
          </button>
        </form>
        <p className="text-xs px-1 mt-2 text-gray-400">
          Enter to submit. Shift + Enter for new line.
        </p>
      </div>
    </div>
  );
};

export default Chat;
