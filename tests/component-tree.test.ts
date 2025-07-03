import {mount} from '@vue/test-utils';
import {describe, expect, it} from 'vitest';
import {createPinia, defineStore, storeToRefs} from 'pinia';
import {getStoreWithScope, ScopedContext, setStoreScope, useStore} from "../src";
import {ref} from "vue";

const pinia = createPinia();

const DEFAULT_NAME = 'default-name'

const SCOPE_A = 'scope-a'
const SCOPE_B = 'scope-b'

const NameStore = ({scopedId, useStore}: ScopedContext) => {
  return defineStore(scopedId('name-store'), () => {
    const name = ref<string>(DEFAULT_NAME);

    function setName(nameValue: string) {
      name.value = nameValue;
    }

    return {
      name,
      setName
    };
  });
};


const Comp3 = {
  setup() {
    const nameStore = useStore(NameStore);
    const {name} = storeToRefs(nameStore);
    return {
      name
    }
  },
  template: `
    Comp3:[{{name}}]
  `
}
const Comp2 = {
  components: {
    Comp3
  },
  setup() {
    const nameStore = useStore(NameStore);
    const {name} = storeToRefs(nameStore);
    return {
      nameStore,
      name
    }
  },
  template: `
    Comp2:[{{nameStore.name}}]
    <Comp3 ref="comp3"/>
  `
}

const Comp1 = {
  components: {
    Comp2
  },
  props: {
    storeScope: String,
  },
  setup(props: { storeScope: string }) {
    setStoreScope(props.storeScope);
    const nameStore = useStore(NameStore);
    const {name} = storeToRefs(nameStore);
    return {
      nameStore,
      name
    }
  },
  template: `
    Comp1:[{{name}}]
    <Comp2 ref="comp2"/>
  `
}

const App = {
  components: {
    Comp1
  },
  setup() {

  },
  template: `
    <div>
      <Comp1 store-scope="${SCOPE_A}" ref="comp1-a"/>
      <Comp1 store-scope="${SCOPE_B}" ref="comp1-b"/>
    </div>`
};

describe('setStoreScope', () => {
  it('can keep separate scoped component trees', async () => {

    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    });
    expect(wrapper.findComponent(Comp1).html()).toContain(`Comp1:[${DEFAULT_NAME}]`)
    expect(wrapper.findComponent(Comp2).html()).toContain(`Comp2:[${DEFAULT_NAME}]`)
    expect(wrapper.findComponent(Comp3).html()).toContain(`Comp3:[${DEFAULT_NAME}]`)

    const newName = 'bobby'
    const storeA = getStoreWithScope(NameStore, SCOPE_A);
    storeA.setName(newName);

    await wrapper.vm.$nextTick();

    const caseAComp1 = wrapper.findComponent({ref: 'comp1-a'});

    expect(caseAComp1.exists()).toBe(true)
    expect(caseAComp1.html()).toContain(`Comp1:[${newName}]`)
    expect(caseAComp1.html()).toContain(`Comp2:[${newName}]`)
    expect(caseAComp1.html()).toContain(`Comp3:[${newName}]`)

    const caseAComp2 = caseAComp1.findComponent({ref: 'comp2'});
    expect(caseAComp2.exists()).toBe(true)
    expect(caseAComp2.html()).toContain(`Comp2:[${newName}]`)
    expect(caseAComp2.html()).toContain(`Comp3:[${newName}]`)

    const caseAComp3 = caseAComp2.findComponent({ref: 'comp3'});
    expect(caseAComp3.exists()).toBe(true)
    expect(caseAComp3.html()).toContain(`Comp3:[${newName}]`)

    const caseBComp1 = wrapper.findComponent({ref: 'comp1-b'});

    expect(caseBComp1.exists()).toBe(true)
    expect(caseBComp1.html()).toContain(`Comp1:[${DEFAULT_NAME}]`)
    expect(caseBComp1.html()).toContain(`Comp2:[${DEFAULT_NAME}]`)
    expect(caseBComp1.html()).toContain(`Comp3:[${DEFAULT_NAME}]`)

    const caseBComp2 = caseBComp1.findComponent({ref: 'comp2'});
    expect(caseBComp2.exists()).toBe(true)
    expect(caseBComp2.html()).toContain(`Comp2:[${DEFAULT_NAME}]`)
    expect(caseBComp2.html()).toContain(`Comp3:[${DEFAULT_NAME}]`)

    const caseBComp3 = caseBComp2.findComponent({ref: 'comp3'});
    expect(caseBComp3.exists()).toBe(true)
    expect(caseBComp3.html()).toContain(`Comp3:[${DEFAULT_NAME}]`)
  })
});
