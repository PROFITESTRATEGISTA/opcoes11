import React, { useState } from 'react';
import Navbar from './Navbar';
import HomePage from './HomePage';
import PricingPage from './PricingPage';
import LoginModal from './LoginModal';

interface LandingLayoutProps {
  onAuthSuccess: () => void;
}

export default function LandingLayout({ onAuthSuccess }: LandingLayoutProps) {
  const [currentPage, setCurrentPage] = useState<'home' | 'pricing'>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleNavigate = (page: 'home' | 'pricing' | 'login') => {
    if (page === 'login') {
      setShowLoginModal(true);
    } else {
      setCurrentPage(page);
    }
  };

  const handleAuthSuccess = () => {
    setShowLoginModal(false);
    onAuthSuccess();
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'pricing':
        return <PricingPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      {renderCurrentPage()}
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}