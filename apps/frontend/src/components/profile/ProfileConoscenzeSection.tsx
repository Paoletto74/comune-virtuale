import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api, type RelazioniOverviewResponse } from '@/api/client';
import { NpcIllustration } from '@/components/visual/NpcIllustration';
import { randomUUID } from '@/api/uuid';
import { useRelazioni } from '@/hooks/useGameApi';

function npcProfilePath(npcId: string): string {
  return `/profilo/npc/${encodeURIComponent(npcId)}`;
}

function ConoscenzaCard({ person }: { person: RelazioniOverviewResponse['people'][number] }) {
  return (
    <Link to={npcProfilePath(person.npcId)} className="knownNpcCard knownNpcCard--link conoscenzaCard">
      <NpcIllustration
        npcId={person.templateId ?? person.npcId}
        displayName={person.displayName}
        size="md"
        assignedPortraitId={person.portraitId}
        portraitStatus={person.portraitStatus}
      />
      <div className="knownNpcContent">
        <div className="knownNpcHeader">
          <span className="knownNpcName">{person.displayName}</span>
          <span className="knownNpcSentiment">{person.relationshipStateLabel}</span>
        </div>
        <p className="knownNpcRole">{person.narrativeRole}</p>
        {person.contactUnlocked && (
          <p className="conoscenzaContactBadge">Contatto sbloccato</p>
        )}
      </div>
    </Link>
  );
}

export function ProfileConoscenzeSection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useRelazioni();

  const openSpontaneous = useMutation({
    mutationFn: (inboxId: string) => api.openSpontaneousChat(inboxId, randomUUID()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['relazioni'] });
    },
  });

  if (isLoading) {
    return (
      <section id="conoscenze" className="profileBlock profileBlock--social" aria-label="Conoscenze">
        <h2 className="profileBlockTitle profileBlockTitle--accent">Conoscenze</h2>
        <p className="loading">Caricamento conoscenze…</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section id="conoscenze" className="profileBlock profileBlock--social" aria-label="Conoscenze">
        <h2 className="profileBlockTitle profileBlockTitle--accent">Conoscenze</h2>
        <p className="error">Impossibile caricare le conoscenze.</p>
      </section>
    );
  }

  const hasContent =
    data.people.length > 0 || data.groups.length > 0 || data.spontaneousInbox.length > 0;

  if (!hasContent) {
    return (
      <section id="conoscenze" className="profileBlock profileBlock--social" aria-label="Conoscenze">
        <h2 className="profileBlockTitle profileBlockTitle--accent">Conoscenze</h2>
        <p className="profileBlockBody muted">
          Ancora nessuna conoscenza. Completa attività con personaggi del Comune.
        </p>
      </section>
    );
  }

  return (
    <section id="conoscenze" className="profileBlock profileBlock--social" aria-label="Conoscenze">
      <header className="profileBlockHeader">
        <h2 className="profileBlockTitle profileBlockTitle--accent">Conoscenze</h2>
        <p className="profileBlockSubtitle">Persone e gruppi che conosci nel Comune</p>
      </header>

      {data.spontaneousInbox.length > 0 && (
        <div className="conoscenzeMessages">
          <h3 className="profileBlockTitle profileBlockTitle--sm">Messaggi in arrivo</h3>
          <ul className="conoscenzeMessagesList">
            {data.spontaneousInbox.map((item) => (
              <li key={item.inboxId}>
                <button
                  type="button"
                  className="conoscenzeMessageItem"
                  disabled={openSpontaneous.isPending}
                  onClick={() => {
                    openSpontaneous.mutate(item.inboxId, {
                      onSuccess: () => navigate(npcProfilePath(item.npcId)),
                    });
                  }}
                >
                  <strong>{item.title}</strong>
                  <span>{item.preview}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.people.length > 0 && (
        <div className="conoscenzePeople">
          <h3 className="profileBlockTitle profileBlockTitle--sm">Persone</h3>
          <div className="knownNpcsList">
            {data.people.map((person) => (
              <ConoscenzaCard key={person.npcId} person={person} />
            ))}
          </div>
        </div>
      )}

      {data.groups.length > 0 && (
        <div className="conoscenzeGroups">
          <h3 className="profileBlockTitle profileBlockTitle--sm">Gruppi</h3>
          <ul className="conoscenzeGroupList">
            {data.groups.map((group) => (
              <li key={group.groupId} className="conoscenzeGroupItem">
                <strong className="conoscenzeGroupName">{group.name}</strong>
                <p className="conoscenzeGroupDesc">{group.description}</p>
                <span className="conoscenzeGroupMeta">
                  {group.memberCount} membri · {group.relationshipStateLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
