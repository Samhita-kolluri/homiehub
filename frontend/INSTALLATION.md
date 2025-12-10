# HomieHub Frontend - Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** version 18 or higher
- **npm** (comes with Node.js) or **yarn** or **pnpm**

Check your versions:
```bash
node --version  # should be v18.0.0 or higher
npm --version
```

## Step-by-Step Installation

### 1. Navigate to the project directory

```bash
cd /Users/rohit/Desktop/College/NEU/MLops/project/homiehub/homiehub_frontend
```

### 2. Install dependencies

Choose one of the following:

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

**Using pnpm:**
```bash
pnpm install
```

This will install all required packages including:
- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Zod (validation)

### 3. Run the development server

**Using npm:**
```bash
npm run dev
```

**Using yarn:**
```bash
yarn dev
```

**Using pnpm:**
```bash
pnpm dev
```

### 4. Open the application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the HomieHub landing page! 🎉

## Quick Setup Script (macOS/Linux)

For a one-command setup, you can use the provided script:

```bash
chmod +x setup.sh
./setup.sh
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in development mode on port 3000 with hot reload.

### `npm run build`
Builds the app for production to the `.next` folder.

### `npm run start`
Runs the production build (requires running `npm run build` first).

### `npm run lint`
Runs ESLint to check for code quality issues.

## Project Structure Overview

```
homiehub_frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page (/)
│   ├── login/             # Login page (/login)
│   ├── signup/            # Signup page (/signup)
│   ├── app/               # Main dashboard (/app)
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── layout/           # Layout components (Navbar, Sidebar)
│   ├── landing/          # Landing page components
│   ├── rooms/            # Room-related components
│   ├── modals/           # Modal dialogs
│   └── chat/             # Chat widget
├── lib/                   # Utility functions and configurations
│   ├── utils.ts          # Helper functions
│   ├── types.ts          # TypeScript type definitions
│   ├── apiClient.ts      # API integration
│   └── validation.ts     # Zod validation schemas
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
└── README.md              # Project documentation
```

## Configuration Files

### tsconfig.json
TypeScript configuration with strict mode enabled and path aliases configured (`@/*`).

### tailwind.config.ts
Custom Tailwind configuration with:
- Extended color palette (accent colors)
- Custom animations (fade-in, slide-up, scale-in)
- Custom utility classes for 3D effects

### next.config.js
Next.js configuration with:
- React strict mode enabled
- Image domain configuration

## Environment Variables (Optional)

If you need to customize API endpoints, create a `.env.local` file:

```bash
# Not required - APIs are currently hardcoded
# Add this only if you need to override defaults
NEXT_PUBLIC_USER_API_URL=https://homiehub-user-room-api-766767793599.us-east4.run.app
NEXT_PUBLIC_RECOMMENDATION_API_URL=https://homiehub-recommendation-api-766767793599.us-east4.run.app
NEXT_PUBLIC_CHAT_API_URL=https://homiehub-llm-agent-api-766767793599.us-east4.run.app
```

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3000 already in use
**Solution**: Either kill the process using port 3000 or run on a different port:
```bash
# Run on port 3001
PORT=3001 npm run dev
```

### Issue: TypeScript errors during development
**Solution**: Make sure dependencies are installed. Some errors are expected before installation completes.

### Issue: Styles not loading
**Solution**: 
1. Restart the dev server
2. Clear `.next` folder:
```bash
rm -rf .next
npm run dev
```

### Issue: Build errors
**Solution**: Check that all TypeScript files have no errors:
```bash
npm run lint
```

## Production Deployment

### Build for production:
```bash
npm run build
```

### Test production build locally:
```bash
npm run start
```

### Deploy to Vercel (Recommended):

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Deploy with one click

Vercel will automatically detect Next.js and configure everything.

### Deploy to other platforms:

The app can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- DigitalOcean App Platform
- Railway
- Render

## Next Steps

After installation:

1. Read `QUICKSTART.md` for usage guide
2. Explore the landing page at `http://localhost:3000`
3. Create an account or use test credentials
4. Try all features: recommendations, filters, post ad, chat

## Getting Help

- Check `README.md` for feature documentation
- Check `QUICKSTART.md` for usage guide
- Review the code comments in each component
- Check Next.js docs: https://nextjs.org/docs
- Check Tailwind docs: https://tailwindcss.com/docs
- Check Framer Motion docs: https://www.framer.com/motion/

## Development Tips

1. **Hot Reload**: Changes are automatically reflected in the browser
2. **Type Safety**: TypeScript will catch errors at compile time
3. **Component Explorer**: Open components in `components/` to understand structure
4. **API Client**: Check `lib/apiClient.ts` to see how APIs are called
5. **Validation**: Check `lib/validation.ts` to see Zod schemas

Happy coding! 🚀
