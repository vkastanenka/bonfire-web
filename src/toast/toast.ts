type ToastSeverity = "success" | "error" | "warning" | "info";

interface ToastEvent {
  message: string;
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

  show(message: string, severity: ToastSeverity = "info") {
    if (this.listener) {
      this.listener({ message, severity });
    }
  }

  success(message: string) {
    this.show(message, "success");
  }
  error(message: string) {
    this.show(message, "error");
  }
  warning(message: string) {
    this.show(message, "warning");
  }
  info(message: string) {
    this.show(message, "info");
  }
}

export const toast = new ToastManager();
