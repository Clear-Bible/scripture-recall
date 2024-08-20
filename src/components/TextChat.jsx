import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSnippetById } from "@/db";
import { createPrompt } from "@/data/prompts";

function TextChat() {
  const { snippetId } = useParams();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [snippet, setSnippet] = useState(null);

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

  if (!isLoading && snippet) {
    return (
      <>
        <p>Text Chat is not yet implemented.</p>
        <p>You selected:</p>
        <br />
        <p>{JSON.stringify(snippet)}</p>
        <br />
        <p>The prompt would be: </p>
        <br />
        <p>{createPrompt(snippet)}</p>
      </>
    );
  }
}

export default TextChat;
