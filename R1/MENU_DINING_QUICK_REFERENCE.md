# Menu & Dining Feature - Quick Reference

## File Structure
```
src/
├── pages/
│   ├── DiningPage.tsx          # Public menu browsing page (/dining)
│   └── AdminMenuPage.tsx       # Admin menu management component
├── types/
│   └── menu.ts                 # MenuItem interface and types
├── hooks/
│   ├── useApi.ts               # useMenuItems, useMenuItem, useMenuItemsByCategory
│   └── useApiMutation.ts       # useCreateMenuItem, useUpdateMenuItem, etc.
└── lib/
    └── api-client.ts           # getAllMenuItems, createMenuItem, etc.

tests/e2e/
└── verify-dining.spec.ts       # Playwright tests for DiningPage
```

## Key Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/dining` | DiningPage | Public menu browsing |
| `/admin` | AdminPage | Admin dashboard with menu management section |

## API Endpoints (Backend)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/menu-items/` | Fetch all menu items |
| GET | `/menu-items/?category=main` | Fetch items by category |
| GET | `/menu-items/{id}` | Fetch single item |
| POST | `/menu-items/` | Create menu item |
| PUT | `/menu-items/{id}` | Update menu item |
| DELETE | `/menu-items/{id}` | Delete menu item (soft) |
| POST | `/menu-items/{id}/restore` | Restore deleted item |

## Component Imports

### Using DiningPage
```typescript
import DiningPage from "./pages/DiningPage";
// Already imported in src/App.tsx
```

### Using AdminMenuPage
```typescript
import { AdminMenuPage } from "@/pages/AdminMenuPage";
// Already embedded in src/pages/AdminPage.tsx
```

### Using Hooks
```typescript
import { useMenuItems, useMenuItem, useMenuItemsByCategory } from "@/hooks/useApi";
import { useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, useRestoreMenuItem } from "@/hooks/useApiMutation";
```

## Common Tasks

### Display Menu Items List
```typescript
const { data: menuItems, loading, error, refetch } = useMenuItems();

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.detail}</div>;

return (
  <div>
    {menuItems?.map(item => (
      <div key={item.id}>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <span>₹{item.price}</span>
      </div>
    ))}
  </div>
);
```

### Create Menu Item
```typescript
const { mutate: createMenuItem, loading } = useCreateMenuItem();

const handleCreate = async () => {
  const newItem = {
    name: "Khichdi",
    description: "...",
    category: "main",
    portion: "per bowl",
    price: 250,
    imageUrl: "...",
    dietaryTags: ["vegan"],
    isVisible: true
  };
  
  const result = await createMenuItem(newItem);
  if (result) {
    console.log("Item created:", result.id);
  }
};
```

### Update Menu Item
```typescript
const { mutate: updateMenuItem, loading } = useUpdateMenuItem();

const handleUpdate = async (itemId: string) => {
  const result = await updateMenuItem({
    id: itemId,
    data: { price: 280, description: "Updated..." }
  });
  if (result) {
    console.log("Item updated");
  }
};
```

### Delete Menu Item
```typescript
const { mutate: deleteMenuItem, loading } = useDeleteMenuItem();

const handleDelete = async (itemId: string) => {
  if (confirm("Delete this item?")) {
    const result = await deleteMenuItem(itemId);
    if (result) {
      console.log("Item deleted");
    }
  }
};
```

### Filter by Category
```typescript
const { data: mainsMenu, loading } = useMenuItemsByCategory("main");
```

## MenuItem TypeScript Interface

```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: "starter" | "main" | "side" | "dessert" | "beverage";
  portion: string;
  price: number;
  imageUrl: string;
  dietaryTags: string[];
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## DiningPage Features

| Feature | Implementation |
|---------|-----------------|
| **Search** | `useState` filter on item name |
| **Category Filter** | `useState` activeCategory, client-side filtering |
| **Sorting** | `useState` sortBy, applies sort to filtered results |
| **Image Fallback** | Local assets for missing imageUrl |
| **Responsive Grid** | Tailwind grid: 1 col mobile, 2 col tablet, 3 col desktop |
| **Loading State** | Shows spinner while fetching |
| **Error Handling** | Shows error message with refetch button |
| **Empty State** | Shows message when no items found |

## AdminMenuPage Features

| Feature | Implementation |
|---------|-----------------|
| **Create Item** | Form with validation, POST to `/menu-items/` |
| **Edit Item** | Click edit button, form auto-populates, PUT to update |
| **Delete Item** | Click delete, confirm dialog, soft delete via DELETE |
| **Image Preview** | Shows image from URL, preview before saving |
| **Dietary Tags** | Comma-separated input, converts to array |
| **Visibility Toggle** | Checkbox for `isVisible` field |
| **List Display** | Grid of items with edit/delete buttons |
| **Auto-refetch** | Refetch after successful mutation |

## Styling Classes

### DiningPage
- `.container-padding` - Standard horizontal padding
- `.font-serif` - Header fonts
- `.bg-primary` - Primary action buttons
- `.bg-muted` - Secondary backgrounds
- `.border-border` - Standard borders

### AdminMenuPage
- `.bg-card` - Card backgrounds
- `.text-primary` - Primary text color
- `.text-muted-foreground` - Secondary text
- `.hover:opacity-90` - Hover effect for buttons

## Environment Variables

```env
VITE_API_URL=http://localhost:8000
```

If not set, defaults to root URL (no /api prefix).

## Testing Commands

```bash
# Run dining tests
npx playwright test verify-dining.spec.ts

# Run with UI
npx playwright test --ui

# Debug specific test
npx playwright test verify-dining.spec.ts -g "search" --debug
```

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Menu not loading | Check backend is running, `/menu-items/` endpoint exists |
| Images not showing | Verify imageUrl is valid, check local placeholders exist |
| Admin form stuck | Check network request in DevTools, see error in console |
| Tests failing | Ensure frontend on :3000, backend on :8000, database seeded |

## Database Seeding Example

```python
# backend/mongo_seed.py
menu_items = [
    {
        "name": "Satvik Khichdi",
        "description": "Creamy blend of mung dal and basmati rice...",
        "category": "main",
        "portion": "per bowl",
        "price": 250,
        "imageUrl": "...",
        "dietaryTags": ["vegan", "gluten-free"],
        "isVisible": True
    },
    # ... more items
]

db.menu_items.insert_many(menu_items)
```

## Performance Tips

1. **Images**: Pre-compress JPGs to <150KB, use WebP for new images
2. **Lazy Loading**: Images are lazy-loaded in MenuItemCard
3. **Search**: Debounce search input if list is >100 items
4. **Sorting**: Sort happens in memory, not at API level
5. **Caching**: React Query automatically caches API responses

## Next Steps (Future Implementation)

1. **Image Upload**: Implement file upload in admin dashboard
2. **Pagination**: Add pagination for large menus (>50 items)
3. **Filters**: Multi-select dietary tags, price range
4. **Favorites**: Store user favorite items in booking
5. **Reviews**: Customer ratings and comments
6. **Inventory**: Track item availability/stock levels
7. **Promotions**: Special pricing or featured items
8. **Analytics**: Track popular items, revenue per item

## Contact & Support

- **Frontend Issues**: Check console for errors, verify API URL
- **Backend Issues**: Check `/menu-items/` endpoint implementation
- **Database Issues**: Verify MongoDB collection and indexes
- **Testing Issues**: Ensure all services running before test
