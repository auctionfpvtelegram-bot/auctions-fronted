import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';

function Messenger({ currentUser, setCurrentScreen }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  const getAvatarSrc = (url) => {
    if (!url || url === 'null') return null;
    return url.startsWith('http') || url.startsWith('data:') ? url : `${API_URL}/api/image/${url}`;
  };

  useEffect(() => {
    fetch(`${API_URL}/api/users/${currentUser.id}/chats`)
      .then(res => res.json())
      .then(data => setChats(data));
  }, [currentUser.id]);

  useEffect(() => {
    if (activeChat) {
      fetch(`${API_URL}/api/chats/${activeChat.id}/messages`)
        .then(res => res.json())
        .then(data => setMessages(data));
    }
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    
    const receiver = activeChat.users.find(u => u.id !== currentUser.id);

    fetch(`${API_URL}/api/chats/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: currentUser.id, receiverId: receiver.id, text: inputText })
    })
    .then(res => res.json())
    .then(newMsg => {
      setMessages([...messages, newMsg]);
      setInputText('');
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f4f6f9' }}>
      
      {/* ЛЕВАЯ ПАНЕЛЬ: СПИСОК ДИАЛОГОВ */}
      <div style={{ width: '35%', minWidth: '120px', background: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: '18px' }}>
          Сообщения
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map(chat => {
            const partner = chat.users.find(u => u.id !== currentUser.id) || {};
            const isSelected = activeChat?.id === chat.id;
            
            return (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat)}
                style={{ display: 'flex', alignItems: 'center', padding: '12px', cursor: 'pointer', background: isSelected ? '#e3f2fd' : 'transparent', borderBottom: '1px solid #f5f5f5' }}
              >
                <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', background: '#eee', flexShrink: 0, overflow: 'hidden' }}>
                  {chat.isSupport ? <div style={{ fontSize: '24px', textAlign: 'center', lineHeight: '40px' }}>🎧</div> : 
                   partner.avatarUrl ? <img src={getAvatarSrc(partner.avatarUrl)} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="avatar" /> : 
                   <div style={{ fontSize: '20px', textAlign: 'center', lineHeight: '40px' }}>👤</div>}
                  
                  {/* Пин поддержки */}
                  {chat.isSupport && <span style={{ position: 'absolute', top: 0, right: 0, fontSize: '12px' }}>📌</span>}
                </div>
                
                <div style={{ marginLeft: '12px', overflow: 'hidden' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: chat.isSupport ? '#1976d2' : '#111', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {chat.isSupport ? 'Служба поддержки' : (partner.customName || partner.firstName || 'Пользователь')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.messages?.[0]?.text || 'Нет сообщений'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: АКТИВНЫЙ ЧАТ */}
      <div style={{ width: '65%', display: 'flex', flexDirection: 'column' }}>
        {activeChat ? (
          <>
            {/* Хедер чата */}
            <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #eee', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>
                {activeChat.isSupport ? '🎧 Поддержка' : (activeChat.users.find(u => u.id !== currentUser.id)?.customName || 'Пользователь')}
              </span>
            </div>
            
            {/* Сообщения */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.map(msg => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', background: isMine ? '#1976d2' : '#fff', color: isMine ? '#fff' : '#111', padding: '10px 14px', borderRadius: '14px', borderBottomRightRadius: isMine ? '2px' : '14px', borderBottomLeftRadius: isMine ? '14px' : '2px', maxWidth: '80%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '14px' }}>{msg.text}</div>
                    <div style={{ fontSize: '10px', color: isMine ? '#b3d4f5' : '#aaa', textAlign: 'right', marginTop: '4px' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Ввод */}
            <form onSubmit={handleSendMessage} style={{ padding: '12px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
              <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Написать сообщение..." style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }} />
              <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer' }}>➤</button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            Выберите диалог слева
          </div>
        )}
      </div>
      
    </div>
  );
}

export default Messenger;