type NominatimResult = {
  lat: string;
  lon: string;
  geojson?: { type: string; coordinates: unknown };
  boundingbox?: [string, string, string, string];
};

type GeocodeResult = {
  latitude: number;
  longitude: number;
  serviceAreaWkt: string | null;
};

function geojsonToWkt(geojson: { type: string; coordinates: unknown }) {
  if (geojson.type === "Polygon") {
    const rings = geojson.coordinates as number[][][];
    const ringText = rings
      .map((ring) => ring.map(([x, y]) => `${x} ${y}`).join(", "))
      .map((ring) => `(${ring})`)
      .join(", ");
    return `POLYGON(${ringText})`;
  }
  if (geojson.type === "MultiPolygon") {
    const polys = geojson.coordinates as number[][][][];
    const polyText = polys
      .map((rings) =>
        rings
          .map((ring) => ring.map(([x, y]) => `${x} ${y}`).join(", "))
          .map((ring) => `(${ring})`)
          .join(", ")
      )
      .map((poly) => `(${poly})`)
      .join(", ");
    return `MULTIPOLYGON(${polyText})`;
  }
  return null;
}

function bboxToPolygonWkt(boundingbox: [string, string, string, string]) {
  const [south, north, west, east] = boundingbox.map(Number);
  const ring = [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south],
  ];
  const ringText = ring.map(([x, y]) => `${x} ${y}`).join(", ");
  return `POLYGON((${ringText}))`;
}

export async function geocodeAddress(
  query: string,
  userAgent: string,
): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("polygon_geojson", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");

  const geoRes = await fetch(url.toString(), {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/json",
    },
  });

  if (!geoRes.ok) return null;

  const results = (await geoRes.json()) as NominatimResult[];
  const match = results?.[0];
  if (!match?.lat || !match?.lon) return null;

  const latitude = Number(match.lat);
  const longitude = Number(match.lon);

  let serviceAreaWkt: string | null = null;
  if (match.geojson && (match.geojson.type === "Polygon" || match.geojson.type === "MultiPolygon")) {
    serviceAreaWkt = geojsonToWkt(match.geojson);
  } else if (match.boundingbox?.length === 4) {
    serviceAreaWkt = bboxToPolygonWkt(match.boundingbox);
  }

  return { latitude, longitude, serviceAreaWkt };
}
