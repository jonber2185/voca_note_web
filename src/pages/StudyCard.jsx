import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import styles from './StudyCard.module.css';
import StudyComplete from '../components/StudyComplete';
import NoWords from '../components/NoWords';

export default function StudyCard() {
  const { userId, setId } = useParams();
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState("");
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false); // 카드 뒤집힘 상태
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const currentWord = words[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, words.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const toggleFlip = () => setIsFlipped(prev => !prev);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isComplete) return;
      if (e.key === 'ArrowRight' || e.key === ' ') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') toggleFlip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isComplete]);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get(`/words/${userId}/${setId}`);
        if (response.data.length === 0) setErrorMsg("학습할 단어가 없습니다.");
        setWords(response.data);
      } catch (err) {
        if (err.response?.status !== 403) {
          setErrorMsg("단어를 불러오지 못했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchWords();
  }, [setId, navigate]);

  if (isLoading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>학습 준비 중...</p>
    </div>
  );

  if (errorMsg !== "") return <NoWords text={errorMsg} />;

  return (
    <div className={styles.container}>
      {isComplete && (
        <StudyComplete
          totalCount={words.length}
          onRestart={() => {
            setCurrentIndex(0);
            setIsFlipped(false);
            setIsComplete(false);
          }}
        />
      )}

      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>종료</button>
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }} />
          <span className={styles.progressText}>{currentIndex + 1} / {words.length}</span>
        </div>
      </header>

      <div className={styles.cardArea}>
        <div
          className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
          onClick={toggleFlip}
        >
          {/* 앞면: 단어 */}
          <div className={styles.front}>
            <span className={styles.label}>WORD</span>
            <h2 className={styles.wordText}>{currentWord?.word}</h2>
            <p className={styles.hint}>클릭하거나 스페이스바를 눌러보세요</p>
          </div>

          {/* 뒷면: 뜻 */}
          <div className={styles.back}>
            <span className={styles.label}>MEANING</span>
            <div>
              <div className={styles.meaningList}>
                {currentWord?.definitions?.map((m, i) => {
                  const fullMeaning = m.ko.join(', ');
                  const shouldBreak = fullMeaning.length > 15;

                  return (
                    <div key={i} className={styles.meaningRow}>
                      {m.pos && <span className={styles.posBadge}>{m.pos}</span>}
                      <p className={styles.meaningText}>
                        {m.ko.map((text, index) => (
                          <span key={index}>
                            {text}
                            {index < m.ko.length - 1 && (shouldBreak ? <br /> : ', ')}
                          </span>
                        ))}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={handlePrev} disabled={currentIndex === 0}>
          이전
        </button>
        <button className={styles.nextBtn} onClick={handleNext}>
          {currentIndex === words.length - 1 ? "학습 완료" : "다음 단어"}
        </button>
      </div>
    </div>
  );
}