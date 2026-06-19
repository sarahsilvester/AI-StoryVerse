import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, Square, Film, ArrowLeft, Download, Volume2, VolumeX, RefreshCw } from 'lucide-react';

export default function CinemaPlayer() {
  const { activeStory, setActiveTab } = useApp();
  const canvasRef = useRef(null);
  
  // Animation & Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Refs for tracking playback variables
  const requestRef = useRef(null);
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef([]);
  const analyserRef = useRef(null);
  const utteranceRef = useRef(null);
  const imagesRef = useRef([]);
  const canvasStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const audioDestRef = useRef(null);

  // Ken Burns animation variables
  const animationProgressRef = useRef(0);
  const sceneStartTimeRef = useRef(0);

  const scenes = activeStory?.scenes || [];
  const genre = activeStory?.genre?.toLowerCase() || 'fantasy';

  // 1. Preload Images
  useEffect(() => {
    if (!activeStory) return;
    
    imagesRef.current = [];
    scenes.forEach((scene, i) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // critical for canvas capture stream
      img.src = scene.imageUrl;
      img.onload = () => {
        imagesRef.current[i] = img;
      };
    });

    return () => {
      stopPlayback();
    };
  }, [activeStory]);

  // 2. Procedural Audio Synthesizer (Web Audio API)
  const initAudio = () => {
    if (audioCtxRef.current) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Create Analyser Node for Visualizer
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;

    // Create destination for recording
    const dest = ctx.createMediaStreamDestination();
    audioDestRef.current = dest;

    // Split audio to system speakers and recording destination
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : 0.15, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGain.connect(dest);
    analyser.connect(masterGain);
  };

  const playBackgroundSynth = () => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop current synthesis nodes if active
    stopSynth();

    // Create ambient synthesizer based on Genre
    const analyser = analyserRef.current;
    
    if (genre === 'fantasy') {
      // Fantasy: Gentle flute-like sine wave scales
      createSynthLFO(ctx, analyser, 261.63, 'sine', 0.8, 12); // C4
      createSynthLFO(ctx, analyser, 329.63, 'sine', 1.2, 16); // E4
      createSynthLFO(ctx, analyser, 392.00, 'sine', 1.5, 20); // G4
    } else if (genre === 'sci_fi') {
      // Sci-Fi: Floating detuned space pads
      createSynthLFO(ctx, analyser, 110.00, 'sawtooth', 2.0, 4); // A2
      createSynthLFO(ctx, analyser, 220.00, 'triangle', 2.2, 5); // A3
      createSynthLFO(ctx, analyser, 330.00, 'sine', 1.8, 6); // E4
    } else if (genre === 'adventure') {
      // Adventure: Upbeat major chords
      createSynthLFO(ctx, analyser, 196.00, 'triangle', 0.5, 4); // G3
      createSynthLFO(ctx, analyser, 246.94, 'triangle', 0.7, 5); // B3
      createSynthLFO(ctx, analyser, 293.66, 'triangle', 0.9, 6); // D4
    } else if (genre === 'mystery') {
      // Mystery: Low minor triads and tick-tocks
      createSynthLFO(ctx, analyser, 98.00, 'sawtooth', 3.0, 3); // G2
      createSynthLFO(ctx, analyser, 146.83, 'sine', 4.0, 4); // D3
      createSynthLFO(ctx, analyser, 174.61, 'sine', 5.0, 5); // F3
    } else {
      // Educational: Upbeat bright square notes
      createSynthLFO(ctx, analyser, 261.63, 'sine', 0.4, 2);
      createSynthLFO(ctx, analyser, 349.23, 'triangle', 0.6, 3); // F4
      createSynthLFO(ctx, analyser, 523.25, 'sine', 0.8, 4); // C5
    }
  };

  const createSynthLFO = (ctx, destination, freq, type, rate, delayTime) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    amp.gain.setValueAtTime(0, ctx.currentTime);
    // Fade in
    amp.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3);

    // LFO to modulate filter cutoff
    lfo.frequency.setValueAtTime(rate, ctx.currentTime);
    lfoGain.gain.setValueAtTime(400, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    osc.connect(filter);
    filter.connect(amp);
    amp.connect(destination);

    osc.start();
    lfo.start();

    // Store refs to stop later
    synthNodesRef.current.push({ osc, lfo, amp });
  };

  const stopSynth = () => {
    synthNodesRef.current.forEach(({ osc, lfo, amp }) => {
      try {
        osc.stop();
        lfo.stop();
      } catch (err) {}
    });
    synthNodesRef.current = [];
  };

  // 3. Playback Loop
  const startPlayback = () => {
    if (scenes.length === 0) return;
    initAudio();
    setIsPlaying(true);
    playBackgroundSynth();
    
    sceneStartTimeRef.current = Date.now();
    animationProgressRef.current = 0;
    
    // Play voiceover narration for initial scene
    speakSceneNarration(currentSceneIdx);

    // Start drawing frame animation loop
    requestRef.current = requestAnimationFrame(animationLoop);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    stopSynth();
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentSceneIdx(0);
    window.speechSynthesis.cancel();
    stopSynth();
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Synchronized Text-to-Speech Narration
  const speakSceneNarration = (index) => {
    window.speechSynthesis.cancel();
    const scene = scenes[index];
    if (!scene) return;

    const utterance = new SpeechSynthesisUtterance(scene.narrative);
    utteranceRef.current = utterance;

    // Select suitable voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.toLowerCase().includes('google')) ||
                          voices.find(v => v.lang.includes('en')) ||
                          voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.95;

    // Transition trigger
    utterance.onend = () => {
      // Check if we are still playing and should advance
      if (isPlaying) {
        if (index < scenes.length - 1) {
          setCurrentSceneIdx(index + 1);
          sceneStartTimeRef.current = Date.now();
          animationProgressRef.current = 0;
          speakSceneNarration(index + 1);
        } else {
          // Finished story
          stopPlayback();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech error. Auto-advancing via timer.', e);
      // Fallback timer if speech crashes
      setTimeout(() => {
        if (isPlaying && index === currentSceneIdx) {
          if (index < scenes.length - 1) {
            setCurrentSceneIdx(index + 1);
            sceneStartTimeRef.current = Date.now();
            speakSceneNarration(index + 1);
          } else {
            stopPlayback();
          }
        }
      }, scene.duration * 1000);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Mute volume control
  useEffect(() => {
    if (audioCtxRef.current) {
      // Find destination gain (could just rebuild master audio volume)
      window.speechSynthesis.cancel();
      if (isPlaying) {
        speakSceneNarration(currentSceneIdx);
      }
    }
  }, [isMuted]);

  // 4. Render Animation Frames
  const animationLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Calculate progression percentage
    const scene = scenes[currentSceneIdx];
    if (!scene) return;

    // Ken Burns calculations (Slow pan and zoom)
    const elapsed = Date.now() - sceneStartTimeRef.current;
    const durationMs = scene.duration * 1000;
    const progress = Math.min(1, elapsed / durationMs);
    animationProgressRef.current = progress;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    const img = imagesRef.current[currentSceneIdx];
    if (img) {
      // Draw image with zoom/pan transforms
      ctx.save();
      
      const zoom = 1.0 + (progress * 0.12); // slow 12% zoom scale
      const panX = progress * 15; // slow pan right
      
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2 + panX, -h / 2);

      // Center cover calculations
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawH = h;
        drawW = h * imgRatio;
        drawX = (w - drawW) / 2;
        drawY = 0;
      } else {
        drawW = w;
        drawH = w / imgRatio;
        drawX = 0;
        drawY = (h - drawH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } else {
      // Loading panel fallback
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sketching panel drawings...', w / 2, h / 2);
    }

    // Overlay glassmorphism gradient at bottom for subtitles
    const grad = ctx.createLinearGradient(0, h - 140, 0, h);
    grad.addColorStop(0, 'rgba(3,7,18,0)');
    grad.addColorStop(0.3, 'rgba(3,7,18,0.75)');
    grad.addColorStop(1, 'rgba(3,7,18,0.98)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - 140, w, 140);

    // Draw Subtitles
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 16px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Auto-wrap narrative script lines
    wrapText(ctx, scene.narrative, w / 2, h - 85, w - 100, 24);

    // Draw active audio visualizer bars
    drawVisualizer(ctx, w, h);

    // Draw timeline indicator
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(30, 20, w - 60, 4);
    ctx.fillStyle = 'url(#gradient)'; // Fallback cyan gradient
    const progressGrad = ctx.createLinearGradient(30, 0, w - 30, 0);
    progressGrad.addColorStop(0, '#8b5cf6');
    progressGrad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = progressGrad;
    
    const baseProgress = (currentSceneIdx / scenes.length) * (w - 60);
    const sceneProgress = (progress / scenes.length) * (w - 60);
    ctx.fillRect(30, 20, baseProgress + sceneProgress, 4);

    // Request next frame
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animationLoop);
    }
  };

  // Wrap text utility for canvas drawing
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  // Draw reactive equalizer visualizer overlay
  const drawVisualizer = (ctx, w, h) => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);

    const barWidth = 3;
    const gap = 2;
    const totalBars = 32;
    const startX = w - 120;
    const startY = h - 25;

    ctx.save();
    for (let i = 0; i < totalBars; i++) {
      const dataIdx = Math.floor((i / totalBars) * bufferLength);
      const val = dataArray[dataIdx] || 0;
      const height = (val / 255) * 15 + 2;

      // Color nodes mapping: cyan-violet gradient glow
      const percent = i / totalBars;
      ctx.fillStyle = `rgba(${Math.floor(139 - percent * 133)}, ${Math.floor(92 + percent * 90)}, 246, 0.7)`;
      
      ctx.fillRect(startX + i * (barWidth + gap), startY - height, barWidth, height);
    }
    ctx.restore();
  };

  // 5. Canvas Video Export Engine (MediaRecorder)
  const handleExportVideo = async () => {
    if (scenes.length === 0) return;
    initAudio();
    setIsExporting(true);
    setExportProgress(0);
    recordedChunksRef.current = [];

    const canvas = canvasRef.current;
    // Capture stream at 30 fps
    const canvasStream = canvas.captureStream(30);
    canvasStreamRef.current = canvasStream;

    // Capture sound tracks from Web Audio synthesis destination node
    const audioTrack = audioDestRef.current.stream.getAudioTracks()[0];
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }

    // Set up MediaRecorder
    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8,opus' };
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm' };
    }

    const recorder = new MediaRecorder(canvasStream, options);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeStory.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_storyverse.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setExportProgress(0);
      alert('Video exported successfully! Check your downloads folder.');
    };

    // Execute playback specifically optimized for recording
    setCurrentSceneIdx(0);
    setIsPlaying(true);
    playBackgroundSynth();
    
    recorder.start();
    sceneStartTimeRef.current = Date.now();
    animationProgressRef.current = 0;
    
    // Play TTS in sync
    speakSceneNarrationForRecord(0, recorder);
    requestRef.current = requestAnimationFrame(animationLoop);
  };

  const speakSceneNarrationForRecord = (index, recorder) => {
    window.speechSynthesis.cancel();
    const scene = scenes[index];
    if (!scene) {
      recorder.stop();
      stopPlayback();
      return;
    }

    // Update export progress ratio
    setExportProgress(Math.floor((index / scenes.length) * 100));

    const utterance = new SpeechSynthesisUtterance(scene.narrative);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.toLowerCase().includes('google')) ||
                          voices.find(v => v.lang.includes('en')) ||
                          voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.95;

    utterance.onend = () => {
      if (index < scenes.length - 1) {
        setCurrentSceneIdx(index + 1);
        sceneStartTimeRef.current = Date.now();
        animationProgressRef.current = 0;
        speakSceneNarrationForRecord(index + 1, recorder);
      } else {
        setExportProgress(100);
        setTimeout(() => {
          recorder.stop();
          stopPlayback();
        }, 1000);
      }
    };

    utterance.onerror = () => {
      // Fallback advance for error
      setTimeout(() => {
        if (index < scenes.length - 1) {
          setCurrentSceneIdx(index + 1);
          sceneStartTimeRef.current = Date.now();
          speakSceneNarrationForRecord(index + 1, recorder);
        } else {
          recorder.stop();
          stopPlayback();
        }
      }, scene.duration * 1000);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              stopPlayback();
              setActiveTab('creator');
            }}
            className="p-2.5 rounded-xl bg-dark-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white line-clamp-1">{activeStory.title}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Cinema Studio Mode &bull; Genre: <span className="text-brand-cyan font-bold uppercase">{genre}</span></p>
          </div>
        </div>

        <button
          onClick={handleExportVideo}
          disabled={isExporting || isPlaying}
          className="btn-primary py-2 px-5 text-sm"
        >
          <Film className="w-4 h-4 text-white" />
          {isExporting ? `Exporting (${exportProgress}%)` : 'Export WebM Video'}
        </button>
      </div>

      {/* Main Canvas view card */}
      <div className="glass-card overflow-hidden bg-dark-950 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="relative aspect-[8/5] bg-[#030712] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-full object-contain"
          />
          
          {/* Exporter Overlay cover */}
          {isExporting && (
            <div className="absolute inset-0 bg-dark-950/90 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-12 h-12 text-brand-cyan animate-spin" />
              <h3 className="text-lg font-bold text-slate-200">Exporting Cinematic Video...</h3>
              <p className="text-xs text-slate-400">Please do not close this window. Syncing audio synthesizers and frames.</p>
              <div className="w-64 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-cyan h-full transition-all" style={{ width: `${exportProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Cinematic Control Bar */}
        <div className="bg-dark-800/80 p-4 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            {isPlaying ? (
              <button
                onClick={pausePlayback}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
                title="Pause Movie"
              >
                <Pause className="w-5 h-5 fill-white" />
              </button>
            ) : (
              <button
                onClick={startPlayback}
                disabled={isExporting}
                className="p-3 bg-gradient-to-r from-brand-violet to-brand-cyan hover:scale-105 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                title="Play Movie"
              >
                <Play className="w-5 h-5 fill-white" />
              </button>
            )}

            {/* Stop */}
            <button
              onClick={stopPlayback}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
              title="Stop / Reset Movie"
            >
              <Square className="w-5 h-5 fill-slate-400" />
            </button>
          </div>

          {/* Timeline and indicators */}
          <div className="text-xs font-semibold text-slate-400">
            Scene {currentSceneIdx + 1} of {scenes.length}
          </div>

          <div className="flex items-center gap-4">
            {/* Audio equalizers indicator */}
            {isPlaying && (
              <div className="h-6 flex items-end gap-1 px-3">
                <span className="w-1 bg-brand-cyan rounded-full animate-equalizer-1" style={{ height: '30%' }} />
                <span className="w-1 bg-brand-violet rounded-full animate-equalizer-2" style={{ height: '60%' }} />
                <span className="w-1 bg-brand-cyan rounded-full animate-equalizer-3" style={{ height: '40%' }} />
                <span className="w-1 bg-brand-violet rounded-full animate-equalizer-4" style={{ height: '80%' }} />
              </div>
            )}

            {/* Mute toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
