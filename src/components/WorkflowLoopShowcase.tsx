import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FolderGit2,
  CheckCircle2,
  FileText,
  ArrowRight,
  GitBranch,
  Layers,
  Link2,
} from 'lucide-react';

export type WorkflowStageId = 'collections' | 'scenarios' | 'markdown';

interface WorkflowStage {
  id: WorkflowStageId;
  index: string;
  title: string;
  subtitle: string;
  outcome: string;
  durationSec: number;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'collections',
    index: '01.',
    title: 'Manage Collections Inside Your Repo Folder',
    subtitle:
      'Open any Git repository as a project workspace. Browse multiple *.collection.json files side by side and commit API changes alongside your backend code.',
    outcome: 'Zero cloud sync drift — collections live in version control.',
    durationSec: 6,
  },
  {
    id: 'scenarios',
    index: '02.',
    title: 'Run Chained Multi-Step Test Scenarios',
    subtitle:
      'Execute sequential API flows that extract tokens from step 1, inject {{AUTH_TOKEN}} into checkout requests, and verify HTTP status, latency, and JSON schema.',
    outcome: 'Deterministic regression checks before every pull request.',
    durationSec: 6,
  },
  {
    id: 'markdown',
    index: '03.',
    title: 'Obsidian-Style Markdown Documentation',
    subtitle:
      'Write architecture notes and debugging runbooks in standard .md files with bidirectional [[Request]] wiki-links that jump straight to live API endpoints.',
    outcome: 'Living API documentation that never falls out of date.',
    durationSec: 6,
  },
];

export const WorkflowLoopShowcase: React.FC = () => {
  const [activeStage, setActiveStage] = useState<WorkflowStageId>('collections');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // 0 to 100 within current stage
  const [animStep, setAnimStep] = useState<number>(0); // 0, 1, 2 sub-steps inside each loop

  useEffect(() => {
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next stage in loop
          setActiveStage((current) => {
            if (current === 'collections') return 'scenarios';
            if (current === 'scenarios') return 'markdown';
            return 'collections';
          });
          return 0;
        }
        return prev + 2;
      });
    }, 120);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (progress < 34) {
      setAnimStep(0);
    } else if (progress < 68) {
      setAnimStep(1);
    } else {
      setAnimStep(2);
    }
  }, [progress]);

  const handleSelectStage = (stageId: WorkflowStageId) => {
    setActiveStage(stageId);
    setProgress(0);
    setAnimStep(0);
  };

  const handleRestartLoop = () => {
    setActiveStage('collections');
    setProgress(0);
    setAnimStep(0);
    setIsPlaying(true);
  };

  return (
    <section
      id="workflows"
      aria-labelledby="workflows-heading"
      className="scroll-mt-20 py-20 lg:py-28 border-b border-slate-200 dark:border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3">
            Continuous Workflow Walkthrough · Auto-Looping Preview
          </p>
          <h2
            id="workflows-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance"
          >
            One local workspace for collections, test scenarios, and Markdown notes.
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Watch how APITester replaces fragmented cloud workspaces with a single repository-first loop. Select any workflow stage below or let the continuous loop play through.
          </p>
        </div>

        {/* Vendo-Inspired 12-Column Split: 5-Col Chapter Controls + 7-Col Looping Video Player */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: 3 Workflow Stage Selector Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {WORKFLOW_STAGES.map((stage) => {
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleSelectStage(stage.id)}
                  className={`
                    w-full text-left p-5 rounded-xl border transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-600
                    ${
                      isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-2 border-indigo-600 dark:border-indigo-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {stage.index} {stage.id.toUpperCase()}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      {isActive ? `Looping · ${Math.min(100, Math.round(progress))}%` : 'Click to preview'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                    {stage.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {stage.subtitle}
                  </p>
                  <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    <span>{stage.outcome}</span>
                  </div>

                  {/* Progress Bar inside active card */}
                  <div className="mt-3 h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-150"
                      style={{ width: isActive ? `${progress}%` : '0%' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Continuous Looping Walkthrough Video Viewport */}
          <div
            data-testid="workflow-loop-player"
            className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden shadow-xl"
          >
            {/* Video Player Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-semibold text-[11px]">
                  LOOP VIDEO
                </span>
                <span className="text-slate-300 truncate">
                  {activeStage === 'collections' && '01_manage_repo_collections.webm'}
                  {activeStage === 'scenarios' && '02_automated_test_scenario.webm'}
                  {activeStage === 'markdown' && '03_obsidian_markdown_docs.webm'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pause workflow video loop' : 'Play workflow video loop'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Play</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRestartLoop}
                  aria-label="Restart workflow loop"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>
            </div>

            {/* Animated Looping Stage Canvas */}
            <div className="p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-950 to-slate-900 space-y-4">
              {activeStage === 'collections' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-3.5 py-2.5 rounded-lg">
                    <span className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-indigo-400" />
                      <span>Opened Repo: ~/work/acme-commerce-api</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>3 collection.json files synced</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        file: 'auth.collection.json',
                        count: '4 endpoints · OAuth2 & JWT',
                        status: animStep >= 0 ? 'Loaded from disk' : 'Scanning...',
                        active: animStep === 0,
                      },
                      {
                        file: 'orders.collection.json',
                        count: '7 endpoints · Checkout API',
                        status: animStep >= 1 ? 'Modified · Git diff clean' : 'Loaded from disk',
                        active: animStep === 1,
                      },
                      {
                        file: 'webhooks.collection.json',
                        count: '3 endpoints · Event Delivery',
                        status: animStep >= 2 ? 'Auto-saved to repo' : 'Loaded from disk',
                        active: animStep === 2,
                      },
                    ].map((item) => (
                      <div
                        key={item.file}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          item.active
                            ? 'bg-indigo-950/60 border-indigo-500'
                            : 'bg-slate-900/80 border-slate-800'
                        }`}
                      >
                        <div className="font-mono text-xs font-semibold text-white truncate">
                          {item.file}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{item.count}</div>
                        <div className="mt-3 text-[11px] font-mono text-indigo-300">
                          {item.status}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Animated Git Diff & Live File Tree Inspector */}
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80">
                      <span>$ git diff collections/orders.collection.json</span>
                      <span className="text-emerald-400">+4 lines · 0 conflicts</span>
                    </div>
                    <div className="text-emerald-400 pt-1">
                      + &quot;name&quot;: &quot;POST /v1/orders/checkout&quot;,
                    </div>
                    <div className="text-emerald-400">
                      + &quot;url&quot;: &quot;{'{{BASE_URL}}'}/v1/orders/checkout&quot;,
                    </div>
                    <div className="text-emerald-400">
                      + &quot;headers&quot;: {'{ "Authorization": "Bearer {{AUTH_TOKEN}}" }'},
                    </div>
                    <div className="text-slate-300">
                      &nbsp; &quot;expectedStatus&quot;: 201
                    </div>
                  </div>
                </>
              )}

              {activeStage === 'scenarios' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-3.5 py-2.5 rounded-lg">
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Scenario: Checkout E2E Flow (3 Chained Steps)</span>
                    </span>
                    <span className="text-emerald-400 tabular-nums">
                      Total Time: 149ms · 9/9 Assertions Passed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        step: 'Step 1',
                        endpoint: 'POST /v1/auth/token',
                        detail: 'Extracts response.access_token -> {{AUTH_TOKEN}}',
                        time: '34ms · 200 OK',
                        done: animStep >= 0,
                      },
                      {
                        step: 'Step 2',
                        endpoint: 'POST /v1/orders/checkout',
                        detail: 'Injects Bearer {{AUTH_TOKEN}} · Asserts order_id != null',
                        time: '64ms · 201 Created',
                        done: animStep >= 1,
                      },
                      {
                        step: 'Step 3',
                        endpoint: 'POST /v1/webhooks/dispatch',
                        detail: 'Verifies HMAC signature header & 200 delivery',
                        time: '51ms · 200 OK',
                        done: animStep >= 2,
                      },
                    ].map((s, idx) => (
                      <div
                        key={s.step}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                          animStep === idx
                            ? 'bg-indigo-950/60 border-indigo-500'
                            : 'bg-slate-900/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              s.done ? 'text-emerald-400' : 'text-slate-600'
                            }`}
                          />
                          <div>
                            <div className="font-mono text-xs font-semibold text-white">
                              {s.step}: {s.endpoint}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{s.detail}</div>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-emerald-400 tabular-nums shrink-0">
                          {s.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chained Variable Output Summary */}
                  <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs flex flex-wrap items-center justify-between gap-2 text-slate-300">
                    <span>Chained Context: <strong className="text-indigo-400">{'{{AUTH_TOKEN}}'}</strong> ➔ <strong className="text-indigo-400">ord_9049_new</strong> ➔ <strong className="text-emerald-400">dlv_77310</strong></span>
                    <span className="text-emerald-400">Scenario Passed</span>
                  </div>
                </>
              )}

              {activeStage === 'markdown' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-3.5 py-2.5 rounded-lg">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>Obsidian-Style Note: docs/architecture.md</span>
                    </span>
                    <span className="text-indigo-300">Bidirectional [[Wiki-Links]] Active</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/90 font-mono text-xs space-y-2.5">
                      <div className="text-[11px] text-slate-400">RAW MARKDOWN IN REPO</div>
                      <div className="text-white font-bold"># Checkout Runbook</div>
                      <p className="text-slate-300 leading-relaxed">
                        1. Issue token via{' '}
                        <span className="text-indigo-400">[[POST /v1/auth/token]]</span>
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        2. Capture cart with{' '}
                        <span className="text-indigo-400">[[POST /v1/orders/checkout]]</span>
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        3. Verify event in{' '}
                        <span className="text-indigo-400">[[POST /v1/webhooks/dispatch]]</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border border-indigo-500/60 bg-indigo-950/30 text-xs space-y-2.5">
                      <div className="text-[11px] font-mono text-indigo-300">
                        LINKED GRAPH &amp; CLICKABLE ENDPOINTS
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-mono text-indigo-300">
                          <Link2 className="w-3.5 h-3.5" />
                          <span>POST /v1/auth/token</span>
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          {animStep === 0 ? 'Active Link' : 'Linked'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-mono text-indigo-300">
                          <Link2 className="w-3.5 h-3.5" />
                          <span>POST /v1/orders/checkout</span>
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          {animStep === 1 ? 'Opened in Sidebar' : 'Linked'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-mono text-indigo-300">
                          <Link2 className="w-3.5 h-3.5" />
                          <span>POST /v1/webhooks/dispatch</span>
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          {animStep === 2 ? 'Running 200 OK' : 'Linked'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs flex flex-wrap items-center justify-between gap-2 text-slate-300">
                    <span>Backlinks Indexed: 3 API requests ↔ 3 .md engineering notes</span>
                    <span className="text-indigo-400">100% Local Markdown</span>
                  </div>
                </>
              )}
            </div>

            {/* Video Player Scrubber Footer */}
            <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-400 tabular-nums">
                <span>Stage {activeStage === 'collections' ? '1/3' : activeStage === 'scenarios' ? '2/3' : '3/3'}</span>
                <span aria-hidden="true">·</span>
                <span>Sub-step {animStep + 1}/3</span>
              </div>
              <div className="flex items-center gap-1.5">
                {(['collections', 'scenarios', 'markdown'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStage(st)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] capitalize transition-colors ${
                      activeStage === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
