import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isWithinInterval,
  startOfDay,
  subDays,
  isBefore,
  isAfter
} from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DatePickerProps {
  mode?: 'single' | 'range';
  value?: Date | DateRange;
  onChange?: (val: Date | DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  mode = 'single',
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  
  // Track the month currently being viewed in the calendar
  const initialMonth = mode === 'single' 
    ? (value as Date || new Date())
    : ((value as DateRange)?.from || new Date());
  
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(initialMonth));
  
  // Local state for range picking (to highlight while dragging/picking second date)
  const [rangeSelection, setRangeSelection] = useState<DateRange | undefined>(mode === 'range' ? value as DateRange : undefined);

  // Sync internal range with prop
  React.useEffect(() => {
    if (mode === 'range' && !open) {
      setRangeSelection(value as DateRange);
    }
  }, [value, mode, open]);

  const handleDayClick = (day: Date) => {
    if (mode === 'single') {
      onChange?.(day);
      setOpen(false);
    } else {
      if (!rangeSelection?.from || (rangeSelection.from && rangeSelection.to)) {
        // Start new range
        setRangeSelection({ from: day, to: undefined });
      } else {
        // Complete range
        if (isBefore(day, rangeSelection.from)) {
          const newRange = { from: day, to: rangeSelection.from };
          setRangeSelection(newRange);
          onChange?.(newRange);
          setOpen(false);
        } else {
          const newRange = { from: rangeSelection.from, to: day };
          setRangeSelection(newRange);
          onChange?.(newRange);
          setOpen(false);
        }
      }
    }
  };

  const setPreset = (from: Date, to: Date) => {
    const range = { from, to };
    setRangeSelection(range);
    onChange?.(range);
    setCurrentMonth(startOfMonth(from));
    setOpen(false);
  };

  const presets = [
    { label: 'Today', onClick: () => { const d = startOfDay(new Date()); setPreset(d, d); } },
    { label: 'Yesterday', onClick: () => { const d = subDays(startOfDay(new Date()), 1); setPreset(d, d); } },
    { label: 'Last 7 Days', onClick: () => { const today = startOfDay(new Date()); setPreset(subDays(today, 6), today); } },
    { label: 'Last 30 Days', onClick: () => { const today = startOfDay(new Date()); setPreset(subDays(today, 29), today); } },
    { label: 'Last Month', onClick: () => { 
      const today = startOfDay(new Date());
      const lastMonthStart = startOfMonth(subMonths(today, 1));
      const lastMonthEnd = endOfMonth(lastMonthStart);
      setPreset(lastMonthStart, lastMonthEnd); 
    } },
  ];

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const isSelected = (day: Date) => {
      if (mode === 'single') {
        return value && isSameDay(day, value as Date);
      }
      return false;
    };

    const isRangeSelected = (day: Date) => {
      if (mode === 'range' && rangeSelection) {
        const { from, to } = rangeSelection;
        if (from && isSameDay(day, from)) return true;
        if (to && isSameDay(day, to)) return true;
      }
      return false;
    };

    const isRangeBetween = (day: Date) => {
      if (mode === 'range' && rangeSelection?.from && rangeSelection?.to) {
        return isWithinInterval(day, { start: rangeSelection.from, end: rangeSelection.to }) && !isSameDay(day, rangeSelection.from) && !isSameDay(day, rangeSelection.to);
      }
      return false;
    };

    return (
      <div className="flex flex-col w-64 p-3 bg-white">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-surface-muted rounded-full text-text-secondary transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="font-semibold text-sm text-text-primary">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-surface-muted rounded-full text-text-secondary transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-text-secondary mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {days.map((day, i) => {
            const sameMonth = isSameMonth(day, currentMonth);
            const selected = mode === 'single' ? isSelected(day) : isRangeSelected(day);
            const inRange = isRangeBetween(day);
            const isRangeStart = mode === 'range' && rangeSelection?.from && isSameDay(day, rangeSelection.from);
            const isRangeEnd = mode === 'range' && rangeSelection?.to && isSameDay(day, rangeSelection.to);

            return (
              <div key={i} className="relative">
                {inRange && <div className="absolute inset-y-0 left-0 right-0 bg-accent-primary/10"></div>}
                {isRangeStart && rangeSelection?.to && <div className="absolute inset-y-0 right-0 left-1/2 bg-accent-primary/10"></div>}
                {isRangeEnd && rangeSelection?.from && <div className="absolute inset-y-0 left-0 right-1/2 bg-accent-primary/10"></div>}
                
                <button
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "relative w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors",
                    !sameMonth && "text-text-muted opacity-50",
                    selected && "bg-accent-primary text-white font-semibold shadow-sm hover:bg-accent-primary",
                    !selected && sameMonth && "text-text-primary hover:bg-surface-muted",
                    inRange && !selected && "text-text-primary",
                  )}
                >
                  {format(day, 'd')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getDisplayText = () => {
    if (mode === 'single') {
      return value ? format(value as Date, 'LLL dd, y') : placeholder;
    } else {
      const range = value as DateRange;
      if (range?.from) {
        if (range.to) {
          return `${format(range.from, 'LLL dd, y')} - ${format(range.to, 'LLL dd, y')}`;
        }
        return format(range.from, 'LLL dd, y');
      }
      return placeholder;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "flex w-full items-center h-11 rounded-xl border bg-white px-3 py-2 text-sm text-text-primary shadow-sm transition-all duration-200 outline-none text-left",
            "border-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:border-accent-primary",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
            className
          )}
        >
          <CalendarIcon size={16} className="text-text-secondary mr-2 shrink-0" />
          <span className="truncate flex-1">{getDisplayText()}</span>
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0 rounded-xl border border-border-subtle shadow-xl z-[100]" align="start">
        <div className="flex">
          {mode === 'range' && (
            <div className="w-40 border-r border-border-subtle p-3 flex flex-col gap-1">
              <div className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider px-2">Presets</div>
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={preset.onClick}
                  className="text-left px-3 py-2 rounded-md text-sm text-text-primary hover:bg-surface-muted transition-colors font-medium"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
          {renderCalendar()}
        </div>
      </PopoverContent>
    </Popover>
  );
}
