# Qbits Partner Portal

A referral partner dashboard for tracking clients, earnings, and commissions.

---

## 📁 Project Structure

```
├── src/                          # 🎨 FRONTEND (React/TypeScript)
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # shadcn/ui primitives (Button, Card, Input, etc.)
│   │   ├── dashboard/            # Dashboard-specific components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── EarningsChart.tsx
│   │   │   ├── ClientsTable.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── PayoutSection.tsx
│   │   │   ├── ReferralLinkCard.tsx
│   │   │   ├── ResourcesSection.tsx
│   │   │   ├── SettingsSection.tsx
│   │   │   ├── OnboardingFlow.tsx
│   │   │   ├── PartnerLevelSystem.tsx
│   │   │   └── ... (more dashboard components)
│   │   ├── layout/               # Layout components (Sidebar, Header)
│   │   │   └── DashboardSidebar.tsx
│   │   └── admin/                # Admin panel components
│   │       ├── AdminStats.tsx
│   │       ├── UsersTable.tsx
│   │       └── LeadPipelineTable.tsx
│   │
│   ├── pages/                    # Page-level components (routes)
│   │   ├── Index.tsx             # Main entry → Dashboard
│   │   ├── Dashboard.tsx         # Partner dashboard
│   │   ├── Auth.tsx              # Login/Signup
│   │   ├── AdminAuth.tsx         # Admin login
│   │   ├── AdminDashboard.tsx    # Admin panel
│   │   ├── Referral.tsx          # Referral link landing page
│   │   └── NotFound.tsx          # 404 page
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.tsx           # Authentication state & methods
│   │   ├── useAdminAuth.ts       # Admin role checking
│   │   ├── useAdminData.ts       # Admin data fetching
│   │   ├── useReferralStats.ts   # Referral statistics
│   │   └── usePullToRefresh.ts   # Mobile pull-to-refresh
│   │
│   ├── lib/                      # Utility functions
│   │   ├── utils.ts              # General utilities (cn, etc.)
│   │   ├── currency.ts           # Currency formatting
│   │   └── invoiceGenerator.ts   # PDF invoice generation
│   │
│   ├── data/                     # Mock/static data
│   │   └── mockData.ts           # Sample clients, earnings data
│   │
│   ├── integrations/             # External service clients
│   │   └── supabase/
│   │       ├── client.ts         # ⚠️ AUTO-GENERATED - DO NOT EDIT
│   │       └── types.ts          # ⚠️ AUTO-GENERATED - DO NOT EDIT
│   │
│   ├── App.tsx                   # Root component with routing
│   ├── App.css                   # Global styles
│   ├── index.css                 # Tailwind base + design tokens
│   └── main.tsx                  # React entry point
│
├── supabase/                     # 🔧 BACKEND (Supabase)
│   ├── functions/                # Edge Functions (serverless backend)
│   │   └── grant-admin/          # Example: Grant admin role
│   │       └── index.ts
│   ├── migrations/               # Database migrations (auto-managed)
│   └── config.toml               # ⚠️ AUTO-GENERATED - DO NOT EDIT
│
├── public/                       # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   └── placeholder.svg
│
└── Configuration files
    ├── index.html                # HTML entry point
    ├── vite.config.ts            # Vite bundler config
    ├── tailwind.config.ts        # Tailwind CSS config + design tokens
    ├── tsconfig.json             # TypeScript config
    └── eslint.config.js          # ESLint rules
```

---

## 🎨 Frontend Guide (`src/`)

### Adding a New Page
1. Create component in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. If protected, wrap with `<ProtectedRoute>`

### Adding a Dashboard Component
1. Create in `src/components/dashboard/YourComponent.tsx`
2. Import and use in `src/pages/Dashboard.tsx`

### Adding a Reusable Hook
1. Create in `src/hooks/useYourHook.ts`
2. Follow existing patterns (useAuth, useAdminData)

### Design System
- Colors & tokens defined in `src/index.css`
- Use semantic classes: `bg-background`, `text-foreground`, `bg-accent`
- shadcn components in `src/components/ui/`

---

## 🔧 Backend Guide (`supabase/`)

### Database Tables
- `profiles` - User profiles with referral codes
- `leads` - Client leads in the pipeline
- `referrals` - Referral tracking between users
- `commissions` - Earnings from referrals
- `user_roles` - Admin/moderator roles

### Adding an Edge Function
1. Create folder: `supabase/functions/your-function/`
2. Add `index.ts` with Deno handler
3. Functions deploy automatically

### Database Changes
- Use migrations (managed via Lovable)
- Never edit `types.ts` directly - it's auto-generated

---

## 🔑 Key Files Reference

| What you want to change | File to edit |
|------------------------|--------------|
| Dashboard layout | `src/pages/Dashboard.tsx` |
| Sidebar navigation | `src/components/layout/DashboardSidebar.tsx` |
| Stats cards | `src/components/dashboard/StatsCard.tsx` |
| Client table | `src/components/dashboard/ClientsTable.tsx` |
| Earnings/Payouts | `src/components/dashboard/PayoutSection.tsx` |
| Partner levels | `src/components/dashboard/PartnerLevelSystem.tsx` |
| Leaderboard | `src/components/dashboard/Leaderboard.tsx` |
| Resources page | `src/components/dashboard/ResourcesSection.tsx` |
| Settings/Profile | `src/components/dashboard/SettingsSection.tsx` |
| Onboarding flow | `src/components/dashboard/OnboardingFlow.tsx` |
| Authentication | `src/hooks/useAuth.tsx` |
| Colors/Theme | `src/index.css` + `tailwind.config.ts` |
| Mock data | `src/data/mockData.ts` |

---

## ⚠️ Files NOT to Edit (Auto-Generated)

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/config.toml`
- `.env`

---

## 🚀 Quick Commands

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Production build
npm run preview      # Preview production build
```

---

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Charts**: Recharts
