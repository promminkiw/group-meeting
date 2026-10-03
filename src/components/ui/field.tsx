import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type BaseFieldProps = {
  label: string;
  name: string;
  helper?: string;
  error?: string;
  required?: boolean;
};

const CONTROL_CLASSES =
  "w-full rounded-control border border-line-strong bg-surface px-3 text-base text-ink transition-colors placeholder:text-ink-subtle hover:border-ink-subtle focus-visible:border-primary-600 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary-600/30 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle disabled:hover:border-line-strong md:text-sm motion-reduce:transition-none";

const INVALID_CLASSES =
  "border-danger-solid hover:border-danger-solid focus-visible:border-danger-solid";

function useFieldIds(
  idProp: string | undefined,
  helper: string | undefined,
  error: string | undefined,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const messageId = `${id}-message`;
  const describedBy = error || helper ? messageId : undefined;
  return { id, messageId, describedBy };
}

function FieldLabel({ id, label, required }: { id: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
      {label}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  );
}

function FieldMessage({
  messageId,
  helper,
  error,
}: {
  messageId: string;
  helper?: string;
  error?: string;
}) {
  if (error) {
    return (
      <p id={messageId} className="mt-1.5 flex gap-1.5 text-xs leading-[1.6] text-overdue-fg">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </p>
    );
  }
  if (helper) {
    return (
      <p id={messageId} className="mt-1.5 text-xs leading-[1.6] text-ink-muted">
        {helper}
      </p>
    );
  }
  return null;
}

type InputProps = BaseFieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof BaseFieldProps>;

export function Input({
  label,
  helper,
  error,
  required,
  id: idProp,
  className,
  ...rest
}: InputProps) {
  const { id, messageId, describedBy } = useFieldIds(idProp, helper, error);
  return (
    <div>
      <FieldLabel id={id} label={label} required={required} />
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(CONTROL_CLASSES, "h-11 md:h-10", error && INVALID_CLASSES, className)}
        {...rest}
      />
      <FieldMessage messageId={messageId} helper={helper} error={error} />
    </div>
  );
}

type TextareaProps = BaseFieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof BaseFieldProps>;

export function Textarea({
  label,
  helper,
  error,
  required,
  id: idProp,
  className,
  ...rest
}: TextareaProps) {
  const { id, messageId, describedBy } = useFieldIds(idProp, helper, error);
  return (
    <div>
      <FieldLabel id={id} label={label} required={required} />
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          CONTROL_CLASSES,
          "min-h-24 py-2 leading-[1.65]",
          error && INVALID_CLASSES,
          className,
        )}
        {...rest}
      />
      <FieldMessage messageId={messageId} helper={helper} error={error} />
    </div>
  );
}

type SelectProps = BaseFieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, keyof BaseFieldProps> & { children: ReactNode };

export function Select({
  label,
  helper,
  error,
  required,
  id: idProp,
  className,
  children,
  ...rest
}: SelectProps) {
  const { id, messageId, describedBy } = useFieldIds(idProp, helper, error);
  return (
    <div>
      <FieldLabel id={id} label={label} required={required} />
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            CONTROL_CLASSES,
            "h-11 appearance-none pr-9 md:h-10",
            error && INVALID_CLASSES,
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden="true"
        />
      </div>
      <FieldMessage messageId={messageId} helper={helper} error={error} />
    </div>
  );
}

type CheckboxProps = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof BaseFieldProps | "type">;

export function Checkbox({
  label,
  helper,
  error,
  required,
  id: idProp,
  className,
  ...rest
}: CheckboxProps) {
  const { id, messageId, describedBy } = useFieldIds(idProp, helper, error);
  return (
    <div>
      <label
        htmlFor={id}
        className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-ink"
      >
        <input
          id={id}
          type="checkbox"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("mt-0.5 size-5 shrink-0 rounded accent-primary-600", className)}
          {...rest}
        />
        <span>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      </label>
      <FieldMessage messageId={messageId} helper={helper} error={error} />
    </div>
  );
}
