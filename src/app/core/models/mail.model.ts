export interface MailModel {
  to?: string | null;
}

export const MailFields: Record<keyof MailModel, string> = {
  to: 'To',
};
