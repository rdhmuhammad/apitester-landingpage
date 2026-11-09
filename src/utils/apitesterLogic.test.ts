import test from 'node:test';
import assert from 'node:assert/strict';
import {
  interpolateEnvVars,
  parseMarkdownWikiLinks,
  filterRepoWorkspace,
  executeSimulatedRequest,
  validateWaitlistEmail,
  type CollectionFile,
  type MarkdownDocFile,
  type EnvEnvironment,
} from './apitesterLogic';

test('interpolateEnvVars resolves known variables and reports unresolved ones', () => {
  const env = {
    BASE_URL: 'https://api.acme.dev',
    API_KEY: 'ak_live_9912',
  };
  const result = interpolateEnvVars('{{BASE_URL}}/v1/orders?key={{API_KEY}}& missing={{SECRET_TOKEN}}', env);
  assert.equal(result.resolved, 'https://api.acme.dev/v1/orders?key=ak_live_9912& missing={{SECRET_TOKEN}}');
  assert.deepEqual(result.usedVars, ['BASE_URL', 'API_KEY']);
  assert.deepEqual(result.unresolvedVars, ['SECRET_TOKEN']);
});

test('parseMarkdownWikiLinks extracts Obsidian-style bidirectional links', () => {
  const line = 'Before running [[POST /v1/orders/checkout]], obtain a token via [[POST /v1/auth/token|Auth Endpoint]].';
  const segments = parseMarkdownWikiLinks(line);
  assert.equal(segments.length, 5);
  assert.deepEqual(segments[1], {
    type: 'wikilink',
    target: 'POST /v1/orders/checkout',
    label: 'POST /v1/orders/checkout',
  });
  assert.deepEqual(segments[3], {
    type: 'wikilink',
    target: 'POST /v1/auth/token',
    label: 'Auth Endpoint',
  });
});

test('filterRepoWorkspace filters collections and markdown notes accurately', () => {
  const collections: CollectionFile[] = [
    {
      id: 'col-1',
      filename: 'auth.collection.json',
      folderPath: 'collections/auth.collection.json',
      description: 'Authentication endpoints',
      requests: [
        {
          id: 'req-1',
          collectionId: 'col-1',
          name: 'POST /v1/auth/token',
          method: 'POST',
          url: '{{BASE_URL}}/v1/auth/token',
          description: 'Issue JWT',
          headers: {},
          body: '{}',
          expectedStatus: 200,
          mockLatencyMs: 42,
          mockResponse: { ok: true },
          assertions: [],
        },
      ],
    },
  ];
  const docs: MarkdownDocFile[] = [
    {
      id: 'doc-1',
      filename: 'architecture.md',
      folderPath: 'docs/architecture.md',
      title: 'System Architecture',
      updatedAt: '2m ago',
      content: 'Overview of the webhook pipeline',
      linkedRequestIds: ['req-1'],
    },
  ];

  const onlyMd = filterRepoWorkspace(collections, docs, '', 'markdown');
  assert.equal(onlyMd.collections.length, 0);
  assert.equal(onlyMd.markdownDocs.length, 1);

  const searchWebhook = filterRepoWorkspace(collections, docs, 'webhook', 'all');
  assert.equal(searchWebhook.collections.length, 0);
  assert.equal(searchWebhook.markdownDocs.length, 1);
});

test('executeSimulatedRequest interpolates URL and evaluates assertions', () => {
  const env: EnvEnvironment = {
    id: 'local',
    name: 'Local (localhost:8080)',
    variables: {
      BASE_URL: 'http://localhost:8080',
      AUTH_TOKEN: 'jwt_dev_token_123',
    },
  };
  const request: CollectionFile['requests'][0] = {
    id: 'req-auth',
    collectionId: 'col-1',
    name: 'GET /v1/orders',
    method: 'GET',
    url: '{{BASE_URL}}/v1/orders',
    description: 'List orders',
    headers: { Authorization: 'Bearer {{AUTH_TOKEN}}' },
    body: '',
    expectedStatus: 200,
    mockLatencyMs: 38,
    mockResponse: { orders: [{ id: 'ord_01' }] },
    assertions: [
      { id: 'a1', label: 'Status is 200', field: 'status', expected: 200, passed: true },
      { id: 'a2', label: 'Latency < 200ms', field: 'latency', expected: 200, passed: true },
      { id: 'a3', label: 'Contains orders array', field: 'json_key', expected: 'orders', passed: true },
    ],
  };

  const output = executeSimulatedRequest(request, env);
  assert.equal(output.resolvedUrl, 'http://localhost:8080/v1/orders');
  assert.equal(output.status, 200);
  assert.equal(output.allPassed, true);
});

test('validateWaitlistEmail rejects empty and invalid emails', () => {
  assert.equal(validateWaitlistEmail('').valid, false);
  assert.equal(validateWaitlistEmail('not-an-email').valid, false);
  assert.equal(validateWaitlistEmail('engineer@company.com').valid, true);
});
