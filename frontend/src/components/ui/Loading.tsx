import styles from './Loading.module.css';

interface LoadingProps {
  text?: string;
  show: boolean;
}

export const Loading = ({ text = '로딩중입니다', show }: LoadingProps) => {
  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <div className={styles.text}>{text}</div>
      </div>
    </div>
  );
};