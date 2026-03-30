export function getIntakeResumePath(publicSessionId: string) {
  return `/intake/${encodeURIComponent(publicSessionId)}`;
}

export function getIntakeResumeUrl(publicSessionId: string, origin?: string | null) {
  const path = getIntakeResumePath(publicSessionId);

  if (!origin) {
    return path;
  }

  return new URL(path, origin).toString();
}
