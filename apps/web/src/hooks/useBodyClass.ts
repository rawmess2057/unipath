import { useEffect } from 'react';

export function useBodyClass(cls: string, on: boolean) {
  useEffect(() => {
    document.body.classList.toggle(cls, on);
    return () => { document.body.classList.remove(cls); };
  }, [cls, on]);
}
