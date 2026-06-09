// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { books as bookApi } from '../api';
import { StatCard, Spinner, Empty } from '../components/common';
import { useAuth } from '../context/AuthContext';

const fmt  = (n)   => Number(n || 0).toLocaleString();
const fmtP = (n)   => `$${parseFloat(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

function MiniBar({ pct, color }) {
  return (
    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden flex-1">
      <div className="h-full rounded-full transition-all duration-700"
           style={{ width: `${Math.min(pct, 100)}%`, background: color || '#6366f1' }}/>
    </div>
  );
}

export default function DashboardPage() {
  const { user }    = useAuth();
  const [stats,     setStats]     = useState(null);
  const [featured,  setFeatured]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([bookApi.stats(), bookApi.featured()])
      .then(([s, f]) => { setStats(s.data.data.stats); setFeatured(f.data.data.books); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxSold = Math.max(...(stats?.top_books || []).map(b => b.total_sold || 1), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-ink/40 mt-0.5">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </p>
        </div>
        <Link to="/books" className="btn-primary gap-2 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Add Book
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📚" label="Total Books"   value={fmt(stats?.total_books)}   color="brand"  loading={loading}/>
        <StatCard icon="📦" label="Total Stock"   value={fmt(stats?.total_stock)}   color="green"  loading={loading}/>
        <StatCard icon="✍️" label="Total Authors" value={fmt(stats?.total_authors)} color="purple" loading={loading}/>
        <StatCard icon="🏆" label="Total Sold"    value={fmt(stats?.total_sold)}    color="amber"  loading={loading}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Price overview card */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Price Overview</h2>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_,i)=><div key={i} className="h-4 bg-surface-100 rounded animate-pulse"/>)}</div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Average Price', val: fmtP(stats?.avg_price), pct: 55 },
                { label: 'Highest Price', val: fmtP(stats?.max_price), pct: 100 },
                { label: 'Lowest Price',  val: fmtP(stats?.min_price), pct: 15 },
              ].map(r => (
                <div key={r.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink/50">{r.label}</span>
                    <span className="font-semibold text-ink">{r.val}</span>
                  </div>
                  <MiniBar pct={r.pct} color="#6366f1"/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory health */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Inventory Health</h2>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_,i)=><div key={i} className="h-4 bg-surface-100 rounded animate-pulse"/>)}</div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Active Books',    val: stats?.active_books,   color: '#10b981' },
                { label: 'Featured Books',  val: stats?.featured_books, color: '#6366f1' },
                { label: 'Out of Stock',    val: stats?.out_of_stock,   color: '#ef4444' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }}/>
                    <span className="text-xs text-ink/60">{r.label}</span>
                  </div>
                  <span className="font-bold text-sm text-ink">{fmt(r.val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category distribution */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">By Category</h2>
          {loading ? (
            <div className="space-y-3">{Array(4).fill(0).map((_,i)=><div key={i} className="h-4 bg-surface-100 rounded animate-pulse"/>)}</div>
          ) : stats?.category_stats?.length ? (
            <div className="space-y-2.5">
              {stats.category_stats.slice(0,5).map(c => (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink/60 truncate max-w-[120px]">{c.name}</span>
                    <span className="font-semibold text-ink">{c.book_count}</span>
                  </div>
                  <MiniBar pct={(c.book_count / stats.total_books) * 100} color={c.color}/>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-ink/30">No data yet</p>}
        </div>
      </div>

      {/* Top selling books */}
      {!loading && stats?.top_books?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold text-ink">Top Selling Books</h2>
            <Link to="/books?sortBy=total_sold&sortOrder=DESC" className="text-xs text-brand-500 font-medium hover:text-brand-600">
              View all →
            </Link>
          </div>
          <div>
            {stats.top_books.map((book, i) => (
              <div key={book.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-surface-50 last:border-0 hover:bg-surface-50 transition-colors">
                <span className="text-xs font-bold text-ink/20 w-4 text-center">{i + 1}</span>
                <div className="w-9 h-11 rounded-lg bg-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {book.cover_image
                    ? <img src={book.cover_image} alt="" className="w-full h-full object-cover"/>
                    : <span className="text-base">📖</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{book.title}</p>
                  <p className="text-xs text-ink/40">{book.author}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-ink">{fmt(book.total_sold)} sold</p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-xs text-ink/40">{parseFloat(book.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured books */}
      {featured.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-ink">Featured Books</h2>
            <Link to="/books?is_featured=1" className="text-xs text-brand-500 font-medium hover:text-brand-600">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {featured.map(book => (
              <Link key={book.id} to={`/books/${book.id}`} className="card p-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="w-full aspect-[3/4] bg-surface-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {book.cover_image
                    ? <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    : <span className="text-3xl">📖</span>}
                </div>
                <p className="text-xs font-semibold text-ink truncate">{book.title}</p>
                <p className="text-[11px] text-ink/40 truncate">{book.author}</p>
                <p className="text-xs font-bold text-brand-600 mt-1">{fmtP(book.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
