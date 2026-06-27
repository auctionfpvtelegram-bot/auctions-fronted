import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';

function TicketHistory({ setCurrentScreen, currentUser }) {
  const [activeTicket, setActiveTicket] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setActiveTicket(data[0]);
        }
      });
  }, [currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;
    
    const textToSend = newMessageText;
    setNewMessageText(''); 

    if (!activeTicket) {
      fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: currentUser.id, topic: 'Чат с поддержкой' })
      })
      .then(res => res.json())
      .then(newTicket => {
        return fetch(`${API_URL}/api/tickets/${newTicket.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorId: currentUser.id, text: textToSend })
        }).then(() => newTicket);
      })
      .then(() => {
        fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
          .then(res => res.json())
          .then(data => setActiveTicket(data[0]));
      });
    } else {
      fetch(`${API_URL}/api/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: currentUser.id, text: textToSend })
      }).then(() => {
        fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
          .then(res => res.json())
          .then(data => setActiveTicket(data[0]));
      });
    }
  };

  return (
    // ⚡ Жестко фиксируем высоту контейнера, чтобы он не разъезжался
    <div style={{ background: '#f5f5f5', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      
      {/* ⚡ ОБЛАСТЬ СООБЩЕНИЙ (скроллится внутри) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', margin: '10px 0 20px 0' }}>
          Это чат со службой заботы. Опишите вашу проблему, и модератор ответит вам в ближайшее время.
        </p>
        
        {activeTicket?.messages?.map(msg => {
          const isMe = msg.authorId === currentUser.id;
          return (
            <div key={msg.id} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              background: isMe ? '#e3f2fd' : '#fff', 
              padding: '10px 14px', 
              borderRadius: '16px', 
              borderBottomRightRadius: isMe ? '4px' : '16px',
              borderBottomLeftRadius: !isMe ? '4px' : '16px',
              border: '1px solid #eee',
              maxWidth: '85%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#111' }}>{msg.text}</p>
              <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ⚡ ПОЛЕ ВВОДА (Намертво прижато к низу, не плавает) */}
      <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <input 
          type="text" 
          placeholder="Введите сообщение..." 
          value={newMessageText}
          onChange={e => setNewMessageText(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ccc', outline: 'none' }}
        />
        <button 
          onClick={handleSendMessage}
          style={{ background: '#fbc02d', color: '#000', border: 'none', borderRadius: '12px', padding: '0 16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ➤
        </button>
      </div>

    </div>
  );
}

export default TicketHistory;