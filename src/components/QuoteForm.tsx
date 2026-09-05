"use client";

import { useEffect, useId, useRef, useState } from "react";
import { site, telHref } from "@/config/site";
import { areas } from "@/data/areas";
import { trackQuoteSubmission } from "@/components/SiteAnalytics";
import { isConfirmedQuoteReceipt } from "@/lib/quoteReceipt.mjs";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  PhoneIcon,
  XIcon,
} from "@/components/icons";

const MAX_PHOTOS = 5;
/** Keep the whole request comfortably under Vercel's 4.5 MB body limit. */
const MAX_TOTAL_BYTES = 3_800_000;
const CLIENT_REQUEST_TIMEOUT_MS = 32_000;

const COMMON_MAKES = [
  "Toyota", "Mazda", "Hyundai", "Ford", "Mitsubishi", "Nissan", "Kia",
  "Honda", "Subaru", "Volkswagen", "Holden", "Mercedes-Benz", "BMW",
  "Audi", "Isuzu", "Suzuki", "Lexus", "Jeep",
];

type Photo = {
  id: string;
  name: string;
  blob: Blob;
  previewUrl: string;
};

type Status = "idle" | "submitting" | "success" | "error";

type ValidationError = { message: string; fields: (keyof Values)[] };

type Values = {
  make: string;
  model: string;
  year: string;
  kilometres: string;
  transmission: string;
  condition: string;
  name: string;
  phone: string;
  email: string;
  suburb: string;
  message: string;
};

const emptyValues: Values = {
  make: "",
  model: "",
  year: "",
  kilometres: "",
  transmission: "",
  condition: "",
  name: "",
  phone: "",
  email: "",
  suburb: "",
  message: "",
};

const STEPS = ["Your car", "Photos", "Contact"] as const;

const SUBURB_SUGGESTIONS = [
  ...new Set(areas.flatMap((area) => [...area.suburbs, ...(area.nearby ?? [])])),
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function loadBrowserImage(file: File, signal: AbortSignal): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      if (signal.aborted) {
        bitmap.close();
        signal.throwIfAborted();
      }
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      signal.throwIfAborted();
      // Safari can render some phone formats through an image element even
      // when createImageBitmap cannot decode them.
    }
  }

  const previewUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        image.onload = null;
        image.onerror = null;
        signal.removeEventListener("abort", abort);
      };
      const abort = () => {
        cleanup();
        image.src = "";
        reject(signal.reason);
      };
      image.onload = () => { cleanup(); resolve(); };
      image.onerror = () => { cleanup(); reject(new Error("Unsupported image")); };
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) { abort(); return; }
      image.src = previewUrl;
    });
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(previewUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

/** Downscale + re-encode a photo so five of them fit in one request. */
async function compressImage(file: File, signal: AbortSignal): Promise<Blob> {
  const MAX_DIM = 1600;
  signal.throwIfAborted();
  const image = await loadBrowserImage(file, signal);
  try {
    signal.throwIfAborted();
    const scale = Math.min(1, MAX_DIM / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(image.source, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8),
    );
    signal.throwIfAborted();
    if (!blob) throw new Error("Could not encode image");
    return blob;
  } finally {
    image.cleanup();
  }
}

export function QuoteForm({ heading = "Get your free quote" }: { heading?: string }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(emptyValues);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState(0);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [stepError, setStepError] = useState<ValidationError | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedValues, setSubmittedValues] = useState<Values | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const receiptHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusStepRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<Photo[]>([]);
  const pendingPhotosRef = useRef(new Map<string, AbortController>());
  const requestRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const errorId = useId();
  const photoInputId = useId();
  const photoNoteId = useId();
  const receiptHeadingId = useId();

  useEffect(() => {
    if (status === "success") {
      receiptHeadingRef.current?.focus();
    } else if (stepError) {
      formRef.current?.querySelector<HTMLElement>(`[name="${stepError.fields[0]}"]`)?.focus();
    } else if (focusStepRef.current) {
      focusStepRef.current = false;
      const firstField = step === 0 ? "make" : step === 2 ? "name" : null;
      if (firstField) formRef.current?.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
      else panelHeadingRef.current?.focus();
    }
  }, [step, status, stepError]);

  useEffect(() => {
    const pending = pendingPhotosRef.current;
    return () => {
      generationRef.current += 1;
      pending.forEach((controller) => controller.abort());
      pending.clear();
      requestRef.current?.abort();
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  function markPayloadChanged() {
    submissionIdRef.current = null;
  }

  function updateValue(
    key: keyof Values,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    if (requestRef.current) return;
    markPayloadChanged();
    setStepError(null);
    setValues((v) => ({ ...v, [key]: event.target.value }));
  }

  function validateStep(s: number): ValidationError | null {
    if (s === 0) {
      const fields = (["make", "model", "year"] as const).filter((field) => !values[field].trim());
      if (fields.length) {
        return { message: "Please fill in the make, model and year.", fields };
      }
    }
    if (s === 2) {
      const fields = (["name", "phone", "suburb"] as const).filter((field) => !values[field].trim());
      if (fields.length) {
        return { message: "Please fill in your name, phone and suburb.", fields };
      }
      if (values.phone.replace(/\D/g, "").length < 8) {
        return { message: "That phone number looks too short.", fields: ["phone"] };
      }
      if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
        return { message: "Please enter a valid email address, or leave it blank.", fields: ["email"] };
      }
    }
    return null;
  }

  function errorAttributes(field: keyof Values) {
    return {
      "aria-invalid": stepError?.fields.includes(field) || undefined,
      "aria-describedby": stepError?.fields.includes(field) ? errorId : undefined,
    };
  }

  function next() {
    if (requestRef.current || pendingPhotosRef.current.size) return;
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    focusStepRef.current = true;
    setStep((s) => Math.min(s + 1, 2));
  }

  function back() {
    if (requestRef.current || pendingPhotosRef.current.size) return;
    setStepError(null);
    focusStepRef.current = true;
    setStep((s) => Math.max(s - 1, 0));
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length || requestRef.current) return;
    const selected = Array.from(list);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPhotoNote(null);
    const room = MAX_PHOTOS - photosRef.current.length - pendingPhotosRef.current.size;
    const generation = generationRef.current;
    // Reserve every selected slot before decoding so overlapping selections
    // cannot overbook capacity or let navigation omit unfinished photos.
    const jobs = selected.slice(0, room).map((file) => {
      const id = crypto.randomUUID();
      const controller = new AbortController();
      pendingPhotosRef.current.set(id, controller);
      return { file, id, controller };
    });
    setPendingPhotos(pendingPhotosRef.current.size);
    if (selected.length > room) setPhotoNote(`Only ${MAX_PHOTOS} photos can be attached.`);

    await Promise.all(jobs.map(async ({ file, id, controller }) => {
      try {
        if (!file.type.startsWith("image/")) throw new Error("Unsupported image");
        const blob = await compressImage(file, controller.signal);
        if (controller.signal.aborted || generation !== generationRef.current) return;
        const photo: Photo = {
          id,
          name: file.name.replace(/\.[^.]+$/, "") + ".jpg",
          blob,
          previewUrl: URL.createObjectURL(blob),
        };
        photosRef.current = [...photosRef.current, photo];
        markPayloadChanged();
        setPhotos(photosRef.current);
      } catch {
        if (controller.signal.aborted || generation !== generationRef.current) return;
        const note = `Couldn't attach: ${file.name}. Try JPEG, PNG or WebP if your browser cannot read that photo format.`;
        setPhotoNote((previous) => previous ? `${previous} ${note}` : note);
      } finally {
        if (generation === generationRef.current && pendingPhotosRef.current.delete(id)) {
          setPendingPhotos(pendingPhotosRef.current.size);
        }
      }
    }));
  }

  function cancelPendingPhotos() {
    pendingPhotosRef.current.forEach((controller) => controller.abort());
    pendingPhotosRef.current.clear();
    setPendingPhotos(0);
    panelHeadingRef.current?.focus();
  }

  function removePhoto(id: string) {
    if (requestRef.current) return;
    markPayloadChanged();
    const target = photosRef.current.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    photosRef.current = photosRef.current.filter((p) => p.id !== id);
    setPhotos(photosRef.current);
  }

  async function submit() {
    if (requestRef.current || pendingPhotosRef.current.size) return;
    const err = validateStep(2);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setSubmitError(null);

    const submittedPhotos = [...photosRef.current];
    const snapshot = { ...values };
    const totalBytes = submittedPhotos.reduce((sum, p) => sum + p.blob.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      setSubmitError(
        "Your photos are too large to send together — please go back and remove one or two.",
      );
      return;
    }

    const data = new FormData();
    (Object.keys(snapshot) as (keyof Values)[]).forEach((key) =>
      data.append(key, snapshot[key]),
    );
    const currentSubmissionId = submissionIdRef.current ?? crypto.randomUUID();
    submissionIdRef.current = currentSubmissionId;
    data.append("submissionId", currentSubmissionId);
    data.append("website", honeypotRef.current?.value ?? "");
    submittedPhotos.forEach((p, i) => {
      data.append(
        "photos",
        new File([p.blob], p.name || `photo-${i + 1}.jpg`, {
          type: p.blob.type || "image/jpeg",
        }),
      );
    });

    setStatus("submitting");
    const controller = new AbortController();
    requestRef.current = controller;
    const generation = generationRef.current;
    const timeout = window.setTimeout(
      () => controller.abort(),
      CLIENT_REQUEST_TIMEOUT_MS,
    );
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        body: data,
        signal: controller.signal,
      });
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        delivered?: boolean;
        safelyStored?: boolean;
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(body?.error ?? "Something went wrong sending your details.");
      }
      if (!isConfirmedQuoteReceipt(res.status, body)) {
        throw new Error(
          "We could not confirm that your request was received. Please retry or call us.",
        );
      }
      if (generation !== generationRef.current) return;
      trackQuoteSubmission();
      setSubmittedValues(snapshot);
      setStatus("success");
      submittedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      photosRef.current = [];
    } catch (e) {
      if (generation !== generationRef.current) return;
      setStatus("error");
      setSubmitError(
        e instanceof DOMException && e.name === "AbortError"
          ? "The request took too long. It is safe to retry with the same details."
          : e instanceof Error && e.message
          ? e.message
          : "Something went wrong sending your details.",
      );
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
    }
  }

  function reset() {
    generationRef.current += 1;
    cancelPendingPhotos();
    photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    photosRef.current = [];
    submissionIdRef.current = null;
    setSubmittedValues(null);
    setValues(emptyValues);
    setPhotos([]);
    setStep(0);
    focusStepRef.current = true;
    setStatus("idle");
    setStepError(null);
    setSubmitError(null);
    setPhotoNote(null);
  }

  /* ── Success state ─────────────────────────────────────────────── */
  if (status === "success" && submittedValues) {
    const firstName = submittedValues.name.trim().split(" ")[0];
    const car = `${submittedValues.year} ${submittedValues.make} ${submittedValues.model}`.trim();
    return (
      <section aria-labelledby={receiptHeadingId} className="rounded-3xl bg-white p-8 text-center shadow-card-lg ring-1 ring-slate-900/5 sm:p-10">
        <span className="pop-in mx-auto flex size-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-8"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" className="draw-check" />
          </svg>
        </span>
        <h3 ref={receiptHeadingRef} id={receiptHeadingId} tabIndex={-1} className="font-display mt-6 text-2xl font-bold text-slate-900">
          {firstName ? `Thanks, ${firstName}!` : "Thanks!"} Request received.
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          We&apos;re on it — expect a call or text about your{" "}
          <span className="font-semibold text-slate-900">{car}</span> as soon as
          possible ({site.hours}).
        </p>
        <a href={telHref} className="btn-primary mt-7 w-full">
          <PhoneIcon className="size-4" />
          Want it faster? Call {site.phone}
        </a>
        <button
          type="button"
          onClick={reset}
          className="mt-4 text-sm font-semibold text-brand-700 hover:underline"
        >
          Submit another car
        </button>
      </section>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (status === "submitting" || requestRef.current || pendingPhotosRef.current.size) return;
        if (step < 2) next();
        else void submit();
      }}
      className="rounded-3xl bg-white p-6 shadow-card-lg ring-1 ring-slate-900/5 sm:p-8"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
          {heading}
        </h2>
        <span className="text-xs font-semibold whitespace-nowrap text-slate-600">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                aria-current={i === step ? "step" : undefined}
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-brand-600 text-white"
                    : i === step
                      ? "bg-linear-to-r from-brand-600 to-brand-500 text-white shadow-glow-sm"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {i < step ? <CheckIcon className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  i === step ? "text-slate-900" : "text-slate-600"
                } ${i > 0 ? "hidden sm:inline" : ""}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Quote form progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-brand-600 to-accent-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Honeypot — real visitors never see or fill this */}
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input ref={honeypotRef} type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* Step panels */}
      <fieldset
        key={step}
        disabled={status === "submitting"}
        aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
        className="step-in mt-6 min-w-0 border-0 p-0"
        aria-busy={pendingPhotos > 0 || status === "submitting"}
      >
        <h3 ref={panelHeadingRef} tabIndex={-1} className="sr-only">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </h3>
        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label-base">
                Make <Req />
              </span>
              <input
                type="text"
                name="make"
                {...errorAttributes("make")}
                required
                autoComplete="off"
                list="carbase-makes"
                value={values.make}
                onChange={(event) => updateValue("make", event)}
                placeholder="e.g. Toyota"
                className="input-base"
              />
              <datalist id="carbase-makes">
                {COMMON_MAKES.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="label-base">
                Model <Req />
              </span>
              <input
                type="text"
                name="model"
                {...errorAttributes("model")}
                required
                autoComplete="off"
                value={values.model}
                onChange={(event) => updateValue("model", event)}
                placeholder="e.g. Hilux"
                className="input-base"
              />
            </label>
            <label className="block">
              <span className="label-base">
                Year <Req />
              </span>
              <YearSelect value={values.year} onChange={(event) => updateValue("year", event)} {...errorAttributes("year")} />
            </label>
            <label className="block">
              <span className="label-base">Kilometres</span>
              <input
                type="text"
                inputMode="numeric"
                value={values.kilometres}
                onChange={(event) => updateValue("kilometres", event)}
                placeholder="e.g. 120,000"
                className="input-base"
              />
            </label>
            <label className="block">
              <span className="label-base">Transmission</span>
              <select
                value={values.transmission}
                onChange={(event) => updateValue("transmission", event)}
                className="input-base"
              >
                <option value="">Select…</option>
                <option>Automatic</option>
                <option>Manual</option>
                <option>Not sure</option>
              </select>
            </label>
            <label className="block">
              <span className="label-base">Condition</span>
              <select
                value={values.condition}
                onChange={(event) => updateValue("condition", event)}
                className="input-base"
              >
                <option value="">Select…</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Damaged</option>
                <option>Not running</option>
              </select>
            </label>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm leading-relaxed text-slate-600">
              Photos are optional, but a few quick shots (front, side, interior,
              any damage) help us give you a sharper offer, faster.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              tabIndex={-1}
              className="sr-only"
              id={photoInputId}
              aria-label="Car photos"
              aria-describedby={photoNote ? photoNoteId : undefined}
              disabled={photos.length + pendingPhotos >= MAX_PHOTOS}
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {photos.map((p) => (
                <span key={p.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.previewUrl}
                    alt=""
                    className="size-20 rounded-xl border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    aria-label={`Remove photo ${p.name}`}
                    className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-ink-900 text-white shadow-md transition hover:bg-red-600"
                  >
                    <XIcon className="size-3" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              {photos.length + pendingPhotos < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add car photos"
                  aria-describedby={photoNote ? photoNoteId : undefined}
                  className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 transition hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600"
                >
                  <CameraIcon className="size-6" />
                  <span className="text-[10px] font-bold">Add</span>
                </button>
              )}
            </div>
            {photoNote && (
              <p id={photoNoteId} role="alert" className="mt-2 text-xs font-medium text-amber-800">{photoNote}</p>
            )}
            <label className="mt-5 block">
              <span className="label-base">Anything else we should know?</span>
              <textarea
                rows={3}
                value={values.message}
                onChange={(event) => updateValue("message", event)}
                placeholder="Damage, finance owing, missing keys, when you'd like it gone…"
                className="input-base"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label-base">
                Name <Req />
              </span>
              <input
                type="text"
                name="name"
                {...errorAttributes("name")}
                required
                autoComplete="name"
                value={values.name}
                onChange={(event) => updateValue("name", event)}
                placeholder="Your name"
                className="input-base"
              />
            </label>
            <label className="block">
              <span className="label-base">
                Phone <Req />
              </span>
              <input
                type="tel"
                name="phone"
                {...errorAttributes("phone")}
                required
                autoComplete="tel"
                value={values.phone}
                onChange={(event) => updateValue("phone", event)}
                placeholder="04xx xxx xxx"
                className="input-base"
              />
            </label>
            <label className="block">
              <span className="label-base">Email</span>
              <input
                type="email"
                name="email"
                {...errorAttributes("email")}
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateValue("email", event)}
                placeholder="you@email.com"
                className="input-base"
              />
            </label>
            <label className="block">
              <span className="label-base">
                Suburb <Req />
              </span>
              <input
                type="text"
                name="suburb"
                {...errorAttributes("suburb")}
                required
                autoComplete="address-level2"
                list="carbase-suburbs"
                value={values.suburb}
                onChange={(event) => updateValue("suburb", event)}
                placeholder="e.g. Rangeville"
                className="input-base"
              />
              <datalist id="carbase-suburbs">
                {SUBURB_SUGGESTIONS.map((suburb) => (
                  <option key={suburb} value={suburb} />
                ))}
              </datalist>
            </label>
          </div>
        )}
      </fieldset>

      {(stepError || submitError) && (
        <p
          id={errorId}
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {stepError?.message ?? submitError}
          {submitError && (
            <>
              {" "}
              You can also call us on{" "}
              <a href={telHref} className="font-bold underline">
                {site.phone}
              </a>
              .
            </>
          )}
        </p>
      )}

      <p role="status" aria-live="polite" aria-atomic="true" className={pendingPhotos > 0 || status === "submitting" ? "mt-3 text-sm text-slate-700" : "sr-only"}>
        {pendingPhotos > 0
          ? `Preparing ${pendingPhotos} ${pendingPhotos === 1 ? "photo" : "photos"}. Please wait before continuing.`
          : status === "submitting" ? "Sending your quote request. Please wait." : ""}
      </p>
      {pendingPhotos > 0 && (
        <button type="button" onClick={cancelPendingPhotos} className="mt-2 text-sm font-semibold text-brand-700 underline">
          Cancel photo processing
        </button>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            disabled={pendingPhotos > 0 || status === "submitting"}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </button>
        )}
        {step < 2 ? (
          <button type="submit" disabled={pendingPhotos > 0} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60">
            {pendingPhotos > 0 ? "Preparing photos…" : step === 1 && photos.length === 0 ? "Skip for now" : "Continue"}
            <ArrowRightIcon className="size-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === "submitting" || pendingPhotos > 0}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Sending…" : "Get my free quote"}
            {status !== "submitting" && <ArrowRightIcon className="size-4" />}
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">
        Free, no-obligation quote. We only use your details to contact you about
        selling your car —{" "}
        <a href="/privacy" className="underline hover:text-slate-600">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}

function Req() {
  return <span className="text-red-500">*</span>;
}

function YearSelect({
  value,
  onChange,
  ...attributes
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
} & Pick<React.AriaAttributes, "aria-invalid" | "aria-describedby">) {
  const current = new Date().getFullYear();
  const years = Array.from({ length: current - 1989 }, (_, i) => current - i);
  return (
    <select name="year" required value={value} onChange={onChange} {...attributes} className="input-base">
      <option value="" disabled>
        Select year…
      </option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
      <option value="Pre-1990">Pre-1990</option>
    </select>
  );
}
