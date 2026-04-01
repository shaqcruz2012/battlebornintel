import { useEffect, useState, useRef, useMemo } from 'react';

/**
 * Compute graph layout in a Web Worker so the D3 force simulation never
 * blocks the main thread.
 *
 * The worker emits two kinds of interim frames while the simulation ticks:
 *   - **Full frames** carry every node property (id, label, group, x, y, ...).
 *   - **Position-only frames** carry only {id, x, y} to cut message size
 *     (~75% smaller). These are merged into the last cached full-node data
 *     before being handed to React.
 *
 * Interim frames are coalesced via requestAnimationFrame so React never
 * re-renders faster than the browser can paint.
 *
 * @param {Array}  nodes          - Graph nodes from the API.
 * @param {Array}  edges          - Graph edges from the API.
 * @param {Object} options
 * @param {number} [options.iterations=450]  - Simulation tick count.
 * @param {boolean} [options.enabled=true]   - Whether to run the layout.
 * @param {number} [options.width=1200]      - Layout viewport width.
 * @param {number} [options.height=700]      - Layout viewport height.
 * @returns {{ layout: {nodes: Array, edges: Array}, isLoading: boolean, error: string|null }}
 */
export function useGraphLayout(nodes, edges, options = {}) {
  const {
    iterations = 450,
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
  const requestIdRef = useRef(0);
  const lastMessageRef = useRef(null);
  const retryCountRef = useRef(0);

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
        console.debug('Web Worker not supported, falling back to main thread');
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
    retryCountRef.current = 0;

    // Increment request ID to detect stale worker responses
    requestIdRef.current += 1;
    const currentRequest = requestIdRef.current;

    // Send work to worker
    const msg = { nodes, edges, width, height, iterations, requestId: currentRequest };
    lastMessageRef.current = msg;
    worker.postMessage(msg);

    // Handle worker response — supports progressive rendering via interim frames.
    // Interim frames are throttled with requestAnimationFrame to avoid flooding
    // React with re-renders faster than the browser can paint.
    //
    // Position-only interim frames ({id, x, y}) are merged into the last full
    // node data to avoid sending all properties on every tick (~75% smaller messages).
    let pendingInterim = null;
    let pendingPositionOnly = false;
    let rafId = null;
    // Seed with the input nodes so position-only frames arriving before the
    // first full interim frame still have complete node properties to merge into.
    let fullNodesRef = nodes;

    const flushInterim = () => {
      if (pendingInterim) {
        if (pendingPositionOnly && fullNodesRef) {
          // Path 1 — Position-only merge: the worker sent only {id, x, y}
          // per node.  Build a lookup map, then patch x/y into the last
          // cached full-node array so React still sees every property.
          const posMap = {};
          for (let i = 0; i < pendingInterim.length; ++i) {
            const p = pendingInterim[i];
            posMap[p.id] = p;
          }
          const merged = fullNodesRef.map(n => {
            const pos = posMap[n.id];
            return pos ? { ...n, x: pos.x, y: pos.y } : n;
          });
          setLayout({ nodes: merged, edges });
        } else {
          // Path 2 — Full frame: the worker sent complete node objects.
          // Cache them as the new baseline for future position-only merges.
          fullNodesRef = pendingInterim;
          setLayout({ nodes: pendingInterim, edges });
        }
        setError(null);
        pendingInterim = null;
        pendingPositionOnly = false;
      }
      rafId = null;
    };

    const handleMessage = (e) => {
      // Discard stale messages from a previous request
      if (e.data.requestId !== requestIdRef.current) return;

      const { success, nodes: layoutNodes, error: workerError, interim, positionOnly } = e.data;

      if (success) {
        retryCountRef.current = 0;
        if (interim) {
          // Buffer interim frames and flush at display refresh rate
          pendingInterim = layoutNodes;
          pendingPositionOnly = !!positionOnly;
          if (!positionOnly) fullNodesRef = layoutNodes; // cache full data
          if (!rafId) {
            rafId = requestAnimationFrame(flushInterim);
          }
        } else {
          // Final frame — apply immediately and mark complete
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          fullNodesRef = layoutNodes;
          setLayout({ nodes: layoutNodes, edges });
          setError(null);
          setIsLoading(false);
        }
      } else {
        setError(workerError);
        setLayout({ nodes, edges });
        setIsLoading(false);
      }
    };

    const handleError = (err) => {
      console.error('Graph worker error:', err);
      if (retryCountRef.current < 1 && lastMessageRef.current) {
        retryCountRef.current += 1;
        worker.postMessage(lastMessageRef.current);
      } else {
        setError(err.message);
        setLayout({ nodes, edges });
        setIsLoading(false);
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesKey, edgesKey, iterations, enabled]);

  return { layout, isLoading, error };
}
