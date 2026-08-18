export type AlertType =
  | 'signin-required'
  | 'login-success'
  | 'confirm-cancel'
  | 'order-cancelled'
  | 'timeout'
  | 'registration-success'
  | 'order-success'
  | 'info';

export interface AlertOptions {
  title?: string;
  message?: string;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface AlertPayload {
  type: AlertType;
  onConfirm?: () => void;
  options?: AlertOptions;
}

type AlertListener = (payload: AlertPayload) => void;

let alertListener: AlertListener | null = null;

export const registerAlertListener = (listener: AlertListener | null) => {
  alertListener = listener;
};

export const showAlert = (type: AlertType, onConfirm?: () => void, options?: AlertOptions) => {
  if (!alertListener) {
    console.warn('showAlert called before CustomAlertHost was mounted.');
    if (onConfirm) {
      onConfirm();
    }
    return;
  }

  alertListener({ type, onConfirm, options });
};