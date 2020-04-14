
# <img src="./icon.png" width="24" height="24"/> Senzu, convenient CLI options parser

## Introduction
Senzu is lightweight tool without dependency for CLI options parsing. Options are **not typed** and the parser **don't throw error**.
**Senzu is a parser, not a checker**, for greater flexibility it is **your responsibility to check** the input of the user.

## Examples

<img align="right" width="200" src="https://github.com/log4b0at/senzu/raw/master/illustration.png"/>

```bash
cmd
cmd -h
cmd -hhhh
cmd --optimize-level 2
cmd -O2 path/to/src
cmd --includes ../inc0 ../inc1 -- path/to/src
cmd -I../inc0 -I ../inc2 path/to/src -o a.exe
```



Configuration for this example:

```javascript
const senzu = require("senzu")

const options = senzu({
    "includes" : { text: "set includes paths", ch: "I", array: true },
    "output" : { text: "set output path", ch: "o" },
    "optimize-level" : { text: "set optimization level", ch: "O", parse: parseInt },
    "help" : { text: "show help", ch: "h", atomic: true }
}, process.argv.slice(1))

options["paths"]; // access an option, undefined if the user dont specify it
options.wanderers; // access other args (like "path/to/src" in examples above)
```

Let's check the respectives outputs:
```js
{ }
{ 'help': true }
{ 'help': true }
{ 'optimize-level': 2 }
{ wanderers: [ 'path/to/src' ], 'optimize-level': 2 }
{ wanderers: [ 'path/to/src' ], 'includes': [ '../inc0', '../inc1' ] }
{ wanderers: [ 'path/to/src' ], 'includes': [ '../inc0', '../inc2' ], 'output': 'a.exe' }
```

## Features

Prototype of the `senzu` function:
```javascript 
function senzu (templates, args = require("process").argv.slice(2))
```
List of parameters available for an option template:
- `text`: The text that appears in the "help" command.
- `ch` (optional): A character alias which will be used with a single `-`. Character can be directly followed by its corresponding value like `-I../inc` and can only grab one argument forward.
- `atomic` (optional): The option character can be grouped with other atomics characters and will not grab following arguments. It handle option of the form `-hVfz` for example.
- `array` (optional): The option will be an array (it will grab all following arguments if the option is specified like `--includes` but not like `-I`). It isn't compatible with `atomic`.
- `parse` (optional): A parse function to transform arguments. It is good practice to not use it as a checker and to not throw errors. It has no effect with `atomic`.

Help message generation:
use `senzu.helpmessage` to generate a basic help message like:
```
Usage: cmd [options] <files>
Options:
        --includes, -I          set includes paths
        --output, -o            set output path
        --optimize-level, -O    set optimization level
        --help, -h              show help
```
Full example:
```js
const options = senzu(templates);

const config = {
    usage: "cmd [options] <files>", // set to false to desactivate
    indent_level: 0, 
    format_line = line => line
}

if (options.help === true)
    senzu.helpmessage(templates, config); // config can be ommited
```

## Notes
If an option isn't specified it will be `undefined`.

If options specified by the user are not recognized they will be pushed in `wanderers`, for example `cmd -a -b path/to/src` will give `["-a", "-b", "path/to/src"]`. 
If you want to throw an error in this case, loop and check in the array.

`wanderers` is reserved option name

Options are recognized using object as hashmap.