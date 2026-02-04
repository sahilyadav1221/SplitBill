import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";

interface AddMemberDialogProps {
    groupId: string;
    onMemberAdded: () => void;
}

export default function AddMemberDialog({ groupId, onMemberAdded }: AddMemberDialogProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("name");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {};
            if (activeTab === "email") {
                payload.email = email;
            } else {
                payload.name = name;
            }

            await api.post(`/groups/${groupId}/members`, payload);
            setOpen(false);
            setName("");
            setEmail("");
            onMemberAdded();
        } catch (err) {
            console.error(err);
            alert("Failed to add member. If using email, ensure the user exists.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Member</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="name" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="name">By Name</TabsTrigger>
                        <TabsTrigger value="email">By Email</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit}>
                        <TabsContent value="name" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Bob"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={activeTab === "name"}
                                />
                                <p className="text-sm text-gray-500">
                                    Creates a placeholder user. They won't be able to log in, but you can assign expenses to them.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="email" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="friend@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required={activeTab === "email"}
                                />
                                <p className="text-sm text-gray-500">
                                    Adds an existing registered user to the group.
                                </p>
                            </div>
                        </TabsContent>

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Adding..." : "Add Member"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
