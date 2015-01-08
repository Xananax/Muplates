var h = require('virtual-dom/h');
var version = require("virtual-dom/vnode/version");
var fequire = require('fequire');
var Template = require('./template');
var fs = require('fs');
var stylus = require('stylus');
var nib = require('nib');
var rupture = require('rupture');

function isPlainObject(o) {
	return ((!!o) && (typeof o === 'object') && (o.constructor === Object));
};

function isChild(x) {return isVirtualNode(x) || isVirtualText(x) || isWidget(x) || isThunk(x)}
function isChildren(x) {return typeof x === "string" || Array.isArray(x) || isChild(x)}
function isVirtualNode(x) {return x && x.type === "VirtualNode" && x.version === version}
function isThunk(t) {return t && t.type === "Thunk"}
function isWidget(w) {return w && w.type === "Widget"}
function isVirtualText(x) {return x && x.type === "VirtualText" && x.version === version}

var tags = 'a abbr acronym address area article aside audio b bdi bdo big blockquote body br button canvas caption cite code col colgroup command datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link map mark meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby samp script section select small source span split strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt ul var video wbr'.split(' ');

function Theme(){
	if(!(this instanceof Theme)){return new Theme();}
	this._root = '';
	this._templates = {};
	this._css = {};
	for(var i=0;i<ThemeMethodsKeysLength;i++){
		this[ThemeMethodsKeys[i]] = ThemeMethods[ThemeMethodsKeys[i]].bind(this);
	}
}


var ThemeMethods = {

	root:function SetRoot(root){
		if(arguments.length){this._root = root.replace(/\/$/,'')+'/';return this;}
		return this._root;
	}
,	template:function LoadTemplate(name,cb){
		if(this._templates[name]){
			if(cb){return cb(null,this._templates[name]);}
			return this._templates[name];
		}
		var that = this
		,	path = this._root+name.replace(/\.js$/,'')+'.js'
		,	tmpl
		,	contents
		;
		if(cb){
			fs.readFile(path,{encoding:'utf8'},function(err,contents){			
				if(err){return cb(err);}
				contents = Template.processText(contents);
				fequire.run(path,contents,this,function(err,tmpl){
					if(err){return cb(err);}
					that._templates[name] = Template(tmpl);
					cb(null,that._templates[name]);
				});
			})
			return;
		}
		try{
			contents = fs.readFileSync(path,{encoding:'utf8'});
			contents = Template.processText(contents);
			tmpl = fequire.run(path,contents,this);
			this._templates[name] = Template(tmpl);
			return this._templates[name];
		}catch(e){
			throw e
			return false;
		}
	}
,	load:function LoadTemplateChainable(name){
		this.template(name);
		return this;
	}
,	css: function generateCSS(compress){
		if(!arguments.length){compress = true;}
		var css = JSON.stringify(this._css,null,'\t')
			.replace(/\{|\}/g,'')
			.replace(/"(.*?)":/g,'$1:')
			.replace(/([a-z])([A-Z])/g, function(total,a,b){return a+'-'+b.toLowerCase();})
			.replace(/^\t|\n\t/g,'\n')
			.replace(/^\n|\n\n$/g,'')
			.replace(/"(#[0-8a-fA-F]+)"/g,'$1')
			.replace(/"(\d+(px|em|%))"/g,'$1')
			.replace(/\\"/g,"''")
			.replace(/"/g,'')
			.replace(/''/g,'"')
			.replace(/,|:/g,'')
		;
		stylus(css)
			.use(nib())
			.use(rupture())
			.include(nib.path)
			.set('compress',compress)
			.render(function(err,out){
				css = out;
			});
		return css || '';
	}
,	el:function element(){
		var l = arguments.length, args = new Array(l);
		while(l){args[--l] = arguments[l];}
		var identifier = '';
		var tag = args.shift();
		if(tag!=='style' && typeof args[0] == 'string' && /^(#|\.)/.test(args[0])){
			identifier = args.shift();
		}
		tag+=identifier;
		if(!isChild(args[0]) && !Array.isArray(args[0]) && typeof args[0]!=='string' && typeof args[0] !== 'undefined'){
			properties = args.shift();
			if((tag || identifier) && properties.hasOwnProperty('css')){
				this._css[identifier || tag] = properties.css;
				delete properties.css;
			}
			if(properties.hasOwnProperty('class')){
				if(properties.hasOwnProperty('className')){
					if(Array.isArray(properties.class)){
						if(Array.isArray(properties.className)){
							properties.className = properties.className.concat(properties.class);
						}else{
							properties.className+=' '+properties.class.join(' ');
						}
					}else{
						if(Array.isArray(properties.className)){
							properties.className.push(properties.class);
						}else{
							properties.className+=' '+properties.class;
						}
					}
				}else{
					properties.className = properties.class;
				}
				delete properties.class;
			};
			if(properties.hasOwnProperty('className') && Array.isArray(properties.className)){
				properties.className = properties.className.join(' ');
			}
			return h.call(null,tag,properties,args);
		}
		return h.call(null,tag,args);
	}
}

function makeTemplateTagFunction(t){
	return function tag(){
		var l = arguments.length, args = new Array(l);
		while(l){args[--l] = arguments[l];}
		args.unshift(t);
		return this.el.apply(this,args);
	}
}

tags.forEach(function(tag){
	ThemeMethods[tag] = makeTemplateTagFunction(tag);
});

var ThemeMethodsKeys = Object.keys(ThemeMethods);
var ThemeMethodsKeysLength = ThemeMethodsKeys.length;

module.exports = Theme;