"use client"

import React, { createContext, useContext, useState } from "react"

// Types for toast messages
export type ToastProps = {
  id?: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
}

// Context to manage toasts globally
type ToastContextType = {
  toasts: ToastProps[]
  toast: (props: ToastProps) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Provider component to wrap app with
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    const id = props.id || Math.random().toString(36).substring(2, 9)
    const newToast = { ...props, id }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto dismiss after duration
    if (props.duration !== 0) {
      setTimeout(() => {
        dismiss(id)
      }, props.duration || 5000)
    }
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      
      {/* Toast container - can be styled as needed */}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 p-6 space-y-4 z-50">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-md shadow-md ${
                t.variant === "destructive" 
                  ? "bg-red-100 border border-red-200 text-red-800" 
                  : t.variant === "success" 
                  ? "bg-green-100 border border-green-200 text-green-800"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{t.title}</h3>
                <button 
                  onClick={() => dismiss(t.id!)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              {t.description && <p className="text-sm mt-1">{t.description}</p>}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

// Hook to use toast functionality
export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return context
}