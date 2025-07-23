import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  Sparkles,
  User,
  Hash,
  Copy,
  Eye,
  FileText,
  Library,
} from 'lucide-react';
import { z } from 'zod';
import { useState } from 'react';
import { useCreateBookMutation } from '@/redux/api/baseApi';
import { useNavigate } from 'react-router';
import { bookSchema } from '@/schema/schema';

// Define types for your API response
interface BookData {
  _id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  copies: number;
  available: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiSuccessResponse {
  data: BookData;
  message: string;
  success: boolean;
}

interface ValidationErrorDetail {
  message: string;
  name: string;
  properties: {
    message: string;
    type: string;
    min?: number;
    max?: number;
  };
  kind: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

interface ValidationError {
  name: string;
  errors: Record<string, ValidationErrorDetail>;
}

interface ApiErrorResponse {
  message: string;
  success: false;
  error: ValidationError | string;
}

// Zod schema for form validation (matching your backend schema)
type BookFormData = z.infer<typeof bookSchema>;

const AddBook = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [createBook, { isLoading }] = useCreateBookMutation(undefined);
  // navigate to redirect after successful book creation
  const navigate = useNavigate();

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      genre: '' as
        | 'FICTION'
        | 'NON_FICTION'
        | 'SCIENCE'
        | 'HISTORY'
        | 'BIOGRAPHY'
        | 'FANTASY',
      isbn: '',
      copies: 1,
      description: '',
      available: true,
    },
  });

  const onSubmit = async (data: BookFormData) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      // Clear any previous form errors
      form.clearErrors();
      
      // Transform data to match backend expectations
      const bookData = {
        ...data,
        available:
          String(data.available) === 'true' || data.available === undefined
            ? true
            : false,
        copies: Number(data.copies),
      };

      console.log('Book data to be submitted:', bookData);
      
      // Call the mutation
      const response = await createBook(bookData).unwrap() as ApiSuccessResponse;
      
      console.log('API Response:', response);
      
      // Check if the response indicates success
      if (response.success) {
        setSuccessMessage(response.message || 'Book created successfully!');
        form.reset();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
        
        // Redirect to books page after successful creation
        setTimeout(() => navigate('/books'), 2000);
      }
    } catch (error: unknown) {
      console.error('Error creating book:', error);
      
      // Handle RTK Query errors with proper typing
      if (error && typeof error === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rtqError = error as any;
        
        // Check if it's an RTK Query error with data
        if (rtqError?.data) {
          const errorResponse = rtqError.data as ApiErrorResponse;
          
          // Handle validation errors with field-specific error setting
          if (errorResponse.error && typeof errorResponse.error === 'object' && 'errors' in errorResponse.error) {
            const validationErrors = errorResponse.error.errors;
            let hasFieldErrors = false;
            
            // Set individual field errors
            Object.keys(validationErrors).forEach(fieldName => {
              const fieldError = validationErrors[fieldName];
              if (fieldName in form.control._formValues) {
                form.setError(fieldName as keyof BookFormData, {
                  type: 'manual',
                  message: fieldError.message,
                });
                hasFieldErrors = true;
              }
            });
            
            // If we have field errors, also show a general message
            if (hasFieldErrors) {
              setErrorMessage(errorResponse.message || 'Please fix the validation errors below');
            }
          } 
          // Handle ISBN duplicate error specifically
          else if (errorResponse.message && errorResponse.message.toLowerCase().includes('isbn')) {
            form.setError('isbn', {
              type: 'manual',
              message: errorResponse.message,
            });
          }
          // Handle other API errors
          else {
            setErrorMessage(errorResponse.message || 'An error occurred while creating the book');
          }
        }
        // Handle network or other RTK Query errors
        else if (rtqError?.message) {
          setErrorMessage(rtqError.message);
        } else {
          setErrorMessage('An error occurred while creating the book');
        }
      } else if (typeof error === 'string') {
        setErrorMessage(error);
      } else {
        setErrorMessage('An unexpected error occurred while creating the book');
      }
    }
  };

  // Genre options with icons
  const genreOptions = [
    { value: 'FICTION', label: 'Fiction', icon: '📚' },
    { value: 'NON_FICTION', label: 'Non Fiction', icon: '📖' },
    { value: 'SCIENCE', label: 'Science', icon: '🔬' },
    { value: 'HISTORY', label: 'History', icon: '🏛️' },
    { value: 'BIOGRAPHY', label: 'Biography', icon: '👤' },
    { value: 'FANTASY', label: 'Fantasy', icon: '🧙‍♂️' },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-2xl mx-auto'>
        {/* Header Section */}
        <div className='text-center mb-8'>
          <div className='flex justify-center mb-4'>
            <div className='bg-gradient-to-r from-violet-500 to-indigo-600 p-4 rounded-full shadow-lg'>
              <Library className='h-8 w-8 text-white' />
            </div>
          </div>
          <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
            Add New Book
          </h1>
          <p className='text-gray-600 text-lg'>
            Expand your library collection with a new book
          </p>
        </div>

        <Card className='bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl'>
          <CardHeader className='pb-8'>
            <CardTitle className='text-2xl font-semibold text-gray-800 flex items-center gap-2'>
              <BookOpen className='h-6 w-6 text-violet-600' />
              Book Details
            </CardTitle>
            <CardDescription className='text-gray-600 text-base'>
              Fill in the information below to add a new book to your library
              system.
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Success Message */}
            {successMessage && (
              <Alert className='border-emerald-200 bg-emerald-50 shadow-sm rounded-xl animate-in slide-in-from-top-1 duration-300'>
                <CheckCircle className='h-5 w-5 text-emerald-600' />
                <AlertDescription className='text-emerald-800 font-medium'>
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {errorMessage && (
              <Alert className='border-red-200 bg-red-50 shadow-sm rounded-xl animate-in slide-in-from-top-1 duration-300'>
                <AlertCircle className='h-5 w-5 text-red-600' />
                <AlertDescription className='text-red-800 font-medium'>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel className='text-gray-700 font-semibold flex items-center gap-2'>
                        <BookOpen className='h-4 w-4 text-violet-600' />
                        Book Title *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter the book title'
                          {...field}
                          className={`h-12 rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200 ${
                            form.formState.errors.title
                              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                              : ''
                          }`}
                        />
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                {/* Author Field */}
                <FormField
                  control={form.control}
                  name='author'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel className='text-gray-700 font-semibold flex items-center gap-2'>
                        <User className='h-4 w-4 text-violet-600' />
                        Author *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter author's name"
                          {...field}
                          className={`h-12 rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200 ${
                            form.formState.errors.author
                              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                              : ''
                          }`}
                        />
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                {/* Genre Field */}
                <FormField
                  control={form.control}
                  name='genre'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel className='text-gray-700 font-semibold flex items-center gap-2'>
                        <Sparkles className='h-4 w-4 text-violet-600' />
                        Genre *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        key={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`h-12 rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200 ${
                              form.formState.errors.genre
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                                : ''
                            }`}
                          >
                            <SelectValue placeholder='Select a genre' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='rounded-xl'>
                          {genreOptions.map(genre => (
                            <SelectItem
                              key={genre.value}
                              value={genre.value}
                              className='rounded-lg hover:bg-violet-50 focus:bg-violet-50'
                            >
                              <span className='flex items-center gap-2'>
                                <span>{genre.icon}</span>
                                {genre.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                {/* ISBN Field */}
                <FormField
                  control={form.control}
                  name='isbn'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel className='text-gray-700 font-semibold flex items-center gap-2'>
                        <Hash className='h-4 w-4 text-violet-600' />
                        ISBN *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='978-0-123456-78-9'
                          {...field}
                          className={`h-12 rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200 ${
                            form.formState.errors.isbn
                              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                              : ''
                          }`}
                        />
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                {/* Copies Field */}
                <FormField
                  control={form.control}
                  name='copies'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel className='text-gray-700 font-semibold flex items-center gap-2'>
                        <Copy className='h-4 w-4 text-violet-600' />
                        Number of Copies *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          placeholder='1'
                          {...field}
                          onChange={e =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          className={`h-12 rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200 ${
                            form.formState.errors.copies
                              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                              : ''
                          }`}
                        />
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                {/* Available Field */}
                <FormField
                  control={form.control}
                  name='available'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel className='text-gray-700 font-semibold flex items-center gap-2'>
                        <Eye className='h-4 w-4 text-violet-600' />
                        Availability Status
                      </FormLabel>
                      <Select
                        onValueChange={value =>
                          field.onChange(value === 'true')
                        }
                        value={field.value ? 'true' : 'false'}
                      >
                        <FormControl>
                          <SelectTrigger className='h-12 rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200'>
                            <SelectValue placeholder='Select availability' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='rounded-xl'>
                          <SelectGroup>
                            <SelectItem
                              value='true'
                              className='rounded-lg hover:bg-violet-50 focus:bg-violet-50'
                            >
                              <span className='flex items-center gap-2'>
                                <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                                Available
                              </span>
                            </SelectItem>
                            <SelectItem
                              value='false'
                              className='rounded-lg hover:bg-violet-50 focus:bg-violet-50'
                            >
                              <span className='flex items-center gap-2'>
                                <span className='w-2 h-2 bg-red-500 rounded-full'></span>
                                Not Available
                              </span>
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description Field - Full Width */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='space-y-3'>
                    <FormLabel className='text-gray-700 font-semibold flex items-center gap-2'>
                      <FileText className='h-4 w-4 text-violet-600' />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter a brief description of the book (optional)'
                        rows={4}
                        {...field}
                        className={`rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200 resize-none ${
                          form.formState.errors.description
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                            : ''
                        }`}
                      />
                    </FormControl>
                    <FormMessage className='text-red-500' />
                  </FormItem>
                )}
              />
            </Form>
          </CardContent>

          <CardFooter className='pt-8'>
            <Button
              type='submit'
              className='w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'
              disabled={isLoading}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isLoading ? (
                <div className='flex items-center gap-3'>
                  <Loader2 className='h-5 w-5 animate-spin' />
                  Adding Book to Library...
                </div>
              ) : (
                <div className='flex items-center gap-3'>
                  <BookOpen className='h-5 w-5' />
                  Add Book to Library
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AddBook;