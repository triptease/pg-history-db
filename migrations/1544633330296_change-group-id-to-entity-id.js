exports.shorthands = undefined

exports.up = pgm => {
  pgm.dropTable('objects')
  pgm.createTable('objects', {
    id: {
      type: 'serial',
    },
    entity_id: {
      type: 'uuid',
      notNull: true,
    },
    user_id: {
      type: 'varchar',
      notNull: true,
    },
    timestamp: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    version: {
      type: 'integer',
      notNull: true,
    },
    data: {
      type: 'jsonb',
      notNull: true,
    },
  })
  pgm.addConstraint('objects', 'OBJECTS_PRIMARY_KEY', { primaryKey: ['entity_id', 'version'] })
}
