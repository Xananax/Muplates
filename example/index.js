//function inspect(obj){console.log(require('util').inspect(obj,{depth:5,colors:true}));}
var Muplate = require('../index.js');
var mu = Muplate();

mu.root('./templates')
	.load('page')
	.load('layout')
	.load('index');

var tmpl = mu.template('index');
var rendered = tmpl('hello world','This is a Muplate example');
console.log(rendered+'')