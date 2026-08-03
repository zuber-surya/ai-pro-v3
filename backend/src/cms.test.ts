import { describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function cleanupUserEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return;
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/token").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.accessToken as string;
}

describe("CMS pages", () => {
  const password = "SecurePass1!";
  const stamp = Date.now();
  const adminEmail = `qa.cms.admin.${stamp}@example.com`;
  const customerEmail = `qa.cms.customer.${stamp}@example.com`;
  let adminToken = "";
  let homepageId = "";
  const draftSlug = `promo-${stamp}`;

  it("seeds admin", async () => {
    await cleanupUserEmail(adminEmail);
    await cleanupUserEmail(customerEmail);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        fullName: "CMS Admin",
      },
    });
    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: "customer",
        fullName: "CMS Customer",
      },
    });
    adminToken = await login(adminEmail, password);
  });

  it("public homepage returns published only", async () => {
    const res = await request(app).get("/api/v1/cms/homepage");
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe("homepage");
    expect(res.body.status).toBe("published");
    expect(res.body.sections?.hero).toBeTruthy();
    homepageId = res.body.id;
  });

  it("public slug hides drafts", async () => {
    const created = await request(app)
      .post("/api/v1/cms/pages")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        slug: draftSlug,
        title: "Draft Promo",
        sections: { html: "<p>Secret</p>" },
        status: "draft",
      });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("draft");

    const pub = await request(app).get(`/api/v1/pages/${draftSlug}`);
    expect(pub.status).toBe(404);

    const published = await request(app)
      .patch(`/api/v1/cms/pages/${created.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "published" });
    expect(published.status).toBe(200);

    const ok = await request(app).get(`/api/v1/pages/${draftSlug}`);
    expect(ok.status).toBe(200);
    expect(ok.body.title).toBe("Draft Promo");
  });

  it("admin can update homepage hero and public reflects it", async () => {
    const headline = `CMS Hero ${stamp}`;
    const res = await request(app)
      .patch(`/api/v1/cms/pages/${homepageId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        sections: {
          hero: {
            eyebrow: "AI-Powered Search Engine",
            headline,
            headlineHighlight: "Intelligence",
            subheadline: "Edited subheadline",
            searchPlaceholder: "Try AI search",
            popularSearches: ["CMS chip one", "CMS chip two"],
          },
          featured: {
            title: "Curated matches for you",
            subtitle: "From CMS",
            propertyIds: [],
          },
        },
        status: "published",
      });
    expect(res.status).toBe(200);
    expect(res.body.sections.hero.headline).toBe(headline);

    const home = await request(app).get("/api/v1/cms/homepage");
    expect(home.body.sections.hero.headline).toBe(headline);
  });

  it("forbids customer from admin list", async () => {
    const token = await login(customerEmail, password);
    const res = await request(app)
      .get("/api/v1/cms/pages")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("cleanup", async () => {
    await prisma.cmsPage.deleteMany({ where: { slug: draftSlug } });
    await cleanupUserEmail(adminEmail);
    await cleanupUserEmail(customerEmail);
  });
});
