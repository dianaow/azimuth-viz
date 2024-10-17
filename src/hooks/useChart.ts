import { writable } from 'svelte/store';

// Hook that manages chart rendering and resize observation
export function useChart(
  chartType: (params: { data: any, containerSelector: string, width: number, height: number, [key: string]: any }) => void,
  id: string,
  data: any,
  parentContainer: HTMLElement | null,
  properties: Record<string, any>
): () => void {
  let chartRendered = false; // Use boolean to avoid redundant reactivity
  let width = writable(0);
  let height = writable(0);

  let resizeObserver: ResizeObserver;

  const initializeChart = (w: number, h: number) => {
    if (!chartRendered && parentContainer) {
      const element = document.getElementById(id);
      if (element && w > 0) {
        chartType({
          data,
          containerSelector: `#${id}`,
          width: w || 500,
          height: h || 200,
          ...properties,
        });
        chartRendered = true;
        console.log(`Chart rendered once for: ${id}`);
      }
    }
  };

  if (parentContainer) {
    resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        width.set(newWidth);
        height.set(newHeight);

        // Directly call initialization without nesting reactivity
        initializeChart(newWidth, newHeight);
      }
    });

    if (parentContainer instanceof HTMLElement) {
      resizeObserver.observe(parentContainer);
    }
  }

  return () => {
    if (resizeObserver && parentContainer) {
      resizeObserver.unobserve(parentContainer);
    }
  };
}
