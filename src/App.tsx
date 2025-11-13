import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
import WritingView from './components/WritingView';
import SpeakingView from './components/SpeakingView';
import GeminiCoachView from './components/GeminiCoachView';
import PracticeView from './components/PracticeView';
import AboutView from './components/AboutView';
import { View, AppState } from './types';
import { EclairIcon } from './components/Icons';
import { SpeechAnalysis } from './services/geminiService';

const initialAppState: AppState = {
  writingText: '',
  speakingHistory: [],
};

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const savedData = localStorage.getItem('eclairs-data');
      return savedData ? JSON.parse(savedData) : initialAppState;
    } catch (error) {
      console.error("Failed to parse localStorage data:", error);
      return initialAppState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('eclairs-data', JSON.stringify(appState));
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }, [appState]);

  const handleWritingChange = (newText: string) => {
    setAppState((prevState: AppState) => ({ ...prevState, writingText: newText }));
  };

  const handleSpeakingAnalysis = (newAnalysis: SpeechAnalysis) => {
    setAppState((prevState: AppState) => ({
      ...prevState,
      speakingHistory: [...prevState.speakingHistory, newAnalysis],
    }));
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all your saved progress? This action cannot be undone.")) {
      setAppState(initialAppState);
      localStorage.removeItem('eclairs-data');
    }
  };


  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView setView={setCurrentView} />;
      case 'dashboard':
        return <DashboardView setView={setCurrentView} onResetData={handleResetData} appState={appState} />;
      case 'writing':
        return <WritingView text={appState.writingText} onTextChange={handleWritingChange} />;
      case 'speaking':
        return <SpeakingView onAnalysisComplete={handleSpeakingAnalysis} />;
      case 'gemini-coach':
        return <GeminiCoachView />;
      case 'practice':
        return <PracticeView />;
      case 'about':
        return <AboutView />;
      default:
        return <LandingView setView={setCurrentView} />;
    }
  };

  return (
    <div className="bg-brand-beige text-brand-text min-h-screen font-sans">
      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView(currentView === 'landing' ? 'landing' : 'dashboard')}>
             <EclairIcon className="w-8 h-8 text-brand-brown-dark" />
            <h1 className="text-2xl font-semibold text-brand-brown-dark tracking-wide">ECLAIRS</h1>
          </div>
          {currentView !== 'landing' && <Navbar currentView={currentView} setView={setCurrentView} />}
        </header>
        <main>
          {renderView()}
        </main>
        <footer className="text-center mt-20 text-brand-brown/60 text-sm">
            <p><strong>ECLAIRS</strong></p>
            <p className="mt-1">CODEWALLAH</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
