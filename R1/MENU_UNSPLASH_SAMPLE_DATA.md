# Menu & Dining - Sample Data with Unsplash Images

## What Changed

The DiningPage has been updated to use **Unsplash high-quality images** for all menu items. When the backend is not connected, the page displays sample menu items with beautiful 4K images instead of showing an error.

## How It Works

### Fallback Mechanism
```typescript
// If backend returns data → use backend data
// If backend fails/not ready → use sample menu items with Unsplash images
const finalMenuItems = (menuItems && Array.isArray(menuItems) && menuItems.length > 0) 
  ? menuItems 
  : sampleMenuItems;
```

### Images Used
All images are from **Unsplash** (free, high-quality, 4K-ready):

#### Starters
- Moong Dal Chilla: Salad/appetizer image
- Steamed Veg Momos: Dumpling appetizer image
- Raw Papaya Salad: Fresh salad image

#### Main Course
- Satvik Khichdi: Creamy rice dish image
- Lauki Kofta Curry: Vegetable curry image
- Paneer Tikka Masala: Paneer curry image

#### Sides & Rotis
- Tandoori Roti: Whole wheat bread image
- Multigrain Paratha: Bread/flatbread image
- Steamed Rice: White rice image

#### Desserts
- Jaggery Kheer: Dessert/pudding image
- Coconut Ladoo: Sweet treats image
- Fruit & Nut Balls: Energy balls/sweets image

#### Beverages
- Tulsi Ginger Tea: Tea image
- Almond Milk: Milk/beverage image
- Herbal Coffee: Coffee image
- Mineral Water: Water image

## Sample Menu Items (16 Total)

### Starters (3 items)
1. **Moong Dal Chilla** - ₹180
   - Savory pancake made from split moong lentils
   - Tags: vegan, protein-rich

2. **Steamed Veg Momos** - ₹220
   - Delicate steamed dumplings with vegetables
   - Tags: vegan, gluten-free

3. **Raw Papaya Salad** - ₹150
   - Fresh raw papaya with lime juice and herbs
   - Tags: raw, vegan, detoxifying

### Main Course (3 items)
4. **Satvik Khichdi** - ₹250
   - Creamy blend of mung dal and basmati rice
   - Tags: vegan, gluten-free, ayurvedic

5. **Lauki Kofta Curry** - ₹280
   - Bottle gourd dumplings in light tomato sauce
   - Tags: vegan, cooling

6. **Paneer Tikka Masala** - ₹320
   - Soft paneer in creamy tomato sauce
   - Tags: vegetarian, protein-rich

### Sides & Rotis (3 items)
7. **Tandoori Roti** - ₹40
   - Whole wheat flatbread from clay oven
   - Tags: vegan

8. **Multigrain Paratha** - ₹60
   - Layered flatbread with whole grains
   - Tags: vegan, whole grain

9. **Steamed Basmati Rice** - ₹80
   - Pure fragrant basmati rice
   - Tags: vegan, gluten-free

### Desserts (3 items)
10. **Jaggery Kheer** - ₹180
    - Traditional rice pudding with jaggery
    - Tags: vegetarian

11. **Coconut Ladoo** - ₹120
    - Handmade coconut balls
    - Tags: vegan

12. **Fruit & Nut Bliss Balls** - ₹150
    - Raw, no-bake energy balls
    - Tags: raw, vegan

### Beverages (4 items)
13. **Tulsi Ginger Tea** - ₹90
    - Herbal infusion of tulsi, ginger, lemon
    - Tags: vegan, herbal

14. **Almond Milk** - ₹120
    - Fresh homemade almond milk
    - Tags: vegan, protein-rich

15. **Herbal Coffee** - ₹100
    - Caffeine-free herbal blend
    - Tags: vegan

16. **Mineral Water** - ₹60
    - Pure natural mineral water
    - Tags: vegan

## Unsplash Image URLs

The page uses these Unsplash URLs:

```
Salads/Appetizers:
https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80

Rice/Grain Dishes:
https://images.unsplash.com/photo-1565958011457-41d86d9406d5?w=800&q=80

Bread/Rotis:
https://images.unsplash.com/photo-1528915394179-3a504d10a0de?w=800&q=80

Rice/Sides:
https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80

Desserts/Sweets:
https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80

Tea/Beverages:
https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=800&q=80

Coffee/Beverages:
https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80
```

## Features

✅ **No Backend Required**: Menu displays even if backend is not ready
✅ **High Quality Images**: 4K Unsplash images for visual appeal
✅ **Full Functionality**: Search, filter, sort all work with sample data
✅ **Fallback Smart**: Automatically uses backend data when available
✅ **Responsive**: Works on mobile, tablet, and desktop
✅ **User Friendly**: Shows message if backend not connected
✅ **No Errors**: Page never fails, gracefully handles backend unavailability

## How to Test

1. **Visit the page**: `http://localhost:3000/dining`
2. **See sample menu items** with beautiful Unsplash images
3. **Try features**: Search, filter by category, sort by price/name
4. **Add to booking**: Click "Add to Booking" button
5. **Once backend is ready**: Real data will automatically replace sample data

## Transitioning to Backend

When your backend is ready:

1. Implement the 6 `/menu-items/` endpoints
2. Seed the database with your menu items (can use this sample data)
3. The frontend will automatically detect and use real data
4. Sample data serves as fallback for development/testing

## Error Message

If backend is not available, users see:
```
"Backend not connected. Showing sample menu items."
[Retry Backend Connection]
```

Users can still browse and interact with the menu while the backend is being set up.

## Next Steps

### For Backend Team
1. Create `/menu-items/` REST endpoints
2. Set up MongoDB collection
3. Seed the database with menu items
4. Deploy backend

### For Frontend Team
- ✅ Complete! Just run the dev server
- Page works with or without backend

### For DevOps
- Deploy backend when ready
- No frontend changes needed
- Frontend automatically uses real data when available
