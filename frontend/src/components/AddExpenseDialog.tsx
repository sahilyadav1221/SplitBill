"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Wand2 } from "lucide-react"; // Import magic wand icon
import { Group } from "@/types";

interface AddExpenseDialogProps {
    group: Group;
    onExpenseAdded: () => void;
    userMap: Record<string, string>;
}

export default function AddExpenseDialog({ group, onExpenseAdded, userMap }: AddExpenseDialogProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [payerId, setPayerId] = useState(""); // Default to empty, force select? Or default to current user?
    // Ideally get current user ID to set default. 
    // For MVP, user selects.

    const [magicText, setMagicText] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);

    // Simplified split logic: Defaults to EQUAL for everyone for now if manual
    // Complex split UI is out of MVP scope for this dialog unless AI handles it.

    const handleMagicPaste = async () => {
        if (!magicText) return;
        setLoadingAI(true);
        try {
            const res = await api.post("/api/parse-expense", {
                text: magicText,
                group_id: group.id
            });
            const data = res.data;

            setAmount(data.amount.toString());
            setDescription(data.description);

            // Find payer ID by name match
            const payerEntry = Object.entries(userMap).find(([id, name]) =>
                name.toLowerCase() === data.payer_name.toLowerCase()
            );
            if (payerEntry) setPayerId(payerEntry[0]);
            else {
                // Try fuzzy or just prompt?
                // For now, if no match, leave existing or empty
            }

        } catch (err) {
            console.error("AI Parse failed", err);
            alert("Failed to parse with MintSense");
        } finally {
            setLoadingAI(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description || !payerId) return;

        // Default to EQUAL split amongst ALL members for MVP Manual Entry
        // (Or involved users if we had that state)
        const splitAmount = parseFloat(amount) / group.members.length;
        const splits = group.members.map(m => ({
            user_id: m.user.id,
            amount_owed: splitAmount
        }));

        try {
            await api.post("/expenses/", {
                amount: parseFloat(amount),
                description,
                split_type: "EQUAL",
                group_id: group.id,
                payer_id: payerId,
                splits: splits
            });
            setOpen(false);
            setAmount("");
            setDescription("");
            setMagicText("");
            onExpenseAdded();
        } catch (err) {
            console.error(err);
            alert("Failed to add expense");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Expense</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* MintSense Section */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <Label className="text-purple-800 font-semibold flex items-center gap-2">
                            <Wand2 className="w-4 h-4" /> MintSense (AI Parser)
                        </Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                placeholder="e.g. Lunch 500 paid by Alice"
                                value={magicText}
                                onChange={(e) => setMagicText(e.target.value)}
                                className="bg-white"
                            />
                            <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={handleMagicPaste}
                                disabled={loadingAI || !magicText}
                            >
                                {loadingAI ? "..." : "Parse"}
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or Manual Entry</span>
                        </div>
                    </div>

                    <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" value={description} onChange={e => setDescription(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payer">Payer</Label>
                            <select
                                id="payer"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={payerId}
                                onChange={e => setPayerId(e.target.value)}
                                required
                            >
                                <option value="">Select Payer</option>
                                {group.members.map(m => (
                                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button type="submit" form="expense-form">Save Expense</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
