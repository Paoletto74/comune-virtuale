import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SWIPE_MIN_DISTANCE_PX = 72;
const SWIPE_MAX_VERTICAL_PX = 48;

export function useHorizontalPageSwipe(routes: readonly string[]) {
  const navigate = useNavigate();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (event: React.TouchEvent, currentPath: string) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start) return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.abs(deltaY) > SWIPE_MAX_VERTICAL_PX) return;
      if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE_PX) return;

      const index = routes.indexOf(currentPath);
      if (index < 0) return;

      if (deltaX < 0 && index < routes.length - 1) {
        navigate(routes[index + 1]!);
      } else if (deltaX > 0 && index > 0) {
        navigate(routes[index - 1]!);
      }
    },
    [navigate, routes],
  );

  return { onTouchStart, onTouchEnd };
}
