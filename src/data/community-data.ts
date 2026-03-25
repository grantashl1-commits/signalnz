// ── COMMUNITY DATA ────────────────────────────────────────────

export interface CommunityGroup {
  id: string;
  suburb: string;
  city: string;
  country: string;
  members: number;
  description: string;
  challenges: string[];
  questions: string[];
}

export interface NearbyUser {
  id: string;
  name: string;
  avatar: string;
  suburb: string;
  distance: string;
  skills: string[];
  offering: string;
  online: boolean;
  color: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  time: string;
  type: "text" | "poll" | "event";
  text?: string;
  question?: string;
  options?: string[];
  votes?: number[];
  title?: string;
  date?: string;
  location?: string;
  going?: number;
}

export const MOCK_GROUPS: CommunityGroup[] = [
  {
    id: "ponsonby", suburb: "Ponsonby", city: "Auckland", country: "NZ", members: 34,
    description: "A warm corner of Ponsonby — sharing skills, walks, coffee dates and whatever the neighbourhood needs.",
    challenges: ["Arrange a coffee date at a local café this week", "Organise a walk + talk in Western Park", "Share one skill you could teach someone nearby"],
    questions: ["What are you looking to get out of this community?", "In what ways could our neighbourhood come together?", "What services or skills can you offer?"],
  },
  {
    id: "grey_lynn", suburb: "Grey Lynn", city: "Auckland", country: "NZ", members: 21,
    description: "Grey Lynn neighbours connecting, trading skills and looking out for each other.",
    challenges: ["Find a coffee date in Grey Lynn", "Offer one skill swap this fortnight", "Organise a shared garden session"],
    questions: ["What drew you to Grey Lynn?", "What do you wish existed in our suburb?", "What's something you could teach or offer?"],
  },
  {
    id: "newmarket", suburb: "Newmarket", city: "Auckland", country: "NZ", members: 47,
    description: "Newmarket locals — busy suburb, but community is the thread that holds it together.",
    challenges: ["Do a favour for a neighbour this week", "Share a creative skill or project", "Organise a morning run group"],
    questions: ["What would make Newmarket feel more like a village?", "What professional skill could you share freely?", "How could we support each other through change?"],
  },
];

export const MOCK_NEARBY: NearbyUser[] = [
  { id: "u1", name: "Sarah K.", avatar: "SK", suburb: "Ponsonby", distance: "same suburb", skills: ["naturopath", "yoga teacher"], offering: "Free 20min wellness consult", online: true, color: "#7A9A6A" },
  { id: "u2", name: "Marcus T.", avatar: "MT", suburb: "Ponsonby", distance: "same suburb", skills: ["carpenter", "furniture maker"], offering: "Small repairs & shelving swaps", online: true, color: "#6A7A9A" },
  { id: "u3", name: "Lena W.", avatar: "LW", suburb: "Grey Lynn", distance: "~1.2 km", skills: ["graphic designer", "ceramics"], offering: "Brand identity or pottery lessons", online: false, color: "#9A7A6A" },
  { id: "u4", name: "James R.", avatar: "JR", suburb: "Ponsonby", distance: "same suburb", skills: ["bookkeeper", "meditation"], offering: "Bookkeeping for skill swaps", online: true, color: "#7A6A9A" },
  { id: "u5", name: "Ana P.", avatar: "AP", suburb: "Newmarket", distance: "~2.1 km", skills: ["chef", "sourdough baking"], offering: "Cooking classes or meal prep help", online: false, color: "#9A8A5A" },
  { id: "u6", name: "Tom H.", avatar: "TH", suburb: "Grey Lynn", distance: "~1.4 km", skills: ["electrician", "guitar"], offering: "Small electrical jobs + music lessons", online: true, color: "#6A9A8A" },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: "1", user: "Sarah K.", avatar: "SK", time: "9:14 am", type: "text", text: "Good morning everyone 🌿 anyone up for a walk through Western Park this Saturday around 8am?" },
  { id: "2", user: "Marcus T.", avatar: "MT", time: "9:22 am", type: "text", text: "I'm in! I'll bring coffee 😄" },
  { id: "3", user: "Lena W.", avatar: "LW", time: "9:31 am", type: "poll", question: "What time works for Saturday walk?", options: ["7:30am", "8:00am", "8:30am", "9:00am"], votes: [2, 5, 3, 1] },
  { id: "4", user: "James R.", avatar: "JR", time: "9:45 am", type: "text", text: "I'm a carpenter by trade — happy to swap skills. Would love someone who can help with bookkeeping." },
  { id: "5", user: "Sarah K.", avatar: "SK", time: "10:02 am", type: "event", title: "Morning Walk + Talk", date: "This Saturday, 8:00am", location: "Western Park entrance, Ponsonby", going: 6 },
  { id: "6", user: "Ana P.", avatar: "AP", time: "10:18 am", type: "text", text: "I'm a naturopath — happy to do a free 20 min consult for anyone wanting to talk nutrition or nervous system support." },
];
