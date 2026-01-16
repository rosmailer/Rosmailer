import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
אתה היועץ האסטרטגי הבכיר של מכללת FD AI.
המכללה מתמחה בקורסי בינה מלאכותית פרונטליים (בקרית גת ואשקלון) ובזום.
הצוות מורכב מרוסלן (מנכ"ל), פאינה (תפעול ומכירות), ארינה (מוצר והדרכה) וקטיה (שיווק וקהילה).
האסטרטגיה הנוכחית היא:
1. מוצר עוגן: קורס AI למתחילים.
2. דגש על רווח מיידי (Cash First) ב-6 החודשים הראשונים.
3. משמעת ניהולית אכזרית.
4. קהילה כנכס מרכזי.

ענה תמיד בעברית, קצרה, חדה ומנהלית. תן עצות פרקטיות שמכוונות לרווח והתייעלות.
`;

let aiClient: GoogleGenAI | null = null;

export const initializeGemini = () => {
  if (process.env.API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const askStrategyAdvisor = async (userQuestion: string): Promise<string> => {
  if (!aiClient) {
    initializeGemini();
  }
  
  if (!aiClient) {
    return "שגיאה: מפתח API חסר.";
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userQuestion,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "לא התקבלה תשובה.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "אירעה שגיאה בתקשורת עם היועץ האסטרטגי.";
  }
};