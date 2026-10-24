export interface OTPModel {
  email?: string | null;
  otp?: string | null;
}

export const OTPFields: Record<keyof OTPModel, string> = {
  email: 'Email',
  otp: 'Otp',
};
