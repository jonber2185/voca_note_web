import { useState } from 'react';
import styles from './WordCard.module.css';

export default function WordCard({ word, isOwner, editWord, deleteWord }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentMeaning, setCurrentMeaning] = useState(word.meaning);

  const toggleMeaning = (index) => {
    if (!isEditing) return;

    setCurrentMeaning((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
  };

  const onCompleteClick = async () => {
    setIsEditing(false);
    const isChanged = JSON.stringify(currentMeaning) !== JSON.stringify(word.meaning)
    if (isChanged) {
      await editWord({
        word_id: word.id,
        meaning: currentMeaning
      });
    }
  }

  return (
    <div className={`${styles.wordCard} ${isEditing ? styles.editingCard : ''}`}>
      <div className={styles.wordContent}>
        <h3 className={styles.wordText}>{word.word}</h3>
        <div className={styles.meaningGroup}>
          {word.ko.map((koWord, i) => (
            <p
              key={i}
              className={`
                ${styles.meaning} 
                ${currentMeaning.includes(i) ? styles.activeMeaning : ''} 
                ${isEditing ? styles.editable : ''}
              `}
              onClick={() => toggleMeaning(i)}
            >
              {i + 1}. {koWord.join(", ")}
            </p>
          ))}
        </div>
      </div>

      {isOwner && (<div className={styles.cardActions}>
        {isEditing ? (
          <button onClick={onCompleteClick} className={styles.saveBtn}>완료</button>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className={styles.editBtn}>수정</button>
            <button onClick={deleteWord} className={styles.delBtn}>삭제</button>
          </>
        )}
      </div>)}
    </div>
  );
}