
export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

export interface Document {
  id: string;
  content: string;
  source: string;
}
