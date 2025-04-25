import { useState } from 'react';
import './Auth.css';
import { FaGoogle, FaFacebook, FaGithub, FaLinkedin } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const url = "https://localhost:7149";
const Auth = () => {
  const [isActive, setIsActive] = useState(false);
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
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(url + '/api/Account/register', {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      alert(response.data.message);
      setIsActive(false);
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
      console.error(error.response?.data);
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
      alert(error.response?.data?.message || "Login failed");
      console.error(error.response?.data);
    }
  };



  return (
    <div className={`container ${isActive ? 'active' : ''}`} id="container">
      <div className="form-container sign-up">
        <form onSubmit={handleRegister}>
          <h1>Create Account</h1>
          <div className="social-icons">
            <a className="icons" href="https://localhost:7149/api/Account/ExternalLogin?provider=Google">
              <FaGoogle />
            </a>
            <a className="icons" href="https://localhost:7149/api/Account/ExternalLogin?provider=Facebook">
              <FaFacebook />
            </a>
            <a className="icons" href="https://localhost:7149/api/Account/ExternalLogin?provider=GitHub">
              <FaGithub />
            </a>

          </div>
          <span>Register with E-mail</span>
          <input type="text" placeholder="Full Name" name="username" onChange={handleRegisterChange} required />
          <input type="email" placeholder="Enter E-mail" name="email" onChange={handleRegisterChange} required />
          <input type="password" placeholder="Enter Password" name="password" onChange={handleRegisterChange} required />
          <button type="submit">Sign Up</button>
        </form>
      </div>

      <div className="form-container sign-in">
        <form onSubmit={handleLogin}>
          <h1>Sign In</h1>
          <div className="social-icons">
            <a className="icons" href="https://localhost:7149/api/Account/ExternalLogin?provider=Google">
              <FaGoogle />
            </a>
            <a className="icons" href="https://localhost:7149/api/Account/ExternalLogin?provider=Facebook">
              <FaFacebook />
            </a>
            <a className="icons" href="https://localhost:7149/api/Account/ExternalLogin?provider=GitHub">
              <FaGithub />
            </a>

          </div>
          <span>Login With Email & Password</span>
          <input type="text" placeholder="Enter Username" name="username" onChange={handleLoginChange} required />
          <input type="password" placeholder="Enter Password" name="password" onChange={handleLoginChange} required />
          <a href="#">Forget Password?</a>
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
    </div>

  );
};

export default Auth;
