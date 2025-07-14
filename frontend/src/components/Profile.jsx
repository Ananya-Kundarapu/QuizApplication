import { useState, useEffect } from 'react';
import { FaTrophy, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FiClipboard } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext'; // ✅ use Auth context
import '../styles/Profile.css';

function Profile() {
  const [quizHistory, setQuizHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ full name from context
  const fullName = user?.fName + ' ' + user?.lName || 'User';
const backendBase = 'http://localhost:5000';
const profileImage = user?.profilePic?.startsWith('/uploads/')
  ? `${backendBase}${user.profilePic}`
  : user?.profilePic || '/profile.png';

  // Fetch result history from backend
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/results/user/${user?._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (res.ok) setQuizHistory(data.results);
        else console.error('Error fetching results:', data.message);
      } catch (err) {
        console.error('Failed to fetch quiz history', err);
      }
    };
    if (user?._id) fetchResults();
  }, [user]);

  // Stats calculation
  const totalQuizzes = quizHistory.length;
  const quizzesPassed = quizHistory.filter(q => q.score / q.total >= 0.5).length;
  const fastestTimeSec = Math.min(...quizHistory.map(q => q.duration || Infinity));
  const totalCorrect = quizHistory.reduce((sum, q) => sum + q.answers.filter(a => a.isCorrect).length, 0);

  const progressPercent = totalQuizzes === 0 ? 0 : Math.round((quizzesPassed / totalQuizzes) * 100);
  const progressColor =
    progressPercent >= 80 ? '#1935CA' :
    progressPercent >= 50 ? '#4a90e2' : '#888888';

  const formatTime = (sec) => {
    if (!sec || sec === Infinity) return 'N/A';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // Badge logic
  const badgeData = [
    {
      id: 'winner',
      title: 'Winner',
      desc: 'Scored 100% in a quiz',
      src: '/b2.png',
      check: (history) => history.some(q => q.score === q.total),
    },
    {
      id: 'powerPlayer',
      title: 'Power Player',
      desc: 'Scored ≥80% in 3 quizzes',
      src: '/b6.png',
      check: (history) => history.filter(q => q.score / q.total >= 0.8).length >= 3,
    },
    {
      id: 'streakMaster',
      title: 'Streak Master',
      desc: 'Scored ≥70% in 3 quizzes in a row',
      src: '/b5.jpg',
      check: (history) => {
        if (history.length < 3) return false;
        for (let i = 0; i <= history.length - 3; i++) {
          if (
            history[i].score / history[i].total >= 0.7 &&
            history[i + 1].score / history[i + 1].total >= 0.7 &&
            history[i + 2].score / history[i + 2].total >= 0.7
          ) return true;
        }
        return false;
      },
    },
    {
      id: 'comeback',
      title: 'Comeback',
      desc: 'Scored <40% then >70% in next quiz',
      src: '/b1.png',
      check: (history) => {
        for (let i = 1; i < history.length; i++) {
          const prev = history[i - 1].score / history[i - 1].total;
          const curr = history[i].score / history[i].total;
          if (prev < 0.4 && curr > 0.7) return true;
        }
        return false;
      },
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      desc: 'Completed all quizzes',
      src: '/b7.png',
      check: (history) => history.length >= 10,
    },
    {
      id: 'speedster',
      title: 'Speedster',
      desc: 'Completed quiz in <30s per question',
      src: '/b4.jpg',
      check: (history) => history.some(q => (q.duration / q.total) < 30),
    },
    {
      id: 'lucky',
      title: 'Lucky',
      desc: 'Scored >60% in less than 50% of time limit',
      src: '/b3.png',
      check: (history) => history.some(q => {
        const limitSec = q.quizId?.timeLimit * 60;
        return q.score / q.total > 0.6 && q.duration < (limitSec / 2);
      }),
    },
  ];

  const unlockedBadges = badgeData.filter(b => b.check(quizHistory)).map(b => b.id);

  const handleClipboardClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJoinCode(text);
      setJoinError('');
    } catch (err) {
      console.error('Clipboard read failed:', err);
    }
  };

  const handleJoinQuiz = async () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter a quiz code.');
      return;
    }
    setJoinError('');
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${joinCode.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid code');

      navigate(`/quiz/${data.name}`, {
        state: {
          isCustom: true,
          code: data.code,
          joinMode: true,
          questions: data.questions,
          timeLimit: data.timer,
        },
      });
    } catch (err) {
      setJoinError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <img src={profileImage} alt="Profile" className="profile-image" />
        <div className="profile-info">
          <h1>{fullName}</h1>
          <p>Level Up with Every Quiz You Conquer!</p>
          <div className="progress-bar" style={{ backgroundColor: '#ddd' }}>
            <div
              className="progress"
              style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
            />
          </div>
          <div className="stats">
            <div><FaTrophy size={28} color="#1935CA" /><span>{quizzesPassed} Quiz Passed</span></div>
            <div><FaClock size={28} color="#1935CA" /><span>{formatTime(fastestTimeSec)} Fastest Time</span></div>
            <div><FaCheckCircle size={28} color="#1935CA" /><span>{totalCorrect} Correct Answers</span></div>
          </div>
        </div>
      </div>

      <div className="row-widgets">
        <div className="achievements-card half-width">
          <h3>Achievements</h3>
          <div className="achievements-list" onClick={() => setShowModal(true)}>
            {badgeData.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="achievement-item"
                title={badge.desc}
                style={{
                  filter: unlockedBadges.includes(badge.id) ? 'none' : 'grayscale(100%)',
                  cursor: 'pointer',
                }}
              >
                <img src={badge.src} alt={badge.title} className="achievement-badge" />
                {badge.title}
              </div>
            ))}
          </div>
        </div>

        <div className="custom-quiz-card half-width">
          <h3>Create Custom Quiz</h3>
          <p>Make and share your own quiz with friends!</p>
          <button onClick={() => navigate('/create-quiz')}>+ Create Quiz</button>
        </div>
      </div>

      <div className="play-with-friends-card">
        <h3>Play with Friends</h3>
        <div className="join-input">
          <input
            type="text"
            placeholder="Enter code"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value);
              setJoinError('');
            }}
          />
          <FiClipboard className="clipboard-icon" onClick={handleClipboardClick} />
          <button onClick={handleJoinQuiz} disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join'}
          </button>
        </div>
        {joinError && <p className="error-text">{joinError}</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <h2>All Achievements</h2>
            <div className="scrollable-badges">
              {badgeData.map((badge) => (
                <div
                  key={badge.id}
                  className="achievement-item"
                  title={badge.desc}
                  style={{
                    filter: unlockedBadges.includes(badge.id) ? 'none' : 'grayscale(100%)',
                    cursor: 'default',
                  }}
                >
                  <img src={badge.src} alt={badge.title} className="achievement-badge" />
                  <p>{badge.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
