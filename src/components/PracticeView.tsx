import React, { useState, useEffect } from 'react';
import { generatePracticeScenario, getPracticeFeedback, PracticeFeedback } from '../services/geminiService';
import { LoaderIcon } from './Icons';

const PracticeView: React.FC = () => {
    const [scenario, setScenario] = useState<string>('');
    const [responseText, setResponseText] = useState<string>('');
    const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchScenario = async () => {
        setIsLoading(true);
        setError(null);
        setFeedback(null);
        setResponseText('');
        const result = await generatePracticeScenario();
        if ('error' in result) {
            setError(result.error);
        } else {
            setScenario(result.scenario);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchScenario();
    }, []);
    
    const handleSubmit = async () => {
        if (!responseText.trim()) return;
        setIsSubmitting(true);
        setError(null);
        setFeedback(null);
        const result = await getPracticeFeedback(scenario, responseText);
        if ('error' in result) {
            setError(result.error);
        } else {
            setFeedback(result);
        }
        setIsSubmitting(false);
    };

    return (
        <div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-brown-dark mb-2">Practice Arena</h2>
            <p className="text-lg text-brand-text/70 mb-8">Test your skills with real-world challenges and get instant AI feedback.</p>

            <div className="p-6 bg-white/50 border border-brand-brown/10 rounded-xl mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-serif font-semibold text-brand-brown mb-3">Your Scenario</h3>
                        {isLoading ? <LoaderIcon className="w-6 h-6 text-brand-brown" /> : <p className="text-base text-brand-text leading-relaxed">{scenario}</p>}
                    </div>
                    <button
                        onClick={fetchScenario}
                        disabled={isLoading}
                        className="bg-white hover:bg-white/90 text-brand-brown-dark font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:bg-gray-200 border border-brand-brown/20 ml-4 flex-shrink-0"
                    >
                        New Scenario
                    </button>
                </div>
            </div>

            {error && <p className="text-red-700 bg-red-100 p-4 rounded-xl my-6 text-base">{error}</p>}
            
            {!isLoading && scenario && (
                <div>
                    <h3 className="text-lg font-serif font-semibold mb-4 text-brand-brown-dark">Your Response</h3>
                    <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Type your response to the scenario here..."
                        className="w-full h-40 p-6 bg-white/50 border border-brand-brown/20 rounded-xl focus:ring-2 focus:ring-brand-brown focus:outline-none text-base text-brand-text placeholder:text-brand-brown/50"
                        disabled={isSubmitting}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !responseText.trim()}
                        className="mt-6 bg-brand-brown-dark hover:bg-brand-brown text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:bg-brand-brown/40 disabled:cursor-not-allowed text-base"
                    >
                        {isSubmitting ? 'Getting Feedback...' : 'Submit for Feedback'}
                    </button>
                </div>
            )}
            
            {isSubmitting && (
                <div className="flex justify-center items-center mt-8 p-6">
                    <LoaderIcon className="w-6 h-6 text-brand-brown" />
                    <p className="ml-4 text-base text-brand-text/80">Evaluating your response...</p>
                </div>
            )}
            
            {feedback && !isSubmitting && (
                <div className="mt-8 p-6 bg-white border border-brand-brown/10 rounded-xl">
                    <h3 className="text-2xl font-serif font-semibold mb-4 text-brand-brown-dark">Feedback Report</h3>
                    <div className="flex items-baseline mb-6">
                        <p className="text-5xl font-bold text-brand-brown-dark">{feedback.score}</p>
                        <p className="text-2xl text-brand-brown/60 ml-2">/10</p>
                    </div>
                    <div className="mb-6">
                        <h4 className="font-semibold text-lg text-brand-brown-dark mb-2">Justification:</h4>
                        <p className="text-base text-brand-text/80">{feedback.justification}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-brand-brown-dark mb-3">Suggestions for Improvement:</h4>
                        <ul className="list-disc list-inside space-y-2 text-base text-brand-text/80">
                            {feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeView;
