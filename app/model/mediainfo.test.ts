import {describe, expect, it} from 'vite-plus/test';

import {
  type Datavalue,
  entityId,
  EXPOSURE_TIME,
  formatStatement,
  type Mainsnak,
  type Statement
} from './mediainfo';

function statement(
  property: string,
  datavalue?: Datavalue,
  qualifiers?: Record<string, Mainsnak[]>
): Statement {
  return {
    type: 'statement',
    id: `M1$${property}`,
    rank: 'normal',
    mainsnak: {
      snaktype: datavalue ? 'value' : 'somevalue',
      property,
      hash: 'hash',
      datavalue
    },
    qualifiers
  };
}

function entity(id: string): Datavalue {
  return {
    type: 'wikibase-entityid',
    value: {'entity-type': 'item', 'numeric-id': +id.slice(1), id}
  };
}

describe('entityId', () => {
  it('reports the item an entity statement points to', () => {
    expect(entityId(statement('P4082', entity('Q1146418')))).toBe('Q1146418');
  });

  it('reports nothing for other statements', () => {
    expect(entityId(statement('P1163', {type: 'string', value: 'image/jpeg'}))).toBeUndefined();
    expect(entityId(statement('P170'))).toBeUndefined();
  });
});

describe('formatStatement', () => {
  it('formats a string', () => {
    expect(formatStatement(statement('P1163', {type: 'string', value: 'image/jpeg'}))).toBe(
      'image/jpeg'
    );
  });

  it('formats an item using its label', () => {
    const captured = statement('P4082', entity('Q1146418'));
    expect(formatStatement(captured, {Q1146418: 'Nikon D60'})).toBe('Nikon D60');
  });

  it('falls back to the item id when its label is unknown', () => {
    expect(formatStatement(statement('P4082', entity('Q1146418')))).toBe('Q1146418');
  });

  it('formats a time as a date', () => {
    const inception: Datavalue = {
      type: 'time',
      value: {
        time: '+2009-09-20T00:00:00Z',
        timezone: 0,
        before: 0,
        after: 0,
        precision: 11,
        calendarmodel: 'http://www.wikidata.org/entity/Q1985727'
      }
    };
    expect(formatStatement(statement('P571', inception))).toBe('2009-09-20');
  });

  it('formats a quantity without its sign', () => {
    const width: Datavalue = {type: 'quantity', value: {amount: '+3640', unit: '1'}};
    expect(formatStatement(statement('P2049', width))).toBe('3640');
  });

  it.each([
    ['+0.16666666666666666666', '1/6'],
    ['+0.005', '1/200'],
    ['+0.0003125', '1/3200']
  ])('writes the exposure time %s as %s', (amount, expected) => {
    const exposure: Datavalue = {type: 'quantity', value: {amount, unit: 'Q11574'}};
    expect(formatStatement(statement(EXPOSURE_TIME, exposure))).toBe(expected);
  });

  it.each(['+2', '+0'])('leaves the exposure time %s alone', amount => {
    const exposure: Datavalue = {type: 'quantity', value: {amount, unit: 'Q11574'}};
    expect(formatStatement(statement(EXPOSURE_TIME, exposure))).toBe(amount.slice(1));
  });

  it('leaves quantities of other properties below a second alone', () => {
    const fNumber: Datavalue = {type: 'quantity', value: {amount: '+0.95', unit: '1'}};
    expect(formatStatement(statement('P6790', fNumber))).toBe('0.95');
  });

  it('formats a coordinate', () => {
    const coordinate: Datavalue = {
      type: 'globecoordinate',
      value: {
        latitude: 47.526888,
        longitude: 12.302306,
        altitude: null,
        precision: 0.000001,
        globe: 'http://www.wikidata.org/entity/Q2'
      }
    };
    expect(formatStatement(statement('P1259', coordinate))).toBe('47.526888, 12.302306');
  });

  it('uses the qualifier of a statement without a value, e.g. the name of the creator', () => {
    const creator = statement('P170', undefined, {
      P4174: [
        {snaktype: 'value', property: 'P4174', hash: 'h', datavalue: entity('Q1')},
        {
          snaktype: 'value',
          property: 'P4174',
          hash: 'h',
          datavalue: {type: 'string', value: 'Wilder Kaiser'}
        }
      ]
    });
    expect(formatStatement(creator)).toBe('Wilder Kaiser');
  });

  it('formats a statement with neither value nor qualifier as empty', () => {
    expect(formatStatement(statement('P170'))).toBe('');
    expect(formatStatement(statement('P170', undefined, {}))).toBe('');
  });
});
