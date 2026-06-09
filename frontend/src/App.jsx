// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppShell    from './layouts/AppShell';
import LoginPage   from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage   from './pages/BooksPage';
import BookDetail  from './pages/BookDetail';

const Guard = ({ children, admin }) => {
  const { isAuth, isAdmin, ready } = useAuth();
  if (!ready) return null;
  if (!isAuth) return <Navigate to="/login" replace/>;
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace/>;
  return children;
};

const Public = ({ children }) => {
  const { isAuth } = useAuth();
  return isAuth ? <Navigate to="/dashboard" replace/> : children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Public><LoginPage/></Public>}/>
      <Route path="/register" element={<Public><RegisterPage/></Public>}/>

      <Route path="/" element={<Guard><AppShell/></Guard>}>
        <Route index            element={<Navigate to="/dashboard" replace/>}/>
        <Route path="dashboard" element={<DashboardPage/>}/>
        <Route path="books"     element={<BooksPage/>}/>
        <Route path="books/:id" element={<BookDetail/>}/>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
  );
}
