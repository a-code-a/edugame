import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white/50 backdrop-blur-sm border-t border-slate-200 mt-auto py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">EduGamer</span>
                        <span>&copy; {currentYear}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/impressum"
                            className="hover:text-indigo-600 transition-colors"
                        >
                            Impressum
                        </Link>
                        <Link
                            to="/datenschutz"
                            className="hover:text-indigo-600 transition-colors"
                        >
                            Datenschutz
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
