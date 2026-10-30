import Navbar from "../components/common/Navbar";

import HeroSection from "../components/home/HeroSection";
import AboutSection from "../components/home/AboutSection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import ServicesSection from "../components/home/ServicesSection";
import HowItWorks from "../components/home/HowItWorks";
import FeaturedCenters from "../components/home/FeaturedCenters";
import FAQ from "../components/home/FAQ";
import CTASection from "../components/home/CTASection";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-white text-gray-900 homepage-scope"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .homepage-scope h1,
        .homepage-scope h2,
        .homepage-scope h3,
        .homepage-scope [style*="Fraunces"] {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif !important;
          letter-spacing: -0.02em;
        }
        `}
      </style>

      <Navbar />

      <HeroSection />
      <AboutSection />
      <WhyChooseUs />
      <ServicesSection />
      <HowItWorks />
      <FeaturedCenters />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
