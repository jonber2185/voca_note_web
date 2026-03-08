import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AddWords.module.css';
import AddWords1 from '../components/AddWords1';
import AddWords2 from '../components/AddWords2';

export default function AddWords() {
  const { user } = useAuth();
  const { setId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [analyzedList, setAnalyzedList] = useState([]);

  // 공통 뒤로가기 로직
  const handleBack = () => {
    if (step === 2) {
      setStep(1); // 2단계면 입력 단계로
    } else {
      navigate(-1); // 1단계면 이전 페이지(단어장 목록 등)로
    }
  };

  const onAnalysisComplete = (data) => {
    const formatted = data.map(item => ({
      id: item.id,
      word: item.word,
      ko: item.definitions.map(d => d.ko),
      meaning: [0]
    }));
    setAnalyzedList(formatted);
    setStep(2);
  };

  return (
    <div className={styles.container}>
      {/* 🔹 헤더와 뒤로가기는 여기서 공통으로 관리! */}
      <header className={styles.header}>
        <button className={styles.backLink} onClick={handleBack}>
          ← {step === 2 ? '수정하기' : '뒤로가기'}
        </button>
        <h2>단어 추가</h2>
        <div className={styles.stepper}>
          <span className={step === 1 ? styles.activeStep : ''}>1. 입력</span>
          <span className={styles.arrow}>&gt;</span>
          <span className={step === 2 ? styles.activeStep : ''}>2. 검토</span>
        </div>
      </header>

      {/* 단계별 컴포넌트 렌더링 */}
      {step === 1 ? (
        <AddWords1
          onAnalysisComplete={onAnalysisComplete}
          setId={setId}
          rawText={rawText}
          setRawText={setRawText}
        />
      ) : (
        <AddWords2
          analyzedList={analyzedList}
          setAnalyzedList={setAnalyzedList}
          setId={setId}
          user={user}
          onBack={handleBack} // Step2 내부의 '수정' 버튼에도 연결 가능
        />
      )}
    </div>
  );
}