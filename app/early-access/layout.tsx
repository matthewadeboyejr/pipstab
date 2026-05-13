import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Early Access | PipTab",
  description: "Join the inner circle. Stop leaking alpha and start trading with cognitive edge. Be the first to experience the PipTab v1.0 beta.",
  openGraph: {
    title: "Join the PipTab Inner Circle",
    description: "Get priority access to the cognitive trading OS that stops you from gambling and starts you journaling.",
  },
};

export default function EarlyAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
