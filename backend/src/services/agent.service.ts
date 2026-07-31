import { AppError } from "../middleware/errorHandler.js";
import { saveAgentImage } from "../integrations/storage/local.storage.js";
import { agentRepository, toPublicAgent } from "../repositories/agent.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import type {
  AgentCreateInput,
  AgentUpdateInput,
  ListAgentsQuery,
} from "../validators/agent.validators.js";

export const agentService = {
  async list(query: ListAgentsQuery) {
    const { total, rows } = await agentRepository.list(query);
    return {
      data: rows.map(toPublicAgent),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  async getById(id: string) {
    const agent = await agentRepository.findById(id);
    if (!agent) throw new AppError("RESOURCE_NOT_FOUND", "Agent not found", 404);
    return toPublicAgent(agent);
  },

  async create(input: AgentCreateInput) {
    const existing = await agentRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("CONFLICT_DUPLICATE_EMAIL", "Agent email already exists", 409, [
        { field: "email", issue: "duplicate" },
      ]);
    }

    if (input.userId) {
      const user = await userRepository.findById(input.userId);
      if (!user) throw new AppError("RESOURCE_NOT_FOUND", "Linked user not found", 404);
      if (user.role !== "agent") {
        throw new AppError("VALIDATION_ERROR", "Linked user must have agent role", 422, [
          { field: "userId", issue: "role must be agent" },
        ]);
      }
      const linked = await agentRepository.findByUserId(input.userId);
      if (linked) {
        throw new AppError("CONFLICT_DUPLICATE_EMAIL", "User already linked to an agent", 409, [
          { field: "userId", issue: "already linked" },
        ]);
      }
    }

    const agent = await agentRepository.create(input);
    return toPublicAgent(agent);
  },

  async update(id: string, input: AgentUpdateInput) {
    const existing = await agentRepository.findById(id);
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "Agent not found", 404);

    if (input.email && input.email.toLowerCase() !== existing.email) {
      const clash = await agentRepository.findByEmail(input.email);
      if (clash) {
        throw new AppError("CONFLICT_DUPLICATE_EMAIL", "Agent email already exists", 409, [
          { field: "email", issue: "duplicate" },
        ]);
      }
    }

    if (input.userId) {
      const user = await userRepository.findById(input.userId);
      if (!user) throw new AppError("RESOURCE_NOT_FOUND", "Linked user not found", 404);
      if (user.role !== "agent") {
        throw new AppError("VALIDATION_ERROR", "Linked user must have agent role", 422, [
          { field: "userId", issue: "role must be agent" },
        ]);
      }
      const linked = await agentRepository.findByUserId(input.userId);
      if (linked && linked.id !== id) {
        throw new AppError("CONFLICT_DUPLICATE_EMAIL", "User already linked to an agent", 409, [
          { field: "userId", issue: "already linked" },
        ]);
      }
    }

    const agent = await agentRepository.update(id, input);
    return toPublicAgent(agent);
  },

  async remove(id: string) {
    const existing = await agentRepository.findById(id);
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "Agent not found", 404);
    await agentRepository.delete(id);
  },

  async uploadImage(
    id: string,
    file: { mimetype: string; size: number; buffer: Buffer } | undefined,
  ) {
    const existing = await agentRepository.findById(id);
    if (!existing) throw new AppError("RESOURCE_NOT_FOUND", "Agent not found", 404);
    if (!file) {
      throw new AppError("VALIDATION_ERROR", "Image file required", 422, [
        { field: "file", issue: "required" },
      ]);
    }
    const profileImageUrl = await saveAgentImage(id, file);
    const agent = await agentRepository.update(id, { profileImageUrl });
    return toPublicAgent(agent);
  },
};
