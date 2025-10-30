import z from "zod";

export const ISerializer = z.object({
    serialize: z.function({ input: [z.any()] })
})

export type ISerializer = z.infer<typeof ISerializer>

export const IDeserializer = z.object({
    deserialize: z.function({ input: [z.union([z.string(), z.unknown()]) ]})
})

export type IDeserializer = z.infer<typeof IDeserializer>