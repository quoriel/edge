import {
    NativeFunction,
    ArgType
} from '@tryforge/forgescript'

import { IDeserializer } from '../../utils/sandbox'
import { Resolver } from '../../utils/resolver'

const noop = () => void 0

export default new NativeFunction(
    {
        name: '$deserialize',
        description: 'Deserializes a serialized input into an object',
        unwrap: true,
        brackets: true,
        args: [
            {
                name: 'input',
                description: 'The input that is to be deserialized',
                type: ArgType.String,
                rest: false,
                required: false,
            },
            {
                name: 'deserializer',
                description: 'A deserializer instance or name of a registered service',
                type: ArgType.Unknown,
                rest: false,
                required: false,
            }
        ],
        execute(ctx, [object, deserializer]) {
            const { deserialize } = 
                Resolver.GetInstance(deserializer as IDeserializer) || 
                { deserialize: noop }
            
            if (deserialize === noop) {
                return this.customError('Expected a deserializer with \'deserialize\' function, got none')
            }
            
            return this.success(deserialize(object))
        }
    }
)