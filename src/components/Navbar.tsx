import React from 'react';
import { View } from '../types';

interface NavbarProps {
    currentView: View;
    setView: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
    const navItems: { view: View; label: string }[] = [
        { view: 'dashboard', label: 'Dashboard' },
        { view: 'practice', label: 'Practice Arena' },
        { view: 'about', label: 'About' },
    ];

    return (
        <nav>
            <ul className="flex items-center space-x-8">
                {navItems.map(item => (
                    <li key={item.view}>
                        <button
                            onClick={() => setView(item.view)}
                            className={`text-base font-medium transition-colors duration-200 relative group ${
                                currentView === item.view
                                    ? 'text-brand-brown-dark'
                                    : 'text-brand-brown hover:text-brand-brown-dark'
                            }`}
                        >
                            {item.label}
                             <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-[3px] bg-brand-brown-dark rounded-full transition-opacity duration-300 ${currentView === item.view ? 'opacity-100' : 'opacity-0'}`}></span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;