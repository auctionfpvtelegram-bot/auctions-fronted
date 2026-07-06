import React from 'react';

export function AdminLots({ adminLotsList, adminActiveTab, setAdminActiveTab, setAdminScreen, setAdminModal }) {
  // Фильтруем лоты по выбранной вкладке
  const filteredLots = adminLotsList.filter(lot => {
    if (adminActiveTab === 'check') return lot.status === 'MODERATION' || lot.status === 'AWAITING_PHOTOS';
    if (adminActiveTab === 'active') return lot.status === 'ACTIVE';
    return lot.status === 'COMPLETED' || lot.status === 'REJECTED';
  });

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <button onClick={() => setAdminScreen('dashboard')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', marginBottom: '16px', cursor: 'pointer' }}>← В меню</button>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📦 Модерация лотов</h3>

      {/* Табы */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {['check', 'active', 'archive'].map((tab) => (
          <button key={tab} onClick={() => setAdminActiveTab(tab)} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: '8px', background: adminActiveTab === tab ? '#1976d2' : '#e0e0e0', color: adminActiveTab === tab ? '#fff' : '#333', fontWeight: '500', fontSize: '12px' }}>
            {tab === 'check' ? 'На проверке' : tab === 'active' ? 'Активные' : 'Архив'}
          </button>
        ))}
      </div>

      {/* Список карточек лотов */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredLots.map(lot => (
          <div key={lot.id} onClick={() => setAdminModal({ type: 'lotDetail', data: lot })} style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #eee', cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {lot.photos?.[0] && <img src={lot.photos[0]} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '14px' }}>{lot.title}</h4>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>ID: {lot.id} | Текущая: {lot.currentPrice} ₽</div>
                <div style={{ fontSize: '11px', color: lot.status === 'MODERATION' ? '#ef6c00' : '#2e7d32', marginTop: '4px', fontWeight: 'bold' }}>{lot.status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}