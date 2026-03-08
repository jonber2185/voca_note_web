import { useNavigate } from 'react-router-dom';
import styles from './SetCard.module.css'

export default function SetCard({ set }) {
  const navigate = useNavigate();

  const handleMoveDetail = () => {
    navigate(`/${set.owner_id}/${set.id}`);
  };

  return (
    <div className={styles.card}>
      <h3>{set.title}</h3>
      <p>{set.description || '꾸준히 학습해 보세요!'}</p>
      <button className={styles.studyBtn} onClick={handleMoveDetail}>
        Let's Study
      </button>
    </div>
  )
}