import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

const Hero: React.FC<HeroProps> = ({ 
  title, 
  subtitle, 
  backgroundImage = '/assets/hero1.png'
}) => {
  // Split title into lines if it contains \n
  const titleLines = title.split('\n');
  
  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {titleLines.map((line, index) => (
          <motion.h1 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="text-white text-7xl font-serif tracking-wider mt-4"
          >
            {line}
          </motion.h1>
        ))}
        
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: titleLines.length * 0.2 }}
            className="text-white text-2xl mt-6"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Hero;
