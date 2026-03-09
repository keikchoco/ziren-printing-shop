"use client";

import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Trash2, Plus, Loader2, ChevronRight } from "lucide-react";
import {
  addService,
  addServiceOffer,
  deleteService,
  deleteServiceOffer,
  getServiceOffers,
  getServices,
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
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        setOffers(data.data as ServiceOffer[]);
      }
    } catch (error) {
      toast.error("Failed to load offers");
      console.error(error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setNewOffer({ title: "", description: "", image: "" });
    loadOffers(service.service);
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
      const data = await addServiceOffer({
        title: newOffer.title,
        description: newOffer.description,
        image: newOffer.image,
        service: selectedService.service,
      });

      if (data.success) {
        toast.success("Offer added successfully");
        setNewOffer({ title: "", description: "", image: "" });
        await loadOffers(selectedService.service);
      } else {
        toast.error(data.message || "Failed to add offer");
      }
    } catch (error) {
      toast.error("Failed to add offer");
      console.error(error);
    } finally {
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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Services Management</h1>
        <p className="text-gray-600">Manage services and their offers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Services List and Add Service */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add New Service */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Service</CardTitle>
              <CardDescription>Create a new service</CardDescription>
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
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">
                    Auto-generated from display name (read-only)
                  </p>
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
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
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

          {/* Services List */}
          <div>
            <h2 className="text-lg font-bold mb-3">Services ({services.length})</h2>
            {services.length === 0 ? (
              <p className="text-gray-500 text-sm">No services yet. Create one above.</p>
            ) : (
              <div className="space-y-2">
                {services.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => handleSelectService(service)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between ${
                      selectedService?._id === service._id
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{service.display_name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {service.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Service Details and Offers */}
        <div className="lg:col-span-2">
          {!selectedService ? (
            <Card className="h-full flex items-center justify-center min-h-96">
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Select a service from the left to view and manage its offers
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Service Header */}
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      {selectedService.display_name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {selectedService.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteService(selectedService._id)}
                    disabled={submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
              </Card>

              {/* Offers Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">
                  Offers ({offers.length})
                </h3>

                {loadingOffers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin h-6 w-6" />
                  </div>
                ) : offers.length === 0 ? (
                  <p className="text-gray-500">No offers for this service yet.</p>
                ) : (
                  <div className="space-y-3">
                    {offers.map((offer) => (
                      <Card key={offer._id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">
                                {offer.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-2">
                                {offer.description}
                              </p>
                              {offer.image && (
                                <p className="text-xs text-gray-500 mt-3">
                                  🖼️ {offer.image}
                                </p>
                              )}
                            </div>
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Offer Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Offer</CardTitle>
                  <CardDescription>
                    Add a new offer to {selectedService.display_name}
                  </CardDescription>
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
                      <Label htmlFor="offer-image">Image URL (Optional)</Label>
                      <Input
                        id="offer-image"
                        placeholder="https://example.com/image.jpg"
                        value={newOffer.image}
                        onChange={(e) =>
                          setNewOffer({ ...newOffer, image: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminServices;
