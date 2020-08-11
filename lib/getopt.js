/**
 * Splice an option out of the arguments and return the option value or boolean
 * flag if the option has no value.
 * @param {string[]} argv
 * @param {string|string[]} name
 * @param {boolean} hasval
 * @returns {string|boolean}
 */
function splice(argv, name, hasval) {
    const options = name instanceof Array ? name.slice() : [name];
    const spliced = [];
    const shorts = options.filter(o => o.length === 2 && o[0] === "-");
    const longs = options.filter(o => o.length > 2 && o.slice(0,2) === "--");
    const shortchars = shorts.map(o => o[1]).join("");
    let result = false;

    for (let i = 0, len = argv.length; i < len; i++) {
        const arg = argv[i];

        if (options.includes(arg) && hasval) {
            result = argv[++i] || "";
        } else if (options.includes(arg)) {
            result = true;
        } else if (longs.some(opt => arg.slice(0, opt.length+1) === `${opt}=`)) {
            result = arg.split("=").slice(1).join("=");
        } else if ()
    }



    const patts = options.map(opt => makePattern(opt));

    while (hasarg()) {
        if (isshort() && hasval) {

        }
    }


    function makePattern(opt) {
        if (opt.slice(0,2) === "--" && hasval) {
            return RegExp(`^--${opt}(=.*)?$`);
        } else if (opt.slice(0,2) === "--") {
            return RegExp(`^--${opt}$`);
        } else if (opt.length === 2 && opt[0] === "-") {
            return RegExp(`^-(?!-).*${opt[1]}`);
        } else {
            return RegExp(`^${opt}$`);
        }
    }

    let i = 0;
    let result = false;
    let extra = false;

    while (hasarg()) {
        if (isopt()) {
            result = hasval ? readval() : true;
            splice();
        } else {
            next();
        }
    }

    function curr() {
        return argv[i];
    }

    function hasarg() {
        return i < argv.length && argv[i] !== "--";
    }

    function isopt() {
        const arg = curr();
        return patts.some(p => p.test(arg));
    }

    function readval() {
        const arg = curr();

        if (/^--.*=/.test(arg)) {
            extra = false;
            return arg.split("=").slice(1).join("=");
        } else if (/^--.+$/.test(arg) || /^-.$/.test(arg)) {
            extra = true;
            return argv[1] || "";
        } else {
            extra = false;
            if (arg.indexOf())
            return argv[1] || "";
        }
    }
}
