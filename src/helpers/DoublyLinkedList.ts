import { cModify } from '../utils';

export type DoublyLinkedListNodeId = number | string;

export interface DoublyLinkedListNode<T> {
  id: DoublyLinkedListNodeId;
  prevId: DoublyLinkedListNodeId | null;
  nextId: DoublyLinkedListNodeId | null;
  data: T;
}

export type DoublyLinkedListHistoryItem<K, V = undefined> = {
  id: number;
  type: K;
  data: V;
};

export type DoublyLinkedListHistory<T> =
  | DoublyLinkedListHistoryItem<'Add', { id: DoublyLinkedListNodeId; data: T }>
  | DoublyLinkedListHistoryItem<
      'AddAfter',
      {
        id: DoublyLinkedListNodeId;
        data: T;
        afterId: DoublyLinkedListNodeId | null;
      }
    >
  | DoublyLinkedListHistoryItem<
      'AddBefore',
      {
        id: DoublyLinkedListNodeId;
        data: T;
        beforeId: DoublyLinkedListNodeId | null;
      }
    >
  | DoublyLinkedListHistoryItem<'Remove', { id: DoublyLinkedListNodeId }>
  | DoublyLinkedListHistoryItem<
      'MoveBefore',
      { id: DoublyLinkedListNodeId; beforeId: DoublyLinkedListNodeId | null }
    >
  | DoublyLinkedListHistoryItem<
      'MoveAfter',
      { id: DoublyLinkedListNodeId; afterId: DoublyLinkedListNodeId | null }
    >;

export type DoublyLinkedListHistoryTypes =
  DoublyLinkedListHistory<unknown>['type'];

export type DoublyLinkedListHistoryType<
  T,
  K extends DoublyLinkedListHistoryTypes
> = Extract<DoublyLinkedListHistory<T>, { type: K }>;

export type DoublyLinkedListNodes<T> = {
  [key: DoublyLinkedListNodeId]: DoublyLinkedListNode<T>;
};

export interface DoublyLinkedList<T> {
  head: DoublyLinkedListNodeId | null;
  tail: DoublyLinkedListNodeId | null;
  historyId: number;
  history: DoublyLinkedListHistory<T>[];
  nodes: DoublyLinkedListNodes<T>;
}

// * Constructor
export function DLCreate<T>(): DoublyLinkedList<T>;
export function DLCreate<T>(
  arr: T[],
  extractId: (item: T) => DoublyLinkedListNodeId
): DoublyLinkedList<T>;
export function DLCreate<T>(
  arr?: T[],
  extractId?: (item: T) => DoublyLinkedListNodeId
): DoublyLinkedList<T> {
  'worklet';
  const head = arr?.[0] == null ? null : extractId!(arr[0]);
  const tail = arr?.[0] == null ? null : extractId!(arr[arr.length - 1]!);
  const nodes =
    arr?.reduce((acc, curr, i) => {
      const id = extractId!(curr);
      const prevId = arr[i - 1] == null ? null : extractId!(arr[i - 1]!);
      const nextId = arr[i + 1] == null ? null : extractId!(arr[i + 1]!);
      const item = {
        id,
        prevId,
        nextId,
        data: curr,
      };
      acc[id] = item;

      return acc;
    }, {} as DoublyLinkedListNodes<T>) ?? {};

  return { head, tail, nodes, historyId: 0, history: [] };
}

export function DLClone<T>(list: DoublyLinkedList<T>): DoublyLinkedList<T> {
  'worklet';
  let currId = list.head;
  const nodes: DoublyLinkedListNodes<T> = {};
  while (currId != null) {
    const node = list.nodes[currId]!;
    nodes[currId] = { ...node };
    currId = node.nextId;
  }

  return { ...list, nodes, history: [...list.history] };
}

// * Immutable Actions

export function DLFindIndex<T>(
  list: DoublyLinkedList<T>,
  id: number | string
): number {
  'worklet';
  let index = 0;
  let currItemId = list.head;
  while (currItemId != null) {
    if (currItemId === id) {
      return index;
    }
    const nextId = list.nodes[currItemId]?.nextId;
    index++;
    currItemId = nextId == null ? null : list.nodes[nextId]?.id ?? null;
  }
  return -1;
}

export function DLToArray<T>(list: DoublyLinkedList<T>): T[] {
  'worklet';

  const result: T[] = [];

  let itemId = list.head;
  while (itemId != null) {
    const item = list.nodes[itemId]!;
    result.push(item.data);
    itemId = item.nextId;
  }

  return result;
}

export function DLGetPrevItem<T>(
  list: DoublyLinkedList<T>,
  id: DoublyLinkedListNodeId | null
) {
  'worklet';
  if (id == null) {
    return list.tail == null ? null : list.nodes[list.tail]!;
  }
  const item = list.nodes[id];
  if (item == null) {
    return null;
  }
  return item.prevId == null ? null : list.nodes[item.prevId]!;
}

export function DLGetNextItem<T>(
  list: DoublyLinkedList<T>,
  id: DoublyLinkedListNodeId | null
) {
  'worklet';
  if (id == null) {
    return list.head == null ? null : list.nodes[list.head]!;
  }
  const item = list.nodes[id];
  if (item == null) {
    return null;
  }
  return item.nextId == null ? null : list.nodes[item.nextId]!;
}

export function DLGetIds<T>(list: DoublyLinkedList<T>): (number | string)[] {
  'worklet';

  const ids: (number | string)[] = [];

  let item = list.head == null ? null : list.nodes[list.head] ?? null;
  while (item != null) {
    ids.push(item.id);
    item = item.nextId == null ? null : list.nodes[item.nextId] ?? null;
  }

  return ids;
}
// * Mutatable Actions

function DLAddHistory<T, K extends DoublyLinkedListHistory<T>['type']>(
  list: DoublyLinkedList<T>,
  type: K,
  data: DoublyLinkedListHistoryType<T, K>['data']
) {
  'worklet';
  const extraSize = list.history.length - 40;
  if (extraSize > 0) {
    list.history.splice(0, extraSize + 10);
  }
  const id = ++list.historyId;

  list.history.push({
    id,
    type,
    data,
  } as DoublyLinkedListHistory<T>);
}

export function DLUpdateAfterAdd<T>(
  list: DoublyLinkedList<T>,
  prevItem: DoublyLinkedListNode<T> | null,
  nextItem: DoublyLinkedListNode<T> | null,
  id: DoublyLinkedListNodeId,
  data: T
) {
  'worklet';

  if (prevItem != null) {
    prevItem.nextId = id;
  } else {
    list.head = id;
  }

  if (nextItem != null) {
    nextItem.prevId = id;
  } else {
    list.tail = id;
  }

  list.nodes[id] = {
    id,
    prevId: prevItem?.id ?? null,
    nextId: nextItem?.id ?? null,
    data,
  };
}

export function DLAddItemAfter<T>(
  list: DoublyLinkedList<T>,
  id: DoublyLinkedListNodeId,
  data: T,
  afterId: DoublyLinkedListNodeId | null,
  u?: undefined
) {
  'worklet';

  const prevItem =
    afterId == null
      ? list.head == null
        ? null
        : list.nodes[list.head]
      : list.nodes[afterId];

  if (prevItem === undefined) {
    return list;
  }

  const nextItem = DLGetNextItem(list, afterId);

  DLUpdateAfterAdd(list, prevItem, nextItem, id, data);

  if (typeof u !== 'number') {
    DLAddHistory(list, 'AddAfter', { id, data, afterId });
  }

  return list;
}

export function DLAddItemBefore<T>(
  list: DoublyLinkedList<T>,
  id: DoublyLinkedListNodeId,
  data: T,
  beforeId: DoublyLinkedListNodeId | null,
  u?: undefined
) {
  'worklet';
  const nextItem =
    beforeId == null
      ? list.tail == null
        ? null
        : list.nodes[list.tail]
      : list.nodes[beforeId];

  if (nextItem === undefined) {
    return list;
  }

  const prevItem = DLGetPrevItem(list, beforeId);

  DLUpdateAfterAdd(list, prevItem, nextItem, id, data);

  if (typeof u !== 'number') {
    DLAddHistory(list, 'AddBefore', { id, data, beforeId });
  }

  return list;
}

export function DLAddItem<T>(
  list: DoublyLinkedList<T>,
  id: DoublyLinkedListNodeId,
  data: T
) {
  'worklet';
  DLAddItemBefore(list, id, data, null);
  return list;
}

export function DLRemoveItem<T>(
  list: DoublyLinkedList<T>,
  id: DoublyLinkedListNodeId,
  u?: undefined
) {
  'worklet';

  const item = list.nodes[id];
  if (item != null && item.prevId != null) {
    const prevItem = list.nodes[item.prevId]!;
    prevItem.nextId = item.nextId;
  }
  if (item != null && item.nextId != null) {
    const nextItem = list.nodes[item.nextId]!;
    nextItem.prevId = item.prevId;
  }
  if (item?.prevId === null) {
    list.head = item.nextId;
  }
  if (item?.nextId === null) {
    list.tail = item.prevId;
  }

  delete list.nodes[id];

  if (typeof u !== 'number') {
    DLAddHistory(list, 'Remove', { id });
  }

  return list;
}

export function DLMoveItemBefore<T>(
  list: DoublyLinkedList<T>,
  itemId: number | string,
  beforeId: number | string | null
) {
  'worklet';
  const currItem = list.nodes[itemId];
  if (currItem == null) {
    return list;
  }

  if (beforeId != null && list.nodes[beforeId] == null) {
    return list;
  }

  DLRemoveItem(list, itemId, 1 as unknown as undefined);
  DLAddItemBefore(
    list,
    itemId,
    currItem.data,
    beforeId,
    1 as unknown as undefined
  );

  DLAddHistory(list, 'MoveBefore', { id: itemId, beforeId });

  return list;
}

export function DLMoveItemAfter<T>(
  list: DoublyLinkedList<T>,
  itemId: number | string,
  afterId: number | string | null
) {
  'worklet';
  const currItem = list.nodes[itemId];
  if (currItem == null) {
    return list;
  }

  if (afterId != null && list.nodes[afterId] == null) {
    return list;
  }

  DLRemoveItem(list, itemId, 1 as unknown as undefined);
  DLAddItemAfter(
    list,
    itemId,
    currItem.data,
    afterId,
    1 as unknown as undefined
  );

  DLAddHistory(list, 'MoveAfter', { id: itemId, afterId });

  return list;
}

export function DLRestoreHistory<T>(
  list: DoublyLinkedList<T>,
  historyItem: DoublyLinkedListHistory<T>
) {
  'worklet';

  if (historyItem.type === 'Add') {
    DLAddItem(list, historyItem.data.id, historyItem.data.data);
  } else if (historyItem.type === 'AddAfter') {
    DLAddItemAfter(
      list,
      historyItem.data.id,
      historyItem.data.data,
      historyItem.data.afterId
    );
  } else if (historyItem.type === 'AddBefore') {
    DLAddItemBefore(
      list,
      historyItem.data.id,
      historyItem.data.data,
      historyItem.data.beforeId
    );
  } else if (historyItem.type === 'Remove') {
    DLRemoveItem(list, historyItem.data.id);
  } else if (historyItem.type === 'MoveAfter') {
    DLMoveItemAfter(list, historyItem.data.id, historyItem.data.afterId);
  } else if (historyItem.type === 'MoveBefore') {
    DLMoveItemBefore(list, historyItem.data.id, historyItem.data.beforeId);
  }

  return list;
}

// * Worklet Actions

export const SDLAddItem = cModify(DLAddItem);
export const SDLAddItemAfter = cModify(DLAddItemAfter);
export const SDLAddItemBefore = cModify(DLAddItemBefore);
export const SDLRemoveItem = cModify(DLRemoveItem);
export const SDLMoveItemBefore = cModify(DLMoveItemBefore);
export const SDLMoveItemAfter = cModify(DLMoveItemAfter);
