import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config';

function Settings({ setCurrentScreen, currentUser, setAlertData }) {
  // Тумблеры уведомлений
  const [notifyNewLots, setNotifyNewLots] = useState(true);
  const [notifyBids, setNotifyBids] = useState(true);
  const [notifyEnding, setNotifyEnding] = useState(true);

  // Локальные стейты для предпросмотра изменений профиля
  const [newName, setNewName] = useState(currentUser?.customName || currentUser?.username || '');
  const [newAvatar, setNewAvatar] = useState(currentUser?.avatarUrl || null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ⚡ Анимация загрузки фото и синхронизация статуса модерации
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [localProfileStatus, setLocalProfileStatus] = useState(currentUser?.profileStatus || 'APPROVED');

  const fileInputRef = useRef(null);

  // Синхронизируем стейт, если currentUser прилетит обновленным из App.jsx
  useEffect(() => {
    if (currentUser) {
      setLocalProfileStatus(currentUser.profileStatus || 'APPROVED');
      setNewName(currentUser.customName || currentUser.username || '');
      setNewAvatar(currentUser.avatarUrl || null);
    }
  }, [currentUser]);

  const isModeration = localProfileStatus === 'MODERATION';
  const isRejected = localProfileStatus === 'REJECTED';

  // Обработка выбора картинки (с анимацией как в чатах)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsImageLoading(true); // Включаем анимацию загрузки
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewAvatar(ev.target.result); // Показываем картинку юзеру
        setHasChanges(true);            // Включаем кнопку отправки
        setIsImageLoading(false);       // Выключаем анимацию
      };
      reader.onerror = () => {
        setIsImageLoading(false);
        if (setAlertData) setAlertData({ message: '❌ Ошибка при чтении файла', onClose: () => {} });
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработка ввода имени
  const handleNameChange = (e) => {
    setNewName(e.target.value);
    setHasChanges(true); // Включаем кнопку отправки
  };

  // Финальная отправка данных на сервер
  const handleSaveProfile = () => {
    setIsSubmitting(true);
    fetch(`${API_URL}/api/users/${currentUser.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customName: newName, avatarUrl: newAvatar })
    })
    .then(async res => {
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка сохранения');
      
      // Мгновенно переключаем статус интерфейса на «На проверке»
      setLocalProfileStatus('MODERATION');
      
      if (setAlertData) {
        setAlertData({ message: '⏳ Данные успешно отправлены на модерацию!', onClose: () => {} });
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

  return (
    <div className="app-container">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button>
        <h2 className="screen-title">Настройки</h2>
      </div>

      {/* 👤 БЛОК ПРОФИЛЯ */}
      <div style={{ background: '#fff', margin: '16px', borderRadius: '16px', padding: '24px 16px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        
        {/* Аватарка с лоадером */}
        <div style={{ position: 'relative', marginBottom: '20px', width: '90px', height: '90px' }}>
          {isImageLoading ? (
            // 🔄 Красивый CSS-лоадер крутилка
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #f3f3f3', borderTop: '3px solid #1976d2', animation: 'spin 1s linear infinite', boxSizing: 'border-box' }} />
          ) : newAvatar ? (
            <img src={newAvatar} alt="avatar" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1976d2' }} />
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>👤</div>
          )}
          
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
          
          {!isImageLoading && (
            <button 
              onClick={() => fileInputRef.current.click()} 
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
            style={{ width: '100%', height: '44px', border: '1px solid #ddd', borderRadius: '12px', padding: '0 36px 0 16px', outline: 'none', fontSize: '16px', textAlign: 'center', boxSizing: 'border-box', fontWeight: 'bold', color: '#111' }}
          />
          <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', color: '#999', pointerEvents: 'none' }}>✏️</span>
        </div>

        {/* Статус модерации (Берется из локального стейта для мгновенного обновления) */}
        {isModeration && !hasChanges && (
          <div style={{ fontSize: '13px', color: '#f57c00', fontWeight: 'bold', marginTop: '16px', background: '#fff3e0', padding: '8px 16px', borderRadius: '8px', textAlign: 'center', width: '100%', maxWidth: '240px', boxSizing: 'border-box' }}>
            ⏳ Профиль на модерации
          </div>
        )}
        {isRejected && !hasChanges && (
          <div style={{ fontSize: '13px', color: '#c62828', fontWeight: 'bold', marginTop: '16px', background: '#ffebee', padding: '8px 16px', borderRadius: '8px', textAlign: 'center', width: '100%', maxWidth: '240px', boxSizing: 'border-box' }}>
            🚫 Отклонено: {currentUser?.profileRejectReason || 'Нарушение правил'}
          </div>
        )}

        {/* Кнопка отправки изменений */}
        {hasChanges && (
          <button 
            onClick={handleSaveProfile}
            disabled={isSubmitting}
            style={{ marginTop: '20px', width: '100%', maxWidth: '240px', height: '44px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)' }}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить на проверку'}
          </button>
        )}
      </div>

      {/* ⚙️ БЛОК УВЕДОМЛЕНИЙ */}
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

      {/* Встраиваем стиль для бесконечной анимации крутилки-лоадера */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Settings;