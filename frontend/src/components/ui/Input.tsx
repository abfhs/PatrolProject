import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  variant?: 'default' | 'inline';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ containerClassName, variant = 'default', className, ...props }, ref) => {
    const containerClass = variant === 'inline' 
      ? `${styles.inputContainer} ${containerClassName || ''}` 
      : `${styles.inputArea} ${containerClassName || ''}`;
    
    const inputClass = `${styles.input} ${className || ''}`;

    if (variant === 'inline') {
      return (
        <input
          ref={ref}
          className={inputClass}
          {...props}
        />
      );
    }

    return (
      <div className={containerClass}>
        <input
          ref={ref}
          className={inputClass}
          {...props}
        />
      </div>
    );
  }
);