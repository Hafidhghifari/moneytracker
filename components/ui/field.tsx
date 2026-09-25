import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label: string;
  help?: string;
  error?: string;
  prefix?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, help, error, prefix, id, type = "text", className = "", ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `field-${autoId}`;
  const describedBy = [
    error ? `${inputId}-error` : undefined,
    help && !error ? `${inputId}-help` : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const describedByAttr = describedBy || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div
        className={[
          "flex h-11 items-center gap-2 rounded-[10px] border bg-surface transition-colors",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          error ? "border-expense" : "border-border",
        ].join(" ")}
      >
        {prefix ? (
          <span className="pl-3.5 text-[15px] font-medium text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`h-full min-w-0 flex-1 bg-transparent px-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground ${prefix ? "pl-0" : ""} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByAttr}
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-[13px] text-expense">
          {error}
        </p>
      ) : help ? (
        <p id={`${inputId}-help`} className="text-[13px] text-muted-foreground">
          {help}
        </p>
      ) : null}
    </div>
  );
});