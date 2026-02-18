
import React, { useState, useEffect } from 'react';
import { Copy, Download, Sparkles, Send, FileText, Briefcase, RefreshCw, CheckCircle, User, Award, Building, Target, Save, Trash2, AlertCircle } from 'lucide-react';
import { LetterLength, LetterStyle, InputData, GenerationConfig } from './types';
import { generateCoverLetter } from './services/geminiService';
import PillButton from './components/PillButton';
// @ts-ignore
import { jsPDF } from "jspdf";

const STORAGE_KEY = 'ai_cover_letter_user_profile';

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
    // Safely check for API Key to prevent crash if 'process' is undefined
    try {
      const key = typeof process !== 'undefined' && process.env ? process.env.API_KEY : null;
      if (!key) {
        setApiKeyExists(false);
      }
    } catch (e) {
      setApiKeyExists(false);
    }

    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      try {
        const { name: sName, recentPosition: sPos, background: sBg } = JSON.parse(savedProfile);
        setName(sName || '');
        setRecentPosition(sPos || '');
        setBackground(sBg || '');
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
  }, []);

  const handleSaveProfile = () => {
    const profile = { name, recentPosition, background };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleClearProfile = () => {
    if (window.confirm("Are you sure you want to clear your saved profile?")) {
      localStorage.removeItem(STORAGE_KEY);
      setName('');
      setRecentPosition('');
      setBackground('');
    }
  };

  const handleGenerate = async () => {
    if (!background.trim() || !jobDescription.trim()) {
      setError('Please provide at least your background summary and the job description.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setResult('');

    try {
      const inputs: InputData = { name, recentPosition, background, companyName, targetPosition, jobDescription };
      const config: GenerationConfig = { length, style };
      const output = await generateCoverLetter(inputs, config);
      setResult(output);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = pageWidth - (margin * 2);
      doc.setFontSize(16);
      doc.text("Cover Letter", margin, margin);
      doc.setFontSize(11);
      const splitText = doc.splitTextToSize(result, textWidth);
      doc.text(splitText, margin, margin + 15);
      doc.save("cover-letter.pdf");
    } catch (e) {
      setError("Failed to generate PDF. You can still copy the text manually.");
    }
  };

  const loadingMessages = [
    "Analyzing your professional story...",
    "Aligning your skills with the company mission...",
    "Crafting a compelling narrative...",
    "Optimizing for recruiters' attention..."
  ];

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 lg:px-8">
      <header className="max-w-6xl mx-auto pt-12 pb-16 text-center">
        <div className="inline-flex items-center justify-center p-2 mb-4 bg-blue-50 rounded-2xl">
          <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
          <span className="text-blue-600 font-semibold tracking-wide uppercase text-xs">AI Powered Career Suite</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          AI <span className="text-gradient-tech">Cover Letter</span> Generator
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
          Hyper-personalized cover letters based on your unique experience and target role.
        </p>

        {!apiKeyExists && (
          <div className="mt-8 max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-800 text-left">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Missing API Key</p>
              <p>Please check your Vercel environment variables. The key <code className="bg-amber-100 px-1 rounded">API_KEY</code> is not being detected.</p>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-gray-800">
                  <div className="p-2 bg-blue-50 rounded-lg"><FileText className="w-5 h-5 text-blue-500" /></div>
                  <h2 className="text-xl font-semibold">Your Background</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={handleSaveProfile} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${profileSaved ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                    {profileSaved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{profileSaved ? 'Saved' : 'Save Profile'}</span>
                  </button>
                  <button onClick={handleClearProfile} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={User} label="Full Name" value={name} onChange={setName} placeholder="e.g. Jane Doe" />
                  <InputField icon={Award} label="Recent Position" value={recentPosition} onChange={setRecentPosition} placeholder="e.g. Senior UX Designer" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Experience & Skills Summary</label>
                  <textarea value={background} onChange={(e) => setBackground(e.target.value)} placeholder="Paste your resume content, key projects, or achievements..." className="w-full h-48 md:h-56 p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none text-gray-700 leading-relaxed" />
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center space-x-3 text-gray-800">
                <div className="p-2 bg-purple-50 rounded-lg"><Briefcase className="w-5 h-5 text-purple-500" /></div>
                <h2 className="text-xl font-semibold">Job Description</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={Building} label="Company or Recipient" value={companyName} onChange={setCompanyName} placeholder="e.g. Google or Hiring Manager" />
                  <InputField icon={Target} label="Position Applied For" value={targetPosition} onChange={setTargetPosition} placeholder="e.g. Lead Designer" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Job Description Content</label>
                  <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job requirements and responsibilities here..." className="w-full h-48 md:h-56 p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all resize-none text-gray-700 leading-relaxed" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:px-12 bg-gray-50/50 border-t border-gray-100 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Word Count</label>
                <div className="flex flex-wrap gap-3">
                  <PillButton label="50 words" isActive={length === LetterLength.VERY_SHORT} onClick={() => setLength(LetterLength.VERY_SHORT)} />
                  <PillButton label="100 words" isActive={length === LetterLength.SHORT} onClick={() => setLength(LetterLength.SHORT)} />
                  <PillButton label="200 words" isActive={length === LetterLength.STANDARD} onClick={() => setLength(LetterLength.STANDARD)} />
                  <PillButton label="500 words" isActive={length === LetterLength.FULL} onClick={() => setLength(LetterLength.FULL)} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tone & Style</label>
                <div className="flex flex-wrap gap-3">
                  {Object.values(LetterStyle).map((s) => (
                    <PillButton key={s} label={s} isActive={style === s} onClick={() => setStyle(s)} />
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm font-medium">{error}</div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !apiKeyExists}
                className={`relative overflow-hidden group px-12 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 bg-gradient-tech shadow-lg hover:shadow-xl hover:shadow-blue-200 transform active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
              >
                <span className="flex items-center space-x-2">
                  {isGenerating ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /><span>Generating...</span></>
                  ) : (
                    <><Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /><span>Generate Cover Letter</span></>
                  )}
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        {(isGenerating || result) && (
          <div className="mt-12 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-xl border border-gray-100 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-2 h-8 bg-gradient-tech rounded-full mr-4" />
                  Your Tailored Cover Letter
                </h3>
                {result && !isGenerating && (
                  <div className="flex items-center space-x-3 flex-wrap">
                    <button onClick={handleGenerate} className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-50 transition-all active:scale-95">
                      <RefreshCw className="w-4 h-4" /><span className="text-sm font-semibold">Regenerate</span>
                    </button>
                    <button onClick={handleCopy} className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-500 transition-all active:bg-blue-50">
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      <span className="text-sm font-medium">{copied ? 'Copied' : 'Copy Text'}</span>
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-500 transition-all">
                      <Download className="w-4 h-4" /><span className="text-sm font-medium">PDF</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="relative min-h-[300px]">
                {isGenerating ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative w-16 h-16">
                           <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                           <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-blue-600 font-medium italic animate-pulse text-center">
                          {loadingMessages[Math.floor(Date.now() / 2000) % loadingMessages.length]}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed text-lg font-light">{result}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="max-w-6xl mx-auto mt-20 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} AI Cover Letter Generator. Crafted for professional excellence.</p>
      </footer>
    </div>
  );
};

export default App;
