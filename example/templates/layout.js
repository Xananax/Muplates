function(){
	var inside = arguments;
	var _title = inside.shift();

	return template('page')(_title
	,	div('#Wrapper'
		,	{	css:{
					backgroundColor:'#ff0000'
				,	color:'#000'
				,	marginLeft:'4px'
				,	fontFace:'"Times new Roman"'
				,	'+below(700px)':{
						backgroundColor:'#00ff00'
					}
				}
			,	class:['sdfsdf','sdf']
			}
		,	inside
		)
	,	footer(
			{
				css:{
					backgroundColor:'black'
				}
			}
		,	'&copy; bah'
		)
	);
}