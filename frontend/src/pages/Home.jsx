import Hero from "../components/home/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";
import BrandStory from "../components/home/BrandStory";
import Stats from "../components/home/Stats";
import Reviews from "../components/home/Reviews";
import Newsletter from "../components/home/Newsletter";
import { useSettings } from "../context/SettingsContext";

export default function Home() {
  const { settings } = useSettings();
  const s = settings || {};

  return (
    <>
      {s.showHero     !== false && <Hero />}
      {s.showBrandStory !== false && <BrandStory />}
      {s.showFeatured !== false && <FeaturedProducts />}
      {s.showStats    !== false && <Stats />}
      {s.showReviews  !== false && <Reviews />}
      {s.showNewsletter !== false && <Newsletter />}
    </>
  );
}
