import { getCurrentInstance, provide, onUnmounted, defineComponent, inject } from 'vue';

const scopes = new Map();
function initScope(scope, options = null) {
    const result = scopes.get(scope);
    if (result) {
        return result;
    }
    const newScope = new Scope(scope, options);
    scopes.set(scope, newScope);
    return newScope;
}
const SCOPES = {
    resetForTestingOnly() {
        [...scopes.keys()].forEach(key => scopes.delete(key));
    },
    // for testing only
    keys() {
        return [...scopes.keys()];
    },
    has(scope) {
        return !!scopes.get(scope);
    },
    init: (scope, options = null) => {
        if (scopes.has(scope) && options) {
            const usedScope = scopes.get(scope);
            if (!usedScope.optionsMatch(options)) {
                throw new Error(`Attempting to use an existing pinia scope "${scope}" with different options`);
            }
        }
        initScope(scope, options);
    },
    addStore(scope, store) {
        initScope(scope).addStore(store);
    },
    mounted(scope) {
        initScope(scope).mount();
    },
    unmounted(scope) {
        const usedScope = scopes.get(scope);
        if (!usedScope) {
            return;
        }
        usedScope.unmount();
        if (!usedScope.autoDispose) {
            return;
        }
        if (!usedScope.isUsed()) {
            usedScope.dispose();
            scopes.delete(scope);
        }
    },
    useCount(scope) {
        const result = scopes.get(scope);
        if (result) {
            return result.useCount;
        }
        return 0;
    },
    dispose(scope) {
        const result = scopes.get(scope);
        if (result) {
            result.dispose();
        }
    },
};
class Scope {
    id;
    autoDispose = true;
    stores = [];
    _useCount = 0;
    get useCount() {
        return this._useCount;
    }
    constructor(scope, options = null) {
        this.id = scope;
        if (options && 'autoDispose' in options) {
            this.autoDispose = options.autoDispose;
        }
    }
    optionsMatch(options) {
        return this.autoDispose === options.autoDispose;
    }
    addStore(store) {
        this.stores.push(store);
    }
    mount() {
        this._useCount++;
    }
    unmount() {
        this._useCount--;
    }
    isUsed() {
        return this._useCount > 0;
    }
    dispose() {
        this.stores.forEach((store) => store.$dispose());
    }
}

const injectorKey = Symbol('Pinia Scope Injector Key');

function setStoreScope(name, options = null) {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error('setStoreScope() can only be used inside setup() or functional components.');
    }
    instance.__PINIA_SCOPE__ = name;
    provide(injectorKey, name);
    if (name === '') {
        return;
    }
    SCOPES.init(name, options);
    SCOPES.mounted(name);
    onUnmounted(() => {
        SCOPES.unmounted(name);
    });
}

const PiniaScopeProvider = defineComponent({
    name: 'StoreScopeProvider',
    props: {
        scope: { type: String, required: true },
    },
    setup(props, { slots }) {
        setStoreScope(props.scope);
        return () => slots.default?.() || null;
    },
});

function getStoreScope() {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error('getStoreScope() can only be used inside setup() or functional components.');
    }
    const injectedScope = inject(injectorKey, '');
    return instance.__PINIA_SCOPE__ || injectedScope;
}

let SCOPE_NAME_GENERATOR = (scope, id) => {
    return `${scope}-${id}`;
};
function setPiniaScopeNameGenerator(scopeNameGenerator) {
    SCOPE_NAME_GENERATOR = scopeNameGenerator;
}

function makeContext(scope) {
    const useStore = (storeCreator) => {
        return getStoreWithScope(storeCreator, scope);
    };
    const useStoreWithoutScope = (storeCreator) => {
        return getStoreWithScope(storeCreator, '');
    };
    let lastStoreId = null;
    return Object.freeze({
        lastStoreId: () => lastStoreId,
        clearLastStoreId: () => lastStoreId = null,
        scopedId: (id) => {
            lastStoreId = id;
            if (scope) {
                return SCOPE_NAME_GENERATOR(scope, id);
            }
            return id;
        },
        useStore,
        useStoreWithoutScope,
    });
}

const getStoreWithScope = (storeCreator, scope, options = null) => {
    const ctx = makeContext(scope);
    const store = storeCreator(ctx);
    const storeId = ctx.lastStoreId();
    ctx.clearLastStoreId();
    if (!storeId) {
        throw new Error('Attempting to use a Pinia Scoped Store that did not call scopedId().');
    }
    const result = store();
    result.__PINIA_SCOPE__ = scope;
    result.__PINIA_SCOPE_ID__ = storeId;
    if (scope !== '') {
        SCOPES.init(scope, options);
        SCOPES.addStore(scope, result);
        if (getCurrentInstance()) {
            SCOPES.mounted(scope);
            onUnmounted(() => {
                SCOPES.unmounted(scope);
            });
        }
    }
    return result;
};

function useStore(storeCreator) {
    if (!getCurrentInstance()) {
        throw new Error('useStore() can only be used inside setup() or functional components.');
    }
    const scope = getStoreScope();
    return getStoreWithScope(storeCreator, scope);
}

const useStoreWithoutScope = (storeCreator) => {
    if (!getCurrentInstance()) {
        throw new Error('useStoreWithoutScope() can only be used inside setup() or functional components.');
    }
    return getStoreWithScope(storeCreator, '');
};

export { SCOPES, PiniaScopeProvider as StoreScopeProvider, getStoreScope, getStoreWithScope, setPiniaScopeNameGenerator, setStoreScope, useStore, useStoreWithoutScope };
