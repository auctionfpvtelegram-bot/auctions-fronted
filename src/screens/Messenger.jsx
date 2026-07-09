import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';

function Messenger({ currentUser, setCurrentScreen, activeChatPartnerId, setActiveChatPartnerId }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingPartner, setLoadingPartner] = useState(false);
  const scrollRef = useRef(null);

  const getAvatarSrc = (url) => {
    if (!url || url === 'null' || url === 'undefined') return null;
    return url.startsWith('http') || url.startsWith('data:') ? url : `${API_URL}/api/image/${url}`;
  };

  // 1. Загрузка всех чатов пользователя
  const loadChats = async (targetIdAfterLoad = null) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}/chats`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Гарантируем, что поддержка ВСЕГДА будет первой в массиве
        const sorted = data.sort((a, b) => (b.isSupport ? 1 : 0) - (a.isSupport ? 1 : 0));
        setChats(sorted);

        // Если нам нужно открыть конкретный чат после загрузки
        if (targetIdAfterLoad) {
          const foundChat = sorted.find(c => c.users.some(u => u.id === targetIdAfterLoad) && !c.isSupport);
          if (foundChat) setActiveChat(foundChat);
        }
      }
    } catch (err) {
      console.error("Ошибка загрузки чатов:", err);
    }
  };

  useEffect(() => {
    // Если пришли из профиля конкретного юзера
    if (activeChatPartnerId) {
      handleTransitionFromProfile(activeChatPartnerId);
    } else {
      loadChats();
    }
  }, [activeChatPartnerId]);

  // Логика перехода из публичного профиля (Виртуальный чат)
  const handleTransitionFromProfile = async (partnerId) => {
    setLoadingPartner(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}/chats`);
      const data = await res.json();
      const sorted = Array.isArray(data) ? data.sort((a, b) => (b.isSupport ? 1 : 0) - (a.isSupport ? 1 : 0)) : [];
      setChats(sorted);

      const existingChat = sorted.find(c => c.users.some(u => u.id === partnerId) && !c.isSupport);
      
      if (existingChat) {
        setActiveChat(existingChat);
      } else {
        // Если чата еще нет — создаем визуальную заглушку для первого сообщения
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPartner(false);
    }
  };

  // 2. Загрузка сообщений активного чата
  useEffect(() => {
    if (activeChat && activeChat.id !== 'NEW_CHAT') {
      fetch(`${API_URL}/api/chats/${activeChat.id}/messages`)
        .then(res => res.json())
        .then(data => setMessages(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    }
  }, [activeChat]);

  // Автоскролл вниз
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // 3. Отправка сообщения
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat) return;

    const textToSend = inputText;
    setInputText(''); // Очищаем поле сразу для отзывчивости интерфейса
    const partner = activeChat.users.find(u => u.id !== currentUser.id) || {};

    try {
      const res = await fetch(`${API_URL}/api/chats/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: partner.id,
          text: textToSend
        })
      });
      const newMsg = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, newMsg]);
        
        // Если это был первый запуск виртуального чата — пересобираем список чатов
        if (activeChat.id === 'NEW_CHAT') {
          if(setActiveChatPartnerId) setActiveChatPartnerId(null);
          await loadChats(partner.id);
        } else {
          // Обновляем последнее сообщение локально
          setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: [newMsg] } : c));
        }
      }
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#f4f6f9', overflow: 'hidden' }}>
      
      {/* 📁 ЛЕВАЯ ЧАСТЬ: СПИСОК ДИАЛОГОВ */}
      <div style={{ width: '35%', minWidth: '220px', background: '#fff', borderRight: '1px solid #eef2f5', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '16px', borderBottom: '1px solid #eee', background: '#fff', zIndex: 10 }}>
          <h2 className="screen-title" style={{ margin: 0, fontSize: '18px' }}>Диалоги</h2>
        </div>

        <div className="ticket-list" style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {chats.map(chat => {
            const partner = chat.users.find(u => u.id !== currentUser.id) || {};
            const isSelected = activeChat?.id === chat.id;
            
            return (
              <div 
                key={chat.id} 
                className={`ticket-card ${isSelected ? 'active' : ''}`}
                onClick={() => { setActiveChat(chat); if(setActiveChatPartnerId) setActiveChatPartnerId(null); }}
                style={{ 
                  margin: 0, 
                  borderRadius: 0, 
                  borderBottom: '1px solid #eee', 
                  background: isSelected ? '#f4f6f9' : '#fff',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px'
                }}
              >
                {/* Аватарка */}
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: chat.isSupport ? '#fff3e0' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                  {chat.isSupport ? <div style={{ fontSize: '22px' }}>🎧</div> : 
                   partner.avatarUrl ? <img src={getAvatarSrc(partner.avatarUrl)} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="avatar" /> : 
                   <div style={{ fontSize: '18px', color: '#78909c' }}>👤</div>}
                </div>
                
                {/* Информация чата (Используем твои классы из Feedback.jsx) */}
                <div className="ticket-info" style={{ flex: 1, margin: 0, overflow: 'hidden' }}>
                  <h4 className="ticket-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 4px 0', fontSize: '15px' }}>
                    <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: chat.isSupport ? '#e65100' : '#111' }}>
                      {chat.isSupport ? 'Служба заботы' : (partner.customName || partner.firstName || 'Аноним')}
                    </span>
                    {chat.isSupport && <span style={{ fontSize: '12px' }}>📌</span>}
                  </h4>
                  <p className="ticket-preview" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.messages?.[0]?.text || 'Нет сообщений'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💬 ПРАВАЯ ЧАСТЬ: ОКНО СООБЩЕНИЙ */}
      <div style={{ width: '65%', display: 'flex', flexDirection: 'column', background: '#fff', position: 'relative' }}>
        {loadingPartner ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Загрузка диалога...</div>
        ) : activeChat ? (
          
          /* 🌟 ИСПОЛЬЗУЕМ ОРИГИНАЛЬНЫЕ КЛАССЫ ИЗ FEEDBACK.JSX 🌟 */
          <div className="chat-container" style={{ height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
            
            {/* Шапка чата */}
            <div className="chat-header" style={{ paddingLeft: '16px' }}>
              <h3 className="chat-title" style={{ fontSize: '16px' }}>
                {activeChat.isSupport 
                  ? 'Служба заботы' 
                  : (activeChat.users.find(u => u.id !== currentUser.id)?.customName || 'Пользователь')}
              </h3>
            </div>
            
            {/* Область сообщений */}
            <div className="chat-messages-area" ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '20px', fontSize: '14px' }}>
                  Отправьте первое сообщение...
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
            
            {/* Область ввода */}
            <div className="chat-input-area">
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

        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
            👈 Выберите диалог из списка слева
          </div>
        )}
      </div>
      
    </div>
  );
}

export default Messenger;