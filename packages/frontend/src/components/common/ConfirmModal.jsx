import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'primary', // 'primary' | 'danger'
  isLoading = false,
}) => {
  if (!isOpen) return null

  const isDanger = variant === 'danger'

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose()
      }}
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-violet-100 text-violet-600'
              }`}
            >
              {isDanger ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
                : 'bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300'
            }`}
          >
            {isLoading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmModal
