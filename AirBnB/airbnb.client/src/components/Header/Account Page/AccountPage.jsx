import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./AccountPage.css";
import Header from '../Header';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '0',
        avatar: ''
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({
        profile: '',
        password: '',
        passwordRequirements: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            specialChar: false
        }
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        axios.get('https://localhost:7149/api/Account/profile', {
            withCredentials: true
        })
            .then(res => {
                const data = res.data;
                setProfile({
                    fullName: data.username,
                    email: data.email,
                    phone: data.phoneNumber || '0',
                    avatar: data.profilePicture
                        ? `https://res.cloudinary.com/djosldcjf/image/upload/${data.profilePicture}`
                        : '/public/logo/user.png'
                });
            })
            .catch(err => setErrors({...errors, profile: 'Failed to fetch profile data'}));
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors({...errors, profile: 'Image size should be less than 5MB'});
                return;
            }
            setSelectedAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
            setErrors({...errors, profile: ''});
        }
    };

    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 6,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            specialChar: /[!@#$%^&_*(),.?":{}|<>]/.test(password)
        };
        setErrors({...errors, passwordRequirements: requirements});
        return Object.values(requirements).every(Boolean);
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };
    

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setErrors({...errors, profile: ''});
        setSuccessMessage('');
        if (!validateEmail(profile.email)) {
            setErrors({...errors, profile: 'Please enter a valid email address'});
            return;
        }
        let profilePicturePublicId = null;

        if (selectedAvatarFile) {
            const formData = new FormData();
            formData.append("file", selectedAvatarFile);
            formData.append("upload_preset", "airbnb_uploads");

            try {
                const uploadRes = await axios.post("https://api.cloudinary.com/v1_1/djosldcjf/image/upload", formData);
                profilePicturePublicId = uploadRes.data.public_id;
            } catch {
                setErrors({...errors, profile: 'Image upload failed'});
                return;
            }
        } else if (profile.avatar.includes('cloudinary')) {
            const regex = /upload\/(?:v\d+\/)?([^\.]+)/;
            const match = profile.avatar.match(regex);
            profilePicturePublicId = match?.[1] || null;
        }

        try {
            await axios.put("https://localhost:7149/api/Account/profile", {
                username: profile.fullName,
                email: profile.email,
                phone: profile.phone,
                profilePicture: profilePicturePublicId
            }, { withCredentials: true });
            setSuccessMessage('Profile updated successfully');
        } catch {
            setErrors({...errors, profile: 'Update failed'});
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setErrors({...errors, password: ''});

        if (!validatePassword(password.newPassword)) {
            setErrors({...errors, password: 'Password does not meet requirements'});
            return;
        }

        if (password.newPassword !== password.confirmPassword) {
            setErrors({...errors, password: 'New passwords do not match'});
            return;
        }

        try {
            await axios.put("https://localhost:7149/api/Account/ChangePassword", {
                oldPassword: password.oldPassword,
                newPassword: password.newPassword
            }, { withCredentials: true });

            setSuccessMessage('Password changed successfully');
            setIsPasswordModalOpen(false);
            setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch {
            setErrors({...errors, password: 'Password change failed'});
        }
    };

    const renderPasswordRequirement = (label, condition) => (
        <li style={{ color: condition ? 'green' : 'red' }}>
            {condition ? '✓' : '✗'} {label}
        </li>
    );

    return (
        <div>
            <Header />
            <div className="profile-container-page">
                {successMessage && <div className="success-message">{successMessage}</div>}
                <form onSubmit={handleProfileSubmit} className="profile-form-page">
                    <div className="profile-section-page">
                        <h2>Personal Information</h2>
                        {errors.profile && <div className="error-message">{errors.profile}</div>}

                        <div className="avatar-section-page">
                            <div className="avatar-wrapper-page">
                                <img
                                    src={avatarPreview || profile.avatar}
                                    alt="Profile"
                                    className="profile-avatar"
                                />
                                <label htmlFor="avatar-upload" className="avatar-edit-page">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                    </svg>
                                    Change
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="avatar-input"
                                />
                            </div>
                        </div>

                        <div className="form-group-page">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleProfileChange}
                            />
                        </div>

                        <div className="form-group-page">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                            />
                        </div>
                        <div className="form-group-page">
                            <label>Phone Number</label>
                            <PhoneInput
                                country={'az'}
                                value={profile.phone}
                                onChange={phone => setProfile(prev => ({ ...prev, phone }))}
                                inputStyle={{ width: '100%' }}
                            />
                        </div>

                        <button type="submit" className="save-button-page">Save Changes</button>
                        <button type="button" className="password-button-page" onClick={() => setIsPasswordModalOpen(true)}>
                            Change Password
                        </button>
                    </div>
                </form>
            </div>

            {isPasswordModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Change Password</h3>
                            <button className="modal-close" onClick={() => setIsPasswordModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group-page">
                                <input
                                    type="password"
                                    placeholder="Old Password"
                                    value={password.oldPassword}
                                    onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div className="form-group-page">
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={password.newPassword}
                                    onChange={(e) => {
                                        setPassword({ ...password, newPassword: e.target.value });
                                        validatePassword(e.target.value);
                                    }}
                                    required
                                />
                                <ul className="password-requirements">
                                    {renderPasswordRequirement('Minimum 6 characters', errors.passwordRequirements.length)}
                                    {renderPasswordRequirement('At least one uppercase letter', errors.passwordRequirements.uppercase)}
                                    {renderPasswordRequirement('At least one lowercase letter', errors.passwordRequirements.lowercase)}
                                    {renderPasswordRequirement('At least one number', errors.passwordRequirements.number)}
                                    {renderPasswordRequirement('At least one special character', errors.passwordRequirements.specialChar)}
                                </ul>
                            </div>
                            
                            <div className="form-group-page">
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={password.confirmPassword}
                                    onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            
                            {errors.password && <div className="error-message">{errors.password}</div>}
                            
                            <button 
                                type="submit" 
                                className="save-button-page"
                                disabled={!Object.values(errors.passwordRequirements).every(Boolean)}
                            >
                                Save Password
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;