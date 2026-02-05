create extension if not exists postgis;

alter table public.center_coordinates
  add column if not exists geom geometry(Point, 4326),
  add column if not exists service_area geometry(Polygon, 4326);

-- Backfill geometry from existing lat/lon
update public.center_coordinates
set geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
where geom is null
  and longitude is not null
  and latitude is not null;

create or replace view public.center_coordinates_geo as
select
  id,
  latitude,
  longitude,
  source,
  created_at,
  geom,
  service_area,
  ST_AsGeoJSON(geom)::json as geom_geojson,
  ST_AsGeoJSON(service_area)::json as service_area_geojson
from public.center_coordinates;
