import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function ProfileCompletionReminder({ user }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasLegacyData, setHasLegacyData] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLegacyData = async () => {
      if (!user) return;
      try {
        const appUsers = await base44.entities.AppUser.filter({ base44_user_id: user.id });
        setHasLegacyData(appUsers && appUsers.length > 0);
      } catch (error) {
        console.error('Error checking legacy data:', error);
      } finally {
        setIsChecking(false);
      }
    };
    checkLegacyData();
  }, [user]);

  if (!user || isDismissed || isChecking || hasLegacyData) return null;

  // Check if profile is incomplete
  const isIncomplete = !user.phone || !user.address_line_1 || !user.city || !user.state || !user.pincode;

  if (!isIncomplete) return null;

  return (
    <div className="p-6">
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">
                  Complete Your Profile
                </h4>
                <p className="text-sm text-amber-800 mb-3">
                  Please complete your profile information to enjoy all features and faster checkouts.
                </p>
                <Link to={createPageUrl('UserProfileSettings')}>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDismissed(true)}
              className="text-amber-600 hover:text-amber-900 hover:bg-amber-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}