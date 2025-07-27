export interface Role {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  role_id: number;
  parent_id: number | null;
  nip?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Enhanced interface with optional relations
export interface UserWithRelations extends UserData {
  role?: Role;
  roles: Array<{
    role_id: number;
    role: Role;
  }>;
}

export interface UserResponse {
  current_page: number;
  data: UserWithRelations[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface UserApiResponse {
  message: string;
  data: UserWithRelations;
}

export interface RoleResponse {
  current_page: number;
  data: Role[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  nip: string;
  role_id: number;
  password?: string;
  parent_id?: number | null;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  nip?: string;
  role_id?: number;
  password?: string;
}

export interface UseUserListParams {
  page?: number;
  perPage?: number;
  search?: string;
  role_id?: number;
  include?: string[]; // Array of relations to include: ['role']
}
