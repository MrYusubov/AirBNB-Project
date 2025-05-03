import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BsCircleFill } from 'react-icons/bs';
import { IoIosSend } from 'react-icons/io';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import "./Message.css";
import Header from '../Header';

const api = axios.create({
  baseURL: 'https://localhost:7149/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const Chat = () => {
  const [activeUser, setActiveUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const connectionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const startConnection = async () => {
      const res = await api.get('/Account/Profile');
      setCurrentUserId(res.data.id);

      const connection = new signalR.HubConnectionBuilder()
        .withUrl('https://localhost:7149/chatHub', {
          withCredentials: true,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      await connection.start();
      connection.on("UpdateUserStatus", handleUpdateUserStatus);
      connection.on("ReceiveMessage", handleReceiveMessage);

      connectionRef.current = connection;
    };

    startConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("UpdateUserStatus", handleUpdateUserStatus);
        connectionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchUsers();
    }
  }, [currentUserId]);



  const handleReceiveMessage = useCallback((msg) => {
    console.log("Received message:", msg);
    setMessages(prev => {
      if (prev.find(m => m.id === msg.id)) return prev;
      return [
        ...prev,
        {
          id: msg.id,
          sender: msg.senderId === currentUserId ? 1 : 2,
          text: msg.content,
          time: msg.sentAt,
          isRead: msg.isRead
        }
      ];
    });
  }, [currentUserId]);

  const handleUpdateUserStatus = useCallback((userId, isOnline) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, status: isOnline ? 'online' : 'offline' } : user
      )
    );
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/Message/GetAllUsers');

      const transformedUsers = response.data
        .filter(user => user.id !== currentUserId && user.id !== "40cfb59d-484e-4db3-acb6-93c5d8c8cec9")
        .map(user => ({
          id: user.id,
          name: user.userName,
          avatar: user.profilePicture && user.profilePicture.trim() !== ""
            ? `https://res.cloudinary.com/djosldcjf/image/upload/${user.profilePicture}`
            : "/logo/user.png",
          status: user.isOnline ? 'online' : 'offline'
        }));

      setUsers(transformedUsers);

      if (!activeUser && transformedUsers.length > 0) {
        setActiveUser(transformedUsers[0].id);
      }

    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  useEffect(() => {
    if (activeUser && currentUserId) {
      fetchMessages();
    }
  }, [activeUser, currentUserId]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/Message/GetAllMessages/${activeUser}/${currentUserId}`);
      const transformed = res.data.map(msg => ({
        id: msg.id,
        sender: msg.senderId === currentUserId ? 1 : 2,
        text: msg.content,
        time: new Date(msg.sentAt).toLocaleString('az-AZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        isRead: msg.isRead
      }));

      setMessages(transformed);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };


  const handleSendMessage = async () => {
    if (!message.trim() || !activeUser || !currentUserId) return;

    const tempId = Date.now().toString();
    const sentAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: tempId,
        sender: 1,
        text: message,
        time: sentAt,
        isRead: false
      }
    ]);

    try {
      await connectionRef.current.invoke("SendMessage", activeUser, message);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div>
      <Header />
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Messages</h1>
          </div>
          <div className="user-list">
            {users.map(user => (
              <div
                key={user.id}
                className={`user-item ${activeUser === user.id ? 'active-user' : ''}`}
                onClick={() => setActiveUser(user.id)}
              >
                <div className="avatar-container">
                  <img src={user.avatar} className="user-avatar"
                  />
                  <BsCircleFill
                    className={`status-indicator ${user.status === 'online' ? 'online' : 'offline'}`}
                  />
                </div>
                <div className="user-info">
                  <h3 className="user-name">{user.name}</h3>
                  <p className="user-status">
                    {user.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeUser && (
          <div className="chat-main">
            <div className="messages-container">
              <div className="messages-list">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message-wrapper ${msg.sender === 1 ? 'sent' : 'received'}`}
                  >
                    <div className={`message-bubble ${msg.sender === 1 ? 'sent-message' : 'received-message'}`}>
                      <p className="message-text">{msg.text}</p>
                      <p className="message-time">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="message-input-container">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message"
                  className="message-input"
                />
                <button onClick={handleSendMessage} className="send-button" disabled={!message.trim()}>
                  <IoIosSend />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;