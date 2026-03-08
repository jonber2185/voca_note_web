import { useState } from 'react';
import styles from './AddWords1.module.css'; // 파일명 확인해주세요!
import axios from '../lib/axios';

export default function AddWords1({ onAnalysisComplete, setId, rawText, setRawText }) {
  const [error, setError] = useState('');
  const [failedWords, setFailedWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tempData, setTempData] = useState([]);

  // 단어 개수 계산 로직
  const getLineCount = (text) => text.split('\n').filter(line => line.trim() !== '').length;
  const wordCount = getLineCount(rawText);

  // 텍스트 변경 시 실시간 에러 핸들링
  const handleTextChange = (e) => {
    const value = e.target.value;
    const count = getLineCount(value);

    if (count > 25) {
      setError('한번에 최대 25단어만 입력 가능합니다.');
    } else {
      setError('');
    }
    setRawText(value);
  };

  const handleAnalyze = async () => {
    const inputWords = rawText.split('\n').map(w => w.trim()).filter(w => w !== "");
    if (inputWords.length === 0) return setError("단어를 입력해주세요.");
    if (wordCount > 25) return; // 25개 넘으면 실행 방지

    try {
      setIsLoading(true);
      setError('');
      setFailedWords([]);

      const response = await axios.post('/words/analyze', {
        set_id: setId,
        words: inputWords
      });
      const successData = response.data;

      const missing = inputWords.filter(inputW =>
        !successData.some(success => success.word.toLowerCase() === inputW.toLowerCase())
      );

      if (missing.length > 0) {
        setTempData(successData);
        setFailedWords(missing);
        setError(`${missing.length}개의 단어를 분석할 수 없습니다. 이미 존재하는 단어이거나 오타일 수 있습니다.`);
        setIsLoading(false);
        return;
      }

      onAnalysisComplete(successData);
    } catch (err) {
      if (err.response?.data?.message === "words is empty") {
        setError("추가할 단어가 없습니다.");
      } else {
        setError("서버 통신 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 뱅글뱅글 돌아가는 로딩 UI
  if (isLoading) return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p>AI가 단어를 분석하고 있습니다...</p>
      <span className={styles.loadingSub}>최대 1분 이상 소요될 수 있습니다.</span>
    </div>
  );

  return (
    <div className={styles.inputArea}>
      <div className={styles.guideRow}>
        <p className={styles.guide}>영어 단어를 한 줄에 하나씩 입력하세요.</p>
        <span className={`${styles.counter} ${wordCount > 25 ? styles.limit : ''}`}>
          {wordCount} / 25
        </span>
      </div>

      <textarea
        className={`${styles.textarea} ${(error || wordCount > 25) ? styles.inputError : ''}`}
        value={rawText}
        onChange={handleTextChange}
        placeholder="apple&#13;&#10;banana&#13;&#10;promote..."
        autoFocus
      />

      {failedWords.length > 0 && (
        <div className={styles.errorBox}>
          <div className={styles.errorHeader}>
            <span className={styles.errorIcon}>⚠️</span>
            <p>{error}</p>
          </div>
          <div className={styles.failedList}>
            {failedWords.map((w, i) => <span key={i} className={styles.failedTag}>{w}</span>)}
          </div>
          <button className={styles.ignoreBtn} onClick={() => onAnalysisComplete(tempData)}>
            이 단어들 제외하고 {tempData.length}개 진행하기
          </button>
        </div>
      )}

      {/* 에러 메시지 (오타가 아닌 일반 에러일 때) */}
      {error && failedWords.length === 0 && (
        <p className={styles.errorMsg}>
          <span>❌</span> {error}
        </p>
      )}

      <button
        className={styles.mainBtn}
        onClick={handleAnalyze}
        disabled={wordCount === 0 || wordCount > 25}
      >
        단어 분석하기
      </button>
    </div>
  );
}