'use client';

import Features from '@/components/home/Features';
import HeroImage from '@/components/home/HeroImage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CallToAction from '@/components/home/CallToAction';

export default function Home() {
  return (
    <main className="relative bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen">
        <HeroImage />
      </section>

      {/* Features Section */}
      <section className="relative">
        <Features />
      </section>

      {/* Call to Action */}
      <CallToAction />

      <Footer />
    </main>
  );
}
