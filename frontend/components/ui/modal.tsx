"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type ModalSize = "sm" | "md" | "lg"

const modalContentVariants = cva("", {
  variants: {
    size: {
      sm: "sm:max-w-sm",
      md: "sm:max-w-lg",
      lg: "sm:max-w-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

interface ModalContextValue {
  size: ModalSize
  onClose?: () => void
}

const ModalContext = React.createContext<ModalContextValue | null>(null)

function useModalContext() {
  return React.useContext(ModalContext)
}

export interface ModalProps extends React.ComponentProps<typeof Dialog> {
  size?: ModalSize
  onClose?: () => void
}

export function Modal({
  size = "md",
  onClose,
  onOpenChange,
  children,
  ...props
}: ModalProps) {
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      onOpenChange?.(open)
      if (!open) {
        onClose?.()
      }
    },
    [onOpenChange, onClose]
  )

  return (
    <ModalContext.Provider value={{ size, onClose }}>
      <Dialog {...props} onOpenChange={handleOpenChange}>
        {children}
      </Dialog>
    </ModalContext.Provider>
  )
}

export const ModalTrigger = DialogTrigger
export const ModalClose = DialogClose
export const ModalPortal = DialogPortal
export const ModalOverlay = DialogOverlay

export interface ModalContentProps
  extends React.ComponentProps<typeof DialogContent> {
  size?: ModalSize
}

export function ModalContent({
  size,
  className,
  ...props
}: ModalContentProps) {
  const context = useModalContext()
  const resolvedSize = size ?? context?.size ?? "md"

  return (
    <DialogContent
      {...props}
      className={cn(modalContentVariants({ size: resolvedSize }), className)}
    />
  )
}

export const ModalHeader = DialogHeader
export const ModalFooter = DialogFooter
export const ModalTitle = DialogTitle
export const ModalDescription = DialogDescription
