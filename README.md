# PDF to Podcast Converter

This Node.js application converts PDF documents into podcast-style audio files using OpenRouter AI for text summarization and ElevenLabs for text-to-speech conversion.

## Features

- PDF text extraction
- AI-powered text summarization
- High-quality text-to-speech conversion
- Error handling and logging

## Prerequisites

- Node.js installed on your system
- OpenRouter API key
- ElevenLabs API key

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your API keys:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

## Usage

1. Place your PDF file in the project directory (default name: `input.pdf`)
2. Run the application:
   ```bash
   node index.js
   ```
3. The converted audio file will be saved as `output.mp3`

## Customization

You can modify the following parameters in `index.js`:
- Input PDF path
- Output audio file path
- ElevenLabs voice settings
- Summarization prompt

## Error Handling

The application includes comprehensive error handling for:
- PDF reading errors
- API communication issues
- File system operations

## License

ISC 