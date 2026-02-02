import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { WebsiteContent } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm the Madha TV assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatFlows, setChatFlows] = useState([]);

  useEffect(() => {
    loadChatFlows();
  }, []);

  const loadChatFlows = async () => {
    try {
      const flows = await WebsiteContent.filter({ 
        section: 'chatbot', 
        content_type: 'flow',
        is_active: true 
      });
      setChatFlows(flows);
    } catch (error) {
      console.error("Error loading chat flows:", error);
    }
  };

  const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    
    for (const flow of chatFlows) {
      const flowData = JSON.parse(flow.content_value);
      if (flowData.platform === 'whatsapp') continue; // Skip WhatsApp-only flows
      
      const keywords = flowData.keywords || [];
      if (keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
        return flowData;
      }
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Check for intent match first
    const intent = detectIntent(inputMessage);
    let botResponse = '';

    if (intent) {
      botResponse = intent.response;
    } else {
      // Fallback to AI if no predefined flow matches
      try {
        const aiResponse = await InvokeLLM({
          prompt: `You are a helpful assistant for Madha TV, a Catholic television channel. 
          A user asked: "${inputMessage}"
          
          Please provide a helpful, brief response about:
          - Live TV streaming
          - Mass bookings and spiritual services
          - Donations
          - Program schedule
          - General information about Madha TV
          
          Keep the response under 100 words and friendly.`,
        });
        botResponse = aiResponse;
      } catch (error) {
        botResponse = "I'm sorry, I'm having trouble understanding. Could you please rephrase your question or try contacting our support team?";
      }
    }

    // Simulate typing delay
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "Book a Mass", action: () => setInputMessage("I want to book a mass") },
    { text: "Make a Donation", action: () => setInputMessage("How can I donate?") },
    { text: "Live Schedule", action: () => setInputMessage("What's on live today?") },
    { text: "Contact Support", action: () => setInputMessage("I need help with my booking") }
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] hover:from-[#D32F2F] hover:to-[#B71C1C] shadow-2xl"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border ${
              isMinimized ? 'w-80 h-16' : 'w-80 h-96'
            }`}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Madha TV Assistant</h3>
                  <p className="text-xs opacity-90">Online now</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[80%] ${
                        message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          message.sender === 'user' 
                            ? 'bg-[#B71C1C] text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {message.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        </div>
                        <div className={`rounded-lg p-3 text-sm ${
                          message.sender === 'user'
                            ? 'bg-[#B71C1C] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-gray-600" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2">
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={action.action}
                          className="text-xs h-8"
                        >
                          {action.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      size="sm"
                      className="bg-[#B71C1C] hover:bg-[#D32F2F]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}