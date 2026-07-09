import React from 'react';
import { API_URL } from '../config';

function PublicProfile({ setCurrentScreen, publicProfileData, publicProfileReferrer, currentUser, setAlertData, setActiveChatPartnerId }) {
  if (!publicProfileData) {
    return <div className="app-container" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>🚁 Загрузка...</div>;
  }

  const reviewCount = publicProfileData.reviews?.length || 0;
  const ratingValue = reviewCount > 0 ? (publicProfileData.rating || 0.0) : 0.0;
  const fullStars = Math.round(ratingValue);
  const starString = reviewCount > 0 ? ('★'.repeat(fullStars) + '☆'.repeat(5 - fullStars)) : '☆☆☆☆☆';

  // Форматируем дату регистрации аккуратно и с пробелами
  const formattedRegDate = publicProfileData.createdAt
    ? new Date(publicProfileData.createdAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '—';

  // ⚡ УМНАЯ ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ АВАТАРОК
  // Понимает и обычные ссылки (http/data), и file_id из Telegram
  const getAvatarSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  // Функция для быстрой жалобы из чужого профиля
  const handleReport = () => {
    setAlertData({
      message: 'Перенаправляем в Службу заботы...',
      onClose: () => setCurrentScreen('feedback')
    });
  };

  return (
    <div className="app-container" style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '20px' }}>
      {/* Шапка */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '16px', margin: '-16px -16px 16px -16px', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => setCurrentScreen(publicProfileReferrer)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', paddingRight: '16px', color: '#111' }}>{'<'}</button>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#111' }}>Профиль пользователя</h2>
      </div>

      {/* ⚡ НОВАЯ КАРТОЧКА ПРОФИЛЯ С АВАТАРКОЙ, ИМЕНЕМ И ID */}
      <div className="public-profile-card" style={{ textAlign: 'center', padding: '24px 16px', background: '#fff', borderRadius: '16px', margin: '16px' }}>
        {/* Аватарка чужого профиля */}
        {publicProfileData?.avatarUrl ? (
          <img 
            src={getAvatarSrc(publicProfileData.avatarUrl)} 
            alt="avatar" 
            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1976d2', marginBottom: '12px' }} 
          />
        ) : (
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 12px auto' }}>👤</div>
        )}

        {/* Имя чужого профиля */}
        <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold' }}>
          {publicProfileData?.customName || publicProfileData?.firstName || 'Пользователь'}
        </h2>

        {/* ОБЯЗАТЕЛЬНЫЙ ID ПРОФИЛЯ */}
        <span style={{ fontSize: '12px', color: '#888', background: '#eee', padding: '4px 8px', borderRadius: '6px' }}>
          ID: {publicProfileData?.id}
        </span>

        {/* Рейтинг */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', marginTop: '12px', justifyContent: 'center' }}>
          <span style={{ color: '#ffcc00', letterSpacing: '2px' }}>{starString}</span>
          <span style={{ fontWeight: 'bold', color: '#111' }}>{ratingValue > 0 ? ratingValue.toFixed(1) : '0.0'}</span>
        </div>
      </div>

      {/* Карточка статистики */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #eee', margin: '0 16px 24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#666', fontSize: '14px' }}>
            <span>📅</span>
            <span>В сервисе с:</span>
          </div>
          <div style={{ color: '#111', fontWeight: '600', fontSize: '14px' }}>{formattedRegDate}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#666', fontSize: '14px' }}>
            <span style={{ color: '#4caf50' }}>✅</span>
            <span>Успешных сделок</span>
          </div>
          <div style={{ color: '#111', fontWeight: '600', fontSize: '14px' }}>{publicProfileData.dealsCount ?? 0}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#666', fontSize: '14px' }}>
            <span>🔨</span>
            <span>Поставлено ставок</span>
          </div>
          <div style={{ color: '#111', fontWeight: '600', fontSize: '14px' }}>{publicProfileData.bidsCount ?? 0}</div>
        </div>
      </div>

      {/* КНОПКИ СВЯЗИ В ПУБЛИЧНОМ ПРОФИЛЕ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
        {/* ⚡ Главная яркая кнопка мессенджера (запоминает собеседника) */}
        <button 
          onClick={() => {
            setActiveChatPartnerId(publicProfileData.id); // Запоминаем, кому пишем
            setCurrentScreen('messenger'); // Переходим в мессенджер
          }}
          style={{
            width: '100%',
            height: '48px',
            background: '#ffcc00', // Фирменный желтый цвет проекта
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(255, 204, 0, 0.2)'
          }}
        >
          💬 Написать внутри приложения
        </button>

        {/* Вторичная (скромная) кнопка Telegram */}
        {publicProfileData?.username && (
          <a 
            href={`https://t.me/${publicProfileData.username}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ width: '100%', height: '44px', background: '#f5f5f5', color: '#555', border: '1px solid #e0e0e0', borderRadius: '12px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', boxSizing: 'border-box' }}
          >
            ✈️ Написать в Telegram
          </a>
        )}
      </div>

      {/* Блок отзывов */}
      <div style={{ marginTop: '32px', padding: '0 16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>Отзывы ({reviewCount})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviewCount > 0 ? (
            publicProfileData.reviews.map((rev) => {
              const rStars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
              const revDate = new Date(rev.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
              return (
                <div key={rev.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>ID: {rev.authorId}</span>
                      <span style={{ color: '#ffcc00', fontSize: '12px', letterSpacing: '1px' }}>{rStars}</span>
                    </div>
                    {publicProfileData.id === currentUser.id && (
                      <button onClick={handleReport} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🚩</button>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{revDate}</div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.4' }}>{rev.text}</p>
                </div>
              );
            })
          ) : (
            <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px dashed #ccc' }}>
              <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Отзывов пока нет 🤷‍♂️</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;