import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios'; // 🔹 실제 통신을 위한 axios 임포트
import styles from './Search.module.css';
import Sets from '../components/Sets';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');

  const [results, setResults] = useState(null);
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
                  {/* 상단 유저 정보 (한 번만 표시) */}
                  <div className={styles.userHeader} onClick={() => navigate(`/profile/${userResults[0].owner_id}`)}>
                    <span className={styles.userEmoji}>👤</span>
                    <h3 className={styles.sectionTitle}>
                      <strong>{query}</strong>님의 단어장
                    </h3>
                  </div>

                  {/* 🔹 가로 슬라이드 컨테이너 */}
                  <div className={styles.horizontalScrollWrapper}>
                    <div className={styles.horizontalScrollContent}>
                      {/* 모든 결과 데이터를 Sets에 한꺼번에 전달 */}
                      <Sets datas={userResults} />
                    </div>
                  </div>
                </section>
              )}

              {/* 🔹 2. 단어장 이름 중심 검색 결과: "단어장 이름으로 검색 결과" */}
              {enSetResults.length > 0 && (
                <section className={styles.setSection}>
                  <h3 className={styles.setSectionTitle}>
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