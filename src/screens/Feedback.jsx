import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function Feedback({ setCurrentScreen, currentUser }) {
  const [tickets, setTickets] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');

  const loadTickets = () => {
    if (currentUser.id === 'Загрузка...') return;
    fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error("Ошибка загрузки тикетов", err));
  };

  useEffect(() => {
    loadTickets();
  }, [currentUser.id]);

  const handleCreateTicket = (topic = 'Вопрос в поддержку') => {
    fetch(`${API_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId: currentUser.id, topic })
    })
    .then(res => res.json())
    .then(ticket => {
      setActiveChat(ticket.id);
      loadTickets();
    });
  };

  const loadMessages = (ticketId) => {
    fetch(`${API_URL}/api/tickets/${ticketId}/messages`)
      .then(res => res.json())
      .then(data => setChatMessages(data));
  };

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
      const interval = setInterval(() => loadMessages(activeChat), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const sendMessage = () => {
    if (!newMessageText.trim() || !activeChat) return;
    fetch(`${API_URL}/api/tickets/${activeChat}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId: currentUser.id, text: newMessageText })
    }).then(() => {
      setNewMessageText('');
      loadMessages(activeChat);
    });
  };

  if (activeChat) {
    const activeTicket = tickets.find((t) => t.id === activeChat);
    return (
      <div className="chat-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="chat-header">
          <button className="back-btn" onClick={() => setActiveChat(null)}>{'<'}</button>
          <div className="chat-header-info">
            <h2 className="chat-header-title">{activeTicket?.topic || 'Чат с поддержкой'}</h2>
          </div>
        </div>
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
          {chatMessages.map(msg => (
            <div key={msg.id} className={`message-bubble ${msg.authorId === currentUser.id ? 'message-out' : 'message-in'}`}>
              {msg.text}
              <span className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          ))}
        </div>
        <div className="chat-input-area">
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Введите сообщение..." 
            value={newMessageText} 
            onChange={e => setNewMessageText(e.target.value)} 
          />
          <button className="chat-send-btn" onClick={sendMessage}>➤</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="screen-header">
        <button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button>
        <h2 className="screen-title">Служба заботы</h2>
      </div>
      <div className="ticket-list">
        <button className="new-ticket-btn" onClick={() => handleCreateTicket()}>
          + Создать новое обращение
        </button>
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card" onClick={() => setActiveChat(ticket.id)}>
            <div className="ticket-info">
              <h4 className="ticket-title">{ticket.topic}</h4>
              <p className="ticket-preview">Тикет #{ticket.id}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Feedback;