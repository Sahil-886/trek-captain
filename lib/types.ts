// Trek Captain — Application Types
// These use camelCase to match existing components.
// The store layer maps between these and the snake_case DB columns.

export interface Captain {
  id: string;
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
  hasShared: boolean;
  notice: string | null;
  noticeUpdatedAt: string | null;
  createdAt: string;
  // Legacy compat — computed from fullName
  name: string;
  orgName: string;
  avatarInitials: string;
}

export type Difficulty = "Easy" | "Moderate" | "Hard";
export type TrekStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
}

export interface Trek {
  id: string;
  captainId: string;
  slug: string;
  title: string;
  location: string;
  region: string;
  startDate: string;
  endDate: string;
  difficulty: Difficulty;
  pricePerPerson: number;
  maxCapacity: number;
  coverColor: string;
  meetingPoint: string;
  status: TrekStatus;
  description: string;
  // New Supabase fields
  itinerary: ItineraryItem[];
  packingList: string[];
  inclusions: string[];
  exclusions: string[];
  coverUrl: string | null;
  gallery: string[];
  highlights: string;
  notes: string;
  isPublished: boolean;
  createdAt: string;
}

export type ParticipantStatus = "Confirmed" | "Waitlist" | "Cancelled";

export interface Participant {
  id: string;
  trekId: string;
  captainId: string;
  name: string;
  phone: string;
  email: string;
  age: number | null;
  gender: string;
  bloodGroup: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  status: ParticipantStatus;
  checkedIn: boolean;
  medicalNotes: string;
  createdAt: string;
  // Legacy compat
  joinedAt: string;
}

export type PaymentMode = "UPI" | "Cash" | "Bank";
export type PaymentStatus = "Paid" | "Partial" | "Pending";

export interface Payment {
  id: string;
  participantId: string;
  trekId: string;
  captainId: string;
  amount: number;
  mode: PaymentMode;
  note: string;
  paidAt: string;
  // Computed — not in DB
  status: PaymentStatus;
}

export interface Expense {
  id: string;
  trekId: string;
  captainId: string;
  title: string;
  amount: number;
  category: string;
  paidBy: string;
  date: string;
}

export type AnnouncementPriority = "Normal" | "Urgent";

export interface Announcement {
  id: string;
  trekId: string;
  captainId: string;
  message: string;
  priority: AnnouncementPriority;
  isPublic: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: "payment" | "join" | "publish" | "announcement";
  trekId: string;
  trekTitle: string;
  participantName: string;
  detail: string;
  timestamp: string;
}

export interface PageView {
  id: string;
  captainId: string;
  trekId: string | null;
  visitorHash: string;
  referrer: string;
  viewedAt: string;
}

export interface DuesItem {
  participantId: string;
  participantName: string;
  participantPhone: string;
  trekId: string;
  trekTitle: string;
  trekStartDate: string;
  pricePerPerson: number;
  amountPaid: number;
  amountPending: number;
  daysUntilStart: number;
}
