import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPiniaScopes, SCOPES } from '../../src/Scope';
import { createPinia, setActivePinia } from 'pinia';
import { makeStore } from '../helpers/test-stores';

const SCOPE_A = 'scope-a';
const SCOPE_B = 'scope-b';
const SCOPE_C = 'scope-c';

describe('SCOPES', async () => {
	const pinia = createPinia();

	beforeEach(() => {
		setActivePinia(pinia);
	});

	it('is accessible via function in built package', async () => {
		expect(getPiniaScopes()).toBe(SCOPES);
	});

	it('tracks multiple scopes', async () => {
		const storeA1 = makeStore('store-A1');
		const storeA2 = makeStore('store-A2');
		const storeA1DisposeSpy = vi.spyOn(storeA1, '$dispose');
		const storeA2DisposeSpy = vi.spyOn(storeA2, '$dispose');

		const storeB1 = makeStore('store-B1');
		const storeB2 = makeStore('store-B2');
		const storeB1DisposeSpy = vi.spyOn(storeB1, '$dispose');
		const storeB2DisposeSpy = vi.spyOn(storeB2, '$dispose');

		expect(SCOPES.useCount(SCOPE_A)).toBe(0);
		expect(SCOPES.useCount(SCOPE_B)).toBe(0);

		SCOPES.addStore(SCOPE_A, storeA1);
		SCOPES.addStore(SCOPE_A, storeA2);

		SCOPES.addStore(SCOPE_B, storeB1);
		SCOPES.addStore(SCOPE_B, storeB2);

		SCOPES.mounted(SCOPE_A);
		SCOPES.mounted(SCOPE_A);

		SCOPES.mounted(SCOPE_B);

		expect(storeA1DisposeSpy).toHaveBeenCalledTimes(0);
		expect(storeA2DisposeSpy).toHaveBeenCalledTimes(0);

		expect(storeB1DisposeSpy).toHaveBeenCalledTimes(0);
		expect(storeB2DisposeSpy).toHaveBeenCalledTimes(0);

		SCOPES.unmounted(SCOPE_A);
		SCOPES.unmounted(SCOPE_A);

		expect(storeA1DisposeSpy).toHaveBeenCalledOnce();
		expect(storeA2DisposeSpy).toHaveBeenCalledOnce();

		expect(storeB1DisposeSpy).toHaveBeenCalledTimes(0);
		expect(storeB2DisposeSpy).toHaveBeenCalledTimes(0);

		expect(SCOPES.has(SCOPE_A)).toBe(false);
		expect(SCOPES.has(SCOPE_B)).toBe(true);

	});

	it('disposes of stores when autoDispose is default', async () => {
		const store1 = makeStore('store-1');
		const store2 = makeStore('store-2');
		const store1DisposeSpy = vi.spyOn(store1, '$dispose');
		const store2DisposeSpy = vi.spyOn(store2, '$dispose');

		SCOPES.addStore(SCOPE_A, store1);
		SCOPES.addStore(SCOPE_A, store2);

		SCOPES.mounted(SCOPE_A);
		SCOPES.mounted(SCOPE_A);
		SCOPES.unmounted(SCOPE_A);
		SCOPES.unmounted(SCOPE_A);

		expect(SCOPES.has(SCOPE_A)).toBe(false);

		expect(store1DisposeSpy).toHaveBeenCalledOnce();
		expect(store2DisposeSpy).toHaveBeenCalledOnce();
	});

	it('disposes of stores when autoDispose = true', async () => {
		const store1 = makeStore('store-1');
		const store2 = makeStore('store-2');
		const store1DisposeSpy = vi.spyOn(store1, '$dispose');
		const store2DisposeSpy = vi.spyOn(store2, '$dispose');

		SCOPES.init(SCOPE_A, { autoDispose: true });
		SCOPES.addStore(SCOPE_A, store1);
		SCOPES.addStore(SCOPE_A, store2);

		SCOPES.mounted(SCOPE_A);
		SCOPES.mounted(SCOPE_A);
		SCOPES.unmounted(SCOPE_A);
		SCOPES.unmounted(SCOPE_A);

		expect(SCOPES.has(SCOPE_A)).toBe(false);

		expect(store1DisposeSpy).toHaveBeenCalledOnce();
		expect(store2DisposeSpy).toHaveBeenCalledOnce();
	});

	it('does not dispose of stores until SCOPES.dispose() is called when autoDispose = false', async () => {
		const storeA1 = makeStore('store-A1');
		const storeA2 = makeStore('store-A2');

		const storeA1DisposeSpy = vi.spyOn(storeA1, '$dispose');
		const storeA2DisposeSpy = vi.spyOn(storeA2, '$dispose');

		SCOPES.init(SCOPE_A, { autoDispose: false });

		SCOPES.addStore(SCOPE_A, storeA1);
		SCOPES.addStore(SCOPE_A, storeA2);

		SCOPES.mounted(SCOPE_A);
		SCOPES.mounted(SCOPE_A);
		SCOPES.unmounted(SCOPE_A);
		SCOPES.unmounted(SCOPE_A);

		expect(SCOPES.has(SCOPE_A)).toBe(true);

		expect(storeA1DisposeSpy).toHaveBeenCalledTimes(0);
		expect(storeA2DisposeSpy).toHaveBeenCalledTimes(0);

		SCOPES.dispose(SCOPE_A);

		expect(storeA1DisposeSpy).toHaveBeenCalledOnce();
		expect(storeA2DisposeSpy).toHaveBeenCalledOnce();
	});

	it('when unmounted prematurely', async () => {
		SCOPES.unmounted(SCOPE_A);
	});

	it('allows a scope to be initialized a second time with the same options', async () => {
		SCOPES.init(SCOPE_A, { autoDispose: true });
		SCOPES.init(SCOPE_A, { autoDispose: true });

		SCOPES.init(SCOPE_B);
		SCOPES.init(SCOPE_B, { autoDispose: true });

		SCOPES.init(SCOPE_C, { autoDispose: false });
		SCOPES.init(SCOPE_C, { autoDispose: false });
	});

	it('throws an error if a scope is initialized a second time with different options', async () => {
		SCOPES.init(SCOPE_A, { autoDispose: true });

		expect(() => {
			SCOPES.init(SCOPE_A, { autoDispose: false });
		}).toThrowError(`Attempting to use an existing pinia scope "${SCOPE_A}" with different options`);
	});
});
