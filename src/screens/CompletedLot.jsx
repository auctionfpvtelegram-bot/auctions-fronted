import React, { useState } from 'react';
import { API_URL } from '../config';

function CompletedLot({ setCurrentScreen, selectedLot, currentUser, isFavorite, toggleFavorite, handleOpenPublicProfile }) {
  const isWinner = selectedLot?.bids?.[0]?.userId === currentUser.id;
  const isSeller = selectedLot?.sellerId === currentUser.id;
  const canReview = isWinner || isSeller;
  
  const userReview = selectedLot?.reviews?.find(r => r.authorId === currentUser.id);

  const getAvatarSrc = (url) => {
    if (!url || url === 'null' || url === 'undefined') return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  const sellerName = selectedLot?.seller?.customName || selectedLot?.seller?.firstName || `ID: ${selectedLot?.sellerId}`;
  const winnerName = selectedLot?.bids?.[0]?.user?.customName || selectedLot?.bids?.[0]?.user?.firstName || `ID: ${selectedLot?.bids?.[0]?.userId}`;

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      
      {/* ⚡ ВЕРСТКА 1 В 1 КАК В ACTIVE LOT */}
      <div className="lot-image-large" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', height: '18px', padding: '60px 0', borderRadius: '12px', overflow: 'hidden', position: 'relative', marginTop: '16px' }}>
        {selectedLot?.photos && selectedLot.photos.length > 0 ? (
          <img src={getAvatarSrc(selectedLot.photos[0])} alt="lot" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
        ) : (
          '🚁'
        )}
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }} onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedLot); }}>
          {isFavorite ? '❤️' : '♡'}
        </div>
      </div>

      <div className="lot-details-header" style={{ marginTop: '16px' }}>
        <span className="status-badge-large ended" style={{ background: '#e2e8f0', color: '#475569' }}>🏁 Завершен</span>
      </div>

      <h2 className="lot-title" style={{ fontSize: '22px', margin: '12px 0 8px 0', lineHeight: 1.2 }}>{selectedLot?.title}</h2>
      <p className="lot-description" style={{ color: '#555', fontSize: '15px', lineHeight: 1.4, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>{selectedLot?.description}</p>

      <div className="lot-info-box" style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
        <p className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Категория:</span> <strong>{selectedLot?.category || 'Разное'}</strong></p>
        <p className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Локация:</span> <strong>📍 {selectedLot?.location}</strong></p>
        <p className="info-row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Финальная цена:</span> <strong style={{ color: '#16a34a' }}>{selectedLot?.currentPrice?.toLocaleString('ru-RU')} ₽</strong></p>
      </div>

      <div className="seller-info" onClick={() => handleOpenPublicProfile(selectedLot?.sellerId, 'completedLot')} style={{ cursor: 'pointer', background: '#fff', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee', marginBottom: '20px' }}>
        {selectedLot?.seller?.avatarUrl ? (
          <img src={getAvatarSrc(selectedLot.seller.avatarUrl)} alt="seller avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>{sellerName}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Продавец лота</p>
        </div>
        <div style={{ background: '#fff9c4', color: '#f57f17', padding: '4px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
          ⭐ {selectedLot?.seller?.rating > 0 ? selectedLot.seller.rating.toFixed(1) : '0.0'}
        </div>
      </div>

      {/* ⚡ БЛОК ПОБЕДИТЕЛЯ ТОРГОВ ВМЕСТО СТАВКИ */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#15803d', fontSize: '16px', fontWeight: 'bold' }}>🏆 Аукцион успешно завершен!</h3>
        {selectedLot?.bids && selectedLot.bids.length > 0 ? (
          <p style={{ margin: 0, fontSize: '14px', color: '#166534', lineHeight: '1.4' }}>
            Победитель торгов: <span style={{ fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleOpenPublicProfile(selectedLot.bids[0].userId, 'completedLot')}>{winnerName}</span> с финальной ставкой <b>{selectedLot.currentPrice?.toLocaleString('ru-RU')} ₽</b>.
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>Лот завершен без ставок.</p>
        )}
      </div>

      <div className="bids-history-section" style={{ marginBottom: '20px' }}>
        <h3 className="section-subtitle" style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 'bold' }}>История торгов ({selectedLot?.bids?.length || 0})</h3>
        <div className="bids-list" style={{ maxHeight: '200px', overflowY: 'auto', background: '#f9f9f9', borderRadius: '12px', padding: '8px' }}>
          {selectedLot?.bids && selectedLot.bids.length > 0 ? (
            selectedLot.bids.map((b, idx) => {
              const bName = b.user?.customName || b.user?.firstName || `ID: ${b.userId}`;
              return (
                <div key={b.id} className="bid-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 8px', borderBottom: idx === selectedLot.bids.length - 1 ? 'none' : '1px solid #eee' }}>
                  <span style={{ fontWeight: idx === 0 ? 'bold' : 'normal', color: idx === 0 ? '#2e7d32' : '#333' }}>
                    {idx === 0 ? '👑 ' : ''}{bName}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>{b.amount?.toLocaleString('ru-RU')} ₽</span>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', color: '#888', margin: '16px 0' }}>Нет ставок</p>
          )}
        </div>
      </div>

      {canReview && !userReview && (
        <button className="btn-review" onClick={() => setCurrentScreen('writeReview')} style={{ width: '100%', padding: '14px', background: '#ffcc00', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
          ⭐ Оставить отзыв {isSeller ? 'покупателю' : 'продавцу'}
        </button>
      )}

      {userReview && (
        <div style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', textAlign: 'center', background: userReview.status === 'REJECTED' ? '#ffebee' : userReview.status === 'MODERATION' ? '#fff8e1' : '#e8f5e9' }}>
          {userReview.status === 'ACTIVE' && <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓ Ваш отзыв опубликован</span>}
          {userReview.status === 'MODERATION' && <span style={{ color: '#f57f17', fontWeight: 'bold' }}>⏳ Отзыв проверяется модератором</span>}
          {userReview.status === 'REJECTED' && (
            <><span style={{ color: '#c62828', fontWeight: 'bold' }}>❌ Отзыв отклонен</span></>
          )}
        </div>
      )}
    </div>
  );
}
export default CompletedLot;