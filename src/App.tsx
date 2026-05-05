import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Activity,
  ChevronRight,
  ClipboardList,
  Loader2,
  Download,
  Copy,
  ShieldCheck,
  Globe,
  Users,
  MapPin
} from 'lucide-react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { generateClinicalSummary, type StructuredClinicalSummary } from './services/geminiService';
import { cn, stripPII } from './lib/utils';
import { exportToPDF } from './services/pdfService';
import { BodyMap } from './components/BodyMap';

export default function App() {
  const [input, setInput] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<StructuredClinicalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [missingKey, setMissingKey] = useState(false);

  useEffect(() => {
    if (!process.env.GEMINI_API_KEY) {
      setMissingKey(true);
    }
  }, []);

  const handleSelectRegion = (regionName: string) => {
    setSelectedRegions(prev => 
      prev.includes(regionName) 
        ? prev.filter(r => r !== regionName) 
        : [...prev, regionName]
    );
  };

  const handleCopy = () => {
    if (!summary) return;
    const text = `
Clinical Preparation Summary
Patient Narrative: ${summary.patientNarrative}
Symptom Profile:
- Subjective: ${summary.symptomProfile.subjective}
- Observed: ${summary.symptomProfile.observed}
- Associated: ${summary.symptomProfile.associated}
- Progression: ${summary.symptomProfile.progression}
Clinical Terms: ${summary.clinicalTerminology.map(t => `${t.term} (${t.definition})`).join(', ')}
Doctor Questions: ${summary.doctorsQuestions.join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      // Step 1: PII Stripping
      const sanitizedDescription = stripPII(input);
      const combinedInput = `Affected Areas: ${selectedRegions.join(', ') || 'General'}. \nDescription: ${sanitizedDescription}`;
      
      // Step 2: API Call
      const result = await generateClinicalSummary(combinedInput);
      setSummary(result);
    } catch (err) {
      console.error(err);
      setError('Failed to process your request. Please try again with more details.');
    } finally {
      setLoading(false);
    }
  };

  const Disclaimer = ({ className }: { className?: string }) => (
    <div className={cn("p-4 rounded-lg bg-blue-50 border border-blue-100 flex gap-3 items-start", className)}>
      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
      <p className="text-sm text-blue-800 font-bold">
        This is a preparation tool, not medical advice or a diagnosis.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-semibold text-xl tracking-tight text-slate-800">ClinicalDoc Assistant</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              Private & Encrypted
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Input Section */}
          <section className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                Structure Your <span className="text-blue-600">Symptom History</span>
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Empower your next healthcare visit with structured, professional data. All data is processed in-session and never stored.
              </p>
            </div>

            <Disclaimer />

            {missingKey && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2"
              >
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  API Key Required for Clinical Engine
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  If you are seeing this on <strong>Netlify</strong>, ensure you have added <code>GEMINI_API_KEY</code> to your site's "Environment Variables" in the Netlify dashboard.
                </p>
              </motion.div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex gap-6 items-start">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Step 1: Point to Pain</span>
                  </div>
                  <BodyMap onSelectRegion={handleSelectRegion} selectedRegions={selectedRegions} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Selected Areas</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegions.length > 0 ? (
                      selectedRegions.map(r => (
                        <span key={r} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">No regions selected</span>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Step 2: Describe Feelings</span>
                </div>
                <div className="relative group">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., I've been having this weird tingling in my left hand for about 3 days. It's mostly when I'm typing..."
                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-700 leading-relaxed placeholder:text-slate-400 text-sm"
                  />
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Automatic PII Scrubbing Active
                    </div>
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className={cn(
                        "px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all shadow-md active:scale-95",
                        input.trim() && !loading
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                      )}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Process Summary
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 text-red-700 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-white tracking-tight">Zero-Storage Privacy</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Your medical narrative is sensitive. We use a "stateless" architecture—data is Scrubbed of identifiers (names, emails, phones) locally, passed to our AI for structuring, and then held only in your browser's temporary memory. Once you close this tab, the data is gone forever.
              </p>
            </div>
          </section>

          {/* Output Section */}
          <section className="lg:col-span-3 min-h-[600px]">
            <AnimatePresence mode="wait">
              {summary ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  {/* Actions Header */}
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Generated Report</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleCopy}
                        className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-medium"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy Text'}
                      </button>
                      <button 
                        onClick={() => exportToPDF(summary)}
                        className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors flex items-center gap-2 text-xs font-medium shadow-lg shadow-blue-200"
                      >
                        <Download className="w-4 h-4" />
                        Save as PDF
                      </button>
                    </div>
                  </div>

                  {/* Patient Narrative */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-blue-600">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-xs">Patient Narrative Summary</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-lg text-slate-700 leading-relaxed font-serif italic">
                        "{summary.patientNarrative}"
                      </p>
                    </div>
                  </div>

                  {/* Symptom Profile (SOAP-adjacent) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Subjective Report', key: 'subjective', icon: Activity, color: 'text-amber-600' },
                      { label: 'Observation/Duration', key: 'observed', icon: ClipboardList, color: 'text-emerald-600' },
                      { label: 'Associated Factors', key: 'associated', icon: CheckCircle2, color: 'text-blue-600' },
                      { label: 'Progression', key: 'progression', icon: ChevronRight, color: 'text-purple-600' }
                    ].map((item) => (
                      <div key={item.key} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                          <item.icon className={cn("w-4 h-4", item.color)} />
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.label}</h4>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {summary.symptomProfile[item.key as keyof typeof summary.symptomProfile]}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Clinical Terminology with Tooltips */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-xs">Glossary: Relevant Clinical Focus</h3>
                      <span className="text-[10px] text-slate-400 italic">Hover for simple definitions</span>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {summary.clinicalTerminology.map((termObj, i) => (
                          <Tippy key={i} content={termObj.definition} theme="light-border">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100 cursor-help hover:bg-blue-100 transition-colors">
                              {termObj.term}
                            </span>
                          </Tippy>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Doctor's Questions */}
                  <div className="bg-blue-600 rounded-2xl shadow-xl overflow-hidden text-white">
                    <div className="bg-blue-700/50 px-6 py-4 border-b border-white/10 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-200" />
                      <h3 className="font-semibold uppercase tracking-wider text-xs text-blue-100">Prepare for your Physician</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {summary.doctorsQuestions.map((q, i) => (
                        <div key={i} className="flex gap-4 items-start pb-4 border-b border-white/10 last:border-0 last:pb-0">
                          <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs font-bold text-blue-200">
                            {i + 1}
                          </span>
                          <p className="text-blue-50 leading-snug">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Disclaimer className="bg-slate-100 border-slate-200 text-slate-500" />
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="p-4 bg-slate-50 rounded-full">
                    <ClipboardList className="w-12 h-12 text-slate-200" />
                  </div>
                  <div className="max-w-xs">
                    <p className="font-medium text-slate-500 text-lg">Report Preview</p>
                    <p className="text-sm">Complete the intake form to transform your symptom description into a professional clinical summary ready for your doctor.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-24">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-600 rounded">
                 <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight uppercase">ClinicalDoc Assistant</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">
              Bridging the gap between patient narratives and professional documentation. Our tool is designed solely as an organizational aid for doctor visits.
            </p>
            <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
               <a href="#" className="hover:text-blue-600">Privacy Policy</a>
               <a href="#" className="hover:text-blue-600">Terms of Service</a>
               <a href="#" className="hover:text-blue-600">Medical Review Process</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              About Us
            </h4>
            <ul className="text-sm text-slate-500 space-y-2">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Reputable Sources
            </h4>
            <ul className="text-sm text-slate-500 space-y-2">
              <li><a href="https://www.mayoclinic.org" target="_blank" className="hover:text-blue-600 transition-colors">Mayo Clinic</a></li>
              <li><a href="https://www.webmd.com" target="_blank" className="hover:text-blue-600 transition-colors">WebMD</a></li>
              <li><a href="https://www.cdc.gov" target="_blank" className="hover:text-blue-600 transition-colors">CDC Health Resources</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 py-8 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 leading-relaxed text-center">
            <strong>Medical Disclaimer:</strong> The information provided by ClinicalDoc Assistant is for informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this website.
          </p>
        </div>
      </footer>
    </div>
  );
}
