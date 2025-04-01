import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

const Footer = () => {

    const quickLinks = [
        { name: 'Admin', url: '/admin' },
    ];
    const contactInfo = [
        {
            icon: faEnvelope,
            text: 'Tina Qiu',
            info: 'tian.qiu@student.keystoneacademy.cn',
            link: 'mailto:tian.qiu@student.keystoneacademy.cn'
        },
        {
            icon: faEnvelope,
            text: 'Yvonne Li',
            info: 'yiwen.li@student.keystoneacademy.cn',
            link: 'mailto:yiwen.li@student.keystoneacademy.cn'
        }
    ];

    const relatedProjects = [

    ];
    return (
        <footer className="bg-[#44505d] text-white py-8 mt-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Blueprint Gallery</h3>
                        <p className="text-sm">Version Beta 1.0.0</p>
                        <div className="flex items-center space-x-2 mt-2">
                            <a href="https://keycas.cn" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                <p className="text-sm">Powered by KeyCAS</p>
                                <img src="assets/KeyCAS.svg" alt="KeyCAS Logo" className="h-4 w-auto"/>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <a href={link.url} className="hover:text-gray-300 text-sm">{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-3">
                            {contactInfo.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <div className="mt-1 mr-3 text-blue-400">
                                        <FontAwesomeIcon icon={item.icon} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-300">{item.text}</p>
                                        <a
                                            href={item.link}
                                            className="text-sm hover:text-blue-400 transition-colors"
                                            target={item.icon === faMapMarkerAlt ? "_blank" : ""}
                                            rel={item.icon === faMapMarkerAlt ? "noopener noreferrer" : ""}
                                        >
                                            {item.info}
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-700">
                    <p className="text-sm text-center">
                        
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
