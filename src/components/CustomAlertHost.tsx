import { useEffect, useMemo, useRef, useState } from 'react';
import type { AlertPayload } from '../lib/customAlert';
import { registerAlertListener } from '../lib/customAlert';

interface AlertButton {
  text: string;
  className: string;
  callback?: () => void;
}

interface AlertViewModel {
  title: string;
  message: string;
  buttons: AlertButton[];
}

const CLOSE_ANIMATION_MS = 250;

export default function CustomAlertHost() {
  const [payload, setPayload] = useState<AlertPayload | null>(null);
  const [isActive, setIsActive] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    registerAlertListener((nextPayload) => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      setPayload(nextPayload);
      setIsActive(true);
    });

    return () => {
      registerAlertListener(null);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const closeModal = () => {
    setIsActive(false);
    closeTimerRef.current = setTimeout(() => {
      setPayload(null);
      closeTimerRef.current = null;
    }, CLOSE_ANIMATION_MS);
  };

  const viewModel = useMemo<AlertViewModel>(() => {
    const type = payload?.type;
    const onConfirm = payload?.onConfirm;
    const options = payload?.options;

    const withDefaults = (title: string, message: string, buttons: AlertButton[]): AlertViewModel => ({
      title: options?.title ?? title,
      message: options?.message ?? message,
      buttons,
    });

    switch (type) {
      case 'signin-required':
        return withDefaults('Sign In Required', 'Please sign in first to open cart.', [
          { text: 'Close', className: 'alert-btn-secondary' },
          { text: 'Sign In', className: 'alert-btn-primary', callback: onConfirm },
        ]);
      case 'login-success':
        return withDefaults('Success', 'Login Successful!', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm },
        ]);
      case 'confirm-cancel':
        return withDefaults('Confirmation', 'Are you sure you want to cancel this payment?', [
          { text: 'No', className: 'alert-btn-secondary', callback: options?.onCancel },
          { text: 'Yes, Cancel', className: 'alert-btn-danger', callback: onConfirm },
        ]);
      case 'order-cancelled':
        return withDefaults('Order Cancelled', 'Order cancelled successfully. Click OK to return Product page.', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm },
        ]);
      case 'timeout':
        return withDefaults('Payment Timeout', 'Payment timeout after 2 minutes. Order cancelled and returning to Home page.', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm },
        ]);
      case 'registration-success':
        return withDefaults('Success', 'Registration Successful! Please sign in.', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm },
        ]);
      case 'order-success':
        if (options?.onCancel) {
          return withDefaults('Order Success', 'Your order was successful.', [
            {
              text: options.cancelText ?? 'No',
              className: 'alert-btn-secondary',
              callback: options.onCancel,
            },
            {
              text: options.confirmText ?? 'Yes',
              className: 'alert-btn-primary',
              callback: onConfirm,
            },
          ]);
        }
        return withDefaults('Order Success', 'Your order was successful.', [
          { text: options?.confirmText ?? 'OK', className: 'alert-btn-primary', callback: onConfirm },
        ]);
      case 'info':
      default:
        return withDefaults('Notification', '', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm },
        ]);
    }
  }, [payload]);

  return (
    /* 🔴 mobile-typography-fix class ကို အပြင်ဘက်ဆုံး overlay တွင် ထည့်သွင်းပေးထားပါသည် 🔴 */
    <div
      id="customAlertOverlay"
      className={`custom-alert-overlay mobile-typography-fix ${isActive ? 'active' : ''}`}
      aria-hidden={!isActive}
    >
      <div
        className="custom-alert-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alertTitle"
        aria-describedby="alertMessage"
      >
        <h3 id="alertTitle" className="alert-title">
          {viewModel.title}
        </h3>

        <p id="alertMessage" className="alert-message">
          {viewModel.message}
        </p>

        <div id="alertBtnGroup" className="alert-btn-group">
          {viewModel.buttons.map((button, index) => (
            <button
              key={`${button.text}-${index}`}
              type="button"
              className={`alert-btn ${button.className}`}
              onClick={() => {
                closeModal();
                button.callback?.();
              }}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}