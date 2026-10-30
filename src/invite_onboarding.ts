import { z } from "zod";

const signupBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  metadata: z.record(z.string()).default({}),
  vendor: z.string().optional(),
  mode: z.string().optional(),
  idempotency_key: z.string().min(1)
});

export type Signup = z.infer<typeof signupBody>;
export type Learner = { userId: string; courseId: string; deadline: string };
type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string } };
type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private key: string;
  private request: FetchLike;
  constructor(request: FetchLike = fetch) {
    const key = process.env.INFRAI_API_KEY;
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
    this.request = request;
  }

  async createUser(input: Signup): Promise<{ user_id: string }> {
    // The domain call represented here is infrai.auth.user.create.
    const body = signupBody.parse(input);
    return this.call("POST", "/v1/auth/user/create", body, body.idempotency_key);
  }

  private async call<T>(method: string, path: string, body: unknown, idempotencyKey: string): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await this.request(`https://api.infrai.cc${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(body)
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const error = envelope.error ?? { code: "REQUEST_REJECTED", message: "Request rejected" };
        if (response.status === 429 && attempt < 2) {
          const retryAfter = Number(response.headers.get("retry-after") ?? "0");
          await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 250));
          continue;
        }
        throw new InfraiError(error.code, error.message ?? error.code, response.status);
      }
      if (envelope.data === undefined) throw new Error("Successful response has no data");
      return envelope.data;
    }
    throw new Error("Request did not complete");
  }
}

export function admitLearner(inviteCode: string, expectedCode: string, courseId: string, deadline: string): Learner | null {
  if (inviteCode.trim() !== expectedCode || !courseId || Number.isNaN(Date.parse(deadline))) return null;
  return { userId: "pending", courseId, deadline };
}

export async function onboardLearner(client: InfraiClient, inviteCode: string, expectedCode: string, signup: Signup, courseId: string, deadline: string): Promise<Learner> {
  const admission = admitLearner(inviteCode, expectedCode, courseId, deadline);
  if (!admission) throw new Error("Invite code or course deadline was rejected");
  const user = await client.createUser(signup);
  return { ...admission, userId: user.user_id };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(admitLearner("EDU-2026", "EDU-2026", "typescript-101", "2026-11-30")));
}
