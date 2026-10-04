import {
  Activity,
  Brain,
  Flower2,
  HeartPulse,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  Wind,
} from "lucide-react";

export const careAreas = [
  {
    title: "Long-standing concerns",
    description: "Structured case-taking for people seeking an individualized consultation for persistent or recurring symptoms.",
    icon: Activity,
  },
  {
    title: "Allergy & respiratory patterns",
    description: "Consultation may explore recurrent rhinitis, seasonal sensitivity and other symptom patterns alongside appropriate medical evaluation.",
    icon: Wind,
  },
  {
    title: "Skin-related concerns",
    description: "A detailed history can include triggers, recurrence, previous treatments and the wider health context.",
    icon: Sparkles,
  },
  {
    title: "Digestive wellbeing",
    description: "Consultation can document appetite, digestion, bowel patterns, lifestyle and associated symptoms in a whole-person history.",
    icon: Flower2,
  },
  {
    title: "Stress, sleep & daily functioning",
    description: "Mental and emotional context may be included in case-taking while red flags and urgent symptoms are referred appropriately.",
    icon: Brain,
  },
  {
    title: "General & family consultation",
    description: "For people who want a systematic review of their health history and a clear follow-up plan.",
    icon: HeartPulse,
  },
];

export const learningCards = [
  {
    title: "What happens in a homoeopathic consultation?",
    summary: "Why the first visit usually asks about the timeline, triggers, modalities, general health and prior treatment history.",
    icon: Stethoscope,
  },
  {
    title: "When self-treatment is not appropriate",
    summary: "Recognising red flags, emergencies and situations that need prompt in-person or conventional medical assessment.",
    icon: ShieldPlus,
  },
  {
    title: "How to prepare for your first visit",
    summary: "Bring medication lists, relevant reports, symptom timelines and the questions you want addressed.",
    icon: Sparkles,
  },
];
