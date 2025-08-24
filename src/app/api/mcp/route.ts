import { NextResponse } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenAI, mcpToTool } from "@google/genai";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export async function POST(req: Request) {
  const { prompt, conversationHistory = [] } = await req.json();

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const argsSpotify = process.env.NEXT_PUBLIC_PATH_SPOTIFY_MCP || "D:\\Proyectos\\TESIS\\mcps\\spotify-mcp-server\\build\\index.js";
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }
  /*
  const serverParams = new StdioClientTransport({
    command: "node",
    args: [
      argsSpotify
    ],
  });

  const client = new Client({
    name: "example-client",
    version: "1.0.0",
  });

  const groundingTool = {
    googleSearch: {},
  };  
*/

  // google sheets
  const transport = new SSEClientTransport(
    new URL("http://localhost:8787/sse"), {
      eventSourceInit: {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${userToken}`, // tu token desde el front
        },
      },
  });
  const clientsheets = new Client({ name: "Google Sheets", version: "1.0.0" });
  await clientsheets.connect(transport);
  const myMcpToolSheets = mcpToTool(clientsheets);


  const ai = new GoogleGenAI({ apiKey });

  try {
    //await client.connect(serverParams);

    // Convertir el historial de conversación al formato de Gemini
    const contents = [];
    
    // Agregar mensajes del historial
    conversationHistory.forEach((message: Message) => {
      if (message.sender === 'user') {
        contents.push({ role: 'user', parts: [{ text: message.text }] });
      } else {
        contents.push({ role: 'model', parts: [{ text: message.text }] });
      }
    });
    
    // Agregar el prompt actual
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        //systemInstruction: "Eres un peruano y respondes usando muchas jergas",
        //mcpToTool(client), 
        tools: [myMcpToolSheets],
      },
    });

    return NextResponse.json({ text: response.text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error procesando MCP" }, { status: 500 });
  }
}
