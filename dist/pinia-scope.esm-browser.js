import { getCurrentInstance, provide, inject, defineComponent } from 'vue';

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
    const injectedScope = inject(injectorKey, '');
    return instance?.__PINIA_SCOPE__ || injectedScope;
}
const useStore = (storeCreator) => {
    const scope = getStoreScope();
    return getStoreWithScope(storeCreator, scope);
};
const getStoreWithScope = (storeCreator, scope = '') => {
    const ctx = makeContext(scope);
    const store = storeCreator(ctx);
    return store();
};
function wrapUseStoreWithScope(scope) {
    const useStoreScoped = (storeCreator) => {
        const ctx = makeContext(scope);
        const store = storeCreator(ctx);
        return store();
    };
    return useStoreScoped;
}
function makeContext(scope) {
    return Object.freeze({
        scopedId: makeScopeId(scope),
        useStore: wrapUseStoreWithScope(scope)
    });
}
function makeScopeId(scope) {
    return (id) => scope + '-' + id;
}

const StoreScopeProvider = defineComponent({
    name: 'StoreScopeProvider',
    props: {
        scope: { type: String, required: false }
    },
    setup(props, { slots }) {
        setStoreScope(props.scope);
        return () => slots.default?.() || null;
    }
});

export { StoreScopeProvider, getStoreScope, getStoreWithScope, injectorKey, setStoreScope, useStore };
