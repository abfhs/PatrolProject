import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'small';
  isInline?: boolean;
  children: ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'default',
  isInline = false,
  className,
  children, 
  ...props 
}: ButtonProps) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    size === 'small' && styles.small,
    isInline && styles.inline,
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};