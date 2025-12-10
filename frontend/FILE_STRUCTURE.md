# HomieHub Frontend - Complete File Structure

```
homiehub_frontend/
│
├── 📄 Configuration Files
│   ├── .eslintrc.cjs              # ESLint configuration
│   ├── .gitignore                 # Git ignore rules
│   ├── next.config.js             # Next.js configuration
│   ├── package.json               # Dependencies and scripts
│   ├── postcss.config.js          # PostCSS configuration
│   ├── tailwind.config.ts         # Tailwind CSS configuration
│   └── tsconfig.json              # TypeScript configuration
│
├── 📄 Documentation
│   ├── README.md                  # Main project documentation
│   ├── INSTALLATION.md            # Installation guide
│   ├── QUICKSTART.md              # Quick start and usage guide
│   ├── COMPONENTS.md              # Component reference
│   ├── PROJECT_SUMMARY.md         # Complete project summary
│   └── setup.sh                   # Installation script (executable)
│
├── 📁 app/ (Next.js App Router)
│   │
│   ├── layout.tsx                 # Root layout with Navbar
│   ├── page.tsx                   # Landing page (/)
│   ├── globals.css                # Global styles and utilities
│   │
│   ├── 📁 login/
│   │   └── page.tsx               # Login page (/login)
│   │
│   ├── 📁 signup/
│   │   └── page.tsx               # Signup page (/signup)
│   │
│   └── 📁 app/
│       └── page.tsx               # Main dashboard (/app)
│
├── 📁 components/
│   │
│   ├── 📁 layout/
│   │   ├── Navbar.tsx             # Top navigation bar
│   │   └── Sidebar.tsx            # Dashboard sidebar
│   │
│   ├── 📁 landing/
│   │   ├── RotatingText.tsx       # Animated rotating phrases
│   │   ├── ScrollingInfographic.tsx # Parallax feature display
│   │   └── FeatureGrid.tsx        # Feature cards grid
│   │
│   ├── 📁 rooms/
│   │   └── RoomCard.tsx           # Room listing card
│   │
│   ├── 📁 modals/
│   │   ├── PostAdModal.tsx        # Post room ad dialog
│   │   └── FiltersModal.tsx       # Filter recommendations dialog
│   │
│   └── 📁 chat/
│       └── ChatWidget.tsx         # Floating AI chat assistant
│
└── 📁 lib/
    ├── utils.ts                   # Utility functions (cn, formatCurrency, etc.)
    ├── types.ts                   # TypeScript type definitions
    ├── apiClient.ts               # API client with auth
    └── validation.ts              # Zod validation schemas

```

## File Count by Category

### Configuration (7 files)
- `.eslintrc.cjs`
- `.gitignore`
- `next.config.js`
- `package.json`
- `postcss.config.js`
- `tailwind.config.ts`
- `tsconfig.json`

### Documentation (6 files)
- `README.md`
- `INSTALLATION.md`
- `QUICKSTART.md`
- `COMPONENTS.md`
- `PROJECT_SUMMARY.md`
- `setup.sh`

### Pages (5 files)
- `app/layout.tsx`
- `app/page.tsx`
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/app/page.tsx`

### Components (11 files)
- Layout: `Navbar.tsx`, `Sidebar.tsx`
- Landing: `RotatingText.tsx`, `ScrollingInfographic.tsx`, `FeatureGrid.tsx`
- Rooms: `RoomCard.tsx`
- Modals: `PostAdModal.tsx`, `FiltersModal.tsx`
- Chat: `ChatWidget.tsx`

### Library (4 files)
- `lib/utils.ts`
- `lib/types.ts`
- `lib/apiClient.ts`
- `lib/validation.ts`

### Styles (1 file)
- `app/globals.css`

---

## Total: 34 files

---

## File Descriptions

### 📄 Root Configuration

**package.json**
- Dependencies: React, Next.js, TypeScript, Tailwind, Framer Motion, Zod
- Scripts: dev, build, start, lint

**tsconfig.json**
- TypeScript strict mode enabled
- Path aliases: `@/*` → `./*`
- App Router support

**tailwind.config.ts**
- Custom colors (accent, background)
- Custom animations (fade-in, slide-up, scale-in)
- Extended utilities for 3D effects

**next.config.js**
- React strict mode
- Image domain configuration

---

### 📁 app/ (Pages)

**layout.tsx** - Root layout
- Imports global CSS
- Renders Navbar
- Wraps children

**page.tsx** - Landing page
- Hero with rotating text
- 3D card preview
- Scrolling infographic
- Feature grid
- Trust section
- Footer

**login/page.tsx**
- Email + password form
- Validation
- Token storage
- Redirect to /app

**signup/page.tsx**
- Essential fields only
- Auto-fills defaults
- Validation
- Redirect to /login

**app/page.tsx** - Main dashboard
- Protected route (auth required)
- Sidebar + content layout
- Recommendations grid
- Modals (PostAd, Filters)
- Chat widget

**globals.css**
- Tailwind directives
- Custom utility classes
- Component styles
- 3D perspective utilities

---

### 📁 components/

**layout/Navbar.tsx**
- Sticky navigation
- Scroll detection
- Auth-aware menu
- Hide on /app page

**layout/Sidebar.tsx**
- Fixed left sidebar
- Navigation items
- Logout button
- Dashboard only

**landing/RotatingText.tsx**
- 5 rotating phrases
- 3-second intervals
- 3D flip animation

**landing/ScrollingInfographic.tsx**
- Parallax effects
- Floating labels
- Scroll-triggered

**landing/FeatureGrid.tsx**
- 6 feature cards
- Hover tilt effect
- Staggered animation

**rooms/RoomCard.tsx**
- Complete room info
- Lifestyle chips
- Amenities pills
- 3D hover effect

**modals/PostAdModal.tsx**
- Comprehensive form
- Multi-select chips
- Date validation
- 3D open/close

**modals/FiltersModal.tsx**
- Advanced filters
- Multi-add locations
- Clear all function
- Validation

**chat/ChatWidget.tsx**
- Floating button
- Slide-up drawer
- Message history
- API integration

---

### 📁 lib/

**utils.ts**
- `cn()` - Class merging
- `formatCurrency()` - Money formatting
- `formatDate()` - Date formatting

**types.ts**
- API request/response types
- Room data interface
- Form option constants

**apiClient.ts**
- Token management
- Authorized fetch wrapper
- API methods (signup, login, rooms, etc.)

**validation.ts**
- Zod schemas
- Form validation
- Type inference

---

### 📄 Documentation

**README.md**
- Project overview
- Features
- Tech stack
- Getting started
- Structure

**INSTALLATION.md**
- Prerequisites
- Step-by-step setup
- Troubleshooting
- Deployment guide

**QUICKSTART.md**
- Quick start guide
- Test credentials
- Feature walkthrough
- Tips and tricks

**COMPONENTS.md**
- Component reference
- Props documentation
- Usage examples
- Styling patterns

**PROJECT_SUMMARY.md**
- Complete feature list
- What's been built
- Checklist
- Technologies

**setup.sh**
- One-command setup
- Dependency check
- Installation script

---

## Directory Tree (ASCII)

```
.
├── app
│   ├── app
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── login
│   │   └── page.tsx
│   ├── page.tsx
│   └── signup
│       └── page.tsx
├── components
│   ├── chat
│   │   └── ChatWidget.tsx
│   ├── landing
│   │   ├── FeatureGrid.tsx
│   │   ├── RotatingText.tsx
│   │   └── ScrollingInfographic.tsx
│   ├── layout
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── modals
│   │   ├── FiltersModal.tsx
│   │   └── PostAdModal.tsx
│   └── rooms
│       └── RoomCard.tsx
├── lib
│   ├── apiClient.ts
│   ├── types.ts
│   ├── utils.ts
│   └── validation.ts
├── .eslintrc.cjs
├── .gitignore
├── COMPONENTS.md
├── INSTALLATION.md
├── next.config.js
├── package.json
├── postcss.config.js
├── PROJECT_SUMMARY.md
├── QUICKSTART.md
├── README.md
├── setup.sh
├── tailwind.config.ts
└── tsconfig.json
```

---

## Key File Relationships

### Authentication Flow
1. `app/signup/page.tsx` → `lib/apiClient.ts` → API
2. `app/login/page.tsx` → `lib/apiClient.ts` → sessionStorage
3. `app/app/page.tsx` checks `lib/apiClient.isAuthenticated()`

### Dashboard Flow
1. `app/app/page.tsx` (parent)
   - Uses `components/layout/Sidebar.tsx`
   - Renders `components/rooms/RoomCard.tsx`
   - Shows `components/modals/PostAdModal.tsx`
   - Shows `components/modals/FiltersModal.tsx`
   - Includes `components/chat/ChatWidget.tsx`

### API Integration
1. All pages use `lib/apiClient.ts`
2. `lib/apiClient.ts` uses `lib/types.ts` for TypeScript
3. Forms use `lib/validation.ts` for Zod schemas

### Styling
1. `app/globals.css` defines base styles
2. `tailwind.config.ts` extends Tailwind
3. Components use both Tailwind classes and custom utilities

---

## Important Notes

- All `.tsx` files are client components (`"use client"`)
- No `.env` file needed (APIs are hardcoded)
- `node_modules/` created after `npm install`
- `.next/` created when running dev server
- `package-lock.json` created after install

---

## To Get Started

```bash
# Install
npm install

# Run
npm run dev

# Visit
http://localhost:3000
```

All files are production-ready! 🚀
