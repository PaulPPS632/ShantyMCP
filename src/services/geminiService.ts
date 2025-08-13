interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export const geminiService = {
  async generateContent(prompt: string, conversationHistory: Message[] = []) {
    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          conversationHistory 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en el servidor");
      return data.text;
    } catch (error) {
      console.error("Error al llamar API chat:", error);
      throw error;
    }
  },
};
