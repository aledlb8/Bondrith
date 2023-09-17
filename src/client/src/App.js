import React, { useState } from 'react';
import './main.css';
import './reset.css';

function App() {
  const [id, setId] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleIdInputChange = (event) => {
    const newPassword = event.target.value;
    setId(newPassword);
    setError(newPassword.length === 16 ? '' : 'Invalid ID');
  };

  const login = async () => {
    try {
      const response = await fetch(`http://localhost/api/user/login/${id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        setError('Something went wrong');
        return;
      }

      const responseData = await response.json();

      console.log(responseData)      

      if (!responseData.success) {
        setError(responseData.message);
        return;
      }

      // window.localStorage.setItem('', '');

      // window.location.href = '/dashboard';
    } catch (error) {
      console.error( error);
    }
  };

  return (
    <div className="container">
      <div className="footer">
        <p id="error" className="error">
          {error}
        </p>
      </div>
      <div className="tengah">
        <div className="login">
          <label>
            <div className="fas fa-lock"></div>
            <input
              className="id"
              type={passwordVisible ? 'text' : 'password'}
              autoComplete="off"
              placeholder="ID"
              value={id}
              onChange={handleIdInputChange}
            />
            <button className="id-button" onClick={togglePasswordVisibility}>
              {passwordVisible ? 'Hide' : 'Show'}
            </button>
          </label>

          <button className="login-button" onClick={login} disabled={id.length !== 16}>
            Sign In
          </button>
        </div>
      </div>
      <div className="footer">
        <p>
          Don't have an account yet? <a className="footer-a" href="<%= purchase %>">Purchase</a>
        </p>
      </div>
    </div>
  );
}

export default App;