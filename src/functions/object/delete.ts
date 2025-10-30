import {
    NativeFunction,
    ArgType
} from '@tryforge/forgescript'

const containerSymbol = Symbol()

export default new NativeFunction(
    {
        name: '$delete',
        description: 'Deletes a key from an object or context',
        unwrap: true,
        brackets: true,
        args: [
            {
                name: 'propertyKey',
                description: 'The name of the property or key of object',
                type: ArgType.String,
                rest: false,
                required: true
            },
            {
                name: 'object',
                description: 'The source of object',
                type: ArgType.Unknown,
                rest: false,
                required: false,
            }
        ],
        execute(ctx, [propertyKey, obj = containerSymbol]) {
            if (obj === containerSymbol) {
                return this.success(ctx.deleteKeyword(propertyKey))
            }

            if (
                obj === null ||
                typeof(obj) === 'string' ||
                typeof(obj) === 'number' ||
                typeof(obj) === 'boolean'
            ) {
                const _t = obj === null ? 'null' : typeof(obj)
                return this.customError('Expected #2 an object with value, got ' + _t)
            }

            let exists = propertyKey in (obj as object)
            if (exists) delete obj[propertyKey]

            return this.success(exists)
        }
    }
)