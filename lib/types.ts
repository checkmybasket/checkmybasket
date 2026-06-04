export type GroupMode = "family" | "friends" | "workplace" | "students" | "custom";
export type DrawStatus = "pending" | "drawn" | "revealed";
export type WishlistPriority = "love" | "like" | "inspiration";
export type MemberRole = "organiser" | "member";
export type PredictionRoundStatus = "open" | "closed" | "revealed";

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  mode: GroupMode;
  budget_amount: number; // pence — optional (-1 = no budget)
  budget_currency: string;
  exchange_date?: string;
  exchange_location?: string;
  invite_code: string;
  draw_status: DrawStatus;
  organiser_id: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: MemberRole;
  likes?: string;
  dislikes?: string;
  joined_at: string;
  user?: User;
}

export interface Exclusion {
  id: string;
  group_id: string;
  user_a_id: string;
  user_b_id: string;
  bidirectional: boolean;
}

export interface Draw {
  id: string;
  group_id: string;
  giver_id: string;
  recipient_id: string;
  gift_bought: boolean;
  drawn_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  group_id: string;
  title: string;
  url?: string;
  price?: number; // pence
  shop_name?: string;
  notes?: string;
  priority: WishlistPriority;
  image_url?: string;
  created_at: string;
}

export interface AnonMessage {
  id: string;
  group_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_reply: boolean;
  parent_message_id?: string;
  created_at: string;
}

// ─── Gift Predictions ─────────────────────────────────────────────────────────

export type GiftCategory =
  | "mug" | "chocolate" | "bath_body" | "candle" | "cosy"
  | "joke" | "book" | "drinks" | "gift_card" | "experience"
  | "useful" | "surprise";

export interface PredictionRound {
  id: string;
  group_id: string;
  status: PredictionRoundStatus;
  created_at: string;
  closed_at?: string;
}

export interface Prediction {
  id: string;
  round_id: string;
  predictor_id: string; // the person guessing
  subject_id: string;   // the person being guessed about
  predicted_category: GiftCategory;
  created_at: string;
}

export interface ActualGift {
  id: string;
  round_id: string;
  recipient_id: string;
  actual_category: GiftCategory;
  logged_by: string;
  created_at: string;
}
