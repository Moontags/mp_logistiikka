'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { BIKE_OPTIONS, type BikeType } from '@/lib/pricing';
import {
  FIELD_LIMITS,
  todayInFinland,
  validateRegistration,
  type FieldErrors,
  type Registration,
  type RegistrationField,
} from '@/lib/group-transport/validation';

type Prefill = { origin: string; destination: string; bikeType: BikeType };

export default function GroupTransportForm({ prefill }: { prefill: Prefill }) {
  const { register, control, handleSubmit } = useForm<Registration>({
    defaultValues: {
      ...prefill,
      timeframeType: 'week',
      week: '',
      startDate: '',
      endDate: '',
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
    shouldUnregister: true,
  });
  const bikeType = useWatch({ control, name: 'bikeType' });
  const timeframeType = useWatch({ control, name: 'timeframeType' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const sendingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  const submit = async (input: Registration) => {
    if (sendingRef.current) return;
    const validated = validateRegistration(input);
    if (validated.errors) {
      setErrors(validated.errors);
      const first = Object.keys(validated.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setServerError('');
    sendingRef.current = true;
    setBusy(true);
    try {
      const response = await fetch('/api/yhteiskuljetus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validated.data,
          website: trapRef.current?.value ?? '',
        }),
      });
      const body = await response.json();
      if (!response.ok || body.success !== true) {
        if (body.fields) setErrors(body.fields);
        setServerError(
          typeof body.error === 'string'
            ? body.error
            : 'Ilmoituksen lähetys epäonnistui. Yritä uudelleen tai soita 050 354 7763.',
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError(
        'Lähetyksen onnistumista ei voitu varmistaa. Soita 050 354 7763 ennen uudelleenlähetystä.',
      );
    } finally {
      sendingRef.current = false;
      setBusy(false);
    }
  };

  function error(field: RegistrationField) {
    return errors[field] ? (
      <p id={`group-${field}-error`} className="error-text" role="alert">
        {errors[field]}
      </p>
    ) : null;
  }
  function accessibility(field: RegistrationField) {
    return {
      'aria-invalid': Boolean(errors[field]),
      'aria-describedby': errors[field] ? `group-${field}-error` : undefined,
    };
  }

  if (submitted)
    return (
      <div
        className="calc-form group-transport-success"
        role="status"
        tabIndex={-1}
        ref={successRef}
      >
        <h2>Ennakkoilmoitus vastaanotettu</h2>
        <p>
          Kiitos! Ennakkoilmoituksesi on lähetetty meille sähköpostitse. Otamme yhteyttä, kun
          reitille voidaan suunnitella sopiva yhteiskuljetus.
        </p>
        <p>
          Tämä ei ole sitova kuljetustilaus. Toteutuminen, aikataulu ja hinta vahvistetaan erikseen.
        </p>
        <p>
          Jos kuljetuksella on kiire, soita <a href="tel:+358503547763">050 354 7763</a>.
        </p>
      </div>
    );

  return (
    <form
      className="calc-form group-transport-form"
      ref={formRef}
      onSubmit={(event) => void handleSubmit(submit)(event)}
      noValidate
      aria-label="Yhteiskuljetuksen ennakkoilmoitus"
      aria-busy={busy}
    >
      <p className="group-transport-required">Tähdellä (*) merkityt tiedot ovat pakollisia.</p>
      <fieldset disabled={busy} className="group-transport-fields">
        <div className="form-group">
          <label htmlFor="group-origin">Lähtöpaikkakunta *</label>
          <input
            id="group-origin"
            type="text"
            placeholder="esim. Riihimäki"
            maxLength={FIELD_LIMITS.town}
            required
            {...register('origin')}
            {...accessibility('origin')}
          />
          {error('origin')}
        </div>
        <div className="form-group">
          <label htmlFor="group-destination">Määränpää *</label>
          <input
            id="group-destination"
            type="text"
            placeholder="esim. Oulu"
            maxLength={FIELD_LIMITS.town}
            required
            {...register('destination')}
            {...accessibility('destination')}
          />
          {error('destination')}
        </div>
        <fieldset className="form-group group-transport-choice">
          <legend>Pyörätyyppi *</legend>
          {BIKE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`radio-opt${bikeType === option.value ? ' active' : ''}`}
            >
              <input
                type="radio"
                value={option.value}
                {...register('bikeType')}
                {...accessibility('bikeType')}
              />
              <span>
                {option.label}
                {option.description && (
                  <span className="bike-type-description">{option.description}</span>
                )}
              </span>
            </label>
          ))}
          {error('bikeType')}
        </fieldset>
        <div className="form-group">
          <label htmlFor="group-timeframe">Toivottu kuljetusviikko tai aikaväli *</label>
          <select id="group-timeframe" {...register('timeframeType')}>
            <option value="week">Kuljetusviikko</option>
            <option value="interval">Päivämääräväli</option>
          </select>
        </div>
        {timeframeType === 'interval' ? (
          <div className="group-transport-date-grid">
            <div className="form-group">
              <label htmlFor="group-startDate">Alkaen *</label>
              <input
                id="group-startDate"
                type="date"
                min={todayInFinland()}
                required
                {...register('startDate')}
                {...accessibility('startDate')}
              />
              {error('startDate')}
            </div>
            <div className="form-group">
              <label htmlFor="group-endDate">Viimeistään *</label>
              <input
                id="group-endDate"
                type="date"
                min={todayInFinland()}
                required
                {...register('endDate')}
                {...accessibility('endDate')}
              />
              {error('endDate')}
            </div>
            <p className="group-transport-help">Aikaväli voi olla enintään 90 päivää.</p>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="group-week">Kuljetusviikko *</label>
            <input
              id="group-week"
              type="week"
              placeholder="2026-W45"
              required
              {...register('week')}
              {...accessibility('week')}
            />
            <p className="group-transport-help">
              Esimerkiksi 2026-W45 tarkoittaa viikkoa 45 vuonna 2026. Valitse nykyinen tai tuleva
              viikko.
            </p>
            {error('week')}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="group-name">Nimi *</label>
          <input
            id="group-name"
            type="text"
            autoComplete="name"
            maxLength={FIELD_LIMITS.name}
            required
            {...register('name')}
            {...accessibility('name')}
          />
          {error('name')}
        </div>
        <div className="form-group">
          <label htmlFor="group-email">Sähköposti *</label>
          <input
            id="group-email"
            type="email"
            autoComplete="email"
            maxLength={FIELD_LIMITS.email}
            required
            {...register('email')}
            {...accessibility('email')}
          />
          {error('email')}
        </div>
        <div className="form-group">
          <label htmlFor="group-phone">Puhelin *</label>
          <input
            id="group-phone"
            type="tel"
            autoComplete="tel"
            maxLength={FIELD_LIMITS.phone}
            required
            {...register('phone')}
            {...accessibility('phone')}
          />
          {error('phone')}
        </div>
        <div className="form-group">
          <label htmlFor="group-notes">Lisätiedot (vapaaehtoinen)</label>
          <textarea
            id="group-notes"
            rows={4}
            maxLength={FIELD_LIMITS.notes}
            placeholder="Esimerkiksi aikataulun joustovara tai pyörää koskevat lisätiedot."
            {...register('notes')}
            {...accessibility('notes')}
          />
          {error('notes')}
        </div>
      </fieldset>
      <div className="group-transport-trap" aria-hidden="true">
        <label htmlFor="group-website">Verkkosivu</label>
        <input
          ref={trapRef}
          id="group-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <p className="group-transport-help">
        Yhteystietoja käytetään tämän kuljetusilmoituksen käsittelyyn. Tietoja ei julkaista
        sivustolla.
      </p>
      <p className="group-transport-help">
        Ennakkoilmoitus ei ole sitova tilaus. Toteutuminen, aikataulu ja hinta vahvistetaan
        erikseen.
      </p>
      {serverError && (
        <p className="error-text" role="alert">
          {serverError}
        </p>
      )}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Lähetetään…' : 'Lähetä ennakkoilmoitus →'}
      </button>
    </form>
  );
}
