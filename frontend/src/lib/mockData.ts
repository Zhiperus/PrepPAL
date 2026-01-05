// frontend/src/lib/mockData.ts

// ------------------------------------------------------------------
// 1. THE CHECKLIST (GET /api/gobag)
// This simulates the "Hydrated" list: Standard Catalog + User's Status
// ------------------------------------------------------------------
export const MOCK_GOBAG_RESPONSE = {
  completeness: 40, // 40% of items are packed
  items: [
    // --- Food & Water ---
    { itemId: "std_water_01", name: "Drinking Water (1L)", category: "water", isPacked: true },
    { itemId: "std_food_01", name: "Non-perishable Food", category: "food", isPacked: true },
    { itemId: "std_food_02", name: "Eating Utensils", category: "food", isPacked: false }, // User needs this

    // --- First Aid ---
    { itemId: "std_fa_01", name: "Adhesive Bandages", category: "first-aid", isPacked: true },
    { itemId: "std_fa_02", name: "Alcohol / Disinfectant", category: "first-aid", isPacked: false },
    { itemId: "std_fa_03", name: "Prescription Meds", category: "first-aid", isPacked: false },

    // --- Tools ---
    { itemId: "std_tool_01", name: "Flashlight", category: "tools", isPacked: true },
    { itemId: "std_tool_02", name: "Whistle", category: "tools", isPacked: true },
    { itemId: "std_tool_03", name: "Multi-tool / Knife", category: "tools", isPacked: false },

    // --- Documents ---
    { itemId: "std_doc_01", name: "Valid ID / Passport", category: "documents", isPacked: false },
  ]
};

// ------------------------------------------------------------------
// 2. THE COMMUNITY FEED (GET /api/posts)
// This simulates the "Snapshot" history.
// ------------------------------------------------------------------
export const MOCK_FEED_RESPONSE = [
  {
    id: "post_101",
    userId: "u_1",
    author: {
      name: "Kyle Developer",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle",
      rank: 5, // Derived from leaderboard
    },
    imageUrl: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1000&auto=format&fit=crop",
    caption: "Finally updated my bag for the rainy season! 🌧️",
    
    // 📸 SNAPSHOT: Only the items they actually had at that moment
    bagSnapshot: [
      { itemId: "std_water_01", name: "Drinking Water (1L)", category: "water" },
      { itemId: "std_food_01", name: "Non-perishable Food", category: "food" },
      { itemId: "std_tool_01", name: "Flashlight", category: "tools" },
      { itemId: "std_tool_02", name: "Whistle", category: "tools" },
    ],

    // 🏆 SCORING (Consensus)
    verifiedItemCount: 4,  // The Score (Calculated by Backend)
    verificationCount: 12, // 12 people voted on this
    createdAt: "2025-12-28T10:00:00Z",
  },
  {
    id: "post_102",
    userId: "u_2",
    author: {
      name: "Jarence Designer",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jarence",
      rank: 12,
    },
    imageUrl: "https://images.unsplash.com/photo-1516939884455-14a5cbe23644?q=80&w=1000&auto=format&fit=crop",
    caption: "Doing a monthly check of my batteries. Stay safe everyone!",
    
    bagSnapshot: [
      { itemId: "std_tool_01", name: "Flashlight", category: "tools" },
      { itemId: "std_fa_01", name: "Adhesive Bandages", category: "first-aid" },
    ],

    verifiedItemCount: 2, 
    verificationCount: 5,
    createdAt: "2025-12-28T08:30:00Z",
  }
];


// ------------------------------------------------------------------
// 4. USER PROFILE (GET /api/user/profile)
// ------------------------------------------------------------------
export const MOCK_USER_PROFILE = {
  id: "u_1",
  email: "kyle@example.com",
  householdName: "The Dev Household",
  location: {
    city: "Naga City",
    barangay: "San Felipe"
  },
  householdInfo: {
    memberCount: 4,
    femaleCount: 2,
    dogCount: 1,
    catCount: 0
  },
  points: {
    goBag: 25,      // High Score
    community: 42,  // Reputation
    modules: 5      // Learning
  },
  role: "citizen",
  isEmailVerified: true,
  createdAt: "2025-01-01T00:00:00Z",
  onboardingCompleted: true
};

// ------------------------------------------------------------------
// 5. LEADERBOARD (GET /api/leaderboard)
// Single list of users. Each user object contains both score types.
// ------------------------------------------------------------------
export const MOCK_LEADERBOARD_RESPONSE = [
  { 
    userId: "u_101", 
    name: "Ria", 
    points: { allTime: 123, goBag: 48 } 
  },
  { 
    userId: "u_102", 
    name: "Cruz", 
    points: { allTime: 115, goBag: 42 } 
  },
  { 
    userId: "u_103", 
    name: "Dizon", 
    points: { allTime: 110, goBag: 45 } 
  },
  { 
    userId: "u_104", 
    name: "Abad", 
    points: { allTime: 90,  goBag: 40 } 
  },
  { 
    userId: "u_105", 
    name: "Santos", 
    points: { allTime: 80,  goBag: 50 } // Note: Higher Go Bag score than Abad
  },
  { 
    userId: "u_106", 
    name: "Mendoza", 
    points: { allTime: 78,  goBag: 35 } 
  },
  { 
    userId: "u_107", 
    name: "Garcia", 
    points: { allTime: 73,  goBag: 28 } 
  },
  { 
    userId: "u_108", 
    name: "Cortez", 
    points: { allTime: 60,  goBag: 30 } 
  },
  { 
    userId: "u_109", 
    name: "Bill", 
    points: { allTime: 58,  goBag: 20 } 
  },
  { 
    userId: "u_110", 
    name: "Lim", 
    points: { allTime: 55,  goBag: 25 } 
  },
];
