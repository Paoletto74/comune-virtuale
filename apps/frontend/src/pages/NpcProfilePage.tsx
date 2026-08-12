import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/api/client';
import { GameShell } from '@/components/game/GameShell';
import { NpcIllustration } from '@/components/visual/NpcIllustration';
import { randomUUID } from '@/api/uuid';
import { useState } from 'react';

const CHAT_ACTION_LABELS: Record<string, string> = {
  chiacchiera: 'Chiacchiera',
  help: 'Chiedi aiuto',
  flirt: 'Flirt',
  info: 'Chiedi info',
  free: 'Chiacchiera libera',
};

function chatActionLabel(actionType: string, title: string): string {
  return CHAT_ACTION_LABELS[actionType] ?? title;
}

function NpcProfileContent() {
  const { npcId = '' } = useParams();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chat, setChat] = useState<Awaited<ReturnType<typeof api.startFreeNpcChat>>['chat'] | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [showPresetFallback, setShowPresetFallback] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['npc-profile', npcId],
    queryFn: () => api.npcProfile(npcId),
    enabled: Boolean(npcId),
  });

  const profile = data?.profile;
  const templateId = profile?.templateId ?? null;

  const { data: scenariosData } = useQuery({
    queryKey: ['npc-scenarios', templateId],
    queryFn: () => api.listNpcChatScenarios(templateId!),
    enabled: Boolean(templateId && profile?.chatEnabled),
  });

  const startFreeChat = useMutation({
    mutationFn: () => api.startFreeNpcChat(npcId, randomUUID()),
    onSuccess: (result) => {
      setThreadId(result.chat.threadId);
      setChat(result.chat);
      setDraftMessage('');
    },
  });

  const startPresetChat = useMutation({
    mutationFn: (scenarioId: string) => api.startNpcChat(npcId, scenarioId, randomUUID()),
    onSuccess: (result) => {
      setThreadId(result.chat.threadId);
      setChat(result.chat);
      setDraftMessage('');
    },
  });

  const sendMessage = useMutation({
    mutationFn: (message: string) => api.sendNpcChatMessage(threadId!, message, randomUUID()),
    onSuccess: (result) => {
      setChat(result.chat);
      setDraftMessage('');
    },
  });

  const replyPreset = useMutation({
    mutationFn: (optionId: string) => api.replyNpcChat(threadId!, optionId, randomUUID()),
    onSuccess: (result) => {
      setChat(result.chat);
    },
  });

  if (isLoading || !data || !profile) {
    return <p className="loading">Caricamento profilo…</p>;
  }

  const scenarios = scenariosData?.scenarios ?? [];
  const presetScenarios = scenarios.filter((s) => s.mode !== 'free' && s.actionType !== 'free');

  return (
    <div className="npcProfilePage">
      <Link to="/profilo#conoscenze" className="profileBackLink">
        ← Torna al profilo
      </Link>

      <section className="profileBlock profileBlock--hero npcProfileHero" aria-label="Profilo conoscenza">
        <div className="profileHeroLayout">
          <div className="profileHeroAside">
            <div className="profileHeroAvatar">
              <NpcIllustration
                npcId={profile.templateId ?? profile.npcId}
                displayName={profile.displayName}
                size="lg"
                assignedPortraitId={profile.portraitId}
                portraitStatus={profile.portraitStatus}
              />
            </div>
          </div>
          <div className="profileHeroBody">
            <h1 className="profileHeroName">{profile.displayName}</h1>
            <p className="profileHeroMeta">{profile.narrativeRole}</p>
            <p className="npcProfileState">{profile.relationshipStateLabel}</p>
            {profile.contactUnlocked && (
              <p className="conoscenzaContactBadge">Contatto sbloccato</p>
            )}
          </div>
        </div>
      </section>

      <section className="profileBlock profileBlock--primary" aria-label="Metriche relazione">
        <h2 className="profileBlockTitle profileBlockTitle--sm">Relazione</h2>
        <div className="inlineStats">
          <span className="inlineStat">
            <span className="inlineStatLabel">Fiducia</span>
            <span className="inlineStatValue">{profile.trust}</span>
          </span>
          <span className="inlineStat">
            <span className="inlineStatLabel">Simpatia</span>
            <span className="inlineStatValue">{profile.affection}</span>
          </span>
          <span className="inlineStat">
            <span className="inlineStatLabel">Conflitto</span>
            <span className="inlineStatValue">{profile.conflict}</span>
          </span>
        </div>
      </section>

      {(profile.character || profile.linguisticStyle || profile.interests.length > 0 || profile.situation) && (
        <section className="profileBlock profileBlock--secondary" aria-label="Carattere">
          <h2 className="profileBlockTitle profileBlockTitle--sm">Carattere</h2>
          {profile.character && <p className="profileBlockBody">{profile.character}</p>}
          {profile.linguisticStyle && (
            <p className="profileBlockBody muted">Stile: {profile.linguisticStyle}</p>
          )}
          {profile.interests.length > 0 && (
            <p className="profileBlockBody">Interessi: {profile.interests.join(', ')}</p>
          )}
          {profile.situation && <p className="profileBlockBody muted">{profile.situation}</p>}
        </section>
      )}

      {profile.chatEnabled && !chat && (
        <section className="profileBlock profileBlock--social" aria-label="Parla">
          <h2 className="profileBlockTitle profileBlockTitle--accent">Parla</h2>
          <div className="npcProfileActions">
            <button
              type="button"
              className="feedButton feedButtonPrimary"
              disabled={startFreeChat.isPending}
              onClick={() => startFreeChat.mutate()}
            >
              {startFreeChat.isPending ? 'Apertura…' : 'Scrivi un messaggio'}
            </button>
          </div>
          {presetScenarios.length > 0 && (
            <>
              <button
                type="button"
                className="npcChatFallbackToggle"
                onClick={() => setShowPresetFallback((v) => !v)}
              >
                {showPresetFallback ? 'Nascondi dialoghi preset' : 'Dialoghi preset (fallback)'}
              </button>
              {showPresetFallback && (
                <div className="npcProfileActions">
                  {presetScenarios.map((scenario) => (
                    <button
                      key={scenario.scenarioId}
                      type="button"
                      className="feedButton feedButtonOption"
                      disabled={startPresetChat.isPending}
                      onClick={() => startPresetChat.mutate(scenario.scenarioId)}
                    >
                      {chatActionLabel(scenario.actionType, scenario.title)}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {chat && (
        <section className="profileBlock profileBlock--social npcChatPanel" aria-label="Conversazione">
          <h2 className="profileBlockTitle profileBlockTitle--sm">Conversazione</h2>
          <div className="npcChatMessages">
            {chat.messages.map((message, index) => (
              <p key={`${message.recordedAt}-${index}`} className={`npcChatLine npcChatLine--${message.speaker}`}>
                {message.body}
              </p>
            ))}
          </div>

          {chat.freeTextEnabled && !chat.ended && (
            <form
              className="npcChatCompose"
              onSubmit={(event) => {
                event.preventDefault();
                const text = draftMessage.trim();
                if (!text || sendMessage.isPending) return;
                sendMessage.mutate(text);
              }}
            >
              <input
                type="text"
                className="npcChatInput"
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder="Scrivi un messaggio…"
                maxLength={500}
                aria-label="Messaggio"
              />
              <button
                type="submit"
                className="feedButton feedButtonPrimary"
                disabled={sendMessage.isPending || !draftMessage.trim()}
              >
                {sendMessage.isPending ? '…' : 'Invia'}
              </button>
            </form>
          )}

          {!chat.freeTextEnabled && !chat.ended && (
            <div className="npcChatOptions">
              {chat.options.map((option) => (
                <button
                  key={option.optionId}
                  type="button"
                  className="npcChatOption"
                  onClick={() => replyPreset.mutate(option.optionId)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {chat.lastEvaluation && (
            <p className="npcChatMeta muted">
              Intenzione rilevata: {chat.lastEvaluation.intent} · tono {chat.lastEvaluation.tone}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export function NpcProfilePage() {
  return (
    <GameShell>
      <header className="pageHeader">
        <h1 className="pageTitle">Conoscenza</h1>
        <p className="pageSubtitle">Profilo e conversazione</p>
      </header>
      <NpcProfileContent />
    </GameShell>
  );
}
