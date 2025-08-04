import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminUser');
    document.cookie = 'adminRefreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    navigate('/admin/login');
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <div className={styles.adminLayout}>
      {/* 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>Admin Panel</h2>
          <p className={styles.subtitle}>시스템 관리</p>
        </div>

        <nav className={styles.navigation}>
          <button 
            className={styles.navItem}
            onClick={() => navigate('/admin/dashboard')}
          >
            <span className={styles.navIcon}>📊</span>
            <span>대시보드</span>
          </button>
          
          <button 
            className={styles.navItem}
            onClick={() => navigate('/admin/users')}
          >
            <span className={styles.navIcon}>👥</span>
            <span>사용자 관리</span>
          </button>
          
          <button 
            className={styles.navItem}
            onClick={() => navigate('/admin/schedules')}
          >
            <span className={styles.navIcon}>📅</span>
            <span>스케줄 관리</span>
          </button>
          
          <button 
            className={styles.navItem}
            onClick={() => navigate('/admin/logs')}
          >
            <span className={styles.navIcon}>📋</span>
            <span>로그 관리</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>👤</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{adminUser.nickname || 'Admin'}</div>
              <div className={styles.userRole}>관리자</div>
            </div>
          </div>
          
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            🚪 로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.menuToggle}
              onClick={() => {/* 모바일 메뉴 토글 */}}
            >
              ☰
            </button>
          </div>
          
          <div className={styles.headerRight}>
            <button 
              className={styles.homeButton}
              onClick={() => navigate('/')}
              title="메인 사이트로 이동"
            >
              🏠 메인 사이트
            </button>
          </div>
        </header>

        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
};