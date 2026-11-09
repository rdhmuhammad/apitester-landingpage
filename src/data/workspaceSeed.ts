import type {
  EnvEnvironment,
  CollectionFile,
  MarkdownDocFile,
} from '../utils/apitesterLogic';

export const INITIAL_ENVIRONMENTS: EnvEnvironment[] = [
  {
    id: 'local',
    name: 'Local (localhost:8080)',
    variables: {
      BASE_URL: 'http://localhost:8080',
      AUTH_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.local_dev_99a',
      API_KEY: 'apt_local_dev_88410',
      ORG_ID: 'org_local_01',
    },
  },
  {
    id: 'staging',
    name: 'Staging (staging.api.acme.io)',
    variables: {
      BASE_URL: 'https://staging.api.acme.io',
      AUTH_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.stg_token_42x',
      API_KEY: 'apt_stg_live_31904',
      ORG_ID: 'org_stg_88',
    },
  },
  {
    id: 'production',
    name: 'Production (api.acme.io)',
    variables: {
      BASE_URL: 'https://api.acme.io',
      AUTH_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.prd_live_77z',
      API_KEY: 'apt_prd_strict_90012',
      ORG_ID: 'org_prd_main',
    },
  },
];

export const INITIAL_COLLECTIONS: CollectionFile[] = [
  {
    id: 'col-auth',
    filename: 'auth.collection.json',
    folderPath: 'collections/auth.collection.json',
    description: 'OAuth2 & JWT session endpoints stored in repo',
    requests: [
      {
        id: 'req-auth-token',
        collectionId: 'col-auth',
        name: 'POST /v1/auth/token',
        method: 'POST',
        url: '{{BASE_URL}}/v1/auth/token',
        description: 'Exchange service credentials for a short-lived Bearer JWT.',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Key': '{{API_KEY}}',
        },
        body: JSON.stringify(
          {
            grant_type: 'client_credentials',
            organization_id: '{{ORG_ID}}',
            scope: 'orders:read orders:write webhooks:manage',
          },
          null,
          2
        ),
        expectedStatus: 200,
        mockLatencyMs: 34,
        mockResponse: {
          ok: true,
          token_type: 'Bearer',
          expires_in: 3600,
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.issued_9821',
          scope: 'orders:read orders:write webhooks:manage',
        },
        assertions: [
          { id: 'a1', label: 'HTTP Status == 200', field: 'status', expected: 200, passed: true },
          { id: 'a2', label: 'Response time < 150ms', field: 'latency', expected: 150, passed: true },
          { id: 'a3', label: 'Payload includes access_token', field: 'json_key', expected: 'access_token', passed: true },
        ],
      },
      {
        id: 'req-auth-session',
        collectionId: 'col-auth',
        name: 'GET /v1/auth/session',
        method: 'GET',
        url: '{{BASE_URL}}/v1/auth/session?org={{ORG_ID}}',
        description: 'Inspect current active token claims and rate-limit quota.',
        headers: {
          Authorization: 'Bearer {{AUTH_TOKEN}}',
          Accept: 'application/json',
        },
        body: '',
        expectedStatus: 200,
        mockLatencyMs: 22,
        mockResponse: {
          ok: true,
          authenticated: true,
          principal: 'svc-checkout@acme.io',
          rate_limit_remaining: 4982,
          permissions: ['orders:read', 'orders:write', 'webhooks:manage'],
        },
        assertions: [
          { id: 'a4', label: 'HTTP Status == 200', field: 'status', expected: 200, passed: true },
          { id: 'a5', label: 'Response time < 100ms', field: 'latency', expected: 100, passed: true },
          { id: 'a6', label: 'Payload includes principal', field: 'json_key', expected: 'principal', passed: true },
        ],
      },
    ],
  },
  {
    id: 'col-orders',
    filename: 'orders.collection.json',
    folderPath: 'collections/orders.collection.json',
    description: 'Order lifecycle and checkout orchestration endpoints',
    requests: [
      {
        id: 'req-orders-list',
        collectionId: 'col-orders',
        name: 'GET /v1/orders',
        method: 'GET',
        url: '{{BASE_URL}}/v1/orders?limit=10&org={{ORG_ID}}',
        description: 'List paginated customer orders for the active organization.',
        headers: {
          Authorization: 'Bearer {{AUTH_TOKEN}}',
          'X-Api-Key': '{{API_KEY}}',
        },
        body: '',
        expectedStatus: 200,
        mockLatencyMs: 48,
        mockResponse: {
          ok: true,
          data: [
            { id: 'ord_9041', status: 'fulfilled', total_cents: 12900, currency: 'USD' },
            { id: 'ord_9042', status: 'processing', total_cents: 4500, currency: 'USD' },
          ],
          has_more: false,
        },
        assertions: [
          { id: 'a7', label: 'HTTP Status == 200', field: 'status', expected: 200, passed: true },
          { id: 'a8', label: 'Response time < 200ms', field: 'latency', expected: 200, passed: true },
          { id: 'a9', label: 'Payload includes data list', field: 'json_key', expected: 'data', passed: true },
        ],
      },
      {
        id: 'req-orders-checkout',
        collectionId: 'col-orders',
        name: 'POST /v1/orders/checkout',
        method: 'POST',
        url: '{{BASE_URL}}/v1/orders/checkout',
        description: 'Create and capture an atomic checkout session with idempotency key.',
        headers: {
          Authorization: 'Bearer {{AUTH_TOKEN}}',
          'Content-Type': 'application/json',
          'Idempotency-Key': 'idem_2026_checkout_01',
        },
        body: JSON.stringify(
          {
            organization_id: '{{ORG_ID}}',
            currency: 'USD',
            items: [
              { sku: 'PRO-LICENSE-ANNUAL', quantity: 2, unit_amount_cents: 4900 },
            ],
            capture_immediately: true,
          },
          null,
          2
        ),
        expectedStatus: 201,
        mockLatencyMs: 64,
        mockResponse: {
          ok: true,
          order_id: 'ord_9049_new',
          status: 'captured',
          amount_charged_cents: 9800,
          receipt_url: 'https://receipts.acme.io/ord_9049_new',
        },
        assertions: [
          { id: 'a10', label: 'HTTP Status == 201', field: 'status', expected: 201, passed: true },
          { id: 'a11', label: 'Response time < 250ms', field: 'latency', expected: 250, passed: true },
          { id: 'a12', label: 'Payload includes order_id', field: 'json_key', expected: 'order_id', passed: true },
        ],
      },
    ],
  },
  {
    id: 'col-webhooks',
    filename: 'webhooks.collection.json',
    folderPath: 'collections/webhooks.collection.json',
    description: 'Signed event delivery & retry verification',
    requests: [
      {
        id: 'req-webhooks-dispatch',
        collectionId: 'col-webhooks',
        name: 'POST /v1/webhooks/dispatch',
        method: 'POST',
        url: '{{BASE_URL}}/v1/webhooks/dispatch',
        description: 'Trigger a signed test webhook event to verify local listener.',
        headers: {
          Authorization: 'Bearer {{AUTH_TOKEN}}',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            event_type: 'order.checkout.completed',
            target_url: '{{BASE_URL}}/internal/hooks/receiver',
            sign_payload: true,
          },
          null,
          2
        ),
        expectedStatus: 200,
        mockLatencyMs: 51,
        mockResponse: {
          ok: true,
          delivery_id: 'dlv_77310',
          signature_header: 't=1794034680,v1=8f92a3c41e...',
          delivered: true,
        },
        assertions: [
          { id: 'a13', label: 'HTTP Status == 200', field: 'status', expected: 200, passed: true },
          { id: 'a14', label: 'Response time < 200ms', field: 'latency', expected: 200, passed: true },
          { id: 'a15', label: 'Payload includes delivery_id', field: 'json_key', expected: 'delivery_id', passed: true },
        ],
      },
    ],
  },
];

export const INITIAL_MARKDOWN_DOCS: MarkdownDocFile[] = [
  {
    id: 'doc-architecture',
    filename: 'architecture.md',
    folderPath: 'docs/architecture.md',
    title: 'API Architecture & Repo-Native Collections',
    updatedAt: 'Edited 4m ago',
    linkedRequestIds: ['req-auth-token', 'req-orders-checkout'],
    content: `# Acme Commerce API Architecture

APITester stores every collection file (\`*.collection.json\`) and engineering note (\`*.md\`) directly inside our Git repository folder. No cloud sync conflicts or proprietary accounts required.

## Core Request Flow
1. Obtain a scoped JWT token using [[POST /v1/auth/token]] with your active environment's \`{{API_KEY}}\`.
2. Verify active claims and rate-limit headers via [[GET /v1/auth/session]].
3. Execute atomic order capture through [[POST /v1/orders/checkout]].

## Environment Variables Matrix
- \`{{BASE_URL}}\`: Switches seamlessly between \`localhost:8080\`, Staging, and Production.
- \`{{AUTH_TOKEN}}\`: Injected automatically into \`Authorization: Bearer\` headers.
- \`{{ORG_ID}}\`: Scopes multi-tenant queries in [[GET /v1/orders]].`,
  },
  {
    id: 'doc-runbook',
    filename: 'auth-runbook.md',
    folderPath: 'docs/auth-runbook.md',
    title: 'Authentication & Webhook Debugging Runbook',
    updatedAt: 'Edited 18m ago',
    linkedRequestIds: ['req-auth-session', 'req-webhooks-dispatch'],
    content: `# Authentication & Webhook Runbook

Use this note alongside your local collections when diagnosing 401 responses or webhook signature mismatches.

## Step-by-Step Verification
- Run [[GET /v1/auth/session]] first to confirm \`{{AUTH_TOKEN}}\` has not expired.
- If rotating keys, test issuance with [[POST /v1/auth/token]] on Staging before updating Production secrets.
- Trigger synthetic events via [[POST /v1/webhooks/dispatch]] and inspect the \`signature_header\` field in the JSON response.`,
  },
  {
    id: 'doc-release-plan',
    filename: 'release-test-plan.md',
    folderPath: 'docs/release-test-plan.md',
    title: 'v2.4 Checkout Release Test Scenario',
    updatedAt: 'Edited 1h ago',
    linkedRequestIds: ['req-orders-list', 'req-orders-checkout', 'req-webhooks-dispatch'],
    content: `# Release v2.4 Regression Checklist

Before merging pull requests touching \`collections/orders.collection.json\`, run the full chained scenario:

1. Verify baseline order pagination in [[GET /v1/orders]].
2. Submit idempotent cart payload on [[POST /v1/orders/checkout]] and assert \`201 Created\`.
3. Confirm downstream listener delivery using [[POST /v1/webhooks/dispatch]].`,
  },
];
