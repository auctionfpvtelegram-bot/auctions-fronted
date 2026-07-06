import React from 'react';

export function AdminReviews({ adminReviewsList, adminReviewsTab, setAdminReviewsTab, setAdminScreen, setAdminModal }) {
  const filteredReviews = adminReviewsList.filter(r => r.status === adminReviewsTab);

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <button onClick={() => setAdminScreen('dashboard')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', marginBottom: '16px', cursor: 'pointer' }}>← В меню</button>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>⭐ Модерация отзывов</h3>

      {/* Вкладки модерации */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['MODERATION', 'ACTIVE'].map((tab) => (
          <button key={tab} onClick={() => setAdminReviewsTab(tab)} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: '8px', background: adminReviewsTab === tab ? '#0288d1' : '#e0e0e0', color: adminReviewsTab === tab ? '#fff' : '#333', fontWeight: 'bold' }}>
            {tab === 'MODERATION' ? 'Новые' : 'Одобренные'}
          </button>
        ))}
      </div>

      {/* Список */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredReviews.map(rev => (
          <div key={rev.id} onClick={() => setAdminModal({ type: 'reviewDetail', data: rev })} style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #eee', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>От: ID {rev.authorId}</span>
              <span style={{ color: '#ffb300' }}>{'★'.repeat(rev.rating)}</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#555', wordBreak: 'break-word' }}>{rev.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}