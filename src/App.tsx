import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Copy, Download, Sparkles, Check, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { translateGuidelines } from './services/gemini';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please provide some guidelines text or upload a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await translateGuidelines(inputText);
      setOutputText(result);
    } catch (err) {
      console.error(err);
      setError('An error occurred while translating the guidelines. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robot-friendly-guidelines.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 leading-tight">Robot-Friendly Guidelines</h1>
          <p className="text-sm text-slate-500">Translate messy brand docs into crisp, actionable AI rules</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Input */}
        <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Original Guidelines</h2>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Upload .md / .txt
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".md,.txt,text/plain,text/markdown" 
              className="hidden" 
            />
          </div>

          <div className="flex-1 relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your existing brand guidelines here, or upload a file..."
              className="flex-1 w-full p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Translate to Robot-Friendly
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Robot-Friendly Output</h2>
            
            {outputText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                  title="Download as .md"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col relative">
            {isLoading ? (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-600 font-medium animate-pulse">Extracting key rules & formatting...</p>
              </div>
            ) : null}

            {outputText ? (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-slate prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-a:text-indigo-600 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                  <Markdown remarkPlugins={[remarkGfm]}>{outputText}</Markdown>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Your clean, crisp, and robot-friendly guidelines will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
