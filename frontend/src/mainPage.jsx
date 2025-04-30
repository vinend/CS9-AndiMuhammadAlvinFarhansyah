import React, { useEffect, useRef, useState } from 'react';
import LogoNetlabPlain from './assets/Logo Netlab Plain.svg';
import LogoOS from './assets/OSLogo.svg';
import LogoData from './assets/SBDLogo.svg';
import LogoDMJ from './assets/DMJLogo.svg';
import Taskbar from './taskbar';
import Footer from './footer';

const MainPage = () => {
  const osCardRef = useRef(null);
  const sbdCardRef = useRef(null);
  const dmjCardRef = useRef(null);
  
  // Refs for logo containers
  const osLogoRef = useRef(null);
  const sbdLogoRef = useRef(null);
  const dmjLogoRef = useRef(null);

  const [showOSCard, setShowOSCard] = useState(false);
  const [showSBDCard, setShowSBDCard] = useState(false);
  const [showDMJCard, setShowDMJCard] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setShowOSCard(entry.isIntersecting);
    }, { threshold: 0.1 });
    if (osCardRef.current) observer.observe(osCardRef.current);
    return () => {
      if (osCardRef.current) observer.unobserve(osCardRef.current);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setShowSBDCard(entry.isIntersecting);
    }, { threshold: 0.1 });
    if (sbdCardRef.current) observer.observe(sbdCardRef.current);
    return () => {
      if (sbdCardRef.current) observer.unobserve(sbdCardRef.current);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setShowDMJCard(entry.isIntersecting);
    }, { threshold: 0.1 });
    if (dmjCardRef.current) observer.observe(dmjCardRef.current);
    return () => {
      if (dmjCardRef.current) observer.unobserve(dmjCardRef.current);
    };
  }, []);

  // Common text for OS (line length optimized for symmetry)
  const osText = "Praktikum Operating System (OS) merupakan kegiatan pembelajaran berbasis eksperimental yang mempelajari prinsip-prinsip dasar sistem operasi modern. Dalam praktikum ini, mahasiswa akan memperoleh pemahaman mendalam mengenai manajemen proses, konkurensi, penjadwalan CPU, manajemen memori, sistem berkas, dan aspek keamanan OS.";
  
  // Common text for SBD (line length optimized for symmetry)
  const sbdText = "Praktikum Sistem Basis Data (SBD) adalah program pembelajaran komprehensif yang mempelajari pengelolaan, perancangan, dan pengembangan basis data modern. Fokus utama praktikum ini meliputi implementasi SQL untuk manipulasi dan query data, pengembangan API backend dengan prinsip RESTful, serta integrasi dengan aplikasi frontend.";
  
  // Common text for DMJ (line length optimized for symmetry)
  const dmjText = "Praktikum Desain dan Manajerial Jaringan (DMJ) merupakan kegiatan pembelajaran intensif yang menekankan pada perancangan, implementasi, dan pengelolaan jaringan komputer modern. Mahasiswa akan mempelajari aspek-aspek krusial meliputi topologi jaringan, protokol routing, virtualisasi jaringan, serta teknologi cloud.";

  return (
    <div className="fade-in flex flex-col min-h-screen bg-[#1E1E1E] text-white scroll-smooth text-justify">
      <Taskbar />

      {/* Main Section - Optimized for mobile */}
      <div id="home" className="scroll-mt-20 flex flex-col md:flex-row items-center justify-center flex-grow px-4 md:px-16 gap-6 md:gap-12 pt-24 md:pt-36 pb-6 md:pb-10">
        <div className="flex-shrink-0">
          <img src={LogoNetlabPlain} alt="Netlab Logo" className="w-full max-w-[250px] md:w-[30rem] md:max-w-full" />
        </div>
        <div className="text-white max-w-sm text-center md:text-left mt-4 md:mt-0">
          <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 font-mono">Netlab FTUI</h1>
          <p className="text-xs md:text-sm leading-relaxed text-gray-300 text-justify">
            Netlab DTE FTUI adalah laboratorium pembelajaran dan riset yang berfokus pada jaringan komputer, sistem terdistribusi, dan teknologi digital. Di sini, mahasiswa mengasah keterampilan praktis, mengeksplorasi teknologi mutakhir, dan membangun fondasi untuk karier di dunia IT dan jaringan.
          </p>
        </div>
      </div>

      {/* OS Practicum - Mobile optimized */}
      <div
        ref={osCardRef}
        id="os"
        className="scroll-mt-20 flex flex-col items-center justify-center px-4 md:px-16 gap-4 md:gap-0 py-10 md:py-20 relative"
      >
        {/* Mobile view - modified for scale effect on hover */}
        <div className="md:hidden w-full">
          <div className={`bg-[#262626] rounded-2xl p-4 w-full transition-all duration-700 ease-in-out ${showOSCard ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex flex-row items-center">
              <div className="flex-shrink-0 flex justify-center items-center mr-4">
                <img 
                  src={LogoOS} 
                  alt="Netlab OS Logo" 
                  className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-200 ease-out" 
                />
              </div>
              <div className="text-white text-xs leading-relaxed text-gray-300 text-left">
                <p className='text-justify'>{osText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:flex md:flex-row items-center justify-center gap-0">
          <div 
            className={`bg-[#262626] rounded-[4rem] p-8 flex justify-center items-center w-[30rem] h-[22rem] relative z-10 -mr-10 transition-transform duration-700 ease-in-out ${showOSCard ? 'translate-x-0 opacity-100' : '-translate-x-[150%] opacity-0'}`}
          >
            <img 
              src={LogoOS} 
              alt="Netlab OS Logo" 
              className="w-60 h-60 object-contain hover:scale-110 transition-transform duration-200 ease-out" 
            />
          </div>
          <div className={`bg-[#262626] rounded-[12rem] p-10 max-w-4xl w-full relative z-0 transition-transform duration-700 ease-in-out delay-200 ${showOSCard ? 'translate-x-0 opacity-100' : '-translate-x-[150%] opacity-0'}`}>
            <div className="text-white text-sm leading-relaxed text-gray-300 text-left px-6 md:px-12">
              <p className='text-justify'>{osText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SBD Practicum - Mobile optimized */}
      <div
        ref={sbdCardRef}
        id="sbd"
        className="scroll-mt-20 flex flex-col items-center justify-center px-4 md:px-16 gap-4 md:gap-0 py-10 md:py-20 relative"
      >
        {/* Mobile view - modified for scale effect on hover */}
        <div className="md:hidden w-full">
          <div className={`bg-[#262626] rounded-2xl p-4 w-full transition-all duration-700 ease-in-out ${showSBDCard ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex flex-row items-center">
              <div className="flex-shrink-0 flex justify-center items-center mr-4">
                <img 
                  src={LogoData} 
                  alt="Netlab DB Logo" 
                  className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-200 ease-out" 
                />
              </div>
              <div className="text-white text-xs leading-relaxed text-gray-300 text-left">
                <p className='text-justify'>{sbdText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:flex md:flex-row-reverse items-center justify-center gap-0">
          <div 
            className={`bg-[#262626] rounded-[4rem] p-8 flex justify-center items-center w-[30rem] h-[22rem] relative z-10 -ml-10 transition-transform duration-700 ease-in-out ${showSBDCard ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}
          >
            <img 
              src={LogoData} 
              alt="Netlab DB Logo" 
              className="w-60 h-60 object-contain hover:scale-110 transition-transform duration-200 ease-out" 
            />
          </div>
          <div className={`bg-[#262626] rounded-[12rem] p-10 max-w-4xl w-full relative z-0 transition-transform duration-700 ease-in-out delay-200 ${showSBDCard ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}>
            <div className="text-white text-sm leading-relaxed text-gray-300 text-left px-6 md:px-12">
              <p className='text-justify'>{sbdText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DMJ Practicum - Mobile optimized */}
      <div
        ref={dmjCardRef}
        id="dmj"
        className="scroll-mt-20 flex flex-col items-center justify-center px-4 md:px-16 gap-4 md:gap-0 py-10 md:py-20 relative"
      >
        {/* Mobile view - modified for scale effect on hover */}
        <div className="md:hidden w-full">
          <div className={`bg-[#262626] rounded-2xl p-4 w-full transition-all duration-700 ease-in-out ${showDMJCard ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex flex-row items-center">
              <div className="flex-shrink-0 flex justify-center items-center mr-4">
                <img 
                  src={LogoDMJ} 
                  alt="Netlab DMJ Logo" 
                  className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-200 ease-out" 
                />
              </div>
              <div className="text-white text-xs leading-relaxed text-gray-300 text-left">
                <p className='text-justify'>{dmjText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop view - consistent sizing with others */}
        <div className="hidden md:flex md:flex-row items-center justify-center gap-0">
          <div 
            className={`bg-[#262626] rounded-[4rem] p-8 flex justify-center items-center w-[30rem] h-[22rem] relative z-10 -mr-10 transition-transform duration-700 ease-in-out ${showDMJCard ? 'translate-x-0 opacity-100' : '-translate-x-[150%] opacity-0'}`}
          >
            <img 
              src={LogoDMJ} 
              alt="Netlab DMJ Logo" 
              className="w-60 h-60 object-contain hover:scale-110 transition-transform duration-200 ease-out" 
            />
          </div>
          <div className={`bg-[#262626] rounded-[12rem] p-10 max-w-4xl w-full relative z-0 transition-transform duration-700 ease-in-out delay-200 ${showDMJCard ? 'translate-x-0 opacity-100' : '-translate-x-[150%] opacity-0'}`}>
            <div className="text-white text-sm leading-relaxed text-gray-300 text-left px-6 md:px-12">
              <p className='text-justify'>{dmjText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reduced spacer height */}
      <div className="flex-grow min-h-[150px] md:min-h-[200px]"></div>

      {/* Contact section at the very bottom */}
      <div id="contact" className="w-full pb-[100px]">
        <Footer />
      </div>
    </div>
  );
};

export default MainPage;