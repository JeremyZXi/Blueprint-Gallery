import type { Route } from "./+types/home";
import Layout from "../components/Layout";
import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Spotlight from "../components/Spotlight.tsx";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Blueprint Gallery" },
    { name: "description", content: "A gallery of IB Design Technology IA projects" },
  ];
}


const Home = () => {
  const navigate = useNavigate();

  return (
      <div className="bg-[#bbcdd6]">
        <Layout>
        <Hero />
        <section className="text-[#141c27] body-font">
          <div className="container py-12 mx-auto">
            <div className="lg:w-2/3 sm:flex-row sm:items-center items-start mx-auto">
              <InViewMotion>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-grow sm:pr-16 text-4xl font-body title-font text-[#141c27]"
                >
                  About Blueprint Gallery
                </motion.h1>
              </InViewMotion>
            </div>
            <div className="lg:w-2/3 sm:flex-row sm:items-center items-start mx-auto">
              <InViewMotion>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-grow sm:pr-16 text-2xl font-body title-font text-[#141c27] mt-4"
                >
                  Blueprint Gallery is a platform dedicated to curating and showcasing exceptional design works from Keystone Academy students across the MYP, DP and DP Internal Assessment.
                  Our mission is to celebrate creativity, inspire future designers, and provide a valuable resource for students and teachers to explore high-quality design projects.
                </motion.p>
              </InViewMotion>
            </div>
          </div>
        </section>
        <Works />
        <Spotlight/>
        <section className="bg-[#44505d] text-white body-font py-20">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center">
              <InViewMotion>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-left text-2xl font-body max-w-2xl mx-auto mb-12"
                >
                  The gallery visually documents and presents a variety of design works from secondary-school students across different grade levels.<br/>
                  By a simple click, a range of unique product designs categorized by Material, Colors, and Functions will come into your view.
                </motion.p>
              </InViewMotion>
              
              <InViewMotion>
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onClick={() => navigate('/gallery')}
                    className="relative bg-[#bbcdd6] text-[#44505d] font-bold py-4 px-10 rounded-full text-xl overflow-hidden z-10"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                      transition: { duration: 0.15 } 
                    }}
                    whileTap={{ scale: 0.97 }}
                >
                  <motion.span
                    className="relative z-10"
                  >
                    EXPLORE THE GALLERY
                  </motion.span>
                  <motion.div 
                    className="absolute inset-0 bg-[#b2c0ca] rounded-full z-0" 
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%", transition: { duration: 0.15 } }}
                  />
                </motion.button>
              </InViewMotion>
            </div>
          </div>
        </section>
        <section className="bg-[#bbcdd6] text-[#44505d] body-font py-20">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center">
              <InViewMotion>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-left text-2xl font-body max-w-2xl mx-auto mb-12"
                >
                  Want to showcase your design work?<br/>
                  Whether it's an MYP project, DP portfolio, or Internal Assessment, we'd love to feature it!
                  Stop letting your fabulous design ideas get dusty inside your laptop folders. Click below to submit it and make them work for what they're worth.<br/>
                  Every creative piece deserves to be seen and celebrated.

                </motion.p>
              </InViewMotion>
              
              <InViewMotion>
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onClick={() => navigate('/submit')}
                    className="relative bg-[#44505d] text-white font-bold py-4 px-10 rounded-full text-xl overflow-hidden z-10"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                      transition: { duration: 0.15 } 
                    }}
                    whileTap={{ scale: 0.97 }}
                >
                  <motion.span
                    className="relative z-10"
                  >
                    SUBMIT YOUR OWN DESIGN
                  </motion.span>
                  <motion.div 
                    className="absolute inset-0 bg-[#374049] rounded-full z-0" 
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%", transition: { duration: 0.15 } }}
                  />
                </motion.button>
              </InViewMotion>
            </div>
          </div>
        </section>
        </Layout>
      </div>
  );
};
// InView 动画包装组件
const InViewMotion = ({ children }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
      <div ref={ref}>
        <AnimatePresence>
          {inView && children}
        </AnimatePresence>
      </div>
  );
};

// Hero 组件
const Hero = () => {
  const navigate = useNavigate();

  return (
      <div className="bg-[#bbcdd6] min-h-screen">
        <div className="bg-[url(/assets/hero1.png)] bg-no-repeat bg-cover bg-center min-h-screen">
          <div className="min-h-screen flex items-center justify-left">
            <div className="text-left px-14 w-full">
              <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6 py-7"
              >
                Blueprint <br />Gallery
              </motion.h1>
              <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-right text-5xl md:text-3xl text-white mt-4 pr-20 py-7"
              >
                DESIGNING THE FUTURE<br />
                ONE BLUEPRINT AT A TIME
              </motion.p>
            </div>
          </div>
          <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
          >
            <svg
                className="w-8 h-8 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </motion.div>
        </div>
      </div>
  );
};

// Works 组件
// Works 组件
// Works 组件
const Works = () => {
  const navigate = useNavigate();
  const [hoveredTab, setHoveredTab] = useState(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1, staggerChildren: 0.2 }
    }
  };

  const childVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  // 添加路由路径到卡片数据中
  const cards = [
    {
      title: 'MYP Work',
      color: '#475569',
      path: '/',
      description: 'Coming soon...'
    },
    {
      title: 'DP Work',
      color: '#475569',
      path: '/',
      description: 'Coming soon...'
    },
    {
      title: 'Internal\nAssessment',
      color: '#475569',
      path: '/gallery',
      description: 'Browse a collection of Internal Assessment projects'
    }
  ];

  // 处理卡片点击
  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
      <motion.div
          ref={ref}
          className="w-full p-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
      >
        <motion.div
            className="container mx-auto flex flex-wrap justify-center gap-6"
            variants={childVariants}
        >
          {cards.map((card, index) => (
              <motion.div
                  key={index}
                  className="w-full md:w-[300px] aspect-square rounded-lg overflow-hidden cursor-pointer relative"
                  style={{ backgroundColor: card.color }}
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => setHoveredTab(index)}
                  onMouseLeave={() => setHoveredTab(null)}
                  onClick={() => handleCardClick(card.path)}
                  variants={childVariants}
              >
                {/* 卡片内容 */}
                <div className="p-6 w-full h-full flex flex-col items-center justify-center text-white">
                  <div className="w-16 h-1 bg-white mb-4"></div>
                  <h2 className="text-3xl font-serif text-center">{card.title}</h2>
                  <div className="w-16 h-1 bg-white mt-4"></div>
                </div>

                {/* 描述覆盖层 - hover时显示，但保持卡片原始颜色 */}
                <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                    style={{ backgroundColor: card.color }} // 使用与卡片相同的背景颜色
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredTab === index ? 0.95 : 0 }} // 稍微透明以创造过渡效果
                    transition={{ duration: 0.3 }}
                >
                  <p className="text-white font-subheading text-center text-lg mb-4">
                    {card.description}
                  </p>

                  {/* 将箭头颜色改为白色，与文字颜色一致 */}
                  <motion.svg
                      className="w-6 h-6 mt-2 text-white" // 添加text-white类使其与文字颜色一致
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor" // 这里的currentColor会使用父元素的文本颜色，即白色
                      initial={{ opacity: 1 }}
                  >
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </motion.svg>
                </motion.div>
              </motion.div>
          ))}
        </motion.div>
      </motion.div>
  );
};




export default Home;
