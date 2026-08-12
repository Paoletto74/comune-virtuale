import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GameShell } from '@/components/game/GameShell';
import { ReferendumPanel } from '@/components/game/ReferendumPanel';
import { SectionPanel, SectionSwitch } from '@/components/game/SectionSwitch';
import { FeedListIcon } from '@/components/FeedListIcon';
import { VisualHeroSlot } from '@/components/visual/VisualHeroSlot';
import { useGazzetta } from '@/hooks/useGameApi';
import { formatGameTimeMs } from '@/utils/formatGameTime';
import { gazzettaCategoryToIcon } from '@/utils/feedItemIconMap';
import type { GazzettaArticle } from '@/api/client';

type GazzettaSection = 'notizie' | 'referendum';

const SECTION_OPTIONS = [
  { id: 'notizie' as const, label: 'Notizie' },
  { id: 'referendum' as const, label: 'Referendum' },
];

function GazzettaArticleDetail({
  article,
  onClose,
}: {
  article: GazzettaArticle;
  onClose: () => void;
}) {
  return (
    <div className="gazzettaArticleModal" role="dialog" aria-modal="true" aria-labelledby="gazzetta-article-title">
      <article className="gazzettaCard card gazzettaArticleModalCard">
        <VisualHeroSlot imageKey={article.heroImageKey} label={`Hero ${article.category ?? 'cronaca'}`} />
        <div className="feedListItemRow">
          <FeedListIcon kind={gazzettaCategoryToIcon(article.category)} />
          <div className="feedListItemContent">
            <div className="gazzettaCardMeta">
              <span className="gazzettaCategory">{article.category ?? 'cronaca'}</span>
              <time className="gazzettaTimestamp">{formatGameTimeMs(article.publishedAtGameMs)}</time>
            </div>
            <h2 id="gazzetta-article-title" className="gazzettaHeadline">
              {article.title}
            </h2>
            <div className="gazzettaArticleFullBody">
              {article.fullBody ?? article.body}
            </div>
            {article.comuneLine && <p className="muted">{article.comuneLine}</p>}
          </div>
        </div>
        <button type="button" className="feedButton feedButtonPrimary" onClick={onClose}>
          Chiudi
        </button>
      </article>
    </div>
  );
}

export function GazzettaPage() {
  const { data, isLoading, error } = useGazzetta();
  const [selected, setSelected] = useState<GazzettaArticle | null>(null);
  const [searchParams] = useSearchParams();
  const initialSection: GazzettaSection =
    searchParams.get('tab') === 'referendum' ? 'referendum' : 'notizie';
  const [section, setSection] = useState<GazzettaSection>(initialSection);

  return (
    <GameShell>
      <header className="pageHeader">
        <h1 className="pageTitle">Gazzetta</h1>
        <p className="pageSubtitle">Cronaca e referendum — il Comune informa. Tu reagisci.</p>
      </header>

      <SectionSwitch
        options={SECTION_OPTIONS}
        value={section}
        onChange={setSection}
        ariaLabel="Sezione gazzetta"
      />

      {section === 'referendum' && (
        <SectionPanel id="section-panel-referendum" labelledBy="section-tab-referendum">
          <ReferendumPanel />
        </SectionPanel>
      )}

      {section === 'notizie' && (
        <SectionPanel id="section-panel-notizie" labelledBy="section-tab-notizie">
          {isLoading && <p className="loading">Caricamento cronaca…</p>}
          {error && <p className="error">Impossibile caricare la gazzetta.</p>}
          {!isLoading && !error && data && !data.enabled && (
            <p className="emptyState">Gazzetta non disponibile.</p>
          )}
          {!isLoading && !error && data && data.enabled && data.articles.length === 0 && (
            <p className="emptyState">Nessun articolo. Strano. Sospettoso.</p>
          )}
          {!isLoading && !error && data && data.enabled && data.articles.length > 0 && (
            <div className="gazzettaList" aria-label="Articoli di cronaca">
              {data.articles.map((article) => (
                <article
                  key={article.articleId}
                  className="gazzettaCard card gazzettaCardClickable"
                  onClick={() => setSelected(article)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(article);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Leggi: ${article.title}`}
                >
                  <VisualHeroSlot
                    imageKey={article.heroImageKey}
                    label={`Anteprima ${article.category ?? 'cronaca'}`}
                  />
                  <div className="feedListItemRow">
                    <FeedListIcon kind={gazzettaCategoryToIcon(article.category)} />
                    <div className="feedListItemContent">
                      <div className="gazzettaCardMeta">
                        <span className="gazzettaCategory">{article.category ?? 'cronaca'}</span>
                        <time className="gazzettaTimestamp">
                          {formatGameTimeMs(article.publishedAtGameMs)}
                        </time>
                      </div>
                      <h2 className="gazzettaHeadline">{article.title}</h2>
                      <p className="gazzettaBody">{article.summary ?? article.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionPanel>
      )}

      {selected && (
        <GazzettaArticleDetail article={selected} onClose={() => setSelected(null)} />
      )}
    </GameShell>
  );
}
