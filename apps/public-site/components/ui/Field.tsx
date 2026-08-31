import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

function fieldClasses(invalid: boolean, withIcon: boolean): string {
  const base =
    "peer w-full rounded-md border bg-white px-3 pt-6 pb-2 text-sm text-slate-800 shadow-sm transition-colors placeholder-transparent focus:outline-none focus:ring-2";
  const pad = withIcon ? "pl-10" : "pl-3";
  const state = invalid
    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
    : "border-slate-300 focus:border-brand-500 focus:ring-brand-300";
  return `${base} ${pad} ${state}`;
}

function labelClasses(withIcon: boolean): string {
  const base =
    "pointer-events-none absolute left-3 top-2 z-10 text-xs text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-600";
  return withIcon ? `${base} pl-7` : base;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: IconName;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, icon, error, id, className, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          className={`${fieldClasses(!!error, !!icon)} ${className ?? ""}`}
          {...rest}
        />
        <label htmlFor={inputId} className={labelClasses(!!icon)}>
          {label}
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  icon?: IconName;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, icon, error, id, className, rows = 5, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name;
  return (
    <div>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-3 text-slate-400">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
        <textarea
          id={fieldId}
          ref={ref}
          rows={rows}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          className={`${fieldClasses(!!error, !!icon)} ${className ?? ""}`}
          {...rest}
        />
        <label htmlFor={fieldId} className={labelClasses(!!icon)}>
          {label}
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});
