
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const MODEL_NAME = 'gemini-3.1-flash-live-preview';

interface LiveClientCallbacks {
  onOpen: () => void;
  onClose: () => void;
  onVolume: (inputVol: number, outputVol: number) => void;
  onError: (error: Error) => void;
  onTranscription: (text: string, role: 'user' | 'model', isFinal: boolean) => void;
  onStateChange: (state: 'idle' | 'listening' | 'processing' | 'speaking') => void;
}

export class LiveClient {
  private apiKey: string;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private callbacks: LiveClientCallbacks;
  private stream: MediaStream | null = null;
  private analyzer: AnalyserNode | null = null;
  private outputAnalyzer: AnalyserNode | null = null;
  private animationFrame: number | null = null;
  private isClosing = false;
  
  private currentInputText = '';
  private currentOutputText = '';
  private activeState: 'idle' | 'listening' | 'processing' | 'speaking' = 'idle';
  private audioSources: Set<AudioBufferSourceNode> = new Set();

  constructor(apiKey: string, callbacks: LiveClientCallbacks) {
    this.apiKey = apiKey;
    this.callbacks = callbacks;
  }

  private setState(newState: 'idle' | 'listening' | 'processing' | 'speaking') {
    if (this.activeState !== newState) {
      this.activeState = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  async connect() {
    if (this.isClosing) return;
    
    try {
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (this.inputAudioContext.state === 'suspended') await this.inputAudioContext.resume();
      if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();

      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);

      this.analyzer = this.inputAudioContext.createAnalyser();
      this.outputAnalyzer = this.outputAudioContext.createAnalyser();
      this.analyzer.fftSize = 256;
      this.outputAnalyzer.fftSize = 256;
      this.startVolumeMonitoring();

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.inputSource = this.inputAudioContext.createMediaStreamSource(this.stream);
      this.inputSource.connect(this.analyzer);
      
      // Increased buffer size to 4096 for better stability on variable networks
      this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
      this.inputSource.connect(this.processor);
      this.processor.connect(this.inputAudioContext.destination);

      this.sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            if (this.isClosing) return;
            this.callbacks.onOpen();
            this.setState('idle');
          },
          onmessage: async (message: LiveServerMessage) => {
            if (this.isClosing) return;
            
            // Handle Audio
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              this.setState('speaking');
              await this.playAudio(base64Audio);
            }

            // Enhanced Transcription Handling
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (text) {
                this.currentInputText += text;
                this.callbacks.onTranscription(this.currentInputText, 'user', false);
              }
            }
            
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              if (text) {
                this.currentOutputText += text;
                this.callbacks.onTranscription(this.currentOutputText, 'model', false);
              }
            }

            if (message.serverContent?.turnComplete) {
              // Finalize transcriptions
              if (this.currentInputText) this.callbacks.onTranscription(this.currentInputText, 'user', true);
              if (this.currentOutputText) this.callbacks.onTranscription(this.currentOutputText, 'model', true);
              
              this.currentInputText = '';
              this.currentOutputText = '';
              this.setState('idle');
            }

            if (message.serverContent?.interrupted) {
              this.audioSources.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              this.audioSources.clear();
              this.nextStartTime = 0;
              this.currentOutputText = '';
              this.setState('idle');
            }
          },
          onclose: (e: CloseEvent) => {
            console.warn("Session closed:", e.code, e.reason);
            if (!this.isClosing) this.disconnect();
          },
          onerror: (err: any) => {
            if (this.isClosing) return;
            console.error("Live Client Error:", err);
            this.callbacks.onError(new Error(err.message || "Voice connection lost."));
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });

      this.processor.onaudioprocess = (e) => {
        if (this.isClosing) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = this.createBlob(inputData);
        
        // Activity detection
        const maxVal = Math.max(...inputData.map(v => Math.abs(v)));
        if (maxVal > 0.03 && this.activeState === 'idle') {
          this.setState('listening');
        }

        this.sessionPromise?.then((session) => {
          if (!this.isClosing && session) {
            session.sendRealtimeInput({ audio: pcmBlob });
          }
        }).catch(err => {
          console.error("Failed to send audio input", err);
        });
      };

    } catch (error) {
      console.error("Connection failed", error);
      this.callbacks.onError(error instanceof Error ? error : new Error("Failed to connect to voice advisor."));
    }
  }

  sendText(text: string) {
    if (this.isClosing) return;
    this.sessionPromise?.then((session) => {
      if (!this.isClosing) session.sendRealtimeInput({ text });
    });
  }

  disconnect() {
    if (this.isClosing) return;
    this.isClosing = true;

    this.sessionPromise?.then((session) => {
      try { session.close(); } catch (e) {}
    }).catch(() => {});
    this.sessionPromise = null;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    try {
      this.inputSource?.disconnect();
      this.processor?.disconnect();
      this.outputNode?.disconnect();
    } catch (e) {}

    if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
      this.inputAudioContext.close().catch(() => {});
    }
    if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
      this.outputAudioContext.close().catch(() => {});
    }
    
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.callbacks.onClose();
  }

  private createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    const bytes = new Uint8Array(int16.buffer);
    return {
      data: this.encode(bytes),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async playAudio(base64: string) {
    if (this.isClosing || !this.outputAudioContext || !this.outputNode) return;

    try {
      const bytes = this.decode(base64);
      const audioBuffer = await this.decodeAudioData(bytes, this.outputAudioContext, 24000, 1);

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputNode);
      if (this.outputAnalyzer) source.connect(this.outputAnalyzer);

      const currentTime = this.outputAudioContext.currentTime;
      this.nextStartTime = Math.max(this.nextStartTime, currentTime);
      
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      
      this.audioSources.add(source);
      source.onended = () => {
        this.audioSources.delete(source);
        if (this.audioSources.size === 0 && this.activeState === 'speaking') {
          this.setState('idle');
        }
      };
    } catch (e) {
      console.warn("Playback error:", e);
    }
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  private startVolumeMonitoring() {
    const updateVolume = () => {
      if (this.isClosing) return;
      let inputVol = 0;
      let outputVol = 0;
      if (this.analyzer) {
        const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(dataArray);
        inputVol = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      }
      if (this.outputAnalyzer) {
        const dataArray = new Uint8Array(this.outputAnalyzer.frequencyBinCount);
        this.outputAnalyzer.getByteFrequencyData(dataArray);
        outputVol = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      }
      this.callbacks.onVolume(inputVol, outputVol);
      this.animationFrame = requestAnimationFrame(updateVolume);
    };
    updateVolume();
  }
}
