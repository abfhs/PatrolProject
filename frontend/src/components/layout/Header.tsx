import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
  showMyPageBtn?: boolean;
  showLoginBtn?: boolean;
}

export const Header = ({ showMyPageBtn = false, showLoginBtn = false }: HeaderProps) => {
  const location = useLocation();

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
    </>
  );
};