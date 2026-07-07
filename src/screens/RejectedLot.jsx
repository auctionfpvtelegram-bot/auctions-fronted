import React, { useState } from 'react';
import { API_URL } from '../config';
import { EditLotModal } from './EditLotModal'; // ⚡ Подключаем нашу форму

function RejectedLot({ setCurrentScreen, selectedLot, currentUser, setAlertData }) {
  // Стейт для управления видимостью формы редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Так как в App.jsx проп называется lot, а в самом файле selectedLot, подстрахуемся:
  const lotData = selectedLot; 

  return (
    <div className="app-container">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button>
        <h2 className="screen-title">Детали лота</h2>
      </div>
      
      <div className="lot-details-header">
        <span className="status-badge-large rejected">Отклоненный лот</span>
      </div>
      
      <div className="alert-box">
        <div className="alert-header"><span>⚠️</span> Причина отклонения:</div>
        <p className="alert-text">{lotData?.rejectReason || 'Нарушение правил размещения. Модератор не одобрил публикацию.'}</p>
      </div>

      {/* ⚡ Кнопка вызова формы редактирования */}
      <div style={{ padding: '0 16px', marginTop: '20px' }}>
        <button 
          onClick={() => setIsEditModalOpen(true)} 
          style={{ width: '100%', height: '48px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)' }}
        >
          ✏️ Редактировать лот
        </button>
      </div>

      {/* ⚡ Сама форма, которая всплывет поверх экрана */}
      <EditLotModal 
        lot={lotData}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        API_URL={API_URL}
        currentUser={currentUser}
        onUpdateSuccess={(updatedLot) => {
          // Выводим уведомление и перекидываем пользователя обратно в профиль
          if (setAlertData) {
            setAlertData({ message: '🔄 Лот исправлен и отправлен на повторную модерацию!', onClose: () => {} });
          }
          setCurrentScreen('profile'); 
        }}
      />
    </div>
  );
}

export default RejectedLot;