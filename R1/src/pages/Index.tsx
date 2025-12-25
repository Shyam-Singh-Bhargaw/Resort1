import React, { Suspense } from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy-load sections to catch module-level import errors and show visible fallbacks
const HeroSection = React.lazy(() => import("@/components/home/HeroSection").then(mod => ({ default: mod.HeroSection })));
const ExperiencesSection = React.lazy(() => import("@/components/home/ExperiencesSection").then(mod => ({ default: mod.ExperiencesSection })));
const RoomsSection = React.lazy(() => import("@/components/home/RoomsSection").then(mod => ({ default: mod.RoomsSection })));
const AboutSection = React.lazy(() => import("@/components/home/AboutSection").then(mod => ({ default: mod.AboutSection })));
const SeasonalOfferSection = React.lazy(() => import("@/components/home/SeasonalOfferSection").then(mod => ({ default: mod.SeasonalOfferSection })));
const TestimonialsSection = React.lazy(() => import("@/components/home/TestimonialsSection").then(mod => ({ default: mod.TestimonialsSection })));

/**
 * Wrapped with ErrorBoundary so individual section failures
 * are shown inline and won't crash the entire page.
 */
const Index = () => {
  return (
    <Layout>
      <Helmet>
        <title>Mud & Meadows – The Earthbound Sanctuary | Luxury Wellness Resort & Spa</title>
        <meta
          name="description"
          content="Experience transformative wellness at Mud & Meadows – The Earthbound Sanctuary. Award-winning holistic wellness, organic treatments, and luxury accommodations."
        />
      </Helmet>

      <Suspense fallback={<div style={{padding:20}}>Loading Hero...</div>}>
        <ErrorBoundary name="HeroSection">
          <HeroSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<div style={{padding:20}}>Loading Experiences...</div>}>
        <ErrorBoundary name="ExperiencesSection">
          <ExperiencesSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<div style={{padding:20}}>Loading Rooms...</div>}>
        <ErrorBoundary name="RoomsSection">
          <RoomsSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<div style={{padding:20}}>Loading About...</div>}>
        <ErrorBoundary name="AboutSection">
          <AboutSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<div style={{padding:20}}>Loading Seasonal Offer...</div>}>
        <ErrorBoundary name="SeasonalOfferSection">
          <SeasonalOfferSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<div style={{padding:20}}>Loading Testimonials...</div>}>
        <ErrorBoundary name="TestimonialsSection">
          <TestimonialsSection />
        </ErrorBoundary>
      </Suspense>
    </Layout>
  );
};

export default Index;
