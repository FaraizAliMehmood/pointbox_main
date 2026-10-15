import { HeroBanner } from "@/components/HeroBanner";
import { BenefitsBanner } from "@/components/BenefitsBanner";
import { TiersBanner } from "@/components/TiersBanner";
import { Testimonials } from "@/components/Testimonials";
import { PromoBanner } from "@/components/PromoBanner";
import { CTABanner } from "@/components/CTABanner";

export function HomePage() {
  return (
    <>
      <HeroBanner />
      <BenefitsBanner />
      <Testimonials />
      <TiersBanner />
      <PromoBanner />
      <CTABanner />
    </>
  );
}
