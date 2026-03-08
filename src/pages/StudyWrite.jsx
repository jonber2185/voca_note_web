import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import styles from './StudyWrite.module.css';
import StudyComplete from '../components/StudyComplete';
import NoWords from '../components/NoWords';

export default function StudyWrite() {
  const { userId, setId } = useParams();
  const navigate = useNavigate();

  const [errorMsg, setErorrMsg] = useState("");
  // 학습 데이터 상태
  const [questions, setQuestions] = useState([]); // { word, example, answer } 구조
  const [wrongQuestions, setWrongQuestions] = useState([]); // 🔹 오답 저장용
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isRetryMode, setIsRetryMode] = useState(false);

  // 상태 제어
  const [placeholder, setPlaceholder] = useState("이 문장에서의 뜻을 입력하세요");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const inputRef = useRef(null);

  const resetState = useCallback(() => {
    setUserInput('');
    setIsCorrect(null);
    setShowAnswer(false);
    setPlaceholder("이 문장에서의 뜻을 입력하세요");
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetState();
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, questions.length, resetState]);

  useEffect(() => {
    const fetchAndProcess = async () => {
      try {
        const response = await axios.get(`/words/${userId}/${setId}/example`);
        const datas = response.data;
        if (datas.length === 0) {
          setErorrMsg("학습할 단어가 없습니다.");
          return;
        }

        const processed = [];
        datas.forEach(wordObj => {
          wordObj.definitions.forEach(def => {
            if (def.example && def.example.length > 0) {
              const selectedIdx = Math.floor(Math.random() * def.example.length);
              processed.push({
                word: wordObj.word,
                answers: def.ko,
                pos: def.pos,
                example: def.example[selectedIdx].en,
                translation: def.example[selectedIdx].ko
              });
            }
          });
        });

        // 문제 섞기
        setQuestions(processed.sort(() => Math.random() - 0.5));
      } catch (err) {
        if (err.response?.status !== 403) {
          setErrorMsg("단어를 불러오지 못했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndProcess();
  }, [userId, setId, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showAnswer || !userInput.trim()) return;

    const current = questions[currentIndex];
    const userAnswers = userInput.split(',').map(str => str.trim().replace(/\s/g, ''))
    const validAnswers = current.answers.map(ans => ans.replace(/\s/g, ''));

    const isRight = userAnswers.length > 0 && userAnswers.every(userAns =>
      validAnswers.includes(userAns)
    );

    setIsCorrect(isRight);
    setShowAnswer(true);

    if (!isRight) {
      setWrongQuestions(prev => {
        const exists = prev.some(q => q.example === current.example);
        return exists ? prev : [...prev, current];
      });
    }

    setUserInput(current.answers.join(', '));
  };

  const startRetry = () => {
    setQuestions([...wrongQuestions].sort(() => Math.random() - 0.5));
    setWrongQuestions([]); // 재도전용 바구니 초기화
    setCurrentIndex(0);
    setIsRetryMode(true);
    setIsComplete(false);
    resetState();
  };

  useEffect(() => {
    if ((currentIndex !== 0 || isRetryMode) && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current.focus();
      });
    }
  }, [currentIndex, isRetryMode]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (showAnswer && e.key === 'Enter') {
        handleNext();
      }
    };

    if (showAnswer) {
      window.addEventListener('keydown', handleGlobalKeyDown);
    }

    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showAnswer, handleNext]);

  if (isLoading) return <div className={styles.loading}>문제를 생성 중...</div>;
  if (errorMsg !== "") return <NoWords text={errorMsg} />

  const current = questions[currentIndex];

  return (
    <div className={styles.container}>
      {isComplete && (
        <StudyComplete
          totalCount={questions.length}
          wrongCount={wrongQuestions.length} // 🔹 오답 개수 전달
          onRestart={() => window.location.reload()}
          onRetryWrong={wrongQuestions.length > 0 ? startRetry : null} // 🔹 오답 버튼 전달
        />
      )}

      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>종료</button>
        <div className={styles.progress}>
          <span className={styles.current}>{currentIndex + 1}</span>
          <span className={styles.divider}>/</span>
          <span className={styles.total}>{questions.length}</span>
        </div>
      </header>

      <div className={styles.quizArea}>
        <div className={styles.wordHeader}>
          <span className={styles.wordType}>{current.pos}</span>
          <h2 className={styles.wordMain}>{current.word}</h2>
        </div>

        <div className={styles.exampleCard}>
          <p className={styles.exampleEn}>"{current.example}"</p>
          {showAnswer && (
            <p className={styles.exampleKo}>{current.translation}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            ref={inputRef}
            className={`${styles.answerInput} ${isCorrect === true ? styles.correct : ''} ${isCorrect === false ? styles.wrong : ''}`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setPlaceholder("")}
            onBlur={() => !userInput && setPlaceholder("이 문장에서의 뜻을 입력하세요")}
            disabled={showAnswer}
          />

          {!showAnswer ? (
            <button type="submit" className={styles.nextBtn}>확인</button>
          ) : (
            <button type="button" onClick={handleNext} className={styles.nextBtn}>다음 문제 (Enter)</button>
          )}
        </form>
      </div>
    </div>
  );
}