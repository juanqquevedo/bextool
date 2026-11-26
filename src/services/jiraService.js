import { ENV } from '../config/env.js';

function getBaseUrl() {
  if (window.location.hostname !== ENV.JIRA_DOMAIN) {
    throw new Error(`La API de Jira solo puede ejecutarse desde ${ENV.JIRA_DOMAIN}.`);
  }
  return `https://${ENV.JIRA_DOMAIN}/rest/api/3`;
}

function getHeaders() {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Atlassian-Token': 'no-check',
  };
}

function extractFieldValue(field) {
  if (!field) return '';
  if (typeof field === 'string' || typeof field === 'number') return String(field).trim();
  if (Array.isArray(field)) {
    return field
      .map((item) => extractFieldValue(item))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof field === 'object') {
    const base = field.value || field.name || field.label || '';
    const child = field.child ? extractFieldValue(field.child) : '';
    return child ? `${base} - ${child}` : String(base).trim();
  }
  return '';
}

function extractAccountId(userField) {
  if (!userField) return null;
  if (Array.isArray(userField) && userField.length > 0) {
    return userField[0]?.accountId || null;
  }
  return userField.accountId || null;
}

function extractTeamField(teamField) {
  if (!teamField) return null;
  if (typeof teamField === 'string') {
    return { id: teamField, name: teamField };
  }
  if (typeof teamField === 'object') {
    return {
      id: teamField.id || undefined,
      name: (teamField.name || teamField.title || teamField.value || '').trim(),
    };
  }
  return null;
}

export async function getParentIssueDetails(issueKey) {
  const key = issueKey.trim().toUpperCase();
  const response = await fetch(`${getBaseUrl()}/issue/${key}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error al leer ${key} (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const fields = data.fields;

  const brandValue = extractFieldValue(fields.customfield_11770);
  if (!brandValue) {
    console.warn('[BEX Tool] customfield_11770 vacío o con estructura inesperada:', fields.customfield_11770);
  }

  const teamInfo = extractTeamField(fields.customfield_10001);

  return {
    key: data.key,
    projectKey: fields.project?.key,
    summary: fields.summary || '',
    brand: brandValue,
    teamId: teamInfo?.id,
    teamName: teamInfo?.name || '',
    assigneeAccountId: extractAccountId(fields.customfield_11777),
    components: (fields.components || []).map((c) => ({ name: c.name })),
    priority: fields.priority ? { name: fields.priority.name } : undefined,
  };
}

export async function createLinkedBug({
  parentDetails,
  bugSummary,
  descriptionText,
  linkType = ENV.JIRA_DEFAULT_LINK_TYPE,
  customFields = {},
  labels = [],
  dueDate = undefined,
  assigneeAccountId = undefined,
}) {
  const adfDescription = {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: descriptionText }],
      },
    ],
  };

  const payload = {
    fields: {
      project: { key: parentDetails.projectKey },
      issuetype: { name: 'Bug' },
      summary: bugSummary,
      description: adfDescription,
      components: parentDetails.components,
      ...(parentDetails.priority && { priority: parentDetails.priority }),
      ...(labels.length > 0 && { labels }),
      ...(dueDate && { duedate: dueDate }),
      ...(assigneeAccountId && { assignee: { accountId: assigneeAccountId } }),
      ...customFields,
    },
  };

  const createRes = await fetch(`${getBaseUrl()}/issue`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(`No se pudo crear el Bug (${createRes.status}): ${JSON.stringify(errData)}`);
  }

  const createdBug = await createRes.json();

  const linkRes = await fetch(`${getBaseUrl()}/issueLink`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      type: { name: linkType },
      inwardIssue: { key: createdBug.key },
      outwardIssue: { key: parentDetails.key },
    }),
  });

  if (!linkRes.ok) {
    const errText = await linkRes.text();
    throw new Error(`Bug creado (${createdBug.key}), pero falló el vínculo: ${errText}`);
  }

  return createdBug;
}