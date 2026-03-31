import { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

export function useErrorToast(error) {
  const { addToast } = useToast();
  useEffect(() => {
    if (error) {
      addToast(error.message || 'Something went wrong', 'error');
    }
  }, [error, addToast]);
}
