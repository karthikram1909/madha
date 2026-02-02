import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-6">
      <Card className="max-w-2xl mx-auto text-center shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-12">
          {/* 404 Visual */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-[#B71C1C] mb-4">404</div>
            <div className="w-24 h-24 bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Content */}
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Page Not Found</h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            We couldn't find the page you're looking for. The page may have been moved, 
            deleted, or you may have entered an incorrect URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Home")}>
              <Button size="lg" className="w-full sm:w-auto bg-[#B71C1C] hover:bg-[#D32F2F]">
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Help Links */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Looking for something specific?
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Link to={createPageUrl("Home")} className="text-[#B71C1C] hover:underline">
                Home
              </Link>
              <Link to={createPageUrl("LiveTV")} className="text-[#B71C1C] hover:underline">
                Live TV
              </Link>
              <Link to={createPageUrl("BookService")} className="text-[#B71C1C] hover:underline">
                Book Service
              </Link>
              <Link to={createPageUrl("Donate")} className="text-[#B71C1C] hover:underline">
                Donate
              </Link>
              <Link to={createPageUrl("Gallery")} className="text-[#B71C1C] hover:underline">
                Gallery
              </Link>
              <Link to={createPageUrl("About")} className="text-[#B71C1C] hover:underline">
                About Us
              </Link>
              <Link to={createPageUrl("Contact")} className="text-[#B71C1C] hover:underline">
                Contact
              </Link>
              <Link to={createPageUrl("Schedule")} className="text-[#B71C1C] hover:underline">
                Schedule
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}