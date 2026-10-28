import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let icon = <Info size={18} />;
        let toastClass = 'toast toast-info';

        if (toast.type === 'success') {
          icon = <CheckCircle size={18} />;
          toastClass = 'toast toast-success';
        } else if (toast.type === 'error') {
          icon = <AlertCircle size={18} />;
          toastClass = 'toast toast-error';
        }

        return (
          <div key={toast.id} className={toastClass} role="status">
            {icon}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                opacity: 0.8
              }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
