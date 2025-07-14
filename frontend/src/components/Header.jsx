import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { User, UserGear, SignOut } from 'phosphor-react';
import { useAuth } from '../Context/AuthContext';
import '../styles/Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const isJoinTestPage = location.pathname === '/join-test';
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleDropdown = () => setShowDropdown(prev => !prev);

  const handleLogout = () => {
    logout(); // clear context + session
    setShowDropdown(false);
    navigate('/');
  };

  const protectedNavigate = (path) => {
    if (!user) {
      navigate('/signup', {
        state: { message: 'Please sign up to continue.' }
      });
    } else {
      navigate(path);
    }
    closeMenu();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderNavLinks = () => {
    if (!user) return null;

    const isAdmin = user.role === 'Admin';

    return (
      <>
        <span onClick={() => protectedNavigate(isAdmin ? '/admin-courses' : '/courses')}>
          Courses
        </span>

        <span onClick={() => protectedNavigate(isAdmin ? '/admin-settings' : '/quiz-history')}>
          {isAdmin ? 'Permissions' : 'Quiz History'}
        </span>

        <span onClick={() => protectedNavigate('/profile')}>Profile</span>
        <span onClick={() => protectedNavigate('/settings')}>Settings</span>
      </>
    );
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')}>
          <img src="/nlo.png" alt="Quizify Logo" />
        </div>

        {!isJoinTestPage && (
          <>
            <div className="menu-toggle" onClick={toggleMenu}>
              <span></span><span></span><span></span>
            </div>

            <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              {renderNavLinks()}

              {!user ? (
                <div className="auth-buttons">
                  <Link to="/join-test" className="join-test-btn" onClick={closeMenu}>Join Test</Link>
                  <Link to="/login" className="login-btn" onClick={closeMenu}>Login</Link>
                  <Link to="/signup" className="signup-btn" onClick={closeMenu}>Sign Up</Link>
                </div>
              ) : (
                <div className="user-info" ref={dropdownRef}>
                  <div className="user-display" onClick={toggleDropdown}>
                    {user.role === 'Admin' ? <UserGear size={22} /> : <User size={22} />}
                    <span className="user-name">{user.fName} {user.lName}</span>
                  </div>
                  {showDropdown && (
                    <div className="dropdown-menu">
                      <div className="dropdown-item" onClick={handleLogout}>
                        <SignOut size={18} style={{ marginRight: '8px' }} />
                        Logout
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
