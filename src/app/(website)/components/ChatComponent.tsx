import { useState, useRef, useEffect } from "react";
import { geminiService } from "@/services/geminiService";
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

// Declarar el tipo para SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: unknown;
        webkitSpeechRecognition: unknown;
    }
}

export default function ChatComponent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<unknown>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Inicializar Speech Recognition y Speech Synthesis
    useEffect(() => {
        // Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSpeechSupported(true);
            const recognition = new (SpeechRecognition as any)();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'es-ES'; // Español

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: Event) => {
                const speechEvent = event as any;
                const transcript = speechEvent.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognition.onerror = (event: Event) => {
                const errorEvent = event as any;
                console.error('Error en reconocimiento de voz:', errorEvent.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        // Speech Synthesis
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setSpeechSynthesisSupported(true);
        }
    }, []);

    // Función para convertir texto a voz
    const speakText = (text: string) => {
        if (window.speechSynthesis && speechSynthesisSupported) {
            // Cancelar cualquier síntesis anterior
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES'; // Español
            utterance.rate = 0.9; // Velocidad de habla
            utterance.pitch = 1; // Tono de voz
            utterance.volume = 0.8; // Volumen

            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            utterance.onerror = (event) => {
                console.error('Error en síntesis de voz:', event.error);
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    // Función para detener la síntesis de voz
    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            (recognitionRef.current as any).start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            (recognitionRef.current as any).stop();
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage: Message = { 
            id: Date.now() + "-user", 
            sender: "user", 
            text: input 
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);
        try {
            // Pasar el historial completo de la conversación (sin IDs para la API)
            const conversationHistory = messages.map(msg => ({
                sender: msg.sender,
                text: msg.text
            }));
            const aiResponse = await geminiService.generateContent(input, conversationHistory);
            const aiMessage: Message = { 
                id: Date.now() + "-ai", 
                sender: "ai", 
                text: aiResponse || "No se pudo obtener una respuesta." 
            };
            setMessages((prev) => [...prev, aiMessage]);
            
            // Reproducir automáticamente la respuesta del AI
            if (aiResponse && speechSynthesisSupported) {
                setTimeout(() => {
                    speakText(aiResponse);
                }, 500); // Pequeña pausa antes de hablar
            }
        } catch (error) {
            console.error("Error en la conversación:", error);
            const errorMessage: Message = { 
                id: Date.now() + "-error", 
                sender: "ai", 
                text: "Hubo un error al obtener la respuesta." 
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div className="flex flex-col h-[500px] max-w-xl mx-auto mt-6 border border-orange-300 bg-orange-100 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-orange-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-16">¡Empieza la conversación!</div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`flex items-start gap-2 max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div
                                className={`px-4 py-2 rounded-2xl text-sm shadow-md whitespace-pre-line break-words "
                                    ${msg.sender === "user"
                                        ? "bg-orange-400 text-white rounded-br-md"
                                        : "bg-white text-gray-800 border border-orange-200 rounded-bl-md"}
                                `}
                            >
                                {msg.text}
                            </div>
                            
                            {/* Botón de reproducir/pausar para mensajes del AI */}
                            {msg.sender === "ai" && speechSynthesisSupported && (
                                <button
                                    onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.text)}
                                    className={`p-1 rounded-full shadow-sm transition-colors ${
                                        isSpeaking 
                                            ? "bg-red-500 text-white hover:bg-red-600" 
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                                    title={isSpeaking ? "Detener reproducción" : "Reproducir mensaje"}
                                >
                                    {isSpeaking ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2 rounded-2xl bg-white border border-orange-200 text-gray-500 text-sm shadow-md animate-pulse">
                            Escribiendo...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center gap-2 p-4 border-t border-orange-200 bg-orange-50">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu mensaje o usa el micrófono..."
                    className="flex-1 p-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-800"
                />
                
                {/* Botón del micrófono */}
                {speechSupported && (
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={`p-2 rounded-xl font-semibold shadow transition-colors ${
                            isListening 
                                ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" 
                                : "bg-gray-400 text-white hover:bg-gray-500"
                        }`}
                        title={isListening ? "Detener grabación" : "Comenzar grabación de voz"}
                    >
                        {isListening ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
                    </button>
                )}
                
                <button
                    onClick={sendMessage}
                    className="px-5 py-2 bg-orange-400 text-white rounded-xl font-semibold shadow hover:bg-orange-500 transition-colors"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}
