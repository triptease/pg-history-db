import { config } from 'dotenv'
config()

import { insert, retrieve, retrieveHistory } from './db'
import { object1, object2 } from './testdata'

describe('historyDB', () => {
  it('Can store and retrieve data', async () => {
    const createdObject1 = await insert(object1)
    expect(createdObject1.entityId.length).toBeGreaterThan(0)

    const createdObject2 = await insert(object2)
    expect(createdObject2.entityId.length).toBeGreaterThan(0)

    const retrievedObject1 = await retrieve(createdObject1.entityId)
    expect(retrievedObject1.data).toEqual(object1.data)

    const retrievedObject2 = await retrieve(createdObject2.entityId)
    expect(retrievedObject2.data).toEqual(object2.data)

    const changedObject1 = {
      ...createdObject1,
      data: {
        ...createdObject1.data,
        newProp: 'new value',
      },
    }

    const updatedObject1 = await insert(changedObject1)
    expect(updatedObject1.data.newProp).toBe('new value')
    expect(updatedObject1.version).toBe(2)

    const retrievedChangedObject1 = await retrieve(createdObject1.entityId)
    expect(retrievedChangedObject1.data).toEqual(changedObject1.data)
    expect(retrievedChangedObject1.version).toBe(2)
  })

  it('Can retrieve the history of an object', async () => {
    const createdObject = await insert(object1)

    const changedObject1 = {
      ...createdObject,
      data: {
        ...createdObject.data,
        newProp: 'initial new prop',
      },
    }
    await insert(changedObject1)

    const changedObject2 = {
      ...changedObject1,
      data: {
        ...changedObject1.data,
        newProp: 'latest new prop',
      },
    }
    await insert(changedObject2)

    const changedObject3 = {
      ...changedObject2,
      data: {
        ...changedObject2.data,
        newProp2: 'another new prop',
      },
    }
    await insert(changedObject3)

    const history = await retrieveHistory(createdObject.entityId)
    expect(history.length).toBe(4)
    expect(history.map(item => item.version)).toEqual([1, 2, 3, 4])
    expect(history.find(item => item.version === 1).data.newProp).toBe(undefined)
    expect(history.find(item => item.version === 2).data.newProp).toBe('initial new prop')
    expect(history.find(item => item.version === 3).data.newProp).toBe('latest new prop')
    expect(history.find(item => item.version === 4).data.newProp).toBe('latest new prop')
    expect(history.find(item => item.version === 4).data.newProp2).toBe('another new prop')
  })
})
