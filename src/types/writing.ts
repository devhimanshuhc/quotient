export interface Writing {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  collections?: {
    id: string;
    name: string;
  }[];
}
