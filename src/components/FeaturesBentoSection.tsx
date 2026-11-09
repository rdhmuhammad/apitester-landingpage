import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  Square,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export interface RoadmapSubTask {
  id: string;
  label: string;
  done: boolean;
}

export interface RoadmapTimelineItem {
  id: string;
  versionOrPhase: string;
  title: string;
  description: string;
  done: boolean;
  statusLabel: string;
  subTasks: RoadmapSubTask[];
}

const INITIAL_TIMELINE_ITEMS: RoadmapTimelineItem[] = [
  {
    id: 'shipped-core',
    versionOrPhase: 'v1.4.2 · Shipped Foundation',
    title: 'Git-Native Multi-Collection Workspace, Environment Variables & Markdown Notes',
    description:
      'Open any repository folder as a project to navigate multiple collection files in the sidebar, interpolate {{ENV}} variables, switch between Clean White and Dark Mode, and manage Obsidian-style .md documentation.',
    done: true,
    statusLabel: 'Completed',
    subTasks: [
      { id: 'st-1', label: 'Windows native desktop app & Go embedded server runtime', done: true },
      { id: 'st-2', label: 'Multi-collection repository folder explorer & sidebar switching', done: true },
      { id: 'st-3', label: 'Obsidian-style Markdown (.md) notes with bidirectional [[Endpoint]] links', done: true },
    ],
  },
  {
    id: 'win-cert',
    versionOrPhase: 'Milestone 01 · Windows Trust & Distribution',
    title: 'Sign Certificate for Publishing Windows Installer (Trusted Publisher)',
    description:
      'Providing an official code-signing certificate for publishing the Windows installer (.exe and .msi) so that the application is recognized by Windows SmartScreen and OS security policies from a trusted publisher.',
    done: false,
    statusLabel: 'In Progress',
    subTasks: [
      { id: 'st-4', label: 'Automated Windows x64 installer (.exe) and portable (.zip) build pipeline', done: true },
      { id: 'st-5', label: 'Provision OV/EV Windows code-signing certificate & timestamp server integration', done: false },
      { id: 'st-6', label: 'Verify zero Windows Defender SmartScreen warning on fresh install', done: false },
    ],
  },
  {
    id: 'apple-dev-id',
    versionOrPhase: 'Milestone 02 · macOS Release & Auto-Update',
    title: 'Obtain Apple Developer ID & App Developer Team for Signed macOS Updates',
    description:
      'Obtaining an official Apple Developer ID and establishing an app developer team for signing and notarizing the macOS application, allowing a seamless background update mechanism.',
    done: false,
    statusLabel: 'In Progress',
    subTasks: [
      { id: 'st-7', label: 'Universal macOS bundle architecture for Apple Silicon (M1–M4) & Intel', done: true },
      { id: 'st-8', label: 'Obtain Apple Developer ID certificate & configure Apple notarization workflow', done: false },
      { id: 'st-9', label: 'Ship signed delta auto-updater for seamless macOS version upgrades', done: false },
    ],
  },
  {
    id: 'multi-protocol',
    versionOrPhase: 'Milestone 03 · Protocol Expansion',
    title: 'Extend Collection Capabilities to WebSocket, GraphQL & Widely Used Protocols',
    description:
      'Extending collection files beyond standard REST/HTTP requests to support persistent WebSocket connections, GraphQL queries and mutations with schema introspection, and other widely used protocols.',
    done: false,
    statusLabel: 'Planned',
    subTasks: [
      { id: 'st-10', label: 'Multi-protocol schema specification inside local *.collection.json files', done: true },
      { id: 'st-11', label: 'Interactive WebSocket connection manager & live event stream log', done: false },
      { id: 'st-12', label: 'GraphQL query editor with variables and schema documentation explorer', done: false },
    ],
  },
  {
    id: 'server-sync',
    versionOrPhase: 'Milestone 04 · Team Collaboration',
    title: 'Enhance Collaboration Workflow with Server-Placed Collection Sync',
    description:
      'Enhancing team collaboration workflows by allowing APITester workspaces to synchronize with server-placed collections, combining local repository speed with shared remote collection updates.',
    done: false,
    statusLabel: 'Planned',
    subTasks: [
      { id: 'st-13', label: 'Deterministic, diff-clean JSON serialization for conflict-free merges', done: true },
      { id: 'st-14', label: 'Remote server collection endpoint & token-authenticated sync engine', done: false },
      { id: 'st-15', label: 'One-click pull/push synchronization with server-hosted team collections', done: false },
    ],
  },
];

export const FeaturesBentoSection: React.FC = () => {
  const [items, setItems] = useState<RoadmapTimelineItem[]>(INITIAL_TIMELINE_ITEMS);
  const [scrollProgress, setScrollProgress] = useState<number>(0.28);
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({
    'shipped-core': true,
    'win-cert': true,
  });

  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll-driven vertical timeline spine progress & viewport reveal animation
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || 900;

      // Calculate how far the user has scrolled through the roadmap section
      const totalTravel = rect.height + windowHeight * 0.4;
      const currentTravel = windowHeight * 0.75 - rect.top;
      const ratio = Math.max(0.18, Math.min(1, currentTravel / totalTravel));
      setScrollProgress(ratio);

      // Reveal each milestone node as it enters the viewport
      const nextVisible: Record<string, boolean> = {};
      for (const [id, el] of Object.entries(itemRefs.current)) {
        if (!el) continue;
        const itemRect = el.getBoundingClientRect();
        if (itemRect.top < windowHeight * 0.88) {
          nextVisible[id] = true;
        }
      }
      setVisibleMap((prev) => ({ ...prev, ...nextVisible }));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Toggle an entire milestone checkbox (marks milestone and all its sub-tasks done/undone)
  const handleToggleMilestoneDone = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextDone = !item.done;
        return {
          ...item,
          done: nextDone,
          statusLabel: nextDone ? 'Completed' : 'In Progress',
          subTasks: item.subTasks.map((st) => ({ ...st, done: nextDone })),
        };
      })
    );
  };

  // Toggle an individual sub-task checkbox and auto-update parent milestone completion state
  const handleToggleSubTask = (itemId: string, subTaskId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updatedSubTasks = item.subTasks.map((st) =>
          st.id === subTaskId ? { ...st, done: !st.done } : st
        );
        const allDone = updatedSubTasks.every((st) => st.done);
        const someDone = updatedSubTasks.some((st) => st.done);
        return {
          ...item,
          done: allDone,
          statusLabel: allDone ? 'Completed' : someDone ? 'In Progress' : 'Planned',
          subTasks: updatedSubTasks,
        };
      })
    );
  };

  const totalSubTasks = items.reduce((acc, item) => acc + item.subTasks.length, 0);
  const completedSubTasks = items.reduce(
    (acc, item) => acc + item.subTasks.filter((st) => st.done).length,
    0
  );
  const completedMilestones = items.filter((item) => item.done).length;
  const completionPct = Math.round((completedSubTasks / totalSubTasks) * 100);

  return (
    <section
      id="roadmap"
      ref={sectionRef}
      aria-labelledby="roadmap-heading"
      className="scroll-mt-20 py-20 lg:py-28 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950"
    >
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header + Live Checklist Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-2xl">
            <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3">
              Interactive Release Timeline · Scroll-Driven Progress
            </p>
            <h2
              id="roadmap-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance"
            >
              Feature Roadmap &amp; Completion Checklist
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Track what is already shipped and what is currently in progress. You can also click any checkbox below to preview milestone completion states.
            </p>
          </div>

          {/* Unboxed Tabular Checklist Progress Indicator */}
          <div className="shrink-0 space-y-2 md:text-right">
            <div className="flex items-center md:justify-end gap-2 text-xs font-mono tabular-nums">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {completedMilestones}/{items.length} Milestones Done
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-600 dark:text-slate-400">
                {completedSubTasks}/{totalSubTasks} Checkpoints ({completionPct}%)
              </span>
            </div>
            <div className="w-full md:w-56 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scroll-Animated Vertical Timeline Spine (No Cards) */}
        <div className="relative mt-12 pl-8 sm:pl-12">
          {/* Background Track Line */}
          <div
            aria-hidden="true"
            className="absolute left-3 sm:left-4 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800"
          />

          {/* Scroll-Animated Active Indigo Progress Spine */}
          <div
            aria-hidden="true"
            data-testid="roadmap-scroll-spine"
            className="absolute left-3 sm:left-4 top-2 bottom-2 w-0.5 bg-indigo-600 dark:bg-indigo-400 origin-top transition-transform duration-200"
            style={{ transform: `scaleY(${scrollProgress})` }}
          />

          <div className="space-y-12">
            {items.map((item, idx) => {
              const isVisible = Boolean(visibleMap[item.id]);
              const doneSubCount = item.subTasks.filter((st) => st.done).length;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  className={`relative pb-10 ${
                    idx < items.length - 1
                      ? 'border-b border-slate-200/80 dark:border-slate-800/80'
                      : ''
                  } transition-all duration-500 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-40 translate-y-3'
                  }`}
                >
                  {/* Timeline Node Checkbox Indicator on the Spine */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.done}
                    aria-label={`Mark milestone "${item.title}" as ${
                      item.done ? 'incomplete' : 'done'
                    }`}
                    onClick={() => handleToggleMilestoneDone(item.id)}
                    className={`
                      absolute -left-8 sm:-left-12 top-0.5 w-7 h-7 rounded-md flex items-center justify-center border-2 transition-transform duration-200 cursor-pointer
                      ${
                        item.done
                          ? 'bg-indigo-600 border-indigo-600 text-white scale-105 shadow-xs'
                          : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-400 hover:border-indigo-600 dark:hover:border-indigo-400'
                      }
                    `}
                  >
                    {item.done ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {/* Milestone Metadata Line (Unboxed Typography with · Separators) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.versionOrPhase}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        item.done
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {item.done ? 'Done & Verified' : item.statusLabel}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {doneSubCount}/{item.subTasks.length} tasks checked
                    </span>
                  </div>

                  {/* Milestone Title & Prose Description */}
                  <h3
                    className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
                      item.done
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                    {item.description}
                  </p>

                  {/* Interactive Sub-Task Checkboxes List */}
                  <ul className="mt-5 space-y-2.5">
                    {item.subTasks.map((subTask) => (
                      <li key={subTask.id}>
                        <label className="inline-flex items-start gap-3 cursor-pointer group select-none">
                          <input
                            type="checkbox"
                            checked={subTask.done}
                            onChange={() => handleToggleSubTask(item.id, subTask.id)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer shrink-0"
                          />
                          <span
                            className={`text-sm leading-snug transition-colors ${
                              subTask.done
                                ? 'text-slate-500 dark:text-slate-400 line-through decoration-indigo-500/50'
                                : 'text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            }`}
                          >
                            {subTask.label}
                          </span>
                          {subTask.done && (
                            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                              [Done]
                            </span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom GitHub Roadmap Tracking Link */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Want to propose a new protocol or help with macOS notarization?
          </span>
          <a
            href="https://github.com/rdhmuhammad/apitester/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Open a roadmap issue on github.com/rdhmuhammad/apitester</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
