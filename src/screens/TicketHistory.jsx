import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function TicketHistory({ setCurrentScreen, currentUser }) {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/users/${currentUser.id}/tickets`)
      .then(res => res.json())
      .then(data => setTickets(Array.isArray(data) ? data : []));
  }, [currentUser.id]);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
      <div className="screen-header" style={{ background: '#fff', margin: '-16px -16px 16px -16px', padding: '16px' }}>
        <button className="back-btn" onClick={() => { activeTicket ? setActiveTicket(null) : setCurrentScreen('profile') }}>{'<'}</button>
        <h2 className="screen-title">{activeTicket ? 'Диалог с поддержкой' : 'Мои обращения'}</h2>
      </div>

      {!activeTicket ? (
        <div>
          {tickets.length === 0 ? <p style={{textAlign: 'center', color: '#888'}}>У вас пока нет обращений</p> : 
            tickets.map(t => (
              <div key={t.id} className="admin-card" onClick={() => setActiveTicket(t)} style={{ padding: '16px', marginBottom: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>{t.topic}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Сообщений от поддержки: {t.messages?.length || 0}</p>
                </div>
                <span style={{color: '#ccc', fontSize: '20px'}}>{'>'}</span>
              </div>
            ))
          }
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#e3f2fd', padding: '14px', borderRadius: '12px' }}>
            <strong style={{ color: '#1976d2', fontSize: '12px', display: 'block', marginBottom: '4px' }}>ВАШ ЗАПРОС:</strong>
            <p style={{ margin: 0, fontSize: '14px' }}>{activeTicket.topic}</p>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '8px' }}>
               {new Date(activeTicket.createdAt).toLocaleString('ru-RU')}
            </span>
          </div>
          
          {activeTicket.messages?.map(msg => (
            <div key={msg.id} style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #ddd' }}>
              <strong style={{ color: '#c62828', fontSize: '12px', display: 'block', marginBottom: '4px' }}>ОТВЕТ АДМИНИСТРАТОРА:</strong>
              <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
              <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '8px' }}>
                {new Date(msg.createdAt).toLocaleString('ru-RU')}
              </span>
            </div>
          ))}
          
          {(!activeTicket.messages || activeTicket.messages.length === 0) && (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginTop: '20px' }}>Модератор еще не ответил на это обращение.<br/>Пожалуйста, ожидайте.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TicketHistory;