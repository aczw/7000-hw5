import { assets, history, keywords } from "@/db/schema";
import { db } from "@/db/turso";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { eq, sql } from "drizzle-orm";

export const server = {
  getAsset: defineAction({
    input: z.object({
      assetName: z.string().nonempty(),
    }),

    handler: async (input) => {
      const term = `%${input.assetName}%`;
      const assetRes = await db
        .select()
        .from(assets)
        .where(sql`LOWER(${assets.name}) LIKE LOWER(${term})`);

      return Promise.all(
        assetRes.map(async (asset) => {
          const commitsRes = await db
            .select()
            .from(history)
            .where(eq(history.assetName, asset.name))
            .orderBy(history.timestamp);

          const keywordsRes = await db
            .select()
            .from(keywords)
            .where(eq(keywords.assetName, asset.name))
            .orderBy(keywords.keyword);

          return {
            name: asset.name,
            keywords: keywordsRes.map((value) => value.keyword).join(", "),
            numCommits: commitsRes.length,
            ogAuthor: commitsRes[0]!.author,
            currVersion: commitsRes[commitsRes.length - 1]!.version,
            thumbnailSrc: `data:image/png;base64,${asset.image.toString("base64")}`,
            usdaFile: asset.file,
          };
        }),
      );
    },
  }),
};
