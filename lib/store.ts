// Trek Captain — Supabase Store
// Async CRUD functions with a camelCase mapping layer.
// Keeps the same function names as the old localStorage store
// so existing components need minimal changes (just add async/await).

import crypto from "crypto";
import { createClient } from "@/lib/supabase/client";
import {
  Captain,
  Trek,
  Participant,
  Payment,
  Announcement,
  Expense,
  Difficulty,
  TrekStatus,
  ParticipantStatus,
  PaymentMode,
  AnnouncementPriority,
  ItineraryItem,
} from "./types";
import { computePaymentStatus } from "./utils";
import type { Database } from "./database.types";

// ---- Supabase client singleton ----
function supabase() {
  return createClient() as any;
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ---- Mappers: DB rows ↔ App types ----

type DbCaptain = Database["public"]["Tables"]["captains"]["Row"];
type DbTrek = Database["public"]["Tables"]["treks"]["Row"];
type DbParticipant = Database["public"]["Tables"]["participants"]["Row"];
type DbPayment = Database["public"]["Tables"]["payments"]["Row"];
type DbAnnouncement = Database["public"]["Tables"]["announcements"]["Row"];
type DbExpense = Database["public"]["Tables"]["expenses"]["Row"];

function mapCaptain(r: DbCaptain): Captain {
  const fullName = r.full_name || "";
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return {
    id: r.id,
    slug: r.slug,
    brandName: r.brand_name,
    fullName: r.full_name,
    tagline: r.tagline || "",
    bio: r.bio || "",
    avatarUrl: r.avatar_url,
    coverUrl: r.cover_url,
    accentColor: r.accent_color || "#FF6B2C",
    whatsapp: r.whatsapp || "",
    instagram: r.instagram || "",
    email: r.email || "",
    city: r.city || "",
    isPublic: r.is_public ?? true,
    hasShared: r.has_shared ?? false,
    notice: r.notice,
    noticeUpdatedAt: r.notice_updated_at,
    createdAt: r.created_at || "",
    // Legacy compat
    name: r.full_name,
    orgName: r.brand_name,
    avatarInitials: initials || "CP",
  };
}

function mapTrek(r: DbTrek): Trek {
  return {
    id: r.id,
    captainId: r.captain_id,
    slug: r.slug,
    title: r.title,
    location: r.location,
    region: r.region || "",
    startDate: r.start_date,
    endDate: r.end_date,
    difficulty: r.difficulty as Difficulty,
    pricePerPerson: r.price_per_person,
    maxCapacity: r.max_capacity,
    coverColor: r.cover_color || "#FF6B2C",
    meetingPoint: r.meeting_point || "",
    status: r.status as TrekStatus,
    description: r.description || "",
    itinerary: (r.itinerary as ItineraryItem[] | null) || [],
    packingList: (r.packing_list as string[] | null) || [],
    inclusions: (r.inclusions as string[] | null) || [],
    exclusions: (r.exclusions as string[] | null) || [],
    coverUrl: r.cover_url,
    gallery: (r.gallery as string[] | null) || [],
    highlights: r.highlights || "",
    notes: r.notes || "",
    isPublished: r.is_published ?? false,
    createdAt: r.created_at || "",
  };
}

function mapParticipant(r: DbParticipant): Participant {
  return {
    id: r.id,
    trekId: r.trek_id,
    captainId: r.captain_id,
    name: r.name,
    phone: r.phone || "",
    email: r.email || "",
    age: r.age,
    gender: r.gender || "",
    bloodGroup: r.blood_group || "",
    emergencyContact: r.emergency_contact || "",
    emergencyContactPhone: r.emergency_contact_phone || "",
    status: (r.status as ParticipantStatus) || "Confirmed",
    checkedIn: r.checked_in ?? false,
    medicalNotes: r.medical_notes || "",
    createdAt: r.created_at || "",
    // Legacy compat
    joinedAt: r.created_at || "",
  };
}

function mapPayment(r: DbPayment, pricePerPerson?: number, totalPaid?: number): Payment {
  return {
    id: r.id,
    participantId: r.participant_id,
    trekId: r.trek_id,
    captainId: r.captain_id,
    amount: r.amount,
    mode: (r.mode as PaymentMode) || "UPI",
    note: r.note || "",
    paidAt: r.paid_at || "",
    status: computePaymentStatus(totalPaid ?? r.amount, pricePerPerson ?? 0),
  };
}

function mapAnnouncement(r: DbAnnouncement): Announcement {
  return {
    id: r.id,
    trekId: r.trek_id,
    captainId: r.captain_id,
    message: r.message,
    priority: (r.priority as AnnouncementPriority) || "Normal",
    isPublic: r.is_public ?? false,
    createdAt: r.created_at || "",
  };
}

function mapExpense(r: DbExpense): Expense {
  return {
    id: r.id,
    trekId: r.trek_id,
    captainId: r.captain_id,
    title: r.title,
    amount: r.amount,
    category: r.category || "Misc",
    paidBy: r.paid_by || "",
    date: r.date || "",
  };
}

// ---- Slug helpers ----
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---- Initialization (legacy compat — now a no-op) ----
export function initializeStore(): void {
  // No-op — Supabase handles persistence
}
export function seedStore(): void {}
export function resetStore(): void {}

// ---- Captain ----

export async function getCaptain(): Promise<Captain | null> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase()
    .from("captains")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return mapCaptain(data);
}

export async function updateCaptain(
  updates: Partial<{
    slug: string;
    brandName: string;
    fullName: string;
    tagline: string;
    bio: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    accentColor: string;
    whatsapp: string;
    instagram: string;
    email: string;
    city: string;
    isPublic: boolean;
  }>
): Promise<Captain | null> {
  const userId = await getCurrentUserId();

  const dbUpdates: Database["public"]["Tables"]["captains"]["Update"] = {};
  if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
  if (updates.brandName !== undefined) dbUpdates.brand_name = updates.brandName;
  if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
  if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.coverUrl !== undefined) dbUpdates.cover_url = updates.coverUrl;
  if (updates.accentColor !== undefined) dbUpdates.accent_color = updates.accentColor;
  if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
  if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.city !== undefined) dbUpdates.city = updates.city;
  if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;

  const { data, error } = await supabase()
    .from("captains")
    .update(dbUpdates)
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) return null;
  return mapCaptain(data);
}

export async function createCaptainProfile(profile: {
  slug: string;
  brandName: string;
  fullName: string;
  tagline?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  accentColor?: string;
  city?: string;
}): Promise<Captain | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase()
    .from("captains")
    .insert({
      id: userId,
      slug: profile.slug,
      brand_name: profile.brandName,
      full_name: profile.fullName,
      tagline: profile.tagline || null,
      avatar_url: profile.avatarUrl || null,
      cover_url: profile.coverUrl || null,
      accent_color: profile.accentColor || "#FF6B2C",
      city: profile.city || null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to create profile");
  return mapCaptain(data);
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const { data } = await supabase()
    .from("captains")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return !data;
}

// ---- Treks ----

export async function getTreks(): Promise<Trek[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase()
    .from("treks")
    .select("*")
    .eq("captain_id", userId)
    .order("start_date", { ascending: true });

  if (error || !data) return [];
  return data.map(mapTrek);
}

export async function getTrekById(id: string): Promise<Trek | null> {
  const { data, error } = await supabase()
    .from("treks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapTrek(data);
}

export async function createTrek(
  trek: Omit<Trek, "id" | "captainId" | "createdAt" | "slug" | "itinerary" | "packingList" | "inclusions" | "exclusions" | "coverUrl" | "gallery" | "highlights" | "notes" | "isPublished">
): Promise<Trek | null> {
  const userId = await getCurrentUserId();
  const slug = slugify(trek.title);

  const { data, error } = await supabase()
    .from("treks")
    .insert({
      captain_id: userId,
      slug,
      title: trek.title,
      location: trek.location,
      region: trek.region || null,
      start_date: trek.startDate,
      end_date: trek.endDate,
      difficulty: trek.difficulty,
      price_per_person: trek.pricePerPerson,
      max_capacity: trek.maxCapacity,
      cover_color: trek.coverColor || "#FF6B2C",
      meeting_point: trek.meetingPoint || null,
      status: trek.status || "Upcoming",
      description: trek.description || null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapTrek(data);
}

export async function updateTrek(
  id: string,
  updates: Partial<Trek>
): Promise<Trek | null> {
  const dbUpdates: Database["public"]["Tables"]["treks"]["Update"] = {};

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.region !== undefined) dbUpdates.region = updates.region;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
  if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
  if (updates.pricePerPerson !== undefined) dbUpdates.price_per_person = updates.pricePerPerson;
  if (updates.maxCapacity !== undefined) dbUpdates.max_capacity = updates.maxCapacity;
  if (updates.coverColor !== undefined) dbUpdates.cover_color = updates.coverColor;
  if (updates.meetingPoint !== undefined) dbUpdates.meeting_point = updates.meetingPoint;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.itinerary !== undefined) dbUpdates.itinerary = updates.itinerary as unknown as Database["public"]["Tables"]["treks"]["Update"]["itinerary"];
  if (updates.packingList !== undefined) dbUpdates.packing_list = updates.packingList as unknown as Database["public"]["Tables"]["treks"]["Update"]["packing_list"];
  if (updates.inclusions !== undefined) dbUpdates.inclusions = updates.inclusions as unknown as Database["public"]["Tables"]["treks"]["Update"]["inclusions"];
  if (updates.exclusions !== undefined) dbUpdates.exclusions = updates.exclusions as unknown as Database["public"]["Tables"]["treks"]["Update"]["exclusions"];
  if (updates.coverUrl !== undefined) dbUpdates.cover_url = updates.coverUrl;
  if (updates.gallery !== undefined) dbUpdates.gallery = updates.gallery as unknown as Database["public"]["Tables"]["treks"]["Update"]["gallery"];
  if (updates.highlights !== undefined) dbUpdates.highlights = updates.highlights;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;
  if (updates.slug !== undefined) dbUpdates.slug = updates.slug;

  const { data, error } = await supabase()
    .from("treks")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return mapTrek(data);
}

export async function deleteTrek(id: string): Promise<void> {
  await supabase().from("treks").delete().eq("id", id);
}

// ---- Participants ----

export async function getParticipants(trekId?: string): Promise<Participant[]> {
  const userId = await getCurrentUserId();
  let query = supabase()
    .from("participants")
    .select("*")
    .eq("captain_id", userId)
    .order("created_at", { ascending: true });

  if (trekId) {
    query = query.eq("trek_id", trekId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapParticipant);
}

export async function getParticipantById(id: string): Promise<Participant | null> {
  const { data, error } = await supabase()
    .from("participants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapParticipant(data);
}

export async function addParticipant(
  participant: Omit<Participant, "id" | "captainId" | "createdAt" | "joinedAt" | "checkedIn">
): Promise<Participant | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase()
    .from("participants")
    .insert({
      trek_id: participant.trekId,
      captain_id: userId,
      name: participant.name,
      phone: participant.phone || null,
      email: participant.email || null,
      age: participant.age,
      gender: participant.gender || null,
      blood_group: participant.bloodGroup || null,
      emergency_contact: participant.emergencyContact || null,
      emergency_contact_phone: participant.emergencyContactPhone || null,
      status: participant.status || "Confirmed",
      medical_notes: participant.medicalNotes || null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapParticipant(data);
}

export async function updateParticipant(
  id: string,
  updates: Partial<Participant>
): Promise<Participant | null> {
  const dbUpdates: Database["public"]["Tables"]["participants"]["Update"] = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
  if (updates.bloodGroup !== undefined) dbUpdates.blood_group = updates.bloodGroup;
  if (updates.emergencyContact !== undefined) dbUpdates.emergency_contact = updates.emergencyContact;
  if (updates.emergencyContactPhone !== undefined) dbUpdates.emergency_contact_phone = updates.emergencyContactPhone;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.checkedIn !== undefined) dbUpdates.checked_in = updates.checkedIn;
  if (updates.medicalNotes !== undefined) dbUpdates.medical_notes = updates.medicalNotes;

  const { data, error } = await supabase()
    .from("participants")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return mapParticipant(data);
}

export async function removeParticipant(id: string): Promise<void> {
  // Cascade deletes payments via FK
  await supabase().from("participants").delete().eq("id", id);
}

// ---- Payments ----

export async function getPayments(trekId?: string): Promise<Payment[]> {
  const userId = await getCurrentUserId();
  let query = supabase()
    .from("payments")
    .select("*")
    .eq("captain_id", userId)
    .order("paid_at", { ascending: false });

  if (trekId) {
    query = query.eq("trek_id", trekId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((r: DbPayment) => mapPayment(r));
}

export async function getPaymentsByParticipant(participantId: string): Promise<Payment[]> {
  const { data, error } = await supabase()
    .from("payments")
    .select("*")
    .eq("participant_id", participantId)
    .order("paid_at", { ascending: true });

  if (error || !data) return [];
  return data.map((r: DbPayment) => mapPayment(r));
}

export async function recordPayment(
  payment: Omit<Payment, "id" | "captainId" | "paidAt" | "status">
): Promise<Payment | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase()
    .from("payments")
    .insert({
      participant_id: payment.participantId,
      trek_id: payment.trekId,
      captain_id: userId,
      amount: payment.amount,
      mode: payment.mode || null,
      note: payment.note || null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapPayment(data);
}

// ---- Expenses ----

export async function getExpenses(trekId: string): Promise<Expense[]> {
  const { data, error } = await supabase()
    .from("expenses")
    .select("*")
    .eq("trek_id", trekId)
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data.map(mapExpense);
}

export async function addExpense(
  expense: Omit<Expense, "id" | "captainId">
): Promise<Expense | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase()
    .from("expenses")
    .insert({
      trek_id: expense.trekId,
      captain_id: userId,
      title: expense.title,
      amount: expense.amount,
      category: expense.category || null,
      paid_by: expense.paidBy || null,
      date: expense.date || null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapExpense(data);
}

export async function deleteExpense(id: string): Promise<void> {
  await supabase().from("expenses").delete().eq("id", id);
}

// ---- Announcements ----

export async function getAnnouncements(trekId: string): Promise<Announcement[]> {
  const { data, error } = await supabase()
    .from("announcements")
    .select("*")
    .eq("trek_id", trekId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapAnnouncement);
}

export async function createAnnouncement(
  announcement: Omit<Announcement, "id" | "captainId" | "createdAt">
): Promise<Announcement | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase()
    .from("announcements")
    .insert({
      trek_id: announcement.trekId,
      captain_id: userId,
      message: announcement.message,
      priority: announcement.priority || "Normal",
      is_public: announcement.isPublic ?? false,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapAnnouncement(data);
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<{ isPublic: boolean }>
): Promise<void> {
  const dbUpdates: Database["public"]["Tables"]["announcements"]["Update"] = {};
  if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
  await supabase().from("announcements").update(dbUpdates).eq("id", id);
}

// ---- Dashboard Stats ----

export async function getDashboardStats(): Promise<{
  activeTreks: number;
  totalParticipants: number;
  amountCollected: number;
  pendingDues: number;
}> {
  const userId = await getCurrentUserId();

  const [treksRes, participantsRes, paymentsRes] = await Promise.all([
    supabase().from("treks").select("id, status, price_per_person").eq("captain_id", userId),
    supabase().from("participants").select("id, trek_id, status").eq("captain_id", userId),
    supabase().from("payments").select("amount").eq("captain_id", userId),
  ]);

  const treks = treksRes.data || [];
  const participants = participantsRes.data || [];
  const payments = paymentsRes.data || [];

  const activeTreks = treks.filter(
    (t: any) => t.status === "Upcoming" || t.status === "Ongoing"
  ).length;

  const activeParticipants = participants.filter((p: any) => p.status !== "Cancelled");
  const totalParticipants = activeParticipants.length;

  const amountCollected = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  let expectedRevenue = 0;
  for (const p of activeParticipants) {
    const trek = treks.find((t: any) => t.id === p.trek_id);
    if (trek) expectedRevenue += trek.price_per_person;
  }

  return {
    activeTreks,
    totalParticipants,
    amountCollected,
    pendingDues: Math.max(0, expectedRevenue - amountCollected),
  };
}

// ---- Image Upload ----

export async function uploadImage(
  file: File,
  folder: string
): Promise<string | null> {
  const userId = await getCurrentUserId();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;

  const { error } = await supabase().storage
    .from("trek-media")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) return null;

  const { data } = supabase().storage
    .from("trek-media")
    .getPublicUrl(path);

  return data.publicUrl;
}

// ---- LocalStorage migration detection ----

export function hasLocalData(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("tc_treks");
}

export function clearLocalData(): void {
  if (typeof window === "undefined") return;
  const keys = [
    "tc_captain",
    "tc_treks",
    "tc_participants",
    "tc_payments",
    "tc_itinerary",
    "tc_announcements",
    "tc_initialized",
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}

// ---- Part 1 & 3 & 4 & 5: Dashboard V3 Additions ----

export async function getGlobalParticipants(): Promise<any[]> {
  const userId = await getCurrentUserId();
  const [participantsRes, treksRes, paymentsRes] = await Promise.all([
    supabase().from("participants").select("*").eq("captain_id", userId),
    supabase().from("treks").select("id, title, price_per_person").eq("captain_id", userId),
    supabase().from("payments").select("*").eq("captain_id", userId),
  ]);

  const participants = participantsRes.data || [];
  const treks = treksRes.data || [];
  const payments = paymentsRes.data || [];

  return participants.map((p: any) => {
    const trek = treks.find((t: any) => t.id === p.trek_id);
    const trekTitle = trek?.title || "Unknown Trek";
    const pricePerPerson = trek?.price_per_person || 0;

    const pPayments = payments.filter((pay: any) => pay.participant_id === p.id);
    const totalPaid = pPayments.reduce((sum: number, pay: any) => sum + pay.amount, 0);
    const amountPending = Math.max(0, pricePerPerson - totalPaid);

    let paymentStatus: "Paid" | "Partial" | "Pending" = "Pending";
    if (totalPaid >= pricePerPerson && pricePerPerson > 0) {
      paymentStatus = "Paid";
    } else if (totalPaid > 0) {
      paymentStatus = "Partial";
    }

    return {
      ...mapParticipant(p),
      trekTitle,
      pricePerPerson,
      totalPaid,
      amountPending,
      paymentStatus,
      payments: pPayments.map((pay: any) => ({
        id: pay.id,
        participantId: pay.participant_id,
        trekId: pay.trek_id,
        captainId: pay.captain_id,
        amount: pay.amount,
        mode: pay.mode,
        note: pay.note || "",
        paidAt: pay.paid_at,
      })),
    };
  });
}

export async function markAsShared(): Promise<void> {
  const userId = await getCurrentUserId();
  await supabase()
    .from("captains")
    .update({ has_shared: true })
    .eq("id", userId);
}

export async function logPageView(
  slug: string,
  trekSlug: string | null,
  referrer: string,
  ip: string,
  ua: string
): Promise<void> {
  const { data: captain } = await supabase()
    .from("captains")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!captain) return;

  let trekId: string | null = null;
  if (trekSlug) {
    const { data: trek } = await supabase()
      .from("treks")
      .select("id")
      .eq("slug", trekSlug)
      .eq("captain_id", captain.id)
      .maybeSingle();
    if (trek) trekId = trek.id;
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const salt = process.env.VIEW_HASH_SALT || "default-salt-123456";
  const rawInput = `${ip}-${ua}-${dateStr}-${salt}`;
  const visitorHash = crypto.createHash("sha256").update(rawInput).digest("hex").slice(0, 32);

  await supabase()
    .from("page_views")
    .insert({
      captain_id: captain.id,
      trek_id: trekId,
      visitor_hash: visitorHash,
      referrer: referrer || "Direct",
    });
}

export async function getPageViewsStats(): Promise<{
  uniqueViewsLast7Days: number;
  percentChange: number;
  sparkline: number[];
  mostViewedTrekName: string;
  mostViewedTrekCount: number;
  topReferrers: { source: string; count: number }[];
}> {
  const userId = await getCurrentUserId();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [viewsRes, treksRes] = await Promise.all([
    supabase()
      .from("page_views")
      .select("*")
      .eq("captain_id", userId)
      .gte("viewed_at", fourteenDaysAgo.toISOString()),
    supabase()
      .from("treks")
      .select("id, title")
      .eq("captain_id", userId),
  ]);

  const views = viewsRes.data || [];
  const treks = treksRes.data || [];

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7DaysViews = views.filter((v: any) => new Date(v.viewed_at) >= sevenDaysAgo);
  const prev7DaysViews = views.filter((v: any) => new Date(v.viewed_at) < sevenDaysAgo);

  const uniqueLast7 = new Set(last7DaysViews.map((v: any) => v.visitor_hash)).size;
  const uniquePrev7 = new Set(prev7DaysViews.map((v: any) => v.visitor_hash)).size;

  let percentChange = 0;
  if (uniquePrev7 > 0) {
    percentChange = Math.round(((uniqueLast7 - uniquePrev7) / uniquePrev7) * 100);
  } else if (uniqueLast7 > 0) {
    percentChange = 100;
  }

  const sparkline: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayStart = new Date(day.setHours(0, 0, 0, 0));
    const dayEnd = new Date(day.setHours(23, 59, 59, 999));

    const dayViews = last7DaysViews.filter((v: any) => {
      const d = new Date(v.viewed_at);
      return d >= dayStart && d <= dayEnd;
    });
    sparkline.push(dayViews.length);
  }

  const trekViewCounts: Record<string, number> = {};
  views.forEach((v: any) => {
    if (v.trek_id) {
      trekViewCounts[v.trek_id] = (trekViewCounts[v.trek_id] || 0) + 1;
    }
  });

  let mostViewedTrekId = "";
  let mostViewedTrekCount = 0;
  Object.entries(trekViewCounts).forEach(([tid, count]) => {
    if (count > mostViewedTrekCount) {
      mostViewedTrekCount = count;
      mostViewedTrekId = tid;
    }
  });

  const mostViewedTrekName = treks.find((t: any) => t.id === mostViewedTrekId)?.title || "";

  const referrersCount: Record<string, number> = {
    "WhatsApp": 0,
    "Instagram": 0,
    "Google": 0,
    "Direct": 0,
  };

  views.forEach((v: any) => {
    const ref = (v.referrer || "").toLowerCase();
    if (ref.includes("wa.me") || ref.includes("whatsapp")) {
      referrersCount["WhatsApp"] += 1;
    } else if (ref.includes("instagram") || ref.includes("ig")) {
      referrersCount["Instagram"] += 1;
    } else if (ref.includes("google")) {
      referrersCount["Google"] += 1;
    } else {
      referrersCount["Direct"] += 1;
    }
  });

  const topReferrers = Object.entries(referrersCount)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  return {
    uniqueViewsLast7Days: uniqueLast7,
    percentChange,
    sparkline,
    mostViewedTrekName,
    mostViewedTrekCount,
    topReferrers,
  };
}

export async function getPendingDuesList(): Promise<any[]> {
  const userId = await getCurrentUserId();

  const [participantsRes, treksRes, paymentsRes] = await Promise.all([
    supabase().from("participants").select("*").eq("captain_id", userId).neq("status", "Cancelled"),
    supabase().from("treks").select("id, title, start_date, price_per_person").eq("captain_id", userId),
    supabase().from("payments").select("*").eq("captain_id", userId),
  ]);

  const participants = participantsRes.data || [];
  const treks = treksRes.data || [];
  const payments = paymentsRes.data || [];

  const list: any[] = [];

  participants.forEach((p: any) => {
    const trek = treks.find((t: any) => t.id === p.trek_id);
    if (!trek) return;

    const price = trek.price_per_person;
    const pPayments = payments.filter((pay: any) => pay.participant_id === p.id);
    const paid = pPayments.reduce((s: number, pay: any) => s + pay.amount, 0);

    if (paid < price) {
      const pending = price - paid;
      const start = new Date(trek.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      list.push({
        participantId: p.id,
        participantName: p.name,
        participantPhone: p.phone || "",
        trekId: p.trek_id,
        trekTitle: trek.title,
        trekStartDate: trek.start_date,
        pricePerPerson: price,
        amountPaid: paid,
        amountPending: pending,
        daysUntilStart: daysDiff,
      });
    }
  });

  return list.sort((a, b) => new Date(a.trekStartDate).getTime() - new Date(b.trekStartDate).getTime());
}

export async function getGlobalAnnouncements(): Promise<Announcement[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase()
    .from("announcements")
    .select("*")
    .eq("captain_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapAnnouncement);
}

export async function getGlobalExpenses(): Promise<Expense[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase()
    .from("expenses")
    .select("*")
    .eq("captain_id", userId);

  if (error || !data) return [];
  return data.map(mapExpense);
}

export async function updateCaptainNotice(notice: string | null): Promise<void> {
  const userId = await getCurrentUserId();
  const noticeUpdatedAt = notice ? new Date().toISOString() : null;

  await supabase()
    .from("captains")
    .update({
      notice: notice || null,
      notice_updated_at: noticeUpdatedAt,
    })
    .eq("id", userId);
}

