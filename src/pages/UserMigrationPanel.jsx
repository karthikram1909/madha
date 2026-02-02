import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, Mail } from 'lucide-react';

export default function UserMigrationPanel() {
    const [loading, setLoading] = useState(false);
    const [apiUsers, setApiUsers] = useState([]);
    const [existingUsers, setExistingUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [migrationResults, setMigrationResults] = useState(null);
    const [migrating, setMigrating] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [apiError, setApiError] = useState(null);

    const fetchAPIUsers = async () => {
        setLoading(true);
        setMigrationResults(null);
        setApiError(null);
        setApiResponse(null);
        
        try {
            console.log('🔄 Calling backend function to fetch and migrate users from API...');
            
            // Directly migrate all users without preview
            const response = await base44.functions.invoke('migrateUsersFromAPI', {
                preview_only: false,
                selected_emails: [] // Empty array means migrate all active users
            });

            console.log('📡 Backend Response:', response.data);

            if (response.data.error) {
                setApiError({
                    type: 'BACKEND_ERROR',
                    message: response.data.error,
                    details: response.data.details
                });
                throw new Error(response.data.error);
            }

            const summary = response.data.summary || {};
            const results = {
                invited: summary.invited || 0,
                skipped: summary.skipped || 0,
                failed: summary.failed || 0,
                passwordReset: 0,
                details: response.data.details || []
            };

            setMigrationResults(results);
            
            console.log('✅ Migration completed:', results);

            setApiResponse({
                success: true,
                userCount: results.invited + results.skipped + results.failed,
                migrationSummary: results,
                responseInfo: {
                    status: 200,
                    statusText: 'OK',
                    ok: true
                }
            });

            // Fetch existing Base44 users to refresh the view
            const existing = await base44.entities.User.list();
            setExistingUsers(existing);
            console.log('✅ Fetched', existing.length, 'existing Base44 users');
            
        } catch (error) {
            console.error('❌ Migration Error:', error);
            
            if (!apiError) {
                setApiError({
                    type: 'NETWORK_ERROR',
                    message: error.message,
                    stack: error.stack
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (email) => {
        const newSelection = new Set(selectedUsers);
        if (newSelection.has(email)) {
            newSelection.delete(email);
        } else {
            newSelection.add(email);
        }
        setSelectedUsers(newSelection);
    };

    const selectAll = () => {
        const activeUsers = apiUsers.filter(u => u.flag === 'active');
        setSelectedUsers(new Set(activeUsers.map(u => u.email)));
    };

    const deselectAll = () => {
        setSelectedUsers(new Set());
    };

    const getUserStatus = (user) => {
        const exists = existingUsers.find(eu => eu.email.toLowerCase() === user.email.toLowerCase());
        if (exists) return 'exists';
        if (user.flag === 'inactive') return 'inactive';
        return 'new';
    };

    const inviteSelectedUsers = async () => {
        setMigrating(true);
        setMigrationResults({ invited: 0, skipped: 0, failed: 0, passwordReset: 0, details: [] });

        try {
            console.log('🚀 Starting migration for', selectedUsers.size, 'users...');
            
            const response = await base44.functions.invoke('migrateUsersFromAPI', {
                preview_only: false,
                selected_emails: Array.from(selectedUsers)
            });

            console.log('📊 Migration Response:', response.data);

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            const summary = response.data.summary || {};
            const results = {
                invited: summary.invited || 0,
                skipped: summary.skipped || 0,
                failed: summary.failed || 0,
                passwordReset: 0,
                details: response.data.details || []
            };

            setMigrationResults(results);
            setSelectedUsers(new Set());
            
            // Refresh the list
            await fetchAPIUsers();
            
        } catch (error) {
            console.error('❌ Migration Error:', error);
            setMigrationResults({
                invited: 0,
                skipped: 0,
                failed: selectedUsers.size,
                passwordReset: 0,
                details: [{
                    email: 'Error',
                    name: 'Migration Failed',
                    status: 'failed',
                    message: error.message
                }]
            });
        } finally {
            setMigrating(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>User Migration Panel</CardTitle>
                    <CardDescription>
                        Test API connection, preview users, and invite them to Base44 authentication
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Fetch Users Section */}
                    <div className="flex gap-4 items-center flex-wrap">
                        <Button onClick={fetchAPIUsers} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Migrating All Users...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Migrate All Users from API
                                </>
                            )}
                        </Button>
                    </div>

                    {/* API Response Status */}
                    {apiResponse && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription>
                                <div className="space-y-2">
                                    <div className="font-semibold text-green-800">✅ Migration Completed Successfully</div>
                                    <div className="text-sm space-y-1">
                                        <div><strong>Status:</strong> {apiResponse.responseInfo.status} {apiResponse.responseInfo.statusText}</div>
                                        <div><strong>Total Users Processed:</strong> {apiResponse.userCount}</div>
                                        {apiResponse.migrationSummary && (
                                            <div className="mt-2 p-2 bg-white rounded">
                                                <div className="font-medium mb-1">Migration Summary:</div>
                                                <div>✅ Invited: {apiResponse.migrationSummary.invited}</div>
                                                <div>⏭️ Skipped: {apiResponse.migrationSummary.skipped}</div>
                                                <div>❌ Failed: {apiResponse.migrationSummary.failed}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* API Error Details */}
                    {apiError && (
                        <Alert className="bg-red-50 border-red-200">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription>
                                <div className="space-y-3">
                                    <div className="font-semibold text-red-800">❌ API Request Failed</div>
                                    <div className="text-sm space-y-2">
                                        <div><strong>Error Type:</strong> {apiError.type}</div>
                                        <div><strong>Message:</strong> {apiError.message}</div>
                                        
                                        {apiError.status && (
                                            <div><strong>HTTP Status:</strong> {apiError.status} {apiError.statusText}</div>
                                        )}
                                        
                                        {apiError.responseInfo && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-red-700 hover:text-red-900 font-medium">
                                                    View Response Details
                                                </summary>
                                                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                                                    {JSON.stringify(apiError.responseInfo, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                        
                                        {apiError.body && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-red-700 hover:text-red-900 font-medium">
                                                    View Error Response Body
                                                </summary>
                                                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                                                    {apiError.body}
                                                </pre>
                                            </details>
                                        )}
                                        
                                        {apiError.rawResponse && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-red-700 hover:text-red-900 font-medium">
                                                    View Raw Response
                                                </summary>
                                                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                                                    {apiError.rawResponse}
                                                </pre>
                                            </details>
                                        )}
                                        
                                        {apiError.stack && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-red-700 hover:text-red-900 font-medium">
                                                    View Stack Trace
                                                </summary>
                                                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                                                    {apiError.stack}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}



                    {/* Migration Results */}
                    {migrationResults && (
                        <Card className="bg-gray-50">
                            <CardHeader>
                                <CardTitle className="text-lg">Migration Results</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {migrationResults.invited}
                                        </div>
                                        <div className="text-sm text-gray-600">Invited</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {migrationResults.passwordReset}
                                        </div>
                                        <div className="text-sm text-gray-600">Need Password Reset</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-600">
                                            {migrationResults.skipped}
                                        </div>
                                        <div className="text-sm text-gray-600">Skipped</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {migrationResults.failed}
                                        </div>
                                        <div className="text-sm text-gray-600">Failed</div>
                                    </div>
                                </div>

                                {/* Detailed Results */}
                                <div className="max-h-[300px] overflow-auto space-y-2">
                                    {migrationResults.details.map((detail, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                                            {detail.status === 'invited' && (
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            )}
                                            {detail.status === 'password_reset_needed' && (
                                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                            )}
                                            {detail.status === 'failed' && (
                                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                            )}
                                            {detail.status === 'skipped' && (
                                                <XCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium">{detail.name}</div>
                                                <div className="text-sm text-gray-600">{detail.email}</div>
                                            </div>
                                            <div className="text-sm text-gray-600">{detail.message}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}