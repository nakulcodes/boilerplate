"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  disabled,
  placeholder = "Select options...",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (searchQuery) {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchQuery, options]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal h-10 px-3"
            disabled={disabled}
          >
            <span className="text-sm">
              {value.length > 0
                ? `${value.length} option${value.length === 1 ? "" : "s"} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 shadow-lg font-dmSans"
          style={{ width: "var(--radix-popover-trigger-width)" }}
          align="start"
        >
          <div className="px-3 py-2 border-b">
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 dark:bg-background rounded-md">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-600" />
              <input
                placeholder="Search options..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer bg-gray-50 dark:bg-background hover:bg-gray-50 dark:hover:bg-gray-700",
                      value.includes(option.value) && "bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                        value.includes(option.value)
                          ? "border-gray-900 bg-gray-900 dark:border-gray-600 dark:bg-gray-600"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3 text-white",
                          value.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((optionValue) => {
            const option = options.find((o) => o.value === optionValue);
            return (
              <div
                key={optionValue}
                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1.5 text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {option?.label || optionValue}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(optionValue)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
