export interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

export interface ReservationDetails {
  date?: string;
  day?: string;
  time?: string;
  guests?: number;
  name?: string;
  phone?: string;
}

export type BotState =
  | "idle"
  | "collecting"   // flexible collection — asks only for what's missing
  | "confirm"
  | "cancel_confirm";

export interface BotContext {
  state: BotState;
  reservation: ReservationDetails;
  confirmedReservation?: ReservationDetails;
}
