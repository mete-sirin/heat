export default function RowActionButtons({
  itemLabel = "item",
  onEdit,
  onDelete,
  isDeleting = false,
  isConfirming = false,
  onRequestConfirm,
  onCancelConfirm,
}) {
  if (isConfirming) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          disabled={isDeleting}
          onClick={onDelete}
          className="h-8 px-2.5 text-xs font-medium rounded-sm border border-error bg-error-bg text-error hover:bg-error hover:text-ink-black transition-colors cursor-pointer"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={onCancelConfirm}
          className="h-8 px-2.5 text-xs font-medium rounded-sm border border-border bg-surface-alt text-fg-secondary hover:text-fg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${itemLabel}`}
        title={`Edit ${itemLabel}`}
        className="h-8 w-8 inline-flex items-center justify-center rounded-sm border border-border bg-surface-alt text-fg-secondary hover:text-fg hover:border-fg-secondary transition-colors cursor-pointer"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            d="M16.862 4.487l2.651 2.651M5 19l3.75-.938L19.513 7.3a1.875 1.875 0 00-2.651-2.651L6.1 15.412 5 19z"
            strokeLinecap="square"
          />
        </svg>
      </button>
      <button
        type="button"
        disabled={isDeleting}
        onClick={onRequestConfirm || onDelete}
        aria-label={`Delete ${itemLabel}`}
        title={`Delete ${itemLabel}`}
        className="h-8 w-8 inline-flex items-center justify-center rounded-sm border border-border bg-surface-alt text-fg-secondary hover:text-error hover:border-error hover:bg-error-bg transition-colors cursor-pointer disabled:opacity-50"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M3 6h18M8 6V4h8v2M6 6v14h12V6M10 10v6M14 10v6" strokeLinecap="square" />
        </svg>
      </button>
    </div>
  );
}
