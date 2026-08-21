import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean };

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { hasError, className, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-with-icon">
      <Lock size={16} />
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`form-input ${hasError ? 'has-error' : ''} ${className ?? ''}`}
        style={{ paddingRight: 40 }}
        {...rest}
      />
      <button
        type="button"
        className="input-icon-action"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
});
