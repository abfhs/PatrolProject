import styles from './Loading.module.css';

interface CrawlLoadingProps {
  show: boolean;
}

export const CrawlLoading = ({ show }: CrawlLoadingProps) => {
  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <div className={styles.dots}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
        <div className={styles.text}>인터넷등기소에서 정보를 가져오는 중입니다.</div>
      </div>
    </div>
  );
};