# PDF to Podcast Converter

Convert your PDF documents into engaging podcast-style audio content using AI-powered text summarization and natural-sounding voices.

[![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://github.com/kstubhieeee/pdf-to-podcast)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

## 🌟 Features

- **PDF Text Extraction**: Automatically extracts text from PDF documents
- **AI-Powered Summarization**: Uses OpenRouter AI (Mixtral-8x7B) to create engaging dialogue scripts
- **Natural Voice Synthesis**: Converts text to speech using ElevenLabs' high-quality voices
- **Interactive Format**: Creates a dynamic conversation between two hosts
- **Progress Tracking**: Real-time conversion progress monitoring
- **Error Handling**: Comprehensive error management and reporting

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.11.1 or later)
- API Keys:
  - [OpenRouter API Key](https://openrouter.ai/)
  - [ElevenLabs API Key](https://elevenlabs.io/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kstubhieeee/pdf-to-podcast.git
   cd pdf-to-podcast
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

## 📚 Usage

Convert a PDF to an MP3 podcast:

```bash
node index.js input.pdf output.mp3
```

Example:
```bash
node index.js javascript_basics.pdf javascript_podcast.mp3
```

## 🎛️ Configuration

### Voice Settings

The application uses two different voices for an engaging conversation:
- Host 1: Rachel (ElevenLabs voice ID: "21m00Tcm4TlvDq8ikWAM")
- Host 2: Domi (ElevenLabs voice ID: "AZnzlk1XvdvUeBnXmlld")

You can modify the voice settings in `index.js`:
```javascript
const VOICES = {
    host1: "21m00Tcm4TlvDq8ikWAM", // Rachel
    host2: "AZnzlk1XvdvUeBnXmlld"  // Domi
};
```

### Voice Parameters

Adjust the voice characteristics in the `textToSpeech` function:
```javascript
voice_settings: {
    stability: 0.5,        // Range: 0-1
    similarity_boost: 0.5  // Range: 0-1
}
```

## 🔧 Technical Details

- **PDF Parsing**: Uses `pdf2json` for reliable text extraction
- **Text Processing**: Implements smart text segmentation for natural conversation flow
- **Audio Processing**: Direct buffer handling for efficient audio concatenation
- **Error Handling**: Comprehensive error catching and reporting
- **Progress Tracking**: Real-time progress updates during conversion

## 📝 Error Handling

The application handles various error scenarios:
- Missing command line arguments
- PDF reading errors
- API communication issues
- Audio processing errors
- File system operations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [OpenRouter AI](https://openrouter.ai/) for text summarization
- [ElevenLabs](https://elevenlabs.io/) for text-to-speech conversion
- [pdf2json](https://www.npmjs.com/package/pdf2json) for PDF parsing

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/kstubhieeee/pdf-to-podcast/issues) on GitHub. 