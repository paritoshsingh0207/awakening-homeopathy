import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import type { Booking, PaymentSettings, Practitioner, Service, Slot } from "../types";
import { toISO } from "../lib/utils";

export async function getAvailableSlots(serviceId: string): Promise<Slot[]> {
  const now = Timestamp.now();
  const q = query(
    collection(db, "slots"),
    where("serviceId", "==", serviceId),
    where("isBooked", "==", false),
    where("startTime", ">=", now),
    orderBy("startTime", "asc"),
    limit(100)
  );
  const snap = await getDocs(q);
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

interface CreateBookingInput {
  slot: Slot;
  service: Service;
  practitioner: Practitioner;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAge: number;
  userSex: Booking["userSex"];
  concern: string;
  consentAccepted: boolean;
}

export async function createBooking(input: CreateBookingInput): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Please refresh and try again. Authentication is not ready.");
  if (!input.consentAccepted) throw new Error("Consent is required to create a booking.");

  const bookingRef = doc(collection(db, "bookings"));
  const slotRef = doc(db, "slots", input.slot.id);
  const serviceRef = doc(db, "services", input.service.id);
  const practitionerRef = doc(db, "practitioners", input.practitioner.id);

  await runTransaction(db, async (tx) => {
    const [slotSnap, serviceSnap, practitionerSnap] = await Promise.all([
      tx.get(slotRef),
      tx.get(serviceRef),
      tx.get(practitionerRef),
    ]);

    if (!slotSnap.exists()) throw new Error("This slot no longer exists.");
    if (!serviceSnap.exists()) throw new Error("Service configuration is unavailable.");
    if (!practitionerSnap.exists()) throw new Error("Practitioner configuration is unavailable.");

    const slotData = slotSnap.data();
    const serviceData = serviceSnap.data();
    const practitionerData = practitionerSnap.data();

    if (slotData.isBooked) throw new Error("This slot has just been booked. Please choose another slot.");
    if (!serviceData.isActive) throw new Error("This service is currently unavailable.");
    if (!practitionerData.isActive) throw new Error("This practitioner is currently unavailable.");
    if (slotData.serviceId !== input.service.id || slotData.practitionerId !== input.practitioner.id) {
      throw new Error("Slot information changed. Please select the slot again.");
    }

    const now = serverTimestamp();
    tx.set(bookingRef, {
      slotId: input.slot.id,
      serviceId: input.service.id,
      serviceName: serviceData.name,
      practitionerId: input.practitioner.id,
      practitionerName: practitionerData.name,
      appointmentStart: slotData.startTime,
      appointmentEnd: slotData.endTime,
      userId: user.uid,
      userName: input.userName.trim(),
      userEmail: input.userEmail.trim().toLowerCase(),
      userPhone: input.userPhone.trim(),
      userAge: input.userAge,
      userSex: input.userSex,
      concern: input.concern.trim(),
      consentAccepted: true,
      amount: Number(serviceData.price || 0),
      currency: serviceData.currency || "INR",
      status: "pending",
      paymentStatus: "pending",
      paymentProofPath: null,
      paymentProofUrl: null,
      paymentReference: null,
      createdAt: now,
      updatedAt: now,
    });

    tx.update(slotRef, {
      isBooked: true,
      bookedAt: now,
      activeBookingId: bookingRef.id,
      updatedAt: now,
    });
  });

  return bookingRef.id;
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, "bookings", bookingId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    ...d,
    appointmentStart: toISO(d.appointmentStart),
    appointmentEnd: toISO(d.appointmentEnd),
    paymentClaimedAt: d.paymentClaimedAt ? toISO(d.paymentClaimedAt) : null,
    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  } as Booking;
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const snap = await getDoc(doc(db, "siteSettings", "payment"));
  if (!snap.exists()) {
    return { enabled: false, upiId: "", payeeName: "", qrImageUrl: "", instructions: "" };
  }
  return snap.data() as PaymentSettings;
}

export async function submitPaymentClaim(
  bookingId: string,
  paymentReference: string,
  file?: File | null
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication is not ready.");
  if (!paymentReference.trim() && !file) throw new Error("Add a transaction reference or payment proof.");

  let proofPath: string | null = null;
  let proofUrl: string | null = null;

  if (file) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    proofPath = `payment-proofs/${user.uid}/${bookingId}/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, proofPath);
    await uploadBytes(storageRef, file, { contentType: file.type || "application/octet-stream" });
    proofUrl = await getDownloadURL(storageRef);
  }

  const changes: Record<string, unknown> = {
    paymentReference: paymentReference.trim() || null,
    paymentStatus: "claimed",
    paymentClaimedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (proofPath) changes.paymentProofPath = proofPath;
  if (proofUrl) changes.paymentProofUrl = proofUrl;

  await updateDoc(doc(db, "bookings", bookingId), changes);
}
