export function sendJson(res, status, payload, headers = {}) {
  Object.entries({
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  }).forEach(([key, value]) => res.setHeader(key, value));
  res.status(status).send(JSON.stringify(payload));
}

export function methodNotAllowed(res, allowed = []) {
  res.setHeader('Allow', allowed.join(', '));
  return sendJson(res, 405, { error: 'Method not allowed' });
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON body');
  }
}

export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error(error);
      return sendJson(res, 500, {
        error: error?.message || 'Unexpected server error',
      });
    }
  };
}
