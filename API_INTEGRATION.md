# FixItNow — Frontend / Backend API Integration Map

Backend base URL (configurable via NEXT_PUBLIC_API_URL): https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api

| Backend Endpoint | Method | Frontend Page / Component |
|---|---|---|
| /auth/register | POST | app/(auth)/register/page.tsx -> components/modules/auth/RegisterForm.tsx |
| /auth/login | POST | app/(auth)/login/page.tsx -> components/modules/auth/LoginForm.tsx |
| /auth/me | GET | lib/auth.ts (getUser reads cached user; wire a refresh call here if needed) |
| /categories | GET | app/services/page.tsx (filter dropdown), app/dashboard/admin/page.tsx |
| /categories | POST | app/dashboard/admin/page.tsx (Add Category form) |
| /services | GET | app/page.tsx (featured services), app/services/page.tsx, app/technicians/[id]/page.tsx |
| /services | POST | Not yet wired to a page — add a "Create Service" form to app/dashboard/technician/page.tsx once a TechnicianProfile endpoint exists |
| /bookings | POST | app/technicians/[id]/page.tsx (booking form) |
| /bookings | GET | app/dashboard/customer/page.tsx, app/dashboard/technician/page.tsx |
| /bookings/:id | GET | Not yet wired — add a booking detail page if needed |
| /bookings/:id/status | PATCH | app/dashboard/technician/page.tsx (Accept / Decline buttons) |
| /payments/create | POST | app/dashboard/customer/page.tsx (Pay now button) |
| /payments/confirm | POST | Not yet wired — call after Stripe.js confirms the client secret, or rely on the webhook |
| /payments | GET | app/dashboard/customer/page.tsx (Payment History table) |
| /payments/webhook | POST | Backend-only, called by Stripe. app/payment/success and app/payment/cancel are the browser return pages after Stripe Checkout/Elements redirect |
| /reviews | POST | Not yet wired — add a review form to a completed booking row in app/dashboard/customer/page.tsx |

## Not yet implemented on the backend (frontend has placeholders)

- TechnicianProfile create/update + availability endpoints -> app/dashboard/technician/page.tsx
- Admin: GET /admin/users, PATCH /admin/users/:id (ban/unban) -> app/dashboard/admin/page.tsx
- Admin: GET /admin/bookings, GET /admin/categories

## Auth flow

1. LoginForm / RegisterForm call lib/api.ts -> POST /auth/login or /auth/register
2. On success, lib/auth.ts setAuth() stores the JWT + user in localStorage AND mirrors
   the token + role into cookies (fixitnow_token, fixitnow_role) so that middleware.ts
   can protect /dashboard/* routes on the server side.
3. lib/api.ts automatically attaches "Authorization: Bearer <token>" from localStorage
   to every request unless { auth: false } is passed (used for public GETs and the
   login/register calls themselves).
4. A 401 response from the backend triggers clearAuth() automatically.
