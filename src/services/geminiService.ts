import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ClinicalTerm {
  term: string;
  definition: string;
}

export interface StructuredClinicalSummary {
  patientNarrative: string;
  symptomProfile: {
    subjective: string;
    observed: string;
    associated: string;
    progression: string;
  };
  clinicalTerminology: ClinicalTerm[];
  doctorsQuestions: string[];
}

const SYSTEM_INSTRUCTION = `
You are a specialized Clinical Documentation Assistant. Your task is to act as a bridge between a patient's casual, non-technical language and a healthcare professional's need for structured, concise data.

MANDATORY RULES:
1. NO DIAGNOSIS: Never say "You have [Condition]." Use phrases like "The user reports symptoms consistent with..." or "Clinical focus area: [Area]."
2. DISCLAIMERS: Every response must be treated as a preparation tool, not medical advice.
3. TONE: Clinical, objective, and empathetic but professional.
4. OUTPUT STRUCTURE: You must return the data in a specific structured format.

The output must include:
- A 1-paragraph summary of the primary concerns.
- A SOAP-adjacent Symptom Profile (Subjective, Observed, Associated, Progression).
- A list of 5-8 relevant medical terms with a brief (1-sentence) simple definition for the patient.
- 5 targeted questions a physician is likely to ask.
`;

export async function generateClinicalSummary(userDescription: string): Promise<StructuredClinicalSummary> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userDescription,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patientNarrative: { type: Type.STRING, description: "A 1-paragraph summary of user's primary concerns." },
          symptomProfile: {
            type: Type.OBJECT,
            properties: {
              subjective: { type: Type.STRING, description: "The 'messy' feelings reported by the user." },
              observed: { type: Type.STRING, description: "Observed duration and frequency." },
              associated: { type: Type.STRING, description: "What makes it worse/better." },
              progression: { type: Type.STRING, description: "Is it getting better or worse?" }
            },
            required: ["subjective", "observed", "associated", "progression"]
          },
          clinicalTerminology: {
            type: Type.ARRAY,
            items: { 
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING }
              },
              required: ["term", "definition"]
            },
            description: "List of 5-8 relevant medical terms with simple definitions."
          },
          doctorsQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "5 targeted questions a physician is likely to ask."
          }
        },
        required: ["patientNarrative", "symptomProfile", "clinicalTerminology", "doctorsQuestions"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as StructuredClinicalSummary;
}
