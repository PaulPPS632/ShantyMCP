import { GoogleGenAI, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import axios from "axios";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API Key");
}

const serverParams = new StdioClientTransport({
  command: "node", // Executable
  args: [
    "C:\\Users\\zxite\\OneDrive\\Documentos\\Visual Studio Code\\spotify-mcp-server\\build\\index.js",
  ], // MCP Server
});

const client = new Client({
  name: "example-client",
  version: "1.0.0",
});

const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  async generateContent(prompt: string) {
    try {
      await client.connect(serverParams);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [prompt],
        config: {
          systemInstruction: "Eres un peruano y respondes usando muchas jergas",
          tools: [mcpToTool(client)],
        },
      });
    //   let responseText = response.text;
    //   if (responseText!.startsWith("CALL_MCP:")) {
    //     const toolQuery = responseText!.replace("CALL_MCP:", "").trim();

    //     // Llamada al servidor MCP local
    //     const mcpResponse = await axios.post("http://localhost:9000/mcp", {
    //       query: toolQuery,
    //     });

    //     // Combinar respuesta
    //     responseText = `Resultado MCP: ${JSON.stringify(mcpResponse.data)}`;
    //   }
      return response.text;
    } catch (error) {
      console.error("Error al generar contenido con Gemini:", error);
      throw new Error("Failed to generate content from Gemini");
    }
  },
};
