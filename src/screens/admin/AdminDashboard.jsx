import React from 'react';

export function AdminDashboard({ adminStats, globalBanner, setGlobalBanner, setAdminScreen, API_URL, setAlertData }) {
  const handleSaveSettings = () => {
    fetch(`${API_URL}/api/admin/system-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(globalBanner)
    })
    .then(res => res.json())
    .then(() => setAlertData({ message: '✅ Системные настройки успешно сохранены!', onClose: () => {} }))
    .catch(() => setAlertData({ message: '❌ Ошибка сохранения настроек', onClose: () => {} }));
  };

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh', boxSizing: 'border-box' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 'bold', color: '#111' }}>👑 Панель модератора</h2>

      {/* 📊 Статистика */}
      {adminStats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Всего пользователей</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111' }}>{adminStats.totalUsers}</span>
          </div>
          <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Лотов (Актив/Всего)</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>{adminStats.activeLots} / {adminStats.totalLots}</span>
          </div>
          <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #eee', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Оборот (Сумма выкупов)</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>{adminStats.totalVolume?.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Отзывов на модерации</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbc02d' }}>{adminStats.reviewsPending}</span>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ ВОТ ОНА — КНОПКА FAQ ПРЯМО ПОД СТАТИСТИКОЙ */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setAdminScreen('faq')} 
          style={{ width: '100%', padding: '14px', background: '#1976d2', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)' }}
        >
          <span style={{ fontSize: '18px' }}>💡</span> Управление Базой Знаний (F.A.Q.)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setAdminScreen('lots')} style={{ padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📦 Модерация лотов</button>
        <button onClick={() => setAdminScreen('reviews')} style={{ padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>⭐ Модерация отзывов</button>
        <button onClick={() => setAdminScreen('profiles')} style={{ padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>👤 Модерация профилей</button>
        <button onClick={() => setAdminScreen('users')} style={{ padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>👥 Пользователи / Бан</button>
        <button onClick={() => setAdminScreen('tickets')} style={{ padding: '14px', background: '#111', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', gridColumn: 'span 2' }}>🎧 Обращения (Тикеты)</button>
      </div>

      {/* ⚙️ Интеграция с Telegram */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #eee' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>⚙️ Интеграция с Telegram</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>Дублировать лоты в Канал</span>
          <input type="checkbox" checked={globalBanner.isChannelOn ?? true} onChange={(e) => setGlobalBanner({ ...globalBanner, isChannelOn: e.target.checked })} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>Дублировать лоты в Группу-форум</span>
          <input type="checkbox" checked={globalBanner.isGroupOn ?? true} onChange={(e) => setGlobalBanner({ ...globalBanner, isGroupOn: e.target.checked })} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
        </div>
        <button onClick={handleSaveSettings} style={{ width: '100%', padding: '12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          💾 Сохранить настройки интеграции
        </button>
      </div>
    </div>
  );
}