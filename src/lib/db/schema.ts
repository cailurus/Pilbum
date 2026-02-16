import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

// ─── Users ───────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  displayName: text("display_name").default(""),
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─── Photos ──────────────────────────────────────────────

export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
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
  isLivePhoto: integer("is_live_photo", { mode: "boolean" }).notNull().default(false),
  livePhotoVideoUrl: text("live_photo_video_url"),

  // EXIF - Camera info
  cameraMake: text("camera_make"),
  cameraModel: text("camera_model"),
  lensModel: text("lens_model"),
  lensMake: text("lens_make"),
  software: text("software"),

  // EXIF - Shooting parameters
  focalLength: real("focal_length"),
  focalLength35mm: real("focal_length_35mm"),
  aperture: real("aperture"),
  shutterSpeed: text("shutter_speed"),
  exposureTime: real("exposure_time"),
  iso: integer("iso"),
  exposureBias: real("exposure_bias"),
  exposureProgram: text("exposure_program"),
  exposureMode: text("exposure_mode"),
  meteringMode: text("metering_mode"),
  flash: text("flash"),
  whiteBalance: text("white_balance"),

  // EXIF - Image info
  colorSpace: text("color_space"),
  orientation: integer("orientation"),
  takenAt: text("taken_at"),

  // GPS
  latitude: real("latitude"),
  longitude: real("longitude"),
  altitude: real("altitude"),

  // Metadata
  originalFilename: text("original_filename"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
