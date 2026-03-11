export async function checkUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (response.status >= 200 && response.status <= 299) return true;
    return false;
  } catch {
    return false;
  }
}
