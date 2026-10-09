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
  writeBatch,
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
import { indiaDateTimeToDate, toISO } from "../lib/utils";

export const SLOT_DURATION_MINUTES = 15;
export const SLOT_GAP_MINUTES = 15;
export const SLOT_START_INTERVAL_MINUTES = SLOT_DURATION_MINUTES + SLOT_GAP_MINUTES;

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
  const normalized = {
    ...service,
    duration: SLOT_DURATION_MINUTES,
    currency: service.currency || "INR",
  };

  if (id) {
    await setDoc(doc(db, "services", id), { ...normalized, updatedAt: serverTimestamp() }, { merge: true });
    return id;
  }

  const ref = await addDoc(collection(db, "services"), {
    ...normalized,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllPractitioners(): Promise<Practitioner[]> {
  const snap = await getDocs(collection(db, "practitioners"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Practitioner, "id">) }));
}

export async function savePractitioner(practitioner: Omit<Practitioner, "id">, id?: string): Promise<string> {
  const normalized = {
    ...practitioner,
    qualifications: practitioner.qualifications?.trim() || "",
    registrationNumber: practitioner.registrationNumber?.trim() || "",
    experience: practitioner.experience?.trim() || "",
    languages: practitioner.languages?.trim() || "",
    bio: practitioner.bio?.trim() || "",
  };

  if (id) {
    await setDoc(doc(db, "practitioners", id), { ...normalized, updatedAt: serverTimestamp() }, { merge: true });
    return id;
  }

  const ref = await addDoc(collection(db, "practitioners"), {
    ...normalized,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUpcomingSlots(): Promise<Slot[]> {
  const snap = await getDocs(
    query(collection(db, "slots"), where("startTime", ">=", Timestamp.now()), orderBy("startTime", "asc"), limit(300))
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
      slotDurationMinutes: data.slotDurationMinutes ?? SLOT_DURATION_MINUTES,
      gapAfterMinutes: data.gapAfterMinutes ?? SLOT_GAP_MINUTES,
    };
  });
}

interface DailySlotInput {
  service: Service;
  practitioner: Practitioner;
  date: string;
  startTime: string;
  endTime: string;
}

export async function createDailySlots({
  service,
  practitioner,
  date,
  startTime,
  endTime,
}: DailySlotInput): Promise<{ created: number; skipped: number }> {
  const scheduleStart = indiaDateTimeToDate(date, startTime);
  const scheduleEnd = indiaDateTimeToDate(date, endTime);

  if (scheduleEnd.getTime() <= scheduleStart.getTime()) {
    throw new Error("Closing time must be later than opening time.");
  }

  const minimumWindow = SLOT_DURATION_MINUTES * 60_000;
  if (scheduleEnd.getTime() - scheduleStart.getTime() < minimumWindow) {
    throw new Error("The clinic window is too short for a 15-minute appointment.");
  }

  const dayStart = indiaDateTimeToDate(date, "00:00");
  const dayEnd = new Date(indiaDateTimeToDate(date, "23:59").getTime() + 60_000);

  const existingSnap = await getDocs(
    query(
      collection(db, "slots"),
      where("startTime", ">=", Timestamp.fromDate(dayStart)),
      where("startTime", "<", Timestamp.fromDate(dayEnd)),
      orderBy("startTime", "asc")
    )
  );

  const occupiedStarts = new Set(
    existingSnap.docs
      .filter((row) => row.data().practitionerId === practitioner.id)
      .map((row) => (row.data().startTime as Timestamp).toDate().getTime())
  );

  const starts: Date[] = [];
  for (
    let cursor = scheduleStart.getTime();
    cursor + SLOT_DURATION_MINUTES * 60_000 <= scheduleEnd.getTime();
    cursor += SLOT_START_INTERVAL_MINUTES * 60_000
  ) {
    if (cursor <= Date.now()) continue;
    starts.push(new Date(cursor));
  }

  if (!starts.length) {
    throw new Error("No future appointment times fit inside this clinic window.");
  }

  const batch = writeBatch(db);
  let created = 0;
  let skipped = 0;

  starts.forEach((start) => {
    if (occupiedStarts.has(start.getTime())) {
      skipped += 1;
      return;
    }

    const slotRef = doc(collection(db, "slots"));
    const end = new Date(start.getTime() + SLOT_DURATION_MINUTES * 60_000);
    batch.set(slotRef, {
      serviceId: service.id,
      practitionerId: practitioner.id,
      startTime: Timestamp.fromDate(start),
      endTime: Timestamp.fromDate(end),
      slotDurationMinutes: SLOT_DURATION_MINUTES,
      gapAfterMinutes: SLOT_GAP_MINUTES,
      isBooked: false,
      activeBookingId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    created += 1;
  });

  if (created) await batch.commit();
  return { created, skipped };
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
