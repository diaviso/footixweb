import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#07090F] px-4 py-2 text-sm text-[#0A1628] dark:text-[#EFF3F7] ring-offset-background transition-all duration-300",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#0A1628] dark:file:text-[#EFF3F7]",
          "placeholder:text-[#5E7A9A] dark:placeholder:text-[#5E7A9A]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/20 dark:focus-visible:ring-[#C41E3A]/20 focus-visible:ring-offset-2 focus-visible:border-[#C41E3A] dark:focus-visible:border-[#C41E3A]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-[#C41E3A]/50 dark:hover:border-[#C41E3A]/50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
