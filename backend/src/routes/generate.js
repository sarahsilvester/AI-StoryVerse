import express from 'express';

const router = express.Router();

// Simulated stories for offline fallback mode
const STORY_TEMPLATES = {
  fantasy: [
    {
      title: "The Legend of the Golden Lantern",
      scenes: [
        {
          sceneNumber: 1,
          narrative: "Deep in the Whispering Woods, a young apprentice named Aria discovered a glowing golden lantern buried beneath the roots of an ancient elder tree.",
          imagePrompt: "A young female apprentice Aria with brown braids and explorer robes, discovering a glowing golden lantern under ancient tree roots in a magical forest, fantasy illustration"
        },
        {
          sceneNumber: 2,
          narrative: "As Aria wiped away the dirt, the lantern flared to life, projecting a holographic map of light that pointed towards the floating spires of Mount Celestis.",
          imagePrompt: "Aria holding a glowing lantern projecting a beautiful light map, magical blue and yellow beams, fantasy forest background, detailed illustration"
        },
        {
          sceneNumber: 3,
          narrative: "Her journey was met with danger. A stone gargoyle blocked the bridge of spires, demanding she solve the riddle of the wind before passing.",
          imagePrompt: "Aria standing before a giant stone gargoyle perched on a crumbling bridge above clouds, mountain spires in background, epic scene"
        },
        {
          sceneNumber: 4,
          narrative: "Answering wisely, Aria watched the gargoyle turn to dust. She reached the apex and placed the lantern on the altar, restoring eternal light to the kingdom.",
          imagePrompt: "Aria placing a glowing golden lantern on a white marble altar at the peak of a high spire, golden sunlight bursting, majestic climax"
        }
      ]
    }
  ],
  sci_fi: [
    {
      title: "Echoes of Sector 9",
      scenes: [
        {
          sceneNumber: 1,
          narrative: "Pilot Jax navigated his scout ship through the neon-charged nebulae of Sector 9, hunting for the source of a mysterious, repeating energy signature.",
          imagePrompt: "Sleek scout spaceship flying through a vibrant neon purple and cyan space nebula, cockpit view, futuristic sci-fi illustration"
        },
        {
          sceneNumber: 2,
          narrative: "The signal led him to a colossal, abandoned space station that drifted silently in the shadow of a dying star.",
          imagePrompt: "Massive retro-futuristic dark space station orbiting a huge glowing red dying star, sci-fi concept art"
        },
        {
          sceneNumber: 3,
          narrative: "Exploring the dark corridors of the station, Jax's flashbeam illuminated a sleeping hyper-computer, its core pulsing like a mechanical heart.",
          imagePrompt: "Space pilot Jax in a white space helmet and visor, shining a flashlight on a glowing holographic computer core pulsing with blue light"
        },
        {
          sceneNumber: 4,
          narrative: "When he accessed the terminal, a message from the ancient founders appeared, revealing that Sector 9 was not empty, but waiting to be reborn.",
          imagePrompt: "Jax looking at a large wall-sized futuristic computer screen displaying glowing alien symbols and star maps, awe-inspiring revelation"
        }
      ]
    }
  ],
  adventure: [
    {
      title: "The Lost Temple of the Sun",
      scenes: [
        {
          sceneNumber: 1,
          narrative: "Renowned explorer Leo hacked through the dense vines of the Amazon, guided by a weathered parchment showing the location of the Sun Temple.",
          imagePrompt: "A rugged male explorer Leo in a fedora hat and leather jacket, using a machete to cut through thick green jungle vines, detailed digital painting"
        },
        {
          sceneNumber: 2,
          narrative: "Suddenly, the ground gave way, sending him sliding down a steep mossy tunnel into a vast cavern glittering with gold coins and ancient relics.",
          imagePrompt: "Leo sliding down a rocky cavern slide into a massive underground treasure room filled with chest boxes and gold, adventure illustration"
        },
        {
          sceneNumber: 3,
          narrative: "At the center of the room stood a stone dial. Leo carefully aligned the hieroglyphs to match the alignment of the sun above.",
          imagePrompt: "Leo turning a heavy circular stone dial carved with solar symbols, dusty sunbeams shining through a hole in the ceiling"
        },
        {
          sceneNumber: 4,
          narrative: "With a deafening rumble, the cavern walls opened, revealing a legendary golden artifact that radiated warmth and energy.",
          imagePrompt: "Leo holding a radiant golden sun medallion that shines intensely, illuminating the ancient chamber, cinematic lighting"
        }
      ]
    }
  ],
  mystery: [
    {
      title: "The Case of the Clockwork Key",
      scenes: [
        {
          sceneNumber: 1,
          narrative: "Detective Silas stood in the study of the late clockmaker, examining a strange clockwork key that wound a mechanism that did not seem to exist.",
          imagePrompt: "Silas, a detective in a tweed coat and holding a magnifying glass, inspecting a complex brass clockwork key in a dimly lit Victorian study, noir style"
        },
        {
          sceneNumber: 2,
          narrative: "He noticed a faint tick-tock coming from behind the heavy mahogany bookcase. Silas found a secret keyhole hidden within the bookshelf design.",
          imagePrompt: "Silas inserting a brass key into a hidden slot inside a wooden bookshelf, shadows and warm candlelight, mystery illustration"
        },
        {
          sceneNumber: 3,
          narrative: "The bookcase swung open, revealing a hidden stairwell. Silas followed it down, his shadow stretching long against the cold stone walls.",
          imagePrompt: "Silas walking down a narrow secret stone staircase with a candle lantern, brick walls, mysterious atmosphere"
        },
        {
          sceneNumber: 4,
          narrative: "At the bottom, he found the clockmaker's master blueprint, revealing that the entire city was built atop a gigantic, ticking clockwork engine.",
          imagePrompt: "Silas holding a large blue blueprint showing gears under a city layout, expressions of shock, clockwork gears visible in background"
        }
      ]
    }
  ],
  education: [
    {
      title: "The Magic of Photosynthesis",
      scenes: [
        {
          sceneNumber: 1,
          narrative: "Meet Professor Pip, a tiny green leaf pixie who loves teaching about the secret superpowers of plants.",
          imagePrompt: "Professor Pip, a friendly cartoon leaf pixie wearing glasses and a tiny scientist coat, standing on a bright green oak leaf, cheerful educational illustration"
        },
        {
          sceneNumber: 2,
          narrative: "Pip explains how leaves catch sunlight like solar panels. They combine water from the roots and carbon dioxide from the air.",
          imagePrompt: "Professor Pip explaining with a glowing whiteboard showing water, CO2 and yellow sun rays hitting a leaf, colorful infographics"
        },
        {
          sceneNumber: 3,
          narrative: "Inside the leaf cells, tiny green machines called chloroplasts cook up glucose, which is sweet food that helps the plant grow big and strong.",
          imagePrompt: "Cute cartoon chloroplast cells inside a leaf working like a mini kitchen, producing little sugar crystals, cute educational style"
        },
        {
          sceneNumber: 4,
          narrative: "As a byproduct, plants release fresh oxygen back into the air, allowing all of us to breathe and live on Earth!",
          imagePrompt: "Professor Pip floating happily in the air blowing out bubbles of oxygen, smiling trees and kids in the background, bright and sunny"
        }
      ]
    }
  ]
};

// Generate Story Endpoint
router.post('/', async (req, res) => {
  const { prompt, genre, style, characters } = req.body;
  
  if (!prompt || !genre || !style) {
    return res.status(400).json({ error: 'Missing prompt, genre, or style parameter' });
  }

  // Check for API Keys in request headers (sent from frontend Settings)
  const geminiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;
  const openaiKey = req.headers['x-openai-key'] || process.env.OPENAI_API_KEY;

  let storyResult;

  if (geminiKey) {
    try {
      storyResult = await generateWithGemini(prompt, genre, style, characters, geminiKey);
    } catch (err) {
      console.error('Gemini generation failed, falling back to simulated engine:', err.message);
    }
  } else if (openaiKey) {
    try {
      storyResult = await generateWithOpenAI(prompt, genre, style, characters, openaiKey);
    } catch (err) {
      console.error('OpenAI generation failed, falling back to simulated engine:', err.message);
    }
  }

  // If no API keys or if API calls failed, fall back to simulated story generator
  if (!storyResult) {
    storyResult = generateSimulatedStory(prompt, genre, style, characters);
  }

  // Post-process: Add Pollinations.ai image URLs to each scene
  const seedBase = Math.floor(Math.random() * 100000);
  storyResult.scenes = storyResult.scenes.map((scene, index) => {
    // Inject character details into image prompt if characters are present
    let modifiedPrompt = scene.imagePrompt;
    if (characters && characters.length > 0) {
      modifiedPrompt = `featuring ${characters.join(' and ')}, ` + modifiedPrompt;
    }
    
    // Construct Pollinations.ai URL with style parameters
    const seed = seedBase + index;
    const finalStyle = style.toLowerCase();
    
    // Customize prompt extension depending on style
    let styleKeyword = 'digital art';
    if (finalStyle === 'comic book') styleKeyword = 'comic book panel illustration, halftone lines, bold ink';
    else if (finalStyle === 'anime') styleKeyword = 'anime key visual, modern manga style, vibrant lighting';
    else if (finalStyle === 'watercolor') styleKeyword = 'watercolor wash painting, soft texture, artistic splash';
    else if (finalStyle === 'cyberpunk') styleKeyword = 'cyberpunk neon style, dark alleys, glowing lights, unreal engine';
    else if (finalStyle === 'classic noir') styleKeyword = 'classic film noir style, monochrome, high contrast, moody shadows, 1940s';

    const cleanPrompt = encodeURIComponent(`${modifiedPrompt}, ${styleKeyword}, detailed background, 8k resolution, cinematic composition`);
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=500&nologo=true&seed=${seed}`;
    
    // Estimate audio duration based on narration word count (approx 130 words per minute / 2.2 words per second)
    const wordCount = scene.narrative.split(/\s+/).length;
    const duration = Math.max(5, Math.ceil(wordCount / 2.2) + 1);

    return {
      ...scene,
      imageUrl,
      duration
    };
  });

  res.json({
    title: storyResult.title,
    prompt,
    genre,
    style,
    characters: characters || [],
    scenes: storyResult.scenes,
    createdAt: new Date().toISOString()
  });
});

// --- AI Service Calls ---

async function generateWithGemini(prompt, genre, style, characters, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const characterContext = characters && characters.length > 0
    ? `The story must feature these characters: ${characters.join(', ')}.`
    : '';

  const systemInstruction = `You are a creative writer and storyboard artist. Generate a complete story in JSON format based on the prompt. 
The output MUST be a valid JSON object matching this structure exactly (do not output markdown or wrapping except the JSON itself):
{
  "title": "A short engaging title for the story",
  "scenes": [
    {
      "sceneNumber": 1,
      "narrative": "Story narration script for scene 1 (approx 20-40 words). This will be spoken by Text-to-Speech.",
      "imagePrompt": "A highly detailed visual prompt describing the scene for an image generator. Describe the setting, characters, actions, and framing. Do not mention artist names."
    }
  ]
}
Generate exactly 4 chronological scenes to form a complete beginning, middle, climax, and resolution.
Make the story fit the genre: ${genre} and style: ${style}. ${characterContext}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `Prompt: ${prompt}\n\nSystem Instructions:\n${systemInstruction}` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  const rawText = json.contents[0].parts[0].text;
  
  // Clean raw text if wrapped in markdown code blocks
  const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJsonText);
}

async function generateWithOpenAI(prompt, genre, style, characters, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completypes'; // Use standard v1/chat/completions
  
  const characterContext = characters && characters.length > 0
    ? `The story must feature these characters: ${characters.join(', ')}.`
    : '';

  const systemPrompt = `You are a creative writer and storyboard artist. Generate a complete story in JSON format based on the prompt.
The output MUST be a valid JSON object matching this structure exactly:
{
  "title": "A short engaging title",
  "scenes": [
    {
      "sceneNumber": 1,
      "narrative": "Story narration script (20-40 words).",
      "imagePrompt": "Detailed visual prompt describing the scene characters and settings for image generator."
    }
  ]
}
Generate exactly 4 scenes. Genre: ${genre}. Style: ${style}. ${characterContext}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // or gpt-4o-mini
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Write a story about: ${prompt}` }
      ],
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  return JSON.parse(json.choices[0].message.content);
}

// --- Simulated Story Generator ---

function generateSimulatedStory(prompt, genre, style, characters) {
  const genreLower = genre.toLowerCase();
  const templates = STORY_TEMPLATES[genreLower] || STORY_TEMPLATES.fantasy;
  const baseTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Customize the template based on the user's prompt
  const title = `The Quest: ${prompt.length > 25 ? prompt.substring(0, 25) + '...' : prompt}`;
  
  const scenes = baseTemplate.scenes.map((scene, idx) => {
    let narrative = scene.narrative;
    let imagePrompt = scene.imagePrompt;

    // Sub in prompt themes if possible to personalize the simulated output
    if (idx === 0) {
      narrative = `Our tale begins with a grand vision. Inspired by the idea of '${prompt}', ` + narrative.substring(narrative.indexOf(' ')+1);
    }
    
    return {
      sceneNumber: scene.sceneNumber,
      narrative,
      imagePrompt
    };
  });

  return {
    title,
    scenes
  };
}

export default router;
