import React, { useState, useEffect } from 'react';
import { EmailLog } from '@/api/entities';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await EmailLog.list('-created_date', 100);
      console.log('📧 Email logs loaded:', data.length);
      setLogs(data);
    } catch (error) {
      console.error("Failed to load email logs:", error);
      toast.error("Failed to load email logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'skipped':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Skipped</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getErrorSuggestion = (errorMessage) => {
    if (!errorMessage) return null;
    
    const msg = errorMessage.toLowerCase();
    
    if (msg.includes('not verified') || msg.includes('domain')) {
      return {
        type: 'error',
        message: 'Email domain not verified in Resend.',
        action: 'Verify your domain at resend.com/domains',
        link: 'https://resend.com/domains'
      };
    }
    
    if (msg.includes('rate limit')) {
      return {
        type: 'warning',
        message: 'Rate limit exceeded.',
        action: 'Wait a few minutes before sending more emails'
      };
    }
    
    if (msg.includes('invalid') && msg.includes('api')) {
      return {
        type: 'error',
        message: 'Invalid Resend API Key.',
        action: 'Check your API key in Settings → Resend Email'
      };
    }
    
    if (msg.includes('unauthorized') || msg.includes('forbidden')) {
      return {
        type: 'error',
        message: 'API authentication failed.',
        action: 'Check your Resend API key in Settings'
      };
    }
    
    return {
      type: 'error',
      message: errorMessage,
      action: 'Check Resend configuration in Settings'
    };
  };

  const failedLogs = logs.filter(log => log.status === 'failed');
  const hasFailedEmails = failedLogs.length > 0;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {hasFailedEmails && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-5 w-5 !text-red-600" />
            <AlertDescription className="text-red-900">
              <strong>⚠️ Email Sending Issues Detected:</strong> You have {failedLogs.length} failed email(s). 
              <br />
              <span className="text-sm">Please check your Resend configuration in Settings → Resend Email (Bookings).</span>
              <br />
              <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-red-700 underline text-sm mt-2 inline-flex items-center gap-1">
                Verify your domain in Resend <ExternalLink className="w-3 h-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">📧 Email Sending Logs</CardTitle>
            <Button onClick={fetchLogs} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Related ID</TableHead>
                  <TableHead className="min-w-[300px]">Error / Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan="7" className="text-center py-8">Loading logs...</TableCell></TableRow>
                ) : logs.length > 0 ? (
                  logs.map((log) => {
                    const suggestion = getErrorSuggestion(log.error_message);
                    
                    return (
                      <TableRow key={log.id} className={log.status === 'failed' ? 'bg-red-50' : ''}>
                        <TableCell className="text-sm">{format(new Date(log.created_date), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                        <TableCell>{statusBadge(log.status)}</TableCell>
                        <TableCell className="text-sm font-mono">{log.recipient}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{log.subject}</TableCell>
                        <TableCell className="text-sm">{log.email_type}</TableCell>
                        <TableCell className="font-mono text-xs">{log.related_id?.slice(-8)}</TableCell>
                        <TableCell className="max-w-md">
                          {suggestion ? (
                            <div className={`text-xs p-3 rounded ${suggestion.type === 'error' ? 'bg-red-100 text-red-900 border border-red-200' : 'bg-yellow-100 text-yellow-900 border border-yellow-200'}`}>
                              <p className="font-semibold mb-1">❌ {suggestion.message}</p>
                              <p className="text-xs opacity-80 mb-2">→ {suggestion.action}</p>
                              {suggestion.link && (
                                <a href={suggestion.link} target="_blank" rel="noopener noreferrer" className="text-xs underline inline-flex items-center gap-1">
                                  Open Resend <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ) : log.error_message ? (
                            <div className="text-xs text-red-600 p-2 bg-red-50 rounded border border-red-200">
                              {log.error_message}
                            </div>
                          ) : (
                            <span className="text-xs text-green-600 font-medium">✓ Sent successfully</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan="7" className="text-center py-8">No logs found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}