import React, { useEffect } from 'react';
import LogoNetlabPlain from './assets/Logo Netlab Plain.svg';
import ButtonSvg from './assets/Button.svg';

const LandingPage = ({ onDiveIn }) => {
  // Apply overflow-hidden to the body when component mounts
  // and remove it when component unmounts
  useEffect(() => {
    // Save the original overflow value
    const originalOverflow = document.body.style.overflow;
    
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    
    // Restore original overflow on cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      className="flex flex-col justify-center items-center w-screen h-screen bg-[#1E1E1E] text-white overflow-hidden"
    >
      <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto gap-10 md:gap-20 px-4">
        <img
          src={LogoNetlabPlain}
          alt="Netlab Logo"
          className="w-64 h-64 md:w-96 md:h-96 object-contain"
        />

        <button
          className="bg-transparent cursor-pointer focus:outline-none hover:outline-none"
          style={{ lineHeight: 0 }}
          onClick={onDiveIn}
        >
          <img
            src={ButtonSvg}
            alt="Dive In Button"
            className="w-32 h-auto md:w-48 object-contain hover:filter hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300 animate-bounce"
          />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;