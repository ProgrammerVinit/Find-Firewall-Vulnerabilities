import express from 'express';
import multer from 'multer';  // To handle file uploads
import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Use PORT from environment or default to 3000
app.use(cors());
app.use(express.static(path.join(__dirname, 'build'))); // Serve static files

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('rules'), async (req, res) => {
    console.log('Received file:', req.file);  // Log file details

    try {
        const filePath = req.file.path;
        const fileData = fs.readFileSync(filePath, 'utf8');
        console.log('File content:', fileData);  // Log file content

        const finalQuestion = `${fileData} in 400 words`;

        // API Call to Generative Language API
        try {
            const apiKey = process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT;
            console.log('Using API Key:', apiKey);  // Ensure API key is logged

            const response = await axios({
              url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
              method: "post",
              data: {
                contents: [{ parts: [{ text: finalQuestion }] }],
              },
            });

            res.json({
                generatedContent: response.data.candidates[0].content.parts[0].text
            });
        } catch (apiError) {
            console.error('API call failed:', apiError.response ? apiError.response.data : apiError.message);
            return res.status(500).json({ error: "API call failed. Please try again." });
        }

    } catch (error) {
        console.error('Error processing file:', error);
        return res.status(500).json({ error: 'Error processing the file' });
    }
});

// Handle all other routes to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
