import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function Admin({ setCurrentScreen, currentUser, setAlertData, setConfirmData }) {
  const [adminScreen, setAdminScreen] = useState('dashboard');
  
  const [adminLotsList, setAdminLotsList] = useState([]);
  const [adminActiveTab, setAdminActiveTab] = useState('check');
  
  const [adminReviewsList, setAdminReviewsList] = useState([]);
  const [adminReviewsTab, setAdminReviewsTab] = useState('MODERATION');
  
  const [adminTickets, setAdminTickets] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');

  const [adminModal, setAdminModal] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  const [searchUserId, setSearchUserId] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  
  const [banReasonInput, setBanReasonInput] = useState('');
  const [banScope, setBanScope] = useState('ALL');
  const [banDays, setBanDays] = useState('');

  const loadAdminLots = () => {
    fetch(`${API_URL}/api/admin/lots?t=${Date.now()}`)
      .then(async res => {
        if (!res.ok) throw new Error('Ошибка сервера');
        return res.json();
      })
      .then(data => { 
        setAdminLotsList(Array.isArray(data) ? data : []); 
        setAdminScreen('lots'); 
      })
      .catch(err => {
        console.error(err);
        setAlertData({ message: '❌ Ошибка связи с сервером. Бэкенд не отвечает.' });
      });
  };

  const loadAdminReviews = () => {
    fetch(`${API_URL}/api/admin/reviews?t=${Date.now()}`)
      .then(async res => {
        if (!res.ok) throw new Error('Ошибка сервера');
        return res.json();
      })
      .then(data => { 
        setAdminReviewsList(Array.isArray(data) ? data : []); 
        setAdminReviewsTab('MODERATION'); 
        setAdminScreen('reviews'); 
      })
      .catch(err => {
        console.error(err);
        setAlertData({ message: '❌ Ошибка связи с сервером. Бэкенд не отвечает.' });
      });
  };

  const loadTickets = () => {
    fetch(`${API_URL}/api/admin/tickets`)
      .then(async res => {
        if (!res.ok) throw new Error('Ошибка сервера');
        return res.json();
      })
      .then(data => { 
        setAdminTickets(Array.isArray(data) ? data : []); 
        setAdminScreen('feedback'); 
      })
      .catch(err => {
        console.error(err);
        setAlertData({ message: '❌ Ошибка связи с сервером. Бэкенд не отвечает.' });
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

  const handleUpdateLotStatus = (lotId, newStatus, reason = null) => {
    fetch(`${API_URL}/api/lots/${lotId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, rejectReason: reason })
    })
    .then(async res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      setAlertData({ message: `✅ Статус лота успешно обновлен!` });
      setAdminModal(null);
      loadAdminLots();
    })
    .catch(() => setAlertData({ message: `❌ Ошибка обновления.` }));
  };

  const approveReview = (reviewId) => {
    fetch(`${API_URL}/api/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACTIVE' })
    }).then(() => {
      setAlertData({ message: '✅ Отзыв одобрен и опубликован!' });
      setAdminReviewsList(adminReviewsList.filter(r => r.id !== reviewId));
    });
  };

  const rejectReview = (reviewId) => {
    fetch(`${API_URL}/api/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' })
    }).then(() => {
      setAlertData({ message: '🗑 Отзыв отклонен.' });
      setAdminReviewsList(adminReviewsList.filter(r => r.id !== reviewId));
    });
  };

  const deleteReview = (reviewId) => {
    setConfirmData({
      message: 'Вы уверены, что хотите навсегда удалить этот отзыв?',
      onConfirm: () => {
        fetch(`${API_URL}/api/reviews/${reviewId}`, { method: 'DELETE' })
        .then(() => {
          setAlertData({ message: '🔥 Отзыв навсегда удален!' });
          setAdminReviewsList(adminReviewsList.filter(r => r.id !== reviewId));
        });
      }
    });
  };

  const handleSearchUser = () => {
    if (!searchUserId.trim()) return;
    fetch(`${API_URL}/api/users/${searchUserId.trim()}/public?t=${Date.now()}`)
      .then(async res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setFoundUser(data);
        setBanReasonInput(data.banReason || '');
        setBanScope(data.banScope || 'ALL');
        setBanDays(''); 
      })
      .catch(() => {
        setFoundUser(null);
        setAlertData({ message: '❌ Пользователь с таким ID не найден' });
      });
  };

  const handleToggleBan = (isBanned) => {
    if (isBanned && !banDays) {
      setAlertData({ message: '❌ Укажите количество дней блокировки' });
      return;
    }

    fetch(`${API_URL}/api/admin/users/${foundUser.id}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned, banReason: banReasonInput, banScope, banDays })
    })
    .then(res => res.json())
    .then(updatedUser => {
      setFoundUser(prev => ({ 
        ...prev, 
        isBanned: updatedUser.isBanned, 
        banReason: updatedUser.banReason,
        banScope: updatedUser.banScope,
        banUntil: updatedUser.banUntil
      }));
      setAlertData({ message: isBanned ? '🚫 Пользователь успешно ограничен' : '✅ Пользователь полностью разблокирован' });
    })
    .catch(() => setAlertData({ message: '❌ Ошибка при изменении статуса пользователя' }));
  };

  if (adminScreen === 'dashboard') {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        <div className="screen-header" style={{ background: 'transparent', margin: 0, padding: '16px 0', borderBottom: 'none' }}>
          <button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button>
          <h2 className="screen-title" style={{ fontSize: '18px' }}>Панель модератора</h2>
        </div>
        <div className="admin-stats-grid">
          <div className="admin-stat-card"><h2>📦</h2><span>Модерация лотов</span></div>
          <div className="admin-stat-card"><h2 style={{ color: '#c62828' }}>🎧</h2><span>Тикеты</span></div>
        </div>
        <div className="admin-simple-list">
          <div className="admin-simple-item" onClick={() => setAdminScreen('users')}>
            <span className="admin-simple-icon">🛡️</span><span className="admin-simple-text">Пользователи (Бан)</span><span className="admin-simple-arrow">{'>'}</span>
          </div>
          <div className="admin-simple-item" onClick={loadTickets}>
            <span className="admin-simple-icon">💬</span><span className="admin-simple-text">Обращения</span><span className="admin-simple-arrow">{'>'}</span>
          </div>
          <div className="admin-simple-item" onClick={loadAdminReviews}>
            <span className="admin-simple-icon">⭐</span><span className="admin-simple-text">Модерация отзывов</span><span className="admin-simple-arrow">{'>'}</span>
          </div>
          <div className="admin-simple-item" onClick={loadAdminLots}>
            <span className="admin-simple-icon">📦</span><span className="admin-simple-text">Модерация лотов</span><span className="admin-simple-arrow">{'>'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (adminScreen === 'users') {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
        <div className="screen-header" style={{ background: '#fff', margin: '-16px -16px 16px -16px', padding: '16px' }}>
          <button className="back-btn" onClick={() => { setAdminScreen('dashboard'); setFoundUser(null); setSearchUserId(''); }}>{'<'}</button>
          <h2 className="screen-title">Управление пользователями</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Введите ID пользователя..." 
            className="input-field" 
            style={{ marginBottom: 0 }}
            value={searchUserId} 
            onChange={(e) => setSearchUserId(e.target.value)} 
          />
          <button className="submit-btn" style={{ margin: 0, width: 'auto', padding: '0 20px' }} onClick={handleSearchUser}>Поиск</button>
        </div>

        {foundUser && (
          <div className="admin-card" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
              {foundUser.firstName || 'Без имени'} (ID: {foundUser.id})
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>Рейтинг: {foundUser.rating.toFixed(1)} ⭐</p>

            <div style={{ background: foundUser.isBanned ? '#ffebee' : '#e8f5e9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <span style={{ fontWeight: 'bold', color: foundUser.isBanned ? '#c62828' : '#2e7d32' }}>
                Статус: {foundUser.isBanned ? '🚫 Активны ограничения' : '✅ Чист (без банов)'}
              </span>
              {foundUser.isBanned && foundUser.banUntil && (
                <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
                  Действует до: {new Date(foundUser.banUntil).toLocaleDateString('ru-RU')}
                </div>
              )}
            </div>

            {foundUser.isBanned ? (
              <button 
                style={{ background: '#2e7d32', color: '#fff', padding: '14px', borderRadius: '8px', width: '100%', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                onClick={() => handleToggleBan(false)}
              >
                Разблокировать пользователя
              </button>
            ) : (
              <>
                <select className="input-field" value={banScope} onChange={e => setBanScope(e.target.value)}>
                  <option value="ALL">Полная блокировка (Всё)</option>
                  <option value="BIDS">Запрет только на ставки</option>
                  <option value="LOTS">Запрет только на публикацию лотов</option>
                </select>

                <input 
                  type="number" 
                  placeholder="Количество дней блокировки" 
                  className="input-field" 
                  value={banDays}
                  onChange={(e) => setBanDays(e.target.value)}
                />

                <input 
                  type="text" 
                  placeholder="Причина (для пользователя)" 
                  className="input-field" 
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                />

                <button 
                  style={{ background: '#c62828', color: '#fff', padding: '14px', borderRadius: '8px', width: '100%', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '8px' }}
                  onClick={() => handleToggleBan(true)}
                >
                  Применить ограничения
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (adminScreen === 'lots') {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
        <div className="screen-header" style={{ background: '#fff', margin: '-16px -16px 16px -16px', padding: '16px' }}>
          <button className="back-btn" onClick={() => setAdminScreen('dashboard')}>{'<'}</button>
          <h2 className="screen-title">Модерация лотов</h2>
        </div>
        <div className="profile-tabs" style={{ marginBottom: '16px' }}>
          <button className={`tab-btn ${adminActiveTab === 'check' ? 'active' : ''}`} onClick={() => setAdminActiveTab('check')}>На проверке</button>
          <button className={`tab-btn ${adminActiveTab === 'active' ? 'active' : ''}`} onClick={() => setAdminActiveTab('active')}>Активные</button>
        </div>
        {adminActiveTab === 'check' && adminLotsList.filter(l => l.status === 'MODERATION').map(lot => (
          <div key={lot.id} className="admin-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="badge" style={{ background: '#f5f5f5', color: '#666' }}>ID: {lot.id}</span>
              <span className="badge" style={{ background: '#e3f2fd', color: '#1976d2' }}>🏷 {lot.category || 'Без категории'}</span>
              <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32' }}>📍 {lot.location}</span>
            </div>
            
            <h3 style={{ margin: '8px 0', fontSize: '18px' }}>{lot.title}</h3>
            
            <div style={{ background: '#fff8e1', padding: '10px', borderRadius: '6px', marginBottom: '8px', fontSize: '13px' }}>
              <div style={{ marginBottom: '4px' }}><strong>Старт:</strong> {lot.startPrice?.toLocaleString('ru-RU')} ₽</div>
              <div><strong>Цена выкупа:</strong> {lot.buyNowPrice ? <span style={{ color: '#f57f17', fontWeight: 'bold' }}>{lot.buyNowPrice.toLocaleString('ru-RU')} ₽</span> : 'Не указана'}</div>
            </div>

            <p style={{ fontSize: '13px', color: '#666' }}>{lot.description}</p>
            
            {lot.photos && lot.photos.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '12px', paddingBottom: '8px' }}>
                {lot.photos.map((photoUrl, idx) => (
                  <img key={idx} src={photoUrl} alt="Lot" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ))}
              </div>
            )}

            <div className="admin-card-actions" style={{marginTop: '12px'}}>
              <button className="btn-approve" onClick={() => handleUpdateLotStatus(lot.id, 'ACTIVE')}>☑ Одобрить</button>
              <button className="btn-reject-square" onClick={() => { setSelectedLot(lot); setRejectComment(''); setAdminModal('rejectLot'); }}>✖</button>
            </div>
          </div>
        ))}
        {adminActiveTab === 'active' && adminLotsList.filter(l => l.status === 'ACTIVE').map(lot => (
          <div key={lot.id} className="admin-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Текущая: {lot.currentPrice.toLocaleString('ru-RU')} ₽</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '18px' }}>{lot.title}</h3>
            <button className="btn-reject" style={{ width: '100%', padding: '14px', marginTop: '12px' }} onClick={() => handleUpdateLotStatus(lot.id, 'COMPLETED')}>🛑 Завершить досрочно</button>
          </div>
        ))}
        {adminModal === 'rejectLot' && (
          <div className="modal-overlay" onClick={() => setAdminModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Отклонение публикации</h3>
              <textarea className="modal-textarea" value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} placeholder="Комментарий для продавца..."></textarea>
              <div className="modal-actions" style={{marginTop: '20px'}}>
                <button className="modal-btn cancel" onClick={() => setAdminModal(null)}>Отмена</button>
                <button className="modal-btn primary" onClick={() => handleUpdateLotStatus(selectedLot.id, 'REJECTED', rejectComment)}>Отправить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (adminScreen === 'reviews') {
    const filteredReviews = adminReviewsList.filter(r => r.status === adminReviewsTab);
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
        <div className="screen-header" style={{ background: '#fff', margin: '-16px -16px 16px -16px', padding: '16px' }}>
          <button className="back-btn" onClick={() => setAdminScreen('dashboard')}>{'<'}</button>
          <h2 className="screen-title">Модерация отзывов</h2>
        </div>
        <div className="profile-tabs" style={{ marginBottom: '16px' }}>
          <button className={`tab-btn ${adminReviewsTab === 'MODERATION' ? 'active' : ''}`} onClick={() => setAdminReviewsTab('MODERATION')}>На проверке</button>
          <button className={`tab-btn ${adminReviewsTab === 'ACTIVE' ? 'active' : ''}`} onClick={() => setAdminReviewsTab('ACTIVE')}>Опубликованные</button>
        </div>
        {filteredReviews.length === 0 ? (<p style={{ textAlign: 'center', color: '#888' }}>Пусто 🎉</p>) : filteredReviews.map(rev => (
          <div key={rev.id} className="admin-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div className="admin-card-header">
              <span style={{ fontSize: '12px', color: '#666' }}>ID автора: {rev.authorId}</span>
              <span style={{ color: '#ffcc00', letterSpacing: '2px', fontSize: '14px' }}>{'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}</span>
            </div>
            <p style={{ fontSize: '14px', margin: '8px 0' }}>{rev.text}</p>
            <div className="admin-card-actions">
              {adminReviewsTab === 'MODERATION' ? (
                <><button className="btn-approve" onClick={() => approveReview(rev.id)}>☑ Одобрить</button><button className="btn-reject" onClick={() => rejectReview(rev.id)}>🗑 Отклонить</button></>
              ) : (<button className="btn-reject" style={{ width: '100%' }} onClick={() => deleteReview(rev.id)}>🔥 Удалить навсегда</button>)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (adminScreen === 'feedback') {
    if (activeChat) {
      const activeTicket = adminTickets.find((t) => t.id === activeChat);
      return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
          <div className="chat-wrapper" style={{ background: '#fff', borderRadius: '0', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="chat-header">
              <button className="back-btn" onClick={() => setActiveChat(null)}>{'<'}</button>
              <div className="chat-header-info">
                <h2 className="chat-header-title">{activeTicket?.topic}</h2>
                <p className="chat-header-subtitle">Пользователь: {activeTicket?.authorId}</p>
              </div>
            </div>
            <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.authorId === currentUser.id ? 'message-out' : 'message-in'}`}>
                  {msg.text}
                  <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              ))}
            </div>
            <div className="chat-input-area" style={{ padding: '16px', background: '#f5f5f5' }}>
              <input type="text" className="chat-input" placeholder="Ответ от поддержки..." value={newMessageText} onChange={e => setNewMessageText(e.target.value)} />
              <button className="chat-send-btn" onClick={sendMessage}>➤</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
        <div className="screen-header" style={{ background: '#fff', margin: '-16px -16px 16px -16px', padding: '16px' }}>
          <button className="back-btn" onClick={() => setAdminScreen('dashboard')}>{'<'}</button>
          <h2 className="screen-title">Обращения</h2>
        </div>
        <div className="ticket-list">
          {adminTickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card" onClick={() => setActiveChat(ticket.id)} style={{ background: '#fff', border: '1px solid #eee', marginBottom: '12px', borderRadius: '12px', padding: '16px', cursor: 'pointer' }}>
              <div className="ticket-info">
                <h4 className="ticket-title" style={{ margin: '0 0 6px 0', fontSize: '15px' }}>{ticket.topic}</h4>
                <p className="ticket-preview" style={{ margin: 0, fontSize: '13px', color: '#666' }}>ID {ticket.authorId}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default Admin;