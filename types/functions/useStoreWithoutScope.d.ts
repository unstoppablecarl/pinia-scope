import { CreatedStore, StoreCreator } from '../types';
export type UseStoreWithoutScope = <S extends StoreCreator>(storeCreator: S) => CreatedStore<S>;
declare const useStoreWithoutScope: UseStoreWithoutScope;
export default useStoreWithoutScope;
//# sourceMappingURL=useStoreWithoutScope.d.ts.map