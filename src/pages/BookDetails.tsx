import { useGetBookDetailsQuery } from "@/redux/api/baseApi";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, User, Hash, Package, CheckCircle, XCircle } from 'lucide-react';

// TypeScript interface for the book data
interface BookData {
  _id: string;
  title: string;
  author: string;
  description: string;
  genre: string | string[];
  isbn: string;
  available: boolean;
  copies: number;
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data, isLoading, isError } = useGetBookDetailsQuery(id);
  
  console.log("🚀 ~ BookDetails ~ data:", data);

  const handleReserveBook = () => {
    // Implement your reservation logic here
    console.log('Reserving book with ID:', id);
  };

  const handleAddToWishlist = () => {
    // Implement your wishlist logic here
    console.log('Adding book to wishlist:', id);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-300 rounded mb-4"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-300 rounded"></div>
              <div className="h-16 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load book details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const bookData: BookData = data.data || data; // Handle different response structures

  // Parse genre - handle both string and array formats
  const genres = Array.isArray(bookData.genre) 
    ? bookData.genre 
    : typeof bookData.genre === 'string' 
      ? [bookData.genre] 
      : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{bookData.title}</h1>
        <p className="text-xl text-gray-600 flex items-center gap-2">
          <User className="w-5 h-5" />
          by {bookData.author}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Book Cover Placeholder */}
          <Card>
            <CardContent className="p-6">
              <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-24 h-24 text-gray-400" />
              </div>
              <div className="text-center text-gray-600">Book Cover</div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Book</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-lg">
                {bookData.description}
              </p>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Book Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">ISBN</p>
                    <p className="font-medium">{bookData.isbn}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Book ID</p>
                    <p className="font-mono text-sm">{bookData._id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge 
                  variant={bookData.available ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {bookData.available ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {bookData.available ? 'Available' : 'Not Available'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Copies Available:</span>
                <span className="font-semibold text-lg">{bookData.copies}</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  disabled={!bookData.available || bookData.copies === 0}
                  onClick={handleReserveBook}
                >
                  {bookData.available && bookData.copies > 0 ? 'Reserve Book' : 'Not Available'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleAddToWishlist}
                >
                  Add to Wishlist
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Genres */}
          {genres.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre, index) => (
                    <Badge key={index} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Author Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Author
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-lg">{bookData.author}</p>
              <p className="text-gray-600 text-sm mt-1">
                Click to view more books by this author
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;