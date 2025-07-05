import { useState } from "react"

export function useToast() {
  const [toasts, setToasts] = useState<any[]>([])

  const toast = (props: any) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, ...props }
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
    
    return id
  }

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toast, dismiss, toasts }
}

export { useToast as toast }
