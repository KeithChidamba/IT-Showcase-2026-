/* undolist.js - doubly linked list + Map (key -> node), so lookup and removal are O(1). */
export class UndoList {
    
    constructor() {
        this.head = null;           // oldest item
        this.tail = null;           // newest item
        this.index = new Map();     // keys are the nodes
    }
    
    get size() { return this.index.size; }
    has(key) { return this.index.has(key); }

    get( key ) {
        const node = this.index.get(key);

        return node ? node.value : undefined;
    }

    // Adds an item at the end (newest string)
    append(key, value) {
        if (this.index.has(key)) throw new Error(`UndoList: duplicate key "${key}"`);

        const node = { key, value, prev: this.tail, next: null };
        
        if (this.tail) this.tail.next = node; else this.head = node;
        
        this.tail = node;
        this.index.set(key, node);
        
        return node;
    }

      // Unlinks the item with this key and returns its value. O(1)
    remove(key) {
        const node = this.index.get(key);

        if (!node) return undefined;
        if (node.prev) node.prev.next = node.next; else this.head = node.next;
        if (node.next) node.next.prev = node.prev; else this.tail = node.prev;

        node.prev = node.next = null;
        this.index.delete(key);

        return node.value;
    }

    // Newest item matching a test, walking back from the tail.
    findLast(test) {
            for (let n = this.tail; n; n = n.prev) if (test(n.value)) return n.value;
            return undefined;
        }

    // Oldest to newest, as [key, value] pairs.
    *[Symbol.iterator]() {
        for (let n = this.head; n; n = n.next) yield [n.key, n.value];
  }
}