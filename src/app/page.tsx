"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

const Navbar = () => {
  const { isAuthenticated } = useKindeAuth();

  return (
    <header className="border-b border-border bg-background py-4 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
        <span className="text-xl font-bold text-foreground">CodeCortex</span>
      </div>
      {isAuthenticated ? (
        <Link href="/dashboard">
          <Button variant="default" className="px-6 py-2 text-sm">
            Dashboard
          </Button>
        </Link>
      ) : (
        <LoginLink>
          <Button variant="default" className="px-6 py-2 text-sm">
            Sign in
          </Button>
        </LoginLink>
      )}
    </header>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex flex-col items-center justify-center px-6 py-20">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl"
        >
          Supercharge GitHub with AI. Build Smarter with CodeCortex.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 max-w-2xl text-center text-muted-foreground text-lg md:text-xl"
        >
          Manage commits, ask intelligent questions, summarize scrums, and
          collaborate with your team — all powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <LoginLink>
          <Button variant="default" className="px-6 py-2 text-sm">
            Start Exploring
          </Button>
        </LoginLink>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Try AI Agent
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 w-full max-w-5xl"
        >
          <Card className="overflow-hidden border bg-muted">
            <CardContent className="p-0">
              <Image
                src="https://assets.aceternity.com/pro/aceternity-landing.webp"
                alt="Platform preview"
                className="aspect-video w-full object-cover"
                width={1200}
                height={600}
              />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
