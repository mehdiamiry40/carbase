"use client";

import { useEffect, useRef, useState } from "react";
import { site, telHref } from "@/config/site";
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
const MAX_ORIGINAL_FALLBACK_BYTES = 1_500_000;

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

/** Downscale + re-encode a photo so five of them fit in one request. */
async function compressImage(file: File): Promise<Blob> {
  const MAX_DIM = 1600;
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8),
    );
    if (!blob) throw new Error("Could not encode image");
    return blob;
  } finally {
    bitmap.close();
  }
}

export function QuoteForm({ heading = "Get your free quote" }: { heading?: string }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(emptyValues);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof Values>(key: K) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!values.make.trim() || !values.model.trim() || !values.year) {
        return "Please fill in the make, model and year.";
      }
    }
    if (s === 2) {
      if (!values.name.trim() || !values.phone.trim() || !values.suburb.trim()) {
        return "Please fill in your name, phone and suburb.";
      }
      if (values.phone.replace(/\D/g, "").length < 8) {
        return "That phone number looks too short.";
      }
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, 2));
  }

  function back() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setPhotoNote(null);
    const room = MAX_PHOTOS - photos.length;
    const files = Array.from(list).slice(0, room);
    const skipped: string[] = [];
    const added: Photo[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        skipped.push(file.name);
        continue;
      }
      try {
        const blob = await compressImage(file);
        added.push({
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^.]+$/, "") + ".jpg",
          blob,
          previewUrl: URL.createObjectURL(blob),
        });
      } catch {
        // Browser couldn't decode it (e.g. some HEIC files) — fall back to
        // the original when it's small enough, otherwise skip it.
        if (file.size <= MAX_ORIGINAL_FALLBACK_BYTES) {
          added.push({
            id: crypto.randomUUID(),
            name: file.name,
            blob: file,
            previewUrl: URL.createObjectURL(file),
          });
        } else {
          skipped.push(file.name);
        }
      }
    }

    const notes: string[] = [];
    if (list.length > room) notes.push(`Only ${MAX_PHOTOS} photos can be attached.`);
    if (skipped.length) notes.push(`Couldn't attach: ${skipped.join(", ")}.`);
    setPhotoNote(notes.length ? notes.join(" ") : null);
    setPhotos((prev) => [...prev, ...added]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function submit() {
    const err = validateStep(2);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setSubmitError(null);

    const totalBytes = photos.reduce((sum, p) => sum + p.blob.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      setSubmitError(
        "Your photos are too large to send together — please go back and remove one or two.",
      );
      return;
    }

    const data = new FormData();
    (Object.keys(values) as (keyof Values)[]).forEach((key) =>
      data.append(key, values[key]),
    );
    data.append("website", honeypotRef.current?.value ?? "");
    photos.forEach((p, i) => {
      data.append(
        "photos",
        new File([p.blob], p.name || `photo-${i + 1}.jpg`, {
          type: p.blob.type || "image/jpeg",
        }),
      );
    });

    setStatus("submitting");
    try {
      const res = await fetch("/api/quote", { method: "POST", body: data });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Something went wrong sending your details.");
      }
      setStatus("success");
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    } catch (e) {
      setStatus("error");
      setSubmitError(
        e instanceof Error && e.message
          ? e.message
          : "Something went wrong sending your details.",
      );
    }
  }

  function reset() {
    setValues(emptyValues);
    setPhotos([]);
    setStep(0);
    setStatus("idle");
    setStepError(null);
    setSubmitError(null);
  }

  /* ── Success state ─────────────────────────────────────────────── */
  if (status === "success") {
    const firstName = values.name.trim().split(" ")[0];
    const car = `${values.year} ${values.make} ${values.model}`.trim();
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card-lg ring-1 ring-slate-900/5 sm:p-10">
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
        <h3 className="font-display mt-6 text-2xl font-bold text-slate-900">
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
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card-lg ring-1 ring-slate-900/5 sm:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
          {heading}
        </h2>
        <span className="text-xs font-semibold whitespace-nowrap text-slate-400">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-brand-600 text-white"
                    : i === step
                      ? "bg-linear-to-r from-brand-600 to-brand-500 text-white shadow-glow-sm"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? <CheckIcon className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  i === step ? "text-slate-900" : "text-slate-400"
                } ${i > 0 ? "hidden sm:inline" : ""}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
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
      <div key={step} className="step-in mt-6">
        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label-base">
                Make <Req />
              </span>
              <input
                type="text"
                list="carbase-makes"
                value={values.make}
                onChange={set("make")}
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
                value={values.model}
                onChange={set("model")}
                placeholder="e.g. Hilux"
                className="input-base"
              />
            </label>
            <label className="block">
              <span className="label-base">
                Year <Req />
              </span>
              <YearSelect value={values.year} onChange={set("year")} />
            </label>
            <label className="block">
              <span className="label-base">Kilometres</span>
              <input
                type="text"
                inputMode="numeric"
                value={values.kilometres}
                onChange={set("kilometres")}
                placeholder="e.g. 120,000"
                className="input-base"
              />
            </label>
            <label className="block">
              <span className="label-base">Transmission</span>
              <select
                value={values.transmission}
                onChange={set("transmission")}
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
                onChange={set("condition")}
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
              className="sr-only"
              id="quote-photos"
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
              {photos.length < MAX_PHOTOS && (
                <label
                  htmlFor="quote-photos"
                  className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600"
                >
                  <CameraIcon className="size-6" />
                  <span className="text-[10px] font-bold">Add</span>
                </label>
              )}
            </div>
            {photoNote && (
              <p className="mt-2 text-xs font-medium text-amber-600">{photoNote}</p>
            )}
            <label className="mt-5 block">
              <span className="label-base">Anything else we should know?</span>
              <textarea
                rows={3}
                value={values.message}
                onChange={set("message")}
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
                autoComplete="name"
                value={values.name}
                onChange={set("name")}
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
                autoComplete="tel"
                value={values.phone}
                onChange={set("phone")}
                placeholder="04xx xxx xxx"
                className="input-base"
              />
            </label>
            <label className="block">
              <span className="label-base">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={set("email")}
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
                value={values.suburb}
                onChange={set("suburb")}
                placeholder="e.g. Rangeville"
                className="input-base"
              />
            </label>
          </div>
        )}
      </div>

      {(stepError || submitError) && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {stepError ?? submitError}
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

      {/* Navigation */}
      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </button>
        )}
        {step < 2 ? (
          <button type="button" onClick={next} className="btn-primary flex-1">
            {step === 1 && photos.length === 0 ? "Skip for now" : "Continue"}
            <ArrowRightIcon className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={status === "submitting"}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Sending…" : "Get my free quote"}
            {status !== "submitting" && <ArrowRightIcon className="size-4" />}
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
        Free, no-obligation quote. We only use your details to contact you about
        selling your car —{" "}
        <a href="/privacy" className="underline hover:text-slate-600">
          privacy policy
        </a>
        .
      </p>
    </div>
  );
}

function Req() {
  return <span className="text-red-500">*</span>;
}

function YearSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  const current = new Date().getFullYear();
  const years = Array.from({ length: current - 1989 }, (_, i) => current - i);
  return (
    <select value={value} onChange={onChange} className="input-base">
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
