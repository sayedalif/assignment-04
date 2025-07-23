import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://libary-management-backend.vercel.app/api',
    credentials: 'include',
  }),
  tagTypes: ['books', 'borrowSummary', 'bookDetails'],
  endpoints: builder => ({
    getBooks: builder.query({
      query: () => '/books',
      providesTags: ['books'],
    }),
    getBookDetails: builder.query({
      query: bookId => `/books/${bookId}`,
      providesTags: ['bookDetails'],
    }),
    // In your baseApi.ts file
    borrowBook: builder.mutation({
      query: borrowData => ({
        url: '/borrow', // or whatever your endpoint is
        method: 'POST',
        body: borrowData,
      }),
      invalidatesTags: ['books', 'borrowSummary'], // This will refetch books to update available copies
    }),
    getBorrowedBooksSummary: builder.query({
      query: () => '/borrow',
      providesTags: ['borrowSummary'],
    }),
    createBook: builder.mutation({
      query: bookData => ({
        method: 'POST',
        url: '/books',
        body: bookData,
      }),
      invalidatesTags: ['books'],
    }),
    updateBook: builder.mutation({
      query: ({ id, bookData }) => ({
        method: 'PUT', // or 'PATCH' depending on your backend
        url: `/books/${id}`,
        body: bookData,
      }),
      invalidatesTags: ['books'],
    }),
    deleteBook: builder.mutation({
      query: bookId => ({
        url: `/books/${bookId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['books'],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookDetailsQuery,
  useCreateBookMutation,
  useBorrowBookMutation,
  useGetBorrowedBooksSummaryQuery,
  useDeleteBookMutation,
  useUpdateBookMutation,
} = baseApi;
