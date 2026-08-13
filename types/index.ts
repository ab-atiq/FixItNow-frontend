export type Role = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  skills: string;
  experience: number;
  hourlyRate: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Category {
  id: string;
  categoryName: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  serviceName: string;
  description?: string | null;
  categoryId: string;
  technicianId: string;
  basePrice: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  technician?: TechnicianProfile;
}

export interface Payment {
  id: string;
  transactionId: string;
  bookingId: string;
  amount: number;
  method: string;
  provider: "STRIPE";
  status: PaymentStatus;
  paidAt?: string | null;
}

export interface Booking {
  id: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  payment?: Payment | null;
}

export interface Review {
  id: string;
  customerId: string;
  technicianId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode?: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface LoginResponseData {
  token: string;
  user: User;
}
