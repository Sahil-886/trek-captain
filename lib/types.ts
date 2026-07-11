// Trek Captain — Data Model Types

export interface Captain {
  id: string;
  name: string;
  email: string;
  phone: string;
  orgName: string;
  avatarInitials: string;
}

export type Difficulty = "Easy" | "Moderate" | "Hard";
export type TrekStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export interface Trek {
  id: string;
  title: string;
  location: string;
  region: string;
  startDate: string; // ISO date string
  endDate: string;
  difficulty: Difficulty;
  pricePerPerson: number; // INR
  maxCapacity: number;
  coverColor: string;
  status: TrekStatus;
  meetingPoint: string;
  description: string;
}

export type ParticipantStatus = "Confirmed" | "Waitlist" | "Cancelled";

export interface Participant {
  id: string;
  trekId: string;
  name: string;
  phone: string;
  email: string;
  emergencyContact: string;
  bloodGroup: string;
  joinedAt: string; // ISO date string
  status: ParticipantStatus;
}

export type PaymentMode = "UPI" | "Cash" | "Bank";
export type PaymentStatus = "Paid" | "Partial" | "Pending";

export interface Payment {
  id: string;
  participantId: string;
  trekId: string;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  paidAt: string; // ISO date string
  note: string;
}

export type ItineraryType = "Travel" | "Trek" | "Meal" | "Rest" | "Activity";

export interface ItineraryItem {
  id: string;
  trekId: string;
  dayNumber: number;
  time: string; // e.g. "06:00"
  title: string;
  description: string;
  type: ItineraryType;
}

export type AnnouncementPriority = "Normal" | "Urgent";

export interface Announcement {
  id: string;
  trekId: string;
  message: string;
  createdAt: string; // ISO date string
  priority: AnnouncementPriority;
}

// Activity feed item for dashboard
export interface ActivityItem {
  id: string;
  type: "payment" | "join";
  trekId: string;
  trekTitle: string;
  participantName: string;
  detail: string;
  timestamp: string;
}
