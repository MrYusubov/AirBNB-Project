import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./AccountPage.css";
import Header from '../Header';
import { useNavigate } from 'react-router-dom';

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
            .catch(err => console.error('Failed to fetch profile:', err));
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
    
        let profilePicturePublicId = null;
    
        if (selectedAvatarFile) {
            const formData = new FormData();
            formData.append("file", selectedAvatarFile);
            formData.append("upload_preset", "airbnb_uploads");
    
            try {
                const uploadRes = await axios.post("https://api.cloudinary.com/v1_1/djosldcjf/image/upload", formData);
                profilePicturePublicId = uploadRes.data.public_id;
            } catch (err) {
                alert("Image upload failed");
                return;
            }
        } else {
            const regex = /upload\/(?:v\d+\/)?([^\.]+)/;
            const match = profile.avatar.match(regex);
            if (match && match[1]) {
                profilePicturePublicId = match[1];
            }
        }
    
        const updateData = {
            fullName: profile.fullName,
            email: profile.email,
            phoneNumber: profile.phone,
            profilePicture: profilePicturePublicId,
        };
    
        try {
            await axios.put("https://localhost:7149/api/Account/profile", {
                username: updateData.fullName,
                email: updateData.email,
                phone: updateData.phoneNumber,
                profilePicture: updateData.profilePicture
            }, { withCredentials: true });
            alert("Profile updated successfully");
        } catch (err) {
            alert("Update failed");
        }
    };
    

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (password.newPassword !== password.confirmPassword) {
            alert("New passwords do not match");
            return;
        }

        try {
            await axios.put("https://localhost:7149/api/Account/ChangePassword", {
                oldPassword: password.oldPassword,
                newPassword: password.newPassword
            }, { withCredentials: true });

            alert("Password changed successfully");
            setIsPasswordModalOpen(false);
            setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error(err);
            alert("Password change failed");
        }
    };

    return (
        <div>
            <Header />
            <div className="profile-container-page">
                <form onSubmit={handleProfileSubmit} className="profile-form-page">
                    <div className="profile-section-page">
                        <h2>Personal Information</h2>

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
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
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
                            <input
                                type="password"
                                placeholder="Old Password"
                                value={password.oldPassword}
                                onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={password.newPassword}
                                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={password.confirmPassword}
                                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                            />
                            <button type="submit">Save Password</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProfilePage;
