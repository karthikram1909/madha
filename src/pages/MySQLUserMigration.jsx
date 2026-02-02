import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, XCircle, Database, RefreshCw } from 'lucide-react';

export default function MySQLUserMigration() {
    const [loading, setLoading] = useState(false);
    const [migrationResults, setMigrationResults] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);

    const testConnection = async () => {
        setTestingConnection(true);
        setConnectionStatus(null);
        setApiError(null);
        
        try {
            console.log('🔌 Testing MySQL connection...');
            
            const response = await base44.functions.invoke('testMySQLConnection', {});
            
            console.log('📡 Connection Test Response:', response.data);
            
            if (response.data.success) {
                setConnectionStatus({
                    success: true,
                    message: response.data.message,
                    userCount: response.data.userCount
                });
                setIsConnected(true);
            } else {
                setConnectionStatus({
                    success: false,
                    message: response.data.error || 'Connection failed'
                });
                setIsConnected(false);
            }
            
        } catch (error) {
            console.error('❌ Connection Test Error:', error);
            setConnectionStatus({
                success: false,
                message: error.message
            });
            setIsConnected(false);
            setApiError({
                type: 'CONNECTION_ERROR',
                message: error.message,
                stack: error.stack
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const migrateFromMySQL = async () => {
        setLoading(true);
        setMigrationResults(null);
        setApiError(null);
        setApiResponse(null);
        
        try {
            console.log('🔄 Starting MySQL user migration...');
            
            const response = await base44.functions.invoke('migrateUsersFromMySQL', {
                preview_only: false,
                selected_emails: []
            });

            console.log('📡 Migration Response:', response.data);

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
                imported: summary.imported || 0,
                skipped: summary.skipped || 0,
                failed: summary.failed || 0,
                details: response.data.details || []
            };

            setMigrationResults(results);
            
            console.log('✅ Migration completed:', results);

            setApiResponse({
                success: true,
                userCount: results.imported + results.skipped + results.failed,
                migrationSummary: results,
                responseInfo: {
                    status: 200,
                    statusText: 'OK',
                    ok: true
                }
            });
            
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

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-6 w-6" />
                        MySQL User Migration
                    </CardTitle>
                    <CardDescription>
                        Import users directly from your MySQL database to Base44
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 1: Test Connection */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Step 1: Test MySQL Connection</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                First, verify that the MySQL database connection is working properly.
                            </p>
                            <Button onClick={testConnection} disabled={testingConnection || loading}>
                                {testingConnection ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Testing Connection...
                                    </>
                                ) : (
                                    <>
                                        <Database className="w-4 h-4 mr-2" />
                                        Test MySQL Connection
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Connection Status */}
                        {connectionStatus && (
                            <Alert className={connectionStatus.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                                {connectionStatus.success ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <AlertDescription>
                                    <div className="space-y-1">
                                        <div className={`font-semibold ${connectionStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                                            {connectionStatus.success ? '✅ MySQL Connection Successful' : '❌ MySQL Connection Failed'}
                                        </div>
                                        <div className="text-sm">{connectionStatus.message}</div>
                                        {connectionStatus.userCount && (
                                            <div className="text-sm">
                                                <strong>Total users found in MySQL:</strong> {connectionStatus.userCount}
                                            </div>
                                        )}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Step 2: Migration Button (only shown after successful connection) */}
                    {isConnected && (
                        <div className="space-y-4 pt-4 border-t">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Step 2: Migrate Users</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Now that the connection is established, you can proceed with the migration.
                                </p>
                                <Button onClick={migrateFromMySQL} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Migrating Users from MySQL...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Migrate All Users from MySQL
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Success Response */}
                    {apiResponse && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription>
                                <div className="space-y-2">
                                    <div className="font-semibold text-green-800">✅ MySQL Migration Completed Successfully</div>
                                    <div className="text-sm space-y-1">
                                        <div><strong>Status:</strong> {apiResponse.responseInfo.status} {apiResponse.responseInfo.statusText}</div>
                                        <div><strong>Total Users Processed:</strong> {apiResponse.userCount}</div>
                                        {apiResponse.migrationSummary && (
                                            <div className="mt-2 p-2 bg-white rounded">
                                                <div className="font-medium mb-1">Migration Summary:</div>
                                                <div>✅ Imported: {apiResponse.migrationSummary.imported}</div>
                                                <div>⏭️ Skipped: {apiResponse.migrationSummary.skipped}</div>
                                                <div>❌ Failed: {apiResponse.migrationSummary.failed}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Response */}
                    {apiError && (
                        <Alert className="bg-red-50 border-red-200">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription>
                                <div className="space-y-3">
                                    <div className="font-semibold text-red-800">❌ MySQL Migration Failed</div>
                                    <div className="text-sm space-y-2">
                                        <div><strong>Error Type:</strong> {apiError.type}</div>
                                        <div><strong>Message:</strong> {apiError.message}</div>
                                        
                                        {apiError.details && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-red-700 hover:text-red-900 font-medium">
                                                    View Error Details
                                                </summary>
                                                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                                                    {apiError.details}
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
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {migrationResults.imported}
                                        </div>
                                        <div className="text-sm text-gray-600">Imported</div>
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
                                            {detail.status === 'imported' && (
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            )}
                                            {detail.status === 'failed' && (
                                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                            )}
                                            {detail.status === 'skipped' && (
                                                <XCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium">{detail.name || detail.email}</div>
                                                <div className="text-sm text-gray-600">{detail.email}</div>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {detail.message || detail.reason}
                                            </div>
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