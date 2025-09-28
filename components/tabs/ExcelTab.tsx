import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import DemoCard from '../ui/DemoCard';
import { Button, ExampleButton } from '../ui/Button';
import ResultCard from '../ui/ResultCard';
import Loading from '../ui/Loading';

const ExcelTab: React.FC = () => {
    const [csvData, setCsvData] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<React.ReactNode | null>(null);
    const [error, setError] = useState<string | null>(null);

    const exampleCsv = `id,texto
1,"¡Qué servicio tan increíble! Totalmente satisfecho."
2,"El producto llegó tarde y dañado. Muy mala experiencia."
3,"Funciona como se esperaba, sin más."
4,"La calidad supera mis expectativas. ¡Recomendadísimo!"
5,"No estoy seguro de si me gusta o no."
6,"Pésima atención al cliente, no resolvieron mi problema."`;

    const interpretVADER = (compound: number) => {
        if (compound >= 0.05) return { label: "POSITIVO", className: "text-green-400" };
        if (compound <= -0.05) return { label: "NEGATIVO", className: "text-red-400" };
        return { label: "NEUTRO", className: "text-yellow-400" };
    };

    const handleAnalyze = async () => {
        if (!csvData) {
            setError('Por favor, ingresa datos en formato CSV para analizar.');
            return;
        }
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: window.process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Simula un procesador masivo de un archivo Excel/CSV que usa NLTK VADER para análisis de sentimiento. Analiza cada fila de texto en los siguientes datos CSV. Para cada fila, proporciona el texto original y las puntuaciones de sentimiento VADER ('neg', 'neu', 'pos', 'compound').

Datos CSV:
\`\`\`csv
${csvData}
\`\`\`

Devuelve un array de objetos JSON, donde cada objeto representa una fila y contiene 'texto' y 'sentimiento' (con las puntuaciones VADER).`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                texto: { type: Type.STRING },
                                sentimiento: {
                                    type: Type.OBJECT,
                                    properties: {
                                        neg: { type: Type.NUMBER },
                                        neu: { type: Type.NUMBER },
                                        pos: { type: Type.NUMBER },
                                        compound: { type: Type.NUMBER },
                                    },
                                    required: ['neg', 'neu', 'pos', 'compound']
                                }
                            },
                            required: ['texto', 'sentimiento']
                        }
                    }
                }
            });

            const analysisResults = JSON.parse(response.text);

            const formattedResult = (
                <div>
                    <h3 className="font-bold text-lg mb-4 text-white">📈 Resultados del Análisis Masivo (Excel)</h3>
                    <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700 max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-gray-800">
                                <tr className="text-gray-400 font-semibold border-b border-gray-600">
                                    <th className="p-2">Texto</th>
                                    <th className="p-2 text-center">Sentimiento (VADER)</th>
                                    <th className="p-2 text-right">Compuesto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysisResults.map((item: any, index: number) => {
                                    const sentiment = interpretVADER(item.sentimiento.compound);
                                    return (
                                        <tr key={index} className="border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/30">
                                            <td className="p-2 text-gray-300">"{item.texto}"</td>
                                            <td className={`p-2 text-center font-bold ${sentiment.className}`}>{sentiment.label}</td>
                                            <td className="p-2 text-right font-mono text-purple-300">{item.sentimiento.compound.toFixed(4)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
            setResult(formattedResult);
        } catch (e) {
            console.error(e);
            setError('No se pudo completar el análisis. Verifica el formato CSV y prueba de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setCsvData('');
        setResult(null);
        setError(null);
    };

    return (
        <DemoCard
            title="📈 Demo: Procesamiento Masivo desde Excel"
            description={
                <p><strong>Ejercicio 2:</strong> Simulación de análisis masivo de comentarios desde un archivo Excel/CSV. Pega tus datos en formato CSV (con una columna 'texto') para analizarlos con NLTK VADER.</p>
            }
        >
            <div className="space-y-4">
                <textarea
                    className="w-full h-48 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-vertical font-mono text-sm"
                    placeholder={`Pega aquí tus datos en formato CSV, por ejemplo:
id,texto
1,"Este es un comentario positivo."
2,"Este es un comentario negativo."`}
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                    <ExampleButton onClick={() => setCsvData(exampleCsv)}>📄 Cargar Ejemplo</ExampleButton>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={handleAnalyze} disabled={loading}>📈 Analizar Lote</Button>
                    <Button onClick={handleClear} variant="secondary" disabled={loading}>🧹 Limpiar</Button>
                </div>
                {loading && <Loading text="Procesando lote de datos..." />}
                <ResultCard content={result} error={error} />
            </div>
        </DemoCard>
    );
};

export default ExcelTab;