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

  // УМНАЯ ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ АВАТАРОК
  const getAvatarSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  const handleWriteMessage = () => {
    if (currentUser.id === publicProfileData.id) {
      return setAlertData({ message: 'Вы не можете написать самому себе.' });
    }
    setActiveChatPartnerId(publicProfileData.id);
    setCurrentScreen('messenger');
  };

  const handleReport = () => {
    setAlertData({ message: 'Жалоба на отзыв отправлена модераторам.' });
  };

  return (
    <div style={{ padding: '0 16px', paddingBottom: '40px' }}>
      
      {/* КАРТОЧКА ПРОФИЛЯ С НОВЫМ ДИЗАЙНОМ И АВАТАРКОЙ */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          {publicProfileData?.avatarUrl ? (
            <img 
              src={getAvatarSrc(publicProfileData.avatarUrl)} 
              alt="avatar" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f0f2f5' }} 
            />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '3px solid #f0f2f5' }}>👤</div>
          )}
        </div>

        <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold', color: '#111' }}>
          {publicProfileData.customName || publicProfileData.firstName || 'Пользователь'}
        </h3>
        
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#888', background: '#f5f5f5', display: 'inline-block', padding: '4px 10px', borderRadius: '6px' }}>
          ID: {publicProfileData.id}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: '#fff9c4', color: '#f57f17', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold' }}>
            <span style={{ fontSize: '16px' }}>⭐</span> {ratingValue.toFixed(1)}
          </div>
          <div style={{ background: '#e3f2fd', color: '#1976d2', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold' }}>
            🤝 {publicProfileData.soldLotsCount || 0} сделок
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleWriteMessage} style={{ flex: 1, padding: '12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
            💬 Написать
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#111' }}>Информация</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
          <span style={{ color: '#666' }}>На платформе с:</span>
          <span style={{ fontWeight: '500' }}>{formattedRegDate}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#666' }}>Участвовал в торгах:</span>
          <span style={{ fontWeight: '500' }}>{publicProfileData.bidsCount || 0} раз</span>
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Отзывы <span style={{ background: '#eee', padding: '2px 8px', borderRadius: '12px', fontSize: '14px', color: '#666' }}>{reviewCount}</span>
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviewCount > 0 ? (
            publicProfileData.reviews.map(rev => {
              const revDate = new Date(rev.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
              const rStars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
              
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
              <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>У этого пользователя пока нет отзывов.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default PublicProfile;