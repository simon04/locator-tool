from typing import Any, Dict, List, TypedDict


class Slot(TypedDict):
    contentmodel: str
    contentformat: str
    content: str


class Slots(TypedDict):
    main: Slot
    mediainfo: Slot


class Revision(TypedDict):
    slots: Slots


class Page(TypedDict):
    pageid: int
    ns: int
    title: str
    revisions: List[Revision]
    wbentityusage: Dict[str, Any]


class Tokens(TypedDict):
    csrftoken: str


class Query(TypedDict):
    pages: List[Page]
    tokens: Tokens


class QueryResult(TypedDict):
    batchcomplete: bool
    query: Query
