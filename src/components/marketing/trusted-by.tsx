'use client'

import { motion } from 'framer-motion'
import { Building2, TrendingUp, Shield, Zap } from 'lucide-react'

const companies = [
  { name: 'Chase', icon: Building2 },
  { name: 'Bank of America', icon: TrendingUp },
  { name: 'Wells Fargo', icon: Shield },
  { name: 'Capital One', icon: Zap },
  { name: 'Citibank', icon: Building2 },
  { name: 'US Bank', icon: TrendingUp },
]

export function TrustedBy() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold font-inter mb-4">
            Trusted by financial professionals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of accountants, bookkeepers, and financial analysts who save hours every week
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8"
        >
          {companies.map((company, index) => {
            const Icon = company.icon
            return (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center p-6 bg-background rounded-2xl border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="text-center">
                  <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {company.name}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>10,000+ Conversions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Bank-Level Security</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}