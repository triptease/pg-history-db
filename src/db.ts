import { Client } from 'pg'
import uuid from 'uuid'

const INSERT_QUERY = `
  INSERT INTO objects
  (group_id, user_id, version, data)
  values
  ($1, $2, $3, $4)
`
const UPDATE_QUERY = `
  INSERT INTO objects
  (group_id, user_id, version, data)
  values
  ($1, $2, (
    SELECT max(version)+1
    FROM objects
    WHERE group_id=$1
  ), $3)
`
export const insert = async (body: any): Promise<any> => {
  try {
    const client = new Client()
    await client.connect()
    const groupId = body.id || uuid.v4()
    if (body.id) {
      await client.query(UPDATE_QUERY, [groupId, body.userId, body.data])
    } else {
      const version = 1
      await client.query(INSERT_QUERY, [groupId, body.userId, version, body.data])
    }
    await client.end()
    return await retrieve(groupId)
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}

const RETRIEVE_QUERY = `
  SELECT *
  FROM objects
  WHERE group_id=$1
    AND version=(
      SELECT max(version)
      FROM objects
      WHERE group_id=$1
    )
`
export const retrieve = async (id: string): Promise<any> => {
  try {
    const client = new Client()
    await client.connect()
    const result = await client.query(RETRIEVE_QUERY, [id])
    await client.end()
    return {
      id: result.rows[0].group_id,
      userId: result.rows[0].user_id,
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version,
      data: result.rows[0].data,
    }
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}

const RETRIEVE_HISTORY_QUERY = `
  SELECT *
  FROM objects
  WHERE group_id=$1
  ORDER BY version ASC
`
export const retrieveHistory = async (id: string): Promise<any> => {
  try {
    const client = new Client()
    await client.connect()
    const result = await client.query(RETRIEVE_HISTORY_QUERY, [id])
    await client.end()
    const objects = result.rows.map(row => ({
      id: row.group_id,
      userId: row.user_id,
      timestamp: row.timestamp,
      version: row.version,
      data: row.data,
    }))
    return objects
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}
