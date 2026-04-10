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

export const listCards = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("cards"),
      _creationTime: v.number(),
      cardId: v.number(),
      message: v.optional(v.string()),
      imageId: v.optional(v.id("_storage")),
      imageUrl: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx) => {
    const cards = await ctx.db.query("cards").collect()
    const withUrls = await Promise.all(
      cards.map(async (card) => ({
        ...card,
        imageUrl: card.imageId ? await ctx.storage.getUrl(card.imageId) : null,
      }))
    )
    return withUrls.sort((a, b) => a.cardId - b.cardId)
  },
})

export const upsertCard = mutation({
  args: {
    cardId: v.number(),
    message: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  },
  returns: v.id("cards"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const existing = await ctx.db
      .query("cards")
      .withIndex("by_cardId", (q) => q.eq("cardId", args.cardId))
      .unique()

    if (existing) {
      const patch: any = {}
      if (args.message !== undefined) patch.message = args.message
      if (args.imageId !== undefined) patch.imageId = args.imageId
      await ctx.db.patch(existing._id, patch)
      return existing._id
    } else {
      return await ctx.db.insert("cards", {
        cardId: args.cardId,
        message: args.message,
        imageId: args.imageId,
      })
    }
  },
})

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})
