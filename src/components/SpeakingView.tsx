import React, { useState, useRef, useEffect } from 'react';
import { analyzeSpeechWithGemini, SpeechAnalysis } from '../services/geminiService';
import { MicrophoneIcon, StopIcon, LoaderIcon } from './Icons';

interface SpeakingViewProps {
    onAnalysisComplete: (analysis: SpeechAnalysis) => void;
}

const SpeakingView: React.FC<SpeakingViewProps> = ({ onAnalysisComplete }) => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const [analysisResult, setAnalysisResult] = useState<SpeechAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.addEventListener('dataavailable', event => {
                audioChunksRef.current.push(event.data);
            });

            mediaRecorderRef.current.addEventListener('stop', handleStop);

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            setAnalysisResult(null);
            setError(null);

            timerRef.current = setInterval(() => {
                setRecordingTime(prevTime => prevTime + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            if(err instanceof DOMException && err.name === "NotAllowedError") {
                 setError("Microphone access was denied. Please enable it in your browser settings to use the Speech Coach.");
            } else {
                 setError("Could not access microphone. Please check permissions and ensure your device is connected.");
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };
    
    const handleStop = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            const result = await analyzeSpeechWithGemini(base64Audio, recordingTime);

            if ('error' in result) {
                setError(result.error);
            } else {
                setAnalysisResult(result);
                onAnalysisComplete(result); // Lift the state up
            }
            setIsLoading(false);
        };
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-brown-dark mb-2">Speech Coach</h2>
            <p className="text-lg text-brand-text/70 mb-8">Record your voice and get instant, AI-powered feedback on your delivery.</p>

            <div className="flex flex-col items-center p-6 bg-white/50 border border-brand-brown/10 rounded-xl">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                        isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-brown-dark hover:bg-brand-brown'
                    }`}
                >
                    {isRecording ? <StopIcon className="w-10 h-10 text-white" /> : <MicrophoneIcon className="w-10 h-10 text-white" />}
                </button>
                <p className="mt-6 text-3xl font-mono text-brand-brown-dark tracking-wider">{formatTime(recordingTime)}</p>
                <p className="mt-2 text-sm text-brand-text/60">{isRecording ? 'Recording in progress...' : 'Click the button to start recording'}</p>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center mt-6 p-4">
                    <LoaderIcon className="w-6 h-6 text-brand-brown" />
                    <p className="ml-3 text-brand-text/80">Analyzing your speech...</p>
                </div>
            )}
            
            {error && <p className="text-red-600 bg-red-100 p-4 rounded-xl mt-8 text-base">{error}</p>}

            {analysisResult && !isLoading && (
                <div className="mt-8 space-y-6">
                    <h3 className="text-2xl font-serif text-center text-brand-brown-dark font-semibold">Your Speech Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="p-6 bg-white/50 rounded-xl border border-brand-brown/10">
                            <p className="text-4xl font-bold text-brand-brown-dark mb-2">{analysisResult.wpm}</p>
                            <p className="text-sm text-brand-text/70">Words Per Minute</p>
                        </div>
                        <div className="p-6 bg-white/50 rounded-xl border border-brand-brown/10">
                            <p className="text-4xl font-bold text-brand-brown-dark mb-2">{analysisResult.fillerWordCount}</p>
                            <p className="text-sm text-brand-text/70">Filler Words</p>
                        </div>
                        <div className="p-6 bg-white/50 rounded-xl border border-brand-brown/10">
                            <p className="font-semibold text-sm text-brand-text/80 mb-2">Found Words</p>
                            <p className="text-xs text-brand-text/60 truncate">{analysisResult.fillerWordsFound.join(', ') || 'None!'}</p>
                        </div>
                    </div>
                     <div className="p-6 bg-white border border-brand-brown/10 rounded-xl">
                        <h4 className="text-lg font-serif font-semibold mb-3 text-brand-brown-dark">Clarity Feedback</h4>
                        <p className="text-base text-brand-text/80">{analysisResult.clarityFeedback}</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-serif font-semibold mb-4 text-brand-brown-dark">Rephrased Examples</h4>
                        <div className="space-y-4">
                            {analysisResult.rephrasedExamples.map((ex, index) => (
                                <div key={index} className="p-4 bg-white border border-brand-brown/10 rounded-lg">
                                    <p className="text-sm text-brand-text/60 mb-2"><strong>Original:</strong> {ex.original}</p>
                                    <p className="text-sm text-brand-brown-dark font-medium mb-2"><strong>Suggestion:</strong> {ex.suggestion}</p>
                                    <p className="text-xs text-brand-text/50"><em>Reason: {ex.reason}</em></p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="text-lg font-serif font-semibold mb-3 text-brand-brown-dark">Full Rephrased Transcript</h4>
                        <p className="p-4 bg-white border border-brand-brown/10 rounded-lg text-sm text-brand-text/80 whitespace-pre-wrap leading-relaxed">{analysisResult.fullRephrase}</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-serif font-semibold mb-3 text-brand-brown-dark">Your Full Transcript</h4>
                        <p className="p-4 bg-white/30 border border-brand-brown/10 rounded-lg text-sm text-brand-text/60 italic whitespace-pre-wrap leading-relaxed">{analysisResult.transcript}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpeakingView;
