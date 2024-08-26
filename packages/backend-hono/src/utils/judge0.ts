import axios, { type AxiosInstance } from "axios";

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
  private axiosInstance: AxiosInstance;

  constructor(apiBase: string, apiKey: string) {
    this.apiBase = apiBase;
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: apiBase,
      headers: {
        "X-Auth-Token": apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  async compileCodeSync(
    language_id: number,
    source_code: string,
    stdin: string | null = null,
  ): Promise<CompileCodeResponse> {
    return (await this.axiosInstance
      .post("/submissions?base64_encoded=false&wait=true&fields=*", {
        language_id,
        source_code,
        stdin,
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        throw error;
      })) as Promise<CompileCodeResponse>;
  }

  async getSubmissionResult(
    submissionId: string,
  ): Promise<CompileCodeResponse> {
    try {
      const response = await this.axiosInstance.get(
        `/submissions/${submissionId}`,
      );
      if (!response.data.status) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export { Judge0Api };
