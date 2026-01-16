
export interface Verse {
  id: number;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Book {
  name: string;
  chapters: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
