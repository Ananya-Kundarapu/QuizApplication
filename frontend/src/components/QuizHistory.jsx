import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles/QuizHistory.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function QuizHistory() {
  const [history, setHistory] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const reviewQuiz = location.state?.reviewQuiz;
  const answers = location.state?.answers;
  const course = location.state?.course;
  const customQuestions = location.state?.questions;

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
    setHistory(storedHistory);
    window.scrollTo(0, 0);
  }, []);

  const questions = {
    Physics: [
      { question: 'Speed of a boat in standing water is 9 kmph and the speed of the stream is 1.5 kmph...', options: ['16 hours', '18 hours', '20 hours', '24 hours'], correctAnswer: '24 hours' },
      { question: 'What is the acceleration due to gravity on Earth?', options: ['9.8 m/s²', '8.9 m/s²', '10.2 m/s²', '7.5 m/s²'], correctAnswer: '9.8 m/s²' },
      { question: 'What is the unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 'Newton' },
      { question: 'Which law states that every action has an equal and opposite reaction?', options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'], correctAnswer: 'Third Law' },
      { question: 'What is the speed of light in a vacuum?', options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'], correctAnswer: '300,000 km/s' },
    ],
    Chemistry: [
      { question: 'What is the chemical symbol for Gold?', options: ['Au', 'Ag', 'Fe', 'Cu'], correctAnswer: 'Au' },
      { question: 'What gas is the second most abundant element in the universe?', options: ['Hydrogen', 'Helium', 'Oxygen', 'Nitrogen'], correctAnswer: 'Helium' },
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

  const usedQuestions = customQuestions || questions[course] || [];

  // Format duration as HH:mm:ss
  const formatDuration = (start, end) => {
    const startTime = new Date(start);
    const submitTime = new Date(end);
    const diffMs = submitTime - startTime;
    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Format date as "May 20 | 2025 at 8:30 AM"
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(',', ' |');
  };

  const currentQuizEntry = history.find(entry => entry.course === course) || {};

  const startTime = location.state?.startTime || currentQuizEntry.startTime || new Date().toISOString();
  const submitTime = location.state?.submitTime || currentQuizEntry.submitTime || new Date().toISOString();

  // Calculate correct and total answers
  const correctCount = answers?.filter((a, i) => a === usedQuestions[i]?.correctAnswer).length || 0;
  const totalQuestions = usedQuestions.length;

  const handleCardClick = (entry) => {
    const custom = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
    const match = custom.find(q => q.name === entry.course);
    navigate('/quiz-history', {
      state: {
        reviewQuiz: true,
        answers: entry.answers,
        course: entry.course,
        questions: match ? match.questions : undefined,
        startTime: entry.startTime,
        submitTime: entry.submitTime,
      }
    });
  };

  return (
    <div className="main-content">
      {reviewQuiz && answers && course ? (
        <div className="quiz-review-card">
          <h2>Quiz Review - {course}</h2>
          <div className="chart-container">
            <Doughnut
              data={{
                labels: ['Correct', 'Incorrect'],
                datasets: [{
                  data: [
                    correctCount,
                    totalQuestions - correctCount,
                  ],
                  backgroundColor: ['#1935CA', '#FF0000'],
                  hoverBackgroundColor: ['#2148C0', '#FF3333'],
                }],
              }}
              options={{ maintainAspectRatio: false }}
              width={200}
              height={200}
            />
          </div>
          <p>Points Gained: {correctCount} / {totalQuestions}</p>
          <p>Badges Earned:</p>
          <div className="badges-earned">
            {['b1.png', 'b2.png', 'b3.png'].map((badge, index) => (
              <img key={index} src={`/${badge}`} alt={`Badge ${index + 1}`} className="achievement-badge" />
            ))}
          </div>
          <div className="quiz-stats">
            <span className="stats-item">
              <i className="fas fa-clock stats-icon"></i>
              <span className="stats-label">Test Duration:</span> {formatDuration(startTime, submitTime)}
            </span>
            <span className="stats-item">
              <i className="fas fa-calendar-alt stats-icon"></i>
              <span className="stats-label">Test Start Time:</span> {formatDateTime(startTime)}
            </span>
            <span className="stats-item">
              <i className="fas fa-calendar-alt stats-icon"></i>
              <span className="stats-label">Test Submit Time:</span> {formatDateTime(submitTime)}
            </span>
          </div>
          {usedQuestions.map((q, index) => (
            <div key={index} className="review-question">
              <h3>Question {index + 1}</h3>
              <p>{q.question}</p>
              <p>
                Your Answer: <span className={answers[index] === q.correctAnswer ? 'correct' : 'wrong'}>{answers[index]}</span>
              </p>
              <p>
                Correct Answer: <span className="correct">{q.correctAnswer}</span>
              </p>
            </div>
          ))}
          <button className="back-button" onClick={() => navigate('/quiz-history')}>
            Back to History
          </button>
        </div>
      ) : (
        <>
          <h2>Quiz History</h2>
          <div className="quiz-card-list">
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '20px' }}>
                  You haven’t taken any quizzes yet.
                </p>
                <button
                  style={{
                    backgroundColor: '#1935CA',
                    color: 'white',
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              [...history].reverse().map((entry, index) => {
                const correctCountCard = entry.score / 20;
                const totalQuestionsCard = entry.answers?.length || 5;
                return (
                  <div key={index} className="quiz-card" onClick={() => handleCardClick(entry)}>
                    <div className="quiz-card-header">{entry.course}</div>
                    <div className="quiz-card-body">
                      <div className="quiz-card-left">
                        <p><strong>Date:</strong> {entry.date}</p>
                        <p><strong>Correct:</strong> {correctCountCard}/{totalQuestionsCard}</p>
                      </div>
                      <div className="quiz-card-right">
                        <Doughnut
                          data={{
                            labels: ['Correct', 'Incorrect'],
                            datasets: [{
                              data: [correctCountCard, totalQuestionsCard - correctCountCard],
                              backgroundColor: ['#1935CA', '#FF0000'],
                              borderWidth: 1
                            }]
                          }}
                          options={{
                            cutout: '70%',
                            plugins: { legend: { display: false } }
                          }}
                          width={100}
                          height={100}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default QuizHistory;
