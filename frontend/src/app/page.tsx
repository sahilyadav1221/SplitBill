import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-5xl font-extrabold text-green-600 tracking-tight">SplitMint</h1>
        <p className="text-xl text-gray-600">
          Simplify your group expenses. Split bills, track debts, and settle up with MintSense AI.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="w-32">Login</Button>
          </Link>
          <Link href="/groups">
            <Button variant="outline" size="lg" className="w-32">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
