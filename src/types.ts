export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "claimed" | "verified" | "rejected";

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  isActive: boolean;
  displayOrder?: number;
}

export interface Practitioner {
  id: string;
  name: string;
  designation: string;
  qualifications?: string;
  registrationNumber?: string;
  experience?: string;
  languages?: string;
  bio?: string;
  isActive: boolean;
}

export interface Slot {
  id: string;
  serviceId: string;
  practitionerId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  activeBookingId?: string | null;
  slotDurationMinutes?: number;
  gapAfterMinutes?: number;
}

export interface Booking {
  id: string;
  slotId: string;
  serviceId: string;
  serviceName: string;
  practitionerId: string;
  practitionerName: string;
  appointmentStart: string;
  appointmentEnd: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAge: number;
  userSex: "male" | "female" | "other" | "prefer_not_to_say";
  concern: string;
  consentAccepted: boolean;
  amount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentProofPath?: string | null;
  paymentProofUrl?: string | null;
  paymentReference?: string | null;
  paymentClaimedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSettings {
  enabled: boolean;
  upiId: string;
  payeeName: string;
  qrImageUrl: string;
  instructions: string;
}

export interface Inquiry {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "reviewed";
  createdAt: string;
}
