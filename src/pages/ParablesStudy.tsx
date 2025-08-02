import ParablesDatabase from "@/components/ParablesDatabase";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const ParablesStudy = () => {
  useSEO(SEO_CONFIG.PARABLES_STUDY);
  
  return <ParablesDatabase />;
};

export default ParablesStudy; 