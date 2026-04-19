import React from 'react';
import backgroundImage from '../background2.jpg';

function Background() {
  const backgroundStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0.5,
    zIndex: -1,
    pointerEvents: 'none',
  };

  return (
    <div style={backgroundStyle}></div>
  );
}

export default Background; 