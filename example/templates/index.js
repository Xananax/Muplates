function(_title,_text){

	var els = [];
	if(_title){
		els.push(title(_title));
	}
	if(_text){
		els.push(div(_text));
	}
	_title = _title || 'A Muplate example';

	return template('layout')(
		_title
	,	els
	);
}