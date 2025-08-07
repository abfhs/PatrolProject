import type { ReactNode } from 'react';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  showMyPageBtn?: boolean;
  showLoginBtn?: boolean;
}

export const Layout = ({ children, showMyPageBtn, showLoginBtn }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header showMyPageBtn={showMyPageBtn} showLoginBtn={showLoginBtn} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};