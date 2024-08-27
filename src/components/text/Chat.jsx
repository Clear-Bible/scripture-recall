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
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
  }, [messages, isTyping]);

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
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col flex-grow overflow-y-auto p-2.5 pb-24">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.content} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex w-full p-2.5 pb-6">
          <input
            type="text"
            className="flex-grow px-6 py-4 mr-2.5 rounded-full border-2 border-transparent text-base bg-gray-200 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-600"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your response"
            disabled={inputDisabled}
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
    </div>
  );
};

export default Chat;
