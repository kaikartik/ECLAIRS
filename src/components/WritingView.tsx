import React, { useState } from 'react';
import { analyzeToneWithGemini, polishTextWithGemini, ToneAnalysis } from '../services/geminiService';
import { LoaderIcon } from './Icons';

interface WritingViewProps {
    text: string;
    onTextChange: (newText: string) => void;
}

const WritingView: React.FC<WritingViewProps> = ({ text, onTextChange }) => {
    const [analysisResult, setAnalysisResult] = useState<ToneAnalysis | null>(null);
    const [polishedText, setPolishedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'tone' | 'polish'>('tone');

    const handleAnalyzeTone = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        const result = await analyzeToneWithGemini(text);
        if ('error' in result) {
            setError(result.error);
        } else {
            setAnalysisResult(result);
        }
        setIsLoading(false);
    };

    const handlePolishText = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setError(null);
        setPolishedText('');
        const result = await polishTextWithGemini(text);
        if (result.startsWith('Error:')) {
            setError(result);
        } else {
            setPolishedText(result);
        }
        setIsLoading(false);
    };

    const handleSubmit = () => {
        if (activeTab === 'tone') {
            handleAnalyzeTone();
        } else {
            handlePolishText();
        }
    };

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center mt-8 p-6">
                    <LoaderIcon className="w-6 h-6 text-brand-brown" />
                    <p className="ml-4 text-base text-brand-text/80">Analyzing...</p>
                </div>
            );
        }
        if (error) {
            return <p className="text-red-700 bg-red-100 p-4 rounded-xl mt-8 text-base">{error}</p>;
        }
        if (activeTab === 'tone' && analysisResult) {
            return (
                <div className="mt-8 p-6 bg-white border border-brand-brown/10 rounded-xl">
                    <h3 className="text-lg font-serif font-semibold mb-4 text-brand-brown-dark">Tone Analysis</h3>
                    <p className="text-base mb-3"><strong className="font-medium text-brand-brown">Tone:</strong> {analysisResult.tone}</p>
                    <p className="text-base mb-3"><strong className="font-medium text-brand-brown">Sentiment:</strong> {analysisResult.sentiment}</p>
                    <p className="text-base mt-4"><strong className="font-medium text-brand-brown">Justification:</strong> {analysisResult.justification}</p>
                </div>
            );
        }
        if (activeTab === 'polish' && polishedText) {
            return (
                <div className="mt-8">
                    <h3 className="text-lg font-serif font-semibold mb-4 text-brand-brown-dark">Polished Text</h3>
                    <div className="p-6 bg-white border border-brand-brown/10 rounded-xl whitespace-pre-wrap text-base text-brand-text leading-relaxed">
                        {polishedText}
                    </div>
                </div>
            );
        }
        return null;
    };
    
    return (
        <div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-brown-dark mb-2">Clarity Engine</h2>
            <p className="text-lg text-brand-text/70 mb-8 max-w-2xl">Analyze the tone of your writing or let our AI polish your text for maximum clarity and professional impact.</p>

            <div className="flex border-b border-brand-brown/20 mb-8">
                <button onClick={() => setActiveTab('tone')} className={`py-3 px-6 text-base font-semibold transition-colors ${activeTab === 'tone' ? 'border-b-2 border-brand-brown text-brand-brown-dark' : 'text-brand-brown/70 hover:text-brand-brown'}`}>Tone Analysis</button>
                <button onClick={() => setActiveTab('polish')} className={`py-3 px-6 text-base font-semibold transition-colors ${activeTab === 'polish' ? 'border-b-2 border-brand-brown text-brand-brown-dark' : 'text-brand-brown/70 hover:text-brand-brown'}`}>Polish Text</button>
            </div>
            
            <textarea
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder={activeTab === 'tone' ? "Enter text to analyze its tone..." : "Enter text to polish..."}
                className="w-full h-56 p-6 bg-white/50 border border-brand-brown/20 rounded-xl focus:ring-2 focus:ring-brand-brown focus:outline-none text-base text-brand-text placeholder:text-brand-brown/50"
            />
            <button
                onClick={handleSubmit}
                disabled={isLoading || !text.trim()}
                className="mt-6 bg-brand-brown-dark hover:bg-brand-brown text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:bg-brand-brown/40 disabled:cursor-not-allowed text-base"
            >
                {isLoading ? 'Processing...' : (activeTab === 'tone' ? 'Analyze Tone' : 'Polish Text')}
            </button>
            
            {renderResults()}
        </div>
    );
};

export default WritingView;
