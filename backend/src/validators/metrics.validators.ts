import { z } from "zod";

export const metricsDashboardQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  activityType: z
    .enum(["all", "lead", "property", "system"])
    .default("all")
    .optional(),
});

export type MetricsDashboardQuery = z.infer<typeof metricsDashboardQuerySchema>;

export const metricsReportsQuerySchema = z.object({
  reportType: z.string().min(1).max(80),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type MetricsReportsQuery = z.infer<typeof metricsReportsQuerySchema>;
