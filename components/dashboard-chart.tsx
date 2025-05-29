"use client"

import { useEffect, useState } from "react"

export function DashboardChart() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    )
  }

  // This is a placeholder for a real chart component
  // In a real application, you would use a charting library like Recharts, Chart.js, etc.
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-12 gap-2 items-end">
        {Array.from({ length: 12 }).map((_, i) => {
          const height = Math.floor(Math.random() * 70) + 30
          return (
            <div key={i} className="flex flex-col items-center">
              <div className="w-full bg-wine-500 rounded-t-sm" style={{ height: `${height}%` }} />
              <span className="text-xs mt-1">{i + 1}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 text-center text-sm text-muted-foreground">Últimos 12 meses</div>
    </div>
  )
}
