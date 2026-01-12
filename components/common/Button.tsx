import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

const buttonVariants = cva(
  'font-head transition-all rounded outline-hidden cursor-pointer duration-200 font-medium flex items-center justify-center text-center gap-2 uppercase',
  {
    variants: {
      variant: {
        default:
          'shadow-md hover:shadow active:shadow-none bg-primary text-primary-foreground border-2 border-border transition hover:translate-y-1 active:translate-y-2 active:translate-x-1 hover:bg-primary-hover',
        secondary:
          'shadow-md hover:shadow active:shadow-none bg-secondary shadow-primary text-secondary-foreground border-2 border-border transition hover:translate-y-1 active:translate-y-2 active:translate-x-1 hover:bg-secondary-hover',
        outline:
          'shadow-md hover:shadow active:shadow-none bg-transparent border-2 border-border transition hover:translate-y-1 active:translate-y-2 active:translate-x-1',
        link: 'bg-transparent hover:underline',
        ghost: 'bg-transparent hover:bg-accent',
      },
      size: {
        sm: 'px-3 py-1 text-[10px] shadow hover:shadow-none',
        md: 'px-4 py-1.5 text-xs',
        lg: 'px-6 py-2 text-sm',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
        disabled={isLoading || props.disabled}
      >
        {isLoading && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'
