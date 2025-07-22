export interface Book {
  author: string;
  available: boolean;
  copies: number;
  description: string;
  genre: string;
  isbn: string;
  title: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  _id: string;
};

export interface BooksTableProps {
  book: Book;
};