'use client';

import * as React from 'react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subDays, subMonths, addMonths, isSameDay, isWithinInterval, isAfter, isBefore } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '@/components/ui/button';

export interface DateRange {
  start: Date | undefined;
  end: Date | undefined;
}

export interface DateRangePickerProps {
  /** Selected date range */
  value?: DateRange;
  /** Callback when date range changes */
  onChange?: (range: DateRange | undefined) => void;
  /** Custom class name for styling */
  className?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Number of months to display (1 for mobile, 2 for desktop) */
  months?: 1 | 2;
  /** Initial month to display */
  defaultMonth?: Date;
  /** First day of the week (0 = Sunday, 1 = Monday) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Name for form integration */
  name?: string;
}

type SelectionPhase = 'start' | 'end';

interface PresetRange {
  label: string;
  getValue: () => DateRange;
}

const PRESET_RANGES: PresetRange[] = [
  {
    label: 'Today',
    getValue: () => ({
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 7 Days',
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 6)),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 30 Days',
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 29)),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: 'This Month',
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Last Quarter',
    getValue: () => {
      const currentQuarterStart = startOfQuarter(new Date());
      const lastQuarterEnd = endOfDay(subDays(currentQuarterStart, 1));
      return {
        start: startOfQuarter(lastQuarterEnd),
        end: endOfQuarter(lastQuarterEnd),
      };
    },
  },
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * DateRangePicker component for selecting a date range.
 * Features:
 * - Calendar popup with two months side-by-side on desktop, one month on mobile
 * - Click to set start date then end date
 * - Selected range highlighted in calendar
 * - Preset shortcuts: Today, Last 7 Days, Last 30 Days, This Month, Last Quarter
 * - Clear button to reset selection
 * - React Hook Form integration support
 */
export function DateRangePicker({
  value,
  onChange,
  className = '',
  placeholder = 'Select date range',
  disabled = false,
  months = 2,
  defaultMonth,
  weekStartsOn = 0,
  minDate,
  maxDate,
  name,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [displayMonth, setDisplayMonth] = React.useState(() => {
    if (value?.start) return value.start;
    if (defaultMonth) return defaultMonth;
    return new Date();
  });
  const [selectionPhase, setSelectionPhase] = React.useState<SelectionPhase>('start');
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(value);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setTempRange(value);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  // Sync temp range when value changes
  React.useEffect(() => {
    setTempRange(value);
  }, [value]);

  // Update display month when value changes
  React.useEffect(() => {
    if (value?.start) {
      setDisplayMonth(value.start);
    }
  }, [value]);

  const handleDateClick = (date: Date) => {
    if (disabled) return;

    // Check min/max date constraints
    if (minDate && isBefore(date, minDate)) return;
    if (maxDate && isAfter(date, maxDate)) return;

    if (selectionPhase === 'start') {
      setTempRange({ start: date, end: undefined });
      setSelectionPhase('end');
    } else {
      // If clicking a date before the start date, reset to start
      if (tempRange?.start && isBefore(date, tempRange.start)) {
        setTempRange({ start: date, end: undefined });
        setSelectionPhase('end');
      } else {
        const newRange = { start: tempRange?.start, end: date };
        setTempRange(newRange);
        onChange?.(newRange);
        setOpen(false);
        setSelectionPhase('start');
      }
    }
  };

  const handleClear = () => {
    setTempRange(undefined);
    onChange?.(undefined);
    setSelectionPhase('start');
    setOpen(false);
  };

  const handlePresetClick = (preset: PresetRange) => {
    const range = preset.getValue();
    setTempRange(range);
    onChange?.(range);
    setSelectionPhase('start');
    setOpen(false);
  };

  const handleCancel = () => {
    setTempRange(value);
    setSelectionPhase('start');
    setOpen(false);
  };

  const isDateSelected = (date: Date) => {
    if (!tempRange?.start) return false;
    if (!tempRange?.end) return isSameDay(date, tempRange.start);
    return isWithinInterval(date, { start: tempRange.start, end: tempRange.end }) ||
      isSameDay(date, tempRange.start) ||
      isSameDay(date, tempRange.end);
  };

  const isDateInRange = (date: Date) => {
    if (!tempRange?.start || !tempRange?.end) return false;
    return isWithinInterval(date, { start: tempRange.start, end: tempRange.end });
  };

  const isStartDate = (date: Date) => {
    return tempRange?.start && isSameDay(date, tempRange.start);
  };

  const isEndDate = (date: Date) => {
    return tempRange?.end && isSameDay(date, tempRange.end);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add null placeholders for days before the first day of the month
    const startingDay = firstDay.getDay();
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const formatDisplayValue = () => {
    if (!value?.start) return '';
    if (!value?.end) return format(value.start, 'MMM d, yyyy');
    return `${format(value.start, 'MMM d, yyyy')} - ${format(value.end, 'MMM d, yyyy')}`;
  };

  const renderCalendar = (monthOffset: number) => {
    const currentMonth = addMonths(displayMonth, monthOffset);
    const days = getDaysInMonth(currentMonth);
    const monthLabel = format(currentMonth, 'MMMM yyyy');

    return (
      <div className="flex-1 min-w-[200px]" key={monthOffset}>
        <div className="text-sm font-medium text-center mb-2">{monthLabel}</div>
        <div className="grid grid-cols-7 gap-0">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-xs text-muted-foreground text-center py-1 font-medium"
            >
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const selected = isDateSelected(day);
            const inRange = isDateInRange(day);
            const start = isStartDate(day);
            const end = isEndDate(day);
            const isDisabled = isDateDisabled(day);

            let cellClasses = 'aspect-square flex items-center justify-center text-sm cursor-pointer relative ';

            if (isDisabled) {
              cellClasses += 'text-muted-foreground/30 cursor-not-allowed ';
            } else if (start || end) {
              cellClasses += 'bg-primary text-primary-foreground font-semibold rounded-full ';
            } else if (inRange) {
              cellClasses += 'bg-accent rounded-none ';
            } else if (selected) {
              cellClasses += 'bg-primary/20 text-primary font-semibold rounded-full ';
            } else {
              cellClasses += 'hover:bg-accent rounded-full ';
            }

            // Add rounded corners for range edges
            if (start && tempRange?.end) {
              cellClasses += 'rounded-l-full ';
            }
            if (end && tempRange?.start) {
              cellClasses += 'rounded-r-full ';
            }

            // Extend range background to fill gaps
            if (inRange && !start && !end) {
              cellClasses += 'rounded-none ';
            }

            return (
              <button
                key={day.toISOString()}
                type="button"
                className={cellClasses}
                onClick={() => !isDisabled && handleDateClick(day)}
                disabled={isDisabled}
                aria-label={format(day, 'MMMM d, yyyy')}
                aria-selected={selected}
                tabIndex={isDisabled ? -1 : 0}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const monthsToShow = months;

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:bg-accent hover:text-accent-foreground'
        )}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Select date range"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className={cn(!value?.start && 'text-muted-foreground')}>
            {formatDisplayValue() || placeholder}
          </span>
        </div>
        {value?.start && (
          <button
            type="button"
            className="ml-2 rounded-full p-0.5 hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            aria-label="Clear date range"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </button>

      {/* Hidden input for form integration */}
      {name && (
        <>
          <input type="hidden" name={`${name}.start`} value={value?.start?.toISOString() || ''} />
          <input type="hidden" name={`${name}.end`} value={value?.end?.toISOString() || ''} />
        </>
      )}

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-2 min-w-[320px] rounded-md border bg-popover p-4 shadow-md animate-in fade-in zoom-in-95"
          role="dialog"
          aria-label="Date range picker"
        >
          {/* Preset Ranges */}
          <div className="flex flex-wrap gap-1 mb-4">
            {PRESET_RANGES.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <span className="text-sm font-medium">
              {format(displayMonth, 'MMMM yyyy')}
              {monthsToShow === 2 && (
                <span> - {format(addMonths(displayMonth, 1), 'MMMM yyyy')}</span>
              )}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className={cn(
            'flex gap-4',
            monthsToShow === 1 ? 'justify-center' : 'md:flex-row flex-col'
          )}>
            {renderCalendar(0)}
            {monthsToShow === 2 && renderCalendar(1)}
          </div>

          {/* Selection hint */}
          <div className="mt-3 text-xs text-muted-foreground text-center">
            {selectionPhase === 'start'
              ? 'Select start date'
              : 'Select end date'}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4 pt-3 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={!value?.start}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}