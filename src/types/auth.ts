import { z } from 'zod';

// Login form validation schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters')
});

export type LoginFormData = z.infer<typeof loginSchema>;

// API response types
export interface LoginResponse {
  success: boolean;
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface Role {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  is_allowed: number;
  created_at: string;
  updated_at: string;
  role: Role;
}

export interface Menu {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface UserAccess {
  id: number;
  user_role_id: number;
  menu_id: number;
  is_allowed: number;
  created_at: string;
  updated_at: string;
  menu: Menu;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CurrentUserResponse {
  user: User;
  roles: UserRole[];
  access: UserAccess[];
}

export interface LoginError {
  error: string;
}
