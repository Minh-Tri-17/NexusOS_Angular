export interface OTPModel {
  email?: string;
  otp?: string;
}

export const OTPFields: Record<keyof OTPModel, string> = {
  email: 'Email',
  otp: 'Otp',
};
