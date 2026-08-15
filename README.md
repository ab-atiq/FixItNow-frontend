# FixItNow - Frontend

A modern, full-stack service booking platform where customers can book technicians for various services, make payments via Stripe, and manage bookings. Technicians can manage their services and incoming bookings, while admins oversee the entire platform.

## 🌐 Live Applications

- **Frontend**: https://fixitnow-frontend-pi.vercel.app/
- **Backend API**: https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/

## ✨ Features

### For Customers

- ✅ Browse available services and technicians
- ✅ View detailed technician profiles with ratings and reviews
- ✅ Book services with available time slots
- ✅ Manage active and past bookings
- ✅ Secure payment processing via Stripe
- ✅ View payment history
- ✅ Write and read reviews for completed bookings
- ✅ Dashboard for personal bookings and payments

### For Technicians

- ✅ Create and manage service listings
- ✅ View incoming booking requests
- ✅ Accept or decline bookings
- ✅ Update profile and availability
- ✅ View ratings and customer reviews
- ✅ Dashboard to track earnings and performance
- ✅ Manage technician profile information

### For Admins

- ✅ Manage service categories
- ✅ User management (view, ban/unban users)
- ✅ Monitor all bookings and transactions
- ✅ Platform analytics and overview

## 🛠 Tech Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Client**: Axios with custom interceptors
- **Authentication**: JWT tokens (stored in localStorage & cookies)
- **Payment**: Stripe integration
- **Deployment**: Vercel
- **Build Tool**: Next.js built-in

## 📋 Project Setup

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Git

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fixitnow-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api
   NEXT_PUBLIC_STRIPE_KEY=your_stripe_publishable_key
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🧪 Test Credentials

### Customer Account

- **Email**: user_atiq@gmail.com
- **Password**: user123

### Technician Account

- **Email**: technician_bashar@gmail.com
- **Password**: tech123

### Admin Account

- **Email**: admin@gmail.com
- **Password**: admin12345

## 📁 Project Structure

```
fixitnow-frontend/
├── app/                           # Next.js app directory
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/                # Protected dashboard routes
│   │   ├── admin/               # Admin pages
│   │   ├── customer/            # Customer pages
│   │   └── technician/          # Technician pages
│   ├── services/                # Service browsing
│   ├── technicians/             # Technician listings
│   ├── categories/              # Service categories
│   ├── payments/                # Payment success/cancel pages
│   ├── api-proxy/               # Backend API proxy
│   └── layout.tsx
├── components/
│   ├── modules/                 # Feature-specific components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── services/
│   ├── shared/                  # Reusable shared components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/                      # Base UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── DashboardSidebar.tsx
├── lib/
│   ├── api.ts                   # Axios API client
│   ├── auth.ts                  # Authentication utilities
│   └── utils.ts                 # Helper utilities
├── types/
│   └── index.ts                 # TypeScript type definitions
└── public/                      # Static assets
```

## 🔐 Authentication Flow

1. User logs in via `/login` → credentials sent to `/auth/login`
2. Backend returns JWT token + user data
3. Token stored in localStorage and mirrored in cookies
4. Token automatically attached to all API requests
5. Server-side middleware protects `/dashboard/*` routes
6. 401 responses trigger automatic logout

## 📡 API Integration

All backend API endpoints are documented in [API_INTEGRATION.md](API_INTEGRATION.md)

Key endpoints:

- Authentication: `/auth/login`, `/auth/register`, `/auth/me`
- Services: `GET/POST /services`
- Bookings: `GET/POST /bookings`, `PATCH /bookings/:id/status`
- Payments: `POST /payments/create`, `GET /payments`
- Reviews: `POST/GET /reviews`
- Admin: `/admin/users`, `/admin/bookings`, `/admin/categories`

## 🚀 Deployment

The application is deployed on **Vercel**. Any push to the main branch automatically triggers a new deployment.

### Deploy manually:

```bash
vercel deploy --prod
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📄 License

This project is part of an educational assignment for Level 2 Block 7, Module 33.

## 👨‍💻 Support

For issues, questions, or feature requests, please contact the development team or open an issue in the repository.
