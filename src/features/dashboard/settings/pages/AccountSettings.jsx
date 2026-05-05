import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { updateUserProfile } from '../services/settings.api';
import toast from 'react-hot-toast';

// Extracted Components
                    import AccountHeader from '../components/AccountHeader';
                    import ProfileSection from '../components/ProfileSection';
                    import EmailIntegrationSection from '../components/EmailIntegrationSection';

const AccountSettings = () => {
    const { user, fetchMe } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        speciality: '',
        isSolviingTickets: true,
        emailSettings: {
            SmtpHost: '',
            SmtpPort: '',
            User: '',
            Pass: '',
            IMapHost: '',
            ImapPort: '',
            SupportEmail: ''
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                speciality: user.speciality || '',
                isSolviingTickets: user.isSolviingTickets ?? true,
                emailSettings: {
                    SmtpHost: user.emailSettings?.SmtpHost || '',
                    SmtpPort: user.emailSettings?.SmtpPort || '',
                    User: user.emailSettings?.User || '',
                    Pass: user.emailSettings?.Pass || '',
                    IMapHost: user.emailSettings?.IMapHost || '',
                    ImapPort: user.emailSettings?.ImapPort || '',
                    SupportEmail: user.emailSettings?.SupportEmail || ''
                }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(user._id, formData);
            await fetchMe();
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 pb-20 max-w-4xl">
            <AccountHeader onSave={handleSubmit} loading={loading} />

            <ProfileSection 
                formData={formData} 
                handleChange={handleChange} 
                setFormData={setFormData} 
            />

            {/* <EmailIntegrationSection 
                formData={formData} 
                handleChange={handleChange} 
            /> */}
        </div>
    );
};

export default AccountSettings;
