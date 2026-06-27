import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';

function TicketHistory({ setCurrentScreen, currentUser }) {
  const [activeTicket, setActiveTicket] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setActiveTicket(data[0]);
      });
  }, [currentUser.id]);

  useEffect(() => {
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  }, [activeTicket?.messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim() && !selectedPhoto) return;
    
    const textToSend = newMessageText;
    const photoToSend = selectedPhoto;
    setNewMessageText(''); 
    setSelectedPhoto(null);

    if (!activeTicket) {
      fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: currentUser.id, topic: textToSend || 'Обращение с фото' })
      })
      .then(res => res.json())
      .then(newTicket => {
        return fetch(`${API_URL}/api/tickets/${newTicket.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorId: currentUser.id, text: textToSend, photo: photoToSend })
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
        body: JSON.stringify({ authorId: currentUser.id, text: textToSend, photo: photoToSend })
      }).then(() => {
        fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
          .then(res => res.json())
          .then(data => setActiveTicket(data[0]));
      });
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '120px', boxSizing: 'border-box' }}>
      
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', margin: '10px 0 20px 0' }}>
          Это чат со службой заботы. Прикрепите фото или опишите проблему.
        </p>
        
        {activeTicket?.messages?.map(msg => {
          const isMe = msg.authorId === currentUser.id;
          return (
            <div key={msg.id} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              background: isMe ? '#e3f2fd' : '#fff', padding: '10px 14px', borderRadius: '16px', 
              borderBottomRightRadius: isMe ? '4px' : '16px', borderBottomLeftRadius: !isMe ? '4px' : '16px',
              border: '1px solid #eee', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              {msg.photo && <img src={`${API_URL}/api/photos/${msg.photo}`} alt="attachment" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px', objectFit: 'cover' }} />}
              {msg.text && <p style={{ margin: 0, fontSize: '14px', color: '#111', wordBreak: 'break-word' }}>{msg.text}</p>}
              <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#fff', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
        
        {selectedPhoto && (
          <div style={{ padding: '8px 16px', position: 'relative', borderBottom: '1px solid #eee' }}>
            <img src={selectedPhoto} alt="preview" style={{ height: '60px', borderRadius: '8px' }} />
            <button onClick={() => setSelectedPhoto(null)} style={{ position: 'absolute', top: '4px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px' }}>×</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', alignItems: 'center' }}>
          <input type="file" id="user-chat-file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <label htmlFor="user-chat-file" style={{ fontSize: '24px', cursor: 'pointer', margin: 0, color: '#888' }}>📎</label>
          
          <input 
            type="text" placeholder="Сообщение..." value={newMessageText} onChange={e => setNewMessageText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ccc', outline: 'none', fontSize: '16px' }}
          />
          <button onClick={handleSendMessage} style={{ background: '#fbc02d', color: '#000', border: 'none', borderRadius: '12px', padding: '0 16px', fontWeight: 'bold', cursor: 'pointer', height: '44px' }}>➤</button>
        </div>
      </div>
    </div>
  );
}

export default TicketHistory;