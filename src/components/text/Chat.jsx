import React, { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import { createPrompt } from "@/data/prompts";
import { useParams } from "react-router-dom";
import { getSnippetById } from "@/db";

const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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

const Message = ({ role, text }) => {
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
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");

  const messagesEndRef = useRef(null);

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
        var response = await sendMessage(messages);
        console.log("response", response);
        setMessages([response]);
      }
    };

    sendPrompt();
  }, [prompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // create a new threadID when chat component created

  /* 
    useEffect(() => {
        const createThread = async () => {
            const res = await fetch(`/api/assistants/threads`, {
            method: "POST",
            });
            const data = await res.json();
            setThreadId(data.threadId);
        };
        createThread();
    }, []);
    */

  const sendMessage = async (messages) => {
    var promptAndMessages = [{ role: "system", content: prompt }, ...messages];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: promptAndMessages,
    });

    //const stream = AssistantStream.fromReadableStream(response.body);
    //handleReadableStream(completion);

    return completion.choices[0].message;
  };

  /*
    const submitActionResult = async (runId, toolCallOutputs) => {
        const response = await fetch(
        `/api/assistants/threads/actions`,
        {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            runId: runId,
            toolCallOutputs: toolCallOutputs,
        }),
        }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
    };
    */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    var tempMessages = [...messages, { role: "user", content: userInput }];
    var response = await sendMessage(tempMessages);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userInput },
      response,
    ]);

    setUserInput("");
    //setInputDisabled(true);
    scrollToBottom();
  };

  /*
    const handleTextCreated = () => {
        appendMessage("assistant", "");
    };

    const handleTextDelta = (delta) => {
        if (delta.value != null) {
            appendToLastMessage(delta.value);
        }
        //if (delta.annotations != null) {
        //    annotateLastMessage(delta.annotations);
        //}
    };

    const handleImageFileDone = (image) => {
        appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
    };

    const toolCallCreated = (toolCall) => {
        if (toolCall.type !== "code_interpreter") return;
        appendMessage("code", "");
    };

    const toolCallDelta = (delta) => {
        if (delta.type !== "code_interpreter") return;
        if (!delta.code_interpreter.input) return;
        appendToLastMessage(delta.code_interpreter.input);
    };

    const handleRequiresAction = async (event) => {
        const runId = event.data.id;
        const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;

        const toolCallOutputs = await Promise.all(
            toolCalls.map(async (toolCall) => {
            const result = await functionCallHandler(toolCall);
            return { output: result, tool_call_id: toolCall.id };
            })
        );
        setInputDisabled(true);
        submitActionResult(runId, toolCallOutputs);
    };

    const handleRunCompleted = () => {
        setInputDisabled(false);
    };
    
    const handleReadableStream = (stream) => {
        stream.on("textCreated", handleTextCreated);
        stream.on("textDelta", handleTextDelta);
        stream.on("imageFileDone", handleImageFileDone);
        stream.on("toolCallCreated", toolCallCreated);
        stream.on("toolCallDelta", toolCallDelta);

        stream.on("event", (event) => {
            if (event.event === "thread.run.requires_action")
            handleRequiresAction(event);
            if (event.event === "thread.run.completed") handleRunCompleted();
        });
    };
    

    const appendToLastMessage = (text) => {
        setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            const updatedLastMessage = {
            ...lastMessage,
            content: lastMessage.text + text,
            };
            return [...prevMessages.slice(0, -1), updatedLastMessage];
        });
    };

    const appendMessage = (role, text) => {
        setMessages((prevMessages) => [...prevMessages, { role, text }]);
    };

    
    const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        const updatedLastMessage = {
        ...lastMessage,
        };
        annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
            updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
            );
        }
        });
        return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
    };
    */

  return (
    <div className="flex flex-col-reverse h-full w-full">
      <div className="flex-grow overflow-y-auto p-2.5 flex flex-col order-2 whitespace-pre-wrap">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.content} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex w-full p-2.5 pb-10 order-1">
        <input
          type="text"
          className="flex-grow px-6 py-4 mr-2.5 rounded-full border-2 border-transparent text-base bg-gray-200 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-600"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black border-none text-base rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
          disabled={inputDisabled}
        >
          Send
        </button>
      </form>
    </div>
  );
};
export default Chat;
