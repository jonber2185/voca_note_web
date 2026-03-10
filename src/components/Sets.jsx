import SetCard from "./SetCard";
import styles from './Sets.module.css';

export default function Sets({ datas }) {

  return (
    <div className={styles.grid}>
      {datas.map((set) => <SetCard key={set.id} set={set} />)}
    </div>
  );
}
