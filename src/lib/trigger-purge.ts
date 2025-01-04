export default async function triggerPurge(path?: string, tag?: string) {
  try {
    const url = new URL("/api/purge", window.location.origin);
    if (path) url.searchParams.append("path", path);
    if (tag) url.searchParams.append("tag", tag);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to purge cache: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error purging cache:", error);
    return false;
  }
}
