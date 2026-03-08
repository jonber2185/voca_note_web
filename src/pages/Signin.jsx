import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';
import { IoCloseOutline } from 'react-icons/io5';


export default function Signin() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login({
        user_id: userId,
        password: password,
      });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data.message;
      setErrorMsg(msg || "서버 에러! 나중에 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>Voca<span>Note</span> 로그인</h2>

        {errorMsg && (
          <div className={styles.errorAlert}>
            <span>{errorMsg}</span>
            <button
              className={styles.closeBtn}
              onClick={() => setErrorMsg('')}
            >
              <IoCloseOutline />
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            type="submit"
            className={!isLoading ? styles.submitBtn : styles.disabledBtn}
            disabled={isLoading}
          >로그인</button>
        </form>
        <p className={styles.switchText}>
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}