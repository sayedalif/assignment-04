import App from '@/App';
import AddBook from '@/pages/AddBook';
import BookDetails from '@/pages/BookDetails';
import Books from '@/pages/Books';
import BorrowSummary from '@/pages/BorrowSummary';
import { createBrowserRouter } from 'react-router';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <App></App>,
    children: [
      {
        index: true,
        element: <Books />,
      },
      {
        path: 'books',
        element: <Books />,
      },
      {
        path: 'create-book',
        element: <AddBook></AddBook>
      },
      {
        path: 'books/:id',
        element: <BookDetails></BookDetails>,
      },
      {
        path: 'borrow-summary',
        element: <BorrowSummary />,
      },
    ],
  },
]);