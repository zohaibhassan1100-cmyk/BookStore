// src/components/books/BookFormModal.jsx
import { useState, useEffect } from 'react';
import { Modal, Field, Spinner } from '../common';
import { books as bookApi } from '../../api';
import toast from 'react-hot-toast';

const INIT = {
  title: '', author: '', price: '', original_price: '', isbn: '',
  published_date: '', description: '', category_id: '', stock: '',
  pages: '', language: 'English', publisher: '', cover_image: '',
  is_featured: false, status: 'active',
};

export default function BookFormModal({ open, onClose, book, categories = [], onSuccess }) {
  const [form,    setForm]    = useState(INIT);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!book;

  useEffect(() => {
    if (!open) return;
    if (book) {
      setForm({
        title:          book.title          || '',
        author:         book.author         || '',
        price:          book.price          || '',
        original_price: book.original_price || '',
        isbn:           book.isbn           || '',
        published_date: book.published_date ? String(book.published_date).slice(0, 10) : '',
        description:    book.description    || '',
        category_id:    book.category_id    || '',
        stock:          book.stock          ?? '',
        pages:          book.pages          || '',
        language:       book.language       || 'English',
        publisher:      book.publisher      || '',
        cover_image:    book.cover_image    || '',
        is_featured:    !!book.is_featured,
        status:         book.status         || 'active',
      });
    } else {
      setForm(INIT);
    }
    setErrors({});
  }, [book, open]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title  = 'Title is required';
    if (!form.author.trim())      e.author = 'Author is required';
    if (!form.price)              e.price  = 'Price is required';
    else if (parseFloat(form.price) < 0) e.price = 'Price must be positive';
    if (!form.isbn.trim())        e.isbn   = 'ISBN is required';
    if (!form.published_date)     e.published_date = 'Published date is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price:          parseFloat(form.price)          || 0,
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock:          parseInt(form.stock)            || 0,
        pages:          form.pages ? parseInt(form.pages) : null,
        category_id:    form.category_id || null,
        is_featured:    form.is_featured ? 1 : 0,
      };
      if (isEdit) await bookApi.update(book.id, payload);
      else        await bookApi.create(payload);
      toast.success(`Book ${isEdit ? 'updated' : 'created'} successfully`);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const apiErrs = {};
        err.response.data.errors.forEach(e => { apiErrs[e.path] = e.msg; });
        setErrors(apiErrs);
      }
    } finally {
      setLoading(false);
    }
  };

  const LANGS = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Urdu', 'Chinese', 'Japanese', 'Portuguese', 'Russian'];

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Book' : 'Add New Book'} size="lg">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Title */}
          <div className="sm:col-span-2">
            <Field label="Title" error={errors.title} required>
              <input type="text" value={form.title} onChange={set('title')}
                placeholder="Enter book title"
                className={`inp ${errors.title ? 'inp-error' : ''}`}/>
            </Field>
          </div>

          {/* Author */}
          <Field label="Author" error={errors.author} required>
            <input type="text" value={form.author} onChange={set('author')}
              placeholder="Author name"
              className={`inp ${errors.author ? 'inp-error' : ''}`}/>
          </Field>

          {/* ISBN */}
          <Field label="ISBN" error={errors.isbn} required>
            <input type="text" value={form.isbn} onChange={set('isbn')}
              placeholder="978-0-000-00000-0"
              className={`inp font-mono ${errors.isbn ? 'inp-error' : ''}`}/>
          </Field>

          {/* Price */}
          <Field label="Sale Price ($)" error={errors.price} required>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 text-sm font-medium">$</span>
              <input type="number" step="0.01" min="0" value={form.price} onChange={set('price')}
                placeholder="0.00"
                className={`inp pl-7 ${errors.price ? 'inp-error' : ''}`}/>
            </div>
          </Field>

          {/* Original Price */}
          <Field label="Original Price ($)" error={errors.original_price}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 text-sm font-medium">$</span>
              <input type="number" step="0.01" min="0" value={form.original_price} onChange={set('original_price')}
                placeholder="0.00 (optional)"
                className="inp pl-7"/>
            </div>
          </Field>

          {/* Published Date */}
          <Field label="Published Date" error={errors.published_date} required>
            <input type="date" value={form.published_date} onChange={set('published_date')}
              className={`inp ${errors.published_date ? 'inp-error' : ''}`}/>
          </Field>

          {/* Category */}
          <Field label="Category">
            <select value={form.category_id} onChange={set('category_id')} className="inp">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          {/* Stock */}
          <Field label="Stock">
            <input type="number" min="0" value={form.stock} onChange={set('stock')}
              placeholder="0"
              className="inp"/>
          </Field>

          {/* Pages */}
          <Field label="Pages">
            <input type="number" min="1" value={form.pages} onChange={set('pages')}
              placeholder="e.g. 320"
              className="inp"/>
          </Field>

          {/* Language */}
          <Field label="Language">
            <select value={form.language} onChange={set('language')} className="inp">
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>

          {/* Publisher */}
          <Field label="Publisher">
            <input type="text" value={form.publisher} onChange={set('publisher')}
              placeholder="Publisher name"
              className="inp"/>
          </Field>

          {/* Status */}
          <Field label="Status">
            <select value={form.status} onChange={set('status')} className="inp">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </Field>

          {/* Cover Image */}
          <div className="sm:col-span-2">
            <Field label="Cover Image URL">
              <input type="url" value={form.cover_image} onChange={set('cover_image')}
                placeholder="https://example.com/cover.jpg"
                className="inp"/>
            </Field>
            {form.cover_image && (
              <div className="mt-2 flex items-center gap-3">
                <img src={form.cover_image} alt="Preview" className="w-12 h-16 object-cover rounded-lg border border-surface-200"
                  onError={e => { e.target.style.display = 'none'; }}/>
                <p className="text-xs text-ink/40">Cover preview</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea value={form.description} onChange={set('description')} rows={3}
                placeholder="Brief description of the book…"
                className="inp resize-none"/>
            </Field>
          </div>

          {/* Featured toggle */}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0">
                <input type="checkbox" className="sr-only" checked={form.is_featured} onChange={set('is_featured')}/>
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${form.is_featured ? 'bg-brand-500' : 'bg-surface-200'}`}/>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.is_featured ? 'translate-x-5' : 'translate-x-0'}`}/>
              </div>
              <span className="text-sm font-medium text-ink group-hover:text-brand-600 transition-colors">
                Mark as Featured ⭐
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-5 mt-5 border-t border-surface-100">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? <><Spinner size="xs"/> Saving…</> : isEdit ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
