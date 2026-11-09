/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  FolderGit2,
} from 'lucide-react';
import {
  ReactBitsBackground,
  type ReactBitsVariant,
} from './components/ReactBitsBackground';
import { ApiTesterPlayground } from './components/ApiTesterPlayground';
import { WorkflowLoopShowcase } from './components/WorkflowLoopShowcase';
import { FeaturesBentoSection } from './components/FeaturesBentoSection';
import { DownloadAndOpenSourceSection } from './components/DownloadAndOpenSourceSection';

export default function App() {
  const [isDark] = useState<boolean>(false);
  const [bgVariant] = useState<ReactBitsVariant>('squares');
  const [copiedHeroCmd, setCopiedHeroCmd] = useState<boolean>(false);
  const [downloadStatusMessage, setDownloadStatusMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleTriggerWindowsDownload = (format: 'exe' | 'zip' = 'exe') => {
    const fileName =
      format === 'exe'
        ? 'APITester-Setup-1.4.2-win-x64.exe'
        : 'APITester-Portable-1.4.2-win-x64.zip';

    setDownloadStatusMessage(
      `Started preparing ${fileName} (v1.4.2 for Windows). You can also grab release binaries or build from source at github.com/rdhmuhammad/apitester.`
    );

    const el = document.getElementById('ecosystem');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyHeroInstall = () => {
    const cmd = 'git clone https://github.com/rdhmuhammad/apitester.git';
    navigator.clipboard?.writeText(cmd).catch(() => {});
    setCopiedHeroCmd(true);
    setTimeout(() => setCopiedHeroCmd(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ================= STRICT 3-ZONE TOP BAR CONTRACT ================= */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Brand logo + banner-styled wordmark */}
          <a
            href="#"
            className="inline-flex items-center gap-2.5 text-2xl font-bold italic tracking-tight text-[#7600FF] dark:text-[#9d4edd] whitespace-nowrap shrink-0"
            style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }}
          >
            <img
              src="/assets/aistudio/AppLogo_7d575aa3.svg"
              alt="Apitester Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            <span className="relative inline-flex items-center">
              Apitester
              <svg
                viewBox="0 0 24 20"
                aria-hidden="true"
                className="w-3.5 h-3.5 -mt-3 ml-0.5 text-[#FFA0A0] fill-current shrink-0"
              >
                <rect x="2" y="2" width="3.5" height="10" rx="1.75" transform="rotate(18 4 7)" />
                <rect x="9" y="5" width="3.5" height="11" rx="1.75" transform="rotate(48 11 10)" />
                <rect x="12" y="12" width="3.5" height="11" rx="1.75" transform="rotate(78 14 17)" />
              </svg>
            </span>
          </a>

          {/* Zone 2: 4–5 concise single-line text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <a
              href="#playground"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Playground
            </a>
            <a
              href="#workflows"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Workflows
            </a>
            <a
              href="#ecosystem"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ecosystem
            </a>
            <a
              href="#roadmap"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Roadmap
            </a>
            <a
              href="#open-source"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Open Source
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleTriggerWindowsDownload('exe')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Download for Windows
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ================= HERO SECTION (VENDO LAYOUT + REACTBITS BG + INTERACTIVE PLAYGROUND) ================= */}
        <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800/80 pt-12 pb-20 lg:pt-16 lg:pb-28">
          {/* Animated ReactBits Background Canvas */}
          <ReactBitsBackground variant={bgVariant} isDark={isDark} />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Top Utility Bar inside Hero */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-slate-200/70 dark:border-slate-800/70 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  v1.4.2 Release
                </span>
                <span aria-hidden="true">·</span>
                <span>Windows 10/11 Native Client</span>
                <span aria-hidden="true">·</span>
                <span>macOS Build Coming Soon</span>
                <span aria-hidden="true">·</span>
                <span>MIT Open Source</span>
              </div>
            </div>

            {/* Vendo-Style Centered / High-Impact Hero Copy */}
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1
                className="font-display font-extrabold tracking-tight text-slate-900 dark:text-white text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4.3vw, 3.65rem)', lineHeight: 1.1 }}
              >
                <span className="block">Less shenanigans, more nap time.</span>
                <span className="block mt-1 text-[#7600FF] dark:text-indigo-400">
                  Automate repetitive API testing once and for all.
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Stop spending 10 minutes hand-crafting massive nested JSON payloads every time you finish an endpoint. Apitester extracts collection specs directly from your source code controllers, autofills mock payloads with environment variables, and runs multi-step <code className="font-mono text-sm text-indigo-600 dark:text-indigo-400">.http</code> test scenarios in a zero-setup desktop GUI powered by embedded BoltDB—so you can focus on real engineering challenges.
              </p>

              {/* Vendo-Style Primary Download CTA + One-Line Clone Command */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => handleTriggerWindowsDownload('exe')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download for Windows (v1.4.2)</span>
                </button>

                {/* Vendo-style One-Click Command Box */}
                <div className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 font-mono text-xs text-slate-700 dark:text-slate-200">
                  <span className="truncate">
                    $ git clone https://github.com/rdhmuhammad/apitester.git
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHeroInstall}
                    aria-label="Copy git clone command"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline shrink-0 cursor-pointer"
                  >
                    {copiedHeroCmd ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Windows 10/11 (.exe &amp; portable .zip)</span>
                <span aria-hidden="true">·</span>
                <a
                  href="#ecosystem"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Explore Go, Spring &amp; Desktop Ecosystem
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="https://github.com/rdhmuhammad/apitester"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
                >
                  <span>View source on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Interactive APITester UI Playground in the First Section */}
            <div id="playground" className="scroll-mt-24">
              <ApiTesterPlayground pageDark={isDark} />
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: LOOPING VIDEO WORKFLOW SHOWCASE ================= */}
        <WorkflowLoopShowcase />

        {/* ================= SECTION 3, 4 & 5: ECOSYSTEM -> FEATURE ROADMAP -> OPEN-SOURCE MAINTAINERS ================= */}
        <DownloadAndOpenSourceSection
          isDark={isDark}
          onTriggerWindowsDownload={handleTriggerWindowsDownload}
          downloadStatusMessage={downloadStatusMessage}
          roadmapSection={<FeaturesBentoSection />}
        />
      </main>

      {/* ================= QUIET FOOTER ================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-sm text-indigo-600 dark:text-indigo-400">
              apitester
            </span>
            <span aria-hidden="true">·</span>
            <span>Open-Source Git-Native API Client &amp; Markdown Workspace</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="https://github.com/rdhmuhammad/apitester"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>github.com/rdhmuhammad/apitester</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
