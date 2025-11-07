

import React, { useState, useCallback, ChangeEvent, useRef, useEffect } from 'react';
import { editImage, parseDataUrl, generateImage, generateVideo } from './services/geminiService';

// --- Types --- //
type Tool = 'prompt' | 'remove-object' | 'generate-image' | 'generate-video' | 'restore' | 'remove-bg';

type ToolWithPrompt = {
    icon: React.FC<{ className?: string }>;
    name: string;
    promptNeeded: true;
    placeholder: string;
};

type ToolWithDefaultPrompt = {
    icon: React.FC<{ className?: string }>;
    name: string;
    promptNeeded: false;
    defaultPrompt: string;
};

type ToolConfig = ToolWithPrompt | ToolWithDefaultPrompt;


// --- Helper Icon Components --- //
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-1.28 1.28a3.75 3.75 0 00-1.24 2.818V9.75M9.75 3.104A3.75 3.75 0 0113.5 6.854v.001M9.75 3.104l-1.28 1.28m2.56 0A3.75 3.75 0 0113.5 6.854m-3.75-3.75a3.75 3.75 0 00-3.75 3.75v.001M6 9.75h3.75m-3.75 0a3.75 3.75 0 00-3.75 3.75M6 9.75v3.75m0-3.75a3.75 3.75 0 013.75-3.75M9.75 16.5v-3.75M14.25 9.75a3.75 3.75 0 013.75 3.75v.001M14.25 9.75h3.75m-3.75 0a3.75 3.75 0 003.75-3.75v-.001M14.25 9.75L15.53 8.47a3.75 3.75 0 00-2.818-1.24L11.25 6M18 14.25v3.75m0-3.75a3.75 3.75 0 003.75-3.75v-.001M18 14.25a3.75 3.75 0 01-3.75 3.75M18 14.25h-3.75m3.75 0l1.28 1.28a3.75 3.75 0 011.24 2.818v1.436M4.5 14.25l-1.28 1.28A3.75 3.75 0 001.98 18.35v1.436M4.5 14.25l1.28 1.28" />
    </svg>
);
const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);
const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
    </svg>
);
const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l-3.182-3.182m11.664 0l3.182 3.182" />
    </svg>
);
const TextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.17 48.17 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);
const EraserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ScissorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.843 15.343A4.5 4.5 0 016.75 13.5a4.5 4.5 0 011.093-2.843m1.093 5.686A4.5 4.5 0 0013.5 16.5a4.5 4.5 0 002.843-1.093m-5.686-1.093a4.5 4.5 0 015.686 0M3 8.25l1.5 1.5M4.5 6.75l1.5 1.5M3 12.75l1.5-1.5M4.5 14.25l1.5-1.5M19.5 8.25l1.5 1.5M21 6.75l-1.5 1.5m1.5 6l-1.5-1.5m-1.5 1.5l-1.5-1.5" />
    </svg>
);
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.4-1.4L13.063 18l1.188-.648a2.25 2.25 0 011.4 1.4l.648 1.188z" />
    </svg>
);
const FilmIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75v3.75m3.75-3.75v3.75m-7.5-3.75L3 16.5m18 0l-3.75 3.75M3 16.5V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v10.5m-18 0h18M12 6.75h.008v.008H12V6.75zm-3 0h.008v.008H9V6.75zm-3 0h.008v.008H6V6.75zm3 3.75h.008v.008H9v-.008zm-3 0h.008v.008H6v-.008zm12-3h.008v.008H18V6.75zm3 0h.008v.008H21V6.75zm-3 3.75h.008v.008H18v-.008zm3 0h.008v.008H21v-.008z" />
    </svg>
);
const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const TOOL_CONFIG: Record<Tool, ToolConfig> = {
    'prompt': { icon: TextIcon, name: 'AI Prompt', promptNeeded: true, placeholder: 'e.g., make the sky dramatic' },
    'remove-object': { icon: EraserIcon, name: 'Remove Object', promptNeeded: true, placeholder: 'e.g., the person in the red shirt' },
    'generate-image': { icon: SparklesIcon, name: 'Generate Image', promptNeeded: true, placeholder: 'e.g., a cat astronaut on Mars' },
    'generate-video': { icon: FilmIcon, name: 'Generate Video', promptNeeded: true, placeholder: 'e.g., a drone shot of a city' },
    'restore': { icon: WandIcon, name: 'Restore Color', promptNeeded: false, defaultPrompt: 'restore the original color, preserving all text and details' },
    'remove-bg': { icon: ScissorIcon, name: 'Remove BG', promptNeeded: false, defaultPrompt: 'remove the background' },
};

const ApiKeyModal: React.FC<{ onSelectKey: () => void; onClose: () => void; }> = ({ onSelectKey, onClose }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <h3 className="text-2xl font-bold text-white mb-4">API Key Required</h3>
            <p className="text-gray-400 mb-6">
                Video generation with Veo requires a user-selected API key. Please select your key to continue.
                This feature may incur charges. For more details, please review the{' '}
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                    billing information
                </a>.
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-medium">
                    Cancel
                </button>
                <button onClick={onSelectKey} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium text-white">
                    Select API Key
                </button>
            </div>
        </div>
    </div>
);

// Fix for TypeScript error: Subsequent property declarations must have the same type.
// By defining the type inline within the global declaration, we avoid potential
// conflicts with other type declarations of the same name in the global scope.
declare global {
    interface Window {
        aistudio?: {
            hasSelectedApiKey: () => Promise<boolean>;
            openSelectKey: () => Promise<void>;
        };
    }
}

const SplashScreen: React.FC<{ isFading: boolean }> = ({ isFading }) => (
    <div className={`fixed inset-0 bg-white flex flex-col items-center justify-center z-[100] transition-opacity duration-500 pointer-events-none ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-wider">AFRIDI X SAHIL AI</h1>
        <p className="mt-2 text-lg text-gray-600">advanced AI Image editor by afridixsahil</p>
    </div>
);

// --- Main App Component --- //
export default function App() {
    const [history, setHistory] = useState<string[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
    const [currentContent, setCurrentContent] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<Tool>('prompt');
    const [prompt, setPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
    
    const [isSplashVisible, setIsSplashVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    const originalImage = history.length > 0 ? history[0] : null;

    useEffect(() => {
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 2000); 

      const unmountTimer = setTimeout(() => {
        setIsSplashVisible(false);
      }, 2500); 

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }, []);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, []);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setHistory([result]);
                setCurrentHistoryIndex(0);
                setCurrentContent({ url: result, type: 'image' });
                setError(null);
                setPrompt('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApply = useCallback(async () => {
        const toolConfig = TOOL_CONFIG[activeTool];
        
        let finalPrompt: string;
        if ('placeholder' in toolConfig) {
            finalPrompt = prompt;
        } else {
            finalPrompt = toolConfig.defaultPrompt;
        }

        if (toolConfig.promptNeeded && !finalPrompt) {
            setError("Please provide a prompt for this tool.");
            return;
        }

        if (activeTool === 'generate-video' && !apiKeySelected) {
            setShowApiKeyModal(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            switch (activeTool) {
                case 'generate-image':
                    setLoadingMessage('Generating new image...');
                    const newImageUrl = await generateImage(finalPrompt);
                    setHistory([newImageUrl]);
                    setCurrentHistoryIndex(0);
                    setCurrentContent({ url: newImageUrl, type: 'image' });
                    break;

                case 'generate-video':
                    setLoadingMessage('Initializing video generation... This can take several minutes.');
                    const currentImageForVideo = currentContent?.type === 'image' ? currentContent.url : undefined;
                    let imagePayload;
                    if (currentImageForVideo) {
                        imagePayload = parseDataUrl(currentImageForVideo);
                    }
                    const videoUri = await generateVideo(finalPrompt, imagePayload);

                    setLoadingMessage('Fetching generated video...');
                    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
                    if (!videoResponse.ok) throw new Error(`Failed to fetch video file: ${videoResponse.statusText}`);
                    
                    const videoBlob = await videoResponse.blob();
                    const videoUrl = URL.createObjectURL(videoBlob);
                    
                    setCurrentContent({ url: videoUrl, type: 'video' });
                    setHistory([]);
                    setCurrentHistoryIndex(0);
                    break;
                    
                case 'prompt':
                case 'restore':
                case 'remove-bg':
                case 'remove-object':
                    if (currentContent?.type !== 'image') {
                        setError("This tool can only be used on an image.");
                        return;
                    }
                    setLoadingMessage('Applying edit...');
                    const { base64Data, mimeType } = parseDataUrl(currentContent.url);
                    const editedDataUrl = await editImage(base64Data, mimeType, finalPrompt);

                    const newHistory = history.slice(0, currentHistoryIndex + 1);
                    newHistory.push(editedDataUrl);
                    setHistory(newHistory);
                    const newIndex = newHistory.length - 1;
                    setCurrentHistoryIndex(newIndex);
                    setCurrentContent({ url: editedDataUrl, type: 'image' });
                    break;
            }
            setPrompt('');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Operation failed: ${errorMessage}`);
            if (activeTool === 'generate-video' && errorMessage.includes('Requested entity was not found')) {
                setApiKeySelected(false);
                setError("API Key error. Please re-select your API key and try again.");
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [activeTool, prompt, history, currentHistoryIndex, currentContent, apiKeySelected]);

    const handleUndo = () => {
        if (currentHistoryIndex > 0) {
            const newIndex = currentHistoryIndex - 1;
            setCurrentHistoryIndex(newIndex);
            setCurrentContent({ url: history[newIndex], type: 'image' });
        }
    };
    const handleRedo = () => {
        if (currentHistoryIndex < history.length - 1) {
            const newIndex = currentHistoryIndex + 1;
            setCurrentHistoryIndex(newIndex);
            setCurrentContent({ url: history[newIndex], type: 'image' });
        }
    };
    const handleReset = () => {
      if(originalImage) {
        setHistory([originalImage]);
        setCurrentHistoryIndex(0);
        setCurrentContent({ url: originalImage, type: 'image' });
      }
    }
    
    const handleDownload = () => {
        if (!currentContent) return;
        const link = document.createElement('a');
        link.href = currentContent.url;
        const extension = currentContent.type === 'image' ? currentContent.url.split(';')[0].split('/')[1] || 'png' : 'mp4';
        link.download = `generated-content.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleSelectApiKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
            setShowApiKeyModal(false);
            handleApply();
        }
    };

    const isImageTool = ['prompt', 'restore', 'remove-bg', 'remove-object'].includes(activeTool);
    const disableImageTools = !currentContent || currentContent.type !== 'image' || isLoading;
    
    const currentToolConfig = TOOL_CONFIG[activeTool];

    return (
        <>
            {isSplashVisible && <SplashScreen isFading={isFading} />}
            <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
                {showApiKeyModal && <ApiKeyModal onSelectKey={handleSelectApiKey} onClose={() => setShowApiKeyModal(false)} />}
                <header className="text-center py-4 border-b border-gray-700 bg-gray-800/50 shadow-md">
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                        AfridixSahil AI Creative suit
                    </h1>
                </header>

                <div className="flex-grow flex items-stretch overflow-hidden">
                    <aside className="w-20 bg-gray-800 p-2 flex flex-col items-center gap-2 border-r border-gray-700">
                        {Object.entries(TOOL_CONFIG).map(([key, { icon: Icon, name }]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTool(key as Tool)}
                                disabled={isLoading || (isImageTool && !currentContent)}
                                className={`p-3 rounded-lg transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed ${activeTool === key ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}
                                title={name}
                                aria-label={name}
                            >
                                <Icon className="h-6 w-6 mx-auto" />
                            </button>
                        ))}
                    </aside>
                    
                    <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative bg-checkered">
                        {currentContent ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                 {currentContent.type === 'image' ? (
                                    <img src={currentContent.url} alt="Current" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                ) : (
                                    <video src={currentContent.url} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                )}
                                {isLoading && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                                        <Spinner />
                                        <span className="mt-4 text-lg text-white">{loadingMessage || 'Processing...'}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <UploadIcon className="h-24 w-24 mx-auto text-gray-500" />
                                <h2 className="mt-4 text-2xl font-semibold text-gray-400">Upload an Image or Generate One</h2>
                                <p className="text-gray-500 mt-1">Select a file or use a generation tool to start.</p>
                                <button onClick={triggerFileSelect} className="mt-6 px-6 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                    Upload Image
                                </button>
                            </div>
                        )}
                    </main>
                </div>
                
                {error && (
                    <div className="fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 bg-red-500/90 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-pulse">
                        {error}
                    </div>
                )}
                
                <footer className={`sticky bottom-0 bg-gray-800/80 backdrop-blur-sm py-3 border-t border-gray-700 z-10 transition-opacity duration-300 ${!currentContent && activeTool !== 'generate-image' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="max-w-7xl mx-auto px-4">
                        {'placeholder' in currentToolConfig && (
                            <div className="flex items-center gap-3 mb-3">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={currentToolConfig.placeholder}
                                    disabled={isLoading}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                                />
                                <button onClick={handleApply} disabled={isLoading || !prompt} className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2 border border-transparent rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"> Apply </button>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-3">
                             <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                             <button onClick={triggerFileSelect} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium disabled:opacity-50"> <UploadIcon className="h-4 w-4" /> Change Image </button>
                            {!currentToolConfig.promptNeeded && (
                                <button onClick={handleApply} disabled={disableImageTools} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium text-white disabled:opacity-50"> Apply {currentToolConfig.name} </button>
                            )}
                            <div className="h-6 w-px bg-gray-600"></div>
                            <button onClick={handleUndo} disabled={isLoading || currentHistoryIndex === 0 || currentContent?.type !== 'image'} title="Undo" className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50"> <UndoIcon className="h-5 w-5" /> </button>
                            <button onClick={handleRedo} disabled={isLoading || currentHistoryIndex === history.length - 1 || currentContent?.type !== 'image'} title="Redo" className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50"> <RedoIcon className="h-5 w-5" /> </button>
                            <button onClick={handleReset} disabled={isLoading || history.length <= 1 || currentContent?.type !== 'image'} title="Reset" className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50"> <ResetIcon className="h-5 w-5" /> </button>
                             <div className="h-6 w-px bg-gray-600"></div>
                            <button onClick={handleDownload} disabled={isLoading || !currentContent} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium text-white disabled:opacity-50"> <DownloadIcon className="h-4 w-4" /> Download </button>
                        </div>
                    </div>
                </footer>
                <style>{`
                    .bg-checkered {
                        background-image:
                            linear-gradient(45deg, #374151 25%, transparent 25%),
                            linear-gradient(-45deg, #374151 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #374151 75%),
                            linear-gradient(-45deg, transparent 75%, #374151 75%);
                        background-size: 20px 20px;
                        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                    }
                `}</style>
            </div>
        </>
    );
}
