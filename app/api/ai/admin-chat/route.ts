import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/ai/gemini-client';
import { adminOS } from '@/lib/services/admin-os';

import { toolsDefinition, toolsImplementation } from '@/lib/ai/tools';

export async function POST(req: NextRequest) {
    try {
        const { message, context = [] } = await req.json();
        const model = await getGeminiModel();

        // System Prompt
        const systemPrompt = `
            You are the "AI CTO" of Altus Ink. Name: Gemini.
            Current Time: ${new Date().toLocaleString('pt-BR')}
            
            You have access to REAL-TIME database tools.
            When a user asks for data (bookings, availability), USE THE TOOLS.
            Do not guess. If you need to use a tool, output a Function Call.
            
            Style:
            - Respond in Portuguese (BR).
            - Be professional and executive.
            - Format details nicely using Markdown lists.
        `;

        // 1. First Call: Send Message + Tools
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Entendido. Sistemas online." }] },
                ...context.map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }))
            ],
            tools: [{ functionDeclarations: toolsDefinition } as any]
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const call = response.functionCalls()?.[0];

        // 2. Handle Function Call (if any)
        if (call) {
            const toolName = call.name;
            const args = call.args;
            
            // @ts-ignore
            if (toolsImplementation[toolName]) {
                // @ts-ignore
                const toolOutput = await toolsImplementation[toolName](args);
                
                // Send the tool output back to the model to generate the final natural language response
                const finalResult = await chat.sendMessage([
                    {
                        functionResponse: {
                            name: toolName,
                            response: { result: toolOutput }
                        }
                    }
                ]);
                
                return NextResponse.json({ success: true, message: finalResult.response.text() });
            }
        }

        // If no function call, just return the text
        return NextResponse.json({ success: true, message: response.text() });

    } catch (error: any) {
        console.error('AI Chat Error:', error);
        return NextResponse.json(
            { success: false, error: "Erro ao processar IA: " + error.message },
            { status: 500 }
        );
    }
}
