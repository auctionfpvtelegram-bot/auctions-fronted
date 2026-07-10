import React, { useState } from 'react';
import { API_URL } from '../config';

function CompletedLot({ setCurrentScreen, selectedLot, currentUser, isFavorite, toggleFavorite, handleOpenPublicProfile }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const isWinner = selectedLot?.bids?.[0]?.userId === currentUser.id;
  const isSeller = selectedLot?.sellerId === currentUser.id;
  const canReview = isWinner || isSeller;
  const userReview = selectedLot?.reviews?.find(r => r.authorId === currentUser.id);

  // ⚡ Умная функция для получения ссылки на аватарку
  const getAvatarSrc = (url) => {
    if (!url || url === 'null' || url === 'undefined') return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  const sellerName = selectedLot?.seller?.customName || selectedLot?.seller?.firstName || `ID: ${selectedLot?.sellerId}`;
  const winnerName = selectedLot?.bids?.[0]?.user?.customName || selectedLot?.bids?.[0]?.user?.firstName || `ID: ${selectedLot?.bids?.[0]?.userId}`;

  return (
    <div style={{ padding: '0 16px', paddingBottom: '40px' }}>
      {/* ⚡ БЛОК КАРТИНКИ С ЛАЙКОМ ВНУТРИ (без старой шапки) */}
      <div className="lot-image-large" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', height: '240px', borderRadius: '12px', overflow: 'hidden', position: 'relative', marginTop: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {selectedLot?.photos && selectedLot.photos.length > 0 ? (
          <img src={getAvatarSrc(selectedLot.photos[0])} alt="lot" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
        ) : (
          '🚁'
        )}
        <div 
          style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedLot); }}
        >
          {isFavorite ? '❤️' : '♡'}
        </div>
        <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#64748b', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          🏁 Торги завершены
        </span>
      </div>

      {/* ЗАГОЛОВОК И ОПИСАНИЕ ЛОТА */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginTop: '16px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.3' }}>{selectedLot?.title}</h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{selectedLot?.description}</p>
      </div>

      {/* ⚡ ОБНОВЛЕННАЯ КАРТОЧКА ПРОДАВЦА С АВАТАРКОЙ И РЕЙТИНГОМ */}
      <div className="seller-info" onClick={() => handleOpenPublicProfile(selectedLot?.sellerId, 'completedLot')} style={{ cursor: 'pointer', background: '#fff', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {selectedLot?.seller?.avatarUrl ? (
          <img src={getAvatarSrc(selectedLot.seller.avatarUrl)} alt="seller avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px', color: '#111' }}>{sellerName}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Продавец лота</p>
        </div>
        <div style={{ background: '#fff9c4', color: '#d97706', padding: '4px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
          ⭐ {selectedLot?.seller?.rating > 0 ? selectedLot.seller.rating.toFixed(1) : '0.0'}
        </div>
      </div>

      {/* ⚡ ОБНОВЛЕННЫЙ БЛОК ХАРАКТЕРИСТИК */}
      <div className="lot-info-box" style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #f0f0f0' }}>
        <p className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: '#666' }}>Категория:</span> <strong>{selectedLot?.category || 'Разное'}</strong>
        </p>
        <p className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: '#666' }}>Локация:</span> <strong>📍 {selectedLot?.location}</strong>
        </p>
        <p className="info-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#666' }}>Финальная цена:</span> <strong style={{ color: '#16a34a', fontSize: '16px' }}>{selectedLot?.currentPrice?.toLocaleString('ru-RU')} ₽</strong>
        </p>
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

      {/* ИСТОРИЯ СТАВОК */}
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