import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'

const ConfirmModal = ({
  isOpen,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'primary', // 'primary' | 'danger'
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  const isDanger = variant === 'danger'

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel?.()
      }}
      className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-rose-100 text-rose-600' : 'bg-violet-100 text-violet-600'
            }`}
          >
            {isDanger ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 ${
              isDanger
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-violet-600 hover:bg-violet-700'
            }`}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmModal
