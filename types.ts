
export interface Customer {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
}

export interface GarageReply {
  problem_found: string;
  cost?: string; // Legacy field, kept for backward compatibility
  quotation_amount?: string; // The final quoted amount
  estimation_amount?: string; // The initial estimated amount
  date?: string; // Optional: might not be set during estimation phase
  time?: string; // Optional: might not be set during estimation phase
}

export type RequestStatus = 'pending' | 'quoted' | 'confirmed' | 'closed' | 'rejected';

export interface ServiceRequest {
  id: string;
  customer_id: string;
  customer_name: string;
  phone: string;
  vehicle: string;
  problem_text: string;
  images: string[];
  status: RequestStatus;
  garage_reply?: GarageReply;
  timestamp: any; // Firestore Timestamp
  createdAt?: Date; // Client-side processed date
}
