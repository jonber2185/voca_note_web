import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import styles from './StudyMultiple.module.css';
import StudyComplete from '../components/StudyComplete';
import NoWords from '../components/NoWords';

export default function StudyMultiple() {
  const navigate = useNavigate();
  const { userId, setId } = useParams();

  const [errorMsg, setErrorMsg] = useState("");
  const [allWords, setAllWords] = useState([]);
  const [options, setOptions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const [selectedIndices, setSelectedIndices] = useState([]); // 클릭한 인덱스들 저장
  const [wrongSelection, setWrongSelection] = useState(false); // 오답을 눌렀는지 여부
  const [wrongIdx, setWrongIdx] = useState(null);
  const [isAllFound, setIsAllFound] = useState(false); // 모든 정답을 찾았는지 여부

  const resetState = useCallback(() => {
    setSelectedIndices([]);
    setWrongIdx(null);
    setWrongSelection(false);
    setIsAllFound(false);
  }, []);

  // 🔹 옵션 생성 함수 (useCallback으로 감싸기)
  const generateCurrentOptions = useCallback((targetIndex, wordsPool, meaningsPool) => {
    if (!wordsPool[targetIndex]) return;
    const currentWord = wordsPool[targetIndex];
    let answerOptions = [...currentWord.ko];

    if (answerOptions.length < 5) {
      const shuffledPool = [...meaningsPool].sort(() => Math.random() - 0.5);
      for (const randomOption of shuffledPool) {
        if (answerOptions.length >= 5) break;
        // 이미 들어간 정답 옵션(배열 형태)과 중복 체크를 위해 JSON.stringify 사용
        if (answerOptions.some(ans => JSON.stringify(ans) === JSON.stringify(randomOption))) continue;
        answerOptions.push(randomOption);
      }
    }

    setCurrentOptions(answerOptions.slice(0, 5).sort(() => Math.random() - 0.5));
  }, []);

  const getWords = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/words/${userId}/${setId}`);
      const datas = response.data ?? [];

      let processedWords = [];
      let processedMeanings = [];

      datas.forEach((data) => {
        // definitions의 각 ko는 배열 형태임
        const kos = data.definitions.map(des => des.ko);
        processedWords.push({ word: data.word, ko: kos });
        processedMeanings.push(...kos);
      });

      // 중복 제거
      processedMeanings = Array.from(new Set(processedMeanings.map(m => JSON.stringify(m)))).map(m => JSON.parse(m));

      if (processedMeanings.length < 5) {
        setErrorMsg("한국 단어의 갯수가 5개 이상이어야 학습이 가능합니다.");
        return;
      }

      processedWords = processedWords.sort(() => Math.random() - 0.5);
      setAllWords(processedWords);
      setOptions(processedMeanings);
      generateCurrentOptions(0, processedWords, processedMeanings);
    } catch (err) {
      if (err.response?.status !== 403) {
        setErrorMsg("단어를 불러오지 못했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { getWords(); }, [setId]);

  const handleNext = useCallback(() => {
    if (currentIndex < allWords.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      generateCurrentOptions(nextIdx, allWords, options);
      resetState();
    } else {
      setIsComplete(true); // 🔹 모든 문제를 풀었을 때 결과 화면으로
    }
  }, [currentIndex, allWords.length, generateCurrentOptions, options, resetState]);

  // 🔹 오답만 다시 풀기 시작 함수
  const startRetry = () => {
    const retryWords = [...wrongWords];
    setAllWords(retryWords);
    setWrongWords([]);
    setCurrentIndex(0);
    setIsComplete(false);
    generateCurrentOptions(0, retryWords, options);
    resetState();
  };

  const handleOptionClick = (opt, idx) => {
    if (isAllFound || wrongSelection || selectedIndices.includes(idx)) return;

    const currentWord = allWords[currentIndex];
    const correctMeanings = currentWord.ko;
    // 배열 비교를 위해 JSON.stringify 활용
    const isRight = correctMeanings.some(correct => JSON.stringify(correct) === JSON.stringify(opt));

    if (isRight) {
      const newSelected = [...selectedIndices, idx];
      setSelectedIndices(newSelected);

      const totalAnswersInOptions = currentOptions.filter(o =>
        correctMeanings.some(correct => JSON.stringify(correct) === JSON.stringify(o))
      ).length;

      if (newSelected.length === totalAnswersInOptions) {
        setIsAllFound(true);
        setTimeout(() => handleNext(), 800);
      }
    } else {
      setWrongIdx(idx);
      setWrongSelection(true);
      // 오답 목록에 추가 (중복 방지)
      if (!wrongWords.some(w => w.word === currentWord.word)) {
        setWrongWords(prev => [...prev, currentWord]);
      }
    }
  };

  if (isLoading) return <div className={styles.loading}>학습 데이터를 생성 중...</div>;

  if (errorMsg !== "") return <NoWords text={errorMsg} />

  const currentWord = allWords[currentIndex];
  const totalAnswersNeeded = currentOptions.filter(o =>
    currentWord.ko.some(correct => JSON.stringify(correct) === JSON.stringify(o))
  ).length;

  return (
    <div className={styles.container}>
      {isComplete && (
        <StudyComplete
          totalCount={allWords.length}
          wrongCount={wrongWords.length}
          onRestart={() => window.location.reload()}
          onRetryWrong={wrongWords.length > 0 ? startRetry : null}
        />
      )}

      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>종료</button>
        <div className={styles.progress}>
          <span className={styles.current}>{currentIndex + 1}</span>
          <span className={styles.divider}>/</span>
          <span className={styles.total}>{allWords.length}</span>
        </div>
      </header>

      <div className={styles.quizArea}>
        <div className={styles.questionCard}>
          <h2 className={styles.wordTitle}>{currentWord?.word}</h2>
          <p className={styles.subLabel}>
            {totalAnswersNeeded > 1 ? `정답을 모두 고르세요 (${selectedIndices.length}/${totalAnswersNeeded})` : "정답을 고르세요"}
          </p>
        </div>

        <div className={styles.optionsGrid}>
          {currentOptions.map((opt, i) => {
            const isAnswer = currentWord.ko.includes(opt);
            const isSelected = selectedIndices.includes(i);
            const isWrongClick = wrongIdx === i;

            let btnClass = styles.optionBtn;
            if (isSelected) btnClass += ` ${styles.correct}`;
            if ((wrongSelection || isAllFound) && isAnswer) btnClass += ` ${styles.correctHighlight}`;
            if (isWrongClick) btnClass += ` ${styles.wrong}`;

            return (
              <button
                key={i}
                className={btnClass}
                onClick={() => handleOptionClick(opt, i)}
                disabled={isAllFound || (wrongSelection && !isSelected)}
              >
                {opt.join(', ')}
              </button>
            );
          })}
        </div>
      </div>

      {wrongSelection && (
        <button className={styles.nextBtn} onClick={handleNext}>
          정답 확인 후 다음으로 →
        </button>
      )}
    </div>
  );
}