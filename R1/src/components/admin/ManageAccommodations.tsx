import { useState, useEffect } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Plus, Upload } from "lucide-react";
import { useAccommodations } from "@/hooks/useApi";
import {
  useCreateAccommodation,
  useUpdateAccommodation,
  useDeleteAccommodation,
  useUploadImage,
} from "@/hooks/useApiMutation";

interface AccommodationForm {
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  amenities: string;
  images: string[];
  rating: number;
}

const initialForm: AccommodationForm = {
  name: "",
  description: "",
  price_per_night: 0,
  capacity: 1,
  amenities: "",
  images: [],
  rating: 4.5,
};

export function ManageAccommodations() {
  const { data: accommodations, loading, refetch } = useAccommodations();
  const { mutate: createAccommodation, loading: creating } = useCreateAccommodation();
  const { mutate: updateAccommodation, loading: updating } = useUpdateAccommodation();
  const { mutate: deleteAccommodation, loading: deleting } = useDeleteAccommodation();
  const { mutate: uploadImage, loading: uploading } = useUploadImage();

  const [form, setForm] = useState<AccommodationForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    refetch?.();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim() || form.price_per_night <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const amenitiesArray = form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);

      const payload = {
        name: form.name,
        description: form.description,
        price_per_night: form.price_per_night,
        capacity: form.capacity,
        amenities: amenitiesArray,
        images: form.images,
        rating: form.rating,
      };

      let res;
      if (editingId) {
        res = await updateAccommodation({ id: editingId, data: payload } as any);
      } else {
        res = await createAccommodation(payload as any);
      }

      if (res) {
        setForm(initialForm);
        setEditingId(null);
        setImagePreview("");
        refetch?.();
        alert(editingId ? "Accommodation updated" : "Accommodation created");
      } else {
        alert("Failed to save accommodation");
      }
    } catch (err) {
      console.warn(err);
      alert("Error saving accommodation");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this accommodation? This action cannot be undone.")) return;
    const res = await deleteAccommodation(id);
    if (res !== null) {
      refetch?.();
      alert("Accommodation deleted");
    } else {
      alert("Delete failed");
    }
  };

  const onEdit = (accom: any) => {
    setEditingId(accom.id);
    setForm({
      name: accom.name || "",
      description: accom.description || "",
      price_per_night: accom.price_per_night || 0,
      capacity: accom.capacity || 1,
      amenities: (accom.amenities || []).join(", "),
      images: accom.images || [],
      rating: accom.rating || 4.5,
    });
    setImagePreview(accom.images?.[0] || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onFileChange = async (file?: File | null) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await uploadImage(fd);
      if (res && res.url) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, res.url],
        }));
        setImagePreview(res.url);
        alert("Image uploaded successfully");
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      console.warn(err);
      alert("Image upload error");
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Accommodations List */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {loading && <div className="text-center py-8">Loading accommodations…</div>}
          {!loading && (!accommodations || accommodations.length === 0) && (
            <div className="p-4 bg-muted rounded">No accommodations found. Add one using the form.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(accommodations || []).map((accom: any) => (
              <div key={accom.id} className="p-4 border border-border rounded bg-background shadow-soft">
                {accom.images?.[0] && (
                  <img
                    src={accom.images[0]}
                    alt={accom.name}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}
                <div>
                  <h3 className="font-medium text-lg mb-1">{accom.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{accom.description}</p>
                  <div className="text-xs text-muted-foreground mb-2">
                    <p>Price: ${accom.price_per_night}/night</p>
                    <p>Capacity: {accom.capacity} guests</p>
                    <p>Rating: {accom.rating}/5</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onEdit(accom)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                      title={`Edit ${accom.name}`}
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(accom.id)}
                      disabled={deleting}
                      className="flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                      title={`Delete ${accom.name}`}
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="p-4 border border-border rounded bg-card shadow-soft h-fit sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">
            {editingId ? "Edit Accommodation" : "Add New Accommodation"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setEditingId(null);
                setImagePreview("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
              title="Cancel editing"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="accom-name" className="text-sm block mb-1 font-medium">
              Name *
            </label>
            <input
              id="accom-name"
              name="accommodationName"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Luxury Suite, Garden Villa"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="accom-desc" className="text-sm block mb-1 font-medium">
              Description *
            </label>
            <textarea
              id="accom-desc"
              name="accommodationDesc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the accommodation"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="accom-price" className="text-sm block mb-1 font-medium">
                Price/Night ($) *
              </label>
              <input
                id="accom-price"
                name="accommodationPrice"
                type="number"
                value={form.price_per_night}
                onChange={(e) => setForm({ ...form, price_per_night: parseFloat(e.target.value) })}
                placeholder="0"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="accom-capacity" className="text-sm block mb-1 font-medium">
                Max Guests *
              </label>
              <input
                id="accom-capacity"
                name="accommodationCapacity"
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
                placeholder="1"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="accom-rating" className="text-sm block mb-1 font-medium">
              Rating (1-5)
            </label>
            <input
              id="accom-rating"
              name="accommodationRating"
              type="number"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              max="5"
              step="0.1"
            />
          </div>

          <div>
            <label htmlFor="accom-amenities" className="text-sm block mb-1 font-medium">
              Amenities (comma-separated)
            </label>
            <textarea
              id="accom-amenities"
              name="accommodationAmenities"
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              placeholder="WiFi, Air Conditioning, Balcony, etc."
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm block mb-2 font-medium">Images</label>
            {imagePreview && (
              <div className="mb-2 relative">
                <OptimizedImage src={imagePreview} alt="Preview" className="w-full h-24 object-cover rounded" />
              </div>
            )}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                disabled={uploading}
                title="Upload accommodation image"
                className="w-full text-xs"
              />
              {uploading && <div className="text-xs text-muted-foreground">Uploading...</div>}
              {form.images.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {form.images.length} image(s) added
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, images: form.images.slice(0, 1) })}
                      className="ml-2 text-destructive hover:underline"
                      title="Remove extra images"
                    >
                      (keep first only)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              variant="luxury"
              disabled={creating || updating}
              className="flex-1"
              title={editingId ? "Update accommodation" : "Create new accommodation"}
            >
              <Plus className="h-4 w-4 mr-1" />
              {creating || updating ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(initialForm);
                setEditingId(null);
                setImagePreview("");
              }}
              title="Reset form"
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
