import { forwardRef } from "react";
import { NumericFormat } from "react-number-format";
import { cn } from "../../lib/utils";

const CurrencyInput = forwardRef(
  ({ value, onValueChange, placeholder = "₺0.00", className, disabled, id, ...props }, ref) => {
    const normalizedValue =
      value === undefined || value === null || value === "" || Number.isNaN(value) ? "" : value;

    return (
      <NumericFormat
        getInputRef={ref}
        id={id}
        type="text"
        inputMode="decimal"
        prefix="₺"
        thousandSeparator=","
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        value={normalizedValue}
        placeholder={placeholder}
        disabled={disabled}
        onValueChange={(values) => {
          if (onValueChange) {
            onValueChange(values.floatValue ?? "");
          }
        }}
        className={cn(
          "flex h-12 w-full rounded-md border border-border bg-surface-alt px-3.5 py-2.5 text-right font-display text-lg font-bold tabular-nums text-fg placeholder:text-fg-muted focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className,
        )}
        {...props}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
