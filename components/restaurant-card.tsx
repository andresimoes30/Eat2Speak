import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Restaurant {
  id: number
  name: string
  image: string
  cuisine: string
  price: string
  rating: number
  location: string
  languages: string[]
}

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} fill className="object-cover" />
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="text-sm font-medium">{restaurant.rating}</span>
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{restaurant.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm">{restaurant.cuisine}</span>
          <span className="text-sm font-medium">{restaurant.price}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {restaurant.languages.map((language) => (
            <Badge key={language} variant="outline" className="bg-wine-50 text-wine-700 border-wine-200">
              {language}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm">
          Ver detalhes
        </Button>
        <Button size="sm" className="bg-wine-600 hover:bg-wine-700">
          Reservar
        </Button>
      </CardFooter>
    </Card>
  )
}
