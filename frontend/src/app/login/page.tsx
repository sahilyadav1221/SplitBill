"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    const [activeTab, setActiveTab] = useState("login");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post("/auth/token", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            // Use AuthContext login
            login(response.data.access_token, email);
        } catch (err: any) {
            console.error(err);
            setError("Invalid credentials or server error");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await api.post("/auth/register", {
                email,
                password,
                name: email.split("@")[0]
            });

            // Auto login
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            const response = await api.post("/auth/token", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            // Use AuthContext login
            login(response.data.access_token, email);
        } catch (err: any) {
            console.error(err);
            let errorMessage = "Registration failed";
            const detail = err.response?.data?.detail;
            if (detail) {
                if (typeof detail === "string") {
                    errorMessage = detail;
                } else if (Array.isArray(detail)) {
                    errorMessage = detail.map((e: any) => e.msg).join(", ");
                }
            }
            setError(errorMessage);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">SplitMint</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex border-b mb-6">
                        <button
                            className={`flex-1 pb-2 text-center font-medium ${activeTab === "login" ? "border-b-2 border-black" : "text-gray-500"}`}
                            onClick={() => { setActiveTab("login"); setError(""); }}
                        >
                            Login
                        </button>
                        <button
                            className={`flex-1 pb-2 text-center font-medium ${activeTab === "register" ? "border-b-2 border-black" : "text-gray-500"}`}
                            onClick={() => { setActiveTab("register"); setError(""); }}
                        >
                            Register
                        </button>
                    </div>

                    {activeTab === "login" ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="alice@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</p>}
                            <Button type="submit" className="w-full">Sign In</Button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reg-email">Email</Label>
                                <Input
                                    id="reg-email"
                                    type="email"
                                    placeholder="newuser@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-password">Password</Label>
                                <Input
                                    id="reg-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</p>}
                            <Button type="submit" className="w-full" variant="secondary">Create Account</Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
