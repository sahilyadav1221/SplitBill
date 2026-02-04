"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceChartProps {
    balances: Record<string, number>;
    userMap: Record<string, string>;
}

export default function BalanceChart({ balances, userMap }: BalanceChartProps) {
    const data = Object.entries(balances).map(([uid, amount]) => ({
        name: userMap[uid] || "Unknown",
        amount: Number(amount),
    }));

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Net Balances</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                        <ReferenceLine x={0} stroke="#000" />
                        <Bar dataKey="amount" fill="#8884d8">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.amount >= 0 ? '#22c55e' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
