import { TagModel } from "../../model/tag_model";

const SYSTEM_TAGS = [
    { name: "Sports", slug: "sports" },
    { name: "Study", slug: "study" },
    { name: "Social Media", slug: "social-media" },
    { name: "Technology", slug: "technology" },
    { name: "Health", slug: "health" }
]

export const seedTags = async () => {
    for (const tag of SYSTEM_TAGS) {
        await TagModel.updateOne(
            { slug: tag.slug },
            { ...tag, isSystem: true, createdBy: null },
            { upsert: true }
        )
    }
    console.log('System tags seeded')
}