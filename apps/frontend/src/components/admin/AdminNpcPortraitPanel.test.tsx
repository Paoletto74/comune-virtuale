import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AdminNpcPortraitPanel } from '@/components/admin/AdminNpcPortraitPanel';
import { api } from '@/api/client';

vi.mock('@/api/client', () => ({
  ApiError: class ApiError extends Error {
    messageKey: string;
    constructor(messageKey: string) {
      super(messageKey);
      this.messageKey = messageKey;
    }
  },
  api: {
    adminListNpcs: vi.fn(),
    adminSetNpcPortrait: vi.fn(),
  },
}));

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminNpcPortraitPanel />
    </QueryClientProvider>,
  );
}

describe('AdminNpcPortraitPanel', () => {
  beforeEach(() => {
    vi.mocked(api.adminListNpcs).mockReset();
    vi.mocked(api.adminSetNpcPortrait).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('opens portrait modal when clicking Cambia ritratto', async () => {
    vi.mocked(api.adminListNpcs).mockResolvedValue({
      npcs: [
        {
          templateId: 'neighbor_marco',
          displayName: 'Marco',
          occupation: 'vicino',
          portraitId: null,
          portraitImagePath: null,
        },
      ],
      correlationId: 'test',
    });

    renderPanel();

    expect(await screen.findByText('Marco')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Cambia ritratto' }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Ritratto per Marco' })).toBeTruthy();
    expect(screen.getByText('Scegli ritratto NPC')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Salva ritratto' })).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(30);
  });

  it('updates NPC list immediately after saving portrait', async () => {
    vi.mocked(api.adminListNpcs).mockResolvedValue({
      npcs: [
        {
          templateId: 'neighbor_marco',
          displayName: 'Marco',
          occupation: 'vicino',
          portraitId: 'npc_002',
          portraitImagePath: '/npc-portraits/npc_002.webp',
        },
      ],
      correlationId: 'test',
    });
    vi.mocked(api.adminSetNpcPortrait).mockResolvedValue({
      npc: {
        templateId: 'neighbor_marco',
        displayName: 'Marco',
        occupation: 'vicino',
        portraitId: 'npc_006',
        portraitImagePath: '/npc-portraits/npc_006.webp',
      },
      correlationId: 'test',
    });

    const { container } = renderPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Cambia ritratto' }));
    fireEvent.click(screen.getByTitle('npc_006'));
    fireEvent.click(screen.getByRole('button', { name: 'Salva ritratto' }));

    expect(await screen.findByRole('img', { name: 'Marco' })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.adminSetNpcPortrait).toHaveBeenCalledWith('neighbor_marco', 'npc_006');

    await waitFor(() => {
      const photo = container.querySelector('.npcIllustrationPhoto') as HTMLImageElement | null;
      expect(photo?.getAttribute('src')).toBe('/npc-portraits/npc_006.webp');
    });
  });

  it('closes modal on Annulla without calling save API', async () => {
    vi.mocked(api.adminListNpcs).mockResolvedValue({
      npcs: [
        {
          templateId: 'neighbor_marco',
          displayName: 'Marco',
          portraitId: 'npc_002',
          portraitImagePath: '/npc-portraits/npc_002.webp',
        },
      ],
      correlationId: 'test',
    });

    renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Cambia ritratto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.adminSetNpcPortrait).not.toHaveBeenCalled();
  });
});
