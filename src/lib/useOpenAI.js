import { useEffect, useState } from "react";
import OpenAI from "openai";

const useOpenAI = () => {
  const [openai, setOpenAI] = useState(null);

  useEffect(() => {
    const client = new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });
    setOpenAI(client);
  }, []);

  return openai;
};

export default useOpenAI;
