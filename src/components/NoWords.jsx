import { useNavigate } from "react-router-dom";
import styles from './NoWords.module.css';

export default function NoWords({ text = "단어를 불러오지 못했습니다." }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length <= 1) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={styles.emptyContainer}>
      <div className={styles.emptyIcon}>📭</div>
      <p className={styles.emptyText}>{text}</p>

      <div className={styles.emptyBtnGroup}>
        <button className={styles.backBtn} onClick={handleBack}>
          이전 페이지로
        </button>
        <button className={styles.homeBtn} onClick={() => navigate('/')}>
          메인 화면으로
        </button>
      </div>
    </div>
  );

}