import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingMetadata?: any;
}

interface TacticalCoPilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetrySnapshot?: {
    speed: number;
    drift: number;
    isOutage: boolean;
    covarianceRadius: number;
  };
}

export const TacticalCoPilotModal: React.FC<TacticalCoPilotModalProps> = ({
  isOpen,
  onClose,
  telemetrySnapshot,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Tactical AI Co-Pilot online. 100Hz IMU Kinematics & EKF Diagnostics linked. Ready for navigation telemetry analysis, Pragati Maidan tunnel routing, or real-time ground-truth verification.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);

  // Audio Recording & Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (useMaps && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { timeout: 3000, maximumAge: 60000 }
          );
        });
        if (position?.coords) {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      } catch {
        // Fall back gracefully
      }
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          useSearch,
          useMaps,
          latitude,
          longitude,
          systemInstruction: `You are the DHRUVA Tactical AI Co-Pilot: An expert autonomous inertial navigation and dead-reckoning advisor.
Current vehicle state: Speed ${telemetrySnapshot?.speed.toFixed(1) || '48.2'} km/h, Drift ${telemetrySnapshot?.drift.toFixed(2) || '0.72'}%, Outage Active: ${telemetrySnapshot?.isOutage ? 'YES' : 'NO'}, Covariance Radius: ±${telemetrySnapshot?.covarianceRadius.toFixed(1) || '3.8'}m.
Assist the operator with tactical precision, mathematical rigor (EKF, ZUPT, NHC), route alternatives using Google Maps data, and real-time updates using Google Search data when requested.`,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.text || 'Telemetry analyzed. All kinematic invariants nominal.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        groundingMetadata: data.groundingMetadata,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Error communicating with Gemini: ${err.message || 'Unknown network error.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio Recording for Transcription with gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Audio recording is not supported in this browser. You can type commands directly.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let chosenMime = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          chosenMime = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          chosenMime = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          chosenMime = 'audio/ogg';
        } else {
          chosenMime = '';
        }
      }

      const mediaRecorder = chosenMime
        ? new MediaRecorder(stream, { mimeType: chosenMime })
        : new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualMime = mediaRecorder.mimeType || chosenMime || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          await transcribeAudio(base64Data, actualMime);
        };
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Microphone access is unavailable or denied by browser security. You can type queries directly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBase64: string, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType }),
      });

      const data = await res.json();
      if (data.transcript) {
        setInput(data.transcript);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Audio transcription error: ${data.error}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Transcription service encountered a connection issue.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0a0e17]/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="flex flex-col bg-[#1c1f29] border border-[#ffaa00]/30 rounded-2xl w-full max-w-2xl h-[90vh] sm:h-[82vh] shadow-[0_0_35px_rgba(255,170,0,0.2)] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#181b25] border-b border-[#31353f]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ffaa00]/20 flex items-center justify-center text-[#ffaa00]">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-md text-sm sm:text-base font-bold text-[#dfe2ef]">
                  Tactical AI Co-Pilot
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-pulse" />
              </div>
              <span className="font-code-stream text-[10px] text-[#00eefc] block">
                Autonomous Kinematics & Spatial Advisor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#262a34] text-[#d8c3ac] hover:text-[#dfe2ef] flex items-center justify-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Tactical Model & Grounding Controls Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#0a0e17]/80 border-b border-[#31353f]/40 text-xs">
          {/* Model Selector */}
          <div className="flex items-center gap-1">
            <span className="font-label-caps text-[9px] text-[#d8c3ac] uppercase mr-1">MODEL:</span>
            {[
              { id: 'gemini-3.5-flash', label: '3.5 Flash (General)' },
              { id: 'gemini-3.1-flash-lite', label: '3.1 Flash-Lite (Fast)' },
              { id: 'gemini-3.1-pro-preview', label: '3.1 Pro (Complex)' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id as any)}
                className={`px-2 py-1 rounded text-[10px] font-label-caps transition-all cursor-pointer ${
                  selectedModel === m.id
                    ? 'bg-[#ffaa00] text-[#694300] font-bold shadow-sm'
                    : 'bg-[#181b25] text-[#d8c3ac] hover:bg-[#262a34]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Grounding Toggles: Google Search & Google Maps */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setUseSearch(!useSearch)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-label-caps transition-all cursor-pointer border ${
                useSearch
                  ? 'bg-[#00eefc]/20 text-[#00eefc] border-[#00eefc]/40 font-bold'
                  : 'bg-[#181b25] text-[#d8c3ac] border-[#31353f] hover:bg-[#262a34]'
              }`}
              title="Ground response with live Google Search data"
            >
              <span className="material-symbols-outlined text-[13px]">search</span>
              <span>Search Grounding</span>
            </button>

            <button
              onClick={() => setUseMaps(!useMaps)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-label-caps transition-all cursor-pointer border ${
                useMaps
                  ? 'bg-[#00eefc]/20 text-[#00eefc] border-[#00eefc]/40 font-bold'
                  : 'bg-[#181b25] text-[#d8c3ac] border-[#31353f] hover:bg-[#262a34]'
              }`}
              title="Ground response with live Google Maps data"
            >
              <span className="material-symbols-outlined text-[13px]">pin_drop</span>
              <span>Maps Grounding</span>
            </button>
          </div>
        </div>

        {/* Scrollable Chat Thread */}
        <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-[#0f131c]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${
                msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-xs sm:text-sm font-body-md ${
                  msg.role === 'user'
                    ? 'bg-[#ffaa00] text-[#452b00] rounded-tr-none font-medium'
                    : 'bg-[#1c1f29] text-[#dfe2ef] rounded-tl-none border border-[#31353f]/60'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                {/* Grounding Metadata Display */}
                {msg.groundingMetadata?.groundingChunks && (
                  <div className="mt-2.5 pt-2 border-t border-[#31353f]/60 text-[10px] font-code-stream">
                    <span className="text-[#00eefc] font-semibold block mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">map</span>
                      Verified Grounding Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                        const item = chunk.maps || chunk.web;
                        const reviewSnippets = chunk.maps?.placeAnswerSources?.reviewSnippets;
                        return (
                          <div key={i} className="flex flex-col gap-0.5">
                            {item && item.uri && (
                              <a
                                href={item.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#0a0e17] px-2 py-1 rounded text-[#7df4ff] hover:text-[#00eefc] hover:bg-[#181b25] flex items-center gap-1 border border-[#00eefc]/30 hover:border-[#00eefc] transition-all"
                              >
                                <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                <span className="truncate max-w-[190px] font-medium">{item.title || item.uri}</span>
                              </a>
                            )}
                            {Array.isArray(reviewSnippets) && reviewSnippets.map((snip: any, sIdx: number) => (
                              <span key={sIdx} className="text-[8px] text-[#d8c3ac]/80 italic pl-1 border-l border-[#00eefc]/30">
                                "{snip.snippet || snip}"
                              </span>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 px-1 text-[9px] font-code-stream text-[#d8c3ac]/60">
                <span>{msg.timestamp}</span>
                {msg.modelUsed && <span>• {msg.modelUsed}</span>}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-code-stream text-[#00eefc] bg-[#1c1f29] p-3 rounded-2xl rounded-tl-none border border-[#00eefc]/30 w-fit">
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              <span>Analyzing kinematics with {selectedModel}...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Pre-canned Tactical Prompts */}
        <div className="px-3 py-1.5 bg-[#181b25] border-t border-[#31353f]/40 flex items-center gap-1.5 overflow-x-auto text-[10px] font-code-stream">
          <span className="text-[#d8c3ac] flex-shrink-0">Quick Queries:</span>
          {[
            'Explain EKF Chi-Square threshold',
            'Find Pragati Maidan tunnel exits on Maps',
            'Search Delhi weather and ionospheric scintillation',
            'How does ZUPT prevent red-light drift?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (prompt.includes('Maps')) setUseMaps(true);
                if (prompt.includes('Search')) setUseSearch(true);
                handleSendMessage(prompt);
              }}
              className="px-2 py-0.5 rounded bg-[#1c1f29] hover:bg-[#262a34] text-[#ffcf91] flex-shrink-0 border border-[#31353f]/60 cursor-pointer transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar with Speech-to-Text Button (gemini-3.5-transcribe) */}
        <div className="p-3 bg-[#181b25] border-t border-[#31353f]/60 flex items-center gap-2">
          {/* Audio Transcribe Trigger */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
              isRecording
                ? 'bg-[#93000a] text-[#ffdad6] animate-pulse shadow-[0_0_12px_rgba(255,51,102,0.6)]'
                : isTranscribing
                ? 'bg-[#ffaa00] text-[#694300] cursor-wait'
                : 'bg-[#262a34] text-[#00eefc] hover:bg-[#31353f] border border-[#31353f]'
            }`}
            title={
              isRecording
                ? 'Click to stop and transcribe audio'
                : 'Transcribe audio voice with gemini-3.5-transcribe'
            }
          >
            <span className={`material-symbols-outlined text-[19px] ${isTranscribing ? 'animate-spin' : ''}`}>
              {isRecording ? 'stop' : isTranscribing ? 'sync' : 'mic'}
            </span>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              isRecording
                ? 'Recording audio... Speak tactical query'
                : isTranscribing
                ? 'Transcribing audio via gemini-3.5-transcribe...'
                : 'Ask AI Co-Pilot about telemetry, maps, or outages...'
            }
            className="flex-grow bg-[#0f131c] text-[#dfe2ef] text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#31353f] focus:outline-none focus:border-[#ffaa00]"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-[#ffaa00] hover:bg-[#ffb952] text-[#452b00] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-md"
          >
            <span className="material-symbols-outlined text-[19px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
