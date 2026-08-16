import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const garments = sqliteTable("garments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  pieceCode: text("piece_code").notNull().default(""),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  material: text("material").notNull(),
  color: text("color").notNull(),
  availability: text("availability").notNull().default("available"),
  units: integer("units").notNull().default(1),
  imageUrl: text("image_url").notNull(),
  imageKey: text("image_key"),
  imageFocus: text("image_focus").notNull().default("center"),
  overlayColor: text("overlay_color").notNull(),
  overlayAccent: text("overlay_accent").notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull().default(true),
  sizes: text("sizes").notNull(),
  sizeChart: text("size_chart").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerRequests = sqliteTable("customer_requests", {
  id: text("id").primaryKey(),
  garmentSlug: text("garment_slug").notNull(),
  garmentName: text("garment_name").notNull(),
  color: text("color").notNull(),
  size: text("size").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  city: text("city").notNull().default(""),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
