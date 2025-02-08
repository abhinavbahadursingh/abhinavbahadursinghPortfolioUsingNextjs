"use client";
import { motion } from "framer-motion";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  return (
    <section className='container mx-auto px-4 pt-32 pb-20'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
        
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Hi, I am <span className="text-primary">Abhinav Bahadur Singh</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Full Stack Web Developer, Android Developer, and AI & ML Engineer crafting modern experiences.
          </p>
          
          {/* Buttons */}
          <div className="flex gap-4">
            {/* Contact Me Button */}
            <Link href="mailto:abhinavbahadursingh69@gmail.com" target="_blank">
              <Button variant="default" className="gap-2">
                <Mail className="w-4 h-4" />
                Contact Me
              </Button>
            </Link>

            {/* GitHub Button */}
            <Link href="https://github.com/abhinavbahadursingh" target="_blank">
              <Button variant="outline" className="gap-2">
                <Github className="w-4 h-4" />
                GitHub
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Image 
            src="/hero.svg"
            alt="Developer Illustration"
            width={500}
            height={500}
            priority
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
