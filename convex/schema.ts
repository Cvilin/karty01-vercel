import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  // Karty – 0 = rub, 1–64 = líc
  cards: defineTable({
    cardId: v.number(),       // 0–64
    message: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  }).index("by_cardId", ["cardId"]),

  // Lekce s poolem karet
  lessons: defineTable({
    lessonId: v.string(),     // např. "L0", "L1", ...
    pool: v.array(v.number()), // pole cardId
  }).index("by_lessonId", ["lessonId"]),

  // Historie tažení
  drawHistory: defineTable({
    userId: v.string(),
    drawnCardId: v.number(),
    drawnAt: v.number(),      // timestamp ms
  })
    .index("by_userId", ["userId"])
    .index("by_userId_drawnAt", ["userId", "drawnAt"]),
})
