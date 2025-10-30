import {
    NativeFunction,
    ArgType
} from '@tryforge/forgescript'


export default new NativeFunction(
    {
        name: '$append',
        description: 'Appends items into the last of list',
        unwrap: true,
        brackets: true,
        args: [
            {
                name: 'sourcesToAppend',
                description: 'The source or target of items to be inserted',
                type: ArgType.Unknown,
                rest: false,
                required: true
            },
            {
                name: 'items',
                description: 'The items to append',
                type: ArgType.Unknown,
                rest: true,
                required: true
            }
        ],
        execute(ctx, [source, itemsOrArray]) {
            if (! Array.isArray(source)) {
                return this.customError("Expected #1 arg 'source' as an array-like object")
            }
            
            source.push(...itemsOrArray)
            return this.success()
        }
    }
)