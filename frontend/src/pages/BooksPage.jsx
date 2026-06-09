// src/pages/BooksPage.jsx - Full CRUD with table + grid view
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { books as bookApi } from '../api';
import { Spinner, Empty, Pagination, ConfirmDialog, TableSkeleton } from '../components/common';
import BookFormModal from '../components/books/BookFormModal';
import toast from 'react-hot-toast';

const fmtP = (n) => `$${parseFloat(n || 0).toFixed(2)}`;

function StockBadge({ stock }) {
  if (stock > 10) return <span className="badge-green">{stock} in stock</span>;
  if (stock > 0)  return <span className="badge-yellow">{stock} low</span>;
  return <span className="badge-red">Out</span>;
}

function SortBtn({ col, current, order, onSort }) {
  const active = current === col;
  return (
    <button onClick={() => onSort(col)} className="inline-flex items-center gap-0.5 hover:text-brand-500 transition-colors">
      <span className={active ? 'text-brand-500' : ''}>{active ? (order === 'ASC' ? '↑' : '↓') : '↕'}</span>
    </button>
  );
}

export default function BooksPage() {
  const [books,      setBooks]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search,     setSearch]     = useState('');
  const [searchQ,    setSearchQ]    = useState('');
  const [sortBy,     setSortBy]     = useState('created_at');
  const [sortOrder,  setSortOrder]  = useState('DESC');
  const [category,   setCategory]   = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [editBook,   setEditBook]   = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [viewMode,   setViewMode]   = useState('table');
  const timer = useRef(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await bookApi.list({ page, limit: pagination.limit, search, sortBy, sortOrder, category });
      setBooks(data.data.books);
      setPagination(p => ({ ...p, page: data.data.page, total: data.data.total, totalPages: data.data.totalPages }));
    } catch { toast.error('Failed to load books'); }
    finally  { setLoading(false); }
  }, [pagination.limit, search, sortBy, sortOrder, category]);

  useEffect(() => { load(1); }, [search, sortBy, sortOrder, category, pagination.limit]);
  useEffect(() => { bookApi.categories().then(({ data }) => setCategories(data.data.categories)).catch(() => {}); }, []);

  const onSearchChange = (v) => {
    setSearchQ(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSearch(v.trim()), 450);
  };

  const onSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(col); setSortOrder('ASC'); }
  };

  const openAdd  = ()   => { setEditBook(null); setShowModal(true); };
  const openEdit = (b)  => { setEditBook(b);    setShowModal(true); };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await bookApi.remove(deleteId);
      toast.success('Book deleted successfully');
      setDeleteId(null);
      load(pagination.page);
    } catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); }
    finally { setDeleting(false); }
  };

  const doToggleFeatured = async (book) => {
    try {
      await bookApi.toggleFeatured(book.id);
      toast.success(book.is_featured ? 'Removed from featured' : '⭐ Marked as featured');
      load(pagination.page);
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">Books</h1>
          <p className="text-sm text-ink/40 mt-0.5">{pagination.total.toLocaleString()} total{search && <> · <span className="text-brand-500">"{search}"</span></>}</p>
        </div>
        <button onClick={openAdd} className="btn-primary shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Add Book
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/25" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search title, author, ISBN…" value={searchQ} onChange={e => onSearchChange(e.target.value)} className="inp pl-10 pr-9 h-10 text-sm"/>
          {searchQ && <button onClick={() => { setSearchQ(''); setSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/25 hover:text-ink/60"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="inp h-10 text-sm w-auto min-w-[130px]">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={pagination.limit} onChange={e => setPagination(p => ({ ...p, limit: parseInt(e.target.value), page: 1 }))} className="inp h-10 text-sm w-auto">
          {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <div className="flex border border-surface-200 rounded-xl overflow-hidden">
          <button onClick={() => setViewMode('table')} className={`px-3.5 h-10 text-sm transition-colors ${viewMode === 'table' ? 'bg-brand-500 text-white' : 'text-ink/40 hover:bg-surface-50'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 5h18M3 12h18M3 19h18"/></svg>
          </button>
          <button onClick={() => setViewMode('grid')} className={`px-3.5 h-10 text-sm transition-colors ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-ink/40 hover:bg-surface-50'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
          <p className="text-xs text-ink/40">{loading ? 'Loading…' : `${books.length} of ${pagination.total.toLocaleString()} books`}</p>
          <button onClick={() => load(pagination.page)} className="flex items-center gap-1.5 text-xs text-ink/40 hover:text-ink transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            Refresh
          </button>
        </div>

        {viewMode === 'table' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-surface-50 border-b border-surface-100">
                  <tr>
                    <th className="tbl-head w-10">#</th>
                    <th className="tbl-head">Book</th>
                    <th className="tbl-head"><span className="flex items-center gap-1">Price <SortBtn col="price" current={sortBy} order={sortOrder} onSort={onSort}/></span></th>
                    <th className="tbl-head">ISBN</th>
                    <th className="tbl-head">Category</th>
                    <th className="tbl-head"><span className="flex items-center gap-1">Sold <SortBtn col="total_sold" current={sortBy} order={sortOrder} onSort={onSort}/></span></th>
                    <th className="tbl-head">Stock</th>
                    <th className="tbl-head">Published</th>
                    <th className="tbl-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={9}><TableSkeleton rows={6} cols={9}/></td></tr>
                  : books.length === 0 ? (
                    <tr><td colSpan={9}><Empty icon="📚" title="No books found"
                      description={search ? 'Try different search terms' : 'Add your first book to get started'}
                      action={<button onClick={openAdd} className="btn-primary mt-3">Add Book</button>}/></td></tr>
                  ) : books.map((book, i) => (
                    <tr key={book.id} className="tbl-row group">
                      <td className="tbl-cell text-ink/25 text-xs font-mono w-10">{(pagination.page-1)*pagination.limit+i+1}</td>
                      <td className="tbl-cell">
                        <Link to={`/books/${book.id}`} className="flex items-center gap-3 min-w-[180px]">
                          <div className="w-9 h-11 rounded-lg bg-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                            {book.cover_image ? <img src={book.cover_image} alt="" className="w-full h-full object-cover"/> : <span className="text-base">📖</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate max-w-[200px] group-hover:text-brand-500 transition-colors">{book.title}</p>
                            <p className="text-xs text-ink/40 truncate">{book.author}</p>
                            {book.is_featured === 1 && <span className="text-[10px] text-amber-500">⭐ Featured</span>}
                          </div>
                        </Link>
                      </td>
                      <td className="tbl-cell">
                        <p className="font-semibold text-ink">{fmtP(book.price)}</p>
                        {book.original_price && <p className="text-xs text-ink/25 line-through">{fmtP(book.original_price)}</p>}
                      </td>
                      <td className="tbl-cell"><span className="font-mono text-xs text-ink/40 bg-surface-50 px-2 py-1 rounded-lg whitespace-nowrap">{book.isbn}</span></td>
                      <td className="tbl-cell">
                        {book.category_name
                          ? <span className="badge text-xs" style={{background:`${book.category_color}18`,color:book.category_color}}>{book.category_name}</span>
                          : <span className="text-ink/20 text-xs">—</span>}
                      </td>
                      <td className="tbl-cell text-sm text-ink/60 font-medium">{(book.total_sold||0).toLocaleString()}</td>
                      <td className="tbl-cell"><StockBadge stock={book.stock}/></td>
                      <td className="tbl-cell text-xs text-ink/40 whitespace-nowrap">{book.published_date ? new Date(book.published_date).toLocaleDateString('en-US',{year:'numeric',month:'short'}) : '—'}</td>
                      <td className="tbl-cell">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => doToggleFeatured(book)} title={book.is_featured ? 'Unfeature' : 'Feature'}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-amber-50 text-ink/25 hover:text-amber-400 transition-colors text-sm">
                            {book.is_featured ? '⭐' : '☆'}
                          </button>
                          <button onClick={() => openEdit(book)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-50 text-ink/25 hover:text-brand-500 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => setDeleteId(book.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-ink/25 hover:text-red-500 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && pagination.totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-surface-100 flex items-center justify-between">
                <p className="text-xs text-ink/40">Page {pagination.page} of {pagination.totalPages}</p>
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={p => load(p)}/>
              </div>
            )}
          </>
        ) : (
          <div className="p-5">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_,i)=>(
                  <div key={i} className="rounded-xl border border-surface-100 overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-surface-100"/>
                    <div className="p-3 space-y-2"><div className="h-3 bg-surface-100 rounded"/><div className="h-3 bg-surface-100 rounded w-2/3"/></div>
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              <Empty icon="📚" title="No books found" description="Add your first book" action={<button onClick={openAdd} className="btn-primary mt-3">Add Book</button>}/>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {books.map(book => (
                    <div key={book.id} className="group border border-surface-100 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-white relative">
                      <Link to={`/books/${book.id}`} className="block">
                        <div className="aspect-[3/4] bg-surface-50 flex items-center justify-center overflow-hidden">
                          {book.cover_image ? <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/> : <span className="text-5xl opacity-40">📖</span>}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-semibold text-ink truncate leading-tight">{book.title}</p>
                          <p className="text-[11px] text-ink/40 truncate mt-0.5 mb-2">{book.author}</p>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-bold text-brand-600">{fmtP(book.price)}</span>
                            <StockBadge stock={book.stock}/>
                          </div>
                        </div>
                      </Link>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(book)} className="w-7 h-7 bg-white/95 rounded-lg shadow flex items-center justify-center hover:text-brand-500 text-ink/40 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => setDeleteId(book.id)} className="w-7 h-7 bg-white/95 rounded-lg shadow flex items-center justify-center hover:text-red-500 text-ink/40 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {pagination.totalPages > 1 && (
                  <div className="mt-5 flex justify-end">
                    <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={p => load(p)}/>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <BookFormModal open={showModal} onClose={() => { setShowModal(false); setEditBook(null); }} book={editBook} categories={categories} onSuccess={() => load(editBook ? pagination.page : 1)}/>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={doDelete} loading={deleting} danger title="Delete Book" message="Are you sure you want to delete this book? This action cannot be undone."/>
    </div>
  );
}
