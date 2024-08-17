export interface MediaInfo {
  type: 'mediainfo';
  id: string;
  labels: unknown[];
  descriptions: unknown[];
  statements: Record<string, Statement[]>;
}

export interface Statement {
  type: 'statement';
  mainsnak: Mainsnak;
  id: string;
  rank: string;
  qualifiers: Record<string, Mainsnak[]>;
}

export interface Mainsnak {
  snaktype: 'value' | 'somevalue';
  property: string;
  hash: string;
  datavalue?: Datavalue;
}

export type Datavalue =
  | {
      type: 'string';
      value: string;
    }
  | {
      type: 'wikibase-entityid';
      value: EntityID;
    }
  | {
      type: 'globecoordinate';
      value: GlobeCoordinate;
    }
  | {
      type: 'quantity';
      value: Quanity;
    }
  | {
      type: 'time';
      value: TimeValue;
    };

export interface EntityID {
  'entity-type': string;
  'numeric-id': number;
  id: string;
}

export interface Quanity {
  amount: string;
  unit: string;
}

export interface TimeValue {
  time: string;
  timezone: number;
  before: number;
  after: number;
  precision: number;
  calendarmodel: string;
}

export interface GlobeCoordinate {
  latitude: number;
  longitude: number;
  altitude: number | null;
  precision: number;
  globe: 'http://www.wikidata.org/entity/Q2';
}
