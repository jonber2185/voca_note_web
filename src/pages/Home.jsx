import { useAuth } from '../contexts/AuthContext';
import styles from './Home.module.css';
import MySet from '../components/MySets';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      {user.user_id ? <MySet /> : (
        <header className={styles.header}>
          <h1 className={styles.title}>Voca <span>Note</span></h1>
          <p>개발자가 쓰려고 만든 단어장</p>
        </header>
      )}
    </div>
  );
}