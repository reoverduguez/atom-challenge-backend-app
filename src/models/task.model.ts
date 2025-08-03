export interface Task {
  id: string;
  title: string;
  description: string;
  owner: string; // user id
  createdAt: Date;
  completed: boolean;
}
