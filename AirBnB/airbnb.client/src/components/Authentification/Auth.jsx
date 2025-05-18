import { useState, useEffect } from 'react';
import './Auth.css';
import { FaGoogle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const url = "https://localhost:7149";

const Auth = () => {
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [resetCode, setResetCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    rememberMe: true
  });

  const toggleActive = () => setIsActive(!isActive);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });

    if (name === 'password') {
      const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/.test(value);
      setPasswordError(valid ? '' : 'Password must contain uppercase, lowercase, and special character.');
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(url + '/api/Account/verify-code', {
        email: userEmail,
        code: verificationCode
      });

      setIsActive(false);
    } catch (error) {
      setVerificationError(error.response?.data?.message || "Verification failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (passwordError) return;

    try {
      const response = await axios.post(url + '/api/Account/register', {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      }, { headers: { "Content-Type": "application/json" }, withCredentials: true });

      setUserEmail(response.data.email);
      setStep(2);
    } catch (error) {
      setRegisterError(error.response?.data?.message || "Registration failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(url + '/api/Account/login', {
        username: loginData.username,
        password: loginData.password,
        rememberMe: loginData.rememberMe
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      const profileResponse = await axios.get(url + '/api/Account/profile', {
        withCredentials: true
      });

      if (profileResponse.data) {
        localStorage.setItem('user', JSON.stringify(profileResponse.data));
        localStorage.setItem('userId', profileResponse.data.id);
        localStorage.setItem('username', profileResponse.data.username);
      }

      navigate('/');
    } catch (error) {
      setLoginError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className={`container ${isActive ? 'active' : ''}`} id="container">
      <div className="form-container sign-up">
        <form onSubmit={step === 1 ? handleRegister : handleVerifyCode}>
          {step === 1 ? (
            <>
              <h1>Create Account</h1>
              <input type="text" placeholder="Full Name" name="username" onChange={handleRegisterChange} required />
              <input type="email" placeholder="Enter E-mail" name="email" onChange={handleRegisterChange} required />
              <input type="password" placeholder="Enter Password" name="password" onChange={handleRegisterChange} required />
              {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
              {registerError && <p style={{ color: 'red' }}>{registerError}</p>}
            </>
          ) : (
            <>
              <h2>We have sent you a verification code via email</h2>
              <label htmlFor="code">Enter Secure Code:</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              {verificationError && <p style={{ color: 'red' }}>{verificationError}</p>}
            </>
          )}
          <button type="submit">{step === 1 ? "Sign Up" : "Verify"}</button>
        </form>
      </div>

      <div className="form-container sign-in">
        <form onSubmit={handleLogin}>
          <h1>Sign In</h1>
          <span>Login With Email & Password</span>
          <input type="text" placeholder="Enter Username" name="username" onChange={handleLoginChange} required />
          <input type="password" placeholder="Enter Password" name="password" onChange={handleLoginChange} required />
          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
          <a href="#" onClick={(e) => {
            e.preventDefault();
            setShowForgotPasswordModal(true);
          }}>Forget Password?</a>
          <button type="submit">Sign In</button>
        </form>
      </div>

      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome To <br />AirBnB</h1>
            <p>Do You Have Account?</p>
            <button className="hidden" id="login" onClick={toggleActive}>Sign In</button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Hi Dear</h1>
            <h1>Customer</h1>
            <p>If You Don't Have Account</p>
            <button className="hidden" id="register" onClick={toggleActive}>Sign Up</button>
          </div>
        </div>
      </div>

      {showForgotPasswordModal && (
        <div className="forgot_modal">
          <div className="forgot-modal-content">
            <span className="forgot-close" onClick={() => {
              setShowForgotPasswordModal(false);
              setResetStep(1);
              setForgotEmail('');
              setResetCode('');
              setNewResetPassword('');
              setResetMessage('');
            }}>X</span>

            {resetStep === 1 && (
              <>
                <h2>Forgot Password</h2>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <button onClick={async () => {
                  try {
                    const response = await axios.post(`${url}/api/Account/forgot-password`, { email: forgotEmail },{withCredentials:true});
                    setResetMessage(response.data.message);
                    setResetStep(2);
                  } catch (error) {
                    setResetMessage(error.response?.data?.message || "Failed to send reset code.");
                  }
                }}>Send Code</button>
              </>
            )}

            {resetStep === 2 && (
              <>
                <h2>Reset Password</h2>
                <input
                  type="text"
                  placeholder="Enter code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                />

                <div style={{ fontSize: '13px', marginBottom: '10px' }}>
                  <p style={{ color: newResetPassword.length >= 6 ? 'green' : 'red' }}>
                    • At least 6 characters
                  </p>
                  <p style={{ color: /\d/.test(newResetPassword) ? 'green' : 'red' }}>
                    • At least one number
                  </p>
                  <p style={{ color: /[a-z]/.test(newResetPassword) ? 'green' : 'red' }}>
                    • At least one lowercase letter
                  </p>
                  <p style={{ color: /[A-Z]/.test(newResetPassword) ? 'green' : 'red' }}>
                    • At least one uppercase letter
                  </p>
                  <p style={{ color: /[!@#$%^&*(),.?"_:{}|<>]/.test(newResetPassword) ? 'green' : 'red' }}>
                    • At least one special character
                  </p>
                </div>

                <button
                  disabled={
                    newResetPassword.length < 6 ||
                    !/\d/.test(newResetPassword) ||
                    !/[a-z]/.test(newResetPassword) ||
                    !/[A-Z]/.test(newResetPassword) ||
                    !/[!@#$%_^&*(),.?":{}|<>]/.test(newResetPassword)
                  }
                  onClick={async () => {
                    try {
                      const response = await axios.post(`${url}/api/Account/reset-password`, {
                        email: forgotEmail,
                        code: resetCode,
                        newPassword: newResetPassword,
                      },{withCredentials:true});
                      setResetMessage('Password successfully changed!');
                      setResetStep(3);
                    } catch (error) {
                      setResetMessage(error.response?.data?.message || "Failed to reset password.");
                    }
                  }}
                >
                  Reset Password
                </button>

              </>
            )}

            {resetStep === 3 && (
              <>
                <h3>Password successfully changed!</h3>
                <button onClick={() => setShowForgotPasswordModal(false)}>Back to Login</button>
              </>
            )}

            {resetMessage && <p>{resetMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
