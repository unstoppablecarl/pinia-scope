import { getCurrentInstance, provide, inject, defineComponent } from 'vue';

let SCOPE_NAME_GENERATOR = (scope, id) => {
    return `${scope}-${id}`;
};
function makeScopeId(scope) {
    return (id) => {
        if (scope) {
            return SCOPE_NAME_GENERATOR(scope, id);
        }
        return id;
    };
}

const injectorKey = Symbol('Pinia Scope Injector Key');
const setStoreScope = (name) => {
    const instance = getCurrentInstance();
    if (instance) {
        instance.__PINIA_SCOPE__ = name;
    }
    provide(injectorKey, name);
};
function getStoreScope() {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error('getStoreScope() can only be used inside setup() or functional components.');
    }
    const injectedScope = inject(injectorKey, '');
    return instance?.__PINIA_SCOPE__ || injectedScope;
}
const useStore = (storeCreator) => {
    if (!getCurrentInstance()) {
        throw new Error('useStore() can only be used inside setup() or functional components.');
    }
    const scope = getStoreScope();
    return getStoreWithScope(storeCreator, scope);
};
const getStoreWithScope = (storeCreator, scope = '') => {
    const ctx = makeContext(scope);
    const store = storeCreator(ctx);
    return store();
};
function makeContext(scope) {
    const useStoreScoped = (storeCreator) => {
        return getStoreWithScope(storeCreator, scope);
    };
    return Object.freeze({
        scopedId: makeScopeId(scope),
        useStore: useStoreScoped,
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

export { PiniaScopeProvider as StoreScopeProvider, getStoreScope, getStoreWithScope, injectorKey, setStoreScope, useStore };
