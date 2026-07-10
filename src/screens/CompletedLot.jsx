import React, { useState } from 'react';
import { API_URL } from '../config';

function CompletedLot({ setCurrentScreen, selectedLot, currentUser, isFavorite, toggleFavorite, handleOpenPublicProfile }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const isWinner = selectedLot?.bids?.[0]?.userId === currentUser.id;
  const isSeller = selectedLot?.sellerId === currentUser.id;
  const canReview = isWinner || isSeller;
  
  // Ищем отзыв текущего пользователя, чтобы показать его статус
  const userReview = selectedLot?.reviews?.find(r => r.authorId === currentUser.id);

  const getAvatarSrc = (url) => {
    if (!url || url === 'null' || url === 'undefined') return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  const sellerName = selectedLot?.seller?.customName || selectedLot?.seller?.firstName || `ID: ${selectedLot?.sellerId}`;
  const winnerName = selectedLot?.bids?.[0]?.user?.customName || selectedLot?.bids?.[0]?.user?.firstName || `ID: ${selectedLot?.bids?.[0]?.userId}`;

  return (
    <div style={{ padding: '0 16px', paddingBottom: '40px' }}>
      
      {/* ГАЛЕРЕЯ ФОТОГРАФИЙ ИЗ NEW ДИЗАЙНА */}
      <div style={{ position: 'relative', width: '100%', height: '240px', background: '#f1f5f9', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {selectedLot?.photos && selectedLot.photos.length > 0 ? (
          <>
            <img 
              src={selectedLot.photos[photoIndex].startsWith('http') ? selectedLot.photos[photoIndex] : `${API_URL}/api/image/${selectedLot.photos[photoIndex]}`} 
              alt="lot" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            {selectedLot.photos.length > 1 && (
              <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px' }}>
                {selectedLot.photos.map((_, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setPhotoIndex(idx)}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === photoIndex ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: '0.2s' }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#94a3b8' }}>🚁</div>
        )}
        
        {/* ИКОНКА ИЗБРАННОГО НАД ФОТО */}
        <div 
          onClick={() => toggleFavorite(selectedLot)} 
          style={{ position: 'absolute', top: '12px', right: '12px', background: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
        >
          {isFavorite ? '❤️' : '♡'}
        </div>

        <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#64748b', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          🏁 Торги завершены
        </span>
      </div>

      {/* ЗАГОЛОВОК И ОПИСАНИЕ ЛОТА */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.3' }}>{selectedLot?.title}</h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{selectedLot?.description}</p>
      </div>

      {/* КАРТОЧКА ПРОДАВЦА */}
      <div 
        onClick={() => handleOpenPublicProfile(selectedLot?.sellerId, 'completedLot')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#fff', borderRadius: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}
      >
        {selectedLot?.seller?.avatarUrl ? (
          <img 
            src={getAvatarSrc(selectedLot.seller.avatarUrl)} 
            alt="seller avatar" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{sellerName}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Продавец лота</p>
        </div>
        <div style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
          ⭐ {selectedLot?.seller?.rating > 0 ? selectedLot.seller.rating.toFixed(1) : '0.0'}
        </div>
      </div>

      {/* ХАРАКТЕРИСТИКИ */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#64748b' }}>Категория:</span>
          <span style={{ fontWeight: '600', color: '#334155' }}>{selectedLot?.category || 'Разное'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#64748b' }}>Локация:</span>
          <span style={{ fontWeight: '600', color: '#334155' }}>📍 {selectedLot?.location}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#64748b' }}>Финальная цена:</span>
          <span style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '15px' }}>{selectedLot?.currentPrice?.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {/* БЛОК ПОБЕДИТЕЛЯ ТОРГОВ */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#15803d', fontSize: '16px', fontWeight: 'bold' }}>🏆 Аукцион успешно завершен!</h3>
        {selectedLot?.bids && selectedLot.bids.length > 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>
            Победитель торгов: <span style={{ fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleOpenPublicProfile(selectedLot.bids[0].userId, 'completedLot')}>{winnerName}</span> с финальной ставкой <b>{selectedLot.currentPrice?.toLocaleString('ru-RU')} ₽</b>.
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>Лот завершен без ставок.</p>
        )}
      </div>

      {/* ИСТОРИЯ СТАВОК ИЗ NEW ДИЗАЙНА */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>История торгов ({selectedLot?.bids?.length || 0})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
          {selectedLot?.bids && selectedLot.bids.length > 0 ? (
            selectedLot.bids.map((b, idx) => {
              const bName = b.user?.customName || b.user?.firstName || `ID: ${b.userId}`;
              return (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx === selectedLot.bids.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: idx === 0 ? 'bold' : '500', color: idx === 0 ? '#16a34a' : '#334155' }}>
                      {idx === 0 ? '👑 ' : ''}{bName}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{b.amount?.toLocaleString('ru-RU')} ₽</span>
                </div>
              );
            })
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '8px 0' }}>Ставок сделано не было</p>
          )}
        </div>
      </div>

      {/* ОСТАВИТЬ ОТЗЫВ ПАРТНЕРУ */}
      {canReview && !userReview && (
        <button 
          className="btn-review" 
          onClick={() => setCurrentScreen('writeReview')}
          style={{ width: '100%', height: '48px', background: '#ffcc00', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,204,0,0.2)' }}
        >
          ⭐ Оставить отзыв {isSeller ? 'покупателю' : 'продавцу'}
        </button>
      )}

      {userReview && (
        <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', textAlign: 'center', fontSize: '13px', background: userReview.status === 'REJECTED' ? '#ffebee' : userReview.status === 'MODERATION' ? '#fff8e1' : '#e8f5e9', border: `1px solid ${userReview.status === 'REJECTED' ? '#ef9a9a' : userReview.status === 'MODERATION' ? '#ffe082' : '#a5d6a7'}` }}>
          {userReview.status === 'ACTIVE' && <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓ Ваш отзыв успешно опубликован</span>}
          {userReview.status === 'MODERATION' && <span style={{ color: '#f57f17', fontWeight: 'bold' }}>⏳ Ваш отзыв находится на модерации</span>}
          {userReview.status === 'REJECTED' && (
            <>
              <span style={{ color: '#c62828', fontWeight: 'bold' }}>❌ Ваш отзыв отклонен модератором</span>
              {userReview.rejectReason && <p style={{ margin: '4px 0 0 0', color: '#b71c1c', fontSize: '12px' }}>Причина: {userReview.rejectReason}</p>}
            </>
          )}
        </div>
      )}

    </div>
  );
}

export default CompletedLot;