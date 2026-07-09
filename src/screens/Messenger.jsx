import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';

function Messenger({ currentUser, setCurrentScreen, activeChatPartnerId, setActiveChatPartnerId, handleOpenPublicProfile }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [isListVisible, setIsListVisible] = useState(true); 
  const scrollRef = useRef(null);

  const getAvatarSrc = (url) => {
    if (!url || url === 'null' || url === 'undefined' || url === '') return null;
    return url.startsWith('http') || url.startsWith('data:') ? url : `${API_URL}/api/image/${url}`;
  };

  const loadChats = async (targetIdAfterLoad = null) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}/chats`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const filtered = data.filter(c => !c.isSupport);
        setChats(filtered);

        if (targetIdAfterLoad) {
          const foundChat = filtered.find(c => c.users.some(u => u.id === targetIdAfterLoad));
          if (foundChat) {
            setActiveChat(foundChat);
            setIsListVisible(false);
          }
        }
      }
    } catch (err) {
      console.error("Ошибка загрузки чатов:", err);
    }
  };

  useEffect(() => {
    if (activeChatPartnerId) {
      handleTransitionFromProfile(activeChatPartnerId);
    } else {
      loadChats();
    }
  }, [activeChatPartnerId]);

  const handleTransitionFromProfile = async (partnerId) => {
    setLoadingPartner(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}/chats`);
      const data = await res.json();
      const filtered = Array.isArray(data) ? data.filter(c => !c.isSupport) : [];
      setChats(filtered);

      const existingChat = filtered.find(c => c.users.some(u => u.id === partnerId));
      
      if (existingChat) {
        setActiveChat(existingChat);
        setIsListVisible(false);
      } else {
        const userRes = await fetch(`${API_URL}/api/users/${partnerId}/public`);
        const partnerData = await userRes.json();
        
        const virtualChat = {
          id: 'NEW_CHAT',
          isSupport: false,
          users: [
            currentUser,
            {
              id: partnerId,
              customName: partnerData.customName,
              firstName: partnerData.firstName,
              avatarUrl: partnerData.avatarUrl
            }
          ],
          messages: []
        };
        setActiveChat(virtualChat);
        setMessages([]);
        setIsListVisible(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPartner(false);
    }
  };

  useEffect(() => {
    if (activeChat) {
      if (activeChat.id === 'NEW_CHAT' || activeChat.id === 'SUPPORT_CHAT') {
        setMessages([]); 
      } else {
        fetch(`${API_URL}/api/chats/${activeChat.id}/messages`)
          .then(res => res.json())
          .then(data => setMessages(Array.isArray(data) ? data : []))
          .catch(err => console.error(err));
      }
    }
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isListVisible]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat) return;

    const textToSend = inputText;
    setInputText('');
    const partner = activeChat.users.find(u => u.id !== currentUser.id) || {};
    const receiverId = activeChat.isSupport ? '7688251487' : partner.id;

    try {
      const res = await fetch(`${API_URL}/api/chats/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: receiverId,
          text: textToSend
        })
      });
      const newMsg = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, newMsg]);
        
        if (activeChat.id === 'NEW_CHAT' || activeChat.id === 'SUPPORT_CHAT') {
          if (setActiveChatPartnerId) setActiveChatPartnerId(null);
          await loadChats(receiverId);
        } else {
          setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: [newMsg] } : c));
        }
      }
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);
    }
  };

  const handleAttachPhoto = async () => {
    if (!activeChat) return;
    const partner = activeChat.users.find(u => u.id !== currentUser.id) || {};
    const receiverId = activeChat.isSupport ? '7688251487' : partner.id;

    try {
      await fetch(`${API_URL}/api/chats/expect-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, receiverId })
      });
      window.Telegram?.WebApp?.close();
    } catch (err) {
      console.error("Ошибка при запросе фото:", err);
    }
  };

  const displayedChats = [...chats];
  displayedChats.unshift({
    id: 'SUPPORT_CHAT',
    isSupport: true,
    users: [currentUser, { id: '7688251487', customName: 'Поддержка', firstName: 'Поддержка' }],
    messages: []
  });

  if (activeChat && activeChat.id === 'NEW_CHAT') {
    const partner = activeChat.users.find(u => u.id !== currentUser.id);
    if (!displayedChats.some(c => c.users.some(u => u.id === partner?.id) && !c.isSupport)) {
      displayedChats.splice(1, 0, activeChat);
    }
  }

  const activePartner = activeChat ? activeChat.users.find(u => u.id !== currentUser.id) : null;

  return (
    // ⚡ POSITION FIXED жестко блокирует экран и не дает строке ввода уплыть
    <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, display: 'flex', background: '#f4f6f9', overflow: 'hidden', zIndex: 100 }}>
      
      {/* 📁 СПИСОК ДИАЛОГОВ */}
      <div style={{ width: '100%', display: isListVisible ? 'flex' : 'none', flexDirection: 'column', background: '#fff', height: '100%' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #eee', background: '#fff', flexShrink: 0 }}>
          <h2 className="screen-title" style={{ margin: 0, fontSize: '18px' }}>Диалоги</h2>
        </div>

        <div className="ticket-list" style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {displayedChats.map(chat => {
            const partner = chat.users.find(u => u.id !== currentUser.id) || {};
            const isSelected = activeChat?.id === chat.id;
            const avatarUrlValid = getAvatarSrc(partner.avatarUrl);
            
            return (
              <div 
                key={chat.id} 
                className={`ticket-card ${isSelected ? 'active' : ''}`}
                onClick={() => { 
                  setActiveChat(chat); 
                  if(setActiveChatPartnerId) setActiveChatPartnerId(null); 
                  setIsListVisible(false); 
                }}
                style={{ 
                  margin: 0, borderRadius: 0, borderBottom: '1px solid #eee', 
                  background: isSelected ? '#f4f6f9' : '#fff', boxShadow: 'none',
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer'
                }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: chat.isSupport ? '#fff3e0' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                  {chat.isSupport ? <div style={{ fontSize: '24px' }}>🎧</div> : 
                   avatarUrlValid ? <img src={avatarUrlValid} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="avatar" onError={(e) => e.target.style.display='none'} /> : 
                   <div style={{ fontSize: '20px', color: '#78909c' }}>👤</div>}
                </div>
                
                <div className="ticket-info" style={{ flex: 1, margin: 0, overflow: 'hidden' }}>
                  <h4 className="ticket-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 4px 0', fontSize: '15px' }}>
                    <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: chat.isSupport ? '#e65100' : '#111', fontWeight: 'bold' }}>
                      {chat.isSupport ? 'Поддержка' : (partner.customName || partner.firstName || 'Аноним')}
                    </span>
                    {chat.isSupport && <span style={{ fontSize: '12px' }}>📌</span>}
                  </h4>
                  <p className="ticket-preview" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#666', fontSize: '13px' }}>
                    {chat.messages?.[0]?.photo ? '📷 Фотография' : (chat.messages?.[0]?.text || (chat.id === 'NEW_CHAT' ? 'Новый диалог' : 'Нет сообщений'))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💬 ОКНО ЧАТА */}
      <div style={{ width: '100%', display: !isListVisible ? 'flex' : 'none', flexDirection: 'column', background: '#fff', height: '100%' }}>
        {loadingPartner ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Загрузка диалога...</div>
        ) : activeChat ? (
          
          <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            
            {/* 🌟 ШАПКА ЧАТА (с кликабельным ником и SVG-стрелкой) */}
            <div className="chat-header" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '14px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
              <button 
                onClick={() => setIsListVisible(true)} 
                style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 
                  className="chat-title" 
                  onClick={() => {
                    // ⚡ Переход в профиль при клике
                    if (!activeChat.isSupport && activePartner?.id && handleOpenPublicProfile) {
                      handleOpenPublicProfile(activePartner.id, 'messenger');
                    }
                  }}
                  style={{ 
                    margin: 0, fontSize: '16px', fontWeight: 'bold', 
                    color: !activeChat.isSupport ? '#1976d2' : '#111', 
                    cursor: !activeChat.isSupport ? 'pointer' : 'default',
                    textDecoration: !activeChat.isSupport ? 'underline' : 'none' 
                  }}
                >
                  {activeChat.isSupport ? 'Поддержка' : (activePartner?.customName || activePartner?.firstName || 'Пользователь')}
                </h3>
                {!activeChat.isSupport && activePartner?.id && (
                  <span style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginTop: '2px' }}>
                    ID: {activePartner.id}
                  </span>
                )}
              </div>
            </div>
            
            {/* СООБЩЕНИЯ */}
            <div className="chat-messages-area" ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '20px', fontSize: '14px' }}>
                  Напишите сообщение, чтобы начать диалог...
                </div>
              )}

              {messages.map(msg => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div 
                    key={msg.id} 
                    style={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      background: isMine ? '#ffcc00' : '#fff',
                      color: '#000',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      borderBottomRightRadius: isMine ? '2px' : '16px',
                      borderBottomLeftRadius: isMine ? '16px' : '2px',
                      maxWidth: '80%',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {msg.photo && (
                      <img 
                        src={getAvatarSrc(msg.photo)} 
                        alt="Фото" 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Ошибка+загрузки'; }}
                        style={{ width: '100%', borderRadius: '8px', marginBottom: msg.text ? '8px' : '0', display: 'block' }} 
                      />
                    )}
                    
                    {msg.text && <span style={{ fontSize: '14px', wordBreak: 'break-word', lineHeight: '1.4' }}>{msg.text}</span>}
                    
                    <span style={{ fontSize: '10px', color: isMine ? '#8a6d00' : '#888', alignSelf: 'flex-end', marginTop: '4px', fontWeight: 'bold' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* ⚡ ПАНЕЛЬ ВВОДА (жестко закреплена снизу) */}
            <div className="chat-input-area" style={{ borderTop: '1px solid #eee', display: 'flex', gap: '8px', padding: '12px 16px', alignItems: 'center', background: '#fff', flexShrink: 0, paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
              <button 
                onClick={handleAttachPhoto} 
                style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#888' }}
              >
                📎
              </button>
              
              <input 
                type="text" 
                placeholder="Сообщение..." 
                value={inputText} 
                onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                style={{ flex: 1, height: '42px', borderRadius: '20px', border: '1px solid #cbd5e1', padding: '0 16px', outline: 'none', fontSize: '15px' }}
              />
              
              <button 
                onClick={handleSendMessage} 
                style={{ background: '#ffcc00', border: 'none', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(255,204,0,0.3)' }}
              >
                ➤
              </button>
            </div>

          </div>

        ) : null}
      </div>
      
    </div>
  );
}

export default Messenger;