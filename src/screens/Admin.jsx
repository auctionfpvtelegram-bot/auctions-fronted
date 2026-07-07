import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
// 📦 Импортируем дочерние экраны админки из подпапки src/screens/admin/
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminLots } from './admin/AdminLots';
import { AdminReviews } from './admin/AdminReviews';
import { AdminTickets } from './admin/AdminTickets';
import { AdminUsers } from './admin/AdminUsers';
import { AdminProfiles } from './admin/AdminProfiles';

function Admin({ setCurrentScreen, currentUser, setAlertData, setConfirmData }) {
  const [adminScreen, setAdminScreen] = useState('dashboard');
  
  // Состояния для дашборда, настроек и списков
  const [adminStats, setAdminStats] = useState(null);
  const [globalBanner, setGlobalBanner] = useState({ 
    isBannerOn: false, bannerText: '', bannerLink: '', isChannelOn: true, isGroupOn: true 
  });
  const [adminLotsList, setAdminLotsList] = useState([]);
  const [adminActiveTab, setAdminActiveTab] = useState('check'); // check | active | archive
  const [adminReviewsList, setAdminReviewsList] = useState([]);
  const [adminReviewsTab, setAdminReviewsTab] = useState('MODERATION');
  
  // Состояния для техподдержки
  const [adminTickets, setAdminTickets] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [adminSelectedPhoto, setAdminSelectedPhoto] = useState(null);
  const [adminModal, setAdminModal] = useState(null);
  
  // ⚡ НОВЫЕ СТЕЙТЫ ДЛЯ КРАСИВОГО ОТКЛОНЕНИЯ
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReasonText, setRejectReasonText] = useState('');

  // --- ЭФФЕКТЫ ЗАГРУЗКИ ДАННЫХ ---
  useEffect(() => {
    // 1. Статистика
    fetch(`${API_URL}/api/admin/stats`)
      .then(res => res.json())
      .then(data => setAdminStats(data))
      .catch(err => console.error(err));

    // 2. Системные настройки
    fetch(`${API_URL}/api/system-settings`)
      .then(res => res.json())
      .then(data => setGlobalBanner(data))
      .catch(err => console.error(err));

    // 3. Лоты
    fetch(`${API_URL}/api/admin/lots`)
      .then(res => res.json())
      .then(data => setAdminLotsList(data))
      .catch(err => console.error(err));

    // 4. Отзывы
    fetch(`${API_URL}/api/admin/reviews`)
      .then(res => res.json())
      .then(data => setAdminReviewsList(data))
      .catch(err => console.error(err));

    // 5. Обращения (Тикеты)
    fetch(`${API_URL}/api/admin/tickets`)
      .then(res => res.json())
      .then(data => setAdminTickets(data))
      .catch(err => console.error(err));
  }, [adminScreen]);

  // Загрузка чата при открытии обращения
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
      const interval = setInterval(() => loadMessages(activeChat), 4000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const loadMessages = (ticketId) => {
    fetch(`${API_URL}/api/tickets/${ticketId}/messages`)
      .then(res => res.json())
      .then(data => setChatMessages(Array.isArray(data) ? data : []))
      .catch(() => setChatMessages([]));
  };

  // --- ХЕНДЛЕРЫ ДЕЙСТВИЙ ---
  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setAdminSelectedPhoto(event.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const sendMessageWithPhoto = () => {
    if (!newMessageText.trim() && !adminSelectedPhoto) return;
    fetch(`${API_URL}/api/tickets/${activeChat}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: newMessageText,
        authorId: currentUser.id,
        photo: adminSelectedPhoto || null
      })
    })
      .then(res => res.json())
      .then(() => {
        setNewMessageText('');
        setAdminSelectedPhoto(null);
        loadMessages(activeChat);
      })
      .catch(err => console.error(err));
  };

  const handleUpdateLotStatus = (lotId, status, reason = '') => {
    fetch(`${API_URL}/api/lots/${lotId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectReason: reason })
    })
      .then(res => res.json())
      .then(() => {
        setAdminModal(null);
        setIsRejectMode(false);
        setRejectReasonText('');
        setAdminLotsList(prev => prev.map(l => l.id === lotId ? { ...l, status, rejectReason: reason } : l));
        setAlertData({ message: status === 'ACTIVE' ? '✅ Лот одобрен' : '❌ Лот отклонен' });
      })
      .catch(err => console.error(err));
  };

  const handleUpdateReviewStatus = (revId, status, reason = '') => {
    fetch(`${API_URL}/api/reviews/${revId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectReason: reason })
    })
      .then(res => res.json())
      .then(() => {
        setAdminModal(null);
        setAdminReviewsList(prev => prev.map(r => r.id === revId ? { ...r, status, rejectReason: reason } : r));
        setAlertData({ message: status === 'ACTIVE' ? '✅ Отзыв одобрен' : '❌ Отзыв отклонен' });
      })
      .catch(err => console.error(err));
  };

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

  // --- МАППИНГ ЭКРАНОВ ---
  return (
    <div className="admin-root-container" style={{ maxWidth: '600px', margin: '0 auto', background: '#fff' }}>
      {adminScreen === 'dashboard' && (
        <AdminDashboard 
          adminStats={adminStats} globalBanner={globalBanner} setGlobalBanner={setGlobalBanner}
          setAdminScreen={setAdminScreen} API_URL={API_URL} setAlertData={setAlertData} 
        />
      )}
      {adminScreen === 'lots' && (
        <AdminLots 
          adminLotsList={adminLotsList} adminActiveTab={adminActiveTab} 
          setAdminActiveTab={setAdminActiveTab} setAdminScreen={setAdminScreen} setAdminModal={setAdminModal} 
        />
      )}
      {adminScreen === 'reviews' && (
        <AdminReviews 
          adminReviewsList={adminReviewsList} adminReviewsTab={adminReviewsTab} 
          setAdminReviewsTab={setAdminReviewsTab} setAdminScreen={setAdminScreen} setAdminModal={setAdminModal} 
        />
      )}
      {adminScreen === 'tickets' && (
        <AdminTickets 
          adminTickets={adminTickets} activeChat={activeChat} setActiveChat={setActiveChat} 
          chatMessages={chatMessages} setChatMessages={setChatMessages} newMessageText={newMessageText} 
          setNewMessageText={setNewMessageText} loadMessages={loadMessages} sendMessageWithPhoto={sendMessageWithPhoto} 
          setAdminScreen={setAdminScreen} handlePhotoSelect={handlePhotoSelect} adminSelectedPhoto={adminSelectedPhoto} 
          currentUser={currentUser}
        />
      )}
      {adminScreen === 'users' && (
        <AdminUsers 
          setAdminScreen={setAdminScreen} API_URL={API_URL} setAlertData={setAlertData} 
        />
      )}
      {/* ⚡ НОВЫЙ ЭКРАН: Модерация профилей пользователей */}
      {adminScreen === 'profiles' && (
        <AdminProfiles 
          setAdminScreen={setAdminScreen} API_URL={API_URL} setAlertData={setAlertData} 
        />
      )}
      {/* Вызов модальных окон подробного просмотра лотов/отзывов */}
      {adminModal && renderAdminModal()} 
    </div>
  );
}

export default Admin;