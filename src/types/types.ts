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

export type BorrowSummaryItem = {
  totalQuantity: number;
  book: {
    title: string;
    isbn: string;
  };
};

export type BorrowSummaryResponse = {
  success: boolean;
  message: string;
  data: BorrowSummaryItem[];
};