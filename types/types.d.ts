import { type InjectionKey } from 'vue';
import { type StoreDefinition } from 'pinia';
import { ScopedContext } from './functions/makeContext';
export declare const injectorKey: InjectionKey<string>;
export type CreatedStore<S extends StoreCreator> = ReturnType<ReturnType<S>> & {
    __PINIA_SCOPE__: string;
    __PINIA_SCOPE_ID__: string;
};
export type StoreCreator = (ctx: ScopedContext) => StoreDefinition<string, any, any, any>;
export type StoreFactory = <S extends StoreCreator>(storeCreator: S) => CreatedStore<S>;
//# sourceMappingURL=types.d.ts.map