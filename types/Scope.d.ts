import { Store } from 'pinia';
export declare const SCOPES: {
    resetForTestingOnly(): void;
    keys(): string[];
    has(scope: string): boolean;
    init: (scope: string, options?: ScopeOptions | null) => void;
    addStore(scope: string, store: Store): void;
    mounted(scope: string): void;
    unmounted(scope: string): void;
    useCount(scope: string): number;
    dispose(scope: string): void;
};
export type ScopeOptions = {
    autoDispose: boolean;
};
//# sourceMappingURL=Scope.d.ts.map