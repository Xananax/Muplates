var inspect = function(obj){
 	console.log(require('util').inspect(obj,false,3,true));
}

/**
 * K-combinations
 * 
 * Get k-sized combinations of elements in a set.
 * 
 * Usage:
 *   k_combinations(set, k)
 * 
 * Parameters:
 *   set: Array of objects of any type. They are treated as unique.
 *   k: size of combinations to search for.
 * 
 * Return:
 *   Array of found combinations, size of a combination is k.
 * 
 * Examples:
 * 
 *   k_combinations([1, 2, 3], 1)
 *   -> [[1], [2], [3]]
 * 
 *   k_combinations([1, 2, 3], 2)
 *   -> [[1,2], [1,3], [2, 3]
 * 
 *   k_combinations([1, 2, 3], 3)
 *   -> [[1, 2, 3]]
 * 
 *   k_combinations([1, 2, 3], 4)
 *   -> []
 * 
 *   k_combinations([1, 2, 3], 0)
 *   -> []
 * 
 *   k_combinations([1, 2, 3], -1)
 *   -> []
 * 
 *   k_combinations([], 0)
 *   -> []
 */
function k_combinations(set, k) {
	var i, j, combs, head, tailcombs;
	
	if (k > set.length || k <= 0) {
		return [];
	}
	
	if (k == set.length) {
		return [set];
	}
	
	if (k == 1) {
		combs = [];
		for (i = 0; i < set.length; i++) {
			combs.push([set[i]]);
		}
		return combs;
	}
	
	// Assert {1 < k < set.length}
	
	combs = [];
	for (i = 0; i < set.length - k + 1; i++) {
		head = set.slice(i, i+1);
		tailcombs = k_combinations(set.slice(i + 1), k - 1);
		for (j = 0; j < tailcombs.length; j++) {
			combs.push(head.concat(tailcombs[j]));
		}
	}
	return combs;
}
 
 
/**
 * Combinations
 * 
 * Get all possible combinations of elements in a set.
 * 
 * Usage:
 *   combinations(set)
 * 
 * Examples:
 * 
 *   combinations([1, 2, 3])
 *   -> [[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]
 * 
 *   combinations([1])
 *   -> [[1]]
 */
function combinations(set) {
	var k, i, combs, k_combs;
	combs = [];
	
	// Calculate all non-empty k-combinations
	for (k = 1; k <= set.length; k++) {
		k_combs = k_combinations(set, k);
		for (i = 0; i < k_combs.length; i++) {
			combs.push(k_combs[i]);
		}
	}
	return combs;
}

var calculateScore = function(str){
	var score = 0
		+(100 * (str.match(/#/g) 			|| []).length) //id
		+(10  * (str.match(/\./g) 			|| []).length) //class
		+(1   * (str.match(/(?:^|\s)\w/g) 	|| []).length) //element
	;
	return score
}

var makeSpecific = function(id,classes,tag,parents){
	//console.log(Array.prototype.slice.call(arguments))
	var arr = [];
	if(tag){
		arr.push(tag);
	}
	if(id){
		arr.push('#'+id);
	}
	if(classes && classes.length){
		classes = (Array.isArray(classes)) ? classes.join('||.').split('||') : classes;
		classes[0]='.'+classes[0];
		arr = arr.concat(classes);
	}
	var combs = combinations(arr);
	combs.forEach(function(item,i){
		combs[i] = combs[i].join('');
	});
	if(parents && parents.length){
		var moreCombs = [];
		parents.forEach(function(p){
			combs.forEach(function(c,i){
				moreCombs.push(p.selector+' '+c);
			});
		});
		combs = combs.concat(moreCombs);
	}
	combs.forEach(function(item,i){
		var val = combs[i];
		combs[i] = {
			score:calculateScore(val)
		,	selector:val
		}
	});
	combs.sort(function(a,b){
		return a.score-b.score;
	});
	//console.log(combs);console.log('-------------------------');
	return combs;
};

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

var reduceStyles = function(arr){
	var obj = {};
	var key,val,i,l;
	for(i = 0, l = arr.length;i<l;i++){
		key = JSON.stringify(arr[i])
		obj[key] = arr[i];
	}
	arr = [];
	for(key in obj){
		arr.push(obj[key]);
	}
	return arr;
}

var selectStyle = function(arr,all){
	var ul=all.length
	,	rule,otherRule
	,	works
	,	doNext
	,	workingRules = []
	;

	for(var i=0;i<arr.rules.length;i++){
		works = true;
		doNext = false;
		rule = arr.rules[i];
		for(var u=0;u<ul;u++){
			for(var j=0,jl=all[u].rules.length;j<jl;j++){
				otherRule = all[u].rules[j];
				if(rule.selector == otherRule.selector){
					arr.rules.splice(i,1);
					doNext = true;
				}
				if(doNext){break;}
			}
			if(doNext){break;}
		}
	}
	var min = 10;
	while(min){
		for(i=0;i<arr.rules.length;i++){
			rule = arr.rules[i];
			if(rule.score>=min){
				return rule.selector;
			}
		}
		min--;
	}
}

var selectStyles = function(arr){
	var styles = {};
	var empty = true;
	for(var i=0, l=arr.length;i<l;i++){
		if(arr[i].style){
			var ret = [];
			var directive = selectStyle(arr[i],arr);
			if(directive){
				for(var s in arr[i].style){
					var pseudo = s=='style'?'':s;
					ret.push(pseudo+':'+arr[i].style[s]);
				}
			}
			if(ret.length){
				empty = false;
				styles[directive] = ret;
			}
		}
	}
	if(empty){return false;}
	Object.defineProperty(styles,'toString',{enumerable:false,value:renderStyle});
	return styles;
}

var renderStyle = function(){
	var str = ''
	for(directive in this){
		str+=directive+'{'+this[directive].join(';')+'}';
	}
	return str;
}

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