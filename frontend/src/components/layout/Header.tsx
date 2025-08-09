import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css';

interface HeaderProps {
  showMyPageBtn?: boolean;
  showLoginBtn?: boolean;
  showLogoutBtn?: boolean;
}

export const Header = ({ showMyPageBtn = false, showLoginBtn = false, showLogoutBtn = false }: HeaderProps) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      <Link to="/" className={styles.header}>
        Patrol
      </Link>
      {showLoginBtn && (
        <Link to="/login" className={styles.loginBtn}>
          로그인
        </Link>
      )}
      {showMyPageBtn && location.pathname !== '/mypage' && (
        <Link to="/mypage" className={styles.myPageBtn}>
          My Page
        </Link>
      )}
      {showLogoutBtn && (
        <button
          onClick={logout}
          className={styles.logoutBtn}
        >
          로그아웃
        </button>
      )}
    </>
  );
};