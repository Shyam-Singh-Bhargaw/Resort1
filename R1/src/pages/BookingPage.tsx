/*
# 🔥 GitHub Copilot Prompt — Rebuild Booking System (World-Class Resort UX)

## CONTEXT (READ CAREFULLY)

The current booking flow is **broken, incomplete, and not production-ready**.

Issues observed:

* Runtime errors (e.g. `QuantityButton is not defined`)
* Fragmented logic
* Missing UX fundamentals
* No strong mental model
* Booking does NOT feel premium or reliable

Your task is to **REBUILD the booking system logic and UX from first principles**, inspired by **Flipkart + Airbnb + MakeMyTrip**, but customized for a **luxury resort website**.

This booking flow must feel:

* Effortless
* Predictable
* Transparent
* Premium
* Impossible to misuse

---

## 🎯 CORE GOAL

Build the **best resort booking experience possible**, with:

* Zero confusion
* Zero hidden logic
* Zero broken states
* Full admin control
* Maximum user trust

---

## 🧠 FUNDAMENTAL MENTAL MODEL (DO NOT VIOLATE)

> “Users buy ROOMS like products.
> Capacity, pricing, and availability update instantly.
> Admin rules are absolute.
> User intent is respected.”

---

## 🧭 BOOKING FLOW (STRICT — NO SHORTCUTS)

### STEP 1 — Intent Collection (Lightweight)

Purpose: **Understand what the user wants**, not enforce capacity.

Must contain:

1. Check-in date
2. Check-out date
3. Guest count (intent only)
4. Extra bedding intent (checkbox only)

Rules:

* Guest count does NOT allocate rooms
* No pricing here
* No validation beyond date sanity
* CTA → **“Next: Select Cottages”**

---

### STEP 2 — Cottage & Room Selection (Core Engine)

This step is the **heart of the system**.

---

## 🏡 COTTAGE DISPLAY (HORIZONTAL, PREMIUM)

Each cottage card MUST show:

* High-quality image (real data, no placeholders)
* Cottage name
* ₹ price per night
* Capacity per room (e.g. “2 guests / room”)
* Availability badge
* Select checkbox

---

## ➕➖ ROOM QUANTITY (FLIPKART EXACT BEHAVIOR)

When a cottage is selected, show:

```
Rooms   [ – ]   X   [ + ]
```

Rules:

* * adds exactly **1 room**
* – removes exactly **1 room**
* Minimum = 0
* Maximum = available rooms
* NO numeric inputs
* NO free typing
* State must NEVER go negative

Each click must:

* Update total rooms
* Update total guests
* Update total price
* Update summary panel
* Revalidate capacity

---

## 🛏 EXTRA BEDDING (ADMIN-DRIVEN)

User sees:
☐ Add extra bedding

Behind the scenes:

* Admin defines:

  * maxExtraBeds per cottage
  * pricePerExtraBed
  * extraCapacityPerBed
* User never sees quantity
* Capacity + price update automatically
* Disabled if admin disallows

---

## 🤖 AUTO-ALLOCATION (SMART, NOT AGGRESSIVE)

If user does NOT manually select cottages:

* Auto-select best matching cottage
* Calculate:

```
requiredRooms = ceil(guestCount / roomCapacity)
```

Rules:

* Auto-selection must be:

  * Visible
  * Editable
  * Reversible
* Never lock user

---

## ⚠️ CAPACITY VALIDATION (NO AUTO FIXING)

If total capacity < guest intent:

* Block proceeding
* Show clear warning:

> “Selected rooms cannot accommodate all guests.
> Please add rooms or choose another cottage.”

Rules:

* DO NOT auto-add rooms
* DO NOT auto-add cottages
* User must decide

---

## 🧾 SUMMARY PANEL (RIGHT SIDE — CRITICAL)

This panel builds **trust**.

For EACH selected cottage:

* Cottage image thumbnail
* Cottage name
* Rooms selected
* Guests accommodated

Also show:

* Total guests
* Check-in / Check-out
* Nights
* Price breakdown

---

## 💰 PRICING (INDIA-ONLY)

Rules:

* Currency = **₹ INR ONLY**
* Format like:

  * ₹12,000 / night
  * ₹4,79,080 total
* Taxes shown clearly (e.g. 18%)
* No USD anywhere
* No math hidden

---

## 🧠 UX PRINCIPLES (NON-NEGOTIABLE)

* No surprise behavior
* No silent auto-changes
* Every action gives instant feedback
* Errors are human-readable
* Disable impossible actions
* Loading states everywhere needed
* Booking must feel **safe**

---

## 🛡 ENGINEERING REQUIREMENTS

You MUST:

* Remove undefined components
* Replace ad-hoc logic with deterministic functions
* Centralize booking state
* Use derived state (not duplicated state)
* Prevent runtime crashes at all costs

Booking state must be:

* Predictable
* Serializable
* Debuggable

---

## ❌ DO NOT DO

* ❌ Do not assume quantities
* ❌ Do not hardcode prices
* ❌ Do not auto-fix capacity
* ❌ Do not allow invalid states
* ❌ Do not show placeholders in summary
* ❌ Do not mix beds with rooms

---

## 🏆 FINAL OUTCOME

After implementation:

* Booking feels as smooth as Flipkart
* As trustworthy as MakeMyTrip
* As premium as Airbnb Luxe
* As robust as an enterprise app

---

## 🔚 YOUR TASK

Refactor and enhance the booking system so that:

* It **never crashes**
* It **never confuses**
* It **never lies**
* It **always feels premium**

Start with:

1. Fixing broken components
2. Rebuilding booking logic
3. Enforcing the mental model
4. Improving UX step-by-step

---
Perfect. I’ll **go all-in as a top-1% product engineer** and give you **actionable, copy-paste-ready fixes + architecture**, not vague advice.

You currently have **3 problems**:

1. ❌ Booking logic is fragmented
2. ❌ UI components are referenced but not defined (`QuantityButton`)
3. ❌ No single source of truth → crashes & inconsistent state

Below is the **correct way** to build a **Flipkart-level booking engine** for a **premium resort**.

---
*/

import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
// local data removed: front-end uses backend APIs only
import { 
  Calendar, Users, Clock, Check, ArrowLeft, ArrowRight,
  CreditCard, User, Mail, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import suiteImage from "@/assets/luxury-suite.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";
import QuantityButton from "@/components/ui/QuantityButton";
import { useAccommodations, useExperiences, useWellness, useCottages, useAllExtraBeds } from "@/hooks/useApi";
import { useCreateApiBooking, useCreateGuestProfile, useSendBookingConfirmation, useCreateTransaction } from "@/hooks/useApiMutation";

type Step = 1 | 2 | 3 | 4;

const steps = [
  { number: 1, label: "Select Dates" },
  { number: 2, label: "Guest Details" },
  { number: 3, label: "Payment" },
  { number: 4, label: "Confirmation" },
];

type Accommodation = {
  id: string;
  title?: string;
  name?: string;
  media?: unknown[];
  images?: unknown[];
  image?: string;
  price_per_night?: number;
  basePrice?: number;
  price?: number;
  capacity?: number;
  capacity_max?: number;
  maxGuests?: number;
  available?: boolean;
  available_rooms?: number;
  availableRooms?: number;
  extra_beds?: number;
  extraBedding?: number;
  extra_bedding?: number | boolean | null;
  extra_bedding_price?: number;
  allowExtraBed?: boolean;
  maxExtraBeds?: number;
};

type SelectedCottage = {
  id: string;
  rooms: number;
  extraBed: boolean;
  manual?: boolean;
  // optional explicit room ids selected by user (room-level selection)
  roomIds?: string[];
};

type Program = {
  id: string;
  title?: string;
  description?: string;
  image_url?: string;
  duration_days?: number;
  tags?: string[];
  location?: string;
  price?: number;
  is_included?: boolean;
};

type SelectedProgram = {
  programId: string;
  quantity: number;
};

type BookingFormData = {
  checkIn: string;
  checkOut: string;
  guests: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  paymentMethod: 'card' | 'upi';
  upiVpa: string;
  // extra bedding is now per-cottage; no global flag here
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room");
  const extraBedsParam = searchParams.get("extraBeds");
  const extraBedIdParam = searchParams.get("extraBedId");
  const extraBedQtyParam = searchParams.get("extraBedQty");
  
  // Fetch accommodations from API
  const { data: accommodations, loading: accommodationsLoading } = useCottages();
  const { data: experiences } = useExperiences();
  const { data: wellnessServices } = useWellness();
  
  // Use mutation hooks for creating bookings, profiles and sending email
  const { mutate: createBooking, loading: bookingLoading } = useCreateApiBooking();
  const { mutate: createGuestProfile } = useCreateGuestProfile();
  const { mutate: sendBookingConfirmation } = useSendBookingConfirmation();
  const { mutate: createTransaction } = useCreateTransaction();
  
  const selectedRoom = (accommodations?.find((r: Accommodation) => String(r.id) === String(roomId)) || (accommodations && accommodations.length > 0 ? accommodations[0] : null)) || null;
  const getBasePrice = (r?: Accommodation) => r?.basePrice ?? r?.price_per_night ?? r?.price ?? 0;
  // selectedCottages: structured array to support per-cottage rooms and extraBed
  const [selectedCottages, setSelectedCottages] = React.useState<SelectedCottage[]>(() => []);

  // If a specific room id was passed in the query params (e.g. ?room=<roomId>), map it to a structured
  // selection that uses explicit room ids so the booking payload sends room ids (which the backend expects).
  React.useEffect(() => {
    if (!roomId || !accommodations) return;
    // Do not override manual selections
    if (selectedCottages && selectedCottages.length > 0 && selectedCottages.some(sc => sc.manual)) return;
    for (const acc of accommodations) {
      const found = (acc.rooms || []).find((r: any) => String(r.id) === String(roomId));
      if (found) {
        setSelectedCottages([{ id: String(acc.id), rooms: 1, extraBed: false, manual: true, roomIds: [String(roomId)] }]);
        // ensure guest count at least matches the room capacity
        setBookingData(b => ({ ...b, guests: Math.max(Number(b.guests || 1), Number(found.capacity || 1)) }));
        break;
      }
    }
  }, [roomId, accommodations, selectedCottages]);

  // selected wellness programs (per-booking add-ons)
  const [selectedPrograms, setSelectedPrograms] = React.useState<SelectedProgram[]>(() => []);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [capacityOk, setCapacityOk] = React.useState<boolean>(true);
  const [capacityMessage, setCapacityMessage] = React.useState<string | null>(null);

  
  const [bookingData, setBookingData] = useState<BookingFormData>({
    checkIn: "",
    checkOut: "",
    // allow numeric or special 'entire' value
    guests: 1 as number | string,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    // payment fields
    paymentMethod: 'card',
    upiVpa: '',
  });

  const nights = React.useMemo(() => {
    try {
      if (!bookingData.checkIn || !bookingData.checkOut) return 0;
      const a = new Date(bookingData.checkIn);
      const b = new Date(bookingData.checkOut);
      const diff = Math.max(0, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
      return diff;
    } catch (e) {
      return 0;
    }
  }, [bookingData.checkIn, bookingData.checkOut]);

  const totalGuests = React.useMemo(() => {
    return selectedCottages.reduce((sum, c) => {
      const cap = (() => {
        const info = (accommodations || []).find((x: Accommodation) => String(x.id) === String(c.id));
        return Number(info?.capacity ?? info?.capacity_max ?? info?.maxGuests ?? 1);
      })();
      const roomGuests = c.rooms * cap;
      const extra = c.extraBed ? 1 : 0;
      return sum + roomGuests + extra;
    }, 0);
  }, [selectedCottages, accommodations]);

  const totalPrice = React.useMemo(() => {
    const roomsSum = selectedCottages.reduce((sum, sc) => {
      const info = (accommodations || []).find((x: Accommodation) => String(x.id) === String(sc.id));
      const price = getBasePrice(info as Accommodation) || 0;
      return sum + sc.rooms * price * (nights || 1);
    }, 0);
    const extraBedsSum = selectedCottages.reduce((sum, sc) => {
      const info = (accommodations || []).find((x: Accommodation) => String(x.id) === String(sc.id));
      const ebPrice = Number(info?.extra_bedding_price ?? 0);
      return sum + (sc.extraBed ? ebPrice * (nights || 1) : 0);
    }, 0);
    // programs sum
    const programsSum = (selectedPrograms || []).reduce((s, sp) => {
      const p = (wellnessServices || []).find((w: Program) => String(w.id) === String(sp.programId));
      const price = Number(p?.price ?? 0);
      return s + price * sp.quantity;
    }, 0);

    return roomsSum + extraBedsSum + programsSum;
  }, [selectedCottages, accommodations, nights, wellnessServices, selectedPrograms]);

  // Live capacity validation (updates whenever selection, accommodations or guest count changes)
  React.useEffect(() => {
    const guestsNeeded = typeof bookingData.guests === 'string' && bookingData.guests === 'entire' ? 1 : Number(bookingData.guests || 1);
    const totalCap = (selectedCottages || []).reduce((s, sc) => {
      const cInfo = (accommodations || []).find((c: Accommodation) => String(c.id) === String(sc.id));
      const cap = Number(cInfo?.capacity || cInfo?.capacity_max || cInfo?.maxGuests || 1);
      const extra = sc.extraBed ? 1 : 0;
      return s + (sc.rooms || 0) * cap + extra;
    }, 0);
    if (totalCap < guestsNeeded) {
      setCapacityOk(false);
      setCapacityMessage('⚠️ Selected rooms do not accommodate all guests. Please add more rooms or select another cottage.');
    } else {
      setCapacityOk(true);
      setCapacityMessage(null);
    }
  }, [selectedCottages, accommodations, bookingData.guests]);

  const handleNext = async () => {
    // Step 1 validations: dates and guests
    if (currentStep === 1) {
      if (!bookingData.checkIn || !bookingData.checkOut) {
        alert('Please select both check-in and check-out dates.');
        return;
      }
      const inDate = new Date(bookingData.checkIn);
      const outDate = new Date(bookingData.checkOut);
      if (isNaN(inDate.getTime()) || isNaN(outDate.getTime()) || outDate <= inDate) {
        alert('Please provide valid check-in and check-out dates (check-out must be after check-in).');
        return;
      }
      if (!bookingData.guests) {
        alert('Please select number of guests.');
        return;
      }

      // If user hasn't manually selected cottages, perform auto-allocation per spec
      let localSelected = selectedCottages || [];
      if (!localSelected || localSelected.length === 0) {
        const guestsNeededLocal = typeof bookingData.guests === 'string' && bookingData.guests === 'entire' ? 1 : Number(bookingData.guests || 1);
        const list = (accommodations || []).filter((c: Accommodation) => c.available !== false).map((c: Accommodation) => ({ id: c.id, cap: Number(c.capacity || c.capacity_max || c.maxGuests || 1) }));
        if (list.length > 0) {
          const best = list.sort((a, b) => b.cap - a.cap)[0];
          const roomsNeeded = Math.max(1, Math.ceil(guestsNeededLocal / Math.max(Number(best.cap || 1), 1)));
          localSelected = [{ id: String(best.id), rooms: roomsNeeded, extraBed: false, manual: false }];
          // update state to reflect auto allocation
          setSelectedCottages(localSelected);
        }
      }

      // After auto-allocation or manual selection, verify capacity
      const totalCapacity = (localSelected || []).reduce((s, sc) => {
        const cInfo = (accommodations || []).find((c: Accommodation) => String(c.id) === String(sc.id));
        const cap = Number(cInfo?.capacity || cInfo?.capacity_max || cInfo?.maxGuests || 1);
        const extra = sc.extraBed ? 1 : 0;
        return s + (sc.rooms || 0) * cap + extra;
      }, 0);
      const guestsNeeded = typeof bookingData.guests === 'string' && bookingData.guests === 'entire' ? 1 : Number(bookingData.guests || 1);
      if (totalCapacity < guestsNeeded) {
        alert('Selected rooms do not accommodate all guests. Please add more rooms or select another cottage.');
        return;
      }

      setCurrentStep(2);
      return;
    }

    // Step 2 validations: make all guest fields mandatory
    if (currentStep === 2) {
      const { firstName, lastName, email, phone } = bookingData;
      if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim()) {
        alert('Please complete all required guest information fields.');
        return;
      }
      setCurrentStep(3);
      return;
    }

    // Step 3: call API to create booking, then create guest profile and send confirmation email
    if (currentStep === 3) {
      try {
        const nights = bookingData.checkIn && bookingData.checkOut
          ? Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        const subtotal = getBasePrice(selectedRoom) * Math.max(nights, 1);
        const tax = subtotal * 0.18;
        const totalPrice = subtotal + tax;

        // Determine cottages to book from structured selection (expand per-room)
        const guestsNeeded = typeof bookingData.guests === 'string' && bookingData.guests === 'entire' ? 1 : Number(bookingData.guests || 1);
        const cottagesToBook: string[] = [];
        // If the selection contains explicit room ids (room-level selection), use them directly.
        // Otherwise expand structured accommodation selections into room ids by picking available
        // room docs from the accommodation object on the frontend.
        if (selectedCottages && selectedCottages.length > 0) {
          for (const sc of selectedCottages) {
            if (sc.roomIds && sc.roomIds.length > 0) {
              for (const rid of sc.roomIds) cottagesToBook.push(String(rid));
            } else {
              // map accommodation -> its rooms and pick the first N room ids
              const acc = (accommodations || []).find((a: any) => String(a.id) === String(sc.id));
              if (acc && Array.isArray(acc.rooms) && acc.rooms.length > 0) {
                for (let i = 0; i < (sc.rooms || 0); i++) {
                  const roomDoc = acc.rooms[i];
                  if (roomDoc && roomDoc.id) cottagesToBook.push(String(roomDoc.id));
                }
                // If not enough rooms on the accommodation doc, fill with accommodation id as a fallback (backend will validate)
                while (cottagesToBook.length < (sc.rooms || 0)) {
                  cottagesToBook.push(String(sc.id));
                }
              } else {
                // No room docs available on the accommodation; fall back to previous behaviour
                for (let i = 0; i < (sc.rooms || 0); i++) cottagesToBook.push(String(sc.id));
              }
            }
          }
        }

        // compute current summed capacity of selected cottages
        const list = (accommodations || []).map((c: Accommodation) => ({ id: c.id, cap: Number(c.capacity || c.capacity_max || c.maxGuests || 1), available: c.available !== false, extraBedPrice: Number(c.extra_bedding_price ?? 0) }));
        let sum = cottagesToBook.reduce((s, id) => {
          const found = list.find((x) => String(x.id) === String(id));
          return s + (found ? found.cap : 0);
        }, 0);

        // If capacity still insufficient, auto-add rooms (do not auto-add cottages when user manually reduced earlier during flow)
        if (sum < guestsNeeded) {
          const availableList = list.filter((c) => c.available && !cottagesToBook.includes(c.id)).sort((a, b) => b.cap - a.cap);
          for (const c of availableList) {
            cottagesToBook.push(c.id);
            sum += c.cap;
            if (sum >= guestsNeeded) break;
          }
        }

        const totalAvailableExtras = (selectedCottages || []).reduce((s, sc) => {
          const cInfo = (accommodations || []).find((c: Accommodation) => String(c.id) === String(sc.id));
          const avail = typeof cInfo?.extra_bedding === 'number' ? cInfo.extra_bedding : (cInfo?.extra_beds ?? cInfo?.extraBedding ?? 0);
          return s + (Number(avail) || 0);
        }, 0);
        const requestedPerCottage = (selectedCottages || []).reduce((s, sc) => s + (sc.extraBed ? 1 : 0), 0);
        // Global extra bedding removed — only per-cottage selections count
        const totalRequested = requestedPerCottage;
        const allowedExtraBeds = Math.min(totalRequested, totalAvailableExtras);

        // Build a per-cottage extra bed map so backend can snapshot which cottages requested an extra bed
        const perCottageExtraBeds: Record<string, number> = {};
        let totalRequestedExtraBeds = 0;
        if (selectedCottages && selectedCottages.length > 0) {
          for (const sc of selectedCottages) {
            if (sc.extraBed) {
              // prefer explicit room ids if present
              const key = sc.roomIds && sc.roomIds.length > 0 ? sc.roomIds[0] : sc.id;
              perCottageExtraBeds[String(key)] = (perCottageExtraBeds[String(key)] || 0) + 1;
              totalRequestedExtraBeds += 1;
            }
          }
        }

        const payload = {
          guest_name: `${bookingData.firstName} ${bookingData.lastName}`.trim(),
          guest_email: bookingData.email,
          guest_phone: bookingData.phone,
          // API expects `selected_cottages` (compat) and `allow_extra_beds` flag
          selected_cottages: cottagesToBook,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          total_price: totalPrice,
          guests: Number(bookingData.guests || 1),
          // include both a per-cottage mapping and a total qty for compatibility
          allow_extra_beds: totalRequestedExtraBeds > 0,
          extra_beds_qty: totalRequestedExtraBeds,
          extra_beds_map: perCottageExtraBeds,
          special_requests: bookingData.specialRequests,
          payment_method: bookingData.paymentMethod,
          // include selected wellness programs
          selected_programs: (selectedPrograms || []).map(sp => {
            const p = (wellnessServices || []).find((w: Program) => String(w.id) === String(sp.programId));
            const price = Number(p?.price ?? 0);
            return { program_id: sp.programId, quantity: sp.quantity, total_price: price * sp.quantity };
          }),
        };
        // compatibility: include explicit extra bed id/quantity if provided via query or modal
        if (extraBedIdParam) {
          (payload as any).extraBedId = extraBedIdParam;
          (payload as any).extraBedQuantity = Number(extraBedQtyParam || 1);
        }

        const result: unknown = await createBooking(payload as unknown as Record<string, unknown>);
        if (result && (result as Record<string, unknown>)['id']) {
          const bookingId = String((result as Record<string, unknown>)['id']);
          // create guest/profile in backend for admin
          try {
            await createGuestProfile({
              first_name: bookingData.firstName,
              last_name: bookingData.lastName,
              email: bookingData.email,
              phone: bookingData.phone,
              source: 'booking',
            });
          } catch (err) {
            // non-blocking: log and continue
            console.warn('Failed to create guest profile', err);
          }

          // trigger confirmation email via backend endpoint
            try {
            await sendBookingConfirmation({ bookingId, data: { email: bookingData.email } });
          } catch (err) {
            console.warn('Failed to send confirmation email', err);
          }

          // If payment method is UPI, create a transaction record (status pending)
          try {
            if (bookingData.paymentMethod === 'upi') {
              const nights = bookingData.checkIn && bookingData.checkOut
                ? Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
                : 0;
              const subtotal = (selectedRoom?.basePrice || 0) * Math.max(nights, 1);
              const tax = subtotal * 0.18;
              const totalAmount = subtotal + tax;

              try {
                await createTransaction({
                  booking_id: bookingId,
                  amount: totalAmount,
                  currency: 'INR',
                  method: 'upi',
                  vpa: bookingData.upiVpa,
                  status: 'pending',
                });
                alert('A transaction record has been created. Please complete the UPI payment using your app.');
              } catch (err) {
                console.warn('Failed to create transaction record', err);
              }
            }
          } catch (err) {
            console.warn('Transaction handling error', err);
          }

          setCurrentStep(4);
        } else {
          alert('Failed to create booking. Please try again.');
        }
      } catch (err) {
        alert('An error occurred while creating the booking.');
      }
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  return (
    <Layout showStickyBooking={false}>
      {/* Header */}
      <section className="pt-24 pb-8 bg-warm">
        <div className="container-padding max-w-5xl mx-auto">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Rooms</span>
          </Link>
          
          <h1 className="font-serif text-3xl md:text-4xl font-medium">
            Complete Your Reservation
          </h1>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-6 border-b border-border bg-background">
        <div className="container-padding max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      currentStep >= step.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm hidden md:block",
                      currentStep >= step.number
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 md:w-16 h-px mx-2 md:mx-4",
                      currentStep > step.number ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-padding max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <StepDates
                  bookingData={bookingData}
                  setBookingData={setBookingData}
                  accommodations={accommodations}
                  selectedCottages={selectedCottages}
                  setSelectedCottages={setSelectedCottages}
                  capacityMessage={capacityMessage}
                  capacityOk={capacityOk}
                  wellnessServices={wellnessServices}
                  selectedPrograms={selectedPrograms}
                  setSelectedPrograms={setSelectedPrograms}
                />
              )}

              {currentStep === 2 && (
                <StepGuest
                  bookingData={bookingData}
                  setBookingData={(data: BookingFormData) => setBookingData(data)}
                  accommodations={accommodations}
                  selectedCottages={selectedCottages}
                  setSelectedCottages={setSelectedCottages}
                />
              )}

              {currentStep === 3 && (
                <StepPayment bookingData={bookingData} setBookingData={(data: BookingFormData) => setBookingData(data)} selectedRoom={selectedRoom} />
              )}

              {currentStep === 4 && <StepConfirmation />}

              <div className="mt-6 flex items-center gap-3">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>Back</Button>
                <Button onClick={handleNext} disabled={currentStep === 1 && !capacityOk}>{currentStep === 3 ? 'Confirm & Pay' : 'Next'}</Button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <BookingSummary room={selectedRoom} bookingData={bookingData} selectedCottages={selectedCottages} accommodations={accommodations} wellnessServices={wellnessServices} selectedPrograms={selectedPrograms} extraBedId={extraBedIdParam} extraBedQty={extraBedQtyParam ? Number(extraBedQtyParam) : 0} />
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
};

// Helper: format number to Indian Rupee format (₹ with Indian grouping)
function formatINR(amount: number) {
  if (!amount && amount !== 0) return '₹0';
  const sign = amount < 0 ? '-' : '';
  const n = Math.abs(Math.round(amount));
  const s = n.toString();
  const last3 = s.slice(-3);
  const other = s.slice(0, -3);
  const res = other ? other.replace(/\B(?=(?:\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  return `${sign}₹${res}`;
}

/* Additional helper components below */

type StepDatesProps = {
  bookingData: BookingFormData;
  setBookingData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  accommodations?: Accommodation[];
  selectedCottages: SelectedCottage[];
  setSelectedCottages: React.Dispatch<React.SetStateAction<SelectedCottage[]>>;
  capacityMessage: string | null;
  capacityOk: boolean;
  wellnessServices?: Program[];
  selectedPrograms: SelectedProgram[];
  setSelectedPrograms: React.Dispatch<React.SetStateAction<SelectedProgram[]>>;
};

function StepDates({ bookingData, setBookingData, accommodations, selectedCottages, setSelectedCottages, capacityMessage, capacityOk, wellnessServices, selectedPrograms, setSelectedPrograms }: StepDatesProps) {
  const maxGuests = 100;
  const [userInteracted, setUserInteracted] = React.useState(false);

  React.useEffect(() => {
    if (userInteracted) return;
    if ((selectedCottages || []).length > 0) return;
    const guestsNeededLocal = typeof bookingData.guests === 'string' && bookingData.guests === 'entire' ? 1 : Number(bookingData.guests || 1);
    const list = (accommodations || []).filter((c: Accommodation) => c.available !== false).map((c: Accommodation) => ({ id: c.id, cap: Number(c.capacity || c.capacity_max || c.maxGuests || 1) }));
    if (list.length > 0) {
      const best = list.sort((a, b) => b.cap - a.cap)[0];
      const roomsNeeded = Math.max(1, Math.ceil(guestsNeededLocal / Math.max(Number(best.cap || 1), 1)));
      setSelectedCottages([{ id: String(best.id), rooms: roomsNeeded, extraBed: false, manual: false }]);
    }
  }, [accommodations, bookingData.guests, selectedCottages, setSelectedCottages, userInteracted]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-medium mb-2">Select Dates & Guests</h2>
        <p className="text-muted-foreground">Choose your stay dates and number of guests.</p>
      </div>

        {capacityMessage && (
          <div className="mb-4 p-3 rounded border bg-yellow-50 text-sm text-yellow-800">
            {capacityMessage}
          </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Check-in</label>
          <input type="date" value={bookingData.checkIn} onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })} className="w-full px-4 py-3 bg-muted rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Check-out</label>
          <input type="date" value={bookingData.checkOut} onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })} className="w-full px-4 py-3 bg-muted rounded-lg" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Guests</label>
        <select value={bookingData.guests} onChange={(e) => {
          const v = e.target.value === 'entire' ? 'entire' : Number(e.target.value);
          setBookingData({ ...bookingData, guests: v });
        }} className="w-full px-4 py-3 bg-muted rounded-lg">
          {Array.from({ length: Math.max(maxGuests, 10) }).map((_, i) => (
            <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Person' : 'People'}</option>
          ))}
          <option value="entire">Book entire accommodation</option>
        </select>
      </div>

      {/* Note: global extra bedding removed — extra bedding is per-cottage only (see below) */}

      <div>
        <h3 className="font-medium mb-2">Select Cottages (optional)</h3>
        <p className="text-sm text-muted-foreground mb-3">You can override automatic allocation by selecting specific cottages.</p>
        <div className="flex flex-col gap-4">
          {(accommodations || []).map((c: Accommodation) => {
            const current = (selectedCottages || []).find((sc: SelectedCottage) => String(sc.id) === String(c.id));
            const qty = current ? (current.rooms || 0) : 0;
            const maxRooms = c.available_rooms ?? c.availableRooms ?? 10;
            // Determine extra bed availability:
            // - If backend explicitly sets numeric value, use it
            // - If backend explicitly disallows via boolean false or 0, treat as unavailable
            // - Otherwise default to 1 (allow extra bedding) so UI is permissive when backend omits flags
            const extraAvailable = ((): number => {
              // If backend provides a positive numeric count, use it
              if (typeof c.extra_bedding === 'number' && Number(c.extra_bedding) > 0) return Number(c.extra_bedding);
              if (typeof c.extra_beds === 'number' && Number(c.extra_beds) > 0) return Number(c.extra_beds);
              if (typeof c.extraBedding === 'number' && Number(c.extraBedding) > 0) return Number(c.extraBedding);
              // Otherwise, be permissive and allow 1 extra bed by default (client-side override)
              return 1;
            })();
            const img = (c && Array.isArray(c.media) && c.media[0]) || (c && Array.isArray(c.images) && c.images[0]) || c.image || suiteImage;
            return (
              <div key={c.id} className={`p-4 rounded border mb-4 ${c.available === false ? 'opacity-60 line-through' : ''}`}>
                <div className="w-full h-40 overflow-hidden rounded mb-3">
                  <OptimizedImage src={String(img)} alt={c.title || c.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-3">
                    <div className="font-medium text-lg">{c.title || c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.capacity || c.maxGuests || c.capacity_max} guests / room</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{c.price_per_night || c.price ? `${formatINR(Number(c.price_per_night || c.price))}` : ''}</div>
                </div>

                <div>
                  <div className="flex items-center justify-start">
                    <QuantityButton
                      quantity={qty}
                      max={maxRooms}
                      onAdd={() => {
                        setUserInteracted(true);
                        setSelectedCottages(prev => {
                          if (prev.find((sc: SelectedCottage) => String(sc.id) === String(c.id))) return prev;
                          return [...prev, { id: String(c.id), rooms: 1, extraBed: false, manual: true }];
                        });
                      }}
                      onIncrement={() => {
                        setUserInteracted(true);
                        setSelectedCottages(prev => prev.map((sc: SelectedCottage) => {
                          if (String(sc.id) !== String(c.id)) return sc;
                          return { ...sc, rooms: Math.min(maxRooms, (sc.rooms || 0) + 1), manual: true };
                        }));
                      }}
                      onDecrement={() => {
                        setUserInteracted(true);
                        setSelectedCottages(prev => prev.map((sc: SelectedCottage) => {
                          if (String(sc.id) !== String(c.id)) return sc;
                          const newRooms = Math.max(0, (sc.rooms || 0) - 1);
                          return newRooms > 0 ? { ...sc, rooms: newRooms, manual: true } : null;
                        }).filter(Boolean) as SelectedCottage[]);
                      }}
                    />
                  </div>

                  {/* Extra bedding — shown only when rooms selected */}
                  <div className="mt-3">
                    {qty > 0 ? (
                      extraAvailable > 0 ? (
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={!!current?.extraBed} onChange={(e) => {
                            setSelectedCottages(prev => prev.map((sc: SelectedCottage) => {
                                if (String(sc.id) !== String(c.id)) return sc;
                                return { ...sc, extraBed: e.target.checked ? true : false, manual: true };
                              }));
                          }} />
                          <span className="text-sm">Add extra bed (+{formatINR(Number(c.extra_bedding_price ?? 0))})</span>
                        </label>
                      ) : (
                        <div className="text-sm text-muted-foreground">Extra bed not available</div>
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <h3 className="font-medium mb-2">Add Wellness Programs (optional)</h3>
          <p className="text-sm text-muted-foreground mb-3">Enhance your stay with curated wellness programs.</p>
          <div className="flex gap-3 overflow-x-auto py-2">
            {(wellnessServices || []).map((p: Program) => {
              const selected = selectedPrograms.find(sp => String(sp.programId) === String(p.id));
              const qty = selected ? selected.quantity : 0;
              const img = p.image_url || p.image || suiteImage;
              return (
                <div key={p.id} className={`w-80 flex-shrink-0 p-3 rounded border ${p.is_included ? 'opacity-80' : ''}`}>
                  <div className="w-full h-36 overflow-hidden rounded mb-2">
                    <OptimizedImage src={String(img)} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-3">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-muted-foreground">{p.duration_days ? `${p.duration_days} day${p.duration_days>1?'s':''}` : ''} {p.location ? `• ${p.location}` : ''}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{p.price ? formatINR(Number(p.price)) : (p.is_included ? 'Included' : '')}</div>
                  </div>
                  <div className="mt-2">
                    {p.is_included ? (
                      <div className="text-sm text-muted-foreground">Included with stay</div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={qty>0} onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPrograms(prev => [...prev, { programId: String(p.id), quantity: 1 }]);
                            } else {
                              setSelectedPrograms(prev => prev.filter(sp => String(sp.programId)!==String(p.id)));
                            }
                          }} />
                          <span className="text-sm">Add program</span>
                        </label>
                        <div>
                          <QuantityButton
                            quantity={qty}
                            max={10}
                            onAdd={() => setSelectedPrograms(prev => prev.find(sp => sp.programId===String(p.id)) ? prev : [...prev, { programId: String(p.id), quantity: 1 }])}
                            onIncrement={() => setSelectedPrograms(prev => prev.map(sp => sp.programId===String(p.id)?{...sp, quantity: Math.min(10, sp.quantity+1)}:sp))}
                            onDecrement={() => setSelectedPrograms(prev => prev.map(sp => sp.programId===String(p.id)?{...sp, quantity: Math.max(0, sp.quantity-1)}:sp).filter(sp=>sp.quantity>0))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => {
            const guestsNeeded = typeof bookingData.guests === 'string' && bookingData.guests === 'entire' ? 1 : Number(bookingData.guests || 1);
            const list = (accommodations || []).filter((c: Accommodation) => c.available !== false).map((c: Accommodation) => ({ id: c.id, cap: Number(c.capacity || c.capacity_max || c.maxGuests || 1) }));
            if (list.length > 0) {
              const best = list.sort((a, b) => b.cap - a.cap)[0];
              const roomsNeeded = Math.max(1, Math.ceil(guestsNeeded / Math.max(Number(best.cap || 1), 1)));
              setSelectedCottages([{ id: String(best.id), rooms: roomsNeeded, extraBed: false, manual: false }]);
            }
          }}>Auto-allocate cottages</Button>
        </div>
      </div>
    </div>
  );
}

type StepGuestProps = {
  bookingData: BookingFormData;
  setBookingData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  accommodations?: Accommodation[];
  selectedCottages: SelectedCottage[];
  setSelectedCottages: React.Dispatch<React.SetStateAction<SelectedCottage[]>>;
};

function StepGuest({ bookingData, setBookingData, accommodations, selectedCottages, setSelectedCottages }: StepGuestProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-medium mb-2">
          Guest Information
        </h2>
        <p className="text-muted-foreground">
          Please provide your contact details for the reservation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="first-name" className="block text-sm font-medium mb-2">
            <User className="h-4 w-4 inline mr-2" />
            First Name
          </label>
          <input
            id="first-name"
            name="firstName"
            type="text"
            value={bookingData.firstName}
            onChange={(e) =>
              setBookingData({ ...bookingData, firstName: e.target.value })
            }
            placeholder="Enter your first name"
            required
            className="w-full px-4 py-3 bg-muted rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="last-name" className="block text-sm font-medium mb-2">
            <User className="h-4 w-4 inline mr-2" />
            Last Name
          </label>
          <input
            id="last-name"
            name="lastName"
            type="text"
            value={bookingData.lastName}
            onChange={(e) =>
              setBookingData({ ...bookingData, lastName: e.target.value })
            }
            placeholder="Enter your last name"
            required
            className="w-full px-4 py-3 bg-muted rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          <Mail className="h-4 w-4 inline mr-2" />
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={bookingData.email}
          onChange={(e) =>
            setBookingData({ ...bookingData, email: e.target.value })
          }
          placeholder="your@email.com"
          required
          className="w-full px-4 py-3 bg-muted rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          <Phone className="h-4 w-4 inline mr-2" />
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={bookingData.phone}
          onChange={(e) =>
            setBookingData({ ...bookingData, phone: e.target.value })
          }
          placeholder="+1 (555) 000-0000"
          required
          className="w-full px-4 py-3 bg-muted rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          id="special-requests"
          name="specialRequests"
          value={bookingData.specialRequests}
          onChange={(e) =>
            setBookingData({ ...bookingData, specialRequests: e.target.value })
          }
          placeholder="Any dietary requirements, arrival time preferences, or special occasions..."
          rows={4}
          
          className="w-full px-4 py-3 bg-muted rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* no extra bedding or cottage selection here — handled in StepDates */}
    </div>
  );
}

type StepPaymentProps = {
  bookingData: BookingFormData;
  setBookingData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  selectedRoom: Accommodation | null;
};

function StepPayment({ bookingData, setBookingData, selectedRoom }: StepPaymentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-medium mb-2">Payment Details</h2>
        <p className="text-muted-foreground">Your payment is secured with industry-standard encryption</p>
      </div>

      <div className="bg-muted p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="font-medium">Payment Method</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="payment"
                checked={bookingData.paymentMethod === 'card'}
                onChange={() => setBookingData({ ...bookingData, paymentMethod: 'card' })}
                className="mr-2"
              />
              Card
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="payment"
                checked={bookingData.paymentMethod === 'upi'}
                onChange={() => setBookingData({ ...bookingData, paymentMethod: 'upi' })}
                className="mr-2"
              />
              UPI
            </label>
          </div>

          {bookingData.paymentMethod === 'card' && (
            <div>
              <div>
                <label className="block text-sm font-medium mb-2">Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 bg-background rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-background rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input type="text" placeholder="123" className="w-full px-4 py-3 bg-background rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            </div>
          )}

          {bookingData.paymentMethod === 'upi' && (
            <div>
              <label className="block text-sm font-medium mb-2">UPI VPA (e.g. yourid@upi)</label>
              <input
                type="text"
                value={bookingData.upiVpa}
                onChange={(e) => setBookingData({ ...bookingData, upiVpa: e.target.value })}
                placeholder="example@upi"
                className="w-full px-4 py-3 bg-background rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-sm text-muted-foreground mt-2">After confirming the booking, a transaction will be created and you'll be prompted to complete payment via your UPI app. The transaction will be saved in the backend for admin review.</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        By completing this booking, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}

function StepConfirmation() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-wellness/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-wellness" />
      </div>
      <h2 className="font-serif text-3xl font-medium mb-4">
        Booking Confirmed!
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Thank you for choosing Mud & Meadows – The Earthbound Sanctuary. A confirmation email 
        has been sent to your registered email address.
      </p>
      <p className="text-lg font-medium mb-2">Confirmation Number</p>
      <p className="text-2xl font-serif text-primary mb-8">AHS-2024-789456</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="luxury">Download Invoice</Button>
        <Link to="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}

type BookingSummaryProps = {
  room: Accommodation | null;
  bookingData: BookingFormData;
  selectedCottages: SelectedCottage[];
  accommodations?: Accommodation[];
  wellnessServices?: Program[];
  selectedPrograms?: SelectedProgram[];
  extraBedId?: string | null;
  extraBedQty?: number;
};

function BookingSummary({ room, bookingData, selectedCottages, accommodations, wellnessServices, selectedPrograms, extraBedId, extraBedQty }: BookingSummaryProps) {
  const { data: allExtraBeds } = useAllExtraBeds();
  const extraBedEntry = (allExtraBeds || []).find((b: any) => String(b.id || b._id) === String(extraBedId || ''));
  // Safely handle case where `room` is not yet available (e.g. accommodations still loading)
  const hasSelection = selectedCottages && selectedCottages.length > 0;
  if (!room && !hasSelection) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-soft sticky top-28">
        <h3 className="font-serif text-xl font-medium mb-6">Booking Summary</h3>
        <div className="text-sm text-muted-foreground">Select a room to see pricing and details.</div>
      </div>
    );
  }

  const nights = bookingData.checkIn && bookingData.checkOut
    ? Math.ceil(
        (new Date(bookingData.checkOut).getTime() -
          new Date(bookingData.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;
  let subtotal = 0;
  if (hasSelection) {
    // compute subtotal from structured selection
    for (const sc of selectedCottages) {
      const c = (accommodations || []).find((x: Accommodation) => String(x.id) === String(sc.id));
      const price = Number(c?.basePrice || c?.price_per_night || c?.price || 0);
      const extraPrice = Number(c?.extra_bedding_price ?? 0);
      subtotal += (price * (sc.rooms || 0));
      if (sc.extraBed) subtotal += extraPrice;
    }
    subtotal = subtotal * Math.max(nights, 1);
  } else {
    subtotal = (room.basePrice || 0) * Math.max(nights, 1);
  }
  // If an explicit extra bed id was provided, include its cost in subtotal
  let explicitExtraTotal = 0;
  if (extraBedEntry && (extraBedQty || 0) > 0) {
    const priceVal = Number(extraBedEntry.pricePerNight || extraBedEntry.price || extraBedEntry.amount || 0);
    explicitExtraTotal = priceVal * Math.max(1, nights) * (extraBedQty || 0);
  }
  subtotal += explicitExtraTotal;
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-soft sticky top-28">
      <h3 className="font-serif text-xl font-medium mb-6">Booking Summary</h3>

      {/* Room(s) Info */}
      <div className="mb-6 pb-6 border-b border-border">
        {hasSelection ? (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{selectedCottages.length} selection(s)</div>
            {selectedCottages.map((sc: SelectedCottage) => {
              const c = (accommodations || []).find((x: Accommodation) => String(x.id) === String(sc.id));
              const img = (c && Array.isArray(c.media) && c.media[0]) || (c && Array.isArray(c.images) && c.images[0]) || c?.image || suiteImage;
              return (
                <div key={sc.id} className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                      <OptimizedImage src={String(img)} alt={c?.title || c?.name || sc.id} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium">{c?.title || c?.name || sc.id}</div>
                    <div className="text-sm text-muted-foreground">{sc.rooms} room(s){sc.extraBed ? ' • extra bed' : ''}</div>
                  </div>
                </div>
              );
            })}
            <div className="text-sm text-muted-foreground">{bookingData.guests} {bookingData.guests === 1 ? 'Guest' : 'Guests'}</div>
          </div>
        ) : (
            <div className="flex gap-4 items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{room?.title || room?.name}</p>
              <h4 className="font-serif font-medium">{room?.name || room?.title}</h4>
              <p className="text-sm text-muted-foreground">{bookingData.guests === "entire" ? "Entire accommodation" : `${bookingData.guests} ${bookingData.guests === 1 ? "Guest" : "Guests"}`}</p>
            </div>
          </div>
        )}
      </div>

      {/* Programs */}
      {selectedPrograms && selectedPrograms.length > 0 && (
        <div className="mb-6 pb-6 border-b border-border space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Wellness Programs</div>
          {selectedPrograms.map((sp: SelectedProgram) => {
            const p = (accommodations || []).length ? (wellnessServices || []).find((w: Program) => String(w.id) === String(sp.programId)) : (wellnessServices || []).find((w: Program) => String(w.id) === String(sp.programId));
            return (
              <div key={sp.programId} className="flex items-center gap-3">
                <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                  <OptimizedImage src={String(p?.image_url || p?.image || suiteImage)} alt={p?.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-medium">{p?.title}</div>
                  <div className="text-sm text-muted-foreground">{sp.quantity} x {formatINR(Number(p?.price ?? 0))}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dates */}
      {bookingData.checkIn && bookingData.checkOut && (
        <div className="mb-6 pb-6 border-b border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-in</span>
            <span>
              {new Date(bookingData.checkIn).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-out</span>
            <span>
              {new Date(bookingData.checkOut).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span>{nights} {nights === 1 ? "Night" : "Nights"}</span>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{formatINR(room.basePrice || 0)} x {Math.max(nights, 1)} nights</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxes & fees (18%)</span>
          <span>{formatINR(tax)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <span className="font-medium">Total</span>
        <span className="font-serif text-2xl text-primary">
          {formatINR(total)}
        </span>
      </div>
    </div>
  );
}

export default BookingPage;
