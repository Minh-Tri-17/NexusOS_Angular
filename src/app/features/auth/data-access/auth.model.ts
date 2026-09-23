export interface AuthModel {
  username?: string | null;
  password?: string | null;
  remember?: boolean | null;
  phone?: string | null;
  email?: string | null;
  otp?: string | null;
}

export const AuthFields: Record<keyof AuthModel, string> = {
  username: 'Username',
  password: 'Password',
  remember: 'Remember',
  phone: 'Phone',
  email: 'Email',
  otp: 'Otp',
};
