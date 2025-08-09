import type { ReactNode } from 'react';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  showMyPageBtn?: boolean;
  showLoginBtn?: boolean;
  showLogoutBtn?: boolean;
}

export const Layout = ({ children, showMyPageBtn, showLoginBtn, showLogoutBtn }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header showMyPageBtn={showMyPageBtn} showLoginBtn={showLoginBtn} showLogoutBtn={showLogoutBtn} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};