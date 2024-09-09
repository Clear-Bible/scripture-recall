import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MemoryVerseDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  newSnippet,
  editingIndex,
  handleInputChange,
  handleStatusChange,
  handleAddOrUpdateSnippet,
}) => {
  return (
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
  );
};

export default MemoryVerseDialog;
