import React, { useState, useEffect, useCallback } from "react";
import {
  PlusCircle,
  Trash2,
  Edit2,
  Book,
  Eye,
  EyeOff,
  MessagesSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  getAllSnippets,
  saveSnippet,
  deleteSnippet,
  updateSnippet,
} from "@/db/snippets";
import Loader from "@/components/Loader";
import StatusBadge from "@/components/StatusBadge";
import MemoryVerseDialog from "@/components/memory/MemoryVerseDialog";
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import {  
  CardFooter,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const ScriptureSnippetManager = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snippets, setSnippets] = useState([]);
  const [newSnippet, setNewSnippet] = useState({
    id: "",
    reference: "",
    body: "",
    status: "1",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAllPassages, setShowAllPassages] = useState(false);
  const [visiblePassages, setVisiblePassages] = useState({});

  const fetchSnippets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllSnippets();
      setSnippets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const addSnippet = async () => {
    if (newSnippet.reference && newSnippet.body && newSnippet.status) {
      try {
        await saveSnippet(newSnippet);
        await fetchSnippets();
        setNewSnippet({ reference: "", body: "", status: "1" });
        setIsDialogOpen(false);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const removeSnippet = async (id) => {
    try {
      await deleteSnippet(id);
      await fetchSnippets();
    } catch (err) {
      setError(err.message);
    }
  };

  const editSnippet = (snippet) => {
    setEditingIndex(snippet.id);
    setNewSnippet(snippet);
    setIsDialogOpen(true);
  };

  const changeSnippet = async () => {
    try {
      await updateSnippet(newSnippet);
      await fetchSnippets();
      setEditingIndex(null);
      setNewSnippet({ reference: "", body: "", status: "1" });
      setIsDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    setNewSnippet({ ...newSnippet, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value) => {
    setNewSnippet({ ...newSnippet, status: value });
  };

  const handleAddOrUpdateSnippet = async () => {
    if (editingIndex !== null) {
      await changeSnippet();
    } else {
      await addSnippet();
    }
  };

  const togglePassageVisibility = (snippetId) => {
    setVisiblePassages((prev) => ({
      ...prev,
      [snippetId]: !prev[snippetId],
    }));
  };

  const toggleAllPassages = () => {
    setShowAllPassages((prev) => !prev);
    if (!showAllPassages) {
      const allVisible = snippets.reduce((acc, snippet) => {
        acc[snippet.id] = true;
        return acc;
      }, {});
      setVisiblePassages(allVisible);
    } else {
      setVisiblePassages({});
    }
  };

  const EmptyState = () => (
    <div className="text-center py-10">
      <Book className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No snippets</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by adding a new scripture snippet.
      </p>
      <div className="mt-6">
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Snippet
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return <Loader />;
  }

  const chartData = [
    { status: "Know it!", 
      passages: snippets.filter((snippet) => snippet.status == "3").length, 
      fill: "var(--color-green)" },

    { status: "Kinda know it", 
      passages: snippets.filter((snippet) => snippet.status == "2").length, 
      fill: "var(--color-yellow"}, 

    { status: "Don't Know it",
      passages: snippets.filter((snippet) => snippet.status == "1").length, 
      fill: "var(--color-red)" },
  ]
  
  const chartConfig = {
    passages: {
      label: "Passages",
    },
    green: {
      label: "Passages you know well",
      color: "rgb(34, 197, 94)",
    },
    yellow: {
      label: "Passages you kind of know",
      color: "rgb(234, 179, 8)",
    },
    red: {
      label: "Passages you don't know yet",
      color: "rgb(239, 68, 68)",
    }
  }

  const totalPassages = snippets.length;

  return (
    <div className="w-full px-4 mt-6">
      <div className="flex w-full justify-center">
        <MessagesSquare
          strokeWidth={2}
          stroke={"currentColor"}
          className="mr-2 items-center"
        />
        <div className="font-bold text-xl">ScriptureRecall</div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {snippets.length === 0 ? (
        <EmptyState />
      ) : (
        <>
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="passages"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalPassages.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Passages
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
          

          <div className="space-y-4 mb-20">
            {snippets.map((snippet) => (
              <Card key={snippet.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <div className="flex justify-between mb-2">
                      <div>{snippet.reference}</div>
                      <div>
                        {snippet && (
                          <StatusBadge
                            snippet={snippet}
                            onStatusChange={fetchSnippets}
                          />
                        )}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end items-center"></div>
                  {(showAllPassages || visiblePassages[snippet.id]) && (
                    <pre className="whitespace-pre-wrap break-words font-sans text-sm mb-2">
                      {snippet.body}
                    </pre>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => togglePassageVisibility(snippet.id)}
                    >
                      {showAllPassages || visiblePassages[snippet.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => editSnippet(snippet)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeSnippet(snippet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <MemoryVerseDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        newSnippet={newSnippet}
        editingIndex={editingIndex}
        handleInputChange={handleInputChange}
        handleStatusChange={handleStatusChange}
        handleAddOrUpdateSnippet={handleAddOrUpdateSnippet}
      />

      <Button
        className="fixed bottom-0 mb-20 md:mb-4 right-4 rounded-full w-16 h-16 shadow-lg"
        onClick={() => {
          setEditingIndex(null);
          setNewSnippet({ reference: "", body: "", status: "1" });
          setIsDialogOpen(true);
        }}
      >
        <PlusCircle className="h-6 w-6" />
      </Button>

      <style jsx>{`
        @supports (-webkit-touch-callout: none) {
          .fixed.bottom-0 {
            bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
};

export default ScriptureSnippetManager;
