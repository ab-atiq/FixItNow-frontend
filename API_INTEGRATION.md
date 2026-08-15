# FixItNow — Frontend / Backend API Integration Map

Backend base URL (configurable via NEXT_PUBLIC_API_URL): https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api

## Public Routes

| Backend Endpoint | Method | Frontend Page / Component                                                                                                                                        |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| /auth/register   | POST   | [app/(auth)/register/page.tsx](<app/(auth)/register/page.tsx>) -> [RegisterForm.tsx](components/modules/auth/RegisterForm.tsx)                                   |
| /auth/login      | POST   | [app/(auth)/login/page.tsx](<app/(auth)/login/page.tsx>) -> [LoginForm.tsx](components/modules/auth/LoginForm.tsx)                                               |
| /auth/me         | GET    | [lib/auth.ts](lib/auth.ts) (getUser reads cached user; wire a refresh call here if needed)                                                                       |
| /services        | GET    | [app/page.tsx](app/page.tsx) (featured services), [app/services/page.tsx](app/services/page.tsx), [app/technicians/[id]/page.tsx](app/technicians/[id]/page.tsx) |
| /categories      | GET    | [app/services/page.tsx](app/services/page.tsx) (filter dropdown), [app/categories/page.tsx](app/categories/page.tsx)                                             |
| /technicians     | GET    | [app/technicians/page.tsx](app/technicians/page.tsx) (technician listing)                                                                                        |
| /technicians/:id | GET    | [app/technicians/[id]/page.tsx](app/technicians/[id]/page.tsx) (technician detail)                                                                               |
| /bookings        | POST   | [app/technicians/[id]/page.tsx](app/technicians/[id]/page.tsx) (booking form)                                                                                    |

## Admin Dashboard Routes

**Base layout:** [app/dashboard/layout.tsx](app/dashboard/layout.tsx) with [DashboardSidebar.tsx](components/ui/DashboardSidebar.tsx)

| Backend Endpoint | Method | Frontend Page / Component                                                                                              |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| /categories      | GET    | [app/dashboard/admin/service-categories/page.tsx](app/dashboard/admin/service-categories/page.tsx)                     |
| /categories      | POST   | [app/dashboard/admin/service-categories/page.tsx](app/dashboard/admin/service-categories/page.tsx) (Add/Edit Category) |
| /admin/users     | GET    | [app/dashboard/admin/user-management/page.tsx](app/dashboard/admin/user-management/page.tsx)                           |
| /admin/users/:id | PATCH  | [app/dashboard/admin/user-management/page.tsx](app/dashboard/admin/user-management/page.tsx) (ban/unban)               |
| /admin/bookings  | GET    | [app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx) (admin overview)                                          |

## Customer Dashboard Routes

**Base layout:** [app/dashboard/layout.tsx](app/dashboard/layout.tsx)

| Backend Endpoint     | Method | Frontend Page / Component                                                                                   |
| -------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| /bookings            | GET    | [app/dashboard/customer/my-bookings/page.tsx](app/dashboard/customer/my-bookings/page.tsx)                  |
| /bookings/:id        | GET    | [app/dashboard/customer/my-bookings/page.tsx](app/dashboard/customer/my-bookings/page.tsx) (booking detail) |
| /payments            | GET    | [app/dashboard/customer/payment-history/page.tsx](app/dashboard/customer/payment-history/page.tsx)          |
| /payments/create     | POST   | [app/dashboard/customer/page.tsx](app/dashboard/customer/page.tsx) (Pay now button)                         |
| /payments/confirm    | POST   | Called after Stripe checkout confirmation                                                                   |
| /reviews             | GET    | [app/dashboard/customer/reviews/page.tsx](app/dashboard/customer/reviews/page.tsx)                          |
| /reviews             | POST   | [app/dashboard/customer/reviews/page.tsx](app/dashboard/customer/reviews/page.tsx) (submit review)          |
| /bookings/:id/review | POST   | [app/dashboard/customer/reviews/page.tsx](app/dashboard/customer/reviews/page.tsx)                          |

## Technician Dashboard Routes

**Base layout:** [app/dashboard/layout.tsx](app/dashboard/layout.tsx)

| Backend Endpoint     | Method | Frontend Page / Component                                                                                                     |
| -------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| /services            | GET    | [app/dashboard/technician/page.tsx](app/dashboard/technician/page.tsx)                                                        |
| /services            | POST   | [app/dashboard/technician/create-service/page.tsx](app/dashboard/technician/create-service/page.tsx)                          |
| /bookings            | GET    | [app/dashboard/technician/incoming-bookings/page.tsx](app/dashboard/technician/incoming-bookings/page.tsx)                    |
| /bookings/:id/status | PATCH  | [app/dashboard/technician/incoming-bookings/page.tsx](app/dashboard/technician/incoming-bookings/page.tsx) (Accept/Decline)   |
| /technician/profile  | GET    | [app/dashboard/technician/technician-profile/page.tsx](app/dashboard/technician/technician-profile/page.tsx)                  |
| /technician/profile  | PUT    | [app/dashboard/technician/technician-profile/page.tsx](app/dashboard/technician/technician-profile/page.tsx) (update profile) |
| /reviews             | GET    | [app/dashboard/technician/reviews/page.tsx](app/dashboard/technician/reviews/page.tsx)                                        |

## Payment Flow

| Backend Endpoint  | Method | Frontend Page / Component                                                                 |
| ----------------- | ------ | ----------------------------------------------------------------------------------------- |
| /payments/webhook | POST   | Backend-only, called by Stripe webhook                                                    |
| (Stripe Redirect) | -      | [app/payments/success/page.tsx](app/payments/success/page.tsx) (after successful payment) |
| (Stripe Redirect) | -      | [app/payments/cancel/page.tsx](app/payments/cancel/page.tsx) (payment cancelled)          |

## Shared Components

| Component                                                       | Location                      | Usage                          |
| --------------------------------------------------------------- | ----------------------------- | ------------------------------ |
| [StatusBadge.tsx](components/modules/dashboard/StatusBadge.tsx) | components/modules/dashboard/ | Status indicators in dashboard |
| [ServiceCard.tsx](components/modules/services/ServiceCard.tsx)  | components/modules/services/  | Service display cards          |
| [Navbar.tsx](components/shared/Navbar.tsx)                      | components/shared/            | Top navigation                 |
| [Footer.tsx](components/shared/Footer.tsx)                      | components/shared/            | Page footer                    |
| [Button.tsx](components/ui/Button.tsx)                          | components/ui/                | Reusable button component      |
| [Card.tsx](components/ui/Card.tsx)                              | components/ui/                | Reusable card component        |
| [Input.tsx](components/ui/Input.tsx)                            | components/ui/                | Reusable input component       |
| [DashboardSidebar.tsx](components/ui/DashboardSidebar.tsx)      | components/ui/                | Dashboard navigation sidebar   |

## Authentication Flow

1. **Registration/Login**: [LoginForm.tsx](components/modules/auth/LoginForm.tsx) / [RegisterForm.tsx](components/modules/auth/RegisterForm.tsx) call [lib/api.ts](lib/api.ts) → POST /auth/login or /auth/register
2. **Token Storage**: On success, [lib/auth.ts](lib/auth.ts) `setAuth()` stores the JWT + user in localStorage AND mirrors the token + role into cookies (fixitnow_token, fixitnow_role) for server-side middleware protection on `/dashboard/*` routes
3. **API Requests**: [lib/api.ts](lib/api.ts) automatically attaches `Authorization: Bearer <token>` from localStorage to every request unless `{ auth: false }` is passed (used for public GETs and login/register calls)
4. **Error Handling**: A 401 response from the backend triggers `clearAuth()` automatically, redirecting to login

## Route Protection & Access Control

- **Public Routes**: `/`, `/login`, `/register`, `/services`, `/categories`, `/technicians`, `/about`
- **Protected Routes** (require authentication):
  - `/dashboard/customer/*` - customer booking, payment history, and reviews
  - `/dashboard/technician/*` - technician service management and incoming bookings
  - `/dashboard/admin/*` - admin user and service category management
- **Role-based Access**: Enforced via middleware on server-side and component-level checks on client-side

## API Proxy Configuration

- API proxy configured in [proxy.ts](proxy.ts)
- All backend requests routed through [app/api-proxy/[...path]/route.ts](app/api-proxy/[...path]/route.ts)
- See [API_INTEGRATION.md](API_INTEGRATION.md) for detailed endpoint mapping
