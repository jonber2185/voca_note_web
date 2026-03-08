import { useEffect, useState } from 'react';
import Sets from './Sets';
import axios from '../lib/axios';
import styles from './MySets.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MySet() {
  const [wordSets, setWordSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchWordSets = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/set/${user.user_id}`);
      setWordSets(response.data.sets);
    } catch (error) {
      console.error("단어장을 불러오는데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    navigate(`/create-set`)
  }

  useEffect(() => {
    fetchWordSets();
  }, []);

  return (
    <>
      <section className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h1>반가워요, <span>{user.name}</span>님! 👋</h1>
          <p>오늘은 어떤 단어들을 정복해볼까요? 열공하세요!</p>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statLabel}>내 단어장</span>
          <span className={styles.statValue}>{wordSets.length}</span>
        </div>
      </section>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleInfo}>
            <h1 className={styles.mainTitle}>내 단어장 목록</h1>
            <p className={styles.subTitle}>
              {isLoading ? (
                "단어장을 불러오는 중입니다..."
              ) : wordSets.length > 0 ? (
                <>
                  총 <span>{wordSets.length}</span>개의 단어장이 있슨..
                </>
              ) : (
                "단어장이 하나도 없슨.."
              )}
            </p>
          </div>
          <button onClick={handleClick} className={styles.addBtn}>+ 새 단어장 만들기</button>
        </header>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>데이터 로딩 중...</div>
          ) : (
            <Sets datas={wordSets} />
          )}
        </div>
      </div>
    </>
  );
}