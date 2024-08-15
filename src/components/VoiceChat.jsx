import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { useRef } from "react";

export function VoiceChat({ accessToken }) {
  const timeout = useRef(null);
  const ref = useRef(null);

  return (
    <div
      className={"relative grow flex flex-col mx-auto w-full overflow-hidden"}
    >
      <VoiceProvider
        debug={true}
        auth={{ type: "apiKey", value: import.meta.env.VITE_HUME_API_KEY }}
        // auth={{ type: "accessToken", value: accessToken }}
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
        <Messages ref={ref} />
        <Controls />
        <StartCall />
      </VoiceProvider>
    </div>
  );
}

export default VoiceChat;
