"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, FileText, CheckCircle, AlertTriangle, Clock, ShieldAlert, Pill } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Medicine = {
    name: string;
    dosage?: string;
    frequency?: string;
    original_text?: string;
};

type Alert = {
    type: string;
    severity: string;
    medicine: string;
    message: string;
};

type ScheduleItem = {
    medicine: string;
    dosage: string;
    times: string[];
    duration: string;
};

type PatientProfile = {
    name: string;
    age: string;
    allergies: string[];
    conditions: string[];
};

export default function PrescriptionPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [riskData, setRiskData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);

    // Load patient profile from localStorage
    useEffect(() => {
        const savedProfile = localStorage.getItem("patientProfile");
        if (savedProfile) {
            setPatientProfile(JSON.parse(savedProfile));
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
            setRiskData(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
            setResult(null);
            setRiskData(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Step 1: OCR Analysis
            const response = await fetch("http://localhost:8000/analyze_prescription", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Failed to analyze prescription");
            }

            const data = await response.json();
            setResult(data);

            // Step 2: Risk Analysis (if we have medicines and patient profile)
            if (data.medicines && data.medicines.length > 0) {
                const profile = patientProfile || { allergies: [], conditions: [] };

                const riskResponse = await fetch("http://localhost:8000/analyze_risks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        medicines: data.medicines,
                        patient_profile: profile,
                    }),
                });

                if (riskResponse.ok) {
                    const riskResult = await riskResponse.json();
                    setRiskData(riskResult);
                }
            }
        } catch (err: any) {
            setError(err.message || "Error processing prescription. Please try again.");
            console.error(err);
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Prescription Analysis</h1>
                <p className="text-muted-foreground">
                    Upload a clear image of the prescription to digitize and verify medicines.
                </p>
            </div>

            {/* Patient Profile Status */}
            {!patientProfile && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="h-5 w-5" />
                    <div className="flex-1">
                        <p className="font-medium">No patient profile found</p>
                        <p className="text-sm opacity-80">Set up your profile in Settings to get personalized safety alerts.</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-amber-300" onClick={() => window.location.href = "/dashboard/settings"}>
                        Setup Profile
                    </Button>
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Upload Section */}
                <Card className="h-fit border-muted/50 shadow-md">
                    <CardHeader>
                        <CardTitle>Upload Image</CardTitle>
                        <CardDescription>Supported formats: JPEG, PNG</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className={cn(
                                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-secondary/50",
                                file ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                            )}
                        >
                            <input
                                type="file"
                                id="prescription-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            {!file ? (
                                <label htmlFor="prescription-upload" className="flex flex-col items-center cursor-pointer">
                                    <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                        <Upload className="h-7 w-7" />
                                    </div>
                                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                                    <span className="text-xs text-muted-foreground mt-1">Maximum file size 5MB</span>
                                </label>
                            ) : (
                                <div className="relative w-full">
                                    <div className="flex items-center gap-4 bg-background p-4 rounded-lg border shadow-sm">
                                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            className="w-full mt-6"
                            size="lg"
                            onClick={handleAnalyze}
                            disabled={!file || isUploading}
                        >
                            {isUploading ? "Analyzing..." : "Analyze Prescription"}
                        </Button>

                        {error && (
                            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="space-y-6">
                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Medicines Card */}
                            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" /> Extracted Medicines
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {result.medicines?.map((med: Medicine, i: number) => (
                                            <li key={i} className="bg-background p-4 rounded-lg border text-sm shadow-sm">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-2 flex-1">
                                                        <Pill className="h-4 w-4 text-primary mt-0.5" />
                                                        <div>
                                                            <span className="font-medium">{med.name}</span>
                                                            {med.original_text && med.original_text !== med.name && (
                                                                <p className="text-xs text-muted-foreground mt-1">Original: {med.original_text}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                                                            {med.dosage || "As directed"}
                                                        </span>
                                                        {med.frequency && (
                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                                {med.frequency}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                        {!result.medicines?.length && (
                                            <li className="text-sm text-muted-foreground p-3">No medicines clearly identified.</li>
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Risk Alerts */}
                            {riskData?.risk_analysis?.alerts?.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <Card className="border-destructive/30 bg-gradient-to-br from-destructive/5 to-transparent">
                                        <CardHeader>
                                            <CardTitle className="text-destructive flex items-center gap-2">
                                                <ShieldAlert className="h-5 w-5" /> Safety Alerts
                                            </CardTitle>
                                            <CardDescription>Based on your health profile</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {riskData.risk_analysis.alerts.map((alert: Alert, i: number) => (
                                                    <li
                                                        key={i}
                                                        className={cn(
                                                            "p-3 rounded-lg border text-sm",
                                                            alert.severity === "high"
                                                                ? "bg-destructive/10 border-destructive/30 text-destructive"
                                                                : alert.severity === "medium"
                                                                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                                                                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                                                        )}
                                                    >
                                                        {alert.message}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Schedule */}
                            {riskData?.schedule?.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-primary" /> Medicine Schedule
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left py-2 font-medium text-muted-foreground">Medicine</th>
                                                            <th className="text-left py-2 font-medium text-muted-foreground">Dosage</th>
                                                            <th className="text-left py-2 font-medium text-muted-foreground">Timing</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {riskData.schedule.map((item: ScheduleItem, i: number) => (
                                                            <tr key={i} className="border-b border-muted/50">
                                                                <td className="py-3 font-medium">{item.medicine}</td>
                                                                <td className="py-3 text-muted-foreground">{item.dosage}</td>
                                                                <td className="py-3">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {item.times.map((time, j) => (
                                                                            <span key={j} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                                                                                {time}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Raw Text (Collapsed) */}
                            <details className="group">
                                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    View Raw OCR Text
                                </summary>
                                <pre className="mt-2 text-xs bg-muted/50 p-3 rounded-md whitespace-pre-wrap max-h-40 overflow-auto border">
                                    {result.raw_text}
                                </pre>
                            </details>
                        </motion.div>
                    ) : (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-muted rounded-xl bg-muted/10">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground/50">
                                <FileText className="h-8 w-8" />
                            </div>
                            <h3 className="font-medium text-lg">No Analysis Yet</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mt-2">
                                Upload a prescription image to see extraction results here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
