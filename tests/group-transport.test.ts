import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRegistration,
  prefillFromParams,
  weekDates,
  type Registration,
} from '../lib/group-transport/validation';
import { createFormToken, verifyFormToken } from '../lib/group-transport/security';
import { acceptRegistration, type RegistrationStore } from '../lib/group-transport/service';
import { groupTransportEmail } from '../lib/group-transport/email';
import { readSubmission } from '../lib/group-transport/request';
import { calculatePrice, positioningTierSummary, PRICING } from '../lib/pricing';

const now = new Date('2026-10-05T09:00:00Z');
const valid: Registration = {
  origin: 'Riihimäki',
  destination: 'Oulu',
  bikeType: 'standard',
  timeframeType: 'week',
  week: '2026-W45',
  startDate: '',
  endDate: '',
  name: 'Testiasiakas',
  email: 'test@example.invalid',
  phone: '+358 40 1234567',
  notes: '',
};

test('normalizes valid values, rejects malformed contacts and headers', () => {
  const result = validateRegistration(
    { ...valid, email: ' TEST@example.invalid ', name: ' Testiasiakas ' },
    now,
  );
  assert(result.data);
  assert.equal(result.data.email, 'test@example.invalid');
  assert.equal(result.data.name, 'Testiasiakas');
  for (const patch of [
    { email: 'test@example.invalid\r\nBcc:other@example.invalid' },
    { email: 'a@example.invalid,b@example.invalid' },
    { phone: 'abc123' },
    { bikeType: 'unknown' },
    { origin: 'Riihimäki<script>' },
    { destination: 'riihimäki' },
    { notes: 'x'.repeat(2001) },
    { name: 'x'.repeat(101) },
  ])
    assert(validateRegistration({ ...valid, ...patch }, now).errors);
});

test('validates real ISO weeks, future dates, leap days and interval order', () => {
  assert.equal(weekDates('2026-W53')?.start.toISOString().slice(0, 10), '2026-12-28');
  assert.equal(weekDates('2025-W53'), null);
  for (const week of ['2026-W00', '2026-W54', '2020-W45', '2029-W45'])
    assert(validateRegistration({ ...valid, week }, now).errors?.week);
  assert(
    validateRegistration(
      { ...valid, timeframeType: 'interval', startDate: '2026-11-01', endDate: '2026-11-15' },
      now,
    ).data,
  );
  for (const [startDate, endDate] of [
    ['2026-11-10', '2026-11-01'],
    ['2026-02-30', '2026-03-01'],
    ['2026-10-01', '2026-10-15'],
    ['2026-11-01', '2027-04-01'],
  ])
    assert(
      validateRegistration({ ...valid, timeframeType: 'interval', startDate, endDate }, now).errors,
    );
});

test('prefill rejects parameter pollution and malicious data and extracts towns', () => {
  assert.deepEqual(
    prefillFromParams(
      new URLSearchParams({
        origin: 'Keskuskatu 5, 11100 Riihimäki, Suomi',
        destination: 'Oulu',
        bikeType: 'large',
      }),
    ),
    { origin: 'Riihimäki', destination: 'Oulu', bikeType: 'large' },
  );
  assert.deepEqual(
    prefillFromParams(
      new URLSearchParams('origin=Helsinki&origin=Oulu&destination=%3Cscript%3E&bikeType=nope'),
    ),
    { origin: '', destination: '', bikeType: 'standard' },
  );
  assert.equal(prefillFromParams(new URLSearchParams({ origin: 'x'.repeat(301) })).origin, '');
});

test('signed anti-spam token checks signature, age and IP binding', () => {
  process.env.GROUP_TRANSPORT_HASH_SECRET = 'unit-test-secret'.repeat(4);
  const token = createFormToken('test-ip-key', 10000);
  assert(verifyFormToken(token, 'test-ip-key', 12500));
  assert(!verifyFormToken(token, 'test-ip-key', 11000));
  assert(!verifyFormToken(token, 'other-ip', 12500));
  assert(!verifyFormToken(token, 'test-ip-key', 10000 + 3600001));
  assert(!verifyFormToken(token + 'x', 'test-ip-key', 12500));
});

test('rejects oversized and non-JSON requests before storage', async () => {
  await assert.rejects(
    readSubmission(
      new Request('https://example.invalid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'x'.repeat(16385),
      }),
    ),
    RangeError,
  );
  await assert.rejects(
    readSubmission(
      new Request('https://example.invalid', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '{}',
      }),
    ),
  );
});

function storeFixture() {
  let count = 0;
  let state: 'pending' | 'sending' | 'failed' | 'sent' = 'pending';
  const store: RegistrationStore = {
    async save() {
      count += 1;
      return { id: 'stored-id', created: count === 1 };
    },
    async claim() {
      if (state === 'pending' || state === 'failed') {
        state = 'sending';
        return true;
      }
      return false;
    },
    async finish(_id, _claim, sent) {
      state = sent ? 'sent' : 'failed';
    },
  };
  return { store, state: () => state };
}

test('storage failure never sends email or reports acceptance', async () => {
  let emails = 0;
  const fixture = storeFixture();
  fixture.store.save = async () => {
    throw new Error('database down');
  };
  await assert.rejects(
    acceptRegistration('id', valid, 'rate', {
      store: fixture.store,
      send: async () => {
        emails += 1;
      },
    }),
  );
  assert.equal(emails, 0);
});

test('email failure retains acceptance; retry uses the stored ID', async () => {
  const fixture = storeFixture();
  const ids: string[] = [];
  const saved = await acceptRegistration('new-id', valid, 'rate', {
    store: fixture.store,
    send: async (_data, id) => {
      ids.push(id);
      throw Object.assign(new Error('SMTP rejected'), { responseCode: 550 });
    },
  });
  assert.equal(saved.id, 'stored-id');
  assert.equal(fixture.state(), 'failed');
  const retry = await acceptRegistration('retry-id', valid, 'rate', {
    store: fixture.store,
    send: async (_data, id) => {
      ids.push(id);
    },
  });
  assert.equal(retry.created, false);
  assert.deepEqual(ids, ['stored-id', 'stored-id']);
  assert.equal(fixture.state(), 'sent');
});

test('concurrent requests and successful retries send only once', async () => {
  const fixture = storeFixture();
  let emails = 0;
  const dependencies = {
    store: fixture.store,
    send: async () => {
      emails += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
    },
  };
  await Promise.all([
    acceptRegistration('a', valid, 'rate', dependencies),
    acceptRegistration('b', valid, 'rate', dependencies),
  ]);
  await acceptRegistration('c', valid, 'rate', dependencies);
  assert.equal(emails, 1);
  assert.equal(fixture.state(), 'sent');
});

test('uncertain SMTP acknowledgement is not automatically sent twice', async () => {
  const fixture = storeFixture();
  let emails = 0;
  fixture.store.finish = async () => {
    throw new Error('database unavailable after email');
  };
  const dependencies = {
    store: fixture.store,
    send: async () => {
      emails += 1;
    },
  };
  await acceptRegistration('a', valid, 'rate', dependencies);
  await acceptRegistration('b', valid, 'rate', dependencies);
  assert.equal(emails, 1);
  assert.equal(fixture.state(), 'sending');
});

test('lost SMTP acknowledgement after DATA remains for manual review', async () => {
  const fixture = storeFixture();
  let emails = 0;
  const dependencies = {
    store: fixture.store,
    send: async () => {
      emails += 1;
      throw Object.assign(new Error('Socket closed after DATA'), {
        code: 'ESOCKET',
        command: 'DATA',
      });
    },
  };
  await acceptRegistration('a', valid, 'rate', dependencies);
  await acceptRegistration('b', valid, 'rate', dependencies);
  assert.equal(emails, 1);
  assert.equal(fixture.state(), 'sending');
});

test('email escapes user HTML, sets validated replyTo, and sends only to business', () => {
  const message = groupTransportEmail(
    { ...valid, name: '<img src=x onerror=alert(1)>', notes: '<script>bad()</script>' },
    'test-id',
  );
  assert(!message.html.includes('<script>'));
  assert(!message.html.includes('<img'));
  assert(message.html.includes('&lt;script&gt;'));
  assert.equal(message.replyTo.address, valid.email);
  assert.equal(message.to, 'info@mp-logistiikka.fi');
  assert.equal(message.messageId, '<yhteiskuljetus-test-id@mp-logistiikka.fi>');
});

test('existing gross prices and positioning tariff stay unchanged', () => {
  assert.deepEqual(PRICING.TYPE_EXTRA, { scooter: -20, standard: 0, large: 50 });
  assert.equal(calculatePrice(40, 'standard').total, 119);
  assert.equal(calculatePrice(40, 'scooter').total, 99);
  assert.equal(calculatePrice(40, 'large').total, 169);
  assert.equal(calculatePrice(150, 'standard').total, 246.6);
  assert(positioningTierSummary().includes('401–600 km 0,35 €/km'));
  assert(positioningTierSummary().includes('yli 600 km 0,50 €/km'));
});
