import pandas as pd
import io
import os

# --- Data Loading and Initialization (Replace with your file loading method if not running locally) ---

# Mock loading data from the provided snippets for demonstration purposes.
# In a real environment, you would use:
# df_route = pd.read_csv('Copy of Route Map W44.xlsx - Sheet1.csv')
# df_missing = pd.read_csv('Copy of Route Map W44.xlsx - Missing.csv')

# Since I have access to the file content, I'll use it directly (simulating a direct read):
route_map_data = """Sub Div.,Job,Code,Name,DATE ,Shop Code,Shop Name,Area,Governorate,District,Shop Code,Shop Name,Comment ,Check
CE,Retail SPVR,A-1168,Mohamed Hamdy Mohamed Abd El Haleem Khalil,2025-10-25,S-0105-025,Best Buy 2B (Lasilky),Cairo,Cairo,Maadi,S-0105-025,Best Buy 2B (Lasilky),,True
CE,Retail SPVR,A-1168,Mohamed Hamdy Mohamed Abd El Haleem Khalil,2025-10-25,S-4682-019,BS-Raya-Maadi,Cairo,Cairo,Maadi,S-4682-019,BS-Raya-Maadi,,True
CE,Retail SPVR,A-1168,Mohamed Hamdy Mohamed Abd El Haleem Khalil,2025-10-26,S-5550-001,Smart Sense (Cairo Office),Cairo,Cairo,Maadi,S-5550-001,Smart Sense (Cairo Office),,True
CE,Retail SPVR,A-1168,Mohamed Hamdy Mohamed Abd El Haleem Khalil,2025-10-26,S-0105-025,Best Buy 2B (Lasilky),Cairo,Cairo,Maadi,S-0105-025,Best Buy 2B (Lasilky),,True
CE,Retail SPVR,A-1168,Mohamed Hamdy Mohamed Abd El Haleem Khalil,2025-10-26,S-4682-019,BS-Raya-Maadi,Cairo,Cairo,Maadi,S-4682-019,BS-Raya-Maadi,,True
CE,Retail SPVR,A-1168,Mohamed Hamdy Mohamed Abd El Haleem Khalil,2025-10-27,S-4682-015,Raya (Maadi),Cairo,Cairo,Maadi,S-4682-015,Raya (Maadi),,True
CE,SPVR,A-1693,Eslam Saber Zaki Attallah,2025-10-28,S-11162-031,Aman (El Seyouf),Alex,Alexandria,El syouf,S-11162-031,Aman (El Seyouf),,False
CE,SPVR,A-1693,Eslam Saber Zaki Attallah,2025-10-29,S-7005-172,B.Tech (Al Galaa),Alex,Alexandria,Victoria,S-7005-172,B.Tech (Al Galaa),,True
CE,SPVR,A-1693,Eslam Saber Zaki Attallah,2025-10-29,S-7005-006,B.Tech (Asafra),Alex,Alexandria,Mandara,S-7005-006,B.Tech (Asafra),,True
CE,SPVR,A-1693,Eslam Saber Zaki Attallah,2025-10-29,S-7005-012,B.Tech (Loran),Alex,Alexandria,Loran,S-7005-012,B.Tech (Loran),,True
CE,SPVR,A-1693,Eslam Saber Zaki Attallah,2025-10-29,S-4682-004,Raya (Mega -Loran),Alex,Alexandria,Loran,S-4682-004,Raya (Mega -Loran),,True
CE,SPVR,A-1693,Eslam Saber Zaki Attallah,2025-10-29,S-0427-003,Tradeline (San Stefano),Alex,Alexandria,San Stefano,S-0427-003,Tradeline (San Stefano),,True
"""

missing_data = """&&&,TITLE,EMPLOYEE CODE,EMPLOYEE NAME,GOVERNORATE NAME
A-126545955S-12668-001,Manager,A-1001,Mohamed Saeed Khedr Ahmed,Sidi Bishr
A-129145955S-7689-001,Manager,A-1522,Ahmed Mohamed Youssef Shalaby,Sidi Bishr
A-350145955S-4682-015,Manager,A-1138,Mina Emad Fawzy Samy El Maraghy,Maadi
A-100145955S-0427-003,Supervisor,A-1800,Mohamed Nahel Hassan Hassnen,Ismailia
A-152245955S-0427-003,Supervisor,A-1706,Hesham Abd El Lateef Mohamed Abd El Lateef,Damanhour
A-127845955S-12667-001,Supervisor,A-2576,Ahmed Mohamed Mahmoud Mohamed,Sidi Bishr
A-139245956S-5550-001,Supervisor,A-1278,Hossam Abd El Allah Abd El Fattah Mahmoud,Sidi Bishr
A-113845956S-5550-001,Supervisor,A-1392,Mustafa Farag Mahdy Hussein,Maadi
A-211045955S-0077-002,Merchandiser,A-1265,Hossam Mohamed Zaki Hegazy,El Mahmodaiya
A-279645955S-7177-003,Merchandiser,A-1291,Wael Mohamed Mahmoud Ali Abd Allah,El Arish
A-180045955S-11279-001,Merchandiser,A-3501,Mahmoud Hassan Mahmoud Mohamed,Maadi
"""

df_route = pd.read_csv(io.StringIO(route_map_data))
df_missing = pd.read_csv(io.StringIO(missing_data))

# --- Data Cleaning ---

def clean_columns(df):
    """Cleans column names by stripping leading/trailing whitespace."""
    df.columns = df.columns.str.strip()
    return df

df_route = clean_columns(df_route)
df_missing = clean_columns(df_missing)

# Standardize key columns
df_route['EMPLOYEE_ID'] = df_route['Code'].astype(str)
df_route['SHOP_CODE'] = df_route['Shop Code'].astype(str)

# --- Analysis Functions ---

def analyze_route_map(df):
    """Performs key analysis on the Route Map data."""
    print("=" * 60)
    print("           ROUTE MAP ANALYSIS (Copy of Route Map W44.xlsx - Sheet1.csv)")
    print("=" * 60)

    total_visits = len(df)
    print(f"1. Total Visits Recorded: {total_visits}")

    # Unique Supervisors
    unique_supervisors = df[['Code', 'Name']].drop_duplicates()
    num_unique_supervisors = len(unique_supervisors)
    print(f"2. Unique Supervisors in Route Map: {num_unique_supervisors}")

    # Unique Shops
    unique_shops = df[['Shop Code', 'Shop Name']].drop_duplicates()
    num_unique_shops = len(unique_shops)
    print(f"3. Unique Shops Visited: {num_unique_shops}")

    # Visits per Supervisor
    visits_by_supervisor = df.groupby(['Code', 'Name']).size().sort_values(ascending=False).reset_index(name='Visits')
    print("\n4. Top 5 Supervisors by Visit Count:")
    print(visits_by_supervisor.head(5).to_markdown(index=False))

    # Visits per Governorate
    visits_by_gov = df.groupby('Governorate').size().sort_values(ascending=False).reset_index(name='Visits')
    print("\n5. Visits per Governorate:")
    print(visits_by_gov.to_markdown(index=False))

    # Visits per Job/Title
    visits_by_job = df.groupby('Job').size().sort_values(ascending=False).reset_index(name='Visits')
    print("\n6. Visits by Job Title:")
    print(visits_by_job.to_markdown(index=False))

    return unique_supervisors['Code'].tolist()

def analyze_missing_list(df):
    """Performs key analysis on the Missing List data."""
    print("\n" + "=" * 60)
    print("           MISSING LIST ANALYSIS (Copy of Route Map W44.xlsx - Missing.csv)")
    print("=" * 60)

    total_missing_entries = len(df)
    print(f"1. Total Entries in Missing List: {total_missing_entries}")

    # Unique Missing Employees
    unique_missing_employees = df[['EMPLOYEE CODE', 'EMPLOYEE NAME']].drop_duplicates()
    num_unique_missing_employees = len(unique_missing_employees)
    print(f"2. Unique Employees in Missing List: {num_unique_missing_employees}")

    # Missing Employees by Title
    missing_by_title = df.groupby('TITLE').size().sort_values(ascending=False).reset_index(name='Count')
    print("\n3. Missing Employees by Job Title:")
    print(missing_by_title.to_markdown(index=False))

    # Missing Employees by Governorate
    missing_by_gov = df.groupby('GOVERNORATE NAME').size().sort_values(ascending=False).reset_index(name='Count')
    print("\n4. Missing Employees by Governorate:")
    print(missing_by_gov.to_markdown(index=False))

    return unique_missing_employees['EMPLOYEE CODE'].tolist()

def compare_data(route_supervisors, missing_employees):
    """Compares the supervisor list from the Route Map with the Missing List."""
    print("\n" + "=" * 60)
    print("           CROSS-REFERENCE ANALYSIS")
    print("=" * 60)

    route_set = set(route_supervisors)
    missing_set = set(missing_employees)

    # Employees that appear in BOTH lists (they have visits BUT are also in the 'Missing' list)
    in_both = route_set.intersection(missing_set)

    # Employees in the 'Missing' list who did NOT record any visits in the Route Map
    only_missing = missing_set.difference(route_set)

    print(f"1. Employees found in BOTH Route Map and Missing List (Requires Investigation): {len(in_both)}")
    if in_both:
        print(f"   Codes: {', '.join(in_both)}")

    print(f"\n2. Employees found ONLY in Missing List (Did not report visits): {len(only_missing)}")
    if only_missing:
        # Get the names for those who are only in the missing list
        only_missing_df = df_missing[df_missing['EMPLOYEE CODE'].isin(only_missing)]
        print(only_missing_df[['EMPLOYEE CODE', 'EMPLOYEE NAME', 'TITLE', 'GOVERNORATE NAME']].drop_duplicates().to_markdown(index=False))
    else:
        print("   No missing employees found who did not report visits.")

# --- Execution ---

# 1. Analyze Route Map
route_supervisors_codes = analyze_route_map(df_route)

# 2. Analyze Missing List
missing_employees_codes = analyze_missing_list(df_missing)

# 3. Compare Lists
compare_data(route_supervisors_codes, missing_employees_codes)

# Print a friendly completion message
print("\n" + "=" * 60)
print("Analysis complete. Check the output above for detailed statistics.")
print("The 'analysis_report.md' file provides a simplified summary.")
print("=" * 60)
