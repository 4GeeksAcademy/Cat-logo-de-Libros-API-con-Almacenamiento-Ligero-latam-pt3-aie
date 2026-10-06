export interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  bio: string | null;
  phone: string | null;
  address: string | null;
}

export interface ProfileUpdateInput {
  full_name: string;
  phone: string | null;
  address: string | null;
}
