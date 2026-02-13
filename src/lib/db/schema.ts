import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";

// ─── Users ───────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  displayName: text("display_name").default(""),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─── Photos ──────────────────────────────────────────────

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default(""),
  description: text("description").default(""),

  // Image URLs (stored in cloud/local storage)
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  blurDataUrl: text("blur_data_url"),

  // Image dimensions
  width: integer("width").notNull(),
  height: integer("height").notNull(),

  // Live Photo
  isLivePhoto: boolean("is_live_photo").notNull().default(false),
  livePhotoVideoUrl: text("live_photo_video_url"),

  // EXIF data
  cameraMake: text("camera_make"),
  cameraModel: text("camera_model"),
  lensModel: text("lens_model"),
  focalLength: real("focal_length"),
  aperture: real("aperture"),
  shutterSpeed: text("shutter_speed"),
  iso: integer("iso"),
  takenAt: timestamp("taken_at"),

  // GPS
  latitude: real("latitude"),
  longitude: real("longitude"),
  altitude: real("altitude"),

  // Metadata
  originalFilename: text("original_filename"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
