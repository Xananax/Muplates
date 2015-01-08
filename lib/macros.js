module.exports = [
	[
		/var (.*?)\s*?=\s*?arguments\s*?;?/g
	,	'var __al__=arguments.length,$1=new Array(__al__);while(__al__){$1[--__al__] = arguments[__al__];};'
	]
]