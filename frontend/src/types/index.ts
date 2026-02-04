export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
}

export interface GroupMember {
    user: User;
    joined_at: string;
}

export interface Group {
    id: string;
    name: string;
    created_by_user_id: string;
    members: GroupMember[];
}

export interface ExpenseSplit {
    user_id: string;
    amount_owed: number;
}

export interface Expense {
    id: string;
    group_id: string;
    payer_id: string;
    amount: number;
    description: string;
    split_type: 'EQUAL' | 'EXACT' | 'PERCENT';
    date: string;
    splits: ExpenseSplit[];
}

export interface BalanceResponse {
    balances: Record<string, number>;
    settlements: {
        from: string;
        to: string;
        amount: number;
    }[];
}
