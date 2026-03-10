import styles from './StudyComplete.module.css';
import { useNavigate } from 'react-router-dom';

export default function StudyComplete({ totalCount, wrongCount = 0, onRestart, onRetryWrong }) {
  const navigate = useNavigate();
  const isPerfect = wrongCount === 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>{isPerfect ? '🔥' : '🎉'}</div>
        <h2 className={styles.title}>{isPerfect ? '완벽합니다!' : '학습 완료!'}</h2>

        {totalCount !== 0 && (
          <div className={styles.resultInfo}>
            <p className={styles.desc}>
              총 <strong>{totalCount}개</strong>의 문제를 모두 풀었습니다.
            </p>
            {/* 🔹 오답이 있을 때만 성적 결과 노출 */}
            {!isPerfect && (
              <p className={styles.scoreDetail}>
                맞힌 개수: {totalCount - wrongCount} / 틀린 개수: <span className={styles.wrongText}>{wrongCount}</span>
              </p>
            )}
          </div>
        )}

        <div className={styles.btnGroup}>
          {/* 🔹 오답이 있을 때만 '오답 다시 풀기' 버튼 노출 */}
          {!isPerfect && onRetryWrong && (
            <button className={styles.retryBtn} onClick={onRetryWrong}>
              틀린 {wrongCount}문제 다시 풀기
            </button>
          )}

          <button className={styles.restartBtn} onClick={onRestart}>
            처음부터 다시 학습
          </button>

          <button className={styles.exitBtn} onClick={() => navigate(-1)}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}