import React from "react";
import rules from "/public/rules.png";
import '../HousePage/House.css';


const Instructions = () => {
    return (
      <div>
          <p className='footerLine1 text-gray-300'>__________________________________________________________________________________________________________</p>
  
          <p className='footer-things font-bold text-2xl uppercase'>Things To Know, </p>
  
          <div className='footer-hold'>
              <img src={rules} className="footer-pic" />
          </div>
      </div>
    )
  }
  
  export default Instructions