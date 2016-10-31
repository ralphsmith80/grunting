# grunting

A modular [Grunt](http://gruntjs.com/) configuration

This utilizes Shama's [gruntfile](https://github.com/shama/gruntfile/) module so check that out if you get stuck.

#example

It's expected that this will be used in an application. It will run on it's own but the tasks implemented are expected to be used in an SIQ repository so it's not going to do much by itself.

So let's assume were using this in the [dax](https://github.com/siq/dax) application. Currently the [package.json](https://github.com/siq/dax/blob/master/package.json) has not yet been installed to use this so you'll need to install `grunting` along with `grunt` and `grunt-cli`. The latter two are needed at the top level due to how grun works.

```bash
npm install grunting --save-dev
npm install grunt --save-dev
npm install grunt-cli --save-dev
```

Now we need a top level Gruntfile that will just wrap our `grunting` module and override or add any additionally tasks we want.

```js
module.exports = function(grunt) {
    // Init our modular gruntfile and return the tasks it uses
    var tasks = require('grunting')(grunt);

    // You should merge the config doing.
    // Doing anothering init on the config makes for weird behavior.
    // grunt.initConfig({});

    // add a task that just lists all the tasks from the `grunting` module
    grunt.registerTask('tasks', function() {
        console.log('----All Tasks----');
        console.log(tasks.join('\n'));
    });
};

```

That's it!

Now you can run any of the existing tasks from the [`grunting Gruntfile`](https://github.com/siq/grunting/blob/master/Gruntfile.js) and add your own tasks to the `Gruntfile` you added to dax. In the future this will be included by default for dev use.


# tasks

`grunt -h`
