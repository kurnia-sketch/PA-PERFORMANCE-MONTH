
import { GoogleGenAI } from "@google/genai";
import { MachineData } from "../types";

export const analyzeMachineryData = async (data: MachineData[], month: string, year: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = data.map(m => {
    const values = m.data.map(d => `${d.date}: ${d.value}%`).join(', ');
    return `${m.fullName} (${m.name}): [${values}] - Monthly Average: ${m.avg}%`;
  }).join('\n');

  const prompt = `
    Analyze this mining fleet Monthly Physical Availability (PA%) data for ${month} ${year}:
    ${summary}

    Provide a high-level Operational Insight Report. Use the following structure:
    ### 1. EXECUTIVE SUMMARY
    A brief overview of the fleet's health for ${month}.
    
    ### 2. CRITICAL ANOMALIES & RED FLAGS
    Identify specific units or dates where performance dipped below 80% and explain potential causes.
    
    ### 3. MAINTENANCE PRIORITIZATION
    Rank units that need immediate technical attention based on their trend lines.
    
    ### 4. STRATEGIC RECOMMENDATIONS
    Actionable steps for the next 30 days after ${month}.

    Keep the tone professional, authoritative, and concise. Use bolding for key metrics.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return `Monthly analysis for ${month} ${year} unavailable at this time. Please check your connection.`;
  }
};
