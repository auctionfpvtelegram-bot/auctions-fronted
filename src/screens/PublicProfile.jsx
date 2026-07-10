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

  const formattedRegDate = publicProfileData.createdAt
    ? new Date(publicProfileData.createdAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '—';

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
    <div className="app-container" style={{ paddingTop: '16px' }}>
      
      {/* ⚡ СТАРАЯ ШАПКА ПОЛНОСТЬЮ УДАЛЕНА */}

      <div className="profile-user-card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          {publicProfileData?.avatarUrl ? (
            <img 
              src={getAvatarSrc(publicProfileData.avatarUrl)} 
              alt="avatar" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>👤</div>
          )}
        </div>
        <h3 style={{ margin: '0 0 8px 0' }}>{publicProfileData.customName || publicProfileData.firstName || 'Пользователь'}</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#888' }}>ID: {publicProfileData.id}</p>
        
        <div className="profile-stats-grid" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <div className="stat-box">
            <span className="stat-value" style={{ color: '#ff9800' }}>⭐ {ratingValue.toFixed(1)}</span>
            <span className="stat-label">Рейтинг</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{publicProfileData.soldLotsCount || 0}</span>
            <span className="stat-label">Сделок</span>
          </div>
        </div>

        {/* ⚡ ПЕРЕИМЕНОВАННАЯ КНОПКА МЕССЕНДЖЕРА */}
        <button className="action-btn" onClick={handleWriteMessage} style={{ width: '100%', marginTop: '16px', background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold' }}>
          💬 Написать
        </button>
      </div>

      <div className="profile-info-section" style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px 0' }}>Информация</h4>
        <div className="info-row"><span className="info-label">На платформе с:</span> <span className="info-val">{formattedRegDate}</span></div>
        <div className="info-row"><span className="info-label">Участвовал в торгах:</span> <span className="info-val">{publicProfileData.bidsCount || 0} раз</span></div>
      </div>

      <div className="profile-reviews-section">
        <h3 style={{ margin: '0 0 16px 0' }}>Отзывы ({reviewCount})</h3>
        
        <div className="reviews-list">
          {reviewCount > 0 ? (
            publicProfileData.reviews.map(rev => {
              const revDate = new Date(rev.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
              const rStars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
              return (
                <div key={rev.id} className="review-card" style={{ background: '#f5f5f5', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>ID: {rev.authorId}</span>
                      <span style={{ color: '#ffcc00', fontSize: '12px' }}>{rStars}</span>
                    </div>
                    {publicProfileData.id === currentUser.id && (
                      <button onClick={handleReport} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🚩</button>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{revDate}</div>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{rev.text}</p>
                </div>
              );
            })
          ) : (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>У этого пользователя пока нет отзывов.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;