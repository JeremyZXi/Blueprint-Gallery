import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, X } from 'lucide-react';
import { fetchApprovedSubmissions } from '../utils/fetchSupabase';
import type { IASubmission } from '../utils/supabaseSubmission';

// Maximum number of projects to display in spotlight
const MAX_SPOTLIGHT_PROJECTS = 3;
// Time interval for rotation in milliseconds
const ROTATION_INTERVAL = 5000;

const Spotlight = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    const [allProjects, setAllProjects] = useState<IASubmission[]>([]);
    const [spotlightProjects, setSpotlightProjects] = useState<IASubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const loadSpotlightProjects = async () => {
            try {
                setLoading(true);
                const approvedSubmissions = await fetchApprovedSubmissions();
                // Shuffle the submissions
                const shuffledSubmissions = approvedSubmissions.sort(() => Math.random() - 0.5);
                setAllProjects(shuffledSubmissions);
                // Set initial spotlight projects
                setSpotlightProjects(shuffledSubmissions.slice(0, MAX_SPOTLIGHT_PROJECTS));
                setLoading(false);
            } catch (err) {
                console.error('Error fetching spotlight projects:', err);
                setError('Failed to load featured projects');
                setLoading(false);
            }
        };

        loadSpotlightProjects();
    }, []);

    // Auto-rotation effect
    useEffect(() => {
        if (allProjects.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const newIndex = (prevIndex + MAX_SPOTLIGHT_PROJECTS) % allProjects.length;
                setSpotlightProjects(allProjects.slice(newIndex, newIndex + MAX_SPOTLIGHT_PROJECTS));
                return newIndex;
            });
        }, ROTATION_INTERVAL);

        return () => clearInterval(interval);
    }, [allProjects]);

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

    // Loading skeleton animation variants
    const shimmerVariants: Variants = {
        initial: { 
            backgroundPosition: "-500px 0" 
        },
        animate: { 
            backgroundPosition: "500px 0",
            transition: { 
                repeat: Infinity, 
                repeatType: "mirror", 
                duration: 1.5,
                ease: "linear"
            }
        }
    };

    // 控制项目详情的展开状态
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return (
            <section className="bg-[#bbcdd6] py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-body text-[#141c27] mb-16 px-4">
                        Student Spotlight
                    </h2>
                    <p>Loading featured projects...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-[#bbcdd6] py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-body text-[#141c27] mb-16 px-4">
                        Student Spotlight
                    </h2>
                    <p>{error}</p>
                </div>
            </section>
        );
    }

    if (spotlightProjects.length === 0) {
        return (
            <section className="bg-[#bbcdd6] py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-body text-[#141c27] mb-16 px-4">
                        Student Spotlight
                    </h2>
                    <p>No projects available for spotlight at this time.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-[#bbcdd6] py-16">
            <motion.div
                ref={ref}
                className="container mx-auto px-4"
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
            >
                <motion.h2
                    variants={childVariants}
                    className="text-4xl font-body text-[#141c27] mb-16 px-4"
                >
                    Student Spotlight
                </motion.h2>

                <div className="space-y-20">
                    {spotlightProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            variants={childVariants}
                            className="relative"
                        >
                            {/* 常规显示 */}
                            <div className="flex items-center">
                                {index % 2 === 0 ? (
                                    <>
                                        {/* 左侧圆形学生照片 */}
                                        <div className="w-36 h-36 rounded-full overflow-hidden z-10 flex-shrink-0 border-4 border-white shadow-lg">
                                            <img 
                                                src={project.imageUrls?.[0] || "https://placehold.co/150x150/7a9eb3/ffffff?text=Student"} 
                                                alt={`${project.firstName} ${project.lastName}`} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>

                                        {/* 平行四边形内容区 */}
                                        <div className="flex-1 h-32 ml-[-18px] relative">
                                            <div className="absolute inset-0 bg-[#e5f3f4] skew-x-[-10deg] origin-top-left ml-5 shadow-md">
                                                <div className="transform skew-x-[10deg] origin-top-left h-full flex flex-col justify-center px-12">
                                                    <h3 className="text-xl font-medium text-[#141c27]">{project.title}</h3>
                                                    <p className="text-sm text-[#475569] mt-1 line-clamp-2">
                                                        By {project.firstName} {project.lastName}, Grade {project.gradeLevel}
                                                    </p>
                                                    <a
                                                        href="#"
                                                        className="text-sm text-[#141c27] font-medium mt-2 flex items-center hover:text-blue-600 transition-colors cursor-pointer"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleExpand(project.id || '');
                                                        }}
                                                    >
                                                        {expandedId === project.id ? "fold" : "Read more"}
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* 平行四边形内容区 */}
                                        <div className="flex-1 h-32 mr-[-18px] relative">
                                            <div className="absolute inset-0 bg-[#e5f3f4] skew-x-[10deg] origin-top-right mr-5 shadow-md">
                                                <div className="transform skew-x-[-10deg] origin-top-right h-full flex flex-col justify-center px-12 items-end">
                                                    <h3 className="text-xl font-medium text-[#141c27]">{project.title}</h3>
                                                    <p className="text-sm text-[#475569] mt-1 text-right line-clamp-2">
                                                        By {project.firstName} {project.lastName}, Grade {project.gradeLevel}
                                                    </p>
                                                    <a
                                                        href="#"
                                                        className="text-sm text-[#141c27] font-medium mt-2 flex items-center hover:text-blue-600 transition-colors cursor-pointer"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleExpand(project.id || '');
                                                        }}
                                                    >
                                                        {expandedId === project.id ? "fold" : "Read more"}
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 右侧圆形学生照片 */}
                                        <div className="w-36 h-36 rounded-full overflow-hidden z-10 flex-shrink-0 border-4 border-white shadow-lg">
                                            <img 
                                                src={project.imageUrls?.[0] || "https://placehold.co/150x150/7a9eb3/ffffff?text=Student"} 
                                                alt={`${project.firstName} ${project.lastName}`} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* 展开的项目详情 */}
                            {expandedId === project.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-6 bg-[#e5f3f4] rounded-lg shadow-md overflow-hidden mx-10"
                                >
                                    <div className="md:flex">
                                        <div className="md:w-1/2">
                                            <img 
                                                src={project.imageUrls?.[0] || "https://placehold.co/600x400/7a9eb3/ffffff?text=Project"} 
                                                alt={project.title} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div className="p-6 md:w-1/2">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-medium text-[#141c27]">{project.title}</h3>
                                                    <p className="text-sm text-[#475569]">{project.firstName} {project.lastName} | Grade {project.gradeLevel}</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleExpand('')}
                                                    className="text-[#141c27] hover:text-blue-600"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <p className="text-[#475569] mb-4">
                                                This project uses {project.material?.join(', ')} with {project.color?.join(', ')} colors.
                                                It serves functions related to {project.function?.join(', ')}.
                                            </p>
                                            <a
                                                href={project.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-[#141c27] text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center inline-flex"
                                            >
                                                View PDF
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default Spotlight;
