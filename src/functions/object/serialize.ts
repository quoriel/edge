import {
    NativeFunction,
    ArgType
} from '@tryforge/forgescript'

import { Json } from '../../serializer';
import { ISerializer } from '../../utils/sandbox'
import { Resolver } from '../../utils/resolver'

const noop = () => void 0

export default new NativeFunction(
    {
        name: '$serialize',
        description: 'Serializes an object into a serializer',
        unwrap: true,
        brackets: true,
        args: [
            {
                name: 'object',
                description: 'The object that is to be serialized',
                type: ArgType.Unknown,
                rest: false,
                required: false,
            },
            {
                name: 'serializer',
                description: 'A serializer instance or name of a registered service',
                type: ArgType.Unknown,
                rest: false,
                required: false,
            }
        ],
        execute(ctx, [object, serializer = Json]) {
            const { serialize } = 
                Resolver.GetInstance(serializer as ISerializer) || 
                { serialize: noop }
            
            if (serialize === noop) {
                return this.customError('Expected a serializer with \'serialize\' function, got none')
            }
            
            return this.success(serialize(object))
        }
    }
)