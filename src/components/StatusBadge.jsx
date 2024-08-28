import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateSnippet } from "@/db/snippets";

const statusOptions = [
  { value: 1, label: "Don't know it yet", color: "bg-red-500" },
  { value: 2, label: "Kind of know it", color: "bg-yellow-500" },
  { value: 3, label: "Know it!", color: "bg-green-500" },
];

function StatusBadge({ snippet }) {
  const [status, setStatus] = useState(snippet.status || 1);
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatus = statusOptions.find(
    (option) => option.value === Number(status),
  );

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      const updatedSnippet = { ...snippet, status: newStatus };
      await updateSnippet(updatedSnippet);
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to update snippet status:", error);
      // Optionally, you could add error handling UI here
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`${currentStatus.color} w-4 h-4 rounded-full p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 ${
            isUpdating ? "opacity-50" : ""
          }`}
          onClick={() => setOpen(true)}
          aria-label={`Current status: ${currentStatus.label}`}
          disabled={isUpdating}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => handleStatusChange(option.value)}
            disabled={isUpdating}
          >
            <span
              className={`${option.color} inline-block w-2 h-2 rounded-full mr-2`}
            />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default StatusBadge;
