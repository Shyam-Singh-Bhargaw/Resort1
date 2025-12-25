# Admin Dashboard - Manage Accommodations Feature

## Quick Start for Admins

The admin dashboard now includes a complete **Manage Accommodations** section where you can:
- ✅ Add new rooms, villas, pavilions, and other accommodations
- ✅ Edit existing accommodation details (price, capacity, description, etc.)
- ✅ Upload and manage images for each accommodation
- ✅ Delete accommodations you no longer offer
- ✅ Set ratings, amenities, and pricing

**No coding required!** Everything is managed through an intuitive web form.

---

## How to Add a New Accommodation

### Step 1: Access Admin Dashboard
- Navigate to `/admin`
- Look for the **"Manage Accommodations"** section (below Quick Actions)

### Step 2: Fill in the Form

**Required Fields:**
- **Name**: e.g., "Deluxe Mountain View Villa", "Premium Wellness Suite"
- **Description**: Detailed description of the accommodation (100+ characters recommended)
- **Price per Night**: How much guests pay per night (e.g., 250)
- **Capacity**: Maximum number of guests (e.g., 4)
- **Rating**: Guest satisfaction rating (1-5, default 4.5)

**Optional Fields:**
- **Amenities**: List amenities separated by commas
  - Example: `King Bed, Private Balcony, Rain Shower, 24/7 Butler Service`
  - These appear on the room detail page

### Step 3: Upload Images
- Click "Choose File" under Image Upload
- Select an image from your computer (JPG, PNG, etc.)
- See the image preview before saving
- Click "Create Accommodation" to submit

### Step 4: Verify
- New accommodation appears in the list below the form
- Check `/rooms` page to see it live on the website
- Customers can now book this accommodation

---

## How to Edit an Accommodation

### Step 1: Find the Accommodation
- Scroll through the list in the Manage Accommodations section
- Find the accommodation you want to edit

### Step 2: Click Edit
- Click the "Edit" button on the accommodation card
- Form populates with current details

### Step 3: Modify Details
- Change any field (name, description, price, capacity, etc.)
- Upload a new image if desired
- Existing image will be replaced

### Step 4: Save Changes
- Click "Update Accommodation"
- Changes appear immediately on the website

---

## How to Delete an Accommodation

### Step 1: Find the Accommodation
- Locate it in the Manage Accommodations list

### Step 2: Click Delete
- Click the "Delete" button (trash icon)
- A confirmation dialog appears

### Step 3: Confirm
- Click "Yes" to confirm deletion
- Click "No" to cancel
- Once deleted, accommodation is removed from website and database

---

## Form Field Guide

| Field | Type | Min/Max | Notes |
|-------|------|---------|-------|
| **Name** | Text | 3-100 chars | E.g., "Deluxe Room", "Royal Pavilion" |
| **Description** | Text Area | 20-1000 chars | Rich description visible on detail page |
| **Price per Night** | Number | 1-9999 | Currency in USD/INR depending on backend |
| **Capacity** | Number | 1-20 | Maximum guests |
| **Amenities** | Text | - | Comma-separated list (optional) |
| **Rating** | Number | 1-5 | Guest satisfaction rating |
| **Images** | File Upload | - | JPG, PNG, WebP supported |

---

## Display on Website

### Where Customers See Your Accommodations

**1. Rooms Page** (`/rooms`)
- All accommodations listed with images
- Filterable by category
- Sortable by price
- Quick preview with amenities

**2. Room Detail Page** (`/rooms/{id}`)
- Full description and all images
- Complete amenities list
- Pricing and capacity info
- "Book Now" button

**3. Booking Page** (`/booking`)
- Accommodations appear in room selection dropdown
- Prices used for booking calculations
- Capacity determines guest count limit

---

## Amenities Examples

Common amenities to list:
```
King Bed, Private Balcony, Rain Shower, Mini Bar, 24/7 Butler Service
```

Wellness-focused:
```
Meditation Corner, Herbal Bath, Yoga Mat, Organic Toiletries
```

Luxury features:
```
Heated Pool, Hot Tub, Sauna, Steam Room, Spa Access
```

---

## Troubleshooting

### Image Won't Upload
- Check file size (should be < 10MB)
- Ensure file is JPG, PNG, or WebP format
- Check internet connection
- Try again or refresh page

### Form Won't Submit
- Ensure all required fields are filled
- Price must be a positive number
- Description should be at least 20 characters
- Check for error message on form

### Accommodation Not Appearing on Website
- Refresh `/rooms` page (Ctrl+F5)
- Check admin form for errors
- Verify price is > 0
- Contact backend administrator if issue persists

---

## Tips for Best Results

### Photography
- Use high-quality images (1200x800px or larger)
- Show the room well-lit and inviting
- Include views, amenities, and unique features
- Consistency in style/filters helps professionalism

### Descriptions
- Be specific and detailed
- Mention unique features
- Include what's included (breakfast, WiFi, etc.)
- Use enticing language
- Mention views, location benefits

### Pricing
- Research competitive rates
- Consider seasonality (update as needed)
- Be clear about what's included
- Factor in taxes/service charges

### Amenities
- List actual amenities (not features)
- Be honest (customers will notice)
- Prioritize (most important first)
- Use standard terminology

---

## Data Storage

All accommodation data is stored in the backend database:
- ✅ Automatically saved when you click "Create" or "Update"
- ✅ Persists even after server restart
- ✅ Instantly available to all customers
- ✅ Backed up by your database system

---

## Need Help?

- **Syntax Issues?** All errors shown in form with helpful messages
- **Booking Calculation?** Price displayed = Price per Night × Number of Nights + Taxes
- **Image Sizing?** Recommended 1200x800px for best quality
- **More Features?** Contact development team for custom enhancements

---

**Current Template:** Mud & Meadows – The Earthbound Sanctuary  
**Build Status:** ✅ Production Ready  
**Last Updated:** 2024
