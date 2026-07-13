"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import styles from "./call.module.css";

// ── Ícones SVG inline (sem dependência de lib externa) ─────

const IconLockOutline = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconShieldLock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <rect x="9" y="11" width="6" height="5" rx="1" ry="1" fill="white"/>
    <path d="M10 11V9a2 2 0 0 1 4 0v2" stroke="white" />
  </svg>
);

const IconVideoCamera = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// X limpo para recusar
const IconDecline = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Câmera sólida para aceitar
const IconAccept = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
    <path d="M15.5 8.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-1.5l4 2.5V6l-4 2.5z"/>
  </svg>
);

const IconMic = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const IconSpeaker = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

const IconCameraOff = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconScreenShare = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <polyline points="10 10 12 7 14 10"/>
    <line x1="12" y1="7" x2="12" y2="13"/>
  </svg>
);

const IconSpeakerMuted = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/>
    <line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);

const IconMicMuted = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const IconPhoneEnd = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.26 6.26l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconLock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
    <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="72" height="72" viewBox="0 0 24 24" fill="#2AABEE">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.66l-1.68 7.93c-.13.58-.47.72-.95.45l-2.62-1.93-1.26 1.22c-.14.14-.26.26-.53.26l.19-2.66 4.84-4.37c.21-.19-.05-.29-.32-.1L7.78 14.3 5.2 13.5c-.56-.18-.57-.56.12-.83l9.4-3.62c.47-.17.88.11.71.83l.5-.72z"/>
  </svg>
);

// ── Utilitários ───────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ── Componente Principal ──────────────────────────────────

export default function CallPage() {
  const params = useParams();
  const token = params.token as string;

  const [callData, setCallData] = useState<any>(null);
  const [status, setStatus] = useState<string>("LOADING");
  const [callActive, setCallActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; icon: string } | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [endModalTimer, setEndModalTimer] = useState(3);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, icon: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, icon });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Carregar dados da chamada ──────────────────────────
  useEffect(() => {
    fetch(`/api/calls/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setStatus("NOT_FOUND");
          return;
        }
        setCallData(data);
        
        // Inicializa o Pixel imediatamente se existir na central
        if (data.callCenter?.pixelId) {
          const pixelId = data.callCenter.pixelId;
          const w = window as any;
          if (!w.fbq) {
            (function(f: any,b: any,e: any,v: any,n?: any,t?: any,s?: any)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)})(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            w.fbq('init', pixelId);
          }
        }

        // Inicializa o TikTok Pixel
        if (data.callCenter?.tikTokPixelId) {
          const ttId = data.callCenter.tikTokPixelId;
          const w = window as any;
          if (!w.ttq) {
            (function (w:any, d:any, t:any) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t:any,e:any){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t:any){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e:any,n:any){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
              ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load(ttId);
              ttq.page();
            })(window, document, 'ttq');
          }
        }

        // Inicializa o Google Tag
        if (data.callCenter?.googlePixelId) {
          const gId = data.callCenter.googlePixelId;
          const w = window as any;
          if (!w.gtag) {
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${gId}`;
            script.async = true;
            document.head.appendChild(script);

            w.dataLayer = w.dataLayer || [];
            w.gtag = function(){ w.dataLayer.push(arguments); };
            w.gtag('js', new Date());
            w.gtag('config', gId);
          }
        }

        if (data.status === "CREATED") {
          setStatus("INCOMING");
          updateCallStatus("ACCESSED", undefined, undefined, data);
          // Vibração háptica (Android Chrome)
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([600, 200, 600, 200, 600]);
          }
        } else if (data.status === "ACCESSED" || data.status === "STARTED") {
          setStatus("INCOMING");
        } else {
          setStatus("CLOSED");
        }
      });
  }, [token]);

  // Listener removido a pedido do usuário (para permitir reacesso sem abandonar)

  // ── Timer crescente (ACTIVE) ───────────────────────────
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive]);

  // ── Helpers ────────────────────────────────────────────
  const updateCallStatus = async (newStatus: string, watchTime?: number, mediaDuration?: number, freshData?: any) => {
    const currentData = freshData || callData;
    
    // 1. Dispara evento do Meta Pixel se estiver configurado
    if (currentData?.callCenter?.pixelId && currentData?.callCenter?.pixelEvents) {
      try {
        const eventsMap = JSON.parse(currentData.callCenter.pixelEvents);
        const mappedEvent = eventsMap[newStatus];
        if (mappedEvent && mappedEvent.trim() !== "") {
          const w = window as any;
          if (w.fbq) {
            const standardEvents = ["AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration", "Contact", "CustomizeProduct", "Donate", "FindLocation", "InitiateCheckout", "Lead", "Purchase", "Schedule", "Search", "StartTrial", "SubmitApplication", "Subscribe", "ViewContent"];
            if (standardEvents.includes(mappedEvent.trim())) {
              w.fbq('track', mappedEvent.trim());
            } else {
              w.fbq('trackCustom', mappedEvent.trim());
            }
            console.log(`[Meta Pixel] Evento disparado para status ${newStatus}: ${mappedEvent.trim()}`);
          }
        }
      } catch (e) {
        console.error("Erro ao processar eventos do Pixel", e);
      }
    }

    // 1.1 Dispara TikTok Pixel
    if (currentData?.callCenter?.tikTokPixelId && currentData?.callCenter?.tikTokEvents) {
      try {
        const eventsMap = JSON.parse(currentData.callCenter.tikTokEvents);
        const mappedEvent = eventsMap[newStatus];
        if (mappedEvent && mappedEvent.trim() !== "") {
          const w = window as any;
          if (w.ttq) {
            w.ttq.track(mappedEvent.trim());
            console.log(`[TikTok Pixel] Evento disparado para status ${newStatus}: ${mappedEvent.trim()}`);
          }
        }
      } catch (e) {
        console.error("Erro ao processar eventos do TikTok", e);
      }
    }

    // 1.2 Dispara Google Tag
    if (currentData?.callCenter?.googlePixelId && currentData?.callCenter?.googleEvents) {
      try {
        const eventsMap = JSON.parse(currentData.callCenter.googleEvents);
        const mappedEvent = eventsMap[newStatus];
        if (mappedEvent && mappedEvent.trim() !== "") {
          const w = window as any;
          if (w.gtag) {
            w.gtag('event', mappedEvent.trim());
            console.log(`[Google Tag] Evento disparado para status ${newStatus}: ${mappedEvent.trim()}`);
          }
        }
      } catch (e) {
        console.error("Erro ao processar eventos do Google", e);
      }
    }

    // 2. Atualiza o backend
    await fetch(`/api/calls/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, watchTime, mediaDuration }),
    });
  };

  const calculateWatchTime = () =>
    Math.floor((Date.now() - startTimeRef.current) / 1000);

  // ── Handlers ───────────────────────────────────────────
  const handleAnswer = useCallback(() => {
    setStatus("ACTIVE");
    setCallActive(true);
    setElapsed(0);
    startTimeRef.current = Date.now();
    updateCallStatus("STARTED");
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleDecline = useCallback(() => {
    setStatus("CLOSED");
    updateCallStatus("REJECTED");
  }, []);

  const handleVideoEnded = useCallback(() => {
    setCallActive(false);
    setStatus("CLOSED");
    const dur = videoRef.current?.duration;
    updateCallStatus("COMPLETED", calculateWatchTime(), dur ? Math.round(dur) : undefined);
  }, []);

  // ── Timer Modal Confirmação ──────────────────────────
  useEffect(() => {
    let interval: any;
    if (showEndModal && endModalTimer > 0) {
      interval = setInterval(() => {
        setEndModalTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showEndModal, endModalTimer]);

  const handleEndCall = useCallback(() => {
    setCallActive(false);
    setShowEndModal(false);
    setStatus("CLOSED");
    if (videoRef.current) videoRef.current.pause();
    const dur = videoRef.current?.duration;
    updateCallStatus("ABANDONED", calculateWatchTime(), dur ? Math.round(dur) : undefined);
  }, []);

  const handleEndCallClick = useCallback(() => {
    if (callData?.callCenter?.requireEndCallConfirmation) {
      setEndModalTimer(3);
      setShowEndModal(true);
    } else {
      handleEndCall();
    }
  }, [callData, handleEndCall]);

  const handleToggleSpeaker = useCallback(() => {
    setSpeakerMuted(prev => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  const handleToggleMic = useCallback(() => {
    setMicMuted(prev => !prev);
  }, []);

  const handleCameraClick = useCallback(() => {
    showToast("Não foi possível localizar a câmera do dispositivo.", "📷");
  }, []);

  const handleShareClick = useCallback(() => {
    showToast("Não foi possível localizar telas disponíveis para compartilhamento.", "💻");
  }, []);

  const handleCloseTab = useCallback(() => {
    // 1. Hack para navegadores que bloqueiam window.close() direto
    window.open('', '_self', '');
    window.close();
    
    // 2. Fallback 1: Tenta forçar a volta para o Telegram usando o esquema de URL deles
    setTimeout(() => {
      window.location.href = 'tg://';
    }, 100);

    // 3. Fallback 2: Se não tiver o app instalado ou bloquear o tg://, redireciona pra tela em branco
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 500);
  }, []);

  // ── Renders por estado ─────────────────────────────────

  if (status === "LOADING") {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingIcon}>
          <TelegramIcon />
        </div>
      </div>
    );
  }

  // ── Tela de Sessão Encerrada / Não Encontrada ──
  if (status === "CLOSED" || status === "NOT_FOUND") {
    return (
      <div className={styles.sessionClosedScreen}>
        
        {/* Top: Conexão Segura */}
        <div className={styles.sessionTopBar}>
          <IconLockOutline />
          <span>Conexão segura</span>
        </div>

        <div className={styles.sessionContent}>
          {/* Main Icon */}
          <div className={styles.sessionIconWrapper}>
            <div className={styles.sessionIconBg}>
              <IconVideoCamera />
            </div>
            <div className={styles.sessionIconGlow} />
          </div>

          <h2 className={styles.sessionTitle}>
            {status === "NOT_FOUND" ? "Sessão inválida" : "Chamada finalizada"}
          </h2>
          <p className={styles.sessionSub}>
            {status === "NOT_FOUND" ? "Este link não pode ser acessado." : "Sua sessão foi encerrada com sucesso."}
          </p>

          {/* Card Segurança */}
          <div className={styles.securityCard}>
            <div className={styles.securityCardIcon}>
              <IconShieldLock />
            </div>
            <div className={styles.securityCardTexts}>
              <p className={styles.securityCardTitle}>Sessão única</p>
              <p className={styles.securityCardDesc}>
                Por segurança e privacidade, cada link de chamada só pode ser usado uma vez.
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className={styles.sessionFooterInfo}>
            <div className={styles.sessionSmallLock}>
              <IconLockOutline />
            </div>
            <p>
              Esta chamada não pode mais<br />ser acessada novamente.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className={styles.sessionBottomBar}>
          <button className={styles.btnPrimaryGradient} onClick={handleCloseTab}>
            Fechar
          </button>
        </div>

      </div>
    );
  }

  const avatarUrl = callData?.callCenter?.avatar;
  const displayName = callData?.callCenter?.displayName || "Desconhecido";

  if (status === "INCOMING") {
    return (
      <div className={styles.incomingScreen}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <button
            className={styles.topBarBack}
            onClick={handleDecline}
            aria-label="Recusar chamada"
          >
            <IconBack />
          </button>
          <h1 className={styles.topBarTitle}>Chamada de vídeo</h1>
          <div className={styles.topBarLock}>
            <IconLock />
          </div>
        </div>

        {/* Avatar + Caller Info */}
        <div className={styles.incomingCenter}>
          <div className={styles.avatarWrapper}>
            <div className={styles.pulseRing} />
            <div className={styles.pulseRing} />
            <div className={styles.pulseRing} />
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.avatarInitials}>
                {getInitials(displayName)}
              </div>
            )}
          </div>

          <h2 className={styles.callerName}>{displayName}</h2>
          <p className={styles.callStatus}>está te chamando...</p>
          <div className={styles.callDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className={styles.incomingActionsWrapper}>
          <div className={styles.incomingActions}>
            <button
              className={styles.actionBtn}
              onClick={handleDecline}
              aria-label="Recusar"
            >
              <div className={`${styles.actionBtnCircle} ${styles.actionBtnDecline}`}>
                <IconDecline />
              </div>
              <span className={styles.actionBtnLabel}>Recusar</span>
            </button>

            <button
              className={styles.actionBtn}
              onClick={handleAnswer}
              aria-label="Aceitar"
            >
              <div className={`${styles.actionBtnCircle} ${styles.actionBtnAccept}`}>
                <IconAccept />
              </div>
              <span className={styles.actionBtnLabel}>Aceitar</span>
            </button>
          </div>
          <p className={styles.tapToAnswer}>toque para atender</p>
        </div>

        {/* Vídeo pré-carregado (escondido) */}
        <video
          ref={videoRef}
          src={callData?.media?.url}
          style={{ display: "none" }}
          playsInline
          onEnded={handleVideoEnded}
          preload="auto"
        />
      </div>
    );
  }

  // ── ACTIVE ─────────────────────────────────────────────
  return (
    <div className={styles.activeScreen}>
      {/* Vídeo em tela cheia */}
      <video
        ref={videoRef}
        src={callData?.media?.url}
        className={styles.activeVideo}
        playsInline
        autoPlay
        onEnded={handleVideoEnded}
      />

      {/* Vinheta superior */}
      <div className={styles.topVignette} />

      {/* HUD Superior */}
      <div className={styles.activeHud}>
        <p className={styles.hudName}>{displayName}</p>
        <div className={styles.hudTimerRow}>
          <span className={styles.hudTimer}>{formatTime(elapsed)}</span>
          <span className={styles.hudLock}>
            <IconLock />
          </span>
        </div>
      </div>

      {/* Self-View PIP decorativo */}
      <div className={styles.selfViewPip}>
        <IconCameraOff />
      </div>

      {/* Vinheta inferior */}
      <div className={styles.bottomVignette} />

      {/* Toast de erro profissional */}
      {toast && (
        <div className={styles.toastWrapper}>
          <div className={styles.toastCard}>
            <span className={styles.toastIcon}>{toast.icon}</span>
            <span className={styles.toastMsg}>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Barra de Controles */}
      <div className={styles.controlsBar}>
        <div className={styles.controlsInner}>

          {/* Alto-falante — mutar/desmutar o vídeo */}
          <button className={styles.ctrlBtn} onClick={handleToggleSpeaker} aria-label="Alto-falante">
            <div className={`${styles.ctrlBtnCircle} ${speakerMuted ? styles.ctrlBtnActive : ""}`}>
              {speakerMuted ? <IconSpeakerMuted /> : <IconSpeaker />}
            </div>
            <span className={styles.ctrlBtnLabel}>{speakerMuted ? "Silenciado" : "Alto-fal."}</span>
          </button>

          {/* Câmera — mostra toast de erro */}
          <button className={styles.ctrlBtn} onClick={handleCameraClick} aria-label="Câmera">
            <div className={styles.ctrlBtnCircle}>
              <IconCameraOff />
            </div>
            <span className={styles.ctrlBtnLabel}>Câmera</span>
          </button>

          {/* Encerrar (funcional) */}
          <button
            className={styles.ctrlBtnEnd}
            onClick={handleEndCallClick}
            aria-label="Encerrar chamada"
          >
            <div className={styles.ctrlBtnEndCircle}>
              <IconPhoneEnd />
            </div>
            <span className={styles.ctrlBtnEndLabel}>Encerrar</span>
          </button>

          {/* Microfone — toggle visual de mudo */}
          <button className={styles.ctrlBtn} onClick={handleToggleMic} aria-label="Mudo">
            <div className={`${styles.ctrlBtnCircle} ${micMuted ? styles.ctrlBtnActive : ""}`}>
              {micMuted ? <IconMicMuted /> : <IconMic />}
            </div>
            <span className={styles.ctrlBtnLabel}>{micMuted ? "Microfone" : "Mudo"}</span>
          </button>

          {/* Compartilhar tela — mostra toast de erro */}
          <button className={styles.ctrlBtn} onClick={handleShareClick} aria-label="Compartilhar tela">
            <div className={styles.ctrlBtnCircle}>
              <IconScreenShare />
            </div>
            <span className={styles.ctrlBtnLabel}>Compartilhar</span>
          </button>

        </div>
      </div>

      {/* Modal de Confirmação de Desligamento */}
      {showEndModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 99999, padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'rgba(25,25,30,0.9)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#fff' }}>
              Encerrar chamada?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
              Você tem certeza que deseja finalizar essa videochamada?
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => setShowEndModal(false)}
                style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleEndCall}
                disabled={endModalTimer > 0}
                style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: 'none', backgroundColor: endModalTimer > 0 ? 'rgba(220, 53, 69, 0.4)' : '#dc3545', color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: endModalTimer > 0 ? 'not-allowed' : 'transition' }}
              >
                {endModalTimer > 0 ? `Finalizar (${endModalTimer}s)` : "Finalizar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

