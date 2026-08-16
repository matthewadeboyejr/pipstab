"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function FundamentalsRedirect() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const tab = searchParams.get("tab") || "terminal";
        const mappedTab = tab === "macro" ? "terminal" : tab;
        router.replace(`/macro?tab=${mappedTab}`);
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center p-20 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-accent" />
            Redirecting to Macro & Fundamentals Suite...
        </div>
    );
}

export default function FundamentalsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20 text-muted-foreground text-sm">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-accent" />
                Loading...
            </div>
        }>
            <FundamentalsRedirect />
        </Suspense>
    );
}
