import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function Settings({ setCurrentScreen, currentUser, setAlertData, refreshCurrentUser }) {
  const [notifyNewLots, setNotifyNewLots] = useState(true);
  const [notifyBids, setNotifyBids] = useState(true);
  const [notifyEnding, setNotifyEnding] = useState(true);

  // Стейт для текста имени
  const [newName, setNewName] = useState(currentUser?.customName || currentUser?.username || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Стейт для всплывающего окна-переходника в ТГ-Бота
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const isModeration = currentUser?.profileStatus === 'MODERATION';
  const isRejected = currentUser?.profileStatus === 'REJECTED';

  useEffect(() => {
    if (currentUser) {
      setNewName(currentUser.customName || currentUser.username || '');
    }
  }, [currentUser]);

  // Запрос к боту на открытие диалога для загрузки фото
  const handleAvatarUploadRequest = () => {
    fetch(`${API_URL}/api/users/${currentUser.id}/request-avatar-upload`, { method: 'POST' })
      .then(() => {
        // Мгновенно закрываем Web App, чтобы юзер остался в чате с ботом
        window.Telegram?.WebApp?.close();
      })
      .catch(err => {
        console.error(err);
        setAlertData({ message: 'Ошибка при связи с ботом. Попробуйте позже.' });
      });
  };

  const getAvatarSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
    setHasChanges(e.target.value !== (currentUser?.customName || currentUser?.username || ''));
  };

  const handleSaveProfile = () => {
    if (!newName.trim()) return setAlertData({ message: 'Имя не может быть пустым' });
    setIsSubmitting(true);
    fetch(`${API_URL}/api/users/${currentUser.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customName: newName })
    })
      .then(res => res.json())
      .then(data => {
        setIsSubmitting(false);
        if (data.error) return setAlertData({ message: data.error });
        setAlertData({ message: '✅ Профиль отправлен на модерацию!' });
        setHasChanges(false);
        if (refreshCurrentUser) refreshCurrentUser();
      })
      .catch(() => {
        setIsSubmitting(false);
        setAlertData({ message: 'Ошибка сохранения' });
      });
  };

  return (
    <div style={{ padding: '0 16px', paddingBottom: '40px' }}>
      
      {/* ⚡ Всплывающее окно перед переходом в бота */}
      {showAvatarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', textAlign: 'center', width: '100%', maxWidth: '300px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Загрузка фото</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
              Приложение сейчас закроется. <br/>Пожалуйста, отправьте вашу новую аватарку <b>прямо в чат с ботом</b>.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setShowAvatarModal(false)}
                style={{ flex: 1, padding: '10px', background: '#eee', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#333' }}
              >
                Отмена
              </button>
              <button 
                onClick={handleAvatarUploadRequest}
                style={{ flex: 1, padding: '10px', background: '#1976d2', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#fff' }}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ Предупреждения о статусе модерации */}
      {isModeration && (
        <div style={{ background: '#fff3e0', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #ffb74d', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <p style={{ margin: 0, fontSize: '13px', color: '#e65100', lineHeight: '1.4' }}>
            Ваш профиль находится на проверке у модераторов. Вы не можете вносить изменения до завершения проверки.
          </p>
        </div>
      )}

      {isRejected && (
        <div style={{ background: '#ffebee', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #ef5350', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '20px' }}>🚫</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#c62828', fontWeight: 'bold' }}>
              Профиль отклонен модератором
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#b71c1c' }}>
              Причина: {currentUser.profileRejectReason || 'Нарушение правил. Исправьте данные и отправьте снова.'}
            </p>
          </div>
        </div>
      )}

      {/* ⚡ Блок кастомизации профиля */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            {currentUser?.avatarUrl ? (
              <img 
                src={getAvatarSrc(currentUser.avatarUrl)} 
                alt="avatar" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
              />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>👤</div>
            )}
            
            <button 
              onClick={() => setShowAvatarModal(true)}
              disabled={isModeration}
              style={{ position: 'absolute', bottom: 0, right: 0, background: '#1976d2', border: '2px solid #fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: isModeration ? 'not-allowed' : 'pointer', padding: 0, opacity: isModeration ? 0.5 : 1 }}
            >
              📷
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Отображаемое имя</label>
            <input 
              type="text" 
              value={newName} 
              onChange={handleNameChange}
              disabled={isModeration}
              placeholder="Введите ваше имя"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: isModeration ? '#f5f5f5' : '#fff' }}
            />
          </div>
        </div>

        {hasChanges && (
          <button 
            onClick={handleSaveProfile} 
            disabled={isSubmitting || isModeration}
            style={{ width: '100%', padding: '12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)' }}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить на проверку'}
          </button>
        )}
      </div>

      <div className="settings-list" style={{ marginTop: '20px' }}>
        <div className="setting-card">
          <p className="setting-title">Уведомления об отправке на модерацию / публикации</p>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifyNewLots} onChange={(e) => setNotifyNewLots(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-card">
          <p className="setting-title">Уведомления о том, что ставку перебили</p>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifyBids} onChange={(e) => setNotifyBids(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-card">
          <p className="setting-title">Уведомления о победе / завершении торгов</p>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifyEnding} onChange={(e) => setNotifyEnding(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;