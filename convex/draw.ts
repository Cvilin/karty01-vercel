import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

const COOLDOWN_MS = 12 * 60 * 60 * 1000 // 12 hodin

export const canDraw = query({
  args: {
    userId: v.string(),
    lessonId: v.string(),
  },
  returns: v.object({
    allowed: v.boolean(),
    nextAllowedAt: v.union(v.number(), v.null()),
    lastDrawnCardId: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    const now = Date.now()
    const cutoff = now - COOLDOWN_MS

    // Najdi posledni tazeni uzivatele (globalni, bez ohledu na lekci)
    const history = await ctx.db
      .query("drawHistory")
      .withIndex("by_userId_drawnAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(1)

    if (history.length === 0) {
      return { allowed: true, nextAllowedAt: null, lastDrawnCardId: null }
    }

    const last = history[0]
    if (last.drawnAt > cutoff) {
      return {
        allowed: false,
        nextAllowedAt: last.drawnAt + COOLDOWN_MS,
        lastDrawnCardId: last.drawnCardId,
      }
    }

    return { allowed: true, nextAllowedAt: null, lastDrawnCardId: null }
  },
})

export const recordDraw = mutation({
  args: {
    userId: v.string(),
    drawnCardId: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("drawHistory", {
      userId: args.userId,
      drawnCardId: args.drawnCardId,
      drawnAt: Date.now(),
    })
    return null
  },
})
