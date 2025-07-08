import { CreatedStore, StoreCreator } from '../types';
export type GetStoreWithScope = <S extends StoreCreator>(storeCreator: S, scope: string) => CreatedStore<S>;
declare const getStoreWithScope: GetStoreWithScope;
export default getStoreWithScope;
//# sourceMappingURL=getStoreWithScope.d.ts.map