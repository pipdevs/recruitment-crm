// "https://www.Acme.co.uk/careers" -> "acme.co.uk". The domain is what the
// companies import and the email timeline match on; it is never typed in,
// only derived from the website.
export function domainFromWebsite(website: string | null | undefined): string | null {
  const value = website?.trim();
  if (!value) return null;
  try {
    const url = new URL(/^[a-z]+:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, '') || null;
  } catch {
    return null;
  }
}

// Websites are entered as typed ("acme.com"); links need a scheme.
export function websiteHref(website: string): string {
  return /^[a-z]+:\/\//i.test(website) ? website : `https://${website}`;
}