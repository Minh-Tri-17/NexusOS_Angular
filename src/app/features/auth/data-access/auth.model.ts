export interface AuthModel {
  email?: string;
  username?: string;
  password?: string;
  remember?: boolean;
}

export const AuthFields: Record<keyof AuthModel, string> = {
  email: 'Email',
  username: 'Username',
  password: 'Password',
  remember: 'Remember',
};
