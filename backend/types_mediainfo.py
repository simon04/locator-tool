from typing import Any, Dict, List, TypedDict


class GlobeCoordinate(TypedDict):
    latitude: float
    longitude: float
    altitude: None
    precision: float
    globe: str


class Datavalue(TypedDict):
    value: GlobeCoordinate
    type: str


class Mainsnak(TypedDict):
    snaktype: str
    property: str
    hash: str
    datavalue: Datavalue


class Statement(TypedDict):
    mainsnak: Mainsnak
    type: str
    id: str
    rank: str


class Mediainfo(TypedDict):
    type: str
    id: str
    labels: List[Any]
    descriptions: List[Any]
    statements: Dict[str, List[Statement]]
