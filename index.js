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

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const VOICES = {
    host1: "21m00Tcm4TlvDq8ikWAM", // Rachel
    host2: "AZnzlk1XvdvUeBnXmlld"  // Domi
};

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
                content: `Convert this text into an interview-style podcast script. Host 1 should ask engaging questions about the content, and Host 2 should provide detailed, informative answers. Make it conversational and natural. Each line should start with either "Host 1:" or "Host 2:". Host 1 should focus on asking questions that would help listeners better understand the topic, and Host 2 should provide clear, comprehensive answers. Format example:

Host 1: [Question about a key point]
Host 2: [Detailed answer explaining the concept]
Host 1: [Follow-up question to dig deeper]
Host 2: [Elaborated response with examples]

Here's the text to convert: ${text}`
            }]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}


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

async function processScript(script, outputFile) {
    const lines = script.split('\n').filter(line => line.trim());
    let currentSpeaker = 'host1';
    let totalLines = lines.length;

    console.log('Converting script to speech with multiple voices...');

    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
            const text = line.replace(/^(Host \d:)/, '').trim();
            if (text) {
                console.log(`Converting line ${i + 1}/${totalLines}: ${text.substring(0, 50)}...`);
                try {
                    const audioBuffer = await textToSpeech(text, VOICES[currentSpeaker]);
                    
                    if (i === 0) {
                        await fs.writeFile(outputFile, audioBuffer);
                    } else {
                        
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


async function main() {
    try {
        
        const inputFile = process.argv[2];
        const outputFile = process.argv[3];

        if (!inputFile || !outputFile) {
            console.error('Usage: node index.js <input-pdf> <output-mp3>');
            process.exit(1);
        }

        console.log('Starting PDF to Podcast conversion...');
        console.log('Input PDF:', path.resolve(inputFile));
        console.log('Output MP3:', path.resolve(outputFile));

        
        console.log('Extracting text from PDF...');
        const text = await extractTextFromPDF(inputFile);
        console.log('Extracted text length:', text.length);

     
        console.log('\nGenerating interactive script...');
        console.log('Text to summarize length:', text.length);
        const script = await getSummary(text);
        console.log('Summary length:', script.length);
        
       
        console.log('\nGenerated Script:');
        console.log(script);

      
        await processScript(script, outputFile);
        console.log('\nPodcast created successfully!');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
