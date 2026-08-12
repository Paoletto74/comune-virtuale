import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, type RelazioniOverviewResponse } from '@/api/client';
import { NpcIllustration } from '@/components/visual/NpcIllustration';
import { randomUUID } from '@/api/uuid';

function PersonCard({ person }: { person: RelazioniOverviewResponse['people'][number] }) {
  return (
    <Link to={`/relazioni/npc/${person.npcId}`} className="knownNpcCard relazioniPersonCard">
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
          <p className="relazioniContactBadge">Contatto sbloccato</p>
        )}
      </div>
    </Link>
  );
}

export function RelazioniPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['relazioni'],
    queryFn: () => api.relazioniOverview(),
  });

  const openSpontaneous = useMutation({
    mutationFn: (inboxId: string) => api.openSpontaneousChat(inboxId, randomUUID()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['relazioni'] });
    },
  });

  if (isLoading) {
    return <p className="pageLoading">Caricamento relazioni…</p>;
  }

  if (error || !data) {
    return <p className="pageError">Non riesco a caricare le relazioni.</p>;
  }

  return (
    <main className="relazioniPage">
      <header className="relazioniHeader">
        <h1>Relazioni</h1>
        <p className="relazioniSubtitle">
          Persone e gruppi del tuo Comune. Nessun badge NPC: qui conta solo chi conosci.
        </p>
      </header>

      {data.spontaneousInbox.length > 0 && (
        <section className="relazioniSpontaneous" aria-label="Messaggi in arrivo">
          <h2>Messaggi</h2>
          <ul className="relazioniSpontaneousList">
            {data.spontaneousInbox.map((item) => (
              <li key={item.inboxId}>
                <button
                  type="button"
                  className="relazioniSpontaneousItem"
                  onClick={() => openSpontaneous.mutate(item.inboxId)}
                >
                  <strong>{item.title}</strong>
                  <span>{item.preview}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Persone">
        <h2>Persone</h2>
        {data.people.length === 0 ? (
          <p className="relazioniEmpty">Ancora nessuno. Completa qualche attività con NPC.</p>
        ) : (
          <div className="knownNpcsList">
            {data.people.map((person) => (
              <PersonCard key={person.npcId} person={person} />
            ))}
          </div>
        )}
      </section>

      <section aria-label="Gruppi">
        <h2>Gruppi</h2>
        {data.groups.length === 0 ? (
          <p className="relazioniEmpty">Nessun gruppo ancora.</p>
        ) : (
          <ul className="relazioniGroupList">
            {data.groups.map((group) => (
              <li key={group.groupId} className="relazioniGroupCard">
                <strong>{group.name}</strong>
                <p>{group.description}</p>
                <span className="relazioniGroupMeta">
                  {group.memberCount} membri · {group.relationshipStateLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
