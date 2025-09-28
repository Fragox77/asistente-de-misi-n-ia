import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import DemoCard from '../ui/DemoCard';
import { Button, ExampleButton } from '../ui/Button';
import ResultCard from '../ui/ResultCard';
import Loading from '../ui/Loading';

const TextBlobTab: React.FC = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<React.ReactNode | null>(null);
    const [error, setError] = useState<string | null>(null);

    const examples = {
        positive: "¡Me encanta este bootcamp de IA! Los ejercicios son fascinantes y estoy aprendiendo muchísimo. Excelente calidad educativa.",
        neutral: "El bootcamp de IA ha completado la primera misión. Los ejercicios cubren diferentes tecnologías y librerías.",
        negative: "No entiendo nada de este curso. Los ejercicios son demasiado complicados y confusos. Muy frustrante."
    };

    const interpretSentiment = (sentiment: string) => {
        const upperSentiment = sentiment.toUpperCase();
        if (upperSentiment.includes('POSITIVO')) return { label: "POSITIVO", icon: "😊", className: "text-green-400" };
        if (upperSentiment.includes('NEGATIVO')) return { label: "NEGATIVO", icon: "😞", className: "text-red-400" };
        return { label: "NEUTRO", icon: "😐", className: "text-yellow-400" };
    };

    const handleAnalyze = async () => {
        if (!text) {
            setError('Por favor, ingresa un texto para analizar.');
            return;
        }
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: window.process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Realiza un análisis de sentimiento híbrido del siguiente texto en español, al estilo de TextBlob. Primero, analiza el sentimiento directamente en español. Segundo, traduce el texto a inglés y analiza su sentimiento. Finalmente, combina los resultados (30% español, 70% inglés) para obtener una polaridad y subjetividad finales. Clasifica el sentimiento final en 'POSITIVO', 'NEGATIVO', o 'NEUTRO'.

Texto: "${text}"

Devuelve el resultado en formato JSON.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            original_text: { type: Type.STRING },
                            translated_text: { type: Type.STRING },
                            spanish_polarity: { type: Type.NUMBER },
                            english_polarity: { type: Type.NUMBER },
                            final_polarity: { type: Type.NUMBER },
                            final_subjectivity: { type: Type.NUMBER },
                            final_sentiment: { type: Type.STRING },
                        }
                    }
                }
            });

            const data = JSON.parse(response.text);
            const sentiment = interpretSentiment(data.final_sentiment);
            const polarityPercent = ((data.final_polarity + 1) / 2 * 100);

            const formattedResult = (
              <div>
                <h3 className="font-bold text-lg mb-3 text-white">📊 Análisis Híbrido (TextBlob)</h3>
                <div className={`text-2xl font-bold mb-3 flex items-center gap-2 ${sentiment.className}`}>
                  {sentiment.icon} {sentiment.label}
                </div>
                <p className="text-sm text-gray-400 mb-4 italic">Original: "{data.original_text}"</p>
                
                <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700 space