import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const isLoggedIn = user?.name;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Voca<span>Note</span>
        </Link>
        <SearchBar />

        <div className={styles.menu}>
          {isLoggedIn ? (
            <>
              {isLoading && <Link to="/my" className={styles.welcome}>{user.name}님 환영해요!</Link>}
              <Link to='/' onClick={logout} className={styles.logoutBtn}>로그아웃</Link>
            </>
          ) : (
            <Link to="/login" className={styles.loginBtn}>로그인</Link>
          )}
        </div>
      </div>
    </nav>
  );
}