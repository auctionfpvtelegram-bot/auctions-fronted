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

      {/* 🧭 Меню управления */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setAdminScreen('lots')} style={{ width: '100%', height: '48px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          📦 Модерация лотов ({adminStats?.moderationLotsCount || 0})
        </button>
        <button onClick={() => setAdminScreen('reviews')} style={{ width: '100%', height: '48px', background: '#0288d1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          ⭐ Модерация отзывов
        </button>
        {/* ⚡ НОВАЯ КНОПКА: Модерация профилей пользователей */}
        <button onClick={() => setAdminScreen('profiles')} style={{ width: '100%', height: '48px', background: '#7b1fa2', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          👤 Профили на модерации ({adminStats?.moderationProfilesCount || 0})
        </button>
        <button onClick={() => setAdminScreen('tickets')} style={{ width: '100%', height: '48px', background: '#ed6c02', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          🎧 Обращения (Поддержка)
        </button>
        <button onClick={() => setAdminScreen('users')} style={{ width: '100%', height: '48px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          🚫 Блокировка пользователей
        </button>
      </div>

      {/* 📢 Массовое оповещение */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #eee', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 'bold', color: '#333' }}>📢 Массовое оповещение пользователей</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>Показывать баннер всем на главной</span>
          <input type="checkbox" checked={globalBanner.isBannerOn || false} onChange={(e) => setGlobalBanner({ ...globalBanner, isBannerOn: e.target.checked })} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
        </div>
        <input type="text" value={globalBanner.bannerText || ''} onChange={(e) => setGlobalBanner({ ...globalBanner, bannerText: e.target.value })} placeholder="Текст уведомления (например: Тех. работы 15:00)..." style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '10px', padding: '0 12px', marginBottom: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        <input type="text" value={globalBanner.bannerLink || ''} onChange={(e) => setGlobalBanner({ ...globalBanner, bannerLink: e.target.value })} placeholder="Ссылка при клике на баннер (необязательно)..." style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '10px', padding: '0 12px', marginBottom: '5px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
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
        <button onClick={handleSaveSettings} style={{ width: '100%', height: '42px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
          Сохранить конфигурацию
        </button>
      </div>
    </div>
  );
}