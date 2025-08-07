import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
  showMyPageBtn?: boolean;
}

export const Header = ({ showMyPageBtn = false }: HeaderProps) => {
  const location = useLocation();

  return (
    <>
      <Link to="/admin/login" className={styles.header}>
        Patrol
      </Link>
      {showMyPageBtn && location.pathname !== '/mypage' && (
        <Link to="/mypage" className={styles.myPageBtn}>
          My Page
        </Link>
      )}
    </>
  );
};