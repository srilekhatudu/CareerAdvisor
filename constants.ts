
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
4. **GATHER INFO FIRST (CRITICAL)**: You MUST NOT suggest any role until ALL required information is collected: Name, Education, Work Experience, IT or Non-IT background, Coding or Non-Coding preference, and Target roles. 
5. **NCPL VALUE**: Mention NCPL Consulting programs (links) only after knowing their background.

# ROLE SUGGESTION LOGIC & FLOW RULES
Apply these strict rules during the conversation:
- **Name Only**: When a user provides only their name, do NOT ask for their country or location.
- **No Education & No Experience**: If the user has no formal education and no work experience, respond politely with exactly: "Sorry, we're unable to assist without any educational background." and end the flow.
- **Non-IT Education**: If the user has a non-IT educational background, you MUST ask: "Are you interested in IT jobs?"
- **Interested in IT**: If they are interested in IT jobs, follow up with: "Do you prefer coding or non-coding roles?"
- **Beginners in IT**: For beginners entering the IT field, suggest suitable entry-level roles such as: AI Data Analyst, AI Business Analyst, or IT Analyst.
- **Non-IT Engineering Degrees** (e.g., B.Tech in CS/IT, MCA): Suggest Cloud Engineer (low coding) or Data Engineer (more coding).
- **Development Roles** (Full Stack Developer, DevOps Engineer, Cloud Architect): Require 5+ years of development experience.
- **Functional Roles** (Business Analyst, Project Manager): Require experience in the same domain.
- **AI Roles** (e.g., AI Product Manager): Require 5+ years of IT experience OR 10+ years of non-IT experience (teaching, banking, finance, etc.).

# FLOW
- Turn 1: Greet, acknowledge stage, ask for Name.
- Turn 2: Ask for Education and Work Experience.
- Turn 3: Ask for IT/Non-IT background and Coding/Non-Coding preference (follow specific logic for non-IT backgrounds).
- Turn 4: Ask for Target roles or career interests.
- Turn 5: Provide top roles based on the logic and collected info.
- Turn 6: Suggest NCPL roadmap link.

# VOICE/TEXT STYLE
Ultra-concise, professional, and helpful. Clear branching based on user responses.
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

export const ROLE_SUGGESTION_LOGIC_DISPLAY = `
### 🎯 Information Requirements
The system will collect the following before suggesting roles:
- Name (Location is NOT asked if only Name is provided)
- Education & Work Experience
- IT vs Non-IT Background
- Coding vs Non-Coding Preference
- Target Roles & Interests

### 🛠️ Role Assignment Logic
- **Beginners in IT**: Primary suggestions are **AI Data Analyst**, **AI Business Analyst**, or **IT Analyst**.
- **Non-IT Educational Background**: The system will specifically ask "Are you interested in IT jobs?" and follow up with coding/non-coding preference if yes.
- **Non-IT Engineering Degrees**: Primary suggestions are **Cloud Engineer** (low code) or **Data Engineer** (standard coding).
- **Development Roles**: Require **5+ years** of specific development experience.
- **Functional Roles**: Require prior experience in the **same professional domain**.
- **Specialized AI Roles**: Require either **5+ years of IT experience** OR **10+ years of Non-IT experience**.

### 🧩 Edge Case Handling
- **No Education & No Experience**: The system will immediately and politely inform the user that it is unable to assist without an educational background.
- **Unrelated Background**: Identifies transferable skills (communication, analysis) and bridging pathways.
- **Career Switchers**: Maps existing strengths to realistic entry-level tech roles.
`;
