import { type InjectionKey } from 'vue'

export const injectorKey: InjectionKey<string> = Symbol(
  'Pinia Scope Injector Key',
)

export const instanceKey = Symbol('Pinia Scope Instance Key')
