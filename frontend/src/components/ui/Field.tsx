import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react"
import { cn } from "../../lib/utils"

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2 text-right">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-sm font-semibold text-rose-600">{error}</span> : null}
    </label>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-full border border-black/10 bg-white/90 px-4 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 hover:border-black/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-100",
      className,
    )}
    {...props}
  />
))

Input.displayName = "Input"

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-3xl border border-black/10 bg-white/90 px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 hover:border-black/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-100",
        className,
      )}
      {...props}
    />
  ),
)

Textarea.displayName = "Textarea"

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-12 w-full rounded-full border border-black/10 bg-white/90 px-4 text-sm text-ink shadow-sm outline-none transition hover:border-black/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)

Select.displayName = "Select"

