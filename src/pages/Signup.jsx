import axios from '../lib/axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoCloseOutline } from "react-icons/io5";
import styles from './Auth.module.css';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
    confirmPassword: '' // 비밀번호 확인 추가
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 실시간 검증
  const isPasswordMatch = formData.password === formData.confirmPassword;
  const isFormValid = formData.user_id && formData.password && isPasswordMatch;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isPasswordMatch) return setErrorMsg("비밀번호가 일치하지 않습니다.");

    setErrorMsg('');
    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      await axios.post('/user/create', submitData);

      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>Voca<span>Note</span> 시작하기</h2>

        {errorMsg && (
          <div className={styles.errorAlert}>
            <span>{errorMsg}</span>
            <button className={styles.closeBtn} onClick={() => setErrorMsg('')}>
              <IoCloseOutline />
            </button>
          </div>
        )}

        <form onSubmit={handleSignup} className={styles.form}>
          <input
            type="text" name="user_id" placeholder="아이디"
            value={formData.user_id} onChange={handleChange} required
          />
          <input
            type="password" name="password" placeholder="비밀번호"
            value={formData.password} onChange={handleChange} required
            autoComplete="new-password"
          />
          <input
            type="password" name="confirmPassword" placeholder="비밀번호 확인"
            className={formData.confirmPassword && !isPasswordMatch ? styles.errorInput : ''}
            value={formData.confirmPassword} onChange={handleChange} required
          />

          <button
            type="submit"
            className={isFormValid ? styles.submitBtn : styles.disabledBtn}
            disabled={!isFormValid || loading}
          >
            {loading ? "처리 중..." : "회원가입"}
          </button>
        </form>

        <p className={styles.switchText}>
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}