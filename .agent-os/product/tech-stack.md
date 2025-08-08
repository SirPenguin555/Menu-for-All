# Technical Stack

> Last Updated: 2025-08-08
> Version: 1.1.0
> Implementation Status: Authentication System Complete

## Application Framework
- **Framework:** Next.js
- **Version:** 14+ (App Router)
- **Language:** TypeScript
- **Type Checking:** Strict mode enabled

## Database System
- **Primary:** Supabase (PostgreSQL)
- **Type:** Relational Database with real-time capabilities
- **Authentication:** ✅ Supabase Auth (Implemented with custom API routes)
- **Real-time:** Yes
- **Offline Support:** Limited

## JavaScript Framework
- **Framework:** React
- **Version:** Latest stable
- **Build Tool:** Next.js built-in (Turbopack)
- **Import Strategy:** ES Modules

## State Management
- **Library:** Zustand
- **Purpose:** Client-side state management
- **Alternative:** Redux Toolkit (for complex apps)

## Data Fetching & Server State
- **Library:** TanStack Query (React Query)
- **Purpose:** Server state management
- **Features:** Caching, synchronization, background refetching
- **Integration:** Supabase real-time listeners
- **Benefits:** Reduces boilerplate, offline support

## CSS Framework
- **Framework:** TailwindCSS
- **Version:** 4.0+
- **PostCSS:** Yes

## UI Component Library
- **Library:** Tailwind Plus (Tailwind UI)
- **Design System:** Catalyst UI Kit
- **Implementation:** React components
- **Customization:** Tailwind config

## Form Handling
- **Library:** ✅ React Hook Form (Implemented in LoginForm, RegisterForm)
- **Validation:** ✅ Zod schema validation (Comprehensive validation rules)
- **Integration:** ✅ Supabase Auth & Database

## Fonts Provider
- **Provider:** Google Fonts
- **Loading Strategy:** Next.js Font Optimization
- **Fallback:** System font stack

## Icon Library
- **Library:** Phosphor Icons
- **Implementation:** @phosphor-icons/react
- **Default Weight:** Regular
- **Available Weights:** 6 variants (thin, light, regular, bold, fill, duotone)
- **Tree-shaking:** Automatic

## Animation
- **Library:** Framer Motion
- **Purpose:** React animations & gestures
- **Features:** Page transitions, micro-interactions, scroll effects
- **Bundle Size:** ~30kb gzipped
- **Performance:** Hardware-accelerated animations

## Date Handling
- **Library:** date-fns
- **Purpose:** Lightweight date manipulation
- **Timezone:** Native Intl API

## Application Hosting
- **Platform:** Firebase App Hosting
- **Integration:** GitHub deployments
- **Previews:** Automatic PR previews
- **Rollbacks:** One-click rollbacks

## Database Hosting
- **Service:** Supabase Cloud
- **Features:** PostgreSQL, Real-time subscriptions, Row Level Security
- **Regions:** Multi-region deployment available
- **Backup:** Automated backups

## Asset Hosting
- **Service:** Supabase Storage
- **Features:** CDN, Image transformations
- **Security:** Row Level Security
- **Processing:** Automatic optimization

## Deployment Solution
- **Primary:** Firebase App Hosting
- **CI/CD:** GitHub Actions
- **Environment Management:** Multiple environments (dev, staging, production)
- **Preview Deployments:** Automatic for PRs

## External Services

### Recipe Data Sources
- **Web Scraping:** Custom scrapers for recipe websites
- **API Integration:** Recipe APIs where available
- **Data Processing:** Node.js scraping services

### Email Services
- **Transactional Email:** Resend
- **Email Templates:** React Email
- **Features:** Component-based emails, preview mode

### Performance & Monitoring
- **Analytics:** Firebase Analytics
- **Performance:** Firebase Performance Monitoring
- **Error Tracking:** Supabase logging
- **Real User Monitoring:** Core Web Vitals

## Development Tools

### Testing Framework
- **Unit Testing:** Vitest
- **Component Testing:** React Testing Library
- **E2E Testing:** Playwright
- **Coverage:** 80% minimum target
- **Accessibility Testing:** axe-core + @axe-core/react

### Code Quality
- **TypeScript:** Strict mode configuration
- **Linting:** ESLint (Next.js config)
- **Formatting:** Prettier
- **Git Hooks:** Husky + lint-staged
- **Commit Convention:** Conventional Commits

### Development Environment
- **Local Development:** Supabase CLI with local development
- **Environment Variables:** .env.local files
- **Environment Validation:** envalid
- **Hot Reload:** Next.js Fast Refresh

## Code Repository
- **Platform:** GitHub
- **Repository:** Private repository
- **Branching Strategy:** GitHub Flow
- **Protection:** Main branch protected with PR requirements