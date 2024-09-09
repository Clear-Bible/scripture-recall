import React, { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({
  children,
  mode,
  snippet,
  initialPrompt,
  openai,
}) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [thread, setThread] = useState(null);
  const [error, setError] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState("");

  useEffect(() => {
    const initializeChat = async () => {
      if (!openai) return; // Wait until OpenAI is initialized

      try {
        setIsTyping(true);
        if (mode === "discovery") {
          const newThread = await openai.beta.threads.create();
          setThread(newThread);

          await openai.beta.threads.messages.create(newThread.id, {
            role: "user",
            content: "Hello",
          });

          const run = await openai.beta.threads.runs.create(newThread.id, {
            assistant_id: import.meta.env
              .VITE_OPENAI_BIBLE_VERSE_RECOMMENDER_ID,
          });

          await waitForRunCompletion(newThread.id, run.id);

          const messagesResponse = await openai.beta.threads.messages.list(
            newThread.id,
          );
          const assistantMessage = messagesResponse.data.find(
            (msg) => msg.role === "assistant",
          );

          if (assistantMessage && assistantMessage.content[0].type === "text") {
            setMessages([
              {
                role: "assistant",
                content: assistantMessage.content[0].text.value,
              },
            ]);
          }
        } else {
          // For practice mode
          setSystemPrompt(initialPrompt);

          // Send a hidden "Hello" message and get the assistant's response
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: initialPrompt },
              { role: "user", content: "Hello" },
            ],
          });

          if (
            response.choices &&
            response.choices[0] &&
            response.choices[0].message
          ) {
            setMessages([
              {
                role: "assistant",
                content: response.choices[0].message.content,
              },
            ]);
          } else {
            throw new Error("Failed to get initial response from assistant");
          }
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Failed to initialize chat. Please try again.");
      } finally {
        setIsTyping(false);
      }
    };

    initializeChat();
  }, [mode, initialPrompt, openai]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !openai) return;

    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setUserInput("");
    setInputDisabled(true);
    setIsTyping(true);

    try {
      if (mode === "discovery") {
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: userInput,
        });
        await sendDiscoveryMessage();
      } else {
        const response = await sendPracticeMessage();
        setMessages((prev) => [...prev, response]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      setInputDisabled(false);
      setIsTyping(false);
    }
  };

  const sendPracticeMessage = async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: userInput },
      ],
    });
    setInputDisabled(false);
    setIsTyping(false);

    return response.choices[0].message;
  };

  const waitForRunCompletion = async (threadId, runId) => {
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    }
  };

  const sendDiscoveryMessage = async () => {
    openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: import.meta.env.VITE_OPENAI_BIBLE_VERSE_RECOMMENDER_ID,
      })
      .on("messageDone", async (event) => {
        if (event.content[0].type === "text") {
          const { text } = event.content[0];

          console.log(text.value);
          var newLineLess = text.value.replace(/\n/g, "");
          console.log(newLineLess);
          console.log(newLineLess.split(/&nbsp;|\*\*/));// /&nbsp;\s{2}\*\*|\*\*|&nbsp;/

          setMessages((prev) => [
            ...prev,
            { role: event.role, content: text.value },
          ]);
          setInputDisabled(false);
          setIsTyping(false);
        }
      });
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        userInput,
        setUserInput,
        inputDisabled,
        setInputDisabled,
        isTyping,
        setIsTyping,
        handleSubmit,
        mode,
        snippet,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
