// Trek Captain — Demo Seed Data
import {
  Captain,
  Trek,
  Participant,
  Payment,
  ItineraryItem,
  Announcement,
} from "./types";

export const seedCaptain: Captain = {
  id: "captain-001",
  name: "Arjun Deshmukh",
  email: "arjun@trekcaptain.in",
  phone: "9876543210",
  orgName: "Summit Seekers",
  avatarInitials: "AD",
};

export const seedTreks: Trek[] = [
  {
    id: "trek-001",
    title: "Kalsubai Night Trek",
    location: "Kalsubai Peak, Ahmednagar",
    region: "Sahyadris",
    startDate: "2026-08-14T00:00:00.000Z",
    endDate: "2026-08-15T00:00:00.000Z",
    difficulty: "Moderate",
    pricePerPerson: 1800,
    maxCapacity: 25,
    coverColor: "#FF6B2C",
    status: "Upcoming",
    meetingPoint: "Kasara Railway Station, East Exit, 11:00 PM",
    description:
      "Scale the highest peak in Maharashtra under the stars! Kalsubai Night Trek is a thrilling moonlit adventure through rocky terrain and iron ladders, rewarding you with a spectacular sunrise from 1,646 meters above sea level.",
  },
  {
    id: "trek-002",
    title: "Harishchandragad via Nalichi Vaat",
    location: "Harishchandragad, Ahmednagar",
    region: "Sahyadris",
    startDate: "2026-08-22T00:00:00.000Z",
    endDate: "2026-08-24T00:00:00.000Z",
    difficulty: "Hard",
    pricePerPerson: 3500,
    maxCapacity: 20,
    coverColor: "#2DD4A7",
    status: "Upcoming",
    meetingPoint: "Shivajinagar Bus Stand, Pune, 6:00 AM",
    description:
      "One of the most challenging treks in the Sahyadris! The ancient Nalichi Vaat route takes you through dense forests, rock patches, and a thrilling exposed traverse to reach the iconic Konkan Kada — the largest overhang in Asia.",
  },
  {
    id: "trek-003",
    title: "Rajmachi Monsoon Trek",
    location: "Rajmachi Fort, Lonavala",
    region: "Sahyadris",
    startDate: "2026-07-05T00:00:00.000Z",
    endDate: "2026-07-06T00:00:00.000Z",
    difficulty: "Easy",
    pricePerPerson: 1500,
    maxCapacity: 30,
    coverColor: "#818CF8",
    status: "Completed",
    meetingPoint: "Lonavala Railway Station, Main Exit, 7:00 AM",
    description:
      "Experience the magic of the Western Ghats in full monsoon glory! Rajmachi is a beginner-friendly trek through lush green valleys, cascading waterfalls, and misty trails leading to the twin forts of Shrivardhan and Manaranjan.",
  },
];

const firstNames = [
  "Priya", "Rohan", "Sneha", "Aditya", "Meera", "Vikram", "Ananya", "Karan",
  "Nisha", "Aryan", "Pooja", "Rahul", "Tanvi", "Siddharth", "Kavya", "Nikhil",
  "Divya", "Aman", "Riya", "Varun", "Isha", "Harsh", "Neha", "Yash",
  "Simran", "Dev", "Sakshi", "Rajesh", "Ankita", "Manish",
];

const lastNames = [
  "Sharma", "Patil", "Kulkarni", "Joshi", "Rao", "Gupta", "Desai", "Nair",
  "Mehta", "Iyer", "Reddy", "Bhat", "Patel", "Singh", "Kumar", "Verma",
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(): string {
  const prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "88", "87"];
  return randomPick(prefixes) + Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateParticipants(trekId: string, count: number, baseDate: string): Participant[] {
  const participants: Participant[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = `${randomPick(firstNames)} ${randomPick(lastNames)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const joinDate = new Date(baseDate);
    joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 30) - 5);

    const statuses: Array<"Confirmed" | "Waitlist" | "Cancelled"> = [
      "Confirmed", "Confirmed", "Confirmed", "Confirmed",
      "Confirmed", "Confirmed", "Confirmed", "Waitlist", "Cancelled",
    ];

    participants.push({
      id: `p-${trekId}-${(i + 1).toString().padStart(3, "0")}`,
      trekId,
      name,
      phone: generatePhone(),
      email: name.toLowerCase().replace(" ", ".") + "@gmail.com",
      emergencyContact: generatePhone(),
      bloodGroup: randomPick(bloodGroups),
      joinedAt: joinDate.toISOString(),
      status: randomPick(statuses),
    });
  }
  return participants;
}

export const seedParticipants: Participant[] = [
  ...generateParticipants("trek-001", 10, "2026-08-14"),
  ...generateParticipants("trek-002", 8, "2026-08-22"),
  ...generateParticipants("trek-003", 12, "2026-07-05"),
];

function generatePayments(
  participants: Participant[],
  trekPrices: Record<string, number>
): Payment[] {
  const payments: Payment[] = [];
  const modes: Array<"UPI" | "Cash" | "Bank"> = ["UPI", "UPI", "UPI", "Cash", "Bank"];

  participants.forEach((p) => {
    if (p.status === "Cancelled") return;

    const price = trekPrices[p.trekId] || 0;
    const roll = Math.random();

    if (roll < 0.4) {
      // Full payment
      const paidDate = new Date(p.joinedAt);
      paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 3) + 1);
      payments.push({
        id: `pay-${p.id}-full`,
        participantId: p.id,
        trekId: p.trekId,
        amount: price,
        mode: randomPick(modes),
        status: "Paid",
        paidAt: paidDate.toISOString(),
        note: "Full payment",
      });
    } else if (roll < 0.7) {
      // Partial payment
      const partialAmount = Math.round(price * (0.3 + Math.random() * 0.4));
      const paidDate = new Date(p.joinedAt);
      paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 3) + 1);
      payments.push({
        id: `pay-${p.id}-partial`,
        participantId: p.id,
        trekId: p.trekId,
        amount: partialAmount,
        mode: randomPick(modes),
        status: "Partial",
        paidAt: paidDate.toISOString(),
        note: "Advance payment",
      });
    }
    // else: no payment (Pending) — nothing to add
  });

  return payments;
}

const trekPriceMap: Record<string, number> = {
  "trek-001": 1800,
  "trek-002": 3500,
  "trek-003": 1500,
};

export const seedPayments: Payment[] = generatePayments(seedParticipants, trekPriceMap);

export const seedItinerary: ItineraryItem[] = [
  // Kalsubai Night Trek (trek-001) — Day 1 & 2
  { id: "it-001-01", trekId: "trek-001", dayNumber: 1, time: "23:00", title: "Meet at Kasara Station", description: "Assemble at the east exit of Kasara station. Head count and introductions.", type: "Travel" },
  { id: "it-001-02", trekId: "trek-001", dayNumber: 1, time: "23:30", title: "Depart for Bari Village", description: "Private bus to the base village. 1.5 hour drive through the ghats.", type: "Travel" },
  { id: "it-001-03", trekId: "trek-001", dayNumber: 2, time: "01:00", title: "Begin Night Trek", description: "Start the ascent from Bari village. Headlamps on, moderate pace.", type: "Trek" },
  { id: "it-001-04", trekId: "trek-001", dayNumber: 2, time: "03:30", title: "Rest Point — Iron Ladders", description: "Quick snack break at the famous iron ladder section. Refill water.", type: "Rest" },
  { id: "it-001-05", trekId: "trek-001", dayNumber: 2, time: "05:00", title: "Summit — Sunrise!", description: "Reach the peak at 1,646m. Watch the spectacular sunrise over the Sahyadris.", type: "Activity" },
  { id: "it-001-06", trekId: "trek-001", dayNumber: 2, time: "06:00", title: "Breakfast at Summit", description: "Hot poha and chai at the Kalsubai temple.", type: "Meal" },
  { id: "it-001-07", trekId: "trek-001", dayNumber: 2, time: "07:00", title: "Descend", description: "Begin descent. 2.5-3 hours down to base.", type: "Trek" },
  { id: "it-001-08", trekId: "trek-001", dayNumber: 2, time: "10:00", title: "Lunch at Base", description: "Hot lunch at a local dhaba — varan bhaat, bhakri, thecha.", type: "Meal" },
  { id: "it-001-09", trekId: "trek-001", dayNumber: 2, time: "11:30", title: "Depart for Kasara", description: "Bus back to Kasara station. Drop-off by 1:00 PM.", type: "Travel" },

  // Harishchandragad (trek-002) — Day 1, 2 & 3
  { id: "it-002-01", trekId: "trek-002", dayNumber: 1, time: "06:00", title: "Depart from Pune", description: "Bus from Shivajinagar to Khireshwar village. 4-hour drive.", type: "Travel" },
  { id: "it-002-02", trekId: "trek-002", dayNumber: 1, time: "10:30", title: "Reach Khireshwar", description: "Light stretching and briefing at the base.", type: "Rest" },
  { id: "it-002-03", trekId: "trek-002", dayNumber: 1, time: "11:00", title: "Begin Nalichi Vaat", description: "Enter the dense forest trail. Steep climb through rock patches.", type: "Trek" },
  { id: "it-002-04", trekId: "trek-002", dayNumber: 1, time: "13:00", title: "Packed Lunch", description: "Lunch break at a flat clearing. Carry packed meals.", type: "Meal" },
  { id: "it-002-05", trekId: "trek-002", dayNumber: 1, time: "16:00", title: "Reach Harishchandragad", description: "Arrive at the fort. Set up camp near Kedareshwar cave.", type: "Trek" },
  { id: "it-002-06", trekId: "trek-002", dayNumber: 1, time: "18:00", title: "Explore Kedareshwar Cave", description: "Visit the ancient Shiva lingam in the cave temple.", type: "Activity" },
  { id: "it-002-07", trekId: "trek-002", dayNumber: 1, time: "20:00", title: "Dinner & Bonfire", description: "Hot dinner under the stars. Stories and chai.", type: "Meal" },
  { id: "it-002-08", trekId: "trek-002", dayNumber: 2, time: "05:30", title: "Sunrise at Konkan Kada", description: "Walk to the iconic cliff for a breathtaking sunrise.", type: "Activity" },
  { id: "it-002-09", trekId: "trek-002", dayNumber: 2, time: "07:30", title: "Breakfast", description: "Poha, upma, and chai at camp.", type: "Meal" },
  { id: "it-002-10", trekId: "trek-002", dayNumber: 2, time: "09:00", title: "Explore Saptatirtha Pushkarni", description: "Visit the ancient stepped water tank and temple ruins.", type: "Activity" },
  { id: "it-002-11", trekId: "trek-002", dayNumber: 2, time: "11:00", title: "Descend via Junnar Route", description: "Easier descent route through Pachnai village.", type: "Trek" },
  { id: "it-002-12", trekId: "trek-002", dayNumber: 2, time: "14:00", title: "Lunch at Pachnai", description: "Maharashtrian thali at a village home.", type: "Meal" },
  { id: "it-002-13", trekId: "trek-002", dayNumber: 2, time: "15:30", title: "Depart for Pune", description: "Bus back to Pune. Arrive by evening.", type: "Travel" },

  // Rajmachi Monsoon Trek (trek-003) — Day 1 & 2
  { id: "it-003-01", trekId: "trek-003", dayNumber: 1, time: "07:00", title: "Meet at Lonavala Station", description: "Assemble at main exit. Quick chai and briefing.", type: "Travel" },
  { id: "it-003-02", trekId: "trek-003", dayNumber: 1, time: "07:30", title: "Depart for Udhewadi", description: "Shared jeeps to the base village (30 min ride).", type: "Travel" },
  { id: "it-003-03", trekId: "trek-003", dayNumber: 1, time: "08:30", title: "Begin Trek to Rajmachi", description: "Scenic 2-hour walk through green meadows and waterfalls.", type: "Trek" },
  { id: "it-003-04", trekId: "trek-003", dayNumber: 1, time: "10:30", title: "Reach Rajmachi Village", description: "Arrive at the hamlet between the twin forts.", type: "Trek" },
  { id: "it-003-05", trekId: "trek-003", dayNumber: 1, time: "11:00", title: "Explore Shrivardhan Fort", description: "Climb to the main fort. Panoramic views of Borghat valley.", type: "Activity" },
  { id: "it-003-06", trekId: "trek-003", dayNumber: 1, time: "13:00", title: "Lunch", description: "Traditional jhunka bhakri lunch at a villager's house.", type: "Meal" },
  { id: "it-003-07", trekId: "trek-003", dayNumber: 1, time: "14:30", title: "Explore Manaranjan Fort", description: "Visit the second fort with its massive bastions.", type: "Activity" },
  { id: "it-003-08", trekId: "trek-003", dayNumber: 1, time: "17:00", title: "Evening at Camp", description: "Relax, play games, enjoy the monsoon mist.", type: "Rest" },
  { id: "it-003-09", trekId: "trek-003", dayNumber: 1, time: "20:00", title: "Dinner", description: "Hot misal pav and chai.", type: "Meal" },
  { id: "it-003-10", trekId: "trek-003", dayNumber: 2, time: "06:00", title: "Morning Chai & Sunrise", description: "Wake up to misty mountain views. Hot chai.", type: "Meal" },
  { id: "it-003-11", trekId: "trek-003", dayNumber: 2, time: "08:00", title: "Descend to Lonavala", description: "Easy 3-hour descent via the Lonavala route.", type: "Trek" },
  { id: "it-003-12", trekId: "trek-003", dayNumber: 2, time: "11:00", title: "Reach Lonavala", description: "Trek ends! Optional chikki shopping.", type: "Travel" },
];

export const seedAnnouncements: Announcement[] = [
  {
    id: "ann-001-01",
    trekId: "trek-001",
    message: "🎒 Packing list updated! Don't forget: headlamp (mandatory), 2L water, light jacket, and energy bars. Full list shared in the WhatsApp group.",
    createdAt: "2026-08-10T10:00:00.000Z",
    priority: "Normal",
  },
  {
    id: "ann-001-02",
    trekId: "trek-001",
    message: "⚠️ Weather alert: Moderate rainfall expected. Carry rain poncho and waterproof bag cover. Trek is ON — we go rain or shine!",
    createdAt: "2026-08-12T14:30:00.000Z",
    priority: "Urgent",
  },
  {
    id: "ann-002-01",
    trekId: "trek-002",
    message: "📋 Fitness check: This is a Hard grade trek. Please ensure you can comfortably walk 15km with elevation. Reach out if you have any concerns.",
    createdAt: "2026-08-15T09:00:00.000Z",
    priority: "Normal",
  },
  {
    id: "ann-002-02",
    trekId: "trek-002",
    message: "🚌 Transport confirmed! Traveller bus from Shivajinagar. Exact boarding point: opposite Café Goodluck, 5:45 AM sharp.",
    createdAt: "2026-08-20T18:00:00.000Z",
    priority: "Normal",
  },
  {
    id: "ann-003-01",
    trekId: "trek-003",
    message: "✅ Trek completed successfully! Thanks everyone for an amazing monsoon weekend. Photos uploading to the drive shortly.",
    createdAt: "2026-07-06T17:00:00.000Z",
    priority: "Normal",
  },
];
