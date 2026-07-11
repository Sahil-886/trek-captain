// Trek Captain — localStorage Store Abstraction
// Every function here can later be swapped for Supabase calls without touching UI code.

import {
  Captain,
  Trek,
  Participant,
  Payment,
  ItineraryItem,
  Announcement,
} from "./types";
import {
  seedCaptain,
  seedTreks,
  seedParticipants,
  seedPayments,
  seedItinerary,
  seedAnnouncements,
} from "./seed";
import { generateId, computePaymentStatus } from "./utils";

// ---- Storage helpers ----

const KEYS = {
  captain: "tc_captain",
  treks: "tc_treks",
  participants: "tc_participants",
  payments: "tc_payments",
  itinerary: "tc_itinerary",
  announcements: "tc_announcements",
  initialized: "tc_initialized",
} as const;

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getItem<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Initialization ----

export function initializeStore(): void {
  if (!isClient()) return;
  if (localStorage.getItem(KEYS.initialized)) return;
  seedStore();
}

export function seedStore(): void {
  if (!isClient()) return;
  setItem(KEYS.captain, seedCaptain);
  setItem(KEYS.treks, seedTreks);
  setItem(KEYS.participants, seedParticipants);
  setItem(KEYS.payments, seedPayments);
  setItem(KEYS.itinerary, seedItinerary);
  setItem(KEYS.announcements, seedAnnouncements);
  localStorage.setItem(KEYS.initialized, "true");
}

export function resetStore(): void {
  if (!isClient()) return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  seedStore();
}

// ---- Captain ----

export function getCaptain(): Captain {
  return getItem<Captain>(KEYS.captain, seedCaptain);
}

export function updateCaptain(updates: Partial<Captain>): Captain {
  const captain = getCaptain();
  const updated = { ...captain, ...updates };
  setItem(KEYS.captain, updated);
  return updated;
}

// ---- Treks ----

export function getTreks(): Trek[] {
  return getItem<Trek[]>(KEYS.treks, []);
}

export function getTrekById(id: string): Trek | undefined {
  return getTreks().find((t) => t.id === id);
}

export function createTrek(trek: Omit<Trek, "id">): Trek {
  const newTrek: Trek = { ...trek, id: generateId() };
  const treks = getTreks();
  treks.push(newTrek);
  setItem(KEYS.treks, treks);
  return newTrek;
}

export function updateTrek(id: string, updates: Partial<Trek>): Trek | undefined {
  const treks = getTreks();
  const idx = treks.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  treks[idx] = { ...treks[idx], ...updates };
  setItem(KEYS.treks, treks);
  return treks[idx];
}

export function deleteTrek(id: string): void {
  setItem(KEYS.treks, getTreks().filter((t) => t.id !== id));
  // Cascade delete related data
  setItem(KEYS.participants, getParticipants().filter((p) => p.trekId !== id));
  setItem(KEYS.payments, getAllPayments().filter((p) => p.trekId !== id));
  setItem(KEYS.itinerary, getAllItinerary().filter((i) => i.trekId !== id));
  setItem(KEYS.announcements, getAllAnnouncements().filter((a) => a.trekId !== id));
}

// ---- Participants ----

export function getParticipants(trekId?: string): Participant[] {
  const all = getItem<Participant[]>(KEYS.participants, []);
  return trekId ? all.filter((p) => p.trekId === trekId) : all;
}

export function getParticipantById(id: string): Participant | undefined {
  return getItem<Participant[]>(KEYS.participants, []).find((p) => p.id === id);
}

export function addParticipant(participant: Omit<Participant, "id" | "joinedAt">): Participant {
  const newParticipant: Participant = {
    ...participant,
    id: generateId(),
    joinedAt: new Date().toISOString(),
  };
  const participants = getItem<Participant[]>(KEYS.participants, []);
  participants.push(newParticipant);
  setItem(KEYS.participants, participants);
  return newParticipant;
}

export function updateParticipant(id: string, updates: Partial<Participant>): Participant | undefined {
  const participants = getItem<Participant[]>(KEYS.participants, []);
  const idx = participants.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  participants[idx] = { ...participants[idx], ...updates };
  setItem(KEYS.participants, participants);
  return participants[idx];
}

export function removeParticipant(id: string): void {
  setItem(
    KEYS.participants,
    getItem<Participant[]>(KEYS.participants, []).filter((p) => p.id !== id)
  );
  // Also remove their payments
  setItem(
    KEYS.payments,
    getAllPayments().filter((p) => p.participantId !== id)
  );
}

// ---- Payments ----

function getAllPayments(): Payment[] {
  return getItem<Payment[]>(KEYS.payments, []);
}

export function getPayments(trekId?: string): Payment[] {
  const all = getAllPayments();
  return trekId ? all.filter((p) => p.trekId === trekId) : all;
}

export function getPaymentsByParticipant(participantId: string): Payment[] {
  return getAllPayments().filter((p) => p.participantId === participantId);
}

export function recordPayment(
  payment: Omit<Payment, "id" | "status" | "paidAt">
): Payment {
  const trek = getTrekById(payment.trekId);
  const existingPayments = getPaymentsByParticipant(payment.participantId);
  const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0) + payment.amount;
  const pricePerPerson = trek?.pricePerPerson || 0;

  const newPayment: Payment = {
    ...payment,
    id: generateId(),
    status: computePaymentStatus(totalPaid, pricePerPerson),
    paidAt: new Date().toISOString(),
  };

  const payments = getAllPayments();
  payments.push(newPayment);
  setItem(KEYS.payments, payments);
  return newPayment;
}

// ---- Itinerary ----

function getAllItinerary(): ItineraryItem[] {
  return getItem<ItineraryItem[]>(KEYS.itinerary, []);
}

export function getItinerary(trekId: string): ItineraryItem[] {
  return getAllItinerary()
    .filter((i) => i.trekId === trekId)
    .sort((a, b) => a.dayNumber - b.dayNumber || a.time.localeCompare(b.time));
}

export function addItineraryItem(item: Omit<ItineraryItem, "id">): ItineraryItem {
  const newItem: ItineraryItem = { ...item, id: generateId() };
  const items = getAllItinerary();
  items.push(newItem);
  setItem(KEYS.itinerary, items);
  return newItem;
}

export function updateItineraryItem(
  id: string,
  updates: Partial<ItineraryItem>
): ItineraryItem | undefined {
  const items = getAllItinerary();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  setItem(KEYS.itinerary, items);
  return items[idx];
}

export function removeItineraryItem(id: string): void {
  setItem(KEYS.itinerary, getAllItinerary().filter((i) => i.id !== id));
}

export function reorderItinerary(trekId: string, itemId: string, direction: "up" | "down"): void {
  const items = getItinerary(trekId);
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  // Swap times within the same day, or swap dayNumber + time
  const temp = { dayNumber: items[idx].dayNumber, time: items[idx].time };
  items[idx].dayNumber = items[swapIdx].dayNumber;
  items[idx].time = items[swapIdx].time;
  items[swapIdx].dayNumber = temp.dayNumber;
  items[swapIdx].time = temp.time;

  // Update in full list
  const all = getAllItinerary();
  for (const item of items) {
    const allIdx = all.findIndex((i) => i.id === item.id);
    if (allIdx !== -1) {
      all[allIdx] = item;
    }
  }
  setItem(KEYS.itinerary, all);
}

// ---- Announcements ----

function getAllAnnouncements(): Announcement[] {
  return getItem<Announcement[]>(KEYS.announcements, []);
}

export function getAnnouncements(trekId: string): Announcement[] {
  return getAllAnnouncements()
    .filter((a) => a.trekId === trekId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createAnnouncement(
  announcement: Omit<Announcement, "id" | "createdAt">
): Announcement {
  const newAnn: Announcement = {
    ...announcement,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const announcements = getAllAnnouncements();
  announcements.push(newAnn);
  setItem(KEYS.announcements, announcements);
  return newAnn;
}

// ---- Dashboard Stats ----

export function getDashboardStats(): {
  activeTreks: number;
  totalParticipants: number;
  amountCollected: number;
  pendingDues: number;
} {
  const treks = getTreks();
  const activeTreks = treks.filter(
    (t) => t.status === "Upcoming" || t.status === "Ongoing"
  ).length;

  const participants = getParticipants();
  const activeParticipants = participants.filter((p) => p.status !== "Cancelled");
  const totalParticipants = activeParticipants.length;

  const payments = getAllPayments();
  const amountCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate expected revenue for active participants
  let expectedRevenue = 0;
  for (const p of activeParticipants) {
    const trek = treks.find((t) => t.id === p.trekId);
    if (trek) expectedRevenue += trek.pricePerPerson;
  }
  const pendingDues = expectedRevenue - amountCollected;

  return {
    activeTreks,
    totalParticipants,
    amountCollected,
    pendingDues: Math.max(0, pendingDues),
  };
}
