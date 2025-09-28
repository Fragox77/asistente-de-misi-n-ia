import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import DemoCard from '../ui/DemoCard';
import { Button, ExampleButton } from '../ui/Button';
import ResultCard from '../ui/ResultCard';
import Loading from '../ui/Loading';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const TwitterTab: React.FC = () => {
    const [username, setUsername] = useState('elonmusk');
    const [tweetCount, setTweetCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<React.ReactNode | null>(null);
    const [error, setError] = useState<string | null>(null);

    const interpretSentiment = (sentiment: string) => {
        const upperSentiment = sentiment.toUpperCase();
        if (upperSentiment.includes('POSITIVO')) return { label: "POSITIVO", className: "bg-green-500/20 text-green-300" };
        if (upperSentiment.includes('NEGATIVO')) return { label: "NEGATIVO", className: "bg-red-500/20 text-red-300" };
        return { label: "NEUTRO", className: "bg-yellow-500/20 text-yellow-300" };
    };

    const handleAnalyze = async () => {
        if (!username) {
            setError('Por favor, ingresa un usuario de Twitter.');
            return;
        }
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Simula un análisis de un perfil de Twitter/X. Genera datos de perfil plausibles para el usuario @${username} (nombre, seguidores, verificado, etc.). Luego, crea ${tweetCount} tweets recientes realistas para este usuario. Finalmente, analiza el sentimiento de cada tweet (POSITIVO, NEGATIVO, NEUTRO) y calcula un resumen de sentimientos.

Devuelve un objeto JSON con 'profile' (con 'name', 'followers', 'verified') y 'tweets' (un array de objetos con 'content' y 'sentiment').`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            profile: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    followers: { type: Type.STRING },
                                    verified: { type: Type.BOOLEAN },
                                }
                            },
                            tweets: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        content: { type: Type.STRING },
                                        sentiment: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const data = JSON.parse(response.text);
            const { profile, tweets } = data;

            const sentimentCounts = tweets.reduce((acc: any, tweet: any) => {
                const sentiment = interpretSentiment(tweet.sentiment).label;
                if (sentiment === 'POSITIVO') acc.positive++;
                else if (sentiment === 'NEGATIVO') acc.negative++;
                else acc.neutral++;
                return acc;
            }, { positive: 0, negative: 0, neutral: 0 });
            
            const formattedResult = (
              <div>
                <h3 className="font-bold text-lg mb-4 text-white">🐦 Análisis de Cuenta: @{username} (Simulado)</h3>
                
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6">
                    <h4 className="font-semibold text-purple-300 mb-3">👤 Información del Perfil</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-gray-400">Nombre:</div>
                        <div className="text-white font-semibold">{profile.name}</div>
                        
                        <div className="text-gray-400">Seguidores:</div>
                        <div className="text-white font-semibold">{profile.followers}</div>

                        <div className="text-gray-400">Verificado:</div>
                        <div className="text-white font-semibold flex items-center gap-2">
                           {profile.verified ? '✅ Sí' : '❌ No'}
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-purple-300 mb-3">📊 Análisis de {tweets.length} Tweets Recientes</h4>
                    <div className="space-y-3">
                        {tweets.map((tweet: any, index: number) => {
                            const sentiment = interpretSentiment(tweet.sentiment);
                            return (
                                <div key={index} className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50 text-sm">
                                    <p className="text-gray-300 mb-2">"{tweet.content}"</p>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${sentiment.className}`}>
                                        {sentiment.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                    <h4 className="font-semibold text-purple-300 mb-2">📈 Distribución de Sentimientos</h4>
                    <p className="text-center font-mono text-base text-white">
                        <span className="text-green-400">{sentimentCounts.positive} Positivos</span> | <span className="text-yellow-400">{sentimentCounts.neutral} Neutros</span> | <span className="text-red-400">{sentimentCounts.negative} Negativos</span>
                    </p>
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
        setUsername('elonmusk');
        setResult(null);
        setError(null);
    };

    return (
        <DemoCard
            title="🐦 Demo: Análisis de Twitter/X"
            description={
                <p><strong>Ejercicio 4:</strong> Simulación de análisis de perfiles de Twitter/X. Conecta con Gemini para generar datos y analizarlos, simulando una conexión a la API de Twitter v2.</p>
            }
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="twitterInput" className="block text-sm font-medium text-gray-300 mb-2">Usuario de Twitter/X (sin @):</label>
                    <input
                        type="text"
                        id="twitterInput"
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="elonmusk, nasa, o cnn"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                 <div>
                    <label htmlFor="tweetCount" className="block text-sm font-medium text-gray-300 mb-2">Número de tweets a analizar: <span className="font-bold text-purple-300">{tweetCount}</span></label>
                     <input
                        type="range"
                        id="tweetCount"
                        min="1"
                        max="10"
                        value={tweetCount}
                        onChange={(e) => setTweetCount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                     />
                </div>
                <div className="flex flex-wrap gap-2">
                    <ExampleButton onClick={() => setUsername('elonmusk')}>🚀 @elonmusk</ExampleButton>
                    <ExampleButton onClick={() => setUsername('nasa')}>🛰️ @nasa</ExampleButton>
                    <ExampleButton onClick={() => setUsername('cnn')}>📰 @cnn</ExampleButton>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={handleAnalyze} disabled={loading}>🔍 Analizar Cuenta</Button>
                    <Button onClick={handleClear} variant="secondary" disabled={loading}>🧹 Limpiar</Button>
                </div>
                {loading && <Loading text="Obteniendo y analizando datos del perfil..." />}
                <ResultCard content={result} error={error} />
            </div>
        </DemoCard>
    );
};

export default TwitterTab;