# Component Reference Guide

Quick reference for all HomieHub components, their props, and usage.

---

## Layout Components

### `Navbar`
**Location**: `components/layout/Navbar.tsx`

Global navigation bar with scroll effects and authentication awareness.

**Features**:
- Sticky positioning with scroll detection
- Conditional rendering (hidden on `/app` page)
- Authentication-aware menu items
- Smooth animations on mount

**No props** - Uses `usePathname()` and `isAuthenticated()`

---

### `Sidebar`
**Location**: `components/layout/Sidebar.tsx`

Fixed left sidebar for the dashboard.

**Props**:
```typescript
interface SidebarProps {
  onNavigate?: (view: string) => void;
}
```

**Features**:
- Navigation items: Recommendations, Post ad, Filters
- Logout functionality
- Hover animations
- Fixed positioning

**Usage**:
```tsx
<Sidebar onNavigate={(view) => console.log(view)} />
```

---

## Landing Page Components

### `RotatingText`
**Location**: `components/landing/RotatingText.tsx`

Animated rotating phrases with 3D flip effect.

**No props** - Cycles through predefined phrases every 3 seconds

**Features**:
- 5 rotating phrases about roommate matching
- 3D flip animation (rotateX)
- Automatic interval cycling
- Fade in/out transitions

**Usage**:
```tsx
<RotatingText />
```

---

### `ScrollingInfographic`
**Location**: `components/landing/ScrollingInfographic.tsx`

Parallax infographic with floating feature labels.

**No props** - Self-contained scroll animation

**Features**:
- Central card with scale animation
- 4 floating feature labels
- Scroll-triggered positioning
- Circular layout pattern

**Usage**:
```tsx
<ScrollingInfographic />
```

---

### `FeatureGrid`
**Location**: `components/landing/FeatureGrid.tsx`

Grid of 6 feature cards with hover effects.

**No props** - Displays predefined features

**Features**:
- 3-column responsive grid
- 3D hover tilt effect
- Staggered fade-in on scroll
- Icon + title + description layout

**Usage**:
```tsx
<FeatureGrid />
```

---

## Room Components

### `RoomCard`
**Location**: `components/rooms/RoomCard.tsx`

Detailed room listing card with all information.

**Props**:
```typescript
interface RoomCardProps {
  roomId: string;
  roomData: RoomData;
}
```

**RoomData Structure**:
```typescript
interface RoomData {
  address: string;
  location: string;
  rent: number;
  room_type: string;
  num_bedrooms: number;
  num_bathrooms: number;
  flatmate_gender: string;
  lifestyle_food: string;
  lifestyle_alcohol: string;
  lifestyle_smoke: string;
  utilities_included: string[];
  amenities: string[];
  description: string;
  available_from: string;
  contact: string;
  // ... other fields
}
```

**Features**:
- Formatted rent display
- Room details grid
- Lifestyle chips
- Utilities and amenities pills
- Truncated description (3 lines)
- Contact button (mailto link)
- 3D hover effect

**Usage**:
```tsx
<RoomCard 
  roomId="abc123"
  roomData={{
    location: "Cambridge",
    rent: 1500,
    // ... other fields
  }}
/>
```

---

## Modal Components

### `PostAdModal`
**Location**: `components/modals/PostAdModal.tsx`

Full-featured modal for creating room listings.

**Props**:
```typescript
interface PostAdModalProps {
  onClose: () => void;
  onSuccess: () => void;
}
```

**Features**:
- Comprehensive form with all room fields
- Multi-select chips for utilities/amenities
- Date validation (30 days past to 1 year future)
- Real-time validation with Zod
- Loading states
- Error display
- 3D modal animation

**Form Fields**:
- Location, address, flatmate gender
- Room type, rent, lease duration
- Bedrooms, bathrooms, attached bathroom
- Lifestyle (food, alcohol, smoke)
- Utilities (multi-select)
- Amenities (multi-select)
- Contact email, available from date
- Description (multiline)

**Usage**:
```tsx
<PostAdModal
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    refreshListings();
  }}
/>
```

---

### `FiltersModal`
**Location**: `components/modals/FiltersModal.tsx`

Advanced filtering modal for refining recommendations.

**Props**:
```typescript
interface FiltersModalProps {
  onClose: () => void;
  onApply: (filters: any) => void;
}
```

**Features**:
- Max rent slider
- Result limit input
- Gender and room type dropdowns
- Move-in date picker with validation
- Lifestyle dropdowns
- Location multi-add with chips
- Utilities multi-select
- Bio textarea (optional, min 10 chars)
- Interests multi-add (max 20, 50 chars each)
- Clear all functionality
- 3D modal animation

**Filter Fields**:
```typescript
{
  max_rent?: number;
  limit?: number;
  gender_pref?: string;
  preferred_locations?: string[];
  room_type_preference?: string;
  attached_bathroom?: string;
  lifestyle_food?: string;
  lifestyle_alcohol?: string;
  lifestyle_smoke?: string;
  utilities_preference?: string[];
  move_in_date?: string;
  bio?: string;
  interests?: string[];
}
```

**Usage**:
```tsx
<FiltersModal
  onClose={() => setShowFilters(false)}
  onApply={(filters) => {
    console.log(filters);
    applyFilters(filters);
  }}
/>
```

---

## Chat Components

### `ChatWidget`
**Location**: `components/chat/ChatWidget.tsx`

Floating AI chat assistant.

**No props** - Self-contained state management

**Features**:
- Floating button (bottom-right)
- Slide-up chat window
- Message history
- Typing indicators
- Keyboard shortcuts (Enter to send)
- API integration with error handling
- 3D animations

**Message Structure**:
```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
}
```

**Usage**:
```tsx
<ChatWidget />
```

**Interaction**:
- Click button to open
- Type message and press Enter or click send
- Click × to close

---

## Utility Functions

### `cn(...inputs)`
**Location**: `lib/utils.ts`

Merge Tailwind classes with conflict resolution.

```typescript
cn("bg-red-500", "bg-blue-500") 
// Returns: "bg-blue-500"
```

---

### `formatCurrency(amount)`
**Location**: `lib/utils.ts`

Format number as USD currency.

```typescript
formatCurrency(1500) 
// Returns: "$1,500"
```

---

### `formatDate(dateString)`
**Location**: `lib/utils.ts`

Format ISO date string.

```typescript
formatDate("2026-01-01T00:00:00Z")
// Returns: "Jan 1, 2026"
```

---

## API Client Functions

### `apiClient.signup(data)`
**Location**: `lib/apiClient.ts`

Register new user.

```typescript
await apiClient.signup({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  // ... other fields
});
```

---

### `apiClient.login(data)`
**Location**: `lib/apiClient.ts`

Authenticate user and get token.

```typescript
const response = await apiClient.login({
  email: "john@example.com",
  password: "password123"
});
// Returns: { access_token: "...", token_type: "bearer" }
```

---

### `apiClient.getRecommendations(filters?)`
**Location**: `lib/apiClient.ts`

Get room recommendations (requires auth).

```typescript
const response = await apiClient.getRecommendations({
  max_rent: 2000,
  limit: 10
});
// Returns: { user_id: "...", matches: [...], total_results: 10 }
```

---

### `apiClient.postRoom(data)`
**Location**: `lib/apiClient.ts`

Create room listing (requires auth).

```typescript
await apiClient.postRoom({
  location: "Cambridge",
  rent: 1500,
  // ... other fields
});
// Returns: { id: "...", message: "Room created successfully" }
```

---

### `apiClient.sendChatMessage(message)`
**Location**: `lib/apiClient.ts`

Send message to AI assistant (requires auth).

```typescript
const response = await apiClient.sendChatMessage("Find me rooms under $2000");
// Returns: { response: "...", state: {...}, tools_used: [...] }
```

---

## Token Management

### `getAccessToken()`
Retrieve token from sessionStorage.

### `setAccessToken(token)`
Store token in sessionStorage.

### `clearAccessToken()`
Remove token from sessionStorage.

### `isAuthenticated()`
Check if valid token exists.

---

## Validation Schemas

All in `lib/validation.ts`:

- `signupSchema` - Validates signup form
- `loginSchema` - Validates login form
- `postAdSchema` - Validates post ad form
- `filterSchema` - Validates filter form

**Usage**:
```typescript
const result = signupSchema.safeParse(formData);
if (!result.success) {
  // Handle errors
  console.log(result.error.errors);
}
```

---

## Animation Patterns

### Card Hover Effect
```tsx
<motion.div
  whileHover={{
    scale: 1.02,
    rotateY: 2,
    rotateX: 2,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  }}
  className="card"
>
  {/* content */}
</motion.div>
```

### Modal Animation
```tsx
<motion.div
  initial={{ scale: 0.95, rotateX: 10, y: 20 }}
  animate={{ scale: 1, rotateX: 0, y: 0 }}
  exit={{ scale: 0.95, rotateX: -10, y: 20 }}
  transition={{ type: "spring", duration: 0.5 }}
>
  {/* modal content */}
</motion.div>
```

### Button Interaction
```tsx
<motion.button
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
  className="btn-primary"
>
  Click me
</motion.button>
```

---

## Styling Classes

### Card
```html
<div class="card card-hover p-6">
  <!-- Rounded, bordered, shadow, with hover effect -->
</div>
```

### Pills/Chips
```html
<span class="pill">Regular</span>
<span class="pill-accent">Accent</span>
```

### Buttons
```html
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
```

### Form Elements
```html
<label class="label">Label</label>
<input class="input" />
```

### Headings
```html
<h1 class="heading-xl">Extra Large</h1>
<h2 class="heading-lg">Large</h2>
<h3 class="heading-md">Medium</h3>
<h4 class="heading-sm">Small</h4>
<p class="swiss-heading">SWISS STYLE</p>
```

---

## Responsive Breakpoints

Tailwind default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Example:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 1 col mobile, 2 cols tablet, 3 cols desktop -->
</div>
```

---

This reference guide covers all major components and utilities in the HomieHub frontend. Use it to quickly understand component APIs and usage patterns!
