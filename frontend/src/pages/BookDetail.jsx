// src/pages/BookDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { books as bookApi } from '../api';
import { Spinner, ConfirmDialog } from '../components/common';
import BookFormModal from '../components/books/BookFormModal';
import toast from 'react-hot-toast';

const fmtP    = (n) => `$${parseFloat(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-surface-100 last:border-0">
      <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide min-w-[120px]">{label}</span>
      <span className="text-sm text-ink font-medium text-right flex-1">{value || '—'}</span>
    </div>
  );
}

function StarRating({ rating }) {
  const r = parseFloat(rating || 0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`w-4 h-4 ${s <= Math.round(r) ? 'text-amber-400' : 'text-surface-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      <span className="text-sm font-semibold text-ink ml-1">{r.toFixed(1)}</span>
    </div>
  );
}

export default function BookDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [book,     setBook]     = useState(null);
  const [cats,     setCats]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen,  setDelOpen]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const { data } = await bookApi.get(id);
      setBook(data.data.book);
    } catch { toast.error('Book not found'); navigate('/books'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    bookApi.categories().then(({ data }) => setCats(data.data.categories)).catch(() => {});
  }, [id]);

  const doDelete = async () => {
    setDeleting(true);
    try {
      await bookApi.remove(id);
      toast.success('Book deleted');
      navigate('/books');
    } catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); setDeleting(false); }
  };

  const doToggleFeatured = async () => {
    try {
      await bookApi.toggleFeatured(id);
      toast.success(book.is_featured ? 'Removed from featured' : '⭐ Marked as featured');
      load();
    } catch { toast.error('Action failed'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <Spinner size="lg"/>
        <p className="text-sm text-ink/40">Loading book details…</p>
      </div>
    </div>
  );

  if (!book) return null;

  const discount = book.original_price
    ? Math.round((1 - book.price / book.original_price) * 100)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/dashboard" className="text-ink/40 hover:text-ink transition-colors">Dashboard</Link>
        <svg className="w-3.5 h-3.5 text-ink/20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        <Link to="/books" className="text-ink/40 hover:text-ink transition-colors">Books</Link>
        <svg className="w-3.5 h-3.5 text-ink/20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        <span className="text-ink font-medium truncate max-w-[200px]">{book.title}</span>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Cover + actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Cover */}
          <div className="card p-0 overflow-hidden">
            <div className="aspect-[3/4] bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center relative">
              {book.cover_image ? (
                <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover"/>
              ) : (
                <div className="text-center">
                  <span className="text-7xl opacity-20">📖</span>
                  <p className="text-xs text-ink/30 mt-2">No cover image</p>
                </div>
              )}
              {book.is_featured === 1 && (
                <div className="absolute top-3 left-3">
                  <span className="badge bg-amber-400 text-white text-xs font-bold px-2.5 py-1 shadow-sm">⭐ Featured</span>
                </div>
              )}
              {discount && (
                <div className="absolute top-3 right-3">
                  <span className="badge bg-red-500 text-white text-xs font-bold px-2.5 py-1 shadow-sm">-{discount}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card p-4 space-y-2">
            <button onClick={() => setEditOpen(true)} className="btn-primary w-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Book
            </button>
            <button onClick={doToggleFeatured} className="btn-secondary w-full">
              {book.is_featured ? '☆ Remove from Featured' : '⭐ Mark as Featured'}
            </button>
            <button onClick={() => setDelOpen(true)} className="btn-danger w-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
              Delete Book
            </button>
          </div>

          {/* Quick stats */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wide mb-3">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { icon: '🏆', label: 'Total Sold',  val: (book.total_sold || 0).toLocaleString() },
                { icon: '📦', label: 'In Stock',    val: book.stock.toLocaleString() },
                { icon: '⭐', label: 'Rating',       val: `${parseFloat(book.rating || 0).toFixed(1)} / 5` },
                { icon: '💬', label: 'Reviews',      val: (book.total_reviews || 0).toLocaleString() },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-ink/50">
                    <span>{s.icon}</span>{s.label}
                  </span>
                  <span className="text-sm font-bold text-ink">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header info */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-ink leading-tight mb-1">{book.title}</h1>
                <p className="text-base text-ink/60">by <span className="font-semibold text-ink">{book.author}</span></p>
              </div>
              <span className={`badge flex-shrink-0 ${
                book.status === 'active'       ? 'badge-green' :
                book.status === 'out_of_stock' ? 'badge-red'   : 'badge-gray'
              }`}>
                {book.status?.replace('_', ' ')}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={book.rating}/>
              <span className="text-xs text-ink/40">({book.total_reviews || 0} reviews)</span>
              {book.category_name && (
                <>
                  <div className="w-px h-4 bg-surface-200"/>
                  <span className="badge text-xs" style={{ background: `${book.category_color}18`, color: book.category_color }}>
                    {book.category_name}
                  </span>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 p-4 bg-surface-50 rounded-xl mb-5">
              <span className="text-3xl font-bold text-brand-600">{fmtP(book.price)}</span>
              {book.original_price && (
                <>
                  <span className="text-lg text-ink/30 line-through mb-0.5">{fmtP(book.original_price)}</span>
                  <span className="badge bg-red-50 text-red-600 mb-0.5">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div>
                <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{book.description}</p>
              </div>
            )}
          </div>

          {/* Book details */}
          <div className="card p-5">
            <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wide mb-1">Book Information</h3>
            <div className="mt-3">
              <InfoRow label="ISBN"           value={<span className="font-mono text-xs">{book.isbn}</span>}/>
              <InfoRow label="Publisher"      value={book.publisher}/>
              <InfoRow label="Published"      value={fmtDate(book.published_date)}/>
              <InfoRow label="Language"       value={book.language}/>
              <InfoRow label="Pages"          value={book.pages ? `${book.pages} pages` : null}/>
              <InfoRow label="Added By"       value={book.created_by_name}/>
              <InfoRow label="Created"        value={fmtDate(book.created_at)}/>
              <InfoRow label="Last Updated"   value={fmtDate(book.updated_at)}/>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        book={book}
        categories={cats}
        onSuccess={() => load()}
      />
      <ConfirmDialog
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={doDelete}
        loading={deleting}
        danger
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
