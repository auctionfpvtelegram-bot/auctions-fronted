import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';

function Messenger({ currentUser, setCurrentScreen, activeChatPartnerId, setActiveChatPartnerId }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [isListVisible, setIsListVisible] = useState(true); 
  const scrollRef = useRef(null);

  // Исправленная и безопасная проверка аватарок
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
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 60px)', background: '#f4f6f9', overflow: 'hidden' }}>
      
      {/* 📁 СПИСОК ДИАЛОГОВ */}
      <div style={{ width: '100%', display: isListVisible ? 'flex' : 'none', flexDirection: 'column', background: '#fff' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #eee', background: '#fff', zIndex: 10 }}>
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
                   avatarUrlValid ? <img src={avatarUrlValid} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="avatar" /> : 
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
                    {chat.messages?.[0]?.text || (chat.id === 'NEW_CHAT' ? 'Новый диалог' : 'Нет сообщений')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💬 ОКНО ЧАТА */}
      <div style={{ width: '100%', display: !isListVisible ? 'flex' : 'none', flexDirection: 'column', background: '#fff', position: 'relative' }}>
        {loadingPartner ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Загрузка диалога...</div>
        ) : activeChat ? (
          
          <div className="chat-container" style={{ height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
            
            <div className="chat-header" style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', gap: '14px', borderBottom: '1px solid #eee' }}>
              <button 
                onClick={() => setIsListVisible(true)} 
                style={{ background: 'none', border: 'none', fontSize: '22px', color: '#1976d2', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {'❮'}
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 className="chat-title" style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  {activeChat.isSupport ? 'Поддержка' : (activePartner?.customName || activePartner?.firstName || 'Пользователь')}
                </h3>
                {!activeChat.isSupport && activePartner?.id && (
                  <span style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginTop: '2px' }}>
                    ID: {activePartner.id}
                  </span>
                )}
              </div>
            </div>
            
            <div className="chat-messages-area" ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '20px', fontSize: '14px' }}>
                  Напишите сообщение, чтобы начать диалог...
                </div>
              )}

              {messages.map(msg => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`message-bubble ${isMine ? 'message-out' : 'message-in'}`}>
                    {msg.text}
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="chat-input-area" style={{ borderTop: '1px solid #eee' }}>
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Введите сообщение..." 
                value={inputText} 
                onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="chat-send-btn" onClick={handleSendMessage}>➤</button>
            </div>

          </div>

        ) : null}
      </div>
      
    </div>
  );
}

export default Messenger;