export function formatMoney(value) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "₺0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "TRY",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatPaymentMethod(method) {
  switch (method) {
    case "creditCard":
      return "Credit card";
    case "debitCard":
      return "Debit card";
    case "qr":
      return "QR payment";
    case "cash":
    default:
      return "Cash";
  }
}

/**
 * Strips seconds precision from backend timestamps ("YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DD HH:mm").
 */
export function formatLogDate(dateStr) {
  if (!dateStr) return "";
  const trimmed = String(dateStr).trim();
  // Match YYYY-MM-DD HH:mm(:ss) and drop the seconds
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2})(?::\d{2})?)?/);
  if (match) {
    return match[2] ? `${match[1]} ${match[2]}` : match[1];
  }
  return trimmed;
}

export function formatMonthYear(dateStr) {
  if (!dateStr) return "";
  const trimmed = String(dateStr).trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})/);
  if (match) {
    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const date = new Date(year, monthIndex, 1);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(date);
    }
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(parsed);
  }
  return trimmed;
}

export function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
