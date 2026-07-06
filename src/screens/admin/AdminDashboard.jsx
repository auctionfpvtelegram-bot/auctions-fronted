import React from 'react';

export function AdminDashboard({ adminStats, globalBanner, setGlobalBanner, setAdminScreen, API_URL, setAlertData }) {
  
  const handleSaveSettings = () => {
    fetch(`${API_URL}/api/admin/system-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(globalBanner)
    })
    .then(res => res.json())
    .then(() => setAlertData({ message: '✅ Настройки успешно сохранены!', onClose: () => {} }))
    .catch(() => setAlertData({ message: '❌ Ошибка сохранения настроек', onClose: () => {} }));
  };

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 'bold' }}>👑 Панель модератора</h2>
      
      {/* Блок статистики */}
      {adminStats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Всего пользователей</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{adminStats.usersCount}</div>
          </div>
          <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Активных лотов</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{adminStats.activeLotsCount}</div>
          </div>
          <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Успешных сделок</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{adminStats.dealsCount}</div>
          </div>
          <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Общий оборот</span>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: '#2e7d32' }}>{adminStats.totalTurnover?.toLocaleString()} ₽</div>
          </div>
        </div>
      )}

      {/* Кнопки навигации */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        <button onClick={() => setAdminScreen('lots')} style={{ width: '100%', height: '48px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>📦 Модерация лотов</button>
        <button onClick={() => setAdminScreen('reviews')} style={{ width: '100%', height: '48px', background: '#0288d1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>⭐ Модерация отзывов</button>
        <button onClick={() => setAdminScreen('tickets')} style={{ width: '100%', height: '48px', background: '#ed6c02', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>🎧 Обращения (Поддержка)</button>
      </div>

      {/* Управление публикацией и тумблерами */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #eee' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>⚙️ Системные настройки</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '14px' }}>📢 Публикация в Канал</span>
          <input type="checkbox" checked={globalBanner.isChannelOn} onChange={(e) => setGlobalBanner({ ...globalBanner, isChannelOn: e.target.checked })} style={{ width: '20px', height: '20px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px' }}>💬 Публикация в Группу</span>
          <input type="checkbox" checked={globalBanner.isGroupOn} onChange={(e) => setGlobalBanner({ ...globalBanner, isGroupOn: e.target.checked })} style={{ width: '20px', height: '20px' }} />
        </div>

        <button onClick={handleSaveSettings} style={{ width: '100%', height: '40px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Сохранить конфигурацию</button>
      </div>
    </div>
  );
}