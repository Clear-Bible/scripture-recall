import { useState } from "react";
import Chat from "@/components/Chat"

function TextChat() {
  const [isLoading, setIsLoading] = useState(null);

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading) {
    return (
      <Chat />
    );
  }
}

export default TextChat;