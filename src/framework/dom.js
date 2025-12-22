
// dom abstraction - virtual dom
// creating virtual nodes

export function makeElement(tag, attrs = {}, children = []) {

	let key = undefined;
	if (key in attrs){
		key = attrs.key;
		delete attrs.key;
	}

	children = Array.isArray(children) ? children : [children];

	children = children.filter(child => child !== null && child !== undefined);

	children = children.map((child) =>
		typeof child === "string" || typeof child === "number"
		? { tag: "#text", attrs: {}, children: [], text: child }
		: child
	);

	return {
		tag,
		attrs,
		children,
		element: null,
		key
	};
}

function createDOM(vnode) {
	if (!vnode || !vnode.tag){
		console.warn('invalid virtual node', vnode);
		return document.createComment('invalid');
	}

	if (vnode.tag == '#text'){
		const textNode = document.createTextNode(vnode.text);
		vnode.element = textNode;
		return textNode;
	}

	const element = document.createElement(vnode.tag);
	vnode.element = element;

	// adding attributes from the vnode to the elem
	for (const [key, value] of Object.entries(vnode.attrs))
	{
		element.setAttribute(key, value);
	}

	vnode.children.map(child => {
		element.appendChild(createDOM(child));
	})

	return (element);
}

// storing the previouse rendering node
let prevVNode = null;


export function render(vnode, container){
	if (!prevVNode){
		// this will be the first rendre at all, so we will create everything from scratch
		container.innerHTML = "";
		container.appendChild(createDOM(vnode));
	}else{
		updateDOM(prevVNode, vnode, container);
	}
	prevVNode = vnode;
}

// Updating dom checking the diff, to change specific item
function updateDOM(oldVnode, newVnode, parent){
	// in case there is no old node, we create new one
	if (!oldVnode || !oldVnode.element){
		const newElem = createDOM(newVnode);
		if (parent && newElem) parent.appendChild(newElem);
		return;
	}

	//in case if both are text nodes, just update 2 texts, 
	if (oldVnode.tag == '#text' && newVnode.tag == '#text' ){
		if (oldVnode.text != newVnode.text)
		{
			oldVnode.element.nodeValue = newVnode.text;
		}
		newVnode.element = oldVnode.element;
		return;
	}
	if (oldVnode.tag != newVnode.tag)
	{
		const newElem = createDOM(newVnode);
		parent.replaceChild(newElem, oldVnode.element)
	}

	// Update attributes
	updateAttributes(oldVnode, newVnode);

	// Update children
	updateChildren(oldVnode, newVnode);
}

function updateAttributes(oldVnode, newVnode)
{
	const elem = oldVnode.element;
	const oldAttrs = oldVnode.attrs;
	const newAttrs = newVnode.attrs;

	for (const key of Object.entries(oldAttrs))
	{
		if (!(key in newAttrs))
		{
			elem.removeAttribute(key);
		}
	}
	for (const [key, value] of Object.entries(newAttrs))
	{
		if (oldAttrs.key != value)
		{
			elem.setAttribute(key, value)
		}

	}

}

function updateChildren(oldVnode, newVnode)
{
	const parentElement = newVnode.element;
	const oldKids = oldVnode.children || [];
	const newKids = newVnode.children || [];

	const maxLength = Math.max(oldKids.length, newKids.length);
	for (let i = 0; i < maxLength; i++)
	{
		const oldChild = oldKids[i];
		const newChild = newKids[i];
		
		if (!newChild){
			if (oldChild && oldChild.element)
			{
				parentElement.removeChild(oldChild.element);
			}
		}else if (!oldChild){
			parentElement.appendChild(createDOM(newChild));
		}else{
			updateDOM(oldChild, newChild, parentElement);
		}
	}
}
