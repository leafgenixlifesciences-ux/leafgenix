"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Password input with a show/hide toggle. Extracted because the sign-in,
 *  sign-up and reset-password forms all need exactly the same control. */
export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  hint,
  disabled = false,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="field pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="focus-ring absolute top-1/2 right-1.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-faint transition-colors hover:text-brand"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.8} />
          )}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
