// Tamil Terms Dictionary - Correct Biblical Terms
// Used to improve Tamil responses with proper terminology

export const TAMIL_TERMS = {
  god_terms: {
    "God": "தேவன்",
    "Lord": "கர்த்தர்",
    "Jesus_Christ": "யேசு கிறிஸ்து",
    "Christ": "கிறிஸ்து",
    "Holy_Spirit": "பரிசுத்த ஆவியார்",
    "Son_of_God": "தேவனுடைய குமாரன்",
    "Father_God": "பிதாவாகிய தேவன்",
    "Almighty": "சர்வ வல்லவரான தேவன்"
  },
  salvation_terms: {
    "Salvation": "இரட்சிப்பு",
    "Savior": "இரட்சகர்",
    "Gospel": "சுவிசேஷம்",
    "Faith": "நம்பிக்கை",
    "Grace": "கிருபை",
    "Forgiveness": "மன்னிப்பு",
    "Sin": "பாவம்",
    "Repentance": "மனந்திரும்புதல்",
    "Eternal_Life": "நித்திய ஜீவன்",
    "Redemption": "விமோசனம்",
    "Sanctification": "பரிசுத்தப்படுத்துதல்",
    "Justification": "நீதிபடுத்துதல்"
  },
  spiritual_life: {
    "Prayer": "ஜெபம்",
    "Worship": "ஆராதனை",
    "Blessing": "ஆசீர்வாதம்",
    "Fellowship": "இணக்கம்",
    "Holiness": "பரிசுத்தம்",
    "Obedience": "கீழ்ப்படிதல்",
    "Anointing": "அபிஷேகம்",
    "Strength": "சக்தி",
    "Peace": "சாந்தி",
    "Hope": "நம்பிக்கை",
    "Love": "அன்பு",
    "Mercy": "கருணை",
    "Truth": "சத்தியம்",
    "Faithfulness": "நம்பிக்கைத்தன்மை"
  },
  church_and_ministry: {
    "Believer": "விசுவாசி",
    "Pastor": "மேய்ப்பர்",
    "Pastor_Modern": "பாஸ்டர்",
    "Ministry": "ஊழியம்",
    "Church": "திருச்சபை",
    "Disciples": "சிஷ்யர்கள்",
    "Servant_of_God": "தேவனுடைய ஊழியர்",
    "Kingdom_of_God": "தேவனுடைய ராஜ்யம்",
    "Evangelism": "சுவிசேஷ ஊழியம்",
    "Missionary": "சுவிசேஷ பரப்புபவர்",
    "Elder": "மூப்பர்",
    "Deacon": "சபை உதவியாளர்"
  },
  bible_terms: {
    "Bible": "பரிசுத்த வேதாகமம்",
    "Old_Testament": "பழைய ஏற்பாடு",
    "New_Testament": "புதிய ஏற்பாடு",
    "Scripture": "வேத வசனம்",
    "Chapter": "அத்தியாயம்",
    "Verse": "வசனம்",
    "Book": "புஸ்தகம்",
    "Prophet": "தீர்க்கதரிசி",
    "Psalm": "சங்கீதம்",
    "Apostle": "அப்போஸ்தலன்",
    "Epistle": "நூல் / உறைவுரை"
  },
  christian_values: {
    "Compassion": "இரக்கமுள்ள மனம்",
    "Humility": "தாழ்மையான மனம்",
    "Patience": "நெஞ்சளவு",
    "Purity": "தூய்மை",
    "Wisdom": "ஞானம்",
    "Understanding": "புத்தி",
    "Righteousness": "நீதியுண்மை",
    "Holiness": "பரிசுத்தம்"
  },
  end_times_terms: {
    "Second_Coming": "கிறிஸ்துவின் இரண்டாம் வருகை",
    "Judgment": "நியாயத்தீர்",
    "Heaven": "பரலோகம்",
    "Hell": "நரகம்",
    "Eternal_Judgment": "நித்திய நியாயத்தீர்",
    "Resurrection": "உயிர்த்தெழுதல்"
  }
};

// Incorrect terms to replace
export const INCORRECT_TERMS: Record<string, string> = {
  "கிரிஸ்து": "கிறிஸ்து",
  "பைபிள்": "பரிசுத்த வேதாகமம்",
  "பைபிள் புத்தகம்": "பரிசுத்த வேதாகமம்",
  "ஆசிரியர்": "மேய்ப்பர்",
  "மத விசுவாசி": "விசுவாசி",
  "பரிசுத்த ஆவி": "பரிசுத்த ஆவியார்",
  "அadhhyayam": "அத்தியாயம்",
  "சேவை": "ஊழியம்"
};

/**
 * Improve Tamil text by replacing incorrect terms with correct ones
 */
export function improveTamilText(text: string): string {
  let improved = text;
  
  // Replace incorrect terms
  for (const [incorrect, correct] of Object.entries(INCORRECT_TERMS)) {
    const regex = new RegExp(incorrect, 'gi');
    improved = improved.replace(regex, correct);
  }
  
  return improved;
}

/**
 * Get all correct Tamil terms as a flat object
 */
export function getAllTamilTerms(): Record<string, string> {
  const allTerms: Record<string, string> = {};
  
  Object.values(TAMIL_TERMS).forEach(category => {
    Object.assign(allTerms, category);
  });
  
  return allTerms;
}

