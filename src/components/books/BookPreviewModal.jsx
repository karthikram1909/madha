import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, DollarSign, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookPreviewModal({ book, isOpen, onClose }) {
    if (!book) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Book Preview</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {/* Book Image */}
                    <div className="w-full">
                        <img 
                            src={book.image_url || 'https://via.placeholder.com/400x500.png?text=No+Image'} 
                            alt={book.title}
                            className="w-full h-auto object-cover rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Book Details */}
                    <div className="space-y-6">
                        <Tabs defaultValue="english" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="english">English</TabsTrigger>
                                <TabsTrigger value="tamil">தமிழ்</TabsTrigger>
                            </TabsList>

                            <TabsContent value="english" className="space-y-4 mt-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">{book.title}</h2>
                                    {book.author && (
                                        <p className="text-slate-600 mt-2">By {book.author}</p>
                                    )}
                                </div>
                                {book.description && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                            {book.description}
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="tamil" className="space-y-4 mt-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">
                                        {book.title_tamil || book.title}
                                    </h2>
                                    {(book.author_tamil || book.author) && (
                                        <p className="text-slate-600 mt-2">
                                            {book.author_tamil || book.author}
                                        </p>
                                    )}
                                </div>
                                {(book.description_tamil || book.description) && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">விளக்கம்</h3>
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                            {book.description_tamil || book.description}
                                        </p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Price */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <p className="text-sm text-slate-600 mb-2">Price</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-2xl font-bold text-red-700">
                                    <IndianRupee className="w-6 h-6 mr-1" />
                                    {book.price_inr}
                                </div>
                                <div className="flex items-center text-2xl font-bold text-slate-600">
                                    <DollarSign className="w-6 h-6 mr-1" />
                                    {book.price_usd}
                                </div>
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-slate-500" />
                            {book.stock_quantity > 0 ? (
                                <div>
                                    <Badge className="bg-green-100 text-green-800 mb-1">
                                        In Stock
                                    </Badge>
                                    <p className="text-sm text-slate-600">
                                        Available: {book.stock_quantity} units
                                    </p>
                                </div>
                            ) : (
                                <Badge className="bg-red-100 text-red-800">
                                    Out of Stock
                                </Badge>
                            )}
                        </div>

                        {/* Active Status */}
                        <div>
                            <Badge variant={book.is_active ? 'default' : 'secondary'}>
                                {book.is_active ? 'Active (Visible on Website)' : 'Inactive (Hidden from Website)'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}