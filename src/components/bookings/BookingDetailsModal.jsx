import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadFile } from "@/api/integrations";
import { ServiceBooking } from "@/api/entities";
import { generateInvoicePdf } from "@/components/utils/pdfGenerator";
import {
  User,
  Phone,
  Mail,
  Heart,
  DollarSign,
  Download,
  Send,
  Check,
  X,
  Edit,
  Trash2,
  CreditCard,
  Save,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const statusColors = {
  confirmed: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  published: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const paymentStatusColors = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800"
};

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateBooking,
  onDeleteBooking
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [bookerHistory, setBookerHistory] = useState({ count: 0, lastBooking: null });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBookerHistory = async () => {
      if (booking?.booker_email) {
        try {
          const history = await ServiceBooking.filter({ booker_email: booking.booker_email }, '-created_date', 20);
          const previousBookings = history.filter(b => b.id !== booking.id);

          setBookerHistory({
            count: previousBookings.length + 1,
            lastBooking: previousBookings.length > 0 ? previousBookings[0] : null
          });
        } catch (e) {
          console.error("Failed to fetch booker history:", e);
          setBookerHistory({ count: 1, lastBooking: null });
        }
      }
    };
    
    if (booking) {
      setEditFormData({
        beneficiary_name: booking.beneficiary_name || '',
        intention_text: booking.intention_text || '',
        booking_date: booking.booking_date ? booking.booking_date.split('T')[0] : '',
        booking_time: booking.booking_time || '',
        booker_name: booking.booker_name || '',
        booker_email: booking.booker_email || '',
        booker_phone: booking.booker_phone || '',
        amount: booking.amount || 0,
        admin_notes: booking.admin_notes || '',
        booker_photo_url: booking.booker_photo_url || ''
      });
      setImagePreview(booking.booker_photo_url || '');
      setImageFile(null);

      fetchBookerHistory(); // Load booker history
    }
  }, [booking]);

  const getCurrencySymbol = (currency) => {
    return currency === 'USD' ? '$' : '₹';
  };

  const getBookerType = (currency) => {
    return currency === 'USD' ? 'International' : 'Indian';
  };

  const formatServiceType = (type) => {
    if (!type) return 'Unknown';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDownloadInvoice = async () => {
    toast.info("Generating invoice PDF...");
    try {
      // Prepare invoice data in the format expected by generateInvoicePdf
      const invoiceData = {
        bookings: [booking],
        totals: {
          subtotal: parseFloat(booking.amount) || 0,
          cgst: parseFloat(booking.cgst_amount) || 0,
          sgst: parseFloat(booking.sgst_amount) || 0,
          igst: parseFloat(booking.igst_amount) || 0,
          total: (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0)
        },
        meta: {
          invoice_id: booking.order_id || `INV-${booking.id.slice(-8).toUpperCase()}`,
          invoice_date: new Date().toISOString(),
          currency: booking.currency || 'INR',
          trn: booking.trn || booking.order_id || `INV-${booking.id.slice(-8).toUpperCase()}`,
          booker_info: {
            name: booking.booker_name || '',
            address: booking.booker_address || '',
            state: booking.state || '',
            country: booking.country || '',
            pincode: booking.booker_pincode || '',
            email: booking.booker_email || '',
            phone: booking.booker_phone || '',
            gstin: booking.gstin || '',
          }
        }
      };

      // Generate PDF using the client-side utility
      const doc = await generateInvoicePdf(invoiceData);
      const invoiceNumber = invoiceData.meta.invoice_id;
      doc.save(`invoice-${invoiceNumber}.pdf`);

      toast.success("Invoice downloaded!");
    } catch(error) {
      console.error("Failed to generate invoice:", error);
      toast.error("Could not generate invoice.");
    }
  };

  const handlePhotoDownload = () => {
    if (!booking?.booker_photo_url) return;
    
    const link = document.createElement('a');
    link.href = booking.booker_photo_url;
    link.download = `booking_photo_${booking.id.slice(-8)}.jpg`; // Use slice(-8) for a shorter ID in filename
    link.target = '_blank'; // Open in a new tab/window if direct download fails
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResendEmail = async () => {
    if (!booking?.booker_email) {
      toast.error('No email address found for this booking');
      return;
    }

    setIsLoading(true);
    try {
      const emailType = booking.status === 'published' ? 'published' : 'confirmation';
      
      const response = await base44.functions.invoke('sendResendEmail', {
        module: 'bookings',
        type: emailType,
        recipient_email: booking.booker_email,
        data: booking
      });
      
      if (response.data?.success) {
        toast.success(`✅ Email sent to ${booking.booker_email}!`);
      } else if (response.data?.skipped) {
        toast.info(response.data.message || 'Email not configured');
      } else if (response.data?.error) {
        toast.error(response.data.error);
        
        // Show help text if available
        if (response.data.help) {
          toast.info(response.data.help, { duration: 8000 });
        }
        
        // Specific suggestions
        if (response.data.error.includes('API key')) {
          toast.error('Go to Settings → Resend Email (Bookings) to update your API key', { duration: 6000 });
        } else if (response.data.error.includes('domain')) {
          toast.error('Verify your domain at resend.com/domains', { duration: 6000 });
        }
      }
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send email. Check Settings → Resend Email configuration.');
    }
    setIsLoading(false);
  };

  const handleEditToggle = () => {
    // Don't allow editing if booking is published
    if (booking?.status === 'published') {
      toast.info("Published bookings cannot be edited.");
      return;
    }

    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form data when starting to edit
      setEditFormData({
        beneficiary_name: booking.beneficiary_name || '',
        intention_text: booking.intention_text || '',
        booking_date: booking.booking_date ? booking.booking_date.split('T')[0] : '',
        booking_time: booking.booking_time || '',
        booker_name: booking.booker_name || '',
        booker_email: booking.booker_email || '',
        booker_phone: booking.booker_phone || '',
        amount: booking.amount || 0,
        admin_notes: booking.admin_notes || '',
        booker_photo_url: booking.booker_photo_url || ''
      });
      setImagePreview(booking.booker_photo_url || '');
      setImageFile(null);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    let updateData = { ...editFormData };

    if (imageFile) {
      try {
        const { file_url } = await UploadFile({ file: imageFile });
        updateData.booker_photo_url = file_url;
      } catch (error) {
        toast.error("Failed to upload image. Please try again.");
        console.error("Image upload error:", error);
        setIsLoading(false);
        return;
      }
    }

    await onUpdateBooking(booking.id, updateData);
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) {
      onDeleteBooking(booking.id);
    }
  };

  const handlePublishAndNotify = async () => {
    if (booking.status === 'published') {
        toast.info("This booking has already been published.");
        return;
    }

    setIsLoading(true);
    try {
      await onUpdateStatus(booking.id, 'published');
      toast.success("✅ Booking published successfully!");
      
      // Send published notification email
      try {
        console.log('📧 Sending published notification...');
        const response = await base44.functions.invoke('sendResendEmail', {
          module: 'bookings',
          type: 'published',
          recipient_email: booking.booker_email,
          data: booking
        });
        
        if (response.data?.success) {
          toast.success(`✅ Published notification sent to ${booking.booker_email}!`);
        } else if (response.data?.skipped) {
          toast.info(response.data.message || 'Email not configured');
        } else if (response.data?.error) {
          console.error('Email error during publish notification:', response.data);
          toast.error(`Published email failed: ${response.data.error}`);
        }
      } catch (emailError) {
        console.error('❌ Email error during publish notification:', emailError);
        toast.warning('Booking published but email notification failed.');
      }
    } catch (error) {
      console.error("❌ Publish error:", error);
      toast.error("Failed to publish booking.");
    } finally {
      setIsLoading(false);
    }
  };

  const showSpecialImage = ['birthday_service', 'deathday_service', 'marriage_blessing'].includes(booking?.service_type);

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Booking Details
            </DialogTitle>
            <Badge className={`${statusColors[booking.status]} border`}>
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
            </Badge>
          </div>
          <DialogDescription>
            Order ID: <span className="font-mono font-semibold">{booking.order_id || 'N/A'}</span> | Booking Ref: <span className="font-mono">{booking.id}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Booking Info</TabsTrigger>
            <TabsTrigger value="payment">Payment Info</TabsTrigger>
            <TabsTrigger value="booker">Booked By</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#B71C1C]" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service_type">Service Type</Label>
                      <Input
                        id="service_type"
                        value={formatServiceType(booking.service_type)}
                        disabled
                        className="bg-slate-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="beneficiary_name">Beneficiary Name</Label>
                      <Input
                        id="beneficiary_name"
                        value={editFormData.beneficiary_name}
                        onChange={(e) => handleInputChange('beneficiary_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="booking_date">Booking Date</Label>
                      <Input
                        id="booking_date"
                        type="date"
                        value={editFormData.booking_date}
                        onChange={(e) => handleInputChange('booking_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="booking_time">Booking Time</Label>
                      <Input
                        id="booking_time"
                        type="time"
                        value={editFormData.booking_time}
                        onChange={(e) => handleInputChange('booking_time', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="intention_text">Intention</Label>
                      <Textarea
                        id="intention_text"
                        value={editFormData.intention_text}
                        onChange={(e) => handleInputChange('intention_text', e.target.value)}
                        rows={3}
                      />
                    </div>
                    {showSpecialImage && (
                      <div className="md:col-span-2">
                        <Label htmlFor="service_photo">Service Photo</Label>
                        <Input
                          id="service_photo"
                          type="file"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="mb-2"
                        />
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Service Photo"
                            className="w-32 h-32 object-cover rounded-lg shadow-md"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Service Type</p>
                      <p className="text-lg font-semibold text-slate-900">{formatServiceType(booking.service_type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Beneficiary</p>
                      <p className="text-lg font-semibold text-slate-900">{booking.beneficiary_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Date & Time</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {format(new Date(booking.booking_date), 'EEEE, MMM d, yyyy')}
                        {booking.booking_time && ` at ${booking.booking_time}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Booking Type</p>
                      <p className="text-lg font-semibold text-slate-900 capitalize">
                        {booking.booking_type?.replace('_', ' ') || 'One-time'}
                      </p>
                    </div>
                    {booking.intention_text && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-500 font-medium">Intention</p>
                        <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">{booking.intention_text}</p>
                      </div>
                    )}
                    {showSpecialImage && booking.booker_photo_url && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-500 font-medium mb-2">Service Photo</p>
                        <div
                          className="cursor-pointer group relative w-48 h-48"
                          onClick={handlePhotoDownload}
                          title="Click to download photo"
                        >
                          <img
                            src={booking.booker_photo_url}
                            alt="Service Photo"
                            className="w-full h-full object-cover rounded-lg shadow-md"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <Download className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#B71C1C]" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={editFormData.amount}
                        onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                        readOnly
                        className="bg-slate-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={booking.currency}
                        disabled
                        className="bg-slate-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Amount</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {getCurrencySymbol(booking.currency)}{booking.amount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Payment Status</p>
                      <Badge className={`${paymentStatusColors[booking.payment_status]} text-lg px-3 py-1`}>
                        {booking.payment_status === 'completed' ? 'Paid' :
                         booking.payment_status === 'failed' ? 'Failed' : 'Pending'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Payment Gateway</p>
                      <p className="text-lg font-semibold text-slate-900 capitalize flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {booking.payment_method || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Payment ID</p>
                      <p className="text-sm font-mono text-slate-900 bg-slate-50 p-2 rounded border break-all">
                        {booking.payment_id || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booker" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#B71C1C]" />
                  Booked By
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="booker_name">Booker Name</Label>
                      <Input
                        id="booker_name"
                        value={editFormData.booker_name}
                        onChange={(e) => handleInputChange('booker_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="booker_email">Booker Email</Label>
                      <Input
                        id="booker_email"
                        type="email"
                        value={editFormData.booker_email}
                        onChange={(e) => handleInputChange('booker_email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="booker_phone">Booker Phone</Label>
                      <Input
                        id="booker_phone"
                        value={editFormData.booker_phone}
                        onChange={(e) => handleInputChange('booker_phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin_notes">Admin Notes</Label>
                      <Textarea
                        id="admin_notes"
                        value={editFormData.admin_notes}
                        onChange={(e) => handleInputChange('admin_notes', e.target.value)}
                        placeholder="Internal notes about this booking..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      {(!showSpecialImage && booking.booker_photo_url) ? (
                        <div
                          className="cursor-pointer group relative"
                          onClick={handlePhotoDownload}
                          title="Click to download photo"
                        >
                          <Avatar className="w-20 h-20 rounded-lg">
                            <AvatarImage src={booking.booker_photo_url} alt={booking.booker_name} />
                            <AvatarFallback className="rounded-lg text-xl">
                              {booking.booker_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <Download className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                          <User className="w-10 h-10 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{booking.booker_name}</h3>
                        <p className="text-slate-600 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {booking.booker_email}
                        </p>
                        <p className="text-slate-600 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {booking.booker_phone}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {getBookerType(booking.currency)} User
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Booking History</h4>
                      <p className="text-blue-800">
                        <span className="font-bold">{bookerHistory.count}</span> total bookings
                      </p>
                      {bookerHistory.lastBooking && (
                        <p className="text-blue-700 text-sm">
                          Last booking: {format(new Date(bookerHistory.lastBooking.created_date), 'MMM d, yyyy')}
                          for {formatServiceType(bookerHistory.lastBooking.service_type)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          {isEditing ? (
            <>
              <Button onClick={handleSaveChanges} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleEditToggle} disabled={isLoading}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              {/* Only show action buttons if status is not pending, cancelled, or payment failed */}
              {!['pending', 'cancelled'].includes(booking.status) && booking.payment_status !== 'failed' && (
                <>
                  {booking.status !== 'published' && (
                    <Button 
                      onClick={handleEditToggle} 
                      variant="outline" 
                      disabled={isLoading}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Booking
                    </Button>
                  )}
                  <Button onClick={handleDownloadInvoice} variant="outline" disabled={isLoading}>
                    <Download className="w-4 h-4 mr-2" />
                    Get Invoice
                  </Button>
                  <Button onClick={handleResendEmail} variant="outline" disabled={isLoading}>
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? 'Sending...' : 'Resend Email'}
                  </Button>
                  {booking.status !== 'published' && (
                    <Button 
                      onClick={() => onUpdateStatus(booking.id, 'confirmed')} 
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100"
                      disabled={isLoading}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                  )}
                  <Button 
                    onClick={handlePublishAndNotify} 
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100"
                    disabled={booking.status === 'published' || isLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {booking.status === 'published' ? 'Published' : (isLoading ? 'Publishing...' : 'Publish & Notify')}
                  </Button>
                </>
              )}
              
              {/* Delete button is always visible for admin control */}
              <Button onClick={handleDelete} variant="destructive" disabled={isLoading}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}