function buildLinearObject(obj) {
    let output_object = {};
    for (const i in obj) {
        output_object[i] = obj[i];
        if (obj[i].ch)
            output_object[obj[i].ch] = obj[i];
        output_object[i].option = i;
    }
    return output_object;
}

function analyzeArg(obj, arg) {
    let template, is_ch;
    if (arg.charCodeAt(0) === "-".charCodeAt(0)) {
        if (arg.charCodeAt(1) === "-".charCodeAt(0))
        {
            template = obj[arg.slice(2)];
            is_ch = false;
        }
        else
        {
            template = obj[arg.slice(1, 2)];
            is_ch = true;
        }
    }
    return {template, is_ch}
}

function senzu(obj, args = require("process").argv.slice(2)) {
    let output = { };
    let lobj = buildLinearObject(obj);

    let target_template = undefined;
    let follow = false;

    for (const arg of args) {
        const {template, is_ch} = analyzeArg(lobj, arg);

        if (template === undefined) {
            if (is_ch === false && arg.length === 2)
                target_template = undefined;
            else if (target_template) {
                const parsed_arg = target_template.parse ? target_template.parse(arg) : arg;
                if (target_template.array) {
                    const array = output[target_template.option] ? output[target_template.option] : (output[target_template.option] = []);
                    array.push(parsed_arg);
                }
                else
                    output[target_template.option] = parsed_arg;
                if (follow === false)
                    target_template = undefined;
            }
            else {
                if (!output.wanderers)
                    output.wanderers = [arg];
                else
                    output.wanderers.push(arg);
            }
        }
        else if (template.array) {
            if (is_ch) {
                if (arg.length === 2) {
                    target_template = template;
                    follow = false;
                }
                else {
                    target_template = undefined;
                    const array = output[template.option] ? output[template.option] : (output[template.option] = []);
                    array.push(template.parse ? template.parse(arg.slice(2)) : arg.slice(2));
                }
            }
            else {
                target_template = template;
                follow = true;
            }
        }
        else if (template.atomic) {
            target_template = undefined;
            output[template.option] = true;
            if (is_ch) for (let i = 2; i < arg.length; i++) {
                const a = arg.charAt(i);
                const template = lobj[a];
                if (template && template.atomic)
                    output[template.option] = true;
            }
        }
        else {
            if (is_ch && arg.length !== 2) {
                target_template = undefined;
                output[template.option] = template.parse ? template.parse(arg.slice(2)) : arg.slice(2);
            } else {
                target_template = template;
                follow = false;
            }
        }
    }
    return output;
}

senzu.helpmessage = function(config, {usage = "cmd [options] <files>", indent_level = 0, format_line = line => line} = {})
{
    const indent_slice = "\t\t\t\t";
    const indent = indent_slice.slice(0, indent_level);
    if (usage) console.log(indent + "Usage:", usage);
    console.log(indent + "Options:");
    let maxlength = 20;
    for (const i in config)
    {
        const template = config[i];
        maxlength = Math.max(maxlength, 2 + i.length + (template.ch ? 2 : 0) + 1 )
    }
    let length = 1 + ((maxlength + 1) >> 3);
    for (const i in config)
    {
        const template = config[i];
        const left = "--" + i + (template.ch ? ", -" + template.ch + " " : " ");
        console.log(format_line(indent + "\t" + left + indent_slice.slice(0, Math.max(length - (left.length >> 3), 0)) + template.text));
    }
}

module.exports = senzu;