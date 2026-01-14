# Next.js Project Setup Instructions

## Initial Setup

1. **Setup Assets (Automatic)**
   
   Run the setup script to automatically copy assets:
   
   ```bash
   cd nextjs
   npm run setup
   ```
   
   This will copy the `assets/` folder from the parent directory to `public/assets/`. This ensures all theme files, images, JavaScript files, and vendor libraries are available to the Next.js application.

   **Manual Alternative:**
   ```bash
   # From the root directory
   cp -r assets nextjs/public/assets
   
   # Or on Windows PowerShell:
   Copy-Item -Path assets -Destination nextjs\public\assets -Recurse
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nextjs/
├── app/                    # Next.js App Router pages
│   ├── layout.js          # Root layout
│   ├── layout-client.js   # Client-side layout wrapper
│   ├── page.js            # Home page
│   ├── analytics/
│   ├── leads/
│   ├── customers/
│   ├── projects/
│   ├── proposal/
│   ├── payment/
│   ├── invoice/
│   ├── reports/
│   ├── apps/
│   ├── settings/
│   ├── widgets/
│   └── help/
├── components/            # React components
│   ├── Header.js
│   ├── Navigation.js
│   ├── PageHeader.js
│   └── PageTemplate.js
├── styles/               # CSS stylesheets
│   ├── index.css
│   └── ClientsCreate.css
├── public/               # Static assets (copy assets/ here)
│   └── assets/          # Theme files, images, JS
├── package.json
├── next.config.js
└── README.md
```

## Key Conversion Changes

### React Router → Next.js
- `BrowserRouter` → Removed (Next.js handles routing)
- `Routes/Route` → File-based routing in `app/` directory
- `Link` from `react-router-dom` → `Link` from `next/link`
- `useLocation()` → `usePathname()` from `next/navigation`
- `useNavigate()` → `useRouter()` from `next/navigation`

### File Extensions
- All `.jsx` files converted to `.js` files
- Client components marked with `'use client'` directive

### Component Structure
- Layout component moved to `app/layout.js`
- Pages converted to Next.js App Router structure
- Client-side scripts handled in `app/layout-client.js`

## Building for Production

```bash
npm run build
npm start
```

