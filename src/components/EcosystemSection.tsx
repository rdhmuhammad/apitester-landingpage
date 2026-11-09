import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Laptop,
  GitBranch,
  Server,
  Play,
  Copy,
  Check,
  Download,
  Code2,
  Layers,
  CheckCircle2,
  Cloud,
} from 'lucide-react';

export type EcosystemItemKey = 'desktop' | 'go-generator' | 'spring-generator';

export interface SimpleLaptopNodeData extends Record<string, unknown> {
  title: string;
  isActiveStep: boolean;
  handlePosition: 'right' | 'left';
}

export interface ServerProcessNodeData extends Record<string, unknown> {
  stepNumber: string;
  title: string;
  subtitle: string;
  badge: string;
  iconType: 'cicd' | 'server';
  isActiveStep: boolean;
}

export interface ServerGroupNodeData extends Record<string, unknown> {
  label: string;
  isActiveGroup: boolean;
}

/**
 * Compact endpoint node for "apitester desktop" (bottom-left) and "team explore away" (bottom-right)
 * featuring a Laptop icon and simple title.
 */
const SimpleLaptopFlowNode: React.FC<NodeProps<Node<SimpleLaptopNodeData>>> = ({
  data,
}) => {
  return (
    <div
      className={`px-5 py-4 rounded-xl border-2 transition-all shadow-sm flex items-center gap-3 ${
        data.isActiveStep
          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/95 dark:bg-indigo-950/90 ring-4 ring-indigo-500/15'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      {data.handlePosition === 'left' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-indigo-600 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900"
        />
      )}

      <div className="p-2.5 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shrink-0">
        <Laptop className="w-5 h-5" />
      </div>

      <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
        {data.title}
      </span>

      {data.handlePosition === 'right' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2.5 !h-2.5 !bg-indigo-600 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900"
        />
      )}
    </div>
  );
};

/**
 * Group container node around the 2 center nodes labeled "on server".
 */
const OnServerGroupNode: React.FC<NodeProps<Node<ServerGroupNodeData>>> = ({
  data,
}) => {
  return (
    <div
      className={`w-[640px] h-[195px] rounded-2xl border-2 border-dashed p-3 transition-colors ${
        data.isActiveGroup
          ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/25'
          : 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/15 dark:bg-slate-900/40'
      }`}
    >
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-100/90 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold">
        <Cloud className="w-3.5 h-3.5" />
        <span>{data.label}</span>
      </div>
    </div>
  );
};

/**
 * Center server nodes ("Push to Server (CI/CD)" and "Service Reloads Changes").
 */
const ServerProcessFlowNode: React.FC<NodeProps<Node<ServerProcessNodeData>>> = ({
  data,
}) => {
  const IconComp = data.iconType === 'cicd' ? GitBranch : Server;

  return (
    <div
      className={`w-60 rounded-xl border-2 p-4 transition-all shadow-sm ${
        data.isActiveStep
          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/95 dark:bg-indigo-950/90 ring-4 ring-indigo-500/15'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-indigo-600 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
          {data.stepNumber}
        </span>
        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
          {data.badge}
        </span>
      </div>

      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shrink-0 mt-0.5">
          <IconComp className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
            {data.title}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {data.subtitle}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-indigo-600 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900"
      />
    </div>
  );
};

const nodeTypes = {
  simpleLaptopNode: SimpleLaptopFlowNode,
  serverGroupNode: OnServerGroupNode,
  serverProcessNode: ServerProcessFlowNode,
};

interface EcosystemSectionProps {
  isDark: boolean;
  onTriggerWindowsDownload: (format: 'exe' | 'zip') => void;
  downloadStatusMessage: string | null;
}

export const EcosystemSection: React.FC<EcosystemSectionProps> = ({
  isDark,
  onTriggerWindowsDownload,
  downloadStatusMessage,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<EcosystemItemKey>('go-generator');
  const [activeSimStep, setActiveSimStep] = useState<number>(0); // 0 = idle, 1..4 = simulating step
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Immutable, static nodes matching the stepped layout with the 2 center nodes grouped inside "on server"
  const nodes: Node[] = useMemo(
    () => [
      {
        id: 'group-on-server',
        type: 'serverGroupNode',
        position: { x: 280, y: 15 },
        draggable: false,
        selectable: false,
        connectable: false,
        data: {
          label: 'on server',
          isActiveGroup: activeSimStep === 2 || activeSimStep === 3,
        },
      },
      {
        id: 'node-1',
        type: 'simpleLaptopNode',
        position: { x: 10, y: 205 },
        draggable: false,
        selectable: false,
        connectable: false,
        data: {
          title: 'apitester desktop',
          isActiveStep: activeSimStep === 1,
          handlePosition: 'right',
        },
      },
      {
        id: 'node-2',
        type: 'serverProcessNode',
        position: { x: 305, y: 55 },
        draggable: false,
        selectable: false,
        connectable: false,
        data: {
          stepNumber: 'STEP 02',
          title: 'Push to Server (CI/CD)',
          subtitle: 'Commit updated collection files to Git; CI/CD deploys the latest spec.',
          badge: 'git push origin main',
          iconType: 'cicd',
          isActiveStep: activeSimStep === 2,
        },
      },
      {
        id: 'node-3',
        type: 'serverProcessNode',
        position: { x: 655, y: 55 },
        draggable: false,
        selectable: false,
        connectable: false,
        data: {
          stepNumber: 'STEP 03',
          title: 'Service Reloads Changes',
          subtitle: 'Go or Spring APITester Generator reloads the updated collection on server.',
          badge: 'Go & Spring Boot',
          iconType: 'server',
          isActiveStep: activeSimStep === 3 || activeSimStep === 0,
        },
      },
      {
        id: 'node-4',
        type: 'simpleLaptopNode',
        position: { x: 1015, y: 205 },
        draggable: false,
        selectable: false,
        connectable: false,
        data: {
          title: 'team explore away',
          isActiveStep: activeSimStep === 4,
          handlePosition: 'left',
        },
      },
    ],
    [activeSimStep]
  );

  const edges: Edge[] = useMemo(
    () => [
      {
        id: 'e1-2',
        source: 'node-1',
        target: 'node-2',
        animated: true,
        label: 'git push',
        labelStyle: {
          fontSize: 11,
          fontFamily: 'JetBrains Mono',
          fill: isDark ? '#a5b4fc' : '#4f46e5',
          fontWeight: 600,
        },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: isDark ? '#0f172a' : '#ffffff', fillOpacity: 0.95 },
        style: { stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' },
      },
      {
        id: 'e2-3',
        source: 'node-2',
        target: 'node-3',
        animated: true,
        label: 'CI/CD deploy',
        labelStyle: {
          fontSize: 11,
          fontFamily: 'JetBrains Mono',
          fill: isDark ? '#a5b4fc' : '#4f46e5',
          fontWeight: 600,
        },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: isDark ? '#0f172a' : '#ffffff', fillOpacity: 0.95 },
        style: { stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' },
      },
      {
        id: 'e3-4',
        source: 'node-3',
        target: 'node-4',
        animated: true,
        label: 'serves GUI',
        labelStyle: {
          fontSize: 11,
          fontFamily: 'JetBrains Mono',
          fill: isDark ? '#a5b4fc' : '#4f46e5',
          fontWeight: 600,
        },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: isDark ? '#0f172a' : '#ffffff', fillOpacity: 0.95 },
        style: { stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' },
      },
    ],
    [isDark]
  );

  const handleSimulatePipeline = () => {
    setActiveSimStep(1);
    setTimeout(() => setActiveSimStep(2), 700);
    setTimeout(() => setActiveSimStep(3), 1400);
    setTimeout(() => setActiveSimStep(4), 2100);
    setTimeout(() => setActiveSimStep(0), 3200);
  };

  const handleCopySnippet = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <section
      id="ecosystem"
      aria-labelledby="ecosystem-heading"
      className="scroll-mt-20 py-20 lg:py-28 border-b border-slate-200 dark:border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3">
              End-to-End API Ecosystem · React Flow Architecture
            </p>
            <h2
              id="ecosystem-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance"
            >
              From APITester Desktop in your repo to live Swagger-like GUIs on your server.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Manage collections locally with <strong>apitester desktop</strong>, push to Git, and let the <strong>APITester Generator in Go or Spring</strong> reload changes on the server so frontend and partner teams can explore API capabilities right away.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulatePipeline}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start lg:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {activeSimStep > 0
                ? `Simulating Step 0${activeSimStep}/04...`
                : 'Simulate Repo-to-Server Flow'}
            </span>
          </button>
        </div>

        {downloadStatusMessage && (
          <div
            role="status"
            data-testid="download-confirmation-banner"
            className="mb-8 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/50 flex flex-wrap items-center justify-between gap-4 text-sm text-indigo-950 dark:text-indigo-200"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-medium">{downloadStatusMessage}</span>
            </div>
          </div>
        )}

        {/* ================= STATIC & IMMUTABLE REACT FLOW DIAGRAM ================= */}
        <div
          data-testid="ecosystem-reactflow-container"
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 overflow-hidden mb-10"
        >
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
            <span>
              Ecosystem Pipeline Flow
            </span>
            <span className="text-indigo-600 dark:text-indigo-400">
              apitester desktop ➔ on server (CI/CD &amp; Go/Spring reload) ➔ team explore away
            </span>
          </div>

          <div className="h-[320px] w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              nodesFocusable={false}
              edgesFocusable={false}
              elementsSelectable={false}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              fitView
              fitViewOptions={{ padding: 0.12 }}
            >
              <Background
                color={isDark ? '#334155' : '#cbd5e1'}
                gap={20}
                size={1}
              />
            </ReactFlow>
          </div>
        </div>

        {/* ================= 3 ECOSYSTEM PILLARS: GO GENERATOR, SPRING GENERATOR, DESKTOP ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pillar 1: APITester Generator in Go + Minimal GUI */}
          <div
            onClick={() => setSelectedPillar('go-generator')}
            className={`p-6 rounded-xl border transition-colors flex flex-col justify-between cursor-pointer ${
              selectedPillar === 'go-generator'
                ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 text-xs font-mono">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  01. Go Ecosystem
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Swagger-like Embedded GUI
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>APITester Generator in Go + Minimal GUI</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Embed directly into your Go HTTP service. Reads your repository&apos;s <code className="font-mono text-xs text-indigo-600 dark:text-indigo-400">collection.json</code> file, hot-reloads on CI/CD deploy, and mounts a clean, zero-dependency Swagger-like web UI for frontend teams.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>Go Module &amp; Handler:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopySnippet(
                      'go-gen',
                      'go get github.com/rdhmuhammad/apitester'
                    );
                  }}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {copiedSnippet === 'go-gen' ? (
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
              <pre className="p-3 rounded-lg bg-slate-950 text-indigo-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {`go get github.com/rdhmuhammad/apitester\n\n// Mount minimal Swagger-like GUI\nhttp.Handle("/apitester/", apitester.Handler(\n  "./collections/orders.collection.json",\n))`}
              </pre>
            </div>
          </div>

          {/* Pillar 2: APITester Generator in Spring + Minimal GUI */}
          <div
            onClick={() => setSelectedPillar('spring-generator')}
            className={`p-6 rounded-xl border transition-colors flex flex-col justify-between cursor-pointer ${
              selectedPillar === 'spring-generator'
                ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 text-xs font-mono">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  02. Spring Boot Ecosystem
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Swagger-like Embedded GUI
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>APITester Generator in Spring + Minimal GUI</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Drop-in Spring Boot starter that syncs controller endpoints with your repo&apos;s collection files and exposes a minimal, interactive APITester web interface (similar to Swagger UI) that reloads automatically on server deployment.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>Maven / Gradle Config:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopySnippet(
                      'spring-gen',
                      'apitester.collection-path=classpath:collections/orders.collection.json'
                    );
                  }}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {copiedSnippet === 'spring-gen' ? (
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
              <pre className="p-3 rounded-lg bg-slate-950 text-indigo-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {`# application.yml\napitester:\n  enabled: true\n  path: /apitester-ui\n  collection: ./collections/orders.collection.json`}
              </pre>
            </div>
          </div>

          {/* Pillar 3: APITester Desktop */}
          <div
            onClick={() => setSelectedPillar('desktop')}
            className={`p-6 rounded-xl border transition-colors flex flex-col justify-between cursor-pointer ${
              selectedPillar === 'desktop'
                ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 text-xs font-mono">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  03. Local Authoring Client
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  v1.4.2 Windows (macOS soon)
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>APITester Desktop Workspace</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                The local desktop app where backend engineers author requests, test scenarios, and Obsidian-style <code className="font-mono text-xs text-indigo-600 dark:text-indigo-400">.md</code> notes directly inside the Git repository folder before pushing changes to CI/CD.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerWindowsDownload('exe');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Windows Installer (.exe)</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerWindowsDownload('zip');
                  }}
                  className="px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Portable .zip</span>
                </button>
              </div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                macOS Apple Silicon &amp; Intel signed builds arriving in Q1–Q2.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
