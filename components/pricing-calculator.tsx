"use client"

import { useEffect, useMemo, useState } from "react"
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
import { toast } from "sonner"

type ProductOption = {
  id: string
  label: string
  basePrice: number
  multiplier: number
}

type PricingRule = {
  _id: string
  productType: string
  enableProductOptions: boolean
  productOptions: ProductOption[]
  enableSize: boolean
  enableQuantity: boolean
  basePrice: number
  multiplier: number
}

export function PricingCalculator() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loadingRules, setLoadingRules] = useState(true)
  const [productRuleId, setProductRuleId] = useState("")
  const [productOptionId, setProductOptionId] = useState("")
  const [sizeValue, setSizeValue] = useState("")
  const [quantity, setQuantity] = useState("")
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)
  const [maxEstimate, setMaxEstimate] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadRules() {
      try {
        setLoadingRules(true)
        const response = await fetch("/api/getPricingRules", { method: "GET" })
        const data = await response.json()

        if (!isMounted) {
          return
        }

        if (response.ok && data.success) {
          setRules((data.data as PricingRule[]) || [])
        } else {
          toast.error(data.message || "Failed to load pricing data")
        }
      } catch (error) {
        toast.error("Failed to load pricing data")
        console.error(error)
      } finally {
        if (isMounted) {
          setLoadingRules(false)
        }
      }
    }

    loadRules()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedRule = useMemo(
    () => rules.find((item) => item._id === productRuleId) || null,
    [rules, productRuleId]
  )

  const selectedOption = useMemo(
    () => selectedRule?.productOptions?.find((item) => item.id === productOptionId) || null,
    [selectedRule, productOptionId]
  )

  const isCalculationReady = useMemo(() => {
    if (!selectedRule) {
      return false
    }

    if (selectedRule.enableProductOptions && !selectedOption) {
      return false
    }

    if (selectedRule.enableSize) {
      const sizeNum = Number(sizeValue)
      if (!Number.isFinite(sizeNum) || sizeNum <= 0) {
        return false
      }
    }

    if (selectedRule.enableQuantity) {
      const qty = Number(quantity)
      if (!Number.isFinite(qty) || qty <= 0) {
        return false
      }
    }

    return true
  }, [selectedRule, selectedOption, sizeValue, quantity])

  const calculatePrice = () => {
    if (!selectedRule) {
      return
    }

    const basePrice = selectedRule.enableProductOptions
      ? selectedOption?.basePrice || 0
      : selectedRule.basePrice

    const productMultiplier = selectedRule.enableProductOptions
      ? selectedOption?.multiplier || 1
      : selectedRule.multiplier

    const sizeFactor = selectedRule.enableSize ? Number(sizeValue) : 1
    const quantityFactor = selectedRule.enableQuantity ? Number(quantity) : 1

    if (sizeFactor <= 0 || quantityFactor <= 0) {
      return
    }

    const total = basePrice * productMultiplier * sizeFactor * quantityFactor

    setEstimatedPrice(Math.round(total))
    setMaxEstimate(Math.round(total * 1.4))
  }

  return (
    <section id="pricing" className="py-16 md:py-24 bg-card/50 scroll-mt-16 rounded-2xl">
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
                <Select
                  value={productRuleId}
                  onValueChange={(value) => {
                    setProductRuleId(value || "")
                    setProductOptionId("")
                    setSizeValue("")
                    setQuantity("")
                    setEstimatedPrice(null)
                    setMaxEstimate(null)
                  }}
                  disabled={loadingRules}
                >
                  <SelectTrigger id="product" className="bg-input border-border text-foreground">
                    <SelectValue placeholder={loadingRules ? "Loading..." : "Select product type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {rules.map((rule) => (
                      <SelectItem key={rule._id} value={rule._id}>
                        {rule.productType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRule?.enableProductOptions ? (
                <div className="space-y-2">
                  <Label htmlFor="option" className="text-foreground">
                    Product Option
                  </Label>
                  <Select value={productOptionId} onValueChange={(value) => setProductOptionId(value || "")}>
                    <SelectTrigger id="option" className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedRule.productOptions || []).map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {selectedRule?.enableSize ? (
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-foreground">
                    Size
                  </Label>
                  <Input
                    id="size"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Enter size"
                    value={sizeValue}
                    onChange={(e) => setSizeValue(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              ) : null}

              {!selectedRule?.enableProductOptions && !selectedRule?.enableSize && selectedRule ? (
                <div className="space-y-2">
                  <Label className="text-foreground">Pricing Basis</Label>
                  <div className="h-10 rounded-md border bg-muted/20 px-3 text-sm flex items-center text-muted-foreground">
                    Uses product-level base price and multiplier
                  </div>
                </div>
              ) : null}
            </div>

            {selectedRule?.enableQuantity ? (
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-foreground">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={1}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            ) : null}

            {!selectedRule?.enableQuantity && selectedRule ? (
              <p className="text-xs text-muted-foreground">
                Quantity is disabled for this product type. A default quantity of 1 is used.
              </p>
            ) : null}

            <Button
              onClick={calculatePrice}
              disabled={!isCalculationReady || loadingRules}
              className="w-full"
            >
              Calculate Estimate
            </Button>

            {rules.length === 0 && !loadingRules ? (
              <p className="text-sm text-muted-foreground">
                No pricing rules configured yet. Please add rules in admin pricing editor.
              </p>
            ) : null}

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
