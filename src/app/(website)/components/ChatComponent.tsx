import { useState, useRef, useEffect } from "react";
import { geminiService } from "@/services/geminiService";

export default function ChatComponent() {
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);
        try {
            const aiResponse = await geminiService.generateContent(input);
            const aiMessage = { sender: "ai", text: aiResponse || "No se pudo obtener una respuesta." };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { sender: "ai", text: "Hubo un error al obtener la respuesta." };
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
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-md whitespace-pre-line break-words "
                                ${msg.sender === "user"
                                    ? "bg-orange-400 text-white rounded-br-md"
                                    : "bg-white text-gray-800 border border-orange-200 rounded-bl-md"}
                            `}
                        >
                            {msg.text}
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
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 p-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-800"
                />
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
