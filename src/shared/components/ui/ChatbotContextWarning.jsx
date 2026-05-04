import React from 'react';
import { Bot, ArrowRight, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const ChatbotContextWarning = () => {
    return (
        <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/10 rounded shrink-0">
                        <Bot size={20} className="text-amber-500" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-amber-500/90 flex items-center gap-2">
                            AI Context Missing
                        </h4>
                        <p className="text-xs text-foreground/60 leading-relaxed max-w-2xl">
                            You haven't created a chatbot yet. Your AI processing for forms and emails will use a generic fallback. 
                            Create a chatbot to give your AI specific context, personality, and knowledge.
                        </p>
                    </div>
                </div>
                <NavLink
                    to="/dashboard/studio"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded text-xs font-bold hover:bg-amber-600 transition-all shadow-sm shadow-amber-500/20 whitespace-nowrap active:scale-95"
                >
                    <span>Create Chatbot</span>
                    <ArrowRight size={14} />
                </NavLink>
            </div>
        </div>
    );
};

export default ChatbotContextWarning;
