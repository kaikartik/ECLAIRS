import React from 'react';
import { View } from '../types';

interface LandingViewProps {
    setView: (view: View) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ setView }) => {
    return (
        <div className="text-center flex flex-col items-center justify-center h-[calc(100vh-250px)]">
            <h1 className="text-5xl md:text-7xl font-serif font-medium text-brand-brown-dark mb-4 leading-tight">
                Refine Your Professional Voice
            </h1>
            <p className="text-lg md:text-xl text-brand-text/70 mb-10 max-w-2xl">
                AI-powered tools for engineers to communicate with clarity, confidence, and impact.
            </p>
            <button
                onClick={() => setView('dashboard')}
                className="bg-brand-brown-dark hover:bg-brand-text text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
                Get Started
            </button>
        </div>
    );
};

export default LandingView;
