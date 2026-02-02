import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Bot,
  MessageSquare,
  Brain,
  BarChart3,
  Trash2,
  Globe,
  MessageCircle,
  Plus,
  Edit,
  Download, // Added Download icon
  Phone // Assuming Phone icon is used in getPlatformIcon
} from 'lucide-react';
import { ChatFlow, ChatLog, WebsiteContent } from '@/api/entities';
import { toast } from 'sonner';

export default function ChatbotManagerPage() {
  const [activeTab, setActiveTab] = useState('flows');
  const [flows, setFlows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [trainingData, setTrainingData] = useState('');
  const [trainingDataId, setTrainingDataId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [enabledContentId, setEnabledContentId] = useState(null);

  // Chat Flow States
  const [newFlow, setNewFlow] = useState({
    flow_name: '',
    intent_keywords: '',
    response_template: '',
    platform_specific: 'all'
  });

  useEffect(() => {
    loadChatbotData();
  }, []);

  const loadChatbotData = async () => {
    setIsLoading(true);
    try {
      // Fetch data with individual error handling to prevent rate limit blocking
      let enabledSetting = [];
      let trainingDataContent = [];
      let chatFlowsData = [];
      let chatLogsData = [];

      try {
        enabledSetting = await WebsiteContent.filter({ section: 'chatbot', content_key: 'enabled' });
      } catch (err) {
        console.warn("Could not load chatbot enabled setting:", err.message);
      }

      try {
        trainingDataContent = await WebsiteContent.filter({ section: 'chatbot', content_key: 'training_data' });
      } catch (err) {
        console.warn("Could not load training data:", err.message);
      }

      try {
        chatFlowsData = await ChatFlow.list();
      } catch (err) {
        console.warn("Could not load ChatFlows:", err.message);
        if (err.message?.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please wait a moment and refresh.');
        }
      }

      try {
        chatLogsData = await ChatLog.list('-created_date', 50);
      } catch (err) {
        console.warn("Could not load chat logs:", err.message);
      }

      // Process enabled setting
      if (enabledSetting.length > 0) {
        setChatEnabled(enabledSetting[0].content_value === 'true');
        setEnabledContentId(enabledSetting[0].id);
      } else {
        setChatEnabled(false);
        setEnabledContentId(null);
      }

      // Process training data
      if (trainingDataContent.length > 0) {
        setTrainingData(trainingDataContent[0].content_value);
        setTrainingDataId(trainingDataContent[0].id);
      }

      // Set flows and logs
      setFlows(chatFlowsData);
      setLogs(chatLogsData);

    } catch (error) {
      console.error("Error loading chatbot data:", error);
      toast.error('Failed to load some chatbot data. Please refresh.');
    }
    setIsLoading(false);
  };

  const handleToggleChat = async (enabled) => {
    setChatEnabled(enabled);
    const payload = {
        section: 'chatbot',
        content_key: 'enabled',
        content_type: 'boolean',
        title: 'Chatbot Enabled',
        content_value: enabled.toString(),
        is_active: true
    };
    try {
        if (enabledContentId) {
            await WebsiteContent.update(enabledContentId, payload);
        } else {
            const newContent = await WebsiteContent.create(payload);
            setEnabledContentId(newContent.id);
        }
        toast.success(`Chatbot has been ${enabled ? 'enabled' : 'disabled'}.`);
    } catch (error) {
        console.error("Failed to update chatbot status:", error);
        toast.error('Failed to update chatbot status.');
    }
  };

  const handleSaveFlow = async () => {
    if (!newFlow.flow_name || !newFlow.response_template) {
        toast.warning('Intent Name and Bot Response are required.');
        return;
    }

    try {
      const payload = {
        ...newFlow,
        intent_keywords: newFlow.intent_keywords.split(',').map(k => k.trim()).filter(Boolean)
      };
      await ChatFlow.create(payload);

      setNewFlow({
        flow_name: '',
        intent_keywords: '',
        response_template: '',
        platform_specific: 'all'
      });
      toast.success('New chat flow has been saved.');
      await loadChatbotData();
    } catch (error) {
      console.error("Error saving chat flow:", error);
      toast.error('Failed to save chat flow.');
    }
  };

  const handleDeleteFlow = async (flowId) => {
    if (!window.confirm('Are you sure you want to delete this chat flow?')) return;

    try {
      await ChatFlow.delete(flowId);
      toast.success('Chat flow has been deleted.');
      await loadChatbotData();
    } catch (error) {
      console.error("Error deleting chat flow:", error);
      toast.error('Failed to delete chat flow.');
    }
  };

  const handleSaveTrainingData = async () => {
    const payload = {
      section: 'chatbot',
      content_key: 'training_data',
      content_type: 'text',
      title: 'AI Training Data (Q&A)',
      content_value: trainingData,
      is_active: true
    };
    try {
      if (trainingDataId) {
        await WebsiteContent.update(trainingDataId, payload);
      } else {
        const newContent = await WebsiteContent.create(payload);
        setTrainingDataId(newContent.id);
      }
      toast.success('AI training data has been updated.');
    } catch (error) {
      console.error("Failed to save training data:", error);
      toast.error('Failed to save training data.');
    }
  };

  const handleExportLogs = async () => {
    try {
        const allLogs = await ChatLog.list('-created_date', 1000); // Fetch up to 1000 recent logs
        if (allLogs.length === 0) {
            toast.info("No chat logs to export.");
            return;
        }

        const headers = ["ID", "Timestamp", "Platform", "User Identifier", "User Message", "Bot Response", "Intent Detected", "Status"];
        const csvRows = [headers.join(',')];

        for (const log of allLogs) {
            const escapeCSV = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                // Escape double quotes with another double quote and wrap in double quotes
                return `"${stringValue.replace(/"/g, '""')}"`;
            };

            const values = [
                log.id,
                escapeCSV(new Date(log.created_date).toLocaleString()),
                escapeCSV(log.platform),
                escapeCSV(log.user_identifier),
                escapeCSV(log.user_message),
                escapeCSV(log.bot_response),
                escapeCSV(log.intent_detected),
                escapeCSV(log.resolution_status)
            ];
            csvRows.push(values.join(','));
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `madhatv_chat_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up the object URL
        toast.success("Chat logs exported successfully.");

    } catch (error) {
        console.error("Failed to export chat logs:", error);
        toast.error("Failed to export chat logs.");
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'whatsapp': return <Phone className="w-4 h-4 text-green-600" />;
      case 'website': return <Globe className="w-4 h-4 text-blue-600" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div
        className="relative bg-cover bg-center h-52"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=2906&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">AI Chatbot Manager</h1>
          <p className="text-red-100 max-w-2xl text-lg shadow-lg">Configure and manage automated chat responses for WhatsApp and website.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="mb-6">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="flows" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" /> Chat Flows
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" /> AI Training
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Chat Logs
                </TabsTrigger>
                 <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Dashboard
                </TabsTrigger>
              </TabsList>
            </CardHeader>
          </Card>

          {/* Chat Flows Tab */}
          <TabsContent value="flows">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Chat Flows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {flows.map((flow) => (
                        <div key={flow.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{flow.flow_name}</h4>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" disabled>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteFlow(flow.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{flow.response_template}</p>
                          <div className="flex gap-2 flex-wrap">
                            {flow.intent_keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                            <Badge variant="outline" className="capitalize">
                              {flow.platform_specific}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="flow_name">Intent Name</Label>
                      <Input
                        id="flow_name"
                        value={newFlow.flow_name}
                        onChange={(e) => setNewFlow({...newFlow, flow_name: e.target.value})}
                        placeholder="e.g., Book Mass"
                      />
                    </div>

                    <div>
                      <Label htmlFor="intent_keywords">Keywords (comma-separated)</Label>
                      <Input
                        id="intent_keywords"
                        value={newFlow.intent_keywords}
                        onChange={(e) => setNewFlow({...newFlow, intent_keywords: e.target.value})}
                        placeholder="mass, booking, service"
                      />
                    </div>

                    <div>
                      <Label htmlFor="response_template">Bot Response</Label>
                      <Textarea
                        id="response_template"
                        value={newFlow.response_template}
                        onChange={(e) => setNewFlow({...newFlow, response_template: e.target.value})}
                        placeholder="I can help you book a mass. What type of service would you like?"
                        className="h-24"
                      />
                    </div>

                    <div>
                      <Label htmlFor="platform_specific">Platform</Label>
                      <select
                        id="platform_specific"
                        className="w-full p-2 border rounded"
                        value={newFlow.platform_specific}
                        onChange={(e) => setNewFlow({...newFlow, platform_specific: e.target.value})}
                      >
                        <option value="all">All</option>
                        <option value="whatsapp">WhatsApp Only</option>
                        <option value="website">Website Only</option>
                      </select>
                    </div>

                    <Button onClick={handleSaveFlow} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Save Flow
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Training Tab */}
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>AI Training Data</CardTitle>
                <p className="text-sm text-slate-500">Provide Q&A examples to improve the AI's understanding for queries that don't match a specific flow.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="training_data" className="text-base font-medium">Training Examples (Q&A format)</Label>
                  <Textarea
                    id="training_data"
                    value={trainingData}
                    onChange={(e) => setTrainingData(e.target.value)}
                    placeholder={`Q: How do I book a mass?
A: You can book a mass by providing the service type, date, and beneficiary details.

Q: What are your donation options?
A: We accept one-time and monthly donations through our secure payment gateway.`}
                    className="h-64 font-mono text-sm"
                  />
                </div>
                <Button onClick={handleSaveTrainingData}>
                  <Brain className="w-4 h-4 mr-2" />
                  Update AI Training
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Chat Logs</CardTitle>
                <Button variant="outline" onClick={handleExportLogs}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(log.platform)}
                          <span className="font-medium">{log.user_identifier}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_date).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <strong>User:</strong> {log.user_message}
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-sm">
                          <strong>Bot:</strong> {log.bot_response}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline">Intent: {log.intent_detected || 'N/A'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <Card>
                <CardHeader><CardTitle>Chatbot Settings</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="chatbot-enabled-switch" className="flex flex-col space-y-1">
                            <span className="font-medium">Enable Chatbot on Website</span>
                            <span className="text-sm text-slate-500">
                                Show the AI chat widget on the public website.
                            </span>
                        </Label>
                        <Switch
                            id="chatbot-enabled-switch"
                            checked={chatEnabled}
                            onCheckedChange={handleToggleChat}
                        />
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}