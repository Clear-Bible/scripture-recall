import { useState } from "react";
import Chat from "@/components/text/Chat";

function TextChat() {
  const [isLoading, setIsLoading] = useState(null);

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading) {
    return <Chat />;
  }
}

export default TextChat;
