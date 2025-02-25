export interface AlamosFE2Config {
  url: string;
  authorization: string;
  sender: string;
}

interface FE2Location {
  coordinate: [number, number];
  building?: string;
  building_id?: string;
  crossing?: string;
  street: string;
  house: string;
  additional?: string;
  postalCode?: string;
  city: string;
  city_abbr?: string;
}

interface FE2Unit {
  address: string;
}

export interface AlamosFE2Alarm {
  type: 'ALARM';
  timestamp: string;
  sender: string;
  authorization: string;
  data: {
    externalId: string;
    keyword: string;
    keyword_description: string;
    keyword_misc?: string;
    message: string[];
    location: FE2Location;
    units: FE2Unit[];
    custom?: {
      remark?: string;
    };
  };
}
