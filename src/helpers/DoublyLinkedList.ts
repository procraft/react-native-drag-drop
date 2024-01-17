import { cModify } from '../utils';

export interface DoublyLinkedListNode<T> {
  id: string | number;
  prevId: string | number | null;
  nextId: string | number | null;
  data: T;
}

export interface DoublyLinkedList<T> {
  head: string | number | null;
  tail: string | number | null;
  nodes: { [key: string | number]: DoublyLinkedListNode<T> };
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

export function DLAddItem<T>(
  list: DoublyLinkedList<T>,
  id: string | number,
  data: T
) {
  'worklet';
  const prevItem = (() => {
    if (list.tail == null) {
      return null;
    }
    return list.nodes[list.tail]!;
  })();
  const nextItem = (() => {
    if (prevItem == null || prevItem.nextId == null) {
      return null;
    }
    return list.nodes[prevItem.nextId]!;
  })();
  if (prevItem != null) {
    prevItem.nextId = id;
  }
  if (nextItem != null) {
    nextItem.prevId = id;
  }
  if (prevItem == null) {
    list.head = id;
  }
  if (nextItem == null) {
    list.tail = id;
  }
  list.nodes[id] = {
    id,
    prevId: prevItem?.id ?? null,
    nextId: nextItem?.id ?? null,
    data,
  };

  return list;
}

export function DLAddItemAfter<T>(
  list: DoublyLinkedList<T>,
  id: string | number,
  data: T,
  afterId: string | number | null
) {
  'worklet';
  const prevItem = (() => {
    if (afterId === null) {
      return null!;
    }
    return list.nodes[afterId] ?? null;
  })();
  const nextItem = (() => {
    if (prevItem == null || prevItem.nextId == null) {
      return null;
    }
    return list.nodes[prevItem.nextId]!;
  })();
  if (prevItem != null) {
    prevItem.nextId = id;
  }
  if (nextItem != null) {
    nextItem.prevId = id;
  }
  if (prevItem == null) {
    list.head = id;
  }
  if (nextItem == null) {
    list.tail = id;
  }
  list.nodes[id] = {
    id,
    prevId: prevItem?.id ?? null,
    nextId: nextItem?.id ?? null,
    data,
  };

  return list;
}

export function DLAddItemBefore<T>(
  list: DoublyLinkedList<T>,
  id: string | number,
  data: T,
  beforeId: string | number | null
) {
  'worklet';
  const nextItem = (() => {
    if (beforeId == null) {
      return null;
    }
    return list.nodes[beforeId] ?? null;
  })();
  const prevItem = (() => {
    if (nextItem == null || nextItem.prevId == null) {
      return null;
    }
    return list.nodes[nextItem.prevId]!;
  })();
  if (prevItem != null) {
    prevItem.nextId = id;
  }
  if (nextItem != null) {
    nextItem.prevId = id;
  }
  if (prevItem == null) {
    list.head = id;
  }
  if (nextItem == null) {
    list.tail = id;
  }
  list.nodes[id] = {
    id,
    prevId: prevItem?.id ?? null,
    nextId: nextItem?.id ?? null,
    data,
  };

  return list;
}

export function DLFindLoop<T>(list: DoublyLinkedList<T>) {
  'worklet';

  let item = list.head == null ? null : list.nodes[list.head];
  let contains: any = {};
  while (item != null) {
    if (item.id in contains) {
      return true;
    }
    contains[item.id] = undefined;
    item = item.nextId == null ? null : list.nodes[item.nextId] ?? null;
  }

  item = list.tail == null ? null : list.nodes[list.tail];
  contains = {};
  while (item != null) {
    if (item.id in contains) {
      return true;
    }
    contains[item.id] = undefined;
    item = item.prevId == null ? null : list.nodes[item.prevId] ?? null;
  }

  return false;
}

// function DLSetItemAt<T>(
//   list: DoublyLinkedList<T>,
//   a: DoublyLinkedListNode<T>,
//   b: DoublyLinkedListNode<T>
// ) {
//   'worklet';
//   const aPrev = a.prevId == null ? null : list.nodes[a.prevId];
//   if (aPrev == null) {
//     list.head = b.id;
//   } else {
//     aPrev.nextId = b.id;
//   }
//   const aNext = a.nextId == null ? null : list.nodes[a.nextId];
//   if (aNext == null) {
//     list.tail = b.id;
//   } else {
//     aNext.prevId = b.id;
//   }
// }

export function DLRemoveItem<T>(
  list: DoublyLinkedList<T>,
  id: string | number
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

  return list;
}

export function DLSwapItems<T>(
  list: DoublyLinkedList<T>,
  a: DoublyLinkedListNode<T>,
  b: DoublyLinkedListNode<T>
) {
  'worklet';

  if (a.prevId === b.id || a.nextId === b.id) {
    if (a.prevId === b.id) {
      const prevItem = b.prevId == null ? null : list.nodes[b.prevId];
      if (prevItem == null) {
        list.head = a.id;
      } else {
        prevItem.nextId = a.id;
      }
      const nextItem = a.nextId == null ? null : list.nodes[a.nextId];
      if (nextItem == null) {
        list.tail = b.id;
      } else {
        nextItem.prevId = b.id;
      }
      a.prevId = prevItem?.id ?? null;
      a.nextId = b.id;
      b.prevId = a.id;
      b.nextId = nextItem?.id ?? null;
    } else {
      const prevItem = a.prevId == null ? null : list.nodes[a.prevId];
      if (prevItem == null) {
        list.head = b.id;
      } else {
        prevItem.nextId = b.id;
      }
      const nextItem = b.nextId == null ? null : list.nodes[b.nextId];
      if (nextItem == null) {
        list.tail = a.id;
      } else {
        nextItem.prevId = a.id;
      }
      b.prevId = prevItem?.id ?? null;
      b.nextId = a.id;
      a.prevId = b.id;
      a.nextId = nextItem?.id ?? null;
    }
  } else {
    const aPrevItem = a.prevId == null ? null : list.nodes[a.prevId];
    const aNextItem = a.nextId == null ? null : list.nodes[a.nextId];
    const bPrevItem = b.prevId == null ? null : list.nodes[b.prevId];
    const bNextItem = b.nextId == null ? null : list.nodes[b.nextId];
    if (aPrevItem == null) {
      list.head = b.id;
    } else {
      aPrevItem.nextId = b.id;
    }
    if (aNextItem == null) {
      list.tail = b.id;
    } else {
      aNextItem.prevId = b.id;
    }
    if (bPrevItem == null) {
      list.head = a.id;
    } else {
      bPrevItem.nextId = a.id;
    }
    if (bNextItem == null) {
      list.head = a.id;
    } else {
      bNextItem.nextId = a.id;
    }
    a.prevId = bPrevItem?.id ?? null;
    a.nextId = bNextItem?.id ?? null;
    b.prevId = aPrevItem?.id ?? null;
    b.nextId = aNextItem?.id ?? null;
  }

  // const aAfter = b.prevId === a.id ? b.id : b.prevId;
  // const bAfter = a.prevId === b.id ? a.id : a.prevId;

  // DLRemoveItem(list, a.id);
  // DLRemoveItem(list, b.id);

  // DLAddItem(list, a.id, a.data, aAfter);
  // DLAddItem(list, b.id, b.data, bAfter);

  // DLSetItemAt(list, a, b);
  // DLSetItemAt(list, b, a);

  // const [aPrev, aNext] = [a.prevId, a.nextId];
  // a.prevId = b.prevId === a.id ? b.id : b.prevId;
  // a.nextId = b.nextId === a.id ? b.id : b.nextId;
  // b.prevId = aPrev === b.id ? a.id : aPrev;
  // b.nextId = aNext === b.id ? a.id : aNext;
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

  DLRemoveItem(list, itemId);
  DLAddItemBefore(list, itemId, currItem.data, beforeId);

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

  DLRemoveItem(list, itemId);
  DLAddItemAfter(list, itemId, currItem.data, afterId);

  return list;
}

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

export function DLCreate<T>(): DoublyLinkedList<T> {
  'worklet';
  return { head: null, tail: null, nodes: {} };
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

export const SDLAddItem = cModify(DLAddItem);
export const SDLAddItemAfter = cModify(DLAddItemAfter);
export const SDLAddItemBefore = cModify(DLAddItemBefore);
export const SDLRemoveItem = cModify(DLRemoveItem);
export const SDLMoveItemBefore = cModify(DLMoveItemBefore);
export const SDLMoveItemAfter = cModify(DLMoveItemAfter);
