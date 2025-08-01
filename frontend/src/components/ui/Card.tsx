import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  variant?: 'login' | 'signup' | 'main';
  className?: string;
}

export const Card = ({ children, variant = 'main', className }: CardProps) => {
  const cardClasses = [
    styles.card,
    variant === 'login' && styles.loginCard,
    variant === 'signup' && styles.signupCard,
    variant === 'main' && styles.mainCard,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};