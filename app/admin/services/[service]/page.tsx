"use client";

import {
  addServiceOffer,
  deleteServiceOffer,
  getAdminServiceOffers,
  updateServiceOffer,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ServiceOffer = {
  _id: string;
  title: string;
  description: string;
  image: string;
  service: string;
  createdAt?: string;
};

type OfferFormState = {
  id?: string;
  title: string;
  description: string;
  image: string;
};

const emptyForm: OfferFormState = {
  title: "",
  description: "",
  image: "",
};

export default function ServiceOffersPage() {
  const params = useParams<{ service: string }>();
  const router = useRouter();
  const serviceKey = decodeURIComponent(params.service);

  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<OfferFormState>(emptyForm);

  const filteredOffers = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return offers;

    return offers.filter((item) =>
      [item.title, item.description, item.image]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [offers, filter]);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    const response = await getAdminServiceOffers(serviceKey);
    if (!response.success) {
      toast.error(response.message || "Failed to load offers");
      setLoading(false);
      return;
    }

    setOffers((response.data as ServiceOffer[]) || []);
    setLoading(false);
  }, [serviceKey]);

  useEffect(() => {
    const run = async () => {
      await loadOffers();
    };

    void run();
  }, [loadOffers]);

  const openCreateDialog = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (offer: ServiceOffer) => {
    setForm({
      id: offer._id,
      title: offer.title,
      description: offer.description,
      image: offer.image,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }

    setSubmitting(true);

    const response = form.id
      ? await updateServiceOffer({
          id: form.id,
          title: form.title,
          description: form.description,
          image: form.image,
          service: serviceKey,
        })
      : await addServiceOffer({
          title: form.title,
          description: form.description,
          image: form.image,
          service: serviceKey,
        });

    if (!response.success) {
      toast.error(response.message || "Failed to save offer");
      setSubmitting(false);
      return;
    }

    toast.success(form.id ? "Offer updated" : "Offer created");
    setDialogOpen(false);
    setForm(emptyForm);
    await loadOffers();
    setSubmitting(false);
  };

  const handleDelete = async (offer: ServiceOffer) => {
    const confirmed = window.confirm(
      `Delete offer \"${offer.title}\" and all its gallery images?`
    );
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    const response = await deleteServiceOffer(offer._id);

    if (!response.success) {
      toast.error(response.message || "Failed to delete offer");
      setSubmitting(false);
      return;
    }

    toast.success("Offer deleted");
    await loadOffers();
    setSubmitting(false);
  };

  const openGallery = (offer: ServiceOffer) => {
    router.push(`/admin/services/${encodeURIComponent(serviceKey)}/${encodeURIComponent(offer._id)}`);
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-180px)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/services")}> 
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Services
            </Button>
          </div>
          <h1 className="text-2xl font-semibold">Offers</h1>
          <p className="text-sm text-muted-foreground">Service: {serviceKey}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadOffers} disabled={loading || submitting}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog} disabled={submitting}>
            <Plus className="mr-2 h-4 w-4" />
            Add Offer
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter by title, description, or image"
            className="max-w-xl"
          />
          <p className="text-sm text-muted-foreground">{filteredOffers.length} records</p>
        </div>

        <div className="max-h-[calc(100vh-340px)] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Cover Image URL</TableHead>
                <TableHead className="w-[300px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filteredOffers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    No offers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOffers.map((offer) => (
                  <TableRow key={offer._id}>
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell className="max-w-[460px] truncate">{offer.description}</TableCell>
                    <TableCell className="max-w-[280px] truncate">{offer.image || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => openGallery(offer)}>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Gallery
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(offer)}
                          disabled={submitting}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(offer)}
                          disabled={submitting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Offer" : "Create Offer"}</DialogTitle>
            <DialogDescription>
              {form.id ? "Update offer details." : "Create a new offer for this service."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offer-title">Title</Label>
              <Input
                id="offer-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Acrylic Build Up"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-description">Description</Label>
              <Textarea
                id="offer-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-cover">Cover Image URL (optional)</Label>
              <Input
                id="offer-cover"
                value={form.image}
                onChange={(event) =>
                  setForm((current) => ({ ...current, image: event.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {form.id ? "Save Changes" : "Create Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
