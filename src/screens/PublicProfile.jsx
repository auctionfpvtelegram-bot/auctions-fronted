import React from 'react';

function PublicProfile({ setCurrentScreen, publicProfileData, publicProfileReferrer, currentUser, setAlertData }) {
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

  // Обработчик кнопки Telegram с динамической ссылкой
  const handleTelegramClick = () => {
    if (publicProfileData.username) {
      window.open(`https://t.me/${publicProfileData.username}`, '_blank');
    } else {
      setAlertData({
        message: 'Пользователь не указал свой никнейм в Telegram',
        onClose: () => {}
      });
    }
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

      {/* Блок с Аватаром, ID и Рейтингом */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '12px' }}>
          👤
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0', color: '#111' }}>
          ID: {publicProfileData.id}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          <span style={{ color: '#ffcc00', letterSpacing: '2px' }}>{starString}</span>
          <span style={{ fontWeight: 'bold', color: '#111' }}>{ratingValue > 0 ? ratingValue.toFixed(1) : '0.0'}</span>
        </div>
      </div>

      {/* Карточка статистики */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #eee', margin: '24px 0' }}>
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
          {/* ⚡ ИСПРАВЛЕНО: Теперь запрашиваем dealsCount */}
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

      {/* Нативная кнопка Telegram */}
      <button 
        onClick={handleTelegramClick} 
        style={{ background: '#3390ec', borderRadius: '10px', padding: '14px', color: '#fff', fontWeight: 'bold', width: '100%', border: 'none', cursor: 'pointer', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
      >
        💬 Написать в Telegram
      </button>

      {/* Блок отзывов */}
      <div style={{ marginTop: '32px' }}>
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