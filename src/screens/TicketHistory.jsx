import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function TicketHistory({ setCurrentScreen, currentUser }) {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
      .then(res => res.json())
      .then(data => setTickets(Array.isArray(data) ? data : []));
  }, [currentUser.id]);

  // ⚡ Логика автоматического создания тикета из первого сообщения
  const handleSendNewTicket = () => {
    if (!newMessageText.trim()) return;
    
    const topicText = newMessageText.length > 30 ? newMessageText.substring(0, 30) + '...' : newMessageText;

    fetch(`${API_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId: currentUser.id, topic: topicText })
    })
    .then(res => res.json())
    .then(newTicket => {
      return fetch(`${API_URL}/api/tickets/${newTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: currentUser.id, text: newMessageText })
      }).then(() => newTicket);
    })
    .then(newTicket => {
      setNewMessageText('');
      setIsCreating(false);
      fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
        .then(res => res.json())
        .then(data => {
          setTickets(Array.isArray(data) ? data : []);
          const created = data.find(t => t.id === newTicket.id);
          if (created) setActiveTicket(created);
        });
    });
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim() || !activeTicket) return;
    fetch(`${API_URL}/api/tickets/${activeTicket.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId: currentUser.id, text: newMessageText })
    }).then(() => {
      setNewMessageText('');
      fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
        .then(res => res.json())
        .then(data => {
          setTickets(Array.isArray(data) ? data : []);
          const updated = data.find(t => t.id === activeTicket.id);
          if (updated) setActiveTicket(updated);
        });
    });
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
      {!activeTicket && !isCreating ? (
        <div>
          <button 
            onClick={() => setIsCreating(true)}
            style={{ width: '100%', padding: '14px', background: '#fff', color: '#fbc02d', fontWeight: 'bold', border: '1px solid #fbc02d', borderRadius: '12px', marginBottom: '16px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            💬 Написать в техподдержку
          </button>

          {tickets.length === 0 ? <p style={{textAlign: 'center', color: '#888'}}>У вас пока нет обращений</p> : 
            tickets.map(t => (
              <div key={t.id} className="admin-card" onClick={() => setActiveTicket(t)} style={{ padding: '16px', marginBottom: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Обращение #{t.id}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Сообщений: {t.messages?.length || 0}</p>
                </div>
                <span style={{color: '#ccc', fontSize: '20px'}}>{'>'}</span>
              </div>
            ))
          }
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
          <button onClick={() => { setActiveTicket(null); setIsCreating(false); setNewMessageText(''); }} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>
            ← К списку обращений
          </button>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
            {isCreating ? (
              <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginTop: '20px' }}>Опишите вашу проблему, и модератор ответит вам в ближайшее время.</p>
            ) : (
              activeTicket?.messages?.map(msg => {
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
                    maxWidth: '80%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <strong style={{ color: isMe ? '#1976d2' : '#c62828', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                      {isMe ? 'Вы' : 'Поддержка'}
                    </strong>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111' }}>{msg.text}</p>
                    <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '4px', textAlign: 'right' }}>
                      {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <input 
              type="text" 
              placeholder="Введите сообщение..." 
              value={newMessageText}
              onChange={e => setNewMessageText(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ccc', outline: 'none' }}
            />
            <button 
              onClick={isCreating ? handleSendNewTicket : handleSendMessage}
              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketHistory;