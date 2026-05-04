import React, { useState, useEffect } from 'react';
import SideNav from '../../../../shared/layout/SideNav';
import { Copy, ChevronRight, Check, Code, SlidersHorizontal, Loader2, FileText, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useForms } from '../hooks/useForms';
import { useAuth } from '../../../auth/hooks/useAuth';
import { getForm } from '../services/form.api';
import { useChatbots } from '../../studio/hooks/useChatbots';
import ChatbotContextWarning from '../../../../shared/components/ui/ChatbotContextWarning';

const FIELD_TYPES = [
    { value: 'text', label: 'Short Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown (Select)' },
    { value: 'checkbox', label: 'Checkboxes' }
];

const CreateForm = () => {
    const { handleCreateForm, handleUpdateForm, isLoading } = useForms();
    const { chatbots, isLoading: isChatbotsLoading } = useChatbots();
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    
    const isEditMode = !!id;
    const [isFetching, setIsFetching] = useState(isEditMode);
    
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    
    const [customFields, setCustomFields] = useState([]);
    const [createdForm, setCreatedForm] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchForm = async () => {
                try {
                    const data = await getForm(id);
                    if (data.success) {
                        const form = data.data;
                        setFormName(form.name);
                        setFormDesc(form.description || '');
                        
                        // Extract custom fields (skip mandatory name/email/message)
                        const filteredFields = form.fields.filter(f => f.name !== 'name' && f.name !== 'email' && f.name !== 'message');
                        setCustomFields(filteredFields.map(f => ({
                            ...f,
                            optionsStr: f.options ? f.options.join(', ') : ''
                        })));
                    } else {
                        toast.error(data.message || 'Failed to fetch form');
                        navigate('/dashboard/forms');
                    }
                } catch (error) {
                    toast.error('Error fetching form data');
                    navigate('/dashboard/forms');
                } finally {
                    setIsFetching(false);
                }
            };
            fetchForm();
        }
    }, [id, navigate]);

    const addField = () => {
        setCustomFields([...customFields, { label: '', name: '', type: 'text', required: false, optionsStr: '' }]);
    };

    const updateField = (index, key, value) => {
        const updated = [...customFields];
        updated[index][key] = value;
        setCustomFields(updated);
    };

    const removeField = (index) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const onSubmit = async () => {
        if (!formName.trim()) {
            toast.error('Form name is required');
            return;
        }

        for (const f of customFields) {
            if (!f.label.trim()) {
                toast.error('All custom fields must have a label');
                return;
            }
            if (['select', 'checkbox'].includes(f.type) && !f.optionsStr.trim()) {
                toast.error(`Options are required for ${f.label} (${f.type})`);
                return;
            }
        }

        const submitFields = [
            { label: 'Full Name', name: 'name', type: 'text', required: true },
            { label: 'Email Address', name: 'email', type: 'email', required: true },
            { label: 'Your Message', name: 'message', type: 'textarea', required: true }
        ];

        const processedCustomFields = customFields.map(f => {
            const fieldName = f.name?.trim() || f.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const options = ['select', 'checkbox'].includes(f.type) 
                ? f.optionsStr.split(',').map(o => o.trim()).filter(Boolean) 
                : [];
                
            return {
                label: f.label,
                name: fieldName,
                type: f.type,
                required: f.required,
                options
            };
        });

        submitFields.push(...processedCustomFields);

        const formData = {
            name: formName,
            description: formDesc,
            fields: submitFields,
            userId: user?._id
        };

        if (isEditMode) {
            const result = await handleUpdateForm(id, formData);
            if (result) {
                setCreatedForm(result);
            }
        } else {
            const result = await handleCreateForm(formData);
            if (result) {
                setCreatedForm(result);
            }
        }
    };

    const generateHtml = () => {
        const submitFields = [
            { label: 'Full Name', name: 'name', type: 'text', required: true },
            { label: 'Email Address', name: 'email', type: 'email', required: true },
            { label: 'Your Message', name: 'message', type: 'textarea', required: true }
        ];

        const processedCustomFields = customFields.map(f => {
            const fieldName = f.name?.trim() || f.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const options = ['select', 'checkbox'].includes(f.type) 
                ? f.optionsStr.split(',').map(o => o.trim()).filter(Boolean) 
                : [];
                
            return {
                label: f.label || 'Unnamed Field',
                name: fieldName || 'unnamed_field',
                type: f.type,
                required: f.required,
                options
            };
        });

        const allFields = [...submitFields, ...processedCustomFields];
        const formId = createdForm?._id || id || 'YOUR_FORM_ID_HERE';
        
        const getFieldHTML = (field) => {
            let inputHtml = '';
            const nameAttr = field.name;
            const reqAttr = field.required ? ' required' : '';

            switch (field.type) {
                case 'textarea':
                    inputHtml = `<textarea name="${nameAttr}"${reqAttr}></textarea>`;
                    break;
                case 'select':
                    inputHtml = `<select name="${nameAttr}"${reqAttr}>\n` + 
                        (field.options || []).map(opt => `                <option value="${opt}">${opt}</option>`).join('\n') +
                        `\n            </select>`;
                    break;
                case 'checkbox':
                    if (field.options && field.options.length > 0) {
                        inputHtml = `<div class="checkbox-group">\n` + 
                            field.options.map(opt => `                <label><input type="checkbox" name="${nameAttr}[]" value="${opt}"> ${opt}</label>`).join('\n') +
                            `\n            </div>`;
                    } else {
                        inputHtml = `<input type="checkbox" name="${nameAttr}"${reqAttr}>`;
                    }
                    break;
                default:
                    inputHtml = `<input type="${field.type}" name="${nameAttr}"${reqAttr}>`;
            }
            
            return `\n        <div>\n            <label>${field.label}</label>\n            ${inputHtml}\n        </div>\n`;
        };

        let htmlFields = '';
        allFields.forEach(field => {
            htmlFields += getFieldHTML(field);
        });

        return `<form action="${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api/form/submit/${formId}" method="POST">${htmlFields}
        <button type="submit">Submit Data to Server</button>
</form>`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateHtml());
        toast.success('HTML copied to clipboard');
    };

    if (isFetching) {
        return (
            <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
                <SideNav />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary opacity-50" size={32} />
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            <SideNav />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="sticky top-0 z-10 h-16 border-b border-border bg-background flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <NavLink to="/dashboard/forms" className="text-sm text-foreground/40 hover:text-foreground transition-colors font-medium whitespace-nowrap">Forms</NavLink>
                        <ChevronRight size={16} className="text-foreground/20 shrink-0" />
                        <span className="text-sm text-foreground font-medium truncate">{isEditMode ? (formName || 'Edit Form') : 'Create Form'}</span>
                    </div>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left Configuration Panel */}
                    <div className="w-full lg:w-[45%] lg:min-w-[400px] border-b lg:border-b-0 lg:border-r border-border bg-surface/20 flex flex-col overflow-y-auto relative">
                        <div className="p-8 space-y-8 pb-24">
                            {!isChatbotsLoading && chatbots.length === 0 && (
                                <ChatbotContextWarning />
                            )}
                            <div className="space-y-1">
                                <h2 className="text-xl font-semibold tracking-tight">{isEditMode ? 'Edit Form' : 'Form Builder'}</h2>
                                <p className="text-sm text-foreground/50 leading-relaxed">Design your form with dynamic fields. The Name, Email, and Message fields are always included.</p>
                            </div>

                            <div className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-foreground/80">Form Name <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="e.g. Lead Capture Form"
                                            disabled={!!createdForm}
                                            className="w-full px-4 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-foreground/80">Description</label>
                                        <input 
                                            type="text" 
                                            value={formDesc}
                                            onChange={(e) => setFormDesc(e.target.value)}
                                            placeholder="Internal description"
                                            disabled={!!createdForm}
                                            className="w-full px-4 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Form Fields Builder */}
                                <div className="space-y-4 pt-6 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                            <SlidersHorizontal size={16} />
                                            Form Fields
                                        </label>
                                        {!createdForm && (
                                            <button 
                                                onClick={addField}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface/70 border border-border rounded text-xs font-medium transition-colors cursor-pointer"
                                            >
                                                <Plus size={14} /> Add Field
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {/* Mandatory Fields */}
                                        <div className="flex items-center gap-3 p-3 border border-border/50 bg-background/50 rounded opacity-70">
                                            <div className="w-5 h-5 rounded border border-primary bg-primary text-white flex items-center justify-center shrink-0">
                                                <Check size={12} />
                                            </div>
                                            <div className="flex-1 flex justify-between items-center">
                                                <div>
                                                    <span className="text-sm font-medium">Full Name</span>
                                                    <p className="text-[10px] text-foreground/50">text • required</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 border border-border/50 bg-background/50 rounded opacity-70">
                                            <div className="w-5 h-5 rounded border border-primary bg-primary text-white flex items-center justify-center shrink-0">
                                                <Check size={12} />
                                            </div>
                                            <div className="flex-1 flex justify-between items-center">
                                                <div>
                                                    <span className="text-sm font-medium">Email Address</span>
                                                    <p className="text-[10px] text-foreground/50">email • required</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 border border-border/50 bg-background/50 rounded opacity-70">
                                            <div className="w-5 h-5 rounded border border-primary bg-primary text-white flex items-center justify-center shrink-0">
                                                <Check size={12} />
                                            </div>
                                            <div className="flex-1 flex justify-between items-center">
                                                <div>
                                                    <span className="text-sm font-medium">Your Message</span>
                                                    <p className="text-[10px] text-foreground/50">textarea • required</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Custom Fields */}
                                        {customFields.map((field, index) => (
                                            <div key={index} className="p-4 border border-border bg-background rounded space-y-4 animate-in fade-in zoom-in duration-200">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex gap-3">
                                                            <div className="flex-1 space-y-1.5">
                                                                <label className="text-[11px] font-medium text-foreground/60 uppercase tracking-wider">Field Label</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={field.label}
                                                                    onChange={(e) => updateField(index, 'label', e.target.value)}
                                                                    placeholder="e.g. Phone Number"
                                                                    disabled={!!createdForm}
                                                                    className="w-full px-3 py-1.5 bg-surface/50 border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                                                />
                                                            </div>
                                                            <div className="w-1/3 space-y-1.5">
                                                                <label className="text-[11px] font-medium text-foreground/60 uppercase tracking-wider">Type</label>
                                                                <select
                                                                    value={field.type}
                                                                    onChange={(e) => updateField(index, 'type', e.target.value)}
                                                                    disabled={!!createdForm}
                                                                    className="w-full px-3 py-1.5 bg-surface/50 border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50 appearance-none"
                                                                >
                                                                    {FIELD_TYPES.map(ft => (
                                                                        <option key={ft.value} value={ft.value}>{ft.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        
                                                        {['select', 'checkbox'].includes(field.type) && (
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-medium text-foreground/60 uppercase tracking-wider">Options (comma separated)</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={field.optionsStr}
                                                                    onChange={(e) => updateField(index, 'optionsStr', e.target.value)}
                                                                    placeholder="Option 1, Option 2, Option 3"
                                                                    disabled={!!createdForm}
                                                                    className="w-full px-3 py-1.5 bg-surface/50 border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-4 pt-1">
                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${field.required ? 'bg-primary border-primary text-white' : 'border-border bg-background group-hover:border-primary/50'} ${createdForm ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                    {field.required && <Check size={10} />}
                                                                </div>
                                                                <input type="checkbox" className="hidden" disabled={!!createdForm} checked={field.required} onChange={(e) => updateField(index, 'required', e.target.checked)} />
                                                                <span className="text-xs text-foreground/80">Required Field</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    
                                                    {!createdForm && (
                                                        <button 
                                                            onClick={() => removeField(index)}
                                                            className="p-1.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md border-t border-border">
                            <button
                                onClick={onSubmit}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-primary/20 cursor-pointer"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                {isEditMode ? 'Update Form' : 'Save Form Configuration'}
                            </button>
                        </div>
                    </div>

                    {/* Right Code Panel */}
                    <div className="flex-1 bg-background p-8 flex flex-col relative overflow-hidden min-h-[400px]">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div className="flex items-center gap-2 text-foreground/70">
                                <Code size={18} />
                                <h3 className="text-sm font-semibold">Live HTML Preview</h3>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                            >
                                <Copy size={16} />
                                <span>Copy HTML</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 border border-border rounded bg-[#0a0a0a] overflow-hidden relative group shadow-inner flex items-center justify-center">
                            <pre className="absolute inset-0 p-6 overflow-auto text-[13px] leading-relaxed font-mono text-[#ebebeb] selection:bg-primary/30 whitespace-pre-wrap wrap-break-word">
                                {generateHtml()}
                            </pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateForm;
