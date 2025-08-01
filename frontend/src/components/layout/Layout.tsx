import type { ReactNode } from 'react';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  showMyPageBtn?: boolean;
}

export const Layout = ({ children, showMyPageBtn }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header showMyPageBtn={showMyPageBtn} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};