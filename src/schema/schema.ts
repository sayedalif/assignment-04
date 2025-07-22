import z from "zod";

// Same validation schema as AddBook
export const bookSchema = z.object({
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
export const borrowSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine(date => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate > today;
    }, 'Due date must be in the future'),
});