export interface JwtUserPayload {
  userId: string;
  ownerId?: string | null;
  username: string;
  fullName: string;
  roleId?: string | null;
  roleIds?: string[];
  roleName?: string | null;
  exp?: number;
}
