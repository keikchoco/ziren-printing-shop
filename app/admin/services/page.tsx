"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  addService,
  addServiceOffer,
  deleteService,
  deleteServiceOffer,
  getServiceOffers,
  getServices,
  updateService,
  updateServiceOffer,
} from "@/app/actions";

interface Service {
  _id: string;
  service: string;
  display_name: string;
  description: string;
}

interface ServiceOffer {
  _id: string;
  title: string;
  description: string;
  image: string;
  galleryImages?: string[];
  service: string;
}

// Convert text to kebab case
const toKebabCase = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
};

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<ServiceOffer | null>(null);
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [savingOfferDetails, setSavingOfferDetails] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [serviceQuery, setServiceQuery] = useState("");
  const [offerQuery, setOfferQuery] = useState("");
  const [newOfferImageFile, setNewOfferImageFile] = useState<File | null>(null);
  const offerImageInputRef = useRef<HTMLInputElement | null>(null);
  const [offerDetails, setOfferDetails] = useState({
    title: "",
    description: "",
  });
  const [offerMainImageFile, setOfferMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const offerMainImageInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageTitle, setPreviewImageTitle] = useState("Image Preview");

  // Form states
  const [newService, setNewService] = useState({
    service: "",
    display_name: "",
    description: "",
  });

  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    image: "",
  });
  const [serviceDetails, setServiceDetails] = useState({
    service: "",
    display_name: "",
    description: "",
  });

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getServices();

      if (data.success) {
        setServices(data.data as Service[]);
      }
    } catch (error) {
      toast.error("Failed to load services");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async (serviceName: string) => {
    try {
      setLoadingOffers(true);
      const data = await getServiceOffers(serviceName);

      if (data.success) {
        const nextOffers = (data.data as ServiceOffer[]).map((offer) => ({
          ...offer,
          galleryImages: offer.galleryImages || [],
        }));

        setOffers(nextOffers);
        return nextOffers;
      }

      return [] as ServiceOffer[];
    } catch (error) {
      toast.error("Failed to load offers");
      console.error(error);
      return [] as ServiceOffer[];
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setServiceDetails({
      service: service.service,
      display_name: service.display_name,
      description: service.description,
    });
    setSelectedOffer(null);
    setNewOffer({ title: "", description: "", image: "" });
    setNewOfferImageFile(null);
    if (offerImageInputRef.current) {
      offerImageInputRef.current.value = "";
    }
    loadOffers(service.service);
  };

  const handleServiceDisplayNameChange = (value: string) => {
    setServiceDetails((prev) => ({
      ...prev,
      display_name: value,
      service: toKebabCase(value),
    }));
  };

  const handleSaveServiceDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) {
      toast.error("Select a service first");
      return;
    }

    if (!serviceDetails.service || !serviceDetails.display_name || !serviceDetails.description) {
      toast.error("All service fields are required");
      return;
    }

    try {
      setSavingService(true);

      const data = await updateService({
        id: selectedService._id,
        service: serviceDetails.service,
        display_name: serviceDetails.display_name,
        description: serviceDetails.description,
      });

      if (!data.success) {
        toast.error(data.message || "Failed to update service");
        return;
      }

      const updatedService = data.data as Service;
      setSelectedService(updatedService);

      setServices((prev) =>
        prev.map((entry) =>
          entry._id === updatedService._id ? updatedService : entry
        )
      );

      setServiceDetails({
        service: updatedService.service,
        display_name: updatedService.display_name,
        description: updatedService.description,
      });

      await loadOffers(updatedService.service);
      toast.success("Service details updated");
    } catch (error) {
      toast.error("Failed to update service");
      console.error(error);
    } finally {
      setSavingService(false);
    }
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    setSelectedOffer(null);
    setOffers([]);
    setOfferQuery("");
    setNewOfferImageFile(null);
    if (offerImageInputRef.current) {
      offerImageInputRef.current.value = "";
    }
  };

  const handleSelectOffer = (offer: ServiceOffer) => {
    setSelectedOffer(offer);
    setOfferDetails({
      title: offer.title,
      description: offer.description,
    });
    setOfferMainImageFile(null);
    setGalleryFiles([]);

    if (offerMainImageInputRef.current) {
      offerMainImageInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const handleBackToOffers = () => {
    setSelectedOffer(null);
    setOfferMainImageFile(null);
    setGalleryFiles([]);

    if (offerMainImageInputRef.current) {
      offerMainImageInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const uploadImageFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("/api/admin/upload-offer-image", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok || !uploadData.success) {
      throw new Error(uploadData.message || "Failed to upload image");
    }

    return uploadData.data.url as string;
  };

  const syncSelectedOffer = async (offerId: string) => {
    if (!selectedService) return;

    const nextOffers = await loadOffers(selectedService.service);
    const refreshedOffer = nextOffers.find((entry) => entry._id === offerId);

    if (refreshedOffer) {
      setSelectedOffer(refreshedOffer);
      setOfferDetails({
        title: refreshedOffer.title,
        description: refreshedOffer.description,
      });
    }
  };

  const handleSaveOfferDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOffer) {
      toast.error("Select an offer first");
      return;
    }

    if (!offerDetails.title || !offerDetails.description) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setSavingOfferDetails(true);

      let imageUrl = selectedOffer.image || "";
      if (offerMainImageFile) {
        imageUrl = await uploadImageFile(offerMainImageFile);
      }

      const data = await updateServiceOffer({
        id: selectedOffer._id,
        title: offerDetails.title,
        description: offerDetails.description,
        image: imageUrl,
      });

      if (!data.success) {
        toast.error(data.message || "Failed to update offer details");
        return;
      }

      toast.success("Offer details updated");
      setOfferMainImageFile(null);
      if (offerMainImageInputRef.current) {
        offerMainImageInputRef.current.value = "";
      }

      await syncSelectedOffer(selectedOffer._id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update offer details");
    } finally {
      setSavingOfferDetails(false);
    }
  };

  const handleUploadGallery = async () => {
    if (!selectedOffer) {
      toast.error("Select an offer first");
      return;
    }

    if (galleryFiles.length === 0) {
      toast.error("Select at least one gallery image");
      return;
    }

    try {
      setUploadingGallery(true);

      const uploadedUrls = await Promise.all(
        galleryFiles.map((file) => uploadImageFile(file))
      );

      const nextGallery = [
        ...(selectedOffer.galleryImages || []),
        ...uploadedUrls,
      ];

      const data = await updateServiceOffer({
        id: selectedOffer._id,
        galleryImages: nextGallery,
      });

      if (!data.success) {
        toast.error(data.message || "Failed to update gallery");
        return;
      }

      toast.success("Gallery updated");
      setGalleryFiles([]);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }

      await syncSelectedOffer(selectedOffer._id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update gallery");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = async (imageUrl: string) => {
    if (!selectedOffer) return;

    try {
      setUploadingGallery(true);

      const nextGallery = (selectedOffer.galleryImages || []).filter(
        (entry) => entry !== imageUrl
      );

      const data = await updateServiceOffer({
        id: selectedOffer._id,
        galleryImages: nextGallery,
      });

      if (!data.success) {
        toast.error(data.message || "Failed to remove gallery image");
        return;
      }

      toast.success("Gallery image removed");
      await syncSelectedOffer(selectedOffer._id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove gallery image");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRefresh = async () => {
    if (selectedService) {
      await loadOffers(selectedService.service);
      return;
    }

    await loadServices();
  };

  const openImagePreview = (imageUrl: string, title?: string) => {
    setPreviewImageUrl(imageUrl);
    setPreviewImageTitle(title || "Image Preview");
  };

  const handleDisplayNameChange = (value: string) => {
    setNewService({
      ...newService,
      display_name: value,
      service: toKebabCase(value),
    });
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newService.service || !newService.display_name || !newService.description) {
      toast.error("All fields are required");
      return;
    }

    try {
      setSubmitting(true);
      const data = await addService(newService);

      if (data.success) {
        toast.success("Service added successfully");
        setNewService({ service: "", display_name: "", description: "" });
        await loadServices();
      } else {
        toast.error(data.message || "Failed to add service");
      }
    } catch (error) {
      toast.error("Failed to add service");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) {
      toast.error("Please select a service first");
      return;
    }

    if (!newOffer.title || !newOffer.description) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = "";

      if (newOfferImageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", newOfferImageFile);

        const uploadResponse = await fetch("/api/admin/upload-offer-image", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success) {
          toast.error(uploadData.message || "Failed to upload image");
          return;
        }

        imageUrl = uploadData.data.url;
      }

      const data = await addServiceOffer({
        title: newOffer.title,
        description: newOffer.description,
        image: imageUrl,
        service: selectedService.service,
      });

      if (data.success) {
        toast.success("Offer added successfully");
        setNewOffer({ title: "", description: "", image: "" });
        setNewOfferImageFile(null);
        if (offerImageInputRef.current) {
          offerImageInputRef.current.value = "";
        }
        await loadOffers(selectedService.service);
      } else {
        toast.error(data.message || "Failed to add offer");
      }
    } catch (error) {
      toast.error("Failed to add offer");
      console.error(error);
    } finally {
      setUploadingImage(false);
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service? All offers will be deleted as well.")) {
      return;
    }

    try {
      setSubmitting(true);
      const data = await deleteService(id);

      if (data.success) {
        toast.success("Service deleted successfully");
        setSelectedService(null);
        setOffers([]);
        await loadServices();
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      toast.error("Failed to delete service");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) {
      return;
    }

    try {
      setSubmitting(true);
      const data = await deleteServiceOffer(id);

      if (data.success) {
        toast.success("Offer deleted successfully");
        if (selectedOffer?._id === id) {
          setSelectedOffer(null);
        }
        if (selectedService) {
          await loadOffers(selectedService.service);
        }
      } else {
        toast.error("Failed to delete offer");
      }
    } catch (error) {
      toast.error("Failed to delete offer");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const normalizedServiceQuery = serviceQuery.trim().toLowerCase();
  const filteredServices = services.filter((service) => {
    if (!normalizedServiceQuery) return true;

    return (
      service.display_name.toLowerCase().includes(normalizedServiceQuery) ||
      service.service.toLowerCase().includes(normalizedServiceQuery) ||
      service.description.toLowerCase().includes(normalizedServiceQuery)
    );
  });

  const normalizedOfferQuery = offerQuery.trim().toLowerCase();
  const filteredOffers = offers.filter((offer) => {
    if (!normalizedOfferQuery) return true;

    return (
      offer.title.toLowerCase().includes(normalizedOfferQuery) ||
      offer.description.toLowerCase().includes(normalizedOfferQuery)
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Services Management</h1>
          <p className="text-muted-foreground">
          {selectedService
            ? `Managing offers for ${selectedService.display_name}`
            : "Select a service to manage its offers"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:min-w-70 *:py-2">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Services</p>
              <p className="text-2xl font-semibold leading-tight">{services.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Offers in View</p>
              <p className="text-2xl font-semibold leading-tight">
                {selectedService ? offers.length : 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {!selectedService ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <CardTitle>Services Directory</CardTitle>
                <CardDescription>Select a service to drill down into offers</CardDescription>
              </div>
              <Button variant="outline" onClick={handleRefresh} disabled={submitting || loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, key, or description"
                  className="pl-9"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {services.length === 0 ? (
                <p className="text-muted-foreground text-sm">No services yet. Add your first service from the panel on the right.</p>
              ) : filteredServices.length === 0 ? (
                <p className="text-muted-foreground text-sm">No services match your search.</p>
              ) : (
                <div className="space-y-2 max-h-130 overflow-auto pr-1">
                  {filteredServices.map((service) => (
                    <button
                      key={service._id}
                      onClick={() => handleSelectService(service)}
                      className="w-full text-left p-4 rounded-lg border transition-colors flex items-center justify-between bg-white hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{service.display_name}</p>
                          <span className="text-[11px] text-muted-foreground font-mono">{service.service}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {service.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Service</CardTitle>
              <CardDescription>Create a new service entry</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    placeholder="e.g., Acrylic Signages"
                    value={newService.display_name}
                    onChange={(e) => handleDisplayNameChange(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Service Key</Label>
                  <Input
                    id="service"
                    placeholder="Auto-generated from display name"
                    value={newService.service}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated from display name.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Service description"
                    value={newService.description}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        description: e.target.value,
                      })
                    }
                    disabled={submitting}
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Service...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {!selectedOffer ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToServices}
                    disabled={submitting}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Services
                  </Button>
                  <p className="text-sm text-muted-foreground">Services / {selectedService.display_name}</p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={submitting || loadingOffers}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Offers
                </Button>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
                  <div>
                    <CardTitle className="text-2xl">Edit Service</CardTitle>
                    <CardDescription>
                      Update this service details before managing offers
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteService(selectedService._id)}
                    disabled={submitting || savingService}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveServiceDetails} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-detail-display-name">Display Name</Label>
                      <Input
                        id="service-detail-display-name"
                        value={serviceDetails.display_name}
                        onChange={(e) => handleServiceDisplayNameChange(e.target.value)}
                        disabled={savingService || submitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service-detail-key">Service Key</Label>
                      <Input
                        id="service-detail-key"
                        value={serviceDetails.service}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Auto-generated from display name.</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="service-detail-description">Description</Label>
                      <Textarea
                        id="service-detail-description"
                        value={serviceDetails.description}
                        onChange={(e) =>
                          setServiceDetails((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        disabled={savingService || submitting}
                        rows={4}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Button type="submit" disabled={savingService || submitting}>
                        {savingService ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving Service...
                          </>
                        ) : (
                          "Save Service"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                  <CardHeader>
                    <CardTitle>Offers ({offers.length})</CardTitle>
                    <CardDescription>Select an offer to view and edit details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search offers"
                        className="pl-9"
                        value={offerQuery}
                        onChange={(e) => setOfferQuery(e.target.value)}
                        disabled={submitting || loadingOffers}
                      />
                    </div>

                    {loadingOffers ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin h-6 w-6" />
                      </div>
                    ) : offers.length === 0 ? (
                      <p className="text-muted-foreground">No offers for this service yet.</p>
                    ) : filteredOffers.length === 0 ? (
                      <p className="text-muted-foreground">No offers match your search.</p>
                    ) : (
                      <div className="space-y-3 max-h-130 overflow-auto pr-1">
                        {filteredOffers.map((offer) => (
                          <Card key={offer._id} className="hover:border-primary/40 transition-colors bg-white">
                            <CardContent className="">
                              <div className="flex items-start justify-between gap-4">
                                <button
                                  type="button"
                                  className="flex-1 text-left"
                                  onClick={() => handleSelectOffer(offer)}
                                >
                                  <h4 className="font-semibold text-lg">{offer.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-2">{offer.description}</p>
                                  <p className="text-xs text-muted-foreground mt-3">
                                    Gallery images: {(offer.galleryImages || []).length}
                                  </p>
                                </button>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectOffer(offer)}
                                    disabled={submitting}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteOffer(offer._id)}
                                    disabled={submitting}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Add New Offer</CardTitle>
                    <CardDescription>Add a new offer to {selectedService.display_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddOffer} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="offer-title">Title</Label>
                        <Input
                          id="offer-title"
                          placeholder="e.g., Acrylic Build Up"
                          value={newOffer.title}
                          onChange={(e) =>
                            setNewOffer({ ...newOffer, title: e.target.value })
                          }
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="offer-description">Description</Label>
                        <Textarea
                          id="offer-description"
                          placeholder="Offer description"
                          value={newOffer.description}
                          onChange={(e) =>
                            setNewOffer({
                              ...newOffer,
                              description: e.target.value,
                            })
                          }
                          disabled={submitting}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="offer-image">Offer Image (Optional)</Label>
                        <Input
                          id="offer-image"
                          type="file"
                          accept="image/*"
                          ref={offerImageInputRef}
                          onChange={(e) =>
                            setNewOfferImageFile(e.target.files?.[0] ?? null)
                          }
                          disabled={submitting || uploadingImage}
                        />
                        <p className="text-xs text-muted-foreground">
                          {newOfferImageFile
                            ? `Selected: ${newOfferImageFile.name}`
                            : "Upload an image file."}
                        </p>
                      </div>

                      <Button type="submit" disabled={submitting || uploadingImage} className="w-full">
                        {submitting || uploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {uploadingImage ? "Uploading Image..." : "Adding Offer..."}
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Offer
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToOffers}
                    disabled={savingOfferDetails || uploadingGallery}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Offers
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Services / {selectedService.display_name} / {selectedOffer.title}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                  <CardHeader>
                    <CardTitle>Offer Details</CardTitle>
                    <CardDescription>Edit title, description, and primary image</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveOfferDetails} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="detail-title">Title</Label>
                        <Input
                          id="detail-title"
                          value={offerDetails.title}
                          onChange={(e) =>
                            setOfferDetails((prev) => ({ ...prev, title: e.target.value }))
                          }
                          disabled={savingOfferDetails || uploadingGallery}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="detail-description">Description</Label>
                        <Textarea
                          id="detail-description"
                          value={offerDetails.description}
                          onChange={(e) =>
                            setOfferDetails((prev) => ({ ...prev, description: e.target.value }))
                          }
                          disabled={savingOfferDetails || uploadingGallery}
                          rows={5}
                        />
                      </div>

                      {selectedOffer.image ? (
                        <div className="space-y-2">
                          <Label>Current Primary Image</Label>
                          <button
                            type="button"
                            className="block"
                            onClick={() =>
                              openImagePreview(
                                selectedOffer.image,
                                `${selectedOffer.title} - Primary Image`
                              )
                            }
                          >
                            <img
                              src={selectedOffer.image}
                              alt={selectedOffer.title}
                              className="w-full max-w-md h-44 object-cover rounded-md border cursor-zoom-in"
                            />
                          </button>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <Label htmlFor="detail-main-image">Replace Primary Image (Optional)</Label>
                        <Input
                          id="detail-main-image"
                          type="file"
                          accept="image/*"
                          ref={offerMainImageInputRef}
                          onChange={(e) => setOfferMainImageFile(e.target.files?.[0] ?? null)}
                          disabled={savingOfferDetails || uploadingGallery}
                        />
                        <p className="text-xs text-muted-foreground">
                          {offerMainImageFile
                            ? `Selected: ${offerMainImageFile.name}`
                            : "Choose a new primary image only if you want to replace the current one."}
                        </p>
                      </div>

                      <Button type="submit" disabled={savingOfferDetails || uploadingGallery}>
                        {savingOfferDetails ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving Details...
                          </>
                        ) : (
                          "Save Details"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Image Gallery</CardTitle>
                    <CardDescription>Upload additional images for this offer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gallery-images">Upload Gallery Images</Label>
                      <Input
                        id="gallery-images"
                        type="file"
                        accept="image/*"
                        multiple
                        ref={galleryInputRef}
                        onChange={(e) =>
                          setGalleryFiles(Array.from(e.target.files || []))
                        }
                        disabled={uploadingGallery || savingOfferDetails}
                      />
                      <p className="text-xs text-muted-foreground">
                        {galleryFiles.length > 0
                          ? `${galleryFiles.length} file(s) selected`
                          : "Select one or more images to add to the gallery."}
                      </p>
                    </div>

                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleUploadGallery}
                      disabled={uploadingGallery || savingOfferDetails || galleryFiles.length === 0}
                    >
                      {uploadingGallery ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading Gallery...
                        </>
                      ) : (
                        "Upload to Gallery"
                      )}
                    </Button>

                    <div className="space-y-3 max-h-130 overflow-auto pr-1">
                      {(selectedOffer.galleryImages || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No gallery images yet.</p>
                      ) : (
                        (selectedOffer.galleryImages || []).map((imageUrl) => (
                          <div key={imageUrl} className="border rounded-md p-2 space-y-2">
                            <button
                              type="button"
                              className="w-full block"
                              onClick={() => openImagePreview(imageUrl, "Offer Gallery Image")}
                            >
                              <img
                                src={imageUrl}
                                alt="Offer gallery"
                                className="w-full h-28 object-cover rounded cursor-zoom-in"
                              />
                            </button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleRemoveGalleryImage(imageUrl)}
                              disabled={uploadingGallery || savingOfferDetails}
                            >
                              Remove
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      <Dialog open={Boolean(previewImageUrl)} onOpenChange={(open) => !open && setPreviewImageUrl("")}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImageTitle}</DialogTitle>
          </DialogHeader>
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt={previewImageTitle}
              className="w-full max-h-[75vh] object-contain rounded-md"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
