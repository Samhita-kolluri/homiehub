# HomieHub Frontend

A sleek, Swiss-style AI-powered roommate matching web application built with Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Landing Page**: Infographic-style landing with rotating hero text, scrolling animations, and 3D card effects
- **Authentication**: Sign up and login with client-side validation using Zod
- **Recommendations Dashboard**: AI-curated roommate matches with beautiful card layouts
- **Post Room Ads**: Create room listings with comprehensive details
- **Advanced Filters**: Filter recommendations by budget, location, lifestyle preferences, and more
- **AI Chat Assistant**: Floating chat widget ("Homie") for conversational search assistance
- **3D Animations**: Smooth micro-interactions using Framer Motion with perspective transforms

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Validation**: Zod
- **API Integration**: Fetch with secure token handling

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
homiehub_frontend/
├── app/
│   ├── layout.tsx          # Root layout with navbar
│   ├── page.tsx            # Landing page
│   ├── login/page.tsx      # Login page
│   ├── signup/page.tsx     # Signup page
│   ├── app/page.tsx        # Main dashboard (authenticated)
│   └── globals.css         # Global styles
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Top navigation bar
│   │   └── Sidebar.tsx     # Dashboard sidebar
│   ├── landing/
│   │   ├── RotatingText.tsx       # Animated rotating phrases
│   │   ├── ScrollingInfographic.tsx # Parallax infographic
│   │   └── FeatureGrid.tsx        # Feature cards
│   ├── rooms/
│   │   └── RoomCard.tsx    # Room listing card
│   ├── modals/
│   │   ├── PostAdModal.tsx    # Post room ad dialog
│   │   └── FiltersModal.tsx   # Filters dialog
│   └── chat/
│       └── ChatWidget.tsx  # Floating AI chat
├── lib/
│   ├── utils.ts            # Utility functions
│   ├── types.ts            # TypeScript types
│   ├── apiClient.ts        # API client with token handling
│   └── validation.ts       # Zod schemas
└── package.json
```

## API Endpoints

### User & Room API
- **Base URL**: `https://homiehub-user-room-api-766767793599.us-east4.run.app`
- `POST /users/register` - Create new user
- `POST /users/login` - Login user
- `POST /rooms` - Create room listing (requires auth)

### Recommendation API
- **Base URL**: `https://homiehub-recommendation-api-766767793599.us-east4.run.app`
- `POST /recommendation` - Get personalized recommendations (requires auth)

### Chat API
- **Base URL**: `https://homiehub-llm-agent-api-766767793599.us-east4.run.app`
- `POST /chat` - Send message to AI assistant (requires auth)

## Security

- Access tokens are stored in `sessionStorage` and **never** rendered in the UI
- All authenticated API calls use the `Authorization: Bearer <token>` header
- Client-side validation with Zod prevents invalid data submission
- TypeScript provides type safety throughout the application

## Design Philosophy

**Swiss Modern Aesthetic**:
- Clean grid layouts with ample white space
- Sharp typography (Inter font family)
- Minimal color palette (off-white background, near-black text, blue accent)
- Strong visual hierarchy with uppercase tracking headings

**3D Micro-Interactions**:
- Perspective transforms on hover (`rotateX`, `rotateY`, `translateZ`)
- Smooth Framer Motion animations
- Card tilts and floating effects
- Scale and shadow transitions

## Key Features

### Signup Flow
- Only collects essential fields (name, email, password, contact, age, gender)
- Auto-fills default values for backend requirements
- Real-time validation with friendly error messages

### Recommendations
- Displays AI-matched rooms with compatibility scores
- Filter by budget, location, lifestyle, amenities, and more
- Beautiful card grid with hover effects

### Post Ad
- Comprehensive form with lifestyle and preference options
- Multi-select for utilities and amenities
- Date validation (30 days past to 1 year future)

### Chat Assistant
- Floating button in bottom-right corner
- Conversational interface with typing indicators
- Powered by LLM agent API

## Build for Production

```bash
npm run build
npm start
```

## License

MIT

---

Built with ❤️ using Next.js, React, TypeScript, Tailwind CSS, and Framer Motion
