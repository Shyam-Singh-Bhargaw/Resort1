import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Plus, GripVertical, Eye, EyeOff } from "lucide-react";
import { useNavigation } from "@/hooks/useApi";
import {
  useCreateNavigationItem,
  useUpdateNavigationItem,
  useDeleteNavigationItem,
  useReorderNavigation,
} from "@/hooks/useApiMutation";

interface NavigationItem {
  id?: string;
  label: string;
  url: string;
  type: "link" | "button";
  order: number;
  is_visible: boolean;
  target?: string;
}

const initialForm: NavigationItem = {
  label: "",
  url: "",
  type: "link",
  order: 0,
  is_visible: true,
};

export function ManageNavigation() {
  const { data: navItems, loading, refetch } = useNavigation();
  const { mutate: createNavigationItem, loading: creating } = useCreateNavigationItem();
  const { mutate: updateNavigationItem, loading: updating } = useUpdateNavigationItem();
  const { mutate: deleteNavigationItem, loading: deleting } = useDeleteNavigationItem();
  const { mutate: reorderNavigation, loading: reordering } = useReorderNavigation();

  const [form, setForm] = useState<NavigationItem>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState<any[] | null>(null);

  useEffect(() => {
    refetch?.();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.label.trim() || !form.url.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Save snapshot for possible rollback
      if (navItems && navItems.length) setLastSnapshot(JSON.parse(JSON.stringify(navItems)));

      const payload = {
        label: form.label,
        url: form.url,
        type: form.type,
        is_visible: form.is_visible,
        target: form.target || "_self",
      };

      let res;
      if (editingId) {
        res = await updateNavigationItem({ id: editingId, data: payload } as any);
      } else {
        const maxOrder = Math.max(...(navItems || []).map((item: any) => item.order || 0), 0);
        res = await createNavigationItem({ ...payload, order: maxOrder + 1 } as any);
      }

      if (res) {
        setForm(initialForm);
        setEditingId(null);
        refetch?.();
        alert(editingId ? "Navigation item updated" : "Navigation item created");
      } else {
        alert("Failed to save navigation item");
      }
    } catch (err) {
      console.warn(err);
      alert("Error saving navigation item");
    }
  };

  const handleUndo = async () => {
    if (!lastSnapshot) {
      alert("Nothing to undo");
      return;
    }

    if (!confirm("Revert the last change to navigation?")) return;

    try {
      const current = navItems || [];
      const currentIds = new Set(current.map((i: any) => i.id));
      const snapIds = new Set(lastSnapshot.map((i: any) => i.id));

      // Delete newly created items (present now, not in snapshot)
      for (const item of current) {
        if (item.id && !snapIds.has(item.id)) {
          await deleteNavigationItem(item.id);
        }
      }

      // Restore or create snapshot items
      for (const s of lastSnapshot) {
        if (s.id && currentIds.has(s.id)) {
          await updateNavigationItem({ id: s.id, data: { label: s.label, url: s.url, type: s.type, is_visible: s.is_visible, target: s.target || '_self', order: s.order } } as any);
        } else {
          // Create missing item
          await createNavigationItem({ label: s.label, url: s.url, type: s.type, is_visible: s.is_visible, target: s.target || '_self', order: s.order } as any);
        }
      }

      // Ensure ordering
      await reorderNavigation(lastSnapshot as any);

      setLastSnapshot(null);
      refetch?.();
      alert('Reverted last change');
    } catch (err) {
      console.warn(err);
      alert('Undo failed');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this navigation item? This action cannot be undone.")) return;
    // Snapshot before deleting
    if (navItems && navItems.length) setLastSnapshot(JSON.parse(JSON.stringify(navItems)));
    const res = await deleteNavigationItem(id);
    if (res !== null) {
      refetch?.();
      alert("Navigation item deleted");
    } else {
      alert("Delete failed");
    }
  };

  const onEdit = (item: any) => {
    setForm(item);
    setEditingId(item.id);
  };

  const onToggleVisibility = async (item: any) => {
    try {
      // Save snapshot for possible rollback
      if (navItems && navItems.length) setLastSnapshot(JSON.parse(JSON.stringify(navItems)));

      await updateNavigationItem({
        id: item.id,
        data: { ...item, is_visible: !item.is_visible },
      } as any);
      refetch?.();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedItem || draggedItem === targetId || !navItems) return;

    const items = [...navItems];
    const draggedIndex = items.findIndex((item: any) => item.id === draggedItem);
    const targetIndex = items.findIndex((item: any) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Swap items
    [items[draggedIndex], items[targetIndex]] = [items[targetIndex], items[draggedIndex]];

    // Update order for all items
    items.forEach((item: any, index: number) => {
      item.order = index;
    });

    try {
      await reorderNavigation(items);
      refetch?.();
      setDraggedItem(null);
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-1 sticky top-24 h-fit">
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-lg p-6 shadow-soft space-y-4">
          <h3 className="font-medium text-lg mb-4">
            {editingId ? "Edit Navigation Item" : "Add Navigation Item"}
          </h3>

          <div>
            <label className="block text-sm font-medium mb-1">Label</label>
            <input
              id="nav-label"
              name="label"
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              aria-label="Navigation item label"
              title="Enter the display label for this navigation item"
              placeholder="e.g., Menu & Dining"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL/Link</label>
            <input
              id="nav-url"
              name="url"
              type="text"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              aria-label="Navigation item URL"
              title="Enter the link or page URL"
              placeholder="e.g., /dining or https://example.com"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              id="nav-type"
              name="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "link" | "button" })}
              aria-label="Navigation item type (link or button)"
              title="Choose whether this is a regular link or a button"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
            >
              <option value="link">Link</option>
              <option value="button">Button (like BOOK NOW)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Link Target</label>
            <select
              id="nav-target"
              name="target"
              value={form.target || "_self"}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              aria-label="Link target (open in same or new window)"
              title="Choose where the link opens"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
            >
              <option value="_self">Same window</option>
              <option value="_blank">New window</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="nav-visible"
              name="is_visible"
              type="checkbox"
              checked={form.is_visible}
              onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
              aria-label="Make this navigation item visible"
              title="Check to show this item in navigation"
              className="w-4 h-4"
            />
            <label htmlFor="nav-visible" className="text-sm font-medium">Visible on site</label>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="luxury"
              disabled={creating || updating}
              title={editingId ? "Update this navigation item" : "Create a new navigation item"}
              className="flex-1"
            >
              {creating || updating ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(initialForm);
                  setEditingId(null);
                }}
                title="Cancel editing"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Navigation Items List */}
      <div className="lg:col-span-2">
        <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-lg">Navigation Items</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                disabled={!lastSnapshot}
                title={lastSnapshot ? "Undo last change" : "No action to undo"}
              >
                Undo
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreview(!preview)}
                title={preview ? "Hide preview" : "Show live preview"}
              >
                {preview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading navigation...</div>
          ) : !navItems || navItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No navigation items yet. Create your first item above.
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-6">
                {(navItems || []).map((item: any) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(item.id)}
                    className="flex items-center gap-3 p-4 bg-muted border border-border rounded hover:bg-muted/80 transition-colors cursor-move group"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100" />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.label}
                        {!item.is_visible && <span className="ml-2 text-xs text-muted-foreground">(Hidden)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{item.url}</div>
                      <div className="text-xs text-muted-foreground">
                        Type: {item.type} • Order: {item.order}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleVisibility(item)}
                        className="p-2 hover:bg-background rounded transition-colors"
                        title={item.is_visible ? "Hide this item" : "Show this item"}
                        aria-label={item.is_visible ? `Hide ${item.label}` : `Show ${item.label}`}
                      >
                        {item.is_visible ? (
                          <Eye className="h-4 w-4 text-primary" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 hover:bg-background rounded transition-colors"
                        title={`Edit ${item.label}`}
                        aria-label={`Edit ${item.label}`}
                      >
                        <Edit2 className="h-4 w-4 text-foreground" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 hover:bg-background rounded transition-colors"
                        title={`Delete ${item.label}`}
                        aria-label={`Delete ${item.label}`}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {preview && (
                <div className="border-t border-border pt-6">
                  <h4 className="text-sm font-medium mb-3">Live Preview:</h4>
                  <div className="bg-background rounded border border-border p-4">
                    <nav className="flex flex-wrap items-center gap-1">
                      {(navItems || [])
                        .filter((item: any) => item.is_visible)
                        .map((item: any) => (
                          <div key={item.id} className="text-sm">
                            {item.type === "button" ? (
                              <button className="px-6 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">
                                {item.label}
                              </button>
                            ) : (
                              <a
                                href={item.url}
                                target={item.target || "_self"}
                                className="px-4 py-2 text-foreground hover:text-primary transition-colors uppercase text-xs"
                              >
                                {item.label}
                              </a>
                            )}
                          </div>
                        ))}
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
