"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, X, Edit3, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

interface Setup {
    id: string;
    name: string;
    description: string;
    checklist: string[];
}

export default function SetupsClient({ initialSetups }: { initialSetups: Setup[] }) {
    const supabase = createClient();
    const router = useRouter();
    const { addToast } = useToast();

    const [setups, setSetups] = useState<Setup[]>(initialSetups);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state corresponding to the editing/new setup
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [checklist, setChecklist] = useState<string[]>([]);
    const [newItemText, setNewItemText] = useState("");

    const handleCreateNew = () => {
        setEditingId("new");
        setName("");
        setDescription("");
        setChecklist([]);
        setNewItemText("");
    };

    const handleEdit = (setup: Setup) => {
        setEditingId(setup.id);
        setName(setup.name);
        setDescription(setup.description);
        setChecklist([...setup.checklist]);
        setNewItemText("");
    };

    const handleAddChecklistItem = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
        if ("key" in e && e.key !== "Enter") return;
        e.preventDefault();
        
        const trimmed = newItemText.trim();
        if (!trimmed) return;
        if (checklist.includes(trimmed)) {
            addToast("This rule already exists.", "error");
            return;
        }

        setChecklist(prev => [...prev, trimmed]);
        setNewItemText("");
    };

    const handleRemoveChecklistItem = (itemToRemove: string) => {
        setChecklist(prev => prev.filter(i => i !== itemToRemove));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            addToast("Setup name is required.", "error");
            return;
        }

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            const payload = {
                user_id: user.id,
                name: name.trim(),
                description: description.trim(),
                checklist: checklist,
            };

            let returnedSetup: any;

            if (editingId && editingId !== "new") {
                // Update
                const { data, error } = await supabase
                    .from("setups")
                    .update(payload)
                    .eq("id", editingId)
                    .select()
                    .single();
                
                if (error) throw error;
                returnedSetup = data;
                
                setSetups(prev => prev.map(s => s.id === editingId ? { ...s, ...payload } : s));
                addToast("Setup updated successfully.", "success");
            } else {
                // Insert
                const { data, error } = await supabase
                    .from("setups")
                    .insert(payload)
                    .select()
                    .single();
                
                if (error) throw error;
                returnedSetup = data;

                setSetups(prev => [...prev, {
                    id: returnedSetup.id,
                    name: returnedSetup.name,
                    description: returnedSetup.description || "",
                    checklist: returnedSetup.checklist || [],
                }]);
                addToast("Setup created successfully.", "success");
            }

            setEditingId(null);
            router.refresh();
        } catch (error: any) {
            console.error("Save setup error:", error);
            addToast(error.message || "Failed to save setup.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this setup? This will NOT delete trades associated with it, but the rules won't appear anymore.")) return;

        try {
            // Optimistic update
            const prevSetups = [...setups];
            setSetups(prev => prev.filter(s => s.id !== id));

            const { error } = await supabase.from("setups").delete().eq("id", id);
            if (error) {
                setSetups(prevSetups);
                throw error;
            }

            addToast("Setup deleted.", "success");
            if (editingId === id) setEditingId(null);
            router.refresh();
        } catch (err: any) {
            addToast(err.message || "Failed to delete setup.", "error");
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {/* List of Setups */}
            <div className="lg:col-span-1 space-y-3">
                <button
                    onClick={handleCreateNew}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/40 hover:border-accent hover:bg-accent/5 transition-all text-muted-foreground hover:text-accent font-semibold text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create New Setup
                </button>

                {setups.map(setup => (
                    <div
                        key={setup.id}
                        onClick={() => handleEdit(setup)}
                        className={`p-4 rounded-xl border border-border/30 cursor-pointer transition-colors group ${editingId === setup.id ? "bg-accent/10 border-accent/30" : "bg-card hover:bg-white/5"}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-foreground">{setup.name}</h3>
                            <button
                                onClick={(e) => handleDelete(setup.id, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-red-400"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{setup.description || "No description"}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {setup.checklist.length} Rules
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Area */}
            {editingId && (
                <div className="lg:col-span-2 bg-card border border-border/30 rounded-xl p-6">
                    <h2 className="text-lg font-bold font-['Montserrat'] mb-2">
                        {editingId === "new" ? "Create New Setup" : "Edit Setup"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Define the rigid rules for this setup. A trade logging this setup should pass all these criteria.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Setup Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Silver Bullet FVG"
                                className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                                placeholder="Briefly describe the mechanics of this setup..."
                                className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-muted-foreground/50 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 mt-4">Mandatory Checklist</label>
                            
                            <div className="space-y-2 mb-3">
                                {checklist.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-background border border-border/30 rounded-lg p-3">
                                        <div className="w-4 h-4 rounded border border-accent flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3 text-accent" />
                                        </div>
                                        <span className="text-sm flex-1">{item}</span>
                                        <button onClick={() => handleRemoveChecklistItem(item)} className="text-muted-foreground hover:text-red-400 p-1 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {checklist.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic py-2 text-center border border-dashed border-border/30 rounded-lg bg-background/50">
                                        No rules added yet.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newItemText}
                                    onChange={e => setNewItemText(e.target.value)}
                                    onKeyDown={handleAddChecklistItem}
                                    placeholder="Add a new rule (e.g. HTF bias aligned) and press Enter"
                                    className="flex-1 bg-background border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-muted-foreground/50"
                                />
                                <button
                                    onClick={handleAddChecklistItem}
                                    className="px-4 py-2 bg-white/5 border border-border/50 hover:bg-white/10 rounded-lg text-sm font-semibold transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/20 flex justify-end gap-3">
                        <button
                            onClick={() => setEditingId(null)}
                            className="px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold hover:shadow-[0_0_15px_rgba(var(--accent),0.4)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Save Setup
                        </button>
                    </div>
                </div>
            )}
            
            {!editingId && setups.length === 0 && (
                 <div className="col-span-2 hidden lg:flex items-center justify-center p-10 border border-dashed border-border/30 rounded-xl bg-card">
                     <p className="text-sm text-muted-foreground text-center max-w-sm">
                         You haven't defined any custom setups yet. Defining standard setups and their rules helps maintain discipline.
                     </p>
                 </div>
            )}
        </div>
    );
}
