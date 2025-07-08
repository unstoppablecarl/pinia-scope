import { StoreFactory } from '../types';
export type ScopedContext = {
    readonly scopedId: (id: string) => string;
    readonly useStore: StoreFactory;
    readonly useStoreWithoutScope: StoreFactory;
    readonly lastStoreId: () => string | null;
    readonly clearLastStoreId: () => void;
};
export default function makeContext(scope: string): ScopedContext;
//# sourceMappingURL=makeContext.d.ts.map