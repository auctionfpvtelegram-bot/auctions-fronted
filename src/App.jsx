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
import Messenger from './screens/Messenger';
import FAQ from './screens/FAQ'; // ⚡ ИМПОРТ FAQ ДОБАВЛЕН

// ⚡ Получаем данные Telegram мгновенно, до рендера, чтобы избежать лагов интерфейса
const getInitialTelegramUser = () => {
  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user || { id: '7688251487', username: 'neffec', first_name: 'Admin' };
  return {
    id: String(tgUser.id),
    firstName: tgUser.first_name || 'Гость',
    rating: 0.0,
    dealsCount: 0,
    isBanned: false,
    banReason: null,
    banScope: null,
    banUntil: null,
    customName: null,
    avatarUrl: null,
    profileStatus: 'APPROVED',
    profileRejectReason: null
  };
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedLot, setSelectedLot] = useState(null);
  const [currentUser, setCurrentUser] = useState(getInitialTelegramUser());
  const [isAdmin, setIsAdmin] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [publicProfileData, setPublicProfileData] = useState(null);
  const [publicProfileReferrer, setPublicProfileReferrer] = useState(null);
  const [activeChatPartnerId, setActiveChatPartnerId] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ⚡ Загружаем полные данные юзера с бэкенда в фоновом режиме
  const refreshCurrentUser = () => {
    fetch(`${API_URL}/api/users/${currentUser.id}/public`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setCurrentUser(prev => ({
            ...prev,
            rating: data.rating || prev.rating,
            customName: data.customName || prev.customName,
            avatarUrl: data.avatarUrl || prev.avatarUrl,
            profileStatus: data.profileStatus || prev.profileStatus,
            profileRejectReason: data.profileRejectReason || prev.profileRejectReason,
            isBanned: data.isBanned || false,
            banReason: data.banReason || null,
            banScope: data.banScope || null,
            banUntil: data.banUntil || null
          }));
        }
      })
      .catch(err => console.error("Ошибка обновления юзера:", err));
  };

  useEffect(() => {
    fetch(`${API_URL}/api/admin/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));

    refreshCurrentUser();
  }, [currentUser.id]);

  useEffect(() => {
    const fetchNotifs = () => {
      fetch(`${API_URL}/api/users/${currentUser.id}/notifications`)
        .then(res => res.json())
        .then(data => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentScreen]);

  const [favoriteLots, setFavoriteLots] = useState(() => {
    const saved = localStorage.getItem('fpv_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (lot) => {
    let updated;
    if (favoriteLots.some(f => f.id === lot.id)) {
      updated = favoriteLots.filter(f => f.id !== lot.id);
    } else {
      updated = [...favoriteLots, lot];
    }
    setFavoriteLots(updated);
    localStorage.setItem('fpv_favorites', JSON.stringify(updated));
  };

  const handleOpenPublicProfile = (userId, referrer) => {
    fetch(`${API_URL}/api/users/${userId}/public`)
      .then(res => res.json())
      .then(data => {
        setPublicProfileData(data);
        setPublicProfileReferrer(referrer);
        setCurrentScreen('publicProfile');
      })
      .catch(err => {
        console.error(err);
        setAlertData({ message: 'Ошибка при загрузке профиля' });
      });
  };

  return (
    <div className="App">
      {/* ГЛОБАЛЬНЫЙ БАР НАВИГАЦИИ (Виден всегда) */}
      <div className="top-nav-bar" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', zIndex: 100 }}>
        
        {/* Логотип */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setCurrentScreen('home')}>
          <div style={{ background: '#ffcc00', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🚁</div>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#111', letterSpacing: '-0.5px' }}>Аукцион</span>
        </div>

        {/* Правые иконки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setCurrentScreen('messenger')}>
            <span style={{ fontSize: '24px', color: currentScreen === 'messenger' ? '#ffcc00' : '#333' }}>💬</span>
          </div>

          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsNotifOpen(true)}>
            <span style={{ fontSize: '24px', color: '#333' }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#e53935', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: currentScreen === 'profile' ? '#ffcc00' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', border: currentScreen === 'profile' ? '2px solid #ffcc00' : '2px solid transparent' }} onClick={() => setCurrentScreen('profile')}>
            <span style={{ fontSize: '18px' }}>👤</span>
          </div>
        </div>
      </div>

      {isNotifOpen && (
        <NotificationsPanel 
          notifications={notifications} 
          onClose={() => setIsNotifOpen(false)} 
          userId={currentUser.id}
          onRead={(id) => {
            if (id === 'ALL') {
              setNotifications(notifications.map(n => ({...n, isRead: true})));
            } else {
              setNotifications(notifications.map(n => n.id === id ? {...n, isRead: true} : n));
            }
          }} 
        />
      )}

      {/* Отступ под фиксированный бар */}
      <div style={{ height: '60px' }}></div>

      {/* ОТОБРАЖЕНИЕ ЭКРАНОВ */}
      {currentScreen === 'home' && <Home setCurrentScreen={setCurrentScreen} setSelectedLot={setSelectedLot} favoriteLots={favoriteLots} toggleFavorite={toggleFavorite} />}
      {currentScreen === 'profile' && <Profile setCurrentScreen={setCurrentScreen} currentUser={currentUser} isAdmin={isAdmin} setSelectedLot={setSelectedLot} favoriteLots={favoriteLots} toggleFavorite={toggleFavorite} handleOpenPublicProfile={handleOpenPublicProfile} />}
      {currentScreen === 'activeLot' && <ActiveLot setCurrentScreen={setCurrentScreen} selectedLot={selectedLot} currentUser={currentUser} isAdmin={isAdmin} isFavorite={favoriteLots.some(f => f.id === selectedLot?.id)} toggleFavorite={toggleFavorite} handleOpenPublicProfile={handleOpenPublicProfile} />}
      {currentScreen === 'addLot' && <AddLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}
      {currentScreen === 'adminDashboard' && <Admin setCurrentScreen={setCurrentScreen} currentUser={currentUser} setAlertData={setAlertData} />}
      
      {/* ⚡ ДОБАВЛЕН ЭКРАН FAQ */}
      {currentScreen === 'faq' && <FAQ setCurrentScreen={setCurrentScreen} />}

      {currentScreen === 'completedLot' && <CompletedLot setCurrentScreen={setCurrentScreen} selectedLot={selectedLot} currentUser={currentUser} isFavorite={favoriteLots.some(f => f.id === selectedLot?.id)} toggleFavorite={toggleFavorite} handleOpenPublicProfile={handleOpenPublicProfile} />}
      {currentScreen === 'feedback' && <Feedback setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}
      {currentScreen === 'publicProfile' && <PublicProfile setCurrentScreen={setCurrentScreen} currentUser={currentUser} publicProfileData={publicProfileData} referrer={publicProfileReferrer} setActiveChatPartnerId={setActiveChatPartnerId} />}
      {currentScreen === 'rejectedLot' && <RejectedLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} lot={selectedLot} setAlertData={setAlertData} />}
      {currentScreen === 'settings' && <Settings setCurrentScreen={setCurrentScreen} currentUser={currentUser} setAlertData={setAlertData} refreshCurrentUser={refreshCurrentUser} />}
      {currentScreen === 'writeReview' && <WriteReview setCurrentScreen={setCurrentScreen} currentUser={currentUser} selectedLot={selectedLot} setAlertData={setAlertData} />}
      {currentScreen === 'ticketHistory' && <TicketHistory setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}

      {currentScreen === 'messenger' && (
        <Messenger
          setCurrentScreen={setCurrentScreen}
          currentUser={currentUser}
          activeChatPartnerId={activeChatPartnerId}
          setActiveChatPartnerId={setActiveChatPartnerId}
          handleOpenPublicProfile={handleOpenPublicProfile}
        />
      )}
    </div>
  );
}

export default App;