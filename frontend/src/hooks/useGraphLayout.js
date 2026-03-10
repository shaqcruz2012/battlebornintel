import { useEffect, useState, useRef, useMemo } from 'react';

/**
 * Hook to compute graph layout using Web Worker
 * Offloads expensive D3 force simulation from main thread
 * Returns { layout, isLoading, error }
 */
export function useGraphLayout(nodes, edges, options = {}) {
  const {
    iterations = 400,
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
    worker.postMessage({ nodes, edges, width, height, iterations });

    // Handle worker response — supports progressive rendering via interim frames.
    // The worker sends multiple messages with `interim: true` for quick initial
    // display, followed by a final message with `interim: false` (or undefined)
    // that signals the simulation is complete.
    const handleMessage = (e) => {
      const { success, nodes: layoutNodes, error: workerError, interim } = e.data;

      if (success) {
        // Update positions on every frame (interim and final) so the graph
        // progressively refines in place rather than blinking in all at once.
        setLayout({ nodes: layoutNodes, edges });
        setError(null);

        if (!interim) {
          // Only mark layout as finished on the terminal message.
          setIsLoading(false);
        }
      } else {
        setError(workerError);
        setLayout({ nodes, edges }); // Fallback to original positions
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesKey, edgesKey, iterations, enabled]);

  return { layout, isLoading, error };
}
