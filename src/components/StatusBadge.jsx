import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusOptions = [
  { value: 1, label: "Don't know it yet", color: "bg-red-500" },
  { value: 2, label: "Kind of know it", color: "bg-yellow-500" },
  { value: 3, label: "Know it!", color: "bg-green-500" },
];

function StatusIndicator({ status = 1 }) {
  const [_status, setStatus] = useState(status);
  const [open, setOpen] = useState(false);

  const currentStatus = statusOptions.find(
    (option) => option.value === Number(_status),
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`${currentStatus.color} w-4 h-4 rounded-full p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500`}
          onClick={() => setOpen(true)}
          aria-label={`Current status: ${currentStatus.label}`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => {
              setStatus(option.value);
              setOpen(false);
            }}
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

export default StatusIndicator;
