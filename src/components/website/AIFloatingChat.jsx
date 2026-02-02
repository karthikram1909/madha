
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// Chatbot AI Image
const CHATBOT_AI_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/fab7fac1c_78929bf59_VectorSmartObject3.png';

export default function AIFloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('madha_tv_language') || 'english');
        };
        window.addEventListener('storage', handleLanguageChange);
        window.addEventListener('languageChanged', handleLanguageChange);
        return () => {
            window.removeEventListener('storage', handleLanguageChange);
            window.removeEventListener('languageChanged', handleLanguageChange);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage = language === 'tamil'
                ? "வணக்கம்! மாதா டிவிக்கு வரவேற்கிறோம். நான் உங்கள் உதவியாளர். நான் உங்களுக்கு எப்படி உதவ முடியும்?"
                : "Hello! Welcome to Madha TV. I'm your virtual assistant. How can I help you today?";
            
            setMessages([{
                id: Date.now(),
                text: welcomeMessage,
                sender: 'bot',
                timestamp: new Date()
            }]);
        }
    }, [isOpen, language, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const detectIntent = (message) => {
        const lowerMessage = message.toLowerCase();
        
        // Booking related
        if (lowerMessage.match(/book|booking|reserve|mass|service|prayer|bless/i)) {
            return 'booking';
        }
        
        // Schedule related
        if (lowerMessage.match(/schedule|program|timing|time|when|show/i)) {
            return 'schedule';
        }
        
        // Donation related
        if (lowerMessage.match(/donat|give|contribute|support|fund/i)) {
            return 'donation';
        }
        
        // Contact/Support related
        if (lowerMessage.match(/contact|phone|email|address|reach|location/i)) {
            return 'contact';
        }
        
        // Live TV related
        if (lowerMessage.match(/live|watch|stream|tv|broadcast/i)) {
            return 'live_tv';
        }
        
        // Books related
        if (lowerMessage.match(/book|buy|purchase|shop/i)) {
            return 'books';
        }
        
        // Prayer request related
        if (lowerMessage.match(/prayer request|pray for|intention/i)) {
            return 'prayer_request';
        }
        
        return 'general';
    };

    const fetchRelevantData = async (intent) => {
        try {
            switch (intent) {
                case 'schedule':
                    const programs = await base44.entities.Program.list('schedule_date', 10);
                    const today = new Date().toISOString().split('T')[0];
                    const todayPrograms = programs.filter(p => 
                        p.schedule_date?.startsWith(today) && 
                        p.is_published !== false && 
                        p.status !== 'cancelled'
                    );
                    return {
                        todayPrograms: todayPrograms.slice(0, 5).map(p => ({
                            title: p.title,
                            title_tamil: p.title_tamil,
                            time: p.schedule_time,
                            date: p.schedule_date
                        }))
                    };
                    
                case 'booking':
                    const services = await base44.entities.HomepageService.filter({ is_active: true }, 'display_order', 6);
                    return {
                        services: services.map(s => ({
                            title: s.title,
                            title_tamil: s.title_tamil,
                            amount: s.amount,
                            price_inr: s.price_inr
                        }))
                    };
                    
                case 'books':
                    const books = await base44.entities.Book.filter({ is_active: true }, 'title', 5);
                    return {
                        books: books.map(b => ({
                            title: b.title,
                            title_tamil: b.title_tamil,
                            price_inr: b.price_inr,
                            price_usd: b.price_usd
                        }))
                    };
                    
                default:
                    return {};
            }
        } catch (error) {
            console.error('Error fetching relevant data:', error);
            return {};
        }
    };

    const generateContextualPrompt = (userMessage, intent, relevantData, language) => {
        let contextInfo = '';
        
        if (intent === 'schedule' && relevantData.todayPrograms?.length > 0) {
            contextInfo = `\n\nToday's Programs:\n${relevantData.todayPrograms.map(p => 
                `- ${language === 'tamil' && p.title_tamil ? p.title_tamil : p.title} at ${p.time}`
            ).join('\n')}`;
        }
        
        if (intent === 'booking' && relevantData.services?.length > 0) {
            contextInfo = `\n\nAvailable Services:\n${relevantData.services.map(s => 
                `- ${language === 'tamil' && s.title_tamil ? s.title_tamil : s.title} ${s.amount || (s.price_inr ? `(₹${s.price_inr})` : '')}`
            ).join('\n')}`;
        }
        
        if (intent === 'books' && relevantData.books?.length > 0) {
            contextInfo = `\n\nAvailable Books:\n${relevantData.books.map(b => 
                `- ${language === 'tamil' && b.title_tamil ? b.title_tamil : b.title} (₹${b.price_inr})`
            ).join('\n')}`;
        }

        const baseInstructions = language === 'tamil' ? `
நீங்கள் மாதா டிவியின் உதவியாளர். பயனருக்கு தமிழில் தெளிவாகவும் குறுகியதாகவும் பதிலளிக்கவும்.

மாதா டிவி பற்றிய தகவல்கள்:
- இது ஒரு கத்தோலிக்க தொலைக்காட்சி சேனல்
- திருப்பலி, ஜெபம், பக்தி நிகழ்ச்சிகள் ஒளிபரப்பு
- முகவரி: சாந்தோம் தொடர்பு மையம், ஜே-9, லூஸ் சர்ச் சாலை, மயிலாப்பூர் சென்னை - 600 004
- தொலைபேசி: 044 24991244, 044 24993314
- மின்னஞ்சல்: info@madhatv.in

சேவைகள்:
1. திருப்பலி முன்பதிவு
2. பிறந்தநாள் ஆசீர்வாதம்
3. திருமண வாழ்த்து
4. ஜெப வேண்டுதல்
5. புத்தகங்கள் வாங்க
6. நன்கொடை

விதிகள்:
- குறுகிய, தெளிவான பதில்கள்
- உதவிகரமான தொனி
- தகவல் தெரியாவிட்டால், "நான் இதை சரிபார்க்கிறேன்" என்று கூறவும்
` : `
You are Madha TV's virtual assistant. Respond clearly and concisely in English.

About Madha TV:
- Catholic television channel
- Broadcasting masses, prayers, and devotional programs
- Address: Santhome Communication Centre, J-9, Luz Church Road, Mylapore Chennai - 600 004
- Phone: 044 24991244, 044 24993314
- Email: info@madhatv.in

Services:
1. Mass Booking
2. Birthday Blessings
3. Marriage Wishes
4. Prayer Requests
5. Buy Books
6. Donations

Rules:
- Short, clear responses (2-4 sentences max)
- Helpful, friendly tone
- If unsure, say "Let me check that for you"
- Include relevant links when appropriate
`;

        return `${baseInstructions}${contextInfo}

User Question: ${userMessage}

Respond naturally and helpfully in ${language === 'tamil' ? 'Tamil' : 'English'}:`;
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

        try {
            // Detect intent
            const intent = detectIntent(inputMessage);
            
            // Fetch relevant data
            const relevantData = await fetchRelevantData(intent);
            
            // Generate contextual prompt
            const prompt = generateContextualPrompt(inputMessage, intent, relevantData, language);
            
            // Get AI response
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                add_context_from_internet: false
            });

            // Simulate typing delay for more natural feel
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            const botMessage = {
                id: Date.now() + 1,
                text: response || (language === 'tamil' ? 'மன்னிக்கவும், நான் இப்போது பதிலளிக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.' : 'Sorry, I couldn\'t process that. Please try again.'),
                sender: 'bot',
                timestamp: new Date(),
                intent: intent
            };

            setMessages(prev => [...prev, botMessage]);

            // Log chat for analytics
            try {
                await base44.entities.ChatLog.create({
                    user_identifier: sessionId,
                    platform: 'website',
                    session_id: sessionId,
                    user_message: inputMessage,
                    bot_response: botMessage.text,
                    intent_detected: intent,
                    confidence_score: 0.85,
                    resolution_status: 'resolved'
                });
            } catch (logError) {
                console.error('Failed to log chat:', logError);
            }

        } catch (error) {
            console.error('Error getting bot response:', error);
            
            const fallbackMessage = language === 'tamil' 
                ? 'மன்னிக்கவும், தற்போது சில தொழில்நுட்ப சிக்கல்கள் உள்ளன. தயவுசெய்து +91 44 24991244 என்ற எண்ணில் தொடர்பு கொள்ளவும்.'
                : 'Sorry, I\'m experiencing some technical difficulties. Please contact us at +91 44 24991244 for immediate assistance.';
            
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: fallbackMessage,
                sender: 'bot',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickActions = language === 'tamil' ? [
        { text: 'திருப்பலி முன்பதிவு', action: 'திருப்பலி முன்பதிவு செய்ய எப்படி?' },
        { text: 'இன்றைய நிகழ்ச்சிகள்', action: 'இன்றைய நிகழ்ச்சிகள் என்ன?' },
        { text: 'நன்கொடை', action: 'எப்படி நன்கொடை செய்வது?' },
        { text: 'தொடர்பு', action: 'உங்கள் தொடர்பு விவரங்கள் என்ன?' }
    ] : [
        { text: 'Book Mass', action: 'How can I book a mass?' },
        { text: 'Today\'s Schedule', action: 'What programs are airing today?' },
        { text: 'Donate', action: 'How can I make a donation?' },
        { text: 'Contact', action: 'What are your contact details?' }
    ];

    const handleQuickAction = (action) => {
        setInputMessage(action);
    };

    return (
        <>
            {/* Chat Button */}
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
                            className="w-16 h-16 rounded-full bg-transparent hover:bg-transparent shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group p-0 border-0"
                            size="icon"
                        >
                            <img 
                                src={CHATBOT_AI_IMAGE}
                                alt="Chat with AI"
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                            />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 p-1">
                                    <img 
                                        src={CHATBOT_AI_IMAGE}
                                        alt="AI Assistant"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">
                                        {language === 'tamil' ? 'ஏஐ உதவியாளர்' : 'AI Assistant'}
                                    </h3>
                                    <p className="text-xs text-white/80 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        {language === 'tamil' ? 'ஆன்லைனில்' : 'Online'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.sender === 'bot' && (
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 p-1">
                                            <img 
                                                src={CHATBOT_AI_IMAGE}
                                                alt="AI"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                            message.sender === 'user'
                                                ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm'
                                                : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'
                                        }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                        <p className={`text-[10px] mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                                            {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {message.sender === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                                            <UserIcon className="w-5 h-5 text-slate-600" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            
                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-2 justify-start"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 p-1">
                                        <img 
                                            src={CHATBOT_AI_IMAGE}
                                            alt="AI"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length <= 1 && !isTyping && (
                            <div className="px-4 py-2 bg-white border-t border-slate-200">
                                <p className="text-xs text-slate-500 mb-2">
                                    {language === 'tamil' ? 'விரைவு செயல்கள்:' : 'Quick Actions:'}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickActions.map((action, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickAction(action.action)}
                                            className="text-xs h-auto py-2 whitespace-normal text-left justify-start hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
                                        >
                                            {action.text}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <div className="flex gap-2">
                                <Input
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={language === 'tamil' ? 'செய்தியை தட்டச்சு செய்க...' : 'Type your message...'}
                                    className="flex-1 rounded-full border-slate-300 focus:border-purple-600 focus:ring-purple-600"
                                    disabled={isTyping}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isTyping}
                                    className="rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-10 h-10 p-0"
                                    size="icon"
                                >
                                    {isTyping ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 text-center">
                                {language === 'tamil' 
                                    ? 'ஏ.ஐ மூலம் இயக்கப்படுகிறது • பதில்கள் மாறுபடலாம்' 
                                    : 'Powered by AI • Responses may vary'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
