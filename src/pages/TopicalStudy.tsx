import TopicalBibleStudy from "@/components/TopicalBibleStudy";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const TopicalStudy = () => {
  useSEO(SEO_CONFIG.TOPICAL_STUDY);
  
  return <TopicalBibleStudy />;
};

export default TopicalStudy; 