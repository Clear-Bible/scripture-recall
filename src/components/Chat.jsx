import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";

// Messages component
const UserMessage = ({ text }) => {
  return <div className={styles.userMessage}>{text}</div>;
};

const AssistantMessage = ({ text }) => {
  return (
    <div className={styles.assistantMessage}>
      {text}
    </div>
  );
};

const CodeMessage = ({ text }) => {
  return (
    <div className={styles.codeMessage}>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
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

// Chat component
const Chat = ({ functionCallHandler = () => Promise.resolve("") }) => {

    const [userInput, setUserInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [inputDisabled, setInputDisabled] = useState(false);
    const [threadId, setThreadId] = useState("");

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
    scrollToBottom();
    }, [messages]);

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
    
    const sendMessage = async (text) => {
        
    const response = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
        method: "POST",
        body: JSON.stringify({
            content: text,
        }),
        }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
    };

    const submitActionResult = async (runId, toolCallOutputs) => {
        const response = await fetch(
        `/api/assistants/threads/${threadId}/actions`,
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

    const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
    };

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
    //stream.on("imageFileDone", handleImageFileDone);
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
        text: lastMessage.text + text,
        };
        return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
    };

    const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
    };

    /*
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
    <div className={styles.chatContainer}>
        <div className={styles.messages}>
        {messages.map((msg, index) => (
            <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
        </div>
        <form
        onSubmit={handleSubmit}
        className={`${styles.inputForm} ${styles.clearfix}`}
        >
        <input
            type="text"
            className={styles.input}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your question"
        />
        <button type="submit" className={styles.button} disabled={inputDisabled}>
            Send
        </button>
        </form>
    </div>
    );
};

export default Chat;


/*
import OpenAI from "openai";

const openai = new OpenAI({ 
  dangerouslyAllowBrowser: true, 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Write a haiku about recursion in programming." },
  ],
});

return completion.choices[0].message;
*/