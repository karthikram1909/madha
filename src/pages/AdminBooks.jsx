import React, { useState, useEffect } from 'react';
import { Book } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import BookFormModal from '../components/books/BookFormModal';
import BookPreviewModal from '../components/books/BookPreviewModal';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBook, setPreviewBook] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = books.filter(book => 
        book.title?.toLowerCase().includes(query) ||
        book.title_tamil?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.author_tamil?.toLowerCase().includes(query)
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await Book.list('-created_date');
      setBooks(data);
      setFilteredBooks(data);
    } catch (error) {
      console.error("Failed to load books:", error);
      toast.error("Failed to load books.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handlePreview = (book) => {
    setPreviewBook(book);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      try {
        await Book.delete(bookId);
        toast.success("Book deleted successfully!");
        loadBooks();
      } catch (error) {
        console.error("Failed to delete book:", error);
        toast.error("Failed to delete book.");
      }
    }
  };
  
  const handleSave = () => {
    setIsModalOpen(false);
    loadBooks();
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div 
        className="relative bg-cover bg-center h-52" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2940&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Books Management</h1>
          <p className="text-red-100 max-w-2xl text-lg shadow-lg">Manage your spiritual books, add new publications, and update inventory</p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-2xl font-bold text-slate-900">All Books</CardTitle>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleAdd} className="bg-[#B71C1C] hover:bg-[#D32F2F]">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C]"></div>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">
                  {searchQuery ? 'No books found matching your search.' : 'No books available. Add your first book!'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead>Title (EN / TA)</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Price (INR/USD)</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => (
                      <TableRow key={book.id} className="hover:bg-slate-50">
                        <TableCell>
                          <img 
                            src={book.image_url || 'https://via.placeholder.com/100x140.png?text=No+Image'} 
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded shadow-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{book.title}</p>
                            {book.title_tamil && (
                              <p className="text-sm text-slate-500">{book.title_tamil}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-slate-700">{book.author || '-'}</p>
                            {book.author_tamil && (
                              <p className="text-xs text-slate-500">{book.author_tamil}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">₹{book.price_inr}</p>
                            <p className="text-xs text-slate-500">${book.price_usd}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={book.stock_quantity > 0 ? 'default' : 'destructive'}>
                            {book.stock_quantity} {book.stock_quantity === 1 ? 'unit' : 'units'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={book.is_active ? 'default' : 'secondary'}>
                            {book.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handlePreview(book)}
                              title="Preview"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(book)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-slate-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(book.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BookFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={selectedBook}
        onSave={handleSave}
      />

      <BookPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        book={previewBook}
      />
    </div>
  );
}