import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getBreakdown } from "../services/summaryService";
import { formatMoney, getTodayIsoDate } from "../utils/formatters";
import { DateRangePicker } from "../components/ui/date-range-picker";

// Solid, flat industrial-warm categorical palette (no gradients)
const CATEGORY_COLORS = [
  "#df914c", // copper amber (primary)
  "#4c9a72", // muted forest green
  "#5c87b8", // slate steel blue
  "#d47459", // terracotta rust
  "#b89d4f", // ochre gold
  "#8b6fb0", // muted plum
  "#5da399", // desaturated teal
  "#c46d85", // dusty rose
  "#7d8a96", // cool iron grey
];

function getDefaultStartDateIso() {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const year = oneMonthAgo.getFullYear();
  const month = String(oneMonthAgo.getMonth() + 1).padStart(2, "0");
  const day = String(oneMonthAgo.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeCategory(raw) {
  const cleaned = String(raw || "Generic").trim();
  if (!cleaned) return "Generic";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const match = String(dateStr)
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function getSubscriptionCyclesInWindow(sub, startDateStr, endDateStr) {
  const startWindow = parseDateOnly(startDateStr);
  const endWindow = parseDateOnly(endDateStr);
  if (!startWindow || !endWindow || startWindow > endWindow) return 0;

  const today = parseDateOnly(getTodayIsoDate());
  const effectiveEnd = today && endWindow > today ? today : endWindow;

  const subStart = parseDateOnly(sub.start_date) || parseDateOnly(sub.created_at);
  if (!subStart) return 0;

  // Never bill for periods before the subscription's first billing date
  if (subStart > effectiveEnd) {
    return 0;
  }

  const cycleDays = Math.max(1, Number(sub.length) || 30);
  const dayMs = 1000 * 60 * 60 * 24;

  let billingTime = subStart.getTime();
  const windowStartTime = startWindow.getTime();
  const windowEndTime = effectiveEnd.getTime();

  // Fast-forward from subStart to the first billing date on or after windowStartTime
  if (billingTime < windowStartTime) {
    const diffDays = Math.ceil((windowStartTime - billingTime) / dayMs);
    const skippedCycles = Math.ceil(diffDays / cycleDays);
    billingTime += skippedCycles * cycleDays * dayMs;
  }

  let count = 0;
  while (billingTime <= windowEndTime) {
    count += 1;
    billingTime += cycleDays * dayMs;
  }

  return count;
}

function CustomChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-surface border border-border rounded-sm p-2.5 shadow-sm text-xs">
      <p className="font-bold text-fg mb-1">{item.category}</p>
      <p className="num-supporting tabular-nums">{formatMoney(item.total)}</p>
      <p className="num-meta mt-0.5 tabular-nums">
        {item.share.toFixed(1)}% of total ({item.entries} {item.entries === 1 ? "entry" : "entries"}
        )
      </p>
      {(item.spendingsTotal > 0 || item.subscriptionsTotal > 0) && (
        <p className="num-meta mt-1 pt-1 border-t border-border tabular-nums">
          {formatMoney(item.spendingsTotal)} one-off · {formatMoney(item.subscriptionsTotal)}{" "}
          recurring
        </p>
      )}
    </div>
  );
}

export default function BreakdownPage() {
  const [dateRange, setDateRange] = useState(() => ({
    startDate: getDefaultStartDateIso(),
    endDate: getTodayIsoDate(),
  }));

  const { startDate, endDate } = dateRange;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["breakdown", startDate, endDate],
    queryFn: () =>
      getBreakdown({
        startDate,
        endDate,
      }),
    enabled: Boolean(startDate && endDate && startDate <= endDate),
  });

  const breakdown = useMemo(() => {
    const spendings = data?.data?.spendings || [];
    const subscriptions = data?.data?.subscriptions || [];

    const map = new Map();

    const ensureCategory = (catName) => {
      if (!map.has(catName)) {
        map.set(catName, {
          category: catName,
          total: 0,
          spendingsTotal: 0,
          subscriptionsTotal: 0,
          entries: 0,
        });
      }
      return map.get(catName);
    };

    let grandTotal = 0;
    let totalOneOff = 0;
    let totalRecurring = 0;

    for (const s of spendings) {
      const amount = Number(s.amount ?? 0);
      if (amount <= 0) continue;
      const cat = normalizeCategory(s.spending_category);
      const bucket = ensureCategory(cat);
      bucket.total += amount;
      bucket.spendingsTotal += amount;
      bucket.entries += 1;
      grandTotal += amount;
      totalOneOff += amount;
    }

    for (const sub of subscriptions) {
      const unitAmount = Number(sub.amount ?? 0);
      if (unitAmount <= 0) continue;
      const cycles = getSubscriptionCyclesInWindow(sub, startDate, endDate);
      if (cycles <= 0) continue;

      const subTotal = unitAmount * cycles;
      const cat = normalizeCategory(sub.subscription_category);
      const bucket = ensureCategory(cat);
      bucket.total += subTotal;
      bucket.subscriptionsTotal += subTotal;
      bucket.entries += cycles;
      grandTotal += subTotal;
      totalRecurring += subTotal;
    }

    const categories = Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .map((item, idx) => ({
        ...item,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        share: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
      }));

    return {
      categories,
      grandTotal,
      totalOneOff,
      totalRecurring,
      totalCategories: categories.length,
    };
  }, [data, startDate, endDate]);

  return (
    <div className="flex flex-col gap-5">
      {/* Donut Chart & Interactive Date Range Picker Card */}
      <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3.5 border-b border-border">
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-fg">Category breakdown</h1>
            <p className="num-meta mt-0.5">Spendings &amp; subscriptions</p>
          </div>

          <DateRangePicker startDate={startDate} endDate={endDate} onChange={setDateRange} />
        </div>

        {isLoading ? (
          <div className="h-60 bg-surface-alt rounded-sm animate-pulse" />
        ) : isError ? (
          <div
            role="alert"
            className="p-3.5 rounded-sm bg-error-bg border border-error text-error text-xs font-medium"
          >
            {error?.message || "Could not load category breakdown."}
          </div>
        ) : (
          <>
            {/* Hero Total Outflow + Supporting Split Sentence */}
            <div className="flex flex-col gap-1">
              <p className="num-meta">Total outflow</p>
              <h2 className="num-hero tabular-nums">{formatMoney(breakdown.grandTotal)}</h2>
              <p className="num-supporting tabular-nums mt-0.5">
                {formatMoney(breakdown.totalOneOff)} spendings ·{" "}
                {formatMoney(breakdown.totalRecurring)} subscriptions
              </p>
            </div>

            {breakdown.categories.length === 0 ? (
              <div className="py-8 text-center border-t border-border flex flex-col gap-1">
                <p className="text-sm font-medium text-fg">
                  No spendings or subscriptions in this date range
                </p>
                <p className="num-meta">
                  Tap the date range button on the top right to pick another period.
                </p>
              </div>
            ) : (
              <>
                {/* Donut Chart */}
                <div className="w-full h-60 pt-2 border-t border-border">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdown.categories}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={92}
                        paddingAngle={2}
                        stroke="var(--color-surface)"
                        strokeWidth={2}
                        isAnimationActive={false}
                      >
                        {breakdown.categories.map((entry) => (
                          <Cell key={entry.category} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Compact Category Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2.5 border-t border-border">
                  {breakdown.categories.map((item) => (
                    <div key={item.category} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="num-meta tabular-nums">
                        {item.category} ({item.share.toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Ranked Category List */}
      {!isLoading && !isError && breakdown.categories.length > 0 && (
        <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col gap-3">
          <div className="border-b border-border pb-2.5">
            <h2 className="font-display text-base font-bold text-fg truncate">Category details</h2>
            <p className="num-meta mt-0.5">
              Ranked across {breakdown.totalCategories}{" "}
              {breakdown.totalCategories === 1 ? "category" : "categories"}
            </p>
          </div>

          <ul className="divide-y divide-border">
            {breakdown.categories.map((item) => (
              <li key={item.category} className="py-3 first:pt-1 last:pb-0 flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-semibold text-fg truncate">{item.category}</span>
                  </div>
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="num-supporting tabular-nums">{formatMoney(item.total)}</span>
                    <span className="num-meta tabular-nums w-12 text-right">
                      {item.share.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-surface-alt rounded-xs overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.max(item.share, 2)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                <p className="num-meta tabular-nums truncate">
                  {item.entries} {item.entries === 1 ? "entry" : "entries"} ·{" "}
                  {formatMoney(item.spendingsTotal)} spendings ·{" "}
                  {formatMoney(item.subscriptionsTotal)} subscriptions
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
