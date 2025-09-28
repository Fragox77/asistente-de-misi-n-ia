import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import DemoCard from '../ui/DemoCard';
import { Button, ExampleButton } from '../ui/Button';
import ResultCard from '../ui/ResultCard';
import Loading from '../ui/Loading';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const NltkTab: React.FC = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<React.ReactNode | null>(null);
    const [error, setError] = useState<string | null>(null);

    const examples = {
        social: "OMG! Este proyecto de IA está SÚPER genial! 🔥🤖 #MachineLearning #AI",
        review: "⭐⭐⭐⭐⭐ Excelente curso, muy bien estructurado. Recomendado 100%",
        feedback: "El contenido está bien, pero podría mejorar la explicación de algunos conceptos técnicos."
    };

    const interpretVADER = (compound: number) => {
        if (compound >= 0.05) return { label: "😊 POSITIVO", className: "text-green-400" };
        if (compound <= -0.05) return { label: "😞 NEGATIVO", className: "text-red-400" };
        return { label: "😐 NEUTRO", className: "text-yellow-400" };
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
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Simula el analizador de sentimientos NLTK VADER. Analiza el siguiente texto y proporciona las puntuaciones de sentimiento 'neg', 'neu', 'pos' y 'compound'. El texto original está en español; tradúcelo mentalmente a inglés para un mejor análisis VADER.

Texto: "${text}"

Devuelve el resultado en formato JSON.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            neg: { type: Type.NUMBER },
                            neu: { type: Type.NUMBER },
                            pos: { type: Type.NUMBER },
                            compound: { type: Type.NUMBER },
                        }
                    }
                }
            });

            const scores = JSON.parse(response.text);
            const sentiment = interpretVADER(scores.compound);

            const formattedResult = (
              <div>
                <h3 className="font-bold text-lg mb-2 text-white">📊 Análisis NLTK VADER</h3>
                <div className={`text-2xl font-bold mb-3 ${sentiment.className}`}>{sentiment.label}</div>
                <p className="text-sm text-gray-400 mb-4 italic">Original: "{text}"</p>
                <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700">
                  <h4 className="font-semibold text-gray-300 mb-3">Puntuaciones Detalladas:</h4>
                  <ul className="space-y-2 font-mono text-gray-300 text-sm">
                    <li className="flex justify-between"><span>Negativo:</span> <span className="font-bold text-red-400">{(scores.neg * 100).toFixed(1)}%</span></li>
                    <li className="flex justify-between"><span>Neutral:</span> <span className="font-bold text-gray-400">{(scores.neu * 100).toFixed(1)}%</span></li>
                    <li className="flex justify-between"><span>Positivo:</span> <span className="font-bold text-green-400">{(scores.pos * 100).toFixed(1)}%</span></li>
                    <li className="flex justify-between pt-2 border-t border-gray-700"><span>Compuesto:</span> <span className="font-bold text-purple-300">{scores.compound.toFixed(4)}</span></li>
                  </ul>
                </div>
              </div>
            );
            setResult(formattedResult);
        } catch (e) {
            console.error(e);
            setError('No se pudo completar el análisis. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleClear = () => {
        setText('');
        setResult(null);
        setError(null);
    }

    return (
        <DemoCard
            title="📊 Demo: NLTK VADER Sentiment"
            description={
                <p><strong>Ejercicio 2:</strong> Analizador robusto usando NLTK VADER simulado por Gemini. Especialmente efectivo para textos cortos y contenido de redes sociales.</p>
            }
        >
            <div className="space-y-4">
                <textarea
                    id="nltkInput"
                    className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-vertical"
                    rows={4}
                    placeholder="Ejemplo: Este bootcamp de IA es INCREÍBLE! 🚀 Los ejercicios están súper bien diseñados."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                    <ExampleButton onClick={() => setText(examples.social)}>📱 Social Media</ExampleButton>
                    <ExampleButton onClick={() => setText(examples.review)}>⭐ Review</ExampleButton>
                    <ExampleButton onClick={() => setText(examples.feedback)}>💬 Feedback</ExampleButton>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={handleAnalyze} disabled={loading}>📊 Analizar con VADER</Button>
                    <Button onClick={handleClear} variant="secondary" disabled={loading}>🧹 Limpiar</Button>
                </div>
                {loading && <Loading text="Traduciendo y analizando con VADER..." />}
                <ResultCard content={result} error={error} />
            </div>
        </DemoCard>
    );
};

export default NltkTab;