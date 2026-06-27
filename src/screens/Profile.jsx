import React, { useState, useEffect } from 'react';
import { API_URL } from '../config'; 

function Profile({ 
  setCurrentScreen = () => {}, 
  currentUser = {}, 
  isAdmin = false, 
  setSelectedLot = () => {}, 
  favoriteLots = [], 
  toggleFavorite = () => {}, 
  handleOpenPublicProfile = () => {} 
}) {
  const [activeProfileTab, setActiveProfileTab] = useState('lots');
  const [myLots, setMyLots] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !currentUser.id || currentUser.id === 'Загрузка...') return;

    setIsLoading(true);
    fetch(`${API_URL}/api/users/${currentUser.id}/profile?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setMyLots(Array.isArray(data.myLots) ? data.myLots : []);
        setMyBids(Array.isArray(data.myBids) ? data.myBids : []);
      })
      .catch(() => { setMyLots([]); setMyBids([]); })
      .finally(() => setIsLoading(false));
  }, [currentUser.id]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE': return <span className="badge badge-active">🟢 Активен</span>;
      case 'MODERATION': return <span className="badge" style={{background: '#fff3e0', color: '#ff9800', border: '1px solid #ff9800'}}>⏳ На проверке</span>;
      case 'REJECTED': return <span className="badge badge-ended">🔴 Отклонен</span>;
      case 'COMPLETED': return <span className="badge badge-ended">🏁 Завершен</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const openLotDetails = (lot) => {
    setSelectedLot(lot);
    if (lot.status === 'REJECTED') setCurrentScreen('rejectedLot');
    else if (lot.status === 'COMPLETED') setCurrentScreen('completedLot');
    else setCurrentScreen('activeLot');
  };

  const isBanActive = currentUser.isBanned && currentUser.banUntil && new Date(currentUser.banUntil) > new Date();

  return (
    <>
      {isBanActive && (
        <div style={{ background: '#ffebee', padding: '16px', margin: '16px', borderRadius: '12px', border: '1px solid #ef9a9a' }}>
          <h3 style={{ color: '#c62828', marginTop: 0, marginBottom: '8px', fontSize: '16px' }}>🚫 Ограничение аккаунта</h3>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#111' }}><strong>Причина:</strong> {currentUser.banReason || 'Нарушение правил'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#111' }}><strong>Что запрещено:</strong> {currentUser.banScope === 'BIDS' ? 'Делать ставки' : currentUser.banScope === 'LOTS' ? 'Создавать лоты' : 'Создавать лоты и делать ставки'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#111' }}><strong>Снятие ограничений:</strong> {new Date(currentUser.banUntil).toLocaleDateString('ru-RU')}</p>
        </div>
      )}
      
      <div className="profile-user-card" style={{ cursor: 'pointer', marginTop: isBanActive ? '0' : '16px' }} onClick={() => handleOpenPublicProfile(currentUser.id, 'profile')}>
        <div className="profile-info">
          <h3 className="profile-name">{currentUser.firstName || 'Гость'} (ID: {currentUser.id || '...'})</h3>
          <div className="profile-rating" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
            <span>⭐️ {currentUser.rating > 0 ? currentUser.rating.toFixed(1) : '0.0'} рейтинг</span>
          </div>
        </div>
      </div>

      {/* ⚡ ОДНА КНОПКА ПОДДЕРЖКИ ВМЕСТО ДВУХ */}
      <div className="profile-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 16px', marginBottom: '16px' }}>
        <button className="action-btn" style={{ margin: 0, background: '#e3f2fd', color: '#1976d2', borderColor: '#bbdefb' }} onClick={() => setCurrentScreen('ticketHistory')}>🎧 Поддержка</button>
        <button className="action-btn" style={{ margin: 0 }} onClick={() => setCurrentScreen('settings')}>⚙️ Настройки</button>
        {isAdmin && (
          <button className="action-btn" style={{ margin: 0, borderColor: '#fbc02d', color: '#fbc02d', gridColumn: 'span 2' }} onClick={() => setCurrentScreen('adminDashboard')}>👑 Админка</button>
        )}
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeProfileTab === 'bids' ? 'active' : ''}`} onClick={() => setActiveProfileTab('bids')}>Мои ставки</button>
        <button className={`tab-btn ${activeProfileTab === 'lots' ? 'active' : ''}`} onClick={() => setActiveProfileTab('lots')}>Мои лоты</button>
        <button className={`tab-btn ${activeProfileTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveProfileTab('favorites')}>Избранное</button>
      </div>

      <div className="profile-list">
        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Загрузка данных...</p>
        ) : (
          <>
            {activeProfileTab === 'lots' && (
              myLots.length === 0 ? (<p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>У вас пока нет лотов</p>) : (
                myLots.map((lot) => (
                  <div key={lot.id} className="profile-list-item" onClick={() => openLotDetails(lot)} style={{ cursor: 'pointer' }}>
                    <div className="item-info">
                      <div className="item-details">
                        <span className="card-lot-id">Лот #{lot.id}</span>
                        <p className="item-title">{lot.title}</p>
                        <p className="item-subtext">Текущая цена: <span className="item-subtext-bold">{lot.currentPrice?.toLocaleString('ru-RU')} ₽</span></p>
                      </div>
                    </div>
                    <div className="item-status-price">{getStatusBadge(lot.status)}</div>
                  </div>
                ))
              )
            )}

            {activeProfileTab === 'bids' && (
              (() => {
                const uniqueBids = [];
                const seenLots = new Set();
                myBids.forEach(bid => {
                  if (!seenLots.has(bid.lotId)) { uniqueBids.push(bid); seenLots.add(bid.lotId); }
                });

                const filteredBids = uniqueBids.filter(bid => {
                  if (bid.lot.status === 'REJECTED') return false;
                  if (bid.lot.status === 'COMPLETED') return bid.lot.bids?.[0]?.userId === currentUser.id;
                  return true; 
                });

                if (filteredBids.length === 0) return <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Вы еще не делали ставок</p>;

                return filteredBids.map((bid) => {
                  const isWinner = bid.lot.status === 'COMPLETED' && bid.lot.bids?.[0]?.userId === currentUser.id;
                  const isLeading = bid.lot.status === 'ACTIVE' && bid.amount >= bid.lot.currentPrice;
                  return (
                    <div key={bid.id} className="profile-list-item" onClick={() => openLotDetails(bid.lot)} style={{ cursor: 'pointer' }}>
                      <div className="item-info">
                        <div className="item-details">
                          <span className="card-lot-id">Лот #{bid.lot.id}</span>
                          <p className="item-title">{bid.lot.title}</p>
                          <p className="item-subtext">Моя ставка: {bid.amount?.toLocaleString('ru-RU')} ₽</p>
                        </div>
                      </div>
                      <div className="item-status-price">
                        {bid.lot.status === 'COMPLETED' && isWinner ? (<span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #2e7d32', fontSize: '11px' }}>🎉 Вы победили</span>) : bid.lot.status === 'ACTIVE' ? (<span className="badge" style={{ background: isLeading ? '#e8f5e9' : '#ffebee', color: isLeading ? '#2e7d32' : '#c62828', border: `1px solid ${isLeading ? '#2e7d32' : '#c62828'}`, fontSize: '11px' }}>{isLeading ? '🏆 Вы лидируете' : '⚠️ Перебили'}</span>) : null}
                      </div>
                    </div>
                  );
                });
              })()
            )}

            {activeProfileTab === 'favorites' && (
              favoriteLots.length === 0 ? (<p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>У вас пока нет избранных лотов</p>) : (
                favoriteLots.map((lot) => (
                  <div key={lot.id} className="profile-list-item" onClick={() => openLotDetails(lot)} style={{ cursor: 'pointer' }}>
                    <div className="item-info">
                      <div className="item-details">
                        <span className="card-lot-id">Лот #{lot.id}</span>
                        <p className="item-title">{lot.title}</p>
                        <p className="item-subtext">Текущая цена: <span className="item-subtext-bold">{lot.currentPrice?.toLocaleString('ru-RU')} ₽</span></p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="item-status-price">{getStatusBadge(lot.status)}</div>
                      <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); toggleFavorite(lot); }}>❤️</button>
                    </div>
                  </div>
                ))
              )
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Profile;