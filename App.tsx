
import React, { useState, useEffect } from 'react';
import { Copy, Download, Sparkles, Send, FileText, Briefcase, RefreshCw, CheckCircle, User, Award, Building, Target, Save, Trash2, AlertCircle } from 'lucide-react';
import { LetterLength, LetterStyle, InputData, GenerationConfig } from './types';
import { generateCoverLetter } from './services/geminiService';
import PillButton from './components/PillButton';
// @ts-ignore
import { jsPDF } from "jspdf";

const STORAGE_KEY = 'ai_cover_letter_user_profile_v2';

const InputField = ({ icon: Icon, label, value, onChange, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-400" />
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-gray-700"
    />
  </div>
);

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [recentPosition, setRecentPosition] = useState('');
  const [background, setBackground] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [targetPosition, setTargetPosition] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [length, setLength] = useState<LetterLength>(LetterLength.STANDARD);
  const [style, setStyle] = useState<LetterStyle>(LetterStyle.PROFESSIONAL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [apiKeyExists, setApiKeyExists] = useState(true);

  useEffect(() => {
    // Safety check for API Key
    const checkKey = () => {
      try {
        const key = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                    (window as any).process?.env?.API_KEY;
        setApiKeyExists(!!key);
      } catch (e) {
        setApiKeyExists(false);
      }
    };
    
    checkKey();

    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setName(parsed.name || '');
        setRecentPosition(parsed.recentPosition || '');
        setBackground(parsed.background || '');
      } catch (e) {
        console.error("Profile load failed", e);
      }
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, recentPosition, background }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleClearProfile = () => {
    if (confirm("Clear saved profile?")) {
      localStorage.removeItem(STORAGE_KEY);
      setName(''); setRecentPosition(''); setBackground('');
    }
  };

  const handleGenerate = async () => {
    if (!background.trim() || !jobDescription.trim()) {
      setError('Please provide your background and the job description.');
      return;
    }
    setError('');
    setIsGenerating(true);
    setResult('');
    try {
      const output = await generateCoverLetter(
        { name, recentPosition, background, companyName, targetPosition, jobDescription },
        { length, style }
      );
      setResult(output);
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      const textWidth = doc.internal.pageSize.getWidth() - (margin * 2);
      doc.setFontSize(16).text("Cover Letter", margin, margin);
      doc.setFontSize(11).text(doc.splitTextToSize(result, textWidth), margin, margin + 15);
      doc.save("cover-letter.pdf");
    } catch (e) {
      setError("PDF generation failed.");
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 lg:px-8">
      <header className="max-w-6xl mx-auto pt-12 pb-16 text-center">
        <div className="inline-flex items-center justify-center p-2 mb-4 bg-blue-50 rounded-2xl">
          <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
          <span className="text-blue-600 font-semibold uppercase text-xs">AI Professional Suite</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          AI <span className="text-gradient-tech">Cover Letter</span> Generator
        </h1>
        
        {!apiKeyExists && (
          <div className="mt-8 max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start text-amber-800 text-left">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Missing API Key</p>
              <p>Set <code className="bg-amber-100 px-1 rounded">API_KEY</code> in your Vercel Environment Variables and redeploy.</p>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-semibold">Background</h2>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleSaveProfile} className={`p-2 rounded-lg ${profileSaved ? 'text-green-600' : 'text-gray-400 hover:text-blue-500'}`}><Save className="w-5 h-5" /></button>
                  <button onClick={handleClearProfile} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="space-y-4">
                <InputField icon={User} label="Name" value={name} onChange={setName} />
                <InputField icon={Award} label="Recent Role" value={recentPosition} onChange={setRecentPosition} />
                <textarea value={background} onChange={e => setBackground(e.target.value)} placeholder="Experience summary..." className="w-full h-48 p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none resize-none" />
              </div>
            </div>

            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-semibold">Target Job</h2>
              </div>
              <div className="space-y-4">
                <InputField icon={Building} label="Company" value={companyName} onChange={setCompanyName} />
                <InputField icon={Target} label="Role Applied" value={targetPosition} onChange={setTargetPosition} />
                <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Job description..." className="w-full h-48 p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-purple-200 outline-none resize-none" />
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 border-t space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase">Length</p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(LetterLength).map(l => <PillButton key={l} label={`${l} words`} isActive={length === l} onClick={() => setLength(l)} />)}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase">Style</p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(LetterStyle).map(s => <PillButton key={s} label={s} isActive={style === s} onClick={() => setStyle(s)} />)}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex space-x-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !apiKeyExists}
              className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-tech shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center space-x-2"
            >
              {isGenerating ? <RefreshCw className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              <span>{isGenerating ? 'Drafting...' : 'Generate Letter'}</span>
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-12 bg-white rounded-[32px] p-8 lg:p-12 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">Your Result</h3>
              <div className="flex space-x-2">
                <button onClick={handleCopy} className="p-2 border rounded-xl hover:bg-gray-50">{copied ? <CheckCircle className="text-green-500" /> : <Copy />}</button>
                <button onClick={handleDownloadPDF} className="p-2 border rounded-xl hover:bg-gray-50"><Download /></button>
              </div>
            </div>
            <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
