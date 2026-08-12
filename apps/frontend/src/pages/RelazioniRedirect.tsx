import { Navigate, useParams } from 'react-router-dom';

export function RelazioniPageRedirect() {
  return <Navigate to="/profilo#conoscenze" replace />;
}

export function RelazioniNpcRedirect() {
  const { npcId = '' } = useParams();
  return <Navigate to={`/profilo/npc/${encodeURIComponent(npcId)}`} replace />;
}
