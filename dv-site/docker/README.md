# Database Setup for Gene Visualizations

This directory contains Docker configuration and database setup for the Gene Visualizations application.

## Quick Start

### 1. Start PostgreSQL Database
```bash
# From the project root
npm run db:start
```

### 2. Connect with pgAdmin 4 Desktop
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `gene_visualizations`
- **Username**: `gene_admin`
- **Password**: `gene_password_2024`

### 3. Migrate Existing Data
```bash
# Install dependencies first
npm install

# Run migration script
npm run db:migrate
```

## Database Schema

### Tables Created
- **datasets**: Stores comparison datasets (DHS_DOHHvsWT_EC, etc.)
- **genes**: Stores individual gene data with expression values
- **enrichment_data**: Stores pathway enrichment results (KEGG, Reactome, WikiPathways)
- **sessions**: Stores user analysis sessions
- **string_cache**: Caches STRING API responses

### Key Features
- Automatic timestamp updates
- JSONB columns for flexible data storage
- Proper indexing for performance
- Foreign key relationships for data integrity

## Available Commands

```bash
# Start database
npm run db:start

# Stop database
npm run db:stop

# Restart database
npm run db:restart

# View database logs
npm run db:logs

# Migrate data from JSON files
npm run db:migrate
```

## Data Migration

The migration script (`scripts/migrate-data.js`) will:
1. Read all existing JSON files from `src/graphs/` and `src/barCharts/`
2. Insert dataset metadata into the `datasets` table
3. Insert gene data into the `genes` table
4. Insert enrichment data into the `enrichment_data` table

## Troubleshooting

### Database Connection Issues
- Ensure Docker is running
- Check if port 5432 is available
- Verify container is running: `docker ps`

### Migration Issues
- Ensure all JSON files exist in expected locations
- Check database logs: `npm run db:logs`
- Verify database connection in pgAdmin

### Reset Database
```bash
# Stop and remove containers/volumes
npm run db:stop
cd docker
docker-compose down -v

# Start fresh
cd ..
npm run db:start
npm run db:migrate
```

## Next Steps

After successful migration:
1. Verify data in pgAdmin 4
2. Create backend API endpoints
3. Update frontend to use API instead of static imports
4. Implement caching layer for STRING API calls
