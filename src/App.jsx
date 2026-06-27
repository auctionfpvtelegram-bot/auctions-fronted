import { useEffect, useState } from 'react';
import './App.css';

import { API_URL } from './config'; 

import Home from './screens/Home'; 
import Profile from './screens/Profile';
import ActiveLot from './screens/ActiveLot';
import AddLot from './screens/AddLot';
import Admin from './screens/Admin';
import CompletedLot from './screens/CompletedLot';
import Feedback from './screens/Feedback';
import PublicProfile from './screens/PublicProfile';
import RejectedLot from './screens/RejectedLot';
import Settings from './screens/Settings';
import WriteReview from './screens/WriteReview';
import TicketHistory from './screens/TicketHistory';
import NotificationsPanel from './screens/NotificationsPanel';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedLot, setSelectedLot] = useState(null);
  const [favoriteLots, setFavoriteLots] = useState([]);
  
  const [publicProfileData, setPublicProfileData] = useState(null);
  const [publicProfileReferrer, setPublicProfileReferrer] = useState('home');

  const [alertData, setAlertData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [globalBanner, setGlobalBanner] = useState({ isBannerOn: false, bannerText: '' });

  const [currentUser, setCurrentUser] = useState({
    id: null, firstName: 'Гость', rating: 0.0, dealsCount: 0,
    isBanned: false, banReason: null, banScope: null, banUntil: null
  });

  const isAdmin = String(currentUser.id) === '7688251487';

  const handleError = (errorText, location = 'App.jsx') => {
    setAlertData({ message: `❌ Произошла ошибка:\n${errorText}` });
    fetch(`${API_URL}/api/log-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorText: String(errorText), userId: currentUser.id || 'До авторизации', location })
    }).catch(() => {});
  };

  const toggleFavorite = (lot) => {
    setFavoriteLots(prev => {
      if (prev.some(fav => fav.id === lot.id)) return prev.filter(fav => fav.id !== lot.id);
      return [...prev, lot];
    });
  };

  useEffect(() => {
    fetch(`${API_URL}/api/settings`).then(res => res.json()).then(data => setGlobalBanner(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }
    
    const tgUser = tg?.initDataUnsafe?.user || { id: '7688251487', username: 'neffec', first_name: 'Admin' };

    fetch(`${API_URL}/api/auth`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tgUser) })
      .then(res => res.json())
      .then(user => setCurrentUser({
          id: String(user.id), firstName: user.firstName || 'Гость', rating: user.rating || 0.0,
          dealsCount: user.dealsCount || 0, isBanned: user.isBanned, banReason: user.banReason,
          banScope: user.banScope, banUntil: user.banUntil
      }))
      .catch(err => handleError(err.message, 'Авторизация'));
  }, []);

  useEffect(() => {
    if (currentUser.id) {
      const fetchNotifs = () => fetch(`${API_URL}/api/users/${currentUser.id}/notifications`).then(res => res.json()).then(data => setNotifications(Array.isArray(data) ? data : []));
      fetchNotifs(); 
      const interval = setInterval(fetchNotifs, 10000); 
      return () => clearInterval(interval);
    }
  }, [currentUser.id]);

  const handleOpenPublicProfile = (userId, referrer) => {
    if (!userId) return;
    setPublicProfileReferrer(referrer);
    fetch(`${API_URL}/api/users/${userId}/public?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => { setPublicProfileData(data); setCurrentScreen('publicProfile'); })
      .catch(err => handleError(err.message, 'Загрузка профиля'));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ⚡ Логика динамического заголовка
  const getPageTitle = () => {
    switch(currentScreen) {
      case 'home': return 'Аукционы дронов';
      case 'profile': return 'Личный кабинет';
      case 'activeLot': return `Лот #${selectedLot?.id || ''}`;
      case 'addLot': return 'Создание лота';
      case 'adminDashboard': return 'Панель модератора';
      case 'completedLot': return 'Завершенный лот';
      case 'feedback': return 'Новое обращение';
      case 'publicProfile': return 'Профиль пользователя';
      case 'rejectedLot': return 'Отклоненный лот';
      case 'settings': return 'Настройки';
      case 'writeReview': return 'Оставить отзыв';
      case 'ticketHistory': return 'Поддержка';
      default: return 'Аукцион';
    }
  };

  // ⚡ Логика кнопки "Назад" в докбаре
  const handleBackClick = () => {
    if (['activeLot', 'completedLot', 'rejectedLot', 'publicProfile', 'ticketHistory', 'settings', 'adminDashboard', 'feedback'].includes(currentScreen)) {
      setCurrentScreen('profile');
    } else if (currentScreen === 'writeReview') {
      setCurrentScreen('completedLot');
    } else {
      setCurrentScreen('home');
    }
  };

  return (
    <div className="app-container" style={{ paddingTop: globalBanner.isBannerOn ? '100px' : '60px' }}>
      
      {globalBanner.isBannerOn && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: '#ff9800', color: '#fff', padding: '10px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          📢 {globalBanner.bannerText}
        </div>
      )}

      {/* ⚡ ГЛОБАЛЬНЫЙ ДОКБАР */}
      <div style={{
        position: 'fixed', top: globalBanner.isBannerOn ? '40px' : '0', left: 0, width: '100%',
        background: '#fff', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', zIndex: 999, boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           {currentScreen !== 'home' && (
              <button onClick={handleBackClick} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 8px 0 0', color: '#111', lineHeight: 1 }}>{'<'}</button>
           )}
           <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{getPageTitle()}</h2>
        </div>
        
        {currentUser.id && currentScreen !== 'adminDashboard' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsNotifOpen(true)}>
                <span style={{ fontSize: '22px' }}>🔔</span>
                {unreadCount > 0 && (
                   <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#c62828', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {unreadCount}
                   </span>
                )}
             </div>
             <div style={{ cursor: 'pointer', fontSize: '22px' }} onClick={() => setCurrentScreen('profile')}>
                👤
             </div>
          </div>
        )}
      </div>

      {isNotifOpen && (
        <NotificationsPanel notifications={notifications} userId={currentUser.id} onClose={() => setIsNotifOpen(false)} onRead={() => setNotifications(notifications.map(n => ({...n, isRead: true})))} />
      )}
         
      {currentScreen === 'home' && <Home setCurrentScreen={setCurrentScreen} setSelectedLot={setSelectedLot} favoriteLots={favoriteLots} toggleFavorite={toggleFavorite} isAdmin={isAdmin} />}
      {currentScreen === 'profile' && <Profile setCurrentScreen={setCurrentScreen} currentUser={currentUser} isAdmin={isAdmin} setSelectedLot={setSelectedLot} favoriteLots={favoriteLots} toggleFavorite={toggleFavorite} handleOpenPublicProfile={handleOpenPublicProfile} />}
      {currentScreen === 'activeLot' && <ActiveLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} lot={selectedLot} />}
      {currentScreen === 'addLot' && <AddLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}
      {currentScreen === 'adminDashboard' && <Admin setCurrentScreen={setCurrentScreen} currentUser={currentUser} setAlertData={setAlertData} setConfirmData={setConfirmData} />}
      {currentScreen === 'completedLot' && <CompletedLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} selectedLot={selectedLot} isFavorite={favoriteLots.some(fav => fav.id === selectedLot?.id)} toggleFavorite={toggleFavorite} handleOpenPublicProfile={handleOpenPublicProfile} />}
      {currentScreen === 'feedback' && <Feedback setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}
      {currentScreen === 'publicProfile' && <PublicProfile setCurrentScreen={setCurrentScreen} currentUser={currentUser} publicProfileData={publicProfileData} referrer={publicProfileReferrer} />}
      {currentScreen === 'rejectedLot' && <RejectedLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} lot={selectedLot} />}
      {currentScreen === 'settings' && <Settings setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}
      {currentScreen === 'writeReview' && <WriteReview setCurrentScreen={setCurrentScreen} currentUser={currentUser} selectedLot={selectedLot} setAlertData={setAlertData} />}
      {currentScreen === 'ticketHistory' && <TicketHistory setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}

    </div>
  );
}

export default App;