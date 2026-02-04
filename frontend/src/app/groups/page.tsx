"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Group } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login");
            } else {
                fetchGroups();
            }
        }
    }, [isLoading, isAuthenticated]);

    const fetchGroups = async () => {
        try {
            const resp = await api.get("/groups/");
            setGroups(resp.data);
        } catch (err) {
            console.error(err);
            // Redirect to login if unauthorized
            // router.push("/login"); // Handled by useEffect now, mostly.
        }
    };

    const createGroup = async () => {
        const name = prompt("Enter group name:");
        if (name) {
            try {
                await api.post("/groups/", { name });
                fetchGroups();
            } catch (err) {
                alert("Failed to create group");
            }
        }
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Groups</h1>
                <Button onClick={createGroup}>Create Group</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {groups.map((group) => (
                    <Link href={`/groups/${group.id}`} key={group.id}>
                        <Card className="hover:bg-gray-50 cursor-pointer">
                            <CardHeader>
                                <CardTitle>{group.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{group.members.length} members</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
