import React from 'react';

interface CardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, icon, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white/50 border border-brand-brown/10 rounded-xl p-6 flex flex-col items-start hover:bg-white hover:border-brand-brown/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
            <div className="bg-brand-brown/10 p-3 rounded-full mb-4 border border-brand-brown/20">
                {icon}
            </div>
            <h3 className="text-xl font-serif font-semibold text-brand-brown-dark mb-2">{title}</h3>
            <p className="text-brand-text/70 text-base">{description}</p>
        </div>
    );
};

export default Card;
