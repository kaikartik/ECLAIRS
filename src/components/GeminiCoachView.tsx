import React from 'react';
import { CoachIcon } from './Icons';

const GeminiCoachView: React.FC = () => {
    return (
        <div className="text-center flex flex-col items-center justify-center h-[calc(100vh-250px)]">
            <CoachIcon className="w-24 h-24 text-brand-brown/30 mb-4" />
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-brand-brown-dark mb-2">AI Polish</h2>
            <p className="text-lg text-brand-text/70">
                This feature has been integrated into the Clarity Engine for a seamless workflow.
            </p>
        </div>
    );
};

export default GeminiCoachView;
