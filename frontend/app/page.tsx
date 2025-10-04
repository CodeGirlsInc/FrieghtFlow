"use client";
import NewHome from "@/components/pages/Home";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="w-full max-w-5xl">
        <NewHome />
      </div>
    </main>
  );
}
