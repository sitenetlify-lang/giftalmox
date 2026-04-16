create extension if not exists pgcrypto;

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  system_name text not null,
  logo_url text,
  primary_color text not null,
  secondary_color text not null,
  admin_password text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  category text not null,
  subcategory text,
  unit text not null,
  current_stock numeric not null default 0,
  min_stock numeric not null default 0,
  max_stock numeric not null default 0,
  location text,
  supplier text,
  unit_cost numeric not null default 0,
  status text not null default 'Ativo',
  barcode text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stock_entries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  product_name text,
  product_code text,
  quantity numeric not null,
  supplier text,
  invoice_number text,
  received_by text,
  unit_cost numeric not null default 0,
  total_cost numeric not null default 0,
  notes text,
  entry_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stock_exits (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  product_name text,
  product_code text,
  quantity numeric not null,
  department text,
  responsible text,
  reason text,
  cost_center text,
  notes text,
  exit_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  product_name text,
  product_code text,
  type text not null,
  origin text,
  destination text,
  quantity numeric not null,
  responsible text,
  notes text,
  movement_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inventory_checks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  product_name text,
  product_code text,
  system_quantity numeric not null default 0,
  physical_quantity numeric not null default 0,
  difference numeric not null default 0,
  adjusted boolean not null default false,
  responsible text,
  notes text,
  check_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists settings_updated_at on settings;
create trigger settings_updated_at before update on settings for each row execute procedure set_updated_at();
drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products for each row execute procedure set_updated_at();
drop trigger if exists stock_entries_updated_at on stock_entries;
create trigger stock_entries_updated_at before update on stock_entries for each row execute procedure set_updated_at();
drop trigger if exists stock_exits_updated_at on stock_exits;
create trigger stock_exits_updated_at before update on stock_exits for each row execute procedure set_updated_at();
drop trigger if exists stock_movements_updated_at on stock_movements;
create trigger stock_movements_updated_at before update on stock_movements for each row execute procedure set_updated_at();
drop trigger if exists inventory_checks_updated_at on inventory_checks;
create trigger inventory_checks_updated_at before update on inventory_checks for each row execute procedure set_updated_at();
