"use client";

import { X, Upload, FileText, CheckCircle2, ChevronDown, Clock, History, ArrowLeft, Loader2, Check, FolderOpen, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/shared/Toast";

const PAST_RUNS_MOCK = [
    { id: 1, client: "Stark Industries Pro", period: "midyear 2025", timestamp: "20/02/2026, 01:19:24", documents: ["QBO Paystub.pdf"], status: "SUCCESS" },
    { id: 2, client: "Randy", period: "midyear 2025", timestamp: "20/02/2026, 01:17:36", documents: ["QBO Paystub.pdf"], status: "SUCCESS" },
    { id: 3, client: "Randy", period: "midyear 2025", timestamp: "20/02/2026, 01:11:22", documents: ["QBO Paystub.pdf"], status: "SUCCESS" }
];

export function TaxIntakeForm() {
    const { toast } = useToast();
    const [view, setView] = useState<'intake' | 'history' | 'processing'>('intake');
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [period, setPeriod] = useState("");
    const [year, setYear] = useState(2025);
    const [persons, setPersons] = useState([
        { id: 1, docs: { paystub: { provider: "", file: null }, k1: { type: "", file: null }, prior1040: { file: null } } }
    ]);
    const [processingStep, setProcessingStep] = useState(0); // 0 to 4
    const steps = ["Uploading", "Processing", "Extracting", "Linking", "Complete"];

    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('client_id, name').order('name');
            if (data) setClients(data);
        };
        fetchClients();
    }, []);

    const handleAddPerson = () => {
        setPersons([...persons, { id: persons.length + 1, docs: { paystub: { provider: "", file: null }, k1: { type: "", file: null }, prior1040: { file: null } } }]);
    };

    const handleFileUpload = (personId: number, category: string, file: File) => {
        setPersons(persons.map(p => {
            if (p.id === personId) {
                return {
                    ...p,
                    docs: {
                        ...p.docs,
                        [category]: { ...p.docs[category as keyof typeof p.docs], file }
                    }
                };
            }
            return p;
        }));
    };

    const handleSubmit = async () => {
        if (!selectedClient) {
            toast("Please select a client to continue.", "error");
            return;
        }
        setView('processing');
        setProcessingStep(0);

        // Simulate processing steps
        for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 1500));
            setProcessingStep(i);
            if (i === 1) toast("Documents submitted", "info");
            if (i === 3) toast('Project created: "Tax Return 2025"', "success");
        }
    };

    if (view === 'processing') {
        const currentClientName = clients.find(c => c.client_id === selectedClient)?.name || "Target Client";
        return (
            <div className="flex h-[700px] bg-white border border-border animate-in fade-in duration-500 overflow-hidden">
                {/* Sidebar Progress */}
                <div className="w-32 bg-black flex flex-col items-center py-10 relative">
                    <div className="absolute top-10 bottom-10 w-px bg-white/20 left-1/2 -translate-x-1/2" />
                    <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
                        {steps.map((s, i) => (
                            <div key={s} className="flex flex-col items-center gap-2">
                                <div className={`w-3 h-3 rounded-none border-2 transition-all duration-500 ${processingStep >= i ? 'bg-white border-white' : 'bg-black border-white/40'
                                    }`} />
                                <span className={`text-[9px] font-black tracking-[0.2em] transition-all duration-500 ${processingStep >= i ? 'text-white' : 'text-white/30'
                                    }`}>{s.toUpperCase()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-12 overflow-y-auto relative">
                    <button onClick={() => setView('intake')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-muted hover:text-primary mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to form
                    </button>

                    <h2 className="font-serif text-4xl font-bold text-primary mb-4 tracking-tight">
                        {processingStep === 4 ? "Processing Complete" : "Processing Documents"}
                    </h2>

                    {processingStep === 4 ? (
                        <div className="flex items-center gap-2 text-alert-green mb-10 animate-in fade-in slide-in-from-left-2 transition-all">
                            <Check className="w-4 h-4" />
                            <span className="text-[11px] font-bold">{persons.length} document(s) uploaded for {currentClientName}.</span>
                        </div>
                    ) : (
                        <p className="text-[11px] font-bold text-primary-opacity text-primary/60 mb-10">
                            Analyzing documents and extracting data...
                        </p>
                    )}

                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-primary-muted uppercase tracking-[0.2em] mb-4 opacity-50">Upload Status</label>
                            <div className="bg-surface border border-border p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <FileText className="w-5 h-5 text-primary-muted" />
                                    <div>
                                        <div className="text-[13px] font-bold text-primary">QBO Paystub.pdf</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-primary-muted opacity-50">DOCUMENT PROCESSING</div>
                                    </div>
                                </div>
                                {processingStep < 4 ? (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-alert-orange/10 border border-alert-orange/20">
                                        <Loader2 className="w-3 h-3 text-alert-orange animate-spin" />
                                        <span className="text-[9px] font-black text-alert-orange uppercase tracking-widest">Processing</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-alert-green/10 border border-alert-green/20">
                                        <Check className="w-3 h-3 text-alert-green" />
                                        <span className="text-[9px] font-black text-alert-green uppercase tracking-widest">Success</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-border w-full" />

                        <div>
                            <label className="block text-[10px] font-black text-primary-muted uppercase tracking-[0.2em] mb-4 opacity-50">Recent Activity</label>
                            <div className="space-y-4">
                                {PAST_RUNS_MOCK.map(run => (
                                    <div key={run.id} className="border border-border p-6 flex flex-col gap-4 hover:bg-surface-muted/10 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-[14px] font-bold text-primary underline underline-offset-4 decoration-border">{run.client} <span className="no-underline text-primary-muted font-normal text-xs ml-2">— {run.period}</span></div>
                                                <div className="text-[10px] font-bold text-primary-muted mt-1 opacity-60">{run.timestamp}</div>
                                            </div>
                                            <span className="px-2 py-0.5 bg-alert-green/10 text-alert-green text-[9px] font-black uppercase tracking-widest border border-alert-green/20">Success</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {processingStep === 4 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-12 left-0 right-0 px-12 flex justify-center gap-4"
                        >
                            <button className="bg-black text-white px-10 py-3 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl hover:bg-gray-800 transition-all">
                                <FolderOpen className="w-4 h-4" /> View Documents
                            </button>
                            <button onClick={() => setView('intake')} className="bg-white border border-border text-primary px-10 py-3 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-surface-muted transition-all">
                                Done
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    if (view === 'history') {
        return (
            <div className="p-12 animate-in fade-in duration-500 min-h-[600px]">
                <button onClick={() => setView('intake')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-muted hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to form
                </button>
                <h2 className="font-serif text-4xl font-bold text-primary mb-2 tracking-tight">Submission History</h2>
                <p className="text-[11px] font-bold text-primary-muted mb-12">Reviewing past document uploads and processing records.</p>

                <div className="space-y-6">
                    <label className="block text-[10px] font-black text-primary-muted uppercase tracking-[0.2em] mb-4 opacity-50">Past Sessions</label>
                    {PAST_RUNS_MOCK.map(run => (
                        <div key={run.id} className="border border-border p-8 flex flex-col gap-6 hover:bg-surface-muted/10 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xl font-bold text-primary underline underline-offset-8 decoration-border/50">{run.client} <span className="no-underline text-primary-muted font-normal text-sm ml-4 opacity-60">— {run.period}</span></div>
                                    <div className="text-[10px] font-bold text-primary-muted mt-3 opacity-60">{run.timestamp}</div>
                                </div>
                                <span className="px-3 py-1 bg-alert-green/10 text-alert-green text-[10px] font-black uppercase tracking-widest border border-alert-green/20">Success</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <h2 className="font-serif text-4xl font-bold text-primary tracking-tight">Tax Document Intake</h2>
                <button
                    onClick={() => setView('history')}
                    className="flex items-center gap-2 px-5 py-2.5 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface-muted transition-all"
                >
                    <History className="w-4 h-4" /> View History
                </button>
            </div>

            {/* Form Body */}
            <div className="space-y-12 max-w-2xl">
                {/* Client Select */}
                <div>
                    <label className="block text-[10px] font-black text-primary-muted uppercase tracking-[0.3em] mb-4 opacity-50">Select Client</label>
                    <div className="relative group">
                        <select
                            value={selectedClient}
                            onChange={e => setSelectedClient(e.target.value)}
                            className="w-full text-xl font-bold bg-transparent border-b border-border py-4 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer group-hover:border-primary/50"
                        >
                            <option value="">Choose a client...</option>
                            {clients.map(c => <option key={c.client_id} value={c.client_id}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-primary-muted pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Period & Year */}
                <div className="grid grid-cols-2 gap-12">
                    <div>
                        <label className="block text-[10px] font-black text-primary-muted uppercase tracking-[0.3em] mb-4 opacity-50">Period</label>
                        <div className="relative">
                            <select
                                value={period}
                                onChange={e => setPeriod(e.target.value)}
                                className="w-full text-lg font-bold bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Select period...</option>
                                <option value="MIDYEAR">Mid-Year</option>
                                <option value="EOY">End of Year</option>
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-muted pointer-events-none opacity-40" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-primary-muted uppercase tracking-[0.3em] mb-4 opacity-50">Tax Year</label>
                        <div className="relative">
                            <select
                                value={year}
                                onChange={e => setYear(Number(e.target.value))}
                                className="w-full text-lg font-bold bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                            >
                                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-muted pointer-events-none opacity-40" />
                        </div>
                    </div>
                </div>

                {/* Person Cards */}
                <div className="space-y-12">
                    {persons.map((person, pIdx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={person.id}
                            className="bg-surface-muted/10 border border-border p-10 space-y-10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-7 h-7 bg-black text-white rounded-none flex items-center justify-center text-[10px] font-black">{person.id}</div>
                                <h3 className="font-serif text-2xl font-light text-primary">Person {person.id} Details</h3>
                            </div>

                            {/* Paystub Section */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-primary-muted uppercase tracking-[0.2em] opacity-50">Paystub (Optional)</label>
                                <div className="relative">
                                    <select className="w-full text-[13px] font-bold bg-white border border-border p-3 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                                        <option value="">Select payroll provider...</option>
                                        <option value="GUSTO">Gusto</option>
                                        <option value="ADP">ADP</option>
                                        <option value="PAYCHEX">Paychex</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-muted pointer-events-none opacity-40" />
                                </div>
                                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border py-12 cursor-pointer hover:bg-surface-muted/50 transition-all group">
                                    <Upload className="w-5 h-5 text-primary-muted group-hover:text-primary transition-colors" />
                                    <span className="text-[13px] font-bold text-primary opacity-60">Upload File</span>
                                    <input type="file" className="hidden" />
                                </label>
                            </div>

                            {/* K-1 Section */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-primary-muted uppercase tracking-[0.2em] opacity-50">K-1 Schedule (Optional)</label>
                                <div className="relative">
                                    <select className="w-full text-[13px] font-bold bg-white border border-border p-3 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                                        <option value="">Select form type...</option>
                                        <option value="1065">1065 (Partnership)</option>
                                        <option value="1120S">1120S (S-Corp)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-muted pointer-events-none opacity-40" />
                                </div>
                                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border py-12 cursor-pointer hover:bg-surface-muted/50 transition-all group">
                                    <Upload className="w-5 h-5 text-primary-muted group-hover:text-primary transition-colors" />
                                    <span className="text-[13px] font-bold text-primary opacity-60">Upload File</span>
                                    <input type="file" className="hidden" />
                                </label>
                            </div>

                            {/* Prior 1040 Section */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-primary-muted uppercase tracking-[0.2em] opacity-50">Prior Year 1040 (Optional)</label>
                                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border py-12 cursor-pointer hover:bg-surface-muted/50 transition-all group">
                                    <Upload className="w-5 h-5 text-primary-muted group-hover:text-primary transition-colors" />
                                    <span className="text-[13px] font-bold text-primary opacity-60">Upload Pages 1-2</span>
                                    <input type="file" className="hidden" />
                                </label>
                            </div>
                        </motion.div>
                    ))}

                    <button
                        onClick={handleAddPerson}
                        className="w-full py-5 border border-border text-[11px] font-black uppercase tracking-[0.3em] hover:bg-surface-muted transition-all"
                    >
                        + Add Taxpayer
                    </button>
                </div>

                {/* Final Action */}
                <div className="pt-8">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-5 bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-gray-800 transition-all"
                    >
                        Submit Documents
                    </button>
                </div>
            </div>
        </div>
    );
}
