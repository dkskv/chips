import type { ProfilerOnRenderCallback } from "react";

/**
 * Считает committed-рендеры поддерева через React.Profiler.
 * `onRender` вызывается на каждый commit (mount / update / nested-update).
 */
export function createCommitTracker() {
  const commits: string[] = [];

  const onRender: ProfilerOnRenderCallback = (_id, phase) => {
    commits.push(phase);
  };

  return {
    commits,
    onRender,
    getCount: () => commits.length,
    reset: () => {
      commits.length = 0;
    },
  };
}
