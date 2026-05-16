import React, { useState } from 'react';
import { generateText } from '@anthropic-ai/sdk';

/**
 * Call Claude API with proper error handling
 */
export const callClaude = async (systemPrompt, userMessage, useWebSearch = false) => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set in environment variables');
  }

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return text;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
};

/**
 * Generate a comprehensive legal memo
 */
export const generateLegalMemo = async (options) => {
  const {
    topic,
    matterType,
    jurisdiction,
    petitioner = 'Not specified',
    respondent = 'Not specified',
    acts = [],
  } = options;

  const systemPrompt = `You are a Senior Indian Advocate with 25 years of experience in legal practice. 
Draft a comprehensive and professional legal memorandum following Indian legal conventions. 
Use formal legal language and include proper citations to relevant Acts, Rules, and landmark judgments.`;

  const userMessage = `Draft a comprehensive legal memorandum with the following details:

Matter Type: ${matterType}
Jurisdiction: ${jurisdiction}
Topic/Description: ${topic}
Petitioner: ${petitioner}
Respondent: ${respondent}
Relevant Acts/Sections: ${acts.join(', ') || 'General Law'}

Please structure the memo with these sections:
1. BEFORE THE HON'BLE [Court Name]
2. IN RE: [Case Title]
3. LEGAL MEMORANDUM
4. Facts and Circumstances
5. Legal Issues
6. Applicable Legal Provisions
7. Arguments
8. Landmark Judgments and Case Law
9. Prayer/Relief Sought

Ensure the document is professional, formatted properly with proper legal citations, and includes references to relevant IPC, CrPC, Constitution, or BNS sections as applicable.`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * Generate AI summary for news
 */
export const generateNewsSummary = async (headline) => {
  const systemPrompt =
    'You are a legal news analyst. Provide a concise 2-3 line summary of the given legal news headline.';

  const userMessage = `Summarize this legal news headline in 2-3 lines: ${headline}`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * Analyze PDF with questions
 */
export const analyzePDF = async (pdfContent, question) => {
  const systemPrompt = `You are a legal document analyzer. Analyze the provided legal document and answer questions accurately.
Always cite specific page numbers, sections, or paragraph numbers when referencing the document.
Be precise and professional in your analysis.`;

  const userMessage = `
Legal Document:
${pdfContent}

Question: ${question}

Please provide a detailed and accurate answer based on the document.`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * Generate review suggestions for a draft
 */
export const reviewDraft = async (draftText, reviewMode) => {
  const modePrompts = {
    grammar: 'Fix grammar, spelling, and punctuation issues',
    professional: 'Make the language more professional and formal',
    concise: 'Make the text more concise without losing meaning',
    accuracy: 'Check for legal accuracy and cite relevant sections',
    full: 'Perform a comprehensive review covering all aspects',
  };

  const systemPrompt = `You are a senior legal editor with expertise in Indian law. 
Review the provided legal draft and provide suggestions for improvement.
Show ALL changes using this format:
[DELETED: original text] → [ADDED: new text]
At the end, provide a summary of changes made categorized by type.`;

  const userMessage = `Please review this legal draft with focus on: ${modePrompts[reviewMode] || 'full review'}

Draft to review:
${draftText}

Provide detailed feedback with all suggested changes.`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * Find supporting case law
 */
export const findCasesForYou = async (matterDescription, yourPosition) => {
  const systemPrompt = `You are a legal research expert specializing in Indian law.
Find and list landmark cases that SUPPORT the given legal position.
Provide case citations in the format: Case Name vs Respondent, Citation (Year), Brief holding explaining why it supports the position.`;

  const userMessage = `Matter: ${matterDescription}
Your Position: ${yourPosition}

Please find 5-10 landmark Supreme Court and High Court cases that support this position. Include:
- Case name and citation
- Court and year
- Key holding/ratio decidendi
- Why it supports this position`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * Find opposing case law
 */
export const findCasesAgainstYou = async (matterDescription, opposingPosition) => {
  const systemPrompt = `You are a legal research expert specializing in Indian law.
Find and list landmark cases that may go AGAINST the given legal position.
Help anticipate opposing arguments and prepare counter-strategies.`;

  const userMessage = `Matter: ${matterDescription}
Opposing Position: ${opposingPosition}

Please find 5-10 landmark cases that may work AGAINST this position. Include:
- Case name and citation
- Why it's adverse
- How to counter this precedent
- Distinguishing factors`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * Generate arguments in favor
 */
export const generateArgumentsInFavor = async (matterDescription, position) => {
  const systemPrompt = `You are a brilliant advocate known for crafting compelling legal arguments.
Generate well-structured arguments supported by case law and constitutional provisions.`;

  const userMessage = `Matter: ${matterDescription}
Your Position/Case: ${position}

Please provide:
1. Legal Arguments (supported by statutes and case law)
2. Constitutional Provisions that apply
3. Precedents supporting each argument
4. Anticipated Counter-Arguments
5. Suggested Rebuttals with supporting precedents`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * Generate judicial evaluation (AI Judge's assessment)
 */
export const getJudicialEvaluation = async (fullCaseDescription) => {
  const systemPrompt = `You are acting as an experienced retired Supreme Court Judge.
Evaluate both sides of a legal case objectively and predict likely outcomes based on established precedent.
Be neutral and analytical.`;

  const userMessage = `Please analyze this case and provide your judicial assessment:

${fullCaseDescription}

Provide:
1. Strength of Petitioner's Case (0-10 score with explanation)
2. Strength of Respondent's Case (0-10 score with explanation)
3. Key Factors that will Decide the Case
4. Likely Outcome (with probability percentage)
5. Judicial Observations and Reasoning
6. Disclaimer that this is AI simulation, not legal advice`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * Generate daily quiz questions
 */
export const generateQuizQuestions = async (topic, count = 5) => {
  const systemPrompt = `You are an expert in Indian law and legal education.
Generate multiple-choice questions with 4 options each on the given topic.
Provide questions in JSON format with correct answer indicated.`;

  const userMessage = `Generate ${count} MCQ questions on "${topic}" covering Indian law topics like Constitution, IPC, CrPC, BNS, BNSS.

Format each question as JSON:
{
  "question": "Question text?",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correctAnswer": "A",
  "explanation": "Explanation of correct answer with relevant law/precedent"
}`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * Explain a legal section/provision
 */
export const explainLegalSection = async (sectionText, sectionNumber) => {
  const systemPrompt = `You are a senior law professor who excels at explaining complex legal concepts.
Explain the given legal provision in simple, clear language in both English and Hindi.`;

  const userMessage = `Explain this legal provision in detail:

Section ${sectionNumber}: ${sectionText}

Please provide:
1. Meaning in simple English (2-3 paragraphs)
2. Meaning in simple Hindi (2-3 paragraphs)
3. Key elements of the section
4. Important landmark cases interpreting this section
5. Practical implications`;

  return callClaude(systemPrompt, userMessage, false);
};

/**
 * General legal research query
 */
export const legalResearchQuery = async (query) => {
  const systemPrompt = `You are an expert legal research AI for Indian law.
Provide comprehensive answers to legal questions with proper citations to Acts, Rules, Constitution, and landmark judgments.`;

  const userMessage = `Provide a comprehensive answer to this legal research query:

${query}

Include:
1. Direct answer
2. Relevant Acts/Sections
3. Important case law with citations
4. Recent developments
5. Further research suggestions`;

  return callClaude(systemPrompt, userMessage, false);
};
