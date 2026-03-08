import { IoSearchOutline } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from './SearchBar.module.css';


export default function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || "";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('search');

    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  }

  return (
    <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
      <button type="submit" className={styles.searchButton}>
        <IoSearchOutline className={styles.searchIcon} />
      </button>
      <input
        name="search"
        type="text"
        placeholder="사용자 또는 단어 세트 검색..."
        autoComplete="off"
        key={searchQuery}
        defaultValue={searchQuery}
      />
    </form>
  );
}