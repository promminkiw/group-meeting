"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { CONTROL_CLASSES, FieldLabel, FieldMessage, INVALID_CLASSES, useFieldIds } from "./field";

type PasswordInputProps = {
  label: string;
  name: string;
  helper?: string;
  error?: string;
  required?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "label" | "name" | "required">;

export function PasswordInput({
  label,
  helper,
  error,
  required,
  id: idProp,
  className,
  ...rest
}: PasswordInputProps) {
  const { id, messageId, describedBy } = useFieldIds(idProp, helper, error);
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <FieldLabel id={id} label={label} required={required} />
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(CONTROL_CLASSES, "h-11 pr-11 md:h-10", error && INVALID_CLASSES, className)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          aria-controls={id}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-control text-ink-subtle transition-colors hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-600 motion-reduce:transition-none"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <FieldMessage messageId={messageId} helper={helper} error={error} />
    </div>
  );
}
