import * as Serializers from './serializer'
import { Resolver } from "./utils/resolver";

Resolver.RegisterType(Serializers.Json)

export { QuorielExtension as QuorielEdge } from './extension'