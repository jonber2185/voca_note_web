import styles from './AddWords2.module.css';
import axios from '../lib/axios';
import { useNavigate } from 'react-router-dom';

export default function AddWords2({ analyzedList, setAnalyzedList, setId, user, onBack }) {
  const navigate = useNavigate();

  const toggleMeaning = (wordIdx, meanIdx) => {
    setAnalyzedList(prev => prev.map((item, idx) => {
      if (idx === wordIdx) {
        const isSelected = item.meaning.includes(meanIdx);
        const nextMeaning = isSelected
          ? item.meaning.filter(i => i !== meanIdx)
          : [...item.meaning, meanIdx].sort((a, b) => a - b);
        return { ...item, meaning: nextMeaning };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post(`/words/${user.user_id}/${setId}`, {
        words: analyzedList.map(item => ({ word_id: item.id, meaning: item.meaning }))
      });
      navigate(`/${user.user_id}/${setId}`, { state: { create: true }, replace: true });
    } catch (err) {
      alert("저장 실패");
    }
  };

  return (
    <div className={styles.resultArea}>
      <div className={styles.wordGrid}>
        {analyzedList.map((item, idx) => (
          <div key={item.id} className={styles.wordCard}>
            <h4>{item.word}</h4>
            <div className={styles.meanings}>
              {item.ko.map((m, mIdx) => (
                <button
                  key={mIdx}
                  className={`${styles.meanBtn} ${item.meaning.includes(mIdx) ? styles.selected : ''}`}
                  onClick={() => toggleMeaning(idx, mIdx)}
                >
                  {m.join(', ')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <button onClick={onBack}>수정</button>
        <button onClick={handleSave}>이대로 등록하기</button>
      </div>
    </div>
  );
}