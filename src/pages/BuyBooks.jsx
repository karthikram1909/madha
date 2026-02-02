import React from 'react';
import StickyNavbar from "../components/website/StickyNavbar";  // Assuming this is the navbar component
import PageBanner from '../components/website/PageBanner';  // Assuming you have this banner component

const BuyBooks = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <StickyNavbar />
      <PageBanner
        pageKey="buy_books"
        fallbackTitle="Welcome to Madha Mart, a Souvenir Shop"
        fallbackDescription="Explore our spiritual books collection"
        fallbackImage="https://madhatv.in/images-madha/home/about-banner.png"
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Here we load the content from the URL using an iframe */}
            <iframe 
              src="https://secure.madhatv.in/index.php/admin-v2/booksindia" 
              title="Madha Mart"
              width="100%" 
              height="800px"
              frameBorder="0"
            />
          </div>
          <div className="h-fit sticky top-24">
            {/* Your cart and other elements can stay here */}
            <button className="mt-4 p-2 bg-blue-500 text-white rounded">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyBooks;
