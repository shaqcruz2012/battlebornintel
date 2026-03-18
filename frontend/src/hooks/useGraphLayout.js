import { useEffect, useState, useRef, useMemo } from 'react';

/**
 * Hook to compute graph layout using Web Worker
 * Offloads expensive D3 force simulation from main thread
 * Returns { layout, isLoading, error }
 */
export function useGraphLayout(nodes, edges, options = {}) {
  const {
    iterations = 150,
    enabled = true,
    width = 1200,
    height = 700,
  } = options;

  // Start with an empty layout so that GraphCanvas's hasFitRef doesn't trigger
  // fitAll on raw un-positioned API nodes. The canvas will remain empty until
  // the first interim frame from the worker arrives with valid x/y coordinates.
  const [layout, setLayout] = useState({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const prevNodeCountRef = useRef(0);

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
      // Reset to empty layout so hasFitRef in GraphCanvas resets for the next
      // data load, allowing fitAll to fire on the first valid interim frame.
      setLayout({ nodes: [], edges: [] });
      setIsLoading(false);
      prevNodeCountRef.current = 0;
      return;
    }

    // Guard: skip re-layout if node count hasn't changed (prevents re-layout
    // on refetch with same data when only object references changed)
    if (nodes.length === prevNodeCountRef.current) {
      return;
    }
    prevNodeCountRef.current = nodes.length;

    const worker = workerRef.current;
    if (!worker) {
      // Fallback: use nodes as-is (no layout computation)
      setLayout({ nodes, edges });
      return;
    }

    setIsLoading(true);
    setError(null);

    // Send work to worker — use transfer mode for large graphs (>200 nodes)
    const useTransfer = nodes.length > 200;
    worker.postMessage({ nodes, edges, width, height, iterations, useTransfer });

    // Handle worker response — the worker now sends only the final frame
    // (no interim messages), eliminating intermediate React re-renders.
    // The user sees a loading skeleton then the complete graph appears at once.
    const handleMessage = (e) => {
      const { success, nodes: layoutNodes, error: workerError } = e.data;

      if (success) {
        // Final frame — apply immediately and mark complete
        setLayout({ nodes: layoutNodes, edges });
        setError(null);
        setIsLoading(false);
      } else {
        setError(workerError);
        setLayout({ nodes, edges });
        setIsLoading(false);
      }
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
  // width and height are included so that a significant canvas resize (>50 px,
  // gated by the debounce in GraphView) triggers a fresh layout in the new
  // coordinate space — keeping node positions consistent with the viewBox.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesKey, edgesKey, iterations, enabled, width, height]);

  return { layout, isLoading, error };
}
