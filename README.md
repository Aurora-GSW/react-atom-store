# react-atom-store

> A lightweight react state storage repository, only two api, directly out of the box.

react-atom-store can help you solve the usual development of cross-component communication cumbersome data transfer problems, global data sharing problems, each repository is independent.



## Installation

```
npm i react-atom-store

yarn add react-atom-store

pnpm i react-atom-store
```



## Usage

**create a store**

```ts
// src/store.ts

import { createStore } from 'react-atom-store'

export const infoStore = createStore({
	name:'ysy',
	age:18
})
```

**use in components**

ComA triggers a re-rendering when the component ComB modifies the infoStore's data

```tsx
import { useStore } from 'react-atom-store'
import { infoStore } from '...src/store.ts'

function ComA (){
	const [store,updateStore] = useStore(infoStore)
    return <div>{store.name}</div>
}

function ComB (){
	const [store,updateStore] = useStore(infoStore)
    const update = ()=>{
        updateStore({
            name:'abc',
            age:19
        })
        // or
        updateStore(state=>({
            name:'abc',
            age:19
        }))
    }
    return <div onClick={update})>updateData</div>
}
```



### piker

**useStore(state,piker?)**

> The second parameter of useStore supports the selection of attributes to be used, and will be re-rendered only when the selected attributes are changed, and will not be triggered when other attributes of the store are changed, which of course means that you can only modify the attributes you have selected to use, and will be ignored when modifying other attributes.

The above code will have performance problems because ComA only uses the name attribute inside the infoStore, and when ComB modifies any attribute inside the infoStore, ComA will re-render it, which is obviously inappropriate.

Optimized CompA

```tsx
function ComA (){
	const [store,updateStore] = useStore(infoStore,state=>({
		name:state.name
	}))
    return <div>{store.name}</div>
}
```



The name attribute was modified successfully, but the attribute age was not modified because age is not in the range you are using

```tsx
function ComC (){
	const [store,updateStore] = useStore(infoStore,state=>({
		name:state.name
	}))
    const update = ()=>{
        updateStore(state=>({
            name:'xxx',
            age:20
        }))
    }
    return <div onClick={update})>updateData</div>
}
```

