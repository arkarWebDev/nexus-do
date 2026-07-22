export interface Task {
  id: number;
  userId: number;
  action: string;
  remindAt: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: number;
  userId: number;
  action: string;
  category: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  id: number;
  apiKey: string;
}
