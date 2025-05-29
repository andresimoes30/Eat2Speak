"use client"

import { useEffect, useState } from "react"

interface Restaurant {
  id: number
  name: string
  location: string
  // Other properties...
}

interface RestaurantMapProps {
  restaurants: Restaurant[]
}

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    )
  }

  // This is a placeholder for a real map component
  // In a real application, you would use a mapping library like Google Maps, Mapbox, etc.
  return (
    <div className="relative h-[500px] bg-gray-100 rounded-lg overflow-hidden">
      <div className="absolute inset-0 p-4">
        <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Mapa com {restaurants.length} restaurantes</p>
            <p className="text-sm text-muted-foreground">
              Em uma implementação real, aqui seria exibido um mapa interativo com os restaurantes marcados.
            </p>
            <ul className="mt-4 text-left max-w-md mx-auto">
              {restaurants.map((restaurant) => (
                <li key={restaurant.id} className="mb-2 p-2 bg-white rounded shadow-sm">
                  <p className="font-medium">{restaurant.name}</p>
                  <p className="text-sm text-muted-foreground">{restaurant.location}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
