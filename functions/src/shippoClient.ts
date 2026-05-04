export interface ShippoAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface ShippoParcel {
  length: string;
  width: string;
  height: string;
  distance_unit: string;
  weight: string;
  mass_unit: string;
}

export interface ShippoRate {
  object_id: string;
  amount: string;
  provider: string;
  servicelevel: {name: string; token: string};
  estimated_days?: number;
}

export interface ShippoShipmentResponse {
  object_id: string;
  rates: ShippoRate[];
}

export interface ShippoTransactionResponse {
  object_state: string;
  label_url: string;
  tracking_number: string;
  tracking_url_provider: string;
  messages?: Array<{text: string}>;
}

export interface ShippingTierRate {
  amountCents: number;
  serviceLevel: string;
}

export interface ShippingRateOptions {
  standard: ShippingTierRate;
  priority: ShippingTierRate;
}

export async function shippoPost<T>(
  apiKey: string,
  path: string,
  body: unknown
): Promise<T> {
  const response = await fetch(`https://api.goshippo.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shippo API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

const STANDARD_KEYWORDS = ["ground", "parcel", "first class", "media"];
const PRIORITY_KEYWORDS = ["priority mail"];

/**
 * Fetch USPS rate estimates from Shippo for the given parcel.
 * Falls back to weight-based estimates if Shippo is unavailable or returns no usable rates.
 */
export async function getShippingRateOptions(
  apiKey: string,
  addressFrom: ShippoAddress,
  addressTo: ShippoAddress,
  parcel: ShippoParcel
): Promise<ShippingRateOptions> {
  const shipment = await shippoPost<ShippoShipmentResponse>(apiKey, "/shipments/", {
    address_from: addressFrom,
    address_to: addressTo,
    parcels: [parcel],
    async: false,
  });

  const uspsRates = shipment.rates.filter(
    (r) => r.provider.toUpperCase() === "USPS"
  );

  const standardRate = uspsRates
    .filter((r) =>
      STANDARD_KEYWORDS.some((k) => r.servicelevel.name.toLowerCase().includes(k))
    )
    .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0];

  const priorityRate = uspsRates
    .filter((r) =>
      PRIORITY_KEYWORDS.some((k) => r.servicelevel.name.toLowerCase().includes(k))
    )
    .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0];

  const weightLb = parseFloat(parcel.weight);

  return {
    standard: standardRate
      ? {
          amountCents: Math.round(parseFloat(standardRate.amount) * 100),
          serviceLevel: standardRate.servicelevel.name,
        }
      : fallbackStandard(weightLb),
    priority: priorityRate
      ? {
          amountCents: Math.round(parseFloat(priorityRate.amount) * 100),
          serviceLevel: priorityRate.servicelevel.name,
        }
      : fallbackPriority(weightLb),
  };
}

export interface ShippoSuggestedAddress {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface ShippoAddressValidation {
  isValid: boolean;
  messages: Array<{text: string; type: string; code?: string; source?: string}>;
  suggested?: ShippoSuggestedAddress;
}

export async function shippoValidateAddress(
  apiKey: string,
  address: ShippoAddress
): Promise<ShippoAddressValidation> {
  const body: Record<string, unknown> = {
    name: address.name,
    street1: address.street1,
    city: address.city,
    state: address.state,
    zip: address.zip,
    country: address.country,
    validate: true,
  };
  if (address.street2) body.street2 = address.street2;

  const response = await fetch("https://api.goshippo.com/addresses/", {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shippo validation error ${response.status}: ${text}`);
  }

  const data = await response.json() as {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
    validation_results?: {
      is_valid: boolean;
      messages?: Array<{text: string; type: string; code?: string; source?: string}>;
    };
  };

  // Shippo returns USPS-standardized address fields at the top level
  const suggested: ShippoSuggestedAddress | undefined =
    data.street1 && data.city && data.state && data.zip
      ? {
          street1: data.street1,
          ...(data.street2 ? {street2: data.street2} : {}),
          city: data.city,
          state: data.state,
          zip: data.zip,
        }
      : undefined;

  return {
    isValid: data.validation_results?.is_valid ?? false,
    messages: data.validation_results?.messages ?? [],
    suggested,
  };
}

// Weight-based fallback rates (USPS commercial approximations, zone 4-5)
function fallbackStandard(weightLb: number): ShippingTierRate {
  let amountCents: number;
  if (weightLb <= 1) amountCents = 595;
  else if (weightLb <= 2) amountCents = 795;
  else if (weightLb <= 5) amountCents = 1095;
  else amountCents = 1495;
  return {amountCents, serviceLevel: "USPS Ground Advantage"};
}

function fallbackPriority(weightLb: number): ShippingTierRate {
  let amountCents: number;
  if (weightLb <= 1) amountCents = 995;
  else if (weightLb <= 3) amountCents = 1295;
  else amountCents = 1595;
  return {amountCents, serviceLevel: "USPS Priority Mail"};
}
