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
      <Markdown>{text}</Markdown>
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

const Chat = ({ mode, snippet, initialPrompt }) => {
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
      </ChatProvider>
    );
  }
};

export default Chat;
