// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Field, Spinner } from '../components/common';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name    = 'Name is required';
    else if (form.name.length < 2)  e.name    = 'Name must be at least 2 characters';
    if (!form.email.trim())         e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)             e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      {/* Background accent */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600"/>

      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
            </div>
            <span className="font-bold text-ink text-lg">BookStore Pro</span>
          </Link>
          <h1 className="text-2xl font-bold text-ink mb-1.5">Create your account</h1>
          <p className="text-sm text-ink/40">Get started for free. No credit card required.</p>
        </div>

        <div className="card p-7 shadow-lg">
          {errors.form && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"/>
              </svg>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Full name" error={errors.name} required>
              <input id="name" type="text" autoComplete="name" placeholder="John Doe"
                value={form.name} onChange={set('name')}
                className={`inp ${errors.name ? 'inp-error' : ''}`}/>
            </Field>

            <Field label="Email address" error={errors.email} required>
              <input id="email" type="email" autoComplete="email" placeholder="john@example.com"
                value={form.email} onChange={set('email')}
                className={`inp ${errors.email ? 'inp-error' : ''}`}/>
            </Field>

            <Field label="Password" error={errors.password} required>
              <div className="relative">
                <input id="password" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="Min. 6 characters" value={form.password} onChange={set('password')}
                  className={`inp pr-11 ${errors.password ? 'inp-error' : ''}`}/>
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors">
                  {showPw
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </Field>

            <Field label="Confirm password" error={errors.confirm} required>
              <input id="confirm" type="password" autoComplete="new-password"
                placeholder="Repeat password" value={form.confirm} onChange={set('confirm')}
                className={`inp ${errors.confirm ? 'inp-error' : ''}`}/>
            </Field>

            <button type="submit" disabled={loading} className="btn-primary w-full h-11 mt-2">
              {loading ? <><Spinner size="xs"/> Creating account...</> : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/40 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
