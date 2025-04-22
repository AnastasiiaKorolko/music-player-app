import React, { useState, useEffect } from 'react';
import styles from '../components/ScrollButton.module.css'

interface ScrollButtonProps {
  headerRef: React.RefObject<HTMLElement>;
}

const ScrollButton: React.FC<ScrollButtonProps> = ({ headerRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToHeader = () => {
    if (headerRef.current) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      console.log('headerRef is null');
    }
  };

  return (
    <button 
      className={`${styles.buttonStyle} ${!isVisible ? styles.hidden : ''}`} 
      onClick={scrollToHeader}
      aria-label="Прокрутити вгору"
    >
      <span className={styles.arrowStyle}></span>
    </button>

  );
};

export default ScrollButton;