import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import SideNav from '../../../../shared/layout/SideNav';
import { Plus, FileText, Search } from 'lucide-react';
import { SkeletonWrapper, Skeleton } from '../../../../shared/components/ui/SkeletonWrapper';
import { DeleteConfirmModal } from '../../../../shared/components/ui/DeleteConfirmModal';
import { useForms } from '../hooks/useForms';
import FormCard from '../components/FormCard';
import FormCodeModal from '../components/FormCodeModal';
import { useChatbots } from '../../studio/hooks/useChatbots';
import ChatbotContextWarning from '../../../../shared/components/ui/ChatbotContextWarning';

const FormsList = () => {
    const { forms, isLoading, error, fetchForms, handleToggleStatus, handleDelete } = useForms();
    const { chatbots, isLoading: isChatbotsLoading } = useChatbots();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormForCode, setSelectedFormForCode] = useState(null);
    const [formToDelete, setFormToDelete] = useState(null);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const filteredForms = React.useMemo(() => {
        if (!forms) return [];
        return forms.filter(f => 
            f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [forms, searchTerm]);

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            <SideNav />

            <main className="flex-1 overflow-y-auto relative">
                <header className="sticky top-0 z-10 min-h-[clamp(3.5rem,8vh,4rem)] border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-[clamp(1rem,4vw,2rem)] py-2 gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-[clamp(1rem,3vw,1.125rem)] font-bold truncate">Forms List</h1>
                        <p className="text-[clamp(0.65rem,1.5vw,0.75rem)] text-foreground/40 truncate">Manage your dynamic forms and view submissions from embedded widgets</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <NavLink
                            to="/dashboard/forms/create"
                            className="flex items-center gap-2 px-[clamp(0.5rem,2vw,1rem)] py-2 bg-primary text-white rounded text-[clamp(0.75rem,2vw,0.875rem)] font-medium hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Create Form</span>
                        </NavLink>
                    </div>
                </header>

                <div className="p-[clamp(1rem,4vw,2rem)] max-w-7xl mx-auto space-y-[clamp(1rem,4vw,2rem)]">
                    {!isChatbotsLoading && chatbots.length === 0 && (
                        <ChatbotContextWarning />
                    )}
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                            <input
                                type="text"
                                placeholder="Search forms..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-surface/50 border border-border rounded text-sm focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <SkeletonWrapper>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="border border-border rounded p-5 bg-background space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Skeleton width={40} height={40} />
                                            <div>
                                                <Skeleton width={120} height={14} />
                                                <Skeleton width={60} height={10} className="mt-1" />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-border/30">
                                            <Skeleton width={80} height={14} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SkeletonWrapper>
                    ) : error ? (
                        <div className="p-8 text-center border border-dashed border-border rounded bg-surface/10">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    ) : filteredForms.length === 0 ? (
                        <div className="p-16 text-center border border-dashed border-border rounded bg-surface/5 space-y-4">
                            <div className="w-12 h-12 bg-surface rounded flex items-center justify-center mx-auto">
                                <FileText size={24} className="text-foreground/40" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-base font-medium">
                                    {searchTerm ? 'No forms match your search' : 'No forms found'}
                                </p>
                                <p className="text-sm text-foreground/50 max-w-xs mx-auto">
                                    {searchTerm 
                                        ? `We couldn't find any forms matching "${searchTerm}".`
                                        : "You haven't created any forms yet. Start by creating your first one to capture leads."}
                                </p>
                            </div>
                            {!searchTerm && (
                                <NavLink
                                    to="/dashboard/forms/create"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded text-sm font-medium hover:bg-surface/70 transition-colors"
                                >
                                    <Plus size={16} />
                                    <span>Create your first form</span>
                                </NavLink>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(280px,30vw,400px),1fr))] gap-[clamp(1rem,3vw,1.5rem)]">
                            {filteredForms.map(form => (
                                <FormCard
                                    key={form._id}
                                    form={form}
                                    onToggle={() => handleToggleStatus(form._id)}
                                    onDelete={() => setFormToDelete(form)}
                                    onShowCode={() => setSelectedFormForCode(form)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <FormCodeModal 
                    isOpen={!!selectedFormForCode}
                    onClose={() => setSelectedFormForCode(null)}
                    form={selectedFormForCode}
                />

                <DeleteConfirmModal 
                    isOpen={!!formToDelete}
                    onClose={() => setFormToDelete(null)}
                    onConfirm={async () => {
                        await handleDelete(formToDelete._id);
                        setFormToDelete(null);
                    }}
                    title="Delete Form"
                    itemName={formToDelete?.name}
                    message="This action will permanently remove the form configuration and all associated lead submissions. This cannot be undone."
                />
            </main>
        </div>
    );
};

export default FormsList;
