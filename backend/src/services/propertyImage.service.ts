import { AppError } from "../middleware/errorHandler.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import { savePropertyImage } from "../integrations/storage/local.storage.js";
import { agentRepository } from "../repositories/agent.repository.js";
import { propertyRepository } from "../repositories/property.repository.js";
import {
  propertyImageRepository,
  toPublicPropertyImage,
} from "../repositories/propertyImage.repository.js";
import type { PropertyImageUploadMeta } from "../validators/propertyImage.validators.js";

async function assertCanAccessProperty(
  actor: AuthUser,
  propertyAgentId: string | null,
): Promise<void> {
  if (actor.role === "admin" || actor.role === "super_admin") return;
  if (actor.role !== "agent") {
    throw new AppError("AUTH_FORBIDDEN", "Insufficient permissions", 403);
  }
  const agent = await agentRepository.findByUserId(actor.id);
  if (!agent || agent.id !== propertyAgentId) {
    throw new AppError("AUTH_FORBIDDEN", "Not your listing", 403);
  }
}

export const propertyImageService = {
  async list(propertyId: string, actor?: AuthUser) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);

    if (!actor || actor.role === "customer") {
      if (property.status !== "published") {
        throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
      }
    } else {
      await assertCanAccessProperty(actor, property.agentId);
    }

    const rows = await propertyImageRepository.listByProperty(propertyId);
    return rows.map(toPublicPropertyImage);
  },

  async upload(
    propertyId: string,
    file: { mimetype: string; size: number; buffer: Buffer } | undefined,
    meta: PropertyImageUploadMeta,
    actor: AuthUser,
  ) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    await assertCanAccessProperty(actor, property.agentId);

    if (!file) {
      throw new AppError("VALIDATION_ERROR", "Image file required", 422, [
        { field: "file", issue: "required" },
      ]);
    }

    const url = await savePropertyImage(propertyId, file, meta.kind);
    const sortOrder = meta.sortOrder ?? (await propertyImageRepository.nextSortOrder(propertyId));
    const image = await propertyImageRepository.create({
      propertyId,
      url,
      kind: meta.kind,
      caption: meta.caption,
      sortOrder,
    });
    return toPublicPropertyImage(image);
  },

  async remove(propertyId: string, imageId: string, actor: AuthUser) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) throw new AppError("RESOURCE_NOT_FOUND", "Property not found", 404);
    await assertCanAccessProperty(actor, property.agentId);

    const image = await propertyImageRepository.findById(imageId);
    if (!image || image.propertyId !== propertyId) {
      throw new AppError("RESOURCE_NOT_FOUND", "Image not found", 404);
    }
    await propertyImageRepository.delete(imageId);
  },
};
