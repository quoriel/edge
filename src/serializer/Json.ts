import { ISerializer, IDeserializer } from "../utils/sandbox";

export const serialize: ISerializer['serialize'] = (obj) => JSON.stringify(obj)
export const deserialize: IDeserializer['deserialize'] = (input: string) => JSON.parse(input)