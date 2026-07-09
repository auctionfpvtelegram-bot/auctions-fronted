import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function FAQ({ setCurrentScreen }) {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/faq`)
      .then(res => res.json())
      .then(data => {
        setFaqs(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Ошибка загрузки FAQ:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div style={{ padding: '0 16px', paddingBottom: '40px' }}>
      <div className="screen-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <button className="back-btn" onClick={() => setCurrentScreen('profile')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', paddingRight: '12px' }}>{'<'}</button>
        <h2 className="screen-title" style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>Частые вопросы</h2>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>Загрузка вопросов...</div>
      ) : faqs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>Список вопросов пока пуст.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map(faq => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id} 
                style={{ 
                  background: '#fff', 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <div 
                  onClick={() => toggleOpen(faq.id)}
                  style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    background: isOpen ? '#f8fafc' : '#fff'
                  }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#111', lineHeight: '1.3', paddingRight: '12px' }}>
                    {faq.question}
                  </span>
                  <span style={{ fontSize: '18px', color: '#1976d2', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
                    ▼
                  </span>
                </div>
                
                {isOpen && (
                  <div style={{ padding: '0 16px 16px 16px', fontSize: '14px', color: '#444', lineHeight: '1.5', background: '#f8fafc', whiteSpace: 'pre-wrap' }}>
                    <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FAQ;