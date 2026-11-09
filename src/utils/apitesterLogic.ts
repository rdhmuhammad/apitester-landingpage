export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface EnvEnvironment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface ApiAssertion {
  id: string;
  label: string;
  field: 'status' | 'latency' | 'json_key';
  expected: string | number;
  actual?: string | number;
  passed: boolean;
}

export interface ApiRequestItem {
  id: string;
  collectionId: string;
  name: string;
  method: HttpMethod;
  url: string;
  description: string;
  headers: Record<string, string>;
  body: string;
  expectedStatus: number;
  mockLatencyMs: number;
  mockResponse: Record<string, unknown>;
  assertions: ApiAssertion[];
}

export interface CollectionFile {
  id: string;
  filename: string;
  folderPath: string;
  description: string;
  requests: ApiRequestItem[];
}

export interface MarkdownDocFile {
  id: string;
  filename: string;
  folderPath: string;
  title: string;
  updatedAt: string;
  content: string;
  linkedRequestIds: string[];
}

export interface InterpolationResult {
  resolved: string;
  unresolvedVars: string[];
  usedVars: string[];
}

/**
 * Resolves {{VAR_NAME}} placeholders using the active environment variables.
 */
export function interpolateEnvVars(
  template: string,
  variables: Record<string, string>
): InterpolationResult {
  const unresolvedVars: string[] = [];
  const usedVars: string[] = [];

  const resolved = template.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (match, varName: string) => {
    if (Object.prototype.hasOwnProperty.call(variables, varName) && variables[varName] !== '') {
      if (!usedVars.includes(varName)) {
        usedVars.push(varName);
      }
      return variables[varName];
    }
    if (!unresolvedVars.includes(varName)) {
      unresolvedVars.push(varName);
    }
    return match;
  });

  return { resolved, unresolvedVars, usedVars };
}

export type WikiSegment =
  | { type: 'text'; content: string }
  | { type: 'wikilink'; target: string; label: string };

/**
 * Parses Obsidian-style [[Target]] or [[Target|Label]] wiki-links inside markdown notes.
 */
export function parseMarkdownWikiLinks(line: string): WikiSegment[] {
  const segments: WikiSegment[] = [];
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: line.slice(lastIndex, match.index),
      });
    }
    const target = match[1].trim();
    const label = (match[2] || match[1]).trim();
    segments.push({
      type: 'wikilink',
      target,
      label,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    segments.push({
      type: 'text',
      content: line.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: line }];
}

export interface FilteredRepoResult {
  collections: CollectionFile[];
  markdownDocs: MarkdownDocFile[];
  totalMatches: number;
}

/**
 * Filters repository collections (and their requests) and markdown notes by search query and category filter.
 */
export function filterRepoWorkspace(
  collections: CollectionFile[],
  markdownDocs: MarkdownDocFile[],
  searchQuery: string,
  filterType: 'all' | 'collections' | 'markdown' = 'all'
): FilteredRepoResult {
  const q = searchQuery.trim().toLowerCase();

  const filteredCollections: CollectionFile[] =
    filterType === 'markdown'
      ? []
      : collections
          .map((col) => {
            if (!q) return col;
            const filenameMatch = col.filename.toLowerCase().includes(q);
            const matchingRequests = col.requests.filter(
              (req) =>
                req.name.toLowerCase().includes(q) ||
                req.url.toLowerCase().includes(q) ||
                req.method.toLowerCase().includes(q)
            );
            if (filenameMatch) return col;
            return { ...col, requests: matchingRequests };
          })
          .filter((col) => col.requests.length > 0 || col.filename.toLowerCase().includes(q));

  const filteredDocs: MarkdownDocFile[] =
    filterType === 'collections'
      ? []
      : markdownDocs.filter((doc) => {
          if (!q) return true;
          return (
            doc.filename.toLowerCase().includes(q) ||
            doc.title.toLowerCase().includes(q) ||
            doc.content.toLowerCase().includes(q)
          );
        });

  const requestCount = filteredCollections.reduce((acc, c) => acc + c.requests.length, 0);
  return {
    collections: filteredCollections,
    markdownDocs: filteredDocs,
    totalMatches: requestCount + filteredDocs.length,
  };
}

export interface ExecutedRequestOutput {
  resolvedUrl: string;
  resolvedHeaders: Record<string, string>;
  resolvedBody: string;
  unresolvedVars: string[];
  status: number;
  statusText: string;
  latencyMs: number;
  responseBody: Record<string, unknown>;
  assertions: ApiAssertion[];
  allPassed: boolean;
}

/**
 * Evaluates an API request with active environment variables and runs assertions.
 */
export function executeSimulatedRequest(
  request: ApiRequestItem,
  env: EnvEnvironment,
  customUrl?: string,
  customBody?: string
): ExecutedRequestOutput {
  const urlInterp = interpolateEnvVars(customUrl ?? request.url, env.variables);
  const bodyInterp = interpolateEnvVars(customBody ?? request.body, env.variables);

  const resolvedHeaders: Record<string, string> = {};
  const unresolvedSet = new Set<string>([
    ...urlInterp.unresolvedVars,
    ...bodyInterp.unresolvedVars,
  ]);

  for (const [k, v] of Object.entries(request.headers)) {
    const hInterp = interpolateEnvVars(v, env.variables);
    resolvedHeaders[k] = hInterp.resolved;
    hInterp.unresolvedVars.forEach((u) => unresolvedSet.add(u));
  }

  const hasMissingAuth = unresolvedSet.has('AUTH_TOKEN') || unresolvedSet.has('API_KEY');
  const status = hasMissingAuth ? 401 : request.expectedStatus;
  const statusText =
    status === 200
      ? '200 OK'
      : status === 201
        ? '201 Created'
        : status === 204
          ? '204 No Content'
          : status === 401
            ? '401 Unauthorized'
            : `${status} OK`;

  const responseBody: Record<string, unknown> = hasMissingAuth
    ? {
        ok: false,
        error: 'missing_environment_secret',
        message: 'Unresolved environment variable in Authorization header.',
        environment: env.name,
      }
    : {
        ...request.mockResponse,
        _meta: {
          environment: env.name,
          resolvedEndpoint: urlInterp.resolved,
          timestamp: '2026-11-06T22:58:00Z',
        },
      };

  const evaluatedAssertions: ApiAssertion[] = request.assertions.map((assertion) => {
    if (assertion.field === 'status') {
      const passed = status === Number(assertion.expected);
      return { ...assertion, actual: status, passed };
    }
    if (assertion.field === 'latency') {
      const passed = request.mockLatencyMs <= Number(assertion.expected);
      return { ...assertion, actual: `${request.mockLatencyMs}ms`, passed };
    }
    const keyVal = responseBody[String(assertion.expected)];
    const passed = keyVal !== undefined && !hasMissingAuth;
    return {
      ...assertion,
      actual: passed ? 'present' : 'missing',
      passed,
    };
  });

  return {
    resolvedUrl: urlInterp.resolved,
    resolvedHeaders,
    resolvedBody: bodyInterp.resolved,
    unresolvedVars: Array.from(unresolvedSet),
    status,
    statusText,
    latencyMs: request.mockLatencyMs,
    responseBody,
    assertions: evaluatedAssertions,
    allPassed: evaluatedAssertions.every((a) => a.passed),
  };
}

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates waitlist email address for the macOS build notification signup.
 */
export function validateWaitlistEmail(email: string): EmailValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter an email address to get notified.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address (e.g. dev@team.io).' };
  }
  return { valid: true };
}
