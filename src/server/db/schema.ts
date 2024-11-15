// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `photograph_${name}`);

export const galleries = createTable(
  "galleries",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 265 }),
    userId: varchar("userId", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (g) => ({
    nameIndex: index("gallery_name_idx").on(g.name),
    userIdIndex: index("gallery_user_id_idx").on(g.userId),
  })
);

export const galleriesRelations = relations(galleries, ({ many }) => ({
  images: many(images),
}));

/** Updated definition of the `images` table to include `galleryId` */
export const images = createTable(
  "images",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
    url: varchar("url", { length: 128 }).notNull(),
    userId: varchar("userId", { length: 256 }).notNull(),
    galleryId: integer("gallery_id")
      .references(() => galleries.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (img) => ({
    nameIndex: index("image_name_idx").on(img.name),
    userIdIndex: index("image_user_id_idx").on(img.userId),
    galleryIdIndex: index("image_gallery_id_idx").on(img.galleryId),
  })
);

export const imagesRelations = relations(images, ({ one }) => ({
  gallery: one(galleries, {
    fields: [images.galleryId],
    references: [galleries.id],
  }),
}));
