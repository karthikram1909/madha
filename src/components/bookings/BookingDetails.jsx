import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User as AuthUser, ServiceBooking } from "@/api/entities";
import { sendTransactionalEmail } from "@/api/functions";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Heart,
  DollarSign,
  Download,
  Send,
  FileText,
  Check,
  X,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CreditCard,
  Hash,
  Settings,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { generateBookingInvoice } from "@/api/functions";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const statusColors = {
  confirmed: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const paymentStatusColors = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800"
};

const DetailItem = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
        <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <div className="text-sm text-slate-800 font-semibold">{children}</div>
        </div>
    </div>
);

const Section = ({ title, icon: Icon, children }) => (
    <div className="border-t border-slate-100 py-4 first:border-t-0">
        <h4 className="flex items-center gap-2 text-md font-semibold text-slate-800 mb-3">
            <Icon className="w-5 h-5 text-[#B71C1C]" />
            {title}
        </h4>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export default function BookingDetails({ booking, onUpdateStatus, onUpdatePublishStatus, onEdit, onDelete }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [bookerHistory, setBookerHistory] = useState({ count: 0, lastBooking: null });


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await AuthUser.me();
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to fetch user:", e);
      }
    };
    fetchUser();
  }, []);

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
        } else {
            setBookerHistory({ count: 0, lastBooking: null });
        }
    };

    fetchBookerHistory();
  }, [booking]);

  const handleDownloadInvoice = async () => {
       try {
            const { data } = await generateBookingInvoice({ bookingId: booking.id });
            const blob = new Blob([data], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `madha_tv_invoice_${booking.id}.html`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            toast.success("Invoice download started.");
        } catch(error) {
            console.error("Failed to download invoice:", error);
            toast.error("Could not download invoice. Please try again later.");
        }
  };

  const handleResendConfirmation = async () => {
    if (!booking) return;
    try {
        await sendTransactionalEmail({
            type: 'booking_confirmation',
            data: booking
        });
        toast.success('Confirmation email has been resent successfully!');
    } catch(error) {
        console.error("Failed to resend confirmation:", error);
        toast.error("Could not resend email. Please check server logs.");
    }
  };

  const handlePublishToggle = (isPublished) => {
      onUpdatePublishStatus(booking.id, isPublished);
  };
    
  const handleDelete = () => {
      if (window.confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) {
          onDelete(booking.id);
      }
  };

  if (!booking) {
    return (
      <Card className="bg-white shadow-lg border-0 sticky top-24">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Booking Selected</h3>
          <p className="text-slate-500">Choose a booking from the list to see the details</p>
        </CardContent>
      </Card>
    );
  }

  const getCurrencySymbol = (currency) => {
    switch (currency?.toUpperCase()) {
        case 'USD': return '$';
        case 'INR': default: return '₹';
    }
  };
  
  const getBookerType = (currency) => {
    switch (currency?.toUpperCase()) {
        case 'USD': return 'International';
        case 'INR': default: return 'Indian';
    }
  }

  const canPublish = currentUser && currentUser.role === 'admin';
  const showSpecialImage = ['birthday_service', 'deathday_service', 'marriage_blessing'].includes(booking.service_type);

  return (
    <Card className="bg-white shadow-lg border-0 sticky top-24">
      <CardHeader className="border-b border-slate-100 p-4">
        <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Booking Details
              </CardTitle>
               <CardDescription>ID: {booking.id}</CardDescription>
            </div>
            <Badge className={`${statusColors[booking.status]} border`}>
                {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
            </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 max-h-[75vh] overflow-y-auto">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => onEdit(booking)}><Edit className="w-3 h-3 mr-1.5" /> Edit</Button>
              <Button variant="outline" size="sm" onClick={handleDownloadInvoice}><Download className="w-3 h-3 mr-1.5" /> Invoice</Button>
              <Button variant="outline" size="sm" onClick={handleResendConfirmation}><Send className="w-3 h-3 mr-1.5" /> Resend Email</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="w-3 h-3 mr-1.5" /> Delete</Button>
          </div>

          {showSpecialImage && booking.booker_photo_url && (
            <Section title="Service Photo" icon={ImageIcon}>
              <img 
                src={booking.booker_photo_url} 
                alt="Service specific photo" 
                className="w-full h-auto object-cover rounded-lg shadow-md aspect-square"
              />
            </Section>
          )}

          <Section title="Service Details" icon={Heart}>
              <DetailItem label="Service Type" icon={Heart}>{booking.service_type?.replace(/_/g, ' ') || 'N/A'}</DetailItem>
              <DetailItem label="Beneficiary" icon={User}>{booking.beneficiary_name}</DetailItem>
              <DetailItem label="Date & Time" icon={Calendar}>
                  {format(new Date(booking.booking_date), 'EEEE, MMM d, yyyy')}
                  {booking.booking_time ? ` at ${booking.booking_time}` : ''}
              </DetailItem>
              {booking.intention_text && (
                   <DetailItem label="Intention" icon={FileText}>
                      <p className="text-sm font-normal text-slate-600 bg-slate-50 p-2 rounded-md">{booking.intention_text}</p>
                  </DetailItem>
              )}
          </Section>

          <Section title="Payment Details" icon={DollarSign}>
              <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Amount" icon={DollarSign}>
                      {getCurrencySymbol(booking.currency)}{booking.amount?.toLocaleString()}
                  </DetailItem>
                  <DetailItem label="Payment Status" icon={Check}>
                      <Badge className={paymentStatusColors[booking.payment_status]}>
                          {booking.payment_status}
                      </Badge>
                  </DetailItem>
                  <DetailItem label="Gateway" icon={CreditCard}>
                      <span className="capitalize">{booking.payment_method || 'N/A'}</span>
                  </DetailItem>
                   <DetailItem label="Payment ID" icon={Hash}>
                      <span className="font-mono text-xs break-all">{booking.payment_id || 'N/A'}</span>
                  </DetailItem>
              </div>
          </Section>
          
          <Section title="Booker Information" icon={User}>
               <div className="flex items-center gap-4">
                  {!showSpecialImage && booking.booker_photo_url ? (
                      <Avatar className="w-16 h-16 rounded-md">
                          <AvatarImage src={booking.booker_photo_url} alt={booking.booker_name} />
                          <AvatarFallback className="rounded-md">{booking.booker_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                  ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center">
                          <User className="w-8 h-8 text-slate-400" />
                      </div>
                  )}
                  <div>
                      <h5 className="font-bold text-slate-800">{booking.booker_name}</h5>
                      <p className="text-sm text-blue-600 flex items-center gap-1"><Mail className="w-3 h-3"/>{booking.booker_email}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3"/>{booking.booker_phone}</p>
                      <Badge variant="outline" className="mt-1">{getBookerType(booking.currency)}</Badge>
                  </div>
              </div>
              <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg mt-4">
                  <p>Total Bookings by this user: <span className="font-bold">{bookerHistory.count}</span></p>
                  {bookerHistory.lastBooking && (
                      <p>Last Booking: {format(new Date(bookerHistory.lastBooking.created_date), 'MMM d, yyyy')} for {bookerHistory.lastBooking.service_type?.replace(/_/g, ' ')}</p>
                  )}
              </div>
          </Section>
          
          <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                  <AccordionTrigger className="text-md font-semibold text-slate-800 hover:no-underline">
                      <div className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-[#B71C1C]" />
                          Admin Controls
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                      <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Update Status</h4>
                          <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant={booking.status === 'confirmed' ? 'default' : 'outline'} className={booking.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' : ''} onClick={() => onUpdateStatus(booking.id, 'confirmed')}><Check className="w-4 h-4 mr-2"/> Confirm</Button>
                              <Button size="sm" variant={booking.status === 'completed' ? 'default' : 'outline'} className={booking.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''} onClick={() => onUpdateStatus(booking.id, 'completed')}><Heart className="w-4 h-4 mr-2"/> Complete</Button>
                              <Button size="sm" variant="outline" onClick={() => onUpdateStatus(booking.id, 'pending')}><Clock className="w-4 h-4 mr-2"/> To Pending</Button>
                              <Button size="sm" variant={booking.status === 'cancelled' ? 'destructive' : 'outline'} onClick={() => onUpdateStatus(booking.id, 'cancelled')}><X className="w-4 h-4 mr-2"/> Cancel</Button>
                          </div>
                      </div>
                      {canPublish && (
                          <div>
                              <h4 className="text-sm font-semibold text-slate-700 mb-2">Publication Control</h4>
                              <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg">
                                  <Switch id="publish-toggle" checked={booking.published} onCheckedChange={handlePublishToggle} />
                                  <Label htmlFor="publish-toggle" className="font-medium text-amber-800 flex items-center gap-2">
                                      {booking.published ? <><Eye className="w-4 h-4"/> Published</> : <><EyeOff className="w-4 h-4"/> Not Published</>}
                                  </Label>
                              </div>
                          </div>
                      )}
                  </AccordionContent>
              </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}