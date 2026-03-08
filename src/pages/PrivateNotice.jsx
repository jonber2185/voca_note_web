import { useNavigate } from 'react-router-dom';
import styles from './PrivateNotice.module.css';

export default function PrivateNotice() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconArea}>
          <span className={styles.icon}>🔒</span>
        </div>

        <h1 className={styles.title}>접근 권한이 없습니다</h1>
        <p className={styles.description}>
          이 페이지는 비공개 상태이거나,<br />
          볼 수 있는 권한이 없는 페이지입니다.
        </p>

        <div className={styles.buttonGroup}>
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            이전 페이지로
          </button>
          <button
            className={styles.mainBtn}
            onClick={() => navigate('/')}
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}