import { useEffect, useState } from 'react';
import styles from './My.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function My() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user?.user_id) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
    logout();
    navigate('/login');
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPwForm(prev => ({ ...prev, [name]: value }));
  };

  const isNotEmpty = pwForm.newPassword.length > 0 && pwForm.confirmPassword.length > 0;
  const isMatch = pwForm.newPassword === pwForm.confirmPassword;
  const isValidLength = pwForm.newPassword.length >= 4;
  const isChanged = pwForm.currentPassword !== pwForm.newPassword;

  const canSubmit = isMatch && isValidLength && isChanged && pwForm.currentPassword.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>비밀번호 변경</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>현재 비밀번호</label>
            <input
              type="password"
              name="currentPassword"
              onChange={handleChange}
              placeholder="현재 비밀번호 입력"
            />
          </div>

          <div className={styles.divider} />

          <div className={styles.inputGroup}>
            <label>새 비밀번호</label>
            <input
              type="password"
              name="newPassword"
              className={isNotEmpty && !isValidLength ? styles.errorInput : ''}
              onChange={handleChange}
              placeholder="새 비밀번호 (4자리 이상)"
            />
            {isNotEmpty && !isValidLength && <span className={styles.errorText}>4자리 이상 입력해주세요.</span>}
          </div>

          <div className={styles.inputGroup}>
            <label>새 비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              className={isNotEmpty && !isMatch ? styles.errorInput : ''}
              onChange={handleChange}
              placeholder="한 번 더 입력"
            />
            {isNotEmpty && !isMatch && <span className={styles.errorText}>비밀번호가 일치하지 않습니다.</span>}
            {isNotEmpty && isMatch && <span className={styles.successText}>비밀번호가 일치합니다!</span>}
          </div>

          <button
            type="submit"
            className={canSubmit ? styles.submitBtn : styles.disabledBtn}
            disabled={!canSubmit}
          >
            변경하기
          </button>
        </form>
      </div>
    </div>
  );
}