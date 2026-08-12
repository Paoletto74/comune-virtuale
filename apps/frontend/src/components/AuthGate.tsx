import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '@/hooks/useSession';

export function AuthGate() {
  const { data: me, isLoading, isError } = useMe();

  if (isLoading) {
    return <p className="loading">Il Comune verifica le credenziali…</p>;
  }

  if (isError || !me) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={me} />;
}

export function GuestGate() {
  const { data: me, isLoading, isError } = useMe();

  if (isLoading) {
    return <p className="loading">Il Comune verifica le credenziali…</p>;
  }

  if (!isError && me) {
    if (me.needsCitizenCreation) {
      return <Navigate to="/create-citizen" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export function CitizenGate() {
  const { data: me, isLoading, isError } = useMe();

  if (isLoading) {
    return <p className="loading">Il Comune verifica le credenziali…</p>;
  }

  if (isError || !me) {
    return <Navigate to="/login" replace />;
  }

  if (me.needsCitizenCreation) {
    return <Navigate to="/create-citizen" replace />;
  }

  return <Outlet />;
}

export function CreationGate() {
  const { data: me, isLoading, isError } = useMe();

  if (isLoading) {
    return <p className="loading">Il Comune verifica le credenziali…</p>;
  }

  if (isError || !me) {
    return <Navigate to="/login" replace />;
  }

  if (!me.needsCitizenCreation) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
