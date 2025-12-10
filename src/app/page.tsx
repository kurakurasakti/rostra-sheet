import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/marketing/hero'
import { TrustedBy } from '@/components/marketing/trusted-by'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TrustedBy />
      </main>
      <Footer />
    </div>
  )
}
