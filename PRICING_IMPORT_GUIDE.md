# Pricing Data Import Guide

This guide explains how to import plan and pricing data from Excel files into the database.

## Database Structure

The database has two main tables:

### 1. Plans Table (`plans`)
Stores plan definitions with the following fields:
- `plan_id` - Unique external plan ID (Primary Key)
- `commodity_name` - Full plan name/description
- `commodity_type` - Type of eSIM (e.g., "eSIM+Optional")
- `data_amount` - Data allocation (e.g., "3GB", "1GB/Day", "unlimited")
- `duration_days` - Plan duration in days
- `total_capacity_gb` - Total data capacity in GB
- `high_speed_data` - High speed data limit
- `throttled_speed_kbps` - Speed after throttling (e.g., 128 kbps)
- `package_type` - Either "bundles" or "unlimited"
- `timing_rule` - "24 Hours" or "Natural Day"
- `matching_carrier` - Specific carrier information
- `commodity_status` - "listed" or "unlisted"

### 2. Country Pricing Table (`country_pricing`)
Links plans to countries with pricing:
- `country_id` - References the country from the `countries` table
- `plan_id` - References plan from the `plans` table
- `price_mmk` - Price in Myanmar Kyat (MMK)
- `price_usd` - Price in US Dollars (optional)
- `currency` - Currency code (default: "USD")

All prices are stored and displayed in MMK (Myanmar Kyat) currency.

## Importing Plans from Excel

### Step 1: Import Plan Definitions

First, import the plan definitions from your Excel file (e.g., `esim_plan_ids.xlsx`):

```bash
node scripts/import-plans-from-excel.js esim_plan_ids.xlsx
```

This will:
- Read all plan IDs and their specifications
- Insert unique plans into the `plans` table
- Handle package type detection automatically
- Skip duplicate plan IDs

Expected Excel columns:
- `Plan ID` - Unique plan identifier
- `Commodity Name` - Full plan name
- `Commodity Type` - eSIM type
- `Days` - Duration in days
- `Total capacity (GB)` - Total data capacity
- `High Speed Data` - High-speed data limit
- `Throttled Speed (kbps)` - Speed after limit
- `Package type` - Data Type or Day-pass Type
- `Timing Rule` - 24 Hours or Natural Day
- `Matching Carrier` - Carrier info
- `Commodity status` - listed or unlisted

### Step 2: Link Plans to Countries with Pricing

After importing plans, you need to create country_pricing records that link plans to countries with their prices.

## Importing Your Pricing Data

### Option 1: Convert Excel to CSV

1. Open your Excel file (`simless_price_list_(country).xlsx` or `simless_price_list_(region).xlsx`)
2. Export/Save As CSV format
3. Ensure the CSV has the following columns:
   - Country
   - Data (e.g., "3GB", "5GB", "unlimited")
   - Days (e.g., 5, 7, 10)
   - Price_MMK (numeric value in MMK)
   - Package_Type ("bundles" or "unlimited")

4. Save the CSV file in the project root
5. Run the import script:

```bash
node scripts/import-from-csv.js path/to/your/pricing.csv
```

### Option 2: Use the Excel Import Script

If you have the Excel files in the project root directory:

```bash
node scripts/import-pricing.js
```

This script will automatically parse Excel files named:
- `simless_price_list_(country).xlsx`
- `simless_price_list_(region).xlsx`

## Excel File Format

The Excel files should have:
- First row: Country names as column headers
- First column: Data plans in format "3GB/5Days (MMK)"
- Data cells: Prices in MMK

Example structure:
```
                 Austria    China    Japan
3GB / 5Days      15000     12000    18000
5GB / 7Days      22000     18000    28000
Unlimited/7Days  120000    100000   150000
```

## Verifying Import

After importing, you can verify the data:

```sql
SELECT c.name, cp.data_amount, cp.duration_days, cp.price_mmk
FROM country_pricing cp
JOIN countries c ON cp.country_id = c.id
ORDER BY c.name, cp.duration_days;
```

## UI Display

The updated UI now:
- Displays all prices in MMK (Myanmar Kyat) format exclusively
- Shows "Bundles" instead of "Packages"
- Supports multiple duration options (5, 7, 10, 15, 30 days)
- Automatically formats MMK prices with comma separators (e.g., "15,000")
- Hides data selection when "Unlimited" is selected

## Notes

- All existing pricing data has been cleared as requested
- All prices are stored and displayed in MMK (Myanmar Kyat) only
- Sample data includes common data bundles (3GB, 5GB, 10GB, 20GB, 30GB) and unlimited options
- Prices are displayed with proper number formatting for better readability
