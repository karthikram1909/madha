import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * AppUserLinker Component
 * 
 * Purpose: Links Base44 authenticated users with AppUser records
 * 
 * Process:
 * 1. After Base44 login, checks if AppUser exists with matching base44_user_id
 * 2. If not found, tries to match by email or phone
 * 3. If match found, updates base44_user_id in AppUser
 * 4. If no match, creates new AppUser record
 * 5. Verifies AppUser is_active status before granting access
 * 
 * This component should be used in layouts/pages that require authentication
 */
export default function AppUserLinker({ children, onLinked, onAccessDenied }) {
    const [isChecking, setIsChecking] = useState(true);
    const [appUser, setAppUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        linkUserToAppUser();
    }, []);

    const linkUserToAppUser = async () => {
        try {
            // Get authenticated Base44 user
            const base44User = await base44.auth.me();
            
            if (!base44User) {
                setIsChecking(false);
                return;
            }

            // Step 1: Check if AppUser exists with matching base44_user_id
            let appUserRecord = null;
            const appUsersByBase44Id = await base44.entities.AppUser.filter({
                base44_user_id: base44User.id
            });

            if (appUsersByBase44Id && appUsersByBase44Id.length > 0) {
                appUserRecord = appUsersByBase44Id[0];
            } else {
                // Step 2: Try to match by email (case-insensitive)
                if (base44User.email) {
                    const allAppUsers = await base44.entities.AppUser.list();
                    const normalizedEmail = base44User.email.toLowerCase().trim();
                    
                    appUserRecord = allAppUsers.find(user => 
                        user.email && user.email.toLowerCase().trim() === normalizedEmail
                    );
                    
                    if (appUserRecord) {
                        console.log('📋 Found AppUser by email, updating base44_user_id:', {
                            appUserId: appUserRecord.id,
                            base44UserId: base44User.id,
                            email: base44User.email
                        });

                        // Update base44_user_id in AppUser
                        await base44.asServiceRole.entities.AppUser.update(appUserRecord.id, {
                            base44_user_id: base44User.id
                        });

                        appUserRecord.base44_user_id = base44User.id;
                        console.log('✅ Successfully linked AppUser to Base44 User');
                    }
                }
            }

            // Step 3: If no match found, create new AppUser record
            if (!appUserRecord) {
                appUserRecord = await base44.asServiceRole.entities.AppUser.create({
                    base44_user_id: base44User.id,
                    full_name: base44User.full_name || base44User.email.split('@')[0],
                    email: base44User.email,
                    phone: '',
                    role: base44User.role || 'user',
                    is_active: true,
                    platform: 'web'
                });
            }

            // Step 4: Check if AppUser is active
            if (!appUserRecord.is_active) {
                setError('Your account is inactive. Please contact support.');
                if (onAccessDenied) {
                    onAccessDenied(appUserRecord);
                }
                setIsChecking(false);
                return;
            }

            // Successfully linked
            setAppUser(appUserRecord);
            if (onLinked) {
                onLinked(appUserRecord);
            }
            setIsChecking(false);

        } catch (error) {
            console.error('AppUser linking error:', error);
            setError('Failed to link user profile');
            setIsChecking(false);
        }
    };

    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C] mx-auto"></div>
                    <p className="mt-4 text-slate-600">Verifying your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Pass appUser to children if needed
    return children;
}

/**
 * Hook to get current AppUser profile
 */
export const useAppUser = () => {
    const [appUser, setAppUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAppUser();
    }, []);

    const getAppUser = async () => {
        try {
            const base44User = await base44.auth.me();
            if (!base44User) {
                setLoading(false);
                return;
            }

            const appUserRecords = await base44.entities.AppUser.filter({
                base44_user_id: base44User.id
            });

            if (appUserRecords && appUserRecords.length > 0) {
                setAppUser(appUserRecords[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching AppUser:', error);
            setLoading(false);
        }
    };

    const refreshAppUser = () => {
        setLoading(true);
        getAppUser();
    };

    return { appUser, loading, refreshAppUser };
};