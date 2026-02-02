import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NewsletterCampaign, NewsletterSubscriber } from '@/api/entities';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from 'lucide-react';

export default function CampaignEditor({ isOpen, setIsOpen, campaign, onSaveSuccess }) {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [recipientFilter, setRecipientFilter] = useState('all');
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (campaign) {
            setSubject(campaign.subject || '');
            setContent(campaign.content || '');
            setStatus(campaign.status || 'draft');
            setRecipientFilter(campaign.recipient_filter || 'all');
            setSelectedRecipients(campaign.selected_recipients || []);
        } else {
            setSubject('');
            setContent('');
            setStatus('draft');
            setRecipientFilter('all');
            setSelectedRecipients([]);
        }
    }, [campaign, isOpen]);

    useEffect(() => {
        const fetchSubscribers = async () => {
            if(isOpen) {
                try {
                    const allSubscribers = await NewsletterSubscriber.filter({ status: 'subscribed' });
                    setSubscribers(allSubscribers);
                } catch (error) {
                    toast.error("Failed to load subscriber list.");
                    console.error(error);
                }
            }
        };
        fetchSubscribers();
    }, [isOpen]);

    const handleSave = async () => {
        setIsLoading(true);
        const campaignData = {
            subject,
            content,
            status,
            recipient_filter: recipientFilter,
            selected_recipients: recipientFilter === 'selected' ? selectedRecipients : [],
        };

        try {
            if (campaign) {
                await NewsletterCampaign.update(campaign.id, campaignData);
                toast.success('Campaign updated successfully!');
            } else {
                await NewsletterCampaign.create(campaignData);
                toast.success('Campaign created successfully!');
            }
            onSaveSuccess();
            setIsOpen(false);
        } catch (error) {
            toast.error('Failed to save campaign.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectRecipient = (email) => {
        setSelectedRecipients(prev => 
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const filteredSubscribers = useMemo(() => {
        return subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [subscribers, searchTerm]);

    const handleSelectAllFiltered = () => {
        const filteredEmails = filteredSubscribers.map(s => s.email);
        const allSelected = filteredEmails.every(email => selectedRecipients.includes(email));

        if (allSelected) {
            // Deselect all filtered
            setSelectedRecipients(prev => prev.filter(email => !filteredEmails.includes(email)));
        } else {
            // Select all filtered
            setSelectedRecipients(prev => [...new Set([...prev, ...filteredEmails])]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{campaign ? 'Edit' : 'Create'} Newsletter Campaign</DialogTitle>
                    <DialogDescription>Design and configure your email campaign to send to subscribers.</DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 flex-1 overflow-hidden">
                    {/* Left Panel - Editor */}
                    <div className="md:col-span-2 flex flex-col gap-4 h-full">
                        <Input
                            placeholder="Campaign Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="text-lg"
                        />
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            className="flex-grow h-full overflow-hidden"
                            style={{ display: 'flex', flexDirection: 'column' }}
                        />
                    </div>
                    
                    {/* Right Panel - Settings */}
                    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
                        <div>
                            <Label className="font-semibold text-base">Recipients</Label>
                            <RadioGroup value={recipientFilter} onValueChange={setRecipientFilter} className="mt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="all" />
                                    <Label htmlFor="all">All Subscribers ({subscribers.length})</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="selected" id="selected" />
                                    <Label htmlFor="selected">Select Subscribers</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        
                        {recipientFilter === 'selected' && (
                            <div className="flex flex-col gap-2 p-3 border rounded-md bg-slate-50 flex-1 min-h-0">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                    <Input 
                                        placeholder="Search subscribers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <Label className="text-sm font-medium">
                                        Selected: {selectedRecipients.length}
                                    </Label>
                                    <Button variant="link" size="sm" onClick={handleSelectAllFiltered}>
                                        Select all filtered
                                    </Button>
                                </div>
                                <ScrollArea className="flex-grow">
                                    <div className="space-y-2 py-2">
                                    {filteredSubscribers.map(sub => (
                                        <div key={sub.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`sub-${sub.id}`}
                                                checked={selectedRecipients.includes(sub.email)}
                                                onCheckedChange={() => handleSelectRecipient(sub.email)}
                                            />
                                            <Label htmlFor={`sub-${sub.id}`} className="font-normal w-full truncate" title={sub.email}>
                                                {sub.full_name ? `${sub.full_name} (${sub.email})` : sub.email}
                                            </Label>
                                        </div>
                                    ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Campaign'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}