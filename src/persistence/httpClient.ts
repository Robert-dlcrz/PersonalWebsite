/**
 * Raw HTTP request. Logs and rethrows the original exception. No status
 * mapping, timeouts, or body decoding — those live in `HttpService`.
 */
export class HttpClient {
  async request(url: string, init?: RequestInit): Promise<Response> {
    const method = init?.method ?? 'GET';
    try {
      const response = await fetch(url, init);
      console.log(`HttpClient: ${method} ok status=${response.status}`);
      return response;
    } catch (error) {
      console.error(`HttpClient: ${method} failed`, error);
      throw error;
    }
  }
}
