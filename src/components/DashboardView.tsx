// FIX: Removed markdown code block fences (```tsx) from the start and end of the file.
// This resolves the module parsing error and subsequent compilation issues.
import React, { useState, useEffect } from 'react';
import { View, AppState } from '../types';
import Card from './Card';
import { WritingIcon, SpeakingIcon, LightbulbIcon, LoaderIcon, TrashIcon } from './Icons';
import { getCommunicationTip } from '../services/geminiService';

interface DashboardViewProps {
    setView: (view: View) => void;
    onResetData: () => void;
    appState: AppState;
}

// --- NEW CHART COMPONENTS ---

const WordCountCircularProgress: React.FC<{ wordCount: number }> = ({ wordCount }) => {
    const target = 250;
    const progress = Math.min(wordCount / target, 1);
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-brand-brown/10"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                />
                <circle
                    className="text-brand-brown transition-all duration-500 ease-in-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-brand-brown-dark">{wordCount}</span>
                <span className="text-sm text-brand-text/60">Words</span>
            </div>
        </div>
    );
};


const FillerWordsBarChart: React.FC<{ history: AppState['speakingHistory'] }> = ({ history }) => {
    const recentHistory = history.slice(-5);
    const maxFillerWords = Math.max(...recentHistory.map(h => h.fillerWordCount), 0) || 5;

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-40 h-40 flex items-center justify-center bg-brand-brown/5 rounded-full">
                    <SpeakingIcon className="w-16 h-16 text-brand-brown/30" />
                </div>
                <p className="mt-4 text-brand-text/60">Record a speech to see your filler word progress.</p>
            </div>
        );
    }
    
    return (
        <div className="flex justify-around items-end h-full pt-4 space-x-2">
            {recentHistory.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full h-48 flex items-end justify-center">
                         <div
                            className="w-3/4 max-w-[40px] bg-brand-brown group-hover:bg-brand-brown-dark transition-all duration-300 rounded-t-md"
                            style={{ height: `${Math.max((item.fillerWordCount / maxFillerWords) * 100, 20)}%` }}
                         >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-brand-brown-dark opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.fillerWordCount}
                            </span>
                         </div>
                    </div>
                    <span className="text-xs text-brand-text/50 mt-2">#{history.length - recentHistory.length + index + 1}</span>
                </div>
            ))}
        </div>
    );
};

// --- END OF NEW CHART COMPONENTS ---


const TipOfTheDayCard: React.FC = () => {
    const [tip, setTip] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTip = async () => {
            setIsLoading(true);
            const result = await getCommunicationTip();
            if ('error' in result) {
                setTip("Could not load a tip right now. Please try again later.");
            } else {
                setTip(result.tip);
            }
            setIsLoading(false);
        };
        fetchTip();
    }, []);

    return (
        <div className="bg-white/50 border border-brand-brown/10 rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center mb-3">
                <LightbulbIcon className="w-6 h-6 text-brand-brown mr-2" />
                <h3 className="text-lg font-serif font-semibold text-brand-brown-dark">Tip of the Day</h3>
            </div>
            {isLoading ? (
                <div className="flex-grow flex items-center justify-center">
                    <LoaderIcon className="w-6 h-6 text-brand-brown" />
                </div>
            ) : (
                <p className="text-brand-text/80 flex-grow text-base leading-relaxed">{tip}</p>
            )}
        </div>
    )
}


const DashboardView: React.FC<DashboardViewProps> = ({ setView, onResetData, appState }) => {
    const totalWordsWritten = appState.writingText.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div>
            <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-serif text-brand-brown-dark">Welcome to Your Dashboard</h2>
                <p className="text-lg text-brand-text/70 mt-3">Choose a tool to continue or review your progress snapshot below.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card
                        title="Clarity Engine"
                        description="Refine your emails, documents, and technical explanations for clarity and impact."
                        icon={<WritingIcon className="w-8 h-8 text-brand-brown" />}
                        onClick={() => setView('writing')}
                    />
                    <Card
                        title="Speech Coach"
                        description="Analyze your speech for filler words, pacing, and clarity. Get instant feedback."
                        icon={<SpeakingIcon className="w-8 h-8 text-brand-brown" />}
                        onClick={() => setView('speaking')}
                    />
                </div>
                <div className="lg:col-span-1">
                   <TipOfTheDayCard />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-6 bg-white/50 rounded-xl border border-brand-brown/10 flex flex-col items-center justify-center">
                    <h3 className="font-serif text-xl font-semibold text-brand-brown-dark mb-6">Clarity Engine Progress</h3>
                    <WordCountCircularProgress wordCount={totalWordsWritten} />
                    <p className="text-base text-brand-text/70 mt-6">Current Word Count</p>
                 </div>
                 <div className="p-6 bg-white/50 rounded-xl border border-brand-brown/10 flex flex-col items-center">
                    <h3 className="font-serif text-xl font-semibold text-brand-brown-dark mb-6">Speech Coach: Filler Words</h3>
                    <div className="w-full flex-grow">
                        <FillerWordsBarChart history={appState.speakingHistory} />
                    </div>
                     <p className="text-base text-brand-text/70 mt-6 text-center">Count per speech (last 5)</p>
                 </div>
            </div>

            <div className="mt-16 pt-8 border-t border-brand-brown/10 text-center">
                 <button 
                    onClick={onResetData}
                    className="flex items-center justify-center mx-auto text-sm font-medium text-brand-brown/70 hover:text-red-600 transition-colors"
                 >
                    <TrashIcon className="w-4 h-4 mr-2"/>
                    Reset All Progress Data
                 </button>
            </div>
        </div>
    );
};

export default DashboardView;