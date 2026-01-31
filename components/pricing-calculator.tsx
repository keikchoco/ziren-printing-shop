"use client"

import { useState } from "react"
import { Calculator, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const productTypes = [
  { value: "business-cards", label: "Business Cards", basePrice: 15 },
  { value: "flyers", label: "Flyers (A5)", basePrice: 8 },
  { value: "brochures", label: "Brochures", basePrice: 25 },
  { value: "posters", label: "Posters (A3)", basePrice: 20 },
  { value: "banners", label: "Banners", basePrice: 45 },
  { value: "stickers", label: "Stickers", basePrice: 10 },
]

const paperTypes = [
  { value: "standard", label: "Standard", multiplier: 1 },
  { value: "glossy", label: "Glossy", multiplier: 1.2 },
  { value: "matte", label: "Matte Premium", multiplier: 1.3 },
  { value: "textured", label: "Textured", multiplier: 1.5 },
]

export function PricingCalculator() {
  const [product, setProduct] = useState("")
  const [paper, setPaper] = useState("")
  const [quantity, setQuantity] = useState("")
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)
  const [maxEstimate, setMaxEstimate] = useState<number | null>(null)

  const calculatePrice = () => {
    const selectedProduct = productTypes.find((p) => p.value === product)
    const selectedPaper = paperTypes.find((p) => p.value === paper)
    const qty = parseInt(quantity, 10)

    if (selectedProduct && selectedPaper && qty > 0) {
      const baseTotal = selectedProduct.basePrice * selectedPaper.multiplier
      let discount = 1
      if (qty >= 500) discount = 0.7
      else if (qty >= 100) discount = 0.85

      const total = baseTotal * qty * discount
      setEstimatedPrice(Math.round(total))
      setMaxEstimate(Math.round(total * 1.4))
    }
  }

  return (
    <section id="pricing" className="py-16 md:py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Get an Instant Price Estimate
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
            Use our calculator to get a quick estimate for your printing project. Contact us for
            exact pricing.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">Price Calculator</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Select your options below
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product" className="text-foreground">
                  Product Type
                </Label>
                <Select value={product} onValueChange={setProduct}>
                  <SelectTrigger id="product" className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paper" className="text-foreground">
                  Paper/Material
                </Label>
                <Select value={paper} onValueChange={setPaper}>
                  <SelectTrigger id="paper" className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {paperTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-foreground">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={1}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              onClick={calculatePrice}
              disabled={!product || !paper || !quantity}
              className="w-full"
            >
              Calculate Estimate
            </Button>

            {estimatedPrice !== null && maxEstimate !== null && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Price</p>
                    <p className="text-3xl font-bold text-primary">
                       <span className="font-light">₱</span> {estimatedPrice.toLocaleString()} - <span className="font-light">₱</span> {maxEstimate.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      This is an estimate. Final pricing may vary based on specific requirements.
                      Contact us for an accurate quote.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
