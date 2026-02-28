"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { QuestionCard } from "@/components/card/QuestionCard"
import { CardNavigation } from "@/components/card/CardNavigation"
import { ConfirmModal } from "@/components/common/ConfirmModal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mic, CheckCircle } from "lucide-react"
import { useConversationStore } from "@/lib/store"
import { Deck } from "@/lib/types"

const TIMER_SECONDS = 600;

export default function CardView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const cardId = params.cardId as string;
  const deckId = searchParams.get("deckId") ?? "deck-001";

  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- Real recording refs (deactivated for demo) ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  // --------------------------------------------------

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endCalledRef = useRef(false);

  const addConversation = useConversationStore((s) => s.addConversation);

  useEffect(() => {
    fetch("/data/cards.json")
      .then((r) => r.json())
      .then((data: { decks: Deck[] }) => {
        const found = data.decks.find((d) => d.id === deckId) ?? data.decks[0];
        setDeck(found);
        const idx = found.cards.findIndex((c) => c.id === cardId);
        setCurrentCardIndex(idx >= 0 ? idx : 0);
      });
  }, [deckId, cardId]);

  // --- Real recording functions (deactivated for demo) ---
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      console.warn("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === "inactive") {
        resolve(null);
        return;
      }
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        resolve(blob);
      };
      mr.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
    });
  }, []);
  // -------------------------------------------------------

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIMER_SECONDS);
    endCalledRef.current = false;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!deck) return;

    // DEMO MODE: simulate recording without microphone access
    // TODO: re-enable real recording when mic integration is ready
    // startRecording();
    setIsRecording(true);

    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, currentCardIndex]);

  const handleEndConversation = useCallback(async () => {
    if (isProcessing || endCalledRef.current) return;
    endCalledRef.current = true;
    setIsProcessing(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    // DEMO MODE: simulate processing delay instead of real API calls
    // TODO: re-enable the block below when transcribe/summarize APIs are ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsDone(true);

    /*
    const audioBlob = await stopRecording();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const formData = new FormData();
      if (audioBlob) formData.append("audio", audioBlob, "recording.webm");
      formData.append("question", card.question);

      const transcribeRes = await fetch(`${apiUrl}/api/transcribe`, {
        method: "POST",
        body: formData,
      });
      if (!transcribeRes.ok) {
        throw new Error(`Transcribe failed: ${transcribeRes.status} ${transcribeRes.statusText}`);
      }
      const { transcript } = await transcribeRes.json();

      const summarizeRes = await fetch(`${apiUrl}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: card.question, transcript }),
      });
      if (!summarizeRes.ok) {
        throw new Error(`Summarize failed: ${summarizeRes.status} ${summarizeRes.statusText}`);
      }
      const { summaries } = await summarizeRes.json();

      const newConv = {
        id: `conv-${Date.now()}`,
        deckId,
        cardId: card.id,
        question: card.question,
        createdAt: new Date().toISOString(),
        transcript,
        summaries,
      };
      addConversation(newConv);
      router.push(`/history/${newConv.id}`);
    } catch (err) {
      console.error("End conversation error:", err);
      endCalledRef.current = false;
      setIsProcessing(false);
    }
    */
  }, [isProcessing]);

  // Auto-end when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && !endCalledRef.current) {
      handleEndConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleNavigation = useCallback(
    async (direction: "prev" | "next") => {
      if (!deck || isProcessing) return;
      // DEMO MODE: no real recording to stop
      // await stopRecording();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      const newIndex = direction === "prev" ? currentCardIndex - 1 : currentCardIndex + 1;
      const newCard = deck.cards[newIndex];
      setCurrentCardIndex(newIndex);
      setIsDone(false);
      endCalledRef.current = false;
      router.replace(`/card/${newCard.id}?deckId=${deckId}`);
    },
    [deck, currentCardIndex, isProcessing, router, deckId]
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (!deck || !deck.cards[currentCardIndex]) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const currentCard = deck.cards[currentCardIndex];
  const isFirst = currentCardIndex === 0;
  const isLast = currentCardIndex === deck.cards.length - 1;
  const timerClass = timeLeft <= 120 ? "text-rose-500 font-bold tabular-nums text-lg" : "text-primary font-bold tabular-nums text-lg";

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gradient-to-b from-background to-secondary/10">
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full gap-1"
          onClick={() => setShowConfirmModal(true)}
          disabled={isProcessing}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Button>

        <span className={timerClass}>{formatTime(timeLeft)}</span>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Mic size={16} className={isRecording ? "animate-pulse" : "opacity-40"} />
          <span className="text-sm font-bold tracking-tight">
            {isRecording ? "Listening..." : "Paused"}
          </span>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 flex flex-col justify-center items-center max-w-4xl">
        <QuestionCard question={currentCard.question} />

        {!isDone && (
          <div className="mt-6 flex items-center gap-2 text-rose-500">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse inline-block" />
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}

        {isProcessing && (
          <p className="mt-4 text-muted-foreground animate-pulse font-medium text-sm">
            Processing your conversation...
          </p>
        )}

        {isDone && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle size={40} className="text-green-500" />
            <p className="text-lg font-semibold text-foreground">
              Your conversation has been saved!
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Head over to the <span className="font-semibold text-primary">History</span> tab to review your conversation summary.
            </p>
            <Button
              className="mt-2"
              onClick={() => router.push("/history")}
            >
              Go to History
            </Button>
          </div>
        )}
      </div>

      <CardNavigation
        onPrevious={() => handleNavigation("prev")}
        onNext={() => handleNavigation("next")}
        onEnd={handleEndConversation}
        isFirst={isFirst}
        isLast={isLast}
        isProcessing={isProcessing}
        isDone={isDone}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        message="Your conversation will not be saved. Are you sure you want to leave?"
        onConfirm={() => {
          // stopRecording(); // DEMO MODE: no real recording to stop
          if (timerRef.current) clearInterval(timerRef.current);
          router.push("/");
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
