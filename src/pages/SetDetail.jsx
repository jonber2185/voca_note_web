import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import axios from '../lib/axios';
import WordCard from '../components/WordCard';
import styles from './SetDetail.module.css';
import { useAuth } from '../contexts/AuthContext';


export default function SetDetail() {
  const { user, isLoading: authLoading } = useAuth();
  const { userId, setId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isOwner = user && String(user.user_id) === String(userId);

  // 학습하기 상태
  const [showStudyOptions, setShowStudyOptions] = useState(false);
  const dropdownRef = useRef(null);

  // 상태 관리
  const [setData, setSetData] = useState(null); // 단어장 자체 정보 (제목, 공개여부 등)
  const [words, setWords] = useState([]);      // 단어 리스트
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부

  // 수정용 임시 상태
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPublic, setEditPublic] = useState(false);

  const handleBack = () => {
    if (location.state?.create) {
      navigate('/', { replace: true });
    } else {
      navigate(-1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 2. 단어장 정보 수정 (제목, 공개여부 등)
  const handleUpdateSet = async () => {
    try {
      await axios.patch(`/set/${userId}/${setId}`, {
        title: editTitle,
        description: editDesc,
        is_public: editPublic
      });
      setSetData({ ...setData, title: editTitle, description: editDesc, is_public: editPublic });
      setIsEditing(false);
    } catch (error) {
      alert("수정 실패");
    }
  };

  // 3. 단어장 전체 삭제
  const handleDeleteSet = async () => {
    if (window.confirm("이 단어장을 정말 삭제할까요? 단어들도 모두 삭제됩니다.")) {
      try {
        await axios.delete(`/set/${userId}/${setId}`);
        navigate('/');
      } catch (error) {
        alert("삭제 실패");
      }
    }
  };

  const editWord = async (data) => {
    await axios.patch(`/words/${userId}/${setId}`, {
      word: data
    });
  }

  const deleteWord = async (wordId) => {
    setWords((prevWords) => prevWords.filter((word) => word.id !== wordId));

    try {
      await axios.delete(`/words/${userId}/${setId}/${wordId}`);
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.");
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowStudyOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSetDetail = async () => {
      try {
        const response = await axios.get(`/set/${userId}/${setId}`);
        const { set_info, words } = response.data;

        setSetData(set_info);
        setWords(words || []);

        setEditTitle(set_info.title);
        setEditDesc(set_info.description || '');
        setEditPublic(set_info.is_public);
      } catch (error) {
        console.error("데이터를 가져오는데 실패했습니다.", error);
      }
    };
    fetchSetDetail();
  }, [setId]);

  if (!setData || authLoading) return <div className={styles.loading}>정보를 불러오는 중...</div>;

  return (
    <div className={styles.container}>
      {/* 상단 네비게이션 */}
      <div className={styles.navHeader}>
        <button className={styles.backBtn} onClick={handleBack}>← 뒤로가기</button>
        <div className={styles.navRight}>

          {/* 🔹 1. 단어장 삭제 & 정보 수정 버튼 제한 */}
          {isOwner && (
            <>
              <button className={styles.deleteSetBtn} onClick={handleDeleteSet}>삭제</button>
              <button className={styles.editBtn} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "취소" : "정보 수정"}
              </button>
            </>
          )}

          {/* 학습하기 버튼 (이건 본인이 아니어도 가능) */}
          <div className={styles.studyWrapper} ref={dropdownRef}>
            <button
              className={styles.studyBtn}
              onClick={() => setShowStudyOptions(!showStudyOptions)}
            >
              학습하기
            </button>

            {showStudyOptions && (
              <div className={styles.studyDropdown}>
                <button onClick={() => navigate(`/${userId}/${setId}/study/card`)}>
                  <span>📇</span> 낱말카드 학습
                </button>
                <button onClick={() => navigate(`/${userId}/${setId}/study/multiple`)}>
                  <span>📝</span> 객관식 퀴즈
                </button>
                <button onClick={() => navigate(`/${userId}/${setId}/study/write`)}>
                  <span>⌨️</span> 주관식 받아쓰기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <header className={styles.header}>
        {/* 🔹 2. 수정 모드 진입 자체를 isOwner일 때만 허용 */}
        {isEditing && isOwner ? (
          /* 수정 모드 UI */
          <div className={styles.editForm}>
            <input
              className={styles.titleInput}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <div className={styles.statusField}>
              <span className={styles.statusLabel}>공개 설정</span>
              <div className={styles.slidingToggle}>
                <div className={`${styles.glider} ${editPublic ? styles.public : styles.private}`} />
                <button type="button" onClick={() => setEditPublic(false)} className={styles.toggleBtn}>비공개</button>
                <button type="button" onClick={() => setEditPublic(true)} className={styles.toggleBtn}>공개</button>
              </div>
            </div>
            <button className={styles.saveBtn} onClick={handleUpdateSet}>변경사항 저장</button>
          </div>
        ) : (
          <>
            <div className={styles.titleBox}>
              <div className={styles.titleRow}>
                <h2 className={styles.title}>{setData.title}</h2>
                <span className={styles.countBadge}>{words.length} words</span>
              </div>
              {setData.description && <p className={styles.description}>{setData.description}</p>}
              <div className={styles.infoRow}>
                <span className={styles.dateLabel}>Created on</span>
                <span className={styles.dateValue}>{formatDate(setData.created_at)}</span>
              </div>
            </div>

            {/* 🔹 3. 단어 추가 버튼 제한 */}
            {isOwner && (
              <button className={styles.addBtn} onClick={() => navigate(`/word-set/${setId}/add-words`)}>
                단어 추가
              </button>
            )}
          </>
        )}
      </header>

      <div className={styles.wordList}>
        {words.length > 0 ? (
          words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              isOwner={isOwner}
              editWord={(data) => editWord(data)}
              deleteWord={() => deleteWord(word.id)}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyMsg}>단어가 하나도 없네요.. 🧐</p>
            <p className={styles.emptySub}>새로운 단어를 추가해 보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}