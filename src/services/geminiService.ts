import { GoogleGenAI, Type } from "@google/genai";
import { FILLER_WORDS, POWER_VERBS } from '../Constants';

// Interfaces for structured data types returned by the service
export interface ToneAnalysis {
    tone: string;
    sentiment: string;
    justification: string;
}

export interface RephrasedExample {
    original: string;
    suggestion: string;
    reason: string;
}

export interface SpeechAnalysis {
    wpm: number;
    fillerWordCount: number;
    fillerWordsFound: string[];
    clarityFeedback: string;
    transcript: string;
    rephrasedExamples: RephrasedExample[];
    fullRephrase: string;
}

export interface PracticeFeedback {
    score: number;
    justification: string;
    suggestions: string[];
}


// Initialize the Google Gemini AI client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const ai = new GoogleGenAI({ apiKey });

// Generic error handler for API calls
const handleError = (error: any, context: string): { error: string } => {
    console.error(`Error in ${context}:`, error);
    const message = error.message || 'An unknown error occurred.';
    return { error: `Gemini API Error: ${message}` };
};

/**
 * Analyzes the tone of a given text using the Gemini API.
 * @param text The text to analyze.
 * @returns A promise that resolves to a ToneAnalysis object or an error object.
 */
export const analyzeToneWithGemini = async (text: string): Promise<ToneAnalysis | { error: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the tone, sentiment, and provide a brief justification for the following text. Return the analysis as a JSON object with 'tone', 'sentiment', and 'justification' keys.\n\nText: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tone: { type: Type.STRING, description: "The overall tone of the text (e.g., Formal, Casual, Confident)." },
                        sentiment: { type: Type.STRING, description: "The sentiment of the text (e.g., Positive, Neutral, Negative)." },
                        justification: { type: Type.STRING, description: "A brief explanation for the identified tone and sentiment." },
                    },
                    required: ['tone', 'sentiment', 'justification'],
                },
            },
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        return handleError(error, 'analyzeToneWithGemini');
    }
};

/**
 * Polishes a given text for clarity, conciseness, and impact using the Gemini API.
 * @param text The text to polish.
 * @returns A promise that resolves to the polished text as a string, or an error string.
 */
export const polishTextWithGemini = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: text,
            config: {
                systemInstruction: `You are an expert copy editor for technical professionals. Rewrite the provided text to be more clear, concise, and impactful. 
                - Eliminate passive voice.
                - Reduce verbosity and remove jargon.
                - Incorporate strong, professional power verbs where appropriate. Here is a list of verbs to consider: ${POWER_VERBS.join(', ')}.
                - Ensure the core meaning of the text is preserved.
                - Only return the polished text, without any preamble, explanation, or markdown formatting.`
            }
        });
        return (response.text || '').trim();
    } catch (error) {
        const typedError = handleError(error, 'polishTextWithGemini');
        return `Error: ${typedError.error}`;
    }
};

/**
 * Analyzes a speech recording for various metrics using the Gemini API.
 * @param base64Audio The base64-encoded audio data (webm format).
 * @param recordingTime The duration of the recording in seconds.
 * @returns A promise that resolves to a SpeechAnalysis object or an error object.
 */
export const analyzeSpeechWithGemini = async (base64Audio: string, recordingTime: number): Promise<SpeechAnalysis | { error: string }> => {
    const audioPart = {
        inlineData: {
            mimeType: 'audio/webm',
            data: base64Audio,
        },
    };
    
    const textPart = {
        text: `Analyze the provided audio recording. The recording is ${recordingTime} seconds long.
        1.  Transcribe the speech to text.
        2.  Identify any filler words used from the following list: [${FILLER_WORDS.join(', ')}]. Count them and list the ones you found.
        3.  Provide concise, actionable feedback on the speaker's clarity and delivery.
        4.  Identify 1-3 specific sentences or phrases that could be improved for clarity or impact. For each, provide the original phrase, a suggested improvement, and a brief reason for the change.
        5.  Provide a fully rephrased version of the entire transcript, edited for maximum clarity and professional impact.
        Return the entire analysis in a single, valid JSON object. Do not include any preamble or markdown formatting.`
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: { parts: [audioPart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        transcript: { type: Type.STRING },
                        fillerWordCount: { type: Type.INTEGER },
                        fillerWordsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                        clarityFeedback: { type: Type.STRING },
                        rephrasedExamples: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    original: { type: Type.STRING },
                                    suggestion: { type: Type.STRING },
                                    reason: { type: Type.STRING },
                                },
                                required: ['original', 'suggestion', 'reason'],
                            },
                        },
                        fullRephrase: { type: Type.STRING },
                    },
                    required: ['transcript', 'fillerWordCount', 'fillerWordsFound', 'clarityFeedback', 'rephrasedExamples', 'fullRephrase'],
                },
            },
        });

        const analysisData = JSON.parse(response.text || '{}');
        
        // Calculate WPM from the transcript
        const wordCount = analysisData.transcript.trim() ? analysisData.transcript.trim().split(/\s+/).length : 0;
        const wpm = recordingTime > 0 ? Math.round((wordCount / recordingTime) * 60) : 0;

        return { ...analysisData, wpm };

    } catch (error) {
        return handleError(error, 'analyzeSpeechWithGemini');
    }
};

/**
 * Generates a practice scenario for communication skills.
 * @returns A promise that resolves to a scenario string or an error object.
 */
export const generatePracticeScenario = async (): Promise<{ scenario: string } | { error: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a short, specific communication practice scenario for an engineer or technical professional. For example: 'Explain the concept of API rate limiting to a non-technical marketing manager in under 90 seconds.' or 'Write a brief email to your team lead apologizing for a delay on a critical bug fix and outlining your new timeline.' Only return the scenario text itself, without any preamble or quotation marks.",
        });
        return { scenario: (response.text || '').trim() };
    } catch (error) {
        const typedError = handleError(error, 'generatePracticeScenario');
        return { error: typedError.error };
    }
};

/**
 * Provides feedback on a user's response to a practice scenario.
 * @param scenario The practice scenario given to the user.
 * @param responseText The user's written response to the scenario.
 * @returns A promise that resolves to a PracticeFeedback object or an error object.
 */
export const getPracticeFeedback = async (scenario: string, responseText: string): Promise<PracticeFeedback | { error: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `As a technical communication coach, evaluate the following response to a given scenario.
            
            Scenario: "${scenario}"
            
            User's Response: "${responseText}"
            
            Please provide:
            1. A score from 0 to 10 on how well the response addresses the scenario.
            2. A brief justification for your score.
            3. A list of 2-3 specific, actionable suggestions for improvement.
            
            Return the result as a single, valid JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: "A score from 0-10." },
                        justification: { type: Type.STRING, description: "A brief justification for the score." },
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Actionable suggestions for improvement."
                        },
                    },
                    required: ['score', 'justification', 'suggestions'],
                },
            },
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        return handleError(error, 'getPracticeFeedback');
    }
};

/**
 * Generates a single, actionable communication tip.
 * @returns A promise that resolves to a tip string or an error object.
 */
export const getCommunicationTip = async (): Promise<{ tip: string } | { error: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Provide a single, concise, and actionable communication tip for an engineer or technical professional. The tip should be one sentence long. For example: 'When explaining a technical concept, start with a relatable analogy before diving into details.' or 'Replace 'I think' with 'I recommend' to project more confidence in your emails.' Only return the tip itself.",
        });
        return { tip: (response.text || '').trim() };
    } catch (error) {
        const typedError = handleError(error, 'getCommunicationTip');
        return { error: typedError.error };
    }
};