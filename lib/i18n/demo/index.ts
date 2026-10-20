import { useApp } from "@/lib/context/AppContext";
import { hubTh, hubEn, phase1Th, phase1En } from "./hub";
import { doctorTh, doctorEn } from "./doctor";
import { designerTh, designerEn } from "./designer";
import { chatTh, chatEn } from "./chat";
import { budgetTh, budgetEn } from "./budget";
import { quoteTh, quoteEn } from "./quote";
import { communityTh, communityEn } from "./community";
import { pointsTh, pointsEn } from "./points";
import { analyticsTh, analyticsEn } from "./analytics";

export { fill } from "./types";

const demoCopy = {
  th: { hub: hubTh, phase1: phase1Th, doctor: doctorTh, designer: designerTh, chat: chatTh, budget: budgetTh, quote: quoteTh, community: communityTh, points: pointsTh, analytics: analyticsTh },
  en: { hub: hubEn, phase1: phase1En, doctor: doctorEn, designer: designerEn, chat: chatEn, budget: budgetEn, quote: quoteEn, community: communityEn, points: pointsEn, analytics: analyticsEn },
};

export type DemoCopy = (typeof demoCopy)["th"];

/** Copy for the /demo showcase in the visitor's current language. */
export function useDemoCopy(): DemoCopy {
  const { locale } = useApp();
  return locale === "en" ? demoCopy.en : demoCopy.th;
}
