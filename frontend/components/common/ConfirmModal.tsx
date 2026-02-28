"use client"

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-foreground text-base font-medium text-center mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-border bg-background text-muted-foreground font-medium hover:bg-muted transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
