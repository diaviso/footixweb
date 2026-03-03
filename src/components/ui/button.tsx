import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E74C5E]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#C41E3A] dark:bg-[#E74C5E] text-white dark:text-white shadow-lg shadow-[#C41E3A]/20 dark:shadow-[#E74C5E]/20 hover:bg-[#9B1B30] dark:hover:bg-[#D43B4F] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700 hover:shadow-xl hover:scale-[1.02]",
        outline:
          "border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-transparent hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E] hover:border-[#C41E3A] dark:hover:border-[#E74C5E] text-[#0A1628] dark:text-[#E2E8F5]",
        secondary:
          "bg-[#FEF2F2] dark:bg-[#111B2E] text-[#C41E3A] dark:text-[#E74C5E] hover:bg-[#DCE6F0] dark:hover:bg-[#1B2B40]",
        ghost:
          "hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E] text-[#0A1628] dark:text-[#E2E8F5]",
        link:
          "text-[#C41E3A] dark:text-[#E74C5E] underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-[#9B1B30] to-[#C41E3A] dark:from-[#D43B4F] dark:to-[#E74C5E] text-white dark:text-white shadow-lg shadow-[#C41E3A]/20 hover:shadow-xl hover:shadow-[#C41E3A]/30 hover:scale-[1.02] active:scale-[0.98]",
        gold:
          "bg-[#D4AF37] hover:bg-[#B8960F] text-white shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        glass:
          "glass hover:bg-white/90 dark:hover:bg-[#0D1525]/90",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
