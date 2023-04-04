import axios from 'axios';

const API_URL = `${window.location.protocol}//${window.location.hostname}:5100/api`;

const kobold_defaults = {
  "max_context_length": 2048,
  "max_length": 180,
	"rep_pen": 1.1,
	"rep_pen_slope": 0.9,
	"rep_pen_range": 1024,
	"temperature": 0.71,
	"top_p": 0.9,
	"top_k": 40,
	"top_a": 0.0,
	"tfs": 1,
	"typical": 1.0,
	"sampler_order": [
		6,
		0,
		1,
		2,
		3,
		4,
		5
	],
}
const ooba_defaults = {
  'max_new_tokens': 200,
  'do_sample': true,
  'temperature': 0.5,
  'top_p': 0.9,
  'typical_p': 1,
  'repetition_penalty': 1.05,
  'encoder_repetition_penalty': 1.0,
  'top_k': 0,
  'min_length': 0,
  'no_repeat_ngram_size': 0,
  'num_beams': 1,
  'penalty_alpha': 0,
  'length_penalty': 1,
  'early_stopping': false,
};
  function getSettings(endpointType) {
    const settings = localStorage.getItem('generationSettings');
    if (endpointType === 'Kobold' || endpointType === 'Horde') {
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        const customSettings = {
        'max_context_length': parsedSettings.max_context_length,
        'max_length': parsedSettings.max_length,
        'rep_pen': parsedSettings.rep_pen,
        'rep_pen_slope': parsedSettings.rep_pen_range,
        'rep_pen_range': parsedSettings.rep_pen_slope,
        'sampler_full_determinism': parsedSettings.sampler_full_determinism,
        'singleline': parsedSettings.singleline,
        'temperature': parsedSettings.temperature,
        'tfs': parsedSettings.tfs,
        'top_a': parsedSettings.top_a,
        'top_k': parsedSettings.top_k,
        'top_p': parsedSettings.top_p,
        'typical': parsedSettings.typical,
        'sampler_order': [
          6,
          0,
          1,
          2,
          3,
          4,
          5
        ],
        }
        return customSettings;
      }
    }else{
      return;
    }
  }
      
  function parseTextEnd(text, endpointType, results) {
    if(endpointType !== 'OAI') {
    return text.split("\n").map(line => line.trim());
  }
    else {
      const response = results[0]
      return response.split("\n").map(line => line.trim());
    }
  }
  
  export async function characterTextGen(character, history, endpoint, endpointType, image, configuredName) {
    let customSettings = null;
    let hordeModel = null;
    if(localStorage.getItem('generationSettings') !== null){
      if(endpointType === 'Kobold' || endpointType === 'Horde' || endpointType === 'OAI'){
        customSettings = getSettings(endpointType);
        console.log(customSettings);
      }
    }else if(endpointType === 'Kobold'){
      customSettings = kobold_defaults;
      console.log('Custom Settings failed. Using Kobold defaults.')
    } else if(endpointType === 'Ooba'){
      customSettings = ooba_defaults;
    } else if(endpointType === 'AkikoBackend'){
      customSettings = ooba_defaults;
    } else if(endpointType === 'Horde'){
      customSettings = kobold_defaults;
      hordeModel = localStorage.getItem('hordeModel');
    }
    else if(endpointType === 'OAI'){
      customSettings = kobold_defaults;
      console.log('Custom Settings failed. Using Kobold defaults.')
    }
  let imgText = null;
    if(image !== null){
      imgText = await handleImageSend(image, configuredName)
    }
    const basePrompt = character.name + "'s Persona:\n" + character.description + '\nScenario:' + character.scenario + '\nExample Dialogue:\n' + character.mes_example.replace('{{CHAR}}', character.name) + '\n';
    const convo = 'Current Conversation:\n' + history + (imgText ? imgText : '') +'\n';
    const createdPrompt = basePrompt + convo + character.name + ':';
    const response = await axios.post(API_URL + `/textgen/${endpointType}`, { endpoint: endpoint, prompt: createdPrompt, settings: customSettings, hordeModel: hordeModel ? hordeModel : 'PygmalionAI/pygmalion-6b', configuredName: configuredName ? configuredName : 'You'});

    const generatedText = response.data.results[0];
    if(endpointType !== 'OAI') {
      const parsedText = parseTextEnd(generatedText.text);
      const responseText = parsedText[0] !== undefined ? parsedText[0] : '';
      return responseText;
    } 
    else {
      return generatedText;
    }

  };  

  export async function handleImageSend(image, configuredName) {
    if(!image) return Promise.resolve(null);
    var reader = new FileReader();
    reader.readAsDataURL(image);
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = reader.result.split(",")[1];
        const payload = {
          image: base64data
        };
        try {
          const response = await axios.post(`${API_URL}/caption`, payload);
          const generatedText = response.data.caption;
          const formattedText = `[${configuredName} sends a ${generatedText}]`;
          resolve(formattedText);
        } catch (error) {
          reject(error);
        }
      }
    });
  };

  export async function classifyEmotion(generatedText) {
    const response = await axios.post(`${API_URL}/classify`, { text: generatedText });
    return response.data['classification'];
  };

  export async function getModelStatus() {
    var endpoint = localStorage.getItem('endpoint');
    var endpointType = localStorage.getItem('endpointType');
    const response = await axios.post(API_URL + '/textgen/status', { endpoint: endpoint, endpointType: endpointType});
    return response.data['result'];
  };