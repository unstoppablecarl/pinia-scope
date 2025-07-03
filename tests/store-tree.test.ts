import {mount} from '@vue/test-utils';
import {describe, expect, it} from 'vitest';
import {createPinia} from 'pinia';
import CompChild1 from './use/CompChild1.vue';

describe('useProvideStores', () => {
  it('can keep separate scoped store trees', async () => {
    const pinia = createPinia();

    const nameA = 'Allison';
    const nameAChild1 = 'Lee';
    const nameAChild2 = 'Smith';

    const nameB = 'Jimmy';
    const nameBChild1 = 'Wong';
    const nameBChild2 = 'Johnson';

    const App = {
      components: {
        CompChild1
      },
      props: {
        nameA: String,
        nameAChild1: String,
        nameAChild2: String,
        nameB: String,
        nameBChild1: String,
        nameBChild2: String,
      },
      template: `
        <div>
          <CompChild1 store-scope="scope-a" :name="nameA" :name-child1="nameAChild1" :name-child2="nameAChild2"/>
          <CompChild1 store-scope="scope-b" :name="nameB" :name-child1="nameBChild1" :name-child2="nameBChild2"/>
        </div>`
    };

    const wrapper = mount(App, {
      props: {
        nameA,
        nameAChild1,
        nameAChild2,

        nameB,
        nameBChild1,
        nameBChild2,
      },
      global: {
        plugins: [pinia]
      }
    });

    expect(wrapper.find('.comp-child-1-scope-a .comp-child-1-case1').text()).toContain('CompChild1: scope-a');
    expect(wrapper.find('.comp-child-1-scope-a .comp-child-1-case2').text()).toContain(`CompChild1:[nameStore.name = ${nameA}]`);
    expect(wrapper.find('.comp-child-1-scope-a .comp-child-1-case3').text()).toContain(`CompChild1:[child1NameStore.child1Name = from-name-store: ${nameAChild1}]`);
    expect(wrapper.find('.comp-child-1-scope-a .comp-child-1-case4').text()).toContain(`CompChild1:[child2NameStore.child2Name = from-child1-store: from-name-store: ${nameAChild2}]`);

    expect(wrapper.find('.comp-child-1-scope-a .comp-child-2 .comp-child-2-case1').text()).toContain('CompChild2: scope-a');
    expect(wrapper.find('.comp-child-1-scope-a .comp-child-2 .comp-child-2-case2').text()).toContain(`CompChild2:[nameStore.name = ${nameA}]`);
    expect(wrapper.find('.comp-child-1-scope-a .comp-child-2 .comp-child-2-case3').text()).toContain(`CompChild2:[child1NameStore.child1Name = from-name-store: ${nameAChild1}]`);
    expect(wrapper.find('.comp-child-1-scope-a .comp-child-2 .comp-child-2-case4').text()).toContain(`CompChild2:[child2NameStore.child2Name = from-child1-store: from-name-store: ${nameAChild2}]`);

    expect(wrapper.find('.comp-child-1-scope-b .comp-child-1-case1').text()).toContain('CompChild1: scope-b');
    expect(wrapper.find('.comp-child-1-scope-b .comp-child-1-case2').text()).toContain(`CompChild1:[nameStore.name = ${nameB}]`);
    expect(wrapper.find('.comp-child-1-scope-b .comp-child-1-case3').text()).toContain(`CompChild1:[child1NameStore.child1Name = from-name-store: ${nameBChild1}]`);
    expect(wrapper.find('.comp-child-1-scope-b .comp-child-1-case4').text()).toContain(`CompChild1:[child2NameStore.child2Name = from-child1-store: from-name-store: ${nameBChild2}]`);

    expect(wrapper.find('.comp-child-1-scope-b .comp-child-2 .comp-child-2-case1').text()).toContain('CompChild2: scope-b');
    expect(wrapper.find('.comp-child-1-scope-b .comp-child-2 .comp-child-2-case2').text()).toContain(`CompChild2:[nameStore.name = ${nameB}]`);
    expect(wrapper.find('.comp-child-1-scope-b .comp-child-2 .comp-child-2-case3').text()).toContain(`CompChild2:[child1NameStore.child1Name = from-name-store: ${nameBChild1}]`);
    expect(wrapper.find('.comp-child-1-scope-b .comp-child-2 .comp-child-2-case4').text()).toContain(`CompChild2:[child2NameStore.child2Name = from-child1-store: from-name-store: ${nameBChild2}]`);

  });
});
