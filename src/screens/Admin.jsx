import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
function Admin({ setCurrentScreen, currentUser, setAlertData, setConfirmData }) {
const [adminScreen, setAdminScreen] = useState('dashboard');
// Состояния для дашборда и баннера
const [adminStats, setAdminStats] = useState(null);
const [globalBanner, setGlobalBanner] = useState({ isBannerOn: false, bannerText: '', bannerLink: '' });
const [adminLotsList, setAdminLotsList] = useState([]);
const [adminActiveTab, setAdminActiveTab] = useState('check'); // check | active | archive
const [adminReviewsList, setAdminReviewsList] = useState([]);
const [adminReviewsTab, setAdminReviewsTab] = useState('MODERATION');
// Состояния для чатов
const [adminTickets, setAdminTickets] = useState([]);
const [activeChat, setActiveChat] = useState(null);
const [chatMessages, setChatMessages] = useState([]);
const [newMessageText, setNewMessageText] = useState('');
const [adminSelectedPhoto, setAdminSelectedPhoto] = useState(null);
const [adminModal, setAdminModal] = useState(null);
const [isRejectMode, setIsRejectMode] = useState(false);
const [rejectReasonText, setRejectReasonText] = useState('');
const [selectedLot, setSelectedLot] = useState(null);
const [selectedReview, setSelectedReview] = useState(null);
const [rejectComment, setRejectComment] = useState('');
const [searchUserId, setSearchUserId] = useState('');
const [foundUser, setFoundUser] = useState(null);
const [banReasonInput, setBanReasonInput] = useState('');
const [banScope, setBanScope] = useState('ALL');
const [banDays, setBanDays] = useState('');
// Загрузка статистики и настроек при открытии админки
useEffect(() => {
if (adminScreen === 'dashboard') {
fetch(`${API_URL}/api/admin/stats`).then(res => res.json()).then(data => setAdminStats(data)).catch(console.error);
fetch(`${API_URL}/api/settings`).then(res => res.json()).then(data => setGlobalBanner(data)).catch(console.error);
}
}, [adminScreen]);
const saveBannerSettings = () => {
fetch(`${API_URL}/api/settings`, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(globalBanner)
})
.then(() => setAlertData({ message: '✅ Настройки баннера сохранены!' }))
.catch(() => setAlertData({ message: '❌ Ошибка сохранения' }));
};
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
.catch(err => setAlertData({ message: '❌ Ошибка связи с сервером.' }));
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
.catch(err => setAlertData({ message: '❌ Ошибка связи с сервером.' }));
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
.catch(err => setAlertData({ message: '❌ Ошибка связи с сервером.' }));
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
const rejectReviewWithReason = () => {
if (!rejectComment.trim()) return setAlertData({ message: 'Укажите причину!' });
fetch(`${API_URL}/api/reviews/${selectedReview.id}/status`, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ status: 'REJECTED', rejectReason: rejectComment })
}).then(() => {
setAlertData({ message: '🗑 Отзыв отклонен.' });
setAdminModal(null);
setAdminReviewsList(adminReviewsList.filter(r => r.id !== selectedReview.id));
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
   setAlertData({ message: isBanned ? '🚫 Пользователь ограничен' : '✅ Разблокирован' });
 })
 .catch(() => setAlertData({ message: '❌ Ошибка' }));
};
if (adminScreen === 'dashboard') {
return (
<div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
    {/* Дашборд со статистикой */}
     {adminStats && (
       <div style={{ marginBottom: '20px' }}>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
           <div className="admin-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
             <h2 style={{ margin: '0', color: '#1976d2', fontSize: '24px' }}>{adminStats.usersCount}</h2>
             <span style={{ fontSize: '12px', color: '#666' }}>Пользователей</span>
           </div>
           <div className="admin-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
             <h2 style={{ margin: '0', color: '#fbc02d', fontSize: '24px' }}>{adminStats.activeLotsCount}</h2>
             <span style={{ fontSize: '12px', color: '#666' }}>Активных лотов</span>
           </div>
         </div>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
           <div className="admin-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
             <h2 style={{ margin: '0', color: '#2e7d32', fontSize: '24px' }}>{adminStats.dealsCount}</h2>
             <span style={{ fontSize: '12px', color: '#666' }}>Сделок завершено</span>
           </div>
           <div className="admin-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
             <h2 style={{ margin: '0', color: '#6a1b9a', fontSize: '20px' }}>{adminStats.totalTurnover?.toLocaleString('ru-RU')} ₽</h2>
             <span style={{ fontSize: '12px', color: '#666' }}>Общий оборот</span>
           </div>
         </div>
       </div>
     )}
     {/* Настройки глобального баннера */}
     <div style={{ marginBottom: '20px' }}>
       <div style={{ background: '#fff', padding: '16px', borderRadius: '12px' }}>
         <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>📢 Глобальное объявление</h3>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
           <input 
             type="checkbox" 
             checked={globalBanner.isBannerOn} 
             onChange={(e) => setGlobalBanner({...globalBanner, isBannerOn: e.target.checked})} 
             style={{ width: '20px', height: '20px' }}
           />
           <span style={{ fontSize: '14px' }}>Включить отображение для всех</span>
         </div>
         <input 
           type="text" 
           className="input-field" 
           style={{ marginBottom: '8px' }}
           placeholder="Текст баннера (напр. Техработы в 10:00)" 
           value={globalBanner.bannerText || ''} 
           onChange={(e) => setGlobalBanner({...globalBanner, bannerText: e.target.value})} 
         />
         <input 
           type="text" 
           className="input-field" 
           style={{ marginBottom: '12px' }}
           placeholder="Ссылка для перехода (необязательно)" 
           value={globalBanner.bannerLink || ''} 
           onChange={(e) => setGlobalBanner({...globalBanner, bannerLink: e.target.value})} 
         />
         <button className="submit-btn" style={{ margin: 0, padding: '10px' }} onClick={saveBannerSettings}>Сохранить настройки</button>
       </div>
     </div>
     <div className="admin-simple-list">
       <div className="admin-simple-item" onClick={() => setAdminScreen('users')}>
         <span className="admin-simple-icon">🛡️</span><span className="admin-simple-text">Пользователи (Бан)</span><span className="admin-simple-arrow">{'>'}</span>
       </div>
       <div className="admin-simple-item" onClick={loadTickets}>
         <span className="admin-simple-icon">💬</span><span className="admin-simple-text">Обращения</span>
         {adminStats?.ticketsCount > 0 && <span style={{background: '#c62828', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginLeft: 'auto', marginRight: '8px'}}>{adminStats.ticketsCount}</span>}
         <span className="admin-simple-arrow">{'>'}</span>
       </div>
       <div className="admin-simple-item" onClick={loadAdminReviews}>
         <span className="admin-simple-icon">⭐</span><span className="admin-simple-text">Модерация отзывов</span><span className="admin-simple-arrow">{'>'}</span>
       </div>
       <div className="admin-simple-item" onClick={loadAdminLots}>
         <span className="admin-simple-icon">📦</span><span className="admin-simple-text">Модерация лотов</span>
         {adminStats?.moderationLotsCount > 0 && <span style={{background: '#fbc02d', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginLeft: 'auto', marginRight: '8px'}}>{adminStats.moderationLotsCount}</span>}
         <span className="admin-simple-arrow">{'>'}</span>
       </div>
     </div>
   </div>
 );
}
if (adminScreen === 'users') {
return (
<div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
<button onClick={() => { setAdminScreen('dashboard'); setFoundUser(null); setSearchUserId(''); }} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>← Назад в меню</button>
    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
       <input 
         type="text" placeholder="Введите ID пользователя..." className="input-field" 
         style={{ marginBottom: 0 }} value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} 
       />
       <button className="submit-btn" style={{ margin: 0, width: 'auto', padding: '0 20px' }} onClick={handleSearchUser}>Поиск</button>
     </div>
     {foundUser && (
       <div className="admin-card" style={{ padding: '20px' }}>
         <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{foundUser.firstName || 'Без имени'} (ID: {foundUser.id})</h3>
         <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>Рейтинг: {foundUser.rating.toFixed(1)} ⭐</p>
         <div style={{ background: foundUser.isBanned ? '#ffebee' : '#e8f5e9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
           <span style={{ fontWeight: 'bold', color: foundUser.isBanned ? '#c62828' : '#2e7d32' }}>
             Статус: {foundUser.isBanned ? '🚫 Активны ограничения' : '✅ Чист (без банов)'}
           </span>
           {foundUser.isBanned && foundUser.banUntil && (
             <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>Действует до: {new Date(foundUser.banUntil).toLocaleDateString('ru-RU')}</div>
           )}
         </div>
         {foundUser.isBanned ? (
           <button style={{ background: '#2e7d32', color: '#fff', padding: '14px', borderRadius: '8px', width: '100%', fontWeight: 'bold', border: 'none', cursor: 'pointer' }} onClick={() => handleToggleBan(false)}>Разблокировать пользователя</button>
         ) : (
           <>
             <select className="input-field" value={banScope} onChange={e => setBanScope(e.target.value)}>
               <option value="ALL">Полная блокировка (Всё)</option>
               <option value="BIDS">Запрет только на ставки</option>
               <option value="LOTS">Запрет только на публикацию лотов</option>
             </select>
             <input type="number" placeholder="Количество дней блокировки" className="input-field" value={banDays} onChange={(e) => setBanDays(e.target.value)} />
             <input type="text" placeholder="Причина (для пользователя)" className="input-field" value={banReasonInput} onChange={(e) => setBanReasonInput(e.target.value)} />
             <button style={{ background: '#c62828', color: '#fff', padding: '14px', borderRadius: '8px', width: '100%', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '8px' }} onClick={() => handleToggleBan(true)}>Применить ограничения</button>
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
<button onClick={() => setAdminScreen('dashboard')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>← Назад в меню</button>
    <div className="profile-tabs" style={{ marginBottom: '16px', gap: '4px' }}>
       <button className={`tab-btn ${adminActiveTab === 'check' ? 'active' : ''}`} onClick={() => setAdminActiveTab('check')} style={{flex: 1, padding: '8px'}}>На проверке</button>
       <button className={`tab-btn ${adminActiveTab === 'active' ? 'active' : ''}`} onClick={() => setAdminActiveTab('active')} style={{flex: 1, padding: '8px'}}>Активные</button>
       <button className={`tab-btn ${adminActiveTab === 'archive' ? 'active' : ''}`} onClick={() => setAdminActiveTab('archive')} style={{flex: 1, padding: '8px'}}>Архив</button>
     </div>
     {adminActiveTab === 'check' && adminLotsList.filter(l => l.status === 'MODERATION').map(lot => (
       <div key={lot.id} className="admin-card" style={{ padding: '16px', marginBottom: '16px' }}>
         <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
           <span className="badge" style={{ background: '#f5f5f5', color: '#666' }}>ID: {lot.id}</span>
           <span className="badge" style={{ background: '#e3f2fd', color: '#1976d2' }}>🏷 {lot.category || 'Без категории'}</span>
         </div>
         <h3 style={{ margin: '8px 0', fontSize: '18px' }}>{lot.title}</h3>
         <p style={{ fontSize: '13px', color: '#666' }}>{lot.description}</p>
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
     {adminActiveTab === 'archive' && adminLotsList.filter(l => l.status === 'COMPLETED' || l.status === 'REJECTED').map(lot => (
       <div key={lot.id} className="admin-card" style={{ padding: '16px', marginBottom: '16px', opacity: 0.8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontWeight: 'bold', fontSize: '14px', color: lot.status === 'COMPLETED' ? '#2e7d32' : '#c62828' }}>
                 {lot.status === 'COMPLETED' ? '✅ Завершен' : '❌ Отклонен'}
             </span>
             <span style={{ fontSize: '12px', color: '#888' }}>ID: {lot.id}</span>
          </div>
         <h3 style={{ margin: '8px 0 4px 0', fontSize: '16px' }}>{lot.title}</h3>
         <p style={{ fontSize: '12px', margin: 0, color: '#666' }}>Продавец: {lot.sellerId}</p>
         {lot.status === 'REJECTED' && lot.rejectReason && (
             <p style={{ fontSize: '12px', color: '#c62828', background: '#ffebee', padding: '6px', borderRadius: '4px', marginTop: '8px' }}>Причина: {lot.rejectReason}</p>
         )}
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
<button onClick={() => setAdminScreen('dashboard')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>← Назад в меню</button>
    <div className="profile-tabs" style={{ marginBottom: '16px' }}>
       <button className={`tab-btn ${adminReviewsTab === 'MODERATION' ? 'active' : ''}`} onClick={() => setAdminReviewsTab('MODERATION')}>На проверке</button>
       <button className={`tab-btn ${adminReviewsTab === 'ACTIVE' ? 'active' : ''}`} onClick={() => setAdminReviewsTab('ACTIVE')}>Опубликованные</button>
     </div>
     {filteredReviews.length === 0 ? (<p style={{ textAlign: 'center', color: '#888' }}>Пусто 🎉</p>) : filteredReviews.map(rev => (
       <div key={rev.id} className="admin-card" style={{ padding: '16px', marginBottom: '16px' }}>
         <div className="admin-card-header">
           <span style={{ fontSize: '12px', color: '#666' }}>Автор: {rev.authorId}</span>
           <span style={{ color: '#ffcc00', letterSpacing: '2px', fontSize: '14px' }}>{'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}</span>
         </div>
         <p style={{ fontSize: '14px', margin: '8px 0' }}>{rev.text}</p>
         <div className="admin-card-actions">
           {adminReviewsTab === 'MODERATION' ? (
             <>
               <button className="btn-approve" onClick={() => approveReview(rev.id)}>☑ Одобрить</button>
               <button className="btn-reject" onClick={() => { setSelectedReview(rev); setRejectComment(''); setAdminModal('rejectReview'); }}>🗑 Отклонить</button>
             </>
           ) : (<button className="btn-reject" style={{ width: '100%' }} onClick={() => deleteReview(rev.id)}>🔥 Удалить навсегда</button>)}
         </div>
       </div>
     ))}
     {adminModal === 'rejectReview' && (
       <div className="modal-overlay" onClick={() => setAdminModal(null)}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           <h3 className="modal-title">Отклонение отзыва</h3>
           <textarea className="modal-textarea" value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} placeholder="Причина отклонения (увидит автор)..."></textarea>
           <div className="modal-actions" style={{marginTop: '20px'}}>
             <button className="modal-btn cancel" onClick={() => setAdminModal(null)}>Отмена</button>
             <button className="modal-btn primary" onClick={rejectReviewWithReason}>Отправить</button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}
if (adminScreen === 'feedback') {
const handleFileChange = (e) => {
const file = e.target.files[0];
if (file) {
const reader = new FileReader();
reader.onloadend = () => setAdminSelectedPhoto(reader.result);
reader.readAsDataURL(file);
}
};
const sendMessageWithPhoto = () => {
   if (!newMessageText.trim() && !adminSelectedPhoto) return;
   fetch(`${API_URL}/api/tickets/${activeChat}/messages`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ authorId: currentUser.id, text: newMessageText, photo: adminSelectedPhoto })
   }).then(() => {
     setNewMessageText('');
     setAdminSelectedPhoto(null);
     loadMessages(activeChat);
   });
 };
 if (activeChat) {
   const activeTicket = adminTickets.find((t) => t.id === activeChat);
   return (
     <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
       <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #eee' }}>
          <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>← К списку обращений</button>
       </div>
       <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
         {chatMessages.map(msg => {
           const isMe = msg.authorId === currentUser.id;
           return (
             <div key={msg.id} style={{ 
                 alignSelf: isMe ? 'flex-end' : 'flex-start',
                 background: isMe ? '#e3f2fd' : '#fff', 
                 padding: '10px 14px', borderRadius: '16px', 
                 borderBottomRightRadius: isMe ? '4px' : '16px',
                 borderBottomLeftRadius: !isMe ? '4px' : '16px',
                 border: '1px solid #eee', maxWidth: '85%', marginBottom: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
               {msg.photo && <img src={`${API_URL}/api/photos/${msg.photo}`} alt="attachment" style={{ width: '100%', borderRadius: '8px', marginBottom: '4px', objectFit: 'cover' }} />}
               {msg.text && <p style={{ margin: 0, fontSize: '14px', wordBreak: 'break-word', color: '#111' }}>{msg.text}</p>}
               <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                 {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
             </div>
           );
         })}
       </div>
       <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#fff', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
         {adminSelectedPhoto && (
           <div style={{ padding: '8px 16px', position: 'relative', borderBottom: '1px solid #eee' }}>
             <img src={adminSelectedPhoto} alt="preview" style={{ height: '60px', borderRadius: '8px' }} />
             <button onClick={() => setAdminSelectedPhoto(null)} style={{ position: 'absolute', top: '4px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px' }}>×</button>
           </div>
         )}
         <div style={{ display: 'flex', padding: '12px 16px', gap: '8px', alignItems: 'center' }}>
           <input type="file" id="admin-chat-file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
           <label htmlFor="admin-chat-file" style={{ fontSize: '24px', cursor: 'pointer', margin: 0, color: '#888' }}>📎</label>
           <input type="text" placeholder="Ответ..." value={newMessageText} onChange={e => setNewMessageText(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessageWithPhoto()} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ccc', outline: 'none', fontSize: '16px' }} />
           <button onClick={sendMessageWithPhoto} style={{ background: '#fbc02d', color: '#000', border: 'none', borderRadius: '12px', padding: '0 16px', fontWeight: 'bold', cursor: 'pointer', height: '44px' }}>➤</button>
         </div>
       </div>
     </div>
   );
 }
 return (
   <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
     <button onClick={() => setAdminScreen('dashboard')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>← В меню модератора</button>
     <div className="ticket-list">
       {adminTickets.map((ticket) => (
         <div key={ticket.id} className="ticket-card" onClick={() => setActiveChat(ticket.id)} style={{ background: '#fff', border: '1px solid #eee', marginBottom: '12px', borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <h4 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>{ticket.topic}</h4>
             <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>От: {ticket.authorId}</p>
           </div>
           <span style={{color: '#ccc', fontSize: '20px'}}>{'>'}</span>
         </div>
       ))}
     </div>
   </div>
 );
}
// --- РЕНДЕРИНГ МОДАЛЬНЫХ ОКОН С УЛУЧШЕННЫМ ОТКЛОНЕНИЕМ ---
const renderAdminModal = () => {
  if (!adminModal) return null;
  const { type, data } = adminModal;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
        
        {type === 'lotDetail' && (
          <div>
            {/* Режим ввода причины отклонения лота */}
            {isRejectMode ? (
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#c62828', fontSize: '18px' }}>🚫 Отклонение лота #{data.id}</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px' }}>Укажите причину. Она мгновенно отобразится у пользователя в приложении и прилетит уведомлением в бот.</p>
                
                <textarea 
                  value={rejectReasonText}
                  onChange={(e) => setRejectReasonText(e.target.value)}
                  placeholder="Например: Некачественные фотографии, товар не соответствует категории или некорректное описание..."
                  rows={4}
                  style={{ width: '100%', border: '1px solid #ddd', borderRadius: '10px', padding: '10px', boxSizing: 'border-box', outline: 'none', resize: 'none', marginBottom: '16px', fontFamily: 'inherit', fontSize: '13px' }}
                />
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      if (!rejectReasonText.trim()) return alert('Пожалуйста, введите причину отклонения!');
                      handleUpdateLotStatus(data.id, 'REJECTED', rejectReasonText);
                      setIsRejectMode(false);
                      setRejectReasonText('');
                    }} 
                    style={{ flex: 1, height: '40px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Подтвердить
                  </button>
                  <button 
                    onClick={() => { setIsRejectMode(false); setRejectReasonText(''); }} 
                    style={{ width: '90px', height: '40px', background: '#eee', color: '#333', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Назад
                  </button>
                </div>
              </div>
            ) : (
              /* Обычный детальный просмотр лота модератором */
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Лот #{data.id}</h3>
                <p style={{ margin: '6px 0', fontSize: '14px' }}><b>Название:</b> {data.title}</p>
                <p style={{ margin: '6px 0', fontSize: '14px' }}><b>Описание:</b> {data.description}</p>
                <p style={{ margin: '6px 0', fontSize: '14px' }}><b>Категория:</b> {data.category}</p>
                <p style={{ margin: '6px 0', fontSize: '14px' }}><b>Город:</b> {data.location}</p>
                <p style={{ margin: '6px 0', fontSize: '14px' }}><b>Стартовая:</b> {data.startPrice} ₽</p>
                <p style={{ margin: '6px 0', fontSize: '14px' }}><b>Выкуп:</b> {data.buyNowPrice || 'Нет'}</p>
                
                {data.status === 'MODERATION' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <button onClick={() => handleUpdateLotStatus(data.id, 'ACTIVE')} style={{ flex: 1, height: '40px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Одобрить</button>
                    <button onClick={() => setIsRejectMode(true)} style={{ flex: 1, height: '40px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Отклонить</button>
                  </div>
                )}
                
                <button onClick={() => { setAdminModal(null); setIsRejectMode(false); setRejectReasonText(''); }} style={{ width: '100%', height: '38px', background: '#eee', border: 'none', borderRadius: '8px', marginTop: '16px', fontWeight: '600', cursor: 'pointer', color: '#333' }}>Закрыть окно</button>
              </div>
            )}
          </div>
        )}

        {type === 'reviewDetail' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0' }}>Отзыв #{data.id}</h3>
            <p><b>Рейтинг:</b> {'★'.repeat(data.rating)}</p>
            <p><b>Текст:</b> {data.text}</p>
            
            {data.status === 'MODERATION' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button onClick={() => handleUpdateReviewStatus(data.id, 'ACTIVE')} style={{ flex: 1, height: '40px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Одобрить</button>
                <button onClick={() => {
                  const r = prompt('Причина отклонения отзыва:');
                  if(r) handleUpdateReviewStatus(data.id, 'REJECTED', r);
                }} style={{ flex: 1, height: '40px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Отклонить</button>
              </div>
            )}
            <button onClick={() => setAdminModal(null)} style={{ width: '100%', height: '36px', background: '#eee', border: 'none', borderRadius: '8px', marginTop: '16px', fontWeight: '600', cursor: 'pointer' }}>Закрыть окно</button>
          </div>
        )}

      </div>
    </div>
  );
};
return null;
}
export default Admin;