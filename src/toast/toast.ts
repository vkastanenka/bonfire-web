type ToastSeverity = "success" | "error" | "warning" | "info";

interface ToastEvent {
  message: string;
  description?: string | string[];
  severity: ToastSeverity;
}

type ToastListener = (event: ToastEvent | null) => void;

class ToastManager {
  private listener: ToastListener | null = null;

  subscribe(listener: ToastListener) {
    this.listener = listener;
    return () => {
      this.listener = null;
    };
  }

  show(
    message: string,
    severity: ToastSeverity = "info",
    description?: string | string[],
  ) {
    if (this.listener) {
      this.listener({ message, description, severity });
    }
  }

  success(message: string, description?: string | string[]) {
    this.show(message, "success", description);
  }
  error(message: string, description?: string | string[]) {
    this.show(message, "error", description);
  }
  warning(message: string, description?: string | string[]) {
    this.show(message, "warning", description);
  }
  info(message: string, description?: string | string[]) {
    this.show(message, "info", description);
  }
}

export const toast = new ToastManager();
