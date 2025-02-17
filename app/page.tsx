'use client'

import { useState, useEffect } from "react";
import GithubStats from "@/components/github-stats";
import Contact from "@/components/sections/Contact";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import { motion } from "framer-motion";
import Cursor from "@/components/sections/Cursor"; // Import your custom cursor
import FollowCursor from "@/components/ui/FollowCursor"; // Import FollowCursor component
import ClickSpark from "@/components/ui/ClickSpark"; // Import FollowCursor component
import ASCIIText from "@/components/sections/AsciiText";

export default function Home() {
  const [showLogin, setShowLogin] = useState<boolean>(true);

  useEffect(() => {
    // Show the login screen for 2 seconds, then hide it
    const timer = setTimeout(() => {
      setShowLogin(false);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  if (showLogin) {
    return <LoginScreen />;
  }

  return (
    <main className="min-h-screen bg-background">
      
      <Hero />
      <Skills />
      <Projects />
      
      {/* Github Stats Section */}
      <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold mb-12 text-center">
          Github <span className="text-primary"> Activity</span>
      </h2>
      <motion.div
      initial={{opacity:0 , y:20}}
      animate={{opacity:1 , y:0}}
      transition={{duration:0.5}}
      > 
      <GithubStats username="abhinavbahadursingh" />

      </motion.div>
  </section>

      <Contact />
    </main>
  );
}

const LoginScreen: React.FC = () => (
  <motion.div
    className="flex h-screen items-center justify-center bg-gray-900 text-white"
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ duration: 0.5, delay: 1.5 }}
  >
    <ASCIIText />
    {/* <h1 className="text-3xl">Welcome! Loading...</h1> */}
  </motion.div>
);
