# MUPLATE

Muplates are templates that are full javascript. Yes, yes, separation of concerns, logic shouldn't be in templates, yadda yadda. I don't give a damn.
If you do, there are many other templates engines available. If, like me, you think "JS all the way FTW", then you might have found paradise.

Muplate uses [Virtual-Dom](https://github.com/Matt-Esch/virtual-dom/) behind the scenes.

This is experimental, probably very buggy, and not fit for use in production.

## Usage

```
npm install -s muplate
```

```js
//templates/main.js
function(){
    div('#wrapper',
        {css:{textColor:'red'}}
        h1('Hello World'),
        p({style:{background:'black'},class:['a','b']},'This works!')
    );
}
```

```js
//index.js
var Muplate = require('muplate');
var mu = Muplate();
mu.root('./templates').template('main');
//or async:
mu.root('./template').template('main',function(err,tmpl){});
```

### Things of interest

- If you don't use 'exports = ' or 'module.exports =' in your template, it will be automatically prepended to your first line
- You can use `var xxx = arguments` to automatically transform arguments into an array (in a non-leaky way).
- Templates are pre-processed with [doT](http://olado.github.io/doT/), so you can use this to generate macros and do some meta-coding (but default delimiters are `<%` and `%>` instead of the default `{{` and `}}`).
- Templates are cached on the `mu` object, so subsequent calls to the same template will not load it again. If you want a different set of templates, create a new muplate object by calling `Muplate()` again.
- If you set a `css` property to any object with a valid identifier (class name or id), it will be extracted and available on the `mu` object by calling `mu.css()`;
