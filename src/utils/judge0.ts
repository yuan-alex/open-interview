interface CompileCodeResponse {
  error?: string;
  stdout?: string;
  time?: number;
  memory?: number;
  stderr?: string;
  token?: string;
  compile_output?: string;
  message?: string;
}

class Judge0Api {
  private apiBase: string;
  private apiKey: string;

  constructor(apiBase: string, apiKey: string) {
    this.apiBase = apiBase;
    this.apiKey = apiKey;
  }

  private async fetchWithAuth(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set("X-Auth-Token", this.apiKey);
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${this.apiBase}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async compileCodeSync(
    language_id: number,
    source_code: string,
    stdin: string | null = null,
  ): Promise<CompileCodeResponse> {
    try {
      const response = await this.fetchWithAuth(
        "/submissions?base64_encoded=false&wait=true&fields=*",
        {
          method: "POST",
          body: JSON.stringify({
            language_id,
            source_code,
            stdin,
          }),
        },
      );

      return (await response.json()) as CompileCodeResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSubmissionResult(
    submissionId: string,
  ): Promise<CompileCodeResponse> {
    try {
      const response = await this.fetchWithAuth(`/submissions/${submissionId}`);
      const data = await response.json();

      if (!data.status) {
        throw new Error(`Error: ${response.statusText}`);
      }

      return data as CompileCodeResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export { Judge0Api };
