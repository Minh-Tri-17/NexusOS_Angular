export interface JwtUserPayload {
  userId: string;
  ownerId?: string | null;
  username: string;
  fullName: string;
  roleId?: string | null;
  roleName?: string | null;
  exp?: number;
}
