export interface SettingsState {
  theme: 'dark';
  provider: 'not-configured';
  fontSize: number;
  confirmWrites: boolean;
}

export const defaultSettings: SettingsState = {
  theme: 'dark', provider: 'not-configured', fontSize: 14, confirmWrites: true
};
