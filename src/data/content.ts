import {
  Activity,
  Brain,
  ClipboardCheck,
  FileText,
  Flower2,
  HeartPulse,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  Wind,
} from "lucide-react";

export const careAreas = [
  {
    title: "Persistent or recurring symptoms",
    description:
      "A structured consultation can document the pattern, timeline, triggers, previous treatment and relevant medical evaluation of concerns that keep returning.",
    icon: Activity,
  },
  {
    title: "Allergy & respiratory symptom patterns",
    description:
      "History-taking may include seasonal patterns, environmental triggers, recurrence and current treatment, alongside appropriate medical assessment where needed.",
    icon: Wind,
  },
  {
    title: "Skin-related concerns",
    description:
      "The consultation may review onset, recurrence, aggravating factors, previous treatment and other health changes without promising a particular outcome.",
    icon: Sparkles,
  },
  {
    title: "Digestive symptoms & daily wellbeing",
    description:
      "Appetite, digestion, bowel patterns, sleep, routine, medicines and associated symptoms can be reviewed as part of the complete history.",
    icon: Flower2,
  },
  {
    title: "Stress, sleep & day-to-day functioning",
    description:
      "Mental and emotional context can be discussed as part of case-taking while urgent psychiatric or medical concerns are referred appropriately.",
    icon: Brain,
  },
  {
    title: "General & family consultation",
    description:
      "A systematic review for people who want their health history organised, current concerns documented and follow-up steps made clear.",
    icon: HeartPulse,
  },
];

export const learningArticles = [
  {
    slug: "what-happens-in-a-consultation",
    title: "What happens in a homoeopathic consultation?",
    summary:
      "A practical guide to the history, questions, records and follow-up involved in a structured consultation.",
    icon: Stethoscope,
    sections: [
      {
        heading: "The first task is understanding the timeline",
        body: [
          "A consultation usually begins with the main concern: when it started, how it has changed, what seems to aggravate or relieve it, and what has already been tried.",
          "Relevant diagnoses, investigations, current medicines, allergies and prior treatment should be shared so the practitioner can understand the wider clinical context.",
        ],
      },
      {
        heading: "Why the questions can be detailed",
        body: [
          "Homoeopathic case-taking often records general patterns such as sleep, appetite, temperature preference, stress and daily functioning. These questions should sit alongside—not replace—appropriate medical assessment.",
        ],
      },
      {
        heading: "What you should leave with",
        body: [
          "You should understand the immediate plan, what to observe before follow-up, when the next review is appropriate, and which symptoms would require a different or more urgent form of medical care.",
        ],
      },
    ],
  },
  {
    slug: "when-self-treatment-is-not-appropriate",
    title: "When self-treatment is not appropriate",
    summary:
      "Red flags, emergencies and situations where an online article or self-selected remedy is not an appropriate next step.",
    icon: ShieldPlus,
    sections: [
      {
        heading: "Emergency symptoms need emergency care",
        body: [
          "Chest pain, severe breathlessness, stroke-like symptoms, major bleeding, loss of consciousness, severe injury, suicidal thoughts, seizures or rapidly worsening illness require prompt medical assessment rather than an online consultation.",
        ],
      },
      {
        heading: "Do not delay investigations or prescribed care",
        body: [
          "Website or social-media information should not be used to stop prescribed medicines, postpone recommended investigations or replace ongoing care for serious conditions.",
        ],
      },
      {
        heading: "Ask when you are unsure",
        body: [
          "If a symptom is new, severe, persistent or difficult to interpret, arrange an appropriate clinical assessment. A responsible consultation includes referral when the situation falls outside its safe scope.",
        ],
      },
    ],
  },
  {
    slug: "prepare-for-your-first-visit",
    title: "How to prepare for your first visit",
    summary:
      "A short checklist to make the consultation more useful and reduce time spent reconstructing medical history.",
    icon: ClipboardCheck,
    sections: [
      {
        heading: "Bring your current information",
        body: [
          "Keep a list or photo of current medicines and supplements, relevant investigation reports, diagnoses, allergies and the names of clinicians currently involved in your care.",
        ],
      },
      {
        heading: "Write a simple symptom timeline",
        body: [
          "Note roughly when the main concern began, important changes, recurring patterns and treatments already tried. Exact memory is not expected; a simple sequence is often enough.",
        ],
      },
      {
        heading: "Prepare the questions that matter to you",
        body: [
          "Write down what you want clarified during the visit. This helps keep the consultation focused and makes it easier to leave with a clear plan.",
        ],
      },
    ],
  },
  {
    slug: "what-to-expect-at-follow-up",
    title: "What to expect at a follow-up",
    summary:
      "Follow-up is about comparing what changed, what did not, and whether the plan still makes clinical sense.",
    icon: FileText,
    sections: [
      {
        heading: "Review change over time",
        body: [
          "A follow-up should compare the original concerns with the present situation, including new symptoms, investigations, changes in other treatment and day-to-day functioning.",
        ],
      },
      {
        heading: "Bring new reports and medicine changes",
        body: [
          "If another clinician has changed a medicine, ordered tests or made a new diagnosis, share that information. It can materially affect what is safe and appropriate next.",
        ],
      },
      {
        heading: "The plan may change",
        body: [
          "A follow-up is not simply a repeat prescription. Depending on the history, the plan may be continued, modified, paused or redirected for further medical evaluation.",
        ],
      },
    ],
  },
];

export const learningCards = learningArticles;
