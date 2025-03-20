import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import { createRequire } from 'module';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// API Keys from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voice IDs for different hosts
const VOICES = {
    host1: "21m00Tcm4TlvDq8ikWAM", // Rachel
    host2: "AZnzlk1XvdvUeBnXmlld"  // Domi
};

// Function to extract text from PDF
async function extractTextFromPDF(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const text = pdfData.Pages
                .map(page => page.Texts.map(text => decodeURIComponent(text.R[0].T)).join(' '))
                .join('\n');
            resolve(text);
        });

        pdfParser.on("pdfParser_dataError", reject);

        pdfParser.loadPDF(pdfPath);
    });
}

// Function to get summary from OpenRouter API
async function getSummary(text) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [{
                role: "user",
                content: `Please convert this text into an engaging dialogue script between two podcast hosts. Make it conversational and natural, with each host taking turns to discuss different points. Format the output with "Host 1:" and "Host 2:" prefixes for each line: ${text}`
            }]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

// Function to convert text to speech using ElevenLabs API
async function textToSpeech(text, voiceId) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        })
    });

    if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
}

// Function to process the script and create audio
async function processScript(script, outputFile) {
    const lines = script.split('\n').filter(line => line.trim());
    let currentSpeaker = 'host1';
    let totalLines = lines.length;

    console.log('Converting script to speech with multiple voices...');

    // Process each line and append to the output file
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
            const text = line.replace(/^(Host \d:)/, '').trim();
            if (text) {
                console.log(`Converting line ${i + 1}/${totalLines}: ${text.substring(0, 50)}...`);
                try {
                    const audioBuffer = await textToSpeech(text, VOICES[currentSpeaker]);
                    
                    // For the first line, create or overwrite the file
                    if (i === 0) {
                        await fs.writeFile(outputFile, audioBuffer);
                    } else {
                        // For subsequent lines, append to the file
                        const fd = await fs.open(outputFile, 'a');
                        await fd.write(audioBuffer);
                        await fd.close();
                    }
                    
                    currentSpeaker = currentSpeaker === 'host1' ? 'host2' : 'host1';
                    console.log(`Progress: ${Math.round(((i + 1) / totalLines) * 100)}%`);
                } catch (error) {
                    console.error(`Error processing line ${i + 1}:`, error.message);
                    throw error;
                }
            }
        }
    }
}

// Main function
async function main() {
    try {
        // Get command line arguments
        const inputFile = process.argv[2];
        const outputFile = process.argv[3];

        if (!inputFile || !outputFile) {
            console.error('Usage: node index.js <input-pdf> <output-mp3>');
            process.exit(1);
        }

        console.log('Starting PDF to Podcast conversion...');
        console.log('Input PDF:', path.resolve(inputFile));
        console.log('Output MP3:', path.resolve(outputFile));

        // Extract text from PDF
        console.log('Extracting text from PDF...');
        const text = await extractTextFromPDF(inputFile);
        console.log('Extracted text length:', text.length);

        // Generate interactive script
        console.log('\nGenerating interactive script...');
        console.log('Text to summarize length:', text.length);
        const script = await getSummary(text);
        console.log('Summary length:', script.length);
        
        // Print the script for debugging
        console.log('\nGenerated Script:');
        console.log(script);

        // Convert script to audio
        await processScript(script, outputFile);
        console.log('\nPodcast created successfully!');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
