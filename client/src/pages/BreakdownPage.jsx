import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getBreakdown } from "../services/summaryService";
import { formatMoney, formatPaymentMethod, getTodayIsoDate } from "../utils/formatters";
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

// Dedicated semantic colors for payment methods
const PAYMENT_METHOD_COLORS = {
  creditCard: "#5c87b8", // slate steel blue
  debitCard: "#5da399", // desaturated teal
  cash: "#4c9a72", // muted forest green
  qr: "#df914c", // copper amber
};
const DEFAULT_PAYMENT_COLOR = "#b89d4f"; // ochre gold fallback

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

function CategoryChartTooltip({ active, payload }) {
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

function PaymentChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-surface border border-border rounded-sm p-2.5 shadow-sm text-xs">
      <p className="font-bold text-fg mb-1">{item.label}</p>
      <p className="num-supporting tabular-nums">{formatMoney(item.total)}</p>
      <p className="num-meta mt-0.5 tabular-nums">
        {item.share.toFixed(1)}% of spendings ({item.entries}{" "}
        {item.entries === 1 ? "entry" : "entries"})
      </p>
      {item.entries > 0 && (
        <p className="num-meta mt-1 pt-1 border-t border-border tabular-nums">
          Avg {formatMoney(item.total / item.entries)} / transaction
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
  const [activeView, setActiveView] = useState("all"); // "all" | "categories" | "payments"

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

  const categoryBreakdown = useMemo(() => {
    const categories = data?.data?.categories || [];
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

    if (categories.length > 0) {
      for (const c of categories) {
        const amount = Number(c.total ?? 0);
        const count = Number(c.count ?? 0);
        if (amount <= 0 && count <= 0) continue;
        const cat = normalizeCategory(c.spending_category);
        const bucket = ensureCategory(cat);
        bucket.total += amount;
        bucket.spendingsTotal += amount;
        bucket.entries += count;
        grandTotal += amount;
        totalOneOff += amount;
      }
    } else if (spendings.length > 0) {
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

    const categoryList = Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .map((item, idx) => ({
        ...item,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        share: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
      }));

    return {
      categories: categoryList,
      grandTotal,
      totalOneOff,
      totalRecurring,
      totalCategories: categoryList.length,
    };
  }, [data, startDate, endDate]);

  const paymentBreakdown = useMemo(() => {
    const paymentMethods = data?.data?.paymentMethods || [];
    const spendings = data?.data?.spendings || [];
    const map = new Map();

    let grandTotal = 0;
    let totalEntries = 0;

    if (paymentMethods.length > 0) {
      for (const p of paymentMethods) {
        const amount = Number(p.total ?? 0);
        const count = Number(p.count ?? 0);
        if (amount <= 0 && count <= 0) continue;
        const method = p.payment_method || "cash";
        if (!map.has(method)) {
          map.set(method, {
            method,
            label: formatPaymentMethod(method),
            total: 0,
            entries: 0,
          });
        }
        const bucket = map.get(method);
        bucket.total += amount;
        bucket.entries += count;
        grandTotal += amount;
        totalEntries += count;
      }
    } else if (spendings.length > 0) {
      for (const s of spendings) {
        const amount = Number(s.amount ?? 0);
        if (amount <= 0) continue;
        const method = s.payment_method || "cash";
        if (!map.has(method)) {
          map.set(method, {
            method,
            label: formatPaymentMethod(method),
            total: 0,
            entries: 0,
          });
        }
        const bucket = map.get(method);
        bucket.total += amount;
        bucket.entries += 1;
        grandTotal += amount;
        totalEntries += 1;
      }
    }

    const methods = Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .map((item) => ({
        ...item,
        color: PAYMENT_METHOD_COLORS[item.method] || DEFAULT_PAYMENT_COLOR,
        share: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
      }));

    return {
      methods,
      grandTotal,
      totalEntries,
      totalMethods: methods.length,
    };
  }, [data]);

  const showCategories = activeView === "all" || activeView === "categories";
  const showPayments = activeView === "all" || activeView === "payments";

  return (
    <div className="flex flex-col gap-5">
      {/* Overview & Interactive Date Range Picker Card */}
      <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3.5 border-b border-border">
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-fg">Breakdown</h1>
            <p className="num-meta mt-0.5">Outflow &amp; payment analytics</p>
          </div>

          <DateRangePicker startDate={startDate} endDate={endDate} onChange={setDateRange} />
        </div>

        {isLoading ? (
          <div className="h-20 bg-surface-alt rounded-sm animate-pulse" />
        ) : isError ? (
          <div
            role="alert"
            className="p-3.5 rounded-sm bg-error-bg border border-error text-error text-xs font-medium"
          >
            {error?.message || "Could not load breakdown data."}
          </div>
        ) : (
          <>
            {/* Hero Total Outflow + Supporting Split */}
            <div className="flex flex-col gap-1">
              <p className="num-meta">Total outflow</p>
              <h2 className="num-hero tabular-nums">{formatMoney(categoryBreakdown.grandTotal)}</h2>
              <p className="num-supporting tabular-nums mt-0.5">
                {formatMoney(categoryBreakdown.totalOneOff)} spendings ·{" "}
                {formatMoney(categoryBreakdown.totalRecurring)} subscriptions
              </p>
            </div>

            {/* View Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border">
              {[
                { id: "all", label: "All breakdowns" },
                { id: "categories", label: "Categories" },
                { id: "payments", label: "Payment methods" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-xs border transition-colors cursor-pointer truncate text-center ${
                    activeView === tab.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface-alt text-fg-secondary hover:text-fg hover:border-fg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Category Breakdown Section */}
      {!isLoading && !isError && showCategories && (
        <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col gap-4">
          <div className="border-b border-border pb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-fg truncate">
                Category breakdown
              </h2>
              <p className="num-meta mt-0.5">Spendings &amp; subscriptions</p>
            </div>
            {categoryBreakdown.categories.length > 0 && (
              <span className="num-meta tabular-nums shrink-0">
                {categoryBreakdown.totalCategories}{" "}
                {categoryBreakdown.totalCategories === 1 ? "category" : "categories"}
              </span>
            )}
          </div>

          {categoryBreakdown.categories.length === 0 ? (
            <div className="py-8 text-center border-t border-border flex flex-col gap-1">
              <p className="text-sm font-medium text-fg">
                No spendings or subscriptions in this date range
              </p>
              <p className="num-meta">Tap the date range button above to pick another period.</p>
            </div>
          ) : (
            <>
              {/* Category Donut Chart */}
              <div className="w-full h-60 pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.categories}
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
                      {categoryBreakdown.categories.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CategoryChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Compact Category Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2.5 border-t border-border">
                {categoryBreakdown.categories.map((item) => (
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

              {/* Ranked Category List */}
              <div className="pt-3 border-t border-border flex flex-col gap-2.5">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-fg-muted">
                  Category details
                </h3>
                <ul className="divide-y divide-border">
                  {categoryBreakdown.categories.map((item) => (
                    <li
                      key={item.category}
                      className="py-3 first:pt-1 last:pb-0 flex flex-col gap-2"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-semibold text-fg truncate">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 shrink-0">
                          <span className="num-supporting tabular-nums">
                            {formatMoney(item.total)}
                          </span>
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
              </div>
            </>
          )}
        </section>
      )}

      {/* Payment Method Breakdown Section (Second Chart) */}
      {!isLoading && !isError && showPayments && (
        <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col gap-4">
          <div className="border-b border-border pb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-fg truncate">Payment methods</h2>
              <p className="num-meta mt-0.5">One-off spendings distribution</p>
            </div>
            {paymentBreakdown.methods.length > 0 && (
              <span className="num-meta tabular-nums shrink-0">
                {paymentBreakdown.totalEntries}{" "}
                {paymentBreakdown.totalEntries === 1 ? "transaction" : "transactions"}
              </span>
            )}
          </div>

          {paymentBreakdown.methods.length === 0 ? (
            <div className="py-8 text-center border-t border-border flex flex-col gap-1">
              <p className="text-sm font-medium text-fg">
                No spendings recorded in this date range
              </p>
              <p className="num-meta">
                Payment methods are tracked on one-off spendings. Subscriptions are automated
                recurring charges.
              </p>
            </div>
          ) : (
            <>
              {/* Payment Method Donut Chart */}
              <div className="w-full h-60 pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdown.methods}
                      dataKey="total"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={2}
                      stroke="var(--color-surface)"
                      strokeWidth={2}
                      isAnimationActive={false}
                    >
                      {paymentBreakdown.methods.map((entry) => (
                        <Cell key={entry.method} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PaymentChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Compact Payment Method Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2.5 border-t border-border">
                {paymentBreakdown.methods.map((item) => (
                  <div key={item.method} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="num-meta tabular-nums">
                      {item.label} ({item.share.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>

              {/* Ranked Payment Method List */}
              <div className="pt-3 border-t border-border flex flex-col gap-2.5">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-fg-muted">
                  Payment method details
                </h3>
                <ul className="divide-y divide-border">
                  {paymentBreakdown.methods.map((item) => (
                    <li key={item.method} className="py-3 first:pt-1 last:pb-0 flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-semibold text-fg truncate">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 shrink-0">
                          <span className="num-supporting tabular-nums">
                            {formatMoney(item.total)}
                          </span>
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
                        {item.entries} {item.entries === 1 ? "transaction" : "transactions"} · Avg{" "}
                        {formatMoney(item.total / item.entries)} / transaction
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
