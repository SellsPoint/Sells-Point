"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";
import AdminPanel from "@/components/AdminPanel";

export default function AdminPage() {
  const { currentUser, userResolved } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (userResolved && !currentUser) router.push("/");
  }, [currentUser, userResolved, router]);

  if (!userResolved) return null;

  if (!currentUser) return null;

  if (!currentUser.isAdmin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <ShieldAlert size={40} className="text-red-400" />
        <h1 className="font-display text-xl font-bold text-ink-900">Access Restricted</h1>
        <p className="text-sm text-ink-500">
          This area is reserved for Sells Point administrators only.
        </p>
      </div>
    );
  }

  return <AdminPanel />;
}
