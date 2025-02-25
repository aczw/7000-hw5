import { join, resolve } from "node:path";

import { assets } from "@/db/schema";
import { db } from "@/db/turso";
import { eq } from "drizzle-orm";

const dir = resolve("./");
const assetName = Bun.argv[2] as string;

const result = await db.select().from(assets).where(eq(assets.name, assetName));

const asset = result[0]!;

const thumbnailBlob = new Blob([asset.image], { type: "image/png" });
await Bun.write("thumbnail.png", thumbnailBlob);

console.log("Thumbnail retrieved, written to", join(dir, "thumbnail.png"));

const usdaBlob = new Blob([asset.file], { type: "text/plain" });
await Bun.write(`${assetName}.usda`, usdaBlob);

console.log(".usda file retrieved, written to", join(dir, `${assetName}.usda`));
