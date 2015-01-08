var processStyles = function(dom,arr,parents,remove){
	if(!arr){
		arr = [];
	}
	var curr;
	var style = dom.properties && dom.properties.style;
	if(remove && style){delete dom.properties.style;}
	var classes = dom.properties && dom.properties.className;
	var id = dom.properties && dom.properties.id;
	var tag = dom.tagName;
	var specifics = makeSpecific(id,classes,tag,parents);
	arr.push({rules:specifics,style:style})
	if(dom.children && dom.children.length){
		var i = 0;
		var l = dom.children.length
		for(i;i<l;i++){
			curr = dom.children[i];
			processStyles(curr,arr,specifics);
		}
	}
	return arr;
};

var extractStyles = function(dom,remove,process){
	if(typeof remove == 'undefined'){remove=true;}
	var arr = processStyles(dom,null,null,remove);
	if(process){
		arr = reduceStyles(arr);
		arr = selectStyles(arr);
	}
	return arr;
}

module.exports = extractStyles;