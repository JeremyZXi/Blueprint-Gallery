import React from 'react';

interface HeroProps {
  title: string;
  backgroundImage: string;
}

const Hero: React.FC<HeroProps> = ({ title, backgroundImage }) => {
  return (
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/0" />
      <div className="relative h-full flex items-start justify-center pt-32">
        <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-white">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default Hero;
