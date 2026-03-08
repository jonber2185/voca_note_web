import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios'; // 🔹 실제 통신을 위한 axios 임포트
import styles from './Search.module.css';
import Sets from '../components/Sets';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim() === "") {
      navigate('/', { replace: true });
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/search?q=${encodeURIComponent(query)}`);
        // 🔹 리턴값 { user: [], sets: [] }을 저장
        setResults(response.data);
      } catch (err) {
        setResults({ user: [], sets: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, navigate]);

  if (!query) return null;

  const userResults = results.user || [];
  const enSetResults = results.sets || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2>"<span>{query}</span>" 검색 결과</h2>
        </div>
      </header>

      {loading ? (
        <div className={styles.loadingArea}>
          <div className={styles.spinner}></div>
          <p>검색 중...</p>
        </div>
      ) : (
        <div className={styles.content}>
          {userResults.length === 0 && enSetResults.length === 0 ? (
            <div className={styles.noResult}>
              <div className={styles.emptyIcon}>🔍</div>
              <p>일치하는 결과가 없네요.</p>
              <button className={styles.goHome} onClick={() => navigate('/')}>
                전체 목록으로 돌아가기
              </button>
            </div>
          ) : (
            <>
              {/* 🔹 1. 사용자 중심 검색 결과: "{user}님의 단어장" */}
              {userResults.length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>사용자 검색</h3>
                  <div className={styles.userSectionGrid}>
                    {userResults.map(u => (
                      <div key={u.id} className={styles.userCard}>
                        <div className={styles.userInfo} onClick={() => navigate(`/profile/${u.id}`)}>
                          <span className={styles.userEmoji}>👤</span>
                          <span className={styles.userName}><strong>{query}</strong>님의 단어장</span>
                        </div>
                        {/* 🔹 해당 유저의 대표 세트 하나 혹은 리스트를 보여줄 수 있음 */}
                        <div className={styles.userSetPreview}>
                          <Sets datas={[u]} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 🔹 2. 단어장 이름 중심 검색 결과: "단어장 이름으로 검색 결과" */}
              {enSetResults.length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    단어장 이름 <span>"{query}"</span> 검색 결과
                  </h3>
                  <div className={styles.setGrid}>
                    <Sets datas={enSetResults} />
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}