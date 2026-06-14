import { forwardRef, type ButtonHTMLAttributes } from "react"
import { Link, type LinkProps } from "react-router-dom"
import { cn } from "../../lib/utils"

const variants = {
  primary:
    "masar-gradient text-white shadow-sm shadow-primary-600/20 hover:brightness-95 hover:shadow-md hover:shadow-primary-600/25 focus:ring-primary-200",
  secondary:
    "bg-white/90 text-ink ring-1 ring-black/10 shadow-sm hover:bg-white hover:ring-black/15 focus:ring-primary-100",
  ghost: "bg-transparent text-slate-700 hover:bg-black/[0.04] hover:text-ink focus:ring-primary-100",
  danger: "bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 focus:ring-rose-200",
  success: "bg-primary-700 text-white shadow-sm shadow-primary-700/20 hover:bg-primary-600 focus:ring-primary-200",
}

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)

Button.displayName = "Button"

interface ButtonLinkProps extends LinkProps {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export function ButtonLink({ className, variant = "primary", size = "md", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus:outline-none focus:ring-4",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
