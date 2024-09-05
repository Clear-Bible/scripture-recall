import { LampDesk, MessagesSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import React, { useState, useEffect } from "react";
import Chat from "@/components/text/Chat";
import { useParams } from "react-router-dom";
import { getSnippetById } from "@/db/snippets";

const Discover = () => {
  // const { snippetId } = useParams();
  // const [snippet, setSnippet] = useState(null);
  // const [prompt, setPrompt] = useState(null);

  // useEffect(() => {
  //   const fetchSnippet = async () => {
  //     try {
  // const data = await getSnippetById(snippetId);
  // setSnippet(data);
  // setPrompt(createPrompt(data));
  // } catch (err) {
  //   console.error("Error setting prompt", err);
  // }
  // };

  // fetchSnippet();
  // }, []);

  // console.log("discover", snippet, prompt);

  // if (!snippet) {
  //   return <p>No snippet ID provided.</p>;
  // }

  // if (!snippet || !prompt) return <div>Loading...</div>;

  return <Chat mode="discovery" />;
};

export default Discover;
