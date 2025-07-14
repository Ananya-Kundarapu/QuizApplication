import { useState, useEffect } from 'react';
import '../styles/Settings.css';

function Settings() {
  const savedImage = localStorage.getItem('profileImage');
  const defaultImage = '/profile.png';
  const [profileImage, setProfileImage] = useState(savedImage || defaultImage);
  const [imageChosen, setImageChosen] = useState(!!savedImage);
  const [soundEffects, setSoundEffects] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    firstName: 'Ananya',
    lastName: 'U',
    phoneNumber: '9878266556',
    country: 'India',
    password: ''
  });

  useEffect(() => {
    if (profileImage && profileImage !== defaultImage) {
      localStorage.setItem('profileImage', profileImage);
    }
  }, [profileImage]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setImageChosen(true);
        localStorage.setItem('profileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordConfirm = () => {
    // In a real app, verify password with backend
    if (currentPassword) {
      setShowPasswordPopup(false);
      setShowAccountPopup(true);
      setCurrentPassword('');
    }
  };

  const handleAccountDetailsChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    setShowAccountPopup(false);
    setShowNotification(true);
  };

  return (
    <div className="settings">
      <h2>Settings</h2>

      {showNotification && (
        <div className="notification" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          zIndex: 1000
        }}>
          Saved Successfully!
        </div>
      )}

      {showPasswordPopup && (
        <div className="popup-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="popup" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            width: '400px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Enter Current Password</h3>
              <button onClick={() => setShowPasswordPopup(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}>×</button>
            </div>
            <p style={{ margin: '10px 0' }}>Enter your password to view/edit account settings</p>
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '10px',
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'left', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="show-password">Show Password</label>
            </div>
            <button onClick={handlePasswordConfirm} style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {showAccountPopup && (
        <div className="popup-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="popup" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            width: '500px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Edit Account Information</h3>
              <button onClick={() => setShowAccountPopup(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}>×</button>
            </div>
            <div style={{ margin: '20px 0' }}>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={accountDetails.firstName}
                onChange={handleAccountDetailsChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={accountDetails.lastName}
                onChange={handleAccountDetailsChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={accountDetails.phoneNumber}
                onChange={handleAccountDetailsChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={accountDetails.country}
                onChange={handleAccountDetailsChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
              <label>New Password (optional)</label>
              <input
                type="password"
                name="password"
                value={accountDetails.password}
                onChange={handleAccountDetailsChange}
                placeholder="Enter new password"
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
            </div>
            <button onClick={handleSaveChanges} style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="setting-section">
        <h3>Account</h3>

        <div className="setting profile-picture-setting">
          <div className="profile-text">
            <label>Profile Picture</label>
            <p>Change your profile photo</p>
          </div>
          <div className="profile-image-container-vertical">
            <img
              src={profileImage}
              alt="Profile"
              className="profile-image-large"
            />
            <label htmlFor="file-upload" className="upload-button-custom">
              {imageChosen ? 'Change' : 'Choose Photo'}
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="upload-button-hidden"
            />
          </div>
        </div>

        <div className="setting">
          <div>
            <label>Account Information</label>
            <p>Edit your personal information</p>
          </div>
          <button onClick={() => setShowPasswordPopup(true)}>Edit</button>
        </div>
      </div>

      <div className="setting-section">
        <h3>Notifications</h3>
        <div className="setting">
          <div>
            <label>Push Notifications</label>
            <p>Receive reminders about quizzes</p>
          </div>
          <div className="toggle">
            <input
              type="checkbox"
              id="push-notifications"
              checked={pushNotifications}
              onChange={() => setPushNotifications(!pushNotifications)}
            />
            <label htmlFor="push-notifications" className="toggle-label" />
          </div>
        </div>
      </div>

      <div className="setting-section">
        <h3>Preferences</h3>

        <div className="setting">
          <div>
            <label>Sound Effects</label>
            <p>Enable/disable quiz sounds</p>
          </div>
          <div className="toggle">
            <input
              type="checkbox"
              id="sound-effects"
              checked={soundEffects}
              onChange={() => setSoundEffects(!soundEffects)}
            />
            <label htmlFor="sound-effects" className="toggle-label" />
          </div>
        </div>
      </div>

      <div className="setting-section">
        <h3>Privacy</h3>
        <div className="setting">
          <div>
            <label>Privacy Policy</label>
            <p>Read our privacy policy</p>
          </div>
          <button>View</button>
        </div>
        <div className="setting">
          <div>
            <label>Terms of Service</label>
            <p>Read our terms of service</p>
          </div>
          <button>View</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;