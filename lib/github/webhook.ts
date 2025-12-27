import crypto from 'crypto'

export interface WebhookPayload {
  ref: string
  commits: Array<{
    id: string
    message: string
    timestamp: string
    url: string
    author: {
      name: string
      email: string
    }
    added: string[]
    removed: string[]
    modified: string[]
  }>
  repository: {
    id: number
    name: string
    full_name: string
    owner: {
      name: string
      login: string
    }
  }
}

/**
 * Verify GitHub webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false
  }

  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}

/**
 * Parse webhook payload
 */
export function parseWebhookPayload(body: any): WebhookPayload {
  return body as WebhookPayload
}

/**
 * Extract commit information from webhook payload
 */
export function extractCommitsFromWebhook(payload: WebhookPayload): Array<{
  sha: string
  message: string
  timestamp: string
  url: string
  author: {
    name: string
    email: string
  }
  files: {
    added: string[]
    removed: string[]
    modified: string[]
  }
}> {
  return payload.commits.map(commit => ({
    sha: commit.id,
    message: commit.message,
    timestamp: commit.timestamp,
    url: commit.url,
    author: commit.author,
    files: {
      added: commit.added,
      removed: commit.removed,
      modified: commit.modified,
    },
  }))
}


