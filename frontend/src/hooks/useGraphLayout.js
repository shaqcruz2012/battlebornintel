import { useEffect, useState, useRef, useMemo } from 'react';

/**
 * Hook to compute graph layout using Web Worker
 * Offloads expensive D3 force simulation from main thread
 * Returns { layout, isLoading, error }
 */
export function useGraphLayout(nodes, edges, options = {}) {
  const {
    iterations = 300,
    enabled = true,
  } = options;

  const [layout, setLayout] = useState({ nodes: nodes || [], edges: edges || [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);

  // Initialize worker on mount
  useEffect(() => {
    // Create worker if not exists
    if (!workerRef.current && typeof window !== 'undefined') {
      try {
        workerRef.current = new Worker(
          new URL('../workers/d3-layout.worker.js', import.meta.url),
          { type: 'module' }
        );
      } catch {
        console.warn('Web Worker not supported, falling back to main thread');
      }
    }

    return () => {
      // Cleanup worker on unmount
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Stable keys derived from graph topology (IDs and connections), not object references.
  // This prevents the layout from recomputing when upstream code recreates the same
  // arrays with new references but identical data.
  const nodesKey = useMemo(
    () => JSON.stringify((nodes || []).map((n) => n.id).sort()),
    [nodes]
  );
  const edgesKey = useMemo(
    () => JSON.stringify((edges || []).map((e) => `${e.source}-${e.target}`).sort()),
    [edges]
  );

  // Compute layout when nodes/edges change
  useEffect(() => {
    if (!enabled || !nodes || nodes.length === 0) {
      setLayout({ nodes: nodes || [], edges: edges || [] });
      return;
    }

    const worker = workerRef.current;
    if (!worker) {
      // Fallback: use nodes as-is (no layout computation)
      setLayout({ nodes, edges });
      return;
    }

    setIsLoading(true);
    setError(null);

    // Send work to worker
    worker.postMessage({ nodes, edges, iterations });

    // Handle worker response
    const handleMessage = (e) => {
      const { success, nodes: layoutNodes, error: workerError } = e.data;

      if (success) {
        setLayout({ nodes: layoutNodes, edges });
        setError(null);
      } else {
        setError(workerError);
        setLayout({ nodes, edges }); // Fallback to original positions
      }

      setIsLoading(false);
    };

    const handleError = (err) => {
      setError(err.message);
      setLayout({ nodes, edges });
      setIsLoading(false);
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesKey, edgesKey, iterations, enabled]);

  return { layout, isLoading, error };
}
