'use client';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Estimate tokens before making the API call
export function estimateTokens(text) {
  // A very rough estimation: ~4 characters per token
  // This is a simplified estimate and may not match exactly with Gemini's tokenization
  return Math.ceil(text.length / 4);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function attemptWithRetry(fn, retries = MAX_RETRIES, currentAttempt = 1) {
  try {
    return await fn();
  } catch (error) {
    if (
      currentAttempt < retries && 
      (error.message?.includes('Failed to fetch') || 
       error.message?.includes('network') ||
       error.message?.includes('timeout'))
    ) {
      console.log(`Attempt ${currentAttempt} failed, retrying in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY * currentAttempt); // Exponential backoff
      return attemptWithRetry(fn, retries, currentAttempt + 1);
    }
    throw error;
  }
}

export async function generateResponse(message, onToken) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.');
  }

  let genAI;
  let model;
  let chat;

  try {
    // Initialize the Gemini API client
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Get the model and configure it
    model = genAI.getGenerativeModel({
      model: "gemini-1.0-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Create a chat and send the message with retry logic
    chat = model.startChat();
    const result = await attemptWithRetry(async () => {
      return await chat.sendMessageStream(message);
    });

    let fullText = '';

    try {
      // Process the stream with retry logic for each chunk
      for await (const chunk of result.stream) {
        await attemptWithRetry(async () => {
          const chunkText = chunk.text();
          if (chunkText) {
            fullText += chunkText;
            if (onToken) {
              onToken(chunkText);
            }
            // Small delay to allow for UI updates
            await delay(10);
          }
        });
      }
    } catch (streamError) {
      console.error('Streaming error:', {
        name: streamError.name,
        message: streamError.message,
        stack: streamError.stack,
        raw: streamError
      });
      
      if (streamError.message?.includes('Failed to fetch')) {
        throw new Error('Network connection lost. Please check your internet connection and try again.');
      }
      
      throw new Error(`Error while receiving response: ${streamError.message}`);
    }

    if (!fullText.trim()) {
      throw new Error('No response generated from the model');
    }

    return {
      message: fullText.trim(),
      tokens: Math.ceil(fullText.length / 4) // Approximate token count
    };

  } catch (error) {
    // Log the complete error object for debugging
    console.error('Gemini API error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      raw: error
    });

    // Provide more specific error messages
    if (error.message?.includes('API key')) {
      throw new Error('Invalid or missing API key. Please check your NEXT_PUBLIC_GEMINI_API_KEY configuration.');
    } else if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
      throw new Error('Unable to connect to Gemini API after several attempts. Please check your internet connection and try again.');
    } else if (error.message?.includes('SAFETY')) {
      throw new Error('The message was blocked due to safety concerns. Please try rephrasing your request.');
    } else {
      throw new Error(`Failed to generate response: ${error.message || 'Unknown error'}`);
    }
  }
}
