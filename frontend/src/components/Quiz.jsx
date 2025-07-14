import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Quiz.css';
import '../styles/LeaderboardPopup.css';

function Quiz() {
const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isCustomQuiz = location.state?.isCustom;
  const joinMode = location.state?.joinMode;
  const customQuestions = location.state?.questions;
  const quizCode = location.state?.code;
  const course = location.state?.course || quizId || '';

  const [timeLeft, setTimeLeft] = useState(900);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(true);


  const questions = {
    Physics: [
      { question: 'Speed of a boat in standing water is 9 kmph and the speed of the stream is 1.5 kmph. A man rows to a place at a distance of 105 km and comes back to the starting point. The total time taken by him is:', options: ['16 hours', '18 hours', '20 hours', '24 hours'], correctAnswer: '24 hours' },
      { question: 'What is the acceleration due to gravity on Earth?', options: ['9.8 m/s²', '8.9 m/s²', '10.2 m/s²', '7.5 m/s²'], correctAnswer: '9.8 m/s²' },
      { question: 'What is the unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 'Newton' },
      { question: 'Which law states that every action has an equal and opposite reaction?', options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'], correctAnswer: 'Third Law' },
      { question: 'What is the speed of light in a vacuum?', options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'], correctAnswer: '300,000 km/s' },
    ],
    Chemistry: [
      { question: 'What is the chemical symbol for Gold?', options: ['Au', 'Ag', 'Fe', 'Cu'], correctAnswer: 'Au' },
      { question: 'What gas, discovered on the sun before Earth, is the second most abundant element in the universe?', options: ['Hydrogen', 'Helium', 'Oxygen', 'Nitrogen'], correctAnswer: 'Helium' },
      { question: 'What is the pH of pure water?', options: ['5', '6', '7', '8'], correctAnswer: '7' },
      { question: 'Which element is a noble gas?', options: ['Oxygen', 'Neon', 'Chlorine', 'Sulfur'], correctAnswer: 'Neon' },
      { question: 'What type of bond involves the sharing of electrons?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], correctAnswer: 'Covalent' },
    ],
    Mathematics: [
      { question: 'What is the value of π (pi) to two decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correctAnswer: '3.14' },
      { question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correctAnswer: '12' },
      { question: 'What is 5! (factorial of 5)?', options: ['100', '110', '120', '130'], correctAnswer: '120' },
      { question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correctAnswer: '180°' },
      { question: 'What is the value of 2³ + 3²?', options: ['15', '16', '17', '18'], correctAnswer: '17' },
    ],
    Biology: [
      { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'], correctAnswer: 'Mitochondria' },
      { question: 'What gas do plants release during photosynthesis?', options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], correctAnswer: 'Oxygen' },
      { question: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Tissue'], correctAnswer: 'Cell' },
      { question: 'Which blood cells fight infections?', options: ['Red Blood Cells', 'White Blood Cells', 'Platelets', 'Plasma'], correctAnswer: 'White Blood Cells' },
      { question: 'What is the process by which plants make their food?', options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Digestion'], correctAnswer: 'Photosynthesis' },
    ],
    Social: [
      { question: 'Who was the first Prime Minister of India?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Indira Gandhi'], correctAnswer: 'Jawaharlal Nehru' },
      { question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 'Paris' },
      { question: 'Which river is known as the lifeline of Egypt?', options: ['Nile', 'Amazon', 'Ganges', 'Yangtze'], correctAnswer: 'Nile' },
      { question: 'In which year did World War II end?', options: ['1942', '1943', '1944', '1945'], correctAnswer: '1945' },
      { question: 'What is the largest continent by area?', options: ['Africa', 'Asia', 'Australia', 'Europe'], correctAnswer: 'Asia' },
    ],
    English: [
      { question: 'What is the synonym of "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correctAnswer: 'Joyful' },
      { question: 'Which word is a noun?', options: ['Run', 'Quickly', 'Dog', 'Beautiful'], correctAnswer: 'Dog' },
      { question: 'What is the past tense of "go"?', options: ['Goes', 'Going', 'Went', 'Gone'], correctAnswer: 'Went' },
      { question: 'Which sentence is correct?', options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'], correctAnswer: 'She goes to school.' },
      { question: 'What is the antonym of "big"?', options: ['Large', 'Huge', 'Small', 'Giant'], correctAnswer: 'Small' },
    ],
  };
  
const [fetchedQuestions, setFetchedQuestions] = useState([]);
const activeQuestions = isCustomQuiz ? customQuestions : fetchedQuestions;

if (loading) {
  return <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading quiz...</p>;
}

if (!activeQuestions || activeQuestions.length === 0) {
  return <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>No questions available for this quiz.</p>;
}

  useEffect(() => {
    const enterFullScreen = async () => {
      try {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { // Safari
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
          await element.msRequestFullscreen();
        }
      } catch (error) {
        console.error('Failed to enter full-screen mode:', error);
      }
    };
    enterFullScreen();
    return () => {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
        document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
useEffect(() => {
  const fetchLiveQuiz = async () => {
    if (!isCustomQuiz && course) {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok && data?.quiz?.questions?.length > 0) {
          setFetchedQuestions(data.quiz.questions);
        } else {
          console.error('Invalid or empty quiz:', data.message || data);
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
      } finally {
        setLoading(false);
      }
    } else if (!isCustomQuiz && questions[course]) {
      // Default quiz
      setFetchedQuestions(questions[course]);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  fetchLiveQuiz();
}, [isCustomQuiz, quizId, course]);


useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        if (currentQuestion < activeQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedOption(answers[currentQuestion + 1] || null);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentQuestion > 0) {
          setCurrentQuestion(currentQuestion - 1);
          setSelectedOption(answers[currentQuestion - 1] || null);
        }
      } else if (e.key >= '1' && e.key <= String(activeQuestions[currentQuestion].options.length)) {
        const idx = Number(e.key) - 1;
        const option = activeQuestions[currentQuestion].options[idx];
        handleAnswer(option);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, answers, activeQuestions]);

  const handleAnswer = (answer) => {
    setSelectedOption(answer);
    const updated = [...answers];
    updated[currentQuestion] = answer;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(answers[currentQuestion + 1] || null);
    } else {
      setShowConfirmation(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] || null);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestion(index);
    setSelectedOption(answers[index] || null);
  };

  const handleSubmit = async () => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
        await (document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.());
      }
    } catch (error) {
      console.error('Failed to exit full-screen mode:', error);
    }

    const score = answers.reduce(
      (acc, ans, idx) =>
        ans === activeQuestions[idx].correctAnswer ? acc + 1 : acc,
      0
    );
    const percentage = (score / activeQuestions.length) * 100;

    const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    history.push({ course, score: percentage, date: new Date().toLocaleString(), answers });
    localStorage.setItem('quizHistory', JSON.stringify(history));

    if (joinMode && isCustomQuiz && quizCode) {
      const leaderboard = JSON.parse(localStorage.getItem(`leaderboard_${quizCode}`) || '[]');
      leaderboard.push({
        name: 'You',
        score: `${score}/${activeQuestions.length}`,
        time: `${((900 - timeLeft) / 60).toFixed(1)} min`,
        answers
      });
      localStorage.setItem(`leaderboard_${quizCode}`, JSON.stringify(leaderboard));
      setShowLeaderboard(true);
    } else {
      setShowCongratulations(true);
    }
  };

  const handleReviewQuiz = () => {
    navigate('/quiz-history', { state: { reviewQuiz: true, answers, course } });
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;
  const progress = (timeLeft / 900) * 360;

  if (showLeaderboard) {
    const leaderboard = JSON.parse(localStorage.getItem(`leaderboard_${quizCode}`) || '[]');
    return (
      <div className="confirmation leaderboard-popup">
        <img src="/qlo.jpg" className="logo-top-left" />
        <div className="quiz leaderboard-frame">
          <h2>Leaderboard</h2>
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <span>Name</span>
              <span>Score</span>
              <span>Time</span>
            </div>
            {leaderboard.map((entry, index) => (
              <div className="leaderboard-row" key={index}>
                <span>{entry.name}</span>
                <span>{entry.score}</span>
                <span>{entry.time}</span>
              </div>
            ))}
          </div>
          <button className="go-home-button" onClick={() => navigate('/profile')}>Go Home</button>
        </div>
      </div>
    );
  }

  if (showCongratulations) {
    const score = answers.filter((ans, idx) => ans === activeQuestions[idx].correctAnswer).length;
    const percentage = (score / activeQuestions.length) * 100;
    return (
      <div className="confirmation">
        <img src="/qlo.jpg" className="logo-top-left" />
        <div className="quiz">
          <img src="/b2.png" alt="Trophy" className="trophy-icon" />
          <h2>Congratulations, you have passed</h2>
          <p>You scored {percentage}%</p>
          <div className="confirmation-buttons">
            <button className="go-home-button" onClick={() => navigate('/profile')}>Go Home</button>
            <button onClick={handleReviewQuiz}>Review Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="confirmation">
        <img src="/qlo.jpg" className="logo-top-left" />
        <div className="quiz">
          <img src="/qm.jpg" className="qm-icon" />
          <h2>Are you sure you want to submit Quiz?</h2>
          <p><strong>⏳ Time Remaining:</strong> {formatTime(timeLeft)}</p>
          <p><strong>❗ Unanswered Questions:</strong> {activeQuestions.length - answers.filter(Boolean).length}</p>
          <div className="confirmation-buttons">
            <button onClick={() => setShowConfirmation(false)}>No</button>
            <button className="yes-button" onClick={handleSubmit}>Yes</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <img src="/qlo.jpg" className="logo-top-left" width="220px" height="68px" />
      <h2 style={{ color: '#FFFFFF' }}>{course} Quiz</h2>
      <div className="quiz-container">
        <div className="quiz">
          <div className="quiz-header">
            {currentQuestion > 0 && <button onClick={handlePrevious} className="previous-button">Previous</button>}
            <p className="question-number">{currentQuestion + 1}/{activeQuestions.length}</p>
            <div className="timer-container">
              <div className="timer-circle" style={{ background: `conic-gradient(#1935CA ${progress}deg, #e6e6e6 ${progress}deg)` }}>
                <p className="timer">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
          <div className="question">
            <h3>Question {currentQuestion + 1}</h3>
            <p>{activeQuestions[currentQuestion].question}</p>
            <div className="options">
              {activeQuestions[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  className={selectedOption === option ? 'selected' : ''}
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="next-button">
              <button onClick={handleNext}>
                {currentQuestion === activeQuestions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        </div>
        <div className="question-navigator">
          {activeQuestions.map((_, i) => (
            <div
              key={i}
              className={`navigator-item ${i === currentQuestion ? 'active' : ''} ${answers[i] ? 'answered' : ''}`}
              onClick={() => handleQuestionSelect(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Quiz;