"use client";

import React, { useEffect, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { GripVertical, Loader2, Plus, Save, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Faq = {
  _id: string;
  question: string;
  answer: string;
  sortOrder?: number;
};

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="sr-only">Drag FAQ</span>
    </Button>
  );
}

function SortableFaqRow({
  faq,
  index,
  submitting,
  isEditing,
  editDraft,
  onQuestionChange,
  onAnswerChange,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: {
  faq: Faq;
  index: number;
  submitting: boolean;
  isEditing: boolean;
  editDraft: Faq | null;
  onQuestionChange: (id: string, value: string) => void;
  onAnswerChange: (id: string, value: string) => void;
  onEdit: (faq: Faq) => void;
  onCancel: () => void;
  onSave: (faq: Faq) => void;
  onDelete: (id: string) => void;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: faq._id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`rounded-lg border bg-background ${
        isDragging ? "opacity-80 shadow-sm" : ""
      } ${isEditing ? "ring-1 ring-primary/30" : ""}`}
    >
      <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-[auto_1.2fr_2fr_auto] xl:items-start">
        <div className="flex items-center gap-2 xl:pt-2">
          <DragHandle id={faq._id} />
          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            #{index + 1}
          </div>
        </div>

        <div className="flex items-center gap-2 xl:pt-2 h-full">
          {isEditing ? (
            <Input
              id={`question-${faq._id}`}
              value={editDraft?.question ?? faq.question}
              onChange={(e) => onQuestionChange(faq._id, e.target.value)}
              disabled={submitting}
              className="bg-background"
            />
          ) : (
            <p className="h-full flex items-center">
              {faq.question}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 xl:pt-2 h-full">
          {isEditing ? (
            <Input
              id={`answer-${faq._id}`}
              value={editDraft?.answer ?? faq.answer}
              onChange={(e) => onAnswerChange(faq._id, e.target.value)}
              disabled={submitting}
              className="bg-background"
            />
          ) : (
            <p className="rounded-md text-sm leading-relaxed">
              {faq.answer}
            </p>
          )}
        </div>

        <div className="flex xl:justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                onClick={() => onSave(editDraft ?? faq)}
                disabled={submitting}
                variant="secondary"
                size="icon"
                aria-label="Save FAQ"
              >
                <Save className="h-4 w-4" />
                <span className="sr-only">Save FAQ</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
                size="icon"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Cancel editing</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={() => onEdit(faq)}
                disabled={submitting}
                variant="secondary"
                size="icon"
                aria-label="Edit FAQ"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit FAQ</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(faq._id)}
                disabled={submitting}
                size="icon"
                aria-label="Delete FAQ"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete FAQ</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Faq | null>(null);
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
  });
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const faqIds = faqs.map((faq) => faq._id) as UniqueIdentifier[];

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/getFaqs", { method: "GET" });
      const data = await response.json();

      if (response.ok && data.success) {
        setFaqs(data.data as Faq[]);
      } else {
        toast.error(data.message || "Failed to load FAQs");
      }
    } catch (error) {
      toast.error("Failed to load FAQs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFaq.question || !newFaq.answer) {
      toast.error("Question and answer are required");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("FAQ added");
        setNewFaq({ question: "", answer: "" });
        await loadFaqs();
      } else {
        toast.error(data.message || "Failed to add FAQ");
      }
    } catch (error) {
      toast.error("Failed to add FAQ");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveFaq = async (faq: Faq) => {
    if (!faq.question || !faq.answer) {
      toast.error("Question and answer are required");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/admin/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: faq._id,
          question: faq.question,
          answer: faq.answer,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("FAQ updated");
        setEditingFaqId(null);
        setEditDraft(null);
        await loadFaqs();
      } else {
        toast.error(data.message || "Failed to update FAQ");
      }
    } catch (error) {
      toast.error("Failed to update FAQ");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFaq = (faq: Faq) => {
    setEditingFaqId(faq._id);
    setEditDraft({ ...faq });
  };

  const handleCancelEditFaq = () => {
    setEditingFaqId(null);
    setEditDraft(null);
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("Delete this FAQ item?")) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/faqs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("FAQ deleted");
        await loadFaqs();
      } else {
        toast.error(data.message || "Failed to delete FAQ");
      }
    } catch (error) {
      toast.error("Failed to delete FAQ");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const persistFaqOrder = async (orderedFaqs: Faq[]) => {
    const response = await fetch("/api/admin/faqs/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: orderedFaqs.map((faq) => faq._id) }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to reorder FAQs");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || submitting) {
      return;
    }

    const oldIndex = faqs.findIndex((faq) => faq._id === active.id);
    const newIndex = faqs.findIndex((faq) => faq._id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const previousFaqs = faqs;
    const reorderedFaqs = arrayMove(faqs, oldIndex, newIndex);
    setFaqs(reorderedFaqs);

    try {
      setSubmitting(true);
      await persistFaqOrder(reorderedFaqs);
      toast.success("FAQ order updated");
    } catch (error) {
      setFaqs(previousFaqs);
      toast.error(error instanceof Error ? error.message : "Failed to reorder FAQs");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuestionChange = (id: string, value: string) => {
    setEditDraft((prev) => (prev && prev._id === id ? { ...prev, question: value } : prev));
  };

  const handleAnswerChange = (id: string, value: string) => {
    setEditDraft((prev) => (prev && prev._id === id ? { ...prev, answer: value } : prev));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">FAQ Editor</h1>
        <p className="text-muted-foreground mt-2">
          Add, edit, and drag FAQs to reorder how they appear on the public site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add FAQ</CardTitle>
          <CardDescription>Create a new FAQ item</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddFaq} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-question">Question</Label>
              <Input
                id="new-question"
                value={newFaq.question}
                onChange={(e) => setNewFaq((prev) => ({ ...prev, question: e.target.value }))}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-answer">Answer</Label>
              <Textarea
                id="new-answer"
                rows={4}
                value={newFaq.answer}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewFaq((prev) => ({ ...prev, answer: e.target.value }))
                }
                disabled={submitting}
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add FAQ
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-muted-foreground">No FAQ items yet.</CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="grid grid-cols-1 gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground xl:grid-cols-[auto_1.2fr_2fr_auto]">
              <div>Drag</div>
              <div>Question</div>
              <div>Answer</div>
              <div className="xl:text-right">Actions</div>
            </div>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext items={faqIds} strategy={verticalListSortingStrategy}>
                <div className="divide-y">
                  {faqs.map((faq, index) => (
                    <SortableFaqRow
                      key={faq._id}
                      faq={faq}
                      index={index}
                      submitting={submitting}
                      isEditing={editingFaqId === faq._id}
                      editDraft={editingFaqId === faq._id ? editDraft : null}
                      onQuestionChange={handleQuestionChange}
                      onAnswerChange={handleAnswerChange}
                      onEdit={handleEditFaq}
                      onCancel={handleCancelEditFaq}
                      onSave={handleSaveFaq}
                      onDelete={handleDeleteFaq}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
