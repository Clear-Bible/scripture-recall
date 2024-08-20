import React, { useState, useMemo, useEffect } from "react";
import {
  PlusCircle,
  Trash2,
  Edit2,
  Filter,
  Book,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import { AnimatePresence, motion } from "framer-motion";

import {
  getAllSnippets,
  saveSnippet,
  getNextId,
  deleteSnippet,
  updateSnippet,
} from "@/db";
import Loader from "@/components/Loader";
import StatusBadge from "@/components/StatusBadge";

// const Memory = () => {
//   return <h1>Memory</h1>;
// };

// export default Memory;

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
  // const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAllPassages, setShowAllPassages] = useState(false);
  const [visiblePassages, setVisiblePassages] = useState({});

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

  useEffect(() => {
    fetchSnippets();
  }, []);

  const addSnippet = async () => {
    console.log("add", newSnippet);
    if (newSnippet.reference && newSnippet.body && newSnippet.status) {
      const newId = await getNextId();
      newSnippet.id = newId;
      await saveSnippet(newSnippet);
      fetchSnippets();
      setNewSnippet({ reference: "", body: "", status: "1" });
      setIsDialogOpen(false);
    }
  };

  const removeSnippet = async (id) => {
    await deleteSnippet(id);
    fetchSnippets();
  };

  const editSnippet = (snippet) => {
    setEditingIndex(snippet.id);
    setNewSnippet(snippet);
    setIsDialogOpen(true);
  };

  const changeSnippet = async () => {
    console.log("change", newSnippet);
    await updateSnippet(newSnippet);
    fetchSnippets();
    setEditingIndex(null);
    setNewSnippet({ reference: "", body: "", status: "1" });
    setIsDialogOpen(false);
  };

  const handleInputChange = (e) => {
    setNewSnippet({ ...newSnippet, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value) => {
    setNewSnippet({ ...newSnippet, status: value });
  };

  // const handleFilterChange = (value) => {
  //   setStatusFilter(value);
  // };

  const handleAddOrUpdateSnippet = () => {
    console.log("handleAddOrUpdateSnippet");
    if (editingIndex !== null) {
      console.log("change");
      changeSnippet();
    } else {
      console.log("add");
      addSnippet();
    }
  };

  // const cycleStatus = (snippetId) => {
  //   setSnippets(
  //     snippets.map((snippet) => {
  //       if (snippet.id === snippetId) {
  //         const currentIndex = statusOrder.indexOf(snippet.status);
  //         const nextIndex = (currentIndex + 1) % statusOrder.length;
  //         return { ...snippet, status: statusOrder[nextIndex] };
  //       }
  //       return snippet;
  //     }),
  //   );
  // };

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

  // const filteredSnippets = useMemo(() => {
  //   if (statusFilter === "all") {
  //     return snippets;
  //   }
  //   return snippets.filter((snippet) => snippet.status === statusFilter);
  // }, [snippets, statusFilter]);

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
    return (
      <AnimatePresence>
        <motion.div
          className={"fixed inset-0 p-4 flex items-center justify-center"}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <Loader />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="w-full">
      {/* <h1 className="text-2xl font-bold mb-4">Scripture Snippet Manager</h1> */}

      {/* <Card className="mb-4"> */}
      {/*   <CardHeader> */}
      {/*     <CardTitle className="text-lg flex items-center"> */}
      {/*       <Filter className="mr-2" /> Filter Snippets */}
      {/*     </CardTitle> */}
      {/*   </CardHeader> */}
      {/*   <CardContent> */}
      {/*     <Select value={statusFilter} onValueChange={handleFilterChange}> */}
      {/*       <SelectTrigger> */}
      {/*         <SelectValue placeholder="Filter by status" /> */}
      {/*       </SelectTrigger> */}
      {/*       <SelectContent> */}
      {/*         <SelectItem value="all">All</SelectItem> */}
      {/*         <SelectItem value="know it">Know it</SelectItem> */}
      {/*         <SelectItem value="kind of know it">Kind of know it</SelectItem> */}
      {/*         <SelectItem value="don't know it">Don't know it</SelectItem> */}
      {/*       </SelectContent> */}
      {/*     </Select> */}
      {/*   </CardContent> */}
      {/* </Card> */}

      {/* <div className="flex items-center justify-between mb-4"> */}
      {/*   <span className="text-sm font-medium">Show All Passages</span> */}
      {/*   <Switch checked={showAllPassages} onCheckedChange={toggleAllPassages} /> */}
      {/* </div> */}

      {snippets.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 mb-20">
          {snippets.map((snippet) => (
            <Card key={snippet.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  <div className="flex justify-between mb-2">
                    <div>{snippet.reference}</div>
                    <div>
                      <StatusBadge status={snippet.status} />
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
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Snippet" : "Add New Snippet"}
            </DialogTitle>
          </DialogHeader>
          <Input
            name="reference"
            placeholder="Reference"
            value={newSnippet.reference}
            onChange={handleInputChange}
            className="mb-2"
          />
          <Textarea
            name="body"
            placeholder="Scripture body"
            value={newSnippet.body}
            onChange={handleInputChange}
            className="h-[200px] mb-2"
          />
          <Select value={newSnippet.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="mb-2">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Know It!</SelectItem>
              <SelectItem value="2">Kind of know it</SelectItem>
              <SelectItem value="1">Don't know it</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddOrUpdateSnippet} className="w-full">
            {editingIndex !== null ? "Update" : "Add"} Snippet
          </Button>
        </DialogContent>
      </Dialog>

      <Button
        className="fixed bottom-20 right-4 rounded-full w-16 h-16 shadow-lg"
        onClick={() => {
          setEditingIndex(null);
          setNewSnippet({ reference: "", body: "", status: "don't know it" });
          setIsDialogOpen(true);
        }}
      >
        <PlusCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ScriptureSnippetManager;
