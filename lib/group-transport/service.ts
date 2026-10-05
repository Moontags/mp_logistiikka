import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Registration } from './validation';
import { hashValue } from './security';
import { getGroupTransportDatabase } from './database';
import { sendGroupTransportEmail } from '../email';

export class RegistrationError extends Error {
  constructor(public status: number) {
    super('Registration failed');
  }
}

export interface RegistrationStore {
  save(id: string, data: Registration, rateKey: string): Promise<{ id: string; created: boolean }>;
  claim(id: string, claim: string): Promise<boolean>;
  finish(id: string, claim: string, sent: boolean): Promise<void>;
}

export function registrationStore(): RegistrationStore {
  const db = getGroupTransportDatabase();
  return {
    async save(id, data, rateKey) {
      const { data: saved, error } = await db.rpc('register_group_transport', {
        p_id: id,
        p_data: data,
        p_rate_key: rateKey,
        p_contact_key: hashValue(`contact:${data.email}`),
        p_dedupe_key: hashValue(`registration:${JSON.stringify(data)}`),
      });
      if (error)
        throw new RegistrationError(
          error.code === 'PT429'
            ? 429
            : error.code === 'PT409' || error.code === '23505'
              ? 409
              : 503,
        );
      if (!saved || typeof saved.id !== 'string' || typeof saved.created !== 'boolean')
        throw new RegistrationError(503);
      return saved as { id: string; created: boolean };
    },
    async claim(id, claim) {
      const { data, error } = await db.rpc('claim_group_transport_email', {
        p_id: id,
        p_claim: claim,
      });
      if (error) throw new RegistrationError(503);
      return data === true;
    },
    async finish(id, claim, sent) {
      const { data, error } = await db.rpc('finish_group_transport_email', {
        p_id: id,
        p_claim: claim,
        p_sent: sent,
      });
      if (error || data !== true) throw new RegistrationError(503);
    },
  };
}

export async function acceptRegistration(
  id: string,
  data: Registration,
  rateKey: string,
  dependencies: { store: RegistrationStore; send: typeof sendGroupTransportEmail } = {
    store: registrationStore(),
    send: sendGroupTransportEmail,
  },
) {
  // Do not send anything unless the durable write has completed.
  const saved = await dependencies.store.save(id, data, rateKey);
  await notifyRegistration(saved.id, data, dependencies);
  return saved;
}

export async function notifyRegistration(
  id: string,
  data: Registration,
  dependencies: { store: RegistrationStore; send: typeof sendGroupTransportEmail } = {
    store: registrationStore(),
    send: sendGroupTransportEmail,
  },
) {
  const claim = randomUUID();
  try {
    if (!(await dependencies.store.claim(id, claim))) return;
    try {
      await dependencies.send(data, id);
    } catch (error) {
      const smtp = error as { code?: string; responseCode?: number; command?: string } | null;
      const rejected = typeof smtp?.responseCode === 'number' && smtp.responseCode >= 400;
      const beforeMessage =
        ['ECONNECTION', 'EDNS', 'EAUTH'].includes(smtp?.code ?? '') ||
        (smtp?.code === 'ETIMEDOUT' && smtp.command === 'CONN');
      // A lost connection after DATA might mean the server accepted the message.
      // Leave uncertain delivery in 'sending' for inspection instead of retrying it.
      if (!rejected && !beforeMessage) throw error;
      await dependencies.store.finish(id, claim, false);
      console.error('[yhteiskuljetus] SMTP failed; registration retained', id);
      return;
    }
    await dependencies.store.finish(id, claim, true);
  } catch {
    // The customer has successfully submitted. A retry must not insert again.
    // An uncertain SMTP acknowledgement stays 'sending' for manual inspection.
    console.error('[yhteiskuljetus] Notification needs review', id);
  }
  return;
}
