import React, { useState, useEffect } from 'react';
import {
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
} from 'react-icons/fa';
import FooterLogo from './assets/Logo Netlab Plain.svg';

const Footer = () => {
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    // Function to handle scroll event
    const handleScroll = () => {
      // Get total height of page and window
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // Show footer ONLY when user is near bottom of page (within 300px)
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        setShowFooter(true);
      } else {
        // Hide footer if not at bottom, even if hash is #contact
        setShowFooter(false);
      }
    };

    // Initially hide footer regardless of hash
    setShowFooter(false);

    window.addEventListener('scroll', handleScroll);
    
    // Remove hashchange listener since we want to enforce scrolling
    
    // Initialize scroll check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <footer className={`bg-[#262626] text-white px-4 md:px-16 py-4 md:py-6 w-screen fixed bottom-0 left-0 right-0 z-50 border-t-2 border-gray-700 transition-all duration-500 ease-in-out ${showFooter ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-4 md:gap-6 max-w-screen-2xl mx-auto">

        {/* Kiri: Logo + Hak Cipta */}
        <div className="flex flex-col items-center md:items-start">
          <img
            src={FooterLogo}
            alt="Netlab Logo"
            className="h-8 md:h-10 mb-2"
          />
          <p className="text-xs md:text-sm text-gray-300 font-semibold text-center md:text-left">
            © 2025 Netlab DTE FTUI. All Rights Reserved
          </p>
        </div>

        {/* Kanan: Alamat + Sosial Media */}
        <div className="flex flex-col items-center md:items-end text-xs md:text-sm text-gray-300 space-y-2 md:space-y-3">
          <div className="flex items-center md:items-start gap-2">
            <p className="max-w-xs text-center md:text-right">
              Fakultas Teknik, MRPQ Lt. 3, Jl. Prof. DR. Ir Somantri Brodjonegoro, Kukusan, Kecamatan Beji, Kota Depok
            </p>
          </div>
          <div className="flex space-x-4 text-lg md:text-xl mt-1 md:mt-2">
            <a href="https://www.instagram.com/netlab.dteftui/" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="hover:text-pink-500 transition-colors" />
            </a>
            <a href="https://www.linkedin.com/in/netlab-dte-ftui-849307199?originalSubdomain=id" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="hover:text-blue-500 transition-colors" />
            </a>
            <a href="https://www.youtube.com/watch?v=HKMQ2kBC64w&ab_channel=drainphoenix" target="_blank" rel="noopener noreferrer">
              <FaYoutube className="hover:text-red-500 transition-colors" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="hover:text-blue-600 transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;