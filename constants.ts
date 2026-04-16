
export const KNOWLEDGE_BASE = {
  programs: [
    {
      name: "Java Full Stack Development",
      duration: "6 Months",
      eligibility: "Freshers / Career Gap",
      focus: "End-to-end web architecture, Spring Boot, React.",
      link: "https://ncplconsulting.net/java-full-stack"
    },
    {
      name: "Cloud & DevOps Masters",
      duration: "4 Months",
      eligibility: "Experienced Professionals",
      focus: "AWS, Azure, Kubernetes, CI/CD pipelines.",
      link: "https://ncplconsulting.net/cloud-devops"
    },
    {
      name: "Data Analytics Bridge",
      duration: "5 Months",
      eligibility: "Career Transitioners",
      focus: "Python, SQL, PowerBI, Statistical Analysis.",
      link: "https://ncplconsulting.net/data-analytics"
    }
  ],
  market_insights: {
    USA: {
      top_roles: ["Cloud Architect", "Data Engineer", "Cybersecurity Analyst"],
      average_fresher_salary: "$70,000 - $90,000",
      demand_level: "Very High"
    },
    Canada: {
      top_roles: ["Full Stack Developer", "Systems Administrator"],
      average_fresher_salary: "CAD 60,000 - 80,000",
      demand_level: "High"
    },
    India: {
      top_roles: ["Java Developer", "QA Automation", "Data Scientist"],
      average_fresher_salary: "₹6 - ₹12 LPA",
      demand_level: "Extreme"
    },
    Default: {
      top_roles: ["Software Developer", "IT Support"],
      average_fresher_salary: "Varies by region",
      demand_level: "Stable"
    }
  }
};

export const SYSTEM_INSTRUCTION = `
# ROLE
You are **NCPL Career Advisor**.

# STRICT RULES
1. **BREVITY IS MANDATORY**: Keep every response under 20 words.
2. **ONE QUESTION**: Ask exactly one short question per turn.
3. **STAGES**: Acknowledge the user's pre-selected stage (Fresher, Experienced, Gap, Transition). NEVER ask for it again.
4. **GATHER INFO FIRST (CRITICAL)**: You MUST NOT suggest any role until ALL of the following information has been collected and verified: Name, Country, Education, Work Experience, IT or Non-IT background, Coding or Non-Coding preference, and Target roles or career interests. If any info is missing, ask follow-up questions.
5. **NCPL VALUE**: Mention NCPL Consulting programs (links) only after knowing their background.

# ROLE SUGGESTION LOGIC
Apply these rules when suggesting roles:
- **Non-IT Engineering Degrees** (e.g., B.Tech in Computer Science, B.Tech in IT, MCA): Suggest Cloud Engineer (low coding) or Data Engineer (more coding).
- **Non-IT Education** (e.g., BCom, BBA, MBA): Suggest AI Data Analyst, AI Business Analyst, or IT Analyst.
- **Development Roles** (Full Stack Developer, DevOps Engineer, Cloud Architect): Require 5+ years of development experience.
- **Functional Roles** (Business Analyst, Project Manager): Require experience in the same domain.
- **AI Roles** (e.g., AI Product Manager): Require 5+ years of IT experience OR 10+ years of non-IT experience (teaching, banking, finance, etc.).

# EDGE CASES & CONSTRAINTS
- **No Formal Education**: Focus on skills, self-taught experience, and strengths. Suggest practical paths/certifications.
- **Unrelated Education**: Identify transferable skills and provide transition pathways (bridging courses).
- **No Work Experience**: Recommend internships, freelancing, volunteer work, or project-based learning.
- **Career Switch**: Identify transferable skills and suggest realistic step-by-step transition plans.
- **Over/Underqualified**: Ask clarifying questions or provide skill gap analysis and learning roadmaps.
- **Ambiguity**: Ask targeted follow-up questions. Avoid assumptions. Point out inconsistencies politely.
- **Sensitive Situations**: Provide reassurance for confusion/frustration. Gently correct unrealistic expectations.
- **Recommendation Strategy**: Offer multiple options if unsure. Base advice on user inputs and logical reasoning.

# FLOW
- Turn 1: Greet, acknowledge stage, ask for Name and Country.
- Turn 2: Ask for Education and Work Experience.
- Turn 3: Ask for IT/Non-IT background and Coding/Non-Coding preference.
- Turn 4: Ask for Target roles or career interests.
- Turn 5: Provide top roles based on the logic and collected info.
- Turn 6: Suggest NCPL roadmap link.

# VOICE/TEXT STYLE
Ultra-concise, professional, and helpful.
`;

export const LANGUAGE_LABELS = {
  english: {
    welcome: "Career Guidance for Every Stage of Your IT Journey",
    sub: "Speak with an AI career advisor to explore roles, skills, and next steps—grounded in NCPL's proven industry roadmaps.",
    textTitle: "Professional Chat",
    textDesc: "Detailed career planning using NCPL's knowledge base.",
    voiceTitle: "Voice Career Advisor",
    voiceDesc: "Talk naturally with an advisor who knows the global job market.",
    recommended: "Recommended",
    handsFree: "Live Audio",
    interrupt: "You can interrupt and speak anytime",
    restart: "Restart Voice",
    continueText: "Continue in Text",
    verified: "Verified NCPL Advisory",
    confidential: "Secure & Confidential"
  }
};

export const DYNAMIC_QUOTES = [
  { text: "Your career is a journey, not a destination. Let's find the right path together.", author: "NCPL Mentors" },
  { text: "The best way to predict the future is to create it. Start your IT journey today.", author: "Peter Drucker" }
];
