import { VoiceProvider } from "@humeai/voice-react";
import Messages from "@/components/voice/Messages";
import Controls from "@/components/voice/Controls";
import StartCall from "@/components/voice/StartCall";
import { useRef, useState, useEffect } from "react";
import {useParams} from "react-router-dom";
import {Speech} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import {createPrompt} from "@/data/prompts";
import { getSnippetById } from "@/db";

export function VoiceChat({ accessToken }) {
  const timeout = useRef(null);
  const ref = useRef(null);
  const {snippetId} = useParams()

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [snippet, setSnippet] = useState(null);

  console.info("VOICE CHAT: ", snippetId, snippet);


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

 if (isLoading) {
    return (
      <AnimatePresence>
        <motion.div
          className={
            "fixed inset-0 p-4 flex items-center justify-center bg-background"
          }
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <Loader />
        </motion.div>
      </AnimatePresence>
    );
  }


if (snippet) {
return (
    <div
      className={"relative grow flex flex-col mx-auto w-full overflow-hidden"}
    >
      <VoiceProvider
        debug={true}
        auth={{ type: "apiKey", value: import.meta.env.VITE_HUME_API_KEY }}
        // auth={{ type: "accessToken", value: accessToken }}
        sessionSettings={{
          systemPrompt: createPrompt(snippet)
        }}
        onMessage={() => {
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = ref.current.scrollHeight;

              ref.current.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
      >
          <AnimatePresence>
          <motion.div 
            className="fixed inset-0 flex items-center justify-center"
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >

          <Speech className="size-36 opacity-50" 
            strokeWidth={2}
            stroke={"currentColor"}
            />
            </motion.div>
            </AnimatePresence>
        {/* <Messages ref={ref} /> */}
        <Controls />
        <StartCall />
      </VoiceProvider>
    </div>
  );

  }
  }

export default VoiceChat;
