import { useRef, useState, useEffect } from "react";
import { VoiceProvider, useVoice } from "@humeai/voice-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Messages from "@/components/voice/Messages";
import Controls from "@/components/voice/Controls";
import StartCall from "@/components/voice/StartCall";
import { useParams, useNavigate } from "react-router-dom";
import { Speech, CircleChevronLeft } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import ActiveSnippet from "@/components/ActiveSnippet";

import { createVoicePracticePrompt } from "@/data/prompts";
import { getSnippetById } from "@/db/snippets";

const ActiveSpeaker = ({ speaker }) => {
  if (speaker === "assistant_message") {
    return <p>Assistant is speaking...</p>;
  }

  if (speaker === "user_interruption") {
    return <p>You are speaking...</p>;
  }

  if (!speaker) {
    return null;
  }

  return <p>Speaker: {speaker}</p>;
};

export function VoiceChat({ accessToken }) {
  const timeout = useRef(null);
  const ref = useRef(null);
  const { snippetId } = useParams();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [snippet, setSnippet] = useState(null);

  const navigate = useNavigate();

  const [speaker, setSpeaker] = useState(null);

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
    return <Loader />;
  }

  if (snippet) {
    return (
      <div
        className={
          "flex flex-col justify-between items-center max-w-screen h-full"
        }
      >
        <div className="w-full h-[20px] p-4">
          <ActiveSnippet snippet={snippet} />
          {/* <Card key={snippet.id}> */}
          {/*   <CardHeader> */}
          {/*     <CardTitle className="text-md"> */}
          {/*       <div className="flex justify-between items-center mb-2"> */}
          {/*         <Button */}
          {/*           className="m-0 p-0" */}
          {/*           variant="ghost" */}
          {/*           onClick={() => { */}
          {/*             navigate(-1); */}
          {/*           }} */}
          {/*         > */}
          {/*           <CircleChevronLeft */}
          {/*             strokeWidth={2} */}
          {/*             stroke={"currentColor"} */}
          {/*           /> */}
          {/*         </Button> */}
          {/*         <div>{snippet.reference}</div> */}
          {/*         <div> */}
          {/*           <StatusBadge status={snippet.status} /> */}
          {/*         </div> */}
          {/*       </div> */}
          {/*     </CardTitle> */}
          {/*   </CardHeader> */}
          {/* </Card> */}
        </div>

        <VoiceProvider
          // debug={true}
          auth={{ type: "apiKey", value: import.meta.env.VITE_HUME_API_KEY }}
          // auth={{ type: "accessToken", value: accessToken }}
          sessionSettings={{
            systemPrompt: createVoicePracticePrompt(snippet),
          }}
          onOpen={(open) => {
            console.log("onOPEN", open);
          }}
          onMessage={(msg) => {
            console.log(msg);

            setSpeaker(msg.type);

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
              className="flex flex-col items-center justify-between"
              initial="initial"
              animate="enter"
              exit="exit"
              variants={{
                initial: { opacity: 0 },
                enter: { opacity: 1 },
                exit: { opacity: 0 },
              }}
            >
              <Speech
                className="size-36 opacity-50"
                strokeWidth={2}
                stroke={"currentColor"}
              />
              <br />
              {/* <ActiveSpeaker speaker={speaker} /> */}
            </motion.div>
          </AnimatePresence>
          {/* <Messages ref={ref} /> */}
          <div className="px-4 mb-4">
            <Controls />
            <StartCall />
          </div>
        </VoiceProvider>
      </div>
    );
  }
}

export default VoiceChat;
