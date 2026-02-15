export interface ContentItem {
  id: string;
  type: 'image' | 'video';
  uri: string;
  caption: string;
  germanSentence: string;
  isCorrect: boolean;
  correctVersion?: string;
  level: 'A1' | 'A2';
  createdAt: string;
  scheduled?: boolean;
  scheduledTime?: string;
  posted?: boolean;
}

export interface ScheduleSlot {
  id: string;
  contentId: string;
  time: 'morning' | 'noon' | 'evening';
  date: string;
  posted: boolean;
}

export interface AppSettings {
  morningTime: string;  // "08:00"
  noonTime: string;     // "13:00"
  eveningTime: string;  // "19:00"
  autoPost: boolean;
  tiktokUsername: string;
}
