"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Group, Expense, BalanceResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParams } from "next/navigation";
import BalanceChart from "@/components/BalanceChart";
import AddMemberDialog from "@/components/AddMemberDialog";
import AddExpenseDialog from "@/components/AddExpenseDialog";

export default function GroupDetailsPage() {
    const params = useParams();
    // ... (keep start of component same) ...
    const groupId = params.id as string;
    const [group, setGroup] = useState<Group | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [balances, setBalances] = useState<BalanceResponse | null>(null);

    // Maps user ID to Name
    const [userMap, setUserMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (groupId) {
            fetchGroupData();
        }
    }, [groupId]);

    const fetchGroupData = async () => {
        try {
            const gResp = await api.get(`/groups/${groupId}`);
            setGroup(gResp.data);

            // Build user map
            const map: Record<string, string> = {};
            gResp.data.members.forEach((m: any) => {
                map[m.user.id] = m.user.name;
            });
            setUserMap(map);

            const eResp = await api.get(`/expenses/group/${groupId}`);
            setExpenses(eResp.data);

            const bResp = await api.get(`/expenses/group/${groupId}/balances`);
            setBalances(bResp.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Old addMember function removed


    if (!group) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <div className="space-x-2">
                    <AddMemberDialog groupId={groupId} onMemberAdded={fetchGroupData} />
                    <AddExpenseDialog group={group} onExpenseAdded={fetchGroupData} userMap={userMap} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Balances</CardTitle></CardHeader>
                        <CardContent>
                            {balances && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Net Balances</h3>
                                        <div className="h-[200px] mb-4">
                                            <BalanceChart balances={balances.balances} userMap={userMap} />
                                        </div>
                                        <ul className="text-sm">
                                            {Object.entries(balances.balances).map(([uid, amount]) => (
                                                <li key={uid} className={amount >= 0 ? "text-green-600" : "text-red-600"}>
                                                    {userMap[uid] || uid}: {amount > 0 ? "+" : ""}{Number(amount).toFixed(2)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-900">Settlement Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {balances && (
                                <ul>
                                    {balances.settlements.map((s, i) => (
                                        <li key={i} className="mb-2 p-2 bg-white rounded shadow-sm border border-blue-100 flex justify-between items-center">
                                            <span>
                                                <span className="font-bold text-red-600">{userMap[s.from] || s.from}</span>
                                                <span className="mx-2 text-gray-500">→</span>
                                                <span className="font-bold text-green-600">{userMap[s.to] || s.to}</span>
                                            </span>
                                            <span className="font-mono font-bold">{Number(s.amount).toFixed(2)}</span>
                                        </li>
                                    ))}
                                    {balances.settlements.length === 0 && <p className="text-gray-500">No debts to settle.</p>}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Members</CardTitle></CardHeader>
                        <CardContent>
                            <ul>
                                {group.members.map((m: any) => (
                                    <li key={m.user.id} className="flex items-center gap-2 p-2 border-b last:border-0">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                            {m.user.name[0]}
                                        </div>
                                        <span>{m.user.name}</span>
                                        <span className="text-xs text-gray-400">({m.user.email})</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Expenses</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Payer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Split</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((e) => (
                                <TableRow key={e.id}>
                                    <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{e.description}</TableCell>
                                    <TableCell>{userMap[e.payer_id] || "Unknown"}</TableCell>
                                    <TableCell>{Number(e.amount).toFixed(2)}</TableCell>
                                    <TableCell>{e.split_type}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
