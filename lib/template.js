var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var stringify = require('virtual-dom-stringify');
var macros = require('./macros');
var doT = require('dot');

doT.templateSettings = {
	evaluate:    /<%([\s\S]+?)%>/g
,	interpolate: /<%=([\s\S]+?)%>/g
,	encode:      /<%!([\s\S]+?)%>/g
,	use:         /<%#([\s\S]+?)%>/g
,	define:      /<%##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#%>/g
,	conditional: /<%\?(\?)?\s*([\s\S]*?)\s*%>/g
,	iterate:     /<%~\s*(?:%>|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*%>)/g
,	varname: 'it'
,	strip: true
,	append: true
,	selfcontained: false
};

function processTemplateText(contents){
	for(var i = 0, l = macros.length;i<l;i++){
		contents = contents.replace(macros[i][0],macros[i][1]);
	}
	if(!/(exports|module\.exports)\s*?=/.test(contents)){
		contents = 'module.exports = '+contents;
	}
	contents = doT.template(contents)();
	return contents;
}


function Template(renderFunction){
	var fn = function(){
		var l = arguments.length, args = new Array(l);
		while(l){args[--l] = arguments[l];}
		var tree = renderFunction.apply(this,args);
		tree.toString = function(){return stringify(tree);}
		return tree;
	}
	for(var i=0;i<TemplateMethodsKeysLength;i++){
		fn[TemplateMethodsKeys[i]] = TemplateMethods[TemplateMethodsKeys[i]];
	}
	return fn;
}

Template.processText = processTemplateText;

var TemplateMethods = {
	tree: function(locals){
		if(!this._tree){
			this._tree = this(locals);
		}
		return this._tree;
	}

,	root: function(locals){
		if(!this._root){this._root = createElement(this.tree(locals));}
		return this._root;
	}

,	toString: function(locals){
		return stringify(this.tree(locals));
	}

,	update: function(locals){
		if(!this._tree){
			return this.tree(locals);
		}
		var newTree = this(locals);
		var patches = diff(this.tree(),newTree);
		this._root = patch(this.root(),patches);
		this._tree = newTree;
	}
}

var TemplateMethodsKeys = Object.keys(TemplateMethods);
var TemplateMethodsKeysLength = TemplateMethodsKeys.length;

module.exports = Template;