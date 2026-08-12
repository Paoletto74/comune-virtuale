import type { HomeResponse } from '@/api/client';
import { Link } from 'react-router-dom';
import { NpcIllustration } from '@/components/visual/NpcIllustration';

type KnownNpc = HomeResponse['knownNpcs'][number];

interface KnownNpcsPanelProps {
  knownNpcs: KnownNpc[];
}

function sentimentLabel(sentiment: KnownNpc['sentiment']): string {
  if (sentiment === 'positive') return 'Fiducia';
  if (sentiment === 'negative') return 'Fredda';
  return 'Neutra';
}

export function KnownNpcsPanel({ knownNpcs }: KnownNpcsPanelProps) {
  if (knownNpcs.length === 0) {
    return null;
  }

  return (
    <section className="knownNpcsPanel" aria-label="Persone che conosci">
      <h2 className="knownNpcsTitle">Persone che conosci</h2>
      <div className="knownNpcsList">
        {knownNpcs.map((npc) => (
          <Link
            key={npc.npcId}
            to={`/profilo/npc/${encodeURIComponent(npc.npcId)}`}
            className="knownNpcCard knownNpcCard--link"
          >
            <NpcIllustration
              npcId={npc.templateId ?? npc.npcId}
              displayName={npc.displayName}
              size="md"
              className="knownNpcAvatar"
              assignedPortraitId={npc.portraitId}
            />
            <div className="knownNpcContent">
              <div className="knownNpcHeader">
                <span className="knownNpcName">{npc.displayName}</span>
                <span className={`knownNpcSentiment knownNpcSentiment--${npc.sentiment}`}>
                  {sentimentLabel(npc.sentiment)}
                </span>
              </div>
              <p className="knownNpcRole">{npc.narrativeRole}</p>
              {npc.lastOutcomeSummary && (
                <p className="knownNpcMemory">
                  Ultima volta: {npc.lastOutcomeSummary.toLowerCase()}.
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
