# Backend - Gene Visualizations Database

This folder contains backend components for the Gene Visualizations project, including database migrations and data processing scripts.

## Structure

```
backend/
├── migrations/           # Database migration scripts
│   └── migrate_rna_seq_data.py
├── requirements.txt      # Python dependencies
└── README.md           # This file
```

## Setup

1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Ensure PostgreSQL container is running:
   ```bash
   cd ../docker
   docker compose up -d
   ```

## Running Migrations

### Migrate a specific comparison:
```bash
cd backend/migrations
python migrate_rna_seq_data.py eIF5A_DDvsWT_EC
```

### Migrate all available comparisons:
```bash
cd backend/migrations
python migrate_rna_seq_data.py
```

## Available Comparisons

The migration script automatically detects available comparisons in `../../src/graphs/`:
- eIF5A_DDvsWT_EC
- DHS_DOHHvsWT_EC
- K50A_DDvsTar4_EC
- Tar4_ECvsWT_EC
- And more...

## Database Connection

The script connects to:
- **Host**: localhost
- **Port**: 5431
- **Database**: gene_visualizations
- **User**: gene_admin
- **Password**: gene_password_2024

## Troubleshooting

- Make sure Docker container is running
- Check that CSV files exist in the expected locations
- Verify database connection settings
