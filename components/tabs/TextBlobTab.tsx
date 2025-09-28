import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import DemoCard from '../ui/DemoCard';
import { Button, ExampleButton } from '../ui/Button';
import ResultCard from '../ui/ResultCard';
import Loading from '../ui/Loading';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

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
                
                <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Métricas Finales</h4>
                    <div className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Polaridad:</span>
                        <span className="font-bold text-purple-300">{data.final_polarity.toFixed(4)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                           className="h-2.5 rounded-full" 
                           style={{ 
                             width: `${polarityPercent}%`,
                             background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)'
                           }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Subjetividad:</span>
                        <span className="font-bold">{data.final_subjectivity.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700/50">
                    <h4 className="font-semibold text-gray-300 mb-2">Desglose del Análisis Híbrido</h4>
                     <ul className="space-y-2 text-xs text-gray-400">
                        <li><strong>Español (30%):</strong> Polaridad de <span className="font-semibold text-cyan-400">{data.spanish_polarity.toFixed(4)}</span></li>
                        <li><strong>Inglés (70%):</strong> Polaridad de <span className="font-semibold text-cyan-400">{data.english_polarity.toFixed(4)}</span></li>
                        <li className="italic pt-1">Traducido: "{data.translated_text}"</li>
                     </ul>
                  </div>
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
            title="🔬 Demo: Análisis con TextBlob"
            description={
                <p><strong>Ejercicio 1:</strong> Análisis de sentimientos optimizado para español usando una estrategia híbrida simulada por Gemini. Combina resultados con pesos 30% español + 70% inglés.</p>
            }
        >
            <div className="space-y-4">
                <textarea
                    id="textblobInput"
                    className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-vertical"
                    rows={4}
                    placeholder="Ejemplo: ¡Me encanta este curso de IA! Estoy aprendiendo muchísimo y los proyectos son fascinantes."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                    <ExampleButton onClick={() => setText(examples.positive)}>😊 Muy Positivo</ExampleButton>
                    <ExampleButton onClick={() => setText(examples.neutral)}>😐 Neutro</ExampleButton>
                    <ExampleButton onClick={() => setText(examples.negative)}>😞 Negativo</ExampleButton>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={handleAnalyze} disabled={loading}>🔍 Analizar Sentimiento</Button>
                    <Button onClick={handleClear} variant="secondary" disabled={loading}>🧹 Limpiar</Button>
                </div>
                {loading && <Loading text="Procesando análisis híbrido..." />}
                <ResultCard content={result} error={error} />
            </div>
        </DemoCard>
    );
};

export default TextBlobTab;