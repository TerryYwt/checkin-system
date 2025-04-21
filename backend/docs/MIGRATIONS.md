# Database Migrations Guide

## Overview

This project uses Sequelize CLI for database migrations. Migrations allow you to:
- Version control your database schema
- Make schema changes consistently across all environments
- Roll back changes if needed
- Maintain data integrity during updates

## Directory Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── migrations/    # Migration files
│   │   └── seeders/      # Seed data files
│   ├── config/
│   │   └── database.js   # Database configuration
│   └── models/           # Sequelize models
└── .sequelizerc          # Sequelize CLI configuration
```

## Available Commands

```bash
# Migration Commands
npm run db:migrate           # Run pending migrations
npm run db:migrate:undo      # Undo the last migration
npm run db:migrate:undo:all  # Undo all migrations

# Seeder Commands
npm run db:seed:all         # Run all seeders
npm run db:seed:undo:all    # Undo all seeders

# Utility Commands
npm run db:reset           # Reset database (undo all, migrate, seed)
```

## Migration Files

### Location
All migration files are stored in `src/database/migrations/`. Each file is timestamped and named descriptively.

### Current Migrations

1. `20240417000000-create-all-tables.js`
   - Creates all initial database tables
   - Tables created in order to handle foreign key dependencies:
     1. Users
     2. Merchants
     3. Stores
     4. Campaigns
     5. QR Codes
     6. Checkins
     7. Settings

### Creating New Migrations

To create a new migration:

```bash
npx sequelize-cli migration:generate --name your-migration-name
```

Migration file template:
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Changes to make
  },

  down: async (queryInterface, Sequelize) => {
    // How to undo the changes
  }
};
```

## Seeders

### Location
Seed files are stored in `src/database/seeders/`.

### Current Seeders

1. `20240417000000-admin-user.js`
   - Creates initial admin user
   - Credentials:
     - Username: testadmin
     - Email: admin@test.com
     - Password: Test@123

### Creating New Seeders

```bash
npx sequelize-cli seed:generate --name your-seeder-name
```

## Best Practices

1. **Migration Files**
   - Never modify existing migration files that have been run
   - Create new migrations for changes
   - Always implement both `up` and `down` methods
   - Test migrations in development first

2. **Naming Conventions**
   - Use snake_case for database columns
   - Use descriptive names for migrations
   - Include timestamp in migration names

3. **Foreign Keys**
   - Consider ON DELETE and ON UPDATE behaviors
   - Use appropriate constraints (CASCADE, SET NULL, etc.)
   - Maintain referential integrity

4. **Data Safety**
   - Backup data before running migrations in production
   - Test migrations on a copy of production data
   - Use transactions where appropriate

## Environment-Specific Behavior

- **Development**
  - Migrations can be run manually
  - Seeds can be used to populate test data
  - Safe to use db:reset for clean slate

- **Production**
  - Never use auto-sync or force sync
  - Run migrations during deployment
  - Backup database before migrations
  - Test migrations in staging first

## Troubleshooting

Common issues and solutions:

1. **Migration Failed**
   - Check the error message
   - Verify foreign key references
   - Ensure correct column types
   - Check for existing data constraints

2. **Undo Failed**
   - Make sure down migrations are implemented
   - Check for dependent data
   - May need to handle constraints manually

3. **Seed Failed**
   - Verify data format matches schema
   - Check unique constraints
   - Ensure referenced IDs exist

## Example: Adding a New Field

```javascript
// migrations/YYYYMMDDHHMMSS-add-field-to-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TableName', 'new_field', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TableName', 'new_field');
  }
};
``` 