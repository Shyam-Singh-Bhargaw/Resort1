import React, { Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookingProvider } from "@/context/BookingContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
// Lazy-load route pages to reduce initial bundle size and improve performance
const Index = React.lazy(() => import("./pages/Index"));
const RoomsPage = React.lazy(() => import("./pages/RoomsPage"));
const RoomDetailPage = React.lazy(() => import("./pages/RoomDetailPage"));
const ProgramsWellnessPage = React.lazy(() => import("./pages/ProgramsWellnessPage"));
const ProgramsActivitiesPage = React.lazy(() => import("./pages/ProgramsActivitiesPage"));
const DiningPage = React.lazy(() => import("./pages/DiningPage"));
const BookingPage = React.lazy(() => import("./pages/BookingPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const AuthComplete = React.lazy(() => import("./pages/AuthComplete"));
const MyBookingsPage = React.lazy(() => import("./pages/MyBookingsPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const GalleryPage = React.lazy(() => import("./pages/GalleryPage"));
const PackagesPage = React.lazy(() => import("./pages/PackagesPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Simple ErrorBoundary to avoid white-screen on render errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // send to logging system if available
    // console.error allows dev to see stack in console
    console.error("Uncaught error in app:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, background: "#fff", color: "#000", minHeight: "100vh", boxSizing: "border-box" }}>
          <h2 style={{ marginTop: 0 }}>Application error</h2>
          <pre style={{ whiteSpace: "pre-wrap", maxHeight: 360, overflow: "auto" }}>
            {String(this.state.error)}
          </pre>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => window.location.reload()} style={{ padding: "8px 12px" }}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [status, setStatus] = useState<{ alive: boolean; firstError?: string; ua: string }>({
    alive: false,
    firstError: undefined,
    ua: navigator.userAgent,
  });

  useEffect(() => {
    // ensure document/root visible and default styles so nothing is hidden by CSS
    try {
      document.documentElement.style.background = "#fafafa";
      document.body.style.background = "#fafafa";
      document.body.style.color = "#111";
      document.body.style.margin = "0";
      const root = document.getElementById("root") || document.getElementById("app") || null;
      if (root) {
        (root as HTMLElement).style.display = "block";
        (root as HTMLElement).style.minHeight = "100vh";
      }
    } catch (e) {
      // ignore
    }

    // mark alive synchronously so UI cannot be blank
    setStatus(s => ({ ...s, alive: true }));

    // remove any early splash element if present (some frameworks add it)
    try {
      // remove our own app-splash if present shortly after mount
      requestAnimationFrame(() => {
        const splash = document.getElementById("app-splash");
        if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
      });
    } catch {}

    // global handlers
    const onErr = (ev: ErrorEvent | any) => {
      console.error("Global onerror", ev);
      setStatus(s => ({ ...s, firstError: s.firstError || (ev?.message ? String(ev.message) : String(ev)) }));
    };
    const onRej = (ev: PromiseRejectionEvent | any) => {
      console.error("Unhandled rejection", ev);
      const msg = ev?.reason ? (typeof ev.reason === "string" ? ev.reason : JSON.stringify(ev.reason)) : String(ev);
      setStatus(s => ({ ...s, firstError: s.firstError || msg }));
    };

    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);

    console.log("DEBUG: App mounted (useEffect)");

    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BookingProvider>
            <Toaster />
            <Sonner />

          {/* DEBUG BANNER */}
          <div style={{ position: "fixed", top: 8, right: 8, zIndex: 2147483647, background: "#fffb", padding: "6px 10px", borderRadius: 6, border: "1px solid #f0c", color: "#000", fontSize: 12 }}>
            DEBUG: App mounted
          </div>

          {/* Visible status overlay so the screen is never blank and we can see errors quickly */}
          <div role="status" aria-live="polite" style={{ position: "fixed", left: 12, bottom: 12, zIndex: 2147483646, background: "#111", color: "#fff", padding: "8px 10px", borderRadius: 6, fontSize: 12, opacity: 0.95 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{status.alive ? "App running" : "App starting"}</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>UA: {status.ua}</div>
            {status.firstError ? (
              <div style={{ marginTop: 8, color: "#ffb3b3", maxWidth: 360, wordBreak: "break-word" }}>
                <strong>Error:</strong> {status.firstError}
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => window.location.reload()} style={{ padding: "6px 8px", fontSize: 12 }}>Reload</button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Wrap app with ErrorBoundary + Suspense to avoid blank screens */}
          <ErrorBoundary>
            <Suspense fallback={
              <div style={{ padding: 20 }}>
                <strong>Loading app…</strong>
              </div>
            }>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/rooms" element={<RoomsPage />} />
                  <Route path="/rooms/:id" element={<RoomDetailPage />} />
                  {/* Compatibility: `/cottages` is an older path used by some links — redirect to `/rooms` */}
                  <Route path="/cottages" element={<Navigate to="/rooms" replace />} />
                  <Route path="/programs/wellness" element={<ProgramsWellnessPage />} />
                  <Route path="/programs/activities" element={<ProgramsActivitiesPage />} />
                  <Route path="/dining" element={<DiningPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/packages" element={<PackagesPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth/complete" element={<AuthComplete />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  {/* Admin routes removed from customer-facing frontend */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </Suspense>
          </ErrorBoundary>
          </BookingProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
