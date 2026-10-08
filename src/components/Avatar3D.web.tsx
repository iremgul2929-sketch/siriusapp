import { useEffect, useMemo, useRef } from 'react';
import type { FullPose } from '@/ml/handModel';
import type { Tutor } from '@/data/tutors';
import { avatarHtml } from '@/ml/avatarHtml';

/** Tarayicida 3B avatar: ayni sahne sayfasi bir iframe icinde calisir. */
export function Avatar3D({
  poses,
  color,
  tutor,
  onStatus,
}: {
  poses: FullPose[];
  color: string;
  tutor: Tutor;
  onStatus: (ok: boolean) => void;
}) {
  const html = useMemo(() => avatarHtml(poses, color, tutor), [poses, color, tutor]);
  const frame = useRef<HTMLIFrameElement>(null);
  const handler = useRef(onStatus);
  useEffect(() => {
    handler.current = onStatus;
  }, [onStatus]);

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data?.__sirius) return;
      try {
        handler.current(JSON.parse(e.data.data).type === 'ready');
      } catch {
        // bozuk mesaji yok say
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  return (
    <iframe
      ref={frame}
      srcDoc={html}
      style={{ border: 0, width: '100%', height: '100%', background: 'transparent' }}
      title="Avatar"
    />
  );
}
