import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

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

  // Track the latest edges in a ref so the persistent message handler can
  // always close over the current edge array without being re-attached.
  const edgesRef = useRef(edges);
  edgesRef.current = edges;
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // Track which layout request is current so stale worker responses are ignored.
  const requestIdRef = useRef(0);

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

  // Persistent message handler — attached once when the worker is created,
  // never removed until unmount. This prevents the race condition where a
  // ResizeObserver-triggered effect cleanup would remove the listener before
  // the worker's response arrived.
  const handleWorkerMessage = useCallback((e) => {
    const { success, nodes: layoutNodes, error: workerError, _requestId } = e.data;

    // Ignore responses from stale requests
    if (_requestId !== undefined && _requestId !== requestIdRef.current) return;

    if (success) {
      setLayout({ nodes: layoutNodes, edges: edgesRef.current });
      setError(null);
      setIsLoading(false);
    } else {
      setError(workerError);
      setLayout({ nodes: nodesRef.current, edges: edgesRef.current });
      setIsLoading(false);
    }
  }, []);

  const handleWorkerError = useCallback((err) => {
    setError(err.message);
    setLayout({ nodes: nodesRef.current, edges: edgesRef.current });
    setIsLoading(false);
  }, []);

  // Initialize worker on mount — attach message handlers once.
  useEffect(() => {
    if (!workerRef.current && typeof window !== 'undefined') {
      try {
        const worker = new Worker(
          new URL('../workers/d3-layout.worker.js', import.meta.url),
          { type: 'module' }
        );
        worker.addEventListener('message', handleWorkerMessage);
        worker.addEventListener('error', handleWorkerError);
        workerRef.current = worker;
      } catch {
        console.warn('Web Worker not supported, falling back to main thread');
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.removeEventListener('message', handleWorkerMessage);
        workerRef.current.removeEventListener('error', handleWorkerError);
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [handleWorkerMessage, handleWorkerError]);

  // Dispatch layout computation when graph topology or canvas dimensions change.
  // The message listener is persistent (set up on mount), so effect cleanup
  // here does NOT remove the listener — eliminating the race where a
  // ResizeObserver-triggered re-run would orphan an in-flight worker response.
  useEffect(() => {
    if (!enabled || !nodes || nodes.length === 0) {
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

    // Increment request ID so any in-flight stale response is ignored
    const reqId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    // Always send JSON objects — the performance difference vs ArrayBuffer
    // transfer is negligible at ~700 nodes and avoids format mismatch bugs.
    worker.postMessage({ nodes, edges, width, height, iterations, useTransfer: false, _requestId: reqId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesKey, edgesKey, iterations, enabled, width, height]);

  return { layout, isLoading, error };
}
