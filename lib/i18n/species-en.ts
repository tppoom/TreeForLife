export interface SpeciesEnglishProblem {
  symptom: string;
  cause: string;
  fix: string;
}

export interface SpeciesEnglishData {
  summary: string;
  shopNote: string;
  soilMix: string;
  fertilizerNote: string;
  propagation: string;
  notes: string;
  problems?: SpeciesEnglishProblem[];
}

export const SPECIES_EN_DATA: Record<string, SpeciesEnglishData> = {
  "monstera-albo-variegata": {
    summary: "The queen of variegated foliage. Striking snow-white sectoral variegation against deep emerald leaves, bringing instant luxury to interior spaces.",
    shopNote: "Key advice for Albo: white variegated sections burn easily under direct afternoon sun. Keep 1-2m back from windows and avoid watering directly on white leaves in the afternoon.",
    soilMix: "40% coarse coconut chips + 25% perlite + 20% pumice + 15% worm castings (high aeration, avoid compacted soil).",
    fertilizerNote: "Slow-release Osmocote 13-13-13 every 3 months, supplemented with monthly humic acid root drench.",
    propagation: "Stem cutting with aerial root node in water or moist sphagnum moss container.",
    notes: "Check the root zone and insert a finger 2 inches into the soil. Water thoroughly until draining only when completely dry.",
    problems: [
      {
        symptom: "White variegated leaf edges turning brown and crisp",
        cause: "Humidity too low or direct harsh afternoon sunlight.",
        fix: "Move away from direct rays; mist surrounding air lightly without soaking white foliage."
      },
      {
        symptom: "Lower leaves turning soft yellow with drooping petioles",
        cause: "Waterlogged potting mix; roots suffocating or showing early rot.",
        fix: "Cease watering immediately. Inspect roots, prune dead tissue, dip in fungicide, and repot in aerated chunky mix."
      }
    ]
  },
  "ficus-lyrata": {
    summary: "Sculptural statement houseplant with violin-shaped emerald leaves, commanding presence in modern minimalist interiors.",
    shopNote: "Fiddle leaf figs hate drafts and frequent relocation. Pick a bright corner with filtered sunlight and leave it there.",
    soilMix: "50% potting peat + 30% perlite + 20% pine bark chips for rapid drainage.",
    fertilizerNote: "Balanced liquid fertilizer (20-20-20) diluted to half-strength once monthly during hot and rainy seasons.",
    propagation: "Tip branch cutting with rooting hormone under humidity dome or air layering.",
    notes: "Allow the top 2-3 inches of soil to dry out between waterings. Wipe broad leaves regularly with a damp microfiber cloth.",
    problems: [
      {
        symptom: "Brown spots spreading from leaf centers or margins",
        cause: "Root rot from overwatering or inconsistent moisture swings.",
        fix: "Ensure drainage holes are clear, space out watering, and provide bright indirect light."
      },
      {
        symptom: "Dropping healthy green lower leaves suddenly",
        cause: "Environmental shock, drafty AC airflow, or cold stress.",
        fix: "Relocate away from air conditioning vents and keep temperatures steady."
      }
    ]
  },
  "ficus-elastica-burgundy": {
    summary: "Glossy, near-black leathery foliage with striking ruby-red emergent sheaths. Exceptionally sturdy and an air-purifying powerhouse.",
    shopNote: "Thrives in bright indirect light; brighter light intensifies the dark burgundy sheen. Very tolerant of slight neglect.",
    soilMix: "Coarse well-draining mix with equal parts peat, perlite, and coconut husk.",
    fertilizerNote: "Slow-release pellets every 3 months or diluted organic liquid seaweed feed monthly.",
    propagation: "Stem tip cutting or single leaf node cutting rooted in warm moist substrate.",
    notes: "Water deeply when the top half of the pot feels dry. Dust leaves occasionally to maximize photosynthesis.",
    problems: [
      {
        symptom: "Leaves losing glossy dark sheen and becoming dusty green",
        cause: "Insufficient light levels.",
        fix: "Shift closer to an east or north facing window with plenty of bright ambient light."
      }
    ]
  },
  "zamioculcas-zamiifolia-raven": {
    summary: "Rare and coveted dark variety. New foliage emerges neon lime green before maturing into pitch-black lacquered foliage. Practically indestructible.",
    shopNote: "Stores copious moisture in subterranean potato-like rhizomes. Forgetfulness is better than over-attentiveness with this plant.",
    soilMix: "Fast-draining cactus and succulent mix with extra perlite or pumice (60% gritty components).",
    fertilizerNote: "Light feeding once every 2-3 months during growing months; no fertilizer in cool weather.",
    propagation: "Rhizome division during repotting or leaf leaflet cuttings rooted in vermiculite.",
    notes: "Only water when the soil is bone dry throughout the entire pot depth.",
    problems: [
      {
        symptom: "Yellowing stems turning mushy at the soil line",
        cause: "Excess moisture leading to rhizome rot.",
        fix: "Unpot, discard decayed tubers, allow healthy rhizomes to callus for 24h, and replant in dry gritty soil."
      }
    ]
  },
  "sansevieria-trifasciata": {
    summary: "Air-cleansing champion that releases oxygen at night. Silvery grey sword-like upright leaves, resilient in virtually any indoor lighting.",
    shopNote: "The ultimate bedroom plant. Highly drought-hardy and perfect for clean air while sleeping.",
    soilMix: "Gritty succulent mix with coarse pumice and sand for rapid percolation.",
    fertilizerNote: "Minimal feeding needed: quarter-strength cactus fertilizer twice a year.",
    propagation: "Rhizome division or leaf blade sections.",
    notes: "Water conservatively around the perimeter, never directly into the central leaf rosette.",
    problems: [
      {
        symptom: "Soft wrinkled leaf bases collapsing sideways",
        cause: "Standing water in center rosette or overwatering in low light.",
        fix: "Withhold water, remove affected leaf, and ensure drainage is unimpeded."
      }
    ]
  },
  "philodendron-pink-princess": {
    summary: "Royal collector foliage with bubblegum pink splashes and marbled patches against deep olive-burgundy leaves.",
    shopNote: "Variegation depends heavily on bright filtered light. Provide a moss pole to encourage larger, more deeply variegated leaves.",
    soilMix: "Chunky aroid mix: orchid bark, perlite, coconut husk, charcoal, and worm castings.",
    fertilizerNote: "Balanced organic foliage feed every 4 weeks in warm months.",
    propagation: "Stem node cutting with visible aerial root in sphagnum moss.",
    notes: "Maintain consistent ambient humidity above 60% for effortless unfurling of new leaves.",
    problems: [
      {
        symptom: "New leaves emerging all green with zero pink variegation",
        cause: "Light too dim or unstable genetics.",
        fix: "Increase bright indirect lighting; prune back to the last node that showed strong pink coloration."
      }
    ]
  },
  "homalomena-rubescens-variegata": {
    summary: "Auspicious classical Thai foliage with pink and cream starlight speckles scattered across heart-shaped glossy leaves.",
    shopNote: "Prefers cozy warmth and high humidity. Keep away from cold drafty AC vents.",
    soilMix: "Moisture-retentive yet breathable mix with peat moss, fine perlite, and decomposed leaf mold.",
    fertilizerNote: "Gentle slow-release formula every 2 months.",
    propagation: "Crown clump division during spring repotting.",
    notes: "Keep potting mix evenly moist like a wrung-out sponge, never soggy.",
    problems: [
      {
        symptom: "Leaf tips curling inward and turning brown",
        cause: "Low atmospheric humidity or dry air conditioner current.",
        fix: "Place on a pebble humidity tray and move away from direct AC airflow."
      }
    ]
  },
  "alocasia-black-velvet": {
    summary: "Petite jewel alocasia featuring opulent obsidian-black velvet leaves etched with luminescent silver veins. Timeless elegance.",
    shopNote: "A compact jewel that requires excellent drainage. Does best in smaller pots that dry out evenly.",
    soilMix: "Aroid chunky mix: 40% bark, 30% perlite, 20% coco peat, 10% charcoal.",
    fertilizerNote: "Diluted foliage fertilizer twice monthly during active growth.",
    propagation: "Harvesting and sprouting underground corms.",
    notes: "Allow the top 50% of the substrate to dry between waterings. Sensitive to cold temperatures below 18°C.",
    problems: [
      {
        symptom: "Lower leaf yellowing and dropping as a new leaf emerges",
        cause: "Normal nutrient reallocation in juvenile jewel alocasias; occasionally underwatering.",
        fix: "Maintain light feeding schedule to support multiple simultaneous leaves."
      }
    ]
  },
  "spathiphyllum-sensation": {
    summary: "The majestic giant peace lily with broad corrugated emerald leaves and pure white spathes. Communicates thirst clearly by gently drooping.",
    shopNote: "Our favorite living hygrometer! When it slightly droops, water thoroughly and it will perk right back up in hours.",
    soilMix: "Rich peat-based potting soil with 25% perlite and compost.",
    fertilizerNote: "Blooming plant fertilizer every 6 weeks for recurring white spathes.",
    propagation: "Root ball division during repotting.",
    notes: "Prefers soft or filtered water to prevent brown tip burn from tap minerals.",
    problems: [
      {
        symptom: "Brown dry crispy leaf tips",
        cause: "Sensitivity to fluoride or chlorine in city tap water, or dry indoor air.",
        fix: "Use filtered or rested rainwater and boost local humidity."
      }
    ]
  },
  "epipremnum-aureum": {
    summary: "Marble Queen Pothos with intricate creamy white and emerald marbling. Rapid-growing, forgiving, and thrives trailing or climbing.",
    shopNote: "One of the easiest houseplants for beginners. Adapts to low light, though brighter light preserves high variegation.",
    soilMix: "Standard potting mix amended with 20% perlite for good aeration.",
    fertilizerNote: "All-purpose houseplant feed once a month in warm seasons.",
    propagation: "Super easy: snip below any node and root in a water vase.",
    notes: "Water when the top 1-2 inches are dry. Tolerates occasional forgetful watering without fuss.",
    problems: [
      {
        symptom: "Leaves reverting to solid green without white marble patterns",
        cause: "Insufficient light.",
        fix: "Move closer to natural filtered light to trigger variegated pigments."
      }
    ]
  },
  "peperomia-prostrata": {
    summary: "Watermelon Peperomia with cute rounded leaves striped in metallic silver and emerald like mini watermelons. 100% pet-safe.",
    shopNote: "Completely safe for curious dogs and cats! Compact growth makes it ideal for study desks and coffee tables.",
    soilMix: "Light, well-draining mix: equal parts peat moss and coarse perlite.",
    fertilizerNote: "Gentle half-strength liquid fertilizer once a month.",
    propagation: "Leaf cutting sliced in half and inserted cut-edge down in damp soil.",
    notes: "Thick fleshy leaves store moisture; avoid overwatering to protect shallow fibrous roots.",
    problems: [
      {
        symptom: "Leaves curling under and stems feeling brittle",
        cause: "Underwatering or extreme dry heat.",
        fix: "Bottom-water the pot in a shallow saucer for 20 minutes until moist."
      }
    ]
  },
  "calathea-orbifolia": {
    summary: "Designer prayer plant featuring magnificent saucer-like leaves with silvery brushstrokes. Pet-safe and folds its leaves upward at night.",
    shopNote: "A true living sculpture that opens and closes daily. Needs consistently moist (not waterlogged) soil and filtered water.",
    soilMix: "50% peat moss, 25% perlite, 25% orchid bark for aerated moisture retention.",
    fertilizerNote: "Weak organic fertilizer once a month during rainy season.",
    propagation: "Division of rhizomatous crowns at repotting time.",
    notes: "Always use filtered or reverse-osmosis water to preserve pristine leaf margins.",
    problems: [
      {
        symptom: "Crispy leaf margins and brown edges",
        cause: "Mineral salts in tap water or humidity dropping below 50%.",
        fix: "Switch to distilled or filtered water and employ a cool-mist humidifier."
      }
    ]
  },
  "anthurium-clarinervium": {
    summary: "Velvety heart-shaped cardboard foliage with gleaming crystalline white veins. Exquisite artisanal beauty.",
    shopNote: "Epiphytic nature requires a chunky, breathable medium. Do not plant in standard heavy garden soil.",
    soilMix: "50% orchid bark, 25% perlite, 15% pumice, 10% worm castings.",
    fertilizerNote: "Mild orchid or aroid fertilizer once every 4-6 weeks.",
    propagation: "Stem division or pollination and seed harvesting.",
    notes: "Let top 2 inches dry between waterings. Loves steady warm temperatures and good airflow.",
    problems: [
      {
        symptom: "Yellowing halos around brown leaf patches",
        cause: "Overly dense soil suffocating aerial roots.",
        fix: "Repot into coarse chunky aroid bark mix with generous drainage holes."
      }
    ]
  },
  "syngonium-albo-variegata": {
    summary: "Arrowhead vine with dynamic patches of pure white and jade green. Fast-growing, rewarding, and fun to shape on trellises.",
    shopNote: "Vigorous grower that easily propagates in water. Provide bright light to keep the white sectoral patches abundant.",
    soilMix: "Airy mix of potting soil, coco coir, and 30% perlite.",
    fertilizerNote: "Monthly liquid foliage feed throughout spring and summer.",
    propagation: "Stem node cuttings rooted in water within 10-14 days.",
    notes: "Water when the top 1-2 inches dry out. Prune leggy vines to maintain a bushy compact form.",
    problems: [
      {
        symptom: "Brown spots on white sections",
        cause: "Direct sunlight burning albino cells or water sitting on leaves in bright sun.",
        fix: "Filter direct rays with sheer curtains and bottom-water."
      }
    ]
  },
  "chamaedorea-seifrizii": {
    summary: "Bamboo Palm with breezy tropical fronds. Rated among top indoor air purifiers by NASA and completely pet-safe.",
    shopNote: "Remarkably tolerant of low light and AC environments. Perfect natural green room divider.",
    soilMix: "Standard well-draining houseplant mix with added pumice.",
    fertilizerNote: "Slow-release palm fertilizer every 3 months.",
    propagation: "Clump division during repotting.",
    notes: "Keep soil lightly moist; mist fronds in dry AC rooms to prevent spider mites.",
    problems: [
      {
        symptom: "Fine webbing on leaf undersides with tiny yellow stippling",
        cause: "Spider mites thriving in dry indoor air.",
        fix: "Wash fronds thoroughly in shower and spray with insecticidal soap or neem solution."
      }
    ]
  },
  "philodendron-birkin": {
    summary: "Compact self-heading philodendron with razor-sharp creamy white pinstripes over dark green leaves. Perfect desk plant.",
    shopNote: "Does not climb; grows in a tidy rosette. Younger leaves display the brightest white striping.",
    soilMix: "Chunky aroid mix with bark, perlite, and coco coir.",
    fertilizerNote: "Balanced houseplant feed every 4 weeks in warm months.",
    propagation: "Basal offsets or stem cuttings of mature specimens.",
    notes: "Water when top half is dry. Wipe leaves occasionally to keep pinstripes pristine.",
    problems: [
      {
        symptom: "New leaves emerging solid dark green without pinstripes",
        cause: "Light is too low, causing reversion.",
        fix: "Provide bright indirect sunlight for 6+ hours daily."
      }
    ]
  },
  "tradescantia-zebrina": {
    summary: "Tradescantia Nanouk boasting vibrant magenta, pastel pink, and mint green stripes on succulent trailing stems.",
    shopNote: "Loves bright indirect light to maintain its electric magenta coloration. Pinch stem tips to encourage thick bushy growth.",
    soilMix: "Light potting soil with 30% perlite for good drainage.",
    fertilizerNote: "Half-strength liquid feed once a month during active growth.",
    propagation: "Snip 3-inch stem tips and poke straight into moist potting soil.",
    notes: "Water when top inch is dry. Avoid getting water trapped in leaf folds.",
    problems: [
      {
        symptom: "Faded pale stems with long stretched internodes",
        cause: "Insufficient light causing leggy growth.",
        fix: "Move to a brighter windowsill and prune back tips to stimulate branching."
      }
    ]
  },
  "acanthocereus-tetragonus": {
    summary: "Fairy Castle Cactus with multiple columnar turrets resembling a miniature fairytale castle. Virtually zero maintenance required.",
    shopNote: "The easiest plant in the world for forgetful owners. Needs maximum sunlight and very infrequent watering.",
    soilMix: "70% gritty pumice, lava rock, and coarse sand + 30% cactus soil.",
    fertilizerNote: "Diluted low-nitrogen cactus fertilizer once in early summer.",
    propagation: "Gently detach individual turrets, let callus 3 days, and set on gritty mix.",
    notes: "Only water when completely dry throughout the pot depth. Cut back to once a month in cool weather.",
    problems: [
      {
        symptom: "Base of cactus turning brown, squishy, and translucent",
        cause: "Root rot from sitting in soggy soil.",
        fix: "Cut healthy green tops above the rot line, callus for a week, and re-root in dry pumice."
      }
    ]
  },
  "monstera-deliciosa": {
    summary: "The iconic Swiss Cheese Plant with large architectural fenestrated leaves. Fast-growing, hardy, and gives rooms a tropical oasis vibe.",
    shopNote: "Provide a sturdy pole or trellis for support as it matures. Larger leaves with dramatic natural holes develop with age and good light.",
    soilMix: "Chunky aroid substrate: bark, perlite, pumice, and rich compost.",
    fertilizerNote: "Monthly liquid foliage feed throughout the Thai rainy season.",
    propagation: "Stem cutting with aerial root in water or moist moss.",
    notes: "Water deeply when the top 2 inches dry out. Clean large leaves regularly.",
    problems: [
      {
        symptom: "New leaves emerging small with no natural holes or slits",
        cause: "Plant is either juvenile or not receiving sufficient bright indirect light.",
        fix: "Gradually move closer to natural daylight and provide climbing support."
      }
    ]
  },
  "ficus-elastica-variegata": {
    summary: "Tricolor Variegated Rubber Tree with thick glossy leaves marbled in cream, olive green, and soft blush pink accents.",
    shopNote: "A statement specimen that loves bright filtered light. Rotate pot every few weeks for balanced upright growth.",
    soilMix: "Equal parts potting peat, perlite, and coarse bark chips.",
    fertilizerNote: "Balanced houseplant feed every 4-6 weeks in spring and summer.",
    propagation: "Stem tip cutting or air layering on mature stems.",
    notes: "Allow top half of soil to dry out between waterings.",
    problems: [
      {
        symptom: "Pale leaves drooping and shedding from bottom",
        cause: "Overwatering paired with low light.",
        fix: "Increase light and allow soil to dry down substantially before re-watering."
      }
    ]
  },
  "asplenium-nidus": {
    summary: "Bird's Nest Fern with apple-green ruffled fronds radiating from a central rosette. Pet-friendly and thrives in humid environments.",
    shopNote: "A stellar choice for bright bathrooms. Never pour water directly into the central brown 'nest' core.",
    soilMix: "Rich fibrous mix of peat moss, perlite, and composted bark.",
    fertilizerNote: "Quarter-strength organic liquid feed every 6 weeks.",
    propagation: "Spore propagation or crown separation by nursery specialists.",
    notes: "Water the soil around the rim of the pot. Maintain moderate ambient humidity.",
    problems: [
      {
        symptom: "Center rosette turning black and mushy",
        cause: "Water trapped inside the central crown causing core rot.",
        fix: "Water exclusively around the pot edge and never over the top of the crown."
      }
    ]
  },
  "aglaonema-ruby": {
    summary: "Aglaonema Super Red with radiant ruby-red foliage and emerald borders. Renowned for supreme shade tolerance and bringing good fortune.",
    shopNote: "One of the most durable colorful houseplants. Thrives in offices and low-light living rooms with minimal attention.",
    soilMix: "Light aerated potting mix with 30% perlite and coco peat.",
    fertilizerNote: "Slow-release pellets every 3 months.",
    propagation: "Stem cuttings or root division when repotting.",
    notes: "Water when the top 50% of the soil has dried out. Very tolerant of dry spells.",
    problems: [
      {
        symptom: "Leaf stems turning translucent and mushy",
        cause: "Overwatering in cool temperatures or soggy pot saucer.",
        fix: "Empty drip tray promptly after watering and space out irrigation intervals."
      }
    ]
  },
  "sansevieria-hahnii": {
    summary: "Dwarf Bird's Nest Snake Plant forming a compact rosette. Perfect for bedside tables and desks, purifying air overnight.",
    shopNote: "Petite footprint makes it a dream for small apartments. Can withstand weeks without watering.",
    soilMix: "Cactus and succulent mix with 50% gritty pumice.",
    fertilizerNote: "Very light feeding twice a year.",
    propagation: "Offsets (pups) separating easily from parent rosette.",
    notes: "Water only when the substrate is completely bone dry.",
    problems: [
      {
        symptom: "Leaves wrinkling slightly and losing plumpness",
        cause: "Extended drought.",
        fix: "Give a thorough drink; the rosette will re-plump within 24 hours."
      }
    ]
  },
  "alocasia-macrorrhizos-variegata": {
    summary: "Dramatic giant variegated taro with massive heart-shaped leaves splashed in artistic marble white and mint patterns.",
    shopNote: "A show-stopping large specimen. Needs generous bright indirect light and high ambient moisture to maintain huge leaves.",
    soilMix: "Chunky aroid mix: 40% coarse coconut husk, 30% perlite, 20% pumice, 10% worm castings.",
    fertilizerNote: "Heavy feeder: balanced fertilizer every 2-3 weeks in hot/rainy seasons.",
    propagation: "Underground rhizome division and corms.",
    notes: "Keep soil consistently moist but never submerged in standing water.",
    problems: [
      {
        symptom: "White sections turning brown in dry hot air",
        cause: "Low humidity or intense direct sun rays.",
        fix: "Shelter under shade cloth or indirect light and mist surrounding microclimate."
      }
    ]
  },
  "philodendron-white-wizard": {
    summary: "Philodendron White Wizard with striking snow-white variegation against solid green stems. Highly stable and resilient.",
    shopNote: "More stable than many variegated aroids because stems are green. Give it a pole to encourage giant climbing leaves.",
    soilMix: "Coarse chunky mix with bark, perlite, and coconut husk chips.",
    fertilizerNote: "Monthly organic liquid feed in warm weather.",
    propagation: "Stem node cutting with aerial roots in moss or water.",
    notes: "Water when the top third of the pot feels dry.",
    problems: [
      {
        symptom: "White sections turning yellow at margins",
        cause: "Overly wet roots or poor drainage.",
        fix: "Check bottom drainage holes and increase potting mix porosity."
      }
    ]
  },
  "scindapsus-pictus": {
    summary: "Satin Pothos with heart-shaped velvet leaves shimmering with metallic silver flecks. Highly charming trailing or climbing plant.",
    shopNote: "Leaves curl inward when thirsty, making care intuitive. Tolerates dry indoor air better than many tropicals.",
    soilMix: "Well-aerated houseplant mix with 30% perlite.",
    fertilizerNote: "Balanced liquid feed once a month in growing season.",
    propagation: "Stem cuttings root rapidly in water.",
    notes: "Water when the top 2 inches dry out or when leaves begin to curl inward.",
    problems: [
      {
        symptom: "Yellowing leaves near base with black spots",
        cause: "Overwatering and stagnant soil moisture.",
        fix: "Let soil dry out more between waterings and improve pot drainage."
      }
    ]
  },
  "alocasia-baginda-dragon-scale": {
    summary: "Dragon Scale Alocasia with metallic emerald and silver embossed ridges resembling mythical dragon scales. Striking texture.",
    shopNote: "Keep in a cozy warm spot with high humidity. Avoid cold drafts and wet feet.",
    soilMix: "Chunky jewel aroid mix: bark, perlite, pumice, and coco chips.",
    fertilizerNote: "Half-strength organic fertilizer twice monthly in spring/summer.",
    propagation: "Sprouting underground corms in moist perlite.",
    notes: "Allow top half to dry between drinks. Never let the pot sit in stagnant runoff.",
    problems: [
      {
        symptom: "Leaf margins browning and curling downward",
        cause: "Humidity deficit or sudden temperature drop below 18°C.",
        fix: "Place in a protected terrarium or near a humidifier away from AC drafts."
      }
    ]
  },
  "nephrolepis-exaltata": {
    summary: "Boston Fern with lush arching fronds that naturally humidify rooms and filter airborne particulates. 100% pet-friendly.",
    shopNote: "Loves humidity and indirect light. A classic hanging plant that brings vibrant freshness to any room.",
    soilMix: "Peat-rich potting soil with 20% perlite and vermiculite.",
    fertilizerNote: "Diluted fish emulsion or balanced feed monthly.",
    propagation: "Runners (stolons) pinning into soil or crown division.",
    notes: "Keep soil consistently moist. Mist regularly or keep in bathrooms.",
    problems: [
      {
        symptom: "Fronds shedding fine brown leaflets when touched",
        cause: "Dry indoor air or letting root ball dry out completely.",
        fix: "Soak root ball in water bowl, trim dead fronds, and increase humidity."
      }
    ]
  },
  "calathea-makoyana": {
    summary: "Peacock Plant with feathery green and silver feather patterns and rich purple-red undersides. Completely non-toxic to pets.",
    shopNote: "Folds its leaves in prayer every night to reveal deep magenta undersides. Use filtered water for pristine foliage.",
    soilMix: "Equal parts peat moss, perlite, and fine bark.",
    fertilizerNote: "Half-strength organic fertilizer once a month.",
    propagation: "Gentle division of root clumps when repotting.",
    notes: "Maintain evenly moist soil and high humidity above 50%.",
    problems: [
      {
        symptom: "Crispy leaf margins and curling blades",
        cause: "Tap water chemicals (chlorine/fluoride) or dry air.",
        fix: "Switch to rainwater or filtered water and boost ambient humidity."
      }
    ]
  },
  "zamioculcas-zamiifolia-green": {
    summary: "Classic Green ZZ Plant with arching stems of emerald-lacquered foliage. The world's most forgiving and drought-resilient plant.",
    shopNote: "Thrives on neglect. If you travel often or forget to water, this is the perfect companion for your home.",
    soilMix: "Well-draining gritty mix with 50% pumice and perlite.",
    fertilizerNote: "Diluted houseplant fertilizer 2-3 times per year.",
    propagation: "Tuber division or leaf cuttings.",
    notes: "Water only when completely dry throughout. Thrives in low to bright indirect light.",
    problems: [
      {
        symptom: "Stems bending sideways and turning soft at base",
        cause: "Overwatering leading to swollen rhizome rot.",
        fix: "Cease watering, remove decaying tubers, and repot in dry aerated mix."
      }
    ]
  }
};

export function getLocalizedSpeciesData(
  slug: string,
  locale: "th" | "en",
  defaults: {
    summary: string;
    shopNote?: string | null;
    soilMix?: string | null;
    fertilizerNote?: string | null;
    propagation?: string | null;
    notes?: string | null;
    problems?: {
      id?: string;
      symptomTh: string;
      causeTh: string;
      fixTh: string;
      severity?: string;
    }[];
  }
) {
  if (locale === "th") {
    return {
      summary: defaults.summary,
      shopNote: defaults.shopNote || "",
      soilMix: defaults.soilMix || "",
      fertilizerNote: defaults.fertilizerNote || "",
      propagation: defaults.propagation || "",
      notes: defaults.notes || "",
      problems: defaults.problems?.map((p, idx) => ({
        id: p.id || `prob-${idx}`,
        symptom: p.symptomTh,
        cause: p.causeTh,
        fix: p.fixTh,
        severity: p.severity || "medium",
      })) || [],
    };
  }

  const en = SPECIES_EN_DATA[slug];
  const translatedProblems = defaults.problems?.map((p, idx) => {
    const enProb = en?.problems?.[idx];
    return {
      id: p.id || `prob-${idx}`,
      symptom: enProb?.symptom || p.symptomTh,
      cause: enProb?.cause || p.causeTh,
      fix: enProb?.fix || p.fixTh,
      severity: p.severity || "medium",
    };
  }) || [];

  return {
    summary: en?.summary || defaults.summary,
    shopNote: en?.shopNote || defaults.shopNote || "",
    soilMix: en?.soilMix || defaults.soilMix || "",
    fertilizerNote: en?.fertilizerNote || defaults.fertilizerNote || "",
    propagation: en?.propagation || defaults.propagation || "",
    notes: en?.notes || defaults.notes || "",
    problems: translatedProblems,
  };
}
