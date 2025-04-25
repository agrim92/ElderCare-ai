import AWS from 'aws-sdk';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS Lex
const lexRuntime = new AWS.LexRuntimeV2({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

app.use(express.json());
app.use(express.static('public'));

// Alexa Lex endpoint
app.post('/api/alexa', async (req, res) => {
  try {
    const params = {
      botId: process.env.LEX_BOT_ID,
      botAliasId: process.env.LEX_BOT_ALIAS_ID,
      localeId: 'en_US',
      sessionId: req.session.id,
      text: req.body.message
    };

    const response = await lexRuntime.recognizeText(params).promise();
    res.json({
      message: response.messages[0].content,
      audio: response.audioStream
    });
  } catch (error) {
    res.status(500).json({ error: "Alexa service error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
