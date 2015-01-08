function(){
	var inside = arguments;
	var _title = inside.shift();
	return html(
		head(
			title(_title)
		,	style(css())
		)
	,	body(
			inside
		)
	);
}