export interface MailModel {
  to?: string;
}

export const MailFields: Record<keyof MailModel, string> = {
  to: 'To',
};
