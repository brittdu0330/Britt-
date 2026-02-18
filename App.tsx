import React, { useState, useEffect } from 'react';
import { Copy, Download, Sparkles, Send, FileText, Briefcase, RefreshCw, CheckCircle, User, Award, Building, Target, Save, Trash2, AlertCircle } from 'lucide-react';
import { LetterLength, LetterStyle, InputData, GenerationConfig } from './types.ts';
import { generateCoverLetter } from './services/geminiService.ts';
import PillButton from './components/PillButton.tsx';
// @ts-ignore
import { jsPDF } from "jspdf";

const STORAGE_KEY = 'ai_cover_letter_user_profile_v3';

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
    const checkKeyAvailability = () => {
      try {
        const key = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                    (window as any).process?.env?.API_KEY;
        setApiKeyExists(!!key);
      } catch (e) {
        setApiKeyExists(false);
      }
    };
    
    checkKeyAvailability();

    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setName(parsed.name || '');
        setRecentPosition(parsed.recentPosition || '');
        setBackground(parsed.background || '');
      } catch (e) {
        console.warn("Storage profile load failed:", e);
      }
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, recentPosition, background }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleClearProfile = () => {
    if (confirm("Clear your saved professional profile?")) {
      localStorage.removeItem(STORAGE_KEY);
      setName(''); setRecentPosition(''); setBackground('');
    }
  };

  const handleGenerate = async () => {
    if (!background.trim() || !jobDescription.trim()) {
      setError('Please fill out your background and the job requirements.');
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
      setError(err.message || 'The AI service encountered an issue.');
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
      doc.setFontSize(16).text("Professional Cover Letter", margin, margin);
      doc.setFontSize(11).text(doc.splitTextToSize(result, textWidth), margin, margin + 15);
      doc.save("cover-letter.pdf");
    } catch (e) {
      setError("Unable to generate PDF file.");
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 lg:px-8">
      <header className="max-w-6xl mx-auto pt-12 pb-16 text-center">
        <div className="inline-flex items-center justify-center p-2 mb-4 bg-blue-50 rounded-2xl">
          <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
          <span className="text-blue-600 font-semibold uppercase text-xs tracking-wider">AI Career Assistant</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Tailored <span className="text-gradient-tech">Cover Letters</span> <br/> in Seconds
        </h1>
        
        {!apiKeyExists && (
          <div className="mt-8 max-w-lg mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start text-amber-800 text-left shadow-sm">
            <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 text-amber-500" />
            <div className="text-sm">
              <p className="font-bold mb-1">Service Key Unavailable</p>
              <p>The application could not find the required API credentials. If you are using Vercel, please check your Environment Variables for <code className="bg-amber-100 px-1 rounded font-mono">API_KEY</code>.</p>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100/50 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Your Identity</h2>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleSaveProfile} className={`p-2.5 rounded-xl transition-all ${profileSaved ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`} title="Save profile locally">
                    {profileSaved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                  </button>
                  <button onClick={handleClearProfile} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Reset profile">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={User} label="Full Name" value={name} onChange={setName} placeholder="Jane Smith" />
                  <InputField icon={Award} label="Current Role" value={recentPosition} onChange={setRecentPosition} placeholder="Senior Developer" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-500">Your Experience Summary</label>
                  <textarea 
                    value={background} 
                    onChange={e => setBackground(e.target.value)} 
                    placeholder="Briefly describe your core strengths, achievements, and technical expertise..." 
                    className="w-full h-56 p-5 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all resize-none text-gray-700" 
                  />
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100/50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Target Opportunity</h2>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={Building} label="Company" value={companyName} onChange={setCompanyName} placeholder="TechCorp Inc." />
                  <InputField icon={Target} label="Target Position" value={targetPosition} onChange={setTargetPosition} placeholder="Engineering Lead" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-500">Job Description</label>
                  <textarea 
                    value={jobDescription} 
                    onChange={e => setJobDescription(e.target.value)} 
                    placeholder="Paste the key requirements and description of the role you are applying for..." 
                    className="w-full h-56 p-5 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all resize-none text-gray-700" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50/80 border-t border-gray-100 space-y-8">
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 space-y-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Desired Word Count</p>
                <div className="flex flex-wrap gap-2.5">
                  {Object.values(LetterLength).map(l => (
                    <PillButton key={l} label={`${l} words`} isActive={length === l} onClick={() => setLength(l)} />
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Writing Tone</p>
                <div className="flex flex-wrap gap-2.5">
                  {Object.values(LetterStyle).map(s => (
                    <PillButton key={s} label={s} isActive={style === s} onClick={() => setStyle(s)} />
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-[20px] flex space-x-4 items-center shadow-sm">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !apiKeyExists}
              className="w-full py-5 rounded-[24px] font-bold text-xl text-white bg-gradient-tech shadow-xl shadow-blue-200/50 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all flex justify-center items-center space-x-3 group"
            >
              {isGenerating ? (
                <><RefreshCw className="animate-spin w-6 h-6" /><span>Drafting...</span></>
              ) : (
                <><Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /><span>Create My Cover Letter</span></>
              )}
            </button>
          </div>
        </div>

        {result && !isGenerating && (
          <div className="mt-16 bg-white rounded-[40px] p-8 lg:p-14 shadow-2xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-gradient-tech rounded-full" />
                <h3 className="text-3xl font-extrabold text-gray-900">Your Tailored Draft</h3>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={handleCopy} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all font-semibold text-gray-700 active:bg-gray-100">
                  {copied ? <CheckCircle className="text-green-500 w-5 h-5" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
                <button onClick={handleDownloadPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all font-semibold text-gray-700 active:bg-gray-100">
                  <Download className="w-5 h-5 text-gray-400" />
                  PDF
                </button>
              </div>
            </div>
            <div className="prose prose-lg prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed font-light italic bg-gray-50/30 p-8 rounded-[32px] border border-gray-50">
              {result}
            </div>
          </div>
        )}
      </main>
      
      <footer className="max-w-6xl mx-auto mt-24 text-center">
        <p className="text-gray-400 text-sm font-medium">© {new Date().getFullYear()} AI Cover Letter Generator. Built for the modern job seeker.</p>
      </footer>
    </div>
  );
};

export default App;