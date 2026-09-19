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
  qualifiers?: Record<string, Mainsnak[]>;
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

// exposure time, ISO speed and f-number
export const EXPOSURE_TIME = 'P6757';
export const ISO_SPEED = 'P6789';
export const F_NUMBER = 'P6790';

export function entityId(statement: Statement): string | undefined {
  const datavalue = statement.mainsnak.datavalue;
  return datavalue?.type === 'wikibase-entityid' ? datavalue.value.id : undefined;
}

export function formatStatement(statement: Statement, labels: Record<string, string> = {}): string {
  // a `somevalue` statement carries its value as a qualifier, e.g. the name of the creator
  const datavalue =
    statement.mainsnak.datavalue ??
    Object.values(statement.qualifiers ?? {})
      .flat()
      .find(snak => snak.datavalue?.type === 'string')?.datavalue;
  switch (datavalue?.type) {
    case 'string':
      return datavalue.value;
    case 'wikibase-entityid':
      return labels[datavalue.value.id] ?? datavalue.value.id;
    case 'time':
      return datavalue.value.time.replace(/^\+/, '').replace(/T.*/, '');
    case 'quantity': {
      const amount = +datavalue.value.amount;
      // exposure times are stored as a decimal, but are commonly written as 1/60 s
      return statement.mainsnak.property === EXPOSURE_TIME && amount > 0 && amount < 1
        ? `1/${Math.round(1 / amount)}`
        : datavalue.value.amount.replace(/^\+/, '');
    }
    case 'globecoordinate':
      return `${datavalue.value.latitude}, ${datavalue.value.longitude}`;
    default:
      return '';
  }
}
