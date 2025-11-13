
import { SpeechAnalysis } from "./services/geminiService";

export type View = 'landing' | 'dashboard' | 'writing' | 'speaking' | 'gemini-coach' | 'practice' | 'about';

export interface AppState {
    writingText: string;
    speakingHistory: SpeechAnalysis[];
}
