import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "../../lib/cn"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./Command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./Popover"

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex w-full h-11 items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm text-text-primary shadow-sm transition-all duration-200 outline-none",
            "border-border-subtle focus-visible:outline-none focus-visible:border-accent-primary focus-visible:ring-1 focus-visible:ring-accent-primary/30",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
            className
          )}
        >
          <span className="truncate">
            {value
              ? options.find((option) => option.value === value)?.label || placeholder
              : <span className="text-text-secondary">{placeholder}</span>}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-text-secondary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] w-auto max-w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label.toLowerCase()}
                  disabled={option.disabled}
                  onSelect={() => {
                    if (!option.disabled) {
                      onChange(option.value)
                      setOpen(false)
                    }
                  }}
                  className={cn(option.disabled && "opacity-50 cursor-not-allowed")}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100 text-accent-primary" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
