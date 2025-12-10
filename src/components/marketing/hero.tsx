"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Clock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gradient-start to-gradient-end">
      {/* Solana-inspired floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orb - top right */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-primary to-accent/80 rounded-full blur-3xl opacity-60"
        />

        {/* Medium floating orb - bottom left */}
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 270, 180, 90, 0],
            y: [0, 15, 0],
            x: [0, -8, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -left-40 w-72 h-72 bg-gradient-to-br from-primary/80 to-accent/60 rounded-full blur-3xl opacity-50"
        />

        {/* Small floating orb - center */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 left-1/3 w-40 h-40 bg-gradient-to-br from-primary/60 to-accent/40 rounded-full blur-2xl opacity-40"
        />

        {/* Tiny floating particles */}
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/4 w-16 h-16 bg-primary/40 rounded-full blur-xl"
        />
      </div>

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center rounded-full bg-primary/10 backdrop-blur-sm px-4 py-2 text-sm text-primary border border-primary/20"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI-Powered Financial Conversion
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-inter leading-tight"
              >
                Stop copying
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                  bank statements
                </span>
                <br />
                by hand
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl sm:text-2xl text-foreground font-quicksand leading-relaxed max-w-lg"
              >
                Convert PDF bank statements to Excel in 10 seconds with AI that
                understands your bank's format. No accounts required. Files
                deleted automatically.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* Solana-inspired primary button with gradient */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/20"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Reserve Early Access - $5
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>

              {/* Solana-inspired secondary button with glass effect */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-2 border-primary/30 hover:border-primary/50 hover:bg-glass-bg backdrop-blur-sm transition-all duration-300"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground font-medium"
            >
              First 100 users get lifetime 30% discount. Pay today, use when
              ready.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Floating elements */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-8 -right-8 bg-primary text-primary-foreground rounded-full p-4 shadow-lg"
              >
                <Zap className="h-8 w-8" />
              </motion.div>

              {/* <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-6 -left-6 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              </motion.div> */}

              {/* Main card - Enhanced Solana glass morphism */}
              <div className="relative rounded-3xl bg-glass-bg backdrop-blur-[var(--glass-blur)] p-8 border border-glass-border shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>

                  <div className="bg-muted/50 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        bank-statement.pdf
                      </span>
                      <span className="text-xs text-muted-foreground">
                        2.4 MB
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 3, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        AI Processing... 85%
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-muted-foreground text-xs mb-1">
                          Transactions
                        </p>
                        <p className="font-bold text-primary text-lg">142</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-muted-foreground text-xs mb-1">
                          Accuracy
                        </p>
                        <p className="font-bold text-primary text-lg">98%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          Excel file ready!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <Card className="bg-glass-bg backdrop-blur-[var(--glass-blur)] border border-glass-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Shield className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="font-bold text-lg mb-3 font-inter">
                Privacy First
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Files deleted after 1 hour. No raw PDFs stored on our servers.
                Your data stays yours.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-glass-bg backdrop-blur-[var(--glass-blur)] border border-glass-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Clock className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="font-bold text-lg mb-3 font-inter">
                10 Second Processing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered extraction that's faster than manual data entry. Get
                results instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-glass-bg backdrop-blur-[var(--glass-blur)] border border-glass-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Zap className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="font-bold text-lg mb-3 font-inter">
                Template Memory
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload your Excel template next month for instant categorization
                and formatting.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
