"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const { userEmail, logout } = useAuth();

    return (
        <nav className="border-b p-4 bg-white shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/groups" className="text-xl font-bold text-green-600">SplitMint</Link>
                <div className="flex items-center space-x-4">
                    {userEmail ? (
                        <>
                            <span>{userEmail}</span>
                            <Button variant="ghost" onClick={logout}>Logout</Button>
                        </>
                    ) : (
                        <Link href="/login"><Button>Login</Button></Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
