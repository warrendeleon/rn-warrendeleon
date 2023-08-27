export interface StatusState {
  [key: string]: {
    status: string;
    message?: string;
  };
}
