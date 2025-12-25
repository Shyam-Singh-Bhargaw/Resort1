import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import CartDrawer from "@/components/ui/CartDrawer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  showStickyBooking?: boolean;
}

export function Layout({ children, showStickyBooking = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      {/* Sticky Book Now - Mobile Only */}
      {showStickyBooking && (
        <div className="sticky-book-btn">
          <Link to="/booking">
            <Button variant="luxury" size="lg" className="w-full">
              Book Your Sanctuary
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
