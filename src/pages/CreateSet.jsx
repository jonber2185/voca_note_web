import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import styles from './CreateSet.module.css';
import { useAuth } from '../contexts/AuthContext';

export default function CreateSet() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user?.user_id) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsPending(true);
    try {
      const response = await axios.post(`/set/${user.user_id}`, {
        title,
        description,
        is_public: isPublic
      });
      const set_id = response.data?.set_id;
      navigate(`/${user.user_id}/${set_id}`, { state: { create: true }, replace: true });
    } catch (error) {
      console.error(error);
      alert("단어장 생성에 실패했습니다.");
      navigate('/');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <header className={styles.intro}>
          <button className={styles.backLink} onClick={() => navigate(-1)}>
            ← 돌아가기
          </button>
          <h1 className={styles.headline}>새 단어장 생성</h1>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <input
              type="text"
              className={styles.titleInput}
              placeholder="단어장 제목을 적어주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <textarea
              className={styles.descInput}
              placeholder="이 단어장에 대한 메모 (선택)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
            />
          </div>

          <div className={styles.statusField}>
            <span className={styles.statusLabel}>공개 설정</span>

            <div className={styles.slidingToggle}>
              {/* 활성화된 버튼 쪽으로 이동할 배경 슬라이더 */}
              <div
                className={`${styles.glider} ${isPublic ? styles.public : styles.private}`}
              />

              <button
                type="button"
                className={`${styles.toggleBtn} ${!isPublic ? styles.active : ''}`}
                onClick={() => setIsPublic(false)}
              >
                비공개
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${isPublic ? styles.active : ''}`}
                onClick={() => setIsPublic(true)}
              >
                공개
              </button>
            </div>
          </div>

          <footer className={styles.footer}>
            <button
              type="submit"
              className={styles.createBtn}
              disabled={!title.trim() || isPending}
            >
              {isPending ? "준비 중..." : "단어장 만들기"}
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
}