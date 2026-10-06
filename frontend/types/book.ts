export type Genre = "fiction" | "non-fiction" | "mystery" | "sci-fi";
export type BookStatus = "available" | "checked_out";

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: Genre;
  pages: number;
  status: BookStatus;
}

export type BookCreateInput = Omit<Book, "id">;
