import React from 'react';

export function AdminTickets({ 
  adminTickets, activeChat, setActiveChat, chatMessages, setChatMessages, 
  newMessageText, setNewMessageText, loadMessages, sendMessageWithPhoto, 
  setAdminScreen, handlePhotoSelect, adminSelectedPhoto, currentUser 
}) {

  const activeTicket = adminTickets.find(t => t.id === activeChat);
  const [ticketSearch, setTicketSearch] = React.useState('');

  // ⚡ Фильтрация тикетов по ID тикета или ID автора
  const filteredTickets = adminTickets.filter(t => 
    String(t.id).includes(ticketSearch) || 
    String(t.authorId).includes(ticketSearch)
  );

  if (activeChat) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f9f9f9' }}>
        {/* Шапка чата */}
        <div style={{ padding: '14px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Тикет #{activeChat}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Автор ID: {activeTicket?.authorId}</div>
          </div>
        </div>

        {/* Сообщения */}
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          {/* Суть обращения */}
          {activeTicket && (
            <div style={{ alignSelf: 'flex-start', background: '#fff8e1', padding: '12px 14px', borderRadius: '16px', borderBottomLeftRadius: '4px', border: '1px solid #ffe0b2', maxWidth: '85%', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: '#f57c00', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>📌 ПЕРВОЕ СООБЩЕНИЕ (СУТЬ):</span>
              <p style={{ margin: 0, fontSize: '14px', color: '#111', fontWeight: '500' }}>{activeTicket.topic}</p>
            </div>
          )}

          {/* Переписка с датами */}
          {Array.isArray(chatMessages) && chatMessages.map((msg, index) => {
            const isMe = currentUser && msg.authorId === currentUser.id;
            
            // ⚡ ЛОГИКА ОТОБРАЖЕНИЯ ДАТЫ
            const msgDate = new Date(msg.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            let showDate = false;
            
            if (index === 0) {
              showDate = true;
            } else {
              const prevMsgDate = new Date(chatMessages[index - 1].createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
              if (msgDate !== prevMsgDate) showDate = true;
            }

            const timeStr = new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '11px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    <span style={{ background: '#e0e0e0', padding: '4px 10px', borderRadius: '12px' }}>{msgDate}</span>
                  </div>
                )}
                
                <div style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? '#e3f2fd' : '#fff', padding: '10px 14px', borderRadius: '16px', borderBottomRightRadius: isMe ? '4px' : '16px', borderBottomLeftRadius: isMe ? '16px' : '4px', maxWidth: '80%', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                  {msg.photo && <img src={`${msg.photo}`} alt="" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '6px' }} />}
                  <p style={{ margin: 0, fontSize: '14px', wordBreak: 'break-word' }}>{msg.text}</p>
                  <span style={{ display: 'block', textAlign: 'right', fontSize: '10px', color: '#999', marginTop: '4px' }}>{timeStr}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Панель ввода */}
        <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #eee' }}>
          {adminSelectedPhoto && (
            <div style={{ fontSize: '12px', color: '#2e7d32', marginBottom: '6px' }}>📸 Фотография выбрана для отправки</div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', background: '#eee', borderRadius: '12px', cursor: 'pointer', fontSize: '20px' }}>
              📎
              <input type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
            </label>
            <input type="text" value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} placeholder="Введите ответ..." style={{ flex: 1, height: '44px', border: '1px solid #ddd', borderRadius: '12px', padding: '0 12px', fontSize: '14px', outline: 'none' }} />
            <button onClick={sendMessageWithPhoto} style={{ background: '#fbc02d', color: '#000', border: 'none', borderRadius: '12px', padding: '0 16px', fontWeight: 'bold', cursor: 'pointer', height: '44px' }}>➤</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <button onClick={() => setAdminScreen('dashboard')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', marginBottom: '16px', cursor: 'pointer' }}>← В меню модератора</button>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>🎧 Обращения в поддержку</h3>
      
      {/* ⚡ Поиск тикетов */}
      <input 
        type="text" 
        placeholder="🔍 Поиск по ID тикета или ID автора..." 
        value={ticketSearch}
        onChange={(e) => setTicketSearch(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '16px', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
      />

      <div className="ticket-list">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card" onClick={() => { setChatMessages([]); setActiveChat(ticket.id); }} style={{ background: '#fff', border: '1px solid #eee', marginBottom: '12px', borderRadius: '12px', padding: '16px', cursor: 'pointer' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>{ticket.topic}</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>От пользователя: {ticket.authorId}</p>
          </div>
        ))}
        {filteredTickets.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: '24px' }}>
            {ticketSearch ? 'Ничего не найдено' : 'Нет обращений'}
          </div>
        )}
      </div>
    </div>
  );
}