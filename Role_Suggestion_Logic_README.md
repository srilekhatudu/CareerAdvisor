
# README - Role Suggestion Logic for AI Models

## Overview:
This document defines the role suggestion logic based on educational background, experience level, and role preferences. The AI or LLM will use this logic to suggest IT roles for candidates based on the data provided.

## Criteria for Role Suggestions:

1. **Non-IT Engineering Degrees (e.g., B.Tech in Engineering):**

   * **Cloud Engineer** (low coding required)
   * **Data Engineer** (more coding required)

2. **Non-IT Education (e.g., BCom, BBA, MBA):**

   * **AI Data Analyst**
   * **AI Business Analyst**
   * **IT Analyst**

3. **Development Roles:**

   * Only candidates with **5 or more years of experience** in development roles will be considered for these positions.

4. **Functional Roles (e.g., Business Analyst, Project Manager):**

   * Candidates for functional roles should have **experience in the same domain**. For example:

     * A candidate for the **Project Manager** role should have prior **project management experience**.

5. **AI Roles (e.g., Product Manager):**

   * Candidates for **AI roles** should have:

     * **5 or more years of IT experience**, or
     * **More than 10 years of non-IT experience**, such as teaching, banking, finance, etc.

---

## Data Structure and Columns:

The dataset contains the following columns that are used in the logic:

* **Education**: The candidate's educational background.
* **Experience Level (Exp Level)**: The experience level of the candidate (e.g., Entry-level, Mid-level, Senior-level).
* **Role 1, Role 2, Role 3**: The different IT roles assigned to each candidate.
* **Salary Range**: The salary range for each role.

Some roles in the dataset include:

* **Cloud Engineer**
* **DevOps Engineer**
* **Full Stack Developer**
* **AI Data Analyst**
* **AI Business Analyst**
* **Product Manager**
* And more.

---

## Role Filtering Logic:

This section outlines the filtering logic used to recommend roles based on candidates' educational background, experience, and the roles of interest.

1. **Non-IT Engineering Degrees**:

   * Candidates with non-IT engineering degrees (such as **B.Tech in Computer Science**, **B.Tech in IT**, or **MCA**) are eligible for roles like **Cloud Engineer** (low coding required) or **Data Engineer** (more coding required).

2. **Non-IT Education**:

   * Candidates with non-IT educational backgrounds (such as **BCom**, **BBA**, or **MBA**) are eligible for roles such as **AI Data Analyst**, **AI Business Analyst**, or **IT Analyst**.

3. **Development Roles**:

   * Candidates with **5 or more years of development experience** are eligible for roles such as **Full Stack Developer**, **DevOps Engineer**, and **Cloud Architect**.

4. **Functional Roles**:

   * Candidates must have experience in the same domain as the functional role they are applying for. For example:

     * A **Business Analyst** should have **prior business analysis experience**.
     * A **Project Manager** should have experience in managing projects.

5. **AI Roles**:

   * For AI-related roles (such as **AI Product Manager**), candidates should have either:

     * **5 or more years of IT experience**, or
     * **10+ years of non-IT experience**, such as in teaching, banking, finance, etc.

---

## How to Use This Logic:

**IMPORTANT RULE: INFORMATION GATHERING FIRST**
The Voice Advisor and Professional Chat system must not suggest any role until all required user information has been collected and verified.

At a minimum, the following details are required before making any role recommendations (this list is not exhaustive):
* Name
* Education
* Work Experience
* IT or Non-IT background
* Coding or Non-Coding preference
* Target roles or career interests

If any of the required information is missing or unclear, the system should continue asking relevant follow-up questions until it has sufficient confidence and complete data to provide an accurate role suggestion.

1. **Input**: Provide candidate details, including:

   * **Education**
   * **Experience Level**
   * **Roles of interest** (e.g., Cloud Engineer, Business Analyst, AI Product Manager)

2. **Processing**: The AI model or LLM will use the provided details and apply the filtering logic mentioned above.

3. **Output**: Based on the criteria, the model will suggest the appropriate roles for the candidate, including associated salary ranges, role responsibilities, and potential career progression.

---

## Example:

* **Candidate 1**:

  * **Education**: B.Tech Computer Science
  * **Experience Level**: 6 years
  * **Roles of Interest**: Cloud Engineer, Data Engineer

  **Suggested Roles**:

  * Cloud Engineer (with low coding)
  * Data Engineer (with more coding)

---

---

## 📌 Edge Cases & Constraints for Career Advisor System

### 🎓 Education-Related Edge Cases
* **No Formal Education Provided**
  * If the candidate reports no formal education, avoid assumptions.
  * Focus on: Skills, Experience (informal or self-taught), Interests and strengths.
  * Suggest practical career paths, certifications, or vocational training.
* **Unrelated or Irrelevant Education**
  * If education does not align with career goals: Do not dismiss it. Identify transferable skills (e.g., communication, analysis, discipline). Provide transition pathways (e.g., bridging courses, entry-level roles).
* **Incomplete Education**
  * If the candidate dropped out or has gaps: Avoid judgmental tone. Suggest alternative credentials (online courses, certifications, portfolios).

### 💼 Experience & Skills Edge Cases
* **No Work Experience**
  * Recommend: Internships, Freelancing, Volunteer work, Project-based learning. Help them build a starter portfolio.
* **Career Switch Requests**
  * If the candidate wants to switch fields: Identify transferable skills. Suggest step-by-step transition plans. Highlight realistic timelines.
* **Overqualified Candidates**
  * If candidate is overqualified for desired role: Ask clarifying questions. Suggest better-aligned opportunities or leadership roles.
* **Underqualified Candidates**
  * Provide: Skill gap analysis, Learning roadmap, Entry-level alternatives.

### 🧠 Ambiguity & Missing Information
* **Vague Responses**
  * Ask targeted follow-up questions. Avoid making assumptions.
* **Conflicting Information**
  * Politely point out inconsistencies. Ask for clarification before advising.
* **Incomplete Profiles**
  * Provide general guidance first. Encourage user to share more details for personalization.

### ⚠️ Sensitive Situations
* If user shows:
  * Confusion, frustration, or lack of direction: Provide reassurance with actionable clarity.
  * Unrealistic expectations: Gently correct and guide toward practical options.

### 🚀 Recommendation Strategy
* Base all advice on: User inputs, Logical reasoning, Market relevance (if known).
* When unsure: Offer multiple options instead of one rigid answer.

---

This **README** provides a structured approach to understanding and applying the logic for role suggestions based on the dataset. The AI model or LLM can use these guidelines to match candidates with the right roles based on their education and experience.

---
