import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Bed,
  Leaf,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  Image,
  Tag,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Menu as MenuIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useExperiences } from "@/hooks/useApi";
import { useCreateExperience, useUpdateExperience, useDeleteExperience, useUploadImage } from "@/hooks/useApiMutation";
import { cn } from "@/lib/utils";
import { ManageAccommodations } from "@/components/admin/ManageAccommodations";
import { ManageNavigation } from "@/components/admin/ManageNavigation";
import { CreateBookingModal } from "@/components/admin/CreateBookingModal";
import { CreateRoomModal } from "@/components/admin/CreateRoomModal";
import { CreateWellnessModal } from "@/components/admin/CreateWellnessModal";
import { CreateOfferModal } from "@/components/admin/CreateOfferModal";
import { AdminMenuPage } from "@/pages/AdminMenuPage";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Bed, label: "Rooms", href: "/admin/rooms" },
  { icon: Leaf, label: "Wellness Programs", href: "/admin/wellness" },
  { icon: CalendarDays, label: "Bookings", href: "/admin/bookings" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Tag, label: "Seasonal Offers", href: "/admin/offers" },
  { icon: Image, label: "Gallery", href: "/admin/gallery" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

// Mock data for dashboard
const stats = [
  { label: "Total Bookings", value: "156", change: "+12%", up: true },
  { label: "Occupancy Rate", value: "78%", change: "+5%", up: true },
  { label: "Revenue (MTD)", value: "$245,890", change: "+18%", up: true },
  { label: "Active Programs", value: "24", change: "+2", up: true },
];

const recentBookings = [
  { id: "AHS-001", guest: "Alexandra Sterling", room: "Garden Sanctuary Villa", checkIn: "Dec 15", status: "confirmed" },
  { id: "AHS-002", guest: "James Chen", room: "Premium Wellness Suite", checkIn: "Dec 16", status: "pending" },
  { id: "AHS-003", guest: "Marie Dubois", room: "Deluxe Valley View", checkIn: "Dec 18", status: "confirmed" },
  { id: "AHS-004", guest: "Robert Kim", room: "Royal Himalayan Pavilion", checkIn: "Dec 20", status: "confirmed" },
];

const AdminPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [isWellnessOpen, setIsWellnessOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted flex">      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="flex flex-col">
              <span className="font-serif text-xl font-medium text-sidebar-primary">
                Ananda
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase opacity-70">
                Admin Portal
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium">AD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs opacity-70">admin@mudandmeadows.com</p>
              </div>
              <button className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-background border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-muted rounded-lg lg:hidden"
                title={isSidebarOpen ? "Close menu" : "Open menu"}
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <h1 className="font-serif text-xl font-medium">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm focus:outline-none w-48"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-muted rounded-lg" title="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" aria-label="Unread notifications" />
              </button>

              {/* View Site */}
              <Link to="/">
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-background rounded-lg p-6 border border-border shadow-soft"
              >
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-serif font-medium">{stat.value}</span>
                  <span
                    className={cn(
                      "text-sm",
                      stat.up ? "text-wellness" : "text-destructive"
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Bookings */}
            <div className="lg:col-span-2 bg-background rounded-lg border border-border shadow-soft">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-serif text-lg font-medium">Recent Bookings</h2>
                <Link to="/admin/bookings">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">
                        Booking ID
                      </th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">
                        Guest
                      </th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">
                        Room
                      </th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">
                        Check-in
                      </th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border last:border-0">
                        <td className="p-4 text-sm font-medium">{booking.id}</td>
                        <td className="p-4 text-sm">{booking.guest}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {booking.room}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {booking.checkIn}
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              booking.status === "confirmed"
                                ? "bg-wellness/20 text-wellness"
                                : "bg-primary/20 text-primary"
                            )}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background rounded-lg border border-border shadow-soft p-6">
              <h2 className="font-serif text-lg font-medium mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button onClick={() => setIsBookingOpen(true)} className="w-full flex items-center justify-start rounded border border-border px-4 py-2 text-sm hover:bg-muted/80" title="Create a new booking" aria-haspopup="dialog" aria-controls="create-booking-modal">
                  <CalendarDays className="h-4 w-4 mr-3" />
                  Create New Booking
                </button>
                <button onClick={() => setIsRoomOpen(true)} className="w-full flex items-center justify-start rounded border border-border px-4 py-2 text-sm hover:bg-muted/80" title="Add a new room or accommodation" aria-haspopup="dialog" aria-controls="create-room-modal">
                  <Bed className="h-4 w-4 mr-3" />
                  Add New Room
                </button>
                <button onClick={() => setIsWellnessOpen(true)} className="w-full flex items-center justify-start rounded border border-border px-4 py-2 text-sm hover:bg-muted/80" title="Add a wellness program" aria-haspopup="dialog" aria-controls="create-wellness-modal">
                  <Leaf className="h-4 w-4 mr-3" />
                  Add Wellness Program
                </button>
                <button onClick={() => setIsOfferOpen(true)} className="w-full flex items-center justify-start rounded border border-border px-4 py-2 text-sm hover:bg-muted/80" title="Create a seasonal offer" aria-haspopup="dialog" aria-controls="create-offer-modal">
                  <Tag className="h-4 w-4 mr-3" />
                  Create Seasonal Offer
                </button>
                <Button variant="outline" className="w-full justify-start" title="View analytics dashboard">
                  <BarChart3 className="h-4 w-4 mr-3" />
                  View Analytics
                </Button>
              </div>
            </div>

            {/* Modal Instances */}
            <CreateBookingModal open={isBookingOpen} onOpenChange={setIsBookingOpen} />
            <CreateRoomModal open={isRoomOpen} onOpenChange={setIsRoomOpen} />
            <CreateWellnessModal open={isWellnessOpen} onOpenChange={setIsWellnessOpen} />
            <CreateOfferModal open={isOfferOpen} onOpenChange={setIsOfferOpen} />

          </div>

          {/* Manage Accommodations */}
          <div className="mt-8 bg-background rounded-lg border border-border shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-medium">Manage Accommodations</h2>
              <p className="text-sm text-muted-foreground">Add, edit or remove rooms, villas, and suites (stored in backend)</p>
            </div>
            <ManageAccommodations />
          </div>

          {/* Manage Navigation */}
          <div className="mt-8 bg-background rounded-lg border border-border shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-medium">Manage Navigation</h2>
              <p className="text-sm text-muted-foreground">Control site navigation: add tabs, buttons, reorder, hide/show items</p>
            </div>
            <ManageNavigation />
          </div>

          {/* Manage Experiences */}
          <div className="mt-8 bg-background rounded-lg border border-border shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-medium">Manage Experiences</h2>
              <p className="text-sm text-muted-foreground">Add, edit or remove wellness experiences (stored in backend)</p>
            </div>
            <ManageExperiences />
          </div>

          {/* Manage Menu Items */}
          <div className="mt-8 bg-background rounded-lg border border-border shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-medium">Manage Menu Items</h2>
              <p className="text-sm text-muted-foreground">Add, edit or remove menu items for the dining page</p>
            </div>
            <AdminMenuPage />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;

function ManageExperiences() {
  const { data: experiences, loading, refetch } = useExperiences();
  const { mutate: createExperience, loading: creating } = useCreateExperience();
  const { mutate: updateExperience, loading: updating } = useUpdateExperience();
  const { mutate: deleteExperience, loading: deleting } = useDeleteExperience();
  const { mutate: uploadImage, loading: uploading } = useUploadImage();
  const [form, setForm] = useState({ title: "", description: "", image: "", link: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    refetch?.();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      alert('Please provide title and description');
      return;
    }

    try {
      const payload = {
        name: form.title,
        description: form.description,
        image_url: form.image,
        link: form.link,
      };

      let res;
      if (editingId) {
        res = await updateExperience({ id: editingId, data: payload } as any);
      } else {
        res = await createExperience(payload as any);
      }
      if (res) {
        setForm({ title: "", description: "", image: "", link: "" });
        setEditingId(null);
        refetch?.();
        alert(editingId ? 'Experience updated' : 'Experience created');
      } else {
        alert('Failed to create experience');
      }
    } catch (err) {
      console.warn(err);
      alert('Error creating experience');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    const res = await deleteExperience(id);
    if (res !== null) {
      refetch?.();
      alert('Deleted');
    } else {
      alert('Delete failed');
    }
  };

  const onEdit = (exp: any) => {
    setEditingId(exp.id);
    setForm({ title: exp.name || exp.title, description: exp.description || '', image: exp.image_url || exp.image || '', link: exp.link || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onFileChange = async (file?: File | null) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await uploadImage(fd);
    if (res && res.url) {
      setForm(prev => ({ ...prev, image: res.url }));
      alert('Image uploaded');
    } else {
      alert('Image upload failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {loading && <div>Loading experiences…</div>}
          {!loading && (!experiences || experiences.length === 0) && (
            <div className="p-4 bg-muted rounded">No experiences found. Add one using the form.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(experiences || []).map((exp: any) => (
              <div key={exp.id || exp.title} className="p-4 border border-border rounded bg-background">
                <div className="flex items-start gap-3">
                  <img
                    src={exp.image || exp.image_url}
                    srcSet={(exp.image || exp.image_url) ? `${exp.image || exp.image_url} 400w` : undefined}
                    loading="lazy"
                    decoding="async"
                    alt={exp.name || exp.title}
                    className="w-20 h-14 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{exp.name || exp.title}</h3>
                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                    <div className="mt-2 text-xs flex gap-3">
                      <a href={exp.link || '#'} target="_blank" rel="noreferrer" className="text-primary" title={`Open ${exp.name || 'link'}`}>Open</a>
                      <button onClick={() => onEdit(exp)} className="text-xs text-muted-foreground underline" title={`Edit ${exp.name || 'experience'}`}>Edit</button>
                      <button onClick={() => onDelete(exp.id)} className="text-xs text-destructive underline" title={`Delete ${exp.name || 'experience'}`}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-4 border border-border rounded bg-card">
        <h3 className="font-medium mb-3">Create Experience</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded" rows={4} />
          </div>
          <div>
            <label className="text-sm block mb-1">Image URL</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2 border rounded mb-2" />
            <div className="text-xs text-muted-foreground mb-2">Or upload a file</div>
            <input type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
            {uploading && <div className="text-xs">Uploading...</div>}
          </div>
          <div>
            <label className="text-sm block mb-1">Link</label>
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="luxury" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={() => setForm({ title: "", description: "", image: "", link: "" })}>Reset</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
