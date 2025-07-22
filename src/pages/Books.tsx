import {
  useDeleteBookMutation,
  useGetBooksQuery,
  useUpdateBookMutation,
  useBorrowBookMutation, // Add this new mutation
} from '@/redux/api/baseApi';
import type { Book } from '@/types/types';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CheckCircle, AlertCircle, Loader2, BookOpen, Calendar } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router';

// Same validation schema as AddBook
const bookSchema = z.object({
  title: z.string().min(1, 'Book title is required').trim(),
  author: z.string().min(1, 'Author name is required').trim(),
  genre: z.enum(
    ['FICTION', 'NON_FICTION', 'SCIENCE', 'HISTORY', 'BIOGRAPHY', 'FANTASY'],
    {
      message: 'Please select a valid genre',
    }
  ),
  isbn: z
    .string()
    .min(1, 'ISBN is required')
    .trim()
    .regex(
      /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
      'Please enter a valid ISBN'
    ),
  copies: z
    .number()
    .int('Copies must be an integer')
    .min(0, 'Copies cannot be negative'),
  description: z.string().trim().optional(),
  available: z.boolean().default(true).optional(),
});

// Borrow form validation schema
const borrowSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate > today;
    }, 'Due date must be in the future'),
});

type BookFormData = z.infer<typeof bookSchema>;
type BorrowFormData = z.infer<typeof borrowSchema>;

// Skeleton Components
const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>ISBN</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Copies</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
              </TableCell>
              <TableCell className="flex flex-col items-center justify-end space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="flex items-center justify-end space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Error Component
const ErrorState = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
          <p className="text-gray-600 mt-1">Unable to load books. Please try again later.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

// Borrow Book Dialog Component
const BorrowBookDialog = ({
  book,
  isOpen,
  onClose,
}: {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const [borrowBook, { isLoading }] = useBorrowBookMutation();

  const form = useForm<BorrowFormData>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      quantity: 1,
      dueDate: '',
    },
  });

  // Get tomorrow's date as minimum due date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const onSubmit = async (data: BorrowFormData) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      // Convert date to ISO string for backend
      const dueDateISO = new Date(data.dueDate + 'T00:00:00.000Z').toISOString();

      const borrowData = {
        book: book._id,
        quantity: Number(data.quantity),
        dueDate: dueDateISO, // Send as ISO string
      };

      console.log('Borrow data to be submitted:', borrowData);

      const response = await borrowBook(borrowData).unwrap();

      console.log('Borrow Response:', response);

      setSuccessMessage('Book borrowed successfully!');

      // Redirect to borrow summary page after successful borrow
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
        // Navigate to borrow summary page with the borrow ID
        navigate(`/borrow-summary`);
      }, 2000);
    } catch (error: any) {
      console.error('Error borrowing book:', error);

      // Handle different types of errors
      if (error.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.data.errors;
        
        // Check for quantity-specific errors
        if (backendErrors.quantity) {
          form.setError('quantity', {
            type: 'manual',
            message: backendErrors.quantity,
          });
        }
        
        // Check for book availability errors
        if (backendErrors.book) {
          setErrorMessage(backendErrors.book);
        }
        
        // Handle other field errors
        Object.keys(backendErrors).forEach(field => {
          if (field !== 'quantity' && field !== 'book') {
            form.setError(field as keyof BorrowFormData, {
              type: 'manual',
              message: backendErrors[field],
            });
          }
        });
      } else {
        setErrorMessage(
          error.data?.message ||
            error.message ||
            'An error occurred while borrowing the book'
        );
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setSuccessMessage('');
      setErrorMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className='sm:max-w-[450px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Borrow Book
          </DialogTitle>
          <DialogDescription>
            Fill in the details to borrow "{book.title}" by {book.author}.
          </DialogDescription>
        </DialogHeader>

        {/* Book Info */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Available Copies:</span> {book.copies}</p>
            <p><span className="font-medium">Genre:</span> {book.genre}</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className='border-green-200 bg-green-50'>
            <CheckCircle className='h-4 w-4 text-green-600' />
            <AlertDescription className='text-green-800'>
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert className='border-red-200 bg-red-50'>
            <AlertCircle className='h-4 w-4 text-red-600' />
            <AlertDescription className='text-red-800'>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Quantity Field */}
            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity *</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='1'
                      max={book.copies}
                      placeholder='Enter quantity to borrow'
                      {...field}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                      className={
                        form.formState.errors.quantity ? 'border-red-500' : ''
                      }
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Maximum available: {book.copies}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date Field */}
            <FormField
              control={form.control}
              name='dueDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type='date'
                        min={getTomorrowDate()}
                        {...field}
                        className={`pl-10 ${
                          form.formState.errors.dueDate ? 'border-red-500' : ''
                        }`}
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Select when you plan to return the book
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
              <Button 
                type='submit' 
                disabled={isLoading || !book.available || book.copies === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Borrowing...
                  </>
                ) : (
                  'Borrow Book'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Book Dialog Component
const EditBookDialog = ({
  book,
  onClose,
}: {
  book: Book;
  onClose: () => void;
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [updateBook, { isLoading }] = useUpdateBookMutation();

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book.title || '',
      author: book.author || '',
      genre: book.genre as
        | 'FICTION'
        | 'NON_FICTION'
        | 'SCIENCE'
        | 'HISTORY'
        | 'BIOGRAPHY'
        | 'FANTASY',
      isbn: book.isbn || '',
      copies: book.copies || 1,
      description: book.description || '',
      available: book.available !== undefined ? book.available : true,
    },
  });

  const genreOptions = [
    'FICTION',
    'NON_FICTION',
    'SCIENCE',
    'HISTORY',
    'BIOGRAPHY',
    'FANTASY',
  ];

  // Watch the copies field to automatically update availability
  const watchedCopies = form.watch('copies');

  // Effect to automatically set availability based on copies
  useEffect(() => {
    if (watchedCopies === 0) {
      form.setValue('available', false);
    } else if (watchedCopies > 0 && !form.getValues('available')) {
      // Only set to true if it was previously false due to 0 copies
      form.setValue('available', true);
    }
  }, [watchedCopies, form]);

  const onSubmit = async (data: BookFormData) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      // Transform data to match backend expectations
      // Ensure availability is false when copies is 0
      const bookData = {
        ...data,
        available: data.copies === 0 ? false : (
          String(data.available) === 'true' || data.available === undefined
            ? true
            : false
        ),
        copies: Number(data.copies),
      };

      console.log('Book data to be updated:', bookData);

      const response = await updateBook({
        id: book._id,
        bookData,
      }).unwrap();

      console.log('Update Response:', response);

      setSuccessMessage('Book updated successfully!');

      // Close dialog after successful update
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error updating book:', error);

      // Handle different types of errors
      if (error.data?.message === 'ISBN already exists') {
        form.setError('isbn', {
          type: 'manual',
          message: 'This ISBN already exists in the database',
        });
      } else if (error.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.data.errors;
        Object.keys(backendErrors).forEach(field => {
          form.setError(field as keyof BookFormData, {
            type: 'manual',
            message: backendErrors[field],
          });
        });
      } else {
        setErrorMessage(
          error.data?.message ||
            error.message ||
            'An error occurred while updating the book'
        );
      }
    }
  };

  return (
    <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
      <DialogHeader>
        <DialogTitle>Update Book</DialogTitle>
        <DialogDescription>
          Make changes to the book details. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      {/* Success Message */}
      {successMessage && (
        <Alert className='border-green-200 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertCircle className='h-4 w-4 text-red-600' />
          <AlertDescription className='text-red-800'>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Title Field */}
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter book title'
                    {...field}
                    className={
                      form.formState.errors.title ? 'border-red-500' : ''
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Author Field */}
          <FormField
            control={form.control}
            name='author'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author *</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter author name'
                    {...field}
                    className={
                      form.formState.errors.author ? 'border-red-500' : ''
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Genre Field */}
          <FormField
            control={form.control}
            name='genre'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  key={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={`w-full ${
                        form.formState.errors.genre ? 'border-red-500' : ''
                      }`}
                    >
                      <SelectValue placeholder='Select a genre' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {genreOptions.map(genre => (
                      <SelectItem key={genre} value={genre}>
                        {genre.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ISBN Field */}
          <FormField
            control={form.control}
            name='isbn'
            render={({ field }) => (
              <FormItem>
                <FormLabel>ISBN *</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter ISBN (e.g., 978-0-123456-78-9)'
                    {...field}
                    className={
                      form.formState.errors.isbn ? 'border-red-500' : ''
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Copies Field */}
          <FormField
            control={form.control}
            name='copies'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Copies *</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    placeholder='Enter number of copies'
                    {...field}
                    onChange={e =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    className={
                      form.formState.errors.copies ? 'border-red-500' : ''
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Available Field */}
          <FormField
            control={form.control}
            name='available'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability</FormLabel>
                <Select
                  onValueChange={value => field.onChange(value === 'true')}
                  value={field.value ? 'true' : 'false'}
                  disabled={watchedCopies === 0} // Disable when copies is 0
                >
                  <FormControl>
                    <SelectTrigger className={`w-full ${watchedCopies === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <SelectValue placeholder='Select availability' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value='true'>Available</SelectItem>
                      <SelectItem value='false'>Not Available</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {watchedCopies === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Availability is automatically set to "Not Available" when copies is 0
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter book description (optional)'
                    rows={3}
                    {...field}
                    className={
                      form.formState.errors.description ? 'border-red-500' : ''
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default function Books() {
  const { data: books, isLoading, isError } = useGetBooksQuery(undefined);
  const [deleteBook] = useDeleteBookMutation();
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const navigate = useNavigate();

  // Show table skeleton while loading
  if (isLoading) {
    return <TableSkeleton />;
  }

  // Show error state
  if (isError) {
    return <ErrorState />;
  }

  const handleBookDetails = bookId => {
    return navigate(`/books/${bookId}`);
  };

  const handleBorrowClick = (book: Book) => {
    setBorrowingBook(book);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>ISBN</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Copies</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='cursor-pointer'>
          {books?.data.map((book: Book) => (
            <TableRow key={book._id}>
              <TableCell className='font-medium'>{book.title}</TableCell>
              <TableCell className='font-medium'>{book.author}</TableCell>
              <TableCell className='font-medium'>{book.genre}</TableCell>
              <TableCell className='font-medium'>{book.isbn}</TableCell>
              <TableCell className='font-medium'>
                {book.available === true ? 'YES' : 'NA'}
              </TableCell>
              <TableCell className='font-medium'>{book.copies}</TableCell>
              <TableCell className='font-medium'>
                {book.description?.length > 10
                  ? `${book.description.slice(0, 50)}...`
                  : 'Not Available'}
              </TableCell>
              <TableCell className='flex flex-col items-center justify-end space-y-2'>
                <Button
                  variant='outline'
                  className='cursor-pointer'
                  onClick={() => handleBookDetails(book._id)}
                >
                  Details
                </Button>

                {/* edit book */}
                <div className='flex items-center justify-end space-x-2'>
                  <Dialog
                    open={editingBook?._id === book._id}
                    onOpenChange={open => {
                      if (!open) setEditingBook(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <p
                        className='cursor-pointer outline p-2 rounded-sm'
                        onClick={() => setEditingBook(book)}
                      >
                        <Edit className='h-4 w-4' />
                      </p>
                    </DialogTrigger>
                    {editingBook && (
                      <EditBookDialog
                        book={editingBook}
                        onClose={() => setEditingBook(null)}
                      />
                    )}
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger className='cursor-pointer'>
                      <p className='cursor-pointer outline p-2 rounded-sm'>
                        <Trash2 className='h-4 w-4' />
                      </p>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this book and remove your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteBook(book._id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Button 
                  variant='outline' 
                  className='cursor-pointer'
                  onClick={() => handleBorrowClick(book)}
                  disabled={!book.available || book.copies === 0}
                >
                  {!book.available || book.copies === 0 ? 'Unavailable' : 'Borrow'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Borrow Book Dialog */}
      {borrowingBook && (
        <BorrowBookDialog
          book={borrowingBook}
          isOpen={!!borrowingBook}
          onClose={() => setBorrowingBook(null)}
        />
      )}
    </div>
  );
}