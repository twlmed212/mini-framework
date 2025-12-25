import { on } from './event.js';

export function makeElement(tag, attrs = {}, children = []) {
    let key = undefined;
    if ('key' in attrs) {
        key = attrs.key;
        delete attrs.key;
    }

    children = Array.isArray(children) ? children : [children];
    children = children.filter(child => child !== null && child !== undefined);
    children = children.map((child) =>
        typeof child === "string" || typeof child === "number"
            ? { tag: "#text", attrs: {}, children: [], text: String(child) }
            : child
    );

    return { tag, attrs, children, element: null, key };
}

function createDOM(vnode) {
    if (!vnode || !vnode.tag) {
        console.warn('invalid virtual node', vnode);
        return document.createComment('invalid');
    }

    if (vnode.tag === '#text') {
        const textNode = document.createTextNode(vnode.text);
        vnode.element = textNode;
        return textNode;
    }

    const element = document.createElement(vnode.tag);
    vnode.element = element;

    for (const [key, value] of Object.entries(vnode.attrs)) {
        if (key.startsWith('on')) {
            const eventType = key.toLowerCase().slice(2);
            on(element, eventType, value);
        } else if (key === 'checked') {
            if (value) {
                element.setAttribute('checked', '');
                element.checked = true;
            }
        } else {
            element.setAttribute(key, value);
        }
    }

    vnode.children.forEach(child => {
        element.appendChild(createDOM(child));
    });

    return element;
}

let prevVNode = null;

export function render(vnode, container) {
    if (!prevVNode) {
        container.innerHTML = "";
        container.appendChild(createDOM(vnode));
    } else {
        updateDOM(prevVNode, vnode, container);
    }
    prevVNode = vnode;
}

function updateDOM(oldVnode, newVnode, parent) {
    if (!oldVnode || !oldVnode.element) {
        const newElem = createDOM(newVnode);
        if (parent && newElem) parent.appendChild(newElem);
        return;
    }

    if (oldVnode.tag === '#text' && newVnode.tag === '#text') {
        if (oldVnode.text !== newVnode.text) {
            oldVnode.element.nodeValue = newVnode.text;
        }
        newVnode.element = oldVnode.element;
        return;
    }

    if (oldVnode.tag !== newVnode.tag) {
        const newElem = createDOM(newVnode);
        parent.replaceChild(newElem, oldVnode.element);
        return;
    }

    // FIX 3: Reuse element
    newVnode.element = oldVnode.element;

    updateAttributes(oldVnode, newVnode);
    updateChildren(oldVnode, newVnode);
}

function updateAttributes(oldVnode, newVnode) {
    const elem = newVnode.element;
    const oldAttrs = oldVnode.attrs;
    const newAttrs = newVnode.attrs;

    // FIX 4: Use Object.keys() not Object.entries()
    for (const key of Object.keys(oldAttrs)) {
        if (!(key in newAttrs)) {
            if (key.startsWith('on')) {
                const eventType = key.toLowerCase().slice(2);
                on(elem, eventType, () => {});
            } else {
                elem.removeAttribute(key);
            }
        }
    }

    // FIX 5: Use oldAttrs[key] not oldAttrs.key
    for (const [key, value] of Object.entries(newAttrs)) {
        if (oldAttrs[key] !== value) {
            if (key.startsWith('on')) {
                const eventType = key.toLowerCase().slice(2);
                on(elem, eventType, value);
            } else if (key === 'checked') {
                if (value) {
                    elem.setAttribute('checked', '');
                    elem.checked = true;
                } else {
                    elem.removeAttribute('checked');
                    elem.checked = false;
                }
            } else {
                elem.setAttribute(key, value);
            }
        }
    }
}

function updateChildren(oldVnode, newVnode) {
    const parentElement = newVnode.element;
    const oldKids = oldVnode.children || [];
    const newKids = newVnode.children || [];

    const maxLength = Math.max(oldKids.length, newKids.length);
    
    for (let i = 0; i < maxLength; i++) {
        const oldChild = oldKids[i];
        const newChild = newKids[i];
        
        if (!newChild) {
            if (oldChild && oldChild.element) {
                parentElement.removeChild(oldChild.element);
            }
        } else if (!oldChild) {
            parentElement.appendChild(createDOM(newChild));
        } else {
            updateDOM(oldChild, newChild, parentElement);
        }
    }
}