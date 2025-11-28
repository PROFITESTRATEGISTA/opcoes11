import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import LongTermPlanningSection from './LongTermPlanningSection';
import PlansSection from './PlansSection';
import Footer from './Footer';
import { MessageCircle } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'login' | 'pricing') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <HeroSection onNavigate={onNavigate} />
      <FeaturesSection />
      <LongTermPlanningSection />
      <PlansSection onNavigate={onNavigate} />
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5511975333355"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse"
        title="Fale conosco no WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}