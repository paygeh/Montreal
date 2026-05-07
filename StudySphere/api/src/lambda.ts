import serverless from 'serverless-http'
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'

let initialized = false

async function loadSecrets(): Promise<void> {
  if (process.env.IS_OFFLINE) {
    require('dotenv').config()
    return
  }

  const secretId = process.env.SECRETS_ID
  if (!secretId) {
    console.warn('[lambda] SECRETS_ID not set — skipping Secrets Manager load')
    return
  }

  try {
    const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' })
    const response = await client.send(new GetSecretValueCommand({ SecretId: secretId }))
    const raw = response.SecretString
    if (!raw) return

    const secrets = JSON.parse(raw) as Record<string, string>
    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = value
    }

    console.log('[lambda] Secrets loaded from Secrets Manager:', Object.keys(secrets).join(', '))
  } catch (err) {
    console.error('[lambda] Failed to load secrets — continuing with existing env vars:', err)
  }
}

async function bootstrap() {
  if (initialized) return
  await loadSecrets()
  initialized = true
}

// Import app after secrets are loaded so lib/supabase.ts picks up the injected vars
async function getHandler() {
  await bootstrap()
  const { default: app } = await import('./index')
  return serverless(app)
}

const handlerPromise = getHandler()

export const handler = async (event: any, context: any) => {
  const h = await handlerPromise
  return h(event, context)
}
