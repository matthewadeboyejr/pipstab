import { redirect } from "next/navigation";

export default function AnalyticsPage() {
    // Seamlessly forward to the unified Quant & Edge Lab in Dashboard
    redirect("/overview?tab=quant");
}
