import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type {
  Booking,
  BookingStatus,
  Inquiry,
  PaymentSettings,
  PaymentStatus,
  Practitioner,
  Service,
  Slot,
} from "../types";
import { localDateTimeToDate, toISO } from "../lib/utils";

export async function getAdminBookings(): Promise<Booking[]> {
  const snap = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(200)));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      appointmentStart: toISO(data.appointmentStart),
      appointmentEnd: toISO(data.appointmentEnd),
      paymentClaimedAt: data.paymentClaimedAt ? toISO(data.paymentClaimedAt) : null,
      createdAt: toISO(data.createdAt),
      updatedAt: toISO(data.updatedAt),
    } as Booking;
  });
}

export async function setBookingState(
  bookingId: string,
  status?: BookingStatus,
  paymentStatus?: PaymentStatus
) {
  const changes: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (status) changes.status = status;
  if (paymentStatus) changes.paymentStatus = paymentStatus;
  await updateDoc(doc(db, "bookings", bookingId), changes);
}

export async function getAllServices(): Promise<Service[]> {
  const snap = await getDocs(collection(db, "services"));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) }))
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
}

export async function saveService(service: Omit<Service, "id">, id?: string): Promise<string> {
  if (id) {
    await setDoc(doc(db, "services", id), { ...service, updatedAt: serverTimestamp() }, { merge: true });
    return id;
  }
  const ref = await addDoc(collection(db, "services"), { ...service, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function getAllPractitioners(): Promise<Practitioner[]> {
  const snap = await getDocs(collection(db, "practitioners"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Practitioner, "id">) }));
}

export async function savePractitioner(practitioner: Omit<Practitioner, "id">, id?: string): Promise<string> {
  if (id) {
    await setDoc(doc(db, "practitioners", id), { ...practitioner, updatedAt: serverTimestamp() }, { merge: true });
    return id;
  }
  const ref = await addDoc(collection(db, "practitioners"), {
    ...practitioner,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUpcomingSlots(): Promise<Slot[]> {
  const snap = await getDocs(
    query(collection(db, "slots"), where("startTime", ">=", Timestamp.now()), orderBy("startTime", "asc"), limit(200))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      serviceId: data.serviceId,
      practitionerId: data.practitionerId,
      startTime: toISO(data.startTime),
      endTime: toISO(data.endTime),
      isBooked: Boolean(data.isBooked),
      activeBookingId: data.activeBookingId ?? null,
    };
  });
}

export async function createSlot(service: Service, practitioner: Practitioner, startLocal: string): Promise<string> {
  const start = localDateTimeToDate(startLocal);
  if (start.getTime() <= Date.now()) throw new Error("Slot must be in the future.");
  const end = new Date(start.getTime() + service.duration * 60_000);
  const ref = await addDoc(collection(db, "slots"), {
    serviceId: service.id,
    practitionerId: practitioner.id,
    startTime: Timestamp.fromDate(start),
    endTime: Timestamp.fromDate(end),
    isBooked: false,
    activeBookingId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function removeSlot(slot: Slot): Promise<void> {
  if (slot.isBooked) throw new Error("Booked slots cannot be deleted.");
  await deleteDoc(doc(db, "slots", slot.id));
}

export async function getInquiries(): Promise<Inquiry[]> {
  const snap = await getDocs(query(collection(db, "inquiries"), orderBy("createdAt", "desc"), limit(200)));
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: toISO(data.createdAt) } as Inquiry;
  });
}

export async function markInquiryReviewed(id: string): Promise<void> {
  await updateDoc(doc(db, "inquiries", id), { status: "reviewed" });
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  await setDoc(doc(db, "siteSettings", "payment"), settings, { merge: true });
}
