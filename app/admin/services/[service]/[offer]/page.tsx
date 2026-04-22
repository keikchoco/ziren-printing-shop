"use client";

import {
  addOfferGalleryImage,
  deleteOfferGalleryImage,
  getOfferGallery,
  getServiceOfferById,
  updateOfferGalleryImage,
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
import { ArrowLeft, Loader2, Pencil, RefreshCw, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Offer = {
  _id: string;
  title: string;
  description: string;
  service: string;
  image?: string;
};

type GalleryItem = {
  _id: string;
  offerId: string;
  service: string;
  imageUrl: string;
  pathname?: string | null;
  alt?: string;
  createdAt?: string;
};

export default function OfferGalleryPage() {
  const params = useParams<{ service: string; offer: string }>();
  const router = useRouter();

  const serviceKey = decodeURIComponent(params.service);
  const offerId = decodeURIComponent(params.offer);

  const [offer, setOffer] = useState<Offer | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editingAlt, setEditingAlt] = useState("");

  const filteredItems = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [item.alt || "", item.imageUrl]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [items, filter]);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [offerResponse, galleryResponse] = await Promise.all([
      getServiceOfferById(offerId),
      getOfferGallery(offerId),
    ]);

    if (!offerResponse.success) {
      toast.error(offerResponse.message || "Failed to load offer details");
      setLoading(false);
      return;
    }

    if (!galleryResponse.success) {
      toast.error(galleryResponse.message || "Failed to load gallery");
      setLoading(false);
      return;
    }

    setOffer((offerResponse.data as Offer) || null);
    setItems((galleryResponse.data as GalleryItem[]) || []);
    setLoading(false);
  }, [offerId]);

  useEffect(() => {
    const run = async () => {
      await loadData();
    };

    void run();
  }, [loadData]);

  const handleUpload = async () => {
    if (!files.length) {
      toast.error("Please select one or more images");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("service", serviceKey);
    formData.append("offerId", offerId);
    files.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/admin/offer-gallery/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await response.json();
    if (!uploadData.success) {
      toast.error(uploadData.message || "Failed to upload images");
      setSubmitting(false);
      return;
    }

    const uploaded = (uploadData.data || []) as Array<{
      url: string;
      pathname: string;
      originalName?: string;
    }>;

    for (const image of uploaded) {
      const saveResponse = await addOfferGalleryImage({
        offerId,
        service: serviceKey,
        imageUrl: image.url,
        pathname: image.pathname,
        alt: image.originalName || "",
      });

      if (!saveResponse.success) {
        toast.error(saveResponse.message || "Failed to register uploaded image");
        setSubmitting(false);
        return;
      }
    }

    setFiles([]);
    const fileInput = document.getElementById("gallery-upload") as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }

    toast.success(`${uploaded.length} image(s) uploaded`);
    await loadData();
    setSubmitting(false);
  };

  const openEditDialog = (item: GalleryItem) => {
    setEditingItem(item);
    setEditingAlt(item.alt || "");
    setDialogOpen(true);
  };

  const handleSaveAlt = async () => {
    if (!editingItem) {
      return;
    }

    setSubmitting(true);
    const response = await updateOfferGalleryImage({
      id: editingItem._id,
      alt: editingAlt,
    });

    if (!response.success) {
      toast.error(response.message || "Failed to update image metadata");
      setSubmitting(false);
      return;
    }

    toast.success("Image details updated");
    setDialogOpen(false);
    setEditingItem(null);
    setEditingAlt("");
    await loadData();
    setSubmitting(false);
  };

  const handleDelete = async (item: GalleryItem) => {
    const confirmed = window.confirm("Delete this gallery image?");
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    const response = await deleteOfferGalleryImage(item._id);

    if (!response.success) {
      toast.error(response.message || "Failed to delete image");
      setSubmitting(false);
      return;
    }

    toast.success("Image deleted");
    await loadData();
    setSubmitting(false);
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-180px)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/services/${encodeURIComponent(serviceKey)}`)}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Offers
            </Button>
          </div>
          <h1 className="text-2xl font-semibold">Offer Image Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Service: {serviceKey} {offer ? `| Offer: ${offer.title}` : ""}
          </p>
        </div>

        <Button variant="outline" onClick={loadData} disabled={loading || submitting}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="gallery-upload">Upload Images (multiple)</Label>
            <Input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) =>
                setFiles(Array.from(event.target.files || []))
              }
            />
          </div>
          <Button onClick={handleUpload} disabled={!files.length || submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload Selected
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter by alt text or URL"
            className="max-w-xl"
          />
          <p className="text-sm text-muted-foreground">{filteredItems.length} records</p>
        </div>

        <div className="max-h-[calc(100vh-420px)] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Alt Text</TableHead>
                <TableHead>Image URL</TableHead>
                <TableHead className="w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    No gallery images found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Image
                        src={item.imageUrl}
                        alt={item.alt || "Gallery image"}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded object-cover"
                      />
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">{item.alt || "-"}</TableCell>
                    <TableCell className="max-w-[520px] truncate">{item.imageUrl}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(item)}
                          disabled={submitting}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item)}
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
            <DialogTitle>Edit Image Metadata</DialogTitle>
            <DialogDescription>Update the alt text for this image.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="gallery-alt">Alt Text</Label>
            <Input
              id="gallery-alt"
              value={editingAlt}
              onChange={(event) => setEditingAlt(event.target.value)}
              placeholder="Readable image description"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAlt} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
