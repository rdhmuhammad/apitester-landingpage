import React, { useState } from 'react';
import {
  Copy,
  Check,
  GitPullRequest,
  Code2,
  ExternalLink,
  Terminal,
  Users,
} from 'lucide-react';
import { EcosystemSection } from './EcosystemSection';

interface DownloadAndOpenSourceSectionProps {
  isDark?: boolean;
  onTriggerWindowsDownload: (format: 'exe' | 'zip') => void;
  downloadStatusMessage: string | null;
  roadmapSection?: React.ReactNode;
}

export const DownloadAndOpenSourceSection: React.FC<
  DownloadAndOpenSourceSectionProps
> = ({
  isDark = false,
  onTriggerWindowsDownload,
  downloadStatusMessage,
  roadmapSection,
}) => {
  // Copyable CLI commands
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopyCommand = (id: string, cmd: string) => {
    navigator.clipboard?.writeText(cmd).catch(() => {});
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <>
      {/* ================= ECOSYSTEM SECTION (REACT FLOW + GO/SPRING/DESKTOP) ================= */}
      <EcosystemSection
        isDark={isDark}
        onTriggerWindowsDownload={onTriggerWindowsDownload}
        downloadStatusMessage={downloadStatusMessage}
      />

      {/* ================= FEATURE ROADMAP SECTION (AFTER ECOSYSTEM) ================= */}
      {roadmapSection}

      {/* ================= OPEN-SOURCE & MAINTAINERS SECTION ================= */}
      <section
        id="open-source"
        aria-labelledby="opensource-heading"
        className="scroll-mt-20 py-20 lg:py-28 bg-slate-50/70 dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column (7 cols): Open Source Mission & How to Collaborate */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3">
                  100% Open Source · MIT Licensed
                </p>
                <h2
                  id="opensource-heading"
                  className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance"
                >
                  Built in the open. Join us on GitHub to shape APITester.
                </h2>
                <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  APITester is open-source software created for developers who want full ownership of their API collections and Markdown notes. Whether you want to help finish the native macOS packaging, expand the Go and Spring generators, or improve Obsidian-style Markdown linking, we welcome your pull requests.
                </p>
              </div>

              {/* Clone & Collaborate Snippet */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Clone the repository to start hacking:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCommand(
                        'git-clone',
                        'git clone https://github.com/rdhmuhammad/apitester.git'
                      )
                    }
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {copiedCmd === 'git-clone' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied to clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy git clone</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 rounded-lg bg-slate-950 text-indigo-200 font-mono text-xs overflow-x-auto">
                  git clone https://github.com/rdhmuhammad/apitester.git{'\n'}
                  cd apitester &amp;&amp; go run _example/main.go --port 8080
                </pre>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="https://github.com/rdhmuhammad/apitester"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Collaborate on github.com/rdhmuhammad/apitester</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://github.com/rdhmuhammad/apitester/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors whitespace-nowrap shrink-0"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>Browse Good First Issues</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Maintainers & Contributors Showcase */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Project Maintainers
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Core team reviewing issues, RFCs, and pull requests
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>

                {/* Primary Creator & Lead Maintainer Card */}
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 flex items-start gap-4">
                  <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-full bg-indigo-600 text-white font-display font-bold text-base flex items-center justify-center shrink-0 shadow-xs"
                  >
                    RM
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        rdhmuhammad
                      </h4>
                      <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 shrink-0">
                        Creator &amp; Lead
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Author of <code className="font-mono text-[11px]">apitester</code>. Maintains the Go &amp; Spring generators, Windows desktop build pipeline, and React/TypeScript collection workspace.
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-medium">
                      <a
                        href="https://github.com/rdhmuhammad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>@rdhmuhammad</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <a
                        href="https://github.com/rdhmuhammad/apitester"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        Repository
                      </a>
                    </div>
                  </div>
                </div>

                {/* Open Contributor / Co-Maintainer Invitation */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-start gap-3.5">
                  <div
                    aria-hidden="true"
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-sm font-bold flex items-center justify-center shrink-0"
                  >
                    +
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Become a Contributor
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      We are actively welcoming contributors for macOS packaging, Spring Boot &amp; Go generator plugins, and Markdown graph visualizations.
                    </p>
                    <a
                      href="https://github.com/rdhmuhammad/apitester/pulls"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline pt-1"
                    >
                      <span>Submit a Pull Request on GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
