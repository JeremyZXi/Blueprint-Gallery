import Gallery from "../components/Gallery";
import Layout from "../components/Layout";
import type { Route } from "./+types/home";
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
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
        <div className="bg-[url(/assets/hero2.png)] bg-no-repeat bg-cover bg-center min-h-screen">
          <div className="min-h-screen flex items-center justify-left">
            <div className="text-left px-36 w-full">
              <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6 py-7"
              >
                Internal <br />&ensp;Assessment
              </motion.h1>
            
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
const Works = () => {
  const navigate = useNavigate(); // 添加 useNavigate hook
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
      path: '/myp-work'
    },
    {
      title: 'DP Work',
      color: '#475569',
      path: '/dp-work'
    },
    {
      title: 'Internal\nAssessment',
      color: '#475569',
      path: '/internal-assessment'
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
                  className="w-full md:w-[300px] aspect-square rounded-lg overflow-hidden cursor-pointer"
                  style={{ backgroundColor: card.color }}
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => setHoveredTab(index)}
                  onMouseLeave={() => setHoveredTab(null)}
                  onClick={() => handleCardClick(card.path)} // 添加点击处理
                  variants={childVariants}
              >
                <div className="p-6 w-full h-full flex flex-col items-center justify-center text-white">
                  <div className="w-16 h-1 bg-white mb-4"></div>
                  <h2 className="text-3xl font-serif text-center">{card.title}</h2>
                  <div className="w-16 h-1 bg-white mt-4"></div>
                  {/* 可选：添加一个提示用户可点击的图标 */}
                  <motion.svg
                      className="w-6 h-6 mt-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredTab === index ? 1 : 0 }}
                  >
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </motion.svg>
                </div>
              </motion.div>
          ))}
        </motion.div>
      </motion.div>
  );
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IA Gallery | Blueprint Gallery" },
    { name: "description", content: "Browse innovative IA design projects" },
  ];
}

export default function GalleryPage() {
  return (
    <div className="bg-[#bbcdd6]">
      <Layout>
        <Hero/>
        <Gallery />
      </Layout>
    </div>
  );
} 