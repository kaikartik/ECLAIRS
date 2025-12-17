import React from 'react';

const AboutView: React.FC = () => {
    return (
        <div>
            <h2 className="text-4xl md:text-5xl font-serif font-medium mb-4 text-brand-brown-dark">About ECLAIRS</h2>
            <div className="space-y-4 text-brand-text/80 text-lg max-w-3xl">
                <p>
                    <strong>ECLAIRS</strong> (Engineering Communication & Language Active Impact Review System) is a showcase application by <strong>CODEWALLAH</strong>, built to serve as a personal communication coach for technical professionals.
                </p>
                <p>
                    Whether you're writing a critical email, preparing a presentation, or practicing how to explain a complex topic, ECLAIRS provides instant, intelligent feedback to help you communicate with clarity, confidence, and impact.
                </p>
                <p className="font-medium text-brand-text mt-4">
                    Key Features:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Clarity Engine:</strong> Get real-time analysis of your text's tone or have it polished by an AI expert copy editor.</li>
                    <li><strong>Speech Coach:</strong> Record yourself speaking and receive a detailed analysis of your words per minute, filler word usage, and overall clarity.</li>
                    <li><strong>Practice Arena:</strong> Tackle randomly generated, realistic communication challenges and receive a score and actionable feedback.</li>
                </ul>
                
            </div>
        </div>
    );
};

export default AboutView;
