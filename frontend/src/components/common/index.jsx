// src/components/common/Spinner.jsx
export function Spinner({ size = 'md', className = '' }) {
  const s = { xs: 'w-3.5 h-3.5 border', sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12 border-[3px]' }[size] || 'w-6 h-6';
  return <div className={`${s} border-2 border-brand-100 border-t-brand-500 rounded-full animate-spin ${className}`}/>;
}

// src/components/common/Modal.jsx
import { useEffect, useCallback } from 'react';

export function Modal({ open, onClose, title, children, size = 'md', noPad = false }) {
  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, close]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-screen-lg' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" onClick={close}/>
      <div className={`relative ${sizes[size]} w-full card shadow-2xl flex flex-col max-h-[90vh] animate-[fadeUp_.2s_ease]`}
           style={{ animation: 'fadeUp .18s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
          <h3 className="font-semibold text-ink text-[15px]">{title}</h3>
          <button onClick={close} className="btn-ghost btn-icon w-8 h-8 rounded-lg text-ink/40 hover:text-ink">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className={`overflow-y-auto flex-1 ${noPad ? '' : 'p-6'}`}>
          {children}
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// Confirm Dialog
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-ink/60 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={danger ? 'btn btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size="xs"/> : null}
          {loading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}

// Empty state
export function Empty({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-30">{icon || '📭'}</div>
      <h3 className="font-semibold text-ink/60 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink/40 mb-5">{description}</p>}
      {action}
    </div>
  );
}

// Field wrapper
export function Field({ label, error, required, children }) {
  return (
    <div>
      {label && (
        <label className="label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );
}

// Pagination
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <div className="flex items-center gap-1.5 justify-end">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="btn btn-secondary btn-sm w-8 h-8 !px-0 disabled:opacity-40">‹</button>
      {pages.map((p, i) => p === '…'
        ? <span key={i} className="text-ink/30 text-sm px-1">…</span>
        : <button key={p} onClick={() => onChange(p)}
            className={`btn btn-sm w-8 h-8 !px-0 ${page === p ? 'btn-primary' : 'btn-secondary'}`}>
            {p}
          </button>
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="btn btn-secondary btn-sm w-8 h-8 !px-0 disabled:opacity-40">›</button>
    </div>
  );
}

// Stat card
export function StatCard({ icon, label, value, change, color = 'brand', loading = false }) {
  const c = {
    brand:   'text-brand-600 bg-brand-50',
    green:   'text-emerald-600 bg-emerald-50',
    amber:   'text-amber-600 bg-amber-50',
    red:     'text-red-600 bg-red-50',
    purple:  'text-purple-600 bg-purple-50',
    cyan:    'text-cyan-600 bg-cyan-50',
  }[color] || 'text-brand-600 bg-brand-50';

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c}`}>
          <span className="text-xl">{icon}</span>
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${change >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-20 bg-surface-100 rounded animate-pulse mb-1"/>
      ) : (
        <p className="text-2xl font-bold text-ink mb-0.5">{value ?? '—'}</p>
      )}
      <p className="text-xs text-ink/40 font-medium">{label}</p>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="space-y-0">
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-surface-100">
          {Array(cols).fill(0).map((_, j) => (
            <div key={j} className={`h-4 bg-surface-100 rounded animate-pulse flex-1 ${j === 0 ? 'max-w-[40px]' : ''}`}
                 style={{ animationDelay: `${i * 50}ms` }}/>
          ))}
        </div>
      ))}
    </div>
  );
}
