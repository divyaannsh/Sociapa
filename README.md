# Admin Dashboard - Next.js

This is a Next.js conversion of the React admin dashboard.

## Getting Started

### Step 1: Setup Assets

Copy the assets folder from the parent directory to the public folder:

```bash
npm run setup
```

This will automatically copy the `assets/` folder from the parent directory to `public/assets/`.

### Step 2: Install Dependencies

Install the required packages:

```bash
npm install
```

### Step 3: Run Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components (Header, Navigation, PageHeader, PageTemplate)
- `styles/` - CSS stylesheets
- `public/` - Static assets (images, CSS, JS files)

## Important Notes

1. Make sure to copy the `assets/` folder from the root directory to `public/assets/` for the theme files, images, and JavaScript files to work properly.

2. The project uses the App Router structure from Next.js 13+.

3. All React Router components have been converted to Next.js equivalents:
   - `BrowserRouter` → Next.js routing
   - `Link` from `react-router-dom` → `Link` from `next/link`
   - `useLocation` → `usePathname` from `next/navigation`
   - `useNavigate` → `useRouter` from `next/navigation`

4. Client-side components use the `'use client'` directive.

## Build for Production

```bash
npm run build
npm start
```

# Sociapa
# Sociapa
