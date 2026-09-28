import { useEffect, useMemo, useRef, useState } from "react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const QUICK_RANGES = [
  { id: "this_month", label: "This month", months: 0 },
  { id: "1m", label: "Last month", months: 1 },
  { id: "3m", label: "Last 3 months", months: 3 },
  { id: "5m", label: "Last 5 months", months: 5 },
  { id: "6m", label: "Last 6 months", months: 6 },
  { id: "12m", label: "Last 12 months", months: 12 },
];

function toIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIso(str) {
  if (!str) return new Date();
  const m = String(str)
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return new Date();
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function DateRangePicker({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState("start"); // "start" | "end"
  const containerRef = useRef(null);

  const parsedStart = useMemo(() => parseIso(startDate), [startDate]);
  const parsedEnd = useMemo(() => parseIso(endDate), [endDate]);

  const [viewYear, setViewYear] = useState(() => parsedStart.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parsedStart.getMonth());

  // Close popover on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  const readableRange = useMemo(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${fmt.format(parsedStart)} – ${fmt.format(parsedEnd)}`;
  }, [parsedStart, parsedEnd]);

  const monthTitle = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(d);
  }, [viewYear, viewMonth]);

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    // Convert Sunday=0..Saturday=6 to Monday=0..Sunday=6
    const startWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateObj = new Date(viewYear, viewMonth, day);
      cells.push({
        day,
        iso: toIso(dateObj),
      });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (iso) => {
    if (activeField === "start") {
      if (iso > endDate) {
        onChange({ startDate: iso, endDate: iso });
      } else {
        onChange({ startDate: iso, endDate });
      }
      setActiveField("end");
    } else {
      if (iso < startDate) {
        onChange({ startDate: iso, endDate: startDate });
      } else {
        onChange({ startDate, endDate: iso });
      }
      setOpen(false);
    }
  };

  const handleQuickPreset = (preset) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start;
    if (preset.months === 0) {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - preset.months, now.getDate());
    }
    const nextStart = toIso(start);
    const nextEnd = toIso(end);
    setViewYear(start.getFullYear());
    setViewMonth(start.getMonth());
    onChange({ startDate: nextStart, endDate: nextEnd });
    setOpen(false);
  };

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (!open) {
            const target = activeField === "start" ? parsedStart : parsedEnd;
            setViewYear(target.getFullYear());
            setViewMonth(target.getMonth());
          }
          setOpen((prev) => !prev);
        }}
        className="h-9 w-full sm:w-auto px-3 inline-flex items-center justify-between sm:justify-start gap-2 rounded-sm border border-border bg-surface-alt text-xs font-medium text-fg hover:border-primary transition-colors cursor-pointer tabular-nums"
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          <svg
            className="h-3.5 w-3.5 text-fg-secondary shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="17" rx="1" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="square" />
          </svg>
          <span className="truncate">{readableRange}</span>
        </span>
        <svg
          className={`h-3.5 w-3.5 text-fg-muted shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="square" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date range"
          className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-1.5 z-50 sm:w-80 rounded-md border border-border bg-surface p-3.5 shadow-lg flex flex-col gap-3"
        >
          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-1.5 pb-2.5 border-b border-border">
            {QUICK_RANGES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleQuickPreset(preset)}
                className="px-2 py-1.5 text-[11px] font-medium rounded-xs border border-border bg-surface-alt text-fg-secondary hover:text-fg hover:border-primary transition-colors cursor-pointer truncate"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Active Endpoint Selector Tabs (From vs To) */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveField("start");
                setViewYear(parsedStart.getFullYear());
                setViewMonth(parsedStart.getMonth());
              }}
              className={`p-2 rounded-xs border text-left transition-colors cursor-pointer ${
                activeField === "start"
                  ? "border-primary bg-surface-alt"
                  : "border-border bg-surface"
              }`}
            >
              <span className="block text-[10px] text-fg-muted">From</span>
              <span className="block text-xs font-semibold text-fg tabular-nums mt-0.5">
                {startDate}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveField("end");
                setViewYear(parsedEnd.getFullYear());
                setViewMonth(parsedEnd.getMonth());
              }}
              className={`p-2 rounded-xs border text-left transition-colors cursor-pointer ${
                activeField === "end" ? "border-primary bg-surface-alt" : "border-border bg-surface"
              }`}
            >
              <span className="block text-[10px] text-fg-muted">To</span>
              <span className="block text-xs font-semibold text-fg tabular-nums mt-0.5">
                {endDate}
              </span>
            </button>
          </div>

          {/* Calendar Month Navigation */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="h-7 w-7 inline-flex items-center justify-center rounded-xs border border-border bg-surface-alt text-fg hover:border-primary cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" strokeLinecap="square" />
              </svg>
            </button>
            <span className="text-xs font-bold text-fg">{monthTitle}</span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="h-7 w-7 inline-flex items-center justify-center rounded-xs border border-border bg-surface-alt text-fg hover:border-primary cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" strokeLinecap="square" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className="text-center text-[10px] font-medium text-fg-muted py-0.5"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} className="h-7" />;
                }
                const isStart = cell.iso === startDate;
                const isEnd = cell.iso === endDate;
                const isInRange = cell.iso > startDate && cell.iso < endDate;

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => handleSelectDay(cell.iso)}
                    className={`h-7 text-xs tabular-nums rounded-xs transition-colors cursor-pointer flex items-center justify-center ${
                      isStart || isEnd
                        ? "bg-primary text-primary-fg font-bold"
                        : isInRange
                          ? "bg-surface-alt text-fg font-medium"
                          : "text-fg-secondary hover:bg-surface-alt hover:text-fg"
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
