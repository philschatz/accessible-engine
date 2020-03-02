(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.GameEngine = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function quickselect(arr, k, left, right, compare) {
        quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
    }

    function quickselectStep(arr, k, left, right, compare) {

        while (right > left) {
            if (right - left > 600) {
                var n = right - left + 1;
                var m = k - left + 1;
                var z = Math.log(n);
                var s = 0.5 * Math.exp(2 * z / 3);
                var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
                var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
                var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
                quickselectStep(arr, k, newLeft, newRight, compare);
            }

            var t = arr[k];
            var i = left;
            var j = right;

            swap(arr, left, k);
            if (compare(arr[right], t) > 0) swap(arr, left, right);

            while (i < j) {
                swap(arr, i, j);
                i++;
                j--;
                while (compare(arr[i], t) < 0) i++;
                while (compare(arr[j], t) > 0) j--;
            }

            if (compare(arr[left], t) === 0) swap(arr, left, j);
            else {
                j++;
                swap(arr, j, right);
            }

            if (j <= k) left = j + 1;
            if (k <= j) right = j - 1;
        }
    }

    function swap(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    function defaultCompare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    class RBush {
        constructor(maxEntries = 9) {
            // max entries in a node is 9 by default; min node fill is 40% for best performance
            this._maxEntries = Math.max(4, maxEntries);
            this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
            this.clear();
        }

        all() {
            return this._all(this.data, []);
        }

        search(bbox) {
            let node = this.data;
            const result = [];

            if (!intersects(bbox, node)) return result;

            const toBBox = this.toBBox;
            const nodesToSearch = [];

            while (node) {
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childBBox = node.leaf ? toBBox(child) : child;

                    if (intersects(bbox, childBBox)) {
                        if (node.leaf) result.push(child);
                        else if (contains(bbox, childBBox)) this._all(child, result);
                        else nodesToSearch.push(child);
                    }
                }
                node = nodesToSearch.pop();
            }

            return result;
        }

        collides(bbox) {
            let node = this.data;

            if (!intersects(bbox, node)) return false;

            const nodesToSearch = [];
            while (node) {
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childBBox = node.leaf ? this.toBBox(child) : child;

                    if (intersects(bbox, childBBox)) {
                        if (node.leaf || contains(bbox, childBBox)) return true;
                        nodesToSearch.push(child);
                    }
                }
                node = nodesToSearch.pop();
            }

            return false;
        }

        load(data) {
            if (!(data && data.length)) return this;

            if (data.length < this._minEntries) {
                for (let i = 0; i < data.length; i++) {
                    this.insert(data[i]);
                }
                return this;
            }

            // recursively build the tree with the given data from scratch using OMT algorithm
            let node = this._build(data.slice(), 0, data.length - 1, 0);

            if (!this.data.children.length) {
                // save as is if tree is empty
                this.data = node;

            } else if (this.data.height === node.height) {
                // split root if trees have the same height
                this._splitRoot(this.data, node);

            } else {
                if (this.data.height < node.height) {
                    // swap trees if inserted one is bigger
                    const tmpNode = this.data;
                    this.data = node;
                    node = tmpNode;
                }

                // insert the small tree into the large tree at appropriate level
                this._insert(node, this.data.height - node.height - 1, true);
            }

            return this;
        }

        insert(item) {
            if (item) this._insert(item, this.data.height - 1);
            return this;
        }

        clear() {
            this.data = createNode([]);
            return this;
        }

        remove(item, equalsFn) {
            if (!item) return this;

            let node = this.data;
            const bbox = this.toBBox(item);
            const path = [];
            const indexes = [];
            let i, parent, goingUp;

            // depth-first iterative tree traversal
            while (node || path.length) {

                if (!node) { // go up
                    node = path.pop();
                    parent = path[path.length - 1];
                    i = indexes.pop();
                    goingUp = true;
                }

                if (node.leaf) { // check current node
                    const index = findItem(item, node.children, equalsFn);

                    if (index !== -1) {
                        // item found, remove the item and condense tree upwards
                        node.children.splice(index, 1);
                        path.push(node);
                        this._condense(path);
                        return this;
                    }
                }

                if (!goingUp && !node.leaf && contains(node, bbox)) { // go down
                    path.push(node);
                    indexes.push(i);
                    i = 0;
                    parent = node;
                    node = node.children[0];

                } else if (parent) { // go right
                    i++;
                    node = parent.children[i];
                    goingUp = false;

                } else node = null; // nothing found
            }

            return this;
        }

        toBBox(item) { return item; }

        compareMinX(a, b) { return a.minX - b.minX; }
        compareMinY(a, b) { return a.minY - b.minY; }

        toJSON() { return this.data; }

        fromJSON(data) {
            this.data = data;
            return this;
        }

        _all(node, result) {
            const nodesToSearch = [];
            while (node) {
                if (node.leaf) result.push(...node.children);
                else nodesToSearch.push(...node.children);

                node = nodesToSearch.pop();
            }
            return result;
        }

        _build(items, left, right, height) {

            const N = right - left + 1;
            let M = this._maxEntries;
            let node;

            if (N <= M) {
                // reached leaf level; return leaf
                node = createNode(items.slice(left, right + 1));
                calcBBox(node, this.toBBox);
                return node;
            }

            if (!height) {
                // target height of the bulk-loaded tree
                height = Math.ceil(Math.log(N) / Math.log(M));

                // target number of root entries to maximize storage utilization
                M = Math.ceil(N / Math.pow(M, height - 1));
            }

            node = createNode([]);
            node.leaf = false;
            node.height = height;

            // split the items into M mostly square tiles

            const N2 = Math.ceil(N / M);
            const N1 = N2 * Math.ceil(Math.sqrt(M));

            multiSelect(items, left, right, N1, this.compareMinX);

            for (let i = left; i <= right; i += N1) {

                const right2 = Math.min(i + N1 - 1, right);

                multiSelect(items, i, right2, N2, this.compareMinY);

                for (let j = i; j <= right2; j += N2) {

                    const right3 = Math.min(j + N2 - 1, right2);

                    // pack each entry recursively
                    node.children.push(this._build(items, j, right3, height - 1));
                }
            }

            calcBBox(node, this.toBBox);

            return node;
        }

        _chooseSubtree(bbox, node, level, path) {
            while (true) {
                path.push(node);

                if (node.leaf || path.length - 1 === level) break;

                let minArea = Infinity;
                let minEnlargement = Infinity;
                let targetNode;

                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const area = bboxArea(child);
                    const enlargement = enlargedArea(bbox, child) - area;

                    // choose entry with the least area enlargement
                    if (enlargement < minEnlargement) {
                        minEnlargement = enlargement;
                        minArea = area < minArea ? area : minArea;
                        targetNode = child;

                    } else if (enlargement === minEnlargement) {
                        // otherwise choose one with the smallest area
                        if (area < minArea) {
                            minArea = area;
                            targetNode = child;
                        }
                    }
                }

                node = targetNode || node.children[0];
            }

            return node;
        }

        _insert(item, level, isNode) {
            const bbox = isNode ? item : this.toBBox(item);
            const insertPath = [];

            // find the best node for accommodating the item, saving all nodes along the path too
            const node = this._chooseSubtree(bbox, this.data, level, insertPath);

            // put the item into the node
            node.children.push(item);
            extend(node, bbox);

            // split on node overflow; propagate upwards if necessary
            while (level >= 0) {
                if (insertPath[level].children.length > this._maxEntries) {
                    this._split(insertPath, level);
                    level--;
                } else break;
            }

            // adjust bboxes along the insertion path
            this._adjustParentBBoxes(bbox, insertPath, level);
        }

        // split overflowed node into two
        _split(insertPath, level) {
            const node = insertPath[level];
            const M = node.children.length;
            const m = this._minEntries;

            this._chooseSplitAxis(node, m, M);

            const splitIndex = this._chooseSplitIndex(node, m, M);

            const newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
            newNode.height = node.height;
            newNode.leaf = node.leaf;

            calcBBox(node, this.toBBox);
            calcBBox(newNode, this.toBBox);

            if (level) insertPath[level - 1].children.push(newNode);
            else this._splitRoot(node, newNode);
        }

        _splitRoot(node, newNode) {
            // split root node
            this.data = createNode([node, newNode]);
            this.data.height = node.height + 1;
            this.data.leaf = false;
            calcBBox(this.data, this.toBBox);
        }

        _chooseSplitIndex(node, m, M) {
            let index;
            let minOverlap = Infinity;
            let minArea = Infinity;

            for (let i = m; i <= M - m; i++) {
                const bbox1 = distBBox(node, 0, i, this.toBBox);
                const bbox2 = distBBox(node, i, M, this.toBBox);

                const overlap = intersectionArea(bbox1, bbox2);
                const area = bboxArea(bbox1) + bboxArea(bbox2);

                // choose distribution with minimum overlap
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    index = i;

                    minArea = area < minArea ? area : minArea;

                } else if (overlap === minOverlap) {
                    // otherwise choose distribution with minimum area
                    if (area < minArea) {
                        minArea = area;
                        index = i;
                    }
                }
            }

            return index || M - m;
        }

        // sorts node children by the best axis for split
        _chooseSplitAxis(node, m, M) {
            const compareMinX = node.leaf ? this.compareMinX : compareNodeMinX;
            const compareMinY = node.leaf ? this.compareMinY : compareNodeMinY;
            const xMargin = this._allDistMargin(node, m, M, compareMinX);
            const yMargin = this._allDistMargin(node, m, M, compareMinY);

            // if total distributions margin value is minimal for x, sort by minX,
            // otherwise it's already sorted by minY
            if (xMargin < yMargin) node.children.sort(compareMinX);
        }

        // total margin of all possible split distributions where each node is at least m full
        _allDistMargin(node, m, M, compare) {
            node.children.sort(compare);

            const toBBox = this.toBBox;
            const leftBBox = distBBox(node, 0, m, toBBox);
            const rightBBox = distBBox(node, M - m, M, toBBox);
            let margin = bboxMargin(leftBBox) + bboxMargin(rightBBox);

            for (let i = m; i < M - m; i++) {
                const child = node.children[i];
                extend(leftBBox, node.leaf ? toBBox(child) : child);
                margin += bboxMargin(leftBBox);
            }

            for (let i = M - m - 1; i >= m; i--) {
                const child = node.children[i];
                extend(rightBBox, node.leaf ? toBBox(child) : child);
                margin += bboxMargin(rightBBox);
            }

            return margin;
        }

        _adjustParentBBoxes(bbox, path, level) {
            // adjust bboxes along the given tree path
            for (let i = level; i >= 0; i--) {
                extend(path[i], bbox);
            }
        }

        _condense(path) {
            // go through the path, removing empty nodes and updating bboxes
            for (let i = path.length - 1, siblings; i >= 0; i--) {
                if (path[i].children.length === 0) {
                    if (i > 0) {
                        siblings = path[i - 1].children;
                        siblings.splice(siblings.indexOf(path[i]), 1);

                    } else this.clear();

                } else calcBBox(path[i], this.toBBox);
            }
        }
    }

    function findItem(item, items, equalsFn) {
        if (!equalsFn) return items.indexOf(item);

        for (let i = 0; i < items.length; i++) {
            if (equalsFn(item, items[i])) return i;
        }
        return -1;
    }

    // calculate node's bbox from bboxes of its children
    function calcBBox(node, toBBox) {
        distBBox(node, 0, node.children.length, toBBox, node);
    }

    // min bounding rectangle of node children from k to p-1
    function distBBox(node, k, p, toBBox, destNode) {
        if (!destNode) destNode = createNode(null);
        destNode.minX = Infinity;
        destNode.minY = Infinity;
        destNode.maxX = -Infinity;
        destNode.maxY = -Infinity;

        for (let i = k; i < p; i++) {
            const child = node.children[i];
            extend(destNode, node.leaf ? toBBox(child) : child);
        }

        return destNode;
    }

    function extend(a, b) {
        a.minX = Math.min(a.minX, b.minX);
        a.minY = Math.min(a.minY, b.minY);
        a.maxX = Math.max(a.maxX, b.maxX);
        a.maxY = Math.max(a.maxY, b.maxY);
        return a;
    }

    function compareNodeMinX(a, b) { return a.minX - b.minX; }
    function compareNodeMinY(a, b) { return a.minY - b.minY; }

    function bboxArea(a)   { return (a.maxX - a.minX) * (a.maxY - a.minY); }
    function bboxMargin(a) { return (a.maxX - a.minX) + (a.maxY - a.minY); }

    function enlargedArea(a, b) {
        return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
               (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY));
    }

    function intersectionArea(a, b) {
        const minX = Math.max(a.minX, b.minX);
        const minY = Math.max(a.minY, b.minY);
        const maxX = Math.min(a.maxX, b.maxX);
        const maxY = Math.min(a.maxY, b.maxY);

        return Math.max(0, maxX - minX) *
               Math.max(0, maxY - minY);
    }

    function contains(a, b) {
        return a.minX <= b.minX &&
               a.minY <= b.minY &&
               b.maxX <= a.maxX &&
               b.maxY <= a.maxY;
    }

    function intersects(a, b) {
        return b.minX <= a.maxX &&
               b.minY <= a.maxY &&
               b.maxX >= a.minX &&
               b.maxY >= a.minY;
    }

    function createNode(children) {
        return {
            children,
            height: 1,
            leaf: true,
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        };
    }

    // sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
    // combines selection algorithm with binary divide & conquer approach

    function multiSelect(arr, left, right, n, compare) {
        const stack = [left, right];

        while (stack.length) {
            right = stack.pop();
            left = stack.pop();

            if (right - left <= n) continue;

            const mid = left + Math.ceil((right - left) / n / 2) * n;
            quickselect(arr, mid, left, right, compare);

            stack.push(left, mid, mid, right);
        }
    }

    var ROTATION_AMOUNT;
    (function (ROTATION_AMOUNT) {
        ROTATION_AMOUNT["NONE"] = "NONE";
        ROTATION_AMOUNT["UP"] = "UP";
        ROTATION_AMOUNT["LEFT"] = "LEFT";
        ROTATION_AMOUNT["DOWN"] = "DOWN";
    })(ROTATION_AMOUNT || (ROTATION_AMOUNT = {}));
    var ObjectInstance = /** @class */ (function () {
        function ObjectInstance(t, pos, props) {
            this.offsetPos = { x: 0, y: 0 };
            this.animations = new Set();
            this._zIndex = null;
            this.static = t;
            this.pos = pos;
            this.props = props;
            this.sprite = new SpriteInstance(t.sprite);
        }
        ObjectInstance.prototype.destroy = function () {
            this.static.delete(this);
        };
        ObjectInstance.prototype.moveTo = function (pos) {
            // delegate
            this.static.moveTo(this, pos);
        };
        ObjectInstance.prototype.toBBox = function () {
            return { minX: this.pos.x, minY: this.pos.y, maxX: this.pos.x, maxY: this.pos.y };
        };
        ObjectInstance.prototype.setSprite = function (sprite) {
            // only change the sprite when it is different
            if (this.sprite.sprite !== sprite) {
                this.sprite.sprite = sprite;
                this.sprite.startTick = 0;
            }
        };
        ObjectInstance.prototype.setMask = function (hexColor, isGrayscale) {
            if (isGrayscale === void 0) { isGrayscale = false; }
            this.sprite.maskColor = hexColor;
            this.sprite.isGrayscale = isGrayscale;
        };
        ObjectInstance.prototype.zIndex = function () {
            return this._zIndex === null ? this.static.zIndex : this._zIndex;
        };
        ObjectInstance.prototype.getPixelPos = function (grid) {
            return posAdd(posTimes(this.pos, grid), this.offsetPos);
        };
        ObjectInstance.prototype.flip = function (hFlip, vFlip) {
            if (hFlip === void 0) { hFlip = undefined; }
            if (vFlip === void 0) { vFlip = undefined; }
            if (hFlip !== undefined) {
                this.sprite.hFlip = hFlip;
            }
            if (vFlip !== undefined) {
                this.sprite.vFlip = vFlip;
            }
            return this;
        };
        ObjectInstance.prototype.rotate = function (amt) {
            this.sprite.rotation = amt;
            return this;
        };
        ObjectInstance.prototype.setOffset = function (pixels) {
            this.offsetPos = pixels;
            return this;
        };
        ObjectInstance.prototype.getMainSprite = function () {
            return this.sprite.sprite;
        };
        ObjectInstance.prototype.addAnimation = function (sprite) {
            this.animations.add(sprite);
        };
        return ObjectInstance;
    }());
    var SpriteInstance = /** @class */ (function () {
        function SpriteInstance(sprite, relPos) {
            if (relPos === void 0) { relPos = { x: 0, y: 0 }; }
            this.startTick = 0;
            this.maskColor = null;
            this.isGrayscale = false;
            this.hFlip = false;
            this.vFlip = false;
            this.rotation = ROTATION_AMOUNT.NONE;
            this.sprite = sprite;
            this.relPos = relPos;
        }
        SpriteInstance.prototype.isDone = function (curTick) {
            return this.sprite.isDone(this.startTick, curTick);
        };
        return SpriteInstance;
    }());
    var GameObject = /** @class */ (function () {
        function GameObject(bush, sprite, zIndex, updateFn) {
            this.instances = new Set();
            this.bush = bush;
            this.sprite = sprite;
            this.zIndex = zIndex;
            this.updateFn = updateFn;
        }
        GameObject.prototype.new = function (pos) {
            var o = new ObjectInstance(this, pos, {});
            this.instances.add(o);
            this.bush.insert(o);
            return o;
        };
        GameObject.prototype.newBulk = function (positions) {
            var e_1, _a;
            var _this = this;
            var instances = positions.map(function (p) { return new ObjectInstance(_this, p, {}); });
            this.bush.load(instances);
            try {
                for (var instances_1 = __values(instances), instances_1_1 = instances_1.next(); !instances_1_1.done; instances_1_1 = instances_1.next()) {
                    var o = instances_1_1.value;
                    this.instances.add(o);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (instances_1_1 && !instances_1_1.done && (_a = instances_1.return)) _a.call(instances_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return instances;
        };
        GameObject.prototype.moveTo = function (o, newPos) {
            if (!this.instances.has(o)) {
                throw new Error('BUG: Trying to move an object that the framework is unaware of');
            }
            if (Number.isNaN(newPos.x) || Number.isNaN(newPos.y)) {
                throw new Error("Position neeeds to have numbers as their coordinates. At least one of them was not a number. (" + newPos.x + ", " + newPos.y + ")");
            }
            if (newPos.x !== Math.floor(newPos.x) || newPos.y !== Math.floor(newPos.y)) {
                throw new Error('BUG: coordinates need to be whole numbers');
            }
            this.bush.remove(o);
            o.pos = newPos;
            this.bush.insert(o);
        };
        GameObject.prototype.delete = function (o) {
            this.instances.delete(o);
            this.bush.remove(o);
        };
        GameObject.prototype.deleteAll = function () {
            var e_2, _a;
            try {
                for (var _b = __values(this.instances), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var o = _c.value;
                    this.bush.remove(o);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.instances.clear();
        };
        return GameObject;
    }());
    // An animated set of Images
    var Sprite = /** @class */ (function () {
        function Sprite(playbackRate, loop, images) {
            var e_3, _a;
            if (Math.floor(playbackRate) !== playbackRate || playbackRate < 0) {
                throw new Error('The rate is the number of ticks to wait before moving to the next sprite. It should be a whole non-negative number');
            }
            this._name = '';
            this.loop = loop;
            this.playbackRate = playbackRate;
            this.images = images;
            try {
                // validate the images are not null
                for (var _b = __values(this.images), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var s = _c.value;
                    if (s === null) {
                        throw new Error('ERROR: sprites need to be non-null');
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        Sprite.forSingleImage = function (s) {
            return new Sprite(1, false, [s]);
        };
        Sprite.prototype.getI = function (startTick, curTick) {
            return Math.round((curTick - startTick) / this.playbackRate);
        };
        Sprite.prototype.tick = function (startTick, curTick) {
            if (this.images.length === 0) {
                throw new Error('BUG: Could not find sprite since there should only be one');
            }
            var i = this.getI(startTick, curTick);
            var ret;
            if (this.loop) {
                ret = this.images[i % this.images.length];
            }
            else {
                ret = this.images[Math.min(i, this.images.length - 1)];
            }
            if (!ret) {
                throw new Error("BUG: Could not find sprite with index i=" + i + " . len=" + this.images.length);
            }
            return ret;
        };
        Sprite.prototype.isDone = function (startTick, curTick) {
            return !this.loop && this.getI(startTick, curTick) >= this.images.length;
        };
        return Sprite;
    }());
    var Image = /** @class */ (function () {
        function Image(pixels) {
            this.pixels = pixels;
        }
        Image.prototype.getDimension = function () {
            return {
                width: this.pixels[0].length,
                height: this.pixels.length
            };
        };
        Image.prototype.getBBox = function () {
            var _a = this.getDimension(), width = _a.width, height = _a.height;
            return {
                minX: 0,
                minY: 0,
                maxX: width,
                maxY: height
            };
        };
        return Image;
    }());
    var CollisionChecker = /** @class */ (function () {
        function CollisionChecker(grid, bush) {
            this.grid = grid;
            this.bush = bush;
        }
        CollisionChecker.prototype.searchBBox = function (bbox) {
            return this.bush.search(bbox); // .sort(zIndexComparator)
        };
        CollisionChecker.prototype.searchPoint = function (pos) {
            return this.searchBBox({
                minX: pos.x,
                maxX: pos.x,
                minY: pos.y,
                maxY: pos.y
            });
        };
        return CollisionChecker;
    }());
    var Engine = /** @class */ (function () {
        function Engine(game, outputter, gamepad) {
            var e_4, _a;
            this.curTick = 0;
            this.bush = new RBush();
            // The browser does not like "class MyRBush extends RBush { ... }"
            // because typescript or rollup downgrade the `class` to use ES4 prototypes
            this.bush.toBBox = function (item) { return item.toBBox(); };
            this.bush.compareMinX = function (a, b) { return a.pos.x - b.pos.x; };
            this.bush.compareMinY = function (a, b) { return a.pos.y - b.pos.y; };
            this.sprites = new DefiniteMap();
            this.instances = new InstanceController(this.bush);
            this.camera = new Camera({ width: 24 * 2, height: 12 * 2 });
            this.gamepad = gamepad;
            this.outputter = outputter;
            this.game = game;
            this.pendingDialog = null;
            this.overlayState = {};
            this.showDialog = this.showDialog.bind(this);
            var grid = this.game.load(this.gamepad, this.sprites).grid;
            this.grid = grid;
            this.collisionChecker = new CollisionChecker(grid, this.bush);
            try {
                // For debugging attach a name to each sprite
                for (var _b = __values(this.sprites.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), name_1 = _d[0], sprite = _d[1];
                    sprite._name = name_1;
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            this.game.init(this.sprites, this.instances);
        }
        Engine.prototype.tick = function () {
            var _this = this;
            this.curTick++;
            this.gamepad.tick();
            // Update each object
            // TODO: Only update objects in view or ones that have an alwaysUpdate=true flag set (TBD)
            this.bush.all().forEach(function (i) {
                i.static.updateFn(i, _this.gamepad, _this.collisionChecker, _this.sprites, _this.instances, _this.camera, _this.showDialog, _this.overlayState, _this.curTick);
            });
            this.draw();
        };
        Engine.prototype.draw = function () {
            // get all the sprites visible to the camera
            var tiles = this.bush.search(this.camera.toBBox());
            // Lower zIndex needs to be drawn later
            tiles.sort(zIndexComparator);
            tiles.reverse();
            this.outputter.draw(this.game, tiles, this.camera, this.curTick, this.grid, this.overlayState, this.pendingDialog, this.sprites);
            this.pendingDialog = null;
        };
        Engine.prototype.showDialog = function (message, target, additional) {
            if (!this.pendingDialog || this.pendingDialog.message !== message) {
                this.pendingDialog = {
                    message: message,
                    target: target,
                    additional: additional,
                    startTick: this.curTick
                };
            }
        };
        return Engine;
    }());
    var Camera = /** @class */ (function () {
        function Camera(dim) {
            this.dim = dim;
            this.pos = { x: 0, y: 0 };
            this.screenPixelPos = { x: 0, y: 0 };
        }
        Camera.prototype.size = function () { return this.dim; };
        Camera.prototype.resize = function (dim) { this.dim = dim; };
        Camera.prototype.toBBox = function () {
            var _a = this.dim, width = _a.width, height = _a.height;
            var w = Math.floor(width / 2);
            var h = Math.floor(height / 2);
            return {
                minX: this.pos.x - w,
                maxX: this.pos.x + w,
                minY: this.pos.y - h,
                maxY: this.pos.y + h
            };
        };
        Camera.prototype.topLeft = function () {
            var bbox = this.toBBox();
            return {
                x: bbox.minX,
                y: bbox.minY
            };
        };
        Camera.prototype.topLeftPixelPos = function (grid) {
            return posTimes(this.topLeft(), grid);
        };
        Camera.prototype.track = function (target) {
            this.pos = target;
        };
        Camera.prototype.nudge = function (target, xAmount, yAmount) {
            var _a = this.pos, x = _a.x, y = _a.y;
            this.pos = {
                x: boxNudge(x, target.x, xAmount),
                y: boxNudge(y, target.y, yAmount)
            };
        };
        return Camera;
    }());
    function boxNudge(source, target, leashLength) {
        if (leashLength === null)
            return source;
        var diff = target - source;
        if (diff > leashLength) {
            return source + (diff - leashLength);
        }
        else if (diff < -leashLength) {
            return source + (diff + leashLength);
        }
        return source;
    }
    var InstanceController = /** @class */ (function () {
        function InstanceController(bush) {
            this.instances = new Map();
            this.bush = bush;
        }
        InstanceController.prototype.simple = function (sprites, name, zIndex) {
            return this.factory(name, sprites.get(name), zIndex, function () { return null; });
        };
        InstanceController.prototype.factory = function (name, sprite, zIndex, fnUpdate) {
            var i = this.instances.get(name);
            if (i === undefined) {
                i = new GameObject(this.bush, sprite, zIndex, fnUpdate);
                this.instances.set(name, i);
                return i;
            }
            return i;
        };
        InstanceController.prototype.findAll = function (name) {
            var i = this.instances.get(name);
            if (i === undefined) {
                throw new Error("BUG: Could not find tile named \"" + name + "\". Currently have the following: " + JSON.stringify(__spread(this.instances.keys())));
            }
            return __spread(i.instances);
        };
        return InstanceController;
    }());
    var DefiniteMap = /** @class */ (function () {
        function DefiniteMap() {
            this.map = new Map();
        }
        DefiniteMap.prototype.add = function (key, value) {
            if (this.map.has(key)) {
                throw new Error("BUG: Trying to add item (sprite) when there is another item that already exists with the same name \"" + key + "\"");
            }
            this.map.set(key, value);
        };
        DefiniteMap.prototype.get = function (key) {
            var value = this.map.get(key);
            if (value === undefined) {
                throw new Error("ERROR: Could not find item (sprite) named " + key);
            }
            return value;
        };
        DefiniteMap.prototype.getAll = function (keys) {
            var _this = this;
            return keys.map(function (key) { return _this.get(key); });
        };
        DefiniteMap.prototype.entries = function () {
            return this.map.entries();
        };
        return DefiniteMap;
    }());
    var DPAD;
    (function (DPAD) {
        DPAD[DPAD["RIGHT"] = 0] = "RIGHT";
        DPAD[DPAD["UP"] = 1] = "UP";
        DPAD[DPAD["LEFT"] = 2] = "LEFT";
        DPAD[DPAD["DOWN"] = 3] = "DOWN";
    })(DPAD || (DPAD = {}));
    function zIndexComparator(a, b) {
        var az = a.zIndex();
        var bz = b.zIndex();
        var aNull = az === undefined || az === null;
        var bNull = bz === undefined || bz === null;
        if (aNull && bNull) {
            return 0;
        }
        else if (bNull) {
            return 1;
        }
        else if (aNull) {
            return -1;
        }
        else {
            return az - bz;
        }
    }
    function posAdd(pos1, pos2) {
        return {
            x: pos1.x + pos2.x,
            y: pos1.y + pos2.y
        };
    }
    function posTimes(pos, size) {
        if (!pos || !size) {
            throw new Error("pos=" + JSON.stringify(pos) + " size=" + JSON.stringify(size));
        }
        return {
            x: pos.x * size.width,
            y: pos.y * size.height
        };
    }
    //# sourceMappingURL=engine.js.map

    var BUTTON_TYPE;
    (function (BUTTON_TYPE) {
        BUTTON_TYPE["DPAD_UP"] = "DPAD_UP";
        BUTTON_TYPE["DPAD_DOWN"] = "DPAD_DOWN";
        BUTTON_TYPE["DPAD_LEFT"] = "DPAD_LEFT";
        BUTTON_TYPE["DPAD_RIGHT"] = "DPAD_RIGHT";
        BUTTON_TYPE["HOME"] = "HOME";
        BUTTON_TYPE["START"] = "START";
        BUTTON_TYPE["SELECT"] = "SELECT";
        BUTTON_TYPE["CLUSTER_UP"] = "CLUSTER_UP";
        BUTTON_TYPE["CLUSTER_LEFT"] = "CLUSTER_LEFT";
        BUTTON_TYPE["CLUSTER_RIGHT"] = "CLUSTER_RIGHT";
        BUTTON_TYPE["CLUSTER_DOWN"] = "CLUSTER_DOWN";
        BUTTON_TYPE["BUMPER_TOP_LEFT"] = "BUMPER_TOP_LEFT";
        BUTTON_TYPE["BUMPER_BOTTOM_LEFT"] = "BUMPER_BOTTOM_LEFT";
        BUTTON_TYPE["BUMPER_TOP_RIGHT"] = "BUMPER_TOP_RIGHT";
        BUTTON_TYPE["BUMPER_BOTTOM_RIGHT"] = "BUMPER_BOTTOM_RIGHT";
        BUTTON_TYPE["STICK_PRESS_LEFT"] = "STICK_PRESS_LEFT";
        BUTTON_TYPE["STICK_PRESS_RIGHT"] = "STICK_PRESS_RIGHT";
        BUTTON_TYPE["TOUCHSCREEN"] = "TOUCHSCREEN";
    })(BUTTON_TYPE || (BUTTON_TYPE = {}));
    var STICK_TYPE;
    (function (STICK_TYPE) {
        STICK_TYPE["LEFT"] = "LEFT";
        STICK_TYPE["RIGHT"] = "RIGHT";
    })(STICK_TYPE || (STICK_TYPE = {}));
    var ANALOG_TYPE;
    (function (ANALOG_TYPE) {
        ANALOG_TYPE["BUMPER_LEFT"] = "BUMPER_LEFT";
        ANALOG_TYPE["BUMPER_RIGHT"] = "BUMPER_RIGHT";
    })(ANALOG_TYPE || (ANALOG_TYPE = {}));
    var OrGamepad = /** @class */ (function () {
        function OrGamepad(pads) {
            this.pads = pads;
        }
        OrGamepad.prototype.tick = function () {
            var e_1, _a;
            try {
                for (var _b = __values(this.pads), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var pad = _c.value;
                    pad.tick();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        OrGamepad.prototype.isButtonPressed = function (btn) {
            var e_2, _a;
            try {
                for (var _b = __values(this.pads), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var pad = _c.value;
                    if (pad.isButtonPressed(btn)) {
                        return true;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return false;
        };
        OrGamepad.prototype.getStickCoordinates = function (stick) {
            var e_3, _a;
            var farthest = new Map();
            var max = -1;
            try {
                for (var _b = __values(this.pads), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var pad = _c.value;
                    var c = pad.getStickCoordinates(stick) || { x: 0, y: 0 };
                    var distance = Math.abs(c.x) + Math.abs(c.y);
                    max = Math.max(max, distance);
                    farthest.set(distance, c);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            if (max > 0) {
                return farthest.get(max);
            }
            return { x: 0, y: 0 };
        };
        return OrGamepad;
    }());
    //# sourceMappingURL=gamepad.js.map

    // Autogenerated by pngExtractor.js
    function loadImages() {
        var images = new DefiniteMap();
        var Z = null; // transparent
        var a = '#c2ffeb';
        var b = '#06353b';
        var c = '#306387';
        var d = '#73c2b4';
        var e = '#000000';
        var f = '#dda7b6';
        var g = '#dec78f';
        var h = '#ffffff';
        var i = '#6a356c';
        var j = '#6b241b';
        var k = '#fd9150';
        var l = '#ffffe2';
        var m = '#fffff2';
        var n = '#f48118';
        var o = '#fc7953';
        var p = '#0016ff';
        var q = '#b5ffb5';
        var r = '#3f6d54';
        var s = '#93c453';
        var t = '#6b321d';
        var u = '#26100d';
        var v = '#27550f';
        var w = '#70e4ff';
        var x = '#e6001c';
        var y = '#3b1711';
        var z = '#852d21';
        var A = '#a15d29';
        var B = '#139dec';
        var C = '#69faf8';
        var D = '#213531';
        var E = '#599388';
        var F = '#c935ea';
        var G = '#6a0009';
        var H = '#6afaf8';
        var I = '#fed4a3';
        var J = '#fafa51';
        var K = '#e72e3d';
        var L = '#063749';
        var M = '#c2fff6';
        var N = '#2ec7ff';
        var O = '#4d2b14';
        var P = '#ffff9a';
        var Q = '#fec316';
        var R = '#292929';
        var S = '#c09d53';
        var T = '#2ee479';
        images.add('Stump', new Image([
            [a, a, a, a, a, a, b, b, b, a, b, b, a, a, a, a],
            [a, a, a, b, b, b, d, a, a, b, d, a, b, a, a, a],
            [a, a, b, b, a, g, b, g, g, b, b, d, a, b, a, a],
            [a, a, b, a, g, g, a, d, d, d, g, g, a, b, a, a],
            [a, a, b, a, g, a, a, a, d, d, d, g, a, b, a, a],
            [a, a, b, a, b, a, a, a, a, d, d, b, a, b, a, a],
            [a, a, b, a, a, b, a, b, b, d, b, a, a, b, a, a],
            [a, a, b, d, a, a, b, a, b, b, a, a, a, b, a, a],
            [a, b, b, g, d, a, a, a, a, a, a, d, a, b, b, a],
            [b, g, b, g, d, a, a, a, a, a, a, d, a, b, a, b],
            [d, b, g, d, g, a, d, a, a, a, d, d, a, a, b, a],
            [a, b, g, d, b, g, d, a, b, a, a, b, d, a, b, a],
            [a, b, g, d, b, g, d, a, b, d, a, b, d, a, b, a],
            [b, g, d, b, g, d, d, b, b, b, d, a, b, d, a, b],
            [d, b, b, g, d, b, b, b, b, b, b, b, a, b, b, a],
            [a, d, d, b, b, b, d, d, d, d, d, b, b, b, a, a]
        ]));
        images.add('Rock', new Image([
            [a, a, a, a, a, a, b, b, b, b, a, a, a, a, a, a],
            [a, a, a, b, b, b, d, d, d, d, b, b, a, a, a, a],
            [a, a, b, d, a, a, d, a, a, a, d, d, b, a, a, a],
            [a, b, d, a, a, c, d, a, a, a, a, a, d, b, a, a],
            [a, b, d, d, a, c, c, d, a, a, a, d, d, a, b, a],
            [a, b, d, d, d, a, c, c, d, d, d, c, d, d, b, a],
            [a, b, d, d, d, d, d, c, d, d, d, c, c, b, b, a],
            [a, b, b, c, d, d, d, d, d, d, d, c, c, a, b, b],
            [a, d, b, b, c, d, d, d, d, d, c, c, a, a, a, b],
            [a, d, b, a, d, d, d, a, a, d, d, d, d, d, a, b],
            [d, b, a, d, a, c, d, d, d, a, b, c, d, d, d, b],
            [d, b, c, d, d, a, b, c, d, a, b, c, d, d, d, b],
            [d, b, c, c, d, a, b, c, d, d, b, b, c, d, d, b],
            [d, b, b, b, c, c, b, b, c, b, b, b, b, c, b, a],
            [d, d, b, b, b, b, d, d, d, d, d, b, b, b, a, a],
            [a, d, d, d, d, d, d, a, a, d, d, d, d, d, a, a]
        ]));
        images.add('Bush', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, b, b, a, a, a, a, a, a, a],
            [a, a, a, a, b, b, b, g, b, b, b, b, a, a, a, a],
            [a, a, a, b, g, b, b, g, g, b, b, a, b, a, a, a],
            [a, a, b, b, b, g, b, g, a, b, a, b, b, b, a, a],
            [a, b, g, g, b, b, g, g, g, a, b, b, g, g, b, a],
            [a, a, b, g, g, b, b, b, b, b, b, g, g, b, a, a],
            [a, a, b, g, b, g, b, b, g, b, g, b, a, b, a, a],
            [c, a, b, b, b, b, b, g, a, b, b, b, b, b, a, c],
            [a, b, g, b, b, g, g, g, g, g, a, b, b, a, b, a],
            [g, b, g, g, b, b, g, g, g, g, b, b, a, a, b, a],
            [g, b, b, g, g, b, b, b, b, b, b, g, g, b, b, a],
            [a, g, b, b, b, b, g, g, g, a, b, b, b, b, a, a],
            [a, g, g, b, b, b, b, b, b, b, b, b, b, a, a, a],
            [a, a, g, g, g, g, b, b, b, b, g, g, g, a, a, a],
            [a, a, a, g, g, g, g, g, g, g, g, a, a, a, a, a]
        ]));
        images.add('Pedestal', new Image([
            [Z, Z, c, c, c, c, c, c, c, c, c, c, c, Z, Z, Z],
            [Z, c, d, d, d, d, d, d, d, d, d, d, d, c, Z, Z],
            [c, c, a, c, c, c, c, c, c, c, c, c, d, c, c, Z],
            [c, c, a, c, d, c, d, d, a, c, d, c, d, c, c, Z],
            [c, c, a, c, c, d, d, d, d, a, c, c, d, c, c, Z],
            [c, c, a, c, d, d, d, d, d, d, a, c, d, c, c, Z],
            [c, c, a, c, d, d, d, d, d, d, d, c, d, c, c, Z],
            [c, c, a, c, c, d, d, d, d, d, c, c, d, c, c, Z],
            [c, c, a, c, d, c, d, d, d, c, d, c, d, c, c, Z],
            [c, c, a, c, c, c, c, c, c, c, c, c, d, c, c, Z],
            [c, c, a, a, a, a, a, a, a, a, a, a, a, c, c, d],
            [c, c, d, d, d, d, d, d, d, d, d, d, a, c, c, d],
            [c, d, c, c, c, c, c, c, c, c, c, c, c, a, c, d],
            [c, d, d, d, d, d, d, d, d, d, d, d, d, d, c, d],
            [d, c, c, c, c, c, c, c, c, c, c, c, c, c, d, d],
            [Z, d, d, d, d, d, d, d, d, d, d, d, d, d, Z, Z]
        ]));
        images.add('WallTopRightDown', new Image([
            [a, a, d, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [a, d, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [d, b, b, b, d, d, d, d, d, d, d, d, d, d, d, d],
            [b, b, b, d, d, d, d, d, d, d, d, d, d, d, d, d],
            [b, b, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
            [b, b, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
            [b, b, d, d, d, d, d, b, b, b, b, b, b, b, b, b],
            [b, b, d, d, d, d, b, b, b, b, b, b, b, b, b, b],
            [b, b, d, d, d, d, b, b, b, b, b, b, b, b, b, b],
            [b, b, d, d, d, d, b, b, b, b, a, a, a, a, a, b],
            [b, b, d, d, d, d, b, b, b, a, a, a, a, a, a, b],
            [b, b, d, d, d, d, b, b, b, a, a, a, a, d, d, b],
            [b, b, d, d, d, d, b, b, b, a, a, a, d, d, d, b],
            [b, b, d, d, d, d, b, b, b, a, a, d, d, d, b, b],
            [b, b, d, d, d, d, b, b, b, a, a, d, d, b, b, b],
            [b, b, d, d, d, d, b, b, b, b, b, b, b, b, b, b]
        ]));
        images.add('Background', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('BigDoor0', new Image([
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, f, f, f, f, f, f, f, f, f, f, f, f, f, f],
            [e, e, h, f, f, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, f, f, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, f, f, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, f, f, e, f, f, f, f, f, f, f, f, f, f, f],
            [e, e, f, f, f, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, f, f, f, f, f, f, f, f, f, f, f, f, f, f],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, f, f, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, e, f, i, i, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, i, i, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i]
        ]));
        images.add('BigDoor1', new Image([
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, f],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [f, f, f, f, f, f, f, f, f, f, f, f, f, f, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, f, f, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, f, e],
            [i, i, i, i, i, i, i, i, i, i, i, i, e, e, f, e],
            [f, f, f, f, f, f, f, f, f, f, f, f, f, e, f, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, f, f, e],
            [f, f, f, f, f, f, f, f, f, f, f, f, f, f, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, i, e],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, i, f],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, f],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, f]
        ]));
        images.add('BigDoor2', new Image([
            [f, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, f, f, f, f, f, f, f, f, f, f, f, f, f, f],
            [e, f, f, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, f, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, f, e, f, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, f, e, f, f, f, f, f, f, f, f, f, f, f, f, f],
            [e, f, f, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, f, f, f, f, f, f, f, f, f, f, f, f, f, f],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, i, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, i, i, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, i, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i]
        ]));
        images.add('BigDoor3', new Image([
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [f, f, f, f, f, f, f, f, f, f, f, f, f, f, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, f, f, f, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, f, f, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, f, f, e, e],
            [f, f, f, f, f, f, f, f, f, f, f, e, f, f, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, f, f, f, e, e],
            [f, f, f, f, f, f, f, f, f, f, f, f, f, f, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [i, i, i, i, i, i, i, i, i, i, i, i, f, f, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, i, i, f, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e]
        ]));
        images.add('Pit', new Image([
            [c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c],
            [c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c],
            [c, c, c, b, c, c, c, c, c, c, c, b, c, c, c, c],
            [c, c, b, a, b, c, c, c, c, c, b, a, b, c, c, c],
            [c, d, b, a, b, d, d, d, d, d, b, a, b, d, d, c],
            [c, b, b, a, c, b, d, d, d, b, b, a, c, b, d, c],
            [c, b, b, a, c, b, d, d, d, b, b, a, c, b, d, c],
            [c, c, b, b, b, c, d, d, d, c, b, b, b, c, d, c],
            [c, d, c, c, c, d, d, d, d, d, c, c, c, d, d, c],
            [c, d, d, d, d, d, d, d, d, d, d, d, d, d, d, c],
            [c, d, d, b, d, d, d, d, d, d, d, b, d, d, d, c],
            [c, d, b, a, b, d, d, d, d, d, b, a, b, d, d, c],
            [c, d, b, a, b, d, d, d, d, d, b, a, b, d, d, c],
            [c, b, b, a, c, b, d, d, d, b, b, a, c, b, d, c],
            [c, b, b, a, c, b, d, d, d, b, b, a, c, b, d, c],
            [c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c]
        ]));
        images.add('Crate', new Image([
            [d, e, e, e, e, e, e, e, e, e, e, e, e, e, e, d],
            [e, e, j, k, k, k, k, k, k, k, k, k, k, j, e, e],
            [e, j, j, e, e, e, e, e, e, e, e, e, e, j, j, e],
            [e, k, e, e, k, j, k, k, k, k, k, k, e, e, k, e],
            [e, k, e, k, k, j, k, j, j, j, j, k, k, e, k, e],
            [e, k, e, k, k, j, j, j, j, k, j, k, k, e, k, e],
            [e, k, e, e, k, k, k, k, k, k, j, k, e, e, k, e],
            [e, j, j, e, e, e, e, e, e, e, e, e, e, j, j, e],
            [e, e, j, k, k, k, k, k, k, k, k, k, k, j, e, e],
            [e, j, e, e, e, e, e, e, e, e, e, e, e, e, j, e],
            [e, e, j, j, j, j, j, e, e, j, j, j, j, j, e, e],
            [e, j, e, e, e, e, j, e, e, j, e, e, e, e, j, e],
            [e, j, e, j, j, e, j, e, e, j, e, j, j, e, j, e],
            [e, j, e, e, j, e, j, e, e, j, e, j, e, e, j, e],
            [e, e, j, j, j, e, j, j, j, j, e, j, j, j, e, e],
            [d, e, e, e, e, e, e, e, e, e, e, e, e, e, e, d]
        ]));
        images.add('OrangeRock', new Image([
            [a, a, a, a, a, a, e, e, e, e, a, a, a, a, a, a],
            [a, a, a, e, e, e, l, l, l, l, e, e, a, a, a, a],
            [a, a, e, l, l, l, l, l, l, l, l, l, e, a, a, a],
            [a, e, l, l, l, n, l, l, l, l, l, l, l, e, a, a],
            [a, e, l, l, l, n, l, l, l, l, l, l, n, l, e, a],
            [a, e, l, n, l, l, n, l, l, l, l, e, n, n, e, a],
            [a, e, l, n, n, n, n, n, l, l, n, e, e, e, e, a],
            [a, e, e, e, n, n, n, n, n, n, n, e, e, l, l, e],
            [a, n, e, e, e, n, l, l, n, n, e, n, l, l, l, e],
            [a, n, e, l, n, e, n, n, l, n, n, l, n, n, n, e],
            [n, e, l, n, l, e, n, n, n, l, e, e, n, n, n, e],
            [n, e, e, n, n, l, e, e, n, l, e, e, n, n, n, e],
            [n, e, e, e, n, l, e, e, n, n, e, e, e, n, n, e],
            [n, e, e, e, e, e, e, e, e, e, e, e, e, e, e, q],
            [n, n, e, e, e, e, n, n, n, n, n, e, e, e, q, q],
            [q, n, n, n, n, n, q, q, q, q, n, n, n, n, q, q]
        ]));
        images.add('WallTopUpDown', new Image([
            [b, b, b, d, d, b, b, b, b, b, b, b, b, b, b, b],
            [b, b, d, d, d, d, b, b, b, b, a, a, b, b, b, b],
            [b, b, d, d, d, d, b, b, b, a, a, d, d, b, b, b],
            [b, b, d, d, d, d, b, b, b, a, a, d, d, d, b, b],
            [b, b, d, d, d, d, b, b, b, a, a, d, d, d, b, b],
            [b, b, d, d, d, d, b, b, b, a, a, a, d, d, b, b],
            [b, b, d, d, d, d, b, b, b, b, b, b, d, d, b, b],
            [b, b, d, d, d, d, b, b, b, b, b, b, b, d, b, b],
            [b, b, d, d, d, d, b, b, b, b, a, b, b, b, b, b],
            [b, b, d, d, d, d, b, b, b, b, a, a, b, b, b, b],
            [b, b, d, d, d, d, b, b, b, b, a, d, d, b, b, b],
            [b, b, d, d, d, d, b, b, b, a, a, d, d, b, b, b],
            [b, b, d, d, d, d, b, b, b, a, a, d, d, d, b, b],
            [b, b, d, d, d, d, b, b, b, a, a, d, d, d, b, b],
            [b, b, d, d, d, d, b, b, b, b, b, a, d, d, b, b],
            [b, b, b, d, d, b, b, b, b, b, b, b, b, d, b, b]
        ]));
        images.add('PlayerPushingRight', new Image([
            [Z, Z, Z, e, Z, e, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, e, m, e, m, e, Z, e, e, e, e, Z, Z, Z, Z],
            [Z, e, e, e, Z, e, e, e, e, m, e, e, e, e, Z, Z],
            [e, m, m, e, Z, e, e, e, e, e, e, m, e, m, e, Z],
            [Z, e, e, e, e, e, e, e, e, e, e, e, e, o, e, Z],
            [Z, Z, Z, Z, e, e, e, e, e, e, e, e, e, e, e, Z],
            [Z, Z, Z, e, e, e, e, e, e, o, o, m, e, e, e, Z],
            [Z, Z, Z, Z, e, e, m, e, e, e, o, m, e, o, e, Z],
            [Z, Z, Z, Z, Z, e, m, m, e, e, e, o, e, e, e, e],
            [Z, Z, Z, Z, Z, Z, e, e, e, o, o, e, o, m, o, e],
            [Z, Z, Z, Z, Z, Z, e, e, o, o, e, o, o, m, o, e],
            [Z, Z, Z, Z, Z, e, e, m, o, o, o, e, e, e, e, a],
            [Z, Z, Z, Z, e, o, m, e, m, m, m, e, e, Z, Z, Z],
            [Z, Z, Z, e, o, o, e, m, e, m, e, m, e, Z, Z, Z],
            [Z, Z, Z, e, o, e, e, e, e, e, e, o, o, e, Z, Z],
            [Z, Z, e, e, e, e, e, e, e, e, e, e, e, e, Z, Z]
        ]));
        images.add('BigDoor4', new Image([
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, e],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, e, e, f],
            [e, e, i, i, e, f, i, i, i, i, i, i, e, f, f, e],
            [e, e, i, i, e, f, i, i, i, i, i, e, f, e, e, e],
            [e, e, i, i, e, f, i, i, i, i, e, f, e, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, f, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, f, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, f, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, e, f, f, e],
            [e, e, i, i, e, f, i, i, i, i, e, f, e, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, e, n, f, e],
            [e, e, i, i, e, f, i, i, i, i, e, f, f, e, n, n],
            [e, e, i, i, e, f, i, i, i, i, i, e, e, f, e, e],
            [e, e, i, i, e, f, i, i, i, i, i, e, n, e, n, n]
        ]));
        images.add('BigDoor5', new Image([
            [i, e, e, i, i, i, i, i, i, i, i, i, i, i, i, f],
            [e, f, i, e, i, i, i, i, i, i, i, i, i, i, i, f],
            [f, e, e, i, e, i, i, i, i, i, i, i, i, i, i, f],
            [e, e, e, e, i, e, e, i, i, i, i, i, i, i, i, f],
            [f, e, e, e, e, i, i, e, i, i, i, i, i, i, i, f],
            [f, e, e, e, e, e, e, i, e, i, i, i, i, i, i, f],
            [f, e, e, e, e, e, e, e, i, e, i, i, i, i, i, f],
            [e, f, f, e, f, e, e, e, e, i, e, i, i, i, i, f],
            [e, e, e, e, f, e, e, e, e, i, e, i, i, i, i, f],
            [e, e, e, e, f, e, e, e, e, i, e, i, i, i, i, f],
            [e, e, e, e, e, f, f, e, e, i, e, i, i, i, i, f],
            [e, f, f, e, e, e, e, e, i, e, i, i, i, i, i, f],
            [n, n, n, f, e, n, f, e, e, i, e, i, i, i, i, f],
            [e, n, n, e, n, n, e, i, i, e, i, i, i, i, i, f],
            [n, e, e, n, e, e, i, e, e, i, i, i, i, i, i, f],
            [e, e, e, e, n, n, e, n, e, i, i, i, i, i, i, f]
        ]));
        images.add('BigDoor6', new Image([
            [e, i, i, i, i, i, i, i, i, i, i, i, i, e, e, i],
            [e, i, i, i, i, i, i, i, i, i, i, i, e, f, i, e],
            [e, i, i, i, i, i, i, i, i, i, i, e, f, e, e, i],
            [e, i, i, i, i, i, i, i, i, e, e, f, e, e, e, e],
            [e, i, i, i, i, i, i, i, e, f, f, e, f, e, e, e],
            [e, i, i, i, i, i, i, e, f, e, e, e, f, e, e, e],
            [e, i, i, i, i, i, e, f, e, e, e, e, f, e, e, e],
            [e, i, i, i, i, e, f, e, f, e, e, e, e, f, f, e],
            [e, i, i, i, i, e, f, e, f, e, e, e, e, e, e, e],
            [e, i, i, i, i, e, f, e, f, e, e, e, e, e, e, e],
            [e, i, i, i, i, e, f, e, e, f, f, e, e, e, e, e],
            [e, i, i, i, i, i, e, f, e, e, e, e, e, f, f, e],
            [e, i, i, i, i, e, f, e, e, p, f, e, p, p, p, f],
            [e, i, i, i, i, i, e, f, f, e, p, p, e, p, p, e],
            [e, i, i, i, i, i, i, e, e, f, e, e, p, e, e, p],
            [e, i, i, i, i, i, i, e, p, e, p, p, e, e, e, e]
        ]));
        images.add('BigDoor7', new Image([
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [e, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, e, e, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [e, i, i, e, i, i, i, i, i, i, e, e, i, i, e, e],
            [e, e, e, i, e, i, i, i, i, i, e, e, i, i, e, e],
            [e, e, e, e, i, e, i, i, i, i, e, e, i, i, e, e],
            [f, e, e, e, e, i, e, i, i, i, e, e, i, i, e, e],
            [f, e, e, e, e, i, e, i, i, i, e, e, i, i, e, e],
            [f, e, e, e, e, i, e, i, i, i, e, e, i, i, e, e],
            [e, f, f, e, e, i, e, i, i, i, e, e, i, i, e, e],
            [e, e, e, e, i, e, i, i, i, i, e, e, i, i, e, e],
            [e, p, f, e, e, i, e, i, i, i, e, e, i, i, e, e],
            [p, p, e, i, i, e, i, i, i, i, e, e, i, i, e, e],
            [e, e, i, e, e, i, i, i, i, i, e, e, i, i, e, e],
            [p, p, e, p, e, i, i, i, i, i, e, e, i, i, e, e]
        ]));
        images.add('NextRoomArrow', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, d, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, d, d, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, d, d, d, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, d, d, d, d, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, d, d, d, d, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, d, d, d, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, d, d, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, d, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('Lock', new Image([
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l],
            [e, r, r, l, l, l, l, s, r, l, l, l, l, r, r, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, r, l, e],
            [e, r, r, r, s, s, s, s, s, s, s, s, r, l, l, e],
            [e, r, r, r, s, s, l, e, e, s, s, s, r, l, l, e],
            [e, r, r, r, s, l, e, e, e, e, s, s, r, l, l, e],
            [e, r, r, r, s, l, e, e, e, e, s, s, r, l, l, e],
            [e, r, s, r, s, s, l, e, e, s, s, s, r, r, l, e],
            [e, s, r, r, s, s, l, e, e, s, s, s, r, l, r, e],
            [e, r, r, r, s, s, s, l, l, s, s, s, r, l, l, e],
            [e, r, r, r, s, s, s, s, s, s, s, s, r, l, l, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, l, l, e],
            [e, r, r, s, s, s, s, l, r, s, s, s, s, r, l, e],
            [e, r, s, s, s, s, s, l, r, s, s, s, s, s, r, e],
            [e, s, s, s, s, s, s, l, r, s, s, s, s, s, s, e],
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l]
        ]));
        images.add('WallLadder', new Image([
            [b, b, b, b, b, a, a, a, a, a, a, b, b, b, b, b],
            [b, b, d, d, a, d, a, a, a, a, d, a, d, d, b, b],
            [b, b, b, d, d, d, d, d, d, d, d, d, d, b, b, b],
            [d, b, b, b, b, b, b, b, b, b, b, b, b, b, b, d],
            [b, b, b, b, b, a, a, a, a, a, a, b, b, b, b, b],
            [b, b, d, d, a, a, a, a, a, a, a, a, d, d, b, b],
            [b, b, b, d, d, d, d, a, d, d, d, a, d, b, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, b, b, b, b, a, a, a, a, a, a, b, b, b, b, b],
            [b, b, d, d, a, a, d, d, a, d, a, d, d, d, b, b],
            [b, b, b, d, d, d, d, d, d, d, d, a, d, b, b, b],
            [d, b, b, b, b, b, b, b, b, b, b, b, b, b, b, d],
            [b, b, b, b, b, a, d, a, a, a, a, b, b, b, b, b],
            [b, b, d, a, d, d, a, a, d, a, a, d, a, d, b, b],
            [b, b, b, d, d, d, d, d, d, d, d, d, d, b, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b]
        ]));
        images.add('WallTopLeftRight', new Image([
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, d, d, d, d, d, d, d, d, d, d, d, d, d, d, b],
            [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
            [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
            [b, d, d, d, d, d, d, d, d, d, d, d, d, d, d, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, a, a, a, a, a, b, b, b, a, a, a, a, a, b, b],
            [a, a, a, a, a, a, a, b, a, a, a, a, a, a, a, b],
            [d, d, d, d, a, a, a, b, d, a, a, d, d, d, d, b],
            [b, d, d, d, d, d, b, b, d, d, d, d, d, d, b, b],
            [b, b, d, d, d, b, b, b, b, b, d, d, d, b, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b]
        ]));
        images.add('WallTopUpLeft', new Image([
            [b, b, d, d, d, d, b, b, b, b, b, b, b, b, b, b],
            [b, d, d, d, d, d, b, b, b, b, a, a, b, b, b, b],
            [d, d, d, d, d, b, b, b, b, a, a, d, d, b, b, b],
            [d, d, d, d, d, b, b, b, b, a, a, d, d, b, b, b],
            [d, d, d, d, b, b, b, b, b, a, a, a, d, b, b, b],
            [d, d, b, b, b, b, b, b, b, a, a, d, d, d, b, b],
            [b, b, b, b, b, b, b, b, b, a, a, d, d, d, b, b],
            [b, b, b, b, b, b, b, b, b, b, a, d, d, d, b, b],
            [b, b, b, b, b, b, a, a, b, b, b, d, d, d, b, b],
            [b, b, a, a, a, a, a, a, a, b, b, d, d, b, b, b],
            [b, a, a, a, a, a, a, d, d, b, b, d, b, b, b, b],
            [b, a, a, a, d, d, d, d, d, b, b, b, b, b, b, b],
            [b, d, d, d, d, d, d, d, d, b, b, b, b, b, b, b],
            [b, d, d, d, d, d, d, d, b, b, b, b, b, a, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, a, a, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, a, a, a, b, b]
        ]));
        images.add('PlayerPushingUp', new Image([
            [Z, e, e, e, Z, e, e, e, e, e, e, Z, e, e, e, Z],
            [e, o, o, e, e, e, e, e, e, e, e, e, o, o, e, Z],
            [e, m, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, o, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, o, e, e, e, e, e, e, e, e, e, e, e, e, o, e],
            [e, e, e, m, e, e, e, e, e, e, e, e, m, e, e, e],
            [a, e, e, e, e, e, e, e, e, e, e, e, e, e, e, Z],
            [a, a, e, e, o, o, e, e, e, e, o, o, e, e, Z, Z],
            [a, a, a, e, o, o, o, o, o, o, o, o, e, Z, Z, Z],
            [a, a, a, e, e, o, o, o, o, o, o, e, e, Z, Z, Z],
            [a, a, a, a, e, m, e, o, o, o, e, e, Z, Z, Z, Z],
            [a, a, a, a, e, e, m, m, e, e, m, e, Z, Z, Z, Z],
            [a, a, a, a, e, e, m, e, m, m, e, e, Z, Z, Z, Z],
            [a, a, a, a, a, e, e, a, e, m, o, e, Z, Z, Z, Z],
            [a, a, a, a, a, a, a, a, e, o, o, e, Z, Z, Z, Z],
            [a, a, a, a, a, a, a, a, e, e, e, Z, Z, Z, Z, Z]
        ]));
        images.add('BigDoor8', new Image([
            [e, e, i, i, e, f, i, i, i, i, i, e, n, n, e, e],
            [e, e, i, i, e, f, i, i, i, i, i, i, e, e, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, e],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, e, e, f],
            [e, e, i, i, e, f, i, i, i, i, i, i, e, f, f, e],
            [e, e, i, i, e, f, i, i, i, i, i, e, f, e, e, e],
            [e, e, i, i, e, f, i, i, i, i, e, f, e, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, f, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, f, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, f, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, e, f, f, e]
        ]));
        images.add('BigDoor9', new Image([
            [n, n, n, n, e, e, n, n, e, i, i, i, i, i, i, f],
            [e, e, e, e, i, i, e, e, i, i, i, i, i, i, i, f],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, f],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, f],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, f],
            [i, e, e, i, i, i, i, i, i, i, i, i, i, i, i, f],
            [e, f, i, e, i, i, i, i, i, i, i, i, i, i, i, f],
            [f, e, e, i, e, i, i, i, i, i, i, i, i, i, i, f],
            [e, e, e, e, i, e, e, i, i, i, i, i, i, i, i, f],
            [f, e, e, e, e, i, i, e, i, i, i, i, i, i, i, f],
            [f, e, e, e, e, e, e, i, e, i, i, i, i, i, i, f],
            [f, e, e, e, e, e, e, e, i, e, i, i, i, i, i, f],
            [e, f, f, e, f, e, e, e, e, i, e, i, i, i, i, f],
            [e, e, e, e, f, e, e, e, e, i, e, i, i, i, i, f],
            [e, e, e, e, f, e, e, e, e, i, e, i, i, i, i, f],
            [e, e, e, e, e, f, f, e, e, i, e, i, i, i, i, f]
        ]));
        images.add('BigDoor10', new Image([
            [e, i, i, i, i, i, i, e, p, p, e, e, p, p, p, p],
            [e, i, i, i, i, i, i, i, e, e, i, i, e, e, e, e],
            [e, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, i, i, i, i, i, i, i, i, i, i, i, i, e, e, i],
            [e, i, i, i, i, i, i, i, i, i, i, i, e, f, i, e],
            [e, i, i, i, i, i, i, i, i, i, i, e, f, e, e, i],
            [e, i, i, i, i, i, i, i, i, e, e, f, e, e, e, e],
            [e, i, i, i, i, i, i, i, e, f, f, e, f, e, e, e],
            [e, i, i, i, i, i, i, e, f, e, e, e, f, e, e, e],
            [e, i, i, i, i, i, e, f, e, e, e, e, f, e, e, e],
            [e, i, i, i, i, e, f, e, f, e, e, e, e, f, f, e],
            [e, i, i, i, i, e, f, e, f, e, e, e, e, e, e, e],
            [e, i, i, i, i, e, f, e, f, e, e, e, e, e, e, e],
            [e, i, i, i, i, e, f, e, e, f, f, e, e, e, e, e]
        ]));
        images.add('BigDoor11', new Image([
            [e, e, p, p, e, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, e, e, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [e, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, e, e, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [e, i, i, e, i, i, i, i, i, i, e, e, i, i, e, e],
            [e, e, e, i, e, i, i, i, i, i, e, e, i, i, e, e],
            [e, e, e, e, i, e, i, i, i, i, e, e, i, i, e, e],
            [f, e, e, e, e, i, e, i, i, i, e, e, i, i, e, e],
            [f, e, e, e, e, i, e, i, i, i, e, e, i, i, e, e],
            [f, e, e, e, e, i, e, i, i, i, e, e, i, i, e, e],
            [e, f, f, e, e, i, e, i, i, i, e, e, i, i, e, e]
        ]));
        images.add('Hole', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, t, t, a, t, t, a, t, t, a, a, a, a],
            [a, a, a, t, t, t, t, t, t, t, t, t, t, a, a, a],
            [a, a, e, t, t, e, t, e, e, t, e, t, t, e, a, a],
            [a, t, t, e, t, e, e, e, e, e, e, t, e, t, t, a],
            [a, e, e, t, e, e, e, e, e, e, e, e, t, e, e, a],
            [a, t, e, e, e, e, e, e, e, e, e, e, e, e, t, a],
            [a, a, t, e, e, e, e, e, e, e, e, e, e, t, a, a],
            [a, t, e, e, e, e, e, e, e, e, e, e, e, e, t, a],
            [a, e, e, e, e, e, e, e, e, e, e, e, e, e, e, a],
            [a, a, e, e, e, e, e, e, e, e, e, e, e, e, a, a],
            [a, t, e, e, e, e, e, e, e, e, e, e, e, e, t, a],
            [a, e, e, e, e, e, e, e, e, e, e, e, e, e, e, a],
            [a, a, e, e, e, e, e, e, e, e, e, e, e, e, a, a],
            [a, a, a, e, e, e, e, e, e, e, e, e, e, a, a, a],
            [a, a, a, a, a, e, e, e, e, e, e, a, a, a, a, a]
        ]));
        images.add('HoleCrate', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, u, a, u, u, a, u, a, a, a, a, a],
            [a, u, u, u, u, u, u, u, u, u, u, u, u, u, u, a],
            [u, u, y, z, z, z, z, z, z, z, z, z, z, y, u, u],
            [u, y, y, u, u, u, u, u, u, u, u, u, u, y, y, u],
            [u, z, u, u, z, y, z, z, z, z, z, z, u, u, z, u],
            [u, z, u, z, z, y, z, y, y, y, y, z, z, u, z, u],
            [u, z, u, z, z, y, y, y, y, z, y, z, z, u, z, u],
            [u, z, u, u, z, z, z, z, z, z, y, z, u, u, z, u],
            [u, y, y, u, u, u, u, u, u, u, u, u, u, y, y, u],
            [u, u, y, z, z, z, z, z, z, z, z, z, z, y, u, u],
            [u, y, u, u, u, u, u, u, u, u, u, u, u, u, y, u],
            [a, u, y, u, y, u, y, u, u, y, u, y, u, y, u, a],
            [a, a, u, a, u, u, u, u, u, u, u, u, a, u, a, a],
            [a, a, a, a, a, u, a, u, u, a, u, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('HoleStraw', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, v, v, a, v, v, a, v, v, a, a, a, a],
            [a, a, a, v, v, v, v, v, v, v, v, v, v, a, a, a],
            [a, a, e, v, v, e, v, e, e, v, e, v, v, e, a, a],
            [a, v, v, A, v, v, v, v, v, v, A, A, A, v, v, a],
            [a, e, e, v, e, e, v, e, e, v, e, e, v, e, e, a],
            [a, v, A, A, v, A, A, A, A, e, A, A, A, A, v, a],
            [a, a, v, e, e, v, e, e, e, e, v, e, e, v, a, a],
            [a, v, A, A, A, A, A, v, v, A, A, A, A, A, v, a],
            [a, e, e, e, e, e, e, e, e, v, e, e, e, e, e, a],
            [a, a, A, A, A, e, A, v, A, A, A, v, A, e, a, a],
            [a, v, e, e, e, v, v, v, e, e, e, e, e, e, v, a],
            [a, e, A, v, v, v, A, A, A, v, A, A, A, v, e, a],
            [a, a, v, v, e, v, e, e, e, v, e, e, v, v, a, a],
            [a, a, a, v, v, e, e, e, e, e, v, v, v, a, a, a],
            [a, a, a, a, a, v, v, v, v, e, e, a, a, a, a, a]
        ]));
        images.add('Wall', new Image([
            [a, a, a, a, a, a, b, b, b, b, a, a, a, a, a, a],
            [a, d, d, d, d, a, a, b, b, d, d, d, d, a, a, a],
            [d, d, d, d, d, d, a, b, d, d, d, d, d, d, d, d],
            [d, d, d, b, b, d, d, b, d, d, d, d, d, d, b, d],
            [d, d, d, d, d, d, d, b, b, d, d, b, b, d, d, d],
            [d, d, b, d, d, d, b, b, b, b, d, d, d, d, d, d],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, b, a, a, a, a, a, a, a, a, a, a, a, a, b, b],
            [b, d, d, d, d, d, d, d, a, a, a, d, a, a, a, b],
            [b, d, d, d, a, d, d, d, d, d, d, d, d, a, a, b],
            [b, d, d, d, d, d, d, d, d, d, d, b, d, d, a, b],
            [b, d, d, d, d, b, b, d, d, d, d, d, d, d, a, b],
            [b, b, d, d, d, d, d, d, b, b, d, d, d, d, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b]
        ]));
        images.add('WallVert', new Image([
            [a, a, a, a, b, b, b, b, b, b, a, d, d, a, b, b],
            [d, a, a, a, a, b, b, b, b, a, d, d, d, d, b, b],
            [d, d, d, d, a, a, b, b, d, d, d, d, d, b, b, b],
            [d, d, d, d, d, a, b, b, d, d, b, d, b, b, b, b],
            [d, d, b, b, d, d, b, b, d, d, d, b, b, a, b, b],
            [d, d, d, d, d, b, b, b, d, d, b, b, b, a, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, a, a, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, a, a, a, b, b],
            [b, b, a, a, a, a, a, a, b, b, b, a, d, a, b, b],
            [b, b, d, d, d, d, d, d, a, b, b, d, d, d, b, b],
            [b, d, b, d, d, d, a, d, d, a, b, d, d, d, b, b],
            [b, d, d, d, b, b, d, d, d, d, b, d, d, b, b, b],
            [b, d, d, d, d, d, d, d, b, d, b, b, b, b, b, b],
            [b, d, d, d, d, d, d, d, d, b, b, b, b, a, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, b, a, a, b, b],
            [b, b, b, b, b, b, b, b, b, b, b, a, a, a, b, b]
        ]));
        images.add('PlayerPushingDown', new Image([
            [a, a, a, a, a, a, a, e, Z, Z, Z, Z, Z, Z, Z, Z],
            [a, e, e, a, a, a, e, m, e, Z, Z, Z, e, e, Z, Z],
            [a, e, m, e, a, a, e, m, e, Z, Z, e, m, e, Z, Z],
            [a, a, e, m, e, e, e, e, e, e, e, m, m, e, Z, Z],
            [a, a, a, e, e, e, e, e, e, e, e, e, e, e, e, Z],
            [a, a, e, e, e, o, e, e, e, e, m, e, e, e, e, Z],
            [a, e, e, e, e, e, e, o, m, e, e, e, e, e, Z, Z],
            [a, e, e, e, e, e, e, o, m, e, e, e, e, Z, Z, Z],
            [a, e, e, m, e, e, e, e, e, e, e, e, m, e, Z, Z],
            [a, a, e, m, e, e, e, e, e, e, e, e, m, e, Z, Z],
            [a, a, e, e, e, m, e, o, o, e, m, e, e, e, Z, Z],
            [a, e, e, o, e, o, o, o, o, o, o, e, o, e, e, Z],
            [a, e, m, m, e, e, o, o, o, o, e, e, m, m, e, Z],
            [a, e, o, o, e, e, e, e, e, e, e, e, o, o, e, Z],
            [a, e, o, o, o, e, e, e, e, e, e, o, o, o, e, Z],
            [a, a, e, e, e, e, Z, Z, Z, Z, e, e, e, e, Z, Z]
        ]));
        images.add('BigDoor12', new Image([
            [e, e, i, i, e, f, i, i, i, i, e, f, e, e, e, e],
            [e, e, i, i, e, f, i, i, i, e, f, e, e, w, f, e],
            [e, e, i, i, e, f, i, i, i, i, e, f, f, e, w, w],
            [e, e, i, i, e, f, i, i, i, i, i, e, e, f, e, e],
            [e, e, i, i, e, f, i, i, i, i, i, e, w, e, w, w],
            [e, e, i, i, e, f, i, i, i, i, i, e, w, w, e, e],
            [e, e, i, i, e, f, i, i, i, i, i, i, e, e, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, i, i, i, i, i, i, i, i, i, i],
            [e, e, i, i, e, f, f, f, f, f, f, f, f, f, f, f],
            [e, e, i, i, f, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, i, i, i, f, f, f, f, f, f, f, f, f, f, f],
            [e, e, i, i, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i]
        ]));
        images.add('BigDoor13', new Image([
            [e, f, f, e, e, e, e, e, i, e, i, i, i, i, i, f],
            [w, w, w, f, e, w, f, e, e, i, e, i, i, i, i, f],
            [e, w, w, e, w, w, e, i, i, e, i, i, i, i, i, f],
            [w, e, e, w, e, e, i, e, e, i, i, i, i, i, i, f],
            [e, e, e, e, w, w, e, w, e, i, i, i, i, i, i, f],
            [w, w, w, w, e, e, w, w, e, i, i, i, i, i, i, f],
            [e, e, e, e, i, i, e, e, i, i, i, i, i, i, i, f],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, f],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, f, e],
            [f, f, f, f, f, f, f, f, f, f, f, f, f, f, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, i, e],
            [f, f, f, f, f, f, f, f, f, f, f, f, f, f, i, e],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, f],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, f, f]
        ]));
        images.add('BigDoor14', new Image([
            [e, i, i, i, i, i, e, f, e, e, e, e, e, f, f, e],
            [e, i, i, i, i, e, f, e, e, x, f, e, x, x, x, f],
            [e, i, i, i, i, i, e, f, f, e, x, x, e, x, x, e],
            [e, i, i, i, i, i, i, e, e, f, e, e, x, e, e, x],
            [e, i, i, i, i, i, i, e, x, e, x, x, e, e, e, e],
            [e, i, i, i, i, i, i, e, x, x, e, e, x, x, x, x],
            [e, i, i, i, i, i, i, i, e, e, i, i, e, e, e, e],
            [e, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, f, i, i, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, e, f, f, f, f, f, f, f, f, f, f, f, f, f, f],
            [e, i, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, i, f, f, f, f, f, f, f, f, f, f, f, f, f, f],
            [e, e, i, i, i, i, i, i, i, i, i, i, i, i, i, i],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [f, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [f, f, i, i, i, i, i, i, i, i, i, i, i, i, i, i]
        ]));
        images.add('BigDoor15', new Image([
            [e, e, e, e, i, e, i, i, i, i, e, e, i, i, e, e],
            [e, x, f, e, e, i, e, i, i, i, e, e, i, i, e, e],
            [x, x, e, i, i, e, i, i, i, i, e, e, i, i, e, e],
            [e, e, i, e, e, i, i, i, i, i, e, e, i, i, e, e],
            [x, x, e, x, e, i, i, i, i, i, e, e, i, i, e, e],
            [e, e, x, x, e, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, e, e, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, e, e, i, i, e, e],
            [f, f, f, f, f, f, f, f, f, f, e, e, i, i, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, f, i, i, e, e],
            [f, f, f, f, f, f, f, f, f, f, f, i, i, i, e, e],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i]
        ]));
        images.add('Water0', new Image([
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B]
        ]));
        images.add('Water1', new Image([
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, h, B, h, h, B, B, B, h, h, h, h, B, h, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B]
        ]));
        images.add('Water2', new Image([
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, h, h, B, B, B, B, B, B, B, B, B, B],
            [B, B, h, h, h, h, h, h, h, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, h, h, h, B, B],
            [B, B, B, B, B, B, B, B, B, h, h, h, h, h, h, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B]
        ]));
        images.add('Water3', new Image([
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, h, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, h, h, h, B, B, B, B, B, B, B, B, B, B],
            [B, B, h, h, B, h, h, B, B, B, B, B, B, B, B, B],
            [h, h, B, B, B, B, h, h, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, h, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, h, h, h, h, B, B, B],
            [B, B, B, B, B, B, B, h, h, h, h, B, h, h, B, B],
            [B, B, B, B, B, h, h, h, B, B, B, B, B, h, h, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B]
        ]));
        images.add('Water4', new Image([
            [B, B, B, B, B, B, h, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, h, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, h, h, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, h, h, B, h, h, B, B, B, B, B, B, B, B, B],
            [B, h, h, B, B, B, B, h, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, h, B, h, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, h, B, h, B, B],
            [B, B, B, B, B, B, B, B, B, B, h, h, h, B, B, B],
            [B, B, B, B, B, B, B, B, h, h, B, B, h, h, B, B],
            [B, B, B, B, B, B, h, h, h, B, B, B, B, B, h, C],
            [B, B, B, B, h, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B]
        ]));
        images.add('TreeTop', new Image([
            [a, a, a, a, a, b, b, b, a, a, b, b, b, a, a, a],
            [a, a, a, b, b, b, d, d, b, b, d, d, d, b, a, a],
            [a, a, b, b, d, d, b, d, d, d, b, b, d, d, b, a],
            [a, a, b, d, d, b, d, d, b, d, d, b, b, b, d, b],
            [a, b, b, d, b, b, d, d, b, b, d, d, b, b, b, b],
            [a, b, b, d, b, d, d, b, d, b, b, b, d, b, a, b],
            [a, b, b, b, b, d, d, b, b, d, b, b, b, b, a, a],
            [a, b, b, b, b, b, d, b, b, d, d, b, b, b, b, a],
            [a, b, b, a, b, b, b, b, b, b, d, b, a, b, b, a],
            [a, b, b, a, b, b, b, b, b, b, b, b, a, a, b, a],
            [a, a, b, a, b, b, b, b, b, b, b, b, b, a, a, a],
            [a, a, a, a, b, b, b, b, g, b, a, b, b, b, a, a],
            [a, a, a, a, b, a, b, g, b, b, a, a, a, a, a, a],
            [a, a, a, a, a, a, b, b, a, b, a, a, a, a, a, a],
            [a, a, a, a, a, a, b, b, b, b, a, a, a, a, a, a],
            [a, a, a, a, a, a, b, b, a, b, a, a, a, a, a, a]
        ]));
        images.add('ArrowRight', new Image([
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l],
            [e, r, r, l, l, l, l, l, l, l, l, l, l, r, r, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, r, l, e],
            [e, r, r, r, s, e, e, e, e, s, s, s, r, l, l, e],
            [e, r, r, r, s, e, l, l, l, e, e, s, r, l, l, e],
            [e, r, r, r, s, s, e, l, l, l, l, e, r, l, l, e],
            [e, r, r, r, s, s, e, r, r, r, r, e, r, l, l, e],
            [e, r, r, r, s, e, r, r, r, e, e, r, r, l, l, e],
            [e, r, r, r, s, e, e, e, e, r, r, s, r, l, l, e],
            [e, r, r, r, s, r, r, r, r, s, s, s, r, l, l, e],
            [e, r, r, r, s, s, s, s, s, s, s, s, r, l, l, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, l, l, e],
            [e, r, r, s, s, s, s, s, s, s, s, s, s, r, l, e],
            [e, r, s, r, r, s, r, r, r, r, s, r, r, s, r, e],
            [e, s, r, s, r, r, r, s, s, r, r, r, s, r, s, e],
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l]
        ]));
        images.add('ArrowUp', new Image([
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l],
            [e, r, r, l, l, l, l, l, l, l, l, l, l, r, r, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, r, l, e],
            [e, r, r, r, s, s, r, e, e, s, s, s, r, l, l, e],
            [e, r, r, r, s, r, e, r, l, e, s, s, r, l, l, e],
            [e, r, r, r, s, r, e, r, l, e, s, s, r, l, l, e],
            [e, r, r, r, r, e, r, r, l, l, e, s, r, l, l, e],
            [e, r, r, r, r, e, r, r, l, l, e, s, r, l, l, e],
            [e, r, r, r, r, e, r, e, e, l, e, s, r, l, l, e],
            [e, r, r, r, r, e, e, s, s, e, e, s, r, l, l, e],
            [e, r, r, r, s, s, s, s, s, s, s, s, r, l, l, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, l, l, e],
            [e, r, r, s, s, s, s, s, s, s, s, s, s, r, l, e],
            [e, r, s, r, r, s, r, r, r, r, s, r, r, s, r, e],
            [e, s, r, s, r, r, r, s, s, r, r, r, s, r, s, e],
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l]
        ]));
        images.add('ArrowLeft', new Image([
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l],
            [e, r, r, l, l, l, l, l, l, l, l, l, l, r, r, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, r, l, e],
            [e, r, r, r, s, s, s, e, e, e, e, s, r, l, l, e],
            [e, r, r, r, s, e, e, l, l, l, e, s, r, l, l, e],
            [e, r, r, r, e, l, l, l, l, e, s, s, r, l, l, e],
            [e, r, r, r, e, r, r, r, r, e, s, s, r, l, l, e],
            [e, r, r, r, r, e, e, r, r, r, e, s, r, l, l, e],
            [e, r, r, r, s, r, r, e, e, e, e, s, r, l, l, e],
            [e, r, r, r, s, s, s, r, r, r, r, s, r, l, l, e],
            [e, r, r, r, s, s, s, s, s, s, s, s, r, l, l, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, l, l, e],
            [e, r, r, s, s, s, s, s, s, s, s, s, s, r, l, e],
            [e, r, s, r, r, s, r, r, r, r, s, r, r, s, r, e],
            [e, s, r, s, r, r, r, s, s, r, r, r, s, r, s, e],
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l]
        ]));
        images.add('ArrowDown', new Image([
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l],
            [e, r, r, l, l, l, l, l, l, l, l, l, l, r, r, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, r, l, e],
            [e, r, r, r, s, s, s, s, s, s, s, s, r, l, l, e],
            [e, r, r, r, r, e, e, s, s, e, e, s, r, l, l, e],
            [e, r, r, r, r, e, r, e, e, l, e, s, r, l, l, e],
            [e, r, r, r, r, e, r, r, l, l, e, s, r, l, l, e],
            [e, r, r, r, r, e, r, r, l, l, e, s, r, l, l, e],
            [e, r, r, r, s, r, e, r, l, e, s, s, r, l, l, e],
            [e, r, r, r, s, r, e, r, l, e, s, s, r, l, l, e],
            [e, r, r, r, s, s, r, e, e, s, s, s, r, l, l, e],
            [e, r, r, r, r, r, r, r, r, r, r, r, r, l, l, e],
            [e, r, r, s, s, s, s, s, s, s, s, s, s, r, l, e],
            [e, r, s, r, r, s, r, r, r, r, s, r, r, s, r, e],
            [e, s, r, s, r, r, r, s, s, r, r, r, s, r, s, e],
            [l, e, e, e, e, e, e, e, e, e, e, e, e, e, e, l]
        ]));
        images.add('PlayerStoppedDown', new Image([
            [Z, Z, Z, Z, Z, e, e, e, e, e, e, e, e, Z, Z, Z],
            [Z, Z, e, e, e, e, e, o, m, e, e, e, Z, Z, Z, Z],
            [Z, e, e, e, e, o, e, o, m, e, m, e, e, e, Z, Z],
            [Z, Z, e, e, e, e, e, e, e, e, e, e, e, e, Z, Z],
            [Z, e, e, e, e, e, e, o, o, e, e, e, e, e, e, Z],
            [e, e, e, m, e, m, m, o, o, m, m, e, m, e, e, Z],
            [Z, e, e, m, e, m, e, o, o, e, m, e, m, e, e, e],
            [e, e, e, e, e, o, o, o, o, o, o, e, e, h, o, e],
            [e, e, o, o, o, e, o, o, o, o, e, e, o, h, o, e],
            [e, m, o, o, e, o, e, e, e, e, e, o, o, o, e, Z],
            [e, o, m, e, e, o, o, o, o, o, o, e, e, e, Z, Z],
            [e, o, o, e, e, h, o, o, o, o, h, e, Z, Z, Z, Z],
            [Z, e, e, e, m, e, m, m, m, m, e, m, e, Z, Z, Z],
            [Z, Z, e, o, e, m, e, m, e, m, e, e, e, Z, Z, Z],
            [Z, Z, e, o, o, e, e, e, e, e, o, o, o, e, Z, Z],
            [Z, Z, e, e, e, Z, Z, Z, Z, Z, e, e, e, Z, Z, Z]
        ]));
        images.add('PlayerWalkingRight1', new Image([
            [Z, Z, Z, Z, Z, e, e, e, e, e, e, e, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, e, e, e, m, e, e, e, e, Z, Z, Z],
            [Z, Z, Z, Z, e, e, e, e, e, e, m, e, m, e, Z, Z],
            [Z, Z, e, e, e, e, e, e, e, e, e, e, o, e, Z, Z],
            [Z, Z, Z, e, e, e, e, e, e, e, e, e, e, e, Z, Z],
            [Z, Z, e, e, e, e, e, e, e, o, m, e, o, e, Z, Z],
            [Z, Z, Z, e, e, m, m, e, o, o, m, e, o, e, Z, Z],
            [Z, Z, Z, Z, e, m, m, e, e, o, o, o, o, e, Z, Z],
            [Z, Z, Z, Z, Z, e, e, o, o, e, o, o, e, Z, Z, Z],
            [Z, Z, Z, Z, e, e, o, o, o, o, e, e, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, m, m, o, e, o, o, e, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, o, o, e, o, o, o, e, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, o, o, e, m, m, e, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, e, e, m, e, m, e, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, e, e, e, e, o, o, e, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, e, e, e, e, e, e, e, Z, Z, Z, Z]
        ]));
        images.add('PlayerWalkingRight2', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, e, e, e, e, e, e, Z, Z, Z, Z, Z],
            [Z, Z, e, e, e, e, e, m, e, e, e, e, Z, Z, Z, Z],
            [e, e, e, e, e, e, e, e, e, m, e, m, e, Z, Z, Z],
            [Z, e, e, e, e, e, e, e, e, e, e, o, e, Z, Z, Z],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, Z, Z, Z],
            [Z, e, e, e, e, e, e, e, o, m, e, o, e, Z, Z, Z],
            [Z, Z, e, e, m, m, e, o, o, m, e, o, e, Z, Z, Z],
            [Z, Z, e, e, m, e, e, o, o, o, o, s, e, Z, Z, Z],
            [Z, Z, Z, e, e, e, e, e, o, o, o, e, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, o, o, e, e, e, e, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, o, o, m, o, o, e, e, Z, Z, Z, Z],
            [Z, Z, Z, e, e, e, o, m, o, o, e, m, e, Z, Z, Z],
            [Z, Z, e, o, e, m, e, e, e, e, m, o, e, Z, Z, Z],
            [Z, Z, e, o, o, e, m, m, e, m, e, o, o, e, Z, Z],
            [Z, Z, e, e, e, e, e, e, Z, e, e, e, e, e, Z, Z]
        ]));
        images.add('PlayerWalkingUp', new Image([
            [Z, Z, Z, Z, Z, e, e, e, e, e, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, e, e, e, e, e, e, e, e, e, Z, Z, Z, Z],
            [Z, Z, Z, e, e, e, e, e, e, e, e, e, e, e, Z, Z],
            [Z, Z, e, e, e, e, e, e, e, e, e, e, e, e, e, Z],
            [Z, Z, e, e, e, e, e, e, e, e, e, e, e, e, Z, Z],
            [Z, Z, e, e, e, e, e, e, e, e, e, e, e, e, e, Z],
            [Z, Z, e, m, e, e, e, e, e, e, e, e, m, e, Z, Z],
            [Z, Z, Z, e, e, e, e, e, e, e, e, e, e, Z, Z, Z],
            [Z, Z, Z, e, e, e, e, e, e, e, e, e, e, Z, Z, Z],
            [Z, Z, e, o, e, o, e, e, e, e, o, e, o, e, Z, Z],
            [Z, Z, e, o, e, o, o, o, o, o, o, e, m, m, e, Z],
            [Z, Z, e, e, e, e, o, o, o, o, e, e, o, o, e, Z],
            [Z, Z, Z, e, e, e, m, m, m, m, m, e, e, e, Z, Z],
            [Z, Z, Z, Z, e, m, e, m, e, m, e, m, e, Z, Z, Z],
            [Z, Z, Z, e, e, e, e, e, e, e, o, o, e, e, Z, Z],
            [Z, Z, Z, Z, Z, e, e, e, e, e, e, e, e, Z, Z, Z]
        ]));
        images.add('PlayerWalkingDown', new Image([
            [Z, Z, Z, Z, Z, Z, e, e, e, e, e, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, e, e, e, e, e, e, e, e, e, Z, Z, Z],
            [Z, Z, e, e, e, o, e, e, e, e, m, e, e, Z, Z, Z],
            [Z, e, e, e, e, e, e, o, m, e, e, e, e, e, Z, Z],
            [Z, Z, e, e, e, e, e, o, m, e, e, e, e, e, e, Z],
            [Z, e, e, m, e, e, e, e, e, e, e, e, m, e, e, Z],
            [Z, Z, e, m, e, m, e, o, o, e, m, e, m, e, e, Z],
            [Z, Z, e, e, e, m, e, o, o, e, m, e, e, e, Z, Z],
            [Z, Z, Z, e, e, o, o, o, o, o, o, e, o, e, Z, Z],
            [Z, Z, e, o, o, e, o, o, o, o, e, e, o, o, e, Z],
            [Z, Z, e, o, m, m, e, e, e, e, o, e, m, m, e, Z],
            [Z, Z, e, m, o, o, e, o, o, o, m, e, e, o, e, Z],
            [Z, Z, Z, e, o, o, e, m, m, m, e, m, e, e, Z, Z],
            [Z, Z, Z, Z, e, e, m, e, m, e, m, e, e, Z, Z, Z],
            [Z, Z, Z, e, e, e, e, e, e, e, e, o, o, e, Z, Z],
            [Z, Z, Z, Z, Z, Z, e, e, e, e, e, e, e, Z, Z, Z]
        ]));
        images.add('TreeBottom', new Image([
            [a, a, a, a, a, a, b, g, b, b, a, a, a, a, a, a],
            [a, a, a, a, a, a, b, b, b, a, b, a, a, a, a, a],
            [a, a, a, a, a, a, b, g, g, a, b, a, a, b, a, a],
            [a, a, a, a, a, a, b, g, b, b, b, a, b, b, a, a],
            [a, a, b, a, a, a, b, b, b, b, a, b, b, a, b, a],
            [a, b, b, a, b, a, b, g, g, g, a, b, d, b, b, a],
            [a, b, a, b, a, b, g, g, g, b, b, b, d, b, a, b],
            [b, d, d, d, a, b, b, b, b, b, b, a, b, d, b, a],
            [b, d, b, d, b, b, d, b, g, b, g, b, a, b, b, a],
            [a, b, d, b, b, d, d, b, b, g, b, b, b, d, b, b],
            [b, d, d, b, b, d, b, d, b, b, b, g, b, b, d, b],
            [a, b, b, b, b, b, d, b, b, b, b, b, b, d, d, b],
            [a, a, b, b, d, b, b, b, b, b, b, b, d, b, b, a],
            [a, a, a, d, d, a, b, b, d, d, d, d, a, a, a, a],
            [a, a, a, a, a, a, a, a, d, d, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('ArrowRightDisabled', new Image([
            [d, D, D, D, D, D, D, D, D, D, D, D, D, D, D, d],
            [D, E, E, d, d, d, d, d, d, d, d, d, d, E, E, D],
            [D, E, E, E, E, E, E, E, E, E, E, E, E, E, d, D],
            [D, E, E, E, d, D, D, D, D, d, d, d, E, d, d, D],
            [D, E, E, E, d, D, d, d, d, D, D, d, E, d, d, D],
            [D, E, E, E, d, d, D, d, d, d, d, D, E, d, d, D],
            [D, E, E, E, d, d, D, E, E, E, E, D, E, d, d, D],
            [D, E, E, E, d, D, E, E, E, D, D, E, E, d, d, D],
            [D, E, E, E, d, D, D, D, D, E, E, d, E, d, d, D],
            [D, E, E, E, d, E, E, E, E, d, d, d, E, d, d, D],
            [D, E, E, E, d, d, d, d, d, d, d, d, E, d, d, D],
            [D, E, E, E, E, E, E, E, E, E, E, E, E, d, d, D],
            [D, E, E, d, d, d, d, d, d, d, d, d, d, E, d, D],
            [D, E, d, E, E, d, E, E, E, E, d, E, E, d, E, D],
            [D, d, E, d, E, E, E, d, d, E, E, E, d, E, d, D],
            [d, D, D, D, D, D, D, D, D, D, D, D, D, D, D, d]
        ]));
        images.add('ArrowUpDisabled', new Image([
            [d, D, D, D, D, D, D, D, D, D, D, D, D, D, D, d],
            [D, E, E, d, d, d, d, d, d, d, d, d, d, E, E, D],
            [D, E, E, E, E, E, E, E, E, E, E, E, E, E, d, D],
            [D, E, E, E, d, d, E, D, D, d, d, d, E, d, d, D],
            [D, E, E, E, d, E, D, E, d, D, d, d, E, d, d, D],
            [D, E, E, E, d, E, D, E, d, D, d, d, E, d, d, D],
            [D, E, E, E, E, D, E, E, d, d, D, d, E, d, d, D],
            [D, E, E, E, E, D, E, E, d, d, D, d, E, d, d, D],
            [D, E, E, E, E, D, E, D, D, d, D, d, E, d, d, D],
            [D, E, E, E, E, D, D, d, d, D, D, d, E, d, d, D],
            [D, E, E, E, d, d, d, d, d, d, d, d, E, d, d, D],
            [D, E, E, E, E, E, E, E, E, E, E, E, E, d, d, D],
            [D, E, E, d, d, d, d, d, d, d, d, d, d, E, d, D],
            [D, E, d, E, E, d, E, E, E, E, d, E, E, d, E, D],
            [D, d, E, d, E, E, E, d, d, E, E, E, d, E, d, D],
            [d, D, D, D, D, D, D, D, D, D, D, D, D, D, D, d]
        ]));
        images.add('ArrowLeftDisabled', new Image([
            [d, D, D, D, D, D, D, D, D, D, D, D, D, D, D, d],
            [D, E, E, d, d, d, d, d, d, d, d, d, d, E, E, D],
            [D, E, E, E, E, E, E, E, E, E, E, E, E, E, d, D],
            [D, E, E, E, d, d, d, D, D, D, D, d, E, d, d, D],
            [D, E, E, E, d, D, D, d, d, d, D, d, E, d, d, D],
            [D, E, E, E, D, d, d, d, d, D, d, d, E, d, d, D],
            [D, E, E, E, D, E, E, E, E, D, d, d, E, d, d, D],
            [D, E, E, E, E, D, D, E, E, E, D, d, E, d, d, D],
            [D, E, E, E, d, E, E, D, D, D, D, d, E, d, d, D],
            [D, E, E, E, d, d, d, E, E, E, E, d, E, d, d, D],
            [D, E, E, E, d, d, d, d, d, d, d, d, E, d, d, D],
            [D, E, E, E, E, E, E, E, E, E, E, E, E, d, d, D],
            [D, E, E, d, d, d, d, d, d, d, d, d, d, E, d, D],
            [D, E, d, E, E, d, E, E, E, E, d, E, E, d, E, D],
            [D, d, E, d, E, E, E, d, d, E, E, E, d, E, d, D],
            [d, D, D, D, D, D, D, D, D, D, D, D, D, D, D, d]
        ]));
        images.add('ArrowDownDisabled', new Image([
            [d, D, D, D, D, D, D, D, D, D, D, D, D, D, D, d],
            [D, E, E, d, d, d, d, d, d, d, d, d, d, E, E, D],
            [D, E, E, E, E, E, E, E, E, E, E, E, E, E, d, D],
            [D, E, E, E, d, d, d, d, d, d, d, d, E, d, d, D],
            [D, E, E, E, E, D, D, d, d, D, D, d, E, d, d, D],
            [D, E, E, E, E, D, E, D, D, d, D, d, E, d, d, D],
            [D, E, E, E, E, D, E, E, d, d, D, d, E, d, d, D],
            [D, E, E, E, E, D, E, E, d, d, D, d, E, d, d, D],
            [D, E, E, E, d, E, D, E, d, D, d, d, E, d, d, D],
            [D, E, E, E, d, E, D, E, d, D, d, d, E, d, d, D],
            [D, E, E, E, d, d, E, D, D, d, d, d, E, d, d, D],
            [D, E, E, E, E, E, E, E, E, E, E, E, E, d, d, D],
            [D, E, E, d, d, d, d, d, d, d, d, d, d, E, d, D],
            [D, E, d, E, E, d, E, E, E, E, d, E, E, d, E, D],
            [D, d, E, d, E, E, E, d, d, E, E, E, d, E, d, D],
            [d, D, D, D, D, D, D, D, D, D, D, D, D, D, D, d]
        ]));
        images.add('GongPlayMusic1', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, F, Z, Z, Z, Z, F, Z, Z, Z, F, Z, Z, Z],
            [Z, Z, F, Z, Z, Z, Z, F, F, Z, Z, Z, Z, F, Z, Z],
            [Z, Z, F, Z, Z, Z, Z, Z, F, Z, Z, Z, Z, F, Z, Z],
            [Z, Z, F, Z, Z, Z, Z, F, F, Z, Z, Z, Z, F, Z, Z],
            [Z, Z, F, Z, Z, Z, Z, F, F, Z, Z, Z, Z, F, Z, Z],
            [Z, Z, Z, F, Z, Z, Z, Z, Z, Z, Z, Z, F, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('GongPlayMusic2', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, F, Z, Z, Z, Z, Z, Z, Z, F, Z, Z, F, Z, Z],
            [Z, F, Z, Z, Z, Z, Z, Z, Z, F, F, Z, Z, Z, F, Z],
            [F, Z, Z, Z, Z, Z, Z, Z, Z, Z, F, Z, Z, Z, Z, F],
            [F, Z, Z, H, Z, Z, H, H, H, F, F, Z, H, Z, Z, F],
            [F, Z, H, Z, Z, Z, H, Z, Z, F, F, Z, Z, H, Z, F],
            [F, Z, H, Z, Z, Z, H, Z, Z, Z, H, Z, Z, H, Z, F],
            [F, Z, H, Z, Z, H, H, Z, Z, H, H, Z, Z, H, Z, F],
            [F, Z, H, Z, Z, H, H, Z, Z, H, H, Z, Z, H, Z, F],
            [F, Z, Z, H, Z, Z, Z, Z, Z, Z, Z, Z, H, Z, Z, F],
            [F, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, F],
            [Z, F, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, F, Z],
            [Z, Z, F, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, F, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('GongPlayMusic3', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, F, F, Z, Z, Z],
            [Z, Z, Z, Z, H, H, H, H, H, Z, Z, Z, F, Z, Z, Z],
            [Z, Z, H, Z, H, Z, Z, Z, H, Z, Z, F, F, H, Z, Z],
            [Z, H, Z, Z, H, Z, Z, Z, H, Z, Z, F, F, Z, H, Z],
            [H, Z, Z, H, H, Z, Z, H, H, Z, Z, Z, Z, Z, Z, H],
            [H, Z, Z, H, H, Z, Z, H, H, Z, Z, Z, J, Z, Z, H],
            [H, Z, J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J, Z, H],
            [H, Z, J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J, Z, H],
            [H, Z, J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J, Z, H],
            [H, Z, J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J, Z, H],
            [H, Z, Z, J, Z, Z, Z, Z, Z, Z, Z, Z, J, Z, Z, H],
            [H, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, H],
            [Z, H, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, H, Z],
            [Z, Z, H, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, H, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('GongPlayMusic4', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, H, H, H, H, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, J, H, Z, Z, H, Z, Z, Z, Z, Z, Z, J, Z, Z],
            [Z, J, H, H, Z, H, H, Z, Z, Z, Z, Z, Z, Z, J, Z],
            [J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J],
            [J, Z, Z, Z, Z, Z, Z, Z, J, Z, Z, Z, Z, Z, Z, J],
            [J, Z, Z, Z, Z, Z, Z, J, J, Z, Z, Z, Z, Z, Z, J],
            [J, Z, Z, Z, Z, Z, Z, Z, J, Z, Z, Z, Z, Z, Z, J],
            [J, Z, Z, Z, Z, Z, Z, J, J, Z, Z, Z, Z, Z, Z, J],
            [J, Z, Z, Z, Z, Z, Z, J, J, Z, Z, Z, Z, Z, Z, J],
            [J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J],
            [J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J],
            [Z, J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J, Z],
            [Z, Z, J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('GongPlayMusic5', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, J, Z, Z, Z, Z, Z, Z],
            [Z, J, Z, Z, Z, Z, Z, Z, J, J, Z, Z, Z, Z, J, Z],
            [J, Z, Z, Z, Z, Z, Z, Z, Z, J, Z, Z, Z, Z, Z, J],
            [Z, Z, Z, Z, Z, Z, Z, Z, J, J, Z, Z, Z, Z, Z, Z],
            [J, Z, Z, Z, Z, Z, Z, Z, J, J, Z, Z, Z, Z, Z, J],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J],
            [Z, J, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, J, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('GongPlayMusic6', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('GongRed', new Image([
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
            [G, I, I, I, I, I, I, G, G, I, I, I, I, I, I, G],
            [a, G, G, G, G, G, G, G, G, G, G, G, G, G, G, a],
            [a, G, K, G, a, a, G, G, G, G, a, a, G, I, G, a],
            [a, G, K, G, a, G, G, I, I, G, G, a, G, I, G, a],
            [a, G, K, G, a, G, K, K, I, I, G, a, G, I, G, a],
            [a, G, K, G, a, G, K, G, G, I, G, a, G, I, G, a],
            [a, G, K, G, a, G, G, K, K, G, G, a, G, I, G, a],
            [G, K, I, G, a, G, K, G, G, I, G, a, G, K, I, G],
            [G, K, I, G, a, G, G, K, K, G, G, a, G, K, I, G],
            [G, K, I, G, a, G, K, G, G, I, G, a, G, K, K, G],
            [G, K, K, G, a, a, G, G, G, G, a, a, G, K, K, G],
            [G, K, K, G, a, a, a, a, a, a, a, a, G, K, K, G],
            [G, K, K, G, a, G, G, G, G, a, a, a, G, K, K, G],
            [G, K, K, G, a, a, a, G, G, G, G, a, G, K, K, G],
            [a, G, G, a, a, a, a, a, a, a, a, a, a, G, G, a]
        ]));
        images.add('PillarRed', new Image([
            [a, a, a, a, a, a, G, G, G, G, a, a, a, a, a, a],
            [a, a, a, a, G, G, I, I, I, I, G, G, a, a, a, a],
            [a, a, a, G, I, I, I, I, I, I, I, I, G, a, a, a],
            [a, a, a, G, I, K, I, I, I, I, K, I, G, a, a, a],
            [a, a, G, K, G, K, I, I, I, I, K, G, I, G, a, a],
            [a, a, G, K, G, K, K, I, I, K, K, G, K, G, a, a],
            [a, a, G, G, K, K, K, K, K, K, K, K, K, G, a, a],
            [a, a, G, G, G, K, K, K, K, K, K, K, G, G, a, a],
            [a, a, G, G, K, K, K, G, G, K, K, G, I, G, a, a],
            [a, a, G, G, K, K, G, K, K, G, K, I, K, G, a, a],
            [a, K, G, G, K, K, K, G, G, K, K, K, G, G, a, a],
            [a, K, G, G, G, K, K, K, K, K, K, G, I, G, a, a],
            [a, K, G, G, K, G, G, G, G, G, G, I, G, G, a, a],
            [a, K, K, G, G, K, K, K, K, K, K, G, G, a, a, a],
            [a, a, K, K, G, G, G, G, G, G, G, G, K, a, a, a],
            [a, a, a, K, K, K, K, K, K, K, K, K, a, a, a, a]
        ]));
        images.add('Key1', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, l, l, l, l, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, e, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, l, l, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, e, e, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, e, e, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, s, s, s, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, l, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, s, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, s, e, e, s, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, s, s, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('Key2', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, l, l, l, l, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, e, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, s, l, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, e, e, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, e, e, s, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, s, s, s, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, l, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, l, l, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, s, e, e, s, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, s, s, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('Key3', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, l, l, l, l, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, e, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, s, s, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, e, e, s, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, e, e, s, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, l, s, s, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, l, l, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, l, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, l, l, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, s, e, e, s, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, s, s, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('Key4', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, l, l, l, l, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, e, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, l, l, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, l, l, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, l, l, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, l, l, l, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, l, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, l, l, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, l, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, l, l, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, s, e, e, s, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, s, s, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('Key5', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, l, l, l, l, l, Z, l, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, e, e, l, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, l, l, l, l, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, e, e, l, l, l, l, l, Z, Z],
            [Z, Z, Z, Z, l, e, s, e, e, l, l, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, s, s, l, l, Z, l, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, l, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, s, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, s, e, e, s, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, s, s, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('Key6', new Image([
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, l, l, l, l, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, e, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, l, l, l, l, l, l, l, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, e, e, l, l, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, e, e, l, l, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, l, e, s, s, s, s, e, l, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, l, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, e, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, l, e, s, s, e, l, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, s, e, e, s, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, s, s, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z],
            [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z]
        ]));
        images.add('GongBlue', new Image([
            [L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L],
            [L, M, M, M, M, M, M, N, N, M, M, M, M, M, M, L],
            [a, L, N, N, N, N, N, L, L, N, N, N, N, N, L, a],
            [L, N, L, L, L, L, L, L, L, L, L, L, L, L, M, L],
            [L, N, L, a, a, L, N, L, L, N, L, a, a, L, M, L],
            [L, N, L, a, L, N, L, M, N, L, M, L, a, L, M, L],
            [L, N, L, a, L, M, L, L, L, L, M, L, a, L, M, L],
            [L, N, L, a, L, L, M, M, N, N, L, L, a, L, M, L],
            [L, N, L, L, M, L, L, L, L, L, L, M, L, L, M, L],
            [L, N, L, L, N, L, L, N, M, L, L, M, L, L, M, L],
            [L, N, L, L, L, L, L, N, N, L, L, N, L, L, N, L],
            [L, N, L, a, a, a, L, L, L, L, L, N, L, L, N, L],
            [L, N, L, a, a, a, a, a, a, a, L, L, L, L, N, L],
            [L, N, L, a, a, L, L, L, L, L, a, a, a, L, N, L],
            [L, N, L, a, a, a, a, L, L, L, L, L, a, L, N, L],
            [a, L, L, a, a, a, a, a, a, a, a, a, a, L, L, a]
        ]));
        images.add('PillarBlue', new Image([
            [a, a, a, a, a, a, L, L, L, L, a, a, a, a, a, a],
            [a, a, a, a, L, L, M, M, M, M, L, L, a, a, a, a],
            [a, a, a, L, L, M, M, M, M, M, M, L, L, a, a, a],
            [a, a, a, L, M, N, L, L, M, L, M, M, L, a, a, a],
            [a, a, L, L, N, L, N, N, N, N, L, M, M, L, a, a],
            [a, a, L, L, L, N, N, L, L, N, N, L, L, L, a, a],
            [a, a, L, L, N, N, L, N, N, L, N, M, L, L, a, a],
            [a, a, L, L, N, N, L, L, L, L, N, N, L, L, a, a],
            [a, a, L, N, L, L, N, N, N, N, L, L, L, L, a, a],
            [a, a, L, N, M, L, L, L, L, L, L, N, M, L, a, a],
            [a, N, L, L, N, L, N, N, M, L, L, N, M, L, a, a],
            [a, N, L, L, L, L, N, N, N, L, N, N, M, L, a, a],
            [a, N, L, L, N, L, L, N, L, L, N, N, N, L, a, a],
            [a, N, N, L, L, L, L, L, L, L, N, N, L, a, a, a],
            [a, a, N, N, L, L, L, L, L, L, L, L, N, a, a, a],
            [a, a, a, N, N, N, N, N, N, N, N, N, a, a, a, a]
        ]));
        images.add('FloorSquareDone', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, d, a, d, d, d, d, a, d, a, a, a, a],
            [a, a, a, d, a, a, a, a, a, a, a, a, d, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, d, a, a, a, D, D, a, a, a, d, a, a, a],
            [a, a, a, d, a, a, D, a, a, D, a, a, d, a, a, a],
            [a, a, a, d, a, a, a, D, D, a, a, a, d, a, a, a],
            [a, a, a, d, a, a, a, a, a, a, a, a, d, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, d, a, a, a, a, a, a, a, a, d, a, a, a],
            [a, a, a, a, d, a, d, d, d, d, a, d, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('FloorDiamondDone', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, d, d, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, d, a, a, d, a, a, a, a, a, a],
            [a, a, a, a, a, d, a, a, a, a, d, a, a, a, a, a],
            [a, a, a, a, d, a, a, a, a, a, a, d, a, a, a, a],
            [a, a, a, a, d, a, a, a, a, a, a, d, a, a, a, a],
            [a, a, a, a, a, d, a, a, a, a, d, a, a, a, a, a],
            [a, a, a, a, a, a, d, a, a, d, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, d, d, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('FloorPoof1', new Image([
            [a, a, a, e, e, e, e, e, e, e, e, e, e, a, a, a],
            [a, a, e, h, h, h, h, e, e, h, h, h, h, e, a, a],
            [a, e, h, h, h, h, h, h, h, h, h, h, h, h, e, a],
            [a, e, e, h, h, e, e, e, e, e, e, h, h, e, e, a],
            [e, e, h, h, e, h, h, h, h, h, h, e, h, h, e, e],
            [e, h, h, e, h, h, h, h, h, h, h, h, e, h, h, e],
            [e, h, h, e, h, h, h, h, h, h, h, h, e, h, h, e],
            [e, h, h, h, h, h, h, h, h, h, h, h, h, h, h, e],
            [e, h, h, h, h, h, h, h, h, h, h, h, h, h, h, e],
            [e, h, h, h, h, h, h, h, h, h, h, h, h, h, h, e],
            [a, e, h, h, e, h, h, h, h, h, h, e, h, h, e, a],
            [a, e, e, h, h, e, e, e, e, e, e, h, h, e, e, a],
            [a, e, h, h, h, h, h, h, h, h, h, h, h, h, e, a],
            [a, a, e, h, h, h, h, e, e, h, h, h, h, e, a, a],
            [a, a, a, e, e, e, e, e, e, e, e, e, e, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('FloorPoof2', new Image([
            [a, e, e, a, a, a, a, a, a, a, a, a, a, e, e, a],
            [e, h, h, e, a, a, a, a, a, a, a, a, e, h, h, e],
            [e, h, h, e, a, a, a, a, a, a, a, a, e, h, h, e],
            [a, e, e, a, a, a, a, a, a, a, a, a, a, e, e, a],
            [a, a, a, a, a, a, e, e, e, e, a, a, a, a, a, a],
            [a, a, a, a, a, e, h, h, h, h, e, a, a, a, a, a],
            [a, a, a, a, e, h, h, h, h, h, h, e, a, a, a, a],
            [a, a, a, a, e, h, h, h, h, h, h, e, a, a, a, a],
            [a, a, a, a, e, h, h, h, h, h, h, e, a, a, a, a],
            [a, a, a, a, e, h, h, h, h, h, h, e, a, a, a, a],
            [a, a, a, a, a, e, h, h, h, h, e, a, a, a, a, a],
            [a, a, a, a, a, a, e, e, e, e, a, a, a, a, a, a],
            [a, e, e, a, a, a, a, a, a, a, a, a, a, e, e, a],
            [e, h, h, e, a, a, a, a, a, a, a, a, e, h, h, e],
            [e, h, h, e, a, a, a, a, a, a, a, a, e, h, h, e],
            [a, e, e, a, a, a, a, a, a, a, a, a, a, e, e, a]
        ]));
        images.add('FloorPoof3Diamond', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, e, a, a, a, a, a, a, a, a, a, a, a, a, e, a],
            [a, a, e, a, a, a, a, a, a, a, a, a, a, e, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, d, d, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, d, a, a, d, a, a, a, a, a, a],
            [a, a, a, a, a, d, a, e, e, a, d, a, a, a, a, a],
            [a, a, a, a, d, a, e, h, h, e, a, d, a, a, a, a],
            [a, a, a, a, d, a, e, h, h, e, a, d, a, a, a, a],
            [a, a, a, a, a, d, a, e, e, a, d, a, a, a, a, a],
            [a, a, a, a, a, a, d, a, a, d, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, d, d, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, e, a, a, a, a, a, a, a, a, a, a, e, a, a],
            [a, e, a, a, a, a, a, a, a, a, a, a, a, a, e, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('FloorPoof3Square', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, e, a, a, a, a, a, a, a, a, a, a, a, a, e, a],
            [a, a, e, a, a, a, a, a, a, a, a, a, a, e, a, a],
            [a, a, a, a, d, a, d, d, d, d, a, d, a, a, a, a],
            [a, a, a, d, a, a, a, a, a, a, a, a, d, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, d, a, a, a, e, e, a, a, a, d, a, a, a],
            [a, a, a, d, a, a, e, h, h, e, a, a, d, a, a, a],
            [a, a, a, d, a, a, e, h, h, e, a, a, d, a, a, a],
            [a, a, a, d, a, a, a, e, e, a, a, a, d, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, d, a, a, a, a, a, a, a, a, d, a, a, a],
            [a, a, a, a, d, a, d, d, d, d, a, d, a, a, a, a],
            [a, a, e, a, a, a, a, a, a, a, a, a, a, e, a, a],
            [a, e, a, a, a, a, a, a, a, a, a, a, a, a, e, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('GongYellow', new Image([
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, P, P, P, O, P, P, P, P, P, P, O, P, P, P, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, Q, Q, O, Q, O, Q, Q, Q, Q, O, Q, O, Q, P, O],
            [O, Q, Q, O, O, Q, P, P, P, P, Q, O, O, Q, P, O],
            [O, Q, Q, O, Q, P, O, O, O, O, P, Q, O, Q, P, O],
            [a, O, Q, O, Q, P, O, P, P, O, P, Q, O, Q, O, a],
            [a, O, Q, O, Q, P, O, O, O, O, P, Q, O, Q, O, a],
            [a, O, Q, O, O, Q, P, P, P, P, Q, O, O, Q, O, a],
            [a, O, Q, O, a, O, Q, Q, Q, Q, O, a, O, Q, O, a],
            [a, O, Q, O, a, a, O, O, O, O, a, a, O, Q, O, a],
            [a, O, P, O, a, a, a, a, a, a, a, a, O, Q, O, a],
            [a, O, P, O, a, a, a, a, a, a, a, a, O, Q, O, a],
            [a, O, Q, O, a, O, O, O, O, O, a, a, O, Q, O, a],
            [a, O, Q, O, a, a, O, O, O, O, O, a, O, Q, O, a],
            [a, O, O, O, a, a, a, a, a, a, a, a, O, O, O, a]
        ]));
        images.add('PillarYellow', new Image([
            [a, a, a, a, a, a, O, O, O, O, a, a, a, a, a, a],
            [a, a, a, a, O, O, P, P, P, P, O, O, a, a, a, a],
            [a, a, a, O, P, P, P, P, P, P, P, P, O, a, a, a],
            [a, a, a, O, P, Q, O, O, O, O, P, P, O, a, a, a],
            [a, a, O, P, O, P, Q, P, P, P, P, O, Q, O, a, a],
            [a, a, O, O, P, Q, Q, Q, Q, Q, Q, P, O, O, a, a],
            [a, a, O, O, Q, Q, Q, Q, Q, Q, Q, Q, O, O, a, a],
            [a, a, O, P, Q, Q, Q, Q, Q, Q, Q, Q, P, O, a, a],
            [a, a, O, P, Q, Q, O, O, O, O, Q, Q, P, O, a, a],
            [a, a, O, O, Q, Q, O, Q, Q, O, Q, Q, P, O, a, a],
            [a, Q, O, Q, Q, Q, O, O, O, O, Q, Q, P, O, a, a],
            [a, Q, O, O, Q, Q, Q, Q, Q, Q, Q, Q, O, O, a, a],
            [a, Q, O, O, P, P, Q, Q, Q, Q, Q, P, O, O, a, a],
            [a, Q, Q, O, O, O, P, P, Q, Q, O, O, O, a, a, a],
            [a, a, Q, Q, O, O, O, O, O, O, O, O, Q, a, a, a],
            [a, a, a, Q, Q, Q, Q, Q, Q, Q, Q, Q, a, a, a, a]
        ]));
        images.add('OverlayTopLeft1', new Image([
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [r, r, r, r, r, r, r, r, r, r, R, r, r, r, r, r],
            [r, r, r, r, r, r, r, r, r, R, r, r, r, r, r, r],
            [r, r, R, R, R, R, R, R, R, R, R, R, R, R, R, R],
            [r, r, s, s, r, r, R, r, r, r, r, r, r, r, R, R],
            [r, R, r, r, R, r, r, R, R, R, R, r, r, r, R, R],
            [R, s, s, s, r, r, R, R, s, s, s, R, r, r, R, R],
            [s, r, s, s, r, R, R, s, s, s, s, s, R, r, R, R],
            [r, r, s, s, r, R, s, r, s, s, r, s, R, r, R, R],
            [r, r, s, s, r, R, r, s, r, r, R, s, R, r, R, R],
            [r, r, s, s, r, R, r, R, r, R, R, s, R, r, R, R],
            [r, r, s, s, r, R, r, r, R, R, r, s, R, r, R, R],
            [r, r, s, s, r, R, R, R, R, r, s, r, R, r, R, R],
            [r, r, s, s, r, R, R, r, r, s, r, R, R, r, R, R],
            [r, r, s, s, r, R, r, r, r, r, R, R, R, r, R, R],
            [r, r, s, s, r, R, r, r, R, R, R, R, R, r, R, R]
        ]));
        images.add('OverlayTopLeft2', new Image([
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [r, r, r, R, R, R, R, R, R, R, R, R, R, R, R, R],
            [r, r, s, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e]
        ]));
        images.add('OverlayTop', new Image([
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e]
        ]));
        images.add('OverlayTopCrack', new Image([
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [r, r, r, r, r, r, r, s, R, r, r, r, r, r, r, r],
            [R, R, R, R, R, R, R, R, e, R, R, R, R, R, R, R],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e]
        ]));
        images.add('OverlayTopRight1', new Image([
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [r, r, r, r, r, r, r, r, R, r, r, r, r, r, r, r],
            [R, R, R, R, R, R, R, R, e, R, R, R, R, r, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, R, R, R]
        ]));
        images.add('OverlayTopRight2', new Image([
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [R, R, R, R, R, R, R, R, R, R, R, R, R, R, r, r],
            [s, s, r, r, r, r, r, r, r, r, r, r, R, R, r, r],
            [s, s, r, r, r, R, R, R, R, r, r, r, R, R, r, r],
            [s, s, r, r, R, s, s, s, R, R, r, r, R, R, r, r],
            [s, s, r, R, s, s, s, r, s, R, R, r, R, R, r, r],
            [s, s, r, R, s, r, s, s, r, s, R, r, R, R, r, r],
            [s, s, r, R, s, R, r, r, s, s, R, r, R, R, r, r],
            [s, s, r, R, s, R, R, r, R, s, R, r, R, R, r, r],
            [s, s, r, R, s, r, R, R, r, r, R, r, R, R, r, r],
            [s, s, r, R, r, r, r, R, R, R, R, r, R, R, r, r],
            [s, s, r, R, R, r, r, r, s, R, R, r, R, R, r, r],
            [s, r, R, R, R, R, r, r, r, s, R, r, R, R, r, r],
            [r, s, r, R, R, R, R, R, r, s, R, r, R, R, r, r]
        ]));
        images.add('OverlayBottomLeft1', new Image([
            [r, r, s, s, r, R, s, R, R, s, s, R, R, r, R, R],
            [r, r, s, s, r, R, r, s, s, s, r, r, R, r, R, R],
            [r, r, s, s, r, R, R, r, r, r, R, s, R, r, R, R],
            [r, r, s, s, r, R, R, R, R, R, r, s, R, r, R, R],
            [r, r, s, s, r, R, R, s, s, s, s, r, R, r, R, R],
            [r, r, s, s, r, R, s, s, r, r, r, R, R, r, R, R],
            [r, r, s, s, r, R, s, r, r, R, R, R, R, r, R, R],
            [r, r, s, s, r, R, r, R, R, R, R, r, R, r, R, R],
            [r, r, s, s, r, r, R, R, s, s, r, R, r, r, R, R],
            [r, r, s, s, r, r, r, R, R, R, R, r, r, r, R, R],
            [r, r, s, s, r, r, r, r, r, r, r, r, r, r, R, R],
            [r, r, s, s, s, s, s, s, s, s, s, s, s, s, R, R],
            [r, r, s, s, s, s, s, s, s, s, s, s, R, R, s, R],
            [r, r, r, r, r, r, r, r, r, r, s, R, r, r, r, r],
            [r, r, r, r, r, r, r, r, r, r, R, r, r, r, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e]
        ]));
        images.add('OverlayBottomLeft2', new Image([
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, r, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, r, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, R, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, R, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [s, r, s, s, e, e, e, e, e, e, e, e, e, e, e, e],
            [r, r, s, r, s, s, s, s, s, s, s, s, s, s, s, s],
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e]
        ]));
        images.add('OverlayBottom', new Image([
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e]
        ]));
        images.add('OverlayBottomCrack', new Image([
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e],
            [s, s, s, s, s, s, s, r, R, r, R, R, s, s, s, s],
            [r, r, r, r, r, r, r, e, e, r, r, r, R, r, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e]
        ]));
        images.add('OverlayBottomRight1', new Image([
            [e, e, e, e, e, e, e, e, e, e, e, e, R, r, s, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, R, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, s, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, R, R, r, r],
            [s, s, s, s, s, s, s, s, s, s, s, s, r, R, r, r],
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, e],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e]
        ]));
        images.add('OverlayBottomRight2', new Image([
            [s, s, r, R, R, s, s, R, R, s, R, r, R, R, r, r],
            [s, s, r, R, r, r, s, s, R, r, R, r, R, R, r, r],
            [s, s, r, R, s, R, r, r, r, R, R, r, R, R, r, r],
            [s, s, r, R, s, r, R, R, R, R, R, R, R, R, r, r],
            [s, s, r, R, r, s, s, s, s, R, R, s, R, R, r, r],
            [s, s, r, R, R, r, r, r, s, s, R, r, R, R, r, r],
            [s, s, r, R, R, R, R, r, r, s, R, r, R, R, R, r],
            [s, s, r, R, s, R, R, R, R, r, R, r, R, R, R, R],
            [s, s, r, r, R, s, r, r, R, R, r, r, R, R, s, R],
            [s, s, r, r, r, R, R, R, R, r, r, r, R, R, r, s],
            [s, s, r, r, r, r, r, r, r, r, r, r, R, R, r, r],
            [s, s, s, s, s, s, s, s, s, s, s, s, R, R, r, r],
            [s, s, s, s, s, s, s, s, s, s, s, s, s, R, r, r],
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r],
            [e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, e]
        ]));
        images.add('GrassCorner', new Image([
            [a, g, S, g, S, g, S, S, S, g, g, g, S, g, S, g],
            [a, a, g, S, g, g, g, S, g, S, g, g, g, g, g, g],
            [a, S, S, S, S, g, g, g, S, g, S, g, S, S, S, g],
            [a, a, S, g, g, S, g, g, S, g, S, S, g, S, g, g],
            [a, a, g, S, g, g, g, g, g, g, S, g, S, g, g, g],
            [S, S, S, S, g, S, S, S, g, g, g, g, g, S, S, g],
            [a, S, g, S, g, g, S, g, S, g, g, g, S, S, g, g],
            [a, g, S, g, S, g, g, S, g, S, g, g, S, S, g, g],
            [a, g, S, g, g, g, g, g, g, S, g, g, S, g, g, g],
            [a, g, S, g, g, g, g, S, g, g, g, g, g, g, g, g],
            [a, g, S, g, S, g, S, S, g, S, g, g, S, g, g, S],
            [a, g, S, g, S, S, S, S, g, S, S, g, S, S, g, S],
            [a, g, g, S, S, S, g, S, S, g, S, S, S, S, g, S],
            [a, a, g, g, g, g, g, g, g, a, g, g, g, S, S, S],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, g, g, S],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, g]
        ]));
        images.add('GrassBottom', new Image([
            [g, S, g, S, g, g, S, S, S, g, g, S, g, g, g, g],
            [g, g, g, g, g, S, g, S, g, g, g, g, g, S, S, S],
            [S, S, S, g, S, g, S, g, S, S, S, g, S, g, S, g],
            [g, S, g, S, S, g, S, S, g, S, g, g, S, g, S, g],
            [g, g, S, g, S, g, S, g, S, S, S, S, g, g, g, g],
            [g, g, g, g, g, g, g, g, S, g, S, g, g, g, g, g],
            [S, S, S, g, g, g, g, S, g, S, g, g, g, g, g, S],
            [S, g, g, S, g, g, g, S, g, g, g, S, S, S, g, g],
            [g, S, g, S, g, g, g, g, g, S, g, g, S, g, g, g],
            [g, g, g, g, g, S, g, S, g, S, g, S, g, g, S, g],
            [g, g, S, g, g, S, g, S, g, S, g, S, g, g, S, g],
            [S, g, S, g, S, S, g, S, S, S, g, S, S, g, S, g],
            [S, g, S, S, S, g, S, S, g, g, S, S, S, g, S, g],
            [S, S, g, g, g, a, g, g, a, a, g, g, S, S, S, g],
            [S, g, a, a, a, a, a, a, a, a, a, a, g, g, g, S],
            [g, a, a, a, a, a, a, a, a, a, a, a, a, a, a, g]
        ]));
        images.add('Grass', new Image([
            [g, g, S, g, S, g, g, S, S, S, g, g, S, g, g, g],
            [S, g, g, g, g, g, S, g, S, g, g, g, g, g, S, S],
            [g, S, S, S, g, S, g, S, g, S, S, S, g, S, S, g],
            [g, g, S, g, S, S, g, S, S, g, S, g, g, S, S, g],
            [g, g, g, S, g, S, g, S, g, S, S, S, S, g, g, g],
            [g, g, g, g, g, g, g, g, g, S, g, S, g, g, g, g],
            [S, S, S, S, g, g, g, g, S, g, S, g, g, g, g, g],
            [g, S, g, g, S, g, g, g, S, g, S, g, S, S, S, g],
            [g, g, S, g, S, g, g, g, g, g, g, S, g, S, g, g],
            [S, S, g, g, g, g, S, S, S, g, S, g, S, g, g, S],
            [S, g, g, g, g, g, g, g, S, S, S, g, S, g, S, g],
            [S, S, S, g, S, S, S, g, g, S, S, g, S, S, g, S],
            [g, S, g, S, S, S, g, g, g, g, g, g, g, g, g, g],
            [g, g, g, g, g, g, g, g, S, S, S, g, S, S, S, g],
            [g, S, S, S, g, g, g, g, g, S, g, S, g, S, g, g],
            [g, g, S, g, S, g, g, g, g, g, S, g, S, g, g, g]
        ]));
        images.add('GrassLeft', new Image([
            [a, a, S, g, S, g, g, S, S, S, g, g, S, g, g, g],
            [a, a, g, S, g, g, S, g, S, g, g, g, g, g, S, S],
            [a, S, S, S, g, S, g, S, g, S, S, S, g, S, g, S],
            [a, a, S, g, S, S, g, S, S, g, S, g, g, S, g, S],
            [a, a, g, S, g, S, g, S, g, S, S, S, S, g, g, g],
            [a, a, g, S, g, g, g, g, g, S, g, S, g, g, g, g],
            [S, S, S, S, g, g, g, g, S, g, S, g, g, g, g, g],
            [a, S, g, g, S, g, g, g, S, g, S, g, S, S, S, g],
            [a, g, S, g, S, g, g, g, g, g, g, S, g, S, g, g],
            [S, S, g, S, g, g, S, S, S, g, S, g, S, g, g, S],
            [a, S, g, g, g, g, g, g, S, S, S, g, S, g, S, g],
            [a, S, S, g, S, S, g, g, g, S, S, g, S, S, g, S],
            [a, S, g, S, S, g, g, S, S, g, g, g, S, g, g, g],
            [a, g, S, g, g, g, g, g, S, S, g, g, g, S, S, S],
            [a, S, S, S, g, g, g, g, S, S, g, g, S, g, S, g],
            [a, g, S, g, S, g, g, g, g, g, g, g, S, g, S, g]
        ]));
        images.add('GrassTopLeft', new Image([
            [a, a, a, a, S, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, S, S, a, a, a, S, S, a, a, S, S],
            [a, S, S, S, a, S, g, S, a, S, S, a, a, S, g, S],
            [a, a, S, g, S, S, g, S, S, g, g, S, S, g, g, S],
            [a, a, a, S, g, S, g, g, g, S, S, S, S, g, S, g],
            [a, a, g, S, g, g, g, g, g, S, g, S, g, g, S, g],
            [S, S, S, S, g, S, g, S, S, g, S, g, g, g, g, g],
            [a, S, g, g, S, g, g, g, S, g, S, g, S, S, S, g],
            [a, g, S, g, S, g, g, g, g, g, g, S, g, S, g, g],
            [S, S, g, S, g, g, S, S, S, g, S, g, S, g, g, S],
            [a, S, g, g, g, g, g, g, S, S, S, g, S, g, S, g],
            [a, S, S, g, S, S, g, g, g, S, S, g, S, S, g, S],
            [a, S, g, S, S, g, g, g, g, g, g, g, g, g, g, g],
            [a, g, S, g, g, g, g, g, S, S, S, g, g, g, g, g],
            [a, S, S, S, g, g, g, g, g, S, g, S, g, g, g, g],
            [a, g, S, g, S, g, g, g, g, g, S, g, S, g, g, g]
        ]));
        images.add('GrassTop', new Image([
            [a, a, a, a, a, a, a, a, S, a, a, a, a, a, a, a],
            [S, S, a, S, a, a, S, S, a, a, S, S, a, a, S, S],
            [S, g, S, g, S, S, g, S, a, S, S, a, a, S, g, S],
            [S, S, g, g, S, S, g, S, S, g, g, S, S, g, g, S],
            [g, S, g, S, g, S, g, S, g, S, S, S, S, g, S, g],
            [g, g, g, g, g, g, g, g, g, S, g, S, g, g, S, g],
            [S, S, S, S, g, g, g, g, S, g, S, g, g, g, g, g],
            [g, S, g, g, S, g, g, g, S, g, S, g, S, S, S, g],
            [g, g, S, g, S, g, g, g, g, g, g, S, g, S, g, g],
            [S, S, g, g, g, g, S, S, S, g, S, g, S, g, g, S],
            [S, g, g, g, g, g, g, g, S, S, S, g, S, g, S, g],
            [S, S, S, g, S, S, S, g, g, S, S, g, S, S, g, S],
            [g, S, g, S, S, S, g, g, g, g, g, g, g, g, g, g],
            [g, g, g, g, g, g, g, g, S, S, S, g, S, S, S, g],
            [g, S, S, S, g, g, g, g, g, S, g, S, g, S, g, g],
            [g, g, S, g, S, g, g, g, g, g, S, g, S, g, g, g]
        ]));
        images.add('GrassTopRight', new Image([
            [a, a, a, a, a, a, a, a, a, a, S, a, a, a, a, a],
            [S, S, a, S, S, a, a, a, S, S, a, a, a, a, a, a],
            [S, a, a, a, S, S, a, S, g, S, a, S, S, S, a, a],
            [g, S, S, S, g, g, S, S, g, S, S, g, S, a, a, a],
            [g, g, S, S, S, g, g, g, g, S, g, S, a, a, a, a],
            [g, g, g, S, g, S, g, S, g, g, g, S, g, a, a, a],
            [g, g, g, S, g, S, S, S, g, S, g, S, S, S, S, a],
            [g, g, g, g, g, g, S, g, g, g, S, g, g, S, a, a],
            [g, g, S, S, g, g, g, g, g, g, S, g, S, g, a, a],
            [S, g, g, S, S, g, S, S, S, g, g, S, g, S, S, a],
            [S, S, g, g, S, S, g, S, g, g, g, g, g, S, a, a],
            [g, g, g, g, S, g, S, g, g, S, S, g, S, S, a, a],
            [g, g, g, g, g, g, g, g, g, g, S, S, g, S, a, a],
            [g, g, g, g, S, S, S, g, g, g, g, g, S, g, a, a],
            [g, g, g, S, g, S, g, g, g, g, g, S, S, S, a, a],
            [g, g, S, g, S, g, g, g, g, g, S, g, S, g, a, a]
        ]));
        images.add('FieldCorner', new Image([
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, a, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, T, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, a, q, q, a, T, q, q],
            [q, T, q, q, q, q, q, q, q, T, a, q, T, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, T, q, T, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, T, T, q, q, T, T, q, q, T, T, q, q],
            [a, q, T, T, q, q, T, T, q, q, T, T, q, q, T, T],
            [a, a, q, q, a, a, q, q, a, a, q, q, a, a, q, q]
        ]));
        images.add('FieldBottom', new Image([
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, T, a, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, T, q, a, T, q, q, q, q, q],
            [q, q, q, q, q, q, q, T, q, T, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, T, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [T, T, q, q, T, T, q, q, T, T, q, q, T, T, q, q],
            [q, q, T, T, q, q, T, T, q, q, T, T, q, q, T, T],
            [a, a, q, q, a, a, q, q, a, a, q, q, a, a, q, q]
        ]));
        images.add('Field', new Image([
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, T, a, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, T, q, a, T, q, q],
            [q, q, q, q, q, q, q, q, q, q, T, q, T, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, T, q, q, q, q, q],
            [q, q, q, q, a, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, T, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, a, q, T, a, T, q, q, q, q, q, q, q, q, q],
            [q, q, T, a, q, T, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, T, q, T, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, T, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q]
        ]));
        images.add('Field2', new Image([
            [q, q, q, a, a, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, T, a, a, T, q, q, q, q, q, q, q, q, q, q],
            [q, a, a, T, T, a, a, q, q, q, T, a, q, q, q, q],
            [q, a, a, T, T, a, a, q, q, q, q, T, q, a, T, q],
            [q, T, T, a, a, T, T, q, q, q, q, T, q, T, q, q],
            [q, q, T, a, a, T, q, q, q, q, q, T, q, q, q, q],
            [q, q, q, T, T, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, a, q, q, q, q, q, q, a, a, q, q, q],
            [q, q, q, q, T, q, q, q, q, q, T, a, a, T, q, q],
            [q, q, a, q, T, a, T, q, q, a, a, T, T, a, a, q],
            [q, q, T, a, q, T, q, q, q, a, a, T, T, a, a, q],
            [q, q, q, T, q, T, q, q, q, T, T, a, a, T, T, q],
            [q, q, q, T, q, q, q, q, q, q, T, a, a, T, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, T, T, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q]
        ]));
        images.add('FieldTopLeft', new Image([
            [a, a, a, q, a, a, q, q, a, a, q, q, a, a, q, q],
            [a, a, q, T, q, q, T, T, q, q, T, T, q, q, T, T],
            [a, q, T, q, T, T, q, q, T, T, q, q, T, T, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, a, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, T, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, a, q, q, a, T, q, q, q, q],
            [a, q, T, q, q, q, q, T, a, q, T, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, T, q, T, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q]
        ]));
        images.add('FieldTop', new Image([
            [a, a, q, q, a, a, q, q, a, a, q, q, a, a, q, q],
            [q, q, T, T, q, q, T, T, q, q, T, T, q, q, T, T],
            [T, T, q, q, T, T, q, q, T, T, q, q, T, T, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, a, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, T, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, a, q, q, a, T, q, q, q, q],
            [q, q, q, q, q, q, q, T, a, q, T, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, T, q, T, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, q, q]
        ]));
        images.add('FieldTopRight', new Image([
            [a, a, q, q, a, a, q, q, a, a, q, q, a, a, a, a],
            [q, q, T, T, q, q, T, T, q, q, T, T, q, q, a, a],
            [T, T, q, q, T, T, q, q, T, T, q, q, T, T, q, a],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, T, q, a],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, T, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, T, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, T, q, a],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, T, q, a],
            [q, q, q, q, q, a, q, q, q, q, q, q, q, q, T, q],
            [q, q, q, q, q, T, q, q, q, q, q, q, q, q, T, q],
            [q, q, q, a, q, q, a, T, q, q, q, q, q, T, q, a],
            [q, q, q, T, a, q, T, q, q, q, q, q, q, T, q, a],
            [q, q, q, q, T, q, T, q, q, q, q, q, q, q, T, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, q, T, q],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, T, q, a],
            [q, q, q, q, q, q, q, q, q, q, q, q, q, T, q, a]
        ]));
        images.add('FieldLeft', new Image([
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, T, a, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, T, q, a, T, q, q, q],
            [a, q, T, q, q, q, q, q, q, T, q, T, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, T, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [q, T, q, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q],
            [a, q, T, q, q, q, q, q, q, q, q, q, q, q, q, q]
        ]));
        images.add('LandCorner', new Image([
            [S, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, S, g, g, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, S, g, g, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, g, a, a, a, a, a, a, a, a, g, a, a, a, a],
            [S, g, g, g, a, a, a, a, a, a, a, g, a, g, a, a],
            [S, g, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, g, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, S, g, g, a, a, a, g, a, a, a, a, a, a, a, a],
            [a, S, g, g, g, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, g, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, g, a, a, a, a, a, g, a, a, a, a, g, a, a],
            [S, g, g, g, a, g, a, g, g, g, a, g, a, g, g, a],
            [a, S, g, g, g, g, g, g, g, g, a, g, g, g, g, a],
            [a, a, S, g, g, g, g, S, S, g, g, g, g, S, S, g],
            [a, a, a, S, S, S, S, a, a, S, S, S, S, a, a, S]
        ]));
        images.add('LandBottom', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, g, a, g, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, g, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, g, a, g, a, g, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, g, a, a, a, a, g, a, a],
            [a, g, g, a, g, a, a, g, g, g, a, g, a, g, g, a],
            [a, g, g, g, g, a, g, g, g, g, a, g, g, g, g, a],
            [g, S, S, g, g, g, g, S, S, g, g, g, g, S, S, g],
            [S, a, a, S, S, S, S, a, a, S, S, S, S, a, a, S]
        ]));
        images.add('Land', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, g, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, g, a, g, a, g, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, g, a, g, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, g, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, g, a, g, a, g, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('Land2', new Image([
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, g, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, g, g, g, a, a, a, a, a, a, a, g, g, a, a, a],
            [a, S, a, a, g, a, a, a, a, a, S, a, g, g, a, a],
            [a, g, S, S, S, a, a, a, a, S, a, g, g, g, a, a],
            [a, a, g, g, a, a, a, a, S, a, g, S, S, a, a, a],
            [a, a, a, a, a, a, a, a, a, g, S, g, a, a, a, a],
            [a, a, a, a, g, g, a, a, a, S, g, a, a, a, g, a],
            [a, a, a, S, a, g, g, g, a, a, a, a, a, a, a, a],
            [a, a, a, S, g, g, g, a, g, g, g, a, a, a, a, a],
            [a, a, a, g, S, S, S, g, g, a, a, g, a, a, a, a],
            [a, a, a, a, a, g, g, S, S, g, S, a, a, a, a, a],
            [a, a, g, a, a, a, a, a, g, S, S, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('LandLeft', new Image([
            [S, g, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, S, g, g, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, S, g, g, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, g, a, a, a, a, a, a, a, a, a, a, g, a, a],
            [S, g, g, g, a, a, a, a, a, a, a, g, a, g, a, a],
            [S, g, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, g, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, S, g, g, a, a, a, a, a, g, a, a, a, a, a, a],
            [a, S, g, g, g, a, a, g, a, g, a, g, a, a, a, a],
            [S, g, g, g, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, g, g, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, g, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, S, g, g, g, a, a, a, a, a, a, g, a, g, a, a],
            [a, S, g, g, a, a, a, a, a, a, a, a, a, a, a, a],
            [S, g, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
        ]));
        images.add('SandBottom', new Image([
            [d, d, d, a, a, a, a, a, a, a, a, a, a, a, d, d],
            [d, d, d, d, a, a, a, a, a, a, a, a, a, a, a, d],
            [a, d, d, d, d, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, d, d, d, d, d, a, d, a, d, a, a, a, a, a],
            [a, a, a, d, d, d, d, d, d, d, a, d, a, a, a, a],
            [a, a, a, a, d, d, d, d, d, d, d, d, d, d, d, a],
            [a, a, a, a, a, a, a, a, d, d, d, d, d, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
            [a, a, a, a, a, a, d, d, d, d, d, d, d, d, a, a],
            [d, d, d, B, B, B, B, B, B, B, B, B, B, B, d, d],
            [B, B, B, B, a, a, a, a, a, a, a, a, B, B, B, B],
            [B, B, a, a, a, a, d, B, d, B, d, a, a, a, a, B],
            [B, d, a, d, B, d, B, d, B, d, B, d, B, d, B, d],
            [d, B, d, B, d, B, B, B, B, B, B, B, d, B, d, B],
            [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B]
        ]));
        images.add('Sand', new Image([
            [d, d, a, d, a, a, a, a, a, a, a, a, a, a, d, d],
            [d, d, d, a, d, a, a, a, a, a, a, a, a, a, a, d],
            [d, d, d, d, a, d, a, a, a, a, a, a, a, a, a, a],
            [a, d, d, d, d, a, d, a, d, a, a, a, a, a, a, a],
            [a, a, d, d, d, d, d, d, a, d, a, a, a, a, a, a],
            [a, a, a, d, d, d, d, d, d, a, d, d, a, a, a, a],
            [a, a, a, a, a, d, d, d, d, d, d, a, d, d, a, a],
            [a, a, a, a, a, a, a, a, d, d, d, d, d, a, d, a],
            [a, a, a, a, a, a, a, a, a, d, d, d, d, d, a, a],
            [a, a, a, a, a, a, a, a, a, a, a, d, d, d, d, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, d, d, d, d],
            [a, a, a, a, a, a, a, a, a, a, a, a, d, d, d, a],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, d, d, d],
            [a, a, a, a, a, a, a, a, a, a, a, a, a, d, d, d],
            [d, a, a, a, a, a, a, a, a, a, a, a, a, d, d, d],
            [d, d, a, a, a, a, a, a, a, a, a, a, a, a, d, d]
        ]));
        images.add('SandLeft', new Image([
            [B, B, d, B, B, d, a, a, a, a, a, a, a, a, d, d],
            [B, d, B, a, B, d, a, a, a, a, d, a, a, a, a, d],
            [B, B, d, a, B, B, d, a, a, a, d, a, a, a, a, a],
            [B, d, B, a, B, B, d, a, a, d, d, a, a, a, a, a],
            [B, B, d, a, a, B, d, a, a, d, d, d, a, a, a, a],
            [B, B, B, d, a, B, d, a, a, d, d, a, d, a, a, a],
            [B, B, d, B, a, B, d, a, a, d, d, d, a, a, a, a],
            [B, B, B, d, a, B, d, a, a, d, d, d, d, a, a, a],
            [B, B, d, B, a, B, d, a, a, a, d, d, a, a, a, a],
            [B, B, B, d, a, B, d, a, a, a, d, d, d, a, a, a],
            [B, B, d, a, a, B, a, a, a, a, d, d, d, a, a, a],
            [B, d, B, a, a, B, a, a, a, a, d, d, d, d, a, a],
            [B, B, d, a, B, B, a, a, a, a, a, d, d, d, d, a],
            [B, d, a, a, B, d, a, a, a, a, a, a, d, d, d, d],
            [B, B, d, B, B, d, a, a, a, a, a, a, a, d, d, d],
            [B, d, B, B, B, d, a, a, a, a, a, a, a, a, d, d]
        ]));
        return images;
    }
    //# sourceMappingURL=images.js.map

    var ROOM_SIZE = { width: 24, height: 12 };
    var PLAYER_STATE;
    (function (PLAYER_STATE) {
        PLAYER_STATE["STOPPED"] = "STOPPED";
        PLAYER_STATE["PUSHING"] = "PUSHING";
    })(PLAYER_STATE || (PLAYER_STATE = {}));
    var PLAYER_DIR;
    (function (PLAYER_DIR) {
        PLAYER_DIR[PLAYER_DIR["RIGHT"] = 0] = "RIGHT";
        PLAYER_DIR[PLAYER_DIR["UP"] = 1] = "UP";
        PLAYER_DIR[PLAYER_DIR["LEFT"] = 2] = "LEFT";
        PLAYER_DIR[PLAYER_DIR["DOWN"] = 3] = "DOWN";
    })(PLAYER_DIR || (PLAYER_DIR = {}));
    //# sourceMappingURL=util.js.map

    // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
    var LCG = function (s) { return function () { return (Math.pow(2, 31) - 1 & (s = Math.imul(48271, s))) / Math.pow(2, 31); }; };
    function loadRooms(sprites, instances, playerUpdateFn, crateUpdateFn) {
        var player = instances.factory('player', sprites.get('PlayerStoppedDown'), -1000, playerUpdateFn);
        var bgZ = 100;
        var obZ = 0;
        var hoverZ = -1;
        var Background = instances.simple(sprites, 'Background', bgZ);
        var Sand = instances.simple(sprites, 'Sand', bgZ);
        var SandBottom = instances.simple(sprites, 'SandBottom', bgZ);
        var SandLeft = instances.simple(sprites, 'SandLeft', bgZ);
        var Rock = instances.simple(sprites, 'Rock', obZ);
        var Bush = instances.simple(sprites, 'Bush', obZ);
        var WallTopRightDown = instances.simple(sprites, 'WallTopRightDown', obZ);
        var Crate = instances.factory('Crate', sprites.get('Crate'), obZ, crateUpdateFn);
        var GongRed = instances.simple(sprites, 'GongRed', obZ);
        var PillarRed = instances.simple(sprites, 'PillarRed', obZ);
        var PillarBlue = instances.simple(sprites, 'PillarBlue', obZ);
        var GongBlue = instances.simple(sprites, 'GongBlue', obZ);
        var WallTopUpDown = instances.simple(sprites, 'WallTopUpDown', obZ);
        var Key = instances.simple(sprites, 'Key', hoverZ);
        var Land = instances.simple(sprites, 'Land', bgZ);
        var Lock = instances.simple(sprites, 'Lock', obZ);
        var WallTopLeftRight = instances.simple(sprites, 'WallTopLeftRight', obZ);
        var WallTopUpLeft = instances.simple(sprites, 'WallTopUpLeft', obZ);
        var Pedestal = instances.simple(sprites, 'Pedestal', obZ);
        var LandCorner = instances.simple(sprites, 'LandCorner', bgZ);
        var LandBottom = instances.simple(sprites, 'LandBottom', bgZ);
        var Land2 = instances.simple(sprites, 'Land2', bgZ);
        var LandLeft = instances.simple(sprites, 'LandLeft', bgZ);
        var Wall = instances.simple(sprites, 'Wall', obZ);
        var WallVert = instances.simple(sprites, 'WallVert', obZ);
        var TreeTop = instances.simple(sprites, 'TreeTop', hoverZ);
        var TreeBottom = instances.simple(sprites, 'TreeBottom', obZ);
        var Water = instances.simple(sprites, 'Water', obZ);
        var GrassCorner = instances.simple(sprites, 'GrassCorner', bgZ);
        var GrassBottom = instances.simple(sprites, 'GrassBottom', bgZ);
        var GrassMid = instances.simple(sprites, 'Grass', bgZ);
        var GrassLeft = instances.simple(sprites, 'GrassLeft', bgZ);
        var GrassTopLeft = instances.simple(sprites, 'GrassTopLeft', bgZ);
        var GrassTop = instances.simple(sprites, 'GrassTop', bgZ);
        var GrassTopRight = instances.simple(sprites, 'GrassTopRight', bgZ);
        var NextRoomArrow = instances.simple(sprites, 'NextRoomArrow', bgZ);
        var FieldCorner = instances.simple(sprites, 'FieldCorner', bgZ);
        var FieldBottom = instances.simple(sprites, 'FieldBottom', bgZ);
        var Field = instances.simple(sprites, 'Field', bgZ);
        var Field2 = instances.simple(sprites, 'Field2', bgZ);
        var FieldTopLeft = instances.simple(sprites, 'FieldTopLeft', bgZ);
        var FieldTop = instances.simple(sprites, 'FieldTop', bgZ);
        var FieldLeft = instances.simple(sprites, 'FieldLeft', bgZ);
        var WallLadder = instances.simple(sprites, 'WallLadder', bgZ);
        var Hole = instances.simple(sprites, 'Hole', obZ);
        var HoleStraw = instances.simple(sprites, 'HoleStraw', obZ);
        var BigDoor0 = instances.simple(sprites, 'BigDoor0', obZ);
        var BigDoor1 = instances.simple(sprites, 'BigDoor1', obZ);
        var BigDoor2 = instances.simple(sprites, 'BigDoor2', obZ);
        var BigDoor3 = instances.simple(sprites, 'BigDoor3', obZ);
        var BigDoor4 = instances.simple(sprites, 'BigDoor4', obZ);
        var BigDoor5 = instances.simple(sprites, 'BigDoor5', obZ);
        var BigDoor6 = instances.simple(sprites, 'BigDoor6', obZ);
        var BigDoor7 = instances.simple(sprites, 'BigDoor7', obZ);
        var BigDoor8 = instances.simple(sprites, 'BigDoor8', obZ);
        var BigDoor9 = instances.simple(sprites, 'BigDoor9', obZ);
        var BigDoor10 = instances.simple(sprites, 'BigDoor10', obZ);
        var BigDoor11 = instances.simple(sprites, 'BigDoor11', obZ);
        var BigDoor12 = instances.simple(sprites, 'BigDoor12', obZ);
        var BigDoor13 = instances.simple(sprites, 'BigDoor13', obZ);
        var BigDoor14 = instances.simple(sprites, 'BigDoor14', obZ);
        var BigDoor15 = instances.simple(sprites, 'BigDoor15', obZ);
        var Stump = instances.simple(sprites, 'Stump', obZ);
        var Pit = instances.simple(sprites, 'Pit', bgZ);
        var ArrowLeft = instances.simple(sprites, 'ArrowLeft', obZ);
        var ArrowLeftDisabled = instances.simple(sprites, 'ArrowLeftDisabled', obZ);
        var ArrowDown = instances.simple(sprites, 'ArrowDown', obZ);
        var ArrowDownDisabled = instances.simple(sprites, 'ArrowDownDisabled', obZ);
        var ArrowUp = instances.simple(sprites, 'ArrowUp', obZ);
        var ArrowUpDisabled = instances.simple(sprites, 'ArrowUpDisabled', obZ);
        function g(item, pos) {
            // convert from grid coordinates to pixels
            var o = item.new(pos);
            return o;
        }
        function i(item) {
            var pos = { x: x++, y: y };
            return g(item, pos);
        }
        function o(item) {
            return g(item, { x: x, y: y });
        }
        var rand = LCG(2020);
        // Setart each Ocean tile at a random spot so the ocean waves will crest randomly
        function waterAnim(o) {
            var next = Math.round(rand() * 1000);
            o.sprite.startTick = -next;
        }
        var y = 0;
        var x = 0;
        var xStart = 0;
        // -------------------------------
        // Puzzle Room
        // -------------------------------
        // Row 0
        waterAnim(i(Water));
        i(WallTopUpDown).flip(true, false);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(WallTopUpDown);
        i(Bush);
        i(Bush);
        i(Bush);
        i(Bush);
        i(Bush);
        i(Stump); // Land + Arrow
        i(Stump); // Land + Arrow
        i(Bush);
        i(Bush);
        i(Bush);
        i(WallTopUpLeft).flip(true, false);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        // Row 1
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        i(WallTopUpDown).flip(true, false);
        i(GrassMid);
        o(Key).offsetPos = { x: 0, y: -5 };
        i(Pedestal);
        i(GrassMid);
        i(WallTopRightDown);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopUpLeft);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Rock);
        i(GongRed);
        i(WallVert).flip(true, false);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        // Row 2
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        i(WallTopUpDown).flip(true, false);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(WallTopUpDown);
        i(Wall);
        i(Wall);
        i(WallVert);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Rock);
        i(Land);
        i(WallVert).flip(true, false);
        i(WallTopUpDown).flip(true, false);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        // Row 3
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        i(WallTopUpDown).flip(true, false);
        i(WallTopRightDown);
        i(WallLadder);
        i(WallTopLeftRight);
        i(WallTopUpLeft);
        i(Wall);
        i(Wall);
        i(WallVert);
        i(GrassTopLeft);
        i(GrassTop);
        i(GrassTopRight);
        i(Stump);
        i(Stump);
        i(Land);
        i(Land);
        i(Land);
        i(Rock);
        i(HoleStraw);
        i(WallVert).flip(true, false);
        i(WallTopUpLeft).flip(true, false);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        // Row 4
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        i(WallTopUpLeft).flip(true, false);
        i(WallTopUpLeft);
        i(WallLadder);
        i(Wall);
        i(WallVert);
        o(Key).offsetPos = { x: 0, y: -5 };
        i(Pedestal);
        i(PillarBlue);
        i(Land);
        i(GrassLeft);
        i(GrassMid);
        i(GrassLeft).flip(true, false);
        o(Crate);
        i(Land);
        i(Hole);
        i(Land);
        i(Land);
        i(Land);
        o(Crate);
        i(Land);
        i(Land);
        i(WallVert).flip(true, false);
        i(WallVert).flip(true, false);
        i(Wall);
        i(Wall);
        i(Wall);
        // Row 5
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        i(WallVert).flip(true, false);
        i(WallVert);
        i(WallLadder);
        i(Wall);
        i(WallVert);
        i(Rock);
        i(Rock);
        i(Land);
        i(GrassCorner);
        i(GrassBottom);
        i(GrassCorner).flip(true, false);
        i(Stump);
        o(Crate);
        i(Land);
        i(Land);
        i(FieldTopLeft);
        i(FieldTop);
        i(FieldTopLeft).flip(true, false);
        i(Land);
        i(Land).flip(true, false);
        i(WallVert).flip(true, false);
        i(Wall);
        i(Wall);
        i(Wall);
        // Row 6
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        i(WallVert).flip(true, false);
        i(WallVert);
        o(Crate);
        i(Sand);
        i(Sand);
        i(LandLeft);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Pit);
        i(Land);
        i(FieldLeft);
        i(Rock);
        i(FieldLeft).flip(true, false);
        i(Land);
        i(Land);
        i(HoleStraw);
        i(Land);
        i(Land);
        i(Land);
        // Row 7
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        waterAnim(i(Water));
        i(SandLeft);
        i(Sand);
        i(Sand);
        i(LandLeft);
        i(Land);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Land);
        i(Land);
        i(Land);
        i(FieldCorner);
        i(FieldBottom);
        i(FieldCorner).flip(true, false);
        i(Land);
        i(Land);
        i(Hole); // No Escape!
        i(Land);
        i(Land);
        i(Land);
        // Row 8
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        waterAnim(i(Water));
        i(SandLeft);
        i(Sand);
        i(Sand);
        i(LandLeft);
        i(Land);
        i(Rock);
        i(GongBlue);
        i(PillarRed);
        i(Land);
        i(Hole);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(WallTopUpLeft).flip(true, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        // Row 9
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        waterAnim(i(Water));
        i(SandLeft);
        i(Sand);
        i(Sand);
        i(WallTopUpLeft).flip(true, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopLeftRight).flip(false, true);
        i(WallTopUpLeft).flip(false, true);
        i(Land);
        i(Land);
        i(Land);
        i(WallTopUpDown);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        // Row 9
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        waterAnim(i(Water));
        i(Rock);
        i(Sand);
        i(TreeTop);
        i(WallTopUpDown).flip(true, false);
        i(GrassBottom);
        i(GrassBottom);
        i(GrassBottom);
        i(GrassBottom);
        i(GrassBottom);
        i(GrassBottom);
        i(GrassBottom);
        i(GrassBottom);
        i(GrassBottom);
        i(WallTopUpDown);
        i(Land);
        i(Land);
        i(Land);
        i(WallTopUpDown);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        // Row 10
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        waterAnim(i(Water));
        i(Rock);
        o(Rock); // Blocker
        i(Sand);
        i(TreeTop);
        i(WallTopUpDown).flip(true, false);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(Rock);
        i(WallTopUpDown);
        i(Stump);
        i(Stump);
        i(Stump);
        i(WallTopUpDown);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        // -------------------------------
        // Big Door Room
        // -------------------------------
        xStart = ROOM_SIZE.width;
        x = xStart;
        y = 0;
        // Row 0
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopUpLeft);
        i(BigDoor0);
        i(BigDoor1);
        i(BigDoor2);
        i(BigDoor3);
        i(WallTopUpLeft).flip(true);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        // Row 1
        x = xStart;
        y += 1;
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallVert);
        i(BigDoor4);
        i(BigDoor5);
        i(BigDoor6);
        i(BigDoor7);
        i(WallVert).flip(true);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        // Row 2
        x = xStart;
        y += 1;
        i(GrassMid);
        i(WallTopUpDown);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallVert);
        i(BigDoor8);
        i(BigDoor9);
        i(BigDoor10);
        i(BigDoor11);
        i(WallVert).flip(true);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallTopUpDown).flip(true);
        i(GrassMid);
        // Row 3
        x = xStart;
        y += 1;
        i(WallTopLeftRight);
        i(WallTopUpLeft);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallVert);
        i(BigDoor12);
        i(BigDoor13);
        i(BigDoor14);
        i(BigDoor15);
        i(WallVert).flip(true);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallTopUpLeft).flip(true);
        i(WallTopLeftRight);
        // Row 4
        x = xStart;
        y += 1;
        i(Wall);
        i(WallVert);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallVert);
        i(Field);
        i(Field);
        i(Field);
        i(Field);
        i(WallVert).flip(true);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallVert).flip(true);
        i(Wall);
        // Row 5
        x = xStart;
        y += 1;
        i(Wall);
        i(WallVert);
        i(PillarRed);
        i(FieldCorner);
        i(Field);
        i(Field);
        i(Field2);
        i(Field2);
        i(Field);
        i(Field2);
        i(Field);
        i(Field);
        i(Field);
        i(Field2);
        i(Field);
        i(Field);
        i(Field);
        i(Field2);
        i(Field);
        i(FieldBottom);
        i(FieldCorner).flip(true);
        i(Rock);
        i(WallVert).flip(true);
        i(Wall);
        // Row 7
        x = xStart;
        y += 1;
        o(NextRoomArrow).setOffset({ x: 0, y: 8 }).rotate(ROTATION_AMOUNT.LEFT);
        i(Land);
        i(Land);
        i(ArrowDown);
        i(Land);
        i(FieldCorner);
        i(Field);
        i(Field);
        i(Field2);
        i(Field);
        i(Field);
        i(Field2);
        i(Field);
        i(Field);
        i(Field);
        i(Field);
        i(Field);
        i(Field2);
        i(Field);
        i(FieldCorner).flip(true);
        i(Land2);
        i(Land);
        i(ArrowUpDisabled);
        i(Land);
        o(NextRoomArrow).setOffset({ x: 0, y: 8 });
        i(Land);
        // Row 8
        x = xStart;
        y += 1;
        i(Land);
        i(Land);
        i(ArrowDownDisabled);
        i(Land);
        i(Land);
        i(FieldCorner);
        i(FieldBottom);
        i(FieldBottom);
        i(Field);
        i(Field);
        i(Field);
        i(Field);
        i(Field);
        i(Field);
        i(Field2);
        i(Field);
        i(FieldBottom);
        i(FieldCorner).flip(true);
        i(Land);
        i(Land);
        i(Land);
        i(ArrowUp);
        i(Land);
        i(Land);
        // Row 9
        x = xStart;
        y += 1;
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopUpLeft).flip(undefined, true);
        i(Rock);
        i(Rock);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(FieldCorner);
        i(FieldBottom);
        i(FieldBottom);
        i(FieldBottom);
        i(FieldBottom);
        i(FieldBottom);
        i(FieldBottom);
        i(FieldCorner).flip(true);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Rock);
        i(Land);
        i(WallTopUpLeft).flip(true, true);
        i(WallTopLeftRight).flip(undefined, true);
        // Row 10
        x = xStart;
        y += 1;
        i(GrassMid);
        i(WallTopUpDown);
        i(GongRed);
        i(Land);
        i(Hole);
        i(Land);
        o(Crate);
        i(Land);
        i(Land2);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(Land2);
        i(Land);
        i(Land);
        i(Lock);
        i(Land);
        i(WallTopUpDown).flip(true);
        i(GrassMid);
        // Row 11
        x = xStart;
        y += 1;
        i(GrassMid);
        i(WallTopRightDown).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopUpLeft).flip(undefined, true);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(WallTopUpLeft).flip(true, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopLeftRight).flip(undefined, true);
        i(WallTopRightDown).flip(true, true);
        i(GrassMid);
        // Row 12
        x = xStart;
        y += 1;
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(WallTopUpDown);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(WallTopUpDown).flip(true);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        // -------------------------------
        // Initial Shipwreck Room
        // -------------------------------
        x = xStart;
        y += 1;
        // Row0
        i(Rock);
        i(GrassLeft);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(WallTopUpDown);
        i(Land);
        o(NextRoomArrow).setOffset({ x: 8, y: 0 }).rotate(ROTATION_AMOUNT.UP);
        i(Land);
        i(Land);
        i(Land);
        i(WallTopUpDown).flip(true);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassMid);
        i(GrassLeft).flip(true);
        i(Rock);
        // Row1
        x = xStart;
        y += 1;
        i(Rock);
        i(GrassLeft);
        i(WallTopRightDown);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopUpLeft);
        i(Land);
        i(Land);
        i(Land);
        i(Land);
        i(WallTopUpLeft).flip(true);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopRightDown).flip(true);
        i(GrassMid);
        i(GrassLeft).flip(true);
        i(Rock);
        // Row2
        x = xStart;
        y += 1;
        i(Bush);
        i(GrassLeft);
        i(WallTopUpDown);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallVert);
        i(Rock);
        i(Land);
        i(Land);
        i(Rock);
        i(WallVert).flip(true);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallTopUpDown).flip(true);
        i(GrassMid);
        i(GrassLeft).flip(true);
        i(Bush);
        // Row3
        x = xStart;
        y += 1;
        i(Bush);
        i(GrassCorner);
        i(WallTopUpDown);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallVert);
        o(Land);
        i(ArrowLeftDisabled);
        o(Land);
        i(ArrowLeftDisabled);
        o(Land);
        i(ArrowLeft);
        o(Land);
        i(Lock);
        i(WallVert).flip(true);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(Wall);
        i(WallTopUpDown).flip(true);
        i(GrassBottom);
        i(GrassCorner).flip(true);
        i(Bush);
        // Row4
        x = xStart;
        y += 1;
        i(Bush);
        i(Bush);
        i(WallTopUpDown);
        o(Background);
        i(GongRed);
        i(Sand);
        i(Sand);
        i(Rock);
        i(Rock);
        i(Sand);
        i(LandCorner);
        i(LandBottom);
        i(LandBottom);
        i(LandBottom);
        i(LandBottom);
        i(LandCorner).flip(true);
        i(Sand);
        i(Rock);
        o(Key).offsetPos = { x: 0, y: -5 };
        i(Pedestal);
        i(Rock);
        i(Sand);
        i(WallTopUpDown).flip(true);
        i(Bush);
        i(Bush);
        i(Bush);
        // Row5
        x = xStart;
        y += 1;
        i(Bush);
        i(TreeTop);
        i(WallTopUpDown);
        i(Rock);
        i(Rock);
        i(Sand);
        i(Sand);
        i(Rock);
        i(Rock);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Rock);
        o(Sand);
        i(PillarRed);
        i(Rock);
        i(Sand);
        i(WallTopUpDown).flip(true);
        i(TreeTop);
        i(TreeTop);
        i(TreeTop);
        // Row6
        x = xStart;
        y += 1;
        i(Bush);
        i(TreeBottom);
        i(WallTopUpDown);
        i(Rock);
        i(Sand);
        o(Sand);
        o(Crate);
        i(Sand);
        o(Crate);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Rock);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(WallTopUpDown).flip(true);
        i(TreeBottom);
        i(TreeBottom);
        i(TreeBottom);
        // Row7
        x = xStart;
        y += 1;
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopUpLeft);
        i(Rock);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        o(player); // PLAYER
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(Sand);
        i(WallTopUpLeft).flip(true);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        i(WallTopLeftRight);
        // Row8
        x = xStart;
        y += 1;
        i(Wall);
        i(Wall);
        i(WallVert);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(SandBottom);
        i(WallVert).flip(true);
        i(Wall);
        i(Wall);
        i(Wall);
        // Row9
        x = xStart;
        y += 1;
        i(Wall);
        i(Wall);
        i(WallVert);
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        i(WallVert).flip(true);
        i(Wall);
        i(Wall);
        i(Wall);
        // Row10
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        // Row11
        x = xStart;
        y += 1;
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
        waterAnim(i(Water));
    }
    //# sourceMappingURL=rooms.js.map

    function playerUpdateFn(o, gamepad, collisionChecker, sprites, instances, camera, showDialog, overlayState, curTick) {
        camera.screenPixelPos = { x: 0, y: 16 * 2 /* for the overlay */ };
        camera.resize({
            width: ROOM_SIZE.width,
            height: ROOM_SIZE.height
        });
        var playerRoomPos = currentRoomCorner(o.pos);
        camera.pos = posAdd(playerRoomPos, { x: Math.round(ROOM_SIZE.width / 2), y: Math.round(ROOM_SIZE.height / 2) });
        var _a = __read(sprites.getAll([
            'Hole',
            'HoleStraw',
            'PlayerWalkingUp',
            'PlayerWalkingDown',
            'PlayerWalkingRight',
            'PlayerPushingRight',
            'PlayerPushingUp',
            'PlayerPushingDown',
            'GongRed',
            'PillarRed',
            'GongBlue',
            'PillarBlue',
            'GongPlayMusic',
            'Key',
            'Lock',
            'ArrowLeft',
            'ArrowLeftDisabled',
            'ArrowUp',
            'ArrowUpDisabled',
            'ArrowRight',
            'ArrowRightDisabled',
            'ArrowDown',
            'ArrowDownDisabled',
            'FloorSquare',
            'FloorDiamond'
        ]), 25), Hole = _a[0], HoleStraw = _a[1], PlayerWalkingUp = _a[2], PlayerWalkingDown = _a[3], PlayerWalkingRight = _a[4], PlayerPushingRight = _a[5], PlayerPushingUp = _a[6], PlayerPushingDown = _a[7], GongRed = _a[8], PillarRed = _a[9], GongBlue = _a[10], PillarBlue = _a[11], GongPlayMusic = _a[12], Key = _a[13], Lock = _a[14], ArrowLeft = _a[15], ArrowLeftDisabled = _a[16], ArrowUp = _a[17], ArrowUpDisabled = _a[18], ArrowRight = _a[19], ArrowRightDisabled = _a[20], ArrowDown = _a[21], ArrowDownDisabled = _a[22], FloorSquare = _a[23], FloorDiamond = _a[24];
        var pushableSprites = [
            sprites.get('Crate')
        ];
        var pushableWallSprites = __spread(pushableSprites, [GongRed,
            PillarRed,
            GongBlue,
            PillarBlue,
            Lock,
            ArrowLeft,
            ArrowLeftDisabled,
            ArrowUp,
            ArrowUpDisabled,
            ArrowRight,
            ArrowRightDisabled,
            ArrowDown,
            ArrowDownDisabled,
            sprites.get('Stump'),
            sprites.get('Rock'),
            sprites.get('Bush'),
            sprites.get('WallTopRightDown'),
            sprites.get('WallTopUpDown'),
            sprites.get('WallTopLeftRight'),
            sprites.get('WallTopUpLeft'),
            sprites.get('Wall'),
            sprites.get('WallVert'),
            sprites.get('Water'),
            sprites.get('BigDoor12'),
            sprites.get('BigDoor13'),
            sprites.get('BigDoor14'),
            sprites.get('BigDoor15')]);
        var playerWallSprites = __spread(pushableWallSprites, [
            // sprites.get('Pit'), // walk over the pit for now since we cannot push the crate
            sprites.get('Hole')
        ]);
        pushableWallSprites.push(sprites.get('WallLadder'));
        // initialize the props
        var p = o.props;
        if (p.state === undefined) {
            p.dir = PLAYER_DIR.DOWN;
            p.state = PLAYER_STATE.STOPPED;
            overlayState.keys = 0;
        }
        function reduce(i, by) {
            if (i < 0) {
                return Math.min(i + by, 0);
            }
            else if (i > 0) {
                return Math.max(i - by, 0);
            }
            else {
                return 0;
            }
        }
        if (o.offsetPos.x !== 0 || o.offsetPos.y !== 0) {
            // slowly move the sprite
            o.offsetPos = {
                x: reduce(o.offsetPos.x, 4),
                y: reduce(o.offsetPos.y, 4)
            };
            return;
        }
        var dy = 0;
        var dx = 0;
        if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_LEFT)) {
            dx += -1;
        }
        else if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_RIGHT)) {
            dx += 1;
        }
        else if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_UP)) {
            dy += -1;
        }
        else if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_DOWN)) {
            dy += 1;
        }
        // Change the player's direction if something is pressed
        if (dy < 0) {
            p.dir = PLAYER_DIR.UP;
        }
        else if (dy > 0) {
            p.dir = PLAYER_DIR.DOWN;
        }
        else if (dx < 0) {
            p.dir = PLAYER_DIR.LEFT;
        }
        else if (dx > 0) {
            p.dir = PLAYER_DIR.RIGHT;
        }
        var oldPos = o.pos;
        var newPos = {
            x: o.pos.x + dx,
            y: o.pos.y + dy
        };
        o.offsetPos = {
            x: dx * -15,
            y: dy * -15
        };
        o.moveTo(newPos);
        // If there is a collision then move the player back
        var neighborSprites = collisionChecker.searchPoint(o.pos);
        var wallNeighbor = neighborSprites
            .find(function (obj) { return playerWallSprites.includes(obj.getMainSprite()); });
        if (wallNeighbor) {
            o.moveTo(oldPos);
            p.state = PLAYER_STATE.PUSHING;
            if ([GongRed, GongBlue].includes(wallNeighbor.getMainSprite())) {
                var doRing = function (instrument, pillar) {
                    if (instrument === wallNeighbor.getMainSprite() && !wallNeighbor.sprite.isGrayscale) {
                        // remove all the pillars in the current room
                        var pillars = collisionChecker.searchBBox(currentRoomBBox(o.pos)).filter(function (t) { return t.getMainSprite() === pillar; });
                        pillars.forEach(function (p) { return p.setSprite(FloorSquare); });
                        // wallNeighbor.setMask(null, true)
                        wallNeighbor.sprite.isGrayscale = true;
                        wallNeighbor.addAnimation(new SpriteInstance(GongPlayMusic, { x: 0, y: 0 }));
                    }
                };
                o.offsetPos = { x: 0, y: 0 };
                doRing(GongRed, PillarRed);
                doRing(GongBlue, PillarBlue);
            }
            else if (pushableSprites.includes(wallNeighbor.getMainSprite())) {
                // start pushing the box. Just immediately push it for now (if it is empty behind it)
                var neighborOld = wallNeighbor.pos;
                var newNeighborPos = posAdd(wallNeighbor.pos, neighborPos(p.dir));
                var isBehindNeighborFilled = collisionChecker.searchPoint(newNeighborPos)
                    .find(function (obj) { return pushableWallSprites.includes(obj.getMainSprite()); });
                if (isBehindNeighborFilled === wallNeighbor) {
                    throw new Error('Should have .... oh, we already moved the neighbor... grrr');
                }
                if (!isBehindNeighborFilled) {
                    // move the box, and move the player
                    o.moveTo(neighborOld);
                    wallNeighbor.moveTo(newNeighborPos);
                }
                else {
                    o.offsetPos = { x: 0, y: 0 };
                }
            }
            else {
                o.offsetPos = { x: 0, y: 0 };
            }
        }
        else {
            p.state = PLAYER_STATE.STOPPED; // Should be walking if moving
            // check if we walked off of a HoleStraw. If so it should turn into a Hole
            var here = collisionChecker.searchPoint(oldPos);
            var holeStraw = here.find(function (obj) { return HoleStraw === obj.getMainSprite(); });
            if (holeStraw && (dx || dy)) {
                holeStraw.setSprite(Hole);
            }
        }
        // Pick up a key
        var maybeKey = neighborSprites.find(function (obj) { return obj.getMainSprite() === Key; });
        if (maybeKey) {
            overlayState.keys = typeof overlayState.keys === 'number' ? overlayState.keys + 1 : 1;
            maybeKey.destroy(); // TODO: animate it moving to the overlay
        }
        // Unlock a lock
        var maybeLock = neighborSprites.find(function (obj) { return obj.getMainSprite() === Lock; });
        if (maybeLock && overlayState.keys > 0) {
            overlayState.keys = typeof overlayState.keys === 'number' ? overlayState.keys - 1 : 0;
            maybeLock.setSprite(FloorDiamond);
        }
        // Unlock the arrow locks when pushing the correct direction
        function checkArrow(sprite, disabledSprite, playerDir) {
            var maybeArrow = neighborSprites.find(function (obj) { return obj.getMainSprite() === sprite; });
            if (maybeArrow && p.dir === playerDir) {
                // loop and delete all the disabled arrowlefts
                var cur = maybeArrow;
                while (cur) {
                    var pos = cur.pos;
                    cur.setSprite(FloorDiamond);
                    cur = collisionChecker.searchPoint(posAdd(pos, neighborPos(playerDir))).find(function (obj) { return obj.getMainSprite() === disabledSprite; });
                }
            }
        }
        checkArrow(ArrowUp, ArrowUpDisabled, PLAYER_DIR.UP);
        checkArrow(ArrowDown, ArrowDownDisabled, PLAYER_DIR.DOWN);
        checkArrow(ArrowLeft, ArrowLeftDisabled, PLAYER_DIR.LEFT);
        checkArrow(ArrowRight, ArrowRightDisabled, PLAYER_DIR.RIGHT);
        o.flip(false);
        switch (p.state) {
            case PLAYER_STATE.STOPPED:
                switch (p.dir) {
                    case PLAYER_DIR.UP:
                        o.setSprite(PlayerWalkingUp);
                        break;
                    case PLAYER_DIR.DOWN:
                        o.setSprite(PlayerWalkingDown);
                        break;
                    case PLAYER_DIR.RIGHT:
                        o.setSprite(PlayerWalkingRight);
                        break;
                    case PLAYER_DIR.LEFT:
                        o.setSprite(PlayerWalkingRight);
                        o.flip(true);
                        break;
                }
                break;
            case PLAYER_STATE.PUSHING:
                switch (p.dir) {
                    case PLAYER_DIR.RIGHT:
                        o.setSprite(PlayerPushingRight);
                        break;
                    case PLAYER_DIR.UP:
                        o.setSprite(PlayerPushingUp);
                        break;
                    case PLAYER_DIR.LEFT:
                        o.setSprite(PlayerPushingRight);
                        o.flip(true);
                        break;
                    case PLAYER_DIR.DOWN:
                        o.setSprite(PlayerPushingDown);
                        break;
                    default: throw new Error("BUG: Invalid direction " + p.dir);
                }
                break;
            default: throw new Error("BUG: Invalid state " + p.state);
        }
        if (dx !== 0 || dy !== 0) {
            o.sprite.sprite.loop = true;
        }
        else {
            o.sprite.sprite.loop = false;
        }
    }
    function crateUpdateFn(o, gamepad, collisionChecker, sprites, instances, camera, showDialog, overlayState, curTick) {
        var _a = __read(sprites.getAll(['Hole', 'HoleStraw', 'HoleCrate']), 3), Hole = _a[0], HoleStraw = _a[1], HoleCrate = _a[2];
        var holes = [
            Hole,
            HoleStraw
        ];
        var maybeHole = collisionChecker.searchPoint(o.pos).find(function (obj) { return holes.includes(obj.getMainSprite()); });
        if (maybeHole) {
            maybeHole.setSprite(HoleCrate);
            o.destroy();
        }
    }
    function neighborPos(dir) {
        switch (dir) {
            case PLAYER_DIR.UP: return { x: 0, y: -1 };
            case PLAYER_DIR.DOWN: return { x: 0, y: 1 };
            case PLAYER_DIR.LEFT: return { x: -1, y: 0 };
            case PLAYER_DIR.RIGHT: return { x: 1, y: 0 };
            default: throw new Error("BUG: Invalid dir " + dir);
        }
    }
    function currentRoomCorner(playerGridPos) {
        return {
            x: Math.floor(playerGridPos.x / ROOM_SIZE.width) * ROOM_SIZE.width,
            y: Math.floor(playerGridPos.y / ROOM_SIZE.height) * ROOM_SIZE.height
        };
    }
    function currentRoomBBox(playerGridPos) {
        var pos = currentRoomCorner(playerGridPos);
        return {
            minX: pos.x,
            minY: pos.y,
            maxX: pos.x + ROOM_SIZE.width,
            maxY: pos.y + ROOM_SIZE.height
        };
    }
    //# sourceMappingURL=logic.js.map

    var MyGame = /** @class */ (function () {
        function MyGame() {
        }
        MyGame.prototype.load = function (gamepad, sprites) {
            var e_1, _a;
            var images = loadImages();
            sprites.add('Water', new Sprite(20, true, images.getAll([
                'Water0',
                'Water0',
                'Water0',
                'Water0',
                'Water0',
                'Water0',
                'Water0',
                'Water0',
                'Water0',
                'Water0',
                'Water1',
                'Water2',
                'Water3',
                'Water4'
            ])));
            sprites.add('Key', new Sprite(2, true, images.getAll([
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key1',
                'Key2',
                'Key3',
                'Key4',
                'Key5',
                'Key6'
            ])));
            sprites.add('GongPlayMusic', new Sprite(3, false, images.getAll([
                'GongPlayMusic1',
                'GongPlayMusic2',
                'GongPlayMusic3',
                'GongPlayMusic4',
                'GongPlayMusic5',
                'GongPlayMusic6'
            ])));
            sprites.add('PlayerWalkingRight', new Sprite(1, true, images.getAll([
                'PlayerWalkingRight1',
                'PlayerWalkingRight2'
            ])));
            sprites.add('FloorSquare', new Sprite(3, false, images.getAll([
                'FloorPoof1',
                'FloorPoof2',
                'FloorPoof3Square',
                'FloorSquareDone'
            ])));
            sprites.add('FloorDiamond', new Sprite(3, false, images.getAll([
                'FloorPoof1',
                'FloorPoof2',
                'FloorPoof3Diamond',
                'FloorDiamondDone'
            ])));
            try {
                // Add all the images as single-image sprites too.
                for (var _b = __values(images.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), name_1 = _d[0], image = _d[1];
                    sprites.add(name_1, Sprite.forSingleImage(image));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return {
                grid: { width: 16, height: 16 },
                buttons: new Set([BUTTON_TYPE.DPAD_LEFT, BUTTON_TYPE.DPAD_RIGHT, BUTTON_TYPE.DPAD_DOWN, BUTTON_TYPE.DPAD_UP])
            };
        };
        MyGame.prototype.init = function (sprites, instances) {
            loadRooms(sprites, instances, playerUpdateFn, crateUpdateFn);
        };
        MyGame.prototype.drawBackground = function (tiles, camera, drawPixelsFn) {
            // All sprites have a background so this is not necessary
        };
        MyGame.prototype.drawOverlay = function (drawPixelsFn, drawTextFn, fields, sprites) {
            var _a = __read(sprites.getAll([
                'Key',
                'OverlayTopLeft1',
                'OverlayTopLeft2',
                'OverlayTopRight1',
                'OverlayTopRight2',
                'OverlayTop',
                'OverlayTopCrack',
                'OverlayBottomLeft1',
                'OverlayBottomLeft2',
                'OverlayBottomRight1',
                'OverlayBottomRight2',
                'OverlayBottom',
                'OverlayBottomCrack'
            ]), 13), Key = _a[0], OverlayTopLeft1 = _a[1], OverlayTopLeft2 = _a[2], OverlayTopRight1 = _a[3], OverlayTopRight2 = _a[4], OverlayTop = _a[5], OverlayTopCrack = _a[6], OverlayBottomLeft1 = _a[7], OverlayBottomLeft2 = _a[8], OverlayBottomRight1 = _a[9], OverlayBottomRight2 = _a[10], OverlayBottom = _a[11], OverlayBottomCrack = _a[12];
            var x = 0;
            var y = 0;
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopLeft1.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopLeft2.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopCrack.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopCrack.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopCrack.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopCrack.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopRight1.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopRight2.images[0].pixels, false, false);
            x = 0;
            y += 1;
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomLeft1.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomLeft2.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomCrack.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomCrack.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomCrack.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomRight1.images[0].pixels, false, false);
            drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomRight2.images[0].pixels, false, false);
            drawPixelsFn({ x: 22, y: 3 }, Key.images[0].pixels, false, false);
            drawTextFn({ x: 28, y: 20 }, "" + fields.keys, '#ffffff');
        };
        MyGame.prototype.drawDialog = function (message, drawPixelsFn, drawTextFn, elapsedMs, target, additional) {
            throw new Error('BUG: This game should not have any dialogs');
        };
        return MyGame;
    }());
    //# sourceMappingURL=game.js.map

    // https://stackoverflow.com/a/30521308
    function toSnakeCase(s) {
        return s.replace(/\.?([A-Z]+)/g, function (x, y) { return ' ' + y; }).replace(/^ /, '');
    }
    // HACK lookup table. This should be a property of the ObjectClass
    var categories = new Map();
    categories.set('WallTopUpLeft', 'Wall');
    categories.set('WallTopRightDown', 'Wall');
    categories.set('WallTopUpDown', 'Wall');
    categories.set('WallTopLeftRight', 'Wall');
    categories.set('WallVert', 'Wall');
    categories.set('Bush', 'Wall');
    categories.set('Rock', 'Wall');
    categories.set('TreeTop', 'Wall');
    categories.set('TreeBottom', 'Wall');
    categories.set('Stump', 'Wall');
    categories.set('Background', null);
    categories.set('Sand', null);
    categories.set('SandEdge', null);
    categories.set('SandBottom', null);
    categories.set('SandLeft', null);
    categories.set('Land', null);
    categories.set('LandCorner', null);
    categories.set('LandBottom', null);
    categories.set('LandLeft', null);
    categories.set('Grass', null);
    categories.set('GrassCorner', null);
    categories.set('GrassLeft', null);
    categories.set('GrassBottom', null);
    categories.set('GrassTopLeft', null);
    categories.set('GrassTop', null);
    categories.set('GrassTopRight', null);
    categories.set('FieldCorner', null);
    categories.set('FieldBottom', null);
    categories.set('FieldTopLeft', null);
    categories.set('FieldTop', null);
    categories.set('FieldTopRight', null);
    categories.set('FieldLeft', null);
    categories.set('Land2', null);
    categories.set('Field', null);
    categories.set('Field2', null);
    categories.set('FloorSquare', null);
    categories.set('FloorDiamond', null);
    categories.set('Pedestal', null);
    categories.set('BigDoor0', 'Wall');
    categories.set('BigDoor1', 'Wall');
    categories.set('BigDoor2', 'Wall');
    categories.set('BigDoor3', 'Wall');
    categories.set('BigDoor4', 'Wall');
    categories.set('BigDoor5', 'Wall');
    categories.set('BigDoor6', 'Wall');
    categories.set('BigDoor7', 'Wall');
    categories.set('BigDoor8', 'Wall');
    categories.set('BigDoor9', 'Wall');
    categories.set('BigDoor10', 'Wall');
    categories.set('BigDoor11', 'Wall');
    categories.set('BigDoor12', 'Wall');
    categories.set('BigDoor13', 'Wall');
    categories.set('BigDoor14', 'Wall');
    categories.set('BigDoor15', 'Wall');
    categories.set('PlayerWalkingRight', 'PLAYER');
    categories.set('PlayerWalkingUp', 'PLAYER');
    categories.set('PlayerWalkingDown', 'PLAYER');
    categories.set('PlayerPushingUp', 'PLAYER');
    categories.set('PlayerPushingDown', 'PLAYER');
    categories.set('PlayerPushingRight', 'PLAYER');
    function categorize(spriteName) {
        if (categories.has(spriteName)) {
            return categories.get(spriteName);
        }
        return spriteName;
    }
    var AudioOutputter = /** @class */ (function () {
        function AudioOutputter(logger) {
            if (logger === void 0) { logger = console.log.bind(console); }
            this.prev = new Map();
            this.prevOverlay = new Map();
            this.logger = logger;
        }
        AudioOutputter.prototype.draw = function (game, tiles, camera, curTick, grid, overlayState, pendingDialog) {
            var e_1, _a, e_2, _b;
            var _this = this;
            var current = buildMap(tiles);
            var currentOverlay = new Map();
            for (var key in overlayState) {
                var v = overlayState[key];
                currentOverlay.set(key, v);
            }
            // We notify for 4 things:
            // New thing appeared
            // Old thing disappeared
            // Thing moved
            // Thing changed sprite category
            var messages = [];
            if (this.prev.size === 0) {
                // Output the initial stats
                this.prevOverlay = currentOverlay;
                if (currentOverlay.size > 0) {
                    messages.push('START: Items in the Inventory');
                    __spread(currentOverlay.entries()).forEach(function (_a) {
                        var _b = __read(_a, 2), key = _b[0], value = _b[1];
                        messages.push("  item " + key + " has value " + value);
                    });
                    messages.push('END: Items in the Inventory');
                }
                messages.push('START: Initial Room Information');
                printCounts(messages, current.values());
                messages.push('END: Initial Room Information');
            }
            else {
                var cur = new Set(current.keys());
                var prev = new Set(this.prev.keys());
                var appeared = setDifference(cur, prev);
                var disappeared = setDifference(prev, cur);
                var stillAround = setIntersection(prev, cur);
                // If the room changes (many sprites change) then just print the new room information
                if (disappeared.size > 50) {
                    messages.push('Many things changed. START Current Room Information:');
                    printCounts(messages, current.values());
                    messages.push('END Current Room Information.');
                }
                else {
                    var moved = new Map();
                    var changed = new Map();
                    try {
                        for (var stillAround_1 = __values(stillAround), stillAround_1_1 = stillAround_1.next(); !stillAround_1_1.done; stillAround_1_1 = stillAround_1.next()) {
                            var i = stillAround_1_1.value;
                            var p = this.prev.get(i);
                            var c = current.get(i);
                            if (p.pos.x !== c.pos.x || p.pos.y !== c.pos.y) {
                                moved.set(i, { from: p.pos, to: c.pos });
                            }
                            if (p.category !== c.category) {
                                changed.set(i, { from: p.category, to: c.category });
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (stillAround_1_1 && !stillAround_1_1.done && (_a = stillAround_1.return)) _a.call(stillAround_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    // Print out all the changes
                    if (moved.size > 0) {
                        var movedMessages = __spread(moved.entries()).map(function (_a) {
                            var _b = __read(_a, 2), i = _b[0], _c = _b[1], from = _c.from, to = _c.to;
                            var c = categorize(i.sprite.sprite._name);
                            if (!c) {
                                return '';
                            }
                            var msg = [c];
                            if (to.x < from.x) {
                                msg.push('LEFT');
                            }
                            else if (to.x > from.x) {
                                msg.push('RIGHT');
                            }
                            if (to.y < from.y) {
                                if (msg.length > 1) {
                                    msg.push('and');
                                }
                                msg.push('UP');
                            }
                            else if (to.y > from.y) {
                                if (msg.length > 1) {
                                    msg.push('and');
                                }
                                msg.push('DOWN');
                            }
                            return msg.join(' ');
                        });
                        if (moved.size === 1) {
                            messages.push("Moved " + movedMessages[0]);
                        }
                        else {
                            messages.push(moved.size + " things moved: " + movedMessages.join(', '));
                        }
                    }
                    if (changed.size > 0) {
                        var changedMessages = __spread(changed.entries()).map(function (_a) {
                            var _b = __read(_a, 2), i = _b[0], _c = _b[1], from = _c.from, to = _c.to;
                            return "from " + from + " to " + to;
                        });
                        if (changed.size === 1) {
                            messages.push("changed " + changedMessages[0]);
                        }
                        else {
                            messages.push(changed.size + " things changed: " + changedMessages.join(', '));
                        }
                    }
                    var disappearedSprites = __spread(disappeared).map(function (i) { return _this.prev.get(i); }).filter(function (s) { return !!s; }); // remove nulls
                    var appearedSprites = __spread(appeared).map(function (i) { return current.get(i); }).filter(function (s) { return !!s; }); // remove nulls
                    if (disappearedSprites.length === 1) {
                        messages.push("1 thing disappeared: " + disappearedSprites[0].category);
                    }
                    else if (disappearedSprites.length > 100) {
                        messages.push("Many things disappeared.");
                    }
                    else if (disappearedSprites.length > 0) {
                        messages.push(disappearedSprites.length + " things disappeared:");
                        printCounts(messages, disappearedSprites);
                    }
                    if (appearedSprites.length === 1) {
                        messages.push("1 thing appeared: " + appearedSprites[0].category);
                    }
                    else if (appearedSprites.length > 0) {
                        messages.push(appearedSprites.length + " things appeared:");
                        printCounts(messages, appearedSprites);
                    }
                }
                // Do the changed for the overlay info
                {
                    var cur_1 = new Set(currentOverlay.keys());
                    var prev_1 = new Set(this.prevOverlay.keys());
                    var appeared_1 = setDifference(cur_1, prev_1);
                    var disappeared_1 = setDifference(prev_1, cur_1);
                    var stillAround_3 = setIntersection(prev_1, cur_1);
                    var changed = new Map();
                    try {
                        for (var stillAround_2 = __values(stillAround_3), stillAround_2_1 = stillAround_2.next(); !stillAround_2_1.done; stillAround_2_1 = stillAround_2.next()) {
                            var i = stillAround_2_1.value;
                            var p = this.prevOverlay.get(i);
                            var c = currentOverlay.get(i);
                            if (p !== c) {
                                changed.set(i, { from: p, to: c });
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (stillAround_2_1 && !stillAround_2_1.done && (_b = stillAround_2.return)) _b.call(stillAround_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    if (appeared_1.size + disappeared_1.size + changed.size > 0) {
                        // messages.push('START Inventory updates')
                        if (appeared_1.size > 0) {
                            __spread(appeared_1.keys()).forEach(function (key) {
                                var value = currentOverlay.get(key);
                                messages.push("  " + key + " in inventory was added with value " + value);
                            });
                        }
                        if (disappeared_1.size > 0) {
                            __spread(disappeared_1.keys()).forEach(function (key) {
                                var value = _this.prevOverlay.get(key);
                                messages.push("  " + key + " in inventory was removed with value " + value);
                            });
                        }
                        if (changed.size > 0) {
                            __spread(changed.entries()).forEach(function (_a) {
                                var _b = __read(_a, 2), key = _b[0], _c = _b[1], from = _c.from, to = _c.to;
                                messages.push("  " + key + " in inventory changed from " + from + " to " + to);
                            });
                        }
                        // messages.push('END Inventory Updates')
                    }
                    this.prevOverlay = currentOverlay;
                }
            }
            // only log when actual messages occurred
            if (messages.length > 0) {
                this.logger(messages.map(function (m) { return toSnakeCase(m); }).join('.\n'));
            }
            this.prev = current;
        };
        return AudioOutputter;
    }());
    function buildMap(tiles) {
        var current = new Map();
        tiles.forEach(function (t) {
            var c = categorize(t.getMainSprite()._name);
            if (c) {
                current.set(t, { pos: t.pos, category: c });
            }
        });
        return current;
    }
    function printCounts(acc, items) {
        var e_3, _a, e_4, _b;
        var catCounts = new Map();
        try {
            for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                var v = items_1_1.value;
                if (v.category) {
                    var c = catCounts.get(v.category);
                    catCounts.set(v.category, (c || 0) + 1);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var sorted = __spread(catCounts.entries()).sort(function (a, b) {
            return a[1] - b[1];
        });
        try {
            for (var sorted_1 = __values(sorted), sorted_1_1 = sorted_1.next(); !sorted_1_1.done; sorted_1_1 = sorted_1.next()) {
                var v = sorted_1_1.value;
                var count = v[1];
                var category = v[0];
                acc.push("  " + count + " " + category);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (sorted_1_1 && !sorted_1_1.done && (_b = sorted_1.return)) _b.call(sorted_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
    }
    function setDifference(s1, s2) {
        var e_5, _a;
        var ret = new Set();
        try {
            for (var s1_1 = __values(s1), s1_1_1 = s1_1.next(); !s1_1_1.done; s1_1_1 = s1_1.next()) {
                var i = s1_1_1.value;
                if (!s2.has(i)) {
                    ret.add(i);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (s1_1_1 && !s1_1_1.done && (_a = s1_1.return)) _a.call(s1_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return ret;
    }
    function setIntersection(s1, s2) {
        var sA;
        var sB;
        if (s1.size < s2.size) {
            sA = s1;
            sB = s2;
        }
        else {
            sA = s2;
            sB = s1;
        }
        var ret = new Set();
        sA.forEach(function (i) {
            if (sB.has(i)) {
                ret.add(i);
            }
        });
        return ret;
    }
    var AndOutputter = /** @class */ (function () {
        function AndOutputter(outs) {
            this.outs = new Set(outs);
        }
        AndOutputter.prototype.draw = function (game, tiles, camera, curTick, grid, overlayState, pendingDialog, sprites) {
            var e_6, _a;
            try {
                for (var _b = __values(this.outs), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var o = _c.value;
                    o.draw(game, tiles, camera, curTick, grid, overlayState, pendingDialog, sprites);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        return AndOutputter;
    }());
    //# sourceMappingURL=output.js.map

    var LETTERS = new Map();
    function addLetter(c, bits) {
        LETTERS.set(c, bits);
    }
    addLetter('A', [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1]
    ]);
    addLetter('B', [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 0],
        [1, 0, 1],
        [1, 1, 1]
    ]);
    addLetter('C', [
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [0, 1, 1]
    ]);
    addLetter('D', [
        [1, 1, 0],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1]
    ]);
    addLetter('E', [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 0],
        [1, 0, 0],
        [1, 1, 1]
    ]);
    addLetter('F', [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 0],
        [1, 0, 0],
        [1, 0, 0]
    ]);
    addLetter('G', [
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 1]
    ]);
    addLetter('H', [
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1]
    ]);
    addLetter('I', [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 1]
    ]);
    addLetter('J', [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ]);
    addLetter('K', [
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 0],
        [1, 0, 1],
        [1, 0, 1]
    ]);
    addLetter('L', [
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1]
    ]);
    addLetter('M', [
        [1, 1, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1]
    ]);
    addLetter('N', [
        [1, 1, 0],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1]
    ]);
    addLetter('O', [
        [0, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 0]
    ]);
    addLetter('P', [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0]
    ]);
    addLetter('Q', [
        [0, 1, 0],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 0],
        [0, 1, 1]
    ]);
    addLetter('R', [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 0],
        [1, 0, 1],
        [1, 0, 1]
    ]);
    addLetter('S', [
        [0, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 0]
    ]);
    addLetter('T', [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
    ]);
    addLetter('U', [
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [0, 1, 1]
    ]);
    addLetter('V', [
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [0, 1, 0]
    ]);
    addLetter('W', [
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 1, 1]
    ]);
    addLetter('X', [
        [1, 0, 1],
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
        [1, 0, 1]
    ]);
    addLetter('Y', [
        [1, 0, 1],
        [1, 0, 1],
        [0, 1, 1],
        [0, 0, 1],
        [1, 1, 1]
    ]);
    addLetter('Z', [
        [1, 1, 1],
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
        [1, 1, 1]
    ]);
    addLetter(' ', [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]);
    addLetter('.', [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 1, 0]
    ]);
    addLetter(',', [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 1, 0],
        [1, 0, 0]
    ]);
    addLetter('!', [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 0],
        [0, 1, 0]
    ]);
    addLetter('?', [
        [1, 1, 1],
        [0, 0, 1],
        [0, 1, 1],
        [0, 0, 0],
        [0, 1, 0]
    ]);
    addLetter('.', [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 1, 0]
    ]);
    addLetter('0', [
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1]
    ]);
    addLetter('1', [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 1]
    ]);
    addLetter('2', [
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1]
    ]);
    addLetter('3', [
        [1, 1, 1],
        [0, 0, 1],
        [0, 1, 1],
        [0, 0, 1],
        [1, 1, 1]
    ]);
    addLetter('4', [
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [0, 0, 1],
        [0, 0, 1]
    ]);
    addLetter('5', [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1]
    ]);
    addLetter('6', [
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
    ]);
    addLetter('7', [
        [1, 1, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1]
    ]);
    addLetter('8', [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
    ]);
    addLetter('9', [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [0, 0, 1],
        [0, 0, 1]
    ]);
    addLetter('-', [
        [0, 0, 0],
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
        [0, 0, 0]
    ]);
    addLetter('', [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]);
    //# sourceMappingURL=letters.js.map

    var VisualOutputter = /** @class */ (function () {
        function VisualOutputter(renderer) {
            this.renderer = renderer;
            this.drawPixels = this.drawPixels.bind(this);
            this.drawText = this.drawText.bind(this);
        }
        VisualOutputter.prototype.draw = function (game, tiles, camera, curTick, grid, overlayState, pendingDialog, sprites) {
            var e_1, _a, e_2, _b;
            this.renderer.drawStart();
            game.drawBackground(tiles, camera, this.drawPixels);
            var cameraCache = posAdd({ x: -camera.screenPixelPos.x, y: -camera.screenPixelPos.y }, camera.topLeftPixelPos(grid));
            try {
                for (var tiles_1 = __values(tiles), tiles_1_1 = tiles_1.next(); !tiles_1_1.done; tiles_1_1 = tiles_1.next()) {
                    var t = tiles_1_1.value;
                    var _loop_1 = function (s) {
                        if (s.startTick === 0) {
                            s.startTick = curTick;
                        }
                        var image = s.sprite.tick(s.startTick, curTick);
                        if (!image) {
                            throw new Error('BUG: Could not find image for the sprite.');
                        }
                        // free up any animation sprites that are done animating
                        if (t.sprite !== s && s.isDone(curTick)) {
                            t.animations.delete(s);
                            return "continue";
                        }
                        var pixelPos = posAdd(t.getPixelPos(grid), s.relPos);
                        var screenPos = relativeTo({ x: pixelPos.x, y: pixelPos.y }, cameraCache);
                        // const screenPos = pixelPos
                        var pixels = image.pixels;
                        if (s.maskColor) {
                            pixels = pixels.map(function (row) { return row.map(function (c) { return c === null ? null : s.maskColor; }); });
                        }
                        if (s.isGrayscale) {
                            pixels = pixels.map(function (row) { return row.map(function (c) { return c === null ? null : toGrayscale(c); }); });
                        }
                        this_1.drawPixels(screenPos, pixels, s.hFlip, s.vFlip, s.rotation);
                    };
                    var this_1 = this;
                    try {
                        // Each tile has a main sprite and a set of animation sprites
                        for (var _c = (e_2 = void 0, __values(__spread([t.sprite], t.animations))), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var s = _d.value;
                            _loop_1(s);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (tiles_1_1 && !tiles_1_1.done && (_a = tiles_1.return)) _a.call(tiles_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            game.drawOverlay(this.drawPixels, this.drawText, overlayState, sprites);
            if (pendingDialog) {
                var target = pendingDialog.target ? relativeTo(pendingDialog.target, camera.topLeft()) : null;
                game.drawDialog(pendingDialog.message, this.drawPixels, this.drawText, curTick - pendingDialog.startTick, target, pendingDialog.additional);
            }
            this.renderer.drawEnd();
        };
        VisualOutputter.prototype.drawPixels = function (screenPos, pixels, hFlip, vFlip, rotationAmount) {
            var e_3, _a, e_4, _b;
            if (rotationAmount === void 0) { rotationAmount = ROTATION_AMOUNT.NONE; }
            var height = pixels.length;
            var relY = 0;
            try {
                for (var pixels_1 = __values(pixels), pixels_1_1 = pixels_1.next(); !pixels_1_1.done; pixels_1_1 = pixels_1.next()) {
                    var row = pixels_1_1.value;
                    if (!row) {
                        relY++;
                        continue;
                    }
                    var width = row.length;
                    var relX = 0;
                    try {
                        for (var row_1 = (e_4 = void 0, __values(row)), row_1_1 = row_1.next(); !row_1_1.done; row_1_1 = row_1.next()) {
                            var pixel = row_1_1.value;
                            var x1 = (hFlip ? width - 1 - relX : relX);
                            var y1 = (vFlip ? height - 1 - relY : relY);
                            var pos = void 0;
                            switch (rotationAmount) {
                                case ROTATION_AMOUNT.NONE:
                                    pos = { x: x1, y: y1 };
                                    break;
                                case ROTATION_AMOUNT.UP:
                                    pos = { x: y1, y: width - x1 };
                                    break;
                                case ROTATION_AMOUNT.LEFT:
                                    pos = { x: width - x1, y: height - y1 };
                                    break;
                                case ROTATION_AMOUNT.DOWN:
                                    pos = { x: height - y1, y: x1 };
                                    break;
                                default: throw new Error('ERROR: Can only rotate by 0,1,2,3. each is a 90-degrees amount');
                            }
                            var x = screenPos.x + pos.x;
                            var y = screenPos.y + pos.y;
                            if (pixel !== null && pixel !== undefined && x >= 0 && y >= 0) {
                                this.renderer.drawPixel({ x: x, y: y }, pixel);
                            }
                            relX++;
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (row_1_1 && !row_1_1.done && (_b = row_1.return)) _b.call(row_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                    relY++;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (pixels_1_1 && !pixels_1_1.done && (_a = pixels_1.return)) _a.call(pixels_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        };
        VisualOutputter.prototype.drawText = function (screenPos, message, hexColor) {
            // convert the lines of text to characters
            var line = message;
            for (var colNum = 0; colNum < line.length; colNum++) {
                var c = line[colNum];
                var l = LETTERS.get(c);
                if (!l) {
                    throw new Error("BUG: Do not have sprite for character \"" + c + "\"");
                }
                var pixels = l.map(function (row) { return row.map(function (bit) { return bit ? hexColor : null; }); });
                var x = screenPos.x + colNum * 4;
                var y = screenPos.y;
                this.drawPixels({ x: x, y: y }, pixels, false, false);
            }
        };
        return VisualOutputter;
    }());
    function relativeTo(pos1, pos2) {
        return {
            x: pos1.x - pos2.x,
            y: pos1.y - pos2.y
        };
    }
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : "" + hex;
    }
    function rgbToHex(r, g, b) {
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    function toGrayscale(hex) {
        var rgb = hexToRgb(hex);
        var avg = Math.round((rgb.r + rgb.g + rgb.b) / 3);
        return rgbToHex(avg, avg, avg);
    }
    //# sourceMappingURL=visual.js.map

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var matrix = createCommonjsModule(function (module) {
    /* This is a crappy, half-formed matrix library that only works in 2 or 3
     * dimensions. It should be replaced with a real, grown-up matrix library. */

    var Matrix;

    (function() {

      Matrix = {
        determinant: function(matrix) {
          switch(matrix.length) {
            case 4:
              return matrix[0] * matrix[3] - matrix[1] * matrix[2];

            case 9:
              return matrix[0] * (matrix[4] * matrix[8] - matrix[5] * matrix[7]) +
                     matrix[1] * (matrix[5] * matrix[6] - matrix[3] * matrix[8]) +
                     matrix[2] * (matrix[3] * matrix[7] - matrix[4] * matrix[6]) ;

            default:
              throw new Error("FIXME");
          }
        },
        invert: function(matrix) {
          var det = Matrix.determinant(matrix);

          if(det === 0)
            throw new Error("Cannot invert a matrix with a determinant of zero.");

          switch(matrix.length) {
            case 4:
              return [
                 matrix[3] / det,
                -matrix[1] / det,
                -matrix[2] / det,
                 matrix[0] / det
              ];

            case 9:
              return [
                (matrix[4] * matrix[8] - matrix[5] * matrix[7]) / det,
                (matrix[2] * matrix[7] - matrix[1] * matrix[8]) / det,
                (matrix[1] * matrix[5] - matrix[2] * matrix[4]) / det,

                (matrix[5] * matrix[6] - matrix[3] * matrix[8]) / det,
                (matrix[0] * matrix[8] - matrix[2] * matrix[6]) / det,
                (matrix[2] * matrix[3] - matrix[0] * matrix[5]) / det,

                (matrix[3] * matrix[7] - matrix[4] * matrix[6]) / det,
                (matrix[6] * matrix[1] - matrix[0] * matrix[7]) / det,
                (matrix[0] * matrix[4] - matrix[1] * matrix[3]) / det
              ];

            default:
              throw new Error("FIXME");
          }
        },
        multiply: function(a, b) {
          var n, c, i, j;

          /* Matrix times matrix. */
          if(a.length === b.length)
            throw new Error("FIXME");

          /* Matrix times column vector. */
          else if(a.length === b.length * b.length) {
            n = b.length;
            c = new Array(n);

            for(i = n; i--; ) {
              c[i] = 0;

              for(j = n; j--; )
                c[i] += a[i * n + j] * b[j];
            }

            return c;
          }

          else
            throw new Error("Matrix mismatch.");
        }
      };

      module.exports = Matrix;
    }());
    });

    var barycentric = createCommonjsModule(function (module) {
    var Barycentric;

    (function() {

      var M = typeof Matrix !== "undefined" ? Matrix : matrix;

      Barycentric = {
        coordinates: function(vertices, point) {
          var n = point.length,
              vector = new Array(n),
              matrix = new Array(n * n),
              i, j;

          /* Sanity check the given simplex. */
          if(vertices.length !== n + 1)
            throw new Error("Invalid simplex.");

          for(i = n + 1; i--; )
            if(vertices[i].length !== n)
              throw new Error("Invalid simplex.");

          /* Set up our input vector and matrix. */
          for(i = n; i--; ) {
            vector[i] = point[i] - vertices[0][i];

            for(j = n; j--; )
              matrix[i * n + j] = vertices[j + 1][i] - vertices[0][i];
          }

          /* Compute the barycentric coordinates and return them. */
          return M.multiply(M.invert(matrix), vector);
        },
        /* Barycentric.contains() is like coordinates(), above, except that it only
         * returns the coordinates if the point is within the given simplex; if the
         * point is outside, then null is returned. */
        contains: function(vertices, point) {
          var coordinates = Barycentric.coordinates(vertices, point),
              sum = 0,
              i;

          for(i = coordinates.length; i--; ) {
            if(coordinates[i] < 0.0)
              return null;

            sum += coordinates[i];
          }

          return sum <= 1.0 ? coordinates : null;
        }
      };

      module.exports = Barycentric;
    }());
    });

    var delaunay = createCommonjsModule(function (module) {
    /* This is a JavaScript implementation of Delaunay triangulation. Ideally, it
     * would function in any number of dimensions; the only restriction is in
     * calculating the circumsphere of a simplex, and I can't seem to find the
     * algorithm to do it. As such, this code currently just works in 2 or 3
     * dimensions.
     * 
     * The theory behind Delaunay triangulation can be found here:
     * 
     * http://paulbourke.net/papers/triangulate/ */

    var Delaunay;

    (function() {

      var M = typeof Matrix !== "undefined" ? Matrix : matrix,
          Simplex = function(indices, vertices, n) {
            var list = new Array(indices.length),
                i;

            for(i = list.length; i--; )
              list[i] = vertices[indices[i]];

            this.vertices = indices;
            this.center   = Delaunay.circumcenter(list, n);
            this.radius   = Delaunay.distanceSquared(this.center, list[0], n);
          };

      Simplex.prototype = {
        passed: function(vertex, n) {
          var d = vertex[0] - this.center[0];
          return d > 0.0 && d * d > this.radius;
        },
        contains: function(vertex, n) {
          return Delaunay.distanceSquared(this.center, vertex, n) <= this.radius;
        },
        /* FIXME: This can be done more efficiently, since the vertices are already
         * in sorted order, there's no need to do another sort. Just iterate every
         * array formed by removing one vertex. */
        addEdges: function(n, edges) {
          var edge, i, j;

          for(i = n + 1; i--; ) {
            edge = new Array(n);

            for(j = n; j--; )
              edge[j] = this.vertices[(i + j) % this.vertices.length];

            edge.sort();
            edges.push(edge);
          }
        }
      };

      Delaunay = {
        resolve: function(obj, key) {
          var i;

          if(key !== undefined) {
            if(Array.isArray(key))
              for(i = 0; obj !== undefined && i !== key.length; ++i)
                obj = obj[key[i]];

            else if(obj !== undefined)
              obj = obj[key];
          }

          return obj;
        },
        dimensions: function(vertices) {
          var d = 0,
              i = vertices.length;

          if(i) {
            d = vertices[--i].length;

            while(i--)
              if(vertices[i].length < d)
                d = vertices[i].length;
          }

          return d;
        },
        /* Return the bounding box (two vertices) enclosing each given vertex. */
        boundingBox: function(vertices, n) {
          var min = new Array(n),
              max = new Array(n),
              i, j, pos;

          /* Given some objects, find the bounding box of those objects. */
          if(vertices.length) {
            for(j = n; j--; ) {
              min[j] = Number.POSITIVE_INFINITY;
              max[j] = Number.NEGATIVE_INFINITY;
            }

            for(i = vertices.length; i--; ) {
              pos = vertices[i];

              for(j = n; j--; ) {
                if(pos[j] < min[j])
                  min[j] = pos[j];

                if(pos[j] > max[j])
                  max[j] = pos[j];
              }
            }
          }

          /* No points? Well then, you get a degenerate bounding box. Dumbface. */
          else
            for(j = n; j--; ) {
              min[j] = 0;
              max[j] = 0;
            }

          return [min, max];
        },
        boundingSimplex: function(vertices, n) {
          var box = Delaunay.boundingBox(vertices, n),
              min = box[0],
              max = box[1],
              simplex = new Array(n + 1),
              i, j, w, pos;

          /* Scale up the bounding box. FIXME: This is something of a fudge, in
           * order to make all triangles formed against the super triangle super
           * long and skinny, so that the triangles will be formed against the hull
           * of shapes, instead. That's kludgy. It'd be better to make the
           * algorithm as a whole robust against that kind of silliness. */
          for(j = n; j--; ) {
            w = 2048 + max[j] - min[j];
            min[j] -= w * 1;
            max[j] += w * 3;
          }

          /* The first vertex is just the minimum vertex of the bounding box. */
          simplex[0] = min;

          /* Every subsequent vertex is the max along that axis. */
          for(i = n; i--; ) {
            pos = simplex[1 + i] = new Array(n);

            for(j = n; j--; )
              pos[j] = (i !== j ? min : max)[j];
          }

          /* Return the simplex. */
          return simplex;
        },
        bisectors: function(vertices, n) {
          var m = n + 1,
              matrix = new Array(m * n),
              i, j, a, b, c;

          for(i = n; i--; ) {
            a = vertices[i + 0];
            b = vertices[i + 1];
            c = 0;

            for(j = n; j--; )
              c += (a[j] + b[j]) * (matrix[i * m + j] = a[j] - b[j]);

            matrix[i * m + n] = c * -0.5;
          }

          return matrix;
        },
        cross: function(matrix, n) {
          if(matrix.length !== n * n + n)
            throw new Error("Invalid matrix shape.");

          var m = n + 1,
              sgn = 1,
              vec = new Array(m),
              sq  = new Array(n * n),
              i, j, k;

          for(i = 0; i !== m; ++i) {
            /* If it's the first time through the loop, initialize the square
             * matrix to hold every column but the first. */
            if(i === 0)
              for(j = n; j--; )
                for(k = n; k--; )
                  sq[j * n + k] = matrix[j * m + k + 1];

            /* Every other time, just replace the one column that's no longer
             * relevant. */
            else {
              k = i - 1;
              for(j = n; j--; )
                sq[j * n + k] = matrix[j * m + k];
            }

            vec[i] = sgn * M.determinant(sq);
            sgn    = -sgn;
          }

          return vec;
        },
        /* FIXME: This should probably test the points for collinearity and use a
         * different algorithm in that case, in order to improve robustness. */
        circumcenter: function(vertices, n) {
          if(vertices.length !== n + 1)
            throw new Error("A " + n + "-simplex requires " + (n + 1) + " vertices.");

          /* Find the position of the circumcenter in homogeneous coordinates. */
          var matrix = Delaunay.bisectors(vertices, n),
              center = Delaunay.cross(matrix, n),
              j;

          /* Convert into Euclidean coordinates. */
          for(j = n; j--; )
            center[j] /= center[n];

          center.length = n;

          /* Return the results. */
          return center;
        },
        distanceSquared: function(a, b, n) {
          var d = 0,
              i, t;

          for(i = n; i--; ) {
            t  = b[i] - a[i];
            d += t * t;
          }

          return d;
        },
        distance: function(a, b, n) {
          return Math.sqrt(Delaunay.distanceSquared(a, b, n));
        },
        isSameEdge: function(a, b) {
          var i;

          if(a.length !== b.length)
            return false;

          for(i = a.length; i--; )
            if(a[i] !== b[i])
              return false;

          return true;
        },
        /* FIXME: By using a set data structure, this can be made O(n log n). */
        removeDuplicateEdges: function(edges) {
          var i, j;

          for(i = edges.length; i--; )
            for(j = i; j--; )
              if(Delaunay.isSameEdge(edges[i], edges[j])) {
                edges.splice(i, 1);
                edges.splice(j, 1);
                --i;
                break;
              }
        },
        triangulate: function(objects, key) {
          var v = objects.length,
              i, j;

          /* Resolve all objects, so we never have to do it again. */
          objects = objects.slice(0);
          for(i = objects.length; i--; )
            objects[i] = Delaunay.resolve(objects[i], key);

          /* Get the dimensionality of the objects. */
          var n = Delaunay.dimensions(objects);

          if(n < 2 || n > 3)
            throw new Error("The Delaunay module currently only supports 2D or 3D data.");

          /* Sort the objects on an axis so we can get O(n log n) behavior. Sadly,
           * we also need to keep track of their original position in the array, so
           * we wrap the objects to track that and then unwrap them again. */
          for(i = objects.length; i--; )
            objects[i] = {index: i, position: objects[i]};

          /* FIXME: It'd be better to sort on the longest axis, rather than on an
           * arbitrary axis, since it'll lower the constant factor. */
          objects.sort(function(a, b) { return b.position[0] - a.position[0]; });

          var indices = new Array(objects.length);

          for(i = objects.length; i--; ) {
            indices[i] = objects[i].index;
            objects[i] = objects[i].position;
          }

          /* Add the vertices of the bounding simplex to the object list. It's okay
           * that these vertices aren't sorted like the others, since they're never
           * going to be iterated over. */
          Array.prototype.push.apply(
            objects,
            Delaunay.boundingSimplex(objects, n)
          );

          /* Initialize the simplex list to the bounding simplex. */
          var list = new Array(n + 1);

          for(i = list.length; i--; )
            list[i] = v + i;

          var open   = [new Simplex(list, objects, n)],
              closed = [],
              edges  = [];

          for(i = v; i--; edges.length = 0) {
            for(j = open.length; j--; ) {
              /* If this vertex is past the simplex, then we're never going to
               * intersect it again, so remove it from the open list and move it to
               * the closed list. */
              if(open[j].passed(objects[i], n)) {
                closed.push(open[j]);
                open.splice(j, 1);
              }

              /* Otherwise, if the simplex contains the vertex, it needs to get
               * split apart. */
              else if(open[j].contains(objects[i], n)) {
                open[j].addEdges(n, edges);
                open.splice(j, 1);
              }
            }

            Delaunay.removeDuplicateEdges(edges);

            for(j = edges.length; j--; ) {
              edges[j].unshift(i);
              open.push(new Simplex(edges[j], objects, n));
            }
          }

          /* Move all open simplices into the closed list. */
          Array.prototype.push.apply(closed, open);
          open.length = 0;

          /* Build and return the final list of simplex vertex indices. */
          list.length = 0;

          simplex: for(i = closed.length; i--; ) {
            /* If any of the vertices are from the bounding simplex, skip adding
             * this simplex to the output list. */
            for(j = closed[i].vertices.length; j--; )
              if(closed[i].vertices[j] >= v)
                continue simplex;

            for(j = 0; j < closed[i].vertices.length; j++)
              list.push(indices[closed[i].vertices[j]]);
          }

          return list;
        }
      };

      /* If we're in Node, export our module as a Node module. */
      module.exports = Delaunay;
    }());
    });

    var triangulate = delaunay.triangulate;
    var coordinates = barycentric.coordinates;
    var contains$1    = barycentric.contains;

    var delaunay$1 = {
    	triangulate: triangulate,
    	coordinates: coordinates,
    	contains: contains$1
    };

    var unionFind = UnionFind;

    function UnionFind(count) {
      this.roots = new Array(count);
      this.ranks = new Array(count);
      
      for(var i=0; i<count; ++i) {
        this.roots[i] = i;
        this.ranks[i] = 0;
      }
    }

    UnionFind.prototype.length = function() {
      return this.roots.length;
    };

    UnionFind.prototype.makeSet = function() {
      var n = this.roots.length;
      this.roots.push(n);
      this.ranks.push(0);
      return n;
    };

    UnionFind.prototype.find = function(x) {
      var roots = this.roots;
      while(roots[x] !== x) {
        var y = roots[x];
        roots[x] = roots[y];
        x = y;
      }
      return x;
    };

    UnionFind.prototype.link = function(x, y) {
      var xr = this.find(x)
        , yr = this.find(y);
      if(xr === yr) {
        return;
      }
      var ranks = this.ranks
        , roots = this.roots
        , xd    = ranks[xr]
        , yd    = ranks[yr];
      if(xd < yd) {
        roots[xr] = yr;
      } else if(yd < xd) {
        roots[yr] = xr;
      } else {
        roots[yr] = xr;
        ++ranks[xr];
      }
    };

    var kruskal = createCommonjsModule(function (module) {
    var Kruskal;



    (function() {

      // vertices hold data that will be used in the distance 'metric' function
      // edges holds position in vertices list
      //
      Kruskal = {
        kruskal: function( vertices, edges, metric )
        {

          var finalEdge = [];

          var forest = new unionFind( vertices.length );

          var edgeDist = [];
          for (var ind in edges)
          {
            var u = edges[ind][0];
            var v = edges[ind][1];
            var e = { edge: edges[ind], weight: metric( vertices[u], vertices[v] ) };
            edgeDist.push(e);
          }

          edgeDist.sort( function(a, b) { return a.weight- b.weight; } );

          for (var i=0; i<edgeDist.length; i++)
          {
            var u = edgeDist[i].edge[0];
            var v = edgeDist[i].edge[1];

            if ( forest.find(u) != forest.find(v) )
            {
              finalEdge.push( [ u, v ] );
              forest.link( u, v );
            }
          }

          return finalEdge;

        }
      };

      module.exports = Kruskal;

    })();
    });

    var euclideanmst = createCommonjsModule(function (module) {
    var EuclideanMST;



    (function() {

      EuclideanMST = {
        euclideanMST : function ( vertices, metric )
        {

          var tri = delaunay$1.triangulate(vertices);

          var edges = [];
          var edge_seen = {};

          for (var i=0; i<tri.length; i+=3)
          {
            var e = [ tri[i], tri[i+1], tri[i+2] ];
            e.sort();

            var a = e[0];
            var b = e[1];
            var c = e[2];

            var key = "" + a + "," + b;
            if ( !(key in edge_seen) )
              edges.push( [a,b] );
            edge_seen[key] = 1;

            key = "" + b + "," + c;
            if ( !(key in edge_seen) )
              edges.push( [b,c] );
            edge_seen[key] = 1;

            key = "" + a + "," + c;
            if ( !(key in edge_seen) )
              edges.push( [a,c] );
            edge_seen[key] = 1;

          }

          var mst = 
            kruskal.kruskal( 
                vertices, 
                edges, 
                metric
            );

          return mst;

        }

      };

      module.exports = EuclideanMST;
    })();
    });
    var euclideanmst_1 = euclideanmst.euclideanMST;

    var DoubleArray = /** @class */ (function () {
        function DoubleArray() {
            this.ary = [];
            this.maxX = 0;
            this.maxY = 0;
        }
        DoubleArray.prototype.clear = function () {
            this.ary = [];
        };
        DoubleArray.prototype.set = function (pos, v) {
            var row = this.ary[pos.y];
            if (!row) {
                row = [];
                this.ary[pos.y] = row;
            }
            row[pos.x] = v;
            this.maxY = Math.max(this.maxY, pos.y);
            this.maxX = Math.max(this.maxX, pos.x);
        };
        DoubleArray.prototype.get = function (pos, def) {
            this.maxY = Math.max(this.maxY, pos.y);
            this.maxX = Math.max(this.maxX, pos.x);
            if (!this.ary[pos.y]) {
                var v = [];
                this.ary[pos.y] = v;
                v[pos.x] = def;
                return def;
            }
            if (!this.ary[pos.y][pos.x]) {
                this.ary[pos.y][pos.x] = def;
                return def;
            }
            return this.ary[pos.y][pos.x];
        };
        DoubleArray.prototype.dim = function () {
            return {
                width: this.maxX + 1,
                height: this.maxY + 1
            };
        };
        DoubleArray.prototype.asArray = function () {
            return this.ary;
        };
        DoubleArray.prototype.forEach = function (fn) {
            this.ary.forEach(fn);
        };
        return DoubleArray;
    }());
    //# sourceMappingURL=doubleArray.js.map

    // From https://medium.com/@deathmood/how-to-write-your-own-virtual-dom-ee74acc13060
    function h(type, props) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        if (isFunction(type)) {
            var t = type;
            return t(props);
        }
        if (isArray(head(children))) {
            children = head(children);
        }
        return { type: type, props: props || {}, children: children };
    }
    function createElement(node) {
        if (typeof node === 'string') {
            return document.createTextNode(String(node));
        }
        var $el = document.createElement(node.type);
        applyProps($el, node.props);
        node.children.map(function (child) { return $el.appendChild(createElement(child)); });
        return $el;
    }
    function patch($parent, newTree, oldTree, index) {
        if (index === void 0) { index = 0; }
        if (!oldTree) {
            $parent.appendChild(createElement(newTree));
        }
        if (!newTree) {
            removeChildren($parent, index);
        }
        else if (changed(newTree, oldTree)) {
            $parent.replaceChild(createElement(newTree), $parent.childNodes[index]);
        }
        else if (!isUndefined(newTree.type)) {
            applyProps($parent.children[index], newTree.props, oldTree.props);
            patchNodes($parent, newTree, oldTree, index);
        }
    }
    function changed(a, b) {
        return (typeof a !== typeof b) || (!isObject(a) && a !== b) || (a.type !== b.type);
    }
    function patchNodes($parent, newTree, oldTree, index) {
        var len = Math.max(newTree.children.length, oldTree.children.length);
        var i = -1;
        while (++i < len) {
            if (!$parent.childNodes[index]) {
                console.log($parent);
                throw new Error("BUG: VDom Found null child in $parent " + i);
            }
            patch($parent.children[index], newTree.children[i], oldTree.children[i], i);
        }
    }
    function removeChildren($parent, index) {
        var times = ($parent.childNodes.length || 0) - index;
        while (times-- > 0) {
            if ($parent.lastChild) {
                $parent.removeChild($parent.lastChild);
            }
        }
    }
    function applyProps($el, newProps, oldProps) {
        if (oldProps === void 0) { oldProps = {}; }
        var props = merge(newProps, oldProps);
        Object.keys(props).map(function (name) {
            var newValue = newProps[name];
            var oldValue = oldProps[name];
            if (isObject(newValue)) {
                applyProps($el[name], newValue, oldValue);
            }
            else {
                if (!newValue) {
                    removeProp($el, name);
                }
                else if (newValue !== oldValue) {
                    setProp($el, name, newValue);
                }
            }
        });
    }
    function setProp($el, name, value) {
        if (name === 'className') {
            $el.setAttribute('class', value);
        }
        else {
            $el[name] = value;
        }
    }
    function removeProp($el, name) {
        if (name === 'className') {
            $el.removeAttribute('class');
        }
        else {
            $el.removeAttribute(name);
        }
    }
    function isObject(x) {
        return typeof x === 'object' && x !== null;
    }
    function isFunction(x) {
        return typeof x === 'function';
    }
    function isUndefined(x) {
        return x === undefined;
    }
    var isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    function head(x) {
        return typeof x === 'string' ? x.charAt(0) : x[0];
    }
    function merge(a, b) {
        return Object.assign({}, a, b);
    }
    //# sourceMappingURL=vdom.js.map

    var e_1, _a;
    var keyConfig = new Map();
    keyConfig.set(BUTTON_TYPE.DPAD_UP, ['W', 'w', 'ArrowUp']);
    keyConfig.set(BUTTON_TYPE.DPAD_DOWN, ['S', 's', 'ArrowDown']);
    keyConfig.set(BUTTON_TYPE.DPAD_LEFT, ['A', 'a', 'ArrowLeft']);
    keyConfig.set(BUTTON_TYPE.DPAD_RIGHT, ['D', 'd', 'ArrowRight']);
    keyConfig.set(BUTTON_TYPE.CLUSTER_DOWN, ['X', 'x', ' ', 'Enter']);
    keyConfig.set(BUTTON_TYPE.BUMPER_TOP_LEFT, ['Q', 'q']);
    keyConfig.set(BUTTON_TYPE.BUMPER_TOP_RIGHT, ['E', 'e']);
    var keyMap = new Map();
    var _loop_1 = function (button, keys) {
        keys.forEach(function (key) { return keyMap.set(key, button); });
    };
    try {
        for (var _b = __values(keyConfig.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), button = _d[0], keys = _d[1];
            _loop_1(button, keys);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var checkActiveElement = function (root, current) {
        var _a;
        if (root === current) {
            return true;
        }
        if ((_a = current) === null || _a === void 0 ? void 0 : _a.parentElement) {
            return checkActiveElement(root, current.parentElement);
        }
        return false;
    };
    var Keymaster = /** @class */ (function () {
        function Keymaster(mapper, listener, context) {
            this.pressed = new Set();
            this.mapper = mapper;
            this.listener = listener;
            this.context = context;
            this.onKeyDown = this.onKeyDown.bind(this);
            this.onKeyUp = this.onKeyUp.bind(this);
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('keyup', this.onKeyUp);
        }
        Keymaster.prototype.dispose = function () {
            window.removeEventListener('keydown', this.onKeyDown);
            window.removeEventListener('keyup', this.onKeyUp);
        };
        Keymaster.prototype.onKeyDown = function (evt) {
            var key = this.mapper(evt.key);
            if (key && (!this.context || checkActiveElement(this.context, window.document.activeElement))) {
                this.pressed.add(key);
                if (this.listener)
                    this.listener(key, true);
            }
        };
        Keymaster.prototype.onKeyUp = function (evt) {
            var key = this.mapper(evt.key);
            if (key && (!this.context || checkActiveElement(this.context, window.document.activeElement))) {
                this.pressed.delete(key);
                if (this.listener)
                    this.listener(key, false);
            }
        };
        Keymaster.prototype.isPressed = function (key) {
            return this.pressed.has(key);
        };
        return Keymaster;
    }());
    var KeyGamepad = /** @class */ (function () {
        function KeyGamepad(context) {
            this.km = new Keymaster(function (key) { return keyMap.get(key); }, null, context);
        }
        KeyGamepad.prototype.dispose = function () {
            this.km.dispose();
        };
        KeyGamepad.prototype.tick = function () {
            // no polling necessary. They on('keydown') handles this async
        };
        KeyGamepad.prototype.isButtonPressed = function (btn) {
            return this.km.isPressed(btn);
        };
        KeyGamepad.prototype.getStickCoordinates = function (stick) {
            return null;
        };
        return KeyGamepad;
    }());
    //# sourceMappingURL=input.js.map

    var GridTableOutputter = /** @class */ (function () {
        function GridTableOutputter(root) {
            this.root = root;
        }
        GridTableOutputter.prototype.draw = function (game, tiles, camera, curTick, grid, overlayState, pendingDialog, sprites) {
            var model = new DoubleArray();
            tiles.forEach(function (t) {
                var spritenames = model.get(t.pos, new Set());
                spritenames.add(categorize(t.getMainSprite()._name));
            });
            var overlayInfo = ['Inventory Info:'];
            for (var key in overlayState) {
                var v = overlayState[key];
                overlayInfo.push("Item " + key + " is " + v);
            }
            var next = h('table', null, h('caption', null, overlayInfo.join(' ')), h.apply(void 0, __spread(['tbody', null], model.asArray().filter(function (s) { return !!s; }).map(function (row) {
                return h.apply(void 0, __spread(['tr', null], row.filter(function (s) { return !!s; }).map(function (col) {
                    return h.apply(void 0, __spread(['td', null], __spread(col.keys()).filter(function (s) { return !!s; }).map(function (s) {
                        var snake = toSnakeCase(s);
                        return h('span', { className: snake.toLowerCase() }, snake + " ");
                    })));
                })));
            }))));
            patch(this.root, next, this.prevDom);
            this.prevDom = next;
        };
        return GridTableOutputter;
    }());
    var CanvasRenderer = /** @class */ (function () {
        function CanvasRenderer(canvas, pixelSize) {
            if (pixelSize === void 0) { pixelSize = 1; }
            this.pixelSize = pixelSize;
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
        CanvasRenderer.prototype.drawStart = function () {
            this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        };
        CanvasRenderer.prototype.drawEnd = function () {
            this.ctx.putImageData(this.imageData, 0, 0);
        };
        CanvasRenderer.prototype.drawPixel = function (pos, hex) {
            // if (!(pos.x >= 0 && pos.y >= 0)) { throw new Error(`BUG: Tried to draw outside of the camera range ${JSON.stringify(pos)}`) }
            // this.ctx.fillStyle = hex
            // this.ctx.fillRect(pos.x * this.pixelSize, pos.y * this.pixelSize, this.pixelSize, this.pixelSize)
            var rgb = hexToRgb(hex);
            var i = (pos.y * this.imageData.width + pos.x) * 4;
            var data = this.imageData.data;
            data[i + 0] = rgb.r;
            data[i + 1] = rgb.g;
            data[i + 2] = rgb.b;
            data[i + 3] = 255;
        };
        return CanvasRenderer;
    }());
    var GridInspector = /** @class */ (function () {
        function GridInspector(table, logger, keyContext) {
            this.table = table;
            this.logger = logger;
            this.listen = this.listen.bind(this);
            this.km = new Keymaster(function (x) { return x; }, this.listen, keyContext);
            this.lastPlayerPos = { x: -2, y: -2 }; // just invalid
            this.relPos = { x: 0, y: 0 };
        }
        GridInspector.prototype.listen = function (key, pressed) {
            if (pressed) {
                var dx = 0;
                var dy = 0;
                switch (key) {
                    case 'i':
                        dy = -1;
                        break;
                    case 'j':
                        dx = -1;
                        break;
                    case 'l':
                        dx = 1;
                        break;
                    case 'k':
                        dy = 1;
                        break;
                    case 'm': return this.printTree();
                    default: return;
                }
                var newPlayerPos = this.findPlayerPos();
                if (this.lastPlayerPos.x !== newPlayerPos.x || this.lastPlayerPos.y !== newPlayerPos.y) {
                    this.relPos = { x: dx, y: dy };
                    this.lastPlayerPos = newPlayerPos;
                }
                else {
                    this.relPos = {
                        x: this.relPos.x + dx,
                        y: this.relPos.y + dy
                    };
                }
                var pos = {
                    x: this.lastPlayerPos.x + this.relPos.x,
                    y: this.lastPlayerPos.y + this.relPos.y
                };
                var td = this.table.querySelector("tr:nth-child(" + (pos.y + 1) + ") > td:nth-child(" + (pos.x + 1) + ")");
                if (td) {
                    var sprites = Array.from(td.querySelectorAll('span')).map(function (s) { return s.innerHTML; });
                    this.logger((sprites.join(' ') || 'NOTHING') + " @ (" + pos.x + ", " + pos.y + ")");
                }
                else {
                    this.logger('End of screen reached');
                }
            }
        };
        GridInspector.prototype.findPlayerPos = function () {
            var players = this.table.querySelectorAll('tr td .player');
            if (players.length !== 1) {
                throw new Error("BUG: Expected to always find exactly 1 player but found " + players.length);
            }
            var player = players[0];
            var td = player.parentElement;
            var tr = td.parentElement;
            var tbody = tr.parentElement;
            return {
                x: indexOf(tr, td),
                y: indexOf(tbody, tr)
            };
        };
        GridInspector.prototype.printTree = function () {
            var nodes = new Map();
            this.table.querySelectorAll('tr').forEach(function (tr, y) {
                tr.querySelectorAll('td').forEach(function (td, x) {
                    td.querySelectorAll('span').forEach(function (span) {
                        var v = [x, y];
                        var name = span.textContent.trim().toLowerCase();
                        // Skip Wall & Water sprites
                        if (name === 'wall' || name === 'water') {
                            return;
                        }
                        if (nodes.get(v) !== 'player') { // make sure "player" is always in the tree
                            nodes.set(v, name);
                        }
                    });
                });
            });
            var verts = __spread(nodes.keys());
            var edgesWithVertIndex = euclideanmst_1(verts, function (a, b) {
                return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
            });
            var vertexes = verts.map(function (v) { return ({ x: v[0], y: v[1], name: nodes.get(v) }); });
            var edges = edgesWithVertIndex.map(function (_a) {
                var _b = __read(_a, 2), v1Index = _b[0], v2Index = _b[1];
                return [vertexes[v1Index], vertexes[v2Index]];
            });
            var player = vertexes.find(function (v) { return v.name.toLowerCase() === 'player'; });
            var bfs = new BFS(edges, player);
            var msg = bfs.tickAll().map(function (_a) {
                var from = _a.from, to = _a.to;
                var dx = to.x - from.x;
                var dy = to.y - from.y;
                var ret = [];
                if (dx !== 0) {
                    ret.push(Math.abs(dx) + " " + (dx < 0 ? 'LEFT' : 'RIGHT'));
                }
                if (dy !== 0) {
                    ret.push(Math.abs(dy) + " " + (dy < 0 ? 'UP' : 'DOWN'));
                }
                // say the longer distance first
                if (Math.abs(dx) < Math.abs(dy)) {
                    ret.reverse();
                }
                return to.name + " is " + ret.join(' AND ') + " from " + from.name + ".";
            });
            this.logger(msg.join(' ') + ". ");
        };
        return GridInspector;
    }());
    var BFS = /** @class */ (function () {
        function BFS(edges, root) {
            this.edges = new Set();
            this.visited = new Set();
            this.edges = new Set(edges);
            this.queue = [{ to: root, from: null }];
        }
        BFS.prototype.tick = function () {
            var _this = this;
            if (this.queue.length === 0) {
                if (this.edges.size !== 0) {
                    throw new Error("BUG: Expected edges to run out by now but there were still " + this.edges.size + " left: " + JSON.stringify(__spread(this.edges.keys())));
                }
                return null;
            }
            var _a = this.queue.sort(function (a, b) { return distance(a) - distance(b); }).shift(), to = _a.to, from = _a.from;
            var edgesToRemove = new Set();
            this.edges.forEach(function (e) {
                if (e[0] === to) {
                    edgesToRemove.add(e);
                    _this.queue.push({ to: e[1], from: to });
                }
                else if (e[1] === to) {
                    edgesToRemove.add(e);
                    _this.queue.push({ to: e[0], from: to });
                }
            });
            edgesToRemove.forEach(function (e) { return _this.edges.delete(e); });
            if (from === null) {
                return this.tick();
            }
            else {
                return { to: to, from: from };
            }
        };
        BFS.prototype.tickAll = function () {
            var ret = [];
            var e;
            while ((e = this.tick()) !== null) {
                ret.push(e);
            }
            return ret;
        };
        return BFS;
    }());
    function distance(e) {
        return Math.abs(e.to.x - e.from.x) + Math.abs(e.to.y - e.from.y);
    }
    function indexOf(parent, child) {
        return Array.prototype.indexOf.call(parent.children, child);
    }
    //# sourceMappingURL=output.js.map

    exports.AndOutputter = AndOutputter;
    exports.AudioOutputter = AudioOutputter;
    exports.CanvasRenderer = CanvasRenderer;
    exports.Engine = Engine;
    exports.GridInspector = GridInspector;
    exports.GridTableOutputter = GridTableOutputter;
    exports.KeyGamepad = KeyGamepad;
    exports.MyGame = MyGame;
    exports.OrGamepad = OrGamepad;
    exports.VisualOutputter = VisualOutputter;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=browser.bundle.js.map
