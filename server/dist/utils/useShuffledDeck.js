"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShuffledDeck = exports.deckCartScore = exports.deckCartCount = void 0;
const uuid_1 = require("uuid");
exports.deckCartCount = {
    a: 10,
    b: 2,
    c: 2,
    d: 4,
    e: 12,
    f: 2,
    g: 4,
    h: 2,
    i: 8,
    j: 2,
    k: 2,
    l: 4,
    m: 2,
    n: 6,
    o: 8,
    p: 2,
    q: 2,
    r: 6,
    s: 4,
    t: 6,
    u: 6,
    v: 2,
    w: 2,
    x: 2,
    y: 4,
    z: 2,
    er: 2,
    cl: 2,
    in: 2,
    th: 2,
    qu: 2
};
exports.deckCartScore = {
    a: 2,
    b: 8,
    c: 5,
    d: 2,
    e: 2,
    f: 6,
    g: 6,
    h: 7,
    i: 2,
    j: 13,
    k: 8,
    l: 3,
    m: 5,
    n: 5,
    o: 2,
    p: 6,
    q: 15,
    r: 5,
    s: 3,
    t: 3,
    u: 4,
    v: 11,
    w: 10,
    x: 12,
    y: 4,
    z: 14,
    er: 7,
    cl: 10,
    in: 7,
    th: 9,
    qu: 9
};
function getDeck() {
    const letters = Object.keys(exports.deckCartCount);
    const result = [];
    letters.map(letter => {
        for (let i = 0; i < exports.deckCartCount[letter]; i++) {
            result.push({ id: (0, uuid_1.v4)(), label: letter, score: exports.deckCartScore[letter] });
        }
    });
    return result;
}
const Deck = getDeck();
function getShuffledDeck() {
    return [...Deck.sort(() => Math.random() - 0.5)];
}
exports.getShuffledDeck = getShuffledDeck;
//# sourceMappingURL=useShuffledDeck.js.map