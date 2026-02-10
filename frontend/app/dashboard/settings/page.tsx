"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Plus, Save, Trash2, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type PatientProfile = {
    name: string;
    age: string;
    allergies: string[];
    conditions: string[];
};

const COMMON_ALLERGIES = ["Penicillin", "Sulfa drugs", "Aspirin", "Ibuprofen", "Codeine", "Latex"];
const COMMON_CONDITIONS = ["Diabetes", "Hypertension", "Hypoglycemia", "Asthma", "Heart Disease", "Kidney Disease"];

export default function SettingsPage() {
    const [profile, setProfile] = useState<PatientProfile>({
        name: "",
        age: "",
        allergies: [],
        conditions: [],
    });

    const [newAllergy, setNewAllergy] = useState("");
    const [newCondition, setNewCondition] = useState("");
    const [isSaved, setIsSaved] = useState(false);

    const addAllergy = (allergy: string) => {
        if (allergy && !profile.allergies.includes(allergy)) {
            setProfile({ ...profile, allergies: [...profile.allergies, allergy] });
            setNewAllergy("");
            setIsSaved(false);
        }
    };

    const removeAllergy = (allergy: string) => {
        setProfile({ ...profile, allergies: profile.allergies.filter((a) => a !== allergy) });
        setIsSaved(false);
    };

    const addCondition = (condition: string) => {
        if (condition && !profile.conditions.includes(condition)) {
            setProfile({ ...profile, conditions: [...profile.conditions, condition] });
            setNewCondition("");
            setIsSaved(false);
        }
    };

    const removeCondition = (condition: string) => {
        setProfile({ ...profile, conditions: profile.conditions.filter((c) => c !== condition) });
        setIsSaved(false);
    };

    const handleSave = () => {
        // In production, this would save to a backend/localStorage
        localStorage.setItem("patientProfile", JSON.stringify(profile));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
                <p className="text-muted-foreground">
                    Manage your health profile for personalized medicine safety alerts.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Enter your name"
                                value={profile.name}
                                onChange={(e) => { setProfile({ ...profile, name: e.target.value }); setIsSaved(false); }}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Age</label>
                            <input
                                type="number"
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Enter your age"
                                value={profile.age}
                                onChange={(e) => { setProfile({ ...profile, age: e.target.value }); setIsSaved(false); }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Allergies */}
                <Card className="border-destructive/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Known Allergies
                        </CardTitle>
                        <CardDescription>
                            Add any drug allergies for safety warnings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {profile.allergies.map((allergy) => (
                                <span
                                    key={allergy}
                                    className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive"
                                >
                                    {allergy}
                                    <button onClick={() => removeAllergy(allergy)} className="ml-1 hover:text-destructive/80">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                            {profile.allergies.length === 0 && (
                                <span className="text-sm text-muted-foreground">No allergies added</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Add custom allergy..."
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addAllergy(newAllergy)}
                            />
                            <Button size="icon" variant="outline" onClick={() => addAllergy(newAllergy)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {COMMON_ALLERGIES.filter((a) => !profile.allergies.includes(a)).map((allergy) => (
                                <button
                                    key={allergy}
                                    onClick={() => addAllergy(allergy)}
                                    className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-secondary transition-colors"
                                >
                                    + {allergy}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Conditions */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Existing Medical Conditions</CardTitle>
                        <CardDescription>
                            These help identify potential drug interactions and health risks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {profile.conditions.map((condition) => (
                                <span
                                    key={condition}
                                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                                >
                                    {condition}
                                    <button onClick={() => removeCondition(condition)} className="ml-1 hover:text-destructive">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                            {profile.conditions.length === 0 && (
                                <span className="text-sm text-muted-foreground">No conditions added</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Add custom condition..."
                                value={newCondition}
                                onChange={(e) => setNewCondition(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addCondition(newCondition)}
                            />
                            <Button size="icon" variant="outline" onClick={() => addCondition(newCondition)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {COMMON_CONDITIONS.filter((c) => !profile.conditions.includes(c)).map((condition) => (
                                <button
                                    key={condition}
                                    onClick={() => addCondition(condition)}
                                    className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-secondary transition-colors"
                                >
                                    + {condition}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} size="lg" className={cn(isSaved && "bg-green-600 hover:bg-green-700")}>
                    {isSaved ? "Saved!" : <><Save className="mr-2 h-4 w-4" /> Save Profile</>}
                </Button>
            </div>
        </div>
    );
}
