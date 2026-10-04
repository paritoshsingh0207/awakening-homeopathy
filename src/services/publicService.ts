import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Inquiry, Practitioner, Service } from "../types";
import { toISO } from "../lib/utils";

export async function getActiveServices(): Promise<Service[]> {
  const snap = await getDocs(query(collection(db, "services"), where("isActive", "==", true), limit(50)));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) }))
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
}

export async function getActivePractitioners(): Promise<Practitioner[]> {
  const snap = await getDocs(query(collection(db, "practitioners"), where("isActive", "==", true), limit(50)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Practitioner, "id">) }));
}

export async function submitInquiry(input: Omit<Inquiry, "id" | "createdAt" | "status">): Promise<string> {
  const ref = await addDoc(collection(db, "inquiries"), {
    ...input,
    status: "new",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getRecentPublicServices(): Promise<Service[]> {
  return getActiveServices();
}
