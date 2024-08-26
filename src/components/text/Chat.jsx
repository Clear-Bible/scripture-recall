import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import OpenAI from "openai";
import { createPrompt } from "@/data/prompts";
import { useParams } from "react-router-dom";
import { getSnippetById } from "@/db";

const openai = new OpenAI({ 
    dangerouslyAllowBrowser: true, 
    apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

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
        if(snippet != undefined){
            setPrompt(createPrompt(snippet))
        }
    }, [snippet]);

    useEffect(() => {

        const sendPrompt = async () => {
            if(prompt != null){
                var response = await sendMessage(messages);
                console.log("response", response)
                setMessages([
                    response
                ]);
            }
        }

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

        var promptAndMessages = [
            { role: "system", content: prompt },
            ...messages
        ]

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: promptAndMessages
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
        
        var tempMessages = [
            ...messages,
            { role: "user", content: userInput },
        ]
        var response = await sendMessage(tempMessages);
        setMessages((prevMessages) => [
            ...prevMessages,
            { role: "user", content: userInput },
            response
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
    <div className={styles.chatContainer}>
        <div className={styles.messages}>
            {messages.map((msg, index) => (
                <Message key={index} role={msg.role} text={msg.content} />
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