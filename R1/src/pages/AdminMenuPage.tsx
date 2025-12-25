import { useState } from "react";
import { useMenuItems } from "@/hooks/useApi";
import { useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from "@/hooks/useApiMutation";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus } from "lucide-react";

interface MenuItemForm {
  name: string;
  description: string;
  category: "starter" | "main" | "side" | "dessert" | "beverage";
  portion: string;
  price: number;
  imageUrl: string;
  dietaryTags: string;
  isVisible: boolean;
}

const defaultForm: MenuItemForm = {
  name: "",
  description: "",
  category: "starter",
  portion: "per serving",
  price: 0,
  imageUrl: "",
  dietaryTags: "",
  isVisible: true,
};

export function AdminMenuPage() {
  const { data: menuItems, loading, refetch } = useMenuItems();
  const { mutate: createMenuItem, loading: creating } = useCreateMenuItem();
  const { mutate: updateMenuItem, loading: updating } = useUpdateMenuItem();
  const { mutate: deleteMenuItem, loading: deleting } = useDeleteMenuItem();

  const [form, setForm] = useState<MenuItemForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: form.name,
      description: form.description,
      category: form.category,
      portion: form.portion,
      price: form.price,
      imageUrl: form.imageUrl,
      dietaryTags: form.dietaryTags.split(",").map((t) => t.trim()).filter((t) => t),
      isVisible: form.isVisible,
    };

    try {
      if (editingId) {
        await updateMenuItem({ id: editingId, data });
        alert("Menu item updated!");
      } else {
        await createMenuItem(data);
        alert("Menu item created!");
      }
      setForm(defaultForm);
      setEditingId(null);
      setPreviewImage("");
      refetch();
    } catch (error) {
      alert("Failed to save menu item");
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      name: item.name,
      description: item.description,
      category: item.category,
      portion: item.portion,
      price: item.price,
      imageUrl: item.imageUrl || "",
      dietaryTags: Array.isArray(item.dietaryTags) ? item.dietaryTags.join(", ") : "",
      isVisible: item.isVisible,
    });
    setEditingId(item.id);
    setPreviewImage(item.imageUrl || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    try {
      await deleteMenuItem(id);
      alert("Menu item deleted!");
      refetch();
    } catch (error) {
      alert("Failed to delete menu item");
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setEditingId(null);
    setPreviewImage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-1 h-fit sticky top-24">
        <div className="bg-card border border-border rounded-lg p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-medium">
              {editingId ? "Edit Menu Item" : "Add Menu Item"}
            </h3>
            {editingId && (
              <button
                onClick={handleCancel}
                className="text-sm text-muted-foreground hover:text-foreground"
                title="Cancel editing"
              >
                ✕
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Satvik Khichdi"
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Dish details and ingredients"
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
                required
              >
                <option value="starter">Starter</option>
                <option value="main">Main Course</option>
                <option value="side">Sides & Rotis</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium block mb-1">Portion *</label>
                <input
                  type="text"
                  value={form.portion}
                  onChange={(e) => setForm({ ...form, portion: e.target.value })}
                  placeholder="per bowl"
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Price *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => {
                  setForm({ ...form, imageUrl: e.target.value });
                  setPreviewImage(e.target.value);
                }}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
              />
              {previewImage && (
                <img
                  src={previewImage}
                  srcSet={`${previewImage} 400w`}
                  loading="lazy"
                  decoding="async"
                  alt="Preview"
                  className="w-full h-24 object-cover rounded mt-2"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Dietary Tags (comma-separated)</label>
              <input
                type="text"
                value={form.dietaryTags}
                onChange={(e) => setForm({ ...form, dietaryTags: e.target.value })}
                placeholder="gluten-free, vegan"
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="visible"
                checked={form.isVisible}
                onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="visible" className="text-sm font-medium">
                Visible on menu
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={creating || updating}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 disabled:opacity-50"
              >
                {creating || updating ? "Saving..." : editingId ? "Update Item" : "Add Item"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <h3 className="font-serif text-lg font-medium mb-6">Menu Items ({menuItems?.length || 0})</h3>

          {loading ? (
            <div className="text-center py-8">Loading menu items…</div>
          ) : !menuItems || menuItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No menu items yet. Create your first item!
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {menuItems.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 border border-border rounded bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <span className="text-muted-foreground">{item.portion}</span>
                        <span className="font-medium text-foreground">₹{item.price}</span>
                        {!item.isVisible && (
                          <span className="bg-destructive/10 text-destructive px-2 py-1 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-background rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting}
                        className="p-2 hover:bg-background rounded transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
