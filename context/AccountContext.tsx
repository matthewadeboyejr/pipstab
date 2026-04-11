"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

export interface TradingAccount {
    id: string;
    name: string;
    broker: string;
    account_number?: string | null;
    initial_balance: number;
    currency: string;
    is_active: boolean;
}

interface AccountContextType {
    accounts: TradingAccount[];
    activeAccount: TradingAccount | null; // null means "All Accounts"
    setActiveAccountId: (id: string | null) => void;
    refreshAccounts: () => Promise<void>;
    isLoading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
    const [accounts, setAccounts] = useState<TradingAccount[]>([]);
    const [activeAccountId, setActiveAccountIdInternal] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchAccounts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("trading_accounts")
            .select("*")
            .order("created_at", { ascending: true });

        if (!error && data) {
            setAccounts(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    // Load active account from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("piptab_active_account");
        if (saved) setActiveAccountIdInternal(saved === "all" ? null : saved);
    }, []);

    const setActiveAccountId = (id: string | null) => {
        setActiveAccountIdInternal(id);
        localStorage.setItem("piptab_active_account", id || "all");
    };

    const activeAccount = accounts.find(a => a.id === activeAccountId) || null;

    return (
        <AccountContext.Provider value={{ 
            accounts, 
            activeAccount, 
            setActiveAccountId, 
            refreshAccounts: fetchAccounts,
            isLoading 
        }}>
            {children}
        </AccountContext.Provider>
    );
}

export function useAccounts() {
    const context = useContext(AccountContext);
    if (context === undefined) {
        throw new Error("useAccounts must be used within an AccountProvider");
    }
    return context;
}
