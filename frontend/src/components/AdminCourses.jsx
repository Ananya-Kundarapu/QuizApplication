import { useEffect, useState, useRef } from 'react';
import '../styles/AdminCourses.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClipboard } from 'react-icons/fi';

function AdminCourses() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [leaderboardSort, setLeaderboardSort] = useState('score');
  const navigate = useNavigate();
  const location = useLocation();
  const newQuizId = location.state?.newQuizId;
  const saveConfirmation = location.state?.saveConfirmation;
  const containerRef = useRef();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        const userData = JSON.parse(sessionStorage.getItem('user'));

        if (!token || !userData) {
          console.error('Not logged in');
          setMyCourses([]);
          setLoading(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 300)); // optional delay

        const res = await fetch('http://localhost:5000/api/quizzes/my-quizzes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          let quizzes = data.quizzes.map((q) => ({
            id: q._id,
            code: q.code,
            name: q.title,
            description: q.description || 'Custom quiz created by you.',
            image: q.image || '/groupq.jpg',
            isCustom: true,
            creatorEmail: q.createdBy?.email || '',
            questions: q.questions || [],
            isPublished: q.isPublished || false,
          }));

          if (newQuizId) {
            quizzes = quizzes.sort((a, b) => {
              if (a.id === newQuizId) return -1;
              if (b.id === newQuizId) return 1;
              return 0;
            });
          } else {
            quizzes = quizzes.reverse();
          }

          setMyCourses(quizzes);

          setTimeout(() => {
            if (newQuizId) {
              const el = document.getElementById(`quiz-${newQuizId}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 200);
        } else {
          console.error('Failed to fetch quizzes:', data.message);
          setMyCourses([]);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setMyCourses([]);
      } finally {
        setLoading(false);
        // Clear location.state to prevent retrigger
        window.history.replaceState({}, document.title);
      }
    };

    fetchQuizzes();
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu && containerRef.current && !containerRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const handleRightClick = (e, quiz) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      quiz,
    });
  };

  const unpublishQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to unpublish this quiz?')) return;
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert('Quiz unpublished successfully');
        setMyCourses((prev) =>
          prev.map((q) => (q.id === quizId ? { ...q, isPublished: false } : q))
        );
        setContextMenu(null);
        if (showPopup && selectedQuiz?.id === quizId) {
          setShowPopup(false);
          setSelectedQuiz(null);
        }
      } else {
        alert('Failed to unpublish quiz: ' + data.message);
      }
    } catch (err) {
      alert('Error unpublishing quiz: ' + err.message);
    }
  };

  const handleClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowPopup(true);
    setContextMenu(null);
  };

  const getAttempts = (quizName) => {
    const allAttempts = JSON.parse(localStorage.getItem('customQuizAttempts') || '{}');
    return allAttempts[quizName] || [];
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Quiz code copied!');
    });
  };

  const sortedLeaderboard = (entries) => {
    if (leaderboardSort === 'score') {
      return [...entries].sort((a, b) => {
        const aCorrect = a.answers.filter((ans, i) => ans === selectedQuiz.questions[i]?.correctAnswer).length;
        const bCorrect = b.answers.filter((ans, i) => ans === selectedQuiz.questions[i]?.correctAnswer).length;
        return bCorrect - aCorrect;
      });
    } else if (leaderboardSort === 'time') {
      const parseTime = (t) => {
        if (!t) return Infinity;
        if (typeof t === 'number') return t;
        const parts = t.split(':').map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return Number(t) || Infinity;
      };
      return [...entries].sort((a, b) => parseTime(a.timeTaken) - parseTime(b.timeTaken));
    }
    return entries;
  };

  const handleEditQuiz = () => {
    setShowPopup(false);
    navigate('/create-quiz', {
      state: {
        editQuizId: selectedQuiz.id,
      },
    });
  };

  return (
    <div className="admin-courses" ref={containerRef}>
      <div className="courses-header">
        <h1>My Courses</h1>
      </div>

      {saveConfirmation && (
        <div className="save-confirmation" style={{ color: 'green', marginBottom: '1rem' }}>
          {saveConfirmation}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading quizzes...</div>
      ) : myCourses.length === 0 ? (
        <div className="no-courses-container">
          <p className="no-courses-msg">No quizzes created yet.</p>
          <button className="create-quiz-btn" onClick={() => navigate('/create-quiz')}>
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="course-list">
          {myCourses.map((quiz) => (
            <div
              key={quiz.code}
              id={`quiz-${quiz.id}`}
              className="course-card"
              onClick={() => handleClick(quiz)}
              onContextMenu={(e) => handleRightClick(e, quiz)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClick(quiz);
              }}
            >
              <img src={quiz.image} alt={quiz.name} className="course-image" />
              <div className="course-content">
                <h3>{quiz.name}</h3>
                <p>{quiz.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {contextMenu && (
        <ul
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            position: 'absolute',
            zIndex: 1000,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: 0,
            margin: 0,
            listStyle: 'none',
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <li
            className="context-menu-item"
            style={{ padding: '8px 12px', cursor: 'pointer' }}
            onClick={() => unpublishQuiz(contextMenu.quiz.id)}
          >
            Unpublish Quiz
          </li>
        </ul>
      )}

      {showPopup && selectedQuiz && (
        <div className="quiz-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="quiz-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h2>Quiz: {selectedQuiz.name}</h2>

            <div className="invite-section">
              <label>Quiz Code:</label>
              <div className="copy-code">
                <input value={selectedQuiz.code} readOnly />
                <FiClipboard className="copy-icon" onClick={() => copyToClipboard(selectedQuiz.code)} />
              </div>
            </div>

            <h3>Leaderboard</h3>

            {getAttempts(selectedQuiz.name).length > 0 && (
              <div className="leaderboard-sort">
                <label>Sort by: </label>
                <select value={leaderboardSort} onChange={(e) => setLeaderboardSort(e.target.value)}>
                  <option value="score">Score (High to Low)</option>
                  <option value="time">Time Taken (Fastest First)</option>
                </select>
              </div>
            )}

            <div className="leaderboard" style={{ maxHeight: '300px', overflow: 'auto' }}>
              {getAttempts(selectedQuiz.name).length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#888' }}>No one has taken this quiz yet.</p>
              ) : (
                sortedLeaderboard(getAttempts(selectedQuiz.name)).map((entry, index) => {
                  const correct = entry.answers.filter(
                    (ans, i) => ans === selectedQuiz.questions[i]?.correctAnswer
                  ).length;

                  return (
                    <div key={index} className="leaderboard-entry" style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                      <p><strong>Participant:</strong> {entry.name || 'Anonymous'}</p>
                      <p><strong>Email:</strong> {entry.email || 'N/A'}</p>
                      <p><strong>Score:</strong> {correct}/{selectedQuiz.questions.length}</p>
                      <p><strong>Time Taken:</strong> {entry.timeTaken || 'N/A'}</p>

                      <details style={{ marginTop: '6px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Answers</summary>
                        <div style={{ marginTop: '4px' }}>
                          {selectedQuiz.questions.map((q, i) => {
                            const answeredIndex = entry.answers[i];
                            const answeredText = answeredIndex != null && q.options?.[answeredIndex] ? q.options[answeredIndex] : '';
                            const correctIndex = q.correctAnswer;
                            const correctText = q.options?.[correctIndex] || '';
                            return (
                              <div key={i} style={{ marginBottom: '6px' }}>
                                <p><strong>{i + 1}:</strong> {q.questionText}</p>
                                <p>Answered: <span style={{ color: answeredIndex === correctIndex ? 'green' : 'red' }}>{answeredText}</span></p>
                                <p>Correct Answer: <span style={{ color: 'green' }}>{correctText}</span></p>
                                <hr />
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    </div>
                  );
                })
              )}
            </div>

            <button className="edit-btn" onClick={handleEditQuiz}>Edit Quiz</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCourses;
