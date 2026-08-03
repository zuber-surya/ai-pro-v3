import { z } from "zod";

export const notificationChannelSchema = z.enum(["email", "in_app"]);

/** Canonical event keys; OpenAPI `lead.created` aliases to `new_lead`. */
export const notificationEventSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .transform((v) => (v === "lead.created" ? "new_lead" : v))
  .refine((v) => ["new_lead"].includes(v), {
    message: "Unsupported event type",
  });

export const listNotificationRulesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const notificationRuleCreateSchema = z.object({
  event: notificationEventSchema,
  channels: z.array(notificationChannelSchema).min(1).max(2),
  enabled: z.boolean().optional().default(true),
  template: z.string().trim().max(120).optional(),
});

export const notificationRuleUpdateSchema = z
  .object({
    channels: z.array(notificationChannelSchema).min(1).max(2).optional(),
    enabled: z.boolean().optional(),
    template: z.string().trim().max(120).nullable().optional(),
  })
  .refine((v) => v.channels !== undefined || v.enabled !== undefined || v.template !== undefined, {
    message: "At least one field required",
  });

export type ListNotificationRulesQuery = z.infer<typeof listNotificationRulesQuerySchema>;
export type NotificationRuleCreateInput = z.infer<typeof notificationRuleCreateSchema>;
export type NotificationRuleUpdateInput = z.infer<typeof notificationRuleUpdateSchema>;
