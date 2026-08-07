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
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  material: text("material").notNull(),
  color: text("color").notNull(),
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
