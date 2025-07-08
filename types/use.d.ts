import { type InjectionKey } from 'vue';
import { type StoreDefinition } from 'pinia';
export declare const injectorKey: InjectionKey<string>;
export type Store<S extends StoreCreator> = ReturnType<ReturnType<S>>;
export type StoreCreator = (ctx: ScopedContext) => StoreDefinition<string, any, any, any>;
export type UseStore = <S extends StoreCreator>(storeCreator: S) => Store<S>;
export type GetStoreWithScope = <S extends StoreCreator>(storeCreator: S, scope: string) => Store<S>;
export type ScopedContext = {
    readonly scopedId: (id: string) => string;
    readonly useStore: UseStore;
};
export declare const setStoreScope: (name: string) => void;
export declare function getStoreScope(): string;
export declare const useStore: UseStore;
export declare const getStoreWithScope: GetStoreWithScope;
//# sourceMappingURL=use.d.ts.map