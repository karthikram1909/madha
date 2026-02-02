
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, DollarSign, ShoppingCart, X, Package } from 'lucide-react';

export default function BookDetailsModal({ book, isOpen, onClose, onAddToCart, currency, language = 'english' }) {
    if (!book) return null;

    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const price = currency === 'INR' ? book.price_inr : book.price_usd;

    // Get localized book data
    const displayData = language === 'tamil' ? {
        title: book.title_tamil || book.title,
        description: book.description_tamil || book.description,
        author: book.author_tamil || book.author
    } : {
        title: book.title,
        description: book.description,
        author: book.author
    };

    const translations = {
        close: language === 'tamil' ? 'மூடு' : 'Close',
        author: language === 'tamil' ? 'ஆசிரியர்' : 'Author',
        price: language === 'tamil' ? 'விலை' : 'Price',
        stock_available: language === 'tamil' ? 'கையிருப்பு உள்ளது' : 'In Stock',
        stock_count: language === 'tamil' ? 'கையிருப்பு' : 'Available',
        out_of_stock: language === 'tamil' ? 'கையிருப்பில் இல்லை' : 'Out of Stock',
        description: language === 'tamil' ? 'விளக்கம்' : 'Description',
        add_to_cart: language === 'tamil' ? 'கார்ட்டில் சேர்க்கவும்' : 'Add to Cart',
        product_details: language === 'tamil' ? 'தயாரிப்பு விவரங்கள்' : 'Product Details'
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{translations.product_details}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {/* Book Image */}
                    <div className="w-full">
                        <img 
                            src={book.image_url || 'https://via.placeholder.com/400x500.png?text=No+Image'} 
                            alt={displayData.title}
                            className="w-full h-auto object-cover rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Book Details */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">{displayData.title}</h2>
                            <div className="flex items-center gap-2 text-slate-600">
                                <span className="text-sm font-medium">{translations.author}:</span>
                                <span className="text-base">{displayData.author}</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <p className="text-sm text-slate-600 mb-1">{translations.price}</p>
                            <div className="flex items-center text-4xl font-bold text-red-700">
                                {currency === 'INR' ? <IndianRupee className="w-8 h-8 mr-2" /> : <DollarSign className="w-8 h-8 mr-2" />}
                                {price}
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-slate-500" />
                            {book.stock_quantity > 0 ? (
                                <div>
                                    <Badge className="bg-green-100 text-green-800 mb-1">
                                        {translations.stock_available}
                                    </Badge>
                                    <p className="text-sm text-slate-600">
                                        {translations.stock_count}: {book.stock_quantity}
                                    </p>
                                </div>
                            ) : (
                                <Badge className="bg-red-100 text-red-800">
                                    {translations.out_of_stock}
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">{translations.description}</h3>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                {displayData.description}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={() => {
                                    onAddToCart(book);
                                    onClose();
                                }}
                                disabled={book.stock_quantity === 0}
                                className="flex-1 bg-[#B71C1C] hover:bg-[#D32F2F] text-white py-6 text-lg font-semibold"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                {translations.add_to_cart}
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="px-6 py-6"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
