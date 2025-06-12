const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

async function synthesizeSpeech(text) {
  const request = {
    input: { text },
    voice: { languageCode: 'es-MX', ssmlGender: 'FEMALE', name: 'es-MX-Standard-A' },
    audioConfig: { audioEncoding: 'MP3' }
  };
  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent;
}

module.exports = { synthesizeSpeech };
