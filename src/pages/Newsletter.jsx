import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import CampaignList from '../components/newsletter/CampaignList';
import SubscriberList from '../components/newsletter/SubscriberList';
import CampaignEditor from '../components/newsletter/CampaignEditor';

export default function NewsletterPage() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refresh in list

    const handleSaveSuccess = () => {
        setIsEditorOpen(false);
        setEditingCampaign(null);
        setRefreshKey(prev => prev + 1); // Trigger a refresh
    };

    const handleEditCampaign = (campaign) => {
        setEditingCampaign(campaign);
        setIsEditorOpen(true);
    };

    const handleAddNewCampaign = () => {
        setEditingCampaign(null);
        setIsEditorOpen(true);
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div 
              className="relative bg-cover bg-center h-52" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2940&auto=format&fit=crop')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
              <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Newsletter Center</h1>
                <p className="text-red-100 max-w-2xl text-lg shadow-lg">Engage your community with updates, events, and spiritual messages.</p>
              </div>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                <Tabs defaultValue="campaigns">
                    <div className="flex justify-between items-center mb-6">
                        <TabsList>
                            <TabsTrigger value="campaigns"><Newspaper className="w-4 h-4 mr-2"/>Campaigns</TabsTrigger>
                            <TabsTrigger value="subscribers"><Users className="w-4 h-4 mr-2"/>Subscribers</TabsTrigger>
                        </TabsList>
                        <Button onClick={handleAddNewCampaign} className="bg-[#B71C1C] hover:bg-[#D32F2F]">
                            <Plus className="w-4 h-4 mr-2"/> Create Campaign
                        </Button>
                    </div>
                    
                    <TabsContent value="campaigns">
                        <CampaignList key={refreshKey} onEdit={handleEditCampaign} />
                    </TabsContent>
                    
                    <TabsContent value="subscribers">
                        <SubscriberList />
                    </TabsContent>
                </Tabs>
            </div>

            <CampaignEditor
                isOpen={isEditorOpen}
                setIsOpen={setIsEditorOpen}
                campaign={editingCampaign}
                onSaveSuccess={handleSaveSuccess}
            />
        </div>
    );
}