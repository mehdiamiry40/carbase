const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isQuoteSubmissionId(value) {
  return typeof value === "string" && UUID_V4_PATTERN.test(value);
}

export function isConfirmedQuoteReceipt(status, body) {
  if (!body || body.ok !== true) return false;

  return (
    (status === 200 && body.delivered === true) ||
    (status === 202 &&
      body.delivered === false &&
      body.safelyStored === true)
  );
}

export function createQuoteSubmissionSession(randomUUID) {
  let submissionId = null;

  return {
    current() {
      submissionId ??= randomUUID();
      return submissionId;
    },
    rotate() {
      submissionId = randomUUID();
      return submissionId;
    },
  };
}
