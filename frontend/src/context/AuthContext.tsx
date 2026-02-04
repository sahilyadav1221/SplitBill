"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    userEmail: string | null;
    login: (token: string, email: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    userEmail: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const email = localStorage.getItem("user_email");
        if (email) {
            setUserEmail(email);
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, email: string) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user_email", email);
        setUserEmail(email);
        router.push("/groups");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_email");
        setUserEmail(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ userEmail, login, logout, isAuthenticated: !!userEmail, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
