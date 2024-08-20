import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import { VoiceChat } from "@/components/VoiceChat";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mic, MessageSquare } from "lucide-react";

import { getAllSnippets, getSnippetById } from "@/db";
import Loader from "@/components/Loader";
import StatusBadge from "@/components/StatusBadge";

const Practice = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snippets, setSnippets] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [chatType, setChatType] = useState(null);

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const data = await getAllSnippets();
        setSnippets(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchSnippets();
  }, []);

  const handleSnippetChange = async (value) => {
    setSelectedSnippet(await getSnippetById(value));
    setChatType(null); // Reset chat type when a new snippet is selected
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2">Practice</h1>
        <p className="text-lg text-gray-600">
          Internalize God's wisdom through voice or text interaction.
        </p>
      </header>

      <div className="space-y-6">
        <Select onValueChange={handleSnippetChange}>
          <SelectTrigger className="w-full">
            {selectedSnippet ? (
              <div className="flex w-full justify-between items-center">
                <span>{selectedSnippet.reference}</span>
                <StatusBadge status={selectedSnippet.status} />
              </div>
            ) : (
              <SelectValue placeholder="Select a snippet for practice" />
            )}
          </SelectTrigger>
          <SelectContent className="w-full">
            {snippets.map((snippet) => (
              <SelectItem
                key={snippet.id}
                value={snippet.id.toString()}
                className="w-full"
              >
                <div className="flex w-full justify-between items-center">
                  <span>{snippet.reference}</span>
                  {/* <StatusBadge status={snippet.status} /> */}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex justify-center space-x-4">
          <Link to={`voice/${selectedSnippet?.id}`}>
            <Button disabled={!selectedSnippet} className="flex items-center">
              <Mic className="mr-2 h-4 w-4" />
              Voice
            </Button>
          </Link>
          <Link to={`text/${selectedSnippet?.id}`}>
            <Button disabled={!selectedSnippet} className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Text
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Practice;
