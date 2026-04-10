import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

const ADMIN_EMAILS = ["klicosudu@centrum.cz", "pavel.zeman.krnov@gmail.com"]

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error("Nejste přihlášeni")
  const user = await ctx.db.get(userId)
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    throw new Error("Přístup odmítnut")
  }
}

export const listLessons = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      lessonId: v.string(),
      pool: v.array(v.number()),
    })
  ),
  handler: async (ctx) => {
    const lessons = await ctx.db.query("lessons").collect()
    return lessons.sort((a, b) => a.lessonId.localeCompare(b.lessonId))
  },
})

export const upsertLesson = mutation({
  args: {
    lessonId: v.string(),
    pool: v.array(v.number()),
  },
  returns: v.id("lessons"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const existing = await ctx.db
      .query("lessons")
      .withIndex("by_lessonId", (q) => q.eq("lessonId", args.lessonId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { pool: args.pool })
      return existing._id
    } else {
      return await ctx.db.insert("lessons", {
        lessonId: args.lessonId,
        pool: args.pool,
      })
    }
  },
})

export const deleteLesson = mutation({
  args: { lessonId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const existing = await ctx.db
      .query("lessons")
      .withIndex("by_lessonId", (q) => q.eq("lessonId", args.lessonId))
      .unique()
    if (existing) {
      await ctx.db.delete(existing._id)
    }
    return null
  },
})
