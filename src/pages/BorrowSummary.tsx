import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Loader2,
  BookOpen,
  BarChart3,
  Hash,
  TrendingUp,
} from 'lucide-react';
import { useGetBorrowedBooksSummaryQuery } from '@/redux/api/baseApi';

const BorrowSummary = () => {
  const { data, isLoading, isError } =
    useGetBorrowedBooksSummaryQuery(undefined);

  return (
    <div className='min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header Section */}
        <div className='text-center mb-8'>
          <div className='flex justify-center mb-4'>
            <div className='bg-gradient-to-r from-violet-500 to-indigo-600 p-4 rounded-full shadow-lg'>
              <BarChart3 className='h-8 w-8 text-white' />
            </div>
          </div>
          <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
            Borrow Summary
          </h1>
          <p className='text-gray-600 text-lg'>
            Overview of borrowed books and their quantities
          </p>
        </div>

        <Card className='bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl'>
          <CardHeader className='pb-8'>
            <CardTitle className='text-2xl font-semibold text-gray-800 flex items-center gap-2'>
              <TrendingUp className='h-6 w-6 text-violet-600' />
              Borrowing Statistics
            </CardTitle>
            <CardDescription className='text-gray-600 text-base'>
              Track the most borrowed books in your library system
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Loading State */}
            {isLoading && (
              <div className='flex items-center justify-center py-12'>
                <div className='flex flex-col items-center gap-4'>
                  <Loader2 className='h-8 w-8 animate-spin text-violet-600' />
                  <p className='text-gray-600 font-medium'>Loading borrow summary...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <Alert className='border-red-200 bg-red-50 shadow-sm rounded-xl animate-in slide-in-from-top-1 duration-300'>
                <AlertCircle className='h-5 w-5 text-red-600' />
                <AlertDescription className='text-red-800 font-medium'>
                  Something went wrong while fetching the borrow summary. Please try again later.
                </AlertDescription>
              </Alert>
            )}

            {/* Data Table */}
            {!isLoading && !isError && data?.data && (
              <div className='rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 border-b border-gray-200'>
                      <TableHead className='h-14 px-6 text-gray-700 font-semibold'>
                        <div className='flex items-center gap-2'>
                          <BookOpen className='h-4 w-4 text-violet-600' />
                          Book Title
                        </div>
                      </TableHead>
                      <TableHead className='h-14 px-6 text-gray-700 font-semibold'>
                        <div className='flex items-center gap-2'>
                          <Hash className='h-4 w-4 text-violet-600' />
                          ISBN
                        </div>
                      </TableHead>
                      <TableHead className='h-14 px-6 text-right text-gray-700 font-semibold'>
                        <div className='flex items-center justify-end gap-2'>
                          <TrendingUp className='h-4 w-4 text-violet-600' />
                          Total Quantity Borrowed
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className='h-32 text-center'>
                          <div className='flex flex-col items-center gap-3'>
                            <BookOpen className='h-12 w-12 text-gray-300' />
                            <p className='text-gray-500 font-medium'>
                              No borrowed books found
                            </p>
                            <p className='text-gray-400 text-sm'>
                              Books will appear here once they are borrowed
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.data.map((borrowedBook, index) => (
                        <TableRow 
                          key={borrowedBook.book.isbn}
                          className={`hover:bg-violet-50/50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <TableCell className='px-6 py-4 font-medium text-gray-900'>
                            <div className='flex items-center gap-3'>
                              <div className='w-2 h-2 bg-violet-500 rounded-full'></div>
                              {borrowedBook.book.title}
                            </div>
                          </TableCell>
                          <TableCell className='px-6 py-4 font-medium text-gray-700'>
                            <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                              {borrowedBook.book.isbn}
                            </code>
                          </TableCell>
                          <TableCell className='px-6 py-4 font-bold text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <span className='bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent text-lg'>
                                {borrowedBook.totalQuantity}
                              </span>
                              <span className='text-gray-400 text-sm'>copies</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Summary Stats */}
            {!isLoading && !isError && data?.data && data.data.length > 0 && (
              <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-gradient-to-r from-violet-50 to-indigo-50 p-6 rounded-xl border border-violet-200'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-violet-100 rounded-lg'>
                      <BookOpen className='h-5 w-5 text-violet-600' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>Total Books</p>
                      <p className='text-2xl font-bold text-violet-600'>
                        {data.data.length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className='bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-indigo-100 rounded-lg'>
                      <TrendingUp className='h-5 w-5 text-indigo-600' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>Total Borrowed</p>
                      <p className='text-2xl font-bold text-indigo-600'>
                        {data.data.reduce((sum, item) => sum + item.totalQuantity, 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className='bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-100 rounded-lg'>
                      <BarChart3 className='h-5 w-5 text-purple-600' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>Avg. Per Book</p>
                      <p className='text-2xl font-bold text-purple-600'>
                        {Math.round(
                          data.data.reduce((sum, item) => sum + item.totalQuantity, 0) / 
                          data.data.length * 10
                        ) / 10}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BorrowSummary;