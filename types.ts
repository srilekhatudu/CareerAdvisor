
export enum LiveStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export type AppMode = 'selection' | 'segmentation' | 'chat';
export type Language = 'english';

export type UserStage = 'fresher' | 'experienced' | 'gap' | 'transition';

export type InteractionType = 'voice' | 'text';

export interface AudioVolume {
  input: number;
  output: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  language?: Language;
  isTranscription?: boolean;
}
