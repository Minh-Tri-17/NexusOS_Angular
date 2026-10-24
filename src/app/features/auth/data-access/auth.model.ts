export interface AuthModel {
  email?: string | null;
  username?: string | null;
  password?: string | null;
  remember?: boolean | null;
}

export const AuthFields: Record<keyof AuthModel, string> = {
  email: 'Email',
  username: 'Username',
  password: 'Password',
  remember: 'Remember',
};
