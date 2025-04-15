import DPGallery from "../components/DPGallery";
import Layout from "../components/Layout";
import type { Route } from "./+types/home";
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';

const InViewMotion = ({ children }: { children: React.ReactNode }) => {
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
                DP <br />&ensp;Design Technology
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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DP Design Technology Gallery | Blueprint Gallery" },
    { name: "description", content: "Browse innovative DP design technology projects" },
  ];
}

export default function DPGalleryPage() {
  return (
    <div className="bg-[#bbcdd6]">
      <Layout>
        <Hero/>
        <DPGallery />
      </Layout>
    </div>
  );
} 