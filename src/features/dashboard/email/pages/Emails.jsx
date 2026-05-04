import React, { useState } from 'react';
import SideNav from '../../../../shared/layout/SideNav';
import { useEmails } from '../hooks/useEmails';
import { 
    CheckCircle2, Tag, AlertTriangle, RefreshCw, Clock
} from 'lucide-react';
import EmailStats from '../components/EmailStats';
import EmailFilters from '../components/EmailFilters';
import EmailTable from '../components/EmailTable';
import EmailDetailsModal from '../components/EmailDetailsModal';
import { useChatbots } from '../../studio/hooks/useChatbots';
import ChatbotContextWarning from '../../../../shared/components/ui/ChatbotContextWarning';

const Emails = () => {
    const { emails, stats, loading, refresh } = useEmails();
    const { chatbots, isLoading: isChatbotsLoading } = useChatbots();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedEmail, setSelectedEmail] = useState(null);

    const filteredEmails = emails.filter(email => {
        const matchesSearch = 
            email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            email.from?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || email.status === filter;
        return matchesSearch && matchesFilter;
    });

    const statusConfig = {
        replied: { label: 'Resolved', icon: CheckCircle2, class: 'bg-green-500/10 text-green-500 border-green-500/20' },
        ticket: { label: 'Ticket', icon: Tag, class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        skipped: { label: 'Skipped', icon: Clock, class: 'bg-foreground/10 text-foreground/40 border-foreground/10' },
        error: { label: 'Error', icon: AlertTriangle, class: 'bg-red-500/10 text-red-500 border-red-500/20' }
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            <SideNav />

            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
                {/* Hardened Header */}
                <header className="sticky top-0 z-10 min-h-[clamp(3.5rem,8vh,4rem)] border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-[clamp(1rem,4vw,2rem)] py-2 gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-[clamp(1rem,3vw,1.125rem)] font-bold truncate">Email Processing</h1>
                        <p className="text-[clamp(0.65rem,1.5vw,0.75rem)] text-foreground/40 truncate">Manage and monitor AI-driven email automation</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button 
                            onClick={refresh}
                            className="p-2 hover:bg-surface border border-transparent hover:border-border rounded transition-all text-foreground/40 hover:text-primary"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                <div className="p-[clamp(1rem,4vw,2rem)] space-y-[clamp(1.5rem,5vw,2.5rem)] max-w-7xl mx-auto w-full animate-in fade-in duration-700">
                    {!isChatbotsLoading && chatbots.length === 0 && (
                        <ChatbotContextWarning />
                    )}
                    <EmailStats stats={stats} loading={loading} />

                    <div className="space-y-6">
                        <EmailFilters 
                            searchQuery={searchQuery} 
                            setSearchQuery={setSearchQuery} 
                            filter={filter} 
                            setFilter={setFilter} 
                        />

                        <EmailTable 
                            loading={loading}
                            emails={emails}
                            filteredEmails={filteredEmails}
                            onSelectEmail={setSelectedEmail}
                            statusConfig={statusConfig}
                        />
                    </div>
                </div>
            </main>

            <EmailDetailsModal 
                isOpen={!!selectedEmail}
                onClose={() => setSelectedEmail(null)}
                email={selectedEmail}
                statusConfig={statusConfig}
            />
        </div>
    );
};

export default Emails;
