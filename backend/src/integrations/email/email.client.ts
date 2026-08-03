import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "../../config/env.js";

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  headers?: Record<string, string>;
};

export type SentEmail = EmailMessage & {
  id: string;
  from: string;
  sentAt: string;
  transport: "catcher" | "smtp";
};

export type EmailClient = {
  send(message: EmailMessage): Promise<SentEmail>;
};

let testClient: EmailClient | null = null;
const memoryOutbox: SentEmail[] = [];

function normalizeTo(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to]).map((t) => t.trim()).filter(Boolean);
}

export function createCatcherEmailClient(): EmailClient {
  return {
    async send(message) {
      const recipients = normalizeTo(message.to);
      if (recipients.length === 0) {
        throw new Error("Email requires at least one recipient");
      }
      const record: SentEmail = {
        id: randomUUID(),
        from: env.EMAIL_FROM,
        to: recipients,
        subject: message.subject,
        text: message.text,
        html: message.html,
        headers: message.headers,
        sentAt: new Date().toISOString(),
        transport: "catcher",
      };
      memoryOutbox.push(record);

      const dir = path.resolve(env.STORAGE_ROOT, "email-outbox");
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, `${record.sentAt.replace(/[:.]/g, "-")}-${record.id}.json`);
      await writeFile(file, JSON.stringify(record, null, 2), "utf8");

      if (env.NODE_ENV !== "test") {
        console.info(`[email:catcher] to=${recipients.join(",")} subject=${record.subject} file=${file}`);
      }
      return record;
    },
  };
}

export function getEmailClient(): EmailClient {
  if (testClient) return testClient;
  // MVP: file/memory catcher for local/staging. SMTP host reserved; no SMS/WhatsApp/push.
  return createCatcherEmailClient();
}

export function setEmailClientForTests(client: EmailClient | null) {
  testClient = client;
}

export function resetEmailClientForTests() {
  testClient = null;
  memoryOutbox.length = 0;
}

export function getEmailOutboxForTests(): SentEmail[] {
  return [...memoryOutbox];
}
