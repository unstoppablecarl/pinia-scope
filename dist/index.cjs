'use strict';

var vue = require('vue');

const injectorKey = Symbol('Pinia Scope Injector Key');
const setStoreScope = (name) => {
    const instance = vue.getCurrentInstance();
    if (instance) {
        instance.__PINIA_SCOPE__ = name;
    }
    vue.provide(injectorKey, name);
};
function getStoreScope() {
    const instance = vue.getCurrentInstance();
    const injectedScope = vue.inject(injectorKey, '');
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
        useStore: wrapUseStoreWithScope(scope),
    });
}
function makeScopeId(scope) {
    return (id) => scope + '-' + id;
}

const StoreScopeProvider = vue.defineComponent({
    name: 'StoreScopeProvider',
    props: {
        scope: { type: String, required: false },
    },
    setup(props, { slots }) {
        setStoreScope(props.scope);
        return () => slots.default?.() || null;
    },
});

exports.StoreScopeProvider = StoreScopeProvider;
exports.getStoreScope = getStoreScope;
exports.getStoreWithScope = getStoreWithScope;
exports.injectorKey = injectorKey;
exports.setStoreScope = setStoreScope;
exports.useStore = useStore;
