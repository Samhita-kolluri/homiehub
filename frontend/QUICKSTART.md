# HomieHub Frontend - Quick Start Guide

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to http://localhost:3000

## Default Test Credentials

For testing the application, you can use these sample credentials:

**Email**: `rachel.kim@startup.io`
**Password**: `rachelkim`

Or create a new account via the signup page.

## Application Flow

### 1. Landing Page (/)
- View the product overview
- Click "Get started" to sign up
- Click "View listings" or "Launch app" to login

### 2. Signup (/signup)
Only enter these required fields:
- Full Name
- Email
- Password
- Contact Number
- Age
- Gender

All other preferences are set to defaults and can be adjusted later via filters.

### 3. Login (/login)
- Enter email and password
- Access token is stored securely in sessionStorage
- Redirects to dashboard on success

### 4. Main Dashboard (/app)
- View AI-curated room recommendations
- Click sidebar options to:
  - **Post an ad**: Create a new room listing
  - **Filters**: Refine recommendations by budget, location, lifestyle, etc.
- Each room card displays:
  - Location and rent
  - Room details (type, bedrooms, bathrooms)
  - Lifestyle preferences
  - Amenities and utilities
  - Contact button

### 5. Post a Room Ad
- Fill in all required room details
- Select amenities and utilities by clicking chips
- Submit to create listing

### 6. Apply Filters
- Adjust max rent and result limit
- Set gender and room type preferences
- Add preferred locations
- Choose lifestyle preferences
- Add interests (optional)
- Apply filters to refresh recommendations

### 7. Chat with Homie
- Click the floating chat button (💬) in bottom-right
- Ask questions like:
  - "Find me rooms under $2000"
  - "Show me vegetarian-friendly places"
  - "What's available in Cambridge?"
- Get AI-powered responses

## Features Showcase

### Animations
- **Hero**: Rotating taglines with 3D flip transitions
- **Cards**: Hover for scale, tilt, and shadow effects
- **Modals**: 3D perspective open/close animations
- **Scroll**: Parallax infographic section
- **Chat**: Slide-up drawer with typing indicators

### Validation
- Real-time form validation
- Inline error messages
- Date constraints (move-in dates, room availability)
- Phone number format validation
- Interest limits (max 20, 50 chars each)

### UX Polish
- Loading states with skeleton cards
- Error states with retry buttons
- Empty states with helpful CTAs
- Toast notifications (on signup success)
- Disabled states during submission

## Troubleshooting

### Dependencies not installing?
Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

### TypeScript errors?
The errors you see are expected before dependencies are installed. Run `npm install` first.

### API not responding?
Check your internet connection. The APIs are hosted on Google Cloud Run.

### Token expired?
Logout and login again. Tokens are session-based.

## Next Steps

- Explore all pages and interactions
- Test the chat assistant
- Create a room listing
- Apply different filter combinations
- Observe the smooth animations throughout

Enjoy exploring HomieHub! 🏠
