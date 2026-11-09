import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  FileJson,
  FileText,
  Play,
  SlidersHorizontal,
  Search,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle,
  Plus,
  Link2,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  INITIAL_ENVIRONMENTS,
  INITIAL_COLLECTIONS,
  INITIAL_MARKDOWN_DOCS,
} from '../data/workspaceSeed';
import {
  filterRepoWorkspace,
  executeSimulatedRequest,
  parseMarkdownWikiLinks,
  type ApiRequestItem,
  type CollectionFile,
  type MarkdownDocFile,
  type EnvEnvironment,
  type HttpMethod,
} from '../utils/apitesterLogic';

interface ApiTesterPlaygroundProps {
  pageDark: boolean;
}

export const ApiTesterPlayground: React.FC<ApiTesterPlaygroundProps> = ({
  pageDark,
}) => {
  // Independent dark mode state for the playground window (synced when page theme changes)
  const [appDark, setAppDark] = React.useState<boolean>(pageDark);

  React.useEffect(() => {
    setAppDark(pageDark);
  }, [pageDark]);
  const [environments, setEnvironments] = useState<EnvEnvironment[]>(INITIAL_ENVIRONMENTS);
  const [activeEnvId, setActiveEnvId] = useState<string>('local');
  const [showEnvPopover, setShowEnvPopover] = useState<boolean>(false);

  const [collections, setCollections] = useState<CollectionFile[]>(INITIAL_COLLECTIONS);
  const [markdownDocs, setMarkdownDocs] = useState<MarkdownDocFile[]>(INITIAL_MARKDOWN_DOCS);

  // Active workspace item: either an API request or an Obsidian-style Markdown note
  const [activeItemType, setActiveItemType] = useState<'request' | 'markdown'>('request');
  const [activeRequestId, setActiveRequestId] = useState<string>('req-auth-token');
  const [activeMarkdownId, setActiveMarkdownId] = useState<string>('doc-architecture');

  // Sidebar search & filter
  const [sidebarSearch, setSidebarSearch] = useState<string>('');
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'collections' | 'markdown'>('all');
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({
    'col-auth': true,
    'col-orders': true,
    'col-webhooks': true,
  });

  // Request builder sub-tabs & custom edits
  const [requestTab, setRequestTab] = useState<'body' | 'headers' | 'assertions'>('body');
  const [customUrlMap, setCustomUrlMap] = useState<Record<string, string>>({});
  const [customBodyMap, setCustomBodyMap] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState<boolean>(false);
  const [runCounter, setRunCounter] = useState<number>(1);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  // Markdown editor view mode
  const [mdViewMode, setMdViewMode] = useState<'split' | 'preview' | 'raw'>('split');

  // New request modal state inside playground
  const [showNewRequestForm, setShowNewRequestForm] = useState<boolean>(false);
  const [newReqName, setNewReqName] = useState<string>('');
  const [newReqMethod, setNewReqMethod] = useState<HttpMethod>('GET');
  const [newReqCollectionId, setNewReqCollectionId] = useState<string>('col-orders');

  const activeEnv = useMemo(
    () => environments.find((e) => e.id === activeEnvId) || environments[0],
    [environments, activeEnvId]
  );

  const allRequests = useMemo(
    () => collections.flatMap((c) => c.requests),
    [collections]
  );

  const activeRequest = useMemo(
    () => allRequests.find((r) => r.id === activeRequestId) || allRequests[0],
    [allRequests, activeRequestId]
  );

  const activeMarkdown = useMemo(
    () => markdownDocs.find((d) => d.id === activeMarkdownId) || markdownDocs[0],
    [markdownDocs, activeMarkdownId]
  );

  const filteredRepo = useMemo(
    () => filterRepoWorkspace(collections, markdownDocs, sidebarSearch, sidebarFilter),
    [collections, markdownDocs, sidebarSearch, sidebarFilter]
  );

  const currentUrlValue = customUrlMap[activeRequest.id] ?? activeRequest.url;
  const currentBodyValue = customBodyMap[activeRequest.id] ?? activeRequest.body;

  const executionResult = useMemo(
    () =>
      executeSimulatedRequest(
        activeRequest,
        activeEnv,
        currentUrlValue,
        currentBodyValue
      ),
    [activeRequest, activeEnv, currentUrlValue, currentBodyValue, runCounter]
  );

  const handleSendRequest = () => {
    setIsSending(true);
    setTimeout(() => {
      setRunCounter((c) => c + 1);
      setIsSending(false);
    }, 120);
  };

  const handleSelectRequest = (reqId: string) => {
    setActiveRequestId(reqId);
    setActiveItemType('request');
  };

  const handleSelectMarkdown = (docId: string) => {
    setActiveMarkdownId(docId);
    setActiveItemType('markdown');
  };

  const handleWikiLinkClick = (targetName: string) => {
    // Match against request name or markdown filename
    const matchedReq = allRequests.find(
      (r) => r.name.toLowerCase() === targetName.toLowerCase()
    );
    if (matchedReq) {
      setActiveRequestId(matchedReq.id);
      setActiveItemType('request');
      return;
    }
    const matchedDoc = markdownDocs.find(
      (d) =>
        d.filename.toLowerCase() === targetName.toLowerCase() ||
        d.title.toLowerCase() === targetName.toLowerCase()
    );
    if (matchedDoc) {
      setActiveMarkdownId(matchedDoc.id);
      setActiveItemType('markdown');
    }
  };

  const handleUpdateEnvVar = (key: string, val: string) => {
    setEnvironments((prev) =>
      prev.map((env) =>
        env.id === activeEnv.id
          ? { ...env, variables: { ...env.variables, [key]: val } }
          : env
      )
    );
  };

  const handleCreateNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newReqName.trim();
    if (!trimmed) return;
    const newId = `req-custom-${Date.now()}`;
    const newReq: ApiRequestItem = {
      id: newId,
      collectionId: newReqCollectionId,
      name: trimmed.startsWith('/') ? `${newReqMethod} ${trimmed}` : `${newReqMethod} /v1/${trimmed}`,
      method: newReqMethod,
      url: trimmed.startsWith('/')
        ? `{{BASE_URL}}${trimmed}`
        : `{{BASE_URL}}/v1/${trimmed}`,
      description: 'Custom endpoint added to local collection file in repository.',
      headers: {
        Authorization: 'Bearer {{AUTH_TOKEN}}',
        'Content-Type': 'application/json',
      },
      body: newReqMethod === 'GET' ? '' : '{\n  "org_id": "{{ORG_ID}}"\n}',
      expectedStatus: newReqMethod === 'POST' ? 201 : 200,
      mockLatencyMs: 29,
      mockResponse: {
        ok: true,
        endpoint: trimmed,
        saved_to_repo: true,
      },
      assertions: [
        {
          id: `assert-${Date.now()}`,
          label: `HTTP Status == ${newReqMethod === 'POST' ? 201 : 200}`,
          field: 'status',
          expected: newReqMethod === 'POST' ? 201 : 200,
          passed: true,
        },
      ],
    };

    setCollections((prev) =>
      prev.map((col) =>
        col.id === newReqCollectionId
          ? { ...col, requests: [...col.requests, newReq] }
          : col
      )
    );
    setExpandedCollections((prev) => ({ ...prev, [newReqCollectionId]: true }));
    setActiveRequestId(newId);
    setActiveItemType('request');
    setNewReqName('');
    setShowNewRequestForm(false);
  };

  const handleCopyResponse = () => {
    const text = JSON.stringify(executionResult.responseBody, null, 2);
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 1800);
  };

  const methodColor = (method: HttpMethod) => {
    switch (method) {
      case 'GET':
        return appDark ? 'text-emerald-400' : 'text-emerald-700';
      case 'POST':
        return appDark ? 'text-indigo-400' : 'text-indigo-600';
      case 'PUT':
      case 'PATCH':
        return appDark ? 'text-amber-400' : 'text-amber-700';
      case 'DELETE':
        return appDark ? 'text-rose-400' : 'text-rose-600';
    }
  };

  return (
    <div
      data-testid="apitester-playground"
      className={`
        rounded-xl border transition-colors duration-200 overflow-hidden shadow-xl
        ${
          appDark
            ? 'dark bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }
      `}
    >
      {/* Desktop App Title Bar */}
      <div
        className={`
          flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 px-4 py-2.5 border-b text-xs
          ${
            appDark
              ? 'bg-slate-950 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }
        `}
      >
        {/* Left: Window Controls & Opened Repository Folder */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="flex items-center gap-2 font-mono text-xs truncate">
            <FolderGit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              ~/repos/acme-commerce-api
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
              branch: main
            </span>
          </div>
        </div>

        {/* Center: Concise Interactive Playground Hint */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium whitespace-nowrap">
          <span>Interactive Workspace · Click endpoints, edit {'{{VARS}}'}, or open .md notes</span>
        </div>

        {/* Right: Environment Selector + Env Inspector + App Theme Switch */}
        <div className="flex items-center gap-2 shrink-0 relative">
          <label htmlFor="playground-env-select" className="sr-only">
            Active Environment
          </label>
          <select
            id="playground-env-select"
            aria-label="Active Environment"
            value={activeEnvId}
            onChange={(e) => setActiveEnvId(e.target.value)}
            className={`
              px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer
              ${
                appDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-600'
              }
            `}
          >
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                Env: {env.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowEnvPopover((prev) => !prev)}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0
              ${
                showEnvPopover
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : appDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Variables ({Object.keys(activeEnv.variables).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAppDark((d) => !d)}
            aria-label={appDark ? 'Switch playground to light theme' : 'Switch playground to dark theme'}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0
              ${
                appDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            {appDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light UI</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark UI</span>
              </>
            )}
          </button>

          {/* Environment Variables Popover Editor */}
          {showEnvPopover && (
            <div
              className={`
                absolute right-0 top-9 z-30 w-80 sm:w-96 p-4 rounded-xl border shadow-xl
                ${
                  appDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs">
                  Environment Variables · {activeEnv.name}
                </span>
                <button
                  type="button"
                  onClick={() => setShowEnvPopover(false)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Done
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Edit values below to see live <code className="font-mono">{'{{VAR}}'}</code> interpolation in the request URL and headers.
              </p>
              <div className="space-y-2">
                {Object.entries(activeEnv.variables).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2 items-center">
                    <label
                      htmlFor={`env-var-${key}`}
                      className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 truncate"
                    >
                      {`{{${key}}}`}
                    </label>
                    <input
                      id={`env-var-${key}`}
                      type="text"
                      value={value}
                      onChange={(e) => handleUpdateEnvVar(key, e.target.value)}
                      className={`
                        col-span-2 px-2 py-1 rounded border font-mono text-[11px]
                        ${
                          appDark
                            ? 'bg-slate-950 border-slate-700 text-slate-200'
                            : 'bg-slate-50 border-slate-300 text-slate-800'
                        }
                      `}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main 12-Column App Grid: Sidebar (3 cols) + Active Request/Doc Workspace (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* Project Repository Sidebar */}
        <aside
          aria-label="Repository Project Explorer"
          className={`
            lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r p-3 flex flex-col justify-between
            ${
              appDark
                ? 'bg-slate-950/60 border-slate-800'
                : 'bg-slate-50/70 border-slate-200'
            }
          `}
        >
          <div>
            {/* Search & Filter Controls */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                aria-label="Filter repository collections and markdown notes"
                placeholder="Filter repo files & requests..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className={`
                  w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-xs outline-none transition-colors
                  ${
                    appDark
                      ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-600'
                  }
                `}
              />
            </div>

            {/* Segmented Filter Control */}
            <div
              className={`
                grid grid-cols-3 gap-1 p-1 rounded-lg mb-3 text-[11px] font-medium
                ${appDark ? 'bg-slate-900' : 'bg-slate-200/70'}
              `}
            >
              {(['all', 'collections', 'markdown'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSidebarFilter(tab)}
                  className={`
                    py-1 px-2 rounded-md transition-colors capitalize whitespace-nowrap shrink-0
                    ${
                      sidebarFilter === tab
                        ? appDark
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-indigo-700 shadow-xs'
                        : appDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  {tab === 'all' ? 'All Files' : tab === 'collections' ? 'Collections' : 'Notes (.md)'}
                </button>
              ))}
            </div>

            {/* Collections Folder Section */}
            {sidebarFilter !== 'markdown' && (
              <div className="mb-4">
                <div className="flex items-center justify-between px-1.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    collections/ ({filteredRepo.collections.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewRequestForm((v) => !v)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Request</span>
                  </button>
                </div>

                {/* Inline New Request Creator */}
                {showNewRequestForm && (
                  <form
                    onSubmit={handleCreateNewRequest}
                    className={`
                      mb-2.5 p-2.5 rounded-lg border text-xs space-y-2
                      ${
                        appDark
                          ? 'bg-slate-900 border-slate-800'
                          : 'bg-white border-slate-200'
                      }
                    `}
                  >
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label="New request HTTP method"
                        value={newReqMethod}
                        onChange={(e) => setNewReqMethod(e.target.value as HttpMethod)}
                        className={`
                          px-1.5 py-1 rounded border font-mono text-[11px]
                          ${
                            appDark
                              ? 'bg-slate-950 border-slate-700 text-slate-200'
                              : 'bg-slate-50 border-slate-300 text-slate-800'
                          }
                        `}
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                      <input
                        type="text"
                        aria-label="New request endpoint path"
                        placeholder="/v1/customers"
                        value={newReqName}
                        onChange={(e) => setNewReqName(e.target.value)}
                        className={`
                          flex-1 min-w-0 px-2 py-1 rounded border font-mono text-[11px]
                          ${
                            appDark
                              ? 'bg-slate-950 border-slate-700 text-slate-200'
                              : 'bg-slate-50 border-slate-300 text-slate-800'
                          }
                        `}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <select
                        aria-label="Target collection file"
                        value={newReqCollectionId}
                        onChange={(e) => setNewReqCollectionId(e.target.value)}
                        className={`
                          flex-1 min-w-0 px-1.5 py-1 rounded border font-mono text-[10px] truncate
                          ${
                            appDark
                              ? 'bg-slate-950 border-slate-700 text-slate-300'
                              : 'bg-slate-50 border-slate-300 text-slate-700'
                          }
                        `}
                      >
                        {collections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.filename}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="px-2.5 py-1 rounded bg-indigo-600 text-white text-[11px] font-medium hover:bg-indigo-700 whitespace-nowrap shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-1.5">
                  {filteredRepo.collections.map((col) => {
                    const isOpen = expandedCollections[col.id] ?? true;
                    return (
                      <div key={col.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCollections((prev) => ({
                              ...prev,
                              [col.id]: !isOpen,
                            }))
                          }
                          className={`
                            w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-colors
                            ${
                              appDark
                                ? 'hover:bg-slate-900 text-slate-200'
                                : 'hover:bg-slate-200/60 text-slate-800'
                            }
                          `}
                        >
                          <span className="flex items-center gap-1.5 min-w-0">
                            {isOpen ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <FileJson className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="font-mono text-[11px] truncate">
                              {col.filename}
                            </span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 ml-1 shrink-0">
                            {col.requests.length}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="mt-0.5 ml-3 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5">
                            {col.requests.map((req) => {
                              const isSelected =
                                activeItemType === 'request' && activeRequest.id === req.id;
                              return (
                                <button
                                  key={req.id}
                                  type="button"
                                  onClick={() => handleSelectRequest(req.id)}
                                  className={`
                                    w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs transition-colors
                                    ${
                                      isSelected
                                        ? appDark
                                          ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                                          : 'bg-indigo-50 text-indigo-900 font-medium'
                                        : appDark
                                          ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                  `}
                                >
                                  <span
                                    className={`font-mono text-[10px] font-bold w-11 shrink-0 ${methodColor(
                                      req.method
                                    )}`}
                                  >
                                    {req.method}
                                  </span>
                                  <span className="font-mono text-[11px] truncate">
                                    {req.name.replace(/^[A-Z]+\s+/, '')}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Obsidian-Style Markdown Notes Section */}
            {sidebarFilter !== 'collections' && (
              <div>
                <div className="flex items-center justify-between px-1.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    docs/ · Obsidian-style .md ({filteredRepo.markdownDocs.length})
                  </span>
                </div>
                <div className="space-y-0.5">
                  {filteredRepo.markdownDocs.map((doc) => {
                    const isSelected =
                      activeItemType === 'markdown' && activeMarkdown.id === doc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleSelectMarkdown(doc.id)}
                        className={`
                          w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left text-xs transition-colors
                          ${
                            isSelected
                              ? appDark
                                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                                : 'bg-indigo-50 text-indigo-900 font-medium'
                              : appDark
                                ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="font-mono text-[11px] truncate">
                            {doc.filename}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {doc.linkedRequestIds.length} links
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Repo Sync Footer Notice */}
          <div
            className={`
              mt-4 pt-2.5 border-t text-[11px] flex items-center justify-between
              ${appDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}
            `}
          >
            <span>Direct disk sync · Git ready</span>
            <span className="font-mono">0 cloud lock-in</span>
          </div>
        </aside>

        {/* Main Workspace Canvas (9 Columns) */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
          {activeItemType === 'request' ? (
            /* ================= API REQUEST BUILDER & RUNNER ================= */
            <div className="flex-1 flex flex-col justify-between p-4 space-y-4">
              {/* Top Breadcrumb + Request Description */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>
                    {
                      collections.find((c) => c.id === activeRequest.collectionId)
                        ?.filename
                    }
                  </span>
                  <span aria-hidden="true">/</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeRequest.name}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeRequest.description}
                </span>
              </div>

              {/* URL Bar + Send CTA */}
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div
                    className={`
                      flex-1 flex items-center rounded-lg border px-3 py-2 gap-2.5
                      ${
                        appDark
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-300'
                      }
                    `}
                  >
                    <span
                      className={`font-mono text-xs font-bold shrink-0 ${methodColor(
                        activeRequest.method
                      )}`}
                    >
                      {activeRequest.method}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-4 w-px bg-slate-300 dark:bg-slate-700"
                    />
                    <label htmlFor="playground-url-input" className="sr-only">
                      Request URL
                    </label>
                    <input
                      id="playground-url-input"
                      type="text"
                      value={currentUrlValue}
                      onChange={(e) =>
                        setCustomUrlMap((prev) => ({
                          ...prev,
                          [activeRequest.id]: e.target.value,
                        }))
                      }
                      className="flex-1 min-w-0 bg-transparent font-mono text-xs outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={isSending}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isSending ? 'Sending...' : 'Send Request'}</span>
                  </button>
                </div>

                {/* Live Environment Variable Resolution Preview Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
                    <span>Resolved URL:</span>
                    <span
                      data-testid="resolved-url-preview"
                      className="text-indigo-600 dark:text-indigo-400 font-medium truncate"
                    >
                      {executionResult.resolvedUrl}
                    </span>
                  </div>
                  {executionResult.unresolvedVars.length > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Unresolved: {executionResult.unresolvedVars.join(', ')}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      All {'{{env}}'} variables resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Split Request & Response Inspector */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
                {/* Left Column: Request Payload / Headers / Assertions */}
                <div
                  className={`
                    rounded-lg border p-3 flex flex-col
                    ${
                      appDark
                        ? 'bg-slate-950/60 border-slate-800'
                        : 'bg-slate-50/60 border-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2.5">
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: 'body', label: 'Request Body' },
                          {
                            id: 'headers',
                            label: `Headers (${Object.keys(activeRequest.headers).length})`,
                          },
                          {
                            id: 'assertions',
                            label: `Assertions (${executionResult.assertions.filter((a) => a.passed).length}/${executionResult.assertions.length})`,
                          },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setRequestTab(t.id)}
                          className={`
                            px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0
                            ${
                              requestTab === t.id
                                ? appDark
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-indigo-600 text-white'
                                : appDark
                                  ? 'text-slate-400 hover:text-slate-200'
                                  : 'text-slate-600 hover:text-slate-900'
                            }
                          `}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {requestTab === 'body' && (
                    <div className="flex-1 flex flex-col">
                      <label htmlFor="playground-body-editor" className="sr-only">
                        Request JSON Body
                      </label>
                      <textarea
                        id="playground-body-editor"
                        rows={8}
                        value={
                          currentBodyValue ||
                          '// No request body required for this GET request'
                        }
                        onChange={(e) =>
                          setCustomBodyMap((prev) => ({
                            ...prev,
                            [activeRequest.id]: e.target.value,
                          }))
                        }
                        className={`
                          w-full flex-1 font-mono text-xs p-2.5 rounded-md border resize-none outline-none
                          ${
                            appDark
                              ? 'bg-slate-900 border-slate-800 text-slate-200'
                              : 'bg-white border-slate-200 text-slate-800'
                          }
                        `}
                      />
                    </div>
                  )}

                  {requestTab === 'headers' && (
                    <div className="space-y-2 text-xs font-mono">
                      {Object.entries(executionResult.resolvedHeaders).map(
                        ([hKey, hVal]) => (
                          <div
                            key={hKey}
                            className={`
                              p-2 rounded border flex flex-col gap-0.5
                              ${
                                appDark
                                  ? 'bg-slate-900 border-slate-800'
                                  : 'bg-white border-slate-200'
                              }
                            `}
                          >
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              {hKey}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 break-all">
                              {hVal}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {requestTab === 'assertions' && (
                    <div className="space-y-2 text-xs">
                      {executionResult.assertions.map((assertion) => (
                        <div
                          key={assertion.id}
                          className={`
                            flex items-center justify-between p-2.5 rounded-md border
                            ${
                              appDark
                                ? 'bg-slate-900 border-slate-800'
                                : 'bg-white border-slate-200'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            {assertion.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                            <span className="font-medium">{assertion.label}</span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            Actual: {assertion.actual}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Live Response Output */}
                <div
                  className={`
                    rounded-lg border p-3 flex flex-col
                    ${
                      appDark
                        ? 'bg-slate-950/60 border-slate-800'
                        : 'bg-slate-50/60 border-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2.5">
                    <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                      <span
                        data-testid="response-status-badge"
                        className={`font-semibold ${
                          executionResult.status >= 200 && executionResult.status < 300
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        Status: {executionResult.statusText}
                      </span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {executionResult.latencyMs}ms
                      </span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Run #{runCounter}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyResponse}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {copiedResponse ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre
                    data-testid="response-json-output"
                    className={`
                      flex-1 font-mono text-xs p-2.5 rounded-md border overflow-x-auto leading-relaxed
                      ${
                        appDark
                          ? 'bg-slate-900 border-slate-800 text-indigo-200'
                          : 'bg-white border-slate-200 text-slate-800'
                      }
                    `}
                  >
                    {JSON.stringify(executionResult.responseBody, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* ================= OBSIDIAN-STYLE MARKDOWN (.MD) WORKSPACE ================= */
            <div
              data-testid="markdown-doc-workspace"
              className="flex-1 flex flex-col justify-between p-4 space-y-4"
            >
              {/* Markdown Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-4 h-4" />
                    <span>{activeMarkdown.folderPath}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {activeMarkdown.updatedAt}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mt-0.5">
                    {activeMarkdown.title}
                  </h3>
                </div>

                {/* Obsidian-style Editor Mode Switcher */}
                <div
                  className={`
                    flex items-center gap-1 p-1 rounded-lg text-xs font-medium
                    ${appDark ? 'bg-slate-950' : 'bg-slate-100'}
                  `}
                >
                  {(
                    [
                      { id: 'split', label: 'Split View' },
                      { id: 'preview', label: 'Reading View' },
                      { id: 'raw', label: 'Markdown Source' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setMdViewMode(mode.id)}
                      className={`
                        px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0
                        ${
                          mdViewMode === mode.id
                            ? 'bg-indigo-600 text-white'
                            : appDark
                              ? 'text-slate-400 hover:text-slate-200'
                              : 'text-slate-600 hover:text-slate-900'
                        }
                      `}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Markdown Content Split / Preview / Raw */}
              <div
                className={`grid gap-4 flex-1 ${
                  mdViewMode === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {(mdViewMode === 'split' || mdViewMode === 'raw') && (
                  <div className="flex flex-col">
                    <label
                      htmlFor="markdown-raw-editor"
                      className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5"
                    >
                      MARKDOWN SOURCE ({activeMarkdown.filename}) — Supports [[Request]] Wiki-Links
                    </label>
                    <textarea
                      id="markdown-raw-editor"
                      rows={12}
                      value={activeMarkdown.content}
                      onChange={(e) => {
                        const updated = e.target.value;
                        setMarkdownDocs((prev) =>
                          prev.map((d) =>
                            d.id === activeMarkdown.id ? { ...d, content: updated } : d
                          )
                        );
                      }}
                      className={`
                        flex-1 w-full p-3 rounded-lg border font-mono text-xs leading-relaxed resize-none outline-none
                        ${
                          appDark
                            ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500'
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
                        }
                      `}
                    />
                  </div>
                )}

                {(mdViewMode === 'split' || mdViewMode === 'preview') && (
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                      INTERACTIVE OBSIDIAN-STYLE NOTE PREVIEW (Click any [[Endpoint]] to open request)
                    </span>
                    <div
                      className={`
                        flex-1 p-4 rounded-lg border space-y-2.5 text-xs leading-relaxed
                        ${
                          appDark
                            ? 'bg-slate-950/50 border-slate-800 text-slate-200'
                            : 'bg-white border-slate-200 text-slate-700'
                        }
                      `}
                    >
                      {activeMarkdown.content.split('\n').map((line, idx) => {
                        if (line.startsWith('# ')) {
                          return (
                            <h4
                              key={idx}
                              className="text-base font-bold text-slate-900 dark:text-white pt-1"
                            >
                              {line.replace('# ', '')}
                            </h4>
                          );
                        }
                        if (line.startsWith('## ')) {
                          return (
                            <h5
                              key={idx}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-2"
                            >
                              {line.replace('## ', '')}
                            </h5>
                          );
                        }
                        if (!line.trim()) {
                          return <div key={idx} className="h-1" />;
                        }

                        const segments = parseMarkdownWikiLinks(line);
                        return (
                          <p key={idx} className="leading-relaxed">
                            {segments.map((seg, sIdx) =>
                              seg.type === 'wikilink' ? (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => handleWikiLinkClick(seg.target)}
                                  className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                                >
                                  <Link2 className="w-3 h-3" />
                                  <span>{seg.label}</span>
                                </button>
                              ) : (
                                <span key={sIdx}>{seg.content}</span>
                              )
                            )}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Linked API Endpoints Backlinks Footer */}
              <div
                className={`
                  p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs
                  ${
                    appDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }
                `}
              >
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Linked API Requests in this Note:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {activeMarkdown.linkedRequestIds.map((reqId) => {
                    const req = allRequests.find((r) => r.id === reqId);
                    if (!req) return null;
                    return (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => handleSelectRequest(req.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/60 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] hover:border-indigo-500 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Jump to {req.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
