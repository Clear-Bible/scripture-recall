import { useState, useEffect } from "react";
import Chat from "@/components/text/Chat";
import React from "react";
import { useParams } from "react-router-dom";
import { getSnippetById } from "@/db/snippets";
import { createPrompt } from "@/data/prompts";
import Loader from "@/components/Loader";

function TextChat() {
  const [isLoading, setIsLoading] = useState(null);
  const { snippetId } = useParams();
  const [snippet, setSnippet] = useState(null);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        setIsLoading(true);
        const data = await getSnippetById(snippetId);
        setSnippet(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching snippet:", err);
      }
    };

    fetchSnippet();
  }, [snippetId]);

  if (isLoading || !snippet) {
    return <Loader />;
  }

  if (!isLoading && snippet) {
    return (
      <Chat
        mode="memorization"
        snippet={snippet}
        initialPrompt={createPrompt(snippet)}
      />
    );
  }
}

export default TextChat;

// import React from 'react';
// import Chat from './Chat';
// import { useParams } from 'react-router-dom';
// import { getSnippetById } from '@/db/snippets';

// const MemorizationChat = () => {
//   const { snippetId } = useParams();
//   const [snippet, setSnippet] = useState(null);

//   useEffect(() => {
//     const fetchSnippet = async () => {
//       try {
//         const data = await getSnippetById(snippetId);
//         setSnippet(data);
//       } catch (err) {
//         console.error('Error fetching snippet:', err);
//       }
//     };

//     fetchSnippet();
//   }, [snippetId]);

//   if (!snippet) return <div>Loading...</div>;

//   const memorizationPrompt = `You are an assistant helping the user memorize the following Bible verse: "${snippet.text}". Ask the user to recite the verse, provide hints when needed, and correct any mistakes.`;

//   return <Chat mode="memorization" snippet={snippet} initialPrompt={memorizationPrompt} />;
// };

// export default MemorizationChat;
