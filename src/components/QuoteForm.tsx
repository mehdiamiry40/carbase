"use client";

import { useEffect, useRef, useState } from "react";
import { site, telHref } from "@/config/site";
import { CameraIcon, CheckIcon, PhoneIcon, XIcon } from "@/components/icons";

const MAX_PHOTOS = 5;
/** Keep the whole request comfortably under Vercel's 4.5 MB body limit. */
const MAX_TOTAL_BYTES = 3_800_000;
const MAX_ORIGINAL_FALLBACK_BYTES = 1_500_000;

type Photo = {
  id: string;
  name: string;
  blob: Blob;
  previewUrl: string;
};

type Status = "idle" | "submitting" | "success" | "error";

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
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState("");

  useEffect(() => {
    return () => photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (list.length > room) {
      notes.push(`Only ${MAX_PHOTOS} photos can be attached.`);
    }
    if (skipped.length) {
      notes.push(`Couldn't attach: ${skipped.join(", ")}.`);
    }
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    setErrorMessage(null);

    const data = new FormData(form);
    const totalBytes = photos.reduce((sum, p) => sum + p.blob.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      setStatus("error");
      setErrorMessage(
        "Your photos are too large to send together — please remove one or two and try again.",
      );
      return;
    }
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
      setSubmittedName(String(data.get("name") ?? "").trim());
      setStatus("success");
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPhotos([]);
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong sending your details.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon className="size-7" strokeWidth={2.5} />
        </span>
        <h3 className="mt-5 text-xl font-bold text-slate-900">
          Thanks{submittedName ? `, ${submittedName.split(" ")[0]}` : ""}! Request received.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We&apos;ll be in touch with your quote as soon as possible ({site.hours}).
          Want an answer faster? Give us a call.
        </p>
        <a
          href={telHref}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <PhoneIcon className="size-4" />
          Call {site.phone}
        </a>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 block w-full text-sm font-medium text-brand-700 hover:underline"
        >
          Submit another car
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8"
      noValidate={false}
    >
      <h2 className="text-xl font-bold text-slate-900">{heading}</h2>
      <p className="mt-1 text-sm text-slate-500">
        Takes about two minutes. No obligation.
      </p>

      {/* Honeypot — real visitors never see or fill this */}
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Your car
        </legend>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Make" required>
            <input
              type="text"
              name="make"
              required
              placeholder="e.g. Toyota"
              className={inputCls}
            />
          </Field>
          <Field label="Model" required>
            <input
              type="text"
              name="model"
              required
              placeholder="e.g. Hilux"
              className={inputCls}
            />
          </Field>
          <Field label="Year" required>
            <YearSelect />
          </Field>
          <Field label="Kilometres">
            <input
              type="text"
              inputMode="numeric"
              name="kilometres"
              placeholder="e.g. 120,000"
              className={inputCls}
            />
          </Field>
          <Field label="Transmission">
            <select name="transmission" defaultValue="" className={inputCls}>
              <option value="">Select…</option>
              <option>Automatic</option>
              <option>Manual</option>
              <option>Not sure</option>
            </select>
          </Field>
          <Field label="Condition">
            <select name="condition" defaultValue="" className={inputCls}>
              <option value="">Select…</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Damaged</option>
              <option>Not running</option>
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Your details
        </legend>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Your name"
              className={inputCls}
            />
          </Field>
          <Field label="Phone" required>
            <input
              type="tel"
              name="phone"
              required
              minLength={8}
              autoComplete="tel"
              placeholder="04xx xxx xxx"
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@email.com"
              className={inputCls}
            />
          </Field>
          <Field label="Suburb" required>
            <input
              type="text"
              name="suburb"
              required
              placeholder="e.g. Southport"
              className={inputCls}
            />
          </Field>
        </div>
      </fieldset>

      <div className="mt-6">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Photos <span className="font-normal normal-case">(optional — helps us quote sharper)</span>
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          id="quote-photos"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {photos.map((p) => (
            <span key={p.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.previewUrl}
                alt=""
                className="size-16 rounded-lg border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                aria-label={`Remove photo ${p.name}`}
                className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-slate-900 text-white shadow"
              >
                <XIcon className="size-3" strokeWidth={2.5} />
              </button>
            </span>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label
              htmlFor="quote-photos"
              className="flex size-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-brand-400 hover:text-brand-600"
            >
              <CameraIcon className="size-5" />
              <span className="text-[10px] font-semibold">Add</span>
            </label>
          )}
        </div>
        {photoNote && <p className="mt-2 text-xs text-amber-600">{photoNote}</p>}
      </div>

      <div className="mt-5">
        <Field label="Anything else we should know?">
          <textarea
            name="message"
            rows={3}
            placeholder="Damage, finance owing, missing keys, when you'd like it gone…"
            className={inputCls}
          />
        </Field>
      </div>

      {status === "error" && errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage} You can also call us on{" "}
          <a href={telHref} className="font-semibold underline">
            {site.phone}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 w-full rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Get my free quote"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-400">
        Free, no-obligation quote. We only use your details to contact you about
        selling your car — see our{" "}
        <a href="/privacy" className="underline hover:text-slate-600">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function YearSelect() {
  const current = new Date().getFullYear();
  const years = Array.from({ length: current - 1989 }, (_, i) => current - i);
  return (
    <select name="year" required defaultValue="" className={inputCls}>
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
