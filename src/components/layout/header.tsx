'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, Zap } from 'lucide-react'

import { ThemeToggle } from '@/components/common/theme-toggle'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <FileText className="h-4 w-4" />
          </motion.div>
          <span className="font-bold text-lg font-lato">StatementSheet</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How it Works
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button className="hidden sm:flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Get Started</span>
          </Button>
        </div>
      </div>
    </motion.header>
  )
}