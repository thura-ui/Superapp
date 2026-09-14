import { useEffect, useMemo, useRef, useState } from 'react';
import type { AlertPayload } from '../lib/customAlert';
import { registerAlertListener } from '../lib/customAlert';

interface AlertButton {
  text: string;
  className: string;
  callback?: () => void;
}

interface AlertViewModel {
  title?: string;
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

    const withDefaults = (title: string | undefined, message: string, buttons: AlertButton[]): AlertViewModel => ({
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

      case 'confirm-cancel':
        return withDefaults('Confirmation', 'Are you sure you want to cancel this payment?', [
          { text: 'No', className: 'alert-btn-secondary', callback: options?.onCancel },
          { text: 'Yes, Cancel', className: 'alert-btn-danger', callback: onConfirm },
        ]);

      case 'login-success':
        return withDefaults('Success', 'Login Successful!', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm }
        ]);

      case 'order-cancelled':
        return withDefaults('Order Cancelled', 'Order cancelled successfully.', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm }
        ]);

      case 'timeout':
        return withDefaults('Payment Timeout', 'Payment timeout. Returning to Home page.', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm }
        ]);

      case 'registration-success':
        return withDefaults('Success', 'Registration Successful! Please sign in.', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm }
        ]);

      case 'restart-password-success':
        return withDefaults('Success', 'Your Restart Password is Success', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm }
        ]);

      case 'forgot-password-success':
      case 'check-email':
        return withDefaults('Check Your Email', 'Please check your email. We have sent a password reset link.', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm }
        ]);

      /* 🔴 [FIXED]: Order/Payment အောင်မြင်ပါက OK ခလုတ်ပါသော ပေါ့ပ်အပ် ပြသပေးမည် 🔴 */
      case 'confirm-order-success':
      case 'order-success':
        return withDefaults('Payment Successful', 'သင့်ရဲ့ ငွေပေးချေမှု အောင်မြင်သွားပါပြီ။', [
          { text: 'OK', className: 'alert-btn-primary', callback: onConfirm }
        ]);

      case 'info':
      default:
        return {
          title: options?.title ?? 'Notification',
          message: typeof payload === 'string' ? payload : (options?.message ?? ''),
          buttons: [
            { text: options?.confirmText ?? 'OK', className: 'alert-btn-primary', callback: onConfirm }
          ],
        };
    }
  }, [payload]);

  return (
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
        {viewModel.title && (
          <h3 id="alertTitle" className="alert-title">
            {viewModel.title}
          </h3>
        )}

        {viewModel.message && (
          <p id="alertMessage" className="alert-message text-center py-2">
            {viewModel.message}
          </p>
        )}

        {viewModel.buttons.length > 0 && (
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
        )}
      </div>
    </div>
  );
}