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
  
  // ⚡ Стейт для всплывающего окна-переходника в ТГ-Бота
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const isModeration = currentUser?.profileStatus === 'MODERATION';
  const isRejected = currentUser?.profileStatus === 'REJECTED';

  useEffect(() => {
    if (currentUser) {
      setNewName(currentUser.customName || currentUser.username || '');
    }
  }, [currentUser]);

  // ⚡ Запрос к боту на открытие диалога для загрузки фото
  const handleAvatarUploadRequest = () => {
    fetch(`${API_URL}/api/users/${currentUser.id}/request-avatar-upload`, { method: 'POST' })
      .then(() => {
        // Мгновенно закрываем Web App, чтобы юзер оказался в боте
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.close();
        }
      })
      .catch(() => {
        if (setAlertData) setAlertData({ message: '❌ Ошибка соединения с ботом', onClose: () => {} });
      });
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
    setHasChanges(true);
  };

  // ⚡ Сохранение ТОЛЬКО имени и смена статуса на модерацию
  const handleSaveProfile = () => {
    setIsSubmitting(true);
    fetch(`${API_URL}/api/users/${currentUser.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customName: newName,
        profileStatus: 'MODERATION' // Принудительно ставим статус модерации
      }) 
    })
    .then(async res => {
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка сохранения');
      
      if (refreshCurrentUser) refreshCurrentUser(); // Фоново обновляем статус юзера в приложении
      if (setAlertData) {
        setAlertData({ message: '✅ Никнейм успешно отправлен на модерацию!', onClose: () => {} });
      }
      setHasChanges(false);
      setIsSubmitting(false);
    })
    .catch(err => {
      if (setAlertData) {
        setAlertData({ message: `⚠️ ${err.message}`, onClose: () => {} });
      }
      setIsSubmitting(false);
    });
  };

  // ⚡ Умное формирование ссылки на аватарку
  const getAvatarSrc = () => {
    if (!currentUser?.avatarUrl) return null;
    if (currentUser.avatarUrl.startsWith('http') || currentUser.avatarUrl.startsWith('data:')) {
      return currentUser.avatarUrl;
    }
    return `${API_URL}/api/image/${currentUser.avatarUrl}`;
  };

  const avatarSrc = getAvatarSrc();

  return (
    <div className="app-container">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button>
        <h2 className="screen-title">Настройки</h2>
      </div>

      {/* ⚡ ВСПЛЫВАЮЩЕЕ ОКНО-ПЕРЕХОДНИК ДЛЯ АВАТАРКИ */}
      {showAvatarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>📸 Обновление фото</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#666' }}>
              Чтобы загрузить новую аватарку, перейдите в диалог с ботом.
            </p>
            <button onClick={handleAvatarUploadRequest} style={{ width: '100%', height: '44px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', marginBottom: '8px', cursor: 'pointer' }}>
              Перейти в бота
            </button>
            <button onClick={() => setShowAvatarModal(false)} style={{ width: '100%', height: '44px', background: '#eee', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* 👤 БЛОК ПРОФИЛЯ */}
      <div style={{ background: '#fff', margin: '16px', borderRadius: '16px', padding: '24px 16px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        
        {/* Аватарка */}
        <div style={{ position: 'relative', marginBottom: '20px', width: '90px', height: '90px' }}>
          {avatarSrc ? (
            <img src={avatarSrc} alt="avatar" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1976d2', opacity: isModeration ? 0.7 : 1 }} />
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', opacity: isModeration ? 0.7 : 1 }}>👤</div>
          )}
          
          {/* ⚡ Если не на модерации - показываем карандашик, который открывает модалку, а НЕ галерею телефона */}
          {!isModeration && (
            <button 
              onClick={() => setShowAvatarModal(true)} 
              style={{ position: 'absolute', bottom: '0px', right: '0px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '15px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', zIndex: 10 }}
            >
              ✏️
            </button>
          )}
        </div>

        {/* Имя пользователя */}
        <div style={{ width: '100%', maxWidth: '240px', position: 'relative' }}>
          <input 
            type="text" 
            value={newName} 
            onChange={handleNameChange}
            placeholder="Ваш никнейм"
            disabled={isModeration}
            style={{ width: '100%', height: '44px', border: '1px solid #ddd', borderRadius: '12px', padding: isModeration ? '0 16px' : '0 36px 0 16px', outline: 'none', fontSize: '16px', textAlign: 'center', boxSizing: 'border-box', fontWeight: 'bold', color: isModeration ? '#666' : '#111', background: isModeration ? '#f5f5f5' : '#fff' }}
          />
          {!isModeration && (
            <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', color: '#999', pointerEvents: 'none' }}>✏️</span>
          )}
        </div>

        {isModeration && !hasChanges && (
          <div style={{ marginTop: '16px', background: '#fff3e0', border: '1px solid #ffe0b2', padding: '12px', borderRadius: '12px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>⏳</div>
            <div style={{ fontSize: '13px', color: '#e65100', fontWeight: 'bold', marginBottom: '4px' }}>Профиль на модерации</div>
            <div style={{ fontSize: '11px', color: '#f57c00' }}>Вносить изменения временно нельзя.</div>
          </div>
        )}
        
        {isRejected && !hasChanges && (
          <div style={{ marginTop: '16px', background: '#ffebee', border: '1px solid #ffcdd2', padding: '12px', borderRadius: '12px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '13px', color: '#c62828', fontWeight: 'bold', marginBottom: '4px' }}>🚫 Профиль отклонен</div>
            <div style={{ fontSize: '11px', color: '#d32f2f' }}>Причина: {currentUser?.profileRejectReason || 'Нарушение правил'}</div>
          </div>
        )}

        {hasChanges && !isModeration && (
          <button 
            onClick={handleSaveProfile}
            disabled={isSubmitting}
            style={{ marginTop: '20px', width: '100%', maxWidth: '240px', height: '44px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)' }}
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