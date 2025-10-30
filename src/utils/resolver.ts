export namespace Resolver {
    const Registered = new Map<Function, any>()
    const Relation = new Map<string, Function>()

    export const RegisterType = <T>(type: T) => {
        if (Registered.has(type.constructor)) {
            return false;
        }

        Registered.set(type.constructor, type)
        return true;
    }

    export const RegisterWithId = <T>(type: T, id: string) => {
        
    }

    export const UnregisterType = <T>(type: T) => {
        if (type.constructor === Object) {
            
        }
        return Registered.delete(type.constructor)
    }

    export const GetInstance = <T>(type: T) => {
        return Registered.get(type.constructor) as T
    }
}