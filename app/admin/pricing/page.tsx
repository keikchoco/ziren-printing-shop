"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type ProductOption = {
  id: string;
  label: string;
  basePrice: number;
  multiplier: number;
};

type PricingRule = {
  _id?: string;
  productType: string;
  enableProductOptions: boolean;
  productOptions: ProductOption[];
  enableSize: boolean;
  enableQuantity: boolean;
  basePrice: number;
  multiplier: number;
};

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const emptyRule = (): PricingRule => ({
  productType: "",
  enableProductOptions: false,
  productOptions: [],
  enableSize: false,
  enableQuantity: false,
  basePrice: 0,
  multiplier: 1,
});

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PricingRule>(emptyRule());

  useEffect(() => {
    loadRules();
  }, []);

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.productType.localeCompare(b.productType)),
    [rules]
  );

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/pricing-rules", { method: "GET" });
      const data = await response.json();

      if (response.ok && data.success) {
        setRules((data.data as PricingRule[]) || []);
      } else {
        toast.error(data.message || "Failed to load pricing rules");
      }
    } catch (error) {
      toast.error("Failed to load pricing rules");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyRule());
  };

  const normalizeNumber = (value: string, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.productType.trim()) {
      toast.error("Product type is required");
      return;
    }

    const payload = {
      productType: form.productType.trim(),
      enableProductOptions: form.enableProductOptions,
      productOptions: form.productOptions,
      enableSize: form.enableSize,
      enableQuantity: form.enableQuantity,
      basePrice: form.basePrice,
      multiplier: form.multiplier,
    };

    try {
      setSubmitting(true);

      const response = await fetch("/api/admin/pricing-rules", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to save pricing rule");
        return;
      }

      toast.success(editingId ? "Pricing rule updated" : "Pricing rule created");
      resetForm();
      await loadRules();
    } catch (error) {
      toast.error("Failed to save pricing rule");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (rule: PricingRule) => {
    setEditingId(rule._id || null);
    setForm({
      ...rule,
      productOptions: (rule.productOptions || []).map((item) => ({
        id: item.id || makeId("opt"),
        label: item.label,
        basePrice: Number(item.basePrice) || 0,
        multiplier: Number(item.multiplier) || 1,
      })),
      basePrice: Number(rule.basePrice) || 0,
      multiplier: Number(rule.multiplier) || 1,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this pricing rule?")) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/pricing-rules?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to delete pricing rule");
        return;
      }

      toast.success("Pricing rule deleted");
      if (editingId === id) {
        resetForm();
      }
      await loadRules();
    } catch (error) {
      toast.error("Failed to delete pricing rule");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const addProductOption = () => {
    setForm((prev) => ({
      ...prev,
      productOptions: [
        ...prev.productOptions,
        { id: makeId("opt"), label: "", basePrice: 0, multiplier: 1 },
      ],
    }));
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing Calculator Editor</h1>
        <p className="text-muted-foreground mt-2">
          Configure formulas like Base Price x Size x Multiplier or Base Price x Quantity x Multiplier.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Pricing Rule" : "Create Pricing Rule"}</CardTitle>
          <CardDescription>
            Product type is required. Base price and multiplier are required either at product level or per product option.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productType">Product Type</Label>
              <Input
                id="productType"
                value={form.productType}
                onChange={(e) => setForm((prev) => ({ ...prev, productType: e.target.value }))}
                disabled={submitting}
                placeholder="e.g. Acrylic"
              />
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableOptions">Enable Product Options</Label>
                <input
                  id="enableOptions"
                  type="checkbox"
                  checked={form.enableProductOptions}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      enableProductOptions: e.target.checked,
                      productOptions: e.target.checked ? prev.productOptions : [],
                    }))
                  }
                  disabled={submitting}
                />
              </div>

              {form.enableProductOptions ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground">
                    <div>Option Label</div>
                    <div>Base Price</div>
                    <div>Multiplier</div>
                    <div></div>
                  </div>
                  {form.productOptions.map((option) => (
                    <div key={option.id} className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_auto] gap-2">
                      <Input
                        placeholder="Option label"
                        value={option.label}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            productOptions: prev.productOptions.map((item) =>
                              item.id === option.id ? { ...item, label: e.target.value } : item
                            ),
                          }))
                        }
                        disabled={submitting}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={option.basePrice}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            productOptions: prev.productOptions.map((item) =>
                              item.id === option.id
                                ? { ...item, basePrice: normalizeNumber(e.target.value) }
                                : item
                            ),
                          }))
                        }
                        disabled={submitting}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1.00"
                        value={option.multiplier}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            productOptions: prev.productOptions.map((item) =>
                              item.id === option.id
                                ? { ...item, multiplier: normalizeNumber(e.target.value, 1) }
                                : item
                            ),
                          }))
                        }
                        disabled={submitting}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            productOptions: prev.productOptions.filter((item) => item.id !== option.id),
                          }))
                        }
                        disabled={submitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addProductOption} disabled={submitting}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product Option
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base-price">Base Price</Label>
                    <Input
                      id="base-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.basePrice}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, basePrice: normalizeNumber(e.target.value) }))
                      }
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base-multiplier">Multiplier</Label>
                    <Input
                      id="base-multiplier"
                      type="number"
                      step="0.01"
                      placeholder="1.00"
                      value={form.multiplier}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, multiplier: normalizeNumber(e.target.value, 1) }))
                      }
                      disabled={submitting}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableSize">Enable Size Input</Label>
                <input
                  id="enableSize"
                  type="checkbox"
                  checked={form.enableSize}
                  onChange={(e) => setForm((prev) => ({ ...prev, enableSize: e.target.checked }))}
                  disabled={submitting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, user will enter a numeric size value and the calculator will include it in the formula.
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableQuantity">Enable Quantity Input</Label>
                <input
                  id="enableQuantity"
                  type="checkbox"
                  checked={form.enableQuantity}
                  onChange={(e) => setForm((prev) => ({ ...prev, enableQuantity: e.target.checked }))}
                  disabled={submitting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, user will enter quantity and the calculator will include it in the formula.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  "Update Rule"
                ) : (
                  "Create Rule"
                )}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Pricing Rules</CardTitle>
          <CardDescription>Full CRUD list for all configured product types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedRules.length === 0 ? (
            <p className="text-muted-foreground">No pricing rules yet.</p>
          ) : (
            sortedRules.map((rule) => (
              <div
                key={rule._id}
                className="rounded-lg border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">{rule.productType}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Product options: {rule.enableProductOptions ? "Enabled" : "Disabled"} | Size input: {rule.enableSize ? "Enabled" : "Disabled"} | Quantity input: {rule.enableQuantity ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => startEdit(rule)}
                    disabled={submitting}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => rule._id && handleDelete(rule._id)}
                    disabled={submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
