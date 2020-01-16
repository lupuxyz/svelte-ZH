'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var polka = _interopDefault(require('polka'));
var send = _interopDefault(require('@polka/send'));
var sirv = _interopDefault(require('sirv'));
var fs = require('fs');
var fs__default = _interopDefault(fs);
var path = require('path');
var path__default = _interopDefault(path);
var marked = _interopDefault(require('marked'));
var PrismJS = _interopDefault(require('prismjs'));
var pg = require('pg');
var devalue$1 = _interopDefault(require('devalue'));
var cookie$1 = require('cookie');
var httpie = require('httpie');
var querystring = require('querystring');
var flru = _interopDefault(require('flru'));
var _commonjsHelpers = require('./_commonjsHelpers-a4cce08a.js');
require('./index-88dc87fc.js');
require('./index-979f119b.js');
var index$2 = require('./index-80875a34.js');
var index$3 = require('./index-5284c52e.js');
require('yootils');
require('./Repl-8d4a252f.js');
require('./examples-c2701984.js');
require('./ReplWidget-96a1cfe6.js');
var app$1 = require('./app-8768913f.js');
require('./config-d60afde9.js');
var index$4 = require('./index-e4e1df2f.js');
var _layout = require('./_layout-278dca7e.js');
var index$5 = require('./index-edf8f2bf.js');
var index$6 = require('./index-24d6d8e8.js');
var index$7 = require('./index-04ade7aa.js');
var index$8 = require('./index-52bf0b55.js');
var _slug_ = require('./[slug]-aeb593a3.js');
var index$9 = require('./index-e8b5db13.js');
var index$a = require('./index-bea9255b.js');
var embed = require('./embed-6edef0a9.js');
var index$b = require('./index-e86649fe.js');
require('do-not-zip');
var Stream = _interopDefault(require('stream'));
var http = _interopDefault(require('http'));
var Url = _interopDefault(require('url'));
var https = _interopDefault(require('https'));
var zlib = _interopDefault(require('zlib'));

let lookup;
const titles = new Map();

function get_examples() {
	lookup = new Map();

	return fs__default.readdirSync(`content/examples`).map(group_dir => {
		const metadata = JSON.parse(fs__default.readFileSync(`content/examples/${group_dir}/meta.json`, 'utf-8'));

		return {
			title: metadata.title,
			examples: fs__default.readdirSync(`content/examples/${group_dir}`).filter(file => file !== 'meta.json').map(example_dir => {
				const slug = example_dir.replace(/^\d+-/, '');

				if (lookup.has(slug)) throw new Error(`Duplicate example slug "${slug}"`);
				lookup.set(slug, `${group_dir}/${example_dir}`);

				const metadata = JSON.parse(fs__default.readFileSync(`content/examples/${group_dir}/${example_dir}/meta.json`, 'utf-8'));
				titles.set(slug, metadata.title);

				return {
					slug,
					title: metadata.title
				};
			})
		};
	});
}

function get_example(slug) {
	if (!lookup || !lookup.has(slug)) get_examples();

	const dir = lookup.get(slug);
	const title = titles.get(slug);

	if (!dir || !title) return null;

	const files = fs__default.readdirSync(`content/examples/${dir}`)
		.filter(name => name[0] !== '.' && name !== 'meta.json')
		.map(name => {
			return {
				name,
				source: fs__default.readFileSync(`content/examples/${dir}/${name}`, 'utf-8')
			};
		});

	return { title, files };
}

let cached;

function get(req, res) {
	try {
		if (!cached || "development" !== 'production') {
			cached = get_examples().filter(section => section.title);
		}

		send(res, 200, cached);
	} catch (e) {
		send(res, e.status || 500, {
			message: e.message
		});
	}
}

var route_0 = /*#__PURE__*/Object.freeze({
	get: get
});

const cache = new Map();

function get$1(req, res) {
	const { slug } = req.params;

	let example = cache.get(slug);

	if (!example || "development" !== 'production') {
		example = get_example(slug);
		if (example) cache.set(slug, example);
	}

	if (example) {
		send(res, 200, example);
	} else {
		send(res, 404, {
			error: 'not found'
		});
	}
}

var route_1 = /*#__PURE__*/Object.freeze({
	get: get$1
});

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var whitespace = /\s/;
var validIdentifierCharacters = /[a-zA-Z_$][a-zA-Z0-9_$]*/;
var number = /^NaN|(?:[-+]?(?:(?:Infinity)|(?:0[xX][a-fA-F0-9]+)|(?:0[bB][01]+)|(?:0[oO][0-7]+)|(?:(?:(?:[1-9]\d*|0)?\.\d+|(?:[1-9]\d*|0)\.\d*|(?:[1-9]\d*|0))(?:[E|e][+|-]?\d+)?)))/;
var SINGLE_QUOTE = "'";
var DOUBLE_QUOTE = '"';

function getLocator(source, options) {
    if (options === void 0) { options = {}; }
    var offsetLine = options.offsetLine || 0;
    var offsetColumn = options.offsetColumn || 0;
    var originalLines = source.split('\n');
    var start = 0;
    var lineRanges = originalLines.map(function (line, i) {
        var end = start + line.length + 1;
        var range = { start: start, end: end, line: i };
        start = end;
        return range;
    });
    var i = 0;
    function rangeContains(range, index) {
        return range.start <= index && index < range.end;
    }
    function getLocation(range, index) {
        return { line: offsetLine + range.line, column: offsetColumn + index - range.start, character: index };
    }
    function locate(search, startIndex) {
        if (typeof search === 'string') {
            search = source.indexOf(search, startIndex || 0);
        }
        var range = lineRanges[i];
        var d = search >= range.end ? 1 : -1;
        while (range) {
            if (rangeContains(range, search))
                return getLocation(range, search);
            i += d;
            range = lineRanges[i];
        }
    }
    
    return locate;
}
function locate(source, search, options) {
    if (typeof options === 'number') {
        throw new Error('locate takes a { startIndex, offsetLine, offsetColumn } object as the third argument');
    }
    return getLocator(source, options)(search, options && options.startIndex);
}

function parse(str, opts) {
    var parser = new Parser(str, opts);
    return parser.value;
}
function noop() { }
var ParseError = /** @class */ (function (_super) {
    __extends(ParseError, _super);
    function ParseError(message, pos, loc) {
        var _this = _super.call(this, message) || this;
        _this.pos = pos;
        _this.loc = loc;
        return _this;
    }
    return ParseError;
}(Error));
// https://mathiasbynens.be/notes/javascript-escapes
var escapeable = {
    b: '\b',
    n: '\n',
    f: '\f',
    r: '\r',
    t: '\t',
    v: '\v',
    0: '\0'
};
var hex = /^[a-fA-F0-9]+$/;
var Parser = /** @class */ (function () {
    function Parser(str, opts) {
        this.str = str;
        this.index = 0;
        this.onComment = (opts && opts.onComment) || noop;
        this.onValue = (opts && opts.onValue) || noop;
        this.value = this.readValue();
        this.allowWhitespaceOrComment();
        if (this.index < this.str.length) {
            throw new Error("Unexpected character '" + this.peek() + "'");
        }
    }
    Parser.prototype.allowWhitespaceOrComment = function () {
        while (this.index < this.str.length &&
            whitespace.test(this.str[this.index])) {
            this.index++;
        }
        var start = this.index;
        if (this.eat('/')) {
            if (this.eat('/')) {
                // line comment
                var text = this.readUntil(/(?:\r\n|\n|\r)/);
                this.onComment({
                    start: start,
                    end: this.index,
                    type: 'Comment',
                    text: text,
                    block: false
                });
                this.eat('\n');
            }
            else if (this.eat('*')) {
                // block comment
                var text = this.readUntil(/\*\//);
                this.onComment({
                    start: start,
                    end: this.index,
                    type: 'Comment',
                    text: text,
                    block: true
                });
                this.eat('*/', true);
            }
        }
        else {
            return;
        }
        this.allowWhitespaceOrComment();
    };
    Parser.prototype.error = function (message, index) {
        if (index === void 0) { index = this.index; }
        var loc = locate(this.str, index, { offsetLine: 1 });
        throw new ParseError(message, index, loc);
    };
    Parser.prototype.eat = function (str, required) {
        if (this.str.slice(this.index, this.index + str.length) === str) {
            this.index += str.length;
            return str;
        }
        if (required) {
            this.error("Expected '" + str + "' instead of '" + this.str[this.index] + "'");
        }
        return null;
    };
    Parser.prototype.peek = function () {
        return this.str[this.index];
    };
    Parser.prototype.read = function (pattern) {
        var match = pattern.exec(this.str.slice(this.index));
        if (!match || match.index !== 0)
            return null;
        this.index += match[0].length;
        return match[0];
    };
    Parser.prototype.readUntil = function (pattern) {
        if (this.index >= this.str.length)
            this.error('Unexpected end of input');
        var start = this.index;
        var match = pattern.exec(this.str.slice(start));
        if (match) {
            var start_1 = this.index;
            this.index = start_1 + match.index;
            return this.str.slice(start_1, this.index);
        }
        this.index = this.str.length;
        return this.str.slice(start);
    };
    Parser.prototype.readArray = function () {
        var start = this.index;
        if (!this.eat('['))
            return null;
        var array = {
            start: start,
            end: null,
            type: 'ArrayExpression',
            elements: []
        };
        this.allowWhitespaceOrComment();
        while (this.peek() !== ']') {
            array.elements.push(this.readValue());
            this.allowWhitespaceOrComment();
            if (!this.eat(','))
                break;
            this.allowWhitespaceOrComment();
        }
        if (!this.eat(']')) {
            this.error("Expected ']' instead of '" + this.str[this.index] + "'");
        }
        array.end = this.index;
        return array;
    };
    Parser.prototype.readBoolean = function () {
        var start = this.index;
        var raw = this.read(/^(true|false)/);
        if (raw) {
            return {
                start: start,
                end: this.index,
                type: 'Literal',
                raw: raw,
                value: raw === 'true'
            };
        }
    };
    Parser.prototype.readNull = function () {
        var start = this.index;
        if (this.eat('null')) {
            return {
                start: start,
                end: this.index,
                type: 'Literal',
                raw: 'null',
                value: null
            };
        }
    };
    Parser.prototype.readLiteral = function () {
        return (this.readBoolean() ||
            this.readNumber() ||
            this.readString() ||
            this.readNull());
    };
    Parser.prototype.readNumber = function () {
        var start = this.index;
        var raw = this.read(number);
        if (raw) {
            var sign = raw[0];
            var value = +(sign === '-' || sign === '+' ? raw.slice(1) : raw);
            if (sign === '-')
                value = -value;
            return {
                start: start,
                end: this.index,
                type: 'Literal',
                raw: raw,
                value: value
            };
        }
    };
    Parser.prototype.readObject = function () {
        var start = this.index;
        if (!this.eat('{'))
            return;
        var object = {
            start: start,
            end: null,
            type: 'ObjectExpression',
            properties: []
        };
        this.allowWhitespaceOrComment();
        while (this.peek() !== '}') {
            object.properties.push(this.readProperty());
            this.allowWhitespaceOrComment();
            if (!this.eat(','))
                break;
            this.allowWhitespaceOrComment();
        }
        this.eat('}', true);
        object.end = this.index;
        return object;
    };
    Parser.prototype.readProperty = function () {
        this.allowWhitespaceOrComment();
        var property = {
            start: this.index,
            end: null,
            type: 'Property',
            key: this.readPropertyKey(),
            value: this.readValue()
        };
        property.end = this.index;
        return property;
    };
    Parser.prototype.readIdentifier = function () {
        var start = this.index;
        var name = this.read(validIdentifierCharacters);
        if (name) {
            return {
                start: start,
                end: this.index,
                type: 'Identifier',
                name: name
            };
        }
    };
    Parser.prototype.readPropertyKey = function () {
        var key = this.readString() || this.readIdentifier();
        if (!key)
            this.error("Bad identifier as unquoted key");
        if (key.type === 'Literal') {
            key.name = String(key.value);
        }
        this.allowWhitespaceOrComment();
        this.eat(':', true);
        return key;
    };
    Parser.prototype.readString = function () {
        var start = this.index;
        // const quote = this.read(/^['"]/);
        var quote = this.eat(SINGLE_QUOTE) || this.eat(DOUBLE_QUOTE);
        if (!quote)
            return;
        var escaped = false;
        var value = '';
        while (this.index < this.str.length) {
            var char_1 = this.str[this.index++];
            if (escaped) {
                escaped = false;
                // line continuations
                if (char_1 === '\n')
                    continue;
                if (char_1 === '\r') {
                    if (this.str[this.index] === '\n')
                        this.index += 1;
                    continue;
                }
                if (char_1 === 'x' || char_1 === 'u') {
                    var start_2 = this.index;
                    var end = this.index += (char_1 === 'x' ? 2 : 4);
                    var code = this.str.slice(start_2, end);
                    if (!hex.test(code))
                        this.error("Invalid " + (char_1 === 'x' ? 'hexadecimal' : 'Unicode') + " escape sequence", start_2);
                    value += String.fromCharCode(parseInt(code, 16));
                }
                else {
                    value += escapeable[char_1] || char_1;
                }
            }
            else if (char_1 === '\\') {
                escaped = true;
            }
            else if (char_1 === quote) {
                var end = this.index;
                return {
                    start: start,
                    end: end,
                    type: 'Literal',
                    raw: this.str.slice(start, end),
                    value: value
                };
            }
            else {
                if (char_1 === '\n')
                    this.error("Bad string", this.index - 1);
                value += char_1;
            }
        }
        this.error("Unexpected end of input");
    };
    Parser.prototype.readValue = function () {
        this.allowWhitespaceOrComment();
        var value = (this.readArray() ||
            this.readObject() ||
            this.readLiteral());
        if (value) {
            this.onValue(value);
            return value;
        }
        this.error("Unexpected EOF");
    };
    return Parser;
}());

function evaluate(str) {
    var ast = parse(str);
    return getValue(ast);
}
function getValue(node) {
    if (node.type === 'Literal') {
        return node.value;
    }
    if (node.type === 'ArrayExpression') {
        return node.elements.map(getValue);
    }
    if (node.type === 'ObjectExpression') {
        var obj_1 = {};
        node.properties.forEach(function (prop) {
            obj_1[prop.key.name] = getValue(prop.value);
        });
        return obj_1;
    }
}

function extract_frontmatter(markdown) {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	const frontMatter = match[1];
	const content = markdown.slice(match[0].length);

	const metadata = {};
	frontMatter.split('\n').forEach(pair => {
		const colonIndex = pair.indexOf(':');
		metadata[pair.slice(0, colonIndex).trim()] = pair
			.slice(colonIndex + 1)
			.trim();
	});

	return { metadata, content };
}

function extract_metadata(line, lang) {
	try {
		if (lang === 'html' && line.startsWith('<!--') && line.endsWith('-->')) {
			return evaluate(line.slice(4, -3).trim());
		}

		if (
			lang === 'js' ||
			(lang === 'json' && line.startsWith('/*') && line.endsWith('*/'))
		) {
			return evaluate(line.slice(2, -2).trim());
		}
	} catch (err) {
		// TODO report these errors, don't just squelch them
		return null;
	}
}

// map lang to prism-language-attr
const langs = {
	bash: 'bash',
	html: 'markup',
	sv: 'markup',
	js: 'javascript',
	css: 'css'
};


// links renderer
function link_renderer (href, title, text) {
	let target_attr = '';
	let title_attr = '';

	if (href.startsWith("http")) {
		target_attr = ' target="_blank"';
	}

	if (title !== null) {
		title_attr = ` title="${title}"`;
	}

	return `<a href="${href}"${target_attr}${title_attr}>${text}</a>`;
}

let json;

function get_sections() {
	const slugs = new Set();

	const sections = fs.readdirSync(`content/tutorial`)
		.filter(dir => /^\d+/.test(dir))
		.map(dir => {
			let meta;

			try {
				meta = JSON.parse(fs.readFileSync(`content/tutorial/${dir}/meta.json`, 'utf-8'));
			} catch (err) {
				throw new Error(`Error reading metadata for ${dir}`);
			}

			return {
				title: meta.title,
				chapters: fs.readdirSync(`content/tutorial/${dir}`)
					.filter(dir => /^\d+/.test(dir))
					.map(tutorial => {
						try {
							const md = fs.readFileSync(`content/tutorial/${dir}/${tutorial}/text.md`, 'utf-8');
							const { metadata } = extract_frontmatter(md);

							const slug = tutorial.replace(/^\d+-/, '');

							if (slugs.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
							slugs.add(slug);

							return {
								slug,
								title: metadata.title,
								section_dir: dir,
								chapter_dir: tutorial,
							};
						} catch (err) {
							throw new Error(`Error building tutorial ${dir}/${tutorial}: ${err.message}`);
						}
					})
			};
		});

	return sections;
}

function get$2(req, res) {
	try {
		if (!json || "development" !== 'production') {
			json = get_sections();
		}

		send(res, 200, json);
	} catch (err) {
		send(res, 500, {
			message: err.message
		});
	}
}

var route_2 = /*#__PURE__*/Object.freeze({
	get: get$2
});

function get$3(req, res) {
	let { min = '0', max = '100' } = req.query;
	min = +min;
	max = +max;

	res.setHeader('Access-Control-Allow-Origin', '*');

	// simulate a long delay
	setTimeout(() => {
		// fail sometimes
		if (Math.random() < 0.333) {
			res.statusCode = 400;
			res.end(`Failed to generate random number. Please try again`);
			return;
		}

		const num = min + Math.round(Math.random() * (max - min));
		res.end(String(num));
	}, 1000);
}

var route_3 = /*#__PURE__*/Object.freeze({
	get: get$3
});

(function(Prism) {
	// $ set | grep '^[A-Z][^[:space:]]*=' | cut -d= -f1 | tr '\n' '|'
	// + LC_ALL, RANDOM, REPLY, SECONDS.
	// + make sure PS1..4 are here as they are not always set,
	// - some useless things.
	var envVars = '\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b';
	var insideString = {
		'environment': {
			pattern: RegExp("\\$" + envVars),
			alias: 'constant'
		},
		'variable': [
			// [0]: Arithmetic Environment
			{
				pattern: /\$?\(\([\s\S]+?\)\)/,
				greedy: true,
				inside: {
					// If there is a $ sign at the beginning highlight $(( and )) as variable
					'variable': [
						{
							pattern: /(^\$\(\([\s\S]+)\)\)/,
							lookbehind: true
						},
						/^\$\(\(/
					],
					'number': /\b0x[\dA-Fa-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:[Ee]-?\d+)?/,
					// Operators according to https://www.gnu.org/software/bash/manual/bashref.html#Shell-Arithmetic
					'operator': /--?|-=|\+\+?|\+=|!=?|~|\*\*?|\*=|\/=?|%=?|<<=?|>>=?|<=?|>=?|==?|&&?|&=|\^=?|\|\|?|\|=|\?|:/,
					// If there is no $ sign at the beginning highlight (( and )) as punctuation
					'punctuation': /\(\(?|\)\)?|,|;/
				}
			},
			// [1]: Command Substitution
			{
				pattern: /\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/,
				greedy: true,
				inside: {
					'variable': /^\$\(|^`|\)$|`$/
				}
			},
			// [2]: Brace expansion
			{
				pattern: /\$\{[^}]+\}/,
				greedy: true,
				inside: {
					'operator': /:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/,
					'punctuation': /[\[\]]/,
					'environment': {
						pattern: RegExp("(\\{)" + envVars),
						lookbehind: true,
						alias: 'constant'
					}
				}
			},
			/\$(?:\w+|[#?*!@$])/
		],
		// Escape sequences from echo and printf's manuals, and escaped quotes.
		'entity': /\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|x[0-9a-fA-F]{1,2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})/
	};

	Prism.languages.bash = {
		'shebang': {
			pattern: /^#!\s*\/.*/,
			alias: 'important'
		},
		'comment': {
			pattern: /(^|[^"{\\$])#.*/,
			lookbehind: true
		},
		'function-name': [
			// a) function foo {
			// b) foo() {
			// c) function foo() {
			// but not “foo {”
			{
				// a) and c)
				pattern: /(\bfunction\s+)\w+(?=(?:\s*\(?:\s*\))?\s*\{)/,
				lookbehind: true,
				alias: 'function'
			},
			{
				// b)
				pattern: /\b\w+(?=\s*\(\s*\)\s*\{)/,
				alias: 'function'
			}
		],
		// Highlight variable names as variables in for and select beginnings.
		'for-or-select': {
			pattern: /(\b(?:for|select)\s+)\w+(?=\s+in\s)/,
			alias: 'variable',
			lookbehind: true
		},
		// Highlight variable names as variables in the left-hand part
		// of assignments (“=” and “+=”).
		'assign-left': {
			pattern: /(^|[\s;|&]|[<>]\()\w+(?=\+?=)/,
			inside: {
				'environment': {
					pattern: RegExp("(^|[\\s;|&]|[<>]\\()" + envVars),
					lookbehind: true,
					alias: 'constant'
				}
			},
			alias: 'variable',
			lookbehind: true
		},
		'string': [
			// Support for Here-documents https://en.wikipedia.org/wiki/Here_document
			{
				pattern: /((?:^|[^<])<<-?\s*)(\w+?)\s*(?:\r?\n|\r)(?:[\s\S])*?(?:\r?\n|\r)\2/,
				lookbehind: true,
				greedy: true,
				inside: insideString
			},
			// Here-document with quotes around the tag
			// → No expansion (so no “inside”).
			{
				pattern: /((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s*(?:\r?\n|\r)(?:[\s\S])*?(?:\r?\n|\r)\3/,
				lookbehind: true,
				greedy: true
			},
			// “Normal” string
			{
				pattern: /(["'])(?:\\[\s\S]|\$\([^)]+\)|`[^`]+`|(?!\1)[^\\])*\1/,
				greedy: true,
				inside: insideString
			}
		],
		'environment': {
			pattern: RegExp("\\$?" + envVars),
			alias: 'constant'
		},
		'variable': insideString.variable,
		'function': {
			pattern: /(^|[\s;|&]|[<>]\()(?:add|apropos|apt|aptitude|apt-cache|apt-get|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/,
			lookbehind: true
		},
		'keyword': {
			pattern: /(^|[\s;|&]|[<>]\()(?:if|then|else|elif|fi|for|while|in|case|esac|function|select|do|done|until)(?=$|[)\s;|&])/,
			lookbehind: true
		},
		// https://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
		'builtin': {
			pattern: /(^|[\s;|&]|[<>]\()(?:\.|:|break|cd|continue|eval|exec|exit|export|getopts|hash|pwd|readonly|return|shift|test|times|trap|umask|unset|alias|bind|builtin|caller|command|declare|echo|enable|help|let|local|logout|mapfile|printf|read|readarray|source|type|typeset|ulimit|unalias|set|shopt)(?=$|[)\s;|&])/,
			lookbehind: true,
			// Alias added to make those easier to distinguish from strings.
			alias: 'class-name'
		},
		'boolean': {
			pattern: /(^|[\s;|&]|[<>]\()(?:true|false)(?=$|[)\s;|&])/,
			lookbehind: true
		},
		'file-descriptor': {
			pattern: /\B&\d\b/,
			alias: 'important'
		},
		'operator': {
			// Lots of redirections here, but not just that.
			pattern: /\d?<>|>\||\+=|==?|!=?|=~|<<[<-]?|[&\d]?>>|\d?[<>]&?|&[>&]?|\|[&|]?|<=?|>=?/,
			inside: {
				'file-descriptor': {
					pattern: /^\d/,
					alias: 'important'
				}
			}
		},
		'punctuation': /\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,
		'number': {
			pattern: /(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,
			lookbehind: true
		}
	};

	/* Patterns in command substitution. */
	var toBeCopied = [
		'comment',
		'function-name',
		'for-or-select',
		'assign-left',
		'string',
		'environment',
		'function',
		'keyword',
		'builtin',
		'boolean',
		'file-descriptor',
		'operator',
		'punctuation',
		'number'
	];
	var inside = insideString.variable[1].inside;
	for(var i = 0; i < toBeCopied.length; i++) {
		inside[toBeCopied[i]] = Prism.languages.bash[toBeCopied[i]];
	}

	Prism.languages.shell = Prism.languages.bash;
})(Prism);

function highlight(source, lang) {
	const plang = langs[lang] || '';
	const highlighted = plang ? PrismJS.highlight(
		source,
		PrismJS.languages[plang],
		lang,
	) : source.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

	return `<pre class='language-${plang}'><code>${highlighted}</code></pre>`;
}

const cache$1 = new Map();

function find_tutorial(slug) {
	const sections = fs.readdirSync(`content/tutorial`);

	for (const section of sections) {
		const chapters = fs.readdirSync(`content/tutorial/${section}`).filter(dir => /^\d+/.test(dir));
		for (const chapter of chapters) {
			if (slug === chapter.replace(/^\d+-/, '')) {
				return { section, chapter };
			}
		}
	}
}

function get_tutorial(slug) {
	const found = find_tutorial(slug);
	if (!found) return found;

	const dir = `content/tutorial/${found.section}/${found.chapter}`;

	const markdown = fs.readFileSync(`${dir}/text.md`, 'utf-8');
	const app_a = fs.readdirSync(`${dir}/app-a`);
	const app_b = fs.existsSync(`${dir}/app-b`) && fs.readdirSync(`${dir}/app-b`);

	const { content } = extract_frontmatter(markdown);

	const renderer = new marked.Renderer();

	renderer.link = link_renderer;

	renderer.code = (source, lang) => {
		source = source.replace(/^ +/gm, match =>
			match.split('    ').join('\t')
		);

		const lines = source.split('\n');

		const meta = extract_metadata(lines[0], lang);

		let prefix = '';
		let className = 'code-block';

		if (meta) {
			source = lines.slice(1).join('\n');
			const filename = meta.filename || (lang === 'html' && 'App.svelte');
			if (filename) {
				prefix = `<span class='filename'>${prefix} ${filename}</span>`;
				className += ' named';
			}
		}

		return `<div class='${className}'>${prefix}${highlight(source, lang)}</div>`;
	};

	let html = marked(content, { renderer });
	if (found.chapter.startsWith('01')) {
		const meta = JSON.parse(fs.readFileSync(`content/tutorial/${found.section}/meta.json`));
		html = `<h2>${meta.title}</h2>\n${html}`;
	}

	function get_file(stage, file) {
		const ext = path.extname(file);
		const name = file.slice(0, -ext.length);
		const type = ext.slice(1);

		return {
			name,
			type,
			source: fs.readFileSync(`${dir}/${stage}/${file}`, 'utf-8')
		};
	}

	return {
		html,
		app_a: app_a.map(file => get_file('app-a', file)),
		app_b: app_b && app_b.map(file => get_file('app-b', file))
	};
}

function get$4(req, res) {
	const { slug } = req.params;

	let tut = cache$1.get(slug);
	if (!tut || "development" !== 'production') {
		tut = get_tutorial(slug);
		cache$1.set(slug, tut);
	}

	if (tut) {
		send(res, 200, tut);
	} else {
		send(res, 404, { message: 'not found' });
	}
}

var route_4 = /*#__PURE__*/Object.freeze({
	get: get$4
});

// Uses `PG*` ENV vars
const DB = process.env.PGHOST ? new pg.Pool() : null;

function query(text, values=[]) {
	return DB.query(text, values).then(r => r.rows);
}

function find(text, values=[]) {
	return query(text, values).then(arr => arr[0]);
}

async function get$5(req, res) {
	if (req.user) {
		const page_size = 100;
		const offset = req.query.offset ? parseInt(req.query.offset) : 0;
		const rows = await query(`
			select g.uid, g.name, coalesce(g.updated_at, g.created_at) as updated_at
			from gists g
			where g.user_id = $1
			order by id desc
			limit ${page_size + 1}
			offset $2
		`, [req.user.id, offset]);

		rows.forEach(row => {
			row.uid = row.uid.replace(/-/g, '');
		});

		const more = rows.length > page_size;
		send(res, 200, { apps: rows.slice(0, page_size), offset: more ? offset + page_size : null });
	} else {
		send(res, 401);
	}
}

var route_5 = /*#__PURE__*/Object.freeze({
	get: get$5
});

const sanitize_user = obj => obj && ({
	uid: obj.uid,
	username: obj.username,
	name: obj.name,
	avatar: obj.avatar
});

const session_cache = flru(1000);

const create_user = async (gh_user, access_token) => {
	return await find(`
		insert into users(uid, name, username, avatar, github_token)
		values ($1, $2, $3, $4, $5) on conflict (uid) do update
		set (name, username, avatar, github_token, updated_at) = ($2, $3, $4, $5, now())
		returning id, uid, username, name, avatar
	`, [gh_user.id, gh_user.name, gh_user.login, gh_user.avatar_url, access_token]);
};

const create_session = async user => {
	const session = await find(`
		insert into sessions(user_id)
		values ($1)
		returning uid
	`, [user.id]);

	session_cache.set(session.uid, user);

	return session;
};

const delete_session = async sid => {
	await query(`delete from sessions where uid = $1`, [sid]);
	session_cache.set(sid, null);
};

const get_user = async sid => {
	if (!sid) return null;

	if (!session_cache.has(sid)) {
		session_cache.set(sid, await find(`
			select users.id, users.uid, users.username, users.name, users.avatar
			from sessions
			left join users on sessions.user_id = users.id
			where sessions.uid = $1 and expiry > now()
		`, [sid]));
	}

	return session_cache.get(sid);
};

const authenticate = () => {
	// this is a convenient time to clear out expired sessions
	query(`delete from sessions where expiry < now()`);

	return async (req, res, next) => {
		req.cookies = cookie$1.parse(req.headers.cookie || '');
		req.user = await get_user(req.cookies.sid);

		next();
	};
};

const oauth = 'https://github.com/login/oauth';
const baseurl = process.env.BASEURL;
const secure = baseurl && baseurl.startsWith('https:');

const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;

async function get$6(req, res) {
	try {
		// Trade "code" for "access_token"
		const r1 = await httpie.post(`${oauth}/access_token?` + querystring.stringify({
			code: req.query.code,
			client_id,
			client_secret,
		}));

		// Now fetch User details
		const { access_token } = querystring.parse(r1.data);
		const r2 = await httpie.get('https://api.github.com/user', {
			headers: {
				'User-Agent': 'svelte.dev',
				Authorization: `token ${access_token}`
			}
		});

		const user = await create_user(r2.data, access_token);
		const session = await create_session(user);

		res.writeHead(200, {
			'Set-Cookie': cookie$1.serialize('sid', session.uid, {
				maxAge: 31536000,
				path: '/',
				httpOnly: true,
				secure
			}),
			'Content-Type': 'text/html; charset=utf-8'
		});

		res.end(`
			<script>
				window.opener.postMessage({
					user: ${devalue$1(sanitize_user(user))}
				}, window.location.origin);
			</script>
		`);
	} catch (err) {
		console.error('GET /auth/callback', err);
		send(res, 500, err.data, {
			'Content-Type': err.headers['content-type'],
			'Content-Length': err.headers['content-length']
		});
	}
}

var route_6 = /*#__PURE__*/Object.freeze({
	get: get$6
});

async function get$7(req, res) {
	await delete_session(req.cookies.sid);

	send(res, 200, '', {
		'Set-Cookie': cookie$1.serialize('sid', '', {
			maxAge: -1,
			path: '/',
			httpOnly: true,
			secure
		})
	});
}

var route_7 = /*#__PURE__*/Object.freeze({
	get: get$7
});

const get$8 = client_id
	? (req, res) => {
		const Location = `${oauth}/authorize?` + querystring.stringify({
			scope: 'read:user',
			client_id,
			redirect_uri: `${baseurl}/auth/callback`,
		});

		send(res, 302, Location, { Location });
	}
	: (req, res) => {
		send(res, 500, `
			<body style="font-family: sans-serif; background: rgb(255,215,215); border: 2px solid red; margin: 0; padding: 1em;">
				<h1>Missing .env file</h1>
				<p>In order to use GitHub authentication, you will need to <a target="_blank" href="https://github.com/settings/developers">register an OAuth application</a> and create a local .env file:</p>
				<pre>GITHUB_CLIENT_ID=[YOUR_APP_ID]\nGITHUB_CLIENT_SECRET=[YOUR_APP_SECRET]\nBASEURL=http://localhost:3000</pre>
				<p>The <code>BASEURL</code> variable should match the callback URL specified for your app.</p>
				<p>See also <a target="_blank" href="https://github.com/sveltejs/svelte/tree/master/site#repl-github-integration">here</a></p>
			</body>
		`, {
			'Content-Type': 'text/html; charset=utf-8'
		});
	};

var route_8 = /*#__PURE__*/Object.freeze({
	get: get$8
});

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match Latin Unicode letters (excluding mathematical operators). */
var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

/** Used to compose unicode character classes. */
var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
    rsComboSymbolsRange = '\\u20d0-\\u20f0';

/** Used to compose unicode capture groups. */
var rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']';

/**
 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
 */
var reComboMark = RegExp(rsCombo, 'g');

/** Used to map Latin Unicode letters to basic Latin letters. */
var deburredLetters = {
  // Latin-1 Supplement block.
  '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
  '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
  '\xc7': 'C',  '\xe7': 'c',
  '\xd0': 'D',  '\xf0': 'd',
  '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
  '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
  '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
  '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
  '\xd1': 'N',  '\xf1': 'n',
  '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
  '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
  '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
  '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
  '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
  '\xc6': 'Ae', '\xe6': 'ae',
  '\xde': 'Th', '\xfe': 'th',
  '\xdf': 'ss',
  // Latin Extended-A block.
  '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
  '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
  '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
  '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
  '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
  '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
  '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
  '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
  '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
  '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
  '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
  '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
  '\u0134': 'J',  '\u0135': 'j',
  '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
  '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
  '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
  '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
  '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
  '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
  '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
  '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
  '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
  '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
  '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
  '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
  '\u0163': 't',  '\u0165': 't', '\u0167': 't',
  '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
  '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
  '\u0174': 'W',  '\u0175': 'w',
  '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
  '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
  '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
  '\u0132': 'IJ', '\u0133': 'ij',
  '\u0152': 'Oe', '\u0153': 'oe',
  '\u0149': "'n", '\u017f': 'ss'
};

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof _commonjsHelpers.commonjsGlobal == 'object' && _commonjsHelpers.commonjsGlobal && _commonjsHelpers.commonjsGlobal.Object === Object && _commonjsHelpers.commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * The base implementation of `_.propertyOf` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyOf(object) {
  return function(key) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
 * letters to basic Latin letters.
 *
 * @private
 * @param {string} letter The matched letter to deburr.
 * @returns {string} Returns the deburred letter.
 */
var deburrLetter = basePropertyOf(deburredLetters);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Deburrs `string` by converting
 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
 * letters to basic Latin letters and removing
 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to deburr.
 * @returns {string} Returns the deburred string.
 * @example
 *
 * _.deburr('déjà vu');
 * // => 'deja vu'
 */
function deburr(string) {
  string = toString(string);
  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
}

var lodash_deburr = deburr;

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

var escapeStringRegexp = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

var replacements = [
	// German umlauts
	['ß', 'ss'],
	['ä', 'ae'],
	['Ä', 'Ae'],
	['ö', 'oe'],
	['Ö', 'Oe'],
	['ü', 'ue'],
	['Ü', 'Ue'],

	// Vietnamese
	['à', 'a'],
	['À', 'A'],
	['á', 'a'],
	['Á', 'A'],
	['â', 'a'],
	['Â', 'A'],
	['ã', 'a'],
	['Ã', 'A'],
	['è', 'e'],
	['È', 'E'],
	['é', 'e'],
	['É', 'E'],
	['ê', 'e'],
	['Ê', 'E'],
	['ì', 'i'],
	['Ì', 'I'],
	['í', 'i'],
	['Í', 'I'],
	['ò', 'o'],
	['Ò', 'O'],
	['ó', 'o'],
	['Ó', 'O'],
	['ô', 'o'],
	['Ô', 'O'],
	['õ', 'o'],
	['Õ', 'O'],
	['ù', 'u'],
	['Ù', 'U'],
	['ú', 'u'],
	['Ú', 'U'],
	['ý', 'y'],
	['Ý', 'Y'],
	['ă', 'a'],
	['Ă', 'A'],
	['Đ', 'D'],
	['đ', 'd'],
	['ĩ', 'i'],
	['Ĩ', 'I'],
	['ũ', 'u'],
	['Ũ', 'U'],
	['ơ', 'o'],
	['Ơ', 'O'],
	['ư', 'u'],
	['Ư', 'U'],
	['ạ', 'a'],
	['Ạ', 'A'],
	['ả', 'a'],
	['Ả', 'A'],
	['ấ', 'a'],
	['Ấ', 'A'],
	['ầ', 'a'],
	['Ầ', 'A'],
	['ẩ', 'a'],
	['Ẩ', 'A'],
	['ẫ', 'a'],
	['Ẫ', 'A'],
	['ậ', 'a'],
	['Ậ', 'A'],
	['ắ', 'a'],
	['Ắ', 'A'],
	['ằ', 'a'],
	['Ằ', 'A'],
	['ẳ', 'a'],
	['Ẳ', 'A'],
	['ẵ', 'a'],
	['Ẵ', 'A'],
	['ặ', 'a'],
	['Ặ', 'A'],
	['ẹ', 'e'],
	['Ẹ', 'E'],
	['ẻ', 'e'],
	['Ẻ', 'E'],
	['ẽ', 'e'],
	['Ẽ', 'E'],
	['ế', 'e'],
	['Ế', 'E'],
	['ề', 'e'],
	['Ề', 'E'],
	['ể', 'e'],
	['Ể', 'E'],
	['ễ', 'e'],
	['Ễ', 'E'],
	['ệ', 'e'],
	['Ệ', 'E'],
	['ỉ', 'i'],
	['Ỉ', 'I'],
	['ị', 'i'],
	['Ị', 'I'],
	['ọ', 'o'],
	['Ọ', 'O'],
	['ỏ', 'o'],
	['Ỏ', 'O'],
	['ố', 'o'],
	['Ố', 'O'],
	['ồ', 'o'],
	['Ồ', 'O'],
	['ổ', 'o'],
	['Ổ', 'O'],
	['ỗ', 'o'],
	['Ỗ', 'O'],
	['ộ', 'o'],
	['Ộ', 'O'],
	['ớ', 'o'],
	['Ớ', 'O'],
	['ờ', 'o'],
	['Ờ', 'O'],
	['ở', 'o'],
	['Ở', 'O'],
	['ỡ', 'o'],
	['Ỡ', 'O'],
	['ợ', 'o'],
	['Ợ', 'O'],
	['ụ', 'u'],
	['Ụ', 'U'],
	['ủ', 'u'],
	['Ủ', 'U'],
	['ứ', 'u'],
	['Ứ', 'U'],
	['ừ', 'u'],
	['Ừ', 'U'],
	['ử', 'u'],
	['Ử', 'U'],
	['ữ', 'u'],
	['Ữ', 'U'],
	['ự', 'u'],
	['Ự', 'U'],
	['ỳ', 'y'],
	['Ỳ', 'Y'],
	['ỵ', 'y'],
	['Ỵ', 'Y'],
	['ỷ', 'y'],
	['Ỷ', 'Y'],
	['ỹ', 'y'],
	['Ỹ', 'Y'],

	// Arabic
	['ء', 'e'],
	['آ', 'a'],
	['أ', 'a'],
	['ؤ', 'w'],
	['إ', 'i'],
	['ئ', 'y'],
	['ا', 'a'],
	['ب', 'b'],
	['ة', 't'],
	['ت', 't'],
	['ث', 'th'],
	['ج', 'j'],
	['ح', 'h'],
	['خ', 'kh'],
	['د', 'd'],
	['ذ', 'dh'],
	['ر', 'r'],
	['ز', 'z'],
	['س', 's'],
	['ش', 'sh'],
	['ص', 's'],
	['ض', 'd'],
	['ط', 't'],
	['ظ', 'z'],
	['ع', 'e'],
	['غ', 'gh'],
	['ـ', '_'],
	['ف', 'f'],
	['ق', 'q'],
	['ك', 'k'],
	['ل', 'l'],
	['م', 'm'],
	['ن', 'n'],
	['ه', 'h'],
	['و', 'w'],
	['ى', 'a'],
	['ي', 'y'],
	['َ‎', 'a'],
	['ُ', 'u'],
	['ِ‎', 'i'],
	['٠', '0'],
	['١', '1'],
	['٢', '2'],
	['٣', '3'],
	['٤', '4'],
	['٥', '5'],
	['٦', '6'],
	['٧', '7'],
	['٨', '8'],
	['٩', '9'],

	// Persian / Farsi
	['چ', 'ch'],
	['ک', 'k'],
	['گ', 'g'],
	['پ', 'p'],
	['ژ', 'zh'],
	['ی', 'y'],
	['۰', '0'],
	['۱', '1'],
	['۲', '2'],
	['۳', '3'],
	['۴', '4'],
	['۵', '5'],
	['۶', '6'],
	['۷', '7'],
	['۸', '8'],
	['۹', '9'],

	// Pashto
	['ټ', 'p'],
	['ځ', 'z'],
	['څ', 'c'],
	['ډ', 'd'],
	['ﺫ', 'd'],
	['ﺭ', 'r'],
	['ړ', 'r'],
	['ﺯ', 'z'],
	['ږ', 'g'],
	['ښ', 'x'],
	['ګ', 'g'],
	['ڼ', 'n'],
	['ۀ', 'e'],
	['ې', 'e'],
	['ۍ', 'ai'],

	// Urdu
	['ٹ', 't'],
	['ڈ', 'd'],
	['ڑ', 'r'],
	['ں', 'n'],
	['ہ', 'h'],
	['ھ', 'h'],
	['ے', 'e'],

	// Russian
	['А', 'A'],
	['а', 'a'],
	['Б', 'B'],
	['б', 'b'],
	['В', 'V'],
	['в', 'v'],
	['Г', 'G'],
	['г', 'g'],
	['Д', 'D'],
	['д', 'd'],
	['Е', 'E'],
	['е', 'e'],
	['Ж', 'Zh'],
	['ж', 'zh'],
	['З', 'Z'],
	['з', 'z'],
	['И', 'I'],
	['и', 'i'],
	['Й', 'J'],
	['й', 'j'],
	['К', 'K'],
	['к', 'k'],
	['Л', 'L'],
	['л', 'l'],
	['М', 'M'],
	['м', 'm'],
	['Н', 'N'],
	['н', 'n'],
	['О', 'O'],
	['о', 'o'],
	['П', 'P'],
	['п', 'p'],
	['Р', 'R'],
	['р', 'r'],
	['С', 'S'],
	['с', 's'],
	['Т', 'T'],
	['т', 't'],
	['У', 'U'],
	['у', 'u'],
	['Ф', 'F'],
	['ф', 'f'],
	['Х', 'H'],
	['х', 'h'],
	['Ц', 'Cz'],
	['ц', 'cz'],
	['Ч', 'Ch'],
	['ч', 'ch'],
	['Ш', 'Sh'],
	['ш', 'sh'],
	['Щ', 'Shh'],
	['щ', 'shh'],
	['Ъ', ''],
	['ъ', ''],
	['Ы', 'Y'],
	['ы', 'y'],
	['Ь', ''],
	['ь', ''],
	['Э', 'E'],
	['э', 'e'],
	['Ю', 'Yu'],
	['ю', 'yu'],
	['Я', 'Ya'],
	['я', 'ya'],
	['Ё', 'Yo'],
	['ё', 'yo'],

	// Romanian
	['ș', 's'],
	['Ș', 's'],
	['ț', 't'],
	['Ț', 't'],

	// Turkish
	['ş', 's'],
	['Ş', 's'],
	['ç', 'c'],
	['Ç', 'c'],
	['ğ', 'g'],
	['Ğ', 'g'],
	['ı', 'i'],
	['İ', 'i']
];

var overridableReplacements = [
	['&', ' and '],
	['🦄', ' unicorn '],
	['♥', ' love ']
];

const decamelize = string => {
	return string
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2');
};

const doCustomReplacements = (string, replacements) => {
	for (const [key, value] of replacements) {
		string = string.replace(new RegExp(escapeStringRegexp(key), 'g'), value);
	}

	return string;
};

const removeMootSeparators = (string, separator) => {
	return string
		.replace(new RegExp(`${separator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
};

const slugify = (string, options) => {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = {
		separator: '-',
		lowercase: true,
		decamelize: true,
		customReplacements: [],
		...options
	};

	const separator = escapeStringRegexp(options.separator);
	const customReplacements = new Map([
		...overridableReplacements,
		...options.customReplacements,
		...replacements
	]);

	string = doCustomReplacements(string, customReplacements);
	string = lodash_deburr(string);
	string = string.normalize('NFKD');

	if (options.decamelize) {
		string = decamelize(string);
	}

	let patternSlug = /[^a-zA-Z\d]+/g;

	if (options.lowercase) {
		string = string.toLowerCase();
		patternSlug = /[^a-z\d]+/g;
	}

	string = string.replace(patternSlug, separator);
	string = string.replace(/\\/g, '');
	string = removeMootSeparators(string, separator);

	return string;
};

var slugify_1 = slugify;
// TODO: Remove this for the next major release
var default_1 = slugify;
slugify_1.default = default_1;

const SLUG_PRESERVE_UNICODE = true;
const SLUG_SEPARATOR = '_';

/* url-safe processor */

const urlsafeSlugProcessor = string =>
	slugify_1(string, {
		customReplacements: [	// runs before any other transformations
			['$', 'DOLLAR'], // `$destroy` & co
			['-', 'DASH'], // conflicts with `separator`
		],
		separator: SLUG_SEPARATOR,
		decamelize: false,
		lowercase: false
	})
		.replace(/DOLLAR/g, '$')
		.replace(/DASH/g, '-');

/* unicode-preserver processor */

const alphaNumRegex = /[a-zA-Z0-9]/;
const unicodeRegex = /\p{Letter}/u;
const isNonAlphaNumUnicode =
	string => !alphaNumRegex.test(string) && unicodeRegex.test(string);

const unicodeSafeProcessor = string =>
	string.split('')
		.reduce((accum, char, index, array) => {
			const type = isNonAlphaNumUnicode(char) ? 'pass' : 'process';

			if (index === 0) {
				accum.current = {type, string: char};
			} else if (type === accum.current.type) {
				accum.current.string += char;
			} else {
				accum.chunks.push(accum.current);
				accum.current = {type, string: char};
			}

			if (index === array.length - 1) {
				accum.chunks.push(accum.current);
			}

			return accum;
		}, {chunks: [], current: {type: '', string: ''}})
		.chunks
		.reduce((accum, chunk) => {
			const processed = chunk.type === 'process'
				? urlsafeSlugProcessor(chunk.string)
				: chunk.string;

			processed.length > 0 && accum.push(processed);

			return accum;
		}, [])
		.join(SLUG_SEPARATOR);

/* processor */

const makeSlugProcessor = (preserveUnicode = false) => preserveUnicode
	? unicodeSafeProcessor
	: urlsafeSlugProcessor;

const makeSlug = makeSlugProcessor(SLUG_PRESERVE_UNICODE);

function get_posts() {
	return fs__default
		.readdirSync('content/blog')
		.map(file => {
			if (path__default.extname(file) !== '.md') return;

			const match = /^(\d+-\d+-\d+)-(.+)\.md$/.exec(file);
			if (!match) throw new Error(`Invalid filename '${file}'`);

			const [, pubdate, slug] = match;

			const markdown = fs__default.readFileSync(`content/blog/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const date = new Date(`${pubdate} EDT`); // cheeky hack
			metadata.pubdate = pubdate;
			metadata.dateString = date.toDateString();

			const renderer = new marked.Renderer();

			renderer.link = link_renderer;

			renderer.code = highlight;

			renderer.heading = (text, level, rawtext) => {
				const fragment = makeSlug(rawtext);

				return `
					<h${level}>
						<span id="${fragment}" class="offset-anchor"></span>
						<a href="blog/${slug}#${fragment}" class="anchor" aria-hidden="true"></a>
						${text}
					</h${level}>`;
			};

			const html = marked(
				content.replace(/^\t+/gm, match => match.split('\t').join('  ')),
				{ renderer }
			);

			return {
				html,
				metadata,
				slug
			};
		})
		.sort((a, b) => a.metadata.pubdate < b.metadata.pubdate ? 1 : -1);
}

let json$1;

function get$9(req, res) {
	if (!json$1 || "development" !== 'production') {
		const posts = get_posts()
			.filter(post => !post.metadata.draft)
			.map(post => {
				return {
					slug: post.slug,
					metadata: post.metadata
				};
			});

		json$1 = JSON.stringify(posts);
	}

	send(res, 200, json$1, {
		'Content-Type': 'application/json',
		'Cache-Control': `max-age=${5 * 60 * 1e3}` // 5 minutes
	});
}

var route_9 = /*#__PURE__*/Object.freeze({
	get: get$9
});

const months = ',Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',');

function formatPubdate(str) {
	const [y, m, d] = str.split('-');
	return `${d} ${months[+m]} ${y} 12:00 +0000`;
}

const rss = `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
	<title>Svelte blog</title>
	<link>https://svelte.dev/blog</link>
	<description>News and information about the magical disappearing UI framework</description>
	<image>
		<url>https://svelte.dev/favicon.png</url>
		<title>Svelte</title>
		<link>https://svelte.dev/blog</link>
	</image>
	${get_posts().filter(post => !post.metadata.draft).map(post => `
		<item>
			<title>${post.metadata.title}</title>
			<link>https://svelte.dev/blog/${post.slug}</link>
			<description>${post.metadata.description}</description>
			<pubDate>${formatPubdate(post.metadata.pubdate)}</pubDate>
		</item>
	`).join('')}
</channel>

</rss>
`.replace(/>[^\S]+/gm, '>').replace(/[^\S]+</gm, '<').trim();

function get$a(req, res) {
	send(res, 200, rss, {
		'Cache-Control': `max-age=${30 * 60 * 1e3}`,
		'Content-Type': 'application/rss+xml'
	});
}

var route_10 = /*#__PURE__*/Object.freeze({
	get: get$a
});

let lookup$1;

function get$b(req, res) {
	if (!lookup$1 || "development" !== 'production') {
		lookup$1 = new Map();
		get_posts().forEach(post => {
			lookup$1.set(post.slug, post);
		});
	}

	const post = lookup$1.get(req.params.slug);

	if (post) {
		res.setHeader('Cache-Control', `max-age=${5 * 60 * 1e3}`); // 5 minutes
		send(res, 200, post);
	} else {
		send(res, 404, { message: 'not found' });
	}
}

var route_11 = /*#__PURE__*/Object.freeze({
	get: get$b
});

function get$c(req, res) {
	res.writeHead(302, { Location: 'https://discord.gg/yy75DKs' });
	res.end();
}

var route_12 = /*#__PURE__*/Object.freeze({
	get: get$c
});

const SLUG_PRESERVE_UNICODE$1 = false;
const SLUG_SEPARATOR$1 = '_';

/* url-safe processor */

const urlsafeSlugProcessor$1 = (string, opts) => {
	const { separator = SLUG_SEPARATOR$1 } = opts || {};

	return slugify_1(string, {
		customReplacements: [	// runs before any other transformations
			['$', 'DOLLAR'], // `$destroy` & co
			['-', 'DASH'], // conflicts with `separator`
		],
		separator,
		decamelize: false,
		lowercase: false
	})
	.replace(/DOLLAR/g, '$')
	.replace(/DASH/g, '-');
};

/* unicode-preserver processor */

const alphaNumRegex$1 = /[a-zA-Z0-9]/;
const unicodeRegex$1 = /\p{Letter}/u;
const isNonAlphaNumUnicode$1 =
	string => !alphaNumRegex$1.test(string) && unicodeRegex$1.test(string);

const unicodeSafeProcessor$1 = (string, opts) => {
	const { separator = SLUG_SEPARATOR$1 } = opts || {};

	return string.split('')
	.reduce((accum, char, index, array) => {
		const type = isNonAlphaNumUnicode$1(char) ? 'pass' : 'process';

		if (index === 0) {
			accum.current = {type, string: char};
		} else if (type === accum.current.type) {
			accum.current.string += char;
		} else {
			accum.chunks.push(accum.current);
			accum.current = {type, string: char};
		}

		if (index === array.length - 1) {
			accum.chunks.push(accum.current);
		}

		return accum;
	}, {chunks: [], current: {type: '', string: ''}})
	.chunks
	.reduce((accum, chunk) => {
		const processed = chunk.type === 'process'
			? urlsafeSlugProcessor$1(chunk.string)
			: chunk.string;

		processed.length > 0 && accum.push(processed);

		return accum;
	}, [])
	.join(separator);
};

/* session processor */

const make_session_slug_processor = ({
	preserve_unicode = SLUG_PRESERVE_UNICODE$1,
	separator = SLUG_SEPARATOR$1
}) => {
	const processor = preserve_unicode ? unicodeSafeProcessor$1 : urlsafeSlugProcessor$1;
	const seen = new Set();

	return string => {
		const slug = processor(string, { separator });

		if (seen.has(slug)) throw new Error(`Duplicate slug ${slug}`);
		seen.add(slug);

		return slug;
	}
};

const blockTypes = [
	'blockquote',
	'html',
	'heading',
	'hr',
	'list',
	'listitem',
	'paragraph',
	'table',
	'tablerow',
	'tablecell'
];

function get_sections$1() {
	const make_slug = make_session_slug_processor({
		preserve_unicode: SLUG_PRESERVE_UNICODE,
		separator: SLUG_SEPARATOR
	});

	return fs__default
		.readdirSync(`content/docs`)
		.filter(file => file[0] !== '.' && path__default.extname(file) === '.md')
		.map(file => {
			const markdown = fs__default.readFileSync(`content/docs/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const section_slug = make_slug(metadata.title);

			const subsections = [];

			const renderer = new marked.Renderer();

			let block_open = false;

			renderer.link = link_renderer;

			renderer.hr = () => {
				block_open = true;

				return '<div class="side-by-side"><div class="copy">';
			};

			renderer.code = (source, lang) => {
				source = source.replace(/^ +/gm, match =>
					match.split('    ').join('\t')
				);

				const lines = source.split('\n');

				const meta = extract_metadata(lines[0], lang);

				let prefix = '';
				let className = 'code-block';

				if (meta) {
					source = lines.slice(1).join('\n');
					const filename = meta.filename || (lang === 'html' && 'App.svelte');
					if (filename) {
						prefix = `<span class='filename'>${prefix} ${filename}</span>`;
						className += ' named';
					}
				}

				if (meta && meta.hidden) return '';

				const html = `<div class='${className}'>${prefix}${highlight(source, lang)}</div>`;

				if (block_open) {
					block_open = false;
					return `</div><div class="code">${html}</div></div>`;
				}

				return html;
			};

			renderer.heading = (text, level, rawtext) => {
				let slug;

				const match = /<a href="([^"]+)">(.+)<\/a>/.exec(text);
				if (match) {
					slug = match[1];
					text = match[2];
				} else {
					slug = make_slug(rawtext);
				}

				if (level === 3 || level === 4) {
					const title = text
						.replace(/<\/?code>/g, '')
						.replace(/\.(\w+)(\((.+)?\))?/, (m, $1, $2, $3) => {
							if ($3) return `.${$1}(...)`;
							if ($2) return `.${$1}()`;
							return `.${$1}`;
						});

					subsections.push({ slug, title, level });
				}

				return `
					<h${level}>
						<span id="${slug}" class="offset-anchor" ${level > 4 ? 'data-scrollignore' : ''}></span>
						<a href="docs#${slug}" class="anchor" aria-hidden="true"></a>
						${text}
					</h${level}>`;
			};

			blockTypes.forEach(type => {
				const fn = renderer[type];
				renderer[type] = function() {
					return fn.apply(this, arguments);
				};
			});

			const html = marked(content, { renderer });

			const hashes = {};

			return {
				html: html.replace(/@@(\d+)/g, (m, id) => hashes[id] || m),
				metadata,
				subsections,
				slug: section_slug,
				file,
			};
		});
}

let json$2;

function get$d(req, res) {
	if (!json$2 || "development" !== 'production') {
		json$2 = get_sections$1();
	}

	send(res, 200, json$2);
}

var route_13 = /*#__PURE__*/Object.freeze({
	get: get$d
});

function body(req) {
	return new Promise((fulfil, reject) => {
		let str = '';

		req.on('error', reject);

		req.on('data', chunk => {
			str += chunk;
		});

		req.on('end', () => {
			try {
				fulfil(JSON.parse(str));
			} catch (err) {
				reject(err);
			}
		});
	});
}

async function post(req, res) {
	const { user } = req;
	if (!user) return; // response already sent

	try {
		const { name, files } = await body(req);

		const [row] = await query(`
			insert into gists(user_id, name, files)
			values ($1, $2, $3) returning *`, [user.id, name, JSON.stringify(files)]);

		send(res, 201, {
			uid: row.uid.replace(/-/g, ''),
			name: row.name,
			files: row.files,
			owner: user.uid,
		});
	} catch (err) {
		send(res, 500, {
			error: err.message
		});
	}
}

var route_14 = /*#__PURE__*/Object.freeze({
	post: post
});

function get$e(req, res) {
	const path = req.params.file.join('/');
	if ( ('/' + path).includes('/.')) {
		res.writeHead(403);
		res.end();
		return;
	}
	fs.createReadStream('../' + path)
		.on('error', () => {
			res.writeHead(403);
			res.end();
		})
		.pipe(res);
	res.writeHead(200, { 'Content-Type': 'text/javascript' });
}

var route_15 = /*#__PURE__*/Object.freeze({
	get: get$e
});

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

async function import_gist(req, res) {
	const base = `https://api.github.com/gists/${req.params.id}`;
	const url = `${base}?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}`;

	try {
		const { data } = await httpie.get(url, {
			headers: {
				'User-Agent': 'https://svelte.dev'
			}
		});

		// create owner if necessary...
		let user = await find(`select * from users where uid = $1`, [data.owner.id]);

		if (!user) {
			const { id, name, login, avatar_url } = data.owner;

			user = await find(`
				insert into users(uid, name, username, avatar)
				values ($1, $2, $3, $4)
				returning *
			`, [id, name, login, avatar_url]);
		}

		delete data.files['README.md'];
		delete data.files['meta.json'];

		const files = Object.keys(data.files).map(key => {
			const name = key.replace(/\.html$/, '.svelte');

			return {
				name,
				source: data.files[key].content
			};
		});

		// add gist to database...
		await query(`
			insert into gists(uid, user_id, name, files)
			values ($1, $2, $3, $4)
		`, [req.params.id, user.id, data.description, JSON.stringify(files)]);

		send(res, 200, {
			uid: req.params.id,
			name: data.description,
			files,
			owner: data.owner.id
		});
	} catch (err) {
		send(res, err.statusCode, { error: err.message });
	}
}

async function get$f(req, res) {
	// is this an example?
	const example = get_example(req.params.id);

	if (example) {
		return send(res, 200, {
			relaxed: true,
			uid: req.params.id,
			name: example.title,
			files: example.files,
			owner: null
		});
	}

	{
		// In dev, proxy requests to load particular REPLs to the real server.
		// This avoids needing to connect to the real database server.
		req.pipe(
			require('https').request({ host: 'svelte.dev', path: req.url })
		).once('response', res_proxy => {
			res_proxy.pipe(res);
			res.writeHead(res_proxy.statusCode, res_proxy.headers);
		}).once('error', () => res.end());
		return;
	}

	const [row] = await query(`
		select g.*, u.uid as owner from gists g
		left join users u on g.user_id = u.id
		where g.uid = $1 limit 1
	`, [req.params.id]); // via filename pattern

	if (!row) {
		return import_gist(req, res);
	}

	send(res, 200, {
		uid: row.uid.replace(/-/g, ''),
		name: row.name,
		files: row.files,
		owner: row.owner
	});
}

async function patch(req, res) {
	const { user } = req;
	if (!user) return;

	let id;
	const uid = req.params.id;

	try {
		const [row] = await query(`select * from gists where uid = $1 limit 1`, [uid]);
		if (!row) return send(res, 404, { error: 'Gist not found' });
		if (row.user_id !== user.id) return send(res, 403, { error: 'Item does not belong to you' });
		id = row.id;
	} catch (err) {
		console.error('PATCH /gists @ select', err);
		return send(res, 500);
	}

	try {
		const obj = await body(req);
		obj.updated_at = 'now()';
		let k;
		const cols = [];
		const vals = [];
		for (k in obj) {
			cols.push(k);
			vals.push(k === 'files' ? JSON.stringify(obj[k]) : obj[k]);
		}

		const tmp = vals.map((x, i) => `$${i + 1}`).join(',');
		const set = `set (${cols.join(',')}) = (${tmp})`;

		const [row] = await query(`update gists ${set} where id = ${id} returning *`, vals);

		send(res, 200, {
			uid: row.uid.replace(/-/g, ''),
			name: row.name,
			files: row.files,
			owner: user.uid,
		});
	} catch (err) {
		console.error('PATCH /gists @ update', err);
		send(res, 500, { error: err.message });
	}
}

var route_16 = /*#__PURE__*/Object.freeze({
	get: get$f,
	patch: patch
});

function get$g(req, res) {
	res.writeHead(302, { Location: 'https://github.com/sveltejs/svelte/wiki/FAQ' });
	res.end();
}

var route_17 = /*#__PURE__*/Object.freeze({
	get: get$g
});

// This file is generated by Sapper — do not edit it!

const d = decodeURIComponent;

const manifest = {
	server_routes: [
		{
			// examples/index.json.js
			pattern: /^\/examples.json$/,
			handlers: route_0,
			params: () => ({})
		},

		{
			// examples/[slug].json.js
			pattern: /^\/examples\/([^\/]+?).json$/,
			handlers: route_1,
			params: match => ({ slug: d(match[1]) })
		},

		{
			// tutorial/index.json.js
			pattern: /^\/tutorial.json$/,
			handlers: route_2,
			params: () => ({})
		},

		{
			// tutorial/random-number.js
			pattern: /^\/tutorial\/random-number\/?$/,
			handlers: route_3,
			params: () => ({})
		},

		{
			// tutorial/[slug]/index.json.js
			pattern: /^\/tutorial\/([^\/]+?).json$/,
			handlers: route_4,
			params: match => ({ slug: d(match[1]) })
		},

		{
			// apps/index.json.js
			pattern: /^\/apps.json$/,
			handlers: route_5,
			params: () => ({})
		},

		{
			// auth/callback.js
			pattern: /^\/auth\/callback\/?$/,
			handlers: route_6,
			params: () => ({})
		},

		{
			// auth/logout.js
			pattern: /^\/auth\/logout\/?$/,
			handlers: route_7,
			params: () => ({})
		},

		{
			// auth/login.js
			pattern: /^\/auth\/login\/?$/,
			handlers: route_8,
			params: () => ({})
		},

		{
			// blog/index.json.js
			pattern: /^\/blog.json$/,
			handlers: route_9,
			params: () => ({})
		},

		{
			// blog/rss.xml.js
			pattern: /^\/blog\/rss.xml$/,
			handlers: route_10,
			params: () => ({})
		},

		{
			// blog/[slug].json.js
			pattern: /^\/blog\/([^\/]+?).json$/,
			handlers: route_11,
			params: match => ({ slug: d(match[1]) })
		},

		{
			// chat.js
			pattern: /^\/chat\/?$/,
			handlers: route_12,
			params: () => ({})
		},

		{
			// docs/index.json.js
			pattern: /^\/docs.json$/,
			handlers: route_13,
			params: () => ({})
		},

		{
			// repl/create.json.js
			pattern: /^\/repl\/create.json$/,
			handlers: route_14,
			params: () => ({})
		},

		{
			// repl/local/[...file].js
			pattern: /^\/repl\/local\/(.+)$/,
			handlers: route_15,
			params: match => ({ file: d(match[1]).split('/') })
		},

		{
			// repl/[id]/index.json.js
			pattern: /^\/repl\/([^\/]+?).json$/,
			handlers: route_16,
			params: match => ({ id: d(match[1]) })
		},

		{
			// faq.js
			pattern: /^\/faq\/?$/,
			handlers: route_17,
			params: () => ({})
		}
	],

	pages: [
		{
			// index.svelte
			pattern: /^\/$/,
			parts: [
				{ name: "index", file: "index.svelte", component: index$3.default }
			]
		},

		{
			// examples/index.svelte
			pattern: /^\/examples\/?$/,
			parts: [
				{ name: "examples", file: "examples/index.svelte", component: index$4.default, preload: index$4.preload }
			]
		},

		{
			// tutorial/index.svelte
			pattern: /^\/tutorial\/?$/,
			parts: [
				{ name: "tutorial__layout", file: "tutorial/_layout.svelte", component: _layout.default, preload: _layout.preload },
				{ name: "tutorial", file: "tutorial/index.svelte", component: index$5.default, preload: index$5.preload }
			]
		},

		{
			// tutorial/[slug]/index.svelte
			pattern: /^\/tutorial\/([^\/]+?)\/?$/,
			parts: [
				{ name: "tutorial__layout", file: "tutorial/_layout.svelte", component: _layout.default, preload: _layout.preload },
				{ name: "tutorial_$slug", file: "tutorial/[slug]/index.svelte", component: index$6.default, preload: index$6.preload, params: match => ({ slug: d(match[1]) }) }
			]
		},

		{
			// apps/index.svelte
			pattern: /^\/apps\/?$/,
			parts: [
				{ name: "apps", file: "apps/index.svelte", component: index$7.default, preload: index$7.preload }
			]
		},

		{
			// blog/index.svelte
			pattern: /^\/blog\/?$/,
			parts: [
				{ name: "blog", file: "blog/index.svelte", component: index$8.default, preload: index$8.preload }
			]
		},

		{
			// blog/[slug].svelte
			pattern: /^\/blog\/([^\/]+?)\/?$/,
			parts: [
				null,
				{ name: "blog_$slug", file: "blog/[slug].svelte", component: _slug_.default, preload: _slug_.preload, params: match => ({ slug: d(match[1]) }) }
			]
		},

		{
			// docs/index.svelte
			pattern: /^\/docs\/?$/,
			parts: [
				{ name: "docs", file: "docs/index.svelte", component: index$9.default, preload: index$9.preload }
			]
		},

		{
			// repl/index.svelte
			pattern: /^\/repl\/?$/,
			parts: [
				{ name: "repl", file: "repl/index.svelte", component: index$a.default, preload: index$a.preload }
			]
		},

		{
			// repl/embed.svelte
			pattern: /^\/repl\/embed\/?$/,
			parts: [
				null,
				{ name: "repl_embed", file: "repl/embed.svelte", component: embed.default, preload: embed.preload }
			]
		},

		{
			// repl/[id]/index.svelte
			pattern: /^\/repl\/([^\/]+?)\/?$/,
			parts: [
				null,
				{ name: "repl_$id", file: "repl/[id]/index.svelte", component: index$b.default, preload: index$b.preload, params: match => ({ id: d(match[1]) }) }
			]
		}
	],

	root: app$1.root,
	root_preload: () => {},
	error: app$1.error
};

const build_dir = "__sapper__/dev";

const src_dir = "src";

function get_server_route_handler(routes) {
	async function handle_route(route, req, res, next) {
		req.params = route.params(route.pattern.exec(req.path));

		const method = req.method.toLowerCase();
		// 'delete' cannot be exported from a module because it is a keyword,
		// so check for 'del' instead
		const method_export = method === 'delete' ? 'del' : method;
		const handle_method = route.handlers[method_export];
		if (handle_method) {
			if (process.env.SAPPER_EXPORT) {
				const { write, end, setHeader } = res;
				const chunks = [];
				const headers = {};

				// intercept data so that it can be exported
				res.write = function(chunk) {
					chunks.push(Buffer.from(chunk));
					write.apply(res, arguments);
				};

				res.setHeader = function(name, value) {
					headers[name.toLowerCase()] = value;
					setHeader.apply(res, arguments);
				};

				res.end = function(chunk) {
					if (chunk) chunks.push(Buffer.from(chunk));
					end.apply(res, arguments);

					process.send({
						__sapper__: true,
						event: 'file',
						url: req.url,
						method: req.method,
						status: res.statusCode,
						type: headers['content-type'],
						body: Buffer.concat(chunks).toString()
					});
				};
			}

			const handle_next = (err) => {
				if (err) {
					res.statusCode = 500;
					res.end(err.message);
				} else {
					process.nextTick(next);
				}
			};

			try {
				await handle_method(req, res, handle_next);
			} catch (err) {
				console.error(err);
				handle_next(err);
			}
		} else {
			// no matching handler for method
			process.nextTick(next);
		}
	}

	return function find_route(req, res, next) {
		for (const route of routes) {
			if (route.pattern.test(req.path)) {
				handle_route(route, req, res, next);
				return;
			}
		}

		next();
	};
}

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1 = parse$1;
var serialize_1 = serialize;

/**
 * Module variables.
 * @private
 */

var decode = decodeURIComponent;
var encode = encodeURIComponent;
var pairSplitRegExp = /; */;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse$1(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var cookie = {
	parse: parse_1,
	serialize: serialize_1
};

var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join('\0');
function devalue(value) {
    var counts = new Map();
    function walk(thing) {
        if (typeof thing === 'function') {
            throw new Error("Cannot stringify a function");
        }
        if (counts.has(thing)) {
            counts.set(thing, counts.get(thing) + 1);
            return;
        }
        counts.set(thing, 1);
        if (!isPrimitive(thing)) {
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                case 'Date':
                case 'RegExp':
                    return;
                case 'Array':
                    thing.forEach(walk);
                    break;
                case 'Set':
                case 'Map':
                    Array.from(thing).forEach(walk);
                    break;
                default:
                    var proto = Object.getPrototypeOf(thing);
                    if (proto !== Object.prototype &&
                        proto !== null &&
                        Object.getOwnPropertyNames(proto).sort().join('\0') !== objectProtoOwnPropertyNames) {
                        throw new Error("Cannot stringify arbitrary non-POJOs");
                    }
                    if (Object.getOwnPropertySymbols(thing).length > 0) {
                        throw new Error("Cannot stringify POJOs with symbolic keys");
                    }
                    Object.keys(thing).forEach(function (key) { return walk(thing[key]); });
            }
        }
    }
    walk(value);
    var names = new Map();
    Array.from(counts)
        .filter(function (entry) { return entry[1] > 1; })
        .sort(function (a, b) { return b[1] - a[1]; })
        .forEach(function (entry, i) {
        names.set(entry[0], getName(i));
    });
    function stringify(thing) {
        if (names.has(thing)) {
            return names.get(thing);
        }
        if (isPrimitive(thing)) {
            return stringifyPrimitive(thing);
        }
        var type = getType(thing);
        switch (type) {
            case 'Number':
            case 'String':
            case 'Boolean':
                return "Object(" + stringify(thing.valueOf()) + ")";
            case 'RegExp':
                return thing.toString();
            case 'Date':
                return "new Date(" + thing.getTime() + ")";
            case 'Array':
                var members = thing.map(function (v, i) { return i in thing ? stringify(v) : ''; });
                var tail = thing.length === 0 || (thing.length - 1 in thing) ? '' : ',';
                return "[" + members.join(',') + tail + "]";
            case 'Set':
            case 'Map':
                return "new " + type + "([" + Array.from(thing).map(stringify).join(',') + "])";
            default:
                var obj = "{" + Object.keys(thing).map(function (key) { return safeKey(key) + ":" + stringify(thing[key]); }).join(',') + "}";
                var proto = Object.getPrototypeOf(thing);
                if (proto === null) {
                    return Object.keys(thing).length > 0
                        ? "Object.assign(Object.create(null)," + obj + ")"
                        : "Object.create(null)";
                }
                return obj;
        }
    }
    var str = stringify(value);
    if (names.size) {
        var params_1 = [];
        var statements_1 = [];
        var values_1 = [];
        names.forEach(function (name, thing) {
            params_1.push(name);
            if (isPrimitive(thing)) {
                values_1.push(stringifyPrimitive(thing));
                return;
            }
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    values_1.push("Object(" + stringify(thing.valueOf()) + ")");
                    break;
                case 'RegExp':
                    values_1.push(thing.toString());
                    break;
                case 'Date':
                    values_1.push("new Date(" + thing.getTime() + ")");
                    break;
                case 'Array':
                    values_1.push("Array(" + thing.length + ")");
                    thing.forEach(function (v, i) {
                        statements_1.push(name + "[" + i + "]=" + stringify(v));
                    });
                    break;
                case 'Set':
                    values_1.push("new Set");
                    statements_1.push(name + "." + Array.from(thing).map(function (v) { return "add(" + stringify(v) + ")"; }).join('.'));
                    break;
                case 'Map':
                    values_1.push("new Map");
                    statements_1.push(name + "." + Array.from(thing).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return "set(" + stringify(k) + ", " + stringify(v) + ")";
                    }).join('.'));
                    break;
                default:
                    values_1.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}');
                    Object.keys(thing).forEach(function (key) {
                        statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
                    });
            }
        });
        statements_1.push("return " + str);
        return "(function(" + params_1.join(',') + "){" + statements_1.join(';') + "}(" + values_1.join(',') + "))";
    }
    else {
        return str;
    }
}
function getName(num) {
    var name = '';
    do {
        name = chars[num % chars.length] + name;
        num = ~~(num / chars.length) - 1;
    } while (num >= 0);
    return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
    return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
    if (typeof thing === 'string')
        return stringifyString(thing);
    if (thing === void 0)
        return 'void 0';
    if (thing === 0 && 1 / thing < 0)
        return '-0';
    var str = String(thing);
    if (typeof thing === 'number')
        return str.replace(/^(-)?0\./, '$1.');
    return str;
}
function getType(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
    return escaped[c] || c;
}
function escapeUnsafeChars(str) {
    return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
    var result = '"';
    for (var i = 0; i < str.length; i += 1) {
        var char = str.charAt(i);
        var code = char.charCodeAt(0);
        if (char === '"') {
            result += '\\"';
        }
        else if (char in escaped) {
            result += escaped[char];
        }
        else if (code >= 0xd800 && code <= 0xdfff) {
            var next = str.charCodeAt(i + 1);
            // If this is the beginning of a [high, low] surrogate pair,
            // add the next two characters, otherwise escape
            if (code <= 0xdbff && (next >= 0xdc00 && next <= 0xdfff)) {
                result += char + str[++i];
            }
            else {
                result += "\\u" + code.toString(16).toUpperCase();
            }
        }
        else {
            result += char;
        }
    }
    result += '"';
    return result;
}

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find$1(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find$1(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find$1(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find$1(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find$1(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find$1(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find$1(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

function get_page_handler(
	manifest,
	session_getter
) {
	const get_build_info =  () => JSON.parse(fs__default.readFileSync(path__default.join(build_dir, 'build.json'), 'utf-8'))
		;

	const template =  () => read_template(src_dir)
		;

	const has_service_worker = fs__default.existsSync(path__default.join(build_dir, 'service-worker.js'));

	const { server_routes, pages } = manifest;
	const error_route = manifest.error;

	function bail(req, res, err) {
		console.error(err);

		const message =  escape_html(err.message) ;

		res.statusCode = 500;
		res.end(`<pre>${message}</pre>`);
	}

	function handle_error(req, res, statusCode, error) {
		handle_page({
			pattern: null,
			parts: [
				{ name: null, component: error_route }
			]
		}, req, res, statusCode, error || new Error('Unknown error in preload function'));
	}

	async function handle_page(page, req, res, status = 200, error = null) {
		const is_service_worker_index = req.path === '/service-worker-index.html';
		const build_info




 = get_build_info();

		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Cache-Control',  'no-cache' );

		// preload main.js and current route
		// TODO detect other stuff we can preload? images, CSS, fonts?
		let preloaded_chunks = Array.isArray(build_info.assets.main) ? build_info.assets.main : [build_info.assets.main];
		if (!error && !is_service_worker_index) {
			page.parts.forEach(part => {
				if (!part) return;

				// using concat because it could be a string or an array. thanks webpack!
				preloaded_chunks = preloaded_chunks.concat(build_info.assets[part.name]);
			});
		}

		if (build_info.bundler === 'rollup') {
			// TODO add dependencies and CSS
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map(file => `<${req.baseUrl}/client/${file}>;rel="modulepreload"`)
				.join(', ');

			res.setHeader('Link', link);
		} else {
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map((file) => {
					const as = /\.css$/.test(file) ? 'style' : 'script';
					return `<${req.baseUrl}/client/${file}>;rel="preload";as="${as}"`;
				})
				.join(', ');

			res.setHeader('Link', link);
		}

		const session = session_getter(req, res);

		let redirect;
		let preload_error;

		const preload_context = {
			redirect: (statusCode, location) => {
				if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
					throw new Error(`Conflicting redirects`);
				}
				location = location.replace(/^\//g, ''); // leading slash (only)
				redirect = { statusCode, location };
			},
			error: (statusCode, message) => {
				preload_error = { statusCode, message };
			},
			fetch: (url, opts) => {
				const parsed = new Url.URL(url, `http://127.0.0.1:${process.env.PORT}${req.baseUrl ? req.baseUrl + '/' :''}`);

				if (opts) {
					opts = Object.assign({}, opts);

					const include_cookies = (
						opts.credentials === 'include' ||
						opts.credentials === 'same-origin' && parsed.origin === `http://127.0.0.1:${process.env.PORT}`
					);

					if (include_cookies) {
						opts.headers = Object.assign({}, opts.headers);

						const cookies = Object.assign(
							{},
							cookie.parse(req.headers.cookie || ''),
							cookie.parse(opts.headers.cookie || '')
						);

						const set_cookie = res.getHeader('Set-Cookie');
						(Array.isArray(set_cookie) ? set_cookie : [set_cookie]).forEach(str => {
							const match = /([^=]+)=([^;]+)/.exec(str);
							if (match) cookies[match[1]] = match[2];
						});

						const str = Object.keys(cookies)
							.map(key => `${key}=${cookies[key]}`)
							.join('; ');

						opts.headers.cookie = str;
					}
				}

				return fetch(parsed.href, opts);
			}
		};

		let preloaded;
		let match;
		let params;

		try {
			const root_preloaded = manifest.root_preload
				? manifest.root_preload.call(preload_context, {
					host: req.headers.host,
					path: req.path,
					query: req.query,
					params: {}
				}, session)
				: {};

			match = error ? null : page.pattern.exec(req.path);


			let toPreload = [root_preloaded];
			if (!is_service_worker_index) {
				toPreload = toPreload.concat(page.parts.map(part => {
					if (!part) return null;

					// the deepest level is used below, to initialise the store
					params = part.params ? part.params(match) : {};

					return part.preload
						? part.preload.call(preload_context, {
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}, session)
						: {};
				}));
			}

			preloaded = await Promise.all(toPreload);
		} catch (err) {
			if (error) {
				return bail(req, res, err)
			}

			preload_error = { statusCode: 500, message: err };
			preloaded = []; // appease TypeScript
		}

		try {
			if (redirect) {
				const location = Url.resolve((req.baseUrl || '') + '/', redirect.location);

				res.statusCode = redirect.statusCode;
				res.setHeader('Location', location);
				res.end();

				return;
			}

			if (preload_error) {
				handle_error(req, res, preload_error.statusCode, preload_error.message);
				return;
			}

			const segments = req.path.split('/').filter(Boolean);

			// TODO make this less confusing
			const layout_segments = [segments[0]];
			let l = 1;

			page.parts.forEach((part, i) => {
				layout_segments[l] = segments[i + 1];
				if (!part) return null;
				l++;
			});

			const props = {
				stores: {
					page: {
						subscribe: index$2.writable({
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}).subscribe
					},
					preloading: {
						subscribe: index$2.writable(null).subscribe
					},
					session: index$2.writable(session)
				},
				segments: layout_segments,
				status: error ? status : 200,
				error: error ? error instanceof Error ? error : { message: error } : null,
				level0: {
					props: preloaded[0]
				},
				level1: {
					segment: segments[0],
					props: {}
				}
			};

			if (!is_service_worker_index) {
				let l = 1;
				for (let i = 0; i < page.parts.length; i += 1) {
					const part = page.parts[i];
					if (!part) continue;

					props[`level${l++}`] = {
						component: part.component,
						props: preloaded[i + 1] || {},
						segment: segments[i]
					};
				}
			}

			const { html, head, css } = app$1.App.render(props);

			const serialized = {
				preloaded: `[${preloaded.map(data => try_serialize(data)).join(',')}]`,
				session: session && try_serialize(session, err => {
					throw new Error(`Failed to serialize session data: ${err.message}`);
				}),
				error: error && try_serialize(props.error)
			};

			let script = `__SAPPER__={${[
				error && `error:${serialized.error},status:${status}`,
				`baseUrl:"${req.baseUrl}"`,
				serialized.preloaded && `preloaded:${serialized.preloaded}`,
				serialized.session && `session:${serialized.session}`
			].filter(Boolean).join(',')}};`;

			if (has_service_worker) {
				script += `if('serviceWorker' in navigator)navigator.serviceWorker.register('${req.baseUrl}/service-worker.js');`;
			}

			const file = [].concat(build_info.assets.main).filter(file => file && /\.js$/.test(file))[0];
			const main = `${req.baseUrl}/client/${file}`;

			if (build_info.bundler === 'rollup') {
				if (build_info.legacy_assets) {
					const legacy_main = `${req.baseUrl}/client/legacy/${build_info.legacy_assets.main}`;
					script += `(function(){try{eval("async function x(){}");var main="${main}"}catch(e){main="${legacy_main}"};var s=document.createElement("script");try{new Function("if(0)import('')")();s.src=main;s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main",main);}document.head.appendChild(s);}());`;
				} else {
					script += `var s=document.createElement("script");try{new Function("if(0)import('')")();s.src="${main}";s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main","${main}")}document.head.appendChild(s)`;
				}
			} else {
				script += `</script><script src="${main}">`;
			}

			let styles;

			// TODO make this consistent across apps
			// TODO embed build_info in placeholder.ts
			if (build_info.css && build_info.css.main) {
				const css_chunks = new Set();
				if (build_info.css.main) css_chunks.add(build_info.css.main);
				page.parts.forEach(part => {
					if (!part) return;
					const css_chunks_for_part = build_info.css.chunks[part.file];

					if (css_chunks_for_part) {
						css_chunks_for_part.forEach(file => {
							css_chunks.add(file);
						});
					}
				});

				styles = Array.from(css_chunks)
					.map(href => `<link rel="stylesheet" href="client/${href}">`)
					.join('');
			} else {
				styles = (css && css.code ? `<style>${css.code}</style>` : '');
			}

			// users can set a CSP nonce using res.locals.nonce
			const nonce_attr = (res.locals && res.locals.nonce) ? ` nonce="${res.locals.nonce}"` : '';

			const body = template()
				.replace('%sapper.base%', () => `<base href="${req.baseUrl}/">`)
				.replace('%sapper.scripts%', () => `<script${nonce_attr}>${script}</script>`)
				.replace('%sapper.html%', () => html)
				.replace('%sapper.head%', () => `<noscript id='sapper-head-start'></noscript>${head}<noscript id='sapper-head-end'></noscript>`)
				.replace('%sapper.styles%', () => styles);

			res.statusCode = status;
			res.end(body);
		} catch(err) {
			if (error) {
				bail(req, res, err);
			} else {
				handle_error(req, res, 500, err);
			}
		}
	}

	return function find_route(req, res, next) {
		if (req.path === '/service-worker-index.html') {
			const homePage = pages.find(page => page.pattern.test('/'));
			handle_page(homePage, req, res);
			return;
		}

		for (const page of pages) {
			if (page.pattern.test(req.path)) {
				handle_page(page, req, res);
				return;
			}
		}

		handle_error(req, res, 404, 'Not found');
	};
}

function read_template(dir = build_dir) {
	return fs__default.readFileSync(`${dir}/template.html`, 'utf-8');
}

function try_serialize(data, fail) {
	try {
		return devalue(data);
	} catch (err) {
		if (fail) fail(err);
		return null;
	}
}

function escape_html(html) {
	const chars = {
		'"' : 'quot',
		"'": '#39',
		'&': 'amp',
		'<' : 'lt',
		'>' : 'gt'
	};

	return html.replace(/["'&<>]/g, c => `&${chars[c]};`);
}

var mime_raw = "application/andrew-inset\t\t\tez\napplication/applixware\t\t\t\taw\napplication/atom+xml\t\t\t\tatom\napplication/atomcat+xml\t\t\t\tatomcat\napplication/atomsvc+xml\t\t\t\tatomsvc\napplication/ccxml+xml\t\t\t\tccxml\napplication/cdmi-capability\t\t\tcdmia\napplication/cdmi-container\t\t\tcdmic\napplication/cdmi-domain\t\t\t\tcdmid\napplication/cdmi-object\t\t\t\tcdmio\napplication/cdmi-queue\t\t\t\tcdmiq\napplication/cu-seeme\t\t\t\tcu\napplication/davmount+xml\t\t\tdavmount\napplication/docbook+xml\t\t\t\tdbk\napplication/dssc+der\t\t\t\tdssc\napplication/dssc+xml\t\t\t\txdssc\napplication/ecmascript\t\t\t\tecma\napplication/emma+xml\t\t\t\temma\napplication/epub+zip\t\t\t\tepub\napplication/exi\t\t\t\t\texi\napplication/font-tdpfr\t\t\t\tpfr\napplication/gml+xml\t\t\t\tgml\napplication/gpx+xml\t\t\t\tgpx\napplication/gxf\t\t\t\t\tgxf\napplication/hyperstudio\t\t\t\tstk\napplication/inkml+xml\t\t\t\tink inkml\napplication/ipfix\t\t\t\tipfix\napplication/java-archive\t\t\tjar\napplication/java-serialized-object\t\tser\napplication/java-vm\t\t\t\tclass\napplication/javascript\t\t\t\tjs\napplication/json\t\t\t\tjson map\napplication/jsonml+json\t\t\t\tjsonml\napplication/lost+xml\t\t\t\tlostxml\napplication/mac-binhex40\t\t\thqx\napplication/mac-compactpro\t\t\tcpt\napplication/mads+xml\t\t\t\tmads\napplication/marc\t\t\t\tmrc\napplication/marcxml+xml\t\t\t\tmrcx\napplication/mathematica\t\t\t\tma nb mb\napplication/mathml+xml\t\t\t\tmathml\napplication/mbox\t\t\t\tmbox\napplication/mediaservercontrol+xml\t\tmscml\napplication/metalink+xml\t\t\tmetalink\napplication/metalink4+xml\t\t\tmeta4\napplication/mets+xml\t\t\t\tmets\napplication/mods+xml\t\t\t\tmods\napplication/mp21\t\t\t\tm21 mp21\napplication/mp4\t\t\t\t\tmp4s\napplication/msword\t\t\t\tdoc dot\napplication/mxf\t\t\t\t\tmxf\napplication/octet-stream\tbin dms lrf mar so dist distz pkg bpk dump elc deploy\napplication/oda\t\t\t\t\toda\napplication/oebps-package+xml\t\t\topf\napplication/ogg\t\t\t\t\togx\napplication/omdoc+xml\t\t\t\tomdoc\napplication/onenote\t\t\t\tonetoc onetoc2 onetmp onepkg\napplication/oxps\t\t\t\toxps\napplication/patch-ops-error+xml\t\t\txer\napplication/pdf\t\t\t\t\tpdf\napplication/pgp-encrypted\t\t\tpgp\napplication/pgp-signature\t\t\tasc sig\napplication/pics-rules\t\t\t\tprf\napplication/pkcs10\t\t\t\tp10\napplication/pkcs7-mime\t\t\t\tp7m p7c\napplication/pkcs7-signature\t\t\tp7s\napplication/pkcs8\t\t\t\tp8\napplication/pkix-attr-cert\t\t\tac\napplication/pkix-cert\t\t\t\tcer\napplication/pkix-crl\t\t\t\tcrl\napplication/pkix-pkipath\t\t\tpkipath\napplication/pkixcmp\t\t\t\tpki\napplication/pls+xml\t\t\t\tpls\napplication/postscript\t\t\t\tai eps ps\napplication/prs.cww\t\t\t\tcww\napplication/pskc+xml\t\t\t\tpskcxml\napplication/rdf+xml\t\t\t\trdf\napplication/reginfo+xml\t\t\t\trif\napplication/relax-ng-compact-syntax\t\trnc\napplication/resource-lists+xml\t\t\trl\napplication/resource-lists-diff+xml\t\trld\napplication/rls-services+xml\t\t\trs\napplication/rpki-ghostbusters\t\t\tgbr\napplication/rpki-manifest\t\t\tmft\napplication/rpki-roa\t\t\t\troa\napplication/rsd+xml\t\t\t\trsd\napplication/rss+xml\t\t\t\trss\napplication/rtf\t\t\t\t\trtf\napplication/sbml+xml\t\t\t\tsbml\napplication/scvp-cv-request\t\t\tscq\napplication/scvp-cv-response\t\t\tscs\napplication/scvp-vp-request\t\t\tspq\napplication/scvp-vp-response\t\t\tspp\napplication/sdp\t\t\t\t\tsdp\napplication/set-payment-initiation\t\tsetpay\napplication/set-registration-initiation\t\tsetreg\napplication/shf+xml\t\t\t\tshf\napplication/smil+xml\t\t\t\tsmi smil\napplication/sparql-query\t\t\trq\napplication/sparql-results+xml\t\t\tsrx\napplication/srgs\t\t\t\tgram\napplication/srgs+xml\t\t\t\tgrxml\napplication/sru+xml\t\t\t\tsru\napplication/ssdl+xml\t\t\t\tssdl\napplication/ssml+xml\t\t\t\tssml\napplication/tei+xml\t\t\t\ttei teicorpus\napplication/thraud+xml\t\t\t\ttfi\napplication/timestamped-data\t\t\ttsd\napplication/vnd.3gpp.pic-bw-large\t\tplb\napplication/vnd.3gpp.pic-bw-small\t\tpsb\napplication/vnd.3gpp.pic-bw-var\t\t\tpvb\napplication/vnd.3gpp2.tcap\t\t\ttcap\napplication/vnd.3m.post-it-notes\t\tpwn\napplication/vnd.accpac.simply.aso\t\taso\napplication/vnd.accpac.simply.imp\t\timp\napplication/vnd.acucobol\t\t\tacu\napplication/vnd.acucorp\t\t\t\tatc acutc\napplication/vnd.adobe.air-application-installer-package+zip\tair\napplication/vnd.adobe.formscentral.fcdt\t\tfcdt\napplication/vnd.adobe.fxp\t\t\tfxp fxpl\napplication/vnd.adobe.xdp+xml\t\t\txdp\napplication/vnd.adobe.xfdf\t\t\txfdf\napplication/vnd.ahead.space\t\t\tahead\napplication/vnd.airzip.filesecure.azf\t\tazf\napplication/vnd.airzip.filesecure.azs\t\tazs\napplication/vnd.amazon.ebook\t\t\tazw\napplication/vnd.americandynamics.acc\t\tacc\napplication/vnd.amiga.ami\t\t\tami\napplication/vnd.android.package-archive\t\tapk\napplication/vnd.anser-web-certificate-issue-initiation\tcii\napplication/vnd.anser-web-funds-transfer-initiation\tfti\napplication/vnd.antix.game-component\t\tatx\napplication/vnd.apple.installer+xml\t\tmpkg\napplication/vnd.apple.mpegurl\t\t\tm3u8\napplication/vnd.aristanetworks.swi\t\tswi\napplication/vnd.astraea-software.iota\t\tiota\napplication/vnd.audiograph\t\t\taep\napplication/vnd.blueice.multipass\t\tmpm\napplication/vnd.bmi\t\t\t\tbmi\napplication/vnd.businessobjects\t\t\trep\napplication/vnd.chemdraw+xml\t\t\tcdxml\napplication/vnd.chipnuts.karaoke-mmd\t\tmmd\napplication/vnd.cinderella\t\t\tcdy\napplication/vnd.claymore\t\t\tcla\napplication/vnd.cloanto.rp9\t\t\trp9\napplication/vnd.clonk.c4group\t\t\tc4g c4d c4f c4p c4u\napplication/vnd.cluetrust.cartomobile-config\t\tc11amc\napplication/vnd.cluetrust.cartomobile-config-pkg\tc11amz\napplication/vnd.commonspace\t\t\tcsp\napplication/vnd.contact.cmsg\t\t\tcdbcmsg\napplication/vnd.cosmocaller\t\t\tcmc\napplication/vnd.crick.clicker\t\t\tclkx\napplication/vnd.crick.clicker.keyboard\t\tclkk\napplication/vnd.crick.clicker.palette\t\tclkp\napplication/vnd.crick.clicker.template\t\tclkt\napplication/vnd.crick.clicker.wordbank\t\tclkw\napplication/vnd.criticaltools.wbs+xml\t\twbs\napplication/vnd.ctc-posml\t\t\tpml\napplication/vnd.cups-ppd\t\t\tppd\napplication/vnd.curl.car\t\t\tcar\napplication/vnd.curl.pcurl\t\t\tpcurl\napplication/vnd.dart\t\t\t\tdart\napplication/vnd.data-vision.rdz\t\t\trdz\napplication/vnd.dece.data\t\t\tuvf uvvf uvd uvvd\napplication/vnd.dece.ttml+xml\t\t\tuvt uvvt\napplication/vnd.dece.unspecified\t\tuvx uvvx\napplication/vnd.dece.zip\t\t\tuvz uvvz\napplication/vnd.denovo.fcselayout-link\t\tfe_launch\napplication/vnd.dna\t\t\t\tdna\napplication/vnd.dolby.mlp\t\t\tmlp\napplication/vnd.dpgraph\t\t\t\tdpg\napplication/vnd.dreamfactory\t\t\tdfac\napplication/vnd.ds-keypoint\t\t\tkpxx\napplication/vnd.dvb.ait\t\t\t\tait\napplication/vnd.dvb.service\t\t\tsvc\napplication/vnd.dynageo\t\t\t\tgeo\napplication/vnd.ecowin.chart\t\t\tmag\napplication/vnd.enliven\t\t\t\tnml\napplication/vnd.epson.esf\t\t\tesf\napplication/vnd.epson.msf\t\t\tmsf\napplication/vnd.epson.quickanime\t\tqam\napplication/vnd.epson.salt\t\t\tslt\napplication/vnd.epson.ssf\t\t\tssf\napplication/vnd.eszigno3+xml\t\t\tes3 et3\napplication/vnd.ezpix-album\t\t\tez2\napplication/vnd.ezpix-package\t\t\tez3\napplication/vnd.fdf\t\t\t\tfdf\napplication/vnd.fdsn.mseed\t\t\tmseed\napplication/vnd.fdsn.seed\t\t\tseed dataless\napplication/vnd.flographit\t\t\tgph\napplication/vnd.fluxtime.clip\t\t\tftc\napplication/vnd.framemaker\t\t\tfm frame maker book\napplication/vnd.frogans.fnc\t\t\tfnc\napplication/vnd.frogans.ltf\t\t\tltf\napplication/vnd.fsc.weblaunch\t\t\tfsc\napplication/vnd.fujitsu.oasys\t\t\toas\napplication/vnd.fujitsu.oasys2\t\t\toa2\napplication/vnd.fujitsu.oasys3\t\t\toa3\napplication/vnd.fujitsu.oasysgp\t\t\tfg5\napplication/vnd.fujitsu.oasysprs\t\tbh2\napplication/vnd.fujixerox.ddd\t\t\tddd\napplication/vnd.fujixerox.docuworks\t\txdw\napplication/vnd.fujixerox.docuworks.binder\txbd\napplication/vnd.fuzzysheet\t\t\tfzs\napplication/vnd.genomatix.tuxedo\t\ttxd\napplication/vnd.geogebra.file\t\t\tggb\napplication/vnd.geogebra.tool\t\t\tggt\napplication/vnd.geometry-explorer\t\tgex gre\napplication/vnd.geonext\t\t\t\tgxt\napplication/vnd.geoplan\t\t\t\tg2w\napplication/vnd.geospace\t\t\tg3w\napplication/vnd.gmx\t\t\t\tgmx\napplication/vnd.google-earth.kml+xml\t\tkml\napplication/vnd.google-earth.kmz\t\tkmz\napplication/vnd.grafeq\t\t\t\tgqf gqs\napplication/vnd.groove-account\t\t\tgac\napplication/vnd.groove-help\t\t\tghf\napplication/vnd.groove-identity-message\t\tgim\napplication/vnd.groove-injector\t\t\tgrv\napplication/vnd.groove-tool-message\t\tgtm\napplication/vnd.groove-tool-template\t\ttpl\napplication/vnd.groove-vcard\t\t\tvcg\napplication/vnd.hal+xml\t\t\t\thal\napplication/vnd.handheld-entertainment+xml\tzmm\napplication/vnd.hbci\t\t\t\thbci\napplication/vnd.hhe.lesson-player\t\tles\napplication/vnd.hp-hpgl\t\t\t\thpgl\napplication/vnd.hp-hpid\t\t\t\thpid\napplication/vnd.hp-hps\t\t\t\thps\napplication/vnd.hp-jlyt\t\t\t\tjlt\napplication/vnd.hp-pcl\t\t\t\tpcl\napplication/vnd.hp-pclxl\t\t\tpclxl\napplication/vnd.hydrostatix.sof-data\t\tsfd-hdstx\napplication/vnd.ibm.minipay\t\t\tmpy\napplication/vnd.ibm.modcap\t\t\tafp listafp list3820\napplication/vnd.ibm.rights-management\t\tirm\napplication/vnd.ibm.secure-container\t\tsc\napplication/vnd.iccprofile\t\t\ticc icm\napplication/vnd.igloader\t\t\tigl\napplication/vnd.immervision-ivp\t\t\tivp\napplication/vnd.immervision-ivu\t\t\tivu\napplication/vnd.insors.igm\t\t\tigm\napplication/vnd.intercon.formnet\t\txpw xpx\napplication/vnd.intergeo\t\t\ti2g\napplication/vnd.intu.qbo\t\t\tqbo\napplication/vnd.intu.qfx\t\t\tqfx\napplication/vnd.ipunplugged.rcprofile\t\trcprofile\napplication/vnd.irepository.package+xml\t\tirp\napplication/vnd.is-xpr\t\t\t\txpr\napplication/vnd.isac.fcs\t\t\tfcs\napplication/vnd.jam\t\t\t\tjam\napplication/vnd.jcp.javame.midlet-rms\t\trms\napplication/vnd.jisp\t\t\t\tjisp\napplication/vnd.joost.joda-archive\t\tjoda\napplication/vnd.kahootz\t\t\t\tktz ktr\napplication/vnd.kde.karbon\t\t\tkarbon\napplication/vnd.kde.kchart\t\t\tchrt\napplication/vnd.kde.kformula\t\t\tkfo\napplication/vnd.kde.kivio\t\t\tflw\napplication/vnd.kde.kontour\t\t\tkon\napplication/vnd.kde.kpresenter\t\t\tkpr kpt\napplication/vnd.kde.kspread\t\t\tksp\napplication/vnd.kde.kword\t\t\tkwd kwt\napplication/vnd.kenameaapp\t\t\thtke\napplication/vnd.kidspiration\t\t\tkia\napplication/vnd.kinar\t\t\t\tkne knp\napplication/vnd.koan\t\t\t\tskp skd skt skm\napplication/vnd.kodak-descriptor\t\tsse\napplication/vnd.las.las+xml\t\t\tlasxml\napplication/vnd.llamagraphics.life-balance.desktop\tlbd\napplication/vnd.llamagraphics.life-balance.exchange+xml\tlbe\napplication/vnd.lotus-1-2-3\t\t\t123\napplication/vnd.lotus-approach\t\t\tapr\napplication/vnd.lotus-freelance\t\t\tpre\napplication/vnd.lotus-notes\t\t\tnsf\napplication/vnd.lotus-organizer\t\t\torg\napplication/vnd.lotus-screencam\t\t\tscm\napplication/vnd.lotus-wordpro\t\t\tlwp\napplication/vnd.macports.portpkg\t\tportpkg\napplication/vnd.mcd\t\t\t\tmcd\napplication/vnd.medcalcdata\t\t\tmc1\napplication/vnd.mediastation.cdkey\t\tcdkey\napplication/vnd.mfer\t\t\t\tmwf\napplication/vnd.mfmp\t\t\t\tmfm\napplication/vnd.micrografx.flo\t\t\tflo\napplication/vnd.micrografx.igx\t\t\tigx\napplication/vnd.mif\t\t\t\tmif\napplication/vnd.mobius.daf\t\t\tdaf\napplication/vnd.mobius.dis\t\t\tdis\napplication/vnd.mobius.mbk\t\t\tmbk\napplication/vnd.mobius.mqy\t\t\tmqy\napplication/vnd.mobius.msl\t\t\tmsl\napplication/vnd.mobius.plc\t\t\tplc\napplication/vnd.mobius.txf\t\t\ttxf\napplication/vnd.mophun.application\t\tmpn\napplication/vnd.mophun.certificate\t\tmpc\napplication/vnd.mozilla.xul+xml\t\t\txul\napplication/vnd.ms-artgalry\t\t\tcil\napplication/vnd.ms-cab-compressed\t\tcab\napplication/vnd.ms-excel\t\t\txls xlm xla xlc xlt xlw\napplication/vnd.ms-excel.addin.macroenabled.12\t\txlam\napplication/vnd.ms-excel.sheet.binary.macroenabled.12\txlsb\napplication/vnd.ms-excel.sheet.macroenabled.12\t\txlsm\napplication/vnd.ms-excel.template.macroenabled.12\txltm\napplication/vnd.ms-fontobject\t\t\teot\napplication/vnd.ms-htmlhelp\t\t\tchm\napplication/vnd.ms-ims\t\t\t\tims\napplication/vnd.ms-lrm\t\t\t\tlrm\napplication/vnd.ms-officetheme\t\t\tthmx\napplication/vnd.ms-pki.seccat\t\t\tcat\napplication/vnd.ms-pki.stl\t\t\tstl\napplication/vnd.ms-powerpoint\t\t\tppt pps pot\napplication/vnd.ms-powerpoint.addin.macroenabled.12\t\tppam\napplication/vnd.ms-powerpoint.presentation.macroenabled.12\tpptm\napplication/vnd.ms-powerpoint.slide.macroenabled.12\t\tsldm\napplication/vnd.ms-powerpoint.slideshow.macroenabled.12\t\tppsm\napplication/vnd.ms-powerpoint.template.macroenabled.12\t\tpotm\napplication/vnd.ms-project\t\t\tmpp mpt\napplication/vnd.ms-word.document.macroenabled.12\tdocm\napplication/vnd.ms-word.template.macroenabled.12\tdotm\napplication/vnd.ms-works\t\t\twps wks wcm wdb\napplication/vnd.ms-wpl\t\t\t\twpl\napplication/vnd.ms-xpsdocument\t\t\txps\napplication/vnd.mseq\t\t\t\tmseq\napplication/vnd.musician\t\t\tmus\napplication/vnd.muvee.style\t\t\tmsty\napplication/vnd.mynfc\t\t\t\ttaglet\napplication/vnd.neurolanguage.nlu\t\tnlu\napplication/vnd.nitf\t\t\t\tntf nitf\napplication/vnd.noblenet-directory\t\tnnd\napplication/vnd.noblenet-sealer\t\t\tnns\napplication/vnd.noblenet-web\t\t\tnnw\napplication/vnd.nokia.n-gage.data\t\tngdat\napplication/vnd.nokia.n-gage.symbian.install\tn-gage\napplication/vnd.nokia.radio-preset\t\trpst\napplication/vnd.nokia.radio-presets\t\trpss\napplication/vnd.novadigm.edm\t\t\tedm\napplication/vnd.novadigm.edx\t\t\tedx\napplication/vnd.novadigm.ext\t\t\text\napplication/vnd.oasis.opendocument.chart\t\todc\napplication/vnd.oasis.opendocument.chart-template\totc\napplication/vnd.oasis.opendocument.database\t\todb\napplication/vnd.oasis.opendocument.formula\t\todf\napplication/vnd.oasis.opendocument.formula-template\todft\napplication/vnd.oasis.opendocument.graphics\t\todg\napplication/vnd.oasis.opendocument.graphics-template\totg\napplication/vnd.oasis.opendocument.image\t\todi\napplication/vnd.oasis.opendocument.image-template\toti\napplication/vnd.oasis.opendocument.presentation\t\todp\napplication/vnd.oasis.opendocument.presentation-template\totp\napplication/vnd.oasis.opendocument.spreadsheet\t\tods\napplication/vnd.oasis.opendocument.spreadsheet-template\tots\napplication/vnd.oasis.opendocument.text\t\t\todt\napplication/vnd.oasis.opendocument.text-master\t\todm\napplication/vnd.oasis.opendocument.text-template\tott\napplication/vnd.oasis.opendocument.text-web\t\toth\napplication/vnd.olpc-sugar\t\t\txo\napplication/vnd.oma.dd2+xml\t\t\tdd2\napplication/vnd.openofficeorg.extension\t\toxt\napplication/vnd.openxmlformats-officedocument.presentationml.presentation\tpptx\napplication/vnd.openxmlformats-officedocument.presentationml.slide\tsldx\napplication/vnd.openxmlformats-officedocument.presentationml.slideshow\tppsx\napplication/vnd.openxmlformats-officedocument.presentationml.template\tpotx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\txlsx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.template\txltx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.document\tdocx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.template\tdotx\napplication/vnd.osgeo.mapguide.package\t\tmgp\napplication/vnd.osgi.dp\t\t\t\tdp\napplication/vnd.osgi.subsystem\t\t\tesa\napplication/vnd.palm\t\t\t\tpdb pqa oprc\napplication/vnd.pawaafile\t\t\tpaw\napplication/vnd.pg.format\t\t\tstr\napplication/vnd.pg.osasli\t\t\tei6\napplication/vnd.picsel\t\t\t\tefif\napplication/vnd.pmi.widget\t\t\twg\napplication/vnd.pocketlearn\t\t\tplf\napplication/vnd.powerbuilder6\t\t\tpbd\napplication/vnd.previewsystems.box\t\tbox\napplication/vnd.proteus.magazine\t\tmgz\napplication/vnd.publishare-delta-tree\t\tqps\napplication/vnd.pvi.ptid1\t\t\tptid\napplication/vnd.quark.quarkxpress\t\tqxd qxt qwd qwt qxl qxb\napplication/vnd.realvnc.bed\t\t\tbed\napplication/vnd.recordare.musicxml\t\tmxl\napplication/vnd.recordare.musicxml+xml\t\tmusicxml\napplication/vnd.rig.cryptonote\t\t\tcryptonote\napplication/vnd.rim.cod\t\t\t\tcod\napplication/vnd.rn-realmedia\t\t\trm\napplication/vnd.rn-realmedia-vbr\t\trmvb\napplication/vnd.route66.link66+xml\t\tlink66\napplication/vnd.sailingtracker.track\t\tst\napplication/vnd.seemail\t\t\t\tsee\napplication/vnd.sema\t\t\t\tsema\napplication/vnd.semd\t\t\t\tsemd\napplication/vnd.semf\t\t\t\tsemf\napplication/vnd.shana.informed.formdata\t\tifm\napplication/vnd.shana.informed.formtemplate\titp\napplication/vnd.shana.informed.interchange\tiif\napplication/vnd.shana.informed.package\t\tipk\napplication/vnd.simtech-mindmapper\t\ttwd twds\napplication/vnd.smaf\t\t\t\tmmf\napplication/vnd.smart.teacher\t\t\tteacher\napplication/vnd.solent.sdkm+xml\t\t\tsdkm sdkd\napplication/vnd.spotfire.dxp\t\t\tdxp\napplication/vnd.spotfire.sfs\t\t\tsfs\napplication/vnd.stardivision.calc\t\tsdc\napplication/vnd.stardivision.draw\t\tsda\napplication/vnd.stardivision.impress\t\tsdd\napplication/vnd.stardivision.math\t\tsmf\napplication/vnd.stardivision.writer\t\tsdw vor\napplication/vnd.stardivision.writer-global\tsgl\napplication/vnd.stepmania.package\t\tsmzip\napplication/vnd.stepmania.stepchart\t\tsm\napplication/vnd.sun.xml.calc\t\t\tsxc\napplication/vnd.sun.xml.calc.template\t\tstc\napplication/vnd.sun.xml.draw\t\t\tsxd\napplication/vnd.sun.xml.draw.template\t\tstd\napplication/vnd.sun.xml.impress\t\t\tsxi\napplication/vnd.sun.xml.impress.template\tsti\napplication/vnd.sun.xml.math\t\t\tsxm\napplication/vnd.sun.xml.writer\t\t\tsxw\napplication/vnd.sun.xml.writer.global\t\tsxg\napplication/vnd.sun.xml.writer.template\t\tstw\napplication/vnd.sus-calendar\t\t\tsus susp\napplication/vnd.svd\t\t\t\tsvd\napplication/vnd.symbian.install\t\t\tsis sisx\napplication/vnd.syncml+xml\t\t\txsm\napplication/vnd.syncml.dm+wbxml\t\t\tbdm\napplication/vnd.syncml.dm+xml\t\t\txdm\napplication/vnd.tao.intent-module-archive\ttao\napplication/vnd.tcpdump.pcap\t\t\tpcap cap dmp\napplication/vnd.tmobile-livetv\t\t\ttmo\napplication/vnd.trid.tpt\t\t\ttpt\napplication/vnd.triscape.mxs\t\t\tmxs\napplication/vnd.trueapp\t\t\t\ttra\napplication/vnd.ufdl\t\t\t\tufd ufdl\napplication/vnd.uiq.theme\t\t\tutz\napplication/vnd.umajin\t\t\t\tumj\napplication/vnd.unity\t\t\t\tunityweb\napplication/vnd.uoml+xml\t\t\tuoml\napplication/vnd.vcx\t\t\t\tvcx\napplication/vnd.visio\t\t\t\tvsd vst vss vsw\napplication/vnd.visionary\t\t\tvis\napplication/vnd.vsf\t\t\t\tvsf\napplication/vnd.wap.wbxml\t\t\twbxml\napplication/vnd.wap.wmlc\t\t\twmlc\napplication/vnd.wap.wmlscriptc\t\t\twmlsc\napplication/vnd.webturbo\t\t\twtb\napplication/vnd.wolfram.player\t\t\tnbp\napplication/vnd.wordperfect\t\t\twpd\napplication/vnd.wqd\t\t\t\twqd\napplication/vnd.wt.stf\t\t\t\tstf\napplication/vnd.xara\t\t\t\txar\napplication/vnd.xfdl\t\t\t\txfdl\napplication/vnd.yamaha.hv-dic\t\t\thvd\napplication/vnd.yamaha.hv-script\t\thvs\napplication/vnd.yamaha.hv-voice\t\t\thvp\napplication/vnd.yamaha.openscoreformat\t\t\tosf\napplication/vnd.yamaha.openscoreformat.osfpvg+xml\tosfpvg\napplication/vnd.yamaha.smaf-audio\t\tsaf\napplication/vnd.yamaha.smaf-phrase\t\tspf\napplication/vnd.yellowriver-custom-menu\t\tcmp\napplication/vnd.zul\t\t\t\tzir zirz\napplication/vnd.zzazz.deck+xml\t\t\tzaz\napplication/voicexml+xml\t\t\tvxml\napplication/wasm\t\t\t\twasm\napplication/widget\t\t\t\twgt\napplication/winhlp\t\t\t\thlp\napplication/wsdl+xml\t\t\t\twsdl\napplication/wspolicy+xml\t\t\twspolicy\napplication/x-7z-compressed\t\t\t7z\napplication/x-abiword\t\t\t\tabw\napplication/x-ace-compressed\t\t\tace\napplication/x-apple-diskimage\t\t\tdmg\napplication/x-authorware-bin\t\t\taab x32 u32 vox\napplication/x-authorware-map\t\t\taam\napplication/x-authorware-seg\t\t\taas\napplication/x-bcpio\t\t\t\tbcpio\napplication/x-bittorrent\t\t\ttorrent\napplication/x-blorb\t\t\t\tblb blorb\napplication/x-bzip\t\t\t\tbz\napplication/x-bzip2\t\t\t\tbz2 boz\napplication/x-cbr\t\t\t\tcbr cba cbt cbz cb7\napplication/x-cdlink\t\t\t\tvcd\napplication/x-cfs-compressed\t\t\tcfs\napplication/x-chat\t\t\t\tchat\napplication/x-chess-pgn\t\t\t\tpgn\napplication/x-conference\t\t\tnsc\napplication/x-cpio\t\t\t\tcpio\napplication/x-csh\t\t\t\tcsh\napplication/x-debian-package\t\t\tdeb udeb\napplication/x-dgc-compressed\t\t\tdgc\napplication/x-director\t\t\tdir dcr dxr cst cct cxt w3d fgd swa\napplication/x-doom\t\t\t\twad\napplication/x-dtbncx+xml\t\t\tncx\napplication/x-dtbook+xml\t\t\tdtb\napplication/x-dtbresource+xml\t\t\tres\napplication/x-dvi\t\t\t\tdvi\napplication/x-envoy\t\t\t\tevy\napplication/x-eva\t\t\t\teva\napplication/x-font-bdf\t\t\t\tbdf\napplication/x-font-ghostscript\t\t\tgsf\napplication/x-font-linux-psf\t\t\tpsf\napplication/x-font-pcf\t\t\t\tpcf\napplication/x-font-snf\t\t\t\tsnf\napplication/x-font-type1\t\t\tpfa pfb pfm afm\napplication/x-freearc\t\t\t\tarc\napplication/x-futuresplash\t\t\tspl\napplication/x-gca-compressed\t\t\tgca\napplication/x-glulx\t\t\t\tulx\napplication/x-gnumeric\t\t\t\tgnumeric\napplication/x-gramps-xml\t\t\tgramps\napplication/x-gtar\t\t\t\tgtar\napplication/x-hdf\t\t\t\thdf\napplication/x-install-instructions\t\tinstall\napplication/x-iso9660-image\t\t\tiso\napplication/x-java-jnlp-file\t\t\tjnlp\napplication/x-latex\t\t\t\tlatex\napplication/x-lzh-compressed\t\t\tlzh lha\napplication/x-mie\t\t\t\tmie\napplication/x-mobipocket-ebook\t\t\tprc mobi\napplication/x-ms-application\t\t\tapplication\napplication/x-ms-shortcut\t\t\tlnk\napplication/x-ms-wmd\t\t\t\twmd\napplication/x-ms-wmz\t\t\t\twmz\napplication/x-ms-xbap\t\t\t\txbap\napplication/x-msaccess\t\t\t\tmdb\napplication/x-msbinder\t\t\t\tobd\napplication/x-mscardfile\t\t\tcrd\napplication/x-msclip\t\t\t\tclp\napplication/x-msdownload\t\t\texe dll com bat msi\napplication/x-msmediaview\t\t\tmvb m13 m14\napplication/x-msmetafile\t\t\twmf wmz emf emz\napplication/x-msmoney\t\t\t\tmny\napplication/x-mspublisher\t\t\tpub\napplication/x-msschedule\t\t\tscd\napplication/x-msterminal\t\t\ttrm\napplication/x-mswrite\t\t\t\twri\napplication/x-netcdf\t\t\t\tnc cdf\napplication/x-nzb\t\t\t\tnzb\napplication/x-pkcs12\t\t\t\tp12 pfx\napplication/x-pkcs7-certificates\t\tp7b spc\napplication/x-pkcs7-certreqresp\t\t\tp7r\napplication/x-rar-compressed\t\t\trar\napplication/x-research-info-systems\t\tris\napplication/x-sh\t\t\t\tsh\napplication/x-shar\t\t\t\tshar\napplication/x-shockwave-flash\t\t\tswf\napplication/x-silverlight-app\t\t\txap\napplication/x-sql\t\t\t\tsql\napplication/x-stuffit\t\t\t\tsit\napplication/x-stuffitx\t\t\t\tsitx\napplication/x-subrip\t\t\t\tsrt\napplication/x-sv4cpio\t\t\t\tsv4cpio\napplication/x-sv4crc\t\t\t\tsv4crc\napplication/x-t3vm-image\t\t\tt3\napplication/x-tads\t\t\t\tgam\napplication/x-tar\t\t\t\ttar\napplication/x-tcl\t\t\t\ttcl\napplication/x-tex\t\t\t\ttex\napplication/x-tex-tfm\t\t\t\ttfm\napplication/x-texinfo\t\t\t\ttexinfo texi\napplication/x-tgif\t\t\t\tobj\napplication/x-ustar\t\t\t\tustar\napplication/x-wais-source\t\t\tsrc\napplication/x-x509-ca-cert\t\t\tder crt\napplication/x-xfig\t\t\t\tfig\napplication/x-xliff+xml\t\t\t\txlf\napplication/x-xpinstall\t\t\t\txpi\napplication/x-xz\t\t\t\txz\napplication/x-zmachine\t\t\t\tz1 z2 z3 z4 z5 z6 z7 z8\napplication/xaml+xml\t\t\t\txaml\napplication/xcap-diff+xml\t\t\txdf\napplication/xenc+xml\t\t\t\txenc\napplication/xhtml+xml\t\t\t\txhtml xht\napplication/xml\t\t\t\t\txml xsl\napplication/xml-dtd\t\t\t\tdtd\napplication/xop+xml\t\t\t\txop\napplication/xproc+xml\t\t\t\txpl\napplication/xslt+xml\t\t\t\txslt\napplication/xspf+xml\t\t\t\txspf\napplication/xv+xml\t\t\t\tmxml xhvml xvml xvm\napplication/yang\t\t\t\tyang\napplication/yin+xml\t\t\t\tyin\napplication/zip\t\t\t\t\tzip\naudio/adpcm\t\t\t\t\tadp\naudio/basic\t\t\t\t\tau snd\naudio/midi\t\t\t\t\tmid midi kar rmi\naudio/mp4\t\t\t\t\tm4a mp4a\naudio/mpeg\t\t\t\t\tmpga mp2 mp2a mp3 m2a m3a\naudio/ogg\t\t\t\t\toga ogg spx\naudio/s3m\t\t\t\t\ts3m\naudio/silk\t\t\t\t\tsil\naudio/vnd.dece.audio\t\t\t\tuva uvva\naudio/vnd.digital-winds\t\t\t\teol\naudio/vnd.dra\t\t\t\t\tdra\naudio/vnd.dts\t\t\t\t\tdts\naudio/vnd.dts.hd\t\t\t\tdtshd\naudio/vnd.lucent.voice\t\t\t\tlvp\naudio/vnd.ms-playready.media.pya\t\tpya\naudio/vnd.nuera.ecelp4800\t\t\tecelp4800\naudio/vnd.nuera.ecelp7470\t\t\tecelp7470\naudio/vnd.nuera.ecelp9600\t\t\tecelp9600\naudio/vnd.rip\t\t\t\t\trip\naudio/webm\t\t\t\t\tweba\naudio/x-aac\t\t\t\t\taac\naudio/x-aiff\t\t\t\t\taif aiff aifc\naudio/x-caf\t\t\t\t\tcaf\naudio/x-flac\t\t\t\t\tflac\naudio/x-matroska\t\t\t\tmka\naudio/x-mpegurl\t\t\t\t\tm3u\naudio/x-ms-wax\t\t\t\t\twax\naudio/x-ms-wma\t\t\t\t\twma\naudio/x-pn-realaudio\t\t\t\tram ra\naudio/x-pn-realaudio-plugin\t\t\trmp\naudio/x-wav\t\t\t\t\twav\naudio/xm\t\t\t\t\txm\nchemical/x-cdx\t\t\t\t\tcdx\nchemical/x-cif\t\t\t\t\tcif\nchemical/x-cmdf\t\t\t\t\tcmdf\nchemical/x-cml\t\t\t\t\tcml\nchemical/x-csml\t\t\t\t\tcsml\nchemical/x-xyz\t\t\t\t\txyz\nfont/collection\t\t\t\t\tttc\nfont/otf\t\t\t\t\totf\nfont/ttf\t\t\t\t\tttf\nfont/woff\t\t\t\t\twoff\nfont/woff2\t\t\t\t\twoff2\nimage/bmp\t\t\t\t\tbmp\nimage/cgm\t\t\t\t\tcgm\nimage/g3fax\t\t\t\t\tg3\nimage/gif\t\t\t\t\tgif\nimage/ief\t\t\t\t\tief\nimage/jpeg\t\t\t\t\tjpeg jpg jpe\nimage/ktx\t\t\t\t\tktx\nimage/png\t\t\t\t\tpng\nimage/prs.btif\t\t\t\t\tbtif\nimage/sgi\t\t\t\t\tsgi\nimage/svg+xml\t\t\t\t\tsvg svgz\nimage/tiff\t\t\t\t\ttiff tif\nimage/vnd.adobe.photoshop\t\t\tpsd\nimage/vnd.dece.graphic\t\t\t\tuvi uvvi uvg uvvg\nimage/vnd.djvu\t\t\t\t\tdjvu djv\nimage/vnd.dvb.subtitle\t\t\t\tsub\nimage/vnd.dwg\t\t\t\t\tdwg\nimage/vnd.dxf\t\t\t\t\tdxf\nimage/vnd.fastbidsheet\t\t\t\tfbs\nimage/vnd.fpx\t\t\t\t\tfpx\nimage/vnd.fst\t\t\t\t\tfst\nimage/vnd.fujixerox.edmics-mmr\t\t\tmmr\nimage/vnd.fujixerox.edmics-rlc\t\t\trlc\nimage/vnd.ms-modi\t\t\t\tmdi\nimage/vnd.ms-photo\t\t\t\twdp\nimage/vnd.net-fpx\t\t\t\tnpx\nimage/vnd.wap.wbmp\t\t\t\twbmp\nimage/vnd.xiff\t\t\t\t\txif\nimage/webp\t\t\t\t\twebp\nimage/x-3ds\t\t\t\t\t3ds\nimage/x-cmu-raster\t\t\t\tras\nimage/x-cmx\t\t\t\t\tcmx\nimage/x-freehand\t\t\t\tfh fhc fh4 fh5 fh7\nimage/x-icon\t\t\t\t\tico\nimage/x-mrsid-image\t\t\t\tsid\nimage/x-pcx\t\t\t\t\tpcx\nimage/x-pict\t\t\t\t\tpic pct\nimage/x-portable-anymap\t\t\t\tpnm\nimage/x-portable-bitmap\t\t\t\tpbm\nimage/x-portable-graymap\t\t\tpgm\nimage/x-portable-pixmap\t\t\t\tppm\nimage/x-rgb\t\t\t\t\trgb\nimage/x-tga\t\t\t\t\ttga\nimage/x-xbitmap\t\t\t\t\txbm\nimage/x-xpixmap\t\t\t\t\txpm\nimage/x-xwindowdump\t\t\t\txwd\nmessage/rfc822\t\t\t\t\teml mime\nmodel/iges\t\t\t\t\tigs iges\nmodel/mesh\t\t\t\t\tmsh mesh silo\nmodel/vnd.collada+xml\t\t\t\tdae\nmodel/vnd.dwf\t\t\t\t\tdwf\nmodel/vnd.gdl\t\t\t\t\tgdl\nmodel/vnd.gtw\t\t\t\t\tgtw\nmodel/vnd.mts\t\t\t\t\tmts\nmodel/vnd.vtu\t\t\t\t\tvtu\nmodel/vrml\t\t\t\t\twrl vrml\nmodel/x3d+binary\t\t\t\tx3db x3dbz\nmodel/x3d+vrml\t\t\t\t\tx3dv x3dvz\nmodel/x3d+xml\t\t\t\t\tx3d x3dz\ntext/cache-manifest\t\t\t\tappcache\ntext/calendar\t\t\t\t\tics ifb\ntext/css\t\t\t\t\tcss\ntext/csv\t\t\t\t\tcsv\ntext/html\t\t\t\t\thtml htm\ntext/n3\t\t\t\t\t\tn3\ntext/plain\t\t\t\t\ttxt text conf def list log in\ntext/prs.lines.tag\t\t\t\tdsc\ntext/richtext\t\t\t\t\trtx\ntext/sgml\t\t\t\t\tsgml sgm\ntext/tab-separated-values\t\t\ttsv\ntext/troff\t\t\t\t\tt tr roff man me ms\ntext/turtle\t\t\t\t\tttl\ntext/uri-list\t\t\t\t\turi uris urls\ntext/vcard\t\t\t\t\tvcard\ntext/vnd.curl\t\t\t\t\tcurl\ntext/vnd.curl.dcurl\t\t\t\tdcurl\ntext/vnd.curl.mcurl\t\t\t\tmcurl\ntext/vnd.curl.scurl\t\t\t\tscurl\ntext/vnd.dvb.subtitle\t\t\t\tsub\ntext/vnd.fly\t\t\t\t\tfly\ntext/vnd.fmi.flexstor\t\t\t\tflx\ntext/vnd.graphviz\t\t\t\tgv\ntext/vnd.in3d.3dml\t\t\t\t3dml\ntext/vnd.in3d.spot\t\t\t\tspot\ntext/vnd.sun.j2me.app-descriptor\t\tjad\ntext/vnd.wap.wml\t\t\t\twml\ntext/vnd.wap.wmlscript\t\t\t\twmls\ntext/x-asm\t\t\t\t\ts asm\ntext/x-c\t\t\t\t\tc cc cxx cpp h hh dic\ntext/x-fortran\t\t\t\t\tf for f77 f90\ntext/x-java-source\t\t\t\tjava\ntext/x-nfo\t\t\t\t\tnfo\ntext/x-opml\t\t\t\t\topml\ntext/x-pascal\t\t\t\t\tp pas\ntext/x-setext\t\t\t\t\tetx\ntext/x-sfv\t\t\t\t\tsfv\ntext/x-uuencode\t\t\t\t\tuu\ntext/x-vcalendar\t\t\t\tvcs\ntext/x-vcard\t\t\t\t\tvcf\nvideo/3gpp\t\t\t\t\t3gp\nvideo/3gpp2\t\t\t\t\t3g2\nvideo/h261\t\t\t\t\th261\nvideo/h263\t\t\t\t\th263\nvideo/h264\t\t\t\t\th264\nvideo/jpeg\t\t\t\t\tjpgv\nvideo/jpm\t\t\t\t\tjpm jpgm\nvideo/mj2\t\t\t\t\tmj2 mjp2\nvideo/mp4\t\t\t\t\tmp4 mp4v mpg4\nvideo/mpeg\t\t\t\t\tmpeg mpg mpe m1v m2v\nvideo/ogg\t\t\t\t\togv\nvideo/quicktime\t\t\t\t\tqt mov\nvideo/vnd.dece.hd\t\t\t\tuvh uvvh\nvideo/vnd.dece.mobile\t\t\t\tuvm uvvm\nvideo/vnd.dece.pd\t\t\t\tuvp uvvp\nvideo/vnd.dece.sd\t\t\t\tuvs uvvs\nvideo/vnd.dece.video\t\t\t\tuvv uvvv\nvideo/vnd.dvb.file\t\t\t\tdvb\nvideo/vnd.fvt\t\t\t\t\tfvt\nvideo/vnd.mpegurl\t\t\t\tmxu m4u\nvideo/vnd.ms-playready.media.pyv\t\tpyv\nvideo/vnd.uvvu.mp4\t\t\t\tuvu uvvu\nvideo/vnd.vivo\t\t\t\t\tviv\nvideo/webm\t\t\t\t\twebm\nvideo/x-f4v\t\t\t\t\tf4v\nvideo/x-fli\t\t\t\t\tfli\nvideo/x-flv\t\t\t\t\tflv\nvideo/x-m4v\t\t\t\t\tm4v\nvideo/x-matroska\t\t\t\tmkv mk3d mks\nvideo/x-mng\t\t\t\t\tmng\nvideo/x-ms-asf\t\t\t\t\tasf asx\nvideo/x-ms-vob\t\t\t\t\tvob\nvideo/x-ms-wm\t\t\t\t\twm\nvideo/x-ms-wmv\t\t\t\t\twmv\nvideo/x-ms-wmx\t\t\t\t\twmx\nvideo/x-ms-wvx\t\t\t\t\twvx\nvideo/x-msvideo\t\t\t\t\tavi\nvideo/x-sgi-movie\t\t\t\tmovie\nvideo/x-smv\t\t\t\t\tsmv\nx-conference/x-cooltalk\t\t\t\tice\n";

const map = new Map();

mime_raw.split('\n').forEach((row) => {
	const match = /(.+?)\t+(.+)/.exec(row);
	if (!match) return;

	const type = match[1];
	const extensions = match[2].split(' ');

	extensions.forEach(ext => {
		map.set(ext, type);
	});
});

function lookup$2(file) {
	const match = /\.([^\.]+)$/.exec(file);
	return match && map.get(match[1]);
}

function middleware(opts


 = {}) {
	const { session, ignore } = opts;

	let emitted_basepath = false;

	return compose_handlers(ignore, [
		(req, res, next) => {
			if (req.baseUrl === undefined) {
				let { originalUrl } = req;
				if (req.url === '/' && originalUrl[originalUrl.length - 1] !== '/') {
					originalUrl += '/';
				}

				req.baseUrl = originalUrl
					? originalUrl.slice(0, -req.url.length)
					: '';
			}

			if (!emitted_basepath && process.send) {
				process.send({
					__sapper__: true,
					event: 'basepath',
					basepath: req.baseUrl
				});

				emitted_basepath = true;
			}

			if (req.path === undefined) {
				req.path = req.url.replace(/\?.*/, '');
			}

			next();
		},

		fs__default.existsSync(path__default.join(build_dir, 'service-worker.js')) && serve({
			pathname: '/service-worker.js',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		fs__default.existsSync(path__default.join(build_dir, 'service-worker.js.map')) && serve({
			pathname: '/service-worker.js.map',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		serve({
			prefix: '/client/',
			cache_control:  'no-cache' 
		}),

		get_server_route_handler(manifest.server_routes),

		get_page_handler(manifest, session || noop$1)
	].filter(Boolean));
}

function compose_handlers(ignore, handlers) {
	const total = handlers.length;

	function nth_handler(n, req, res, next) {
		if (n >= total) {
			return next();
		}

		handlers[n](req, res, () => nth_handler(n+1, req, res, next));
	}

	return !ignore
		? (req, res, next) => nth_handler(0, req, res, next)
		: (req, res, next) => {
			if (should_ignore(req.path, ignore)) {
				next();
			} else {
				nth_handler(0, req, res, next);
			}
		};
}

function should_ignore(uri, val) {
	if (Array.isArray(val)) return val.some(x => should_ignore(uri, x));
	if (val instanceof RegExp) return val.test(uri);
	if (typeof val === 'function') return val(uri);
	return uri.startsWith(val.charCodeAt(0) === 47 ? val : `/${val}`);
}

function serve({ prefix, pathname, cache_control }



) {
	const filter = pathname
		? (req) => req.path === pathname
		: (req) => req.path.startsWith(prefix);

	const read =  (file) => fs__default.readFileSync(path__default.resolve(build_dir, file))
		;

	return (req, res, next) => {
		if (filter(req)) {
			const type = lookup$2(req.path);

			try {
				const file = decodeURIComponent(req.path.slice(1));
				const data = read(file);

				res.setHeader('Content-Type', type);
				res.setHeader('Cache-Control', cache_control);
				res.end(data);
			} catch (err) {
				res.statusCode = 404;
				res.end('not found');
			}
		} else {
			next();
		}
	};
}

function noop$1(){}

const { PORT = 3000 } = process.env;

const app = polka({
	onError: (err, req, res) => {
		const error = err.message || err;
		const code = err.code || err.status || 500;
		res.headersSent || send(res, code, { error });
	}
});

if (process.env.PGHOST) {
	app.use(authenticate());
}

app.use(
	sirv('static', {
		dev: "development" === 'development',
		setHeaders(res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.hasHeader('Cache-Control') || res.setHeader('Cache-Control', 'max-age=600'); // 10min default
		}
	}),

	middleware({
		session: req => ({
			user: sanitize_user(req.user)
		})
	})
);

app.listen(PORT);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcm91dGVzL2V4YW1wbGVzL19leGFtcGxlcy5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvZXhhbXBsZXMvaW5kZXguanNvbi5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvZXhhbXBsZXMvW3NsdWddLmpzb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ29sZGVuLWZsZWVjZS9nb2xkZW4tZmxlZWNlLmVzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzdmVsdGVqcy9zaXRlLWtpdC91dGlscy9tYXJrZG93bi5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvdHV0b3JpYWwvaW5kZXguanNvbi5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvdHV0b3JpYWwvcmFuZG9tLW51bWJlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tYmFzaC5qcyIsIi4uLy4uLy4uL3NyYy91dGlscy9oaWdobGlnaHQuanMiLCIuLi8uLi8uLi9zcmMvcm91dGVzL3R1dG9yaWFsL1tzbHVnXS9pbmRleC5qc29uLmpzIiwiLi4vLi4vLi4vc3JjL3V0aWxzL2RiLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9hcHBzL2luZGV4Lmpzb24uanMiLCIuLi8uLi8uLi9zcmMvdXRpbHMvYXV0aC5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYXV0aC9fY29uZmlnLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9hdXRoL2NhbGxiYWNrLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9hdXRoL2xvZ291dC5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYXV0aC9sb2dpbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2guZGVidXJyL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VzY2FwZS1zdHJpbmctcmVnZXhwL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzaW5kcmVzb3JodXMvc2x1Z2lmeS9yZXBsYWNlbWVudHMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHNpbmRyZXNvcmh1cy9zbHVnaWZ5L292ZXJyaWRhYmxlLXJlcGxhY2VtZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ac2luZHJlc29yaHVzL3NsdWdpZnkvaW5kZXguanMiLCIuLi8uLi8uLi9jb25maWcuanMiLCIuLi8uLi8uLi9zcmMvdXRpbHMvc2x1Zy5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYmxvZy9fcG9zdHMuanMiLCIuLi8uLi8uLi9zcmMvcm91dGVzL2Jsb2cvaW5kZXguanNvbi5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYmxvZy9yc3MueG1sLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9ibG9nL1tzbHVnXS5qc29uLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9jaGF0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzdmVsdGVqcy9zaXRlLWtpdC91dGlscy9zbHVnLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9kb2NzL19zZWN0aW9ucy5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvZG9jcy9pbmRleC5qc29uLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9yZXBsL191dGlscy9ib2R5LmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9yZXBsL2NyZWF0ZS5qc29uLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9yZXBsL2xvY2FsL1suLi5maWxlXS5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvcmVwbC9baWRdL2luZGV4Lmpzb24uanMiLCIuLi8uLi8uLi9zcmMvcm91dGVzL2ZhcS5qcyIsIi4uLy4uLy4uL3NyYy9ub2RlX21vZHVsZXMvQHNhcHBlci9pbnRlcm5hbC9tYW5pZmVzdC1zZXJ2ZXIubWpzIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL3NlcnZlci5tanMiLCIuLi8uLi8uLi9zcmMvc2VydmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmxldCBsb29rdXA7XG5jb25zdCB0aXRsZXMgPSBuZXcgTWFwKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZXhhbXBsZXMoKSB7XG5cdGxvb2t1cCA9IG5ldyBNYXAoKTtcblxuXHRyZXR1cm4gZnMucmVhZGRpclN5bmMoYGNvbnRlbnQvZXhhbXBsZXNgKS5tYXAoZ3JvdXBfZGlyID0+IHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGBjb250ZW50L2V4YW1wbGVzLyR7Z3JvdXBfZGlyfS9tZXRhLmpzb25gLCAndXRmLTgnKSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGU6IG1ldGFkYXRhLnRpdGxlLFxuXHRcdFx0ZXhhbXBsZXM6IGZzLnJlYWRkaXJTeW5jKGBjb250ZW50L2V4YW1wbGVzLyR7Z3JvdXBfZGlyfWApLmZpbHRlcihmaWxlID0+IGZpbGUgIT09ICdtZXRhLmpzb24nKS5tYXAoZXhhbXBsZV9kaXIgPT4ge1xuXHRcdFx0XHRjb25zdCBzbHVnID0gZXhhbXBsZV9kaXIucmVwbGFjZSgvXlxcZCstLywgJycpO1xuXG5cdFx0XHRcdGlmIChsb29rdXAuaGFzKHNsdWcpKSB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBleGFtcGxlIHNsdWcgXCIke3NsdWd9XCJgKTtcblx0XHRcdFx0bG9va3VwLnNldChzbHVnLCBgJHtncm91cF9kaXJ9LyR7ZXhhbXBsZV9kaXJ9YCk7XG5cblx0XHRcdFx0Y29uc3QgbWV0YWRhdGEgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhgY29udGVudC9leGFtcGxlcy8ke2dyb3VwX2Rpcn0vJHtleGFtcGxlX2Rpcn0vbWV0YS5qc29uYCwgJ3V0Zi04JykpO1xuXHRcdFx0XHR0aXRsZXMuc2V0KHNsdWcsIG1ldGFkYXRhLnRpdGxlKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHNsdWcsXG5cdFx0XHRcdFx0dGl0bGU6IG1ldGFkYXRhLnRpdGxlXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdH07XG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2V4YW1wbGUoc2x1Zykge1xuXHRpZiAoIWxvb2t1cCB8fCAhbG9va3VwLmhhcyhzbHVnKSkgZ2V0X2V4YW1wbGVzKCk7XG5cblx0Y29uc3QgZGlyID0gbG9va3VwLmdldChzbHVnKTtcblx0Y29uc3QgdGl0bGUgPSB0aXRsZXMuZ2V0KHNsdWcpO1xuXG5cdGlmICghZGlyIHx8ICF0aXRsZSkgcmV0dXJuIG51bGw7XG5cblx0Y29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhgY29udGVudC9leGFtcGxlcy8ke2Rpcn1gKVxuXHRcdC5maWx0ZXIobmFtZSA9PiBuYW1lWzBdICE9PSAnLicgJiYgbmFtZSAhPT0gJ21ldGEuanNvbicpXG5cdFx0Lm1hcChuYW1lID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG5hbWUsXG5cdFx0XHRcdHNvdXJjZTogZnMucmVhZEZpbGVTeW5jKGBjb250ZW50L2V4YW1wbGVzLyR7ZGlyfS8ke25hbWV9YCwgJ3V0Zi04Jylcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0cmV0dXJuIHsgdGl0bGUsIGZpbGVzIH07XG59XG4iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgeyBnZXRfZXhhbXBsZXMgfSBmcm9tICcuL19leGFtcGxlcy5qcyc7XG5cbmxldCBjYWNoZWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQocmVxLCByZXMpIHtcblx0dHJ5IHtcblx0XHRpZiAoIWNhY2hlZCB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG5cdFx0XHRjYWNoZWQgPSBnZXRfZXhhbXBsZXMoKS5maWx0ZXIoc2VjdGlvbiA9PiBzZWN0aW9uLnRpdGxlKTtcblx0XHR9XG5cblx0XHRzZW5kKHJlcywgMjAwLCBjYWNoZWQpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0c2VuZChyZXMsIGUuc3RhdHVzIHx8IDUwMCwge1xuXHRcdFx0bWVzc2FnZTogZS5tZXNzYWdlXG5cdFx0fSk7XG5cdH1cbn1cbiIsImltcG9ydCBzZW5kIGZyb20gJ0Bwb2xrYS9zZW5kJztcbmltcG9ydCB7IGdldF9leGFtcGxlIH0gZnJvbSAnLi9fZXhhbXBsZXMuanMnO1xuXG5jb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xuXHRjb25zdCB7IHNsdWcgfSA9IHJlcS5wYXJhbXM7XG5cblx0bGV0IGV4YW1wbGUgPSBjYWNoZS5nZXQoc2x1Zyk7XG5cblx0aWYgKCFleGFtcGxlIHx8IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcblx0XHRleGFtcGxlID0gZ2V0X2V4YW1wbGUoc2x1Zyk7XG5cdFx0aWYgKGV4YW1wbGUpIGNhY2hlLnNldChzbHVnLCBleGFtcGxlKTtcblx0fVxuXG5cdGlmIChleGFtcGxlKSB7XG5cdFx0c2VuZChyZXMsIDIwMCwgZXhhbXBsZSk7XG5cdH0gZWxzZSB7XG5cdFx0c2VuZChyZXMsIDQwNCwge1xuXHRcdFx0ZXJyb3I6ICdub3QgZm91bmQnXG5cdFx0fSk7XG5cdH1cbn1cbiIsImZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XG5cbnZhciB3aGl0ZXNwYWNlID0gL1xccy87XG52YXIgdmFsaWRJZGVudGlmaWVyQ2hhcmFjdGVycyA9IC9bYS16QS1aXyRdW2EtekEtWjAtOV8kXSovO1xudmFyIGVudGlyZWx5VmFsaWRJZGVudGlmaWVyID0gbmV3IFJlZ0V4cCgnXicgKyB2YWxpZElkZW50aWZpZXJDaGFyYWN0ZXJzLnNvdXJjZSArICckJyk7XG52YXIgbnVtYmVyID0gL15OYU58KD86Wy0rXT8oPzooPzpJbmZpbml0eSl8KD86MFt4WF1bYS1mQS1GMC05XSspfCg/OjBbYkJdWzAxXSspfCg/OjBbb09dWzAtN10rKXwoPzooPzooPzpbMS05XVxcZCp8MCk/XFwuXFxkK3woPzpbMS05XVxcZCp8MClcXC5cXGQqfCg/OlsxLTldXFxkKnwwKSkoPzpbRXxlXVsrfC1dP1xcZCspPykpKS87XG52YXIgU0lOR0xFX1FVT1RFID0gXCInXCI7XG52YXIgRE9VQkxFX1FVT1RFID0gJ1wiJztcbmZ1bmN0aW9uIHNwYWNlcyhuKSB7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIHdoaWxlIChuLS0pXG4gICAgICAgIHJlc3VsdCArPSAnICc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZ2V0TG9jYXRvcihzb3VyY2UsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxuICAgIHZhciBvZmZzZXRMaW5lID0gb3B0aW9ucy5vZmZzZXRMaW5lIHx8IDA7XG4gICAgdmFyIG9mZnNldENvbHVtbiA9IG9wdGlvbnMub2Zmc2V0Q29sdW1uIHx8IDA7XG4gICAgdmFyIG9yaWdpbmFsTGluZXMgPSBzb3VyY2Uuc3BsaXQoJ1xcbicpO1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgdmFyIGxpbmVSYW5nZXMgPSBvcmlnaW5hbExpbmVzLm1hcChmdW5jdGlvbiAobGluZSwgaSkge1xuICAgICAgICB2YXIgZW5kID0gc3RhcnQgKyBsaW5lLmxlbmd0aCArIDE7XG4gICAgICAgIHZhciByYW5nZSA9IHsgc3RhcnQ6IHN0YXJ0LCBlbmQ6IGVuZCwgbGluZTogaSB9O1xuICAgICAgICBzdGFydCA9IGVuZDtcbiAgICAgICAgcmV0dXJuIHJhbmdlO1xuICAgIH0pO1xuICAgIHZhciBpID0gMDtcbiAgICBmdW5jdGlvbiByYW5nZUNvbnRhaW5zKHJhbmdlLCBpbmRleCkge1xuICAgICAgICByZXR1cm4gcmFuZ2Uuc3RhcnQgPD0gaW5kZXggJiYgaW5kZXggPCByYW5nZS5lbmQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldExvY2F0aW9uKHJhbmdlLCBpbmRleCkge1xuICAgICAgICByZXR1cm4geyBsaW5lOiBvZmZzZXRMaW5lICsgcmFuZ2UubGluZSwgY29sdW1uOiBvZmZzZXRDb2x1bW4gKyBpbmRleCAtIHJhbmdlLnN0YXJ0LCBjaGFyYWN0ZXI6IGluZGV4IH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxvY2F0ZShzZWFyY2gsIHN0YXJ0SW5kZXgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZWFyY2ggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzZWFyY2ggPSBzb3VyY2UuaW5kZXhPZihzZWFyY2gsIHN0YXJ0SW5kZXggfHwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJhbmdlID0gbGluZVJhbmdlc1tpXTtcbiAgICAgICAgdmFyIGQgPSBzZWFyY2ggPj0gcmFuZ2UuZW5kID8gMSA6IC0xO1xuICAgICAgICB3aGlsZSAocmFuZ2UpIHtcbiAgICAgICAgICAgIGlmIChyYW5nZUNvbnRhaW5zKHJhbmdlLCBzZWFyY2gpKVxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRMb2NhdGlvbihyYW5nZSwgc2VhcmNoKTtcbiAgICAgICAgICAgIGkgKz0gZDtcbiAgICAgICAgICAgIHJhbmdlID0gbGluZVJhbmdlc1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gbG9jYXRlO1xufVxuZnVuY3Rpb24gbG9jYXRlKHNvdXJjZSwgc2VhcmNoLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnbnVtYmVyJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvY2F0ZSB0YWtlcyBhIHsgc3RhcnRJbmRleCwgb2Zmc2V0TGluZSwgb2Zmc2V0Q29sdW1uIH0gb2JqZWN0IGFzIHRoZSB0aGlyZCBhcmd1bWVudCcpO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TG9jYXRvcihzb3VyY2UsIG9wdGlvbnMpKHNlYXJjaCwgb3B0aW9ucyAmJiBvcHRpb25zLnN0YXJ0SW5kZXgpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShzdHIsIG9wdHMpIHtcbiAgICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihzdHIsIG9wdHMpO1xuICAgIHJldHVybiBwYXJzZXIudmFsdWU7XG59XG5mdW5jdGlvbiBub29wKCkgeyB9XG52YXIgUGFyc2VFcnJvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoUGFyc2VFcnJvciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBQYXJzZUVycm9yKG1lc3NhZ2UsIHBvcywgbG9jKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIG1lc3NhZ2UpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnBvcyA9IHBvcztcbiAgICAgICAgX3RoaXMubG9jID0gbG9jO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIHJldHVybiBQYXJzZUVycm9yO1xufShFcnJvcikpO1xuLy8gaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZXNjYXBlc1xudmFyIGVzY2FwZWFibGUgPSB7XG4gICAgYjogJ1xcYicsXG4gICAgbjogJ1xcbicsXG4gICAgZjogJ1xcZicsXG4gICAgcjogJ1xccicsXG4gICAgdDogJ1xcdCcsXG4gICAgdjogJ1xcdicsXG4gICAgMDogJ1xcMCdcbn07XG52YXIgaGV4ID0gL15bYS1mQS1GMC05XSskLztcbnZhciBQYXJzZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGFyc2VyKHN0ciwgb3B0cykge1xuICAgICAgICB0aGlzLnN0ciA9IHN0cjtcbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICAgIHRoaXMub25Db21tZW50ID0gKG9wdHMgJiYgb3B0cy5vbkNvbW1lbnQpIHx8IG5vb3A7XG4gICAgICAgIHRoaXMub25WYWx1ZSA9IChvcHRzICYmIG9wdHMub25WYWx1ZSkgfHwgbm9vcDtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMucmVhZFZhbHVlKCk7XG4gICAgICAgIHRoaXMuYWxsb3dXaGl0ZXNwYWNlT3JDb21tZW50KCk7XG4gICAgICAgIGlmICh0aGlzLmluZGV4IDwgdGhpcy5zdHIubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGNoYXJhY3RlciAnXCIgKyB0aGlzLnBlZWsoKSArIFwiJ1wiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBQYXJzZXIucHJvdG90eXBlLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuaW5kZXggPCB0aGlzLnN0ci5sZW5ndGggJiZcbiAgICAgICAgICAgIHdoaXRlc3BhY2UudGVzdCh0aGlzLnN0clt0aGlzLmluZGV4XSkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgICBpZiAodGhpcy5lYXQoJy8nKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZWF0KCcvJykpIHtcbiAgICAgICAgICAgICAgICAvLyBsaW5lIGNvbW1lbnRcbiAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IHRoaXMucmVhZFVudGlsKC8oPzpcXHJcXG58XFxufFxccikvKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ29tbWVudCh7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmluZGV4LFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQ29tbWVudCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IHRleHQsXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZWF0KCdcXG4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZWF0KCcqJykpIHtcbiAgICAgICAgICAgICAgICAvLyBibG9jayBjb21tZW50XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSB0aGlzLnJlYWRVbnRpbCgvXFwqXFwvLyk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNvbW1lbnQoe1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGVuZDogdGhpcy5pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0NvbW1lbnQnLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgICAgICAgICAgICBibG9jazogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZWF0KCcqLycsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWxsb3dXaGl0ZXNwYWNlT3JDb21tZW50KCk7XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UsIGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA9PT0gdm9pZCAwKSB7IGluZGV4ID0gdGhpcy5pbmRleDsgfVxuICAgICAgICB2YXIgbG9jID0gbG9jYXRlKHRoaXMuc3RyLCBpbmRleCwgeyBvZmZzZXRMaW5lOiAxIH0pO1xuICAgICAgICB0aHJvdyBuZXcgUGFyc2VFcnJvcihtZXNzYWdlLCBpbmRleCwgbG9jKTtcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUuZWF0ID0gZnVuY3Rpb24gKHN0ciwgcmVxdWlyZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RyLnNsaWNlKHRoaXMuaW5kZXgsIHRoaXMuaW5kZXggKyBzdHIubGVuZ3RoKSA9PT0gc3RyKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4ICs9IHN0ci5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXF1aXJlZCkge1xuICAgICAgICAgICAgdGhpcy5lcnJvcihcIkV4cGVjdGVkICdcIiArIHN0ciArIFwiJyBpbnN0ZWFkIG9mICdcIiArIHRoaXMuc3RyW3RoaXMuaW5kZXhdICsgXCInXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgUGFyc2VyLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdHJbdGhpcy5pbmRleF07XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbiAocGF0dGVybikge1xuICAgICAgICB2YXIgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWModGhpcy5zdHIuc2xpY2UodGhpcy5pbmRleCkpO1xuICAgICAgICBpZiAoIW1hdGNoIHx8IG1hdGNoLmluZGV4ICE9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHRoaXMuaW5kZXggKz0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICByZXR1cm4gbWF0Y2hbMF07XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLnJlYWRVbnRpbCA9IGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgICAgIGlmICh0aGlzLmluZGV4ID49IHRoaXMuc3RyLmxlbmd0aClcbiAgICAgICAgICAgIHRoaXMuZXJyb3IoJ1VuZXhwZWN0ZWQgZW5kIG9mIGlucHV0Jyk7XG4gICAgICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICAgIHZhciBtYXRjaCA9IHBhdHRlcm4uZXhlYyh0aGlzLnN0ci5zbGljZShzdGFydCkpO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBzdGFydF8xID0gdGhpcy5pbmRleDtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSBzdGFydF8xICsgbWF0Y2guaW5kZXg7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdHIuc2xpY2Uoc3RhcnRfMSwgdGhpcy5pbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRleCA9IHRoaXMuc3RyLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyLnNsaWNlKHN0YXJ0KTtcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZEFycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgICBpZiAoIXRoaXMuZWF0KCdbJykpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgdmFyIGFycmF5ID0ge1xuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogJ0FycmF5RXhwcmVzc2lvbicsXG4gICAgICAgICAgICBlbGVtZW50czogW11cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hbGxvd1doaXRlc3BhY2VPckNvbW1lbnQoKTtcbiAgICAgICAgd2hpbGUgKHRoaXMucGVlaygpICE9PSAnXScpIHtcbiAgICAgICAgICAgIGFycmF5LmVsZW1lbnRzLnB1c2godGhpcy5yZWFkVmFsdWUoKSk7XG4gICAgICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmVhdCgnLCcpKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgdGhpcy5hbGxvd1doaXRlc3BhY2VPckNvbW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZWF0KCddJykpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3IoXCJFeHBlY3RlZCAnXScgaW5zdGVhZCBvZiAnXCIgKyB0aGlzLnN0clt0aGlzLmluZGV4XSArIFwiJ1wiKTtcbiAgICAgICAgfVxuICAgICAgICBhcnJheS5lbmQgPSB0aGlzLmluZGV4O1xuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLnJlYWRCb29sZWFuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgICB2YXIgcmF3ID0gdGhpcy5yZWFkKC9eKHRydWV8ZmFsc2UpLyk7XG4gICAgICAgIGlmIChyYXcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgICAgIGVuZDogdGhpcy5pbmRleCxcbiAgICAgICAgICAgICAgICB0eXBlOiAnTGl0ZXJhbCcsXG4gICAgICAgICAgICAgICAgcmF3OiByYXcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJhdyA9PT0gJ3RydWUnXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLnJlYWROdWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgICBpZiAodGhpcy5lYXQoJ251bGwnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICAgICAgZW5kOiB0aGlzLmluZGV4LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdMaXRlcmFsJyxcbiAgICAgICAgICAgICAgICByYXc6ICdudWxsJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgUGFyc2VyLnByb3RvdHlwZS5yZWFkTGl0ZXJhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnJlYWRCb29sZWFuKCkgfHxcbiAgICAgICAgICAgIHRoaXMucmVhZE51bWJlcigpIHx8XG4gICAgICAgICAgICB0aGlzLnJlYWRTdHJpbmcoKSB8fFxuICAgICAgICAgICAgdGhpcy5yZWFkTnVsbCgpKTtcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZE51bWJlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICAgICAgdmFyIHJhdyA9IHRoaXMucmVhZChudW1iZXIpO1xuICAgICAgICBpZiAocmF3KSB7XG4gICAgICAgICAgICB2YXIgc2lnbiA9IHJhd1swXTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9ICsoc2lnbiA9PT0gJy0nIHx8IHNpZ24gPT09ICcrJyA/IHJhdy5zbGljZSgxKSA6IHJhdyk7XG4gICAgICAgICAgICBpZiAoc2lnbiA9PT0gJy0nKVxuICAgICAgICAgICAgICAgIHZhbHVlID0gLXZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICAgICAgZW5kOiB0aGlzLmluZGV4LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdMaXRlcmFsJyxcbiAgICAgICAgICAgICAgICByYXc6IHJhdyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZE9iamVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICAgICAgaWYgKCF0aGlzLmVhdCgneycpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB2YXIgb2JqZWN0ID0ge1xuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogJ09iamVjdEV4cHJlc3Npb24nLFxuICAgICAgICAgICAgcHJvcGVydGllczogW11cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hbGxvd1doaXRlc3BhY2VPckNvbW1lbnQoKTtcbiAgICAgICAgd2hpbGUgKHRoaXMucGVlaygpICE9PSAnfScpIHtcbiAgICAgICAgICAgIG9iamVjdC5wcm9wZXJ0aWVzLnB1c2godGhpcy5yZWFkUHJvcGVydHkoKSk7XG4gICAgICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmVhdCgnLCcpKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgdGhpcy5hbGxvd1doaXRlc3BhY2VPckNvbW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVhdCgnfScsIHRydWUpO1xuICAgICAgICBvYmplY3QuZW5kID0gdGhpcy5pbmRleDtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZFByb3BlcnR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xuICAgICAgICB2YXIgcHJvcGVydHkgPSB7XG4gICAgICAgICAgICBzdGFydDogdGhpcy5pbmRleCxcbiAgICAgICAgICAgIGVuZDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6ICdQcm9wZXJ0eScsXG4gICAgICAgICAgICBrZXk6IHRoaXMucmVhZFByb3BlcnR5S2V5KCksXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5yZWFkVmFsdWUoKVxuICAgICAgICB9O1xuICAgICAgICBwcm9wZXJ0eS5lbmQgPSB0aGlzLmluZGV4O1xuICAgICAgICByZXR1cm4gcHJvcGVydHk7XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLnJlYWRJZGVudGlmaWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgICB2YXIgbmFtZSA9IHRoaXMucmVhZCh2YWxpZElkZW50aWZpZXJDaGFyYWN0ZXJzKTtcbiAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgICAgIGVuZDogdGhpcy5pbmRleCxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSWRlbnRpZmllcicsXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgUGFyc2VyLnByb3RvdHlwZS5yZWFkUHJvcGVydHlLZXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBrZXkgPSB0aGlzLnJlYWRTdHJpbmcoKSB8fCB0aGlzLnJlYWRJZGVudGlmaWVyKCk7XG4gICAgICAgIGlmICgha2V5KVxuICAgICAgICAgICAgdGhpcy5lcnJvcihcIkJhZCBpZGVudGlmaWVyIGFzIHVucXVvdGVkIGtleVwiKTtcbiAgICAgICAgaWYgKGtleS50eXBlID09PSAnTGl0ZXJhbCcpIHtcbiAgICAgICAgICAgIGtleS5uYW1lID0gU3RyaW5nKGtleS52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbGxvd1doaXRlc3BhY2VPckNvbW1lbnQoKTtcbiAgICAgICAgdGhpcy5lYXQoJzonLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGtleTtcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZFN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICAgICAgLy8gY29uc3QgcXVvdGUgPSB0aGlzLnJlYWQoL15bJ1wiXS8pO1xuICAgICAgICB2YXIgcXVvdGUgPSB0aGlzLmVhdChTSU5HTEVfUVVPVEUpIHx8IHRoaXMuZWF0KERPVUJMRV9RVU9URSk7XG4gICAgICAgIGlmICghcXVvdGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHZhciBlc2NhcGVkID0gZmFsc2U7XG4gICAgICAgIHZhciB2YWx1ZSA9ICcnO1xuICAgICAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMuc3RyLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGNoYXJfMSA9IHRoaXMuc3RyW3RoaXMuaW5kZXgrK107XG4gICAgICAgICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICAgICAgICAgIGVzY2FwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAvLyBsaW5lIGNvbnRpbnVhdGlvbnNcbiAgICAgICAgICAgICAgICBpZiAoY2hhcl8xID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKGNoYXJfMSA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RyW3RoaXMuaW5kZXhdID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjaGFyXzEgPT09ICd4JyB8fCBjaGFyXzEgPT09ICd1Jykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRfMiA9IHRoaXMuaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmQgPSB0aGlzLmluZGV4ICs9IChjaGFyXzEgPT09ICd4JyA/IDIgOiA0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvZGUgPSB0aGlzLnN0ci5zbGljZShzdGFydF8yLCBlbmQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWhleC50ZXN0KGNvZGUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcihcIkludmFsaWQgXCIgKyAoY2hhcl8xID09PSAneCcgPyAnaGV4YWRlY2ltYWwnIDogJ1VuaWNvZGUnKSArIFwiIGVzY2FwZSBzZXF1ZW5jZVwiLCBzdGFydF8yKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChjb2RlLCAxNikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gZXNjYXBlYWJsZVtjaGFyXzFdIHx8IGNoYXJfMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGFyXzEgPT09ICdcXFxcJykge1xuICAgICAgICAgICAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hhcl8xID09PSBxdW90ZSkge1xuICAgICAgICAgICAgICAgIHZhciBlbmQgPSB0aGlzLmluZGV4O1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdMaXRlcmFsJyxcbiAgICAgICAgICAgICAgICAgICAgcmF3OiB0aGlzLnN0ci5zbGljZShzdGFydCwgZW5kKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjaGFyXzEgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9yKFwiQmFkIHN0cmluZ1wiLCB0aGlzLmluZGV4IC0gMSk7XG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gY2hhcl8xO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXJyb3IoXCJVbmV4cGVjdGVkIGVuZCBvZiBpbnB1dFwiKTtcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xuICAgICAgICB2YXIgdmFsdWUgPSAodGhpcy5yZWFkQXJyYXkoKSB8fFxuICAgICAgICAgICAgdGhpcy5yZWFkT2JqZWN0KCkgfHxcbiAgICAgICAgICAgIHRoaXMucmVhZExpdGVyYWwoKSk7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5vblZhbHVlKHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVycm9yKFwiVW5leHBlY3RlZCBFT0ZcIik7XG4gICAgfTtcbiAgICByZXR1cm4gUGFyc2VyO1xufSgpKTtcblxuZnVuY3Rpb24gZXZhbHVhdGUoc3RyKSB7XG4gICAgdmFyIGFzdCA9IHBhcnNlKHN0cik7XG4gICAgcmV0dXJuIGdldFZhbHVlKGFzdCk7XG59XG5mdW5jdGlvbiBnZXRWYWx1ZShub2RlKSB7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ0xpdGVyYWwnKSB7XG4gICAgICAgIHJldHVybiBub2RlLnZhbHVlO1xuICAgIH1cbiAgICBpZiAobm9kZS50eXBlID09PSAnQXJyYXlFeHByZXNzaW9uJykge1xuICAgICAgICByZXR1cm4gbm9kZS5lbGVtZW50cy5tYXAoZ2V0VmFsdWUpO1xuICAgIH1cbiAgICBpZiAobm9kZS50eXBlID09PSAnT2JqZWN0RXhwcmVzc2lvbicpIHtcbiAgICAgICAgdmFyIG9ial8xID0ge307XG4gICAgICAgIG5vZGUucHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICBvYmpfMVtwcm9wLmtleS5uYW1lXSA9IGdldFZhbHVlKHByb3AudmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG9ial8xO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlLCBvcHRpb25zKSB7XG4gICAgdmFyIHF1b3RlID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5zaW5nbGVRdW90ZXMpID8gXCInXCIgOiAnXCInO1xuICAgIHZhciBpbmRlbnRTdHJpbmcgPSAob3B0aW9ucyAmJiBvcHRpb25zLnNwYWNlcykgPyBzcGFjZXMob3B0aW9ucy5zcGFjZXMpIDogJ1xcdCc7XG4gICAgcmV0dXJuIHN0cmluZ2lmeVZhbHVlKHZhbHVlLCBxdW90ZSwgJ1xcbicsIGluZGVudFN0cmluZywgdHJ1ZSk7XG59XG4vLyBodHRwczovL2dpdGh1Yi5jb20vanNvbjUvanNvbjUvYmxvYi82NWJjYzU1NmViNjI5OTg0YjMzYmIyMTYzY2JjMTBmYmE0NTk3MzAwL3NyYy9zdHJpbmdpZnkuanMjTDExMFxudmFyIGVzY2FwZWFibGUkMSA9IHtcbiAgICBcIidcIjogXCInXCIsXG4gICAgJ1wiJzogJ1wiJyxcbiAgICAnXFxcXCc6ICdcXFxcJyxcbiAgICAnXFxiJzogJ2InLFxuICAgICdcXGYnOiAnZicsXG4gICAgJ1xcbic6ICduJyxcbiAgICAnXFxyJzogJ3InLFxuICAgICdcXHQnOiAndCcsXG4gICAgJ1xcdic6ICd2JyxcbiAgICAnXFwwJzogJzAnLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbn07XG52YXIgZXNjYXBlYWJsZVJlZ2V4ID0gL1snXCJcXFxcXFxiXFxmXFxuXFxyXFx0XFx2XFwwXFx1MjAyOFxcdTIwMjldL2c7XG5mdW5jdGlvbiBzdHJpbmdpZnlTdHJpbmcoc3RyLCBxdW90ZSkge1xuICAgIHZhciBvdGhlclF1b3RlID0gcXVvdGUgPT09ICdcIicgPyBcIidcIiA6ICdcIic7XG4gICAgcmV0dXJuIHF1b3RlICsgc3RyLnJlcGxhY2UoZXNjYXBlYWJsZVJlZ2V4LCBmdW5jdGlvbiAoY2hhcikge1xuICAgICAgICByZXR1cm4gY2hhciA9PT0gb3RoZXJRdW90ZSA/IGNoYXIgOiAnXFxcXCcgKyBlc2NhcGVhYmxlJDFbY2hhcl07XG4gICAgfSkgKyBxdW90ZTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeVByb3BlcnR5KGtleSwgdmFsdWUsIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBuZXdsaW5lcykge1xuICAgIHJldHVybiAoKGVudGlyZWx5VmFsaWRJZGVudGlmaWVyLnRlc3Qoa2V5KSA/IGtleSA6IHN0cmluZ2lmeVN0cmluZyhrZXksIHF1b3RlKSkgK1xuICAgICAgICAnOiAnICtcbiAgICAgICAgc3RyaW5naWZ5VmFsdWUodmFsdWUsIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBuZXdsaW5lcykpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5VmFsdWUodmFsdWUsIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBuZXdsaW5lcykge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5U3RyaW5nKHZhbHVlLCBxdW90ZSk7XG4gICAgfVxuICAgIGlmICh0eXBlID09PSAnbnVtYmVyJyB8fCB0eXBlID09PSAnYm9vbGVhbicgfHwgdmFsdWUgPT09IG51bGwpXG4gICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdpZnlWYWx1ZShlbGVtZW50LCBxdW90ZSwgaW5kZW50YXRpb24gKyBpbmRlbnRTdHJpbmcsIGluZGVudFN0cmluZywgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAobmV3bGluZXMpIHtcbiAgICAgICAgICAgIHJldHVybiAoXCJbXFxuXCIgKyAoaW5kZW50YXRpb24gKyBpbmRlbnRTdHJpbmcpICtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5qb2luKFwiLFxcblwiICsgKGluZGVudGF0aW9uICsgaW5kZW50U3RyaW5nKSkgK1xuICAgICAgICAgICAgICAgIChcIlxcblwiICsgaW5kZW50YXRpb24gKyBcIl1cIikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcIlsgXCIgKyBlbGVtZW50cy5qb2luKCcsICcpICsgXCIgXVwiO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0ga2V5cy5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVByb3BlcnR5KGtleSwgdmFsdWVba2V5XSwgcXVvdGUsIGluZGVudGF0aW9uICsgaW5kZW50U3RyaW5nLCBpbmRlbnRTdHJpbmcsIG5ld2xpbmVzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChuZXdsaW5lcykge1xuICAgICAgICAgICAgcmV0dXJuIChcIntcIiArIChpbmRlbnRhdGlvbiArIGluZGVudFN0cmluZykgK1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuam9pbihcIixcIiArIChpbmRlbnRhdGlvbiArIGluZGVudFN0cmluZykpICtcbiAgICAgICAgICAgICAgICAoaW5kZW50YXRpb24gKyBcIn1cIikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcInsgXCIgKyBwcm9wZXJ0aWVzLmpvaW4oJywgJykgKyBcIiB9XCI7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzdHJpbmdpZnkgXCIgKyB0eXBlKTtcbn1cblxuZnVuY3Rpb24gcGF0Y2goc3RyLCB2YWx1ZSkge1xuICAgIHZhciBjb3VudHMgPSB7fTtcbiAgICBjb3VudHNbU0lOR0xFX1FVT1RFXSA9IDA7XG4gICAgY291bnRzW0RPVUJMRV9RVU9URV0gPSAwO1xuICAgIHZhciBpbmRlbnRTdHJpbmcgPSBndWVzc0luZGVudFN0cmluZyhzdHIpO1xuICAgIHZhciByb290ID0gcGFyc2Uoc3RyLCB7XG4gICAgICAgIG9uVmFsdWU6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZS50eXBlID09PSAnTGl0ZXJhbCcgJiYgdHlwZW9mIG5vZGUudmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY291bnRzW25vZGUucmF3WzBdXSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgdmFyIHF1b3RlID0gY291bnRzW1NJTkdMRV9RVU9URV0gPiBjb3VudHNbRE9VQkxFX1FVT1RFXSA/XG4gICAgICAgIFNJTkdMRV9RVU9URSA6XG4gICAgICAgIERPVUJMRV9RVU9URTtcbiAgICB2YXIgbmV3bGluZXMgPSAoL1xcbi8udGVzdChzdHIuc2xpY2Uocm9vdC5zdGFydCwgcm9vdC5lbmQpKSB8fFxuICAgICAgICByb290LnR5cGUgPT09ICdBcnJheUV4cHJlc3Npb24nICYmIHJvb3QuZWxlbWVudHMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgIHJvb3QudHlwZSA9PT0gJ09iamVjdEV4cHJlc3Npb24nICYmIHJvb3QucHJvcGVydGllcy5sZW5ndGggPT09IDApO1xuICAgIHJldHVybiAoc3RyLnNsaWNlKDAsIHJvb3Quc3RhcnQpICtcbiAgICAgICAgcGF0Y2hWYWx1ZShyb290LCB2YWx1ZSwgc3RyLCAnJywgaW5kZW50U3RyaW5nLCBxdW90ZSwgbmV3bGluZXMpICtcbiAgICAgICAgc3RyLnNsaWNlKHJvb3QuZW5kKSk7XG59XG5mdW5jdGlvbiBwYXRjaFZhbHVlKG5vZGUsIHZhbHVlLCBzdHIsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIHF1b3RlLCBuZXdsaW5lcykge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAobm9kZS50eXBlID09PSAnTGl0ZXJhbCcgJiYgdHlwZW9mIG5vZGUudmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAvLyBwcmVzZXJ2ZSBxdW90ZSBzdHlsZVxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZyh2YWx1ZSwgbm9kZS5yYXdbMF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlTdHJpbmcodmFsdWUsIHF1b3RlKTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBwYXRjaE51bWJlcihub2RlLnJhdywgdmFsdWUpO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gJ2Jvb2xlYW4nIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gJ0FycmF5RXhwcmVzc2lvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXRjaEFycmF5KG5vZGUsIHZhbHVlLCBzdHIsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIHF1b3RlLCBuZXdsaW5lcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVZhbHVlKHZhbHVlLCBxdW90ZSwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgbmV3bGluZXMpO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gJ09iamVjdEV4cHJlc3Npb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gcGF0Y2hPYmplY3Qobm9kZSwgdmFsdWUsIHN0ciwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgcXVvdGUsIG5ld2xpbmVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5VmFsdWUodmFsdWUsIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBuZXdsaW5lcyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzdHJpbmdpZnkgXCIgKyB0eXBlICsgXCJzXCIpO1xufVxuZnVuY3Rpb24gcGF0Y2hOdW1iZXIocmF3LCB2YWx1ZSkge1xuICAgIHZhciBtYXRjaFJhZGl4ID0gL14oWy0rXSk/MChbYm94Qk9YXSkvLmV4ZWMocmF3KTtcbiAgICBpZiAobWF0Y2hSYWRpeCAmJiB2YWx1ZSAlIDEgPT09IDApIHtcbiAgICAgICAgcmV0dXJuICgobWF0Y2hSYWRpeFsxXSA9PT0gJysnICYmIHZhbHVlID49IDAgPyAnKycgOiB2YWx1ZSA8IDAgPyAnLScgOiAnJykgK1xuICAgICAgICAgICAgJzAnICsgbWF0Y2hSYWRpeFsyXSArXG4gICAgICAgICAgICBNYXRoLmFicyh2YWx1ZSkudG9TdHJpbmcobWF0Y2hSYWRpeFsyXSA9PT0gJ2InIHx8IG1hdGNoUmFkaXhbMl0gPT09ICdCJyA/IDIgOlxuICAgICAgICAgICAgICAgIG1hdGNoUmFkaXhbMl0gPT09ICdvJyB8fCBtYXRjaFJhZGl4WzJdID09PSAnTycgPyA4IDpcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hSYWRpeFsyXSA9PT0gJ3gnIHx8IG1hdGNoUmFkaXhbMl0gPT09ICdYJyA/IDE2IDogbnVsbCkpO1xuICAgIH1cbiAgICB2YXIgbWF0Y2ggPSAvXihbLStdKT8oXFwuKT8vLmV4ZWMocmF3KTtcbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gKChtYXRjaFsxXSA9PT0gJysnICYmIHZhbHVlID49IDAgPyAnKycgOiB2YWx1ZSA8IDAgPyAnLScgOiAnJykgK1xuICAgICAgICAgICAgKG1hdGNoWzJdID8gU3RyaW5nKE1hdGguYWJzKHZhbHVlKSkucmVwbGFjZSgvXjAvLCAnJykgOiBTdHJpbmcoTWF0aC5hYnModmFsdWUpKSkpO1xuICAgIH1cbiAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHBhdGNoQXJyYXkobm9kZSwgdmFsdWUsIHN0ciwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgcXVvdGUsIG5ld2xpbmVzKSB7XG4gICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbm9kZS5lbGVtZW50cy5sZW5ndGggPT09IDAgPyBzdHIuc2xpY2Uobm9kZS5zdGFydCwgbm9kZS5lbmQpIDogJ1tdJztcbiAgICB9XG4gICAgdmFyIHByZWNlZGluZ1doaXRlc3BhY2UgPSBnZXRQcmVjZWRpbmdXaGl0ZXNwYWNlKHN0ciwgbm9kZS5zdGFydCk7XG4gICAgdmFyIGVtcHR5ID0gcHJlY2VkaW5nV2hpdGVzcGFjZSA9PT0gJyc7XG4gICAgdmFyIG5ld2xpbmUgPSBlbXB0eSB8fCAvXFxuLy50ZXN0KHByZWNlZGluZ1doaXRlc3BhY2UpO1xuICAgIGlmIChub2RlLmVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5VmFsdWUodmFsdWUsIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBuZXdsaW5lKTtcbiAgICB9XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBjID0gbm9kZS5zdGFydDtcbiAgICB2YXIgcGF0Y2hlZCA9ICcnO1xuICAgIHZhciBuZXdsaW5lc0luc2lkZVZhbHVlID0gc3RyLnNsaWNlKG5vZGUuc3RhcnQsIG5vZGUuZW5kKS5zcGxpdCgnXFxuJykubGVuZ3RoID4gMTtcbiAgICBmb3IgKDsgaSA8IHZhbHVlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gbm9kZS5lbGVtZW50c1tpXTtcbiAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHBhdGNoZWQgKz1cbiAgICAgICAgICAgICAgICBzdHIuc2xpY2UoYywgZWxlbWVudC5zdGFydCkgK1xuICAgICAgICAgICAgICAgICAgICBwYXRjaFZhbHVlKGVsZW1lbnQsIHZhbHVlW2ldLCBzdHIsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIHF1b3RlLCBuZXdsaW5lc0luc2lkZVZhbHVlKTtcbiAgICAgICAgICAgIGMgPSBlbGVtZW50LmVuZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGFwcGVuZCBuZXcgZWxlbWVudFxuICAgICAgICAgICAgaWYgKG5ld2xpbmVzSW5zaWRlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBwYXRjaGVkICs9XG4gICAgICAgICAgICAgICAgICAgIFwiLFxcblwiICsgKGluZGVudGF0aW9uICsgaW5kZW50U3RyaW5nKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdpZnlWYWx1ZSh2YWx1ZVtpXSwgcXVvdGUsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hlZCArPVxuICAgICAgICAgICAgICAgICAgICBcIiwgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5naWZ5VmFsdWUodmFsdWVbaV0sIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGkgPCBub2RlLmVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBjID0gbm9kZS5lbGVtZW50c1tub2RlLmVsZW1lbnRzLmxlbmd0aCAtIDFdLmVuZDtcbiAgICB9XG4gICAgcGF0Y2hlZCArPSBzdHIuc2xpY2UoYywgbm9kZS5lbmQpO1xuICAgIHJldHVybiBwYXRjaGVkO1xufVxuZnVuY3Rpb24gcGF0Y2hPYmplY3Qobm9kZSwgdmFsdWUsIHN0ciwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgcXVvdGUsIG5ld2xpbmVzKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBub2RlLnByb3BlcnRpZXMubGVuZ3RoID09PSAwXG4gICAgICAgICAgICA/IHN0ci5zbGljZShub2RlLnN0YXJ0LCBub2RlLmVuZClcbiAgICAgICAgICAgIDogJ3t9JztcbiAgICB9XG4gICAgdmFyIGV4aXN0aW5nUHJvcGVydGllcyA9IHt9O1xuICAgIG5vZGUucHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgIGV4aXN0aW5nUHJvcGVydGllc1twcm9wLmtleS5uYW1lXSA9IHByb3A7XG4gICAgfSk7XG4gICAgdmFyIHByZWNlZGluZ1doaXRlc3BhY2UgPSBnZXRQcmVjZWRpbmdXaGl0ZXNwYWNlKHN0ciwgbm9kZS5zdGFydCk7XG4gICAgdmFyIGVtcHR5ID0gcHJlY2VkaW5nV2hpdGVzcGFjZSA9PT0gJyc7XG4gICAgdmFyIG5ld2xpbmUgPSBlbXB0eSB8fCAvXFxuLy50ZXN0KHByZWNlZGluZ1doaXRlc3BhY2UpO1xuICAgIGlmIChub2RlLnByb3BlcnRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlWYWx1ZSh2YWx1ZSwgcXVvdGUsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIG5ld2xpbmUpO1xuICAgIH1cbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGMgPSBub2RlLnN0YXJ0O1xuICAgIHZhciBwYXRjaGVkID0gJyc7XG4gICAgdmFyIG5ld2xpbmVzSW5zaWRlVmFsdWUgPSAvXFxuLy50ZXN0KHN0ci5zbGljZShub2RlLnN0YXJ0LCBub2RlLmVuZCkpO1xuICAgIHZhciBzdGFydGVkID0gZmFsc2U7XG4gICAgdmFyIGludHJvID0gc3RyLnNsaWNlKG5vZGUuc3RhcnQsIG5vZGUucHJvcGVydGllc1swXS5zdGFydCk7XG4gICAgZm9yICg7IGkgPCBub2RlLnByb3BlcnRpZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIHByb3BlcnR5ID0gbm9kZS5wcm9wZXJ0aWVzW2ldO1xuICAgICAgICB2YXIgcHJvcGVydHlWYWx1ZSA9IHZhbHVlW3Byb3BlcnR5LmtleS5uYW1lXTtcbiAgICAgICAgaW5kZW50YXRpb24gPSBnZXRJbmRlbnRhdGlvbihzdHIsIHByb3BlcnR5LnN0YXJ0KTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcGF0Y2hlZCArPSBzdGFydGVkXG4gICAgICAgICAgICAgICAgPyBzdHIuc2xpY2UoYywgcHJvcGVydHkudmFsdWUuc3RhcnQpXG4gICAgICAgICAgICAgICAgOiBpbnRybyArIHN0ci5zbGljZShwcm9wZXJ0eS5rZXkuc3RhcnQsIHByb3BlcnR5LnZhbHVlLnN0YXJ0KTtcbiAgICAgICAgICAgIHBhdGNoZWQgKz0gcGF0Y2hWYWx1ZShwcm9wZXJ0eS52YWx1ZSwgcHJvcGVydHlWYWx1ZSwgc3RyLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBxdW90ZSwgbmV3bGluZXNJbnNpZGVWYWx1ZSk7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjID0gcHJvcGVydHkuZW5kO1xuICAgIH1cbiAgICAvLyBhcHBlbmQgbmV3IHByb3BlcnRpZXNcbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoa2V5IGluIGV4aXN0aW5nUHJvcGVydGllcylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdmFyIHByb3BlcnR5VmFsdWUgPSB2YWx1ZVtrZXldO1xuICAgICAgICBwYXRjaGVkICs9XG4gICAgICAgICAgICAoc3RhcnRlZCA/ICcsJyArIChuZXdsaW5lc0luc2lkZVZhbHVlID8gaW5kZW50YXRpb24gOiAnICcpIDogaW50cm8pICtcbiAgICAgICAgICAgICAgICBzdHJpbmdpZnlQcm9wZXJ0eShrZXksIHByb3BlcnR5VmFsdWUsIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBuZXdsaW5lc0luc2lkZVZhbHVlKTtcbiAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgfSk7XG4gICAgcGF0Y2hlZCArPSBzdHIuc2xpY2UoYywgbm9kZS5lbmQpO1xuICAgIHJldHVybiBwYXRjaGVkO1xufVxuZnVuY3Rpb24gZ2V0SW5kZW50YXRpb24oc3RyLCBpKSB7XG4gICAgd2hpbGUgKGkgPiAwICYmICF3aGl0ZXNwYWNlLnRlc3Qoc3RyW2kgLSAxXSkpXG4gICAgICAgIGkgLT0gMTtcbiAgICB2YXIgZW5kID0gaTtcbiAgICB3aGlsZSAoaSA+IDAgJiYgd2hpdGVzcGFjZS50ZXN0KHN0cltpIC0gMV0pKVxuICAgICAgICBpIC09IDE7XG4gICAgcmV0dXJuIHN0ci5zbGljZShpLCBlbmQpO1xufVxuZnVuY3Rpb24gZ2V0UHJlY2VkaW5nV2hpdGVzcGFjZShzdHIsIGkpIHtcbiAgICB2YXIgZW5kID0gaTtcbiAgICB3aGlsZSAoaSA+IDAgJiYgd2hpdGVzcGFjZS50ZXN0KHN0cltpXSkpXG4gICAgICAgIGkgLT0gMTtcbiAgICByZXR1cm4gc3RyLnNsaWNlKGksIGVuZCk7XG59XG5mdW5jdGlvbiBndWVzc0luZGVudFN0cmluZyhzdHIpIHtcbiAgICB2YXIgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpO1xuICAgIHZhciB0YWJzID0gMDtcbiAgICB2YXIgc3BhY2VzJCQxID0gMDtcbiAgICB2YXIgbWluU3BhY2VzID0gODtcbiAgICBsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIHZhciBtYXRjaCA9IC9eKD86ICt8XFx0KykvLmV4ZWMobGluZSk7XG4gICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHZhciB3aGl0ZXNwYWNlJCQxID0gbWF0Y2hbMF07XG4gICAgICAgIGlmICh3aGl0ZXNwYWNlJCQxLmxlbmd0aCA9PT0gbGluZS5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh3aGl0ZXNwYWNlJCQxWzBdID09PSAnXFx0Jykge1xuICAgICAgICAgICAgdGFicyArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3BhY2VzJCQxICs9IDE7XG4gICAgICAgICAgICBpZiAod2hpdGVzcGFjZSQkMS5sZW5ndGggPiAxICYmIHdoaXRlc3BhY2UkJDEubGVuZ3RoIDwgbWluU3BhY2VzKSB7XG4gICAgICAgICAgICAgICAgbWluU3BhY2VzID0gd2hpdGVzcGFjZSQkMS5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoc3BhY2VzJCQxID4gdGFicykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgICAgIHdoaWxlIChtaW5TcGFjZXMtLSlcbiAgICAgICAgICAgIHJlc3VsdCArPSAnICc7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gJ1xcdCc7XG4gICAgfVxufVxuXG5leHBvcnQgeyBwYXJzZSwgZXZhbHVhdGUsIHBhdGNoLCBzdHJpbmdpZnkgfTtcbiIsImltcG9ydCAqIGFzIGZsZWVjZSBmcm9tICdnb2xkZW4tZmxlZWNlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RfZnJvbnRtYXR0ZXIobWFya2Rvd24pIHtcblx0Y29uc3QgbWF0Y2ggPSAvLS0tXFxyP1xcbihbXFxzXFxTXSs/KVxccj9cXG4tLS0vLmV4ZWMobWFya2Rvd24pO1xuXHRjb25zdCBmcm9udE1hdHRlciA9IG1hdGNoWzFdO1xuXHRjb25zdCBjb250ZW50ID0gbWFya2Rvd24uc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcblxuXHRjb25zdCBtZXRhZGF0YSA9IHt9O1xuXHRmcm9udE1hdHRlci5zcGxpdCgnXFxuJykuZm9yRWFjaChwYWlyID0+IHtcblx0XHRjb25zdCBjb2xvbkluZGV4ID0gcGFpci5pbmRleE9mKCc6Jyk7XG5cdFx0bWV0YWRhdGFbcGFpci5zbGljZSgwLCBjb2xvbkluZGV4KS50cmltKCldID0gcGFpclxuXHRcdFx0LnNsaWNlKGNvbG9uSW5kZXggKyAxKVxuXHRcdFx0LnRyaW0oKTtcblx0fSk7XG5cblx0cmV0dXJuIHsgbWV0YWRhdGEsIGNvbnRlbnQgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RfbWV0YWRhdGEobGluZSwgbGFuZykge1xuXHR0cnkge1xuXHRcdGlmIChsYW5nID09PSAnaHRtbCcgJiYgbGluZS5zdGFydHNXaXRoKCc8IS0tJykgJiYgbGluZS5lbmRzV2l0aCgnLS0+JykpIHtcblx0XHRcdHJldHVybiBmbGVlY2UuZXZhbHVhdGUobGluZS5zbGljZSg0LCAtMykudHJpbSgpKTtcblx0XHR9XG5cblx0XHRpZiAoXG5cdFx0XHRsYW5nID09PSAnanMnIHx8XG5cdFx0XHQobGFuZyA9PT0gJ2pzb24nICYmIGxpbmUuc3RhcnRzV2l0aCgnLyonKSAmJiBsaW5lLmVuZHNXaXRoKCcqLycpKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIGZsZWVjZS5ldmFsdWF0ZShsaW5lLnNsaWNlKDIsIC0yKS50cmltKCkpO1xuXHRcdH1cblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gVE9ETyByZXBvcnQgdGhlc2UgZXJyb3JzLCBkb24ndCBqdXN0IHNxdWVsY2ggdGhlbVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbi8vIG1hcCBsYW5nIHRvIHByaXNtLWxhbmd1YWdlLWF0dHJcbmV4cG9ydCBjb25zdCBsYW5ncyA9IHtcblx0YmFzaDogJ2Jhc2gnLFxuXHRodG1sOiAnbWFya3VwJyxcblx0c3Y6ICdtYXJrdXAnLFxuXHRqczogJ2phdmFzY3JpcHQnLFxuXHRjc3M6ICdjc3MnXG59O1xuXG5cbi8vIGxpbmtzIHJlbmRlcmVyXG5leHBvcnQgZnVuY3Rpb24gbGlua19yZW5kZXJlciAoaHJlZiwgdGl0bGUsIHRleHQpIHtcblx0bGV0IHRhcmdldF9hdHRyID0gJyc7XG5cdGxldCB0aXRsZV9hdHRyID0gJyc7XG5cblx0aWYgKGhyZWYuc3RhcnRzV2l0aChcImh0dHBcIikpIHtcblx0XHR0YXJnZXRfYXR0ciA9ICcgdGFyZ2V0PVwiX2JsYW5rXCInO1xuXHR9XG5cblx0aWYgKHRpdGxlICE9PSBudWxsKSB7XG5cdFx0dGl0bGVfYXR0ciA9IGAgdGl0bGU9XCIke3RpdGxlfVwiYDtcblx0fVxuXG5cdHJldHVybiBgPGEgaHJlZj1cIiR7aHJlZn1cIiR7dGFyZ2V0X2F0dHJ9JHt0aXRsZV9hdHRyfT4ke3RleHR9PC9hPmA7XG59XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgeyBleHRyYWN0X2Zyb250bWF0dGVyIH0gZnJvbSAnQHN2ZWx0ZWpzL3NpdGUta2l0L3V0aWxzL21hcmtkb3duJztcblxubGV0IGpzb247XG5cbmZ1bmN0aW9uIGdldF9zZWN0aW9ucygpIHtcblx0Y29uc3Qgc2x1Z3MgPSBuZXcgU2V0KCk7XG5cblx0Y29uc3Qgc2VjdGlvbnMgPSBmcy5yZWFkZGlyU3luYyhgY29udGVudC90dXRvcmlhbGApXG5cdFx0LmZpbHRlcihkaXIgPT4gL15cXGQrLy50ZXN0KGRpcikpXG5cdFx0Lm1hcChkaXIgPT4ge1xuXHRcdFx0bGV0IG1ldGE7XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdG1ldGEgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhgY29udGVudC90dXRvcmlhbC8ke2Rpcn0vbWV0YS5qc29uYCwgJ3V0Zi04JykpO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgRXJyb3IgcmVhZGluZyBtZXRhZGF0YSBmb3IgJHtkaXJ9YCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHRpdGxlOiBtZXRhLnRpdGxlLFxuXHRcdFx0XHRjaGFwdGVyczogZnMucmVhZGRpclN5bmMoYGNvbnRlbnQvdHV0b3JpYWwvJHtkaXJ9YClcblx0XHRcdFx0XHQuZmlsdGVyKGRpciA9PiAvXlxcZCsvLnRlc3QoZGlyKSlcblx0XHRcdFx0XHQubWFwKHR1dG9yaWFsID0+IHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG1kID0gZnMucmVhZEZpbGVTeW5jKGBjb250ZW50L3R1dG9yaWFsLyR7ZGlyfS8ke3R1dG9yaWFsfS90ZXh0Lm1kYCwgJ3V0Zi04Jyk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHsgbWV0YWRhdGEgfSA9IGV4dHJhY3RfZnJvbnRtYXR0ZXIobWQpO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNsdWcgPSB0dXRvcmlhbC5yZXBsYWNlKC9eXFxkKy0vLCAnJyk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHNsdWdzLmhhcyhzbHVnKSkgdGhyb3cgbmV3IEVycm9yKGBEdXBsaWNhdGUgc2x1ZzogJHtzbHVnfWApO1xuXHRcdFx0XHRcdFx0XHRzbHVncy5hZGQoc2x1Zyk7XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRzbHVnLFxuXHRcdFx0XHRcdFx0XHRcdHRpdGxlOiBtZXRhZGF0YS50aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRzZWN0aW9uX2RpcjogZGlyLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGlyOiB0dXRvcmlhbCxcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGJ1aWxkaW5nIHR1dG9yaWFsICR7ZGlyfS8ke3R1dG9yaWFsfTogJHtlcnIubWVzc2FnZX1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRyZXR1cm4gc2VjdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQocmVxLCByZXMpIHtcblx0dHJ5IHtcblx0XHRpZiAoIWpzb24gfHwgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuXHRcdFx0anNvbiA9IGdldF9zZWN0aW9ucygpO1xuXHRcdH1cblxuXHRcdHNlbmQocmVzLCAyMDAsIGpzb24pO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRzZW5kKHJlcywgNTAwLCB7XG5cdFx0XHRtZXNzYWdlOiBlcnIubWVzc2FnZVxuXHRcdH0pO1xuXHR9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XG5cdGxldCB7IG1pbiA9ICcwJywgbWF4ID0gJzEwMCcgfSA9IHJlcS5xdWVyeTtcblx0bWluID0gK21pbjtcblx0bWF4ID0gK21heDtcblxuXHRyZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuXG5cdC8vIHNpbXVsYXRlIGEgbG9uZyBkZWxheVxuXHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHQvLyBmYWlsIHNvbWV0aW1lc1xuXHRcdGlmIChNYXRoLnJhbmRvbSgpIDwgMC4zMzMpIHtcblx0XHRcdHJlcy5zdGF0dXNDb2RlID0gNDAwO1xuXHRcdFx0cmVzLmVuZChgRmFpbGVkIHRvIGdlbmVyYXRlIHJhbmRvbSBudW1iZXIuIFBsZWFzZSB0cnkgYWdhaW5gKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBudW0gPSBtaW4gKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSk7XG5cdFx0cmVzLmVuZChTdHJpbmcobnVtKSk7XG5cdH0sIDEwMDApO1xufSIsIihmdW5jdGlvbihQcmlzbSkge1xuXHQvLyAkIHNldCB8IGdyZXAgJ15bQS1aXVteWzpzcGFjZTpdXSo9JyB8IGN1dCAtZD0gLWYxIHwgdHIgJ1xcbicgJ3wnXG5cdC8vICsgTENfQUxMLCBSQU5ET00sIFJFUExZLCBTRUNPTkRTLlxuXHQvLyArIG1ha2Ugc3VyZSBQUzEuLjQgYXJlIGhlcmUgYXMgdGhleSBhcmUgbm90IGFsd2F5cyBzZXQsXG5cdC8vIC0gc29tZSB1c2VsZXNzIHRoaW5ncy5cblx0dmFyIGVudlZhcnMgPSAnXFxcXGIoPzpCQVNIfEJBU0hPUFRTfEJBU0hfQUxJQVNFU3xCQVNIX0FSR0N8QkFTSF9BUkdWfEJBU0hfQ01EU3xCQVNIX0NPTVBMRVRJT05fQ09NUEFUX0RJUnxCQVNIX0xJTkVOT3xCQVNIX1JFTUFUQ0h8QkFTSF9TT1VSQ0V8QkFTSF9WRVJTSU5GT3xCQVNIX1ZFUlNJT058Q09MT1JURVJNfENPTFVNTlN8Q09NUF9XT1JEQlJFQUtTfERCVVNfU0VTU0lPTl9CVVNfQUREUkVTU3xERUZBVUxUU19QQVRIfERFU0tUT1BfU0VTU0lPTnxESVJTVEFDS3xESVNQTEFZfEVVSUR8R0RNU0VTU0lPTnxHRE1fTEFOR3xHTk9NRV9LRVlSSU5HX0NPTlRST0x8R05PTUVfS0VZUklOR19QSUR8R1BHX0FHRU5UX0lORk98R1JPVVBTfEhJU1RDT05UUk9MfEhJU1RGSUxFfEhJU1RGSUxFU0laRXxISVNUU0laRXxIT01FfEhPU1ROQU1FfEhPU1RUWVBFfElGU3xJTlNUQU5DRXxKT0J8TEFOR3xMQU5HVUFHRXxMQ19BRERSRVNTfExDX0FMTHxMQ19JREVOVElGSUNBVElPTnxMQ19NRUFTVVJFTUVOVHxMQ19NT05FVEFSWXxMQ19OQU1FfExDX05VTUVSSUN8TENfUEFQRVJ8TENfVEVMRVBIT05FfExDX1RJTUV8TEVTU0NMT1NFfExFU1NPUEVOfExJTkVTfExPR05BTUV8TFNfQ09MT1JTfE1BQ0hUWVBFfE1BSUxDSEVDS3xNQU5EQVRPUllfUEFUSHxOT19BVF9CUklER0V8T0xEUFdEfE9QVEVSUnxPUFRJTkR8T1JCSVRfU09DS0VURElSfE9TVFlQRXxQQVBFUlNJWkV8UEFUSHxQSVBFU1RBVFVTfFBQSUR8UFMxfFBTMnxQUzN8UFM0fFBXRHxSQU5ET018UkVQTFl8U0VDT05EU3xTRUxJTlVYX0lOSVR8U0VTU0lPTnxTRVNTSU9OVFlQRXxTRVNTSU9OX01BTkFHRVJ8U0hFTEx8U0hFTExPUFRTfFNITFZMfFNTSF9BVVRIX1NPQ0t8VEVSTXxVSUR8VVBTVEFSVF9FVkVOVFN8VVBTVEFSVF9JTlNUQU5DRXxVUFNUQVJUX0pPQnxVUFNUQVJUX1NFU1NJT058VVNFUnxXSU5ET1dJRHxYQVVUSE9SSVRZfFhER19DT05GSUdfRElSU3xYREdfQ1VSUkVOVF9ERVNLVE9QfFhER19EQVRBX0RJUlN8WERHX0dSRUVURVJfREFUQV9ESVJ8WERHX01FTlVfUFJFRklYfFhER19SVU5USU1FX0RJUnxYREdfU0VBVHxYREdfU0VBVF9QQVRIfFhER19TRVNTSU9OX0RFU0tUT1B8WERHX1NFU1NJT05fSUR8WERHX1NFU1NJT05fUEFUSHxYREdfU0VTU0lPTl9UWVBFfFhER19WVE5SfFhNT0RJRklFUlMpXFxcXGInO1xuXHR2YXIgaW5zaWRlU3RyaW5nID0ge1xuXHRcdCdlbnZpcm9ubWVudCc6IHtcblx0XHRcdHBhdHRlcm46IFJlZ0V4cChcIlxcXFwkXCIgKyBlbnZWYXJzKSxcblx0XHRcdGFsaWFzOiAnY29uc3RhbnQnXG5cdFx0fSxcblx0XHQndmFyaWFibGUnOiBbXG5cdFx0XHQvLyBbMF06IEFyaXRobWV0aWMgRW52aXJvbm1lbnRcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogL1xcJD9cXChcXChbXFxzXFxTXSs/XFwpXFwpLyxcblx0XHRcdFx0Z3JlZWR5OiB0cnVlLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQvLyBJZiB0aGVyZSBpcyBhICQgc2lnbiBhdCB0aGUgYmVnaW5uaW5nIGhpZ2hsaWdodCAkKCggYW5kICkpIGFzIHZhcmlhYmxlXG5cdFx0XHRcdFx0J3ZhcmlhYmxlJzogW1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRwYXR0ZXJuOiAvKF5cXCRcXChcXChbXFxzXFxTXSspXFwpXFwpLyxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdC9eXFwkXFwoXFwoL1xuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0J251bWJlcic6IC9cXGIweFtcXGRBLUZhLWZdK1xcYnwoPzpcXGJcXGQrXFwuP1xcZCp8XFxCXFwuXFxkKykoPzpbRWVdLT9cXGQrKT8vLFxuXHRcdFx0XHRcdC8vIE9wZXJhdG9ycyBhY2NvcmRpbmcgdG8gaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9iYXNoL21hbnVhbC9iYXNocmVmLmh0bWwjU2hlbGwtQXJpdGhtZXRpY1xuXHRcdFx0XHRcdCdvcGVyYXRvcic6IC8tLT98LT18XFwrXFwrP3xcXCs9fCE9P3x+fFxcKlxcKj98XFwqPXxcXC89P3wlPT98PDw9P3w+Pj0/fDw9P3w+PT98PT0/fCYmP3wmPXxcXF49P3xcXHxcXHw/fFxcfD18XFw/fDovLFxuXHRcdFx0XHRcdC8vIElmIHRoZXJlIGlzIG5vICQgc2lnbiBhdCB0aGUgYmVnaW5uaW5nIGhpZ2hsaWdodCAoKCBhbmQgKSkgYXMgcHVuY3R1YXRpb25cblx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXFwoXFwoP3xcXClcXCk/fCx8Oy9cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdC8vIFsxXTogQ29tbWFuZCBTdWJzdGl0dXRpb25cblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogL1xcJFxcKCg/OlxcKFteKV0rXFwpfFteKCldKStcXCl8YFteYF0rYC8sXG5cdFx0XHRcdGdyZWVkeTogdHJ1ZSxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J3ZhcmlhYmxlJzogL15cXCRcXCh8XmB8XFwpJHxgJC9cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdC8vIFsyXTogQnJhY2UgZXhwYW5zaW9uXG5cdFx0XHR7XG5cdFx0XHRcdHBhdHRlcm46IC9cXCRcXHtbXn1dK1xcfS8sXG5cdFx0XHRcdGdyZWVkeTogdHJ1ZSxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J29wZXJhdG9yJzogLzpbLT0/K10/fFshXFwvXXwjIz98JSU/fFxcXlxcXj98LCw/Lyxcblx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvW1xcW1xcXV0vLFxuXHRcdFx0XHRcdCdlbnZpcm9ubWVudCc6IHtcblx0XHRcdFx0XHRcdHBhdHRlcm46IFJlZ0V4cChcIihcXFxceylcIiArIGVudlZhcnMpLFxuXHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRcdGFsaWFzOiAnY29uc3RhbnQnXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0L1xcJCg/Olxcdyt8WyM/KiFAJF0pL1xuXHRcdF0sXG5cdFx0Ly8gRXNjYXBlIHNlcXVlbmNlcyBmcm9tIGVjaG8gYW5kIHByaW50ZidzIG1hbnVhbHMsIGFuZCBlc2NhcGVkIHF1b3Rlcy5cblx0XHQnZW50aXR5JzogL1xcXFwoPzpbYWJjZUVmbnJ0dlxcXFxcIl18Tz9bMC03XXsxLDN9fHhbMC05YS1mQS1GXXsxLDJ9fHVbMC05YS1mQS1GXXs0fXxVWzAtOWEtZkEtRl17OH0pL1xuXHR9O1xuXG5cdFByaXNtLmxhbmd1YWdlcy5iYXNoID0ge1xuXHRcdCdzaGViYW5nJzoge1xuXHRcdFx0cGF0dGVybjogL14jIVxccypcXC8uKi8sXG5cdFx0XHRhbGlhczogJ2ltcG9ydGFudCdcblx0XHR9LFxuXHRcdCdjb21tZW50Jzoge1xuXHRcdFx0cGF0dGVybjogLyhefFteXCJ7XFxcXCRdKSMuKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHQnZnVuY3Rpb24tbmFtZSc6IFtcblx0XHRcdC8vIGEpIGZ1bmN0aW9uIGZvbyB7XG5cdFx0XHQvLyBiKSBmb28oKSB7XG5cdFx0XHQvLyBjKSBmdW5jdGlvbiBmb28oKSB7XG5cdFx0XHQvLyBidXQgbm90IOKAnGZvbyB74oCdXG5cdFx0XHR7XG5cdFx0XHRcdC8vIGEpIGFuZCBjKVxuXHRcdFx0XHRwYXR0ZXJuOiAvKFxcYmZ1bmN0aW9uXFxzKylcXHcrKD89KD86XFxzKlxcKD86XFxzKlxcKSk/XFxzKlxceykvLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0XHRhbGlhczogJ2Z1bmN0aW9uJ1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0Ly8gYilcblx0XHRcdFx0cGF0dGVybjogL1xcYlxcdysoPz1cXHMqXFwoXFxzKlxcKVxccypcXHspLyxcblx0XHRcdFx0YWxpYXM6ICdmdW5jdGlvbidcblx0XHRcdH1cblx0XHRdLFxuXHRcdC8vIEhpZ2hsaWdodCB2YXJpYWJsZSBuYW1lcyBhcyB2YXJpYWJsZXMgaW4gZm9yIGFuZCBzZWxlY3QgYmVnaW5uaW5ncy5cblx0XHQnZm9yLW9yLXNlbGVjdCc6IHtcblx0XHRcdHBhdHRlcm46IC8oXFxiKD86Zm9yfHNlbGVjdClcXHMrKVxcdysoPz1cXHMraW5cXHMpLyxcblx0XHRcdGFsaWFzOiAndmFyaWFibGUnLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0Ly8gSGlnaGxpZ2h0IHZhcmlhYmxlIG5hbWVzIGFzIHZhcmlhYmxlcyBpbiB0aGUgbGVmdC1oYW5kIHBhcnRcblx0XHQvLyBvZiBhc3NpZ25tZW50cyAo4oCcPeKAnSBhbmQg4oCcKz3igJ0pLlxuXHRcdCdhc3NpZ24tbGVmdCc6IHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXFxzO3wmXXxbPD5dXFwoKVxcdysoPz1cXCs/PSkvLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdlbnZpcm9ubWVudCc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoXCIoXnxbXFxcXHM7fCZdfFs8Pl1cXFxcKClcIiArIGVudlZhcnMpLFxuXHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdFx0YWxpYXM6ICdjb25zdGFudCdcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGFsaWFzOiAndmFyaWFibGUnLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0J3N0cmluZyc6IFtcblx0XHRcdC8vIFN1cHBvcnQgZm9yIEhlcmUtZG9jdW1lbnRzIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hlcmVfZG9jdW1lbnRcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogLygoPzpefFtePF0pPDwtP1xccyopKFxcdys/KVxccyooPzpcXHI/XFxufFxccikoPzpbXFxzXFxTXSkqPyg/Olxccj9cXG58XFxyKVxcMi8sXG5cdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdGdyZWVkeTogdHJ1ZSxcblx0XHRcdFx0aW5zaWRlOiBpbnNpZGVTdHJpbmdcblx0XHRcdH0sXG5cdFx0XHQvLyBIZXJlLWRvY3VtZW50IHdpdGggcXVvdGVzIGFyb3VuZCB0aGUgdGFnXG5cdFx0XHQvLyDihpIgTm8gZXhwYW5zaW9uIChzbyBubyDigJxpbnNpZGXigJ0pLlxuXHRcdFx0e1xuXHRcdFx0XHRwYXR0ZXJuOiAvKCg/Ol58W148XSk8PC0/XFxzKikoW1wiJ10pKFxcdyspXFwyXFxzKig/Olxccj9cXG58XFxyKSg/OltcXHNcXFNdKSo/KD86XFxyP1xcbnxcXHIpXFwzLyxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0Z3JlZWR5OiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Ly8g4oCcTm9ybWFs4oCdIHN0cmluZ1xuXHRcdFx0e1xuXHRcdFx0XHRwYXR0ZXJuOiAvKFtcIiddKSg/OlxcXFxbXFxzXFxTXXxcXCRcXChbXildK1xcKXxgW15gXStgfCg/IVxcMSlbXlxcXFxdKSpcXDEvLFxuXHRcdFx0XHRncmVlZHk6IHRydWUsXG5cdFx0XHRcdGluc2lkZTogaW5zaWRlU3RyaW5nXG5cdFx0XHR9XG5cdFx0XSxcblx0XHQnZW52aXJvbm1lbnQnOiB7XG5cdFx0XHRwYXR0ZXJuOiBSZWdFeHAoXCJcXFxcJD9cIiArIGVudlZhcnMpLFxuXHRcdFx0YWxpYXM6ICdjb25zdGFudCdcblx0XHR9LFxuXHRcdCd2YXJpYWJsZSc6IGluc2lkZVN0cmluZy52YXJpYWJsZSxcblx0XHQnZnVuY3Rpb24nOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W1xcczt8Jl18Wzw+XVxcKCkoPzphZGR8YXByb3Bvc3xhcHR8YXB0aXR1ZGV8YXB0LWNhY2hlfGFwdC1nZXR8YXNwZWxsfGF1dG9teXNxbGJhY2t1cHxhd2t8YmFzZW5hbWV8YmFzaHxiY3xiY29uc29sZXxiZ3xiemlwMnxjYWx8Y2F0fGNmZGlza3xjaGdycHxjaGtjb25maWd8Y2htb2R8Y2hvd258Y2hyb290fGNrc3VtfGNsZWFyfGNtcHxjb2x1bW58Y29tbXxjcHxjcm9ufGNyb250YWJ8Y3NwbGl0fGN1cmx8Y3V0fGRhdGV8ZGN8ZGR8ZGRyZXNjdWV8ZGVib290c3RyYXB8ZGZ8ZGlmZnxkaWZmM3xkaWd8ZGlyfGRpcmNvbG9yc3xkaXJuYW1lfGRpcnN8ZG1lc2d8ZHV8ZWdyZXB8ZWplY3R8ZW52fGV0aHRvb2x8ZXhwYW5kfGV4cGVjdHxleHByfGZkZm9ybWF0fGZkaXNrfGZnfGZncmVwfGZpbGV8ZmluZHxmbXR8Zm9sZHxmb3JtYXR8ZnJlZXxmc2NrfGZ0cHxmdXNlcnxnYXdrfGdpdHxncGFydGVkfGdyZXB8Z3JvdXBhZGR8Z3JvdXBkZWx8Z3JvdXBtb2R8Z3JvdXBzfGdydWItbWtjb25maWd8Z3ppcHxoYWx0fGhlYWR8aGd8aGlzdG9yeXxob3N0fGhvc3RuYW1lfGh0b3B8aWNvbnZ8aWR8aWZjb25maWd8aWZkb3dufGlmdXB8aW1wb3J0fGluc3RhbGx8aXB8am9ic3xqb2lufGtpbGx8a2lsbGFsbHxsZXNzfGxpbmt8bG58bG9jYXRlfGxvZ25hbWV8bG9ncm90YXRlfGxvb2t8bHBjfGxwcnxscHJpbnR8bHByaW50ZHxscHJpbnRxfGxwcm18bHN8bHNvZnxseW54fG1ha2V8bWFufG1jfG1kYWRtfG1rY29uZmlnfG1rZGlyfG1rZTJmc3xta2ZpZm98bWtmc3xta2lzb2ZzfG1rbm9kfG1rc3dhcHxtbXZ8bW9yZXxtb3N0fG1vdW50fG10b29sc3xtdHJ8bXV0dHxtdnxuYW5vfG5jfG5ldHN0YXR8bmljZXxubHxub2h1cHxub3RpZnktc2VuZHxucG18bnNsb29rdXB8b3B8b3BlbnxwYXJ0ZWR8cGFzc3dkfHBhc3RlfHBhdGhjaGt8cGluZ3xwa2lsbHxwbnBtfHBvcGR8cHJ8cHJpbnRjYXB8cHJpbnRlbnZ8cHN8cHVzaGR8cHZ8cXVvdGF8cXVvdGFjaGVja3xxdW90YWN0bHxyYW18cmFyfHJjcHxyZWJvb3R8cmVtc3luY3xyZW5hbWV8cmVuaWNlfHJldnxybXxybWRpcnxycG18cnN5bmN8c2NwfHNjcmVlbnxzZGlmZnxzZWR8c2VuZG1haWx8c2VxfHNlcnZpY2V8c2Z0cHxzaHxzaGVsbGNoZWNrfHNodWZ8c2h1dGRvd258c2xlZXB8c2xvY2F0ZXxzb3J0fHNwbGl0fHNzaHxzdGF0fHN0cmFjZXxzdXxzdWRvfHN1bXxzdXNwZW5kfHN3YXBvbnxzeW5jfHRhY3x0YWlsfHRhcnx0ZWV8dGltZXx0aW1lb3V0fHRvcHx0b3VjaHx0cnx0cmFjZXJvdXRlfHRzb3J0fHR0eXx1bW91bnR8dW5hbWV8dW5leHBhbmR8dW5pcXx1bml0c3x1bnJhcnx1bnNoYXJ8dW56aXB8dXBkYXRlLWdydWJ8dXB0aW1lfHVzZXJhZGR8dXNlcmRlbHx1c2VybW9kfHVzZXJzfHV1ZGVjb2RlfHV1ZW5jb2RlfHZ8dmRpcnx2aXx2aW18dmlyc2h8dm1zdGF0fHdhaXR8d2F0Y2h8d2N8d2dldHx3aGVyZWlzfHdoaWNofHdob3x3aG9hbWl8d3JpdGV8eGFyZ3N8eGRnLW9wZW58eWFybnx5ZXN8emVuaXR5fHppcHx6c2h8enlwcGVyKSg/PSR8WylcXHM7fCZdKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHQna2V5d29yZCc6IHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXFxzO3wmXXxbPD5dXFwoKSg/OmlmfHRoZW58ZWxzZXxlbGlmfGZpfGZvcnx3aGlsZXxpbnxjYXNlfGVzYWN8ZnVuY3Rpb258c2VsZWN0fGRvfGRvbmV8dW50aWwpKD89JHxbKVxcczt8Jl0pLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdC8vIGh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvYmFzaC9tYW51YWwvaHRtbF9ub2RlL1NoZWxsLUJ1aWx0aW4tQ29tbWFuZHMuaHRtbFxuXHRcdCdidWlsdGluJzoge1xuXHRcdFx0cGF0dGVybjogLyhefFtcXHM7fCZdfFs8Pl1cXCgpKD86XFwufDp8YnJlYWt8Y2R8Y29udGludWV8ZXZhbHxleGVjfGV4aXR8ZXhwb3J0fGdldG9wdHN8aGFzaHxwd2R8cmVhZG9ubHl8cmV0dXJufHNoaWZ0fHRlc3R8dGltZXN8dHJhcHx1bWFza3x1bnNldHxhbGlhc3xiaW5kfGJ1aWx0aW58Y2FsbGVyfGNvbW1hbmR8ZGVjbGFyZXxlY2hvfGVuYWJsZXxoZWxwfGxldHxsb2NhbHxsb2dvdXR8bWFwZmlsZXxwcmludGZ8cmVhZHxyZWFkYXJyYXl8c291cmNlfHR5cGV8dHlwZXNldHx1bGltaXR8dW5hbGlhc3xzZXR8c2hvcHQpKD89JHxbKVxcczt8Jl0pLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHQvLyBBbGlhcyBhZGRlZCB0byBtYWtlIHRob3NlIGVhc2llciB0byBkaXN0aW5ndWlzaCBmcm9tIHN0cmluZ3MuXG5cdFx0XHRhbGlhczogJ2NsYXNzLW5hbWUnXG5cdFx0fSxcblx0XHQnYm9vbGVhbic6IHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXFxzO3wmXXxbPD5dXFwoKSg/OnRydWV8ZmFsc2UpKD89JHxbKVxcczt8Jl0pLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdCdmaWxlLWRlc2NyaXB0b3InOiB7XG5cdFx0XHRwYXR0ZXJuOiAvXFxCJlxcZFxcYi8sXG5cdFx0XHRhbGlhczogJ2ltcG9ydGFudCdcblx0XHR9LFxuXHRcdCdvcGVyYXRvcic6IHtcblx0XHRcdC8vIExvdHMgb2YgcmVkaXJlY3Rpb25zIGhlcmUsIGJ1dCBub3QganVzdCB0aGF0LlxuXHRcdFx0cGF0dGVybjogL1xcZD88Pnw+XFx8fFxcKz18PT0/fCE9P3w9fnw8PFs8LV0/fFsmXFxkXT8+PnxcXGQ/Wzw+XSY/fCZbPiZdP3xcXHxbJnxdP3w8PT98Pj0/Lyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQnZmlsZS1kZXNjcmlwdG9yJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC9eXFxkLyxcblx0XHRcdFx0XHRhbGlhczogJ2ltcG9ydGFudCdcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0J3B1bmN0dWF0aW9uJzogL1xcJD9cXChcXCg/fFxcKVxcKT98XFwuXFwufFt7fVtcXF07XFxcXF0vLFxuXHRcdCdudW1iZXInOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF58XFxzKSg/OlsxLTldXFxkKnwwKSg/OlsuLF1cXGQrKT9cXGIvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH1cblx0fTtcblxuXHQvKiBQYXR0ZXJucyBpbiBjb21tYW5kIHN1YnN0aXR1dGlvbi4gKi9cblx0dmFyIHRvQmVDb3BpZWQgPSBbXG5cdFx0J2NvbW1lbnQnLFxuXHRcdCdmdW5jdGlvbi1uYW1lJyxcblx0XHQnZm9yLW9yLXNlbGVjdCcsXG5cdFx0J2Fzc2lnbi1sZWZ0Jyxcblx0XHQnc3RyaW5nJyxcblx0XHQnZW52aXJvbm1lbnQnLFxuXHRcdCdmdW5jdGlvbicsXG5cdFx0J2tleXdvcmQnLFxuXHRcdCdidWlsdGluJyxcblx0XHQnYm9vbGVhbicsXG5cdFx0J2ZpbGUtZGVzY3JpcHRvcicsXG5cdFx0J29wZXJhdG9yJyxcblx0XHQncHVuY3R1YXRpb24nLFxuXHRcdCdudW1iZXInXG5cdF07XG5cdHZhciBpbnNpZGUgPSBpbnNpZGVTdHJpbmcudmFyaWFibGVbMV0uaW5zaWRlO1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgdG9CZUNvcGllZC5sZW5ndGg7IGkrKykge1xuXHRcdGluc2lkZVt0b0JlQ29waWVkW2ldXSA9IFByaXNtLmxhbmd1YWdlcy5iYXNoW3RvQmVDb3BpZWRbaV1dO1xuXHR9XG5cblx0UHJpc20ubGFuZ3VhZ2VzLnNoZWxsID0gUHJpc20ubGFuZ3VhZ2VzLmJhc2g7XG59KShQcmlzbSk7XG4iLCJpbXBvcnQgeyBsYW5ncyB9IGZyb20gJ0BzdmVsdGVqcy9zaXRlLWtpdC91dGlscy9tYXJrZG93bi5qcyc7XG5pbXBvcnQgUHJpc21KUyBmcm9tICdwcmlzbWpzJztcbmltcG9ydCAncHJpc21qcy9jb21wb25lbnRzL3ByaXNtLWJhc2gnO1xuXG5leHBvcnQgZnVuY3Rpb24gaGlnaGxpZ2h0KHNvdXJjZSwgbGFuZykge1xuXHRjb25zdCBwbGFuZyA9IGxhbmdzW2xhbmddIHx8ICcnO1xuXHRjb25zdCBoaWdobGlnaHRlZCA9IHBsYW5nID8gUHJpc21KUy5oaWdobGlnaHQoXG5cdFx0c291cmNlLFxuXHRcdFByaXNtSlMubGFuZ3VhZ2VzW3BsYW5nXSxcblx0XHRsYW5nLFxuXHQpIDogc291cmNlLnJlcGxhY2UoL1smPD5dL2csIGMgPT4gKHsgJyYnOiAnJmFtcDsnLCAnPCc6ICcmbHQ7JywgJz4nOiAnJmd0OycgfSlbY10pO1xuXG5cdHJldHVybiBgPHByZSBjbGFzcz0nbGFuZ3VhZ2UtJHtwbGFuZ30nPjxjb2RlPiR7aGlnaGxpZ2h0ZWR9PC9jb2RlPjwvcHJlPmA7XG59XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnO1xuaW1wb3J0IHNlbmQgZnJvbSAnQHBvbGthL3NlbmQnO1xuaW1wb3J0IHsgZXh0cmFjdF9mcm9udG1hdHRlciwgZXh0cmFjdF9tZXRhZGF0YSwgbGlua19yZW5kZXJlciB9IGZyb20gJ0BzdmVsdGVqcy9zaXRlLWtpdC91dGlscy9tYXJrZG93bic7XG5pbXBvcnQgeyBoaWdobGlnaHQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9oaWdobGlnaHQnO1xuXG5jb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcblxuZnVuY3Rpb24gZmluZF90dXRvcmlhbChzbHVnKSB7XG5cdGNvbnN0IHNlY3Rpb25zID0gZnMucmVhZGRpclN5bmMoYGNvbnRlbnQvdHV0b3JpYWxgKTtcblxuXHRmb3IgKGNvbnN0IHNlY3Rpb24gb2Ygc2VjdGlvbnMpIHtcblx0XHRjb25zdCBjaGFwdGVycyA9IGZzLnJlYWRkaXJTeW5jKGBjb250ZW50L3R1dG9yaWFsLyR7c2VjdGlvbn1gKS5maWx0ZXIoZGlyID0+IC9eXFxkKy8udGVzdChkaXIpKTtcblx0XHRmb3IgKGNvbnN0IGNoYXB0ZXIgb2YgY2hhcHRlcnMpIHtcblx0XHRcdGlmIChzbHVnID09PSBjaGFwdGVyLnJlcGxhY2UoL15cXGQrLS8sICcnKSkge1xuXHRcdFx0XHRyZXR1cm4geyBzZWN0aW9uLCBjaGFwdGVyIH07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldF90dXRvcmlhbChzbHVnKSB7XG5cdGNvbnN0IGZvdW5kID0gZmluZF90dXRvcmlhbChzbHVnKTtcblx0aWYgKCFmb3VuZCkgcmV0dXJuIGZvdW5kO1xuXG5cdGNvbnN0IGRpciA9IGBjb250ZW50L3R1dG9yaWFsLyR7Zm91bmQuc2VjdGlvbn0vJHtmb3VuZC5jaGFwdGVyfWA7XG5cblx0Y29uc3QgbWFya2Rvd24gPSBmcy5yZWFkRmlsZVN5bmMoYCR7ZGlyfS90ZXh0Lm1kYCwgJ3V0Zi04Jyk7XG5cdGNvbnN0IGFwcF9hID0gZnMucmVhZGRpclN5bmMoYCR7ZGlyfS9hcHAtYWApO1xuXHRjb25zdCBhcHBfYiA9IGZzLmV4aXN0c1N5bmMoYCR7ZGlyfS9hcHAtYmApICYmIGZzLnJlYWRkaXJTeW5jKGAke2Rpcn0vYXBwLWJgKTtcblxuXHRjb25zdCB7IGNvbnRlbnQgfSA9IGV4dHJhY3RfZnJvbnRtYXR0ZXIobWFya2Rvd24pO1xuXG5cdGNvbnN0IHJlbmRlcmVyID0gbmV3IG1hcmtlZC5SZW5kZXJlcigpO1xuXG5cdHJlbmRlcmVyLmxpbmsgPSBsaW5rX3JlbmRlcmVyO1xuXG5cdHJlbmRlcmVyLmNvZGUgPSAoc291cmNlLCBsYW5nKSA9PiB7XG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoL14gKy9nbSwgbWF0Y2ggPT5cblx0XHRcdG1hdGNoLnNwbGl0KCcgICAgJykuam9pbignXFx0Jylcblx0XHQpO1xuXG5cdFx0Y29uc3QgbGluZXMgPSBzb3VyY2Uuc3BsaXQoJ1xcbicpO1xuXG5cdFx0Y29uc3QgbWV0YSA9IGV4dHJhY3RfbWV0YWRhdGEobGluZXNbMF0sIGxhbmcpO1xuXG5cdFx0bGV0IHByZWZpeCA9ICcnO1xuXHRcdGxldCBjbGFzc05hbWUgPSAnY29kZS1ibG9jayc7XG5cblx0XHRpZiAobWV0YSkge1xuXHRcdFx0c291cmNlID0gbGluZXMuc2xpY2UoMSkuam9pbignXFxuJyk7XG5cdFx0XHRjb25zdCBmaWxlbmFtZSA9IG1ldGEuZmlsZW5hbWUgfHwgKGxhbmcgPT09ICdodG1sJyAmJiAnQXBwLnN2ZWx0ZScpO1xuXHRcdFx0aWYgKGZpbGVuYW1lKSB7XG5cdFx0XHRcdHByZWZpeCA9IGA8c3BhbiBjbGFzcz0nZmlsZW5hbWUnPiR7cHJlZml4fSAke2ZpbGVuYW1lfTwvc3Bhbj5gO1xuXHRcdFx0XHRjbGFzc05hbWUgKz0gJyBuYW1lZCc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGA8ZGl2IGNsYXNzPScke2NsYXNzTmFtZX0nPiR7cHJlZml4fSR7aGlnaGxpZ2h0KHNvdXJjZSwgbGFuZyl9PC9kaXY+YDtcblx0fTtcblxuXHRsZXQgaHRtbCA9IG1hcmtlZChjb250ZW50LCB7IHJlbmRlcmVyIH0pO1xuXHRpZiAoZm91bmQuY2hhcHRlci5zdGFydHNXaXRoKCcwMScpKSB7XG5cdFx0Y29uc3QgbWV0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGBjb250ZW50L3R1dG9yaWFsLyR7Zm91bmQuc2VjdGlvbn0vbWV0YS5qc29uYCkpO1xuXHRcdGh0bWwgPSBgPGgyPiR7bWV0YS50aXRsZX08L2gyPlxcbiR7aHRtbH1gO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0X2ZpbGUoc3RhZ2UsIGZpbGUpIHtcblx0XHRjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZSk7XG5cdFx0Y29uc3QgbmFtZSA9IGZpbGUuc2xpY2UoMCwgLWV4dC5sZW5ndGgpO1xuXHRcdGNvbnN0IHR5cGUgPSBleHQuc2xpY2UoMSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZSxcblx0XHRcdHR5cGUsXG5cdFx0XHRzb3VyY2U6IGZzLnJlYWRGaWxlU3luYyhgJHtkaXJ9LyR7c3RhZ2V9LyR7ZmlsZX1gLCAndXRmLTgnKVxuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGh0bWwsXG5cdFx0YXBwX2E6IGFwcF9hLm1hcChmaWxlID0+IGdldF9maWxlKCdhcHAtYScsIGZpbGUpKSxcblx0XHRhcHBfYjogYXBwX2IgJiYgYXBwX2IubWFwKGZpbGUgPT4gZ2V0X2ZpbGUoJ2FwcC1iJywgZmlsZSkpXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQocmVxLCByZXMpIHtcblx0Y29uc3QgeyBzbHVnIH0gPSByZXEucGFyYW1zO1xuXG5cdGxldCB0dXQgPSBjYWNoZS5nZXQoc2x1Zyk7XG5cdGlmICghdHV0IHx8IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcblx0XHR0dXQgPSBnZXRfdHV0b3JpYWwoc2x1Zyk7XG5cdFx0Y2FjaGUuc2V0KHNsdWcsIHR1dCk7XG5cdH1cblxuXHRpZiAodHV0KSB7XG5cdFx0c2VuZChyZXMsIDIwMCwgdHV0KTtcblx0fSBlbHNlIHtcblx0XHRzZW5kKHJlcywgNDA0LCB7IG1lc3NhZ2U6ICdub3QgZm91bmQnIH0pO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBQb29sIH0gZnJvbSAncGcnO1xuXG4vLyBVc2VzIGBQRypgIEVOViB2YXJzXG5leHBvcnQgY29uc3QgREIgPSBwcm9jZXNzLmVudi5QR0hPU1QgPyBuZXcgUG9vbCgpIDogbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5KHRleHQsIHZhbHVlcz1bXSkge1xuXHRyZXR1cm4gREIucXVlcnkodGV4dCwgdmFsdWVzKS50aGVuKHIgPT4gci5yb3dzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmQodGV4dCwgdmFsdWVzPVtdKSB7XG5cdHJldHVybiBxdWVyeSh0ZXh0LCB2YWx1ZXMpLnRoZW4oYXJyID0+IGFyclswXSk7XG59XG4iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgeyBxdWVyeSB9IGZyb20gJy4uLy4uL3V0aWxzL2RiJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xuXHRpZiAocmVxLnVzZXIpIHtcblx0XHRjb25zdCBwYWdlX3NpemUgPSAxMDA7XG5cdFx0Y29uc3Qgb2Zmc2V0ID0gcmVxLnF1ZXJ5Lm9mZnNldCA/IHBhcnNlSW50KHJlcS5xdWVyeS5vZmZzZXQpIDogMDtcblx0XHRjb25zdCByb3dzID0gYXdhaXQgcXVlcnkoYFxuXHRcdFx0c2VsZWN0IGcudWlkLCBnLm5hbWUsIGNvYWxlc2NlKGcudXBkYXRlZF9hdCwgZy5jcmVhdGVkX2F0KSBhcyB1cGRhdGVkX2F0XG5cdFx0XHRmcm9tIGdpc3RzIGdcblx0XHRcdHdoZXJlIGcudXNlcl9pZCA9ICQxXG5cdFx0XHRvcmRlciBieSBpZCBkZXNjXG5cdFx0XHRsaW1pdCAke3BhZ2Vfc2l6ZSArIDF9XG5cdFx0XHRvZmZzZXQgJDJcblx0XHRgLCBbcmVxLnVzZXIuaWQsIG9mZnNldF0pO1xuXG5cdFx0cm93cy5mb3JFYWNoKHJvdyA9PiB7XG5cdFx0XHRyb3cudWlkID0gcm93LnVpZC5yZXBsYWNlKC8tL2csICcnKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IG1vcmUgPSByb3dzLmxlbmd0aCA+IHBhZ2Vfc2l6ZTtcblx0XHRzZW5kKHJlcywgMjAwLCB7IGFwcHM6IHJvd3Muc2xpY2UoMCwgcGFnZV9zaXplKSwgb2Zmc2V0OiBtb3JlID8gb2Zmc2V0ICsgcGFnZV9zaXplIDogbnVsbCB9KTtcblx0fSBlbHNlIHtcblx0XHRzZW5kKHJlcywgNDAxKTtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgY29va2llIGZyb20gJ2Nvb2tpZSc7XG5pbXBvcnQgZmxydSBmcm9tICdmbHJ1JztcbmltcG9ydCB7IGZpbmQsIHF1ZXJ5IH0gZnJvbSAnLi9kYic7XG5cbmV4cG9ydCBjb25zdCBzYW5pdGl6ZV91c2VyID0gb2JqID0+IG9iaiAmJiAoe1xuXHR1aWQ6IG9iai51aWQsXG5cdHVzZXJuYW1lOiBvYmoudXNlcm5hbWUsXG5cdG5hbWU6IG9iai5uYW1lLFxuXHRhdmF0YXI6IG9iai5hdmF0YXJcbn0pO1xuXG5jb25zdCBzZXNzaW9uX2NhY2hlID0gZmxydSgxMDAwKTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZV91c2VyID0gYXN5bmMgKGdoX3VzZXIsIGFjY2Vzc190b2tlbikgPT4ge1xuXHRyZXR1cm4gYXdhaXQgZmluZChgXG5cdFx0aW5zZXJ0IGludG8gdXNlcnModWlkLCBuYW1lLCB1c2VybmFtZSwgYXZhdGFyLCBnaXRodWJfdG9rZW4pXG5cdFx0dmFsdWVzICgkMSwgJDIsICQzLCAkNCwgJDUpIG9uIGNvbmZsaWN0ICh1aWQpIGRvIHVwZGF0ZVxuXHRcdHNldCAobmFtZSwgdXNlcm5hbWUsIGF2YXRhciwgZ2l0aHViX3Rva2VuLCB1cGRhdGVkX2F0KSA9ICgkMiwgJDMsICQ0LCAkNSwgbm93KCkpXG5cdFx0cmV0dXJuaW5nIGlkLCB1aWQsIHVzZXJuYW1lLCBuYW1lLCBhdmF0YXJcblx0YCwgW2doX3VzZXIuaWQsIGdoX3VzZXIubmFtZSwgZ2hfdXNlci5sb2dpbiwgZ2hfdXNlci5hdmF0YXJfdXJsLCBhY2Nlc3NfdG9rZW5dKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVfc2Vzc2lvbiA9IGFzeW5jIHVzZXIgPT4ge1xuXHRjb25zdCBzZXNzaW9uID0gYXdhaXQgZmluZChgXG5cdFx0aW5zZXJ0IGludG8gc2Vzc2lvbnModXNlcl9pZClcblx0XHR2YWx1ZXMgKCQxKVxuXHRcdHJldHVybmluZyB1aWRcblx0YCwgW3VzZXIuaWRdKTtcblxuXHRzZXNzaW9uX2NhY2hlLnNldChzZXNzaW9uLnVpZCwgdXNlcik7XG5cblx0cmV0dXJuIHNlc3Npb247XG59O1xuXG5leHBvcnQgY29uc3QgZGVsZXRlX3Nlc3Npb24gPSBhc3luYyBzaWQgPT4ge1xuXHRhd2FpdCBxdWVyeShgZGVsZXRlIGZyb20gc2Vzc2lvbnMgd2hlcmUgdWlkID0gJDFgLCBbc2lkXSk7XG5cdHNlc3Npb25fY2FjaGUuc2V0KHNpZCwgbnVsbCk7XG59O1xuXG5jb25zdCBnZXRfdXNlciA9IGFzeW5jIHNpZCA9PiB7XG5cdGlmICghc2lkKSByZXR1cm4gbnVsbDtcblxuXHRpZiAoIXNlc3Npb25fY2FjaGUuaGFzKHNpZCkpIHtcblx0XHRzZXNzaW9uX2NhY2hlLnNldChzaWQsIGF3YWl0IGZpbmQoYFxuXHRcdFx0c2VsZWN0IHVzZXJzLmlkLCB1c2Vycy51aWQsIHVzZXJzLnVzZXJuYW1lLCB1c2Vycy5uYW1lLCB1c2Vycy5hdmF0YXJcblx0XHRcdGZyb20gc2Vzc2lvbnNcblx0XHRcdGxlZnQgam9pbiB1c2VycyBvbiBzZXNzaW9ucy51c2VyX2lkID0gdXNlcnMuaWRcblx0XHRcdHdoZXJlIHNlc3Npb25zLnVpZCA9ICQxIGFuZCBleHBpcnkgPiBub3coKVxuXHRcdGAsIFtzaWRdKSk7XG5cdH1cblxuXHRyZXR1cm4gc2Vzc2lvbl9jYWNoZS5nZXQoc2lkKTtcbn07XG5cbmV4cG9ydCBjb25zdCBhdXRoZW50aWNhdGUgPSAoKSA9PiB7XG5cdC8vIHRoaXMgaXMgYSBjb252ZW5pZW50IHRpbWUgdG8gY2xlYXIgb3V0IGV4cGlyZWQgc2Vzc2lvbnNcblx0cXVlcnkoYGRlbGV0ZSBmcm9tIHNlc3Npb25zIHdoZXJlIGV4cGlyeSA8IG5vdygpYCk7XG5cblx0cmV0dXJuIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuXHRcdHJlcS5jb29raWVzID0gY29va2llLnBhcnNlKHJlcS5oZWFkZXJzLmNvb2tpZSB8fCAnJyk7XG5cdFx0cmVxLnVzZXIgPSBhd2FpdCBnZXRfdXNlcihyZXEuY29va2llcy5zaWQpO1xuXG5cdFx0bmV4dCgpO1xuXHR9O1xufTsiLCJleHBvcnQgY29uc3Qgb2F1dGggPSAnaHR0cHM6Ly9naXRodWIuY29tL2xvZ2luL29hdXRoJztcbmV4cG9ydCBjb25zdCBiYXNldXJsID0gcHJvY2Vzcy5lbnYuQkFTRVVSTDtcbmV4cG9ydCBjb25zdCBzZWN1cmUgPSBiYXNldXJsICYmIGJhc2V1cmwuc3RhcnRzV2l0aCgnaHR0cHM6Jyk7XG5cbmV4cG9ydCBjb25zdCBjbGllbnRfaWQgPSBwcm9jZXNzLmVudi5HSVRIVUJfQ0xJRU5UX0lEO1xuZXhwb3J0IGNvbnN0IGNsaWVudF9zZWNyZXQgPSBwcm9jZXNzLmVudi5HSVRIVUJfQ0xJRU5UX1NFQ1JFVDsiLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgZGV2YWx1ZSBmcm9tICdkZXZhbHVlJztcbmltcG9ydCAqIGFzIGNvb2tpZSBmcm9tICdjb29raWUnO1xuaW1wb3J0ICogYXMgaHR0cGllIGZyb20gJ2h0dHBpZSc7XG5pbXBvcnQgeyBwYXJzZSwgc3RyaW5naWZ5IH0gZnJvbSAncXVlcnlzdHJpbmcnO1xuaW1wb3J0IHsgc2FuaXRpemVfdXNlciwgY3JlYXRlX3VzZXIsIGNyZWF0ZV9zZXNzaW9uIH0gZnJvbSAnLi4vLi4vdXRpbHMvYXV0aCc7XG5pbXBvcnQgeyBvYXV0aCwgc2VjdXJlLCBjbGllbnRfaWQsIGNsaWVudF9zZWNyZXQgfSBmcm9tICcuL19jb25maWcuanMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XG5cdHRyeSB7XG5cdFx0Ly8gVHJhZGUgXCJjb2RlXCIgZm9yIFwiYWNjZXNzX3Rva2VuXCJcblx0XHRjb25zdCByMSA9IGF3YWl0IGh0dHBpZS5wb3N0KGAke29hdXRofS9hY2Nlc3NfdG9rZW4/YCArIHN0cmluZ2lmeSh7XG5cdFx0XHRjb2RlOiByZXEucXVlcnkuY29kZSxcblx0XHRcdGNsaWVudF9pZCxcblx0XHRcdGNsaWVudF9zZWNyZXQsXG5cdFx0fSkpO1xuXG5cdFx0Ly8gTm93IGZldGNoIFVzZXIgZGV0YWlsc1xuXHRcdGNvbnN0IHsgYWNjZXNzX3Rva2VuIH0gPSBwYXJzZShyMS5kYXRhKTtcblx0XHRjb25zdCByMiA9IGF3YWl0IGh0dHBpZS5nZXQoJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlcicsIHtcblx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0J1VzZXItQWdlbnQnOiAnc3ZlbHRlLmRldicsXG5cdFx0XHRcdEF1dGhvcml6YXRpb246IGB0b2tlbiAke2FjY2Vzc190b2tlbn1gXG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRjb25zdCB1c2VyID0gYXdhaXQgY3JlYXRlX3VzZXIocjIuZGF0YSwgYWNjZXNzX3Rva2VuKTtcblx0XHRjb25zdCBzZXNzaW9uID0gYXdhaXQgY3JlYXRlX3Nlc3Npb24odXNlcik7XG5cblx0XHRyZXMud3JpdGVIZWFkKDIwMCwge1xuXHRcdFx0J1NldC1Db29raWUnOiBjb29raWUuc2VyaWFsaXplKCdzaWQnLCBzZXNzaW9uLnVpZCwge1xuXHRcdFx0XHRtYXhBZ2U6IDMxNTM2MDAwLFxuXHRcdFx0XHRwYXRoOiAnLycsXG5cdFx0XHRcdGh0dHBPbmx5OiB0cnVlLFxuXHRcdFx0XHRzZWN1cmVcblx0XHRcdH0pLFxuXHRcdFx0J0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnXG5cdFx0fSk7XG5cblx0XHRyZXMuZW5kKGBcblx0XHRcdDxzY3JpcHQ+XG5cdFx0XHRcdHdpbmRvdy5vcGVuZXIucG9zdE1lc3NhZ2Uoe1xuXHRcdFx0XHRcdHVzZXI6ICR7ZGV2YWx1ZShzYW5pdGl6ZV91c2VyKHVzZXIpKX1cblx0XHRcdFx0fSwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG5cdFx0XHQ8L3NjcmlwdD5cblx0XHRgKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Y29uc29sZS5lcnJvcignR0VUIC9hdXRoL2NhbGxiYWNrJywgZXJyKTtcblx0XHRzZW5kKHJlcywgNTAwLCBlcnIuZGF0YSwge1xuXHRcdFx0J0NvbnRlbnQtVHlwZSc6IGVyci5oZWFkZXJzWydjb250ZW50LXR5cGUnXSxcblx0XHRcdCdDb250ZW50LUxlbmd0aCc6IGVyci5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddXG5cdFx0fSk7XG5cdH1cbn0iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgKiBhcyBjb29raWUgZnJvbSAnY29va2llJztcbmltcG9ydCB7IHNlY3VyZSB9IGZyb20gJy4vX2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBkZWxldGVfc2Vzc2lvbiB9IGZyb20gJy4uLy4uL3V0aWxzL2F1dGguanMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XG5cdGF3YWl0IGRlbGV0ZV9zZXNzaW9uKHJlcS5jb29raWVzLnNpZCk7XG5cblx0c2VuZChyZXMsIDIwMCwgJycsIHtcblx0XHQnU2V0LUNvb2tpZSc6IGNvb2tpZS5zZXJpYWxpemUoJ3NpZCcsICcnLCB7XG5cdFx0XHRtYXhBZ2U6IC0xLFxuXHRcdFx0cGF0aDogJy8nLFxuXHRcdFx0aHR0cE9ubHk6IHRydWUsXG5cdFx0XHRzZWN1cmVcblx0XHR9KVxuXHR9KTtcbn0iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tICdxdWVyeXN0cmluZyc7XG5pbXBvcnQgeyBvYXV0aCwgYmFzZXVybCwgY2xpZW50X2lkIH0gZnJvbSAnLi9fY29uZmlnLmpzJztcblxuZXhwb3J0IGNvbnN0IGdldCA9IGNsaWVudF9pZFxuXHQ/IChyZXEsIHJlcykgPT4ge1xuXHRcdGNvbnN0IExvY2F0aW9uID0gYCR7b2F1dGh9L2F1dGhvcml6ZT9gICsgc3RyaW5naWZ5KHtcblx0XHRcdHNjb3BlOiAncmVhZDp1c2VyJyxcblx0XHRcdGNsaWVudF9pZCxcblx0XHRcdHJlZGlyZWN0X3VyaTogYCR7YmFzZXVybH0vYXV0aC9jYWxsYmFja2AsXG5cdFx0fSk7XG5cblx0XHRzZW5kKHJlcywgMzAyLCBMb2NhdGlvbiwgeyBMb2NhdGlvbiB9KTtcblx0fVxuXHQ6IChyZXEsIHJlcykgPT4ge1xuXHRcdHNlbmQocmVzLCA1MDAsIGBcblx0XHRcdDxib2R5IHN0eWxlPVwiZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7IGJhY2tncm91bmQ6IHJnYigyNTUsMjE1LDIxNSk7IGJvcmRlcjogMnB4IHNvbGlkIHJlZDsgbWFyZ2luOiAwOyBwYWRkaW5nOiAxZW07XCI+XG5cdFx0XHRcdDxoMT5NaXNzaW5nIC5lbnYgZmlsZTwvaDE+XG5cdFx0XHRcdDxwPkluIG9yZGVyIHRvIHVzZSBHaXRIdWIgYXV0aGVudGljYXRpb24sIHlvdSB3aWxsIG5lZWQgdG8gPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy9kZXZlbG9wZXJzXCI+cmVnaXN0ZXIgYW4gT0F1dGggYXBwbGljYXRpb248L2E+IGFuZCBjcmVhdGUgYSBsb2NhbCAuZW52IGZpbGU6PC9wPlxuXHRcdFx0XHQ8cHJlPkdJVEhVQl9DTElFTlRfSUQ9W1lPVVJfQVBQX0lEXVxcbkdJVEhVQl9DTElFTlRfU0VDUkVUPVtZT1VSX0FQUF9TRUNSRVRdXFxuQkFTRVVSTD1odHRwOi8vbG9jYWxob3N0OjMwMDA8L3ByZT5cblx0XHRcdFx0PHA+VGhlIDxjb2RlPkJBU0VVUkw8L2NvZGU+IHZhcmlhYmxlIHNob3VsZCBtYXRjaCB0aGUgY2FsbGJhY2sgVVJMIHNwZWNpZmllZCBmb3IgeW91ciBhcHAuPC9wPlxuXHRcdFx0XHQ8cD5TZWUgYWxzbyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3N2ZWx0ZWpzL3N2ZWx0ZS90cmVlL21hc3Rlci9zaXRlI3JlcGwtZ2l0aHViLWludGVncmF0aW9uXCI+aGVyZTwvYT48L3A+XG5cdFx0XHQ8L2JvZHk+XG5cdFx0YCwge1xuXHRcdFx0J0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnXG5cdFx0fSk7XG5cdH07IiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggTGF0aW4gVW5pY29kZSBsZXR0ZXJzIChleGNsdWRpbmcgbWF0aGVtYXRpY2FsIG9wZXJhdG9ycykuICovXG52YXIgcmVMYXRpbiA9IC9bXFx4YzAtXFx4ZDZcXHhkOC1cXHhmNlxceGY4LVxceGZmXFx1MDEwMC1cXHUwMTdmXS9nO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIHVuaWNvZGUgY2hhcmFjdGVyIGNsYXNzZXMuICovXG52YXIgcnNDb21ib01hcmtzUmFuZ2UgPSAnXFxcXHUwMzAwLVxcXFx1MDM2ZlxcXFx1ZmUyMC1cXFxcdWZlMjMnLFxuICAgIHJzQ29tYm9TeW1ib2xzUmFuZ2UgPSAnXFxcXHUyMGQwLVxcXFx1MjBmMCc7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgdW5pY29kZSBjYXB0dXJlIGdyb3Vwcy4gKi9cbnZhciByc0NvbWJvID0gJ1snICsgcnNDb21ib01hcmtzUmFuZ2UgKyByc0NvbWJvU3ltYm9sc1JhbmdlICsgJ10nO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggW2NvbWJpbmluZyBkaWFjcml0aWNhbCBtYXJrc10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29tYmluaW5nX0RpYWNyaXRpY2FsX01hcmtzKSBhbmRcbiAqIFtjb21iaW5pbmcgZGlhY3JpdGljYWwgbWFya3MgZm9yIHN5bWJvbHNdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvbWJpbmluZ19EaWFjcml0aWNhbF9NYXJrc19mb3JfU3ltYm9scykuXG4gKi9cbnZhciByZUNvbWJvTWFyayA9IFJlZ0V4cChyc0NvbWJvLCAnZycpO1xuXG4vKiogVXNlZCB0byBtYXAgTGF0aW4gVW5pY29kZSBsZXR0ZXJzIHRvIGJhc2ljIExhdGluIGxldHRlcnMuICovXG52YXIgZGVidXJyZWRMZXR0ZXJzID0ge1xuICAvLyBMYXRpbi0xIFN1cHBsZW1lbnQgYmxvY2suXG4gICdcXHhjMCc6ICdBJywgICdcXHhjMSc6ICdBJywgJ1xceGMyJzogJ0EnLCAnXFx4YzMnOiAnQScsICdcXHhjNCc6ICdBJywgJ1xceGM1JzogJ0EnLFxuICAnXFx4ZTAnOiAnYScsICAnXFx4ZTEnOiAnYScsICdcXHhlMic6ICdhJywgJ1xceGUzJzogJ2EnLCAnXFx4ZTQnOiAnYScsICdcXHhlNSc6ICdhJyxcbiAgJ1xceGM3JzogJ0MnLCAgJ1xceGU3JzogJ2MnLFxuICAnXFx4ZDAnOiAnRCcsICAnXFx4ZjAnOiAnZCcsXG4gICdcXHhjOCc6ICdFJywgICdcXHhjOSc6ICdFJywgJ1xceGNhJzogJ0UnLCAnXFx4Y2InOiAnRScsXG4gICdcXHhlOCc6ICdlJywgICdcXHhlOSc6ICdlJywgJ1xceGVhJzogJ2UnLCAnXFx4ZWInOiAnZScsXG4gICdcXHhjYyc6ICdJJywgICdcXHhjZCc6ICdJJywgJ1xceGNlJzogJ0knLCAnXFx4Y2YnOiAnSScsXG4gICdcXHhlYyc6ICdpJywgICdcXHhlZCc6ICdpJywgJ1xceGVlJzogJ2knLCAnXFx4ZWYnOiAnaScsXG4gICdcXHhkMSc6ICdOJywgICdcXHhmMSc6ICduJyxcbiAgJ1xceGQyJzogJ08nLCAgJ1xceGQzJzogJ08nLCAnXFx4ZDQnOiAnTycsICdcXHhkNSc6ICdPJywgJ1xceGQ2JzogJ08nLCAnXFx4ZDgnOiAnTycsXG4gICdcXHhmMic6ICdvJywgICdcXHhmMyc6ICdvJywgJ1xceGY0JzogJ28nLCAnXFx4ZjUnOiAnbycsICdcXHhmNic6ICdvJywgJ1xceGY4JzogJ28nLFxuICAnXFx4ZDknOiAnVScsICAnXFx4ZGEnOiAnVScsICdcXHhkYic6ICdVJywgJ1xceGRjJzogJ1UnLFxuICAnXFx4ZjknOiAndScsICAnXFx4ZmEnOiAndScsICdcXHhmYic6ICd1JywgJ1xceGZjJzogJ3UnLFxuICAnXFx4ZGQnOiAnWScsICAnXFx4ZmQnOiAneScsICdcXHhmZic6ICd5JyxcbiAgJ1xceGM2JzogJ0FlJywgJ1xceGU2JzogJ2FlJyxcbiAgJ1xceGRlJzogJ1RoJywgJ1xceGZlJzogJ3RoJyxcbiAgJ1xceGRmJzogJ3NzJyxcbiAgLy8gTGF0aW4gRXh0ZW5kZWQtQSBibG9jay5cbiAgJ1xcdTAxMDAnOiAnQScsICAnXFx1MDEwMic6ICdBJywgJ1xcdTAxMDQnOiAnQScsXG4gICdcXHUwMTAxJzogJ2EnLCAgJ1xcdTAxMDMnOiAnYScsICdcXHUwMTA1JzogJ2EnLFxuICAnXFx1MDEwNic6ICdDJywgICdcXHUwMTA4JzogJ0MnLCAnXFx1MDEwYSc6ICdDJywgJ1xcdTAxMGMnOiAnQycsXG4gICdcXHUwMTA3JzogJ2MnLCAgJ1xcdTAxMDknOiAnYycsICdcXHUwMTBiJzogJ2MnLCAnXFx1MDEwZCc6ICdjJyxcbiAgJ1xcdTAxMGUnOiAnRCcsICAnXFx1MDExMCc6ICdEJywgJ1xcdTAxMGYnOiAnZCcsICdcXHUwMTExJzogJ2QnLFxuICAnXFx1MDExMic6ICdFJywgICdcXHUwMTE0JzogJ0UnLCAnXFx1MDExNic6ICdFJywgJ1xcdTAxMTgnOiAnRScsICdcXHUwMTFhJzogJ0UnLFxuICAnXFx1MDExMyc6ICdlJywgICdcXHUwMTE1JzogJ2UnLCAnXFx1MDExNyc6ICdlJywgJ1xcdTAxMTknOiAnZScsICdcXHUwMTFiJzogJ2UnLFxuICAnXFx1MDExYyc6ICdHJywgICdcXHUwMTFlJzogJ0cnLCAnXFx1MDEyMCc6ICdHJywgJ1xcdTAxMjInOiAnRycsXG4gICdcXHUwMTFkJzogJ2cnLCAgJ1xcdTAxMWYnOiAnZycsICdcXHUwMTIxJzogJ2cnLCAnXFx1MDEyMyc6ICdnJyxcbiAgJ1xcdTAxMjQnOiAnSCcsICAnXFx1MDEyNic6ICdIJywgJ1xcdTAxMjUnOiAnaCcsICdcXHUwMTI3JzogJ2gnLFxuICAnXFx1MDEyOCc6ICdJJywgICdcXHUwMTJhJzogJ0knLCAnXFx1MDEyYyc6ICdJJywgJ1xcdTAxMmUnOiAnSScsICdcXHUwMTMwJzogJ0knLFxuICAnXFx1MDEyOSc6ICdpJywgICdcXHUwMTJiJzogJ2knLCAnXFx1MDEyZCc6ICdpJywgJ1xcdTAxMmYnOiAnaScsICdcXHUwMTMxJzogJ2knLFxuICAnXFx1MDEzNCc6ICdKJywgICdcXHUwMTM1JzogJ2onLFxuICAnXFx1MDEzNic6ICdLJywgICdcXHUwMTM3JzogJ2snLCAnXFx1MDEzOCc6ICdrJyxcbiAgJ1xcdTAxMzknOiAnTCcsICAnXFx1MDEzYic6ICdMJywgJ1xcdTAxM2QnOiAnTCcsICdcXHUwMTNmJzogJ0wnLCAnXFx1MDE0MSc6ICdMJyxcbiAgJ1xcdTAxM2EnOiAnbCcsICAnXFx1MDEzYyc6ICdsJywgJ1xcdTAxM2UnOiAnbCcsICdcXHUwMTQwJzogJ2wnLCAnXFx1MDE0Mic6ICdsJyxcbiAgJ1xcdTAxNDMnOiAnTicsICAnXFx1MDE0NSc6ICdOJywgJ1xcdTAxNDcnOiAnTicsICdcXHUwMTRhJzogJ04nLFxuICAnXFx1MDE0NCc6ICduJywgICdcXHUwMTQ2JzogJ24nLCAnXFx1MDE0OCc6ICduJywgJ1xcdTAxNGInOiAnbicsXG4gICdcXHUwMTRjJzogJ08nLCAgJ1xcdTAxNGUnOiAnTycsICdcXHUwMTUwJzogJ08nLFxuICAnXFx1MDE0ZCc6ICdvJywgICdcXHUwMTRmJzogJ28nLCAnXFx1MDE1MSc6ICdvJyxcbiAgJ1xcdTAxNTQnOiAnUicsICAnXFx1MDE1Nic6ICdSJywgJ1xcdTAxNTgnOiAnUicsXG4gICdcXHUwMTU1JzogJ3InLCAgJ1xcdTAxNTcnOiAncicsICdcXHUwMTU5JzogJ3InLFxuICAnXFx1MDE1YSc6ICdTJywgICdcXHUwMTVjJzogJ1MnLCAnXFx1MDE1ZSc6ICdTJywgJ1xcdTAxNjAnOiAnUycsXG4gICdcXHUwMTViJzogJ3MnLCAgJ1xcdTAxNWQnOiAncycsICdcXHUwMTVmJzogJ3MnLCAnXFx1MDE2MSc6ICdzJyxcbiAgJ1xcdTAxNjInOiAnVCcsICAnXFx1MDE2NCc6ICdUJywgJ1xcdTAxNjYnOiAnVCcsXG4gICdcXHUwMTYzJzogJ3QnLCAgJ1xcdTAxNjUnOiAndCcsICdcXHUwMTY3JzogJ3QnLFxuICAnXFx1MDE2OCc6ICdVJywgICdcXHUwMTZhJzogJ1UnLCAnXFx1MDE2Yyc6ICdVJywgJ1xcdTAxNmUnOiAnVScsICdcXHUwMTcwJzogJ1UnLCAnXFx1MDE3Mic6ICdVJyxcbiAgJ1xcdTAxNjknOiAndScsICAnXFx1MDE2Yic6ICd1JywgJ1xcdTAxNmQnOiAndScsICdcXHUwMTZmJzogJ3UnLCAnXFx1MDE3MSc6ICd1JywgJ1xcdTAxNzMnOiAndScsXG4gICdcXHUwMTc0JzogJ1cnLCAgJ1xcdTAxNzUnOiAndycsXG4gICdcXHUwMTc2JzogJ1knLCAgJ1xcdTAxNzcnOiAneScsICdcXHUwMTc4JzogJ1knLFxuICAnXFx1MDE3OSc6ICdaJywgICdcXHUwMTdiJzogJ1onLCAnXFx1MDE3ZCc6ICdaJyxcbiAgJ1xcdTAxN2EnOiAneicsICAnXFx1MDE3Yyc6ICd6JywgJ1xcdTAxN2UnOiAneicsXG4gICdcXHUwMTMyJzogJ0lKJywgJ1xcdTAxMzMnOiAnaWonLFxuICAnXFx1MDE1Mic6ICdPZScsICdcXHUwMTUzJzogJ29lJyxcbiAgJ1xcdTAxNDknOiBcIiduXCIsICdcXHUwMTdmJzogJ3NzJ1xufTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5T2ZgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eU9mKG9iamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbi8qKlxuICogVXNlZCBieSBgXy5kZWJ1cnJgIHRvIGNvbnZlcnQgTGF0aW4tMSBTdXBwbGVtZW50IGFuZCBMYXRpbiBFeHRlbmRlZC1BXG4gKiBsZXR0ZXJzIHRvIGJhc2ljIExhdGluIGxldHRlcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBsZXR0ZXIgVGhlIG1hdGNoZWQgbGV0dGVyIHRvIGRlYnVyci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGRlYnVycmVkIGxldHRlci5cbiAqL1xudmFyIGRlYnVyckxldHRlciA9IGJhc2VQcm9wZXJ0eU9mKGRlYnVycmVkTGV0dGVycyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcbiAqIHZhbHVlcyB0byBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHN5bWJvbFRvU3RyaW5nID8gc3ltYm9sVG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcuIEFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZCBmb3IgYG51bGxgXG4gKiBhbmQgYHVuZGVmaW5lZGAgdmFsdWVzLiBUaGUgc2lnbiBvZiBgLTBgIGlzIHByZXNlcnZlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBEZWJ1cnJzIGBzdHJpbmdgIGJ5IGNvbnZlcnRpbmdcbiAqIFtMYXRpbi0xIFN1cHBsZW1lbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xhdGluLTFfU3VwcGxlbWVudF8oVW5pY29kZV9ibG9jaykjQ2hhcmFjdGVyX3RhYmxlKVxuICogYW5kIFtMYXRpbiBFeHRlbmRlZC1BXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MYXRpbl9FeHRlbmRlZC1BKVxuICogbGV0dGVycyB0byBiYXNpYyBMYXRpbiBsZXR0ZXJzIGFuZCByZW1vdmluZ1xuICogW2NvbWJpbmluZyBkaWFjcml0aWNhbCBtYXJrc10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29tYmluaW5nX0RpYWNyaXRpY2FsX01hcmtzKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHN0cmluZyB0byBkZWJ1cnIuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBkZWJ1cnJlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVidXJyKCdkw6lqw6AgdnUnKTtcbiAqIC8vID0+ICdkZWphIHZ1J1xuICovXG5mdW5jdGlvbiBkZWJ1cnIoc3RyaW5nKSB7XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIHJldHVybiBzdHJpbmcgJiYgc3RyaW5nLnJlcGxhY2UocmVMYXRpbiwgZGVidXJyTGV0dGVyKS5yZXBsYWNlKHJlQ29tYm9NYXJrLCAnJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVidXJyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWF0Y2hPcGVyYXRvcnNSZSA9IC9bfFxcXFx7fSgpW1xcXV4kKyo/Ll0vZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgc3RyaW5nJyk7XG5cdH1cblxuXHRyZXR1cm4gc3RyLnJlcGxhY2UobWF0Y2hPcGVyYXRvcnNSZSwgJ1xcXFwkJicpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBbXG5cdC8vIEdlcm1hbiB1bWxhdXRzXG5cdFsnw58nLCAnc3MnXSxcblx0WyfDpCcsICdhZSddLFxuXHRbJ8OEJywgJ0FlJ10sXG5cdFsnw7YnLCAnb2UnXSxcblx0WyfDlicsICdPZSddLFxuXHRbJ8O8JywgJ3VlJ10sXG5cdFsnw5wnLCAnVWUnXSxcblxuXHQvLyBWaWV0bmFtZXNlXG5cdFsnw6AnLCAnYSddLFxuXHRbJ8OAJywgJ0EnXSxcblx0WyfDoScsICdhJ10sXG5cdFsnw4EnLCAnQSddLFxuXHRbJ8OiJywgJ2EnXSxcblx0WyfDgicsICdBJ10sXG5cdFsnw6MnLCAnYSddLFxuXHRbJ8ODJywgJ0EnXSxcblx0WyfDqCcsICdlJ10sXG5cdFsnw4gnLCAnRSddLFxuXHRbJ8OpJywgJ2UnXSxcblx0WyfDiScsICdFJ10sXG5cdFsnw6onLCAnZSddLFxuXHRbJ8OKJywgJ0UnXSxcblx0WyfDrCcsICdpJ10sXG5cdFsnw4wnLCAnSSddLFxuXHRbJ8OtJywgJ2knXSxcblx0WyfDjScsICdJJ10sXG5cdFsnw7InLCAnbyddLFxuXHRbJ8OSJywgJ08nXSxcblx0WyfDsycsICdvJ10sXG5cdFsnw5MnLCAnTyddLFxuXHRbJ8O0JywgJ28nXSxcblx0WyfDlCcsICdPJ10sXG5cdFsnw7UnLCAnbyddLFxuXHRbJ8OVJywgJ08nXSxcblx0WyfDuScsICd1J10sXG5cdFsnw5knLCAnVSddLFxuXHRbJ8O6JywgJ3UnXSxcblx0WyfDmicsICdVJ10sXG5cdFsnw70nLCAneSddLFxuXHRbJ8OdJywgJ1knXSxcblx0WyfEgycsICdhJ10sXG5cdFsnxIInLCAnQSddLFxuXHRbJ8SQJywgJ0QnXSxcblx0WyfEkScsICdkJ10sXG5cdFsnxKknLCAnaSddLFxuXHRbJ8SoJywgJ0knXSxcblx0WyfFqScsICd1J10sXG5cdFsnxagnLCAnVSddLFxuXHRbJ8ahJywgJ28nXSxcblx0WyfGoCcsICdPJ10sXG5cdFsnxrAnLCAndSddLFxuXHRbJ8avJywgJ1UnXSxcblx0WyfhuqEnLCAnYSddLFxuXHRbJ+G6oCcsICdBJ10sXG5cdFsn4bqjJywgJ2EnXSxcblx0WyfhuqInLCAnQSddLFxuXHRbJ+G6pScsICdhJ10sXG5cdFsn4bqkJywgJ0EnXSxcblx0WyfhuqcnLCAnYSddLFxuXHRbJ+G6picsICdBJ10sXG5cdFsn4bqpJywgJ2EnXSxcblx0WyfhuqgnLCAnQSddLFxuXHRbJ+G6qycsICdhJ10sXG5cdFsn4bqqJywgJ0EnXSxcblx0Wyfhuq0nLCAnYSddLFxuXHRbJ+G6rCcsICdBJ10sXG5cdFsn4bqvJywgJ2EnXSxcblx0Wyfhuq4nLCAnQSddLFxuXHRbJ+G6sScsICdhJ10sXG5cdFsn4bqwJywgJ0EnXSxcblx0WyfhurMnLCAnYSddLFxuXHRbJ+G6sicsICdBJ10sXG5cdFsn4bq1JywgJ2EnXSxcblx0WyfhurQnLCAnQSddLFxuXHRbJ+G6tycsICdhJ10sXG5cdFsn4bq2JywgJ0EnXSxcblx0WyfhurknLCAnZSddLFxuXHRbJ+G6uCcsICdFJ10sXG5cdFsn4bq7JywgJ2UnXSxcblx0WyfhuronLCAnRSddLFxuXHRbJ+G6vScsICdlJ10sXG5cdFsn4bq8JywgJ0UnXSxcblx0Wyfhur8nLCAnZSddLFxuXHRbJ+G6vicsICdFJ10sXG5cdFsn4buBJywgJ2UnXSxcblx0Wyfhu4AnLCAnRSddLFxuXHRbJ+G7gycsICdlJ10sXG5cdFsn4buCJywgJ0UnXSxcblx0Wyfhu4UnLCAnZSddLFxuXHRbJ+G7hCcsICdFJ10sXG5cdFsn4buHJywgJ2UnXSxcblx0Wyfhu4YnLCAnRSddLFxuXHRbJ+G7iScsICdpJ10sXG5cdFsn4buIJywgJ0knXSxcblx0Wyfhu4snLCAnaSddLFxuXHRbJ+G7iicsICdJJ10sXG5cdFsn4buNJywgJ28nXSxcblx0Wyfhu4wnLCAnTyddLFxuXHRbJ+G7jycsICdvJ10sXG5cdFsn4buOJywgJ08nXSxcblx0Wyfhu5EnLCAnbyddLFxuXHRbJ+G7kCcsICdPJ10sXG5cdFsn4buTJywgJ28nXSxcblx0Wyfhu5InLCAnTyddLFxuXHRbJ+G7lScsICdvJ10sXG5cdFsn4buUJywgJ08nXSxcblx0Wyfhu5cnLCAnbyddLFxuXHRbJ+G7licsICdPJ10sXG5cdFsn4buZJywgJ28nXSxcblx0Wyfhu5gnLCAnTyddLFxuXHRbJ+G7mycsICdvJ10sXG5cdFsn4buaJywgJ08nXSxcblx0Wyfhu50nLCAnbyddLFxuXHRbJ+G7nCcsICdPJ10sXG5cdFsn4bufJywgJ28nXSxcblx0Wyfhu54nLCAnTyddLFxuXHRbJ+G7oScsICdvJ10sXG5cdFsn4bugJywgJ08nXSxcblx0Wyfhu6MnLCAnbyddLFxuXHRbJ+G7oicsICdPJ10sXG5cdFsn4bulJywgJ3UnXSxcblx0Wyfhu6QnLCAnVSddLFxuXHRbJ+G7pycsICd1J10sXG5cdFsn4bumJywgJ1UnXSxcblx0Wyfhu6knLCAndSddLFxuXHRbJ+G7qCcsICdVJ10sXG5cdFsn4burJywgJ3UnXSxcblx0Wyfhu6onLCAnVSddLFxuXHRbJ+G7rScsICd1J10sXG5cdFsn4busJywgJ1UnXSxcblx0Wyfhu68nLCAndSddLFxuXHRbJ+G7ricsICdVJ10sXG5cdFsn4buxJywgJ3UnXSxcblx0Wyfhu7AnLCAnVSddLFxuXHRbJ+G7sycsICd5J10sXG5cdFsn4buyJywgJ1knXSxcblx0Wyfhu7UnLCAneSddLFxuXHRbJ+G7tCcsICdZJ10sXG5cdFsn4bu3JywgJ3knXSxcblx0Wyfhu7YnLCAnWSddLFxuXHRbJ+G7uScsICd5J10sXG5cdFsn4bu4JywgJ1knXSxcblxuXHQvLyBBcmFiaWNcblx0WyfYoScsICdlJ10sXG5cdFsn2KInLCAnYSddLFxuXHRbJ9ijJywgJ2EnXSxcblx0WyfYpCcsICd3J10sXG5cdFsn2KUnLCAnaSddLFxuXHRbJ9imJywgJ3knXSxcblx0WyfYpycsICdhJ10sXG5cdFsn2KgnLCAnYiddLFxuXHRbJ9ipJywgJ3QnXSxcblx0WyfYqicsICd0J10sXG5cdFsn2KsnLCAndGgnXSxcblx0WyfYrCcsICdqJ10sXG5cdFsn2K0nLCAnaCddLFxuXHRbJ9iuJywgJ2toJ10sXG5cdFsn2K8nLCAnZCddLFxuXHRbJ9iwJywgJ2RoJ10sXG5cdFsn2LEnLCAnciddLFxuXHRbJ9iyJywgJ3onXSxcblx0WyfYsycsICdzJ10sXG5cdFsn2LQnLCAnc2gnXSxcblx0WyfYtScsICdzJ10sXG5cdFsn2LYnLCAnZCddLFxuXHRbJ9i3JywgJ3QnXSxcblx0WyfYuCcsICd6J10sXG5cdFsn2LknLCAnZSddLFxuXHRbJ9i6JywgJ2doJ10sXG5cdFsn2YAnLCAnXyddLFxuXHRbJ9mBJywgJ2YnXSxcblx0WyfZgicsICdxJ10sXG5cdFsn2YMnLCAnayddLFxuXHRbJ9mEJywgJ2wnXSxcblx0WyfZhScsICdtJ10sXG5cdFsn2YYnLCAnbiddLFxuXHRbJ9mHJywgJ2gnXSxcblx0WyfZiCcsICd3J10sXG5cdFsn2YknLCAnYSddLFxuXHRbJ9mKJywgJ3knXSxcblx0WyfZjuKAjicsICdhJ10sXG5cdFsn2Y8nLCAndSddLFxuXHRbJ9mQ4oCOJywgJ2knXSxcblx0WyfZoCcsICcwJ10sXG5cdFsn2aEnLCAnMSddLFxuXHRbJ9miJywgJzInXSxcblx0WyfZoycsICczJ10sXG5cdFsn2aQnLCAnNCddLFxuXHRbJ9mlJywgJzUnXSxcblx0WyfZpicsICc2J10sXG5cdFsn2acnLCAnNyddLFxuXHRbJ9moJywgJzgnXSxcblx0WyfZqScsICc5J10sXG5cblx0Ly8gUGVyc2lhbiAvIEZhcnNpXG5cdFsn2oYnLCAnY2gnXSxcblx0WyfaqScsICdrJ10sXG5cdFsn2q8nLCAnZyddLFxuXHRbJ9m+JywgJ3AnXSxcblx0WyfamCcsICd6aCddLFxuXHRbJ9uMJywgJ3knXSxcblx0WyfbsCcsICcwJ10sXG5cdFsn27EnLCAnMSddLFxuXHRbJ9uyJywgJzInXSxcblx0WyfbsycsICczJ10sXG5cdFsn27QnLCAnNCddLFxuXHRbJ9u1JywgJzUnXSxcblx0WyfbticsICc2J10sXG5cdFsn27cnLCAnNyddLFxuXHRbJ9u4JywgJzgnXSxcblx0WyfbuScsICc5J10sXG5cblx0Ly8gUGFzaHRvXG5cdFsn2bwnLCAncCddLFxuXHRbJ9qBJywgJ3onXSxcblx0WyfahScsICdjJ10sXG5cdFsn2oknLCAnZCddLFxuXHRbJ++6qycsICdkJ10sXG5cdFsn77qtJywgJ3InXSxcblx0WyfakycsICdyJ10sXG5cdFsn77qvJywgJ3onXSxcblx0WyfalicsICdnJ10sXG5cdFsn2ponLCAneCddLFxuXHRbJ9qrJywgJ2cnXSxcblx0WyfavCcsICduJ10sXG5cdFsn24AnLCAnZSddLFxuXHRbJ9uQJywgJ2UnXSxcblx0WyfbjScsICdhaSddLFxuXG5cdC8vIFVyZHVcblx0WyfZuScsICd0J10sXG5cdFsn2ognLCAnZCddLFxuXHRbJ9qRJywgJ3InXSxcblx0WyfauicsICduJ10sXG5cdFsn24EnLCAnaCddLFxuXHRbJ9q+JywgJ2gnXSxcblx0WyfbkicsICdlJ10sXG5cblx0Ly8gUnVzc2lhblxuXHRbJ9CQJywgJ0EnXSxcblx0WyfQsCcsICdhJ10sXG5cdFsn0JEnLCAnQiddLFxuXHRbJ9CxJywgJ2InXSxcblx0WyfQkicsICdWJ10sXG5cdFsn0LInLCAndiddLFxuXHRbJ9CTJywgJ0cnXSxcblx0WyfQsycsICdnJ10sXG5cdFsn0JQnLCAnRCddLFxuXHRbJ9C0JywgJ2QnXSxcblx0WyfQlScsICdFJ10sXG5cdFsn0LUnLCAnZSddLFxuXHRbJ9CWJywgJ1poJ10sXG5cdFsn0LYnLCAnemgnXSxcblx0WyfQlycsICdaJ10sXG5cdFsn0LcnLCAneiddLFxuXHRbJ9CYJywgJ0knXSxcblx0WyfQuCcsICdpJ10sXG5cdFsn0JknLCAnSiddLFxuXHRbJ9C5JywgJ2onXSxcblx0WyfQmicsICdLJ10sXG5cdFsn0LonLCAnayddLFxuXHRbJ9CbJywgJ0wnXSxcblx0WyfQuycsICdsJ10sXG5cdFsn0JwnLCAnTSddLFxuXHRbJ9C8JywgJ20nXSxcblx0WyfQnScsICdOJ10sXG5cdFsn0L0nLCAnbiddLFxuXHRbJ9CeJywgJ08nXSxcblx0WyfQvicsICdvJ10sXG5cdFsn0J8nLCAnUCddLFxuXHRbJ9C/JywgJ3AnXSxcblx0WyfQoCcsICdSJ10sXG5cdFsn0YAnLCAnciddLFxuXHRbJ9ChJywgJ1MnXSxcblx0WyfRgScsICdzJ10sXG5cdFsn0KInLCAnVCddLFxuXHRbJ9GCJywgJ3QnXSxcblx0WyfQoycsICdVJ10sXG5cdFsn0YMnLCAndSddLFxuXHRbJ9CkJywgJ0YnXSxcblx0WyfRhCcsICdmJ10sXG5cdFsn0KUnLCAnSCddLFxuXHRbJ9GFJywgJ2gnXSxcblx0WyfQpicsICdDeiddLFxuXHRbJ9GGJywgJ2N6J10sXG5cdFsn0KcnLCAnQ2gnXSxcblx0WyfRhycsICdjaCddLFxuXHRbJ9CoJywgJ1NoJ10sXG5cdFsn0YgnLCAnc2gnXSxcblx0WyfQqScsICdTaGgnXSxcblx0WyfRiScsICdzaGgnXSxcblx0WyfQqicsICcnXSxcblx0WyfRiicsICcnXSxcblx0WyfQqycsICdZJ10sXG5cdFsn0YsnLCAneSddLFxuXHRbJ9CsJywgJyddLFxuXHRbJ9GMJywgJyddLFxuXHRbJ9CtJywgJ0UnXSxcblx0WyfRjScsICdlJ10sXG5cdFsn0K4nLCAnWXUnXSxcblx0WyfRjicsICd5dSddLFxuXHRbJ9CvJywgJ1lhJ10sXG5cdFsn0Y8nLCAneWEnXSxcblx0WyfQgScsICdZbyddLFxuXHRbJ9GRJywgJ3lvJ10sXG5cblx0Ly8gUm9tYW5pYW5cblx0WyfImScsICdzJ10sXG5cdFsnyJgnLCAncyddLFxuXHRbJ8ibJywgJ3QnXSxcblx0WyfImicsICd0J10sXG5cblx0Ly8gVHVya2lzaFxuXHRbJ8WfJywgJ3MnXSxcblx0WyfFnicsICdzJ10sXG5cdFsnw6cnLCAnYyddLFxuXHRbJ8OHJywgJ2MnXSxcblx0WyfEnycsICdnJ10sXG5cdFsnxJ4nLCAnZyddLFxuXHRbJ8SxJywgJ2knXSxcblx0WyfEsCcsICdpJ11cbl07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gW1xuXHRbJyYnLCAnIGFuZCAnXSxcblx0Wyfwn6aEJywgJyB1bmljb3JuICddLFxuXHRbJ+KZpScsICcgbG92ZSAnXVxuXTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IGRlYnVyciA9IHJlcXVpcmUoJ2xvZGFzaC5kZWJ1cnInKTtcbmNvbnN0IGVzY2FwZVN0cmluZ1JlZ2V4cCA9IHJlcXVpcmUoJ2VzY2FwZS1zdHJpbmctcmVnZXhwJyk7XG5jb25zdCBidWlsdGluUmVwbGFjZW1lbnRzID0gcmVxdWlyZSgnLi9yZXBsYWNlbWVudHMnKTtcbmNvbnN0IGJ1aWx0aW5PdmVycmlkYWJsZVJlcGxhY2VtZW50cyA9IHJlcXVpcmUoJy4vb3ZlcnJpZGFibGUtcmVwbGFjZW1lbnRzJyk7XG5cbmNvbnN0IGRlY2FtZWxpemUgPSBzdHJpbmcgPT4ge1xuXHRyZXR1cm4gc3RyaW5nXG5cdFx0LnJlcGxhY2UoLyhbYS16XFxkXSkoW0EtWl0pL2csICckMSAkMicpXG5cdFx0LnJlcGxhY2UoLyhbQS1aXSspKFtBLVpdW2EtelxcZF0rKS9nLCAnJDEgJDInKTtcbn07XG5cbmNvbnN0IGRvQ3VzdG9tUmVwbGFjZW1lbnRzID0gKHN0cmluZywgcmVwbGFjZW1lbnRzKSA9PiB7XG5cdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHJlcGxhY2VtZW50cykge1xuXHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG5ldyBSZWdFeHAoZXNjYXBlU3RyaW5nUmVnZXhwKGtleSksICdnJyksIHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiBzdHJpbmc7XG59O1xuXG5jb25zdCByZW1vdmVNb290U2VwYXJhdG9ycyA9IChzdHJpbmcsIHNlcGFyYXRvcikgPT4ge1xuXHRyZXR1cm4gc3RyaW5nXG5cdFx0LnJlcGxhY2UobmV3IFJlZ0V4cChgJHtzZXBhcmF0b3J9ezIsfWAsICdnJyksIHNlcGFyYXRvcilcblx0XHQucmVwbGFjZShuZXcgUmVnRXhwKGBeJHtzZXBhcmF0b3J9fCR7c2VwYXJhdG9yfSRgLCAnZycpLCAnJyk7XG59O1xuXG5jb25zdCBzbHVnaWZ5ID0gKHN0cmluZywgb3B0aW9ucykgPT4ge1xuXHRpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBhIHN0cmluZywgZ290IFxcYCR7dHlwZW9mIHN0cmluZ31cXGBgKTtcblx0fVxuXG5cdG9wdGlvbnMgPSB7XG5cdFx0c2VwYXJhdG9yOiAnLScsXG5cdFx0bG93ZXJjYXNlOiB0cnVlLFxuXHRcdGRlY2FtZWxpemU6IHRydWUsXG5cdFx0Y3VzdG9tUmVwbGFjZW1lbnRzOiBbXSxcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cblx0Y29uc3Qgc2VwYXJhdG9yID0gZXNjYXBlU3RyaW5nUmVnZXhwKG9wdGlvbnMuc2VwYXJhdG9yKTtcblx0Y29uc3QgY3VzdG9tUmVwbGFjZW1lbnRzID0gbmV3IE1hcChbXG5cdFx0Li4uYnVpbHRpbk92ZXJyaWRhYmxlUmVwbGFjZW1lbnRzLFxuXHRcdC4uLm9wdGlvbnMuY3VzdG9tUmVwbGFjZW1lbnRzLFxuXHRcdC4uLmJ1aWx0aW5SZXBsYWNlbWVudHNcblx0XSk7XG5cblx0c3RyaW5nID0gZG9DdXN0b21SZXBsYWNlbWVudHMoc3RyaW5nLCBjdXN0b21SZXBsYWNlbWVudHMpO1xuXHRzdHJpbmcgPSBkZWJ1cnIoc3RyaW5nKTtcblx0c3RyaW5nID0gc3RyaW5nLm5vcm1hbGl6ZSgnTkZLRCcpO1xuXG5cdGlmIChvcHRpb25zLmRlY2FtZWxpemUpIHtcblx0XHRzdHJpbmcgPSBkZWNhbWVsaXplKHN0cmluZyk7XG5cdH1cblxuXHRsZXQgcGF0dGVyblNsdWcgPSAvW15hLXpBLVpcXGRdKy9nO1xuXG5cdGlmIChvcHRpb25zLmxvd2VyY2FzZSkge1xuXHRcdHN0cmluZyA9IHN0cmluZy50b0xvd2VyQ2FzZSgpO1xuXHRcdHBhdHRlcm5TbHVnID0gL1teYS16XFxkXSsvZztcblx0fVxuXG5cdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHBhdHRlcm5TbHVnLCBzZXBhcmF0b3IpO1xuXHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFxcXC9nLCAnJyk7XG5cdHN0cmluZyA9IHJlbW92ZU1vb3RTZXBhcmF0b3JzKHN0cmluZywgc2VwYXJhdG9yKTtcblxuXHRyZXR1cm4gc3RyaW5nO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzbHVnaWZ5O1xuLy8gVE9ETzogUmVtb3ZlIHRoaXMgZm9yIHRoZSBuZXh0IG1ham9yIHJlbGVhc2Vcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBzbHVnaWZ5O1xuIiwiZXhwb3J0IGNvbnN0IFNMVUdfUFJFU0VSVkVfVU5JQ09ERSA9IHRydWU7XG5leHBvcnQgY29uc3QgU0xVR19TRVBBUkFUT1IgPSAnXyc7XG4iLCJpbXBvcnQgc2x1Z2lmeSBmcm9tICdAc2luZHJlc29yaHVzL3NsdWdpZnknO1xuaW1wb3J0IHtTTFVHX1NFUEFSQVRPUn0gZnJvbSAnLi4vLi4vY29uZmlnJztcblxuLyogdXJsLXNhZmUgcHJvY2Vzc29yICovXG5cbmV4cG9ydCBjb25zdCB1cmxzYWZlU2x1Z1Byb2Nlc3NvciA9IHN0cmluZyA9PlxuXHRzbHVnaWZ5KHN0cmluZywge1xuXHRcdGN1c3RvbVJlcGxhY2VtZW50czogW1x0Ly8gcnVucyBiZWZvcmUgYW55IG90aGVyIHRyYW5zZm9ybWF0aW9uc1xuXHRcdFx0WyckJywgJ0RPTExBUiddLCAvLyBgJGRlc3Ryb3lgICYgY29cblx0XHRcdFsnLScsICdEQVNIJ10sIC8vIGNvbmZsaWN0cyB3aXRoIGBzZXBhcmF0b3JgXG5cdFx0XSxcblx0XHRzZXBhcmF0b3I6IFNMVUdfU0VQQVJBVE9SLFxuXHRcdGRlY2FtZWxpemU6IGZhbHNlLFxuXHRcdGxvd2VyY2FzZTogZmFsc2Vcblx0fSlcblx0XHQucmVwbGFjZSgvRE9MTEFSL2csICckJylcblx0XHQucmVwbGFjZSgvREFTSC9nLCAnLScpO1xuXG4vKiB1bmljb2RlLXByZXNlcnZlciBwcm9jZXNzb3IgKi9cblxuY29uc3QgYWxwaGFOdW1SZWdleCA9IC9bYS16QS1aMC05XS87XG5jb25zdCB1bmljb2RlUmVnZXggPSAvXFxwe0xldHRlcn0vdTtcbmNvbnN0IGlzTm9uQWxwaGFOdW1Vbmljb2RlID1cblx0c3RyaW5nID0+ICFhbHBoYU51bVJlZ2V4LnRlc3Qoc3RyaW5nKSAmJiB1bmljb2RlUmVnZXgudGVzdChzdHJpbmcpO1xuXG5leHBvcnQgY29uc3QgdW5pY29kZVNhZmVQcm9jZXNzb3IgPSBzdHJpbmcgPT5cblx0c3RyaW5nLnNwbGl0KCcnKVxuXHRcdC5yZWR1Y2UoKGFjY3VtLCBjaGFyLCBpbmRleCwgYXJyYXkpID0+IHtcblx0XHRcdGNvbnN0IHR5cGUgPSBpc05vbkFscGhhTnVtVW5pY29kZShjaGFyKSA/ICdwYXNzJyA6ICdwcm9jZXNzJztcblxuXHRcdFx0aWYgKGluZGV4ID09PSAwKSB7XG5cdFx0XHRcdGFjY3VtLmN1cnJlbnQgPSB7dHlwZSwgc3RyaW5nOiBjaGFyfTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZSA9PT0gYWNjdW0uY3VycmVudC50eXBlKSB7XG5cdFx0XHRcdGFjY3VtLmN1cnJlbnQuc3RyaW5nICs9IGNoYXI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhY2N1bS5jaHVua3MucHVzaChhY2N1bS5jdXJyZW50KTtcblx0XHRcdFx0YWNjdW0uY3VycmVudCA9IHt0eXBlLCBzdHJpbmc6IGNoYXJ9O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaW5kZXggPT09IGFycmF5Lmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0YWNjdW0uY2h1bmtzLnB1c2goYWNjdW0uY3VycmVudCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhY2N1bTtcblx0XHR9LCB7Y2h1bmtzOiBbXSwgY3VycmVudDoge3R5cGU6ICcnLCBzdHJpbmc6ICcnfX0pXG5cdFx0LmNodW5rc1xuXHRcdC5yZWR1Y2UoKGFjY3VtLCBjaHVuaykgPT4ge1xuXHRcdFx0Y29uc3QgcHJvY2Vzc2VkID0gY2h1bmsudHlwZSA9PT0gJ3Byb2Nlc3MnXG5cdFx0XHRcdD8gdXJsc2FmZVNsdWdQcm9jZXNzb3IoY2h1bmsuc3RyaW5nKVxuXHRcdFx0XHQ6IGNodW5rLnN0cmluZztcblxuXHRcdFx0cHJvY2Vzc2VkLmxlbmd0aCA+IDAgJiYgYWNjdW0ucHVzaChwcm9jZXNzZWQpO1xuXG5cdFx0XHRyZXR1cm4gYWNjdW07XG5cdFx0fSwgW10pXG5cdFx0LmpvaW4oU0xVR19TRVBBUkFUT1IpO1xuXG4vKiBwcm9jZXNzb3IgKi9cblxuZXhwb3J0IGNvbnN0IG1ha2VTbHVnUHJvY2Vzc29yID0gKHByZXNlcnZlVW5pY29kZSA9IGZhbHNlKSA9PiBwcmVzZXJ2ZVVuaWNvZGVcblx0PyB1bmljb2RlU2FmZVByb2Nlc3NvclxuXHQ6IHVybHNhZmVTbHVnUHJvY2Vzc29yO1xuXG4vKiBzZXNzaW9uIHByb2Nlc3NvciAqL1xuXG5leHBvcnQgY29uc3QgbWFrZVNlc3Npb25TbHVnUHJvY2Vzc29yID0gKHByZXNlcnZlVW5pY29kZSA9IGZhbHNlKSA9PiB7XG5cdGNvbnN0IHByb2Nlc3NvciA9IG1ha2VTbHVnUHJvY2Vzc29yKHByZXNlcnZlVW5pY29kZSk7XG5cdGNvbnN0IHNlZW4gPSBuZXcgU2V0KCk7XG5cblx0cmV0dXJuIHN0cmluZyA9PiB7XG5cdFx0Y29uc3Qgc2x1ZyA9IHByb2Nlc3NvcihzdHJpbmcpO1xuXG5cdFx0aWYgKHNlZW4uaGFzKHNsdWcpKSB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBzbHVnICR7c2x1Z31gKTtcblx0XHRzZWVuLmFkZChzbHVnKTtcblxuXHRcdHJldHVybiBzbHVnO1xuXHR9O1xufTtcbiIsImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4dHJhY3RfZnJvbnRtYXR0ZXIsIGxpbmtfcmVuZGVyZXIgfSBmcm9tICdAc3ZlbHRlanMvc2l0ZS1raXQvdXRpbHMvbWFya2Rvd24uanMnO1xuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnO1xuaW1wb3J0IHsgbWFrZVNsdWdQcm9jZXNzb3IgfSBmcm9tICcuLi8uLi91dGlscy9zbHVnJztcbmltcG9ydCB7IGhpZ2hsaWdodCB9IGZyb20gJy4uLy4uL3V0aWxzL2hpZ2hsaWdodCc7XG5pbXBvcnQgeyBTTFVHX1BSRVNFUlZFX1VOSUNPREUgfSBmcm9tICcuLi8uLi8uLi9jb25maWcnO1xuXG5jb25zdCBtYWtlU2x1ZyA9IG1ha2VTbHVnUHJvY2Vzc29yKFNMVUdfUFJFU0VSVkVfVU5JQ09ERSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldF9wb3N0cygpIHtcblx0cmV0dXJuIGZzXG5cdFx0LnJlYWRkaXJTeW5jKCdjb250ZW50L2Jsb2cnKVxuXHRcdC5tYXAoZmlsZSA9PiB7XG5cdFx0XHRpZiAocGF0aC5leHRuYW1lKGZpbGUpICE9PSAnLm1kJykgcmV0dXJuO1xuXG5cdFx0XHRjb25zdCBtYXRjaCA9IC9eKFxcZCstXFxkKy1cXGQrKS0oLispXFwubWQkLy5leGVjKGZpbGUpO1xuXHRcdFx0aWYgKCFtYXRjaCkgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGZpbGVuYW1lICcke2ZpbGV9J2ApO1xuXG5cdFx0XHRjb25zdCBbLCBwdWJkYXRlLCBzbHVnXSA9IG1hdGNoO1xuXG5cdFx0XHRjb25zdCBtYXJrZG93biA9IGZzLnJlYWRGaWxlU3luYyhgY29udGVudC9ibG9nLyR7ZmlsZX1gLCAndXRmLTgnKTtcblxuXHRcdFx0Y29uc3QgeyBjb250ZW50LCBtZXRhZGF0YSB9ID0gZXh0cmFjdF9mcm9udG1hdHRlcihtYXJrZG93bik7XG5cblx0XHRcdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShgJHtwdWJkYXRlfSBFRFRgKTsgLy8gY2hlZWt5IGhhY2tcblx0XHRcdG1ldGFkYXRhLnB1YmRhdGUgPSBwdWJkYXRlO1xuXHRcdFx0bWV0YWRhdGEuZGF0ZVN0cmluZyA9IGRhdGUudG9EYXRlU3RyaW5nKCk7XG5cblx0XHRcdGNvbnN0IHJlbmRlcmVyID0gbmV3IG1hcmtlZC5SZW5kZXJlcigpO1xuXG5cdFx0XHRyZW5kZXJlci5saW5rID0gbGlua19yZW5kZXJlcjtcblxuXHRcdFx0cmVuZGVyZXIuY29kZSA9IGhpZ2hsaWdodDtcblxuXHRcdFx0cmVuZGVyZXIuaGVhZGluZyA9ICh0ZXh0LCBsZXZlbCwgcmF3dGV4dCkgPT4ge1xuXHRcdFx0XHRjb25zdCBmcmFnbWVudCA9IG1ha2VTbHVnKHJhd3RleHQpO1xuXG5cdFx0XHRcdHJldHVybiBgXG5cdFx0XHRcdFx0PGgke2xldmVsfT5cblx0XHRcdFx0XHRcdDxzcGFuIGlkPVwiJHtmcmFnbWVudH1cIiBjbGFzcz1cIm9mZnNldC1hbmNob3JcIj48L3NwYW4+XG5cdFx0XHRcdFx0XHQ8YSBocmVmPVwiYmxvZy8ke3NsdWd9IyR7ZnJhZ21lbnR9XCIgY2xhc3M9XCJhbmNob3JcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2E+XG5cdFx0XHRcdFx0XHQke3RleHR9XG5cdFx0XHRcdFx0PC9oJHtsZXZlbH0+YDtcblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IGh0bWwgPSBtYXJrZWQoXG5cdFx0XHRcdGNvbnRlbnQucmVwbGFjZSgvXlxcdCsvZ20sIG1hdGNoID0+IG1hdGNoLnNwbGl0KCdcXHQnKS5qb2luKCcgICcpKSxcblx0XHRcdFx0eyByZW5kZXJlciB9XG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRodG1sLFxuXHRcdFx0XHRtZXRhZGF0YSxcblx0XHRcdFx0c2x1Z1xuXHRcdFx0fTtcblx0XHR9KVxuXHRcdC5zb3J0KChhLCBiKSA9PiBhLm1ldGFkYXRhLnB1YmRhdGUgPCBiLm1ldGFkYXRhLnB1YmRhdGUgPyAxIDogLTEpO1xufVxuIiwiaW1wb3J0IHNlbmQgZnJvbSAnQHBvbGthL3NlbmQnO1xuaW1wb3J0IGdldF9wb3N0cyBmcm9tICcuL19wb3N0cy5qcyc7XG5cbmxldCBqc29uO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XG5cdGlmICghanNvbiB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG5cdFx0Y29uc3QgcG9zdHMgPSBnZXRfcG9zdHMoKVxuXHRcdFx0LmZpbHRlcihwb3N0ID0+ICFwb3N0Lm1ldGFkYXRhLmRyYWZ0KVxuXHRcdFx0Lm1hcChwb3N0ID0+IHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRzbHVnOiBwb3N0LnNsdWcsXG5cdFx0XHRcdFx0bWV0YWRhdGE6IHBvc3QubWV0YWRhdGFcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXG5cdFx0anNvbiA9IEpTT04uc3RyaW5naWZ5KHBvc3RzKTtcblx0fVxuXG5cdHNlbmQocmVzLCAyMDAsIGpzb24sIHtcblx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdCdDYWNoZS1Db250cm9sJzogYG1heC1hZ2U9JHs1ICogNjAgKiAxZTN9YCAvLyA1IG1pbnV0ZXNcblx0fSk7XG59XG4iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgZ2V0X3Bvc3RzIGZyb20gJy4uL2Jsb2cvX3Bvc3RzLmpzJztcblxuY29uc3QgbW9udGhzID0gJyxKYW4sRmViLE1hcixBcHIsTWF5LEp1bixKdWwsQXVnLFNlcCxPY3QsTm92LERlYycuc3BsaXQoJywnKTtcblxuZnVuY3Rpb24gZm9ybWF0UHViZGF0ZShzdHIpIHtcblx0Y29uc3QgW3ksIG0sIGRdID0gc3RyLnNwbGl0KCctJyk7XG5cdHJldHVybiBgJHtkfSAke21vbnRoc1srbV19ICR7eX0gMTI6MDAgKzAwMDBgO1xufVxuXG5jb25zdCByc3MgPSBgXG48P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJVVEYtOFwiID8+XG48cnNzIHZlcnNpb249XCIyLjBcIj5cblxuPGNoYW5uZWw+XG5cdDx0aXRsZT5TdmVsdGUgYmxvZzwvdGl0bGU+XG5cdDxsaW5rPmh0dHBzOi8vc3ZlbHRlLmRldi9ibG9nPC9saW5rPlxuXHQ8ZGVzY3JpcHRpb24+TmV3cyBhbmQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIG1hZ2ljYWwgZGlzYXBwZWFyaW5nIFVJIGZyYW1ld29yazwvZGVzY3JpcHRpb24+XG5cdDxpbWFnZT5cblx0XHQ8dXJsPmh0dHBzOi8vc3ZlbHRlLmRldi9mYXZpY29uLnBuZzwvdXJsPlxuXHRcdDx0aXRsZT5TdmVsdGU8L3RpdGxlPlxuXHRcdDxsaW5rPmh0dHBzOi8vc3ZlbHRlLmRldi9ibG9nPC9saW5rPlxuXHQ8L2ltYWdlPlxuXHQke2dldF9wb3N0cygpLmZpbHRlcihwb3N0ID0+ICFwb3N0Lm1ldGFkYXRhLmRyYWZ0KS5tYXAocG9zdCA9PiBgXG5cdFx0PGl0ZW0+XG5cdFx0XHQ8dGl0bGU+JHtwb3N0Lm1ldGFkYXRhLnRpdGxlfTwvdGl0bGU+XG5cdFx0XHQ8bGluaz5odHRwczovL3N2ZWx0ZS5kZXYvYmxvZy8ke3Bvc3Quc2x1Z308L2xpbms+XG5cdFx0XHQ8ZGVzY3JpcHRpb24+JHtwb3N0Lm1ldGFkYXRhLmRlc2NyaXB0aW9ufTwvZGVzY3JpcHRpb24+XG5cdFx0XHQ8cHViRGF0ZT4ke2Zvcm1hdFB1YmRhdGUocG9zdC5tZXRhZGF0YS5wdWJkYXRlKX08L3B1YkRhdGU+XG5cdFx0PC9pdGVtPlxuXHRgKS5qb2luKCcnKX1cbjwvY2hhbm5lbD5cblxuPC9yc3M+XG5gLnJlcGxhY2UoLz5bXlxcU10rL2dtLCAnPicpLnJlcGxhY2UoL1teXFxTXSs8L2dtLCAnPCcpLnRyaW0oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xuXHRzZW5kKHJlcywgMjAwLCByc3MsIHtcblx0XHQnQ2FjaGUtQ29udHJvbCc6IGBtYXgtYWdlPSR7MzAgKiA2MCAqIDFlM31gLFxuXHRcdCdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vcnNzK3htbCdcblx0fSk7XG59XG4iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgZ2V0X3Bvc3RzIGZyb20gJy4vX3Bvc3RzLmpzJztcblxubGV0IGxvb2t1cDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xuXHRpZiAoIWxvb2t1cCB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG5cdFx0bG9va3VwID0gbmV3IE1hcCgpO1xuXHRcdGdldF9wb3N0cygpLmZvckVhY2gocG9zdCA9PiB7XG5cdFx0XHRsb29rdXAuc2V0KHBvc3Quc2x1ZywgcG9zdCk7XG5cdFx0fSk7XG5cdH1cblxuXHRjb25zdCBwb3N0ID0gbG9va3VwLmdldChyZXEucGFyYW1zLnNsdWcpO1xuXG5cdGlmIChwb3N0KSB7XG5cdFx0cmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsIGBtYXgtYWdlPSR7NSAqIDYwICogMWUzfWApOyAvLyA1IG1pbnV0ZXNcblx0XHRzZW5kKHJlcywgMjAwLCBwb3N0KTtcblx0fSBlbHNlIHtcblx0XHRzZW5kKHJlcywgNDA0LCB7IG1lc3NhZ2U6ICdub3QgZm91bmQnIH0pO1xuXHR9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XG5cdHJlcy53cml0ZUhlYWQoMzAyLCB7IExvY2F0aW9uOiAnaHR0cHM6Ly9kaXNjb3JkLmdnL3l5NzVES3MnIH0pO1xuXHRyZXMuZW5kKCk7XG59IiwiaW1wb3J0IHNsdWdpZnkgZnJvbSAnQHNpbmRyZXNvcmh1cy9zbHVnaWZ5JztcblxuZXhwb3J0IGNvbnN0IFNMVUdfUFJFU0VSVkVfVU5JQ09ERSA9IGZhbHNlO1xuZXhwb3J0IGNvbnN0IFNMVUdfU0VQQVJBVE9SID0gJ18nO1xuXG4vKiB1cmwtc2FmZSBwcm9jZXNzb3IgKi9cblxuZXhwb3J0IGNvbnN0IHVybHNhZmVTbHVnUHJvY2Vzc29yID0gKHN0cmluZywgb3B0cykgPT4ge1xuXHRjb25zdCB7IHNlcGFyYXRvciA9IFNMVUdfU0VQQVJBVE9SIH0gPSBvcHRzIHx8IHt9O1xuXG5cdHJldHVybiBzbHVnaWZ5KHN0cmluZywge1xuXHRcdGN1c3RvbVJlcGxhY2VtZW50czogW1x0Ly8gcnVucyBiZWZvcmUgYW55IG90aGVyIHRyYW5zZm9ybWF0aW9uc1xuXHRcdFx0WyckJywgJ0RPTExBUiddLCAvLyBgJGRlc3Ryb3lgICYgY29cblx0XHRcdFsnLScsICdEQVNIJ10sIC8vIGNvbmZsaWN0cyB3aXRoIGBzZXBhcmF0b3JgXG5cdFx0XSxcblx0XHRzZXBhcmF0b3IsXG5cdFx0ZGVjYW1lbGl6ZTogZmFsc2UsXG5cdFx0bG93ZXJjYXNlOiBmYWxzZVxuXHR9KVxuXHQucmVwbGFjZSgvRE9MTEFSL2csICckJylcblx0LnJlcGxhY2UoL0RBU0gvZywgJy0nKTtcbn1cblxuLyogdW5pY29kZS1wcmVzZXJ2ZXIgcHJvY2Vzc29yICovXG5cbmNvbnN0IGFscGhhTnVtUmVnZXggPSAvW2EtekEtWjAtOV0vO1xuY29uc3QgdW5pY29kZVJlZ2V4ID0gL1xccHtMZXR0ZXJ9L3U7XG5jb25zdCBpc05vbkFscGhhTnVtVW5pY29kZSA9XG5cdHN0cmluZyA9PiAhYWxwaGFOdW1SZWdleC50ZXN0KHN0cmluZykgJiYgdW5pY29kZVJlZ2V4LnRlc3Qoc3RyaW5nKTtcblxuZXhwb3J0IGNvbnN0IHVuaWNvZGVTYWZlUHJvY2Vzc29yID0gKHN0cmluZywgb3B0cykgPT4ge1xuXHRjb25zdCB7IHNlcGFyYXRvciA9IFNMVUdfU0VQQVJBVE9SIH0gPSBvcHRzIHx8IHt9O1xuXG5cdHJldHVybiBzdHJpbmcuc3BsaXQoJycpXG5cdC5yZWR1Y2UoKGFjY3VtLCBjaGFyLCBpbmRleCwgYXJyYXkpID0+IHtcblx0XHRjb25zdCB0eXBlID0gaXNOb25BbHBoYU51bVVuaWNvZGUoY2hhcikgPyAncGFzcycgOiAncHJvY2Vzcyc7XG5cblx0XHRpZiAoaW5kZXggPT09IDApIHtcblx0XHRcdGFjY3VtLmN1cnJlbnQgPSB7dHlwZSwgc3RyaW5nOiBjaGFyfTtcblx0XHR9IGVsc2UgaWYgKHR5cGUgPT09IGFjY3VtLmN1cnJlbnQudHlwZSkge1xuXHRcdFx0YWNjdW0uY3VycmVudC5zdHJpbmcgKz0gY2hhcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YWNjdW0uY2h1bmtzLnB1c2goYWNjdW0uY3VycmVudCk7XG5cdFx0XHRhY2N1bS5jdXJyZW50ID0ge3R5cGUsIHN0cmluZzogY2hhcn1cblx0XHR9XG5cblx0XHRpZiAoaW5kZXggPT09IGFycmF5Lmxlbmd0aCAtIDEpIHtcblx0XHRcdGFjY3VtLmNodW5rcy5wdXNoKGFjY3VtLmN1cnJlbnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBhY2N1bTtcblx0fSwge2NodW5rczogW10sIGN1cnJlbnQ6IHt0eXBlOiAnJywgc3RyaW5nOiAnJ319KVxuXHQuY2h1bmtzXG5cdC5yZWR1Y2UoKGFjY3VtLCBjaHVuaykgPT4ge1xuXHRcdGNvbnN0IHByb2Nlc3NlZCA9IGNodW5rLnR5cGUgPT09ICdwcm9jZXNzJ1xuXHRcdFx0PyB1cmxzYWZlU2x1Z1Byb2Nlc3NvcihjaHVuay5zdHJpbmcpXG5cdFx0XHQ6IGNodW5rLnN0cmluZztcblxuXHRcdHByb2Nlc3NlZC5sZW5ndGggPiAwICYmIGFjY3VtLnB1c2gocHJvY2Vzc2VkKTtcblxuXHRcdHJldHVybiBhY2N1bTtcblx0fSwgW10pXG5cdC5qb2luKHNlcGFyYXRvcik7XG59XG5cbi8qIHNlc3Npb24gcHJvY2Vzc29yICovXG5cbmV4cG9ydCBjb25zdCBtYWtlX3Nlc3Npb25fc2x1Z19wcm9jZXNzb3IgPSAoe1xuXHRwcmVzZXJ2ZV91bmljb2RlID0gU0xVR19QUkVTRVJWRV9VTklDT0RFLFxuXHRzZXBhcmF0b3IgPSBTTFVHX1NFUEFSQVRPUlxufSkgPT4ge1xuXHRjb25zdCBwcm9jZXNzb3IgPSBwcmVzZXJ2ZV91bmljb2RlID8gdW5pY29kZVNhZmVQcm9jZXNzb3IgOiB1cmxzYWZlU2x1Z1Byb2Nlc3Nvcjtcblx0Y29uc3Qgc2VlbiA9IG5ldyBTZXQoKTtcblxuXHRyZXR1cm4gc3RyaW5nID0+IHtcblx0XHRjb25zdCBzbHVnID0gcHJvY2Vzc29yKHN0cmluZywgeyBzZXBhcmF0b3IgfSk7XG5cblx0XHRpZiAoc2Vlbi5oYXMoc2x1ZykpIHRocm93IG5ldyBFcnJvcihgRHVwbGljYXRlIHNsdWcgJHtzbHVnfWApO1xuXHRcdHNlZW4uYWRkKHNsdWcpO1xuXG5cdFx0cmV0dXJuIHNsdWc7XG5cdH1cbn1cbiIsImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFNMVUdfUFJFU0VSVkVfVU5JQ09ERSwgU0xVR19TRVBBUkFUT1IgfSBmcm9tICcuLi8uLi8uLi9jb25maWcnO1xuaW1wb3J0IHsgZXh0cmFjdF9mcm9udG1hdHRlciwgZXh0cmFjdF9tZXRhZGF0YSwgbGlua19yZW5kZXJlciB9IGZyb20gJ0BzdmVsdGVqcy9zaXRlLWtpdC91dGlscy9tYXJrZG93bi5qcyc7XG5pbXBvcnQgeyBtYWtlX3Nlc3Npb25fc2x1Z19wcm9jZXNzb3IgfSBmcm9tICdAc3ZlbHRlanMvc2l0ZS1raXQvdXRpbHMvc2x1Zyc7XG5pbXBvcnQgeyBoaWdobGlnaHQgfSBmcm9tICcuLi8uLi91dGlscy9oaWdobGlnaHQnO1xuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnO1xuXG5jb25zdCBibG9ja1R5cGVzID0gW1xuXHQnYmxvY2txdW90ZScsXG5cdCdodG1sJyxcblx0J2hlYWRpbmcnLFxuXHQnaHInLFxuXHQnbGlzdCcsXG5cdCdsaXN0aXRlbScsXG5cdCdwYXJhZ3JhcGgnLFxuXHQndGFibGUnLFxuXHQndGFibGVyb3cnLFxuXHQndGFibGVjZWxsJ1xuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cdGNvbnN0IG1ha2Vfc2x1ZyA9IG1ha2Vfc2Vzc2lvbl9zbHVnX3Byb2Nlc3Nvcih7XG5cdFx0cHJlc2VydmVfdW5pY29kZTogU0xVR19QUkVTRVJWRV9VTklDT0RFLFxuXHRcdHNlcGFyYXRvcjogU0xVR19TRVBBUkFUT1Jcblx0fSk7XG5cblx0cmV0dXJuIGZzXG5cdFx0LnJlYWRkaXJTeW5jKGBjb250ZW50L2RvY3NgKVxuXHRcdC5maWx0ZXIoZmlsZSA9PiBmaWxlWzBdICE9PSAnLicgJiYgcGF0aC5leHRuYW1lKGZpbGUpID09PSAnLm1kJylcblx0XHQubWFwKGZpbGUgPT4ge1xuXHRcdFx0Y29uc3QgbWFya2Rvd24gPSBmcy5yZWFkRmlsZVN5bmMoYGNvbnRlbnQvZG9jcy8ke2ZpbGV9YCwgJ3V0Zi04Jyk7XG5cblx0XHRcdGNvbnN0IHsgY29udGVudCwgbWV0YWRhdGEgfSA9IGV4dHJhY3RfZnJvbnRtYXR0ZXIobWFya2Rvd24pO1xuXG5cdFx0XHRjb25zdCBzZWN0aW9uX3NsdWcgPSBtYWtlX3NsdWcobWV0YWRhdGEudGl0bGUpO1xuXG5cdFx0XHRjb25zdCBzdWJzZWN0aW9ucyA9IFtdO1xuXG5cdFx0XHRjb25zdCByZW5kZXJlciA9IG5ldyBtYXJrZWQuUmVuZGVyZXIoKTtcblxuXHRcdFx0bGV0IGJsb2NrX29wZW4gPSBmYWxzZTtcblxuXHRcdFx0cmVuZGVyZXIubGluayA9IGxpbmtfcmVuZGVyZXI7XG5cblx0XHRcdHJlbmRlcmVyLmhyID0gKCkgPT4ge1xuXHRcdFx0XHRibG9ja19vcGVuID0gdHJ1ZTtcblxuXHRcdFx0XHRyZXR1cm4gJzxkaXYgY2xhc3M9XCJzaWRlLWJ5LXNpZGVcIj48ZGl2IGNsYXNzPVwiY29weVwiPic7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZW5kZXJlci5jb2RlID0gKHNvdXJjZSwgbGFuZykgPT4ge1xuXHRcdFx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvXiArL2dtLCBtYXRjaCA9PlxuXHRcdFx0XHRcdG1hdGNoLnNwbGl0KCcgICAgJykuam9pbignXFx0Jylcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRjb25zdCBsaW5lcyA9IHNvdXJjZS5zcGxpdCgnXFxuJyk7XG5cblx0XHRcdFx0Y29uc3QgbWV0YSA9IGV4dHJhY3RfbWV0YWRhdGEobGluZXNbMF0sIGxhbmcpO1xuXG5cdFx0XHRcdGxldCBwcmVmaXggPSAnJztcblx0XHRcdFx0bGV0IGNsYXNzTmFtZSA9ICdjb2RlLWJsb2NrJztcblxuXHRcdFx0XHRpZiAobWV0YSkge1xuXHRcdFx0XHRcdHNvdXJjZSA9IGxpbmVzLnNsaWNlKDEpLmpvaW4oJ1xcbicpO1xuXHRcdFx0XHRcdGNvbnN0IGZpbGVuYW1lID0gbWV0YS5maWxlbmFtZSB8fCAobGFuZyA9PT0gJ2h0bWwnICYmICdBcHAuc3ZlbHRlJyk7XG5cdFx0XHRcdFx0aWYgKGZpbGVuYW1lKSB7XG5cdFx0XHRcdFx0XHRwcmVmaXggPSBgPHNwYW4gY2xhc3M9J2ZpbGVuYW1lJz4ke3ByZWZpeH0gJHtmaWxlbmFtZX08L3NwYW4+YDtcblx0XHRcdFx0XHRcdGNsYXNzTmFtZSArPSAnIG5hbWVkJztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAobWV0YSAmJiBtZXRhLmhpZGRlbikgcmV0dXJuICcnO1xuXG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBgPGRpdiBjbGFzcz0nJHtjbGFzc05hbWV9Jz4ke3ByZWZpeH0ke2hpZ2hsaWdodChzb3VyY2UsIGxhbmcpfTwvZGl2PmA7XG5cblx0XHRcdFx0aWYgKGJsb2NrX29wZW4pIHtcblx0XHRcdFx0XHRibG9ja19vcGVuID0gZmFsc2U7XG5cdFx0XHRcdFx0cmV0dXJuIGA8L2Rpdj48ZGl2IGNsYXNzPVwiY29kZVwiPiR7aHRtbH08L2Rpdj48L2Rpdj5gO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGh0bWw7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZW5kZXJlci5oZWFkaW5nID0gKHRleHQsIGxldmVsLCByYXd0ZXh0KSA9PiB7XG5cdFx0XHRcdGxldCBzbHVnO1xuXG5cdFx0XHRcdGNvbnN0IG1hdGNoID0gLzxhIGhyZWY9XCIoW15cIl0rKVwiPiguKyk8XFwvYT4vLmV4ZWModGV4dCk7XG5cdFx0XHRcdGlmIChtYXRjaCkge1xuXHRcdFx0XHRcdHNsdWcgPSBtYXRjaFsxXTtcblx0XHRcdFx0XHR0ZXh0ID0gbWF0Y2hbMl07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2x1ZyA9IG1ha2Vfc2x1ZyhyYXd0ZXh0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChsZXZlbCA9PT0gMyB8fCBsZXZlbCA9PT0gNCkge1xuXHRcdFx0XHRcdGNvbnN0IHRpdGxlID0gdGV4dFxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLzxcXC8/Y29kZT4vZywgJycpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvXFwuKFxcdyspKFxcKCguKyk/XFwpKT8vLCAobSwgJDEsICQyLCAkMykgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAoJDMpIHJldHVybiBgLiR7JDF9KC4uLilgO1xuXHRcdFx0XHRcdFx0XHRpZiAoJDIpIHJldHVybiBgLiR7JDF9KClgO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYC4keyQxfWA7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHN1YnNlY3Rpb25zLnB1c2goeyBzbHVnLCB0aXRsZSwgbGV2ZWwgfSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYFxuXHRcdFx0XHRcdDxoJHtsZXZlbH0+XG5cdFx0XHRcdFx0XHQ8c3BhbiBpZD1cIiR7c2x1Z31cIiBjbGFzcz1cIm9mZnNldC1hbmNob3JcIiAke2xldmVsID4gNCA/ICdkYXRhLXNjcm9sbGlnbm9yZScgOiAnJ30+PC9zcGFuPlxuXHRcdFx0XHRcdFx0PGEgaHJlZj1cImRvY3MjJHtzbHVnfVwiIGNsYXNzPVwiYW5jaG9yXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9hPlxuXHRcdFx0XHRcdFx0JHt0ZXh0fVxuXHRcdFx0XHRcdDwvaCR7bGV2ZWx9PmA7XG5cdFx0XHR9O1xuXG5cdFx0XHRibG9ja1R5cGVzLmZvckVhY2godHlwZSA9PiB7XG5cdFx0XHRcdGNvbnN0IGZuID0gcmVuZGVyZXJbdHlwZV07XG5cdFx0XHRcdHJlbmRlcmVyW3R5cGVdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblxuXHRcdFx0Y29uc3QgaHRtbCA9IG1hcmtlZChjb250ZW50LCB7IHJlbmRlcmVyIH0pO1xuXG5cdFx0XHRjb25zdCBoYXNoZXMgPSB7fTtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aHRtbDogaHRtbC5yZXBsYWNlKC9AQChcXGQrKS9nLCAobSwgaWQpID0+IGhhc2hlc1tpZF0gfHwgbSksXG5cdFx0XHRcdG1ldGFkYXRhLFxuXHRcdFx0XHRzdWJzZWN0aW9ucyxcblx0XHRcdFx0c2x1Zzogc2VjdGlvbl9zbHVnLFxuXHRcdFx0XHRmaWxlLFxuXHRcdFx0fTtcblx0XHR9KTtcbn1cbiIsImltcG9ydCBzZW5kIGZyb20gJ0Bwb2xrYS9zZW5kJztcbmltcG9ydCBnZXRfc2VjdGlvbnMgZnJvbSAnLi9fc2VjdGlvbnMuanMnO1xuXG5sZXQganNvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xuXHRpZiAoIWpzb24gfHwgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuXHRcdGpzb24gPSBnZXRfc2VjdGlvbnMoKTtcblx0fVxuXG5cdHNlbmQocmVzLCAyMDAsIGpzb24pO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYm9keShyZXEpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKChmdWxmaWwsIHJlamVjdCkgPT4ge1xuXHRcdGxldCBzdHIgPSAnJztcblxuXHRcdHJlcS5vbignZXJyb3InLCByZWplY3QpO1xuXG5cdFx0cmVxLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuXHRcdFx0c3RyICs9IGNodW5rO1xuXHRcdH0pO1xuXG5cdFx0cmVxLm9uKCdlbmQnLCAoKSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRmdWxmaWwoSlNPTi5wYXJzZShzdHIpKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRyZWplY3QoZXJyKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59IiwiaW1wb3J0IHNlbmQgZnJvbSAnQHBvbGthL3NlbmQnO1xuaW1wb3J0IGJvZHkgZnJvbSAnLi9fdXRpbHMvYm9keS5qcyc7XG5pbXBvcnQgeyBxdWVyeSB9IGZyb20gJy4uLy4uL3V0aWxzL2RiJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3QocmVxLCByZXMpIHtcblx0Y29uc3QgeyB1c2VyIH0gPSByZXE7XG5cdGlmICghdXNlcikgcmV0dXJuOyAvLyByZXNwb25zZSBhbHJlYWR5IHNlbnRcblxuXHR0cnkge1xuXHRcdGNvbnN0IHsgbmFtZSwgZmlsZXMgfSA9IGF3YWl0IGJvZHkocmVxKTtcblxuXHRcdGNvbnN0IFtyb3ddID0gYXdhaXQgcXVlcnkoYFxuXHRcdFx0aW5zZXJ0IGludG8gZ2lzdHModXNlcl9pZCwgbmFtZSwgZmlsZXMpXG5cdFx0XHR2YWx1ZXMgKCQxLCAkMiwgJDMpIHJldHVybmluZyAqYCwgW3VzZXIuaWQsIG5hbWUsIEpTT04uc3RyaW5naWZ5KGZpbGVzKV0pO1xuXG5cdFx0c2VuZChyZXMsIDIwMSwge1xuXHRcdFx0dWlkOiByb3cudWlkLnJlcGxhY2UoLy0vZywgJycpLFxuXHRcdFx0bmFtZTogcm93Lm5hbWUsXG5cdFx0XHRmaWxlczogcm93LmZpbGVzLFxuXHRcdFx0b3duZXI6IHVzZXIudWlkLFxuXHRcdH0pO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRzZW5kKHJlcywgNTAwLCB7XG5cdFx0XHRlcnJvcjogZXJyLm1lc3NhZ2Vcblx0XHR9KTtcblx0fVxufVxuIiwiaW1wb3J0IHsgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gJ2ZzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xuXHRjb25zdCBwYXRoID0gcmVxLnBhcmFtcy5maWxlLmpvaW4oJy8nKTtcblx0aWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAnZGV2ZWxvcG1lbnQnIHx8ICgnLycgKyBwYXRoKS5pbmNsdWRlcygnLy4nKSkge1xuXHRcdHJlcy53cml0ZUhlYWQoNDAzKTtcblx0XHRyZXMuZW5kKCk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGNyZWF0ZVJlYWRTdHJlYW0oJy4uLycgKyBwYXRoKVxuXHRcdC5vbignZXJyb3InLCAoKSA9PiB7XG5cdFx0XHRyZXMud3JpdGVIZWFkKDQwMyk7XG5cdFx0XHRyZXMuZW5kKCk7XG5cdFx0fSlcblx0XHQucGlwZShyZXMpO1xuXHRyZXMud3JpdGVIZWFkKDIwMCwgeyAnQ29udGVudC1UeXBlJzogJ3RleHQvamF2YXNjcmlwdCcgfSk7XG59XG4iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgYm9keSBmcm9tICcuLi9fdXRpbHMvYm9keS5qcyc7XG5pbXBvcnQgKiBhcyBodHRwaWUgZnJvbSAnaHR0cGllJztcbmltcG9ydCB7IHF1ZXJ5LCBmaW5kIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZGInO1xuaW1wb3J0IHsgZ2V0X2V4YW1wbGUgfSBmcm9tICcuLi8uLi9leGFtcGxlcy9fZXhhbXBsZXMuanMnO1xuXG5jb25zdCB7IEdJVEhVQl9DTElFTlRfSUQsIEdJVEhVQl9DTElFTlRfU0VDUkVUIH0gPSBwcm9jZXNzLmVudjtcblxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0X2dpc3QocmVxLCByZXMpIHtcblx0Y29uc3QgYmFzZSA9IGBodHRwczovL2FwaS5naXRodWIuY29tL2dpc3RzLyR7cmVxLnBhcmFtcy5pZH1gO1xuXHRjb25zdCB1cmwgPSBgJHtiYXNlfT9jbGllbnRfaWQ9JHtHSVRIVUJfQ0xJRU5UX0lEfSZjbGllbnRfc2VjcmV0PSR7R0lUSFVCX0NMSUVOVF9TRUNSRVR9YDtcblxuXHR0cnkge1xuXHRcdGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgaHR0cGllLmdldCh1cmwsIHtcblx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0J1VzZXItQWdlbnQnOiAnaHR0cHM6Ly9zdmVsdGUuZGV2J1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gY3JlYXRlIG93bmVyIGlmIG5lY2Vzc2FyeS4uLlxuXHRcdGxldCB1c2VyID0gYXdhaXQgZmluZChgc2VsZWN0ICogZnJvbSB1c2VycyB3aGVyZSB1aWQgPSAkMWAsIFtkYXRhLm93bmVyLmlkXSk7XG5cblx0XHRpZiAoIXVzZXIpIHtcblx0XHRcdGNvbnN0IHsgaWQsIG5hbWUsIGxvZ2luLCBhdmF0YXJfdXJsIH0gPSBkYXRhLm93bmVyO1xuXG5cdFx0XHR1c2VyID0gYXdhaXQgZmluZChgXG5cdFx0XHRcdGluc2VydCBpbnRvIHVzZXJzKHVpZCwgbmFtZSwgdXNlcm5hbWUsIGF2YXRhcilcblx0XHRcdFx0dmFsdWVzICgkMSwgJDIsICQzLCAkNClcblx0XHRcdFx0cmV0dXJuaW5nICpcblx0XHRcdGAsIFtpZCwgbmFtZSwgbG9naW4sIGF2YXRhcl91cmxdKTtcblx0XHR9XG5cblx0XHRkZWxldGUgZGF0YS5maWxlc1snUkVBRE1FLm1kJ107XG5cdFx0ZGVsZXRlIGRhdGEuZmlsZXNbJ21ldGEuanNvbiddO1xuXG5cdFx0Y29uc3QgZmlsZXMgPSBPYmplY3Qua2V5cyhkYXRhLmZpbGVzKS5tYXAoa2V5ID0+IHtcblx0XHRcdGNvbnN0IG5hbWUgPSBrZXkucmVwbGFjZSgvXFwuaHRtbCQvLCAnLnN2ZWx0ZScpO1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRzb3VyY2U6IGRhdGEuZmlsZXNba2V5XS5jb250ZW50XG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0Ly8gYWRkIGdpc3QgdG8gZGF0YWJhc2UuLi5cblx0XHRhd2FpdCBxdWVyeShgXG5cdFx0XHRpbnNlcnQgaW50byBnaXN0cyh1aWQsIHVzZXJfaWQsIG5hbWUsIGZpbGVzKVxuXHRcdFx0dmFsdWVzICgkMSwgJDIsICQzLCAkNClcblx0XHRgLCBbcmVxLnBhcmFtcy5pZCwgdXNlci5pZCwgZGF0YS5kZXNjcmlwdGlvbiwgSlNPTi5zdHJpbmdpZnkoZmlsZXMpXSk7XG5cblx0XHRzZW5kKHJlcywgMjAwLCB7XG5cdFx0XHR1aWQ6IHJlcS5wYXJhbXMuaWQsXG5cdFx0XHRuYW1lOiBkYXRhLmRlc2NyaXB0aW9uLFxuXHRcdFx0ZmlsZXMsXG5cdFx0XHRvd25lcjogZGF0YS5vd25lci5pZFxuXHRcdH0pO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRzZW5kKHJlcywgZXJyLnN0YXR1c0NvZGUsIHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXQocmVxLCByZXMpIHtcblx0Ly8gaXMgdGhpcyBhbiBleGFtcGxlP1xuXHRjb25zdCBleGFtcGxlID0gZ2V0X2V4YW1wbGUocmVxLnBhcmFtcy5pZCk7XG5cblx0aWYgKGV4YW1wbGUpIHtcblx0XHRyZXR1cm4gc2VuZChyZXMsIDIwMCwge1xuXHRcdFx0cmVsYXhlZDogdHJ1ZSxcblx0XHRcdHVpZDogcmVxLnBhcmFtcy5pZCxcblx0XHRcdG5hbWU6IGV4YW1wbGUudGl0bGUsXG5cdFx0XHRmaWxlczogZXhhbXBsZS5maWxlcyxcblx0XHRcdG93bmVyOiBudWxsXG5cdFx0fSk7XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcblx0XHQvLyBJbiBkZXYsIHByb3h5IHJlcXVlc3RzIHRvIGxvYWQgcGFydGljdWxhciBSRVBMcyB0byB0aGUgcmVhbCBzZXJ2ZXIuXG5cdFx0Ly8gVGhpcyBhdm9pZHMgbmVlZGluZyB0byBjb25uZWN0IHRvIHRoZSByZWFsIGRhdGFiYXNlIHNlcnZlci5cblx0XHRyZXEucGlwZShcblx0XHRcdHJlcXVpcmUoJ2h0dHBzJykucmVxdWVzdCh7IGhvc3Q6ICdzdmVsdGUuZGV2JywgcGF0aDogcmVxLnVybCB9KVxuXHRcdCkub25jZSgncmVzcG9uc2UnLCByZXNfcHJveHkgPT4ge1xuXHRcdFx0cmVzX3Byb3h5LnBpcGUocmVzKTtcblx0XHRcdHJlcy53cml0ZUhlYWQocmVzX3Byb3h5LnN0YXR1c0NvZGUsIHJlc19wcm94eS5oZWFkZXJzKTtcblx0XHR9KS5vbmNlKCdlcnJvcicsICgpID0+IHJlcy5lbmQoKSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgW3Jvd10gPSBhd2FpdCBxdWVyeShgXG5cdFx0c2VsZWN0IGcuKiwgdS51aWQgYXMgb3duZXIgZnJvbSBnaXN0cyBnXG5cdFx0bGVmdCBqb2luIHVzZXJzIHUgb24gZy51c2VyX2lkID0gdS5pZFxuXHRcdHdoZXJlIGcudWlkID0gJDEgbGltaXQgMVxuXHRgLCBbcmVxLnBhcmFtcy5pZF0pOyAvLyB2aWEgZmlsZW5hbWUgcGF0dGVyblxuXG5cdGlmICghcm93KSB7XG5cdFx0cmV0dXJuIGltcG9ydF9naXN0KHJlcSwgcmVzKTtcblx0fVxuXG5cdHNlbmQocmVzLCAyMDAsIHtcblx0XHR1aWQ6IHJvdy51aWQucmVwbGFjZSgvLS9nLCAnJyksXG5cdFx0bmFtZTogcm93Lm5hbWUsXG5cdFx0ZmlsZXM6IHJvdy5maWxlcyxcblx0XHRvd25lcjogcm93Lm93bmVyXG5cdH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGF0Y2gocmVxLCByZXMpIHtcblx0Y29uc3QgeyB1c2VyIH0gPSByZXE7XG5cdGlmICghdXNlcikgcmV0dXJuO1xuXG5cdGxldCBpZDtcblx0Y29uc3QgdWlkID0gcmVxLnBhcmFtcy5pZDtcblxuXHR0cnkge1xuXHRcdGNvbnN0IFtyb3ddID0gYXdhaXQgcXVlcnkoYHNlbGVjdCAqIGZyb20gZ2lzdHMgd2hlcmUgdWlkID0gJDEgbGltaXQgMWAsIFt1aWRdKTtcblx0XHRpZiAoIXJvdykgcmV0dXJuIHNlbmQocmVzLCA0MDQsIHsgZXJyb3I6ICdHaXN0IG5vdCBmb3VuZCcgfSk7XG5cdFx0aWYgKHJvdy51c2VyX2lkICE9PSB1c2VyLmlkKSByZXR1cm4gc2VuZChyZXMsIDQwMywgeyBlcnJvcjogJ0l0ZW0gZG9lcyBub3QgYmVsb25nIHRvIHlvdScgfSk7XG5cdFx0aWQgPSByb3cuaWQ7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdGNvbnNvbGUuZXJyb3IoJ1BBVENIIC9naXN0cyBAIHNlbGVjdCcsIGVycik7XG5cdFx0cmV0dXJuIHNlbmQocmVzLCA1MDApO1xuXHR9XG5cblx0dHJ5IHtcblx0XHRjb25zdCBvYmogPSBhd2FpdCBib2R5KHJlcSk7XG5cdFx0b2JqLnVwZGF0ZWRfYXQgPSAnbm93KCknO1xuXHRcdGxldCBrO1xuXHRcdGNvbnN0IGNvbHMgPSBbXTtcblx0XHRjb25zdCB2YWxzID0gW107XG5cdFx0Zm9yIChrIGluIG9iaikge1xuXHRcdFx0Y29scy5wdXNoKGspO1xuXHRcdFx0dmFscy5wdXNoKGsgPT09ICdmaWxlcycgPyBKU09OLnN0cmluZ2lmeShvYmpba10pIDogb2JqW2tdKTtcblx0XHR9XG5cblx0XHRjb25zdCB0bXAgPSB2YWxzLm1hcCgoeCwgaSkgPT4gYCQke2kgKyAxfWApLmpvaW4oJywnKTtcblx0XHRjb25zdCBzZXQgPSBgc2V0ICgke2NvbHMuam9pbignLCcpfSkgPSAoJHt0bXB9KWA7XG5cblx0XHRjb25zdCBbcm93XSA9IGF3YWl0IHF1ZXJ5KGB1cGRhdGUgZ2lzdHMgJHtzZXR9IHdoZXJlIGlkID0gJHtpZH0gcmV0dXJuaW5nICpgLCB2YWxzKTtcblxuXHRcdHNlbmQocmVzLCAyMDAsIHtcblx0XHRcdHVpZDogcm93LnVpZC5yZXBsYWNlKC8tL2csICcnKSxcblx0XHRcdG5hbWU6IHJvdy5uYW1lLFxuXHRcdFx0ZmlsZXM6IHJvdy5maWxlcyxcblx0XHRcdG93bmVyOiB1c2VyLnVpZCxcblx0XHR9KTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Y29uc29sZS5lcnJvcignUEFUQ0ggL2dpc3RzIEAgdXBkYXRlJywgZXJyKTtcblx0XHRzZW5kKHJlcywgNTAwLCB7IGVycm9yOiBlcnIubWVzc2FnZSB9KTtcblx0fVxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xuXHRyZXMud3JpdGVIZWFkKDMwMiwgeyBMb2NhdGlvbjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9zdmVsdGVqcy9zdmVsdGUvd2lraS9GQVEnIH0pO1xuXHRyZXMuZW5kKCk7XG59IiwiLy8gVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBieSBTYXBwZXIg4oCUIGRvIG5vdCBlZGl0IGl0IVxuaW1wb3J0ICogYXMgcm91dGVfMCBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2V4YW1wbGVzL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzEgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9leGFtcGxlcy9bc2x1Z10uanNvbi5qc1wiO1xuaW1wb3J0ICogYXMgcm91dGVfMiBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3R1dG9yaWFsL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzMgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy90dXRvcmlhbC9yYW5kb20tbnVtYmVyLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV80IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvdHV0b3JpYWwvW3NsdWddL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzUgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9hcHBzL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzYgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9hdXRoL2NhbGxiYWNrLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV83IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvYXV0aC9sb2dvdXQuanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzggZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9hdXRoL2xvZ2luLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV85IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvYmxvZy9pbmRleC5qc29uLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV8xMCBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2Jsb2cvcnNzLnhtbC5qc1wiO1xuaW1wb3J0ICogYXMgcm91dGVfMTEgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9ibG9nL1tzbHVnXS5qc29uLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV8xMiBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2NoYXQuanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzEzIGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvZG9jcy9pbmRleC5qc29uLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV8xNCBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3JlcGwvY3JlYXRlLmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzE1IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvcmVwbC9sb2NhbC9bLi4uZmlsZV0uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzE2IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvcmVwbC9baWRdL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzE3IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvZmFxLmpzXCI7XG5pbXBvcnQgY29tcG9uZW50XzAgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9pbmRleC5zdmVsdGVcIjtcbmltcG9ydCBjb21wb25lbnRfMSwgeyBwcmVsb2FkIGFzIHByZWxvYWRfMSB9IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvZXhhbXBsZXMvaW5kZXguc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzIsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzIgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3R1dG9yaWFsL19sYXlvdXQuc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzMsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzMgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3R1dG9yaWFsL2luZGV4LnN2ZWx0ZVwiO1xuaW1wb3J0IGNvbXBvbmVudF80LCB7IHByZWxvYWQgYXMgcHJlbG9hZF80IH0gZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy90dXRvcmlhbC9bc2x1Z10vaW5kZXguc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzUsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzUgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2FwcHMvaW5kZXguc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzYsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzYgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2Jsb2cvaW5kZXguc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzcsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzcgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2Jsb2cvW3NsdWddLnN2ZWx0ZVwiO1xuaW1wb3J0IGNvbXBvbmVudF84LCB7IHByZWxvYWQgYXMgcHJlbG9hZF84IH0gZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9kb2NzL2luZGV4LnN2ZWx0ZVwiO1xuaW1wb3J0IGNvbXBvbmVudF85LCB7IHByZWxvYWQgYXMgcHJlbG9hZF85IH0gZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9yZXBsL2luZGV4LnN2ZWx0ZVwiO1xuaW1wb3J0IGNvbXBvbmVudF8xMCwgeyBwcmVsb2FkIGFzIHByZWxvYWRfMTAgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3JlcGwvZW1iZWQuc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzExLCB7IHByZWxvYWQgYXMgcHJlbG9hZF8xMSB9IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvcmVwbC9baWRdL2luZGV4LnN2ZWx0ZVwiO1xuaW1wb3J0IHJvb3QgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9fbGF5b3V0LnN2ZWx0ZVwiO1xuaW1wb3J0IGVycm9yIGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvX2Vycm9yLnN2ZWx0ZVwiO1xuXG5jb25zdCBkID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuXG5leHBvcnQgY29uc3QgbWFuaWZlc3QgPSB7XG5cdHNlcnZlcl9yb3V0ZXM6IFtcblx0XHR7XG5cdFx0XHQvLyBleGFtcGxlcy9pbmRleC5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL2V4YW1wbGVzLmpzb24kLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8wLFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIGV4YW1wbGVzL1tzbHVnXS5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL2V4YW1wbGVzXFwvKFteXFwvXSs/KS5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfMSxcblx0XHRcdHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gdHV0b3JpYWwvaW5kZXguanNvbi5qc1xuXHRcdFx0cGF0dGVybjogL15cXC90dXRvcmlhbC5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfMixcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyB0dXRvcmlhbC9yYW5kb20tbnVtYmVyLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3R1dG9yaWFsXFwvcmFuZG9tLW51bWJlclxcLz8kLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8zLFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIHR1dG9yaWFsL1tzbHVnXS9pbmRleC5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3R1dG9yaWFsXFwvKFteXFwvXSs/KS5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfNCxcblx0XHRcdHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gYXBwcy9pbmRleC5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL2FwcHMuanNvbiQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzUsXG5cdFx0XHRwYXJhbXM6ICgpID0+ICh7fSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gYXV0aC9jYWxsYmFjay5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9hdXRoXFwvY2FsbGJhY2tcXC8/JC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfNixcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBhdXRoL2xvZ291dC5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9hdXRoXFwvbG9nb3V0XFwvPyQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzcsXG5cdFx0XHRwYXJhbXM6ICgpID0+ICh7fSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gYXV0aC9sb2dpbi5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9hdXRoXFwvbG9naW5cXC8/JC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfOCxcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL2luZGV4Lmpzb24uanNcblx0XHRcdHBhdHRlcm46IC9eXFwvYmxvZy5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfOSxcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL3Jzcy54bWwuanNcblx0XHRcdHBhdHRlcm46IC9eXFwvYmxvZ1xcL3Jzcy54bWwkLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8xMCxcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL1tzbHVnXS5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL2Jsb2dcXC8oW15cXC9dKz8pLmpzb24kLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8xMSxcblx0XHRcdHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gY2hhdC5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9jaGF0XFwvPyQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzEyLFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIGRvY3MvaW5kZXguanNvbi5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9kb2NzLmpzb24kLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8xMyxcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyByZXBsL2NyZWF0ZS5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3JlcGxcXC9jcmVhdGUuanNvbiQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzE0LFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIHJlcGwvbG9jYWwvWy4uLmZpbGVdLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3JlcGxcXC9sb2NhbFxcLyguKykkLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8xNSxcblx0XHRcdHBhcmFtczogbWF0Y2ggPT4gKHsgZmlsZTogZChtYXRjaFsxXSkuc3BsaXQoJy8nKSB9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyByZXBsL1tpZF0vaW5kZXguanNvbi5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9yZXBsXFwvKFteXFwvXSs/KS5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfMTYsXG5cdFx0XHRwYXJhbXM6IG1hdGNoID0+ICh7IGlkOiBkKG1hdGNoWzFdKSB9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBmYXEuanNcblx0XHRcdHBhdHRlcm46IC9eXFwvZmFxXFwvPyQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzE3LFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fVxuXHRdLFxuXG5cdHBhZ2VzOiBbXG5cdFx0e1xuXHRcdFx0Ly8gaW5kZXguc3ZlbHRlXG5cdFx0XHRwYXR0ZXJuOiAvXlxcLyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcImluZGV4XCIsIGZpbGU6IFwiaW5kZXguc3ZlbHRlXCIsIGNvbXBvbmVudDogY29tcG9uZW50XzAgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBleGFtcGxlcy9pbmRleC5zdmVsdGVcblx0XHRcdHBhdHRlcm46IC9eXFwvZXhhbXBsZXNcXC8/JC8sXG5cdFx0XHRwYXJ0czogW1xuXHRcdFx0XHR7IG5hbWU6IFwiZXhhbXBsZXNcIiwgZmlsZTogXCJleGFtcGxlcy9pbmRleC5zdmVsdGVcIiwgY29tcG9uZW50OiBjb21wb25lbnRfMSwgcHJlbG9hZDogcHJlbG9hZF8xIH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gdHV0b3JpYWwvaW5kZXguc3ZlbHRlXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3R1dG9yaWFsXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcInR1dG9yaWFsX19sYXlvdXRcIiwgZmlsZTogXCJ0dXRvcmlhbC9fbGF5b3V0LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF8yLCBwcmVsb2FkOiBwcmVsb2FkXzIgfSxcblx0XHRcdFx0eyBuYW1lOiBcInR1dG9yaWFsXCIsIGZpbGU6IFwidHV0b3JpYWwvaW5kZXguc3ZlbHRlXCIsIGNvbXBvbmVudDogY29tcG9uZW50XzMsIHByZWxvYWQ6IHByZWxvYWRfMyB9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIHR1dG9yaWFsL1tzbHVnXS9pbmRleC5zdmVsdGVcblx0XHRcdHBhdHRlcm46IC9eXFwvdHV0b3JpYWxcXC8oW15cXC9dKz8pXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcInR1dG9yaWFsX19sYXlvdXRcIiwgZmlsZTogXCJ0dXRvcmlhbC9fbGF5b3V0LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF8yLCBwcmVsb2FkOiBwcmVsb2FkXzIgfSxcblx0XHRcdFx0eyBuYW1lOiBcInR1dG9yaWFsXyRzbHVnXCIsIGZpbGU6IFwidHV0b3JpYWwvW3NsdWddL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF80LCBwcmVsb2FkOiBwcmVsb2FkXzQsIHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSkgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBhcHBzL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9hcHBzXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcImFwcHNcIiwgZmlsZTogXCJhcHBzL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF81LCBwcmVsb2FkOiBwcmVsb2FkXzUgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9ibG9nXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcImJsb2dcIiwgZmlsZTogXCJibG9nL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF82LCBwcmVsb2FkOiBwcmVsb2FkXzYgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL1tzbHVnXS5zdmVsdGVcblx0XHRcdHBhdHRlcm46IC9eXFwvYmxvZ1xcLyhbXlxcL10rPylcXC8/JC8sXG5cdFx0XHRwYXJ0czogW1xuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHR7IG5hbWU6IFwiYmxvZ18kc2x1Z1wiLCBmaWxlOiBcImJsb2cvW3NsdWddLnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF83LCBwcmVsb2FkOiBwcmVsb2FkXzcsIHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSkgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBkb2NzL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9kb2NzXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcImRvY3NcIiwgZmlsZTogXCJkb2NzL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF84LCBwcmVsb2FkOiBwcmVsb2FkXzggfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyByZXBsL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9yZXBsXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcInJlcGxcIiwgZmlsZTogXCJyZXBsL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF85LCBwcmVsb2FkOiBwcmVsb2FkXzkgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyByZXBsL2VtYmVkLnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9yZXBsXFwvZW1iZWRcXC8/JC8sXG5cdFx0XHRwYXJ0czogW1xuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHR7IG5hbWU6IFwicmVwbF9lbWJlZFwiLCBmaWxlOiBcInJlcGwvZW1iZWQuc3ZlbHRlXCIsIGNvbXBvbmVudDogY29tcG9uZW50XzEwLCBwcmVsb2FkOiBwcmVsb2FkXzEwIH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gcmVwbC9baWRdL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9yZXBsXFwvKFteXFwvXSs/KVxcLz8kLyxcblx0XHRcdHBhcnRzOiBbXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdHsgbmFtZTogXCJyZXBsXyRpZFwiLCBmaWxlOiBcInJlcGwvW2lkXS9pbmRleC5zdmVsdGVcIiwgY29tcG9uZW50OiBjb21wb25lbnRfMTEsIHByZWxvYWQ6IHByZWxvYWRfMTEsIHBhcmFtczogbWF0Y2ggPT4gKHsgaWQ6IGQobWF0Y2hbMV0pIH0pIH1cblx0XHRcdF1cblx0XHR9XG5cdF0sXG5cblx0cm9vdCxcblx0cm9vdF9wcmVsb2FkOiAoKSA9PiB7fSxcblx0ZXJyb3Jcbn07XG5cbmV4cG9ydCBjb25zdCBidWlsZF9kaXIgPSBcIl9fc2FwcGVyX18vZGV2XCI7XG5cbmV4cG9ydCBjb25zdCBzcmNfZGlyID0gXCJzcmNcIjtcblxuZXhwb3J0IGNvbnN0IGRldiA9IHRydWU7IiwiaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZGV2LCBidWlsZF9kaXIsIHNyY19kaXIsIG1hbmlmZXN0IH0gZnJvbSAnLi9pbnRlcm5hbC9tYW5pZmVzdC1zZXJ2ZXInO1xuaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tICdzdmVsdGUvc3RvcmUnO1xuaW1wb3J0IFN0cmVhbSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgVXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgQXBwIGZyb20gJy4vaW50ZXJuYWwvQXBwLnN2ZWx0ZSc7XG5cbmZ1bmN0aW9uIGdldF9zZXJ2ZXJfcm91dGVfaGFuZGxlcihyb3V0ZXMpIHtcblx0YXN5bmMgZnVuY3Rpb24gaGFuZGxlX3JvdXRlKHJvdXRlLCByZXEsIHJlcywgbmV4dCkge1xuXHRcdHJlcS5wYXJhbXMgPSByb3V0ZS5wYXJhbXMocm91dGUucGF0dGVybi5leGVjKHJlcS5wYXRoKSk7XG5cblx0XHRjb25zdCBtZXRob2QgPSByZXEubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG5cdFx0Ly8gJ2RlbGV0ZScgY2Fubm90IGJlIGV4cG9ydGVkIGZyb20gYSBtb2R1bGUgYmVjYXVzZSBpdCBpcyBhIGtleXdvcmQsXG5cdFx0Ly8gc28gY2hlY2sgZm9yICdkZWwnIGluc3RlYWRcblx0XHRjb25zdCBtZXRob2RfZXhwb3J0ID0gbWV0aG9kID09PSAnZGVsZXRlJyA/ICdkZWwnIDogbWV0aG9kO1xuXHRcdGNvbnN0IGhhbmRsZV9tZXRob2QgPSByb3V0ZS5oYW5kbGVyc1ttZXRob2RfZXhwb3J0XTtcblx0XHRpZiAoaGFuZGxlX21ldGhvZCkge1xuXHRcdFx0aWYgKHByb2Nlc3MuZW52LlNBUFBFUl9FWFBPUlQpIHtcblx0XHRcdFx0Y29uc3QgeyB3cml0ZSwgZW5kLCBzZXRIZWFkZXIgfSA9IHJlcztcblx0XHRcdFx0Y29uc3QgY2h1bmtzID0gW107XG5cdFx0XHRcdGNvbnN0IGhlYWRlcnMgPSB7fTtcblxuXHRcdFx0XHQvLyBpbnRlcmNlcHQgZGF0YSBzbyB0aGF0IGl0IGNhbiBiZSBleHBvcnRlZFxuXHRcdFx0XHRyZXMud3JpdGUgPSBmdW5jdGlvbihjaHVuaykge1xuXHRcdFx0XHRcdGNodW5rcy5wdXNoKEJ1ZmZlci5mcm9tKGNodW5rKSk7XG5cdFx0XHRcdFx0d3JpdGUuYXBwbHkocmVzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJlcy5zZXRIZWFkZXIgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuXHRcdFx0XHRcdGhlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXSA9IHZhbHVlO1xuXHRcdFx0XHRcdHNldEhlYWRlci5hcHBseShyZXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0cmVzLmVuZCA9IGZ1bmN0aW9uKGNodW5rKSB7XG5cdFx0XHRcdFx0aWYgKGNodW5rKSBjaHVua3MucHVzaChCdWZmZXIuZnJvbShjaHVuaykpO1xuXHRcdFx0XHRcdGVuZC5hcHBseShyZXMsIGFyZ3VtZW50cyk7XG5cblx0XHRcdFx0XHRwcm9jZXNzLnNlbmQoe1xuXHRcdFx0XHRcdFx0X19zYXBwZXJfXzogdHJ1ZSxcblx0XHRcdFx0XHRcdGV2ZW50OiAnZmlsZScsXG5cdFx0XHRcdFx0XHR1cmw6IHJlcS51cmwsXG5cdFx0XHRcdFx0XHRtZXRob2Q6IHJlcS5tZXRob2QsXG5cdFx0XHRcdFx0XHRzdGF0dXM6IHJlcy5zdGF0dXNDb2RlLFxuXHRcdFx0XHRcdFx0dHlwZTogaGVhZGVyc1snY29udGVudC10eXBlJ10sXG5cdFx0XHRcdFx0XHRib2R5OiBCdWZmZXIuY29uY2F0KGNodW5rcykudG9TdHJpbmcoKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBoYW5kbGVfbmV4dCA9IChlcnIpID0+IHtcblx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuXHRcdFx0XHRcdHJlcy5lbmQoZXJyLm1lc3NhZ2UpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHByb2Nlc3MubmV4dFRpY2sobmV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IGhhbmRsZV9tZXRob2QocmVxLCByZXMsIGhhbmRsZV9uZXh0KTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0XHRcdGhhbmRsZV9uZXh0KGVycik7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG5vIG1hdGNoaW5nIGhhbmRsZXIgZm9yIG1ldGhvZFxuXHRcdFx0cHJvY2Vzcy5uZXh0VGljayhuZXh0KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZnVuY3Rpb24gZmluZF9yb3V0ZShyZXEsIHJlcywgbmV4dCkge1xuXHRcdGZvciAoY29uc3Qgcm91dGUgb2Ygcm91dGVzKSB7XG5cdFx0XHRpZiAocm91dGUucGF0dGVybi50ZXN0KHJlcS5wYXRoKSkge1xuXHRcdFx0XHRoYW5kbGVfcm91dGUocm91dGUsIHJlcSwgcmVzLCBuZXh0KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG5leHQoKTtcblx0fTtcbn1cblxuLyohXG4gKiBjb29raWVcbiAqIENvcHlyaWdodChjKSAyMDEyLTIwMTQgUm9tYW4gU2h0eWxtYW5cbiAqIENvcHlyaWdodChjKSAyMDE1IERvdWdsYXMgQ2hyaXN0b3BoZXIgV2lsc29uXG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICogQHB1YmxpY1xuICovXG5cbnZhciBwYXJzZV8xID0gcGFyc2U7XG52YXIgc2VyaWFsaXplXzEgPSBzZXJpYWxpemU7XG5cbi8qKlxuICogTW9kdWxlIHZhcmlhYmxlcy5cbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIGRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcbnZhciBlbmNvZGUgPSBlbmNvZGVVUklDb21wb25lbnQ7XG52YXIgcGFpclNwbGl0UmVnRXhwID0gLzsgKi87XG5cbi8qKlxuICogUmVnRXhwIHRvIG1hdGNoIGZpZWxkLWNvbnRlbnQgaW4gUkZDIDcyMzAgc2VjIDMuMlxuICpcbiAqIGZpZWxkLWNvbnRlbnQgPSBmaWVsZC12Y2hhciBbIDEqKCBTUCAvIEhUQUIgKSBmaWVsZC12Y2hhciBdXG4gKiBmaWVsZC12Y2hhciAgID0gVkNIQVIgLyBvYnMtdGV4dFxuICogb2JzLXRleHQgICAgICA9ICV4ODAtRkZcbiAqL1xuXG52YXIgZmllbGRDb250ZW50UmVnRXhwID0gL15bXFx1MDAwOVxcdTAwMjAtXFx1MDA3ZVxcdTAwODAtXFx1MDBmZl0rJC87XG5cbi8qKlxuICogUGFyc2UgYSBjb29raWUgaGVhZGVyLlxuICpcbiAqIFBhcnNlIHRoZSBnaXZlbiBjb29raWUgaGVhZGVyIHN0cmluZyBpbnRvIGFuIG9iamVjdFxuICogVGhlIG9iamVjdCBoYXMgdGhlIHZhcmlvdXMgY29va2llcyBhcyBrZXlzKG5hbWVzKSA9PiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKiBAcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyLCBvcHRpb25zKSB7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FyZ3VtZW50IHN0ciBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gIH1cblxuICB2YXIgb2JqID0ge307XG4gIHZhciBvcHQgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQocGFpclNwbGl0UmVnRXhwKTtcbiAgdmFyIGRlYyA9IG9wdC5kZWNvZGUgfHwgZGVjb2RlO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGFpciA9IHBhaXJzW2ldO1xuICAgIHZhciBlcV9pZHggPSBwYWlyLmluZGV4T2YoJz0nKTtcblxuICAgIC8vIHNraXAgdGhpbmdzIHRoYXQgZG9uJ3QgbG9vayBsaWtlIGtleT12YWx1ZVxuICAgIGlmIChlcV9pZHggPCAwKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIga2V5ID0gcGFpci5zdWJzdHIoMCwgZXFfaWR4KS50cmltKCk7XG4gICAgdmFyIHZhbCA9IHBhaXIuc3Vic3RyKCsrZXFfaWR4LCBwYWlyLmxlbmd0aCkudHJpbSgpO1xuXG4gICAgLy8gcXVvdGVkIHZhbHVlc1xuICAgIGlmICgnXCInID09IHZhbFswXSkge1xuICAgICAgdmFsID0gdmFsLnNsaWNlKDEsIC0xKTtcbiAgICB9XG5cbiAgICAvLyBvbmx5IGFzc2lnbiBvbmNlXG4gICAgaWYgKHVuZGVmaW5lZCA9PSBvYmpba2V5XSkge1xuICAgICAgb2JqW2tleV0gPSB0cnlEZWNvZGUodmFsLCBkZWMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIGRhdGEgaW50byBhIGNvb2tpZSBoZWFkZXIuXG4gKlxuICogU2VyaWFsaXplIHRoZSBhIG5hbWUgdmFsdWUgcGFpciBpbnRvIGEgY29va2llIHN0cmluZyBzdWl0YWJsZSBmb3JcbiAqIGh0dHAgaGVhZGVycy4gQW4gb3B0aW9uYWwgb3B0aW9ucyBvYmplY3Qgc3BlY2lmaWVkIGNvb2tpZSBwYXJhbWV0ZXJzLlxuICpcbiAqIHNlcmlhbGl6ZSgnZm9vJywgJ2JhcicsIHsgaHR0cE9ubHk6IHRydWUgfSlcbiAqICAgPT4gXCJmb289YmFyOyBodHRwT25seVwiXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqIEBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUobmFtZSwgdmFsLCBvcHRpb25zKSB7XG4gIHZhciBvcHQgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgZW5jID0gb3B0LmVuY29kZSB8fCBlbmNvZGU7XG5cbiAgaWYgKHR5cGVvZiBlbmMgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gZW5jb2RlIGlzIGludmFsaWQnKTtcbiAgfVxuXG4gIGlmICghZmllbGRDb250ZW50UmVnRXhwLnRlc3QobmFtZSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhcmd1bWVudCBuYW1lIGlzIGludmFsaWQnKTtcbiAgfVxuXG4gIHZhciB2YWx1ZSA9IGVuYyh2YWwpO1xuXG4gIGlmICh2YWx1ZSAmJiAhZmllbGRDb250ZW50UmVnRXhwLnRlc3QodmFsdWUpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJndW1lbnQgdmFsIGlzIGludmFsaWQnKTtcbiAgfVxuXG4gIHZhciBzdHIgPSBuYW1lICsgJz0nICsgdmFsdWU7XG5cbiAgaWYgKG51bGwgIT0gb3B0Lm1heEFnZSkge1xuICAgIHZhciBtYXhBZ2UgPSBvcHQubWF4QWdlIC0gMDtcbiAgICBpZiAoaXNOYU4obWF4QWdlKSkgdGhyb3cgbmV3IEVycm9yKCdtYXhBZ2Ugc2hvdWxkIGJlIGEgTnVtYmVyJyk7XG4gICAgc3RyICs9ICc7IE1heC1BZ2U9JyArIE1hdGguZmxvb3IobWF4QWdlKTtcbiAgfVxuXG4gIGlmIChvcHQuZG9tYWluKSB7XG4gICAgaWYgKCFmaWVsZENvbnRlbnRSZWdFeHAudGVzdChvcHQuZG9tYWluKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIGRvbWFpbiBpcyBpbnZhbGlkJyk7XG4gICAgfVxuXG4gICAgc3RyICs9ICc7IERvbWFpbj0nICsgb3B0LmRvbWFpbjtcbiAgfVxuXG4gIGlmIChvcHQucGF0aCkge1xuICAgIGlmICghZmllbGRDb250ZW50UmVnRXhwLnRlc3Qob3B0LnBhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gcGF0aCBpcyBpbnZhbGlkJyk7XG4gICAgfVxuXG4gICAgc3RyICs9ICc7IFBhdGg9JyArIG9wdC5wYXRoO1xuICB9XG5cbiAgaWYgKG9wdC5leHBpcmVzKSB7XG4gICAgaWYgKHR5cGVvZiBvcHQuZXhwaXJlcy50b1VUQ1N0cmluZyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIGV4cGlyZXMgaXMgaW52YWxpZCcpO1xuICAgIH1cblxuICAgIHN0ciArPSAnOyBFeHBpcmVzPScgKyBvcHQuZXhwaXJlcy50b1VUQ1N0cmluZygpO1xuICB9XG5cbiAgaWYgKG9wdC5odHRwT25seSkge1xuICAgIHN0ciArPSAnOyBIdHRwT25seSc7XG4gIH1cblxuICBpZiAob3B0LnNlY3VyZSkge1xuICAgIHN0ciArPSAnOyBTZWN1cmUnO1xuICB9XG5cbiAgaWYgKG9wdC5zYW1lU2l0ZSkge1xuICAgIHZhciBzYW1lU2l0ZSA9IHR5cGVvZiBvcHQuc2FtZVNpdGUgPT09ICdzdHJpbmcnXG4gICAgICA/IG9wdC5zYW1lU2l0ZS50b0xvd2VyQ2FzZSgpIDogb3B0LnNhbWVTaXRlO1xuXG4gICAgc3dpdGNoIChzYW1lU2l0ZSkge1xuICAgICAgY2FzZSB0cnVlOlxuICAgICAgICBzdHIgKz0gJzsgU2FtZVNpdGU9U3RyaWN0JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdsYXgnOlxuICAgICAgICBzdHIgKz0gJzsgU2FtZVNpdGU9TGF4JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzdHJpY3QnOlxuICAgICAgICBzdHIgKz0gJzsgU2FtZVNpdGU9U3RyaWN0JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdub25lJzpcbiAgICAgICAgc3RyICs9ICc7IFNhbWVTaXRlPU5vbmUnO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBzYW1lU2l0ZSBpcyBpbnZhbGlkJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBUcnkgZGVjb2RpbmcgYSBzdHJpbmcgdXNpbmcgYSBkZWNvZGluZyBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBkZWNvZGVcbiAqIEBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHJ5RGVjb2RlKHN0ciwgZGVjb2RlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZShzdHIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG52YXIgY29va2llID0ge1xuXHRwYXJzZTogcGFyc2VfMSxcblx0c2VyaWFsaXplOiBzZXJpYWxpemVfMVxufTtcblxudmFyIGNoYXJzID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpfJCc7XG52YXIgdW5zYWZlQ2hhcnMgPSAvWzw+XFxiXFxmXFxuXFxyXFx0XFwwXFx1MjAyOFxcdTIwMjldL2c7XG52YXIgcmVzZXJ2ZWQgPSAvXig/OmRvfGlmfGlufGZvcnxpbnR8bGV0fG5ld3x0cnl8dmFyfGJ5dGV8Y2FzZXxjaGFyfGVsc2V8ZW51bXxnb3RvfGxvbmd8dGhpc3x2b2lkfHdpdGh8YXdhaXR8YnJlYWt8Y2F0Y2h8Y2xhc3N8Y29uc3R8ZmluYWx8ZmxvYXR8c2hvcnR8c3VwZXJ8dGhyb3d8d2hpbGV8eWllbGR8ZGVsZXRlfGRvdWJsZXxleHBvcnR8aW1wb3J0fG5hdGl2ZXxyZXR1cm58c3dpdGNofHRocm93c3x0eXBlb2Z8Ym9vbGVhbnxkZWZhdWx0fGV4dGVuZHN8ZmluYWxseXxwYWNrYWdlfHByaXZhdGV8YWJzdHJhY3R8Y29udGludWV8ZGVidWdnZXJ8ZnVuY3Rpb258dm9sYXRpbGV8aW50ZXJmYWNlfHByb3RlY3RlZHx0cmFuc2llbnR8aW1wbGVtZW50c3xpbnN0YW5jZW9mfHN5bmNocm9uaXplZCkkLztcbnZhciBlc2NhcGVkID0ge1xuICAgICc8JzogJ1xcXFx1MDAzQycsXG4gICAgJz4nOiAnXFxcXHUwMDNFJyxcbiAgICAnLyc6ICdcXFxcdTAwMkYnLFxuICAgICdcXFxcJzogJ1xcXFxcXFxcJyxcbiAgICAnXFxiJzogJ1xcXFxiJyxcbiAgICAnXFxmJzogJ1xcXFxmJyxcbiAgICAnXFxuJzogJ1xcXFxuJyxcbiAgICAnXFxyJzogJ1xcXFxyJyxcbiAgICAnXFx0JzogJ1xcXFx0JyxcbiAgICAnXFwwJzogJ1xcXFwwJyxcbiAgICAnXFx1MjAyOCc6ICdcXFxcdTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ1xcXFx1MjAyOSdcbn07XG52YXIgb2JqZWN0UHJvdG9Pd25Qcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoT2JqZWN0LnByb3RvdHlwZSkuc29ydCgpLmpvaW4oJ1xcMCcpO1xuZnVuY3Rpb24gZGV2YWx1ZSh2YWx1ZSkge1xuICAgIHZhciBjb3VudHMgPSBuZXcgTWFwKCk7XG4gICAgZnVuY3Rpb24gd2Fsayh0aGluZykge1xuICAgICAgICBpZiAodHlwZW9mIHRoaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgc3RyaW5naWZ5IGEgZnVuY3Rpb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvdW50cy5oYXModGhpbmcpKSB7XG4gICAgICAgICAgICBjb3VudHMuc2V0KHRoaW5nLCBjb3VudHMuZ2V0KHRoaW5nKSArIDEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50cy5zZXQodGhpbmcsIDEpO1xuICAgICAgICBpZiAoIWlzUHJpbWl0aXZlKHRoaW5nKSkge1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBnZXRUeXBlKHRoaW5nKTtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ051bWJlcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnU3RyaW5nJzpcbiAgICAgICAgICAgICAgICBjYXNlICdCb29sZWFuJzpcbiAgICAgICAgICAgICAgICBjYXNlICdEYXRlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdSZWdFeHAnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICAgICAgICAgICAgICB0aGluZy5mb3JFYWNoKHdhbGspO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdTZXQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ01hcCc6XG4gICAgICAgICAgICAgICAgICAgIEFycmF5LmZyb20odGhpbmcpLmZvckVhY2god2Fsayk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGluZyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm90byAhPT0gT2JqZWN0LnByb3RvdHlwZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG8gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKS5zb3J0KCkuam9pbignXFwwJykgIT09IG9iamVjdFByb3RvT3duUHJvcGVydHlOYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHN0cmluZ2lmeSBhcmJpdHJhcnkgbm9uLVBPSk9zXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHRoaW5nKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgc3RyaW5naWZ5IFBPSk9zIHdpdGggc3ltYm9saWMga2V5c1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0aGluZykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IHJldHVybiB3YWxrKHRoaW5nW2tleV0pOyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB3YWxrKHZhbHVlKTtcbiAgICB2YXIgbmFtZXMgPSBuZXcgTWFwKCk7XG4gICAgQXJyYXkuZnJvbShjb3VudHMpXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGVudHJ5KSB7IHJldHVybiBlbnRyeVsxXSA+IDE7IH0pXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBiWzFdIC0gYVsxXTsgfSlcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5LCBpKSB7XG4gICAgICAgIG5hbWVzLnNldChlbnRyeVswXSwgZ2V0TmFtZShpKSk7XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gc3RyaW5naWZ5KHRoaW5nKSB7XG4gICAgICAgIGlmIChuYW1lcy5oYXModGhpbmcpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmFtZXMuZ2V0KHRoaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNQcmltaXRpdmUodGhpbmcpKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5naWZ5UHJpbWl0aXZlKHRoaW5nKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdHlwZSA9IGdldFR5cGUodGhpbmcpO1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ051bWJlcic6XG4gICAgICAgICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICAgICAgY2FzZSAnQm9vbGVhbic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiT2JqZWN0KFwiICsgc3RyaW5naWZ5KHRoaW5nLnZhbHVlT2YoKSkgKyBcIilcIjtcbiAgICAgICAgICAgIGNhc2UgJ1JlZ0V4cCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaW5nLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBjYXNlICdEYXRlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJuZXcgRGF0ZShcIiArIHRoaW5nLmdldFRpbWUoKSArIFwiKVwiO1xuICAgICAgICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICAgICAgICAgIHZhciBtZW1iZXJzID0gdGhpbmcubWFwKGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiBpIGluIHRoaW5nID8gc3RyaW5naWZ5KHYpIDogJyc7IH0pO1xuICAgICAgICAgICAgICAgIHZhciB0YWlsID0gdGhpbmcubGVuZ3RoID09PSAwIHx8ICh0aGluZy5sZW5ndGggLSAxIGluIHRoaW5nKSA/ICcnIDogJywnO1xuICAgICAgICAgICAgICAgIHJldHVybiBcIltcIiArIG1lbWJlcnMuam9pbignLCcpICsgdGFpbCArIFwiXVwiO1xuICAgICAgICAgICAgY2FzZSAnU2V0JzpcbiAgICAgICAgICAgIGNhc2UgJ01hcCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibmV3IFwiICsgdHlwZSArIFwiKFtcIiArIEFycmF5LmZyb20odGhpbmcpLm1hcChzdHJpbmdpZnkpLmpvaW4oJywnKSArIFwiXSlcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IFwie1wiICsgT2JqZWN0LmtleXModGhpbmcpLm1hcChmdW5jdGlvbiAoa2V5KSB7IHJldHVybiBzYWZlS2V5KGtleSkgKyBcIjpcIiArIHN0cmluZ2lmeSh0aGluZ1trZXldKTsgfSkuam9pbignLCcpICsgXCJ9XCI7XG4gICAgICAgICAgICAgICAgdmFyIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaW5nKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaW5nKS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwiT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKG51bGwpLFwiICsgb2JqICsgXCIpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJPYmplY3QuY3JlYXRlKG51bGwpXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIHN0ciA9IHN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgaWYgKG5hbWVzLnNpemUpIHtcbiAgICAgICAgdmFyIHBhcmFtc18xID0gW107XG4gICAgICAgIHZhciBzdGF0ZW1lbnRzXzEgPSBbXTtcbiAgICAgICAgdmFyIHZhbHVlc18xID0gW107XG4gICAgICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUsIHRoaW5nKSB7XG4gICAgICAgICAgICBwYXJhbXNfMS5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHRoaW5nKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlc18xLnB1c2goc3RyaW5naWZ5UHJpbWl0aXZlKHRoaW5nKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHR5cGUgPSBnZXRUeXBlKHRoaW5nKTtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ051bWJlcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnU3RyaW5nJzpcbiAgICAgICAgICAgICAgICBjYXNlICdCb29sZWFuJzpcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzXzEucHVzaChcIk9iamVjdChcIiArIHN0cmluZ2lmeSh0aGluZy52YWx1ZU9mKCkpICsgXCIpXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdSZWdFeHAnOlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXNfMS5wdXNoKHRoaW5nLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdEYXRlJzpcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzXzEucHVzaChcIm5ldyBEYXRlKFwiICsgdGhpbmcuZ2V0VGltZSgpICsgXCIpXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdBcnJheSc6XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlc18xLnB1c2goXCJBcnJheShcIiArIHRoaW5nLmxlbmd0aCArIFwiKVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpbmcuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50c18xLnB1c2gobmFtZSArIFwiW1wiICsgaSArIFwiXT1cIiArIHN0cmluZ2lmeSh2KSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdTZXQnOlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXNfMS5wdXNoKFwibmV3IFNldFwiKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50c18xLnB1c2gobmFtZSArIFwiLlwiICsgQXJyYXkuZnJvbSh0aGluZykubWFwKGZ1bmN0aW9uICh2KSB7IHJldHVybiBcImFkZChcIiArIHN0cmluZ2lmeSh2KSArIFwiKVwiOyB9KS5qb2luKCcuJykpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdNYXAnOlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXNfMS5wdXNoKFwibmV3IE1hcFwiKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50c18xLnB1c2gobmFtZSArIFwiLlwiICsgQXJyYXkuZnJvbSh0aGluZykubWFwKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGsgPSBfYVswXSwgdiA9IF9hWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwic2V0KFwiICsgc3RyaW5naWZ5KGspICsgXCIsIFwiICsgc3RyaW5naWZ5KHYpICsgXCIpXCI7XG4gICAgICAgICAgICAgICAgICAgIH0pLmpvaW4oJy4nKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlc18xLnB1c2goT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaW5nKSA9PT0gbnVsbCA/ICdPYmplY3QuY3JlYXRlKG51bGwpJyA6ICd7fScpO1xuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0aGluZykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZW1lbnRzXzEucHVzaChcIlwiICsgbmFtZSArIHNhZmVQcm9wKGtleSkgKyBcIj1cIiArIHN0cmluZ2lmeSh0aGluZ1trZXldKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc3RhdGVtZW50c18xLnB1c2goXCJyZXR1cm4gXCIgKyBzdHIpO1xuICAgICAgICByZXR1cm4gXCIoZnVuY3Rpb24oXCIgKyBwYXJhbXNfMS5qb2luKCcsJykgKyBcIil7XCIgKyBzdGF0ZW1lbnRzXzEuam9pbignOycpICsgXCJ9KFwiICsgdmFsdWVzXzEuam9pbignLCcpICsgXCIpKVwiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXROYW1lKG51bSkge1xuICAgIHZhciBuYW1lID0gJyc7XG4gICAgZG8ge1xuICAgICAgICBuYW1lID0gY2hhcnNbbnVtICUgY2hhcnMubGVuZ3RoXSArIG5hbWU7XG4gICAgICAgIG51bSA9IH5+KG51bSAvIGNoYXJzLmxlbmd0aCkgLSAxO1xuICAgIH0gd2hpbGUgKG51bSA+PSAwKTtcbiAgICByZXR1cm4gcmVzZXJ2ZWQudGVzdChuYW1lKSA/IG5hbWUgKyBcIl9cIiA6IG5hbWU7XG59XG5mdW5jdGlvbiBpc1ByaW1pdGl2ZSh0aGluZykge1xuICAgIHJldHVybiBPYmplY3QodGhpbmcpICE9PSB0aGluZztcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeVByaW1pdGl2ZSh0aGluZykge1xuICAgIGlmICh0eXBlb2YgdGhpbmcgPT09ICdzdHJpbmcnKVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5U3RyaW5nKHRoaW5nKTtcbiAgICBpZiAodGhpbmcgPT09IHZvaWQgMClcbiAgICAgICAgcmV0dXJuICd2b2lkIDAnO1xuICAgIGlmICh0aGluZyA9PT0gMCAmJiAxIC8gdGhpbmcgPCAwKVxuICAgICAgICByZXR1cm4gJy0wJztcbiAgICB2YXIgc3RyID0gU3RyaW5nKHRoaW5nKTtcbiAgICBpZiAodHlwZW9mIHRoaW5nID09PSAnbnVtYmVyJylcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eKC0pPzBcXC4vLCAnJDEuJyk7XG4gICAgcmV0dXJuIHN0cjtcbn1cbmZ1bmN0aW9uIGdldFR5cGUodGhpbmcpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRoaW5nKS5zbGljZSg4LCAtMSk7XG59XG5mdW5jdGlvbiBlc2NhcGVVbnNhZmVDaGFyKGMpIHtcbiAgICByZXR1cm4gZXNjYXBlZFtjXSB8fCBjO1xufVxuZnVuY3Rpb24gZXNjYXBlVW5zYWZlQ2hhcnMoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKHVuc2FmZUNoYXJzLCBlc2NhcGVVbnNhZmVDaGFyKTtcbn1cbmZ1bmN0aW9uIHNhZmVLZXkoa2V5KSB7XG4gICAgcmV0dXJuIC9eW18kYS16QS1aXVtfJGEtekEtWjAtOV0qJC8udGVzdChrZXkpID8ga2V5IDogZXNjYXBlVW5zYWZlQ2hhcnMoSlNPTi5zdHJpbmdpZnkoa2V5KSk7XG59XG5mdW5jdGlvbiBzYWZlUHJvcChrZXkpIHtcbiAgICByZXR1cm4gL15bXyRhLXpBLVpdW18kYS16QS1aMC05XSokLy50ZXN0KGtleSkgPyBcIi5cIiArIGtleSA6IFwiW1wiICsgZXNjYXBlVW5zYWZlQ2hhcnMoSlNPTi5zdHJpbmdpZnkoa2V5KSkgKyBcIl1cIjtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeVN0cmluZyhzdHIpIHtcbiAgICB2YXIgcmVzdWx0ID0gJ1wiJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgY2hhciA9IHN0ci5jaGFyQXQoaSk7XG4gICAgICAgIHZhciBjb2RlID0gY2hhci5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAoY2hhciA9PT0gJ1wiJykge1xuICAgICAgICAgICAgcmVzdWx0ICs9ICdcXFxcXCInO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoYXIgaW4gZXNjYXBlZCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGVzY2FwZWRbY2hhcl07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29kZSA+PSAweGQ4MDAgJiYgY29kZSA8PSAweGRmZmYpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyB0aGUgYmVnaW5uaW5nIG9mIGEgW2hpZ2gsIGxvd10gc3Vycm9nYXRlIHBhaXIsXG4gICAgICAgICAgICAvLyBhZGQgdGhlIG5leHQgdHdvIGNoYXJhY3RlcnMsIG90aGVyd2lzZSBlc2NhcGVcbiAgICAgICAgICAgIGlmIChjb2RlIDw9IDB4ZGJmZiAmJiAobmV4dCA+PSAweGRjMDAgJiYgbmV4dCA8PSAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGNoYXIgKyBzdHJbKytpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIlxcXFx1XCIgKyBjb2RlLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGNoYXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0ICs9ICdcIic7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL3RtcHZhci9qc2RvbS9ibG9iL2FhODViMmFiZjA3NzY2ZmY3YmY1YzFmNmRhYWZiMzcyNmYyZjJkYjUvbGliL2pzZG9tL2xpdmluZy9ibG9iLmpzXG5cbi8vIGZpeCBmb3IgXCJSZWFkYWJsZVwiIGlzbid0IGEgbmFtZWQgZXhwb3J0IGlzc3VlXG5jb25zdCBSZWFkYWJsZSA9IFN0cmVhbS5SZWFkYWJsZTtcblxuY29uc3QgQlVGRkVSID0gU3ltYm9sKCdidWZmZXInKTtcbmNvbnN0IFRZUEUgPSBTeW1ib2woJ3R5cGUnKTtcblxuY2xhc3MgQmxvYiB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXNbVFlQRV0gPSAnJztcblxuXHRcdGNvbnN0IGJsb2JQYXJ0cyA9IGFyZ3VtZW50c1swXTtcblx0XHRjb25zdCBvcHRpb25zID0gYXJndW1lbnRzWzFdO1xuXG5cdFx0Y29uc3QgYnVmZmVycyA9IFtdO1xuXHRcdGxldCBzaXplID0gMDtcblxuXHRcdGlmIChibG9iUGFydHMpIHtcblx0XHRcdGNvbnN0IGEgPSBibG9iUGFydHM7XG5cdFx0XHRjb25zdCBsZW5ndGggPSBOdW1iZXIoYS5sZW5ndGgpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBlbGVtZW50ID0gYVtpXTtcblx0XHRcdFx0bGV0IGJ1ZmZlcjtcblx0XHRcdFx0aWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCdWZmZXIpIHtcblx0XHRcdFx0XHRidWZmZXIgPSBlbGVtZW50O1xuXHRcdFx0XHR9IGVsc2UgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhlbGVtZW50KSkge1xuXHRcdFx0XHRcdGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGVsZW1lbnQuYnVmZmVyLCBlbGVtZW50LmJ5dGVPZmZzZXQsIGVsZW1lbnQuYnl0ZUxlbmd0aCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG5cdFx0XHRcdFx0YnVmZmVyID0gQnVmZmVyLmZyb20oZWxlbWVudCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJsb2IpIHtcblx0XHRcdFx0XHRidWZmZXIgPSBlbGVtZW50W0JVRkZFUl07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YnVmZmVyID0gQnVmZmVyLmZyb20odHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnID8gZWxlbWVudCA6IFN0cmluZyhlbGVtZW50KSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0c2l6ZSArPSBidWZmZXIubGVuZ3RoO1xuXHRcdFx0XHRidWZmZXJzLnB1c2goYnVmZmVyKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzW0JVRkZFUl0gPSBCdWZmZXIuY29uY2F0KGJ1ZmZlcnMpO1xuXG5cdFx0bGV0IHR5cGUgPSBvcHRpb25zICYmIG9wdGlvbnMudHlwZSAhPT0gdW5kZWZpbmVkICYmIFN0cmluZyhvcHRpb25zLnR5cGUpLnRvTG93ZXJDYXNlKCk7XG5cdFx0aWYgKHR5cGUgJiYgIS9bXlxcdTAwMjAtXFx1MDA3RV0vLnRlc3QodHlwZSkpIHtcblx0XHRcdHRoaXNbVFlQRV0gPSB0eXBlO1xuXHRcdH1cblx0fVxuXHRnZXQgc2l6ZSgpIHtcblx0XHRyZXR1cm4gdGhpc1tCVUZGRVJdLmxlbmd0aDtcblx0fVxuXHRnZXQgdHlwZSgpIHtcblx0XHRyZXR1cm4gdGhpc1tUWVBFXTtcblx0fVxuXHR0ZXh0KCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpc1tCVUZGRVJdLnRvU3RyaW5nKCkpO1xuXHR9XG5cdGFycmF5QnVmZmVyKCkge1xuXHRcdGNvbnN0IGJ1ZiA9IHRoaXNbQlVGRkVSXTtcblx0XHRjb25zdCBhYiA9IGJ1Zi5idWZmZXIuc2xpY2UoYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlT2Zmc2V0ICsgYnVmLmJ5dGVMZW5ndGgpO1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoYWIpO1xuXHR9XG5cdHN0cmVhbSgpIHtcblx0XHRjb25zdCByZWFkYWJsZSA9IG5ldyBSZWFkYWJsZSgpO1xuXHRcdHJlYWRhYmxlLl9yZWFkID0gZnVuY3Rpb24gKCkge307XG5cdFx0cmVhZGFibGUucHVzaCh0aGlzW0JVRkZFUl0pO1xuXHRcdHJlYWRhYmxlLnB1c2gobnVsbCk7XG5cdFx0cmV0dXJuIHJlYWRhYmxlO1xuXHR9XG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiAnW29iamVjdCBCbG9iXSc7XG5cdH1cblx0c2xpY2UoKSB7XG5cdFx0Y29uc3Qgc2l6ZSA9IHRoaXMuc2l6ZTtcblxuXHRcdGNvbnN0IHN0YXJ0ID0gYXJndW1lbnRzWzBdO1xuXHRcdGNvbnN0IGVuZCA9IGFyZ3VtZW50c1sxXTtcblx0XHRsZXQgcmVsYXRpdmVTdGFydCwgcmVsYXRpdmVFbmQ7XG5cdFx0aWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJlbGF0aXZlU3RhcnQgPSAwO1xuXHRcdH0gZWxzZSBpZiAoc3RhcnQgPCAwKSB7XG5cdFx0XHRyZWxhdGl2ZVN0YXJ0ID0gTWF0aC5tYXgoc2l6ZSArIHN0YXJ0LCAwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVsYXRpdmVTdGFydCA9IE1hdGgubWluKHN0YXJ0LCBzaXplKTtcblx0XHR9XG5cdFx0aWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZWxhdGl2ZUVuZCA9IHNpemU7XG5cdFx0fSBlbHNlIGlmIChlbmQgPCAwKSB7XG5cdFx0XHRyZWxhdGl2ZUVuZCA9IE1hdGgubWF4KHNpemUgKyBlbmQsIDApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZWxhdGl2ZUVuZCA9IE1hdGgubWluKGVuZCwgc2l6ZSk7XG5cdFx0fVxuXHRcdGNvbnN0IHNwYW4gPSBNYXRoLm1heChyZWxhdGl2ZUVuZCAtIHJlbGF0aXZlU3RhcnQsIDApO1xuXG5cdFx0Y29uc3QgYnVmZmVyID0gdGhpc1tCVUZGRVJdO1xuXHRcdGNvbnN0IHNsaWNlZEJ1ZmZlciA9IGJ1ZmZlci5zbGljZShyZWxhdGl2ZVN0YXJ0LCByZWxhdGl2ZVN0YXJ0ICsgc3Bhbik7XG5cdFx0Y29uc3QgYmxvYiA9IG5ldyBCbG9iKFtdLCB7IHR5cGU6IGFyZ3VtZW50c1syXSB9KTtcblx0XHRibG9iW0JVRkZFUl0gPSBzbGljZWRCdWZmZXI7XG5cdFx0cmV0dXJuIGJsb2I7XG5cdH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQmxvYi5wcm90b3R5cGUsIHtcblx0c2l6ZTogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG5cdHR5cGU6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRzbGljZTogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQmxvYi5wcm90b3R5cGUsIFN5bWJvbC50b1N0cmluZ1RhZywge1xuXHR2YWx1ZTogJ0Jsb2InLFxuXHR3cml0YWJsZTogZmFsc2UsXG5cdGVudW1lcmFibGU6IGZhbHNlLFxuXHRjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG4vKipcbiAqIGZldGNoLWVycm9yLmpzXG4gKlxuICogRmV0Y2hFcnJvciBpbnRlcmZhY2UgZm9yIG9wZXJhdGlvbmFsIGVycm9yc1xuICovXG5cbi8qKlxuICogQ3JlYXRlIEZldGNoRXJyb3IgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0gICBTdHJpbmcgICAgICBtZXNzYWdlICAgICAgRXJyb3IgbWVzc2FnZSBmb3IgaHVtYW5cbiAqIEBwYXJhbSAgIFN0cmluZyAgICAgIHR5cGUgICAgICAgICBFcnJvciB0eXBlIGZvciBtYWNoaW5lXG4gKiBAcGFyYW0gICBTdHJpbmcgICAgICBzeXN0ZW1FcnJvciAgRm9yIE5vZGUuanMgc3lzdGVtIGVycm9yXG4gKiBAcmV0dXJuICBGZXRjaEVycm9yXG4gKi9cbmZ1bmN0aW9uIEZldGNoRXJyb3IobWVzc2FnZSwgdHlwZSwgc3lzdGVtRXJyb3IpIHtcbiAgRXJyb3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICB0aGlzLnR5cGUgPSB0eXBlO1xuXG4gIC8vIHdoZW4gZXJyLnR5cGUgaXMgYHN5c3RlbWAsIGVyci5jb2RlIGNvbnRhaW5zIHN5c3RlbSBlcnJvciBjb2RlXG4gIGlmIChzeXN0ZW1FcnJvcikge1xuICAgIHRoaXMuY29kZSA9IHRoaXMuZXJybm8gPSBzeXN0ZW1FcnJvci5jb2RlO1xuICB9XG5cbiAgLy8gaGlkZSBjdXN0b20gZXJyb3IgaW1wbGVtZW50YXRpb24gZGV0YWlscyBmcm9tIGVuZC11c2Vyc1xuICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCB0aGlzLmNvbnN0cnVjdG9yKTtcbn1cblxuRmV0Y2hFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5GZXRjaEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZldGNoRXJyb3I7XG5GZXRjaEVycm9yLnByb3RvdHlwZS5uYW1lID0gJ0ZldGNoRXJyb3InO1xuXG5sZXQgY29udmVydDtcbnRyeSB7XG5cdGNvbnZlcnQgPSByZXF1aXJlKCdlbmNvZGluZycpLmNvbnZlcnQ7XG59IGNhdGNoIChlKSB7fVxuXG5jb25zdCBJTlRFUk5BTFMgPSBTeW1ib2woJ0JvZHkgaW50ZXJuYWxzJyk7XG5cbi8vIGZpeCBhbiBpc3N1ZSB3aGVyZSBcIlBhc3NUaHJvdWdoXCIgaXNuJ3QgYSBuYW1lZCBleHBvcnQgZm9yIG5vZGUgPDEwXG5jb25zdCBQYXNzVGhyb3VnaCA9IFN0cmVhbS5QYXNzVGhyb3VnaDtcblxuLyoqXG4gKiBCb2R5IG1peGluXG4gKlxuICogUmVmOiBodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jYm9keVxuICpcbiAqIEBwYXJhbSAgIFN0cmVhbSAgYm9keSAgUmVhZGFibGUgc3RyZWFtXG4gKiBAcGFyYW0gICBPYmplY3QgIG9wdHMgIFJlc3BvbnNlIG9wdGlvbnNcbiAqIEByZXR1cm4gIFZvaWRcbiAqL1xuZnVuY3Rpb24gQm9keShib2R5KSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0dmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9LFxuXHQgICAgX3JlZiRzaXplID0gX3JlZi5zaXplO1xuXG5cdGxldCBzaXplID0gX3JlZiRzaXplID09PSB1bmRlZmluZWQgPyAwIDogX3JlZiRzaXplO1xuXHR2YXIgX3JlZiR0aW1lb3V0ID0gX3JlZi50aW1lb3V0O1xuXHRsZXQgdGltZW91dCA9IF9yZWYkdGltZW91dCA9PT0gdW5kZWZpbmVkID8gMCA6IF9yZWYkdGltZW91dDtcblxuXHRpZiAoYm9keSA9PSBudWxsKSB7XG5cdFx0Ly8gYm9keSBpcyB1bmRlZmluZWQgb3IgbnVsbFxuXHRcdGJvZHkgPSBudWxsO1xuXHR9IGVsc2UgaWYgKGlzVVJMU2VhcmNoUGFyYW1zKGJvZHkpKSB7XG5cdFx0Ly8gYm9keSBpcyBhIFVSTFNlYXJjaFBhcmFtc1xuXHRcdGJvZHkgPSBCdWZmZXIuZnJvbShib2R5LnRvU3RyaW5nKCkpO1xuXHR9IGVsc2UgaWYgKGlzQmxvYihib2R5KSkgOyBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIoYm9keSkpIDsgZWxzZSBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGJvZHkpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nKSB7XG5cdFx0Ly8gYm9keSBpcyBBcnJheUJ1ZmZlclxuXHRcdGJvZHkgPSBCdWZmZXIuZnJvbShib2R5KTtcblx0fSBlbHNlIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoYm9keSkpIHtcblx0XHQvLyBib2R5IGlzIEFycmF5QnVmZmVyVmlld1xuXHRcdGJvZHkgPSBCdWZmZXIuZnJvbShib2R5LmJ1ZmZlciwgYm9keS5ieXRlT2Zmc2V0LCBib2R5LmJ5dGVMZW5ndGgpO1xuXHR9IGVsc2UgaWYgKGJvZHkgaW5zdGFuY2VvZiBTdHJlYW0pIDsgZWxzZSB7XG5cdFx0Ly8gbm9uZSBvZiB0aGUgYWJvdmVcblx0XHQvLyBjb2VyY2UgdG8gc3RyaW5nIHRoZW4gYnVmZmVyXG5cdFx0Ym9keSA9IEJ1ZmZlci5mcm9tKFN0cmluZyhib2R5KSk7XG5cdH1cblx0dGhpc1tJTlRFUk5BTFNdID0ge1xuXHRcdGJvZHksXG5cdFx0ZGlzdHVyYmVkOiBmYWxzZSxcblx0XHRlcnJvcjogbnVsbFxuXHR9O1xuXHR0aGlzLnNpemUgPSBzaXplO1xuXHR0aGlzLnRpbWVvdXQgPSB0aW1lb3V0O1xuXG5cdGlmIChib2R5IGluc3RhbmNlb2YgU3RyZWFtKSB7XG5cdFx0Ym9keS5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRjb25zdCBlcnJvciA9IGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicgPyBlcnIgOiBuZXcgRmV0Y2hFcnJvcihgSW52YWxpZCByZXNwb25zZSBib2R5IHdoaWxlIHRyeWluZyB0byBmZXRjaCAke190aGlzLnVybH06ICR7ZXJyLm1lc3NhZ2V9YCwgJ3N5c3RlbScsIGVycik7XG5cdFx0XHRfdGhpc1tJTlRFUk5BTFNdLmVycm9yID0gZXJyb3I7XG5cdFx0fSk7XG5cdH1cbn1cblxuQm9keS5wcm90b3R5cGUgPSB7XG5cdGdldCBib2R5KCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uYm9keTtcblx0fSxcblxuXHRnZXQgYm9keVVzZWQoKSB7XG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTXS5kaXN0dXJiZWQ7XG5cdH0sXG5cblx0LyoqXG4gICogRGVjb2RlIHJlc3BvbnNlIGFzIEFycmF5QnVmZmVyXG4gICpcbiAgKiBAcmV0dXJuICBQcm9taXNlXG4gICovXG5cdGFycmF5QnVmZmVyKCkge1xuXHRcdHJldHVybiBjb25zdW1lQm9keS5jYWxsKHRoaXMpLnRoZW4oZnVuY3Rpb24gKGJ1Zikge1xuXHRcdFx0cmV0dXJuIGJ1Zi5idWZmZXIuc2xpY2UoYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlT2Zmc2V0ICsgYnVmLmJ5dGVMZW5ndGgpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuICAqIFJldHVybiByYXcgcmVzcG9uc2UgYXMgQmxvYlxuICAqXG4gICogQHJldHVybiBQcm9taXNlXG4gICovXG5cdGJsb2IoKSB7XG5cdFx0bGV0IGN0ID0gdGhpcy5oZWFkZXJzICYmIHRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnO1xuXHRcdHJldHVybiBjb25zdW1lQm9keS5jYWxsKHRoaXMpLnRoZW4oZnVuY3Rpb24gKGJ1Zikge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oXG5cdFx0XHQvLyBQcmV2ZW50IGNvcHlpbmdcblx0XHRcdG5ldyBCbG9iKFtdLCB7XG5cdFx0XHRcdHR5cGU6IGN0LnRvTG93ZXJDYXNlKClcblx0XHRcdH0pLCB7XG5cdFx0XHRcdFtCVUZGRVJdOiBidWZcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuICAqIERlY29kZSByZXNwb25zZSBhcyBqc29uXG4gICpcbiAgKiBAcmV0dXJuICBQcm9taXNlXG4gICovXG5cdGpzb24oKSB7XG5cdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gY29uc3VtZUJvZHkuY2FsbCh0aGlzKS50aGVuKGZ1bmN0aW9uIChidWZmZXIpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJldHVybiBKU09OLnBhcnNlKGJ1ZmZlci50b1N0cmluZygpKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRyZXR1cm4gQm9keS5Qcm9taXNlLnJlamVjdChuZXcgRmV0Y2hFcnJvcihgaW52YWxpZCBqc29uIHJlc3BvbnNlIGJvZHkgYXQgJHtfdGhpczIudXJsfSByZWFzb246ICR7ZXJyLm1lc3NhZ2V9YCwgJ2ludmFsaWQtanNvbicpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHQvKipcbiAgKiBEZWNvZGUgcmVzcG9uc2UgYXMgdGV4dFxuICAqXG4gICogQHJldHVybiAgUHJvbWlzZVxuICAqL1xuXHR0ZXh0KCkge1xuXHRcdHJldHVybiBjb25zdW1lQm9keS5jYWxsKHRoaXMpLnRoZW4oZnVuY3Rpb24gKGJ1ZmZlcikge1xuXHRcdFx0cmV0dXJuIGJ1ZmZlci50b1N0cmluZygpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuICAqIERlY29kZSByZXNwb25zZSBhcyBidWZmZXIgKG5vbi1zcGVjIGFwaSlcbiAgKlxuICAqIEByZXR1cm4gIFByb21pc2VcbiAgKi9cblx0YnVmZmVyKCkge1xuXHRcdHJldHVybiBjb25zdW1lQm9keS5jYWxsKHRoaXMpO1xuXHR9LFxuXG5cdC8qKlxuICAqIERlY29kZSByZXNwb25zZSBhcyB0ZXh0LCB3aGlsZSBhdXRvbWF0aWNhbGx5IGRldGVjdGluZyB0aGUgZW5jb2RpbmcgYW5kXG4gICogdHJ5aW5nIHRvIGRlY29kZSB0byBVVEYtOCAobm9uLXNwZWMgYXBpKVxuICAqXG4gICogQHJldHVybiAgUHJvbWlzZVxuICAqL1xuXHR0ZXh0Q29udmVydGVkKCkge1xuXHRcdHZhciBfdGhpczMgPSB0aGlzO1xuXG5cdFx0cmV0dXJuIGNvbnN1bWVCb2R5LmNhbGwodGhpcykudGhlbihmdW5jdGlvbiAoYnVmZmVyKSB7XG5cdFx0XHRyZXR1cm4gY29udmVydEJvZHkoYnVmZmVyLCBfdGhpczMuaGVhZGVycyk7XG5cdFx0fSk7XG5cdH1cbn07XG5cbi8vIEluIGJyb3dzZXJzLCBhbGwgcHJvcGVydGllcyBhcmUgZW51bWVyYWJsZS5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEJvZHkucHJvdG90eXBlLCB7XG5cdGJvZHk6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRib2R5VXNlZDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG5cdGFycmF5QnVmZmVyOiB7IGVudW1lcmFibGU6IHRydWUgfSxcblx0YmxvYjogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG5cdGpzb246IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHR0ZXh0OiB7IGVudW1lcmFibGU6IHRydWUgfVxufSk7XG5cbkJvZHkubWl4SW4gPSBmdW5jdGlvbiAocHJvdG8pIHtcblx0Zm9yIChjb25zdCBuYW1lIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKEJvZHkucHJvdG90eXBlKSkge1xuXHRcdC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlOiBmdXR1cmUgcHJvb2Zcblx0XHRpZiAoIShuYW1lIGluIHByb3RvKSkge1xuXHRcdFx0Y29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoQm9keS5wcm90b3R5cGUsIG5hbWUpO1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBuYW1lLCBkZXNjKTtcblx0XHR9XG5cdH1cbn07XG5cbi8qKlxuICogQ29uc3VtZSBhbmQgY29udmVydCBhbiBlbnRpcmUgQm9keSB0byBhIEJ1ZmZlci5cbiAqXG4gKiBSZWY6IGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNjb25jZXB0LWJvZHktY29uc3VtZS1ib2R5XG4gKlxuICogQHJldHVybiAgUHJvbWlzZVxuICovXG5mdW5jdGlvbiBjb25zdW1lQm9keSgpIHtcblx0dmFyIF90aGlzNCA9IHRoaXM7XG5cblx0aWYgKHRoaXNbSU5URVJOQUxTXS5kaXN0dXJiZWQpIHtcblx0XHRyZXR1cm4gQm9keS5Qcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKGBib2R5IHVzZWQgYWxyZWFkeSBmb3I6ICR7dGhpcy51cmx9YCkpO1xuXHR9XG5cblx0dGhpc1tJTlRFUk5BTFNdLmRpc3R1cmJlZCA9IHRydWU7XG5cblx0aWYgKHRoaXNbSU5URVJOQUxTXS5lcnJvcikge1xuXHRcdHJldHVybiBCb2R5LlByb21pc2UucmVqZWN0KHRoaXNbSU5URVJOQUxTXS5lcnJvcik7XG5cdH1cblxuXHRsZXQgYm9keSA9IHRoaXMuYm9keTtcblxuXHQvLyBib2R5IGlzIG51bGxcblx0aWYgKGJvZHkgPT09IG51bGwpIHtcblx0XHRyZXR1cm4gQm9keS5Qcm9taXNlLnJlc29sdmUoQnVmZmVyLmFsbG9jKDApKTtcblx0fVxuXG5cdC8vIGJvZHkgaXMgYmxvYlxuXHRpZiAoaXNCbG9iKGJvZHkpKSB7XG5cdFx0Ym9keSA9IGJvZHkuc3RyZWFtKCk7XG5cdH1cblxuXHQvLyBib2R5IGlzIGJ1ZmZlclxuXHRpZiAoQnVmZmVyLmlzQnVmZmVyKGJvZHkpKSB7XG5cdFx0cmV0dXJuIEJvZHkuUHJvbWlzZS5yZXNvbHZlKGJvZHkpO1xuXHR9XG5cblx0Ly8gaXN0YW5idWwgaWdub3JlIGlmOiBzaG91bGQgbmV2ZXIgaGFwcGVuXG5cdGlmICghKGJvZHkgaW5zdGFuY2VvZiBTdHJlYW0pKSB7XG5cdFx0cmV0dXJuIEJvZHkuUHJvbWlzZS5yZXNvbHZlKEJ1ZmZlci5hbGxvYygwKSk7XG5cdH1cblxuXHQvLyBib2R5IGlzIHN0cmVhbVxuXHQvLyBnZXQgcmVhZHkgdG8gYWN0dWFsbHkgY29uc3VtZSB0aGUgYm9keVxuXHRsZXQgYWNjdW0gPSBbXTtcblx0bGV0IGFjY3VtQnl0ZXMgPSAwO1xuXHRsZXQgYWJvcnQgPSBmYWxzZTtcblxuXHRyZXR1cm4gbmV3IEJvZHkuUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0bGV0IHJlc1RpbWVvdXQ7XG5cblx0XHQvLyBhbGxvdyB0aW1lb3V0IG9uIHNsb3cgcmVzcG9uc2UgYm9keVxuXHRcdGlmIChfdGhpczQudGltZW91dCkge1xuXHRcdFx0cmVzVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRhYm9ydCA9IHRydWU7XG5cdFx0XHRcdHJlamVjdChuZXcgRmV0Y2hFcnJvcihgUmVzcG9uc2UgdGltZW91dCB3aGlsZSB0cnlpbmcgdG8gZmV0Y2ggJHtfdGhpczQudXJsfSAob3ZlciAke190aGlzNC50aW1lb3V0fW1zKWAsICdib2R5LXRpbWVvdXQnKSk7XG5cdFx0XHR9LCBfdGhpczQudGltZW91dCk7XG5cdFx0fVxuXG5cdFx0Ly8gaGFuZGxlIHN0cmVhbSBlcnJvcnNcblx0XHRib2R5Lm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdGlmIChlcnIubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG5cdFx0XHRcdC8vIGlmIHRoZSByZXF1ZXN0IHdhcyBhYm9ydGVkLCByZWplY3Qgd2l0aCB0aGlzIEVycm9yXG5cdFx0XHRcdGFib3J0ID0gdHJ1ZTtcblx0XHRcdFx0cmVqZWN0KGVycik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBvdGhlciBlcnJvcnMsIHN1Y2ggYXMgaW5jb3JyZWN0IGNvbnRlbnQtZW5jb2Rpbmdcblx0XHRcdFx0cmVqZWN0KG5ldyBGZXRjaEVycm9yKGBJbnZhbGlkIHJlc3BvbnNlIGJvZHkgd2hpbGUgdHJ5aW5nIHRvIGZldGNoICR7X3RoaXM0LnVybH06ICR7ZXJyLm1lc3NhZ2V9YCwgJ3N5c3RlbScsIGVycikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ym9keS5vbignZGF0YScsIGZ1bmN0aW9uIChjaHVuaykge1xuXHRcdFx0aWYgKGFib3J0IHx8IGNodW5rID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKF90aGlzNC5zaXplICYmIGFjY3VtQnl0ZXMgKyBjaHVuay5sZW5ndGggPiBfdGhpczQuc2l6ZSkge1xuXHRcdFx0XHRhYm9ydCA9IHRydWU7XG5cdFx0XHRcdHJlamVjdChuZXcgRmV0Y2hFcnJvcihgY29udGVudCBzaXplIGF0ICR7X3RoaXM0LnVybH0gb3ZlciBsaW1pdDogJHtfdGhpczQuc2l6ZX1gLCAnbWF4LXNpemUnKSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0YWNjdW1CeXRlcyArPSBjaHVuay5sZW5ndGg7XG5cdFx0XHRhY2N1bS5wdXNoKGNodW5rKTtcblx0XHR9KTtcblxuXHRcdGJvZHkub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChhYm9ydCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGNsZWFyVGltZW91dChyZXNUaW1lb3V0KTtcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmVzb2x2ZShCdWZmZXIuY29uY2F0KGFjY3VtLCBhY2N1bUJ5dGVzKSk7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0Ly8gaGFuZGxlIHN0cmVhbXMgdGhhdCBoYXZlIGFjY3VtdWxhdGVkIHRvbyBtdWNoIGRhdGEgKGlzc3VlICM0MTQpXG5cdFx0XHRcdHJlamVjdChuZXcgRmV0Y2hFcnJvcihgQ291bGQgbm90IGNyZWF0ZSBCdWZmZXIgZnJvbSByZXNwb25zZSBib2R5IGZvciAke190aGlzNC51cmx9OiAke2Vyci5tZXNzYWdlfWAsICdzeXN0ZW0nLCBlcnIpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59XG5cbi8qKlxuICogRGV0ZWN0IGJ1ZmZlciBlbmNvZGluZyBhbmQgY29udmVydCB0byB0YXJnZXQgZW5jb2RpbmdcbiAqIHJlZjogaHR0cDovL3d3dy53My5vcmcvVFIvMjAxMS9XRC1odG1sNS0yMDExMDExMy9wYXJzaW5nLmh0bWwjZGV0ZXJtaW5pbmctdGhlLWNoYXJhY3Rlci1lbmNvZGluZ1xuICpcbiAqIEBwYXJhbSAgIEJ1ZmZlciAgYnVmZmVyICAgIEluY29taW5nIGJ1ZmZlclxuICogQHBhcmFtICAgU3RyaW5nICBlbmNvZGluZyAgVGFyZ2V0IGVuY29kaW5nXG4gKiBAcmV0dXJuICBTdHJpbmdcbiAqL1xuZnVuY3Rpb24gY29udmVydEJvZHkoYnVmZmVyLCBoZWFkZXJzKSB7XG5cdGlmICh0eXBlb2YgY29udmVydCAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBFcnJvcignVGhlIHBhY2thZ2UgYGVuY29kaW5nYCBtdXN0IGJlIGluc3RhbGxlZCB0byB1c2UgdGhlIHRleHRDb252ZXJ0ZWQoKSBmdW5jdGlvbicpO1xuXHR9XG5cblx0Y29uc3QgY3QgPSBoZWFkZXJzLmdldCgnY29udGVudC10eXBlJyk7XG5cdGxldCBjaGFyc2V0ID0gJ3V0Zi04Jztcblx0bGV0IHJlcywgc3RyO1xuXG5cdC8vIGhlYWRlclxuXHRpZiAoY3QpIHtcblx0XHRyZXMgPSAvY2hhcnNldD0oW147XSopL2kuZXhlYyhjdCk7XG5cdH1cblxuXHQvLyBubyBjaGFyc2V0IGluIGNvbnRlbnQgdHlwZSwgcGVlayBhdCByZXNwb25zZSBib2R5IGZvciBhdCBtb3N0IDEwMjQgYnl0ZXNcblx0c3RyID0gYnVmZmVyLnNsaWNlKDAsIDEwMjQpLnRvU3RyaW5nKCk7XG5cblx0Ly8gaHRtbDVcblx0aWYgKCFyZXMgJiYgc3RyKSB7XG5cdFx0cmVzID0gLzxtZXRhLis/Y2hhcnNldD0oWydcIl0pKC4rPylcXDEvaS5leGVjKHN0cik7XG5cdH1cblxuXHQvLyBodG1sNFxuXHRpZiAoIXJlcyAmJiBzdHIpIHtcblx0XHRyZXMgPSAvPG1ldGFbXFxzXSs/aHR0cC1lcXVpdj0oWydcIl0pY29udGVudC10eXBlXFwxW1xcc10rP2NvbnRlbnQ9KFsnXCJdKSguKz8pXFwyL2kuZXhlYyhzdHIpO1xuXG5cdFx0aWYgKHJlcykge1xuXHRcdFx0cmVzID0gL2NoYXJzZXQ9KC4qKS9pLmV4ZWMocmVzLnBvcCgpKTtcblx0XHR9XG5cdH1cblxuXHQvLyB4bWxcblx0aWYgKCFyZXMgJiYgc3RyKSB7XG5cdFx0cmVzID0gLzxcXD94bWwuKz9lbmNvZGluZz0oWydcIl0pKC4rPylcXDEvaS5leGVjKHN0cik7XG5cdH1cblxuXHQvLyBmb3VuZCBjaGFyc2V0XG5cdGlmIChyZXMpIHtcblx0XHRjaGFyc2V0ID0gcmVzLnBvcCgpO1xuXG5cdFx0Ly8gcHJldmVudCBkZWNvZGUgaXNzdWVzIHdoZW4gc2l0ZXMgdXNlIGluY29ycmVjdCBlbmNvZGluZ1xuXHRcdC8vIHJlZjogaHR0cHM6Ly9oc2l2b25lbi5maS9lbmNvZGluZy1tZW51L1xuXHRcdGlmIChjaGFyc2V0ID09PSAnZ2IyMzEyJyB8fCBjaGFyc2V0ID09PSAnZ2JrJykge1xuXHRcdFx0Y2hhcnNldCA9ICdnYjE4MDMwJztcblx0XHR9XG5cdH1cblxuXHQvLyB0dXJuIHJhdyBidWZmZXJzIGludG8gYSBzaW5nbGUgdXRmLTggYnVmZmVyXG5cdHJldHVybiBjb252ZXJ0KGJ1ZmZlciwgJ1VURi04JywgY2hhcnNldCkudG9TdHJpbmcoKTtcbn1cblxuLyoqXG4gKiBEZXRlY3QgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKiByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRpbm4vbm9kZS1mZXRjaC9pc3N1ZXMvMjk2I2lzc3VlY29tbWVudC0zMDc1OTgxNDNcbiAqXG4gKiBAcGFyYW0gICBPYmplY3QgIG9iaiAgICAgT2JqZWN0IHRvIGRldGVjdCBieSB0eXBlIG9yIGJyYW5kXG4gKiBAcmV0dXJuICBTdHJpbmdcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXMob2JqKSB7XG5cdC8vIER1Y2stdHlwaW5nIGFzIGEgbmVjZXNzYXJ5IGNvbmRpdGlvbi5cblx0aWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnIHx8IHR5cGVvZiBvYmouYXBwZW5kICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBvYmouZGVsZXRlICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBvYmouZ2V0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBvYmouZ2V0QWxsICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBvYmouaGFzICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBvYmouc2V0ICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gQnJhbmQtY2hlY2tpbmcgYW5kIG1vcmUgZHVjay10eXBpbmcgYXMgb3B0aW9uYWwgY29uZGl0aW9uLlxuXHRyZXR1cm4gb2JqLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdVUkxTZWFyY2hQYXJhbXMnIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBVUkxTZWFyY2hQYXJhbXNdJyB8fCB0eXBlb2Ygb2JqLnNvcnQgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBXM0MgYEJsb2JgIG9iamVjdCAod2hpY2ggYEZpbGVgIGluaGVyaXRzIGZyb20pXG4gKiBAcGFyYW0gIHsqfSBvYmpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQmxvYihvYmopIHtcblx0cmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmouYXJyYXlCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai50eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlb2Ygb2JqLnN0cmVhbSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IubmFtZSA9PT0gJ3N0cmluZycgJiYgL14oQmxvYnxGaWxlKSQvLnRlc3Qob2JqLmNvbnN0cnVjdG9yLm5hbWUpICYmIC9eKEJsb2J8RmlsZSkkLy50ZXN0KG9ialtTeW1ib2wudG9TdHJpbmdUYWddKTtcbn1cblxuLyoqXG4gKiBDbG9uZSBib2R5IGdpdmVuIFJlcy9SZXEgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0gICBNaXhlZCAgaW5zdGFuY2UgIFJlc3BvbnNlIG9yIFJlcXVlc3QgaW5zdGFuY2VcbiAqIEByZXR1cm4gIE1peGVkXG4gKi9cbmZ1bmN0aW9uIGNsb25lKGluc3RhbmNlKSB7XG5cdGxldCBwMSwgcDI7XG5cdGxldCBib2R5ID0gaW5zdGFuY2UuYm9keTtcblxuXHQvLyBkb24ndCBhbGxvdyBjbG9uaW5nIGEgdXNlZCBib2R5XG5cdGlmIChpbnN0YW5jZS5ib2R5VXNlZCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignY2Fubm90IGNsb25lIGJvZHkgYWZ0ZXIgaXQgaXMgdXNlZCcpO1xuXHR9XG5cblx0Ly8gY2hlY2sgdGhhdCBib2R5IGlzIGEgc3RyZWFtIGFuZCBub3QgZm9ybS1kYXRhIG9iamVjdFxuXHQvLyBub3RlOiB3ZSBjYW4ndCBjbG9uZSB0aGUgZm9ybS1kYXRhIG9iamVjdCB3aXRob3V0IGhhdmluZyBpdCBhcyBhIGRlcGVuZGVuY3lcblx0aWYgKGJvZHkgaW5zdGFuY2VvZiBTdHJlYW0gJiYgdHlwZW9mIGJvZHkuZ2V0Qm91bmRhcnkgIT09ICdmdW5jdGlvbicpIHtcblx0XHQvLyB0ZWUgaW5zdGFuY2UgYm9keVxuXHRcdHAxID0gbmV3IFBhc3NUaHJvdWdoKCk7XG5cdFx0cDIgPSBuZXcgUGFzc1Rocm91Z2goKTtcblx0XHRib2R5LnBpcGUocDEpO1xuXHRcdGJvZHkucGlwZShwMik7XG5cdFx0Ly8gc2V0IGluc3RhbmNlIGJvZHkgdG8gdGVlZCBib2R5IGFuZCByZXR1cm4gdGhlIG90aGVyIHRlZWQgYm9keVxuXHRcdGluc3RhbmNlW0lOVEVSTkFMU10uYm9keSA9IHAxO1xuXHRcdGJvZHkgPSBwMjtcblx0fVxuXG5cdHJldHVybiBib2R5O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIHRoZSBvcGVyYXRpb24gXCJleHRyYWN0IGEgYENvbnRlbnQtVHlwZWAgdmFsdWUgZnJvbSB8b2JqZWN0fFwiIGFzXG4gKiBzcGVjaWZpZWQgaW4gdGhlIHNwZWNpZmljYXRpb246XG4gKiBodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jY29uY2VwdC1ib2R5aW5pdC1leHRyYWN0XG4gKlxuICogVGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgaW5zdGFuY2UuYm9keSBpcyBwcmVzZW50LlxuICpcbiAqIEBwYXJhbSAgIE1peGVkICBpbnN0YW5jZSAgQW55IG9wdGlvbnMuYm9keSBpbnB1dFxuICovXG5mdW5jdGlvbiBleHRyYWN0Q29udGVudFR5cGUoYm9keSkge1xuXHRpZiAoYm9keSA9PT0gbnVsbCkge1xuXHRcdC8vIGJvZHkgaXMgbnVsbFxuXHRcdHJldHVybiBudWxsO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuXHRcdC8vIGJvZHkgaXMgc3RyaW5nXG5cdFx0cmV0dXJuICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnO1xuXHR9IGVsc2UgaWYgKGlzVVJMU2VhcmNoUGFyYW1zKGJvZHkpKSB7XG5cdFx0Ly8gYm9keSBpcyBhIFVSTFNlYXJjaFBhcmFtc1xuXHRcdHJldHVybiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnO1xuXHR9IGVsc2UgaWYgKGlzQmxvYihib2R5KSkge1xuXHRcdC8vIGJvZHkgaXMgYmxvYlxuXHRcdHJldHVybiBib2R5LnR5cGUgfHwgbnVsbDtcblx0fSBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIoYm9keSkpIHtcblx0XHQvLyBib2R5IGlzIGJ1ZmZlclxuXHRcdHJldHVybiBudWxsO1xuXHR9IGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChib2R5KSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJykge1xuXHRcdC8vIGJvZHkgaXMgQXJyYXlCdWZmZXJcblx0XHRyZXR1cm4gbnVsbDtcblx0fSBlbHNlIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoYm9keSkpIHtcblx0XHQvLyBib2R5IGlzIEFycmF5QnVmZmVyVmlld1xuXHRcdHJldHVybiBudWxsO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBib2R5LmdldEJvdW5kYXJ5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0Ly8gZGV0ZWN0IGZvcm0gZGF0YSBpbnB1dCBmcm9tIGZvcm0tZGF0YSBtb2R1bGVcblx0XHRyZXR1cm4gYG11bHRpcGFydC9mb3JtLWRhdGE7Ym91bmRhcnk9JHtib2R5LmdldEJvdW5kYXJ5KCl9YDtcblx0fSBlbHNlIGlmIChib2R5IGluc3RhbmNlb2YgU3RyZWFtKSB7XG5cdFx0Ly8gYm9keSBpcyBzdHJlYW1cblx0XHQvLyBjYW4ndCByZWFsbHkgZG8gbXVjaCBhYm91dCB0aGlzXG5cdFx0cmV0dXJuIG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gQm9keSBjb25zdHJ1Y3RvciBkZWZhdWx0cyBvdGhlciB0aGluZ3MgdG8gc3RyaW5nXG5cdFx0cmV0dXJuICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnO1xuXHR9XG59XG5cbi8qKlxuICogVGhlIEZldGNoIFN0YW5kYXJkIHRyZWF0cyB0aGlzIGFzIGlmIFwidG90YWwgYnl0ZXNcIiBpcyBhIHByb3BlcnR5IG9uIHRoZSBib2R5LlxuICogRm9yIHVzLCB3ZSBoYXZlIHRvIGV4cGxpY2l0bHkgZ2V0IGl0IHdpdGggYSBmdW5jdGlvbi5cbiAqXG4gKiByZWY6IGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNjb25jZXB0LWJvZHktdG90YWwtYnl0ZXNcbiAqXG4gKiBAcGFyYW0gICBCb2R5ICAgIGluc3RhbmNlICAgSW5zdGFuY2Ugb2YgQm9keVxuICogQHJldHVybiAgTnVtYmVyPyAgICAgICAgICAgIE51bWJlciBvZiBieXRlcywgb3IgbnVsbCBpZiBub3QgcG9zc2libGVcbiAqL1xuZnVuY3Rpb24gZ2V0VG90YWxCeXRlcyhpbnN0YW5jZSkge1xuXHRjb25zdCBib2R5ID0gaW5zdGFuY2UuYm9keTtcblxuXG5cdGlmIChib2R5ID09PSBudWxsKSB7XG5cdFx0Ly8gYm9keSBpcyBudWxsXG5cdFx0cmV0dXJuIDA7XG5cdH0gZWxzZSBpZiAoaXNCbG9iKGJvZHkpKSB7XG5cdFx0cmV0dXJuIGJvZHkuc2l6ZTtcblx0fSBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIoYm9keSkpIHtcblx0XHQvLyBib2R5IGlzIGJ1ZmZlclxuXHRcdHJldHVybiBib2R5Lmxlbmd0aDtcblx0fSBlbHNlIGlmIChib2R5ICYmIHR5cGVvZiBib2R5LmdldExlbmd0aFN5bmMgPT09ICdmdW5jdGlvbicpIHtcblx0XHQvLyBkZXRlY3QgZm9ybSBkYXRhIGlucHV0IGZyb20gZm9ybS1kYXRhIG1vZHVsZVxuXHRcdGlmIChib2R5Ll9sZW5ndGhSZXRyaWV2ZXJzICYmIGJvZHkuX2xlbmd0aFJldHJpZXZlcnMubGVuZ3RoID09IDAgfHwgLy8gMS54XG5cdFx0Ym9keS5oYXNLbm93bkxlbmd0aCAmJiBib2R5Lmhhc0tub3duTGVuZ3RoKCkpIHtcblx0XHRcdC8vIDIueFxuXHRcdFx0cmV0dXJuIGJvZHkuZ2V0TGVuZ3RoU3luYygpO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fSBlbHNlIHtcblx0XHQvLyBib2R5IGlzIHN0cmVhbVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbi8qKlxuICogV3JpdGUgYSBCb2R5IHRvIGEgTm9kZS5qcyBXcml0YWJsZVN0cmVhbSAoZS5nLiBodHRwLlJlcXVlc3QpIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gICBCb2R5ICAgIGluc3RhbmNlICAgSW5zdGFuY2Ugb2YgQm9keVxuICogQHJldHVybiAgVm9pZFxuICovXG5mdW5jdGlvbiB3cml0ZVRvU3RyZWFtKGRlc3QsIGluc3RhbmNlKSB7XG5cdGNvbnN0IGJvZHkgPSBpbnN0YW5jZS5ib2R5O1xuXG5cblx0aWYgKGJvZHkgPT09IG51bGwpIHtcblx0XHQvLyBib2R5IGlzIG51bGxcblx0XHRkZXN0LmVuZCgpO1xuXHR9IGVsc2UgaWYgKGlzQmxvYihib2R5KSkge1xuXHRcdGJvZHkuc3RyZWFtKCkucGlwZShkZXN0KTtcblx0fSBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIoYm9keSkpIHtcblx0XHQvLyBib2R5IGlzIGJ1ZmZlclxuXHRcdGRlc3Qud3JpdGUoYm9keSk7XG5cdFx0ZGVzdC5lbmQoKTtcblx0fSBlbHNlIHtcblx0XHQvLyBib2R5IGlzIHN0cmVhbVxuXHRcdGJvZHkucGlwZShkZXN0KTtcblx0fVxufVxuXG4vLyBleHBvc2UgUHJvbWlzZVxuQm9keS5Qcm9taXNlID0gZ2xvYmFsLlByb21pc2U7XG5cbi8qKlxuICogaGVhZGVycy5qc1xuICpcbiAqIEhlYWRlcnMgY2xhc3Mgb2ZmZXJzIGNvbnZlbmllbnQgaGVscGVyc1xuICovXG5cbmNvbnN0IGludmFsaWRUb2tlblJlZ2V4ID0gL1teXFxeX2BhLXpBLVpcXC0wLTkhIyQlJicqKy58fl0vO1xuY29uc3QgaW52YWxpZEhlYWRlckNoYXJSZWdleCA9IC9bXlxcdFxceDIwLVxceDdlXFx4ODAtXFx4ZmZdLztcblxuZnVuY3Rpb24gdmFsaWRhdGVOYW1lKG5hbWUpIHtcblx0bmFtZSA9IGAke25hbWV9YDtcblx0aWYgKGludmFsaWRUb2tlblJlZ2V4LnRlc3QobmFtZSkgfHwgbmFtZSA9PT0gJycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGAke25hbWV9IGlzIG5vdCBhIGxlZ2FsIEhUVFAgaGVhZGVyIG5hbWVgKTtcblx0fVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVZhbHVlKHZhbHVlKSB7XG5cdHZhbHVlID0gYCR7dmFsdWV9YDtcblx0aWYgKGludmFsaWRIZWFkZXJDaGFyUmVnZXgudGVzdCh2YWx1ZSkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGAke3ZhbHVlfSBpcyBub3QgYSBsZWdhbCBIVFRQIGhlYWRlciB2YWx1ZWApO1xuXHR9XG59XG5cbi8qKlxuICogRmluZCB0aGUga2V5IGluIHRoZSBtYXAgb2JqZWN0IGdpdmVuIGEgaGVhZGVyIG5hbWUuXG4gKlxuICogUmV0dXJucyB1bmRlZmluZWQgaWYgbm90IGZvdW5kLlxuICpcbiAqIEBwYXJhbSAgIFN0cmluZyAgbmFtZSAgSGVhZGVyIG5hbWVcbiAqIEByZXR1cm4gIFN0cmluZ3xVbmRlZmluZWRcbiAqL1xuZnVuY3Rpb24gZmluZChtYXAsIG5hbWUpIHtcblx0bmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKTtcblx0Zm9yIChjb25zdCBrZXkgaW4gbWFwKSB7XG5cdFx0aWYgKGtleS50b0xvd2VyQ2FzZSgpID09PSBuYW1lKSB7XG5cdFx0XHRyZXR1cm4ga2V5O1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5jb25zdCBNQVAgPSBTeW1ib2woJ21hcCcpO1xuY2xhc3MgSGVhZGVycyB7XG5cdC8qKlxuICAqIEhlYWRlcnMgY2xhc3NcbiAgKlxuICAqIEBwYXJhbSAgIE9iamVjdCAgaGVhZGVycyAgUmVzcG9uc2UgaGVhZGVyc1xuICAqIEByZXR1cm4gIFZvaWRcbiAgKi9cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0bGV0IGluaXQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZDtcblxuXHRcdHRoaXNbTUFQXSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cblx0XHRpZiAoaW5pdCBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcblx0XHRcdGNvbnN0IHJhd0hlYWRlcnMgPSBpbml0LnJhdygpO1xuXHRcdFx0Y29uc3QgaGVhZGVyTmFtZXMgPSBPYmplY3Qua2V5cyhyYXdIZWFkZXJzKTtcblxuXHRcdFx0Zm9yIChjb25zdCBoZWFkZXJOYW1lIG9mIGhlYWRlck5hbWVzKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgdmFsdWUgb2YgcmF3SGVhZGVyc1toZWFkZXJOYW1lXSkge1xuXHRcdFx0XHRcdHRoaXMuYXBwZW5kKGhlYWRlck5hbWUsIHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV2UgZG9uJ3Qgd29ycnkgYWJvdXQgY29udmVydGluZyBwcm9wIHRvIEJ5dGVTdHJpbmcgaGVyZSBhcyBhcHBlbmQoKVxuXHRcdC8vIHdpbGwgaGFuZGxlIGl0LlxuXHRcdGlmIChpbml0ID09IG51bGwpIDsgZWxzZSBpZiAodHlwZW9mIGluaXQgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRjb25zdCBtZXRob2QgPSBpbml0W1N5bWJvbC5pdGVyYXRvcl07XG5cdFx0XHRpZiAobWV0aG9kICE9IG51bGwpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBtZXRob2QgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdIZWFkZXIgcGFpcnMgbXVzdCBiZSBpdGVyYWJsZScpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gc2VxdWVuY2U8c2VxdWVuY2U8Qnl0ZVN0cmluZz4+XG5cdFx0XHRcdC8vIE5vdGU6IHBlciBzcGVjIHdlIGhhdmUgdG8gZmlyc3QgZXhoYXVzdCB0aGUgbGlzdHMgdGhlbiBwcm9jZXNzIHRoZW1cblx0XHRcdFx0Y29uc3QgcGFpcnMgPSBbXTtcblx0XHRcdFx0Zm9yIChjb25zdCBwYWlyIG9mIGluaXQpIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIHBhaXIgIT09ICdvYmplY3QnIHx8IHR5cGVvZiBwYWlyW1N5bWJvbC5pdGVyYXRvcl0gIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0VhY2ggaGVhZGVyIHBhaXIgbXVzdCBiZSBpdGVyYWJsZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRwYWlycy5wdXNoKEFycmF5LmZyb20ocGFpcikpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG5cdFx0XHRcdFx0aWYgKHBhaXIubGVuZ3RoICE9PSAyKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFYWNoIGhlYWRlciBwYWlyIG11c3QgYmUgYSBuYW1lL3ZhbHVlIHR1cGxlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuYXBwZW5kKHBhaXJbMF0sIHBhaXJbMV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyByZWNvcmQ8Qnl0ZVN0cmluZywgQnl0ZVN0cmluZz5cblx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoaW5pdCkpIHtcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IGluaXRba2V5XTtcblx0XHRcdFx0XHR0aGlzLmFwcGVuZChrZXksIHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm92aWRlZCBpbml0aWFsaXplciBtdXN0IGJlIGFuIG9iamVjdCcpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuICAqIFJldHVybiBjb21iaW5lZCBoZWFkZXIgdmFsdWUgZ2l2ZW4gbmFtZVxuICAqXG4gICogQHBhcmFtICAgU3RyaW5nICBuYW1lICBIZWFkZXIgbmFtZVxuICAqIEByZXR1cm4gIE1peGVkXG4gICovXG5cdGdldChuYW1lKSB7XG5cdFx0bmFtZSA9IGAke25hbWV9YDtcblx0XHR2YWxpZGF0ZU5hbWUobmFtZSk7XG5cdFx0Y29uc3Qga2V5ID0gZmluZCh0aGlzW01BUF0sIG5hbWUpO1xuXHRcdGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXNbTUFQXVtrZXldLmpvaW4oJywgJyk7XG5cdH1cblxuXHQvKipcbiAgKiBJdGVyYXRlIG92ZXIgYWxsIGhlYWRlcnNcbiAgKlxuICAqIEBwYXJhbSAgIEZ1bmN0aW9uICBjYWxsYmFjayAgRXhlY3V0ZWQgZm9yIGVhY2ggaXRlbSB3aXRoIHBhcmFtZXRlcnMgKHZhbHVlLCBuYW1lLCB0aGlzQXJnKVxuICAqIEBwYXJhbSAgIEJvb2xlYW4gICB0aGlzQXJnICAgYHRoaXNgIGNvbnRleHQgZm9yIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICogQHJldHVybiAgVm9pZFxuICAqL1xuXHRmb3JFYWNoKGNhbGxiYWNrKSB7XG5cdFx0bGV0IHRoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcblxuXHRcdGxldCBwYWlycyA9IGdldEhlYWRlcnModGhpcyk7XG5cdFx0bGV0IGkgPSAwO1xuXHRcdHdoaWxlIChpIDwgcGFpcnMubGVuZ3RoKSB7XG5cdFx0XHR2YXIgX3BhaXJzJGkgPSBwYWlyc1tpXTtcblx0XHRcdGNvbnN0IG5hbWUgPSBfcGFpcnMkaVswXSxcblx0XHRcdCAgICAgIHZhbHVlID0gX3BhaXJzJGlbMV07XG5cblx0XHRcdGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIG5hbWUsIHRoaXMpO1xuXHRcdFx0cGFpcnMgPSBnZXRIZWFkZXJzKHRoaXMpO1xuXHRcdFx0aSsrO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuICAqIE92ZXJ3cml0ZSBoZWFkZXIgdmFsdWVzIGdpdmVuIG5hbWVcbiAgKlxuICAqIEBwYXJhbSAgIFN0cmluZyAgbmFtZSAgIEhlYWRlciBuYW1lXG4gICogQHBhcmFtICAgU3RyaW5nICB2YWx1ZSAgSGVhZGVyIHZhbHVlXG4gICogQHJldHVybiAgVm9pZFxuICAqL1xuXHRzZXQobmFtZSwgdmFsdWUpIHtcblx0XHRuYW1lID0gYCR7bmFtZX1gO1xuXHRcdHZhbHVlID0gYCR7dmFsdWV9YDtcblx0XHR2YWxpZGF0ZU5hbWUobmFtZSk7XG5cdFx0dmFsaWRhdGVWYWx1ZSh2YWx1ZSk7XG5cdFx0Y29uc3Qga2V5ID0gZmluZCh0aGlzW01BUF0sIG5hbWUpO1xuXHRcdHRoaXNbTUFQXVtrZXkgIT09IHVuZGVmaW5lZCA/IGtleSA6IG5hbWVdID0gW3ZhbHVlXTtcblx0fVxuXG5cdC8qKlxuICAqIEFwcGVuZCBhIHZhbHVlIG9udG8gZXhpc3RpbmcgaGVhZGVyXG4gICpcbiAgKiBAcGFyYW0gICBTdHJpbmcgIG5hbWUgICBIZWFkZXIgbmFtZVxuICAqIEBwYXJhbSAgIFN0cmluZyAgdmFsdWUgIEhlYWRlciB2YWx1ZVxuICAqIEByZXR1cm4gIFZvaWRcbiAgKi9cblx0YXBwZW5kKG5hbWUsIHZhbHVlKSB7XG5cdFx0bmFtZSA9IGAke25hbWV9YDtcblx0XHR2YWx1ZSA9IGAke3ZhbHVlfWA7XG5cdFx0dmFsaWRhdGVOYW1lKG5hbWUpO1xuXHRcdHZhbGlkYXRlVmFsdWUodmFsdWUpO1xuXHRcdGNvbnN0IGtleSA9IGZpbmQodGhpc1tNQVBdLCBuYW1lKTtcblx0XHRpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXNbTUFQXVtrZXldLnB1c2godmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzW01BUF1bbmFtZV0gPSBbdmFsdWVdO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuICAqIENoZWNrIGZvciBoZWFkZXIgbmFtZSBleGlzdGVuY2VcbiAgKlxuICAqIEBwYXJhbSAgIFN0cmluZyAgIG5hbWUgIEhlYWRlciBuYW1lXG4gICogQHJldHVybiAgQm9vbGVhblxuICAqL1xuXHRoYXMobmFtZSkge1xuXHRcdG5hbWUgPSBgJHtuYW1lfWA7XG5cdFx0dmFsaWRhdGVOYW1lKG5hbWUpO1xuXHRcdHJldHVybiBmaW5kKHRoaXNbTUFQXSwgbmFtZSkgIT09IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuICAqIERlbGV0ZSBhbGwgaGVhZGVyIHZhbHVlcyBnaXZlbiBuYW1lXG4gICpcbiAgKiBAcGFyYW0gICBTdHJpbmcgIG5hbWUgIEhlYWRlciBuYW1lXG4gICogQHJldHVybiAgVm9pZFxuICAqL1xuXHRkZWxldGUobmFtZSkge1xuXHRcdG5hbWUgPSBgJHtuYW1lfWA7XG5cdFx0dmFsaWRhdGVOYW1lKG5hbWUpO1xuXHRcdGNvbnN0IGtleSA9IGZpbmQodGhpc1tNQVBdLCBuYW1lKTtcblx0XHRpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGRlbGV0ZSB0aGlzW01BUF1ba2V5XTtcblx0XHR9XG5cdH1cblxuXHQvKipcbiAgKiBSZXR1cm4gcmF3IGhlYWRlcnMgKG5vbi1zcGVjIGFwaSlcbiAgKlxuICAqIEByZXR1cm4gIE9iamVjdFxuICAqL1xuXHRyYXcoKSB7XG5cdFx0cmV0dXJuIHRoaXNbTUFQXTtcblx0fVxuXG5cdC8qKlxuICAqIEdldCBhbiBpdGVyYXRvciBvbiBrZXlzLlxuICAqXG4gICogQHJldHVybiAgSXRlcmF0b3JcbiAgKi9cblx0a2V5cygpIHtcblx0XHRyZXR1cm4gY3JlYXRlSGVhZGVyc0l0ZXJhdG9yKHRoaXMsICdrZXknKTtcblx0fVxuXG5cdC8qKlxuICAqIEdldCBhbiBpdGVyYXRvciBvbiB2YWx1ZXMuXG4gICpcbiAgKiBAcmV0dXJuICBJdGVyYXRvclxuICAqL1xuXHR2YWx1ZXMoKSB7XG5cdFx0cmV0dXJuIGNyZWF0ZUhlYWRlcnNJdGVyYXRvcih0aGlzLCAndmFsdWUnKTtcblx0fVxuXG5cdC8qKlxuICAqIEdldCBhbiBpdGVyYXRvciBvbiBlbnRyaWVzLlxuICAqXG4gICogVGhpcyBpcyB0aGUgZGVmYXVsdCBpdGVyYXRvciBvZiB0aGUgSGVhZGVycyBvYmplY3QuXG4gICpcbiAgKiBAcmV0dXJuICBJdGVyYXRvclxuICAqL1xuXHRbU3ltYm9sLml0ZXJhdG9yXSgpIHtcblx0XHRyZXR1cm4gY3JlYXRlSGVhZGVyc0l0ZXJhdG9yKHRoaXMsICdrZXkrdmFsdWUnKTtcblx0fVxufVxuSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShIZWFkZXJzLnByb3RvdHlwZSwgU3ltYm9sLnRvU3RyaW5nVGFnLCB7XG5cdHZhbHVlOiAnSGVhZGVycycsXG5cdHdyaXRhYmxlOiBmYWxzZSxcblx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEhlYWRlcnMucHJvdG90eXBlLCB7XG5cdGdldDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG5cdGZvckVhY2g6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRzZXQ6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRhcHBlbmQ6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRoYXM6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRkZWxldGU6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRrZXlzOiB7IGVudW1lcmFibGU6IHRydWUgfSxcblx0dmFsdWVzOiB7IGVudW1lcmFibGU6IHRydWUgfSxcblx0ZW50cmllczogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbn0pO1xuXG5mdW5jdGlvbiBnZXRIZWFkZXJzKGhlYWRlcnMpIHtcblx0bGV0IGtpbmQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICdrZXkrdmFsdWUnO1xuXG5cdGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhoZWFkZXJzW01BUF0pLnNvcnQoKTtcblx0cmV0dXJuIGtleXMubWFwKGtpbmQgPT09ICdrZXknID8gZnVuY3Rpb24gKGspIHtcblx0XHRyZXR1cm4gay50b0xvd2VyQ2FzZSgpO1xuXHR9IDoga2luZCA9PT0gJ3ZhbHVlJyA/IGZ1bmN0aW9uIChrKSB7XG5cdFx0cmV0dXJuIGhlYWRlcnNbTUFQXVtrXS5qb2luKCcsICcpO1xuXHR9IDogZnVuY3Rpb24gKGspIHtcblx0XHRyZXR1cm4gW2sudG9Mb3dlckNhc2UoKSwgaGVhZGVyc1tNQVBdW2tdLmpvaW4oJywgJyldO1xuXHR9KTtcbn1cblxuY29uc3QgSU5URVJOQUwgPSBTeW1ib2woJ2ludGVybmFsJyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUhlYWRlcnNJdGVyYXRvcih0YXJnZXQsIGtpbmQpIHtcblx0Y29uc3QgaXRlcmF0b3IgPSBPYmplY3QuY3JlYXRlKEhlYWRlcnNJdGVyYXRvclByb3RvdHlwZSk7XG5cdGl0ZXJhdG9yW0lOVEVSTkFMXSA9IHtcblx0XHR0YXJnZXQsXG5cdFx0a2luZCxcblx0XHRpbmRleDogMFxuXHR9O1xuXHRyZXR1cm4gaXRlcmF0b3I7XG59XG5cbmNvbnN0IEhlYWRlcnNJdGVyYXRvclByb3RvdHlwZSA9IE9iamVjdC5zZXRQcm90b3R5cGVPZih7XG5cdG5leHQoKSB7XG5cdFx0Ly8gaXN0YW5idWwgaWdub3JlIGlmXG5cdFx0aWYgKCF0aGlzIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSAhPT0gSGVhZGVyc0l0ZXJhdG9yUHJvdG90eXBlKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdWYWx1ZSBvZiBgdGhpc2AgaXMgbm90IGEgSGVhZGVyc0l0ZXJhdG9yJyk7XG5cdFx0fVxuXG5cdFx0dmFyIF9JTlRFUk5BTCA9IHRoaXNbSU5URVJOQUxdO1xuXHRcdGNvbnN0IHRhcmdldCA9IF9JTlRFUk5BTC50YXJnZXQsXG5cdFx0ICAgICAga2luZCA9IF9JTlRFUk5BTC5raW5kLFxuXHRcdCAgICAgIGluZGV4ID0gX0lOVEVSTkFMLmluZGV4O1xuXG5cdFx0Y29uc3QgdmFsdWVzID0gZ2V0SGVhZGVycyh0YXJnZXQsIGtpbmQpO1xuXHRcdGNvbnN0IGxlbiA9IHZhbHVlcy5sZW5ndGg7XG5cdFx0aWYgKGluZGV4ID49IGxlbikge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdFx0ZG9uZTogdHJ1ZVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR0aGlzW0lOVEVSTkFMXS5pbmRleCA9IGluZGV4ICsgMTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogdmFsdWVzW2luZGV4XSxcblx0XHRcdGRvbmU6IGZhbHNlXG5cdFx0fTtcblx0fVxufSwgT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdC5nZXRQcm90b3R5cGVPZihbXVtTeW1ib2wuaXRlcmF0b3JdKCkpKSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShIZWFkZXJzSXRlcmF0b3JQcm90b3R5cGUsIFN5bWJvbC50b1N0cmluZ1RhZywge1xuXHR2YWx1ZTogJ0hlYWRlcnNJdGVyYXRvcicsXG5cdHdyaXRhYmxlOiBmYWxzZSxcblx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cbi8qKlxuICogRXhwb3J0IHRoZSBIZWFkZXJzIG9iamVjdCBpbiBhIGZvcm0gdGhhdCBOb2RlLmpzIGNhbiBjb25zdW1lLlxuICpcbiAqIEBwYXJhbSAgIEhlYWRlcnMgIGhlYWRlcnNcbiAqIEByZXR1cm4gIE9iamVjdFxuICovXG5mdW5jdGlvbiBleHBvcnROb2RlQ29tcGF0aWJsZUhlYWRlcnMoaGVhZGVycykge1xuXHRjb25zdCBvYmogPSBPYmplY3QuYXNzaWduKHsgX19wcm90b19fOiBudWxsIH0sIGhlYWRlcnNbTUFQXSk7XG5cblx0Ly8gaHR0cC5yZXF1ZXN0KCkgb25seSBzdXBwb3J0cyBzdHJpbmcgYXMgSG9zdCBoZWFkZXIuIFRoaXMgaGFjayBtYWtlc1xuXHQvLyBzcGVjaWZ5aW5nIGN1c3RvbSBIb3N0IGhlYWRlciBwb3NzaWJsZS5cblx0Y29uc3QgaG9zdEhlYWRlcktleSA9IGZpbmQoaGVhZGVyc1tNQVBdLCAnSG9zdCcpO1xuXHRpZiAoaG9zdEhlYWRlcktleSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0b2JqW2hvc3RIZWFkZXJLZXldID0gb2JqW2hvc3RIZWFkZXJLZXldWzBdO1xuXHR9XG5cblx0cmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBIZWFkZXJzIG9iamVjdCBmcm9tIGFuIG9iamVjdCBvZiBoZWFkZXJzLCBpZ25vcmluZyB0aG9zZSB0aGF0IGRvXG4gKiBub3QgY29uZm9ybSB0byBIVFRQIGdyYW1tYXIgcHJvZHVjdGlvbnMuXG4gKlxuICogQHBhcmFtICAgT2JqZWN0ICBvYmogIE9iamVjdCBvZiBoZWFkZXJzXG4gKiBAcmV0dXJuICBIZWFkZXJzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUhlYWRlcnNMZW5pZW50KG9iaikge1xuXHRjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcblx0Zm9yIChjb25zdCBuYW1lIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcblx0XHRpZiAoaW52YWxpZFRva2VuUmVnZXgudGVzdChuYW1lKSkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXHRcdGlmIChBcnJheS5pc0FycmF5KG9ialtuYW1lXSkpIHtcblx0XHRcdGZvciAoY29uc3QgdmFsIG9mIG9ialtuYW1lXSkge1xuXHRcdFx0XHRpZiAoaW52YWxpZEhlYWRlckNoYXJSZWdleC50ZXN0KHZhbCkpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaGVhZGVyc1tNQVBdW25hbWVdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRoZWFkZXJzW01BUF1bbmFtZV0gPSBbdmFsXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRoZWFkZXJzW01BUF1bbmFtZV0ucHVzaCh2YWwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghaW52YWxpZEhlYWRlckNoYXJSZWdleC50ZXN0KG9ialtuYW1lXSkpIHtcblx0XHRcdGhlYWRlcnNbTUFQXVtuYW1lXSA9IFtvYmpbbmFtZV1dO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gaGVhZGVycztcbn1cblxuY29uc3QgSU5URVJOQUxTJDEgPSBTeW1ib2woJ1Jlc3BvbnNlIGludGVybmFscycpO1xuXG4vLyBmaXggYW4gaXNzdWUgd2hlcmUgXCJTVEFUVVNfQ09ERVNcIiBhcmVuJ3QgYSBuYW1lZCBleHBvcnQgZm9yIG5vZGUgPDEwXG5jb25zdCBTVEFUVVNfQ09ERVMgPSBodHRwLlNUQVRVU19DT0RFUztcblxuLyoqXG4gKiBSZXNwb25zZSBjbGFzc1xuICpcbiAqIEBwYXJhbSAgIFN0cmVhbSAgYm9keSAgUmVhZGFibGUgc3RyZWFtXG4gKiBAcGFyYW0gICBPYmplY3QgIG9wdHMgIFJlc3BvbnNlIG9wdGlvbnNcbiAqIEByZXR1cm4gIFZvaWRcbiAqL1xuY2xhc3MgUmVzcG9uc2Uge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRsZXQgYm9keSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogbnVsbDtcblx0XHRsZXQgb3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cblx0XHRCb2R5LmNhbGwodGhpcywgYm9keSwgb3B0cyk7XG5cblx0XHRjb25zdCBzdGF0dXMgPSBvcHRzLnN0YXR1cyB8fCAyMDA7XG5cdFx0Y29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdHMuaGVhZGVycyk7XG5cblx0XHRpZiAoYm9keSAhPSBudWxsICYmICFoZWFkZXJzLmhhcygnQ29udGVudC1UeXBlJykpIHtcblx0XHRcdGNvbnN0IGNvbnRlbnRUeXBlID0gZXh0cmFjdENvbnRlbnRUeXBlKGJvZHkpO1xuXHRcdFx0aWYgKGNvbnRlbnRUeXBlKSB7XG5cdFx0XHRcdGhlYWRlcnMuYXBwZW5kKCdDb250ZW50LVR5cGUnLCBjb250ZW50VHlwZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpc1tJTlRFUk5BTFMkMV0gPSB7XG5cdFx0XHR1cmw6IG9wdHMudXJsLFxuXHRcdFx0c3RhdHVzLFxuXHRcdFx0c3RhdHVzVGV4dDogb3B0cy5zdGF0dXNUZXh0IHx8IFNUQVRVU19DT0RFU1tzdGF0dXNdLFxuXHRcdFx0aGVhZGVycyxcblx0XHRcdGNvdW50ZXI6IG9wdHMuY291bnRlclxuXHRcdH07XG5cdH1cblxuXHRnZXQgdXJsKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQxXS51cmwgfHwgJyc7XG5cdH1cblxuXHRnZXQgc3RhdHVzKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQxXS5zdGF0dXM7XG5cdH1cblxuXHQvKipcbiAgKiBDb252ZW5pZW5jZSBwcm9wZXJ0eSByZXByZXNlbnRpbmcgaWYgdGhlIHJlcXVlc3QgZW5kZWQgbm9ybWFsbHlcbiAgKi9cblx0Z2V0IG9rKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQxXS5zdGF0dXMgPj0gMjAwICYmIHRoaXNbSU5URVJOQUxTJDFdLnN0YXR1cyA8IDMwMDtcblx0fVxuXG5cdGdldCByZWRpcmVjdGVkKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQxXS5jb3VudGVyID4gMDtcblx0fVxuXG5cdGdldCBzdGF0dXNUZXh0KCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQxXS5zdGF0dXNUZXh0O1xuXHR9XG5cblx0Z2V0IGhlYWRlcnMoKSB7XG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTJDFdLmhlYWRlcnM7XG5cdH1cblxuXHQvKipcbiAgKiBDbG9uZSB0aGlzIHJlc3BvbnNlXG4gICpcbiAgKiBAcmV0dXJuICBSZXNwb25zZVxuICAqL1xuXHRjbG9uZSgpIHtcblx0XHRyZXR1cm4gbmV3IFJlc3BvbnNlKGNsb25lKHRoaXMpLCB7XG5cdFx0XHR1cmw6IHRoaXMudXJsLFxuXHRcdFx0c3RhdHVzOiB0aGlzLnN0YXR1cyxcblx0XHRcdHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcblx0XHRcdGhlYWRlcnM6IHRoaXMuaGVhZGVycyxcblx0XHRcdG9rOiB0aGlzLm9rLFxuXHRcdFx0cmVkaXJlY3RlZDogdGhpcy5yZWRpcmVjdGVkXG5cdFx0fSk7XG5cdH1cbn1cblxuQm9keS5taXhJbihSZXNwb25zZS5wcm90b3R5cGUpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZXNwb25zZS5wcm90b3R5cGUsIHtcblx0dXJsOiB7IGVudW1lcmFibGU6IHRydWUgfSxcblx0c3RhdHVzOiB7IGVudW1lcmFibGU6IHRydWUgfSxcblx0b2s6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRyZWRpcmVjdGVkOiB7IGVudW1lcmFibGU6IHRydWUgfSxcblx0c3RhdHVzVGV4dDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG5cdGhlYWRlcnM6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRjbG9uZTogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmVzcG9uc2UucHJvdG90eXBlLCBTeW1ib2wudG9TdHJpbmdUYWcsIHtcblx0dmFsdWU6ICdSZXNwb25zZScsXG5cdHdyaXRhYmxlOiBmYWxzZSxcblx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cbmNvbnN0IElOVEVSTkFMUyQyID0gU3ltYm9sKCdSZXF1ZXN0IGludGVybmFscycpO1xuXG4vLyBmaXggYW4gaXNzdWUgd2hlcmUgXCJmb3JtYXRcIiwgXCJwYXJzZVwiIGFyZW4ndCBhIG5hbWVkIGV4cG9ydCBmb3Igbm9kZSA8MTBcbmNvbnN0IHBhcnNlX3VybCA9IFVybC5wYXJzZTtcbmNvbnN0IGZvcm1hdF91cmwgPSBVcmwuZm9ybWF0O1xuXG5jb25zdCBzdHJlYW1EZXN0cnVjdGlvblN1cHBvcnRlZCA9ICdkZXN0cm95JyBpbiBTdHJlYW0uUmVhZGFibGUucHJvdG90eXBlO1xuXG4vKipcbiAqIENoZWNrIGlmIGEgdmFsdWUgaXMgYW4gaW5zdGFuY2Ugb2YgUmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0gICBNaXhlZCAgIGlucHV0XG4gKiBAcmV0dXJuICBCb29sZWFuXG4gKi9cbmZ1bmN0aW9uIGlzUmVxdWVzdChpbnB1dCkge1xuXHRyZXR1cm4gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgaW5wdXRbSU5URVJOQUxTJDJdID09PSAnb2JqZWN0Jztcbn1cblxuZnVuY3Rpb24gaXNBYm9ydFNpZ25hbChzaWduYWwpIHtcblx0Y29uc3QgcHJvdG8gPSBzaWduYWwgJiYgdHlwZW9mIHNpZ25hbCA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKHNpZ25hbCk7XG5cdHJldHVybiAhIShwcm90byAmJiBwcm90by5jb25zdHJ1Y3Rvci5uYW1lID09PSAnQWJvcnRTaWduYWwnKTtcbn1cblxuLyoqXG4gKiBSZXF1ZXN0IGNsYXNzXG4gKlxuICogQHBhcmFtICAgTWl4ZWQgICBpbnB1dCAgVXJsIG9yIFJlcXVlc3QgaW5zdGFuY2VcbiAqIEBwYXJhbSAgIE9iamVjdCAgaW5pdCAgIEN1c3RvbSBvcHRpb25zXG4gKiBAcmV0dXJuICBWb2lkXG4gKi9cbmNsYXNzIFJlcXVlc3Qge1xuXHRjb25zdHJ1Y3RvcihpbnB1dCkge1xuXHRcdGxldCBpbml0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblxuXHRcdGxldCBwYXJzZWRVUkw7XG5cblx0XHQvLyBub3JtYWxpemUgaW5wdXRcblx0XHRpZiAoIWlzUmVxdWVzdChpbnB1dCkpIHtcblx0XHRcdGlmIChpbnB1dCAmJiBpbnB1dC5ocmVmKSB7XG5cdFx0XHRcdC8vIGluIG9yZGVyIHRvIHN1cHBvcnQgTm9kZS5qcycgVXJsIG9iamVjdHM7IHRob3VnaCBXSEFUV0cncyBVUkwgb2JqZWN0c1xuXHRcdFx0XHQvLyB3aWxsIGZhbGwgaW50byB0aGlzIGJyYW5jaCBhbHNvIChzaW5jZSB0aGVpciBgdG9TdHJpbmcoKWAgd2lsbCByZXR1cm5cblx0XHRcdFx0Ly8gYGhyZWZgIHByb3BlcnR5IGFueXdheSlcblx0XHRcdFx0cGFyc2VkVVJMID0gcGFyc2VfdXJsKGlucHV0LmhyZWYpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gY29lcmNlIGlucHV0IHRvIGEgc3RyaW5nIGJlZm9yZSBhdHRlbXB0aW5nIHRvIHBhcnNlXG5cdFx0XHRcdHBhcnNlZFVSTCA9IHBhcnNlX3VybChgJHtpbnB1dH1gKTtcblx0XHRcdH1cblx0XHRcdGlucHV0ID0ge307XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhcnNlZFVSTCA9IHBhcnNlX3VybChpbnB1dC51cmwpO1xuXHRcdH1cblxuXHRcdGxldCBtZXRob2QgPSBpbml0Lm1ldGhvZCB8fCBpbnB1dC5tZXRob2QgfHwgJ0dFVCc7XG5cdFx0bWV0aG9kID0gbWV0aG9kLnRvVXBwZXJDYXNlKCk7XG5cblx0XHRpZiAoKGluaXQuYm9keSAhPSBudWxsIHx8IGlzUmVxdWVzdChpbnB1dCkgJiYgaW5wdXQuYm9keSAhPT0gbnVsbCkgJiYgKG1ldGhvZCA9PT0gJ0dFVCcgfHwgbWV0aG9kID09PSAnSEVBRCcpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdSZXF1ZXN0IHdpdGggR0VUL0hFQUQgbWV0aG9kIGNhbm5vdCBoYXZlIGJvZHknKTtcblx0XHR9XG5cblx0XHRsZXQgaW5wdXRCb2R5ID0gaW5pdC5ib2R5ICE9IG51bGwgPyBpbml0LmJvZHkgOiBpc1JlcXVlc3QoaW5wdXQpICYmIGlucHV0LmJvZHkgIT09IG51bGwgPyBjbG9uZShpbnB1dCkgOiBudWxsO1xuXG5cdFx0Qm9keS5jYWxsKHRoaXMsIGlucHV0Qm9keSwge1xuXHRcdFx0dGltZW91dDogaW5pdC50aW1lb3V0IHx8IGlucHV0LnRpbWVvdXQgfHwgMCxcblx0XHRcdHNpemU6IGluaXQuc2l6ZSB8fCBpbnB1dC5zaXplIHx8IDBcblx0XHR9KTtcblxuXHRcdGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbml0LmhlYWRlcnMgfHwgaW5wdXQuaGVhZGVycyB8fCB7fSk7XG5cblx0XHRpZiAoaW5wdXRCb2R5ICE9IG51bGwgJiYgIWhlYWRlcnMuaGFzKCdDb250ZW50LVR5cGUnKSkge1xuXHRcdFx0Y29uc3QgY29udGVudFR5cGUgPSBleHRyYWN0Q29udGVudFR5cGUoaW5wdXRCb2R5KTtcblx0XHRcdGlmIChjb250ZW50VHlwZSkge1xuXHRcdFx0XHRoZWFkZXJzLmFwcGVuZCgnQ29udGVudC1UeXBlJywgY29udGVudFR5cGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBzaWduYWwgPSBpc1JlcXVlc3QoaW5wdXQpID8gaW5wdXQuc2lnbmFsIDogbnVsbDtcblx0XHRpZiAoJ3NpZ25hbCcgaW4gaW5pdCkgc2lnbmFsID0gaW5pdC5zaWduYWw7XG5cblx0XHRpZiAoc2lnbmFsICE9IG51bGwgJiYgIWlzQWJvcnRTaWduYWwoc2lnbmFsKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgc2lnbmFsIHRvIGJlIGFuIGluc3RhbmNlb2YgQWJvcnRTaWduYWwnKTtcblx0XHR9XG5cblx0XHR0aGlzW0lOVEVSTkFMUyQyXSA9IHtcblx0XHRcdG1ldGhvZCxcblx0XHRcdHJlZGlyZWN0OiBpbml0LnJlZGlyZWN0IHx8IGlucHV0LnJlZGlyZWN0IHx8ICdmb2xsb3cnLFxuXHRcdFx0aGVhZGVycyxcblx0XHRcdHBhcnNlZFVSTCxcblx0XHRcdHNpZ25hbFxuXHRcdH07XG5cblx0XHQvLyBub2RlLWZldGNoLW9ubHkgb3B0aW9uc1xuXHRcdHRoaXMuZm9sbG93ID0gaW5pdC5mb2xsb3cgIT09IHVuZGVmaW5lZCA/IGluaXQuZm9sbG93IDogaW5wdXQuZm9sbG93ICE9PSB1bmRlZmluZWQgPyBpbnB1dC5mb2xsb3cgOiAyMDtcblx0XHR0aGlzLmNvbXByZXNzID0gaW5pdC5jb21wcmVzcyAhPT0gdW5kZWZpbmVkID8gaW5pdC5jb21wcmVzcyA6IGlucHV0LmNvbXByZXNzICE9PSB1bmRlZmluZWQgPyBpbnB1dC5jb21wcmVzcyA6IHRydWU7XG5cdFx0dGhpcy5jb3VudGVyID0gaW5pdC5jb3VudGVyIHx8IGlucHV0LmNvdW50ZXIgfHwgMDtcblx0XHR0aGlzLmFnZW50ID0gaW5pdC5hZ2VudCB8fCBpbnB1dC5hZ2VudDtcblx0fVxuXG5cdGdldCBtZXRob2QoKSB7XG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTJDJdLm1ldGhvZDtcblx0fVxuXG5cdGdldCB1cmwoKSB7XG5cdFx0cmV0dXJuIGZvcm1hdF91cmwodGhpc1tJTlRFUk5BTFMkMl0ucGFyc2VkVVJMKTtcblx0fVxuXG5cdGdldCBoZWFkZXJzKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQyXS5oZWFkZXJzO1xuXHR9XG5cblx0Z2V0IHJlZGlyZWN0KCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQyXS5yZWRpcmVjdDtcblx0fVxuXG5cdGdldCBzaWduYWwoKSB7XG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTJDJdLnNpZ25hbDtcblx0fVxuXG5cdC8qKlxuICAqIENsb25lIHRoaXMgcmVxdWVzdFxuICAqXG4gICogQHJldHVybiAgUmVxdWVzdFxuICAqL1xuXHRjbG9uZSgpIHtcblx0XHRyZXR1cm4gbmV3IFJlcXVlc3QodGhpcyk7XG5cdH1cbn1cblxuQm9keS5taXhJbihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZXF1ZXN0LnByb3RvdHlwZSwgU3ltYm9sLnRvU3RyaW5nVGFnLCB7XG5cdHZhbHVlOiAnUmVxdWVzdCcsXG5cdHdyaXRhYmxlOiBmYWxzZSxcblx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFJlcXVlc3QucHJvdG90eXBlLCB7XG5cdG1ldGhvZDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG5cdHVybDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG5cdGhlYWRlcnM6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuXHRyZWRpcmVjdDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG5cdGNsb25lOiB7IGVudW1lcmFibGU6IHRydWUgfSxcblx0c2lnbmFsOiB7IGVudW1lcmFibGU6IHRydWUgfVxufSk7XG5cbi8qKlxuICogQ29udmVydCBhIFJlcXVlc3QgdG8gTm9kZS5qcyBodHRwIHJlcXVlc3Qgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0gICBSZXF1ZXN0ICBBIFJlcXVlc3QgaW5zdGFuY2VcbiAqIEByZXR1cm4gIE9iamVjdCAgIFRoZSBvcHRpb25zIG9iamVjdCB0byBiZSBwYXNzZWQgdG8gaHR0cC5yZXF1ZXN0XG4gKi9cbmZ1bmN0aW9uIGdldE5vZGVSZXF1ZXN0T3B0aW9ucyhyZXF1ZXN0KSB7XG5cdGNvbnN0IHBhcnNlZFVSTCA9IHJlcXVlc3RbSU5URVJOQUxTJDJdLnBhcnNlZFVSTDtcblx0Y29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKHJlcXVlc3RbSU5URVJOQUxTJDJdLmhlYWRlcnMpO1xuXG5cdC8vIGZldGNoIHN0ZXAgMS4zXG5cdGlmICghaGVhZGVycy5oYXMoJ0FjY2VwdCcpKSB7XG5cdFx0aGVhZGVycy5zZXQoJ0FjY2VwdCcsICcqLyonKTtcblx0fVxuXG5cdC8vIEJhc2ljIGZldGNoXG5cdGlmICghcGFyc2VkVVJMLnByb3RvY29sIHx8ICFwYXJzZWRVUkwuaG9zdG5hbWUpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPbmx5IGFic29sdXRlIFVSTHMgYXJlIHN1cHBvcnRlZCcpO1xuXHR9XG5cblx0aWYgKCEvXmh0dHBzPzokLy50ZXN0KHBhcnNlZFVSTC5wcm90b2NvbCkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPbmx5IEhUVFAoUykgcHJvdG9jb2xzIGFyZSBzdXBwb3J0ZWQnKTtcblx0fVxuXG5cdGlmIChyZXF1ZXN0LnNpZ25hbCAmJiByZXF1ZXN0LmJvZHkgaW5zdGFuY2VvZiBTdHJlYW0uUmVhZGFibGUgJiYgIXN0cmVhbURlc3RydWN0aW9uU3VwcG9ydGVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdDYW5jZWxsYXRpb24gb2Ygc3RyZWFtZWQgcmVxdWVzdHMgd2l0aCBBYm9ydFNpZ25hbCBpcyBub3Qgc3VwcG9ydGVkIGluIG5vZGUgPCA4Jyk7XG5cdH1cblxuXHQvLyBIVFRQLW5ldHdvcmstb3ItY2FjaGUgZmV0Y2ggc3RlcHMgMi40LTIuN1xuXHRsZXQgY29udGVudExlbmd0aFZhbHVlID0gbnVsbDtcblx0aWYgKHJlcXVlc3QuYm9keSA9PSBudWxsICYmIC9eKFBPU1R8UFVUKSQvaS50ZXN0KHJlcXVlc3QubWV0aG9kKSkge1xuXHRcdGNvbnRlbnRMZW5ndGhWYWx1ZSA9ICcwJztcblx0fVxuXHRpZiAocmVxdWVzdC5ib2R5ICE9IG51bGwpIHtcblx0XHRjb25zdCB0b3RhbEJ5dGVzID0gZ2V0VG90YWxCeXRlcyhyZXF1ZXN0KTtcblx0XHRpZiAodHlwZW9mIHRvdGFsQnl0ZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRjb250ZW50TGVuZ3RoVmFsdWUgPSBTdHJpbmcodG90YWxCeXRlcyk7XG5cdFx0fVxuXHR9XG5cdGlmIChjb250ZW50TGVuZ3RoVmFsdWUpIHtcblx0XHRoZWFkZXJzLnNldCgnQ29udGVudC1MZW5ndGgnLCBjb250ZW50TGVuZ3RoVmFsdWUpO1xuXHR9XG5cblx0Ly8gSFRUUC1uZXR3b3JrLW9yLWNhY2hlIGZldGNoIHN0ZXAgMi4xMVxuXHRpZiAoIWhlYWRlcnMuaGFzKCdVc2VyLUFnZW50JykpIHtcblx0XHRoZWFkZXJzLnNldCgnVXNlci1BZ2VudCcsICdub2RlLWZldGNoLzEuMCAoK2h0dHBzOi8vZ2l0aHViLmNvbS9iaXRpbm4vbm9kZS1mZXRjaCknKTtcblx0fVxuXG5cdC8vIEhUVFAtbmV0d29yay1vci1jYWNoZSBmZXRjaCBzdGVwIDIuMTVcblx0aWYgKHJlcXVlc3QuY29tcHJlc3MgJiYgIWhlYWRlcnMuaGFzKCdBY2NlcHQtRW5jb2RpbmcnKSkge1xuXHRcdGhlYWRlcnMuc2V0KCdBY2NlcHQtRW5jb2RpbmcnLCAnZ3ppcCxkZWZsYXRlJyk7XG5cdH1cblxuXHRsZXQgYWdlbnQgPSByZXF1ZXN0LmFnZW50O1xuXHRpZiAodHlwZW9mIGFnZW50ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0YWdlbnQgPSBhZ2VudChwYXJzZWRVUkwpO1xuXHR9XG5cblx0aWYgKCFoZWFkZXJzLmhhcygnQ29ubmVjdGlvbicpICYmICFhZ2VudCkge1xuXHRcdGhlYWRlcnMuc2V0KCdDb25uZWN0aW9uJywgJ2Nsb3NlJyk7XG5cdH1cblxuXHQvLyBIVFRQLW5ldHdvcmsgZmV0Y2ggc3RlcCA0LjJcblx0Ly8gY2h1bmtlZCBlbmNvZGluZyBpcyBoYW5kbGVkIGJ5IE5vZGUuanNcblxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgcGFyc2VkVVJMLCB7XG5cdFx0bWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcblx0XHRoZWFkZXJzOiBleHBvcnROb2RlQ29tcGF0aWJsZUhlYWRlcnMoaGVhZGVycyksXG5cdFx0YWdlbnRcblx0fSk7XG59XG5cbi8qKlxuICogYWJvcnQtZXJyb3IuanNcbiAqXG4gKiBBYm9ydEVycm9yIGludGVyZmFjZSBmb3IgY2FuY2VsbGVkIHJlcXVlc3RzXG4gKi9cblxuLyoqXG4gKiBDcmVhdGUgQWJvcnRFcnJvciBpbnN0YW5jZVxuICpcbiAqIEBwYXJhbSAgIFN0cmluZyAgICAgIG1lc3NhZ2UgICAgICBFcnJvciBtZXNzYWdlIGZvciBodW1hblxuICogQHJldHVybiAgQWJvcnRFcnJvclxuICovXG5mdW5jdGlvbiBBYm9ydEVycm9yKG1lc3NhZ2UpIHtcbiAgRXJyb3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICB0aGlzLnR5cGUgPSAnYWJvcnRlZCc7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cbiAgLy8gaGlkZSBjdXN0b20gZXJyb3IgaW1wbGVtZW50YXRpb24gZGV0YWlscyBmcm9tIGVuZC11c2Vyc1xuICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCB0aGlzLmNvbnN0cnVjdG9yKTtcbn1cblxuQWJvcnRFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5BYm9ydEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFib3J0RXJyb3I7XG5BYm9ydEVycm9yLnByb3RvdHlwZS5uYW1lID0gJ0Fib3J0RXJyb3InO1xuXG4vLyBmaXggYW4gaXNzdWUgd2hlcmUgXCJQYXNzVGhyb3VnaFwiLCBcInJlc29sdmVcIiBhcmVuJ3QgYSBuYW1lZCBleHBvcnQgZm9yIG5vZGUgPDEwXG5jb25zdCBQYXNzVGhyb3VnaCQxID0gU3RyZWFtLlBhc3NUaHJvdWdoO1xuY29uc3QgcmVzb2x2ZV91cmwgPSBVcmwucmVzb2x2ZTtcblxuLyoqXG4gKiBGZXRjaCBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSAgIE1peGVkICAgIHVybCAgIEFic29sdXRlIHVybCBvciBSZXF1ZXN0IGluc3RhbmNlXG4gKiBAcGFyYW0gICBPYmplY3QgICBvcHRzICBGZXRjaCBvcHRpb25zXG4gKiBAcmV0dXJuICBQcm9taXNlXG4gKi9cbmZ1bmN0aW9uIGZldGNoKHVybCwgb3B0cykge1xuXG5cdC8vIGFsbG93IGN1c3RvbSBwcm9taXNlXG5cdGlmICghZmV0Y2guUHJvbWlzZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignbmF0aXZlIHByb21pc2UgbWlzc2luZywgc2V0IGZldGNoLlByb21pc2UgdG8geW91ciBmYXZvcml0ZSBhbHRlcm5hdGl2ZScpO1xuXHR9XG5cblx0Qm9keS5Qcm9taXNlID0gZmV0Y2guUHJvbWlzZTtcblxuXHQvLyB3cmFwIGh0dHAucmVxdWVzdCBpbnRvIGZldGNoXG5cdHJldHVybiBuZXcgZmV0Y2guUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0Ly8gYnVpbGQgcmVxdWVzdCBvYmplY3Rcblx0XHRjb25zdCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodXJsLCBvcHRzKTtcblx0XHRjb25zdCBvcHRpb25zID0gZ2V0Tm9kZVJlcXVlc3RPcHRpb25zKHJlcXVlc3QpO1xuXG5cdFx0Y29uc3Qgc2VuZCA9IChvcHRpb25zLnByb3RvY29sID09PSAnaHR0cHM6JyA/IGh0dHBzIDogaHR0cCkucmVxdWVzdDtcblx0XHRjb25zdCBzaWduYWwgPSByZXF1ZXN0LnNpZ25hbDtcblxuXHRcdGxldCByZXNwb25zZSA9IG51bGw7XG5cblx0XHRjb25zdCBhYm9ydCA9IGZ1bmN0aW9uIGFib3J0KCkge1xuXHRcdFx0bGV0IGVycm9yID0gbmV3IEFib3J0RXJyb3IoJ1RoZSB1c2VyIGFib3J0ZWQgYSByZXF1ZXN0LicpO1xuXHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdGlmIChyZXF1ZXN0LmJvZHkgJiYgcmVxdWVzdC5ib2R5IGluc3RhbmNlb2YgU3RyZWFtLlJlYWRhYmxlKSB7XG5cdFx0XHRcdHJlcXVlc3QuYm9keS5kZXN0cm95KGVycm9yKTtcblx0XHRcdH1cblx0XHRcdGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLmJvZHkpIHJldHVybjtcblx0XHRcdHJlc3BvbnNlLmJvZHkuZW1pdCgnZXJyb3InLCBlcnJvcik7XG5cdFx0fTtcblxuXHRcdGlmIChzaWduYWwgJiYgc2lnbmFsLmFib3J0ZWQpIHtcblx0XHRcdGFib3J0KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgYWJvcnRBbmRGaW5hbGl6ZSA9IGZ1bmN0aW9uIGFib3J0QW5kRmluYWxpemUoKSB7XG5cdFx0XHRhYm9ydCgpO1xuXHRcdFx0ZmluYWxpemUoKTtcblx0XHR9O1xuXG5cdFx0Ly8gc2VuZCByZXF1ZXN0XG5cdFx0Y29uc3QgcmVxID0gc2VuZChvcHRpb25zKTtcblx0XHRsZXQgcmVxVGltZW91dDtcblxuXHRcdGlmIChzaWduYWwpIHtcblx0XHRcdHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0QW5kRmluYWxpemUpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGZpbmFsaXplKCkge1xuXHRcdFx0cmVxLmFib3J0KCk7XG5cdFx0XHRpZiAoc2lnbmFsKSBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydEFuZEZpbmFsaXplKTtcblx0XHRcdGNsZWFyVGltZW91dChyZXFUaW1lb3V0KTtcblx0XHR9XG5cblx0XHRpZiAocmVxdWVzdC50aW1lb3V0KSB7XG5cdFx0XHRyZXEub25jZSgnc29ja2V0JywgZnVuY3Rpb24gKHNvY2tldCkge1xuXHRcdFx0XHRyZXFUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmVqZWN0KG5ldyBGZXRjaEVycm9yKGBuZXR3b3JrIHRpbWVvdXQgYXQ6ICR7cmVxdWVzdC51cmx9YCwgJ3JlcXVlc3QtdGltZW91dCcpKTtcblx0XHRcdFx0XHRmaW5hbGl6ZSgpO1xuXHRcdFx0XHR9LCByZXF1ZXN0LnRpbWVvdXQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmVxLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdHJlamVjdChuZXcgRmV0Y2hFcnJvcihgcmVxdWVzdCB0byAke3JlcXVlc3QudXJsfSBmYWlsZWQsIHJlYXNvbjogJHtlcnIubWVzc2FnZX1gLCAnc3lzdGVtJywgZXJyKSk7XG5cdFx0XHRmaW5hbGl6ZSgpO1xuXHRcdH0pO1xuXG5cdFx0cmVxLm9uKCdyZXNwb25zZScsIGZ1bmN0aW9uIChyZXMpIHtcblx0XHRcdGNsZWFyVGltZW91dChyZXFUaW1lb3V0KTtcblxuXHRcdFx0Y29uc3QgaGVhZGVycyA9IGNyZWF0ZUhlYWRlcnNMZW5pZW50KHJlcy5oZWFkZXJzKTtcblxuXHRcdFx0Ly8gSFRUUCBmZXRjaCBzdGVwIDVcblx0XHRcdGlmIChmZXRjaC5pc1JlZGlyZWN0KHJlcy5zdGF0dXNDb2RlKSkge1xuXHRcdFx0XHQvLyBIVFRQIGZldGNoIHN0ZXAgNS4yXG5cdFx0XHRcdGNvbnN0IGxvY2F0aW9uID0gaGVhZGVycy5nZXQoJ0xvY2F0aW9uJyk7XG5cblx0XHRcdFx0Ly8gSFRUUCBmZXRjaCBzdGVwIDUuM1xuXHRcdFx0XHRjb25zdCBsb2NhdGlvblVSTCA9IGxvY2F0aW9uID09PSBudWxsID8gbnVsbCA6IHJlc29sdmVfdXJsKHJlcXVlc3QudXJsLCBsb2NhdGlvbik7XG5cblx0XHRcdFx0Ly8gSFRUUCBmZXRjaCBzdGVwIDUuNVxuXHRcdFx0XHRzd2l0Y2ggKHJlcXVlc3QucmVkaXJlY3QpIHtcblx0XHRcdFx0XHRjYXNlICdlcnJvcic6XG5cdFx0XHRcdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYHJlZGlyZWN0IG1vZGUgaXMgc2V0IHRvIGVycm9yOiAke3JlcXVlc3QudXJsfWAsICduby1yZWRpcmVjdCcpKTtcblx0XHRcdFx0XHRcdGZpbmFsaXplKCk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0Y2FzZSAnbWFudWFsJzpcblx0XHRcdFx0XHRcdC8vIG5vZGUtZmV0Y2gtc3BlY2lmaWMgc3RlcDogbWFrZSBtYW51YWwgcmVkaXJlY3QgYSBiaXQgZWFzaWVyIHRvIHVzZSBieSBzZXR0aW5nIHRoZSBMb2NhdGlvbiBoZWFkZXIgdmFsdWUgdG8gdGhlIHJlc29sdmVkIFVSTC5cblx0XHRcdFx0XHRcdGlmIChsb2NhdGlvblVSTCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHQvLyBoYW5kbGUgY29ycnVwdGVkIGhlYWRlclxuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdGhlYWRlcnMuc2V0KCdMb2NhdGlvbicsIGxvY2F0aW9uVVJMKTtcblx0XHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gaXN0YW5idWwgaWdub3JlIG5leHQ6IG5vZGVqcyBzZXJ2ZXIgcHJldmVudCBpbnZhbGlkIHJlc3BvbnNlIGhlYWRlcnMsIHdlIGNhbid0IHRlc3QgdGhpcyB0aHJvdWdoIG5vcm1hbCByZXF1ZXN0XG5cdFx0XHRcdFx0XHRcdFx0cmVqZWN0KGVycik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgJ2ZvbGxvdyc6XG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgMlxuXHRcdFx0XHRcdFx0aWYgKGxvY2F0aW9uVVJMID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgNVxuXHRcdFx0XHRcdFx0aWYgKHJlcXVlc3QuY291bnRlciA+PSByZXF1ZXN0LmZvbGxvdykge1xuXHRcdFx0XHRcdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYG1heGltdW0gcmVkaXJlY3QgcmVhY2hlZCBhdDogJHtyZXF1ZXN0LnVybH1gLCAnbWF4LXJlZGlyZWN0JykpO1xuXHRcdFx0XHRcdFx0XHRmaW5hbGl6ZSgpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIEhUVFAtcmVkaXJlY3QgZmV0Y2ggc3RlcCA2IChjb3VudGVyIGluY3JlbWVudClcblx0XHRcdFx0XHRcdC8vIENyZWF0ZSBhIG5ldyBSZXF1ZXN0IG9iamVjdC5cblx0XHRcdFx0XHRcdGNvbnN0IHJlcXVlc3RPcHRzID0ge1xuXHRcdFx0XHRcdFx0XHRoZWFkZXJzOiBuZXcgSGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMpLFxuXHRcdFx0XHRcdFx0XHRmb2xsb3c6IHJlcXVlc3QuZm9sbG93LFxuXHRcdFx0XHRcdFx0XHRjb3VudGVyOiByZXF1ZXN0LmNvdW50ZXIgKyAxLFxuXHRcdFx0XHRcdFx0XHRhZ2VudDogcmVxdWVzdC5hZ2VudCxcblx0XHRcdFx0XHRcdFx0Y29tcHJlc3M6IHJlcXVlc3QuY29tcHJlc3MsXG5cdFx0XHRcdFx0XHRcdG1ldGhvZDogcmVxdWVzdC5tZXRob2QsXG5cdFx0XHRcdFx0XHRcdGJvZHk6IHJlcXVlc3QuYm9keSxcblx0XHRcdFx0XHRcdFx0c2lnbmFsOiByZXF1ZXN0LnNpZ25hbCxcblx0XHRcdFx0XHRcdFx0dGltZW91dDogcmVxdWVzdC50aW1lb3V0XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgOVxuXHRcdFx0XHRcdFx0aWYgKHJlcy5zdGF0dXNDb2RlICE9PSAzMDMgJiYgcmVxdWVzdC5ib2R5ICYmIGdldFRvdGFsQnl0ZXMocmVxdWVzdCkgPT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KG5ldyBGZXRjaEVycm9yKCdDYW5ub3QgZm9sbG93IHJlZGlyZWN0IHdpdGggYm9keSBiZWluZyBhIHJlYWRhYmxlIHN0cmVhbScsICd1bnN1cHBvcnRlZC1yZWRpcmVjdCcpKTtcblx0XHRcdFx0XHRcdFx0ZmluYWxpemUoKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgMTFcblx0XHRcdFx0XHRcdGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMzAzIHx8IChyZXMuc3RhdHVzQ29kZSA9PT0gMzAxIHx8IHJlcy5zdGF0dXNDb2RlID09PSAzMDIpICYmIHJlcXVlc3QubWV0aG9kID09PSAnUE9TVCcpIHtcblx0XHRcdFx0XHRcdFx0cmVxdWVzdE9wdHMubWV0aG9kID0gJ0dFVCc7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RPcHRzLmJvZHkgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RPcHRzLmhlYWRlcnMuZGVsZXRlKCdjb250ZW50LWxlbmd0aCcpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgMTVcblx0XHRcdFx0XHRcdHJlc29sdmUoZmV0Y2gobmV3IFJlcXVlc3QobG9jYXRpb25VUkwsIHJlcXVlc3RPcHRzKSkpO1xuXHRcdFx0XHRcdFx0ZmluYWxpemUoKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBwcmVwYXJlIHJlc3BvbnNlXG5cdFx0XHRyZXMub25jZSgnZW5kJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZiAoc2lnbmFsKSBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydEFuZEZpbmFsaXplKTtcblx0XHRcdH0pO1xuXHRcdFx0bGV0IGJvZHkgPSByZXMucGlwZShuZXcgUGFzc1Rocm91Z2gkMSgpKTtcblxuXHRcdFx0Y29uc3QgcmVzcG9uc2Vfb3B0aW9ucyA9IHtcblx0XHRcdFx0dXJsOiByZXF1ZXN0LnVybCxcblx0XHRcdFx0c3RhdHVzOiByZXMuc3RhdHVzQ29kZSxcblx0XHRcdFx0c3RhdHVzVGV4dDogcmVzLnN0YXR1c01lc3NhZ2UsXG5cdFx0XHRcdGhlYWRlcnM6IGhlYWRlcnMsXG5cdFx0XHRcdHNpemU6IHJlcXVlc3Quc2l6ZSxcblx0XHRcdFx0dGltZW91dDogcmVxdWVzdC50aW1lb3V0LFxuXHRcdFx0XHRjb3VudGVyOiByZXF1ZXN0LmNvdW50ZXJcblx0XHRcdH07XG5cblx0XHRcdC8vIEhUVFAtbmV0d29yayBmZXRjaCBzdGVwIDEyLjEuMS4zXG5cdFx0XHRjb25zdCBjb2RpbmdzID0gaGVhZGVycy5nZXQoJ0NvbnRlbnQtRW5jb2RpbmcnKTtcblxuXHRcdFx0Ly8gSFRUUC1uZXR3b3JrIGZldGNoIHN0ZXAgMTIuMS4xLjQ6IGhhbmRsZSBjb250ZW50IGNvZGluZ3NcblxuXHRcdFx0Ly8gaW4gZm9sbG93aW5nIHNjZW5hcmlvcyB3ZSBpZ25vcmUgY29tcHJlc3Npb24gc3VwcG9ydFxuXHRcdFx0Ly8gMS4gY29tcHJlc3Npb24gc3VwcG9ydCBpcyBkaXNhYmxlZFxuXHRcdFx0Ly8gMi4gSEVBRCByZXF1ZXN0XG5cdFx0XHQvLyAzLiBubyBDb250ZW50LUVuY29kaW5nIGhlYWRlclxuXHRcdFx0Ly8gNC4gbm8gY29udGVudCByZXNwb25zZSAoMjA0KVxuXHRcdFx0Ly8gNS4gY29udGVudCBub3QgbW9kaWZpZWQgcmVzcG9uc2UgKDMwNClcblx0XHRcdGlmICghcmVxdWVzdC5jb21wcmVzcyB8fCByZXF1ZXN0Lm1ldGhvZCA9PT0gJ0hFQUQnIHx8IGNvZGluZ3MgPT09IG51bGwgfHwgcmVzLnN0YXR1c0NvZGUgPT09IDIwNCB8fCByZXMuc3RhdHVzQ29kZSA9PT0gMzA0KSB7XG5cdFx0XHRcdHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGJvZHksIHJlc3BvbnNlX29wdGlvbnMpO1xuXHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBGb3IgTm9kZSB2Nitcblx0XHRcdC8vIEJlIGxlc3Mgc3RyaWN0IHdoZW4gZGVjb2RpbmcgY29tcHJlc3NlZCByZXNwb25zZXMsIHNpbmNlIHNvbWV0aW1lc1xuXHRcdFx0Ly8gc2VydmVycyBzZW5kIHNsaWdodGx5IGludmFsaWQgcmVzcG9uc2VzIHRoYXQgYXJlIHN0aWxsIGFjY2VwdGVkXG5cdFx0XHQvLyBieSBjb21tb24gYnJvd3NlcnMuXG5cdFx0XHQvLyBBbHdheXMgdXNpbmcgWl9TWU5DX0ZMVVNIIGlzIHdoYXQgY1VSTCBkb2VzLlxuXHRcdFx0Y29uc3QgemxpYk9wdGlvbnMgPSB7XG5cdFx0XHRcdGZsdXNoOiB6bGliLlpfU1lOQ19GTFVTSCxcblx0XHRcdFx0ZmluaXNoRmx1c2g6IHpsaWIuWl9TWU5DX0ZMVVNIXG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBmb3IgZ3ppcFxuXHRcdFx0aWYgKGNvZGluZ3MgPT0gJ2d6aXAnIHx8IGNvZGluZ3MgPT0gJ3gtZ3ppcCcpIHtcblx0XHRcdFx0Ym9keSA9IGJvZHkucGlwZSh6bGliLmNyZWF0ZUd1bnppcCh6bGliT3B0aW9ucykpO1xuXHRcdFx0XHRyZXNwb25zZSA9IG5ldyBSZXNwb25zZShib2R5LCByZXNwb25zZV9vcHRpb25zKTtcblx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZm9yIGRlZmxhdGVcblx0XHRcdGlmIChjb2RpbmdzID09ICdkZWZsYXRlJyB8fCBjb2RpbmdzID09ICd4LWRlZmxhdGUnKSB7XG5cdFx0XHRcdC8vIGhhbmRsZSB0aGUgaW5mYW1vdXMgcmF3IGRlZmxhdGUgcmVzcG9uc2UgZnJvbSBvbGQgc2VydmVyc1xuXHRcdFx0XHQvLyBhIGhhY2sgZm9yIG9sZCBJSVMgYW5kIEFwYWNoZSBzZXJ2ZXJzXG5cdFx0XHRcdGNvbnN0IHJhdyA9IHJlcy5waXBlKG5ldyBQYXNzVGhyb3VnaCQxKCkpO1xuXHRcdFx0XHRyYXcub25jZSgnZGF0YScsIGZ1bmN0aW9uIChjaHVuaykge1xuXHRcdFx0XHRcdC8vIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM3NTE5ODI4XG5cdFx0XHRcdFx0aWYgKChjaHVua1swXSAmIDB4MEYpID09PSAweDA4KSB7XG5cdFx0XHRcdFx0XHRib2R5ID0gYm9keS5waXBlKHpsaWIuY3JlYXRlSW5mbGF0ZSgpKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ym9keSA9IGJvZHkucGlwZSh6bGliLmNyZWF0ZUluZmxhdGVSYXcoKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGJvZHksIHJlc3BvbnNlX29wdGlvbnMpO1xuXHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2UpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBmb3IgYnJcblx0XHRcdGlmIChjb2RpbmdzID09ICdicicgJiYgdHlwZW9mIHpsaWIuY3JlYXRlQnJvdGxpRGVjb21wcmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRib2R5ID0gYm9keS5waXBlKHpsaWIuY3JlYXRlQnJvdGxpRGVjb21wcmVzcygpKTtcblx0XHRcdFx0cmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UoYm9keSwgcmVzcG9uc2Vfb3B0aW9ucyk7XG5cdFx0XHRcdHJlc29sdmUocmVzcG9uc2UpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIG90aGVyd2lzZSwgdXNlIHJlc3BvbnNlIGFzLWlzXG5cdFx0XHRyZXNwb25zZSA9IG5ldyBSZXNwb25zZShib2R5LCByZXNwb25zZV9vcHRpb25zKTtcblx0XHRcdHJlc29sdmUocmVzcG9uc2UpO1xuXHRcdH0pO1xuXG5cdFx0d3JpdGVUb1N0cmVhbShyZXEsIHJlcXVlc3QpO1xuXHR9KTtcbn1cbi8qKlxuICogUmVkaXJlY3QgY29kZSBtYXRjaGluZ1xuICpcbiAqIEBwYXJhbSAgIE51bWJlciAgIGNvZGUgIFN0YXR1cyBjb2RlXG4gKiBAcmV0dXJuICBCb29sZWFuXG4gKi9cbmZldGNoLmlzUmVkaXJlY3QgPSBmdW5jdGlvbiAoY29kZSkge1xuXHRyZXR1cm4gY29kZSA9PT0gMzAxIHx8IGNvZGUgPT09IDMwMiB8fCBjb2RlID09PSAzMDMgfHwgY29kZSA9PT0gMzA3IHx8IGNvZGUgPT09IDMwODtcbn07XG5cbi8vIGV4cG9zZSBQcm9taXNlXG5mZXRjaC5Qcm9taXNlID0gZ2xvYmFsLlByb21pc2U7XG5cbmZ1bmN0aW9uIGdldF9wYWdlX2hhbmRsZXIoXG5cdG1hbmlmZXN0LFxuXHRzZXNzaW9uX2dldHRlclxuKSB7XG5cdGNvbnN0IGdldF9idWlsZF9pbmZvID0gZGV2XG5cdFx0PyAoKSA9PiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oYnVpbGRfZGlyLCAnYnVpbGQuanNvbicpLCAndXRmLTgnKSlcblx0XHQ6IChhc3NldHMgPT4gKCkgPT4gYXNzZXRzKShKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oYnVpbGRfZGlyLCAnYnVpbGQuanNvbicpLCAndXRmLTgnKSkpO1xuXG5cdGNvbnN0IHRlbXBsYXRlID0gZGV2XG5cdFx0PyAoKSA9PiByZWFkX3RlbXBsYXRlKHNyY19kaXIpXG5cdFx0OiAoc3RyID0+ICgpID0+IHN0cikocmVhZF90ZW1wbGF0ZShidWlsZF9kaXIpKTtcblxuXHRjb25zdCBoYXNfc2VydmljZV93b3JrZXIgPSBmcy5leGlzdHNTeW5jKHBhdGguam9pbihidWlsZF9kaXIsICdzZXJ2aWNlLXdvcmtlci5qcycpKTtcblxuXHRjb25zdCB7IHNlcnZlcl9yb3V0ZXMsIHBhZ2VzIH0gPSBtYW5pZmVzdDtcblx0Y29uc3QgZXJyb3Jfcm91dGUgPSBtYW5pZmVzdC5lcnJvcjtcblxuXHRmdW5jdGlvbiBiYWlsKHJlcSwgcmVzLCBlcnIpIHtcblx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cblx0XHRjb25zdCBtZXNzYWdlID0gZGV2ID8gZXNjYXBlX2h0bWwoZXJyLm1lc3NhZ2UpIDogJ0ludGVybmFsIHNlcnZlciBlcnJvcic7XG5cblx0XHRyZXMuc3RhdHVzQ29kZSA9IDUwMDtcblx0XHRyZXMuZW5kKGA8cHJlPiR7bWVzc2FnZX08L3ByZT5gKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGhhbmRsZV9lcnJvcihyZXEsIHJlcywgc3RhdHVzQ29kZSwgZXJyb3IpIHtcblx0XHRoYW5kbGVfcGFnZSh7XG5cdFx0XHRwYXR0ZXJuOiBudWxsLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBudWxsLCBjb21wb25lbnQ6IGVycm9yX3JvdXRlIH1cblx0XHRcdF1cblx0XHR9LCByZXEsIHJlcywgc3RhdHVzQ29kZSwgZXJyb3IgfHwgbmV3IEVycm9yKCdVbmtub3duIGVycm9yIGluIHByZWxvYWQgZnVuY3Rpb24nKSk7XG5cdH1cblxuXHRhc3luYyBmdW5jdGlvbiBoYW5kbGVfcGFnZShwYWdlLCByZXEsIHJlcywgc3RhdHVzID0gMjAwLCBlcnJvciA9IG51bGwpIHtcblx0XHRjb25zdCBpc19zZXJ2aWNlX3dvcmtlcl9pbmRleCA9IHJlcS5wYXRoID09PSAnL3NlcnZpY2Utd29ya2VyLWluZGV4Lmh0bWwnO1xuXHRcdGNvbnN0IGJ1aWxkX2luZm9cblxuXG5cblxuID0gZ2V0X2J1aWxkX2luZm8oKTtcblxuXHRcdHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcblx0XHRyZXMuc2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJywgZGV2ID8gJ25vLWNhY2hlJyA6ICdtYXgtYWdlPTYwMCcpO1xuXG5cdFx0Ly8gcHJlbG9hZCBtYWluLmpzIGFuZCBjdXJyZW50IHJvdXRlXG5cdFx0Ly8gVE9ETyBkZXRlY3Qgb3RoZXIgc3R1ZmYgd2UgY2FuIHByZWxvYWQ/IGltYWdlcywgQ1NTLCBmb250cz9cblx0XHRsZXQgcHJlbG9hZGVkX2NodW5rcyA9IEFycmF5LmlzQXJyYXkoYnVpbGRfaW5mby5hc3NldHMubWFpbikgPyBidWlsZF9pbmZvLmFzc2V0cy5tYWluIDogW2J1aWxkX2luZm8uYXNzZXRzLm1haW5dO1xuXHRcdGlmICghZXJyb3IgJiYgIWlzX3NlcnZpY2Vfd29ya2VyX2luZGV4KSB7XG5cdFx0XHRwYWdlLnBhcnRzLmZvckVhY2gocGFydCA9PiB7XG5cdFx0XHRcdGlmICghcGFydCkgcmV0dXJuO1xuXG5cdFx0XHRcdC8vIHVzaW5nIGNvbmNhdCBiZWNhdXNlIGl0IGNvdWxkIGJlIGEgc3RyaW5nIG9yIGFuIGFycmF5LiB0aGFua3Mgd2VicGFjayFcblx0XHRcdFx0cHJlbG9hZGVkX2NodW5rcyA9IHByZWxvYWRlZF9jaHVua3MuY29uY2F0KGJ1aWxkX2luZm8uYXNzZXRzW3BhcnQubmFtZV0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKGJ1aWxkX2luZm8uYnVuZGxlciA9PT0gJ3JvbGx1cCcpIHtcblx0XHRcdC8vIFRPRE8gYWRkIGRlcGVuZGVuY2llcyBhbmQgQ1NTXG5cdFx0XHRjb25zdCBsaW5rID0gcHJlbG9hZGVkX2NodW5rc1xuXHRcdFx0XHQuZmlsdGVyKGZpbGUgPT4gZmlsZSAmJiAhZmlsZS5tYXRjaCgvXFwubWFwJC8pKVxuXHRcdFx0XHQubWFwKGZpbGUgPT4gYDwke3JlcS5iYXNlVXJsfS9jbGllbnQvJHtmaWxlfT47cmVsPVwibW9kdWxlcHJlbG9hZFwiYClcblx0XHRcdFx0LmpvaW4oJywgJyk7XG5cblx0XHRcdHJlcy5zZXRIZWFkZXIoJ0xpbmsnLCBsaW5rKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgbGluayA9IHByZWxvYWRlZF9jaHVua3Ncblx0XHRcdFx0LmZpbHRlcihmaWxlID0+IGZpbGUgJiYgIWZpbGUubWF0Y2goL1xcLm1hcCQvKSlcblx0XHRcdFx0Lm1hcCgoZmlsZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGFzID0gL1xcLmNzcyQvLnRlc3QoZmlsZSkgPyAnc3R5bGUnIDogJ3NjcmlwdCc7XG5cdFx0XHRcdFx0cmV0dXJuIGA8JHtyZXEuYmFzZVVybH0vY2xpZW50LyR7ZmlsZX0+O3JlbD1cInByZWxvYWRcIjthcz1cIiR7YXN9XCJgO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuam9pbignLCAnKTtcblxuXHRcdFx0cmVzLnNldEhlYWRlcignTGluaycsIGxpbmspO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNlc3Npb24gPSBzZXNzaW9uX2dldHRlcihyZXEsIHJlcyk7XG5cblx0XHRsZXQgcmVkaXJlY3Q7XG5cdFx0bGV0IHByZWxvYWRfZXJyb3I7XG5cblx0XHRjb25zdCBwcmVsb2FkX2NvbnRleHQgPSB7XG5cdFx0XHRyZWRpcmVjdDogKHN0YXR1c0NvZGUsIGxvY2F0aW9uKSA9PiB7XG5cdFx0XHRcdGlmIChyZWRpcmVjdCAmJiAocmVkaXJlY3Quc3RhdHVzQ29kZSAhPT0gc3RhdHVzQ29kZSB8fCByZWRpcmVjdC5sb2NhdGlvbiAhPT0gbG9jYXRpb24pKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDb25mbGljdGluZyByZWRpcmVjdHNgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsb2NhdGlvbiA9IGxvY2F0aW9uLnJlcGxhY2UoL15cXC8vZywgJycpOyAvLyBsZWFkaW5nIHNsYXNoIChvbmx5KVxuXHRcdFx0XHRyZWRpcmVjdCA9IHsgc3RhdHVzQ29kZSwgbG9jYXRpb24gfTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogKHN0YXR1c0NvZGUsIG1lc3NhZ2UpID0+IHtcblx0XHRcdFx0cHJlbG9hZF9lcnJvciA9IHsgc3RhdHVzQ29kZSwgbWVzc2FnZSB9O1xuXHRcdFx0fSxcblx0XHRcdGZldGNoOiAodXJsLCBvcHRzKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHBhcnNlZCA9IG5ldyBVcmwuVVJMKHVybCwgYGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9jZXNzLmVudi5QT1JUfSR7cmVxLmJhc2VVcmwgPyByZXEuYmFzZVVybCArICcvJyA6Jyd9YCk7XG5cblx0XHRcdFx0aWYgKG9wdHMpIHtcblx0XHRcdFx0XHRvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0cyk7XG5cblx0XHRcdFx0XHRjb25zdCBpbmNsdWRlX2Nvb2tpZXMgPSAoXG5cdFx0XHRcdFx0XHRvcHRzLmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScgfHxcblx0XHRcdFx0XHRcdG9wdHMuY3JlZGVudGlhbHMgPT09ICdzYW1lLW9yaWdpbicgJiYgcGFyc2VkLm9yaWdpbiA9PT0gYGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9jZXNzLmVudi5QT1JUfWBcblx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0aWYgKGluY2x1ZGVfY29va2llcykge1xuXHRcdFx0XHRcdFx0b3B0cy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0cy5oZWFkZXJzKTtcblxuXHRcdFx0XHRcdFx0Y29uc3QgY29va2llcyA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHRcdFx0XHRcdHt9LFxuXHRcdFx0XHRcdFx0XHRjb29raWUucGFyc2UocmVxLmhlYWRlcnMuY29va2llIHx8ICcnKSxcblx0XHRcdFx0XHRcdFx0Y29va2llLnBhcnNlKG9wdHMuaGVhZGVycy5jb29raWUgfHwgJycpXG5cdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBzZXRfY29va2llID0gcmVzLmdldEhlYWRlcignU2V0LUNvb2tpZScpO1xuXHRcdFx0XHRcdFx0KEFycmF5LmlzQXJyYXkoc2V0X2Nvb2tpZSkgPyBzZXRfY29va2llIDogW3NldF9jb29raWVdKS5mb3JFYWNoKHN0ciA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG1hdGNoID0gLyhbXj1dKyk9KFteO10rKS8uZXhlYyhzdHIpO1xuXHRcdFx0XHRcdFx0XHRpZiAobWF0Y2gpIGNvb2tpZXNbbWF0Y2hbMV1dID0gbWF0Y2hbMl07XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0Y29uc3Qgc3RyID0gT2JqZWN0LmtleXMoY29va2llcylcblx0XHRcdFx0XHRcdFx0Lm1hcChrZXkgPT4gYCR7a2V5fT0ke2Nvb2tpZXNba2V5XX1gKVxuXHRcdFx0XHRcdFx0XHQuam9pbignOyAnKTtcblxuXHRcdFx0XHRcdFx0b3B0cy5oZWFkZXJzLmNvb2tpZSA9IHN0cjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gZmV0Y2gocGFyc2VkLmhyZWYsIG9wdHMpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRsZXQgcHJlbG9hZGVkO1xuXHRcdGxldCBtYXRjaDtcblx0XHRsZXQgcGFyYW1zO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHJvb3RfcHJlbG9hZGVkID0gbWFuaWZlc3Qucm9vdF9wcmVsb2FkXG5cdFx0XHRcdD8gbWFuaWZlc3Qucm9vdF9wcmVsb2FkLmNhbGwocHJlbG9hZF9jb250ZXh0LCB7XG5cdFx0XHRcdFx0aG9zdDogcmVxLmhlYWRlcnMuaG9zdCxcblx0XHRcdFx0XHRwYXRoOiByZXEucGF0aCxcblx0XHRcdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LFxuXHRcdFx0XHRcdHBhcmFtczoge31cblx0XHRcdFx0fSwgc2Vzc2lvbilcblx0XHRcdFx0OiB7fTtcblxuXHRcdFx0bWF0Y2ggPSBlcnJvciA/IG51bGwgOiBwYWdlLnBhdHRlcm4uZXhlYyhyZXEucGF0aCk7XG5cblxuXHRcdFx0bGV0IHRvUHJlbG9hZCA9IFtyb290X3ByZWxvYWRlZF07XG5cdFx0XHRpZiAoIWlzX3NlcnZpY2Vfd29ya2VyX2luZGV4KSB7XG5cdFx0XHRcdHRvUHJlbG9hZCA9IHRvUHJlbG9hZC5jb25jYXQocGFnZS5wYXJ0cy5tYXAocGFydCA9PiB7XG5cdFx0XHRcdFx0aWYgKCFwYXJ0KSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRcdC8vIHRoZSBkZWVwZXN0IGxldmVsIGlzIHVzZWQgYmVsb3csIHRvIGluaXRpYWxpc2UgdGhlIHN0b3JlXG5cdFx0XHRcdFx0cGFyYW1zID0gcGFydC5wYXJhbXMgPyBwYXJ0LnBhcmFtcyhtYXRjaCkgOiB7fTtcblxuXHRcdFx0XHRcdHJldHVybiBwYXJ0LnByZWxvYWRcblx0XHRcdFx0XHRcdD8gcGFydC5wcmVsb2FkLmNhbGwocHJlbG9hZF9jb250ZXh0LCB7XG5cdFx0XHRcdFx0XHRcdGhvc3Q6IHJlcS5oZWFkZXJzLmhvc3QsXG5cdFx0XHRcdFx0XHRcdHBhdGg6IHJlcS5wYXRoLFxuXHRcdFx0XHRcdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LFxuXHRcdFx0XHRcdFx0XHRwYXJhbXNcblx0XHRcdFx0XHRcdH0sIHNlc3Npb24pXG5cdFx0XHRcdFx0XHQ6IHt9O1xuXHRcdFx0XHR9KSk7XG5cdFx0XHR9XG5cblx0XHRcdHByZWxvYWRlZCA9IGF3YWl0IFByb21pc2UuYWxsKHRvUHJlbG9hZCk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdFx0cmV0dXJuIGJhaWwocmVxLCByZXMsIGVycilcblx0XHRcdH1cblxuXHRcdFx0cHJlbG9hZF9lcnJvciA9IHsgc3RhdHVzQ29kZTogNTAwLCBtZXNzYWdlOiBlcnIgfTtcblx0XHRcdHByZWxvYWRlZCA9IFtdOyAvLyBhcHBlYXNlIFR5cGVTY3JpcHRcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKHJlZGlyZWN0KSB7XG5cdFx0XHRcdGNvbnN0IGxvY2F0aW9uID0gVXJsLnJlc29sdmUoKHJlcS5iYXNlVXJsIHx8ICcnKSArICcvJywgcmVkaXJlY3QubG9jYXRpb24pO1xuXG5cdFx0XHRcdHJlcy5zdGF0dXNDb2RlID0gcmVkaXJlY3Quc3RhdHVzQ29kZTtcblx0XHRcdFx0cmVzLnNldEhlYWRlcignTG9jYXRpb24nLCBsb2NhdGlvbik7XG5cdFx0XHRcdHJlcy5lbmQoKTtcblxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwcmVsb2FkX2Vycm9yKSB7XG5cdFx0XHRcdGhhbmRsZV9lcnJvcihyZXEsIHJlcywgcHJlbG9hZF9lcnJvci5zdGF0dXNDb2RlLCBwcmVsb2FkX2Vycm9yLm1lc3NhZ2UpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHNlZ21lbnRzID0gcmVxLnBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7XG5cblx0XHRcdC8vIFRPRE8gbWFrZSB0aGlzIGxlc3MgY29uZnVzaW5nXG5cdFx0XHRjb25zdCBsYXlvdXRfc2VnbWVudHMgPSBbc2VnbWVudHNbMF1dO1xuXHRcdFx0bGV0IGwgPSAxO1xuXG5cdFx0XHRwYWdlLnBhcnRzLmZvckVhY2goKHBhcnQsIGkpID0+IHtcblx0XHRcdFx0bGF5b3V0X3NlZ21lbnRzW2xdID0gc2VnbWVudHNbaSArIDFdO1xuXHRcdFx0XHRpZiAoIXBhcnQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRsKys7XG5cdFx0XHR9KTtcblxuXHRcdFx0Y29uc3QgcHJvcHMgPSB7XG5cdFx0XHRcdHN0b3Jlczoge1xuXHRcdFx0XHRcdHBhZ2U6IHtcblx0XHRcdFx0XHRcdHN1YnNjcmliZTogd3JpdGFibGUoe1xuXHRcdFx0XHRcdFx0XHRob3N0OiByZXEuaGVhZGVycy5ob3N0LFxuXHRcdFx0XHRcdFx0XHRwYXRoOiByZXEucGF0aCxcblx0XHRcdFx0XHRcdFx0cXVlcnk6IHJlcS5xdWVyeSxcblx0XHRcdFx0XHRcdFx0cGFyYW1zXG5cdFx0XHRcdFx0XHR9KS5zdWJzY3JpYmVcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZWxvYWRpbmc6IHtcblx0XHRcdFx0XHRcdHN1YnNjcmliZTogd3JpdGFibGUobnVsbCkuc3Vic2NyaWJlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzZXNzaW9uOiB3cml0YWJsZShzZXNzaW9uKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZWdtZW50czogbGF5b3V0X3NlZ21lbnRzLFxuXHRcdFx0XHRzdGF0dXM6IGVycm9yID8gc3RhdHVzIDogMjAwLFxuXHRcdFx0XHRlcnJvcjogZXJyb3IgPyBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiB7IG1lc3NhZ2U6IGVycm9yIH0gOiBudWxsLFxuXHRcdFx0XHRsZXZlbDA6IHtcblx0XHRcdFx0XHRwcm9wczogcHJlbG9hZGVkWzBdXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGxldmVsMToge1xuXHRcdFx0XHRcdHNlZ21lbnQ6IHNlZ21lbnRzWzBdLFxuXHRcdFx0XHRcdHByb3BzOiB7fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIWlzX3NlcnZpY2Vfd29ya2VyX2luZGV4KSB7XG5cdFx0XHRcdGxldCBsID0gMTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBwYWdlLnBhcnRzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRcdFx0Y29uc3QgcGFydCA9IHBhZ2UucGFydHNbaV07XG5cdFx0XHRcdFx0aWYgKCFwYXJ0KSBjb250aW51ZTtcblxuXHRcdFx0XHRcdHByb3BzW2BsZXZlbCR7bCsrfWBdID0ge1xuXHRcdFx0XHRcdFx0Y29tcG9uZW50OiBwYXJ0LmNvbXBvbmVudCxcblx0XHRcdFx0XHRcdHByb3BzOiBwcmVsb2FkZWRbaSArIDFdIHx8IHt9LFxuXHRcdFx0XHRcdFx0c2VnbWVudDogc2VnbWVudHNbaV1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHsgaHRtbCwgaGVhZCwgY3NzIH0gPSBBcHAucmVuZGVyKHByb3BzKTtcblxuXHRcdFx0Y29uc3Qgc2VyaWFsaXplZCA9IHtcblx0XHRcdFx0cHJlbG9hZGVkOiBgWyR7cHJlbG9hZGVkLm1hcChkYXRhID0+IHRyeV9zZXJpYWxpemUoZGF0YSkpLmpvaW4oJywnKX1dYCxcblx0XHRcdFx0c2Vzc2lvbjogc2Vzc2lvbiAmJiB0cnlfc2VyaWFsaXplKHNlc3Npb24sIGVyciA9PiB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2VyaWFsaXplIHNlc3Npb24gZGF0YTogJHtlcnIubWVzc2FnZX1gKTtcblx0XHRcdFx0fSksXG5cdFx0XHRcdGVycm9yOiBlcnJvciAmJiB0cnlfc2VyaWFsaXplKHByb3BzLmVycm9yKVxuXHRcdFx0fTtcblxuXHRcdFx0bGV0IHNjcmlwdCA9IGBfX1NBUFBFUl9fPXske1tcblx0XHRcdFx0ZXJyb3IgJiYgYGVycm9yOiR7c2VyaWFsaXplZC5lcnJvcn0sc3RhdHVzOiR7c3RhdHVzfWAsXG5cdFx0XHRcdGBiYXNlVXJsOlwiJHtyZXEuYmFzZVVybH1cImAsXG5cdFx0XHRcdHNlcmlhbGl6ZWQucHJlbG9hZGVkICYmIGBwcmVsb2FkZWQ6JHtzZXJpYWxpemVkLnByZWxvYWRlZH1gLFxuXHRcdFx0XHRzZXJpYWxpemVkLnNlc3Npb24gJiYgYHNlc3Npb246JHtzZXJpYWxpemVkLnNlc3Npb259YFxuXHRcdFx0XS5maWx0ZXIoQm9vbGVhbikuam9pbignLCcpfX07YDtcblxuXHRcdFx0aWYgKGhhc19zZXJ2aWNlX3dvcmtlcikge1xuXHRcdFx0XHRzY3JpcHQgKz0gYGlmKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJyR7cmVxLmJhc2VVcmx9L3NlcnZpY2Utd29ya2VyLmpzJyk7YDtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZmlsZSA9IFtdLmNvbmNhdChidWlsZF9pbmZvLmFzc2V0cy5tYWluKS5maWx0ZXIoZmlsZSA9PiBmaWxlICYmIC9cXC5qcyQvLnRlc3QoZmlsZSkpWzBdO1xuXHRcdFx0Y29uc3QgbWFpbiA9IGAke3JlcS5iYXNlVXJsfS9jbGllbnQvJHtmaWxlfWA7XG5cblx0XHRcdGlmIChidWlsZF9pbmZvLmJ1bmRsZXIgPT09ICdyb2xsdXAnKSB7XG5cdFx0XHRcdGlmIChidWlsZF9pbmZvLmxlZ2FjeV9hc3NldHMpIHtcblx0XHRcdFx0XHRjb25zdCBsZWdhY3lfbWFpbiA9IGAke3JlcS5iYXNlVXJsfS9jbGllbnQvbGVnYWN5LyR7YnVpbGRfaW5mby5sZWdhY3lfYXNzZXRzLm1haW59YDtcblx0XHRcdFx0XHRzY3JpcHQgKz0gYChmdW5jdGlvbigpe3RyeXtldmFsKFwiYXN5bmMgZnVuY3Rpb24geCgpe31cIik7dmFyIG1haW49XCIke21haW59XCJ9Y2F0Y2goZSl7bWFpbj1cIiR7bGVnYWN5X21haW59XCJ9O3ZhciBzPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7dHJ5e25ldyBGdW5jdGlvbihcImlmKDApaW1wb3J0KCcnKVwiKSgpO3Muc3JjPW1haW47cy50eXBlPVwibW9kdWxlXCI7cy5jcm9zc09yaWdpbj1cInVzZS1jcmVkZW50aWFsc1wiO31jYXRjaChlKXtzLnNyYz1cIiR7cmVxLmJhc2VVcmx9L2NsaWVudC9zaGltcG9ydEAke2J1aWxkX2luZm8uc2hpbXBvcnR9LmpzXCI7cy5zZXRBdHRyaWJ1dGUoXCJkYXRhLW1haW5cIixtYWluKTt9ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzKTt9KCkpO2A7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2NyaXB0ICs9IGB2YXIgcz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO3RyeXtuZXcgRnVuY3Rpb24oXCJpZigwKWltcG9ydCgnJylcIikoKTtzLnNyYz1cIiR7bWFpbn1cIjtzLnR5cGU9XCJtb2R1bGVcIjtzLmNyb3NzT3JpZ2luPVwidXNlLWNyZWRlbnRpYWxzXCI7fWNhdGNoKGUpe3Muc3JjPVwiJHtyZXEuYmFzZVVybH0vY2xpZW50L3NoaW1wb3J0QCR7YnVpbGRfaW5mby5zaGltcG9ydH0uanNcIjtzLnNldEF0dHJpYnV0ZShcImRhdGEtbWFpblwiLFwiJHttYWlufVwiKX1kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHMpYDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2NyaXB0ICs9IGA8L3NjcmlwdD48c2NyaXB0IHNyYz1cIiR7bWFpbn1cIj5gO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgc3R5bGVzO1xuXG5cdFx0XHQvLyBUT0RPIG1ha2UgdGhpcyBjb25zaXN0ZW50IGFjcm9zcyBhcHBzXG5cdFx0XHQvLyBUT0RPIGVtYmVkIGJ1aWxkX2luZm8gaW4gcGxhY2Vob2xkZXIudHNcblx0XHRcdGlmIChidWlsZF9pbmZvLmNzcyAmJiBidWlsZF9pbmZvLmNzcy5tYWluKSB7XG5cdFx0XHRcdGNvbnN0IGNzc19jaHVua3MgPSBuZXcgU2V0KCk7XG5cdFx0XHRcdGlmIChidWlsZF9pbmZvLmNzcy5tYWluKSBjc3NfY2h1bmtzLmFkZChidWlsZF9pbmZvLmNzcy5tYWluKTtcblx0XHRcdFx0cGFnZS5wYXJ0cy5mb3JFYWNoKHBhcnQgPT4ge1xuXHRcdFx0XHRcdGlmICghcGFydCkgcmV0dXJuO1xuXHRcdFx0XHRcdGNvbnN0IGNzc19jaHVua3NfZm9yX3BhcnQgPSBidWlsZF9pbmZvLmNzcy5jaHVua3NbcGFydC5maWxlXTtcblxuXHRcdFx0XHRcdGlmIChjc3NfY2h1bmtzX2Zvcl9wYXJ0KSB7XG5cdFx0XHRcdFx0XHRjc3NfY2h1bmtzX2Zvcl9wYXJ0LmZvckVhY2goZmlsZSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNzc19jaHVua3MuYWRkKGZpbGUpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRzdHlsZXMgPSBBcnJheS5mcm9tKGNzc19jaHVua3MpXG5cdFx0XHRcdFx0Lm1hcChocmVmID0+IGA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cImNsaWVudC8ke2hyZWZ9XCI+YClcblx0XHRcdFx0XHQuam9pbignJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzdHlsZXMgPSAoY3NzICYmIGNzcy5jb2RlID8gYDxzdHlsZT4ke2Nzcy5jb2RlfTwvc3R5bGU+YCA6ICcnKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gdXNlcnMgY2FuIHNldCBhIENTUCBub25jZSB1c2luZyByZXMubG9jYWxzLm5vbmNlXG5cdFx0XHRjb25zdCBub25jZV9hdHRyID0gKHJlcy5sb2NhbHMgJiYgcmVzLmxvY2Fscy5ub25jZSkgPyBgIG5vbmNlPVwiJHtyZXMubG9jYWxzLm5vbmNlfVwiYCA6ICcnO1xuXG5cdFx0XHRjb25zdCBib2R5ID0gdGVtcGxhdGUoKVxuXHRcdFx0XHQucmVwbGFjZSgnJXNhcHBlci5iYXNlJScsICgpID0+IGA8YmFzZSBocmVmPVwiJHtyZXEuYmFzZVVybH0vXCI+YClcblx0XHRcdFx0LnJlcGxhY2UoJyVzYXBwZXIuc2NyaXB0cyUnLCAoKSA9PiBgPHNjcmlwdCR7bm9uY2VfYXR0cn0+JHtzY3JpcHR9PC9zY3JpcHQ+YClcblx0XHRcdFx0LnJlcGxhY2UoJyVzYXBwZXIuaHRtbCUnLCAoKSA9PiBodG1sKVxuXHRcdFx0XHQucmVwbGFjZSgnJXNhcHBlci5oZWFkJScsICgpID0+IGA8bm9zY3JpcHQgaWQ9J3NhcHBlci1oZWFkLXN0YXJ0Jz48L25vc2NyaXB0PiR7aGVhZH08bm9zY3JpcHQgaWQ9J3NhcHBlci1oZWFkLWVuZCc+PC9ub3NjcmlwdD5gKVxuXHRcdFx0XHQucmVwbGFjZSgnJXNhcHBlci5zdHlsZXMlJywgKCkgPT4gc3R5bGVzKTtcblxuXHRcdFx0cmVzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XG5cdFx0XHRyZXMuZW5kKGJvZHkpO1xuXHRcdH0gY2F0Y2goZXJyKSB7XG5cdFx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdFx0YmFpbChyZXEsIHJlcywgZXJyKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGhhbmRsZV9lcnJvcihyZXEsIHJlcywgNTAwLCBlcnIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBmdW5jdGlvbiBmaW5kX3JvdXRlKHJlcSwgcmVzLCBuZXh0KSB7XG5cdFx0aWYgKHJlcS5wYXRoID09PSAnL3NlcnZpY2Utd29ya2VyLWluZGV4Lmh0bWwnKSB7XG5cdFx0XHRjb25zdCBob21lUGFnZSA9IHBhZ2VzLmZpbmQocGFnZSA9PiBwYWdlLnBhdHRlcm4udGVzdCgnLycpKTtcblx0XHRcdGhhbmRsZV9wYWdlKGhvbWVQYWdlLCByZXEsIHJlcyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBwYWdlIG9mIHBhZ2VzKSB7XG5cdFx0XHRpZiAocGFnZS5wYXR0ZXJuLnRlc3QocmVxLnBhdGgpKSB7XG5cdFx0XHRcdGhhbmRsZV9wYWdlKHBhZ2UsIHJlcSwgcmVzKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZV9lcnJvcihyZXEsIHJlcywgNDA0LCAnTm90IGZvdW5kJyk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlYWRfdGVtcGxhdGUoZGlyID0gYnVpbGRfZGlyKSB7XG5cdHJldHVybiBmcy5yZWFkRmlsZVN5bmMoYCR7ZGlyfS90ZW1wbGF0ZS5odG1sYCwgJ3V0Zi04Jyk7XG59XG5cbmZ1bmN0aW9uIHRyeV9zZXJpYWxpemUoZGF0YSwgZmFpbCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkZXZhbHVlKGRhdGEpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRpZiAoZmFpbCkgZmFpbChlcnIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGVzY2FwZV9odG1sKGh0bWwpIHtcblx0Y29uc3QgY2hhcnMgPSB7XG5cdFx0J1wiJyA6ICdxdW90Jyxcblx0XHRcIidcIjogJyMzOScsXG5cdFx0JyYnOiAnYW1wJyxcblx0XHQnPCcgOiAnbHQnLFxuXHRcdCc+JyA6ICdndCdcblx0fTtcblxuXHRyZXR1cm4gaHRtbC5yZXBsYWNlKC9bXCInJjw+XS9nLCBjID0+IGAmJHtjaGFyc1tjXX07YCk7XG59XG5cbnZhciBtaW1lX3JhdyA9IFwiYXBwbGljYXRpb24vYW5kcmV3LWluc2V0XFx0XFx0XFx0ZXpcXG5hcHBsaWNhdGlvbi9hcHBsaXh3YXJlXFx0XFx0XFx0XFx0YXdcXG5hcHBsaWNhdGlvbi9hdG9tK3htbFxcdFxcdFxcdFxcdGF0b21cXG5hcHBsaWNhdGlvbi9hdG9tY2F0K3htbFxcdFxcdFxcdFxcdGF0b21jYXRcXG5hcHBsaWNhdGlvbi9hdG9tc3ZjK3htbFxcdFxcdFxcdFxcdGF0b21zdmNcXG5hcHBsaWNhdGlvbi9jY3htbCt4bWxcXHRcXHRcXHRcXHRjY3htbFxcbmFwcGxpY2F0aW9uL2NkbWktY2FwYWJpbGl0eVxcdFxcdFxcdGNkbWlhXFxuYXBwbGljYXRpb24vY2RtaS1jb250YWluZXJcXHRcXHRcXHRjZG1pY1xcbmFwcGxpY2F0aW9uL2NkbWktZG9tYWluXFx0XFx0XFx0XFx0Y2RtaWRcXG5hcHBsaWNhdGlvbi9jZG1pLW9iamVjdFxcdFxcdFxcdFxcdGNkbWlvXFxuYXBwbGljYXRpb24vY2RtaS1xdWV1ZVxcdFxcdFxcdFxcdGNkbWlxXFxuYXBwbGljYXRpb24vY3Utc2VlbWVcXHRcXHRcXHRcXHRjdVxcbmFwcGxpY2F0aW9uL2Rhdm1vdW50K3htbFxcdFxcdFxcdGRhdm1vdW50XFxuYXBwbGljYXRpb24vZG9jYm9vayt4bWxcXHRcXHRcXHRcXHRkYmtcXG5hcHBsaWNhdGlvbi9kc3NjK2RlclxcdFxcdFxcdFxcdGRzc2NcXG5hcHBsaWNhdGlvbi9kc3NjK3htbFxcdFxcdFxcdFxcdHhkc3NjXFxuYXBwbGljYXRpb24vZWNtYXNjcmlwdFxcdFxcdFxcdFxcdGVjbWFcXG5hcHBsaWNhdGlvbi9lbW1hK3htbFxcdFxcdFxcdFxcdGVtbWFcXG5hcHBsaWNhdGlvbi9lcHViK3ppcFxcdFxcdFxcdFxcdGVwdWJcXG5hcHBsaWNhdGlvbi9leGlcXHRcXHRcXHRcXHRcXHRleGlcXG5hcHBsaWNhdGlvbi9mb250LXRkcGZyXFx0XFx0XFx0XFx0cGZyXFxuYXBwbGljYXRpb24vZ21sK3htbFxcdFxcdFxcdFxcdGdtbFxcbmFwcGxpY2F0aW9uL2dweCt4bWxcXHRcXHRcXHRcXHRncHhcXG5hcHBsaWNhdGlvbi9neGZcXHRcXHRcXHRcXHRcXHRneGZcXG5hcHBsaWNhdGlvbi9oeXBlcnN0dWRpb1xcdFxcdFxcdFxcdHN0a1xcbmFwcGxpY2F0aW9uL2lua21sK3htbFxcdFxcdFxcdFxcdGluayBpbmttbFxcbmFwcGxpY2F0aW9uL2lwZml4XFx0XFx0XFx0XFx0aXBmaXhcXG5hcHBsaWNhdGlvbi9qYXZhLWFyY2hpdmVcXHRcXHRcXHRqYXJcXG5hcHBsaWNhdGlvbi9qYXZhLXNlcmlhbGl6ZWQtb2JqZWN0XFx0XFx0c2VyXFxuYXBwbGljYXRpb24vamF2YS12bVxcdFxcdFxcdFxcdGNsYXNzXFxuYXBwbGljYXRpb24vamF2YXNjcmlwdFxcdFxcdFxcdFxcdGpzXFxuYXBwbGljYXRpb24vanNvblxcdFxcdFxcdFxcdGpzb24gbWFwXFxuYXBwbGljYXRpb24vanNvbm1sK2pzb25cXHRcXHRcXHRcXHRqc29ubWxcXG5hcHBsaWNhdGlvbi9sb3N0K3htbFxcdFxcdFxcdFxcdGxvc3R4bWxcXG5hcHBsaWNhdGlvbi9tYWMtYmluaGV4NDBcXHRcXHRcXHRocXhcXG5hcHBsaWNhdGlvbi9tYWMtY29tcGFjdHByb1xcdFxcdFxcdGNwdFxcbmFwcGxpY2F0aW9uL21hZHMreG1sXFx0XFx0XFx0XFx0bWFkc1xcbmFwcGxpY2F0aW9uL21hcmNcXHRcXHRcXHRcXHRtcmNcXG5hcHBsaWNhdGlvbi9tYXJjeG1sK3htbFxcdFxcdFxcdFxcdG1yY3hcXG5hcHBsaWNhdGlvbi9tYXRoZW1hdGljYVxcdFxcdFxcdFxcdG1hIG5iIG1iXFxuYXBwbGljYXRpb24vbWF0aG1sK3htbFxcdFxcdFxcdFxcdG1hdGhtbFxcbmFwcGxpY2F0aW9uL21ib3hcXHRcXHRcXHRcXHRtYm94XFxuYXBwbGljYXRpb24vbWVkaWFzZXJ2ZXJjb250cm9sK3htbFxcdFxcdG1zY21sXFxuYXBwbGljYXRpb24vbWV0YWxpbmsreG1sXFx0XFx0XFx0bWV0YWxpbmtcXG5hcHBsaWNhdGlvbi9tZXRhbGluazQreG1sXFx0XFx0XFx0bWV0YTRcXG5hcHBsaWNhdGlvbi9tZXRzK3htbFxcdFxcdFxcdFxcdG1ldHNcXG5hcHBsaWNhdGlvbi9tb2RzK3htbFxcdFxcdFxcdFxcdG1vZHNcXG5hcHBsaWNhdGlvbi9tcDIxXFx0XFx0XFx0XFx0bTIxIG1wMjFcXG5hcHBsaWNhdGlvbi9tcDRcXHRcXHRcXHRcXHRcXHRtcDRzXFxuYXBwbGljYXRpb24vbXN3b3JkXFx0XFx0XFx0XFx0ZG9jIGRvdFxcbmFwcGxpY2F0aW9uL214ZlxcdFxcdFxcdFxcdFxcdG14ZlxcbmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVxcdGJpbiBkbXMgbHJmIG1hciBzbyBkaXN0IGRpc3R6IHBrZyBicGsgZHVtcCBlbGMgZGVwbG95XFxuYXBwbGljYXRpb24vb2RhXFx0XFx0XFx0XFx0XFx0b2RhXFxuYXBwbGljYXRpb24vb2VicHMtcGFja2FnZSt4bWxcXHRcXHRcXHRvcGZcXG5hcHBsaWNhdGlvbi9vZ2dcXHRcXHRcXHRcXHRcXHRvZ3hcXG5hcHBsaWNhdGlvbi9vbWRvYyt4bWxcXHRcXHRcXHRcXHRvbWRvY1xcbmFwcGxpY2F0aW9uL29uZW5vdGVcXHRcXHRcXHRcXHRvbmV0b2Mgb25ldG9jMiBvbmV0bXAgb25lcGtnXFxuYXBwbGljYXRpb24vb3hwc1xcdFxcdFxcdFxcdG94cHNcXG5hcHBsaWNhdGlvbi9wYXRjaC1vcHMtZXJyb3IreG1sXFx0XFx0XFx0eGVyXFxuYXBwbGljYXRpb24vcGRmXFx0XFx0XFx0XFx0XFx0cGRmXFxuYXBwbGljYXRpb24vcGdwLWVuY3J5cHRlZFxcdFxcdFxcdHBncFxcbmFwcGxpY2F0aW9uL3BncC1zaWduYXR1cmVcXHRcXHRcXHRhc2Mgc2lnXFxuYXBwbGljYXRpb24vcGljcy1ydWxlc1xcdFxcdFxcdFxcdHByZlxcbmFwcGxpY2F0aW9uL3BrY3MxMFxcdFxcdFxcdFxcdHAxMFxcbmFwcGxpY2F0aW9uL3BrY3M3LW1pbWVcXHRcXHRcXHRcXHRwN20gcDdjXFxuYXBwbGljYXRpb24vcGtjczctc2lnbmF0dXJlXFx0XFx0XFx0cDdzXFxuYXBwbGljYXRpb24vcGtjczhcXHRcXHRcXHRcXHRwOFxcbmFwcGxpY2F0aW9uL3BraXgtYXR0ci1jZXJ0XFx0XFx0XFx0YWNcXG5hcHBsaWNhdGlvbi9wa2l4LWNlcnRcXHRcXHRcXHRcXHRjZXJcXG5hcHBsaWNhdGlvbi9wa2l4LWNybFxcdFxcdFxcdFxcdGNybFxcbmFwcGxpY2F0aW9uL3BraXgtcGtpcGF0aFxcdFxcdFxcdHBraXBhdGhcXG5hcHBsaWNhdGlvbi9wa2l4Y21wXFx0XFx0XFx0XFx0cGtpXFxuYXBwbGljYXRpb24vcGxzK3htbFxcdFxcdFxcdFxcdHBsc1xcbmFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcXHRcXHRcXHRcXHRhaSBlcHMgcHNcXG5hcHBsaWNhdGlvbi9wcnMuY3d3XFx0XFx0XFx0XFx0Y3d3XFxuYXBwbGljYXRpb24vcHNrYyt4bWxcXHRcXHRcXHRcXHRwc2tjeG1sXFxuYXBwbGljYXRpb24vcmRmK3htbFxcdFxcdFxcdFxcdHJkZlxcbmFwcGxpY2F0aW9uL3JlZ2luZm8reG1sXFx0XFx0XFx0XFx0cmlmXFxuYXBwbGljYXRpb24vcmVsYXgtbmctY29tcGFjdC1zeW50YXhcXHRcXHRybmNcXG5hcHBsaWNhdGlvbi9yZXNvdXJjZS1saXN0cyt4bWxcXHRcXHRcXHRybFxcbmFwcGxpY2F0aW9uL3Jlc291cmNlLWxpc3RzLWRpZmYreG1sXFx0XFx0cmxkXFxuYXBwbGljYXRpb24vcmxzLXNlcnZpY2VzK3htbFxcdFxcdFxcdHJzXFxuYXBwbGljYXRpb24vcnBraS1naG9zdGJ1c3RlcnNcXHRcXHRcXHRnYnJcXG5hcHBsaWNhdGlvbi9ycGtpLW1hbmlmZXN0XFx0XFx0XFx0bWZ0XFxuYXBwbGljYXRpb24vcnBraS1yb2FcXHRcXHRcXHRcXHRyb2FcXG5hcHBsaWNhdGlvbi9yc2QreG1sXFx0XFx0XFx0XFx0cnNkXFxuYXBwbGljYXRpb24vcnNzK3htbFxcdFxcdFxcdFxcdHJzc1xcbmFwcGxpY2F0aW9uL3J0ZlxcdFxcdFxcdFxcdFxcdHJ0ZlxcbmFwcGxpY2F0aW9uL3NibWwreG1sXFx0XFx0XFx0XFx0c2JtbFxcbmFwcGxpY2F0aW9uL3NjdnAtY3YtcmVxdWVzdFxcdFxcdFxcdHNjcVxcbmFwcGxpY2F0aW9uL3NjdnAtY3YtcmVzcG9uc2VcXHRcXHRcXHRzY3NcXG5hcHBsaWNhdGlvbi9zY3ZwLXZwLXJlcXVlc3RcXHRcXHRcXHRzcHFcXG5hcHBsaWNhdGlvbi9zY3ZwLXZwLXJlc3BvbnNlXFx0XFx0XFx0c3BwXFxuYXBwbGljYXRpb24vc2RwXFx0XFx0XFx0XFx0XFx0c2RwXFxuYXBwbGljYXRpb24vc2V0LXBheW1lbnQtaW5pdGlhdGlvblxcdFxcdHNldHBheVxcbmFwcGxpY2F0aW9uL3NldC1yZWdpc3RyYXRpb24taW5pdGlhdGlvblxcdFxcdHNldHJlZ1xcbmFwcGxpY2F0aW9uL3NoZit4bWxcXHRcXHRcXHRcXHRzaGZcXG5hcHBsaWNhdGlvbi9zbWlsK3htbFxcdFxcdFxcdFxcdHNtaSBzbWlsXFxuYXBwbGljYXRpb24vc3BhcnFsLXF1ZXJ5XFx0XFx0XFx0cnFcXG5hcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cyt4bWxcXHRcXHRcXHRzcnhcXG5hcHBsaWNhdGlvbi9zcmdzXFx0XFx0XFx0XFx0Z3JhbVxcbmFwcGxpY2F0aW9uL3NyZ3MreG1sXFx0XFx0XFx0XFx0Z3J4bWxcXG5hcHBsaWNhdGlvbi9zcnUreG1sXFx0XFx0XFx0XFx0c3J1XFxuYXBwbGljYXRpb24vc3NkbCt4bWxcXHRcXHRcXHRcXHRzc2RsXFxuYXBwbGljYXRpb24vc3NtbCt4bWxcXHRcXHRcXHRcXHRzc21sXFxuYXBwbGljYXRpb24vdGVpK3htbFxcdFxcdFxcdFxcdHRlaSB0ZWljb3JwdXNcXG5hcHBsaWNhdGlvbi90aHJhdWQreG1sXFx0XFx0XFx0XFx0dGZpXFxuYXBwbGljYXRpb24vdGltZXN0YW1wZWQtZGF0YVxcdFxcdFxcdHRzZFxcbmFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy1sYXJnZVxcdFxcdHBsYlxcbmFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy1zbWFsbFxcdFxcdHBzYlxcbmFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy12YXJcXHRcXHRcXHRwdmJcXG5hcHBsaWNhdGlvbi92bmQuM2dwcDIudGNhcFxcdFxcdFxcdHRjYXBcXG5hcHBsaWNhdGlvbi92bmQuM20ucG9zdC1pdC1ub3Rlc1xcdFxcdHB3blxcbmFwcGxpY2F0aW9uL3ZuZC5hY2NwYWMuc2ltcGx5LmFzb1xcdFxcdGFzb1xcbmFwcGxpY2F0aW9uL3ZuZC5hY2NwYWMuc2ltcGx5LmltcFxcdFxcdGltcFxcbmFwcGxpY2F0aW9uL3ZuZC5hY3Vjb2JvbFxcdFxcdFxcdGFjdVxcbmFwcGxpY2F0aW9uL3ZuZC5hY3Vjb3JwXFx0XFx0XFx0XFx0YXRjIGFjdXRjXFxuYXBwbGljYXRpb24vdm5kLmFkb2JlLmFpci1hcHBsaWNhdGlvbi1pbnN0YWxsZXItcGFja2FnZSt6aXBcXHRhaXJcXG5hcHBsaWNhdGlvbi92bmQuYWRvYmUuZm9ybXNjZW50cmFsLmZjZHRcXHRcXHRmY2R0XFxuYXBwbGljYXRpb24vdm5kLmFkb2JlLmZ4cFxcdFxcdFxcdGZ4cCBmeHBsXFxuYXBwbGljYXRpb24vdm5kLmFkb2JlLnhkcCt4bWxcXHRcXHRcXHR4ZHBcXG5hcHBsaWNhdGlvbi92bmQuYWRvYmUueGZkZlxcdFxcdFxcdHhmZGZcXG5hcHBsaWNhdGlvbi92bmQuYWhlYWQuc3BhY2VcXHRcXHRcXHRhaGVhZFxcbmFwcGxpY2F0aW9uL3ZuZC5haXJ6aXAuZmlsZXNlY3VyZS5hemZcXHRcXHRhemZcXG5hcHBsaWNhdGlvbi92bmQuYWlyemlwLmZpbGVzZWN1cmUuYXpzXFx0XFx0YXpzXFxuYXBwbGljYXRpb24vdm5kLmFtYXpvbi5lYm9va1xcdFxcdFxcdGF6d1xcbmFwcGxpY2F0aW9uL3ZuZC5hbWVyaWNhbmR5bmFtaWNzLmFjY1xcdFxcdGFjY1xcbmFwcGxpY2F0aW9uL3ZuZC5hbWlnYS5hbWlcXHRcXHRcXHRhbWlcXG5hcHBsaWNhdGlvbi92bmQuYW5kcm9pZC5wYWNrYWdlLWFyY2hpdmVcXHRcXHRhcGtcXG5hcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWNlcnRpZmljYXRlLWlzc3VlLWluaXRpYXRpb25cXHRjaWlcXG5hcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWZ1bmRzLXRyYW5zZmVyLWluaXRpYXRpb25cXHRmdGlcXG5hcHBsaWNhdGlvbi92bmQuYW50aXguZ2FtZS1jb21wb25lbnRcXHRcXHRhdHhcXG5hcHBsaWNhdGlvbi92bmQuYXBwbGUuaW5zdGFsbGVyK3htbFxcdFxcdG1wa2dcXG5hcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybFxcdFxcdFxcdG0zdThcXG5hcHBsaWNhdGlvbi92bmQuYXJpc3RhbmV0d29ya3Muc3dpXFx0XFx0c3dpXFxuYXBwbGljYXRpb24vdm5kLmFzdHJhZWEtc29mdHdhcmUuaW90YVxcdFxcdGlvdGFcXG5hcHBsaWNhdGlvbi92bmQuYXVkaW9ncmFwaFxcdFxcdFxcdGFlcFxcbmFwcGxpY2F0aW9uL3ZuZC5ibHVlaWNlLm11bHRpcGFzc1xcdFxcdG1wbVxcbmFwcGxpY2F0aW9uL3ZuZC5ibWlcXHRcXHRcXHRcXHRibWlcXG5hcHBsaWNhdGlvbi92bmQuYnVzaW5lc3NvYmplY3RzXFx0XFx0XFx0cmVwXFxuYXBwbGljYXRpb24vdm5kLmNoZW1kcmF3K3htbFxcdFxcdFxcdGNkeG1sXFxuYXBwbGljYXRpb24vdm5kLmNoaXBudXRzLmthcmFva2UtbW1kXFx0XFx0bW1kXFxuYXBwbGljYXRpb24vdm5kLmNpbmRlcmVsbGFcXHRcXHRcXHRjZHlcXG5hcHBsaWNhdGlvbi92bmQuY2xheW1vcmVcXHRcXHRcXHRjbGFcXG5hcHBsaWNhdGlvbi92bmQuY2xvYW50by5ycDlcXHRcXHRcXHRycDlcXG5hcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFxcdFxcdFxcdGM0ZyBjNGQgYzRmIGM0cCBjNHVcXG5hcHBsaWNhdGlvbi92bmQuY2x1ZXRydXN0LmNhcnRvbW9iaWxlLWNvbmZpZ1xcdFxcdGMxMWFtY1xcbmFwcGxpY2F0aW9uL3ZuZC5jbHVldHJ1c3QuY2FydG9tb2JpbGUtY29uZmlnLXBrZ1xcdGMxMWFtelxcbmFwcGxpY2F0aW9uL3ZuZC5jb21tb25zcGFjZVxcdFxcdFxcdGNzcFxcbmFwcGxpY2F0aW9uL3ZuZC5jb250YWN0LmNtc2dcXHRcXHRcXHRjZGJjbXNnXFxuYXBwbGljYXRpb24vdm5kLmNvc21vY2FsbGVyXFx0XFx0XFx0Y21jXFxuYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXJcXHRcXHRcXHRjbGt4XFxuYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIua2V5Ym9hcmRcXHRcXHRjbGtrXFxuYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIucGFsZXR0ZVxcdFxcdGNsa3BcXG5hcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci50ZW1wbGF0ZVxcdFxcdGNsa3RcXG5hcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci53b3JkYmFua1xcdFxcdGNsa3dcXG5hcHBsaWNhdGlvbi92bmQuY3JpdGljYWx0b29scy53YnMreG1sXFx0XFx0d2JzXFxuYXBwbGljYXRpb24vdm5kLmN0Yy1wb3NtbFxcdFxcdFxcdHBtbFxcbmFwcGxpY2F0aW9uL3ZuZC5jdXBzLXBwZFxcdFxcdFxcdHBwZFxcbmFwcGxpY2F0aW9uL3ZuZC5jdXJsLmNhclxcdFxcdFxcdGNhclxcbmFwcGxpY2F0aW9uL3ZuZC5jdXJsLnBjdXJsXFx0XFx0XFx0cGN1cmxcXG5hcHBsaWNhdGlvbi92bmQuZGFydFxcdFxcdFxcdFxcdGRhcnRcXG5hcHBsaWNhdGlvbi92bmQuZGF0YS12aXNpb24ucmR6XFx0XFx0XFx0cmR6XFxuYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVxcdFxcdFxcdHV2ZiB1dnZmIHV2ZCB1dnZkXFxuYXBwbGljYXRpb24vdm5kLmRlY2UudHRtbCt4bWxcXHRcXHRcXHR1dnQgdXZ2dFxcbmFwcGxpY2F0aW9uL3ZuZC5kZWNlLnVuc3BlY2lmaWVkXFx0XFx0dXZ4IHV2dnhcXG5hcHBsaWNhdGlvbi92bmQuZGVjZS56aXBcXHRcXHRcXHR1dnogdXZ2elxcbmFwcGxpY2F0aW9uL3ZuZC5kZW5vdm8uZmNzZWxheW91dC1saW5rXFx0XFx0ZmVfbGF1bmNoXFxuYXBwbGljYXRpb24vdm5kLmRuYVxcdFxcdFxcdFxcdGRuYVxcbmFwcGxpY2F0aW9uL3ZuZC5kb2xieS5tbHBcXHRcXHRcXHRtbHBcXG5hcHBsaWNhdGlvbi92bmQuZHBncmFwaFxcdFxcdFxcdFxcdGRwZ1xcbmFwcGxpY2F0aW9uL3ZuZC5kcmVhbWZhY3RvcnlcXHRcXHRcXHRkZmFjXFxuYXBwbGljYXRpb24vdm5kLmRzLWtleXBvaW50XFx0XFx0XFx0a3B4eFxcbmFwcGxpY2F0aW9uL3ZuZC5kdmIuYWl0XFx0XFx0XFx0XFx0YWl0XFxuYXBwbGljYXRpb24vdm5kLmR2Yi5zZXJ2aWNlXFx0XFx0XFx0c3ZjXFxuYXBwbGljYXRpb24vdm5kLmR5bmFnZW9cXHRcXHRcXHRcXHRnZW9cXG5hcHBsaWNhdGlvbi92bmQuZWNvd2luLmNoYXJ0XFx0XFx0XFx0bWFnXFxuYXBwbGljYXRpb24vdm5kLmVubGl2ZW5cXHRcXHRcXHRcXHRubWxcXG5hcHBsaWNhdGlvbi92bmQuZXBzb24uZXNmXFx0XFx0XFx0ZXNmXFxuYXBwbGljYXRpb24vdm5kLmVwc29uLm1zZlxcdFxcdFxcdG1zZlxcbmFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5xdWlja2FuaW1lXFx0XFx0cWFtXFxuYXBwbGljYXRpb24vdm5kLmVwc29uLnNhbHRcXHRcXHRcXHRzbHRcXG5hcHBsaWNhdGlvbi92bmQuZXBzb24uc3NmXFx0XFx0XFx0c3NmXFxuYXBwbGljYXRpb24vdm5kLmVzemlnbm8zK3htbFxcdFxcdFxcdGVzMyBldDNcXG5hcHBsaWNhdGlvbi92bmQuZXpwaXgtYWxidW1cXHRcXHRcXHRlejJcXG5hcHBsaWNhdGlvbi92bmQuZXpwaXgtcGFja2FnZVxcdFxcdFxcdGV6M1xcbmFwcGxpY2F0aW9uL3ZuZC5mZGZcXHRcXHRcXHRcXHRmZGZcXG5hcHBsaWNhdGlvbi92bmQuZmRzbi5tc2VlZFxcdFxcdFxcdG1zZWVkXFxuYXBwbGljYXRpb24vdm5kLmZkc24uc2VlZFxcdFxcdFxcdHNlZWQgZGF0YWxlc3NcXG5hcHBsaWNhdGlvbi92bmQuZmxvZ3JhcGhpdFxcdFxcdFxcdGdwaFxcbmFwcGxpY2F0aW9uL3ZuZC5mbHV4dGltZS5jbGlwXFx0XFx0XFx0ZnRjXFxuYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcXHRcXHRcXHRmbSBmcmFtZSBtYWtlciBib29rXFxuYXBwbGljYXRpb24vdm5kLmZyb2dhbnMuZm5jXFx0XFx0XFx0Zm5jXFxuYXBwbGljYXRpb24vdm5kLmZyb2dhbnMubHRmXFx0XFx0XFx0bHRmXFxuYXBwbGljYXRpb24vdm5kLmZzYy53ZWJsYXVuY2hcXHRcXHRcXHRmc2NcXG5hcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c1xcdFxcdFxcdG9hc1xcbmFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzMlxcdFxcdFxcdG9hMlxcbmFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzM1xcdFxcdFxcdG9hM1xcbmFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzZ3BcXHRcXHRcXHRmZzVcXG5hcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c3Byc1xcdFxcdGJoMlxcbmFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZGRkXFx0XFx0XFx0ZGRkXFxuYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kb2N1d29ya3NcXHRcXHR4ZHdcXG5hcHBsaWNhdGlvbi92bmQuZnVqaXhlcm94LmRvY3V3b3Jrcy5iaW5kZXJcXHR4YmRcXG5hcHBsaWNhdGlvbi92bmQuZnV6enlzaGVldFxcdFxcdFxcdGZ6c1xcbmFwcGxpY2F0aW9uL3ZuZC5nZW5vbWF0aXgudHV4ZWRvXFx0XFx0dHhkXFxuYXBwbGljYXRpb24vdm5kLmdlb2dlYnJhLmZpbGVcXHRcXHRcXHRnZ2JcXG5hcHBsaWNhdGlvbi92bmQuZ2VvZ2VicmEudG9vbFxcdFxcdFxcdGdndFxcbmFwcGxpY2F0aW9uL3ZuZC5nZW9tZXRyeS1leHBsb3JlclxcdFxcdGdleCBncmVcXG5hcHBsaWNhdGlvbi92bmQuZ2VvbmV4dFxcdFxcdFxcdFxcdGd4dFxcbmFwcGxpY2F0aW9uL3ZuZC5nZW9wbGFuXFx0XFx0XFx0XFx0ZzJ3XFxuYXBwbGljYXRpb24vdm5kLmdlb3NwYWNlXFx0XFx0XFx0ZzN3XFxuYXBwbGljYXRpb24vdm5kLmdteFxcdFxcdFxcdFxcdGdteFxcbmFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua21sK3htbFxcdFxcdGttbFxcbmFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua216XFx0XFx0a216XFxuYXBwbGljYXRpb24vdm5kLmdyYWZlcVxcdFxcdFxcdFxcdGdxZiBncXNcXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWFjY291bnRcXHRcXHRcXHRnYWNcXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWhlbHBcXHRcXHRcXHRnaGZcXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWlkZW50aXR5LW1lc3NhZ2VcXHRcXHRnaW1cXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWluamVjdG9yXFx0XFx0XFx0Z3J2XFxuYXBwbGljYXRpb24vdm5kLmdyb292ZS10b29sLW1lc3NhZ2VcXHRcXHRndG1cXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXRvb2wtdGVtcGxhdGVcXHRcXHR0cGxcXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXZjYXJkXFx0XFx0XFx0dmNnXFxuYXBwbGljYXRpb24vdm5kLmhhbCt4bWxcXHRcXHRcXHRcXHRoYWxcXG5hcHBsaWNhdGlvbi92bmQuaGFuZGhlbGQtZW50ZXJ0YWlubWVudCt4bWxcXHR6bW1cXG5hcHBsaWNhdGlvbi92bmQuaGJjaVxcdFxcdFxcdFxcdGhiY2lcXG5hcHBsaWNhdGlvbi92bmQuaGhlLmxlc3Nvbi1wbGF5ZXJcXHRcXHRsZXNcXG5hcHBsaWNhdGlvbi92bmQuaHAtaHBnbFxcdFxcdFxcdFxcdGhwZ2xcXG5hcHBsaWNhdGlvbi92bmQuaHAtaHBpZFxcdFxcdFxcdFxcdGhwaWRcXG5hcHBsaWNhdGlvbi92bmQuaHAtaHBzXFx0XFx0XFx0XFx0aHBzXFxuYXBwbGljYXRpb24vdm5kLmhwLWpseXRcXHRcXHRcXHRcXHRqbHRcXG5hcHBsaWNhdGlvbi92bmQuaHAtcGNsXFx0XFx0XFx0XFx0cGNsXFxuYXBwbGljYXRpb24vdm5kLmhwLXBjbHhsXFx0XFx0XFx0cGNseGxcXG5hcHBsaWNhdGlvbi92bmQuaHlkcm9zdGF0aXguc29mLWRhdGFcXHRcXHRzZmQtaGRzdHhcXG5hcHBsaWNhdGlvbi92bmQuaWJtLm1pbmlwYXlcXHRcXHRcXHRtcHlcXG5hcHBsaWNhdGlvbi92bmQuaWJtLm1vZGNhcFxcdFxcdFxcdGFmcCBsaXN0YWZwIGxpc3QzODIwXFxuYXBwbGljYXRpb24vdm5kLmlibS5yaWdodHMtbWFuYWdlbWVudFxcdFxcdGlybVxcbmFwcGxpY2F0aW9uL3ZuZC5pYm0uc2VjdXJlLWNvbnRhaW5lclxcdFxcdHNjXFxuYXBwbGljYXRpb24vdm5kLmljY3Byb2ZpbGVcXHRcXHRcXHRpY2MgaWNtXFxuYXBwbGljYXRpb24vdm5kLmlnbG9hZGVyXFx0XFx0XFx0aWdsXFxuYXBwbGljYXRpb24vdm5kLmltbWVydmlzaW9uLWl2cFxcdFxcdFxcdGl2cFxcbmFwcGxpY2F0aW9uL3ZuZC5pbW1lcnZpc2lvbi1pdnVcXHRcXHRcXHRpdnVcXG5hcHBsaWNhdGlvbi92bmQuaW5zb3JzLmlnbVxcdFxcdFxcdGlnbVxcbmFwcGxpY2F0aW9uL3ZuZC5pbnRlcmNvbi5mb3JtbmV0XFx0XFx0eHB3IHhweFxcbmFwcGxpY2F0aW9uL3ZuZC5pbnRlcmdlb1xcdFxcdFxcdGkyZ1xcbmFwcGxpY2F0aW9uL3ZuZC5pbnR1LnFib1xcdFxcdFxcdHFib1xcbmFwcGxpY2F0aW9uL3ZuZC5pbnR1LnFmeFxcdFxcdFxcdHFmeFxcbmFwcGxpY2F0aW9uL3ZuZC5pcHVucGx1Z2dlZC5yY3Byb2ZpbGVcXHRcXHRyY3Byb2ZpbGVcXG5hcHBsaWNhdGlvbi92bmQuaXJlcG9zaXRvcnkucGFja2FnZSt4bWxcXHRcXHRpcnBcXG5hcHBsaWNhdGlvbi92bmQuaXMteHByXFx0XFx0XFx0XFx0eHByXFxuYXBwbGljYXRpb24vdm5kLmlzYWMuZmNzXFx0XFx0XFx0ZmNzXFxuYXBwbGljYXRpb24vdm5kLmphbVxcdFxcdFxcdFxcdGphbVxcbmFwcGxpY2F0aW9uL3ZuZC5qY3AuamF2YW1lLm1pZGxldC1ybXNcXHRcXHRybXNcXG5hcHBsaWNhdGlvbi92bmQuamlzcFxcdFxcdFxcdFxcdGppc3BcXG5hcHBsaWNhdGlvbi92bmQuam9vc3Quam9kYS1hcmNoaXZlXFx0XFx0am9kYVxcbmFwcGxpY2F0aW9uL3ZuZC5rYWhvb3R6XFx0XFx0XFx0XFx0a3R6IGt0clxcbmFwcGxpY2F0aW9uL3ZuZC5rZGUua2FyYm9uXFx0XFx0XFx0a2FyYm9uXFxuYXBwbGljYXRpb24vdm5kLmtkZS5rY2hhcnRcXHRcXHRcXHRjaHJ0XFxuYXBwbGljYXRpb24vdm5kLmtkZS5rZm9ybXVsYVxcdFxcdFxcdGtmb1xcbmFwcGxpY2F0aW9uL3ZuZC5rZGUua2l2aW9cXHRcXHRcXHRmbHdcXG5hcHBsaWNhdGlvbi92bmQua2RlLmtvbnRvdXJcXHRcXHRcXHRrb25cXG5hcHBsaWNhdGlvbi92bmQua2RlLmtwcmVzZW50ZXJcXHRcXHRcXHRrcHIga3B0XFxuYXBwbGljYXRpb24vdm5kLmtkZS5rc3ByZWFkXFx0XFx0XFx0a3NwXFxuYXBwbGljYXRpb24vdm5kLmtkZS5rd29yZFxcdFxcdFxcdGt3ZCBrd3RcXG5hcHBsaWNhdGlvbi92bmQua2VuYW1lYWFwcFxcdFxcdFxcdGh0a2VcXG5hcHBsaWNhdGlvbi92bmQua2lkc3BpcmF0aW9uXFx0XFx0XFx0a2lhXFxuYXBwbGljYXRpb24vdm5kLmtpbmFyXFx0XFx0XFx0XFx0a25lIGtucFxcbmFwcGxpY2F0aW9uL3ZuZC5rb2FuXFx0XFx0XFx0XFx0c2twIHNrZCBza3Qgc2ttXFxuYXBwbGljYXRpb24vdm5kLmtvZGFrLWRlc2NyaXB0b3JcXHRcXHRzc2VcXG5hcHBsaWNhdGlvbi92bmQubGFzLmxhcyt4bWxcXHRcXHRcXHRsYXN4bWxcXG5hcHBsaWNhdGlvbi92bmQubGxhbWFncmFwaGljcy5saWZlLWJhbGFuY2UuZGVza3RvcFxcdGxiZFxcbmFwcGxpY2F0aW9uL3ZuZC5sbGFtYWdyYXBoaWNzLmxpZmUtYmFsYW5jZS5leGNoYW5nZSt4bWxcXHRsYmVcXG5hcHBsaWNhdGlvbi92bmQubG90dXMtMS0yLTNcXHRcXHRcXHQxMjNcXG5hcHBsaWNhdGlvbi92bmQubG90dXMtYXBwcm9hY2hcXHRcXHRcXHRhcHJcXG5hcHBsaWNhdGlvbi92bmQubG90dXMtZnJlZWxhbmNlXFx0XFx0XFx0cHJlXFxuYXBwbGljYXRpb24vdm5kLmxvdHVzLW5vdGVzXFx0XFx0XFx0bnNmXFxuYXBwbGljYXRpb24vdm5kLmxvdHVzLW9yZ2FuaXplclxcdFxcdFxcdG9yZ1xcbmFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1zY3JlZW5jYW1cXHRcXHRcXHRzY21cXG5hcHBsaWNhdGlvbi92bmQubG90dXMtd29yZHByb1xcdFxcdFxcdGx3cFxcbmFwcGxpY2F0aW9uL3ZuZC5tYWNwb3J0cy5wb3J0cGtnXFx0XFx0cG9ydHBrZ1xcbmFwcGxpY2F0aW9uL3ZuZC5tY2RcXHRcXHRcXHRcXHRtY2RcXG5hcHBsaWNhdGlvbi92bmQubWVkY2FsY2RhdGFcXHRcXHRcXHRtYzFcXG5hcHBsaWNhdGlvbi92bmQubWVkaWFzdGF0aW9uLmNka2V5XFx0XFx0Y2RrZXlcXG5hcHBsaWNhdGlvbi92bmQubWZlclxcdFxcdFxcdFxcdG13ZlxcbmFwcGxpY2F0aW9uL3ZuZC5tZm1wXFx0XFx0XFx0XFx0bWZtXFxuYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguZmxvXFx0XFx0XFx0ZmxvXFxuYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguaWd4XFx0XFx0XFx0aWd4XFxuYXBwbGljYXRpb24vdm5kLm1pZlxcdFxcdFxcdFxcdG1pZlxcbmFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMuZGFmXFx0XFx0XFx0ZGFmXFxuYXBwbGljYXRpb24vdm5kLm1vYml1cy5kaXNcXHRcXHRcXHRkaXNcXG5hcHBsaWNhdGlvbi92bmQubW9iaXVzLm1ia1xcdFxcdFxcdG1ia1xcbmFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubXF5XFx0XFx0XFx0bXF5XFxuYXBwbGljYXRpb24vdm5kLm1vYml1cy5tc2xcXHRcXHRcXHRtc2xcXG5hcHBsaWNhdGlvbi92bmQubW9iaXVzLnBsY1xcdFxcdFxcdHBsY1xcbmFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMudHhmXFx0XFx0XFx0dHhmXFxuYXBwbGljYXRpb24vdm5kLm1vcGh1bi5hcHBsaWNhdGlvblxcdFxcdG1wblxcbmFwcGxpY2F0aW9uL3ZuZC5tb3BodW4uY2VydGlmaWNhdGVcXHRcXHRtcGNcXG5hcHBsaWNhdGlvbi92bmQubW96aWxsYS54dWwreG1sXFx0XFx0XFx0eHVsXFxuYXBwbGljYXRpb24vdm5kLm1zLWFydGdhbHJ5XFx0XFx0XFx0Y2lsXFxuYXBwbGljYXRpb24vdm5kLm1zLWNhYi1jb21wcmVzc2VkXFx0XFx0Y2FiXFxuYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXFx0XFx0XFx0eGxzIHhsbSB4bGEgeGxjIHhsdCB4bHdcXG5hcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuYWRkaW4ubWFjcm9lbmFibGVkLjEyXFx0XFx0eGxhbVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5iaW5hcnkubWFjcm9lbmFibGVkLjEyXFx0eGxzYlxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5tYWNyb2VuYWJsZWQuMTJcXHRcXHR4bHNtXFxuYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlxcdHhsdG1cXG5hcHBsaWNhdGlvbi92bmQubXMtZm9udG9iamVjdFxcdFxcdFxcdGVvdFxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1odG1saGVscFxcdFxcdFxcdGNobVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1pbXNcXHRcXHRcXHRcXHRpbXNcXG5hcHBsaWNhdGlvbi92bmQubXMtbHJtXFx0XFx0XFx0XFx0bHJtXFxuYXBwbGljYXRpb24vdm5kLm1zLW9mZmljZXRoZW1lXFx0XFx0XFx0dGhteFxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1wa2kuc2VjY2F0XFx0XFx0XFx0Y2F0XFxuYXBwbGljYXRpb24vdm5kLm1zLXBraS5zdGxcXHRcXHRcXHRzdGxcXG5hcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludFxcdFxcdFxcdHBwdCBwcHMgcG90XFxuYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuYWRkaW4ubWFjcm9lbmFibGVkLjEyXFx0XFx0cHBhbVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnByZXNlbnRhdGlvbi5tYWNyb2VuYWJsZWQuMTJcXHRwcHRtXFxuYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuc2xpZGUubWFjcm9lbmFibGVkLjEyXFx0XFx0c2xkbVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnNsaWRlc2hvdy5tYWNyb2VuYWJsZWQuMTJcXHRcXHRwcHNtXFxuYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyXFx0XFx0cG90bVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1wcm9qZWN0XFx0XFx0XFx0bXBwIG1wdFxcbmFwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLmRvY3VtZW50Lm1hY3JvZW5hYmxlZC4xMlxcdGRvY21cXG5hcHBsaWNhdGlvbi92bmQubXMtd29yZC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcXHRkb3RtXFxuYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXFx0XFx0XFx0d3BzIHdrcyB3Y20gd2RiXFxuYXBwbGljYXRpb24vdm5kLm1zLXdwbFxcdFxcdFxcdFxcdHdwbFxcbmFwcGxpY2F0aW9uL3ZuZC5tcy14cHNkb2N1bWVudFxcdFxcdFxcdHhwc1xcbmFwcGxpY2F0aW9uL3ZuZC5tc2VxXFx0XFx0XFx0XFx0bXNlcVxcbmFwcGxpY2F0aW9uL3ZuZC5tdXNpY2lhblxcdFxcdFxcdG11c1xcbmFwcGxpY2F0aW9uL3ZuZC5tdXZlZS5zdHlsZVxcdFxcdFxcdG1zdHlcXG5hcHBsaWNhdGlvbi92bmQubXluZmNcXHRcXHRcXHRcXHR0YWdsZXRcXG5hcHBsaWNhdGlvbi92bmQubmV1cm9sYW5ndWFnZS5ubHVcXHRcXHRubHVcXG5hcHBsaWNhdGlvbi92bmQubml0ZlxcdFxcdFxcdFxcdG50ZiBuaXRmXFxuYXBwbGljYXRpb24vdm5kLm5vYmxlbmV0LWRpcmVjdG9yeVxcdFxcdG5uZFxcbmFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC1zZWFsZXJcXHRcXHRcXHRubnNcXG5hcHBsaWNhdGlvbi92bmQubm9ibGVuZXQtd2ViXFx0XFx0XFx0bm53XFxuYXBwbGljYXRpb24vdm5kLm5va2lhLm4tZ2FnZS5kYXRhXFx0XFx0bmdkYXRcXG5hcHBsaWNhdGlvbi92bmQubm9raWEubi1nYWdlLnN5bWJpYW4uaW5zdGFsbFxcdG4tZ2FnZVxcbmFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5yYWRpby1wcmVzZXRcXHRcXHRycHN0XFxuYXBwbGljYXRpb24vdm5kLm5va2lhLnJhZGlvLXByZXNldHNcXHRcXHRycHNzXFxuYXBwbGljYXRpb24vdm5kLm5vdmFkaWdtLmVkbVxcdFxcdFxcdGVkbVxcbmFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5lZHhcXHRcXHRcXHRlZHhcXG5hcHBsaWNhdGlvbi92bmQubm92YWRpZ20uZXh0XFx0XFx0XFx0ZXh0XFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5jaGFydFxcdFxcdG9kY1xcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuY2hhcnQtdGVtcGxhdGVcXHRvdGNcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmRhdGFiYXNlXFx0XFx0b2RiXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5mb3JtdWxhXFx0XFx0b2RmXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5mb3JtdWxhLXRlbXBsYXRlXFx0b2RmdFxcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3NcXHRcXHRvZGdcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmdyYXBoaWNzLXRlbXBsYXRlXFx0b3RnXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5pbWFnZVxcdFxcdG9kaVxcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuaW1hZ2UtdGVtcGxhdGVcXHRvdGlcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvblxcdFxcdG9kcFxcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uLXRlbXBsYXRlXFx0b3RwXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldFxcdFxcdG9kc1xcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXQtdGVtcGxhdGVcXHRvdHNcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHRcXHRcXHRcXHRvZHRcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtbWFzdGVyXFx0XFx0b2RtXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXRlbXBsYXRlXFx0b3R0XFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXdlYlxcdFxcdG90aFxcbmFwcGxpY2F0aW9uL3ZuZC5vbHBjLXN1Z2FyXFx0XFx0XFx0eG9cXG5hcHBsaWNhdGlvbi92bmQub21hLmRkMit4bWxcXHRcXHRcXHRkZDJcXG5hcHBsaWNhdGlvbi92bmQub3Blbm9mZmljZW9yZy5leHRlbnNpb25cXHRcXHRveHRcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwucHJlc2VudGF0aW9uXFx0cHB0eFxcbmFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5zbGlkZVxcdHNsZHhcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwuc2xpZGVzaG93XFx0cHBzeFxcbmFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC50ZW1wbGF0ZVxcdHBvdHhcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldFxcdHhsc3hcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC50ZW1wbGF0ZVxcdHhsdHhcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudFxcdGRvY3hcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC50ZW1wbGF0ZVxcdGRvdHhcXG5hcHBsaWNhdGlvbi92bmQub3NnZW8ubWFwZ3VpZGUucGFja2FnZVxcdFxcdG1ncFxcbmFwcGxpY2F0aW9uL3ZuZC5vc2dpLmRwXFx0XFx0XFx0XFx0ZHBcXG5hcHBsaWNhdGlvbi92bmQub3NnaS5zdWJzeXN0ZW1cXHRcXHRcXHRlc2FcXG5hcHBsaWNhdGlvbi92bmQucGFsbVxcdFxcdFxcdFxcdHBkYiBwcWEgb3ByY1xcbmFwcGxpY2F0aW9uL3ZuZC5wYXdhYWZpbGVcXHRcXHRcXHRwYXdcXG5hcHBsaWNhdGlvbi92bmQucGcuZm9ybWF0XFx0XFx0XFx0c3RyXFxuYXBwbGljYXRpb24vdm5kLnBnLm9zYXNsaVxcdFxcdFxcdGVpNlxcbmFwcGxpY2F0aW9uL3ZuZC5waWNzZWxcXHRcXHRcXHRcXHRlZmlmXFxuYXBwbGljYXRpb24vdm5kLnBtaS53aWRnZXRcXHRcXHRcXHR3Z1xcbmFwcGxpY2F0aW9uL3ZuZC5wb2NrZXRsZWFyblxcdFxcdFxcdHBsZlxcbmFwcGxpY2F0aW9uL3ZuZC5wb3dlcmJ1aWxkZXI2XFx0XFx0XFx0cGJkXFxuYXBwbGljYXRpb24vdm5kLnByZXZpZXdzeXN0ZW1zLmJveFxcdFxcdGJveFxcbmFwcGxpY2F0aW9uL3ZuZC5wcm90ZXVzLm1hZ2F6aW5lXFx0XFx0bWd6XFxuYXBwbGljYXRpb24vdm5kLnB1Ymxpc2hhcmUtZGVsdGEtdHJlZVxcdFxcdHFwc1xcbmFwcGxpY2F0aW9uL3ZuZC5wdmkucHRpZDFcXHRcXHRcXHRwdGlkXFxuYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXFx0XFx0cXhkIHF4dCBxd2QgcXd0IHF4bCBxeGJcXG5hcHBsaWNhdGlvbi92bmQucmVhbHZuYy5iZWRcXHRcXHRcXHRiZWRcXG5hcHBsaWNhdGlvbi92bmQucmVjb3JkYXJlLm11c2ljeG1sXFx0XFx0bXhsXFxuYXBwbGljYXRpb24vdm5kLnJlY29yZGFyZS5tdXNpY3htbCt4bWxcXHRcXHRtdXNpY3htbFxcbmFwcGxpY2F0aW9uL3ZuZC5yaWcuY3J5cHRvbm90ZVxcdFxcdFxcdGNyeXB0b25vdGVcXG5hcHBsaWNhdGlvbi92bmQucmltLmNvZFxcdFxcdFxcdFxcdGNvZFxcbmFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWFcXHRcXHRcXHRybVxcbmFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWEtdmJyXFx0XFx0cm12YlxcbmFwcGxpY2F0aW9uL3ZuZC5yb3V0ZTY2Lmxpbms2Nit4bWxcXHRcXHRsaW5rNjZcXG5hcHBsaWNhdGlvbi92bmQuc2FpbGluZ3RyYWNrZXIudHJhY2tcXHRcXHRzdFxcbmFwcGxpY2F0aW9uL3ZuZC5zZWVtYWlsXFx0XFx0XFx0XFx0c2VlXFxuYXBwbGljYXRpb24vdm5kLnNlbWFcXHRcXHRcXHRcXHRzZW1hXFxuYXBwbGljYXRpb24vdm5kLnNlbWRcXHRcXHRcXHRcXHRzZW1kXFxuYXBwbGljYXRpb24vdm5kLnNlbWZcXHRcXHRcXHRcXHRzZW1mXFxuYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmZvcm1kYXRhXFx0XFx0aWZtXFxuYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmZvcm10ZW1wbGF0ZVxcdGl0cFxcbmFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5pbnRlcmNoYW5nZVxcdGlpZlxcbmFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5wYWNrYWdlXFx0XFx0aXBrXFxuYXBwbGljYXRpb24vdm5kLnNpbXRlY2gtbWluZG1hcHBlclxcdFxcdHR3ZCB0d2RzXFxuYXBwbGljYXRpb24vdm5kLnNtYWZcXHRcXHRcXHRcXHRtbWZcXG5hcHBsaWNhdGlvbi92bmQuc21hcnQudGVhY2hlclxcdFxcdFxcdHRlYWNoZXJcXG5hcHBsaWNhdGlvbi92bmQuc29sZW50LnNka20reG1sXFx0XFx0XFx0c2RrbSBzZGtkXFxuYXBwbGljYXRpb24vdm5kLnNwb3RmaXJlLmR4cFxcdFxcdFxcdGR4cFxcbmFwcGxpY2F0aW9uL3ZuZC5zcG90ZmlyZS5zZnNcXHRcXHRcXHRzZnNcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmNhbGNcXHRcXHRzZGNcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmRyYXdcXHRcXHRzZGFcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmltcHJlc3NcXHRcXHRzZGRcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLm1hdGhcXHRcXHRzbWZcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlclxcdFxcdHNkdyB2b3JcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlci1nbG9iYWxcXHRzZ2xcXG5hcHBsaWNhdGlvbi92bmQuc3RlcG1hbmlhLnBhY2thZ2VcXHRcXHRzbXppcFxcbmFwcGxpY2F0aW9uL3ZuZC5zdGVwbWFuaWEuc3RlcGNoYXJ0XFx0XFx0c21cXG5hcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5jYWxjXFx0XFx0XFx0c3hjXFxuYXBwbGljYXRpb24vdm5kLnN1bi54bWwuY2FsYy50ZW1wbGF0ZVxcdFxcdHN0Y1xcbmFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmRyYXdcXHRcXHRcXHRzeGRcXG5hcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5kcmF3LnRlbXBsYXRlXFx0XFx0c3RkXFxuYXBwbGljYXRpb24vdm5kLnN1bi54bWwuaW1wcmVzc1xcdFxcdFxcdHN4aVxcbmFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmltcHJlc3MudGVtcGxhdGVcXHRzdGlcXG5hcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5tYXRoXFx0XFx0XFx0c3htXFxuYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyXFx0XFx0XFx0c3h3XFxuYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyLmdsb2JhbFxcdFxcdHN4Z1xcbmFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLndyaXRlci50ZW1wbGF0ZVxcdFxcdHN0d1xcbmFwcGxpY2F0aW9uL3ZuZC5zdXMtY2FsZW5kYXJcXHRcXHRcXHRzdXMgc3VzcFxcbmFwcGxpY2F0aW9uL3ZuZC5zdmRcXHRcXHRcXHRcXHRzdmRcXG5hcHBsaWNhdGlvbi92bmQuc3ltYmlhbi5pbnN0YWxsXFx0XFx0XFx0c2lzIHNpc3hcXG5hcHBsaWNhdGlvbi92bmQuc3luY21sK3htbFxcdFxcdFxcdHhzbVxcbmFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwuZG0rd2J4bWxcXHRcXHRcXHRiZG1cXG5hcHBsaWNhdGlvbi92bmQuc3luY21sLmRtK3htbFxcdFxcdFxcdHhkbVxcbmFwcGxpY2F0aW9uL3ZuZC50YW8uaW50ZW50LW1vZHVsZS1hcmNoaXZlXFx0dGFvXFxuYXBwbGljYXRpb24vdm5kLnRjcGR1bXAucGNhcFxcdFxcdFxcdHBjYXAgY2FwIGRtcFxcbmFwcGxpY2F0aW9uL3ZuZC50bW9iaWxlLWxpdmV0dlxcdFxcdFxcdHRtb1xcbmFwcGxpY2F0aW9uL3ZuZC50cmlkLnRwdFxcdFxcdFxcdHRwdFxcbmFwcGxpY2F0aW9uL3ZuZC50cmlzY2FwZS5teHNcXHRcXHRcXHRteHNcXG5hcHBsaWNhdGlvbi92bmQudHJ1ZWFwcFxcdFxcdFxcdFxcdHRyYVxcbmFwcGxpY2F0aW9uL3ZuZC51ZmRsXFx0XFx0XFx0XFx0dWZkIHVmZGxcXG5hcHBsaWNhdGlvbi92bmQudWlxLnRoZW1lXFx0XFx0XFx0dXR6XFxuYXBwbGljYXRpb24vdm5kLnVtYWppblxcdFxcdFxcdFxcdHVtalxcbmFwcGxpY2F0aW9uL3ZuZC51bml0eVxcdFxcdFxcdFxcdHVuaXR5d2ViXFxuYXBwbGljYXRpb24vdm5kLnVvbWwreG1sXFx0XFx0XFx0dW9tbFxcbmFwcGxpY2F0aW9uL3ZuZC52Y3hcXHRcXHRcXHRcXHR2Y3hcXG5hcHBsaWNhdGlvbi92bmQudmlzaW9cXHRcXHRcXHRcXHR2c2QgdnN0IHZzcyB2c3dcXG5hcHBsaWNhdGlvbi92bmQudmlzaW9uYXJ5XFx0XFx0XFx0dmlzXFxuYXBwbGljYXRpb24vdm5kLnZzZlxcdFxcdFxcdFxcdHZzZlxcbmFwcGxpY2F0aW9uL3ZuZC53YXAud2J4bWxcXHRcXHRcXHR3YnhtbFxcbmFwcGxpY2F0aW9uL3ZuZC53YXAud21sY1xcdFxcdFxcdHdtbGNcXG5hcHBsaWNhdGlvbi92bmQud2FwLndtbHNjcmlwdGNcXHRcXHRcXHR3bWxzY1xcbmFwcGxpY2F0aW9uL3ZuZC53ZWJ0dXJib1xcdFxcdFxcdHd0YlxcbmFwcGxpY2F0aW9uL3ZuZC53b2xmcmFtLnBsYXllclxcdFxcdFxcdG5icFxcbmFwcGxpY2F0aW9uL3ZuZC53b3JkcGVyZmVjdFxcdFxcdFxcdHdwZFxcbmFwcGxpY2F0aW9uL3ZuZC53cWRcXHRcXHRcXHRcXHR3cWRcXG5hcHBsaWNhdGlvbi92bmQud3Quc3RmXFx0XFx0XFx0XFx0c3RmXFxuYXBwbGljYXRpb24vdm5kLnhhcmFcXHRcXHRcXHRcXHR4YXJcXG5hcHBsaWNhdGlvbi92bmQueGZkbFxcdFxcdFxcdFxcdHhmZGxcXG5hcHBsaWNhdGlvbi92bmQueWFtYWhhLmh2LWRpY1xcdFxcdFxcdGh2ZFxcbmFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtc2NyaXB0XFx0XFx0aHZzXFxuYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi12b2ljZVxcdFxcdFxcdGh2cFxcbmFwcGxpY2F0aW9uL3ZuZC55YW1haGEub3BlbnNjb3JlZm9ybWF0XFx0XFx0XFx0b3NmXFxuYXBwbGljYXRpb24vdm5kLnlhbWFoYS5vcGVuc2NvcmVmb3JtYXQub3NmcHZnK3htbFxcdG9zZnB2Z1xcbmFwcGxpY2F0aW9uL3ZuZC55YW1haGEuc21hZi1hdWRpb1xcdFxcdHNhZlxcbmFwcGxpY2F0aW9uL3ZuZC55YW1haGEuc21hZi1waHJhc2VcXHRcXHRzcGZcXG5hcHBsaWNhdGlvbi92bmQueWVsbG93cml2ZXItY3VzdG9tLW1lbnVcXHRcXHRjbXBcXG5hcHBsaWNhdGlvbi92bmQuenVsXFx0XFx0XFx0XFx0emlyIHppcnpcXG5hcHBsaWNhdGlvbi92bmQuenphenouZGVjayt4bWxcXHRcXHRcXHR6YXpcXG5hcHBsaWNhdGlvbi92b2ljZXhtbCt4bWxcXHRcXHRcXHR2eG1sXFxuYXBwbGljYXRpb24vd2FzbVxcdFxcdFxcdFxcdHdhc21cXG5hcHBsaWNhdGlvbi93aWRnZXRcXHRcXHRcXHRcXHR3Z3RcXG5hcHBsaWNhdGlvbi93aW5obHBcXHRcXHRcXHRcXHRobHBcXG5hcHBsaWNhdGlvbi93c2RsK3htbFxcdFxcdFxcdFxcdHdzZGxcXG5hcHBsaWNhdGlvbi93c3BvbGljeSt4bWxcXHRcXHRcXHR3c3BvbGljeVxcbmFwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZFxcdFxcdFxcdDd6XFxuYXBwbGljYXRpb24veC1hYml3b3JkXFx0XFx0XFx0XFx0YWJ3XFxuYXBwbGljYXRpb24veC1hY2UtY29tcHJlc3NlZFxcdFxcdFxcdGFjZVxcbmFwcGxpY2F0aW9uL3gtYXBwbGUtZGlza2ltYWdlXFx0XFx0XFx0ZG1nXFxuYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblxcdFxcdFxcdGFhYiB4MzIgdTMyIHZveFxcbmFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1tYXBcXHRcXHRcXHRhYW1cXG5hcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtc2VnXFx0XFx0XFx0YWFzXFxuYXBwbGljYXRpb24veC1iY3Bpb1xcdFxcdFxcdFxcdGJjcGlvXFxuYXBwbGljYXRpb24veC1iaXR0b3JyZW50XFx0XFx0XFx0dG9ycmVudFxcbmFwcGxpY2F0aW9uL3gtYmxvcmJcXHRcXHRcXHRcXHRibGIgYmxvcmJcXG5hcHBsaWNhdGlvbi94LWJ6aXBcXHRcXHRcXHRcXHRielxcbmFwcGxpY2F0aW9uL3gtYnppcDJcXHRcXHRcXHRcXHRiejIgYm96XFxuYXBwbGljYXRpb24veC1jYnJcXHRcXHRcXHRcXHRjYnIgY2JhIGNidCBjYnogY2I3XFxuYXBwbGljYXRpb24veC1jZGxpbmtcXHRcXHRcXHRcXHR2Y2RcXG5hcHBsaWNhdGlvbi94LWNmcy1jb21wcmVzc2VkXFx0XFx0XFx0Y2ZzXFxuYXBwbGljYXRpb24veC1jaGF0XFx0XFx0XFx0XFx0Y2hhdFxcbmFwcGxpY2F0aW9uL3gtY2hlc3MtcGduXFx0XFx0XFx0XFx0cGduXFxuYXBwbGljYXRpb24veC1jb25mZXJlbmNlXFx0XFx0XFx0bnNjXFxuYXBwbGljYXRpb24veC1jcGlvXFx0XFx0XFx0XFx0Y3Bpb1xcbmFwcGxpY2F0aW9uL3gtY3NoXFx0XFx0XFx0XFx0Y3NoXFxuYXBwbGljYXRpb24veC1kZWJpYW4tcGFja2FnZVxcdFxcdFxcdGRlYiB1ZGViXFxuYXBwbGljYXRpb24veC1kZ2MtY29tcHJlc3NlZFxcdFxcdFxcdGRnY1xcbmFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcXHRcXHRcXHRkaXIgZGNyIGR4ciBjc3QgY2N0IGN4dCB3M2QgZmdkIHN3YVxcbmFwcGxpY2F0aW9uL3gtZG9vbVxcdFxcdFxcdFxcdHdhZFxcbmFwcGxpY2F0aW9uL3gtZHRibmN4K3htbFxcdFxcdFxcdG5jeFxcbmFwcGxpY2F0aW9uL3gtZHRib29rK3htbFxcdFxcdFxcdGR0YlxcbmFwcGxpY2F0aW9uL3gtZHRicmVzb3VyY2UreG1sXFx0XFx0XFx0cmVzXFxuYXBwbGljYXRpb24veC1kdmlcXHRcXHRcXHRcXHRkdmlcXG5hcHBsaWNhdGlvbi94LWVudm95XFx0XFx0XFx0XFx0ZXZ5XFxuYXBwbGljYXRpb24veC1ldmFcXHRcXHRcXHRcXHRldmFcXG5hcHBsaWNhdGlvbi94LWZvbnQtYmRmXFx0XFx0XFx0XFx0YmRmXFxuYXBwbGljYXRpb24veC1mb250LWdob3N0c2NyaXB0XFx0XFx0XFx0Z3NmXFxuYXBwbGljYXRpb24veC1mb250LWxpbnV4LXBzZlxcdFxcdFxcdHBzZlxcbmFwcGxpY2F0aW9uL3gtZm9udC1wY2ZcXHRcXHRcXHRcXHRwY2ZcXG5hcHBsaWNhdGlvbi94LWZvbnQtc25mXFx0XFx0XFx0XFx0c25mXFxuYXBwbGljYXRpb24veC1mb250LXR5cGUxXFx0XFx0XFx0cGZhIHBmYiBwZm0gYWZtXFxuYXBwbGljYXRpb24veC1mcmVlYXJjXFx0XFx0XFx0XFx0YXJjXFxuYXBwbGljYXRpb24veC1mdXR1cmVzcGxhc2hcXHRcXHRcXHRzcGxcXG5hcHBsaWNhdGlvbi94LWdjYS1jb21wcmVzc2VkXFx0XFx0XFx0Z2NhXFxuYXBwbGljYXRpb24veC1nbHVseFxcdFxcdFxcdFxcdHVseFxcbmFwcGxpY2F0aW9uL3gtZ251bWVyaWNcXHRcXHRcXHRcXHRnbnVtZXJpY1xcbmFwcGxpY2F0aW9uL3gtZ3JhbXBzLXhtbFxcdFxcdFxcdGdyYW1wc1xcbmFwcGxpY2F0aW9uL3gtZ3RhclxcdFxcdFxcdFxcdGd0YXJcXG5hcHBsaWNhdGlvbi94LWhkZlxcdFxcdFxcdFxcdGhkZlxcbmFwcGxpY2F0aW9uL3gtaW5zdGFsbC1pbnN0cnVjdGlvbnNcXHRcXHRpbnN0YWxsXFxuYXBwbGljYXRpb24veC1pc285NjYwLWltYWdlXFx0XFx0XFx0aXNvXFxuYXBwbGljYXRpb24veC1qYXZhLWpubHAtZmlsZVxcdFxcdFxcdGpubHBcXG5hcHBsaWNhdGlvbi94LWxhdGV4XFx0XFx0XFx0XFx0bGF0ZXhcXG5hcHBsaWNhdGlvbi94LWx6aC1jb21wcmVzc2VkXFx0XFx0XFx0bHpoIGxoYVxcbmFwcGxpY2F0aW9uL3gtbWllXFx0XFx0XFx0XFx0bWllXFxuYXBwbGljYXRpb24veC1tb2JpcG9ja2V0LWVib29rXFx0XFx0XFx0cHJjIG1vYmlcXG5hcHBsaWNhdGlvbi94LW1zLWFwcGxpY2F0aW9uXFx0XFx0XFx0YXBwbGljYXRpb25cXG5hcHBsaWNhdGlvbi94LW1zLXNob3J0Y3V0XFx0XFx0XFx0bG5rXFxuYXBwbGljYXRpb24veC1tcy13bWRcXHRcXHRcXHRcXHR3bWRcXG5hcHBsaWNhdGlvbi94LW1zLXdtelxcdFxcdFxcdFxcdHdtelxcbmFwcGxpY2F0aW9uL3gtbXMteGJhcFxcdFxcdFxcdFxcdHhiYXBcXG5hcHBsaWNhdGlvbi94LW1zYWNjZXNzXFx0XFx0XFx0XFx0bWRiXFxuYXBwbGljYXRpb24veC1tc2JpbmRlclxcdFxcdFxcdFxcdG9iZFxcbmFwcGxpY2F0aW9uL3gtbXNjYXJkZmlsZVxcdFxcdFxcdGNyZFxcbmFwcGxpY2F0aW9uL3gtbXNjbGlwXFx0XFx0XFx0XFx0Y2xwXFxuYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXFx0XFx0XFx0ZXhlIGRsbCBjb20gYmF0IG1zaVxcbmFwcGxpY2F0aW9uL3gtbXNtZWRpYXZpZXdcXHRcXHRcXHRtdmIgbTEzIG0xNFxcbmFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVxcdFxcdFxcdHdtZiB3bXogZW1mIGVtelxcbmFwcGxpY2F0aW9uL3gtbXNtb25leVxcdFxcdFxcdFxcdG1ueVxcbmFwcGxpY2F0aW9uL3gtbXNwdWJsaXNoZXJcXHRcXHRcXHRwdWJcXG5hcHBsaWNhdGlvbi94LW1zc2NoZWR1bGVcXHRcXHRcXHRzY2RcXG5hcHBsaWNhdGlvbi94LW1zdGVybWluYWxcXHRcXHRcXHR0cm1cXG5hcHBsaWNhdGlvbi94LW1zd3JpdGVcXHRcXHRcXHRcXHR3cmlcXG5hcHBsaWNhdGlvbi94LW5ldGNkZlxcdFxcdFxcdFxcdG5jIGNkZlxcbmFwcGxpY2F0aW9uL3gtbnpiXFx0XFx0XFx0XFx0bnpiXFxuYXBwbGljYXRpb24veC1wa2NzMTJcXHRcXHRcXHRcXHRwMTIgcGZ4XFxuYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0aWZpY2F0ZXNcXHRcXHRwN2Igc3BjXFxuYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0cmVxcmVzcFxcdFxcdFxcdHA3clxcbmFwcGxpY2F0aW9uL3gtcmFyLWNvbXByZXNzZWRcXHRcXHRcXHRyYXJcXG5hcHBsaWNhdGlvbi94LXJlc2VhcmNoLWluZm8tc3lzdGVtc1xcdFxcdHJpc1xcbmFwcGxpY2F0aW9uL3gtc2hcXHRcXHRcXHRcXHRzaFxcbmFwcGxpY2F0aW9uL3gtc2hhclxcdFxcdFxcdFxcdHNoYXJcXG5hcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFxcdFxcdFxcdHN3ZlxcbmFwcGxpY2F0aW9uL3gtc2lsdmVybGlnaHQtYXBwXFx0XFx0XFx0eGFwXFxuYXBwbGljYXRpb24veC1zcWxcXHRcXHRcXHRcXHRzcWxcXG5hcHBsaWNhdGlvbi94LXN0dWZmaXRcXHRcXHRcXHRcXHRzaXRcXG5hcHBsaWNhdGlvbi94LXN0dWZmaXR4XFx0XFx0XFx0XFx0c2l0eFxcbmFwcGxpY2F0aW9uL3gtc3VicmlwXFx0XFx0XFx0XFx0c3J0XFxuYXBwbGljYXRpb24veC1zdjRjcGlvXFx0XFx0XFx0XFx0c3Y0Y3Bpb1xcbmFwcGxpY2F0aW9uL3gtc3Y0Y3JjXFx0XFx0XFx0XFx0c3Y0Y3JjXFxuYXBwbGljYXRpb24veC10M3ZtLWltYWdlXFx0XFx0XFx0dDNcXG5hcHBsaWNhdGlvbi94LXRhZHNcXHRcXHRcXHRcXHRnYW1cXG5hcHBsaWNhdGlvbi94LXRhclxcdFxcdFxcdFxcdHRhclxcbmFwcGxpY2F0aW9uL3gtdGNsXFx0XFx0XFx0XFx0dGNsXFxuYXBwbGljYXRpb24veC10ZXhcXHRcXHRcXHRcXHR0ZXhcXG5hcHBsaWNhdGlvbi94LXRleC10Zm1cXHRcXHRcXHRcXHR0Zm1cXG5hcHBsaWNhdGlvbi94LXRleGluZm9cXHRcXHRcXHRcXHR0ZXhpbmZvIHRleGlcXG5hcHBsaWNhdGlvbi94LXRnaWZcXHRcXHRcXHRcXHRvYmpcXG5hcHBsaWNhdGlvbi94LXVzdGFyXFx0XFx0XFx0XFx0dXN0YXJcXG5hcHBsaWNhdGlvbi94LXdhaXMtc291cmNlXFx0XFx0XFx0c3JjXFxuYXBwbGljYXRpb24veC14NTA5LWNhLWNlcnRcXHRcXHRcXHRkZXIgY3J0XFxuYXBwbGljYXRpb24veC14ZmlnXFx0XFx0XFx0XFx0ZmlnXFxuYXBwbGljYXRpb24veC14bGlmZit4bWxcXHRcXHRcXHRcXHR4bGZcXG5hcHBsaWNhdGlvbi94LXhwaW5zdGFsbFxcdFxcdFxcdFxcdHhwaVxcbmFwcGxpY2F0aW9uL3gteHpcXHRcXHRcXHRcXHR4elxcbmFwcGxpY2F0aW9uL3gtem1hY2hpbmVcXHRcXHRcXHRcXHR6MSB6MiB6MyB6NCB6NSB6NiB6NyB6OFxcbmFwcGxpY2F0aW9uL3hhbWwreG1sXFx0XFx0XFx0XFx0eGFtbFxcbmFwcGxpY2F0aW9uL3hjYXAtZGlmZit4bWxcXHRcXHRcXHR4ZGZcXG5hcHBsaWNhdGlvbi94ZW5jK3htbFxcdFxcdFxcdFxcdHhlbmNcXG5hcHBsaWNhdGlvbi94aHRtbCt4bWxcXHRcXHRcXHRcXHR4aHRtbCB4aHRcXG5hcHBsaWNhdGlvbi94bWxcXHRcXHRcXHRcXHRcXHR4bWwgeHNsXFxuYXBwbGljYXRpb24veG1sLWR0ZFxcdFxcdFxcdFxcdGR0ZFxcbmFwcGxpY2F0aW9uL3hvcCt4bWxcXHRcXHRcXHRcXHR4b3BcXG5hcHBsaWNhdGlvbi94cHJvYyt4bWxcXHRcXHRcXHRcXHR4cGxcXG5hcHBsaWNhdGlvbi94c2x0K3htbFxcdFxcdFxcdFxcdHhzbHRcXG5hcHBsaWNhdGlvbi94c3BmK3htbFxcdFxcdFxcdFxcdHhzcGZcXG5hcHBsaWNhdGlvbi94dit4bWxcXHRcXHRcXHRcXHRteG1sIHhodm1sIHh2bWwgeHZtXFxuYXBwbGljYXRpb24veWFuZ1xcdFxcdFxcdFxcdHlhbmdcXG5hcHBsaWNhdGlvbi95aW4reG1sXFx0XFx0XFx0XFx0eWluXFxuYXBwbGljYXRpb24vemlwXFx0XFx0XFx0XFx0XFx0emlwXFxuYXVkaW8vYWRwY21cXHRcXHRcXHRcXHRcXHRhZHBcXG5hdWRpby9iYXNpY1xcdFxcdFxcdFxcdFxcdGF1IHNuZFxcbmF1ZGlvL21pZGlcXHRcXHRcXHRcXHRcXHRtaWQgbWlkaSBrYXIgcm1pXFxuYXVkaW8vbXA0XFx0XFx0XFx0XFx0XFx0bTRhIG1wNGFcXG5hdWRpby9tcGVnXFx0XFx0XFx0XFx0XFx0bXBnYSBtcDIgbXAyYSBtcDMgbTJhIG0zYVxcbmF1ZGlvL29nZ1xcdFxcdFxcdFxcdFxcdG9nYSBvZ2cgc3B4XFxuYXVkaW8vczNtXFx0XFx0XFx0XFx0XFx0czNtXFxuYXVkaW8vc2lsa1xcdFxcdFxcdFxcdFxcdHNpbFxcbmF1ZGlvL3ZuZC5kZWNlLmF1ZGlvXFx0XFx0XFx0XFx0dXZhIHV2dmFcXG5hdWRpby92bmQuZGlnaXRhbC13aW5kc1xcdFxcdFxcdFxcdGVvbFxcbmF1ZGlvL3ZuZC5kcmFcXHRcXHRcXHRcXHRcXHRkcmFcXG5hdWRpby92bmQuZHRzXFx0XFx0XFx0XFx0XFx0ZHRzXFxuYXVkaW8vdm5kLmR0cy5oZFxcdFxcdFxcdFxcdGR0c2hkXFxuYXVkaW8vdm5kLmx1Y2VudC52b2ljZVxcdFxcdFxcdFxcdGx2cFxcbmF1ZGlvL3ZuZC5tcy1wbGF5cmVhZHkubWVkaWEucHlhXFx0XFx0cHlhXFxuYXVkaW8vdm5kLm51ZXJhLmVjZWxwNDgwMFxcdFxcdFxcdGVjZWxwNDgwMFxcbmF1ZGlvL3ZuZC5udWVyYS5lY2VscDc0NzBcXHRcXHRcXHRlY2VscDc0NzBcXG5hdWRpby92bmQubnVlcmEuZWNlbHA5NjAwXFx0XFx0XFx0ZWNlbHA5NjAwXFxuYXVkaW8vdm5kLnJpcFxcdFxcdFxcdFxcdFxcdHJpcFxcbmF1ZGlvL3dlYm1cXHRcXHRcXHRcXHRcXHR3ZWJhXFxuYXVkaW8veC1hYWNcXHRcXHRcXHRcXHRcXHRhYWNcXG5hdWRpby94LWFpZmZcXHRcXHRcXHRcXHRcXHRhaWYgYWlmZiBhaWZjXFxuYXVkaW8veC1jYWZcXHRcXHRcXHRcXHRcXHRjYWZcXG5hdWRpby94LWZsYWNcXHRcXHRcXHRcXHRcXHRmbGFjXFxuYXVkaW8veC1tYXRyb3NrYVxcdFxcdFxcdFxcdG1rYVxcbmF1ZGlvL3gtbXBlZ3VybFxcdFxcdFxcdFxcdFxcdG0zdVxcbmF1ZGlvL3gtbXMtd2F4XFx0XFx0XFx0XFx0XFx0d2F4XFxuYXVkaW8veC1tcy13bWFcXHRcXHRcXHRcXHRcXHR3bWFcXG5hdWRpby94LXBuLXJlYWxhdWRpb1xcdFxcdFxcdFxcdHJhbSByYVxcbmF1ZGlvL3gtcG4tcmVhbGF1ZGlvLXBsdWdpblxcdFxcdFxcdHJtcFxcbmF1ZGlvL3gtd2F2XFx0XFx0XFx0XFx0XFx0d2F2XFxuYXVkaW8veG1cXHRcXHRcXHRcXHRcXHR4bVxcbmNoZW1pY2FsL3gtY2R4XFx0XFx0XFx0XFx0XFx0Y2R4XFxuY2hlbWljYWwveC1jaWZcXHRcXHRcXHRcXHRcXHRjaWZcXG5jaGVtaWNhbC94LWNtZGZcXHRcXHRcXHRcXHRcXHRjbWRmXFxuY2hlbWljYWwveC1jbWxcXHRcXHRcXHRcXHRcXHRjbWxcXG5jaGVtaWNhbC94LWNzbWxcXHRcXHRcXHRcXHRcXHRjc21sXFxuY2hlbWljYWwveC14eXpcXHRcXHRcXHRcXHRcXHR4eXpcXG5mb250L2NvbGxlY3Rpb25cXHRcXHRcXHRcXHRcXHR0dGNcXG5mb250L290ZlxcdFxcdFxcdFxcdFxcdG90ZlxcbmZvbnQvdHRmXFx0XFx0XFx0XFx0XFx0dHRmXFxuZm9udC93b2ZmXFx0XFx0XFx0XFx0XFx0d29mZlxcbmZvbnQvd29mZjJcXHRcXHRcXHRcXHRcXHR3b2ZmMlxcbmltYWdlL2JtcFxcdFxcdFxcdFxcdFxcdGJtcFxcbmltYWdlL2NnbVxcdFxcdFxcdFxcdFxcdGNnbVxcbmltYWdlL2czZmF4XFx0XFx0XFx0XFx0XFx0ZzNcXG5pbWFnZS9naWZcXHRcXHRcXHRcXHRcXHRnaWZcXG5pbWFnZS9pZWZcXHRcXHRcXHRcXHRcXHRpZWZcXG5pbWFnZS9qcGVnXFx0XFx0XFx0XFx0XFx0anBlZyBqcGcganBlXFxuaW1hZ2Uva3R4XFx0XFx0XFx0XFx0XFx0a3R4XFxuaW1hZ2UvcG5nXFx0XFx0XFx0XFx0XFx0cG5nXFxuaW1hZ2UvcHJzLmJ0aWZcXHRcXHRcXHRcXHRcXHRidGlmXFxuaW1hZ2Uvc2dpXFx0XFx0XFx0XFx0XFx0c2dpXFxuaW1hZ2Uvc3ZnK3htbFxcdFxcdFxcdFxcdFxcdHN2ZyBzdmd6XFxuaW1hZ2UvdGlmZlxcdFxcdFxcdFxcdFxcdHRpZmYgdGlmXFxuaW1hZ2Uvdm5kLmFkb2JlLnBob3Rvc2hvcFxcdFxcdFxcdHBzZFxcbmltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcXHRcXHRcXHRcXHR1dmkgdXZ2aSB1dmcgdXZ2Z1xcbmltYWdlL3ZuZC5kanZ1XFx0XFx0XFx0XFx0XFx0ZGp2dSBkanZcXG5pbWFnZS92bmQuZHZiLnN1YnRpdGxlXFx0XFx0XFx0XFx0c3ViXFxuaW1hZ2Uvdm5kLmR3Z1xcdFxcdFxcdFxcdFxcdGR3Z1xcbmltYWdlL3ZuZC5keGZcXHRcXHRcXHRcXHRcXHRkeGZcXG5pbWFnZS92bmQuZmFzdGJpZHNoZWV0XFx0XFx0XFx0XFx0ZmJzXFxuaW1hZ2Uvdm5kLmZweFxcdFxcdFxcdFxcdFxcdGZweFxcbmltYWdlL3ZuZC5mc3RcXHRcXHRcXHRcXHRcXHRmc3RcXG5pbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1tbXJcXHRcXHRcXHRtbXJcXG5pbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1ybGNcXHRcXHRcXHRybGNcXG5pbWFnZS92bmQubXMtbW9kaVxcdFxcdFxcdFxcdG1kaVxcbmltYWdlL3ZuZC5tcy1waG90b1xcdFxcdFxcdFxcdHdkcFxcbmltYWdlL3ZuZC5uZXQtZnB4XFx0XFx0XFx0XFx0bnB4XFxuaW1hZ2Uvdm5kLndhcC53Ym1wXFx0XFx0XFx0XFx0d2JtcFxcbmltYWdlL3ZuZC54aWZmXFx0XFx0XFx0XFx0XFx0eGlmXFxuaW1hZ2Uvd2VicFxcdFxcdFxcdFxcdFxcdHdlYnBcXG5pbWFnZS94LTNkc1xcdFxcdFxcdFxcdFxcdDNkc1xcbmltYWdlL3gtY211LXJhc3RlclxcdFxcdFxcdFxcdHJhc1xcbmltYWdlL3gtY214XFx0XFx0XFx0XFx0XFx0Y214XFxuaW1hZ2UveC1mcmVlaGFuZFxcdFxcdFxcdFxcdGZoIGZoYyBmaDQgZmg1IGZoN1xcbmltYWdlL3gtaWNvblxcdFxcdFxcdFxcdFxcdGljb1xcbmltYWdlL3gtbXJzaWQtaW1hZ2VcXHRcXHRcXHRcXHRzaWRcXG5pbWFnZS94LXBjeFxcdFxcdFxcdFxcdFxcdHBjeFxcbmltYWdlL3gtcGljdFxcdFxcdFxcdFxcdFxcdHBpYyBwY3RcXG5pbWFnZS94LXBvcnRhYmxlLWFueW1hcFxcdFxcdFxcdFxcdHBubVxcbmltYWdlL3gtcG9ydGFibGUtYml0bWFwXFx0XFx0XFx0XFx0cGJtXFxuaW1hZ2UveC1wb3J0YWJsZS1ncmF5bWFwXFx0XFx0XFx0cGdtXFxuaW1hZ2UveC1wb3J0YWJsZS1waXhtYXBcXHRcXHRcXHRcXHRwcG1cXG5pbWFnZS94LXJnYlxcdFxcdFxcdFxcdFxcdHJnYlxcbmltYWdlL3gtdGdhXFx0XFx0XFx0XFx0XFx0dGdhXFxuaW1hZ2UveC14Yml0bWFwXFx0XFx0XFx0XFx0XFx0eGJtXFxuaW1hZ2UveC14cGl4bWFwXFx0XFx0XFx0XFx0XFx0eHBtXFxuaW1hZ2UveC14d2luZG93ZHVtcFxcdFxcdFxcdFxcdHh3ZFxcbm1lc3NhZ2UvcmZjODIyXFx0XFx0XFx0XFx0XFx0ZW1sIG1pbWVcXG5tb2RlbC9pZ2VzXFx0XFx0XFx0XFx0XFx0aWdzIGlnZXNcXG5tb2RlbC9tZXNoXFx0XFx0XFx0XFx0XFx0bXNoIG1lc2ggc2lsb1xcbm1vZGVsL3ZuZC5jb2xsYWRhK3htbFxcdFxcdFxcdFxcdGRhZVxcbm1vZGVsL3ZuZC5kd2ZcXHRcXHRcXHRcXHRcXHRkd2ZcXG5tb2RlbC92bmQuZ2RsXFx0XFx0XFx0XFx0XFx0Z2RsXFxubW9kZWwvdm5kLmd0d1xcdFxcdFxcdFxcdFxcdGd0d1xcbm1vZGVsL3ZuZC5tdHNcXHRcXHRcXHRcXHRcXHRtdHNcXG5tb2RlbC92bmQudnR1XFx0XFx0XFx0XFx0XFx0dnR1XFxubW9kZWwvdnJtbFxcdFxcdFxcdFxcdFxcdHdybCB2cm1sXFxubW9kZWwveDNkK2JpbmFyeVxcdFxcdFxcdFxcdHgzZGIgeDNkYnpcXG5tb2RlbC94M2QrdnJtbFxcdFxcdFxcdFxcdFxcdHgzZHYgeDNkdnpcXG5tb2RlbC94M2QreG1sXFx0XFx0XFx0XFx0XFx0eDNkIHgzZHpcXG50ZXh0L2NhY2hlLW1hbmlmZXN0XFx0XFx0XFx0XFx0YXBwY2FjaGVcXG50ZXh0L2NhbGVuZGFyXFx0XFx0XFx0XFx0XFx0aWNzIGlmYlxcbnRleHQvY3NzXFx0XFx0XFx0XFx0XFx0Y3NzXFxudGV4dC9jc3ZcXHRcXHRcXHRcXHRcXHRjc3ZcXG50ZXh0L2h0bWxcXHRcXHRcXHRcXHRcXHRodG1sIGh0bVxcbnRleHQvbjNcXHRcXHRcXHRcXHRcXHRcXHRuM1xcbnRleHQvcGxhaW5cXHRcXHRcXHRcXHRcXHR0eHQgdGV4dCBjb25mIGRlZiBsaXN0IGxvZyBpblxcbnRleHQvcHJzLmxpbmVzLnRhZ1xcdFxcdFxcdFxcdGRzY1xcbnRleHQvcmljaHRleHRcXHRcXHRcXHRcXHRcXHRydHhcXG50ZXh0L3NnbWxcXHRcXHRcXHRcXHRcXHRzZ21sIHNnbVxcbnRleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXNcXHRcXHRcXHR0c3ZcXG50ZXh0L3Ryb2ZmXFx0XFx0XFx0XFx0XFx0dCB0ciByb2ZmIG1hbiBtZSBtc1xcbnRleHQvdHVydGxlXFx0XFx0XFx0XFx0XFx0dHRsXFxudGV4dC91cmktbGlzdFxcdFxcdFxcdFxcdFxcdHVyaSB1cmlzIHVybHNcXG50ZXh0L3ZjYXJkXFx0XFx0XFx0XFx0XFx0dmNhcmRcXG50ZXh0L3ZuZC5jdXJsXFx0XFx0XFx0XFx0XFx0Y3VybFxcbnRleHQvdm5kLmN1cmwuZGN1cmxcXHRcXHRcXHRcXHRkY3VybFxcbnRleHQvdm5kLmN1cmwubWN1cmxcXHRcXHRcXHRcXHRtY3VybFxcbnRleHQvdm5kLmN1cmwuc2N1cmxcXHRcXHRcXHRcXHRzY3VybFxcbnRleHQvdm5kLmR2Yi5zdWJ0aXRsZVxcdFxcdFxcdFxcdHN1YlxcbnRleHQvdm5kLmZseVxcdFxcdFxcdFxcdFxcdGZseVxcbnRleHQvdm5kLmZtaS5mbGV4c3RvclxcdFxcdFxcdFxcdGZseFxcbnRleHQvdm5kLmdyYXBodml6XFx0XFx0XFx0XFx0Z3ZcXG50ZXh0L3ZuZC5pbjNkLjNkbWxcXHRcXHRcXHRcXHQzZG1sXFxudGV4dC92bmQuaW4zZC5zcG90XFx0XFx0XFx0XFx0c3BvdFxcbnRleHQvdm5kLnN1bi5qMm1lLmFwcC1kZXNjcmlwdG9yXFx0XFx0amFkXFxudGV4dC92bmQud2FwLndtbFxcdFxcdFxcdFxcdHdtbFxcbnRleHQvdm5kLndhcC53bWxzY3JpcHRcXHRcXHRcXHRcXHR3bWxzXFxudGV4dC94LWFzbVxcdFxcdFxcdFxcdFxcdHMgYXNtXFxudGV4dC94LWNcXHRcXHRcXHRcXHRcXHRjIGNjIGN4eCBjcHAgaCBoaCBkaWNcXG50ZXh0L3gtZm9ydHJhblxcdFxcdFxcdFxcdFxcdGYgZm9yIGY3NyBmOTBcXG50ZXh0L3gtamF2YS1zb3VyY2VcXHRcXHRcXHRcXHRqYXZhXFxudGV4dC94LW5mb1xcdFxcdFxcdFxcdFxcdG5mb1xcbnRleHQveC1vcG1sXFx0XFx0XFx0XFx0XFx0b3BtbFxcbnRleHQveC1wYXNjYWxcXHRcXHRcXHRcXHRcXHRwIHBhc1xcbnRleHQveC1zZXRleHRcXHRcXHRcXHRcXHRcXHRldHhcXG50ZXh0L3gtc2Z2XFx0XFx0XFx0XFx0XFx0c2Z2XFxudGV4dC94LXV1ZW5jb2RlXFx0XFx0XFx0XFx0XFx0dXVcXG50ZXh0L3gtdmNhbGVuZGFyXFx0XFx0XFx0XFx0dmNzXFxudGV4dC94LXZjYXJkXFx0XFx0XFx0XFx0XFx0dmNmXFxudmlkZW8vM2dwcFxcdFxcdFxcdFxcdFxcdDNncFxcbnZpZGVvLzNncHAyXFx0XFx0XFx0XFx0XFx0M2cyXFxudmlkZW8vaDI2MVxcdFxcdFxcdFxcdFxcdGgyNjFcXG52aWRlby9oMjYzXFx0XFx0XFx0XFx0XFx0aDI2M1xcbnZpZGVvL2gyNjRcXHRcXHRcXHRcXHRcXHRoMjY0XFxudmlkZW8vanBlZ1xcdFxcdFxcdFxcdFxcdGpwZ3ZcXG52aWRlby9qcG1cXHRcXHRcXHRcXHRcXHRqcG0ganBnbVxcbnZpZGVvL21qMlxcdFxcdFxcdFxcdFxcdG1qMiBtanAyXFxudmlkZW8vbXA0XFx0XFx0XFx0XFx0XFx0bXA0IG1wNHYgbXBnNFxcbnZpZGVvL21wZWdcXHRcXHRcXHRcXHRcXHRtcGVnIG1wZyBtcGUgbTF2IG0ydlxcbnZpZGVvL29nZ1xcdFxcdFxcdFxcdFxcdG9ndlxcbnZpZGVvL3F1aWNrdGltZVxcdFxcdFxcdFxcdFxcdHF0IG1vdlxcbnZpZGVvL3ZuZC5kZWNlLmhkXFx0XFx0XFx0XFx0dXZoIHV2dmhcXG52aWRlby92bmQuZGVjZS5tb2JpbGVcXHRcXHRcXHRcXHR1dm0gdXZ2bVxcbnZpZGVvL3ZuZC5kZWNlLnBkXFx0XFx0XFx0XFx0dXZwIHV2dnBcXG52aWRlby92bmQuZGVjZS5zZFxcdFxcdFxcdFxcdHV2cyB1dnZzXFxudmlkZW8vdm5kLmRlY2UudmlkZW9cXHRcXHRcXHRcXHR1dnYgdXZ2dlxcbnZpZGVvL3ZuZC5kdmIuZmlsZVxcdFxcdFxcdFxcdGR2YlxcbnZpZGVvL3ZuZC5mdnRcXHRcXHRcXHRcXHRcXHRmdnRcXG52aWRlby92bmQubXBlZ3VybFxcdFxcdFxcdFxcdG14dSBtNHVcXG52aWRlby92bmQubXMtcGxheXJlYWR5Lm1lZGlhLnB5dlxcdFxcdHB5dlxcbnZpZGVvL3ZuZC51dnZ1Lm1wNFxcdFxcdFxcdFxcdHV2dSB1dnZ1XFxudmlkZW8vdm5kLnZpdm9cXHRcXHRcXHRcXHRcXHR2aXZcXG52aWRlby93ZWJtXFx0XFx0XFx0XFx0XFx0d2VibVxcbnZpZGVvL3gtZjR2XFx0XFx0XFx0XFx0XFx0ZjR2XFxudmlkZW8veC1mbGlcXHRcXHRcXHRcXHRcXHRmbGlcXG52aWRlby94LWZsdlxcdFxcdFxcdFxcdFxcdGZsdlxcbnZpZGVvL3gtbTR2XFx0XFx0XFx0XFx0XFx0bTR2XFxudmlkZW8veC1tYXRyb3NrYVxcdFxcdFxcdFxcdG1rdiBtazNkIG1rc1xcbnZpZGVvL3gtbW5nXFx0XFx0XFx0XFx0XFx0bW5nXFxudmlkZW8veC1tcy1hc2ZcXHRcXHRcXHRcXHRcXHRhc2YgYXN4XFxudmlkZW8veC1tcy12b2JcXHRcXHRcXHRcXHRcXHR2b2JcXG52aWRlby94LW1zLXdtXFx0XFx0XFx0XFx0XFx0d21cXG52aWRlby94LW1zLXdtdlxcdFxcdFxcdFxcdFxcdHdtdlxcbnZpZGVvL3gtbXMtd214XFx0XFx0XFx0XFx0XFx0d214XFxudmlkZW8veC1tcy13dnhcXHRcXHRcXHRcXHRcXHR3dnhcXG52aWRlby94LW1zdmlkZW9cXHRcXHRcXHRcXHRcXHRhdmlcXG52aWRlby94LXNnaS1tb3ZpZVxcdFxcdFxcdFxcdG1vdmllXFxudmlkZW8veC1zbXZcXHRcXHRcXHRcXHRcXHRzbXZcXG54LWNvbmZlcmVuY2UveC1jb29sdGFsa1xcdFxcdFxcdFxcdGljZVxcblwiO1xuXG5jb25zdCBtYXAgPSBuZXcgTWFwKCk7XG5cbm1pbWVfcmF3LnNwbGl0KCdcXG4nKS5mb3JFYWNoKChyb3cpID0+IHtcblx0Y29uc3QgbWF0Y2ggPSAvKC4rPylcXHQrKC4rKS8uZXhlYyhyb3cpO1xuXHRpZiAoIW1hdGNoKSByZXR1cm47XG5cblx0Y29uc3QgdHlwZSA9IG1hdGNoWzFdO1xuXHRjb25zdCBleHRlbnNpb25zID0gbWF0Y2hbMl0uc3BsaXQoJyAnKTtcblxuXHRleHRlbnNpb25zLmZvckVhY2goZXh0ID0+IHtcblx0XHRtYXAuc2V0KGV4dCwgdHlwZSk7XG5cdH0pO1xufSk7XG5cbmZ1bmN0aW9uIGxvb2t1cChmaWxlKSB7XG5cdGNvbnN0IG1hdGNoID0gL1xcLihbXlxcLl0rKSQvLmV4ZWMoZmlsZSk7XG5cdHJldHVybiBtYXRjaCAmJiBtYXAuZ2V0KG1hdGNoWzFdKTtcbn1cblxuZnVuY3Rpb24gbWlkZGxld2FyZShvcHRzXG5cblxuID0ge30pIHtcblx0Y29uc3QgeyBzZXNzaW9uLCBpZ25vcmUgfSA9IG9wdHM7XG5cblx0bGV0IGVtaXR0ZWRfYmFzZXBhdGggPSBmYWxzZTtcblxuXHRyZXR1cm4gY29tcG9zZV9oYW5kbGVycyhpZ25vcmUsIFtcblx0XHQocmVxLCByZXMsIG5leHQpID0+IHtcblx0XHRcdGlmIChyZXEuYmFzZVVybCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGxldCB7IG9yaWdpbmFsVXJsIH0gPSByZXE7XG5cdFx0XHRcdGlmIChyZXEudXJsID09PSAnLycgJiYgb3JpZ2luYWxVcmxbb3JpZ2luYWxVcmwubGVuZ3RoIC0gMV0gIT09ICcvJykge1xuXHRcdFx0XHRcdG9yaWdpbmFsVXJsICs9ICcvJztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJlcS5iYXNlVXJsID0gb3JpZ2luYWxVcmxcblx0XHRcdFx0XHQ/IG9yaWdpbmFsVXJsLnNsaWNlKDAsIC1yZXEudXJsLmxlbmd0aClcblx0XHRcdFx0XHQ6ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWVtaXR0ZWRfYmFzZXBhdGggJiYgcHJvY2Vzcy5zZW5kKSB7XG5cdFx0XHRcdHByb2Nlc3Muc2VuZCh7XG5cdFx0XHRcdFx0X19zYXBwZXJfXzogdHJ1ZSxcblx0XHRcdFx0XHRldmVudDogJ2Jhc2VwYXRoJyxcblx0XHRcdFx0XHRiYXNlcGF0aDogcmVxLmJhc2VVcmxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0ZW1pdHRlZF9iYXNlcGF0aCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChyZXEucGF0aCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJlcS5wYXRoID0gcmVxLnVybC5yZXBsYWNlKC9cXD8uKi8sICcnKTtcblx0XHRcdH1cblxuXHRcdFx0bmV4dCgpO1xuXHRcdH0sXG5cblx0XHRmcy5leGlzdHNTeW5jKHBhdGguam9pbihidWlsZF9kaXIsICdzZXJ2aWNlLXdvcmtlci5qcycpKSAmJiBzZXJ2ZSh7XG5cdFx0XHRwYXRobmFtZTogJy9zZXJ2aWNlLXdvcmtlci5qcycsXG5cdFx0XHRjYWNoZV9jb250cm9sOiAnbm8tY2FjaGUsIG5vLXN0b3JlLCBtdXN0LXJldmFsaWRhdGUnXG5cdFx0fSksXG5cblx0XHRmcy5leGlzdHNTeW5jKHBhdGguam9pbihidWlsZF9kaXIsICdzZXJ2aWNlLXdvcmtlci5qcy5tYXAnKSkgJiYgc2VydmUoe1xuXHRcdFx0cGF0aG5hbWU6ICcvc2VydmljZS13b3JrZXIuanMubWFwJyxcblx0XHRcdGNhY2hlX2NvbnRyb2w6ICduby1jYWNoZSwgbm8tc3RvcmUsIG11c3QtcmV2YWxpZGF0ZSdcblx0XHR9KSxcblxuXHRcdHNlcnZlKHtcblx0XHRcdHByZWZpeDogJy9jbGllbnQvJyxcblx0XHRcdGNhY2hlX2NvbnRyb2w6IGRldiA/ICduby1jYWNoZScgOiAnbWF4LWFnZT0zMTUzNjAwMCwgaW1tdXRhYmxlJ1xuXHRcdH0pLFxuXG5cdFx0Z2V0X3NlcnZlcl9yb3V0ZV9oYW5kbGVyKG1hbmlmZXN0LnNlcnZlcl9yb3V0ZXMpLFxuXG5cdFx0Z2V0X3BhZ2VfaGFuZGxlcihtYW5pZmVzdCwgc2Vzc2lvbiB8fCBub29wKVxuXHRdLmZpbHRlcihCb29sZWFuKSk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvc2VfaGFuZGxlcnMoaWdub3JlLCBoYW5kbGVycykge1xuXHRjb25zdCB0b3RhbCA9IGhhbmRsZXJzLmxlbmd0aDtcblxuXHRmdW5jdGlvbiBudGhfaGFuZGxlcihuLCByZXEsIHJlcywgbmV4dCkge1xuXHRcdGlmIChuID49IHRvdGFsKSB7XG5cdFx0XHRyZXR1cm4gbmV4dCgpO1xuXHRcdH1cblxuXHRcdGhhbmRsZXJzW25dKHJlcSwgcmVzLCAoKSA9PiBudGhfaGFuZGxlcihuKzEsIHJlcSwgcmVzLCBuZXh0KSk7XG5cdH1cblxuXHRyZXR1cm4gIWlnbm9yZVxuXHRcdD8gKHJlcSwgcmVzLCBuZXh0KSA9PiBudGhfaGFuZGxlcigwLCByZXEsIHJlcywgbmV4dClcblx0XHQ6IChyZXEsIHJlcywgbmV4dCkgPT4ge1xuXHRcdFx0aWYgKHNob3VsZF9pZ25vcmUocmVxLnBhdGgsIGlnbm9yZSkpIHtcblx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bnRoX2hhbmRsZXIoMCwgcmVxLCByZXMsIG5leHQpO1xuXHRcdFx0fVxuXHRcdH07XG59XG5cbmZ1bmN0aW9uIHNob3VsZF9pZ25vcmUodXJpLCB2YWwpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkodmFsKSkgcmV0dXJuIHZhbC5zb21lKHggPT4gc2hvdWxkX2lnbm9yZSh1cmksIHgpKTtcblx0aWYgKHZhbCBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIHZhbC50ZXN0KHVyaSk7XG5cdGlmICh0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdmFsKHVyaSk7XG5cdHJldHVybiB1cmkuc3RhcnRzV2l0aCh2YWwuY2hhckNvZGVBdCgwKSA9PT0gNDcgPyB2YWwgOiBgLyR7dmFsfWApO1xufVxuXG5mdW5jdGlvbiBzZXJ2ZSh7IHByZWZpeCwgcGF0aG5hbWUsIGNhY2hlX2NvbnRyb2wgfVxuXG5cblxuKSB7XG5cdGNvbnN0IGZpbHRlciA9IHBhdGhuYW1lXG5cdFx0PyAocmVxKSA9PiByZXEucGF0aCA9PT0gcGF0aG5hbWVcblx0XHQ6IChyZXEpID0+IHJlcS5wYXRoLnN0YXJ0c1dpdGgocHJlZml4KTtcblxuXHRjb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcblxuXHRjb25zdCByZWFkID0gZGV2XG5cdFx0PyAoZmlsZSkgPT4gZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShidWlsZF9kaXIsIGZpbGUpKVxuXHRcdDogKGZpbGUpID0+IChjYWNoZS5oYXMoZmlsZSkgPyBjYWNoZSA6IGNhY2hlLnNldChmaWxlLCBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKGJ1aWxkX2RpciwgZmlsZSkpKSkuZ2V0KGZpbGUpO1xuXG5cdHJldHVybiAocmVxLCByZXMsIG5leHQpID0+IHtcblx0XHRpZiAoZmlsdGVyKHJlcSkpIHtcblx0XHRcdGNvbnN0IHR5cGUgPSBsb29rdXAocmVxLnBhdGgpO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBmaWxlID0gZGVjb2RlVVJJQ29tcG9uZW50KHJlcS5wYXRoLnNsaWNlKDEpKTtcblx0XHRcdFx0Y29uc3QgZGF0YSA9IHJlYWQoZmlsZSk7XG5cblx0XHRcdFx0cmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgdHlwZSk7XG5cdFx0XHRcdHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCBjYWNoZV9jb250cm9sKTtcblx0XHRcdFx0cmVzLmVuZChkYXRhKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRyZXMuc3RhdHVzQ29kZSA9IDQwNDtcblx0XHRcdFx0cmVzLmVuZCgnbm90IGZvdW5kJyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5leHQoKTtcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIG5vb3AoKXt9XG5cbmV4cG9ydCB7IG1pZGRsZXdhcmUgfTtcbiIsImltcG9ydCBwb2xrYSBmcm9tICdwb2xrYSc7XG5pbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XG5pbXBvcnQgc2lydiBmcm9tICdzaXJ2JztcbmltcG9ydCAqIGFzIHNhcHBlciBmcm9tICdAc2FwcGVyL3NlcnZlcic7XG5pbXBvcnQgeyBzYW5pdGl6ZV91c2VyLCBhdXRoZW50aWNhdGUgfSBmcm9tICcuL3V0aWxzL2F1dGgnO1xuXG5jb25zdCB7IFBPUlQgPSAzMDAwIH0gPSBwcm9jZXNzLmVudjtcblxuY29uc3QgYXBwID0gcG9sa2Eoe1xuXHRvbkVycm9yOiAoZXJyLCByZXEsIHJlcykgPT4ge1xuXHRcdGNvbnN0IGVycm9yID0gZXJyLm1lc3NhZ2UgfHwgZXJyO1xuXHRcdGNvbnN0IGNvZGUgPSBlcnIuY29kZSB8fCBlcnIuc3RhdHVzIHx8IDUwMDtcblx0XHRyZXMuaGVhZGVyc1NlbnQgfHwgc2VuZChyZXMsIGNvZGUsIHsgZXJyb3IgfSk7XG5cdH1cbn0pO1xuXG5pZiAocHJvY2Vzcy5lbnYuUEdIT1NUKSB7XG5cdGFwcC51c2UoYXV0aGVudGljYXRlKCkpO1xufVxuXG5hcHAudXNlKFxuXHRzaXJ2KCdzdGF0aWMnLCB7XG5cdFx0ZGV2OiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jyxcblx0XHRzZXRIZWFkZXJzKHJlcykge1xuXHRcdFx0cmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcblx0XHRcdHJlcy5oYXNIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnKSB8fCByZXMuc2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJywgJ21heC1hZ2U9NjAwJyk7IC8vIDEwbWluIGRlZmF1bHRcblx0XHR9XG5cdH0pLFxuXG5cdHNhcHBlci5taWRkbGV3YXJlKHtcblx0XHRzZXNzaW9uOiByZXEgPT4gKHtcblx0XHRcdHVzZXI6IHNhbml0aXplX3VzZXIocmVxLnVzZXIpXG5cdFx0fSlcblx0fSlcbik7XG5cbmFwcC5saXN0ZW4oUE9SVCk7XG4iXSwibmFtZXMiOlsiZnMiLCJnZXQiLCJmbGVlY2UuZXZhbHVhdGUiLCJmcy5yZWFkZGlyU3luYyIsImZzLnJlYWRGaWxlU3luYyIsImNhY2hlIiwiZnMuZXhpc3RzU3luYyIsInBhdGguZXh0bmFtZSIsIlBvb2wiLCJjb29raWUucGFyc2UiLCJodHRwaWUucG9zdCIsInN0cmluZ2lmeSIsInBhcnNlIiwiaHR0cGllLmdldCIsImNvb2tpZS5zZXJpYWxpemUiLCJkZXZhbHVlIiwiZ2xvYmFsIiwiU3ltYm9sIiwiYnVpbHRpbk92ZXJyaWRhYmxlUmVwbGFjZW1lbnRzIiwiYnVpbHRpblJlcGxhY2VtZW50cyIsImRlYnVyciIsInNsdWdpZnkiLCJwYXRoIiwianNvbiIsImxvb2t1cCIsIlNMVUdfUFJFU0VSVkVfVU5JQ09ERSIsIlNMVUdfU0VQQVJBVE9SIiwidXJsc2FmZVNsdWdQcm9jZXNzb3IiLCJhbHBoYU51bVJlZ2V4IiwidW5pY29kZVJlZ2V4IiwiaXNOb25BbHBoYU51bVVuaWNvZGUiLCJ1bmljb2RlU2FmZVByb2Nlc3NvciIsImdldF9zZWN0aW9ucyIsImNyZWF0ZVJlYWRTdHJlYW0iLCJjb21wb25lbnRfMCIsImNvbXBvbmVudF8xIiwicHJlbG9hZF8xIiwiY29tcG9uZW50XzIiLCJwcmVsb2FkXzIiLCJjb21wb25lbnRfMyIsInByZWxvYWRfMyIsImNvbXBvbmVudF80IiwicHJlbG9hZF80IiwiY29tcG9uZW50XzUiLCJwcmVsb2FkXzUiLCJjb21wb25lbnRfNiIsInByZWxvYWRfNiIsImNvbXBvbmVudF83IiwicHJlbG9hZF83IiwiY29tcG9uZW50XzgiLCJwcmVsb2FkXzgiLCJjb21wb25lbnRfOSIsInByZWxvYWRfOSIsImNvbXBvbmVudF8xMCIsInByZWxvYWRfMTAiLCJjb21wb25lbnRfMTEiLCJwcmVsb2FkXzExIiwicm9vdCIsImVycm9yIiwiZmluZCIsIndyaXRhYmxlIiwiQXBwIiwibm9vcCIsInNhcHBlci5taWRkbGV3YXJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFJLE1BQU0sQ0FBQztBQUNYLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O0FBRXpCLEFBQU8sU0FBUyxZQUFZLEdBQUc7Q0FDOUIsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O0NBRW5CLE9BQU9BLFdBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSTtFQUMxRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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RSxNQUFNLEVBQUUsR0FBRyxHQUFHLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUc7RUFDN0UsTUFBTSxFQUFFLEdBQUcsR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUc7RUFDbkQsTUFBTSxFQUFFLEdBQUcsR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUc7RUFDbkQsTUFBTSxFQUFFLEdBQUcsR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHO0VBQ3RDLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUk7RUFDMUIsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSTtFQUMxQixNQUFNLEVBQUUsSUFBSTs7RUFFWixRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDNUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzVDLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzNELFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzNELFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzNELFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDMUUsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMxRSxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDMUUsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRztFQUM3QixRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDNUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMxRSxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzNELFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzNELFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUM1QyxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDNUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzVDLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUM1QyxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDNUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzVDLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUN6RixRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDekYsUUFB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QUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7OztDQUdWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQzs7O0NBR1YsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzs7Q0FHVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7OztDQUdYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQzs7O0NBR1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDO0NBQ1osQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDO0NBQ1osQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0NBQ1QsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0NBQ1QsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0NBQ1QsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0NBQ1QsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0NBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDOzs7Q0FHWCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7OztDQUdWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUM7O0FDclVGLDJCQUFjLEdBQUc7Q0FDaEIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO0NBQ2QsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDO0NBQ25CLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQztDQUNmLENBQUM7O0FDQUYsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJO0NBQzVCLE9BQU8sTUFBTTtHQUNYLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUM7R0FDckMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQy9DLENBQUM7O0FBRUYsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxZQUFZLEtBQUs7Q0FDdEQsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLFlBQVksRUFBRTtFQUN4QyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztFQUN6RTs7Q0FFRCxPQUFPLE1BQU0sQ0FBQztDQUNkLENBQUM7O0FBRUYsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxTQUFTLEtBQUs7Q0FDbkQsT0FBTyxNQUFNO0dBQ1gsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDO0dBQ3ZELE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUM5RCxDQUFDOztBQUVGLE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sS0FBSztDQUNwQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtFQUMvQixNQUFNLElBQUksU0FBUyxDQUFDLENBQUMseUJBQXlCLEVBQUUsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNuRTs7Q0FFRCxPQUFPLEdBQUc7RUFDVCxTQUFTLEVBQUUsR0FBRztFQUNkLFNBQVMsRUFBRSxJQUFJO0VBQ2YsVUFBVSxFQUFFLElBQUk7RUFDaEIsa0JBQWtCLEVBQUUsRUFBRTtFQUN0QixHQUFHLE9BQU87RUFDVixDQUFDOztDQUVGLE1BQU0sU0FBUyxHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUN4RCxNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDO0VBQ2xDLEdBQUdDLHVCQUE4QjtFQUNqQyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0I7RUFDN0IsR0FBR0MsWUFBbUI7RUFDdEIsQ0FBQyxDQUFDOztDQUVILE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztDQUMxRCxNQUFNLEdBQUdDLGFBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUN4QixNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7Q0FFbEMsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO0VBQ3ZCLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDNUI7O0NBRUQsSUFBSSxXQUFXLEdBQUcsZUFBZSxDQUFDOztDQUVsQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7RUFDdEIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztFQUM5QixXQUFXLEdBQUcsWUFBWSxDQUFDO0VBQzNCOztDQUVELE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztDQUNoRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDbkMsTUFBTSxHQUFHLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQzs7Q0FFakQsT0FBTyxNQUFNLENBQUM7Q0FDZCxDQUFDOztBQUVGLGFBQWMsR0FBRyxPQUFPLENBQUM7O0FBRXpCLGFBQXNCLEdBQUcsT0FBTyxDQUFDOzs7QUN0RTFCLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDO0FBQzFDLEFBQU8sTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDOztBQ0VsQzs7QUFFQSxBQUFPLE1BQU0sb0JBQW9CLEdBQUcsTUFBTTtDQUN6Q0MsU0FBTyxDQUFDLE1BQU0sRUFBRTtFQUNmLGtCQUFrQixFQUFFO0dBQ25CLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQztHQUNmLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQztHQUNiO0VBQ0QsU0FBUyxFQUFFLGNBQWM7RUFDekIsVUFBVSxFQUFFLEtBQUs7RUFDakIsU0FBUyxFQUFFLEtBQUs7RUFDaEIsQ0FBQztHQUNBLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDO0dBQ3ZCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7Ozs7QUFJekIsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ3BDLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQztBQUNuQyxNQUFNLG9CQUFvQjtDQUN6QixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXBFLEFBQU8sTUFBTSxvQkFBb0IsR0FBRyxNQUFNO0NBQ3pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0dBQ2QsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxLQUFLO0dBQ3RDLE1BQU0sSUFBSSxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sR0FBRyxTQUFTLENBQUM7O0dBRTdELElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtJQUNoQixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxNQUFNLElBQUksSUFBSSxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO0lBQ3ZDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztJQUM3QixNQUFNO0lBQ04sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDOztHQUVELElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0lBQy9CLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqQzs7R0FFRCxPQUFPLEtBQUssQ0FBQztHQUNiLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7R0FDaEQsTUFBTTtHQUNOLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEtBQUs7R0FDekIsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksS0FBSyxTQUFTO01BQ3ZDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7TUFDbEMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7R0FFaEIsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs7R0FFOUMsT0FBTyxLQUFLLENBQUM7R0FDYixFQUFFLEVBQUUsQ0FBQztHQUNMLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzs7OztBQUl4QixBQUFPLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxlQUFlLEdBQUcsS0FBSyxLQUFLLGVBQWU7R0FDMUUsb0JBQW9CO0dBQ3BCLG9CQUFvQixDQUFDOztBQ3JEeEIsTUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7QUFFMUQsQUFBZSxTQUFTLFNBQVMsR0FBRztDQUNuQyxPQUFPckIsV0FBRTtHQUNQLFdBQVcsQ0FBQyxjQUFjLENBQUM7R0FDM0IsR0FBRyxDQUFDLElBQUksSUFBSTtHQUNaLElBQUlzQixhQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRSxPQUFPOztHQUV6QyxNQUFNLEtBQUssR0FBRywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEQsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0dBRTFELE1BQU0sR0FBRyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDOztHQUVoQyxNQUFNLFFBQVEsR0FBR3RCLFdBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQzs7R0FFbEUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7R0FFNUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0dBQ3hDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0dBQzNCLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDOztHQUUxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7R0FFdkMsUUFBUSxDQUFDLElBQUksR0FBRyxhQUFhLENBQUM7O0dBRTlCLFFBQVEsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDOztHQUUxQixRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEtBQUs7SUFDNUMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztJQUVuQyxPQUFPLENBQUM7T0FDTCxFQUFFLEtBQUssQ0FBQztnQkFDQyxFQUFFLFFBQVEsQ0FBQztvQkFDUCxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDO01BQ2pDLEVBQUUsSUFBSSxDQUFDO1FBQ0wsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZixDQUFDOztHQUVGLE1BQU0sSUFBSSxHQUFHLE1BQU07SUFDbEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLEVBQUUsUUFBUSxFQUFFO0lBQ1osQ0FBQzs7R0FFRixPQUFPO0lBQ04sSUFBSTtJQUNKLFFBQVE7SUFDUixJQUFJO0lBQ0osQ0FBQztHQUNGLENBQUM7R0FDRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25FOztBQ3ZERCxJQUFJdUIsTUFBSSxDQUFDOztBQUVULEFBQU8sU0FBU3RCLEtBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0NBQzdCLElBQUksQ0FBQ3NCLE1BQUksSUFBSSxhQUFvQixLQUFLLFlBQVksRUFBRTtFQUNuRCxNQUFNLEtBQUssR0FBRyxTQUFTLEVBQUU7SUFDdkIsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQ3BDLEdBQUcsQ0FBQyxJQUFJLElBQUk7SUFDWixPQUFPO0tBQ04sSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO0tBQ2YsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO0tBQ3ZCLENBQUM7SUFDRixDQUFDLENBQUM7O0VBRUpBLE1BQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzdCOztDQUVELElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFQSxNQUFJLEVBQUU7RUFDcEIsY0FBYyxFQUFFLGtCQUFrQjtFQUNsQyxlQUFlLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztFQUMxQyxDQUFDLENBQUM7Q0FDSDs7Ozs7O0FDcEJELE1BQU0sTUFBTSxHQUFHLGtEQUFrRCxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFN0UsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFO0NBQzNCLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDakMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0NBQzdDOztBQUVELE1BQU0sR0FBRyxHQUFHLENBQUM7Ozs7Ozs7Ozs7Ozs7Q0FhWixFQUFFLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQzs7VUFFdkQsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztpQ0FDQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzdCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDaEMsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7Q0FFbEQsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOzs7O0FBSWIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFN0QsQUFBTyxTQUFTdEIsS0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7Q0FDN0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0VBQ25CLGVBQWUsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0VBQzNDLGNBQWMsRUFBRSxxQkFBcUI7RUFDckMsQ0FBQyxDQUFDO0NBQ0g7Ozs7OztBQ3RDRCxJQUFJdUIsUUFBTSxDQUFDOztBQUVYLEFBQU8sU0FBU3ZCLEtBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0NBQzdCLElBQUksQ0FBQ3VCLFFBQU0sSUFBSSxhQUFvQixLQUFLLFlBQVksRUFBRTtFQUNyREEsUUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7RUFDbkIsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSTtHQUMzQkEsUUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzVCLENBQUMsQ0FBQztFQUNIOztDQUVELE1BQU0sSUFBSSxHQUFHQSxRQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0NBRXpDLElBQUksSUFBSSxFQUFFO0VBQ1QsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDMUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDckIsTUFBTTtFQUNOLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7RUFDekM7Q0FDRDs7Ozs7O0FDckJNLFNBQVN2QixLQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtDQUM3QixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSw0QkFBNEIsRUFBRSxDQUFDLENBQUM7Q0FDL0QsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDOzs7Ozs7O0NBQ1YsRENETSxNQUFNd0IsdUJBQXFCLEdBQUcsS0FBSyxDQUFDO0FBQzNDLEFBQU8sTUFBTUMsZ0JBQWMsR0FBRyxHQUFHLENBQUM7Ozs7QUFJbEMsQUFBTyxNQUFNQyxzQkFBb0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUs7Q0FDckQsTUFBTSxFQUFFLFNBQVMsR0FBR0QsZ0JBQWMsRUFBRSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7O0NBRWxELE9BQU9MLFNBQU8sQ0FBQyxNQUFNLEVBQUU7RUFDdEIsa0JBQWtCLEVBQUU7R0FDbkIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDO0dBQ2YsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDO0dBQ2I7RUFDRCxTQUFTO0VBQ1QsVUFBVSxFQUFFLEtBQUs7RUFDakIsU0FBUyxFQUFFLEtBQUs7RUFDaEIsQ0FBQztFQUNELE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDO0VBQ3ZCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDdkI7Ozs7QUFJRCxNQUFNTyxlQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ3BDLE1BQU1DLGNBQVksR0FBRyxhQUFhLENBQUM7QUFDbkMsTUFBTUMsc0JBQW9CO0NBQ3pCLE1BQU0sSUFBSSxDQUFDRixlQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJQyxjQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVwRSxBQUFPLE1BQU1FLHNCQUFvQixHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSztDQUNyRCxNQUFNLEVBQUUsU0FBUyxHQUFHTCxnQkFBYyxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzs7Q0FFbEQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztFQUN0QixNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEtBQUs7RUFDdEMsTUFBTSxJQUFJLEdBQUdJLHNCQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sR0FBRyxTQUFTLENBQUM7O0VBRTdELElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtHQUNoQixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNyQyxNQUFNLElBQUksSUFBSSxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO0dBQ3ZDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztHQUM3QixNQUFNO0dBQ04sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ2pDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBQztHQUNwQzs7RUFFRCxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtHQUMvQixLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDakM7O0VBRUQsT0FBTyxLQUFLLENBQUM7RUFDYixFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ2hELE1BQU07RUFDTixNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxLQUFLO0VBQ3pCLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUztLQUN2Q0gsc0JBQW9CLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUNsQyxLQUFLLENBQUMsTUFBTSxDQUFDOztFQUVoQixTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztFQUU5QyxPQUFPLEtBQUssQ0FBQztFQUNiLEVBQUUsRUFBRSxDQUFDO0VBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0VBQ2pCOzs7O0FBSUQsQUFBTyxNQUFNLDJCQUEyQixHQUFHLENBQUM7Q0FDM0MsZ0JBQWdCLEdBQUdGLHVCQUFxQjtDQUN4QyxTQUFTLEdBQUdDLGdCQUFjO0NBQzFCLEtBQUs7Q0FDTCxNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsR0FBR0ssc0JBQW9CLEdBQUdKLHNCQUFvQixDQUFDO0NBQ2pGLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O0NBRXZCLE9BQU8sTUFBTSxJQUFJO0VBQ2hCLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDOztFQUU5QyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDOUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7RUFFZixPQUFPLElBQUksQ0FBQztFQUNaO0NBQ0Q7O0FDMUVELE1BQU0sVUFBVSxHQUFHO0NBQ2xCLFlBQVk7Q0FDWixNQUFNO0NBQ04sU0FBUztDQUNULElBQUk7Q0FDSixNQUFNO0NBQ04sVUFBVTtDQUNWLFdBQVc7Q0FDWCxPQUFPO0NBQ1AsVUFBVTtDQUNWLFdBQVc7Q0FDWCxDQUFDOztBQUVGLEFBQWUsdUJBQVEsR0FBRztDQUN6QixNQUFNLFNBQVMsR0FBRywyQkFBMkIsQ0FBQztFQUM3QyxnQkFBZ0IsRUFBRSxxQkFBcUI7RUFDdkMsU0FBUyxFQUFFLGNBQWM7RUFDekIsQ0FBQyxDQUFDOztDQUVILE9BQU8zQixXQUFFO0dBQ1AsV0FBVyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDM0IsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJc0IsYUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUM7R0FDL0QsR0FBRyxDQUFDLElBQUksSUFBSTtHQUNaLE1BQU0sUUFBUSxHQUFHdEIsV0FBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztHQUVsRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztHQUU1RCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOztHQUUvQyxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7O0dBRXZCLE1BQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDOztHQUV2QyxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7O0dBRXZCLFFBQVEsQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDOztHQUU5QixRQUFRLENBQUMsRUFBRSxHQUFHLE1BQU07SUFDbkIsVUFBVSxHQUFHLElBQUksQ0FBQzs7SUFFbEIsT0FBTyw4Q0FBOEMsQ0FBQztJQUN0RCxDQUFDOztHQUVGLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLO0lBQ2pDLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxLQUFLO0tBQ3JDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUM5QixDQUFDOztJQUVGLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7O0lBRWpDLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7SUFFOUMsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQzs7SUFFN0IsSUFBSSxJQUFJLEVBQUU7S0FDVCxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEtBQUssTUFBTSxJQUFJLFlBQVksQ0FBQyxDQUFDO0tBQ3BFLElBQUksUUFBUSxFQUFFO01BQ2IsTUFBTSxHQUFHLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7TUFDL0QsU0FBUyxJQUFJLFFBQVEsQ0FBQztNQUN0QjtLQUNEOztJQUVELElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUM7O0lBRW5DLE1BQU0sSUFBSSxHQUFHLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7SUFFbkYsSUFBSSxVQUFVLEVBQUU7S0FDZixVQUFVLEdBQUcsS0FBSyxDQUFDO0tBQ25CLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDckQ7O0lBRUQsT0FBTyxJQUFJLENBQUM7SUFDWixDQUFDOztHQUVGLFFBQVEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sS0FBSztJQUM1QyxJQUFJLElBQUksQ0FBQzs7SUFFVCxNQUFNLEtBQUssR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsSUFBSSxLQUFLLEVBQUU7S0FDVixJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEIsTUFBTTtLQUNOLElBQUksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDMUI7O0lBRUQsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7S0FDL0IsTUFBTSxLQUFLLEdBQUcsSUFBSTtPQUNoQixPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztPQUN6QixPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUs7T0FDbEQsSUFBSSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDN0IsSUFBSSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDMUIsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQ2hCLENBQUMsQ0FBQzs7S0FFSixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3pDOztJQUVELE9BQU8sQ0FBQztPQUNMLEVBQUUsS0FBSyxDQUFDO2dCQUNDLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEtBQUssR0FBRyxDQUFDLEdBQUcsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO29CQUNsRSxFQUFFLElBQUksQ0FBQztNQUNyQixFQUFFLElBQUksQ0FBQztRQUNMLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2YsQ0FBQzs7R0FFRixVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSTtJQUMxQixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVc7S0FDM0IsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNqQyxDQUFDO0lBQ0YsQ0FBQyxDQUFDOztHQUVILE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDOztHQUUzQyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7O0dBRWxCLE9BQU87SUFDTixJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUQsUUFBUTtJQUNSLFdBQVc7SUFDWCxJQUFJLEVBQUUsWUFBWTtJQUNsQixJQUFJO0lBQ0osQ0FBQztHQUNGLENBQUMsQ0FBQztDQUNKOztBQ25JRCxJQUFJdUIsTUFBSSxDQUFDOztBQUVULEFBQU8sU0FBU3RCLEtBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0NBQzdCLElBQUksQ0FBQ3NCLE1BQUksSUFBSSxhQUFvQixLQUFLLFlBQVksRUFBRTtFQUNuREEsTUFBSSxHQUFHUyxjQUFZLEVBQUUsQ0FBQztFQUN0Qjs7Q0FFRCxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRVQsTUFBSSxDQUFDLENBQUM7Q0FDckI7Ozs7OztBQ1hjLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRTtDQUNqQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sS0FBSztFQUN0QyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7O0VBRWIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7O0VBRXhCLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSTtHQUN2QixHQUFHLElBQUksS0FBSyxDQUFDO0dBQ2IsQ0FBQyxDQUFDOztFQUVILEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU07R0FDbkIsSUFBSTtJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDeEIsQ0FBQyxPQUFPLEdBQUcsRUFBRTtJQUNiLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNaO0dBQ0QsQ0FBQyxDQUFDO0VBQ0gsQ0FBQyxDQUFDOzs7Q0FDSCxEQ2RNLGVBQWUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7Q0FDcEMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQztDQUNyQixJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU87O0NBRWxCLElBQUk7RUFDSCxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztFQUV4QyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsQ0FBQzs7a0NBRUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O0VBRTNFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0dBQ2QsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7R0FDOUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0dBQ2QsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO0dBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRztHQUNmLENBQUMsQ0FBQztFQUNILENBQUMsT0FBTyxHQUFHLEVBQUU7RUFDYixJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtHQUNkLEtBQUssRUFBRSxHQUFHLENBQUMsT0FBTztHQUNsQixDQUFDLENBQUM7RUFDSDtDQUNEOzs7Ozs7QUN4Qk0sU0FBU3RCLEtBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0NBQzdCLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN2QyxJQUFJLEFBQXlDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtFQUMxRSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ25CLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUNWLE9BQU87RUFDUDtDQUNEZ0MsbUJBQWdCLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztHQUM1QixFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU07R0FDbEIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNuQixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7R0FDVixDQUFDO0dBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ1osR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxjQUFjLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0NBQzFEOzs7Ozs7QUNWRCxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDOztBQUUvRCxlQUFlLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0NBQ3BDLE1BQU0sSUFBSSxHQUFHLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzdELE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7O0NBRTFGLElBQUk7RUFDSCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTXBCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7R0FDdEMsT0FBTyxFQUFFO0lBQ1IsWUFBWSxFQUFFLG9CQUFvQjtJQUNsQztHQUNELENBQUMsQ0FBQzs7O0VBR0gsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztFQUU3RSxJQUFJLENBQUMsSUFBSSxFQUFFO0dBQ1YsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O0dBRW5ELElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxDQUFDOzs7O0dBSW5CLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7R0FDbEM7O0VBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0VBQy9CLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQzs7RUFFL0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSTtHQUNoRCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQzs7R0FFL0MsT0FBTztJQUNOLElBQUk7SUFDSixNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPO0lBQy9CLENBQUM7R0FDRixDQUFDLENBQUM7OztFQUdILE1BQU0sS0FBSyxDQUFDLENBQUM7OztFQUdiLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFFdEUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7R0FDZCxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0dBQ2xCLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVztHQUN0QixLQUFLO0dBQ0wsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtHQUNwQixDQUFDLENBQUM7RUFDSCxDQUFDLE9BQU8sR0FBRyxFQUFFO0VBQ2IsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0VBQ2xEO0NBQ0Q7O0FBRUQsQUFBTyxlQUFlWixLQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTs7Q0FFbkMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7O0NBRTNDLElBQUksT0FBTyxFQUFFO0VBQ1osT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtHQUNyQixPQUFPLEVBQUUsSUFBSTtHQUNiLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7R0FDbEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLO0dBQ25CLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztHQUNwQixLQUFLLEVBQUUsSUFBSTtHQUNYLENBQUMsQ0FBQztFQUNIOztDQUVELEFBQTRDOzs7RUFHM0MsR0FBRyxDQUFDLElBQUk7R0FDUCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0dBQy9ELENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFTLElBQUk7R0FDL0IsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNwQixHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3ZELENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7RUFDbEMsT0FBTztFQUNQOztDQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQyxDQUFDOzs7O0NBSTNCLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Q0FFcEIsSUFBSSxDQUFDLEdBQUcsRUFBRTtFQUNULE9BQU8sV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUM3Qjs7Q0FFRCxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtFQUNkLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO0VBQzlCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtFQUNkLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztFQUNoQixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7RUFDaEIsQ0FBQyxDQUFDO0NBQ0g7O0FBRUQsQUFBTyxlQUFlLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0NBQ3JDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUM7Q0FDckIsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPOztDQUVsQixJQUFJLEVBQUUsQ0FBQztDQUNQLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDOztDQUUxQixJQUFJO0VBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDL0UsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztFQUM3RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLDZCQUE2QixFQUFFLENBQUMsQ0FBQztFQUM3RixFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNaLENBQUMsT0FBTyxHQUFHLEVBQUU7RUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO0VBQzVDLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUN0Qjs7Q0FFRCxJQUFJO0VBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDNUIsR0FBRyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7RUFDekIsSUFBSSxDQUFDLENBQUM7RUFDTixNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7RUFDaEIsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ2hCLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRTtHQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDYixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUMzRDs7RUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUN0RCxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7O0VBRWpELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7RUFFcEYsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7R0FDZCxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztHQUM5QixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7R0FDZCxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7R0FDaEIsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHO0dBQ2YsQ0FBQyxDQUFDO0VBQ0gsQ0FBQyxPQUFPLEdBQUcsRUFBRTtFQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDNUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7RUFDdkM7Q0FDRDs7Ozs7OztBQ3BKTSxTQUFTQSxLQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtDQUM3QixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSw2Q0FBNkMsRUFBRSxDQUFDLENBQUM7Q0FDaEYsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDOzs7Ozs7O0FDRlg7QUFDQSxBQWdDQTtBQUNBLE1BQU0sQ0FBQyxHQUFHLGtCQUFrQixDQUFDOztBQUU3QixBQUFPLE1BQU0sUUFBUSxHQUFHO0NBQ3ZCLGFBQWEsRUFBRTtFQUNkOztHQUVDLE9BQU8sRUFBRSxtQkFBbUI7R0FDNUIsUUFBUSxFQUFFLE9BQU87R0FDakIsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDO0dBQ2xCOztFQUVEOztHQUVDLE9BQU8sRUFBRSw4QkFBOEI7R0FDdkMsUUFBUSxFQUFFLE9BQU87R0FDakIsTUFBTSxFQUFFLEtBQUssS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUN4Qzs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsbUJBQW1CO0dBQzVCLFFBQVEsRUFBRSxPQUFPO0dBQ2pCLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQztHQUNsQjs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsZ0NBQWdDO0dBQ3pDLFFBQVEsRUFBRSxPQUFPO0dBQ2pCLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQztHQUNsQjs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsOEJBQThCO0dBQ3ZDLFFBQVEsRUFBRSxPQUFPO0dBQ2pCLE1BQU0sRUFBRSxLQUFLLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDeEM7O0VBRUQ7O0dBRUMsT0FBTyxFQUFFLGVBQWU7R0FDeEIsUUFBUSxFQUFFLE9BQU87R0FDakIsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDO0dBQ2xCOztFQUVEOztHQUVDLE9BQU8sRUFBRSx1QkFBdUI7R0FDaEMsUUFBUSxFQUFFLE9BQU87R0FDakIsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDO0dBQ2xCOztFQUVEOztHQUVDLE9BQU8sRUFBRSxxQkFBcUI7R0FDOUIsUUFBUSxFQUFFLE9BQU87R0FDakIsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDO0dBQ2xCOztFQUVEOztHQUVDLE9BQU8sRUFBRSxvQkFBb0I7R0FDN0IsUUFBUSxFQUFFLE9BQU87R0FDakIsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDO0dBQ2xCOztFQUVEOztHQUVDLE9BQU8sRUFBRSxlQUFlO0dBQ3hCLFFBQVEsRUFBRSxPQUFPO0dBQ2pCLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQztHQUNsQjs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsbUJBQW1CO0dBQzVCLFFBQVEsRUFBRSxRQUFRO0dBQ2xCLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQztHQUNsQjs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsMEJBQTBCO0dBQ25DLFFBQVEsRUFBRSxRQUFRO0dBQ2xCLE1BQU0sRUFBRSxLQUFLLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDeEM7O0VBRUQ7O0dBRUMsT0FBTyxFQUFFLGFBQWE7R0FDdEIsUUFBUSxFQUFFLFFBQVE7R0FDbEIsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDO0dBQ2xCOztFQUVEOztHQUVDLE9BQU8sRUFBRSxlQUFlO0dBQ3hCLFFBQVEsRUFBRSxRQUFRO0dBQ2xCLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQztHQUNsQjs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsdUJBQXVCO0dBQ2hDLFFBQVEsRUFBRSxRQUFRO0dBQ2xCLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQztHQUNsQjs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsdUJBQXVCO0dBQ2hDLFFBQVEsRUFBRSxRQUFRO0dBQ2xCLE1BQU0sRUFBRSxLQUFLLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0dBQ25EOztFQUVEOztHQUVDLE9BQU8sRUFBRSwwQkFBMEI7R0FDbkMsUUFBUSxFQUFFLFFBQVE7R0FDbEIsTUFBTSxFQUFFLEtBQUssS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUN0Qzs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsWUFBWTtHQUNyQixRQUFRLEVBQUUsUUFBUTtHQUNsQixNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUM7R0FDbEI7RUFDRDs7Q0FFRCxLQUFLLEVBQUU7RUFDTjs7R0FFQyxPQUFPLEVBQUUsTUFBTTtHQUNmLEtBQUssRUFBRTtJQUNOLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRWlDLGVBQVcsRUFBRTtJQUMvRDtHQUNEOztFQUVEOztHQUVDLE9BQU8sRUFBRSxpQkFBaUI7R0FDMUIsS0FBSyxFQUFFO0lBQ04sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUVDLGVBQVcsRUFBRSxPQUFPLEVBQUVDLGVBQVMsRUFBRTtJQUMvRjtHQUNEOztFQUVEOztHQUVDLE9BQU8sRUFBRSxpQkFBaUI7R0FDMUIsS0FBSyxFQUFFO0lBQ04sRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLHlCQUF5QixFQUFFLFNBQVMsRUFBRUMsZUFBVyxFQUFFLE9BQU8sRUFBRUMsZUFBUyxFQUFFO0lBQ3pHLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFQyxlQUFXLEVBQUUsT0FBTyxFQUFFQyxlQUFTLEVBQUU7SUFDL0Y7R0FDRDs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsNEJBQTRCO0dBQ3JDLEtBQUssRUFBRTtJQUNOLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSx5QkFBeUIsRUFBRSxTQUFTLEVBQUVILGVBQVcsRUFBRSxPQUFPLEVBQUVDLGVBQVMsRUFBRTtJQUN6RyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsOEJBQThCLEVBQUUsU0FBUyxFQUFFRyxlQUFXLEVBQUUsT0FBTyxFQUFFQyxlQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ3RKO0dBQ0Q7O0VBRUQ7O0dBRUMsT0FBTyxFQUFFLGFBQWE7R0FDdEIsS0FBSyxFQUFFO0lBQ04sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUVDLGVBQVcsRUFBRSxPQUFPLEVBQUVDLGVBQVMsRUFBRTtJQUN2RjtHQUNEOztFQUVEOztHQUVDLE9BQU8sRUFBRSxhQUFhO0dBQ3RCLEtBQUssRUFBRTtJQUNOLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFQyxlQUFXLEVBQUUsT0FBTyxFQUFFQyxlQUFTLEVBQUU7SUFDdkY7R0FDRDs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsd0JBQXdCO0dBQ2pDLEtBQUssRUFBRTtJQUNOLElBQUk7SUFDSixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRUMsY0FBVyxFQUFFLE9BQU8sRUFBRUMsY0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUN4STtHQUNEOztFQUVEOztHQUVDLE9BQU8sRUFBRSxhQUFhO0dBQ3RCLEtBQUssRUFBRTtJQUNOLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFQyxlQUFXLEVBQUUsT0FBTyxFQUFFQyxlQUFTLEVBQUU7SUFDdkY7R0FDRDs7RUFFRDs7R0FFQyxPQUFPLEVBQUUsYUFBYTtHQUN0QixLQUFLLEVBQUU7SUFDTixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRUMsZUFBVyxFQUFFLE9BQU8sRUFBRUMsZUFBUyxFQUFFO0lBQ3ZGO0dBQ0Q7O0VBRUQ7O0dBRUMsT0FBTyxFQUFFLG9CQUFvQjtHQUM3QixLQUFLLEVBQUU7SUFDTixJQUFJO0lBQ0osRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUVDLGFBQVksRUFBRSxPQUFPLEVBQUVDLGFBQVUsRUFBRTtJQUMvRjtHQUNEOztFQUVEOztHQUVDLE9BQU8sRUFBRSx3QkFBd0I7R0FDakMsS0FBSyxFQUFFO0lBQ04sSUFBSTtJQUNKLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsU0FBUyxFQUFFQyxlQUFZLEVBQUUsT0FBTyxFQUFFQyxlQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQzFJO0dBQ0Q7RUFDRDs7T0FFREMsVUFBSTtDQUNKLFlBQVksRUFBRSxNQUFNLEVBQUU7UUFDdEJDLFdBQUs7Q0FDTCxDQUFDOztBQUVGLEFBQU8sTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUM7O0FBRTFDLEFBQU8sTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDOztBQ2hRN0IsU0FBUyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUU7Q0FDekMsZUFBZSxZQUFZLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0VBQ2xELEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7RUFFeEQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7O0VBR3hDLE1BQU0sYUFBYSxHQUFHLE1BQU0sS0FBSyxRQUFRLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQztFQUMzRCxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQ3BELElBQUksYUFBYSxFQUFFO0dBQ2xCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUU7SUFDOUIsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBQ3RDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNsQixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7OztJQUduQixHQUFHLENBQUMsS0FBSyxHQUFHLFNBQVMsS0FBSyxFQUFFO0tBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ2hDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzVCLENBQUM7O0lBRUYsR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLElBQUksRUFBRSxLQUFLLEVBQUU7S0FDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQztLQUNwQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNoQyxDQUFDOztJQUVGLEdBQUcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxLQUFLLEVBQUU7S0FDekIsSUFBSSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDM0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7O0tBRTFCLE9BQU8sQ0FBQyxJQUFJLENBQUM7TUFDWixVQUFVLEVBQUUsSUFBSTtNQUNoQixLQUFLLEVBQUUsTUFBTTtNQUNiLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztNQUNaLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtNQUNsQixNQUFNLEVBQUUsR0FBRyxDQUFDLFVBQVU7TUFDdEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUM7TUFDN0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO01BQ3RDLENBQUMsQ0FBQztLQUNILENBQUM7SUFDRjs7R0FFRCxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsS0FBSztJQUM1QixJQUFJLEdBQUcsRUFBRTtLQUNSLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0tBQ3JCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3JCLE1BQU07S0FDTixPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3ZCO0lBQ0QsQ0FBQzs7R0FFRixJQUFJO0lBQ0gsTUFBTSxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMzQyxDQUFDLE9BQU8sR0FBRyxFQUFFO0lBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakI7R0FDRCxNQUFNOztHQUVOLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkI7RUFDRDs7Q0FFRCxPQUFPLFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0VBQzFDLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO0dBQzNCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO0lBQ2pDLFlBQVksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwQyxPQUFPO0lBQ1A7R0FDRDs7RUFFRCxJQUFJLEVBQUUsQ0FBQztFQUNQLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7QUFjRCxJQUFJLE9BQU8sR0FBRzlDLE9BQUssQ0FBQztBQUNwQixJQUFJLFdBQVcsR0FBRyxTQUFTLENBQUM7Ozs7Ozs7QUFPNUIsSUFBSSxNQUFNLEdBQUcsa0JBQWtCLENBQUM7QUFDaEMsSUFBSSxNQUFNLEdBQUcsa0JBQWtCLENBQUM7QUFDaEMsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDOzs7Ozs7Ozs7O0FBVTVCLElBQUksa0JBQWtCLEdBQUcsdUNBQXVDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBY2pFLFNBQVNBLE9BQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0VBQzNCLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO0lBQzNCLE1BQU0sSUFBSSxTQUFTLENBQUMsK0JBQStCLENBQUMsQ0FBQztHQUN0RDs7RUFFRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7RUFDYixJQUFJLEdBQUcsR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0VBQ3hCLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7RUFDdkMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUM7O0VBRS9CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3JDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7SUFHL0IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQ2QsU0FBUztLQUNWOztJQUVELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDOzs7SUFHcEQsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO01BQ2pCLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3hCOzs7SUFHRCxJQUFJLFNBQVMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDekIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDaEM7R0FDRjs7RUFFRCxPQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkQsU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUU7RUFDckMsSUFBSSxHQUFHLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztFQUN4QixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQzs7RUFFL0IsSUFBSSxPQUFPLEdBQUcsS0FBSyxVQUFVLEVBQUU7SUFDN0IsTUFBTSxJQUFJLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0dBQ2pEOztFQUVELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDbEMsTUFBTSxJQUFJLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0dBQ2pEOztFQUVELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7RUFFckIsSUFBSSxLQUFLLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDNUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0dBQ2hEOztFQUVELElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDOztFQUU3QixJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFO0lBQ3RCLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUNoRSxHQUFHLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDMUM7O0VBRUQsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFO0lBQ2QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7TUFDeEMsTUFBTSxJQUFJLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0tBQ2pEOztJQUVELEdBQUcsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztHQUNqQzs7RUFFRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7SUFDWixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtNQUN0QyxNQUFNLElBQUksU0FBUyxDQUFDLHdCQUF3QixDQUFDLENBQUM7S0FDL0M7O0lBRUQsR0FBRyxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0dBQzdCOztFQUVELElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRTtJQUNmLElBQUksT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUU7TUFDakQsTUFBTSxJQUFJLFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0tBQ2xEOztJQUVELEdBQUcsSUFBSSxZQUFZLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztHQUNqRDs7RUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7SUFDaEIsR0FBRyxJQUFJLFlBQVksQ0FBQztHQUNyQjs7RUFFRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7SUFDZCxHQUFHLElBQUksVUFBVSxDQUFDO0dBQ25COztFQUVELElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtJQUNoQixJQUFJLFFBQVEsR0FBRyxPQUFPLEdBQUcsQ0FBQyxRQUFRLEtBQUssUUFBUTtRQUMzQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7O0lBRTlDLFFBQVEsUUFBUTtNQUNkLEtBQUssSUFBSTtRQUNQLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQztRQUMzQixNQUFNO01BQ1IsS0FBSyxLQUFLO1FBQ1IsR0FBRyxJQUFJLGdCQUFnQixDQUFDO1FBQ3hCLE1BQU07TUFDUixLQUFLLFFBQVE7UUFDWCxHQUFHLElBQUksbUJBQW1CLENBQUM7UUFDM0IsTUFBTTtNQUNSLEtBQUssTUFBTTtRQUNULEdBQUcsSUFBSSxpQkFBaUIsQ0FBQztRQUN6QixNQUFNO01BQ1I7UUFDRSxNQUFNLElBQUksU0FBUyxDQUFDLDRCQUE0QixDQUFDLENBQUM7S0FDckQ7R0FDRjs7RUFFRCxPQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7O0FBVUQsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRTtFQUM5QixJQUFJO0lBQ0YsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDcEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtJQUNWLE9BQU8sR0FBRyxDQUFDO0dBQ1o7Q0FDRjs7QUFFRCxJQUFJLE1BQU0sR0FBRztDQUNaLEtBQUssRUFBRSxPQUFPO0NBQ2QsU0FBUyxFQUFFLFdBQVc7Q0FDdEIsQ0FBQzs7QUFFRixJQUFJLEtBQUssR0FBRyx3REFBd0QsQ0FBQztBQUNyRSxJQUFJLFdBQVcsR0FBRywrQkFBK0IsQ0FBQztBQUNsRCxJQUFJLFFBQVEsR0FBRywrWEFBK1gsQ0FBQztBQUMvWSxJQUFJLE9BQU8sR0FBRztJQUNWLEdBQUcsRUFBRSxTQUFTO0lBQ2QsR0FBRyxFQUFFLFNBQVM7SUFDZCxHQUFHLEVBQUUsU0FBUztJQUNkLElBQUksRUFBRSxNQUFNO0lBQ1osSUFBSSxFQUFFLEtBQUs7SUFDWCxJQUFJLEVBQUUsS0FBSztJQUNYLElBQUksRUFBRSxLQUFLO0lBQ1gsSUFBSSxFQUFFLEtBQUs7SUFDWCxJQUFJLEVBQUUsS0FBSztJQUNYLElBQUksRUFBRSxLQUFLO0lBQ1gsUUFBUSxFQUFFLFNBQVM7SUFDbkIsUUFBUSxFQUFFLFNBQVM7Q0FDdEIsQ0FBQztBQUNGLElBQUksMkJBQTJCLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakcsU0FBUyxPQUFPLENBQUMsS0FBSyxFQUFFO0lBQ3BCLElBQUksTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDdkIsU0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ2pCLElBQUksT0FBTyxLQUFLLEtBQUssVUFBVSxFQUFFO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztTQUNsRDtRQUNELElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE9BQU87U0FDVjtRQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDckIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFCLFFBQVEsSUFBSTtnQkFDUixLQUFLLFFBQVEsQ0FBQztnQkFDZCxLQUFLLFFBQVEsQ0FBQztnQkFDZCxLQUFLLFNBQVMsQ0FBQztnQkFDZixLQUFLLE1BQU0sQ0FBQztnQkFDWixLQUFLLFFBQVE7b0JBQ1QsT0FBTztnQkFDWCxLQUFLLE9BQU87b0JBQ1IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEIsTUFBTTtnQkFDVixLQUFLLEtBQUssQ0FBQztnQkFDWCxLQUFLLEtBQUs7b0JBQ04sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2hDLE1BQU07Z0JBQ1Y7b0JBQ0ksSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekMsSUFBSSxLQUFLLEtBQUssTUFBTSxDQUFDLFNBQVM7d0JBQzFCLEtBQUssS0FBSyxJQUFJO3dCQUNkLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssMkJBQTJCLEVBQUU7d0JBQ3JGLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztxQkFDM0Q7b0JBQ0QsSUFBSSxNQUFNLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTt3QkFDaEQsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO3FCQUNoRTtvQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQy9FO1NBQ0o7S0FDSjtJQUNELElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNaLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDYixNQUFNLENBQUMsVUFBVSxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQ2pELElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQzdDLE9BQU8sQ0FBQyxVQUFVLEtBQUssRUFBRSxDQUFDLEVBQUU7UUFDN0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkMsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFO1FBQ3RCLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNsQixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDM0I7UUFDRCxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNwQixPQUFPLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLFFBQVEsSUFBSTtZQUNSLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFNBQVM7Z0JBQ1YsT0FBTyxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUN4RCxLQUFLLFFBQVE7Z0JBQ1QsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDNUIsS0FBSyxNQUFNO2dCQUNQLE9BQU8sV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDL0MsS0FBSyxPQUFPO2dCQUNSLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BGLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7Z0JBQ3hFLE9BQU8sR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNoRCxLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssS0FBSztnQkFDTixPQUFPLE1BQU0sR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDcEY7Z0JBQ0ksSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxFQUFFLEVBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO2dCQUM5SCxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7b0JBQ2hCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQzswQkFDOUIsb0NBQW9DLEdBQUcsR0FBRyxHQUFHLEdBQUc7MEJBQ2hELHFCQUFxQixDQUFDO2lCQUMvQjtnQkFDRCxPQUFPLEdBQUcsQ0FBQztTQUNsQjtLQUNKO0lBQ0QsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtRQUNaLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ2pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEIsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDekMsT0FBTzthQUNWO1lBQ0QsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFCLFFBQVEsSUFBSTtnQkFDUixLQUFLLFFBQVEsQ0FBQztnQkFDZCxLQUFLLFFBQVEsQ0FBQztnQkFDZCxLQUFLLFNBQVM7b0JBQ1YsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO29CQUM1RCxNQUFNO2dCQUNWLEtBQUssUUFBUTtvQkFDVCxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO29CQUNoQyxNQUFNO2dCQUNWLEtBQUssTUFBTTtvQkFDUCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7b0JBQ25ELE1BQU07Z0JBQ1YsS0FBSyxPQUFPO29CQUNSLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7b0JBQzdDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO3dCQUMxQixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDM0QsQ0FBQyxDQUFDO29CQUNILE1BQU07Z0JBQ1YsS0FBSyxLQUFLO29CQUNOLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3pCLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3RILE1BQU07Z0JBQ1YsS0FBSyxLQUFLO29CQUNOLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3pCLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRTt3QkFDL0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3pCLE9BQU8sTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztxQkFDNUQsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNkLE1BQU07Z0JBQ1Y7b0JBQ0ksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksR0FBRyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFDcEYsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLEVBQUU7d0JBQ3RDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUM5RSxDQUFDLENBQUM7YUFDVjtTQUNKLENBQUMsQ0FBQztRQUNILFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sWUFBWSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQy9HO1NBQ0k7UUFDRCxPQUFPLEdBQUcsQ0FBQztLQUNkO0NBQ0o7QUFDRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUU7SUFDbEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsR0FBRztRQUNDLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDeEMsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNwQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUU7SUFDbkIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0NBQ2xEO0FBQ0QsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFFO0lBQ3hCLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQztDQUNsQztBQUNELFNBQVMsa0JBQWtCLENBQUMsS0FBSyxFQUFFO0lBQy9CLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUTtRQUN6QixPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQyxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUM7UUFDaEIsT0FBTyxRQUFRLENBQUM7SUFDcEIsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQztRQUM1QixPQUFPLElBQUksQ0FBQztJQUNoQixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEIsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRO1FBQ3pCLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUMsT0FBTyxHQUFHLENBQUM7Q0FDZDtBQUNELFNBQVMsT0FBTyxDQUFDLEtBQUssRUFBRTtJQUNwQixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN0Q7QUFDRCxTQUFTLGdCQUFnQixDQUFDLENBQUMsRUFBRTtJQUN6QixPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDMUI7QUFDRCxTQUFTLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtJQUM1QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7Q0FDckQ7QUFDRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUU7SUFDbEIsT0FBTyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNoRztBQUNELFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRTtJQUNuQixPQUFPLDRCQUE0QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0NBQ2xIO0FBQ0QsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFO0lBQzFCLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3BDLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLElBQUksS0FBSyxHQUFHLEVBQUU7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDO1NBQ25CO2FBQ0ksSUFBSSxJQUFJLElBQUksT0FBTyxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDM0I7YUFDSSxJQUFJLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtZQUN2QyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7O1lBR2pDLElBQUksSUFBSSxJQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsRUFBRTtnQkFDdEQsTUFBTSxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM3QjtpQkFDSTtnQkFDRCxNQUFNLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDckQ7U0FDSjthQUNJO1lBQ0QsTUFBTSxJQUFJLElBQUksQ0FBQztTQUNsQjtLQUNKO0lBQ0QsTUFBTSxJQUFJLEdBQUcsQ0FBQztJQUNkLE9BQU8sTUFBTSxDQUFDO0NBQ2pCOzs7OztBQUtELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRWpDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTVCLE1BQU0sSUFBSSxDQUFDO0NBQ1YsV0FBVyxHQUFHO0VBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7RUFFaEIsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQy9CLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFFN0IsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0VBQ25CLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQzs7RUFFYixJQUFJLFNBQVMsRUFBRTtHQUNkLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQztHQUNwQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDaEMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksTUFBTSxDQUFDO0lBQ1gsSUFBSSxPQUFPLFlBQVksTUFBTSxFQUFFO0tBQzlCLE1BQU0sR0FBRyxPQUFPLENBQUM7S0FDakIsTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7S0FDdkMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUM3RSxNQUFNLElBQUksT0FBTyxZQUFZLFdBQVcsRUFBRTtLQUMxQyxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM5QixNQUFNLElBQUksT0FBTyxZQUFZLElBQUksRUFBRTtLQUNuQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3pCLE1BQU07S0FDTixNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLE9BQU8sS0FBSyxRQUFRLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQzlFO0lBQ0QsSUFBSSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQjtHQUNEOztFQUVELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztFQUV0QyxJQUFJLElBQUksR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztFQUN2RixJQUFJLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtHQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0dBQ2xCO0VBQ0Q7Q0FDRCxJQUFJLElBQUksR0FBRztFQUNWLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQztFQUMzQjtDQUNELElBQUksSUFBSSxHQUFHO0VBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbEI7Q0FDRCxJQUFJLEdBQUc7RUFDTixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7RUFDaEQ7Q0FDRCxXQUFXLEdBQUc7RUFDYixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDekIsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUM3RSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDM0I7Q0FDRCxNQUFNLEdBQUc7RUFDUixNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO0VBQ2hDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsWUFBWSxFQUFFLENBQUM7RUFDaEMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztFQUM1QixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3BCLE9BQU8sUUFBUSxDQUFDO0VBQ2hCO0NBQ0QsUUFBUSxHQUFHO0VBQ1YsT0FBTyxlQUFlLENBQUM7RUFDdkI7Q0FDRCxLQUFLLEdBQUc7RUFDUCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztFQUV2QixNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDM0IsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3pCLElBQUksYUFBYSxFQUFFLFdBQVcsQ0FBQztFQUMvQixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7R0FDeEIsYUFBYSxHQUFHLENBQUMsQ0FBQztHQUNsQixNQUFNLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtHQUNyQixhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQzFDLE1BQU07R0FDTixhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDdEM7RUFDRCxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7R0FDdEIsV0FBVyxHQUFHLElBQUksQ0FBQztHQUNuQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtHQUNuQixXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQ3RDLE1BQU07R0FDTixXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDbEM7RUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0VBRXRELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUM1QixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUM7RUFDdkUsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQztFQUM1QixPQUFPLElBQUksQ0FBQztFQUNaO0NBQ0Q7O0FBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Q0FDdkMsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUMxQixJQUFJLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQzFCLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDM0IsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFO0NBQ3pELEtBQUssRUFBRSxNQUFNO0NBQ2IsUUFBUSxFQUFFLEtBQUs7Q0FDZixVQUFVLEVBQUUsS0FBSztDQUNqQixZQUFZLEVBQUUsSUFBSTtDQUNsQixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkgsU0FBUyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7RUFDOUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7O0VBRTFCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0VBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOzs7RUFHakIsSUFBSSxXQUFXLEVBQUU7SUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztHQUMzQzs7O0VBR0QsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDakQ7O0FBRUQsVUFBVSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0RCxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFDOUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDOztBQUV6QyxJQUFJLE9BQU8sQ0FBQztBQUNaLElBQUk7Q0FDSCxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztDQUN0QyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7O0FBRWQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7OztBQUczQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDOzs7Ozs7Ozs7OztBQVd2QyxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUU7Q0FDbkIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDOztDQUVqQixJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFO0tBQzdFLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztDQUUxQixJQUFJLElBQUksR0FBRyxTQUFTLEtBQUssU0FBUyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7Q0FDbkQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztDQUNoQyxJQUFJLE9BQU8sR0FBRyxZQUFZLEtBQUssU0FBUyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUM7O0NBRTVELElBQUksSUFBSSxJQUFJLElBQUksRUFBRTs7RUFFakIsSUFBSSxHQUFHLElBQUksQ0FBQztFQUNaLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTs7RUFFbkMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7RUFDcEMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxzQkFBc0IsRUFBRTs7RUFFdEksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDekIsTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7O0VBRXBDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDbEUsTUFBTSxJQUFJLElBQUksWUFBWSxNQUFNLEVBQUUsQ0FBQyxNQUFNOzs7RUFHekMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDakM7Q0FDRCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUc7RUFDakIsSUFBSTtFQUNKLFNBQVMsRUFBRSxLQUFLO0VBQ2hCLEtBQUssRUFBRSxJQUFJO0VBQ1gsQ0FBQztDQUNGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0NBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOztDQUV2QixJQUFJLElBQUksWUFBWSxNQUFNLEVBQUU7RUFDM0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxHQUFHLEVBQUU7R0FDL0IsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksS0FBSyxZQUFZLEdBQUcsR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsNENBQTRDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQzFKLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0dBQy9CLENBQUMsQ0FBQztFQUNIO0NBQ0Q7O0FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRztDQUNoQixJQUFJLElBQUksR0FBRztFQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM1Qjs7Q0FFRCxJQUFJLFFBQVEsR0FBRztFQUNkLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztFQUNqQzs7Ozs7OztDQU9ELFdBQVcsR0FBRztFQUNiLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUU7R0FDakQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ3pFLENBQUMsQ0FBQztFQUNIOzs7Ozs7O0NBT0QsSUFBSSxHQUFHO0VBQ04sSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDaEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRTtHQUNqRCxPQUFPLE1BQU0sQ0FBQyxNQUFNOztHQUVwQixJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUU7SUFDWixJQUFJLEVBQUUsRUFBRSxDQUFDLFdBQVcsRUFBRTtJQUN0QixDQUFDLEVBQUU7SUFDSCxDQUFDLE1BQU0sR0FBRyxHQUFHO0lBQ2IsQ0FBQyxDQUFDO0dBQ0gsQ0FBQyxDQUFDO0VBQ0g7Ozs7Ozs7Q0FPRCxJQUFJLEdBQUc7RUFDTixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0VBRWxCLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxNQUFNLEVBQUU7R0FDcEQsSUFBSTtJQUNILE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNyQyxDQUFDLE9BQU8sR0FBRyxFQUFFO0lBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDakk7R0FDRCxDQUFDLENBQUM7RUFDSDs7Ozs7OztDQU9ELElBQUksR0FBRztFQUNOLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxNQUFNLEVBQUU7R0FDcEQsT0FBTyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDekIsQ0FBQyxDQUFDO0VBQ0g7Ozs7Ozs7Q0FPRCxNQUFNLEdBQUc7RUFDUixPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDOUI7Ozs7Ozs7O0NBUUQsYUFBYSxHQUFHO0VBQ2YsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDOztFQUVsQixPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsTUFBTSxFQUFFO0dBQ3BELE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDM0MsQ0FBQyxDQUFDO0VBQ0g7Q0FDRCxDQUFDOzs7QUFHRixNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtDQUN2QyxJQUFJLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQzFCLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDOUIsV0FBVyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUNqQyxJQUFJLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQzFCLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDMUIsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUMxQixDQUFDLENBQUM7O0FBRUgsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLEtBQUssRUFBRTtDQUM3QixLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7O0VBRTlELElBQUksRUFBRSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7R0FDckIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDbkUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQ3pDO0VBQ0Q7Q0FDRCxDQUFDOzs7Ozs7Ozs7QUFTRixTQUFTLFdBQVcsR0FBRztDQUN0QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0NBRWxCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtFQUM5QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2hGOztDQUVELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztDQUVqQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUU7RUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDbEQ7O0NBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzs7O0NBR3JCLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtFQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUM3Qzs7O0NBR0QsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7RUFDakIsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNyQjs7O0NBR0QsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO0VBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbEM7OztDQUdELElBQUksRUFBRSxJQUFJLFlBQVksTUFBTSxDQUFDLEVBQUU7RUFDOUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDN0M7Ozs7Q0FJRCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7Q0FDZixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7Q0FDbkIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDOztDQUVsQixPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7RUFDbEQsSUFBSSxVQUFVLENBQUM7OztFQUdmLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtHQUNuQixVQUFVLEdBQUcsVUFBVSxDQUFDLFlBQVk7SUFDbkMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNiLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUMxSCxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNuQjs7O0VBR0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxHQUFHLEVBQUU7R0FDL0IsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTs7SUFFOUIsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNiLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNaLE1BQU07O0lBRU4sTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsNENBQTRDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkg7R0FDRCxDQUFDLENBQUM7O0VBRUgsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLLEVBQUU7R0FDaEMsSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtJQUM1QixPQUFPO0lBQ1A7O0dBRUQsSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUU7SUFDM0QsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNiLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDL0YsT0FBTztJQUNQOztHQUVELFVBQVUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDO0dBQzNCLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDbEIsQ0FBQyxDQUFDOztFQUVILElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFlBQVk7R0FDMUIsSUFBSSxLQUFLLEVBQUU7SUFDVixPQUFPO0lBQ1A7O0dBRUQsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztHQUV6QixJQUFJO0lBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQyxPQUFPLEdBQUcsRUFBRTs7SUFFYixNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQywrQ0FBK0MsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0SDtHQUNELENBQUMsQ0FBQztFQUNILENBQUMsQ0FBQztDQUNIOzs7Ozs7Ozs7O0FBVUQsU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtDQUNyQyxJQUFJLE9BQU8sT0FBTyxLQUFLLFVBQVUsRUFBRTtFQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLDhFQUE4RSxDQUFDLENBQUM7RUFDaEc7O0NBRUQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUN2QyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUM7Q0FDdEIsSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDOzs7Q0FHYixJQUFJLEVBQUUsRUFBRTtFQUNQLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDbEM7OztDQUdELEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7O0NBR3ZDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFO0VBQ2hCLEdBQUcsR0FBRyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDakQ7OztDQUdELElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFO0VBQ2hCLEdBQUcsR0FBRyx3RUFBd0UsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O0VBRXpGLElBQUksR0FBRyxFQUFFO0dBQ1IsR0FBRyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7R0FDdEM7RUFDRDs7O0NBR0QsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLEVBQUU7RUFDaEIsR0FBRyxHQUFHLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNuRDs7O0NBR0QsSUFBSSxHQUFHLEVBQUU7RUFDUixPQUFPLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDOzs7O0VBSXBCLElBQUksT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO0dBQzlDLE9BQU8sR0FBRyxTQUFTLENBQUM7R0FDcEI7RUFDRDs7O0NBR0QsT0FBTyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztDQUNwRDs7Ozs7Ozs7O0FBU0QsU0FBUyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7O0NBRS9CLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLE9BQU8sR0FBRyxDQUFDLE1BQU0sS0FBSyxVQUFVLElBQUksT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLFVBQVUsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLEtBQUssVUFBVSxJQUFJLE9BQU8sR0FBRyxDQUFDLE1BQU0sS0FBSyxVQUFVLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxLQUFLLFVBQVUsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLEtBQUssVUFBVSxFQUFFO0VBQzNPLE9BQU8sS0FBSyxDQUFDO0VBQ2I7OztDQUdELE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssaUJBQWlCLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLDBCQUEwQixJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUM7Q0FDMUo7Ozs7Ozs7QUFPRCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUU7Q0FDcEIsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksT0FBTyxHQUFHLENBQUMsV0FBVyxLQUFLLFVBQVUsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLE9BQU8sR0FBRyxDQUFDLE1BQU0sS0FBSyxVQUFVLElBQUksT0FBTyxHQUFHLENBQUMsV0FBVyxLQUFLLFVBQVUsSUFBSSxPQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Q0FDaFU7Ozs7Ozs7O0FBUUQsU0FBUyxLQUFLLENBQUMsUUFBUSxFQUFFO0NBQ3hCLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztDQUNYLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7OztDQUd6QixJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7RUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0VBQ3REOzs7O0NBSUQsSUFBSSxJQUFJLFlBQVksTUFBTSxJQUFJLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUU7O0VBRXJFLEVBQUUsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0VBQ3ZCLEVBQUUsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0VBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztFQUVkLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQzlCLElBQUksR0FBRyxFQUFFLENBQUM7RUFDVjs7Q0FFRCxPQUFPLElBQUksQ0FBQztDQUNaOzs7Ozs7Ozs7OztBQVdELFNBQVMsa0JBQWtCLENBQUMsSUFBSSxFQUFFO0NBQ2pDLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTs7RUFFbEIsT0FBTyxJQUFJLENBQUM7RUFDWixNQUFNLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFOztFQUVwQyxPQUFPLDBCQUEwQixDQUFDO0VBQ2xDLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTs7RUFFbkMsT0FBTyxpREFBaUQsQ0FBQztFQUN6RCxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFOztFQUV4QixPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO0VBQ3pCLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFOztFQUVqQyxPQUFPLElBQUksQ0FBQztFQUNaLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssc0JBQXNCLEVBQUU7O0VBRTNFLE9BQU8sSUFBSSxDQUFDO0VBQ1osTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7O0VBRXBDLE9BQU8sSUFBSSxDQUFDO0VBQ1osTUFBTSxJQUFJLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUU7O0VBRWxELE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQzVELE1BQU0sSUFBSSxJQUFJLFlBQVksTUFBTSxFQUFFOzs7RUFHbEMsT0FBTyxJQUFJLENBQUM7RUFDWixNQUFNOztFQUVOLE9BQU8sMEJBQTBCLENBQUM7RUFDbEM7Q0FDRDs7Ozs7Ozs7Ozs7QUFXRCxTQUFTLGFBQWEsQ0FBQyxRQUFRLEVBQUU7Q0FDaEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs7O0NBRzNCLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTs7RUFFbEIsT0FBTyxDQUFDLENBQUM7RUFDVCxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO0VBQ3hCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztFQUNqQixNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTs7RUFFakMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0VBQ25CLE1BQU0sSUFBSSxJQUFJLElBQUksT0FBTyxJQUFJLENBQUMsYUFBYSxLQUFLLFVBQVUsRUFBRTs7RUFFNUQsSUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sSUFBSSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFOztHQUU3QyxPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztHQUM1QjtFQUNELE9BQU8sSUFBSSxDQUFDO0VBQ1osTUFBTTs7RUFFTixPQUFPLElBQUksQ0FBQztFQUNaO0NBQ0Q7Ozs7Ozs7O0FBUUQsU0FBUyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtDQUN0QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDOzs7Q0FHM0IsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFOztFQUVsQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7RUFDWCxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO0VBQ3hCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDekIsTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7O0VBRWpDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDakIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0VBQ1gsTUFBTTs7RUFFTixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ2hCO0NBQ0Q7OztBQUdELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7Ozs7Ozs7QUFROUIsTUFBTSxpQkFBaUIsR0FBRywrQkFBK0IsQ0FBQztBQUMxRCxNQUFNLHNCQUFzQixHQUFHLHlCQUF5QixDQUFDOztBQUV6RCxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUU7Q0FDM0IsSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ2pCLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7RUFDaEQsTUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztFQUMvRDtDQUNEOztBQUVELFNBQVMsYUFBYSxDQUFDLEtBQUssRUFBRTtDQUM3QixLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7Q0FDbkIsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7RUFDdkMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztFQUNqRTtDQUNEOzs7Ozs7Ozs7O0FBVUQsU0FBUytDLE1BQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO0NBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDMUIsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUU7RUFDdEIsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxFQUFFO0dBQy9CLE9BQU8sR0FBRyxDQUFDO0dBQ1g7RUFDRDtDQUNELE9BQU8sU0FBUyxDQUFDO0NBQ2pCOztBQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQixNQUFNLE9BQU8sQ0FBQzs7Ozs7OztDQU9iLFdBQVcsR0FBRztFQUNiLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQzs7RUFFekYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0VBRWhDLElBQUksSUFBSSxZQUFZLE9BQU8sRUFBRTtHQUM1QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7R0FDOUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7R0FFNUMsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUU7SUFDckMsS0FBSyxNQUFNLEtBQUssSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7S0FDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDL0I7SUFDRDs7R0FFRCxPQUFPO0dBQ1A7Ozs7RUFJRCxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO0dBQ3RELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDckMsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0lBQ25CLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxFQUFFO0tBQ2pDLE1BQU0sSUFBSSxTQUFTLENBQUMsK0JBQStCLENBQUMsQ0FBQztLQUNyRDs7OztJQUlELE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNqQixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksRUFBRTtLQUN4QixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssVUFBVSxFQUFFO01BQzVFLE1BQU0sSUFBSSxTQUFTLENBQUMsbUNBQW1DLENBQUMsQ0FBQztNQUN6RDtLQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQzdCOztJQUVELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO0tBQ3pCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7TUFDdEIsTUFBTSxJQUFJLFNBQVMsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO01BQ25FO0tBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUI7SUFDRCxNQUFNOztJQUVOLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtLQUNwQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDeEI7SUFDRDtHQUNELE1BQU07R0FDTixNQUFNLElBQUksU0FBUyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7R0FDOUQ7RUFDRDs7Ozs7Ozs7Q0FRRCxHQUFHLENBQUMsSUFBSSxFQUFFO0VBQ1QsSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ2pCLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNuQixNQUFNLEdBQUcsR0FBR0EsTUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNsQyxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7R0FDdEIsT0FBTyxJQUFJLENBQUM7R0FDWjs7RUFFRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDakM7Ozs7Ozs7OztDQVNELE9BQU8sQ0FBQyxRQUFRLEVBQUU7RUFDakIsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDOztFQUU1RixJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1YsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRTtHQUN4QixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDeEIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUNsQixLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOztHQUUxQixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzFDLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDekIsQ0FBQyxFQUFFLENBQUM7R0FDSjtFQUNEOzs7Ozs7Ozs7Q0FTRCxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtFQUNoQixJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDakIsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQ25CLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNuQixhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDckIsTUFBTSxHQUFHLEdBQUdBLE1BQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxTQUFTLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDcEQ7Ozs7Ozs7OztDQVNELE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0VBQ25CLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUNqQixLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDbkIsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ25CLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNyQixNQUFNLEdBQUcsR0FBR0EsTUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNsQyxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7R0FDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUMzQixNQUFNO0dBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDMUI7RUFDRDs7Ozs7Ozs7Q0FRRCxHQUFHLENBQUMsSUFBSSxFQUFFO0VBQ1QsSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ2pCLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNuQixPQUFPQSxNQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLFNBQVMsQ0FBQztFQUMzQzs7Ozs7Ozs7Q0FRRCxNQUFNLENBQUMsSUFBSSxFQUFFO0VBQ1osSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ2pCLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNuQixNQUFNLEdBQUcsR0FBR0EsTUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNsQyxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7R0FDdEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDdEI7RUFDRDs7Ozs7OztDQU9ELEdBQUcsR0FBRztFQUNMLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ2pCOzs7Ozs7O0NBT0QsSUFBSSxHQUFHO0VBQ04sT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDMUM7Ozs7Ozs7Q0FPRCxNQUFNLEdBQUc7RUFDUixPQUFPLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztFQUM1Qzs7Ozs7Ozs7O0NBU0QsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUc7RUFDbkIsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7RUFDaEQ7Q0FDRDtBQUNELE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUvRCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRTtDQUM1RCxLQUFLLEVBQUUsU0FBUztDQUNoQixRQUFRLEVBQUUsS0FBSztDQUNmLFVBQVUsRUFBRSxLQUFLO0NBQ2pCLFlBQVksRUFBRSxJQUFJO0NBQ2xCLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtDQUMxQyxHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQ3pCLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDN0IsR0FBRyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUN6QixNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQzVCLEdBQUcsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDekIsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUM1QixJQUFJLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQzFCLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDNUIsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUM3QixDQUFDLENBQUM7O0FBRUgsU0FBUyxVQUFVLENBQUMsT0FBTyxFQUFFO0NBQzVCLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQzs7Q0FFM0YsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUM5QyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLEtBQUssR0FBRyxVQUFVLENBQUMsRUFBRTtFQUM3QyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztFQUN2QixHQUFHLElBQUksS0FBSyxPQUFPLEdBQUcsVUFBVSxDQUFDLEVBQUU7RUFDbkMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ2xDLEdBQUcsVUFBVSxDQUFDLEVBQUU7RUFDaEIsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDckQsQ0FBQyxDQUFDO0NBQ0g7O0FBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVwQyxTQUFTLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7Q0FDNUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0NBQ3pELFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRztFQUNwQixNQUFNO0VBQ04sSUFBSTtFQUNKLEtBQUssRUFBRSxDQUFDO0VBQ1IsQ0FBQztDQUNGLE9BQU8sUUFBUSxDQUFDO0NBQ2hCOztBQUVELE1BQU0sd0JBQXdCLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztDQUN0RCxJQUFJLEdBQUc7O0VBRU4sSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLHdCQUF3QixFQUFFO0dBQ3RFLE1BQU0sSUFBSSxTQUFTLENBQUMsMENBQTBDLENBQUMsQ0FBQztHQUNoRTs7RUFFRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDL0IsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU07UUFDekIsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJO1FBQ3JCLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDOztFQUU5QixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ3hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDMUIsSUFBSSxLQUFLLElBQUksR0FBRyxFQUFFO0dBQ2pCLE9BQU87SUFDTixLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFJLEVBQUUsSUFBSTtJQUNWLENBQUM7R0FDRjs7RUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7O0VBRWpDLE9BQU87R0FDTixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQztHQUNwQixJQUFJLEVBQUUsS0FBSztHQUNYLENBQUM7RUFDRjtDQUNELEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFeEUsTUFBTSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFO0NBQ25FLEtBQUssRUFBRSxpQkFBaUI7Q0FDeEIsUUFBUSxFQUFFLEtBQUs7Q0FDZixVQUFVLEVBQUUsS0FBSztDQUNqQixZQUFZLEVBQUUsSUFBSTtDQUNsQixDQUFDLENBQUM7Ozs7Ozs7O0FBUUgsU0FBUywyQkFBMkIsQ0FBQyxPQUFPLEVBQUU7Q0FDN0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7OztDQUk3RCxNQUFNLGFBQWEsR0FBR0EsTUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUNqRCxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7RUFDaEMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzQzs7Q0FFRCxPQUFPLEdBQUcsQ0FBQztDQUNYOzs7Ozs7Ozs7QUFTRCxTQUFTLG9CQUFvQixDQUFDLEdBQUcsRUFBRTtDQUNsQyxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0NBQzlCLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtFQUNwQyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtHQUNqQyxTQUFTO0dBQ1Q7RUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7R0FDN0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDNUIsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7S0FDckMsU0FBUztLQUNUO0lBQ0QsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO0tBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzNCLE1BQU07S0FDTixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzdCO0lBQ0Q7R0FDRCxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7R0FDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDakM7RUFDRDtDQUNELE9BQU8sT0FBTyxDQUFDO0NBQ2Y7O0FBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUM7OztBQUdqRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDOzs7Ozs7Ozs7QUFTdkMsTUFBTSxRQUFRLENBQUM7Q0FDZCxXQUFXLEdBQUc7RUFDYixJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7RUFDcEYsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDOztFQUVsRixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7O0VBRTVCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO0VBQ2xDLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7RUFFMUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtHQUNqRCxNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM3QyxJQUFJLFdBQVcsRUFBRTtJQUNoQixPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM1QztHQUNEOztFQUVELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRztHQUNuQixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7R0FDYixNQUFNO0dBQ04sVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQztHQUNuRCxPQUFPO0dBQ1AsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO0dBQ3JCLENBQUM7RUFDRjs7Q0FFRCxJQUFJLEdBQUcsR0FBRztFQUNULE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7RUFDbkM7O0NBRUQsSUFBSSxNQUFNLEdBQUc7RUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUM7RUFDaEM7Ozs7O0NBS0QsSUFBSSxFQUFFLEdBQUc7RUFDUixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0VBQ3pFOztDQUVELElBQUksVUFBVSxHQUFHO0VBQ2hCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7RUFDckM7O0NBRUQsSUFBSSxVQUFVLEdBQUc7RUFDaEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDO0VBQ3BDOztDQUVELElBQUksT0FBTyxHQUFHO0VBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDO0VBQ2pDOzs7Ozs7O0NBT0QsS0FBSyxHQUFHO0VBQ1AsT0FBTyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7R0FDaEMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO0dBQ2IsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO0dBQ25CLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtHQUMzQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87R0FDckIsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO0dBQ1gsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO0dBQzNCLENBQUMsQ0FBQztFQUNIO0NBQ0Q7O0FBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFO0NBQzNDLEdBQUcsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDekIsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUM1QixFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQ3hCLFVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDaEMsVUFBVSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUNoQyxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQzdCLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDM0IsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFO0NBQzdELEtBQUssRUFBRSxVQUFVO0NBQ2pCLFFBQVEsRUFBRSxLQUFLO0NBQ2YsVUFBVSxFQUFFLEtBQUs7Q0FDakIsWUFBWSxFQUFFLElBQUk7Q0FDbEIsQ0FBQyxDQUFDOztBQUVILE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOzs7QUFHaEQsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUM1QixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDOztBQUU5QixNQUFNLDBCQUEwQixHQUFHLFNBQVMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQzs7Ozs7Ozs7QUFRMUUsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFO0NBQ3pCLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFFBQVEsQ0FBQztDQUMzRTs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxNQUFNLEVBQUU7Q0FDOUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ3BGLE9BQU8sQ0FBQyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsQ0FBQztDQUM3RDs7Ozs7Ozs7O0FBU0QsTUFBTSxPQUFPLENBQUM7Q0FDYixXQUFXLENBQUMsS0FBSyxFQUFFO0VBQ2xCLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7RUFFbEYsSUFBSSxTQUFTLENBQUM7OztFQUdkLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7R0FDdEIsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTs7OztJQUl4QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxNQUFNOztJQUVOLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQztHQUNELEtBQUssR0FBRyxFQUFFLENBQUM7R0FDWCxNQUFNO0dBQ04sU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDakM7O0VBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQztFQUNsRCxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDOztFQUU5QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxNQUFNLE1BQU0sS0FBSyxLQUFLLElBQUksTUFBTSxLQUFLLE1BQU0sQ0FBQyxFQUFFO0dBQzlHLE1BQU0sSUFBSSxTQUFTLENBQUMsK0NBQStDLENBQUMsQ0FBQztHQUNyRTs7RUFFRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDOztFQUU5RyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7R0FDMUIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxDQUFDO0dBQzNDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztHQUNsQyxDQUFDLENBQUM7O0VBRUgsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDOztFQUVqRSxJQUFJLFNBQVMsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFO0dBQ3RELE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ2xELElBQUksV0FBVyxFQUFFO0lBQ2hCLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzVDO0dBQ0Q7O0VBRUQsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0VBQ3BELElBQUksUUFBUSxJQUFJLElBQUksRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7RUFFM0MsSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0dBQzdDLE1BQU0sSUFBSSxTQUFTLENBQUMsaURBQWlELENBQUMsQ0FBQztHQUN2RTs7RUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUc7R0FDbkIsTUFBTTtHQUNOLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksUUFBUTtHQUNyRCxPQUFPO0dBQ1AsU0FBUztHQUNULE1BQU07R0FDTixDQUFDOzs7RUFHRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7RUFDdkcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0VBQ25ILElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztFQUNsRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQztFQUN2Qzs7Q0FFRCxJQUFJLE1BQU0sR0FBRztFQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztFQUNoQzs7Q0FFRCxJQUFJLEdBQUcsR0FBRztFQUNULE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUMvQzs7Q0FFRCxJQUFJLE9BQU8sR0FBRztFQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztFQUNqQzs7Q0FFRCxJQUFJLFFBQVEsR0FBRztFQUNkLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztFQUNsQzs7Q0FFRCxJQUFJLE1BQU0sR0FBRztFQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztFQUNoQzs7Ozs7OztDQU9ELEtBQUssR0FBRztFQUNQLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDekI7Q0FDRDs7QUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFOUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUU7Q0FDNUQsS0FBSyxFQUFFLFNBQVM7Q0FDaEIsUUFBUSxFQUFFLEtBQUs7Q0FDZixVQUFVLEVBQUUsS0FBSztDQUNqQixZQUFZLEVBQUUsSUFBSTtDQUNsQixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7Q0FDMUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUM1QixHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQ3pCLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDN0IsUUFBUSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtDQUM5QixLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO0NBQzNCLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Q0FDNUIsQ0FBQyxDQUFDOzs7Ozs7OztBQVFILFNBQVMscUJBQXFCLENBQUMsT0FBTyxFQUFFO0NBQ3ZDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLENBQUM7Q0FDakQsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7Q0FHMUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7RUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDN0I7OztDQUdELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtFQUMvQyxNQUFNLElBQUksU0FBUyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7RUFDeEQ7O0NBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0VBQzFDLE1BQU0sSUFBSSxTQUFTLENBQUMsc0NBQXNDLENBQUMsQ0FBQztFQUM1RDs7Q0FFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLElBQUksWUFBWSxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsMEJBQTBCLEVBQUU7RUFDN0YsTUFBTSxJQUFJLEtBQUssQ0FBQyxpRkFBaUYsQ0FBQyxDQUFDO0VBQ25HOzs7Q0FHRCxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQztDQUM5QixJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0VBQ2pFLGtCQUFrQixHQUFHLEdBQUcsQ0FBQztFQUN6QjtDQUNELElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUU7RUFDekIsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzFDLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFFO0dBQ25DLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUN4QztFQUNEO0NBQ0QsSUFBSSxrQkFBa0IsRUFBRTtFQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLENBQUM7RUFDbEQ7OztDQUdELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO0VBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLHdEQUF3RCxDQUFDLENBQUM7RUFDcEY7OztDQUdELElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsRUFBRTtFQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0VBQy9DOztDQUVELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7Q0FDMUIsSUFBSSxPQUFPLEtBQUssS0FBSyxVQUFVLEVBQUU7RUFDaEMsS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUN6Qjs7Q0FFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtFQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztFQUNuQzs7Ozs7Q0FLRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRTtFQUNuQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07RUFDdEIsT0FBTyxFQUFFLDJCQUEyQixDQUFDLE9BQU8sQ0FBQztFQUM3QyxLQUFLO0VBQ0wsQ0FBQyxDQUFDO0NBQ0g7Ozs7Ozs7Ozs7Ozs7O0FBY0QsU0FBUyxVQUFVLENBQUMsT0FBTyxFQUFFO0VBQzNCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztFQUUxQixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztFQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzs7O0VBR3ZCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQ2pEOztBQUVELFVBQVUsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzlDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQzs7O0FBR3pDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQzs7Ozs7Ozs7O0FBU2hDLFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7OztDQUd6QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtFQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLHdFQUF3RSxDQUFDLENBQUM7RUFDMUY7O0NBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDOzs7Q0FHN0IsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFOztFQUVuRCxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDdkMsTUFBTSxPQUFPLEdBQUcscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7O0VBRS9DLE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsS0FBSyxHQUFHLElBQUksRUFBRSxPQUFPLENBQUM7RUFDcEUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7RUFFOUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDOztFQUVwQixNQUFNLEtBQUssR0FBRyxTQUFTLEtBQUssR0FBRztHQUM5QixJQUFJLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0dBQzFELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNkLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxZQUFZLE1BQU0sQ0FBQyxRQUFRLEVBQUU7SUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUI7R0FDRCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPO0dBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztHQUNuQyxDQUFDOztFQUVGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7R0FDN0IsS0FBSyxFQUFFLENBQUM7R0FDUixPQUFPO0dBQ1A7O0VBRUQsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLGdCQUFnQixHQUFHO0dBQ3BELEtBQUssRUFBRSxDQUFDO0dBQ1IsUUFBUSxFQUFFLENBQUM7R0FDWCxDQUFDOzs7RUFHRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDMUIsSUFBSSxVQUFVLENBQUM7O0VBRWYsSUFBSSxNQUFNLEVBQUU7R0FDWCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7R0FDbkQ7O0VBRUQsU0FBUyxRQUFRLEdBQUc7R0FDbkIsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO0dBQ1osSUFBSSxNQUFNLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0dBQ2xFLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUN6Qjs7RUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7R0FDcEIsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxNQUFNLEVBQUU7SUFDcEMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxZQUFZO0tBQ25DLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztLQUNoRixRQUFRLEVBQUUsQ0FBQztLQUNYLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQztHQUNIOztFQUVELEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsR0FBRyxFQUFFO0dBQzlCLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ2xHLFFBQVEsRUFBRSxDQUFDO0dBQ1gsQ0FBQyxDQUFDOztFQUVILEdBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsR0FBRyxFQUFFO0dBQ2pDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7R0FFekIsTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7R0FHbEQsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTs7SUFFckMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7O0lBR3pDLE1BQU0sV0FBVyxHQUFHLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzs7SUFHbEYsUUFBUSxPQUFPLENBQUMsUUFBUTtLQUN2QixLQUFLLE9BQU87TUFDWCxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQywrQkFBK0IsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO01BQ3ZGLFFBQVEsRUFBRSxDQUFDO01BQ1gsT0FBTztLQUNSLEtBQUssUUFBUTs7TUFFWixJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7O09BRXpCLElBQUk7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNyQyxDQUFDLE9BQU8sR0FBRyxFQUFFOztRQUViLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNaO09BQ0Q7TUFDRCxNQUFNO0tBQ1AsS0FBSyxRQUFROztNQUVaLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtPQUN6QixNQUFNO09BQ047OztNQUdELElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO09BQ3RDLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLDZCQUE2QixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7T0FDdEYsUUFBUSxFQUFFLENBQUM7T0FDWCxPQUFPO09BQ1A7Ozs7TUFJRCxNQUFNLFdBQVcsR0FBRztPQUNuQixPQUFPLEVBQUUsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztPQUNyQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07T0FDdEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQztPQUM1QixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7T0FDcEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO09BQzFCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtPQUN0QixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7T0FDbEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO09BQ3RCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztPQUN4QixDQUFDOzs7TUFHRixJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtPQUM5RSxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsMERBQTBELEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO09BQzNHLFFBQVEsRUFBRSxDQUFDO09BQ1gsT0FBTztPQUNQOzs7TUFHRCxJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsS0FBSyxHQUFHLEtBQUssT0FBTyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7T0FDOUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7T0FDM0IsV0FBVyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7T0FDN0IsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztPQUM3Qzs7O01BR0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ3RELFFBQVEsRUFBRSxDQUFDO01BQ1gsT0FBTztLQUNSO0lBQ0Q7OztHQUdELEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFlBQVk7SUFDM0IsSUFBSSxNQUFNLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xFLENBQUMsQ0FBQztHQUNILElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLEVBQUUsQ0FBQyxDQUFDOztHQUV6QyxNQUFNLGdCQUFnQixHQUFHO0lBQ3hCLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztJQUNoQixNQUFNLEVBQUUsR0FBRyxDQUFDLFVBQVU7SUFDdEIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxhQUFhO0lBQzdCLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtJQUNsQixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87SUFDeEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO0lBQ3hCLENBQUM7OztHQUdGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7Ozs7Ozs7OztHQVVoRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLE1BQU0sSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssR0FBRyxFQUFFO0lBQzNILFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUNoRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEIsT0FBTztJQUNQOzs7Ozs7O0dBT0QsTUFBTSxXQUFXLEdBQUc7SUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZO0lBQ3hCLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWTtJQUM5QixDQUFDOzs7R0FHRixJQUFJLE9BQU8sSUFBSSxNQUFNLElBQUksT0FBTyxJQUFJLFFBQVEsRUFBRTtJQUM3QyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDakQsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2hELE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsQixPQUFPO0lBQ1A7OztHQUdELElBQUksT0FBTyxJQUFJLFNBQVMsSUFBSSxPQUFPLElBQUksV0FBVyxFQUFFOzs7SUFHbkQsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDMUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLLEVBQUU7O0tBRWpDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxNQUFNLElBQUksRUFBRTtNQUMvQixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztNQUN2QyxNQUFNO01BQ04sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztNQUMxQztLQUNELFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztLQUNoRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbEIsQ0FBQyxDQUFDO0lBQ0gsT0FBTztJQUNQOzs7R0FHRCxJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxJQUFJLENBQUMsc0JBQXNCLEtBQUssVUFBVSxFQUFFO0lBQ3pFLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7SUFDaEQsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2hELE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsQixPQUFPO0lBQ1A7OztHQUdELFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztHQUNoRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbEIsQ0FBQyxDQUFDOztFQUVILGFBQWEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7RUFDNUIsQ0FBQyxDQUFDO0NBQ0g7Ozs7Ozs7QUFPRCxLQUFLLENBQUMsVUFBVSxHQUFHLFVBQVUsSUFBSSxFQUFFO0NBQ2xDLE9BQU8sSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEtBQUssR0FBRyxDQUFDO0NBQ3BGLENBQUM7OztBQUdGLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7QUFFL0IsU0FBUyxnQkFBZ0I7Q0FDeEIsUUFBUTtDQUNSLGNBQWM7RUFDYjtDQUNELE1BQU0sY0FBYyxHQUFHLEFBQ3JCLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDM0QsV0FBRSxDQUFDLFlBQVksQ0FBQ3NCLGFBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0VBQ2hGLEFBQW9HLENBQUM7O0NBRXRHLE1BQU0sUUFBUSxHQUFHLEFBQ2YsQ0FBQyxNQUFNLGFBQWEsQ0FBQyxPQUFPLENBQUM7RUFDOUIsQUFBOEMsQ0FBQzs7Q0FFaEQsTUFBTSxrQkFBa0IsR0FBR3RCLFdBQUUsQ0FBQyxVQUFVLENBQUNzQixhQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7O0NBRXBGLE1BQU0sRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLEdBQUcsUUFBUSxDQUFDO0NBQzFDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7O0NBRW5DLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0VBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7O0VBRW5CLE1BQU0sT0FBTyxHQUFHLEFBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQXlCLENBQUM7O0VBRXpFLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0VBQ3JCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7RUFDakM7O0NBRUQsU0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFO0VBQ2xELFdBQVcsQ0FBQztHQUNYLE9BQU8sRUFBRSxJQUFJO0dBQ2IsS0FBSyxFQUFFO0lBQ04sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUU7SUFDdEM7R0FDRCxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEtBQUssSUFBSSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7RUFDbEY7O0NBRUQsZUFBZSxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxLQUFLLEdBQUcsSUFBSSxFQUFFO0VBQ3RFLE1BQU0sdUJBQXVCLEdBQUcsR0FBRyxDQUFDLElBQUksS0FBSyw0QkFBNEIsQ0FBQztFQUMxRSxNQUFNLFVBQVU7Ozs7O0dBS2YsY0FBYyxFQUFFLENBQUM7O0VBRWxCLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0VBQzNDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLEFBQUssQ0FBQyxVQUFVLENBQUMsQUFBZSxDQUFDLENBQUM7Ozs7RUFJakUsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ2pILElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtHQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUk7SUFDMUIsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPOzs7SUFHbEIsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQyxDQUFDO0dBQ0g7O0VBRUQsSUFBSSxVQUFVLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRTs7R0FFcEMsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCO0tBQzNCLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM3QyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0tBQ2xFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7R0FFYixHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUM1QixNQUFNO0dBQ04sTUFBTSxJQUFJLEdBQUcsZ0JBQWdCO0tBQzNCLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM3QyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUs7S0FDZCxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sR0FBRyxRQUFRLENBQUM7S0FDcEQsT0FBTyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xFLENBQUM7S0FDRCxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0dBRWIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDNUI7O0VBRUQsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs7RUFFekMsSUFBSSxRQUFRLENBQUM7RUFDYixJQUFJLGFBQWEsQ0FBQzs7RUFFbEIsTUFBTSxlQUFlLEdBQUc7R0FDdkIsUUFBUSxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsS0FBSztJQUNuQyxJQUFJLFFBQVEsS0FBSyxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVUsSUFBSSxRQUFRLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxFQUFFO0tBQ3ZGLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7S0FDekM7SUFDRCxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEMsUUFBUSxHQUFHLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQ3BDO0dBQ0QsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLE9BQU8sS0FBSztJQUMvQixhQUFhLEdBQUcsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDeEM7R0FDRCxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLO0lBQ3JCLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUU5RyxJQUFJLElBQUksRUFBRTtLQUNULElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQzs7S0FFL0IsTUFBTSxlQUFlO01BQ3BCLElBQUksQ0FBQyxXQUFXLEtBQUssU0FBUztNQUM5QixJQUFJLENBQUMsV0FBVyxLQUFLLGFBQWEsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUM5RixDQUFDOztLQUVGLElBQUksZUFBZSxFQUFFO01BQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztNQUUvQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTTtPQUM1QixFQUFFO09BQ0YsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7T0FDdEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7T0FDdkMsQ0FBQzs7TUFFRixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO01BQy9DLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxJQUFJO09BQ3RFLE1BQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUMxQyxJQUFJLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3hDLENBQUMsQ0FBQzs7TUFFSCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM5QixHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztNQUViLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztNQUMxQjtLQUNEOztJQUVELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEM7R0FDRCxDQUFDOztFQUVGLElBQUksU0FBUyxDQUFDO0VBQ2QsSUFBSSxLQUFLLENBQUM7RUFDVixJQUFJLE1BQU0sQ0FBQzs7RUFFWCxJQUFJO0dBQ0gsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFlBQVk7TUFDekMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO0tBQzdDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUk7S0FDdEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0tBQ2QsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO0tBQ2hCLE1BQU0sRUFBRSxFQUFFO0tBQ1YsRUFBRSxPQUFPLENBQUM7TUFDVCxFQUFFLENBQUM7O0dBRU4sS0FBSyxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7R0FHbkQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztHQUNqQyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7SUFDN0IsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJO0tBQ25ELElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxJQUFJLENBQUM7OztLQUd2QixNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7S0FFL0MsT0FBTyxJQUFJLENBQUMsT0FBTztRQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7T0FDcEMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSTtPQUN0QixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7T0FDZCxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7T0FDaEIsTUFBTTtPQUNOLEVBQUUsT0FBTyxDQUFDO1FBQ1QsRUFBRSxDQUFDO0tBQ04sQ0FBQyxDQUFDLENBQUM7SUFDSjs7R0FFRCxTQUFTLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3pDLENBQUMsT0FBTyxHQUFHLEVBQUU7R0FDYixJQUFJLEtBQUssRUFBRTtJQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQzFCOztHQUVELGFBQWEsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDO0dBQ2xELFNBQVMsR0FBRyxFQUFFLENBQUM7R0FDZjs7RUFFRCxJQUFJO0dBQ0gsSUFBSSxRQUFRLEVBQUU7SUFDYixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7SUFFM0UsR0FBRyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO0lBQ3JDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7SUFFVixPQUFPO0lBQ1A7O0dBRUQsSUFBSSxhQUFhLEVBQUU7SUFDbEIsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEUsT0FBTztJQUNQOztHQUVELE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7O0dBR3JELE1BQU0sZUFBZSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztHQUVWLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSztJQUMvQixlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNyQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3ZCLENBQUMsRUFBRSxDQUFDO0lBQ0osQ0FBQyxDQUFDOztHQUVILE1BQU0sS0FBSyxHQUFHO0lBQ2IsTUFBTSxFQUFFO0tBQ1AsSUFBSSxFQUFFO01BQ0wsU0FBUyxFQUFFc0MsZ0JBQVEsQ0FBQztPQUNuQixJQUFJLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJO09BQ3RCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtPQUNkLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztPQUNoQixNQUFNO09BQ04sQ0FBQyxDQUFDLFNBQVM7TUFDWjtLQUNELFVBQVUsRUFBRTtNQUNYLFNBQVMsRUFBRUEsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTO01BQ25DO0tBQ0QsT0FBTyxFQUFFQSxnQkFBUSxDQUFDLE9BQU8sQ0FBQztLQUMxQjtJQUNELFFBQVEsRUFBRSxlQUFlO0lBQ3pCLE1BQU0sRUFBRSxLQUFLLEdBQUcsTUFBTSxHQUFHLEdBQUc7SUFDNUIsS0FBSyxFQUFFLEtBQUssR0FBRyxLQUFLLFlBQVksS0FBSyxHQUFHLEtBQUssR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJO0lBQ3pFLE1BQU0sRUFBRTtLQUNQLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0tBQ25CO0lBQ0QsTUFBTSxFQUFFO0tBQ1AsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDcEIsS0FBSyxFQUFFLEVBQUU7S0FDVDtJQUNELENBQUM7O0dBRUYsSUFBSSxDQUFDLHVCQUF1QixFQUFFO0lBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0tBQzlDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDM0IsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTOztLQUVwQixLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUc7TUFDdEIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO01BQ3pCLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUU7TUFDN0IsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7TUFDcEIsQ0FBQztLQUNGO0lBQ0Q7O0dBRUQsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUdDLFNBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7O0dBRTlDLE1BQU0sVUFBVSxHQUFHO0lBQ2xCLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLE9BQU8sRUFBRSxPQUFPLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUk7S0FDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEUsQ0FBQztJQUNGLEtBQUssRUFBRSxLQUFLLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUMsQ0FBQzs7R0FFRixJQUFJLE1BQU0sR0FBRyxDQUFDLFlBQVksRUFBRTtJQUMzQixLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDckQsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUIsVUFBVSxDQUFDLFNBQVMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0QsVUFBVSxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckQsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztHQUVoQyxJQUFJLGtCQUFrQixFQUFFO0lBQ3ZCLE1BQU0sSUFBSSxDQUFDLGtFQUFrRSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUNsSDs7R0FFRCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQzdGLE1BQU0sSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOztHQUU3QyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFO0lBQ3BDLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRTtLQUM3QixNQUFNLFdBQVcsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3BGLE1BQU0sSUFBSSxDQUFDLHVEQUF1RCxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsNEpBQTRKLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLHlFQUF5RSxDQUFDLENBQUM7S0FDcFksTUFBTTtLQUNOLE1BQU0sSUFBSSxDQUFDLG9GQUFvRixFQUFFLElBQUksQ0FBQyxtRUFBbUUsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7S0FDdlM7SUFDRCxNQUFNO0lBQ04sTUFBTSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVDOztHQUVELElBQUksTUFBTSxDQUFDOzs7O0dBSVgsSUFBSSxVQUFVLENBQUMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO0lBQzFDLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDN0IsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJO0tBQzFCLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTztLQUNsQixNQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7S0FFN0QsSUFBSSxtQkFBbUIsRUFBRTtNQUN4QixtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJO09BQ25DLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDckIsQ0FBQyxDQUFDO01BQ0g7S0FDRCxDQUFDLENBQUM7O0lBRUgsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO01BQzdCLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7TUFDNUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ1gsTUFBTTtJQUNOLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQy9EOzs7R0FHRCxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDOztHQUUxRixNQUFNLElBQUksR0FBRyxRQUFRLEVBQUU7S0FDckIsT0FBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDL0QsT0FBTyxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDNUUsT0FBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLElBQUksQ0FBQztLQUNwQyxPQUFPLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyw0Q0FBNEMsRUFBRSxJQUFJLENBQUMsMENBQTBDLENBQUMsQ0FBQztLQUMvSCxPQUFPLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxNQUFNLENBQUMsQ0FBQzs7R0FFM0MsR0FBRyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7R0FDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNkLENBQUMsTUFBTSxHQUFHLEVBQUU7R0FDWixJQUFJLEtBQUssRUFBRTtJQUNWLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLE1BQU07SUFDTixZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakM7R0FDRDtFQUNEOztDQUVELE9BQU8sU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7RUFDMUMsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLDRCQUE0QixFQUFFO0dBQzlDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDNUQsV0FBVyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDaEMsT0FBTztHQUNQOztFQUVELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO0dBQ3pCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO0lBQ2hDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLE9BQU87SUFDUDtHQUNEOztFQUVELFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztFQUN6QyxDQUFDO0NBQ0Y7O0FBRUQsU0FBUyxhQUFhLENBQUMsR0FBRyxHQUFHLFNBQVMsRUFBRTtDQUN2QyxPQUFPN0QsV0FBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ3hEOztBQUVELFNBQVMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7Q0FDbEMsSUFBSTtFQUNILE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3JCLENBQUMsT0FBTyxHQUFHLEVBQUU7RUFDYixJQUFJLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDcEIsT0FBTyxJQUFJLENBQUM7RUFDWjtDQUNEOztBQUVELFNBQVMsV0FBVyxDQUFDLElBQUksRUFBRTtDQUMxQixNQUFNLEtBQUssR0FBRztFQUNiLEdBQUcsR0FBRyxNQUFNO0VBQ1osR0FBRyxFQUFFLEtBQUs7RUFDVixHQUFHLEVBQUUsS0FBSztFQUNWLEdBQUcsR0FBRyxJQUFJO0VBQ1YsR0FBRyxHQUFHLElBQUk7RUFDVixDQUFDOztDQUVGLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3REOztBQUVELElBQUksUUFBUSxHQUFHLDJyNUJBQTJyNUIsQ0FBQzs7QUFFM3M1QixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUV0QixRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSztDQUNyQyxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3ZDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTzs7Q0FFbkIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7O0NBRXZDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJO0VBQ3pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ25CLENBQUMsQ0FBQztDQUNILENBQUMsQ0FBQzs7QUFFSCxTQUFTd0IsUUFBTSxDQUFDLElBQUksRUFBRTtDQUNyQixNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3ZDLE9BQU8sS0FBSyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbEM7O0FBRUQsU0FBUyxVQUFVLENBQUMsSUFBSTs7O0dBR3JCLEVBQUUsRUFBRTtDQUNOLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDOztDQUVqQyxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQzs7Q0FFN0IsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7RUFDL0IsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSztHQUNuQixJQUFJLEdBQUcsQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO0lBQzlCLElBQUksRUFBRSxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDMUIsSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7S0FDbkUsV0FBVyxJQUFJLEdBQUcsQ0FBQztLQUNuQjs7SUFFRCxHQUFHLENBQUMsT0FBTyxHQUFHLFdBQVc7T0FDdEIsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztPQUNyQyxFQUFFLENBQUM7SUFDTjs7R0FFRCxJQUFJLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLElBQUksRUFBRTtJQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDO0tBQ1osVUFBVSxFQUFFLElBQUk7S0FDaEIsS0FBSyxFQUFFLFVBQVU7S0FDakIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFPO0tBQ3JCLENBQUMsQ0FBQzs7SUFFSCxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7SUFDeEI7O0dBRUQsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtJQUMzQixHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2Qzs7R0FFRCxJQUFJLEVBQUUsQ0FBQztHQUNQOztFQUVEeEIsV0FBRSxDQUFDLFVBQVUsQ0FBQ3NCLGFBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUMsSUFBSSxLQUFLLENBQUM7R0FDakUsUUFBUSxFQUFFLG9CQUFvQjtHQUM5QixhQUFhLEVBQUUscUNBQXFDO0dBQ3BELENBQUM7O0VBRUZ0QixXQUFFLENBQUMsVUFBVSxDQUFDc0IsYUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQztHQUNyRSxRQUFRLEVBQUUsd0JBQXdCO0dBQ2xDLGFBQWEsRUFBRSxxQ0FBcUM7R0FDcEQsQ0FBQzs7RUFFRixLQUFLLENBQUM7R0FDTCxNQUFNLEVBQUUsVUFBVTtHQUNsQixhQUFhLEVBQUUsQUFBSyxDQUFDLFVBQVUsQ0FBQyxBQUErQjtHQUMvRCxDQUFDOztFQUVGLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7O0VBRWhELGdCQUFnQixDQUFDLFFBQVEsRUFBRSxPQUFPLElBQUl3QyxNQUFJLENBQUM7RUFDM0MsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUNuQjs7QUFFRCxTQUFTLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7Q0FDM0MsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQzs7Q0FFOUIsU0FBUyxXQUFXLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0VBQ3ZDLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRTtHQUNmLE9BQU8sSUFBSSxFQUFFLENBQUM7R0FDZDs7RUFFRCxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUM5RDs7Q0FFRCxPQUFPLENBQUMsTUFBTTtJQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssV0FBVyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLO0dBQ3JCLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7SUFDcEMsSUFBSSxFQUFFLENBQUM7SUFDUCxNQUFNO0lBQ04sV0FBVyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9CO0dBQ0QsQ0FBQztDQUNIOztBQUVELFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7Q0FDaEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BFLElBQUksR0FBRyxZQUFZLE1BQU0sRUFBRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDaEQsSUFBSSxPQUFPLEdBQUcsS0FBSyxVQUFVLEVBQUUsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDL0MsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbEU7O0FBRUQsU0FBUyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRTs7OztFQUloRDtDQUNELE1BQU0sTUFBTSxHQUFHLFFBQVE7SUFDcEIsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRO0lBQzlCLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pDLEFBRUE7Q0FDQyxNQUFNLElBQUksR0FBRyxBQUNYLENBQUMsQ0FBQyxJQUFJLEtBQUs5RCxXQUFFLENBQUMsWUFBWSxDQUFDc0IsYUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDMUQsQUFBaUgsQ0FBQzs7Q0FFbkgsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLO0VBQzFCLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0dBQ2hCLE1BQU0sSUFBSSxHQUFHRSxRQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDOztHQUU5QixJQUFJO0lBQ0gsTUFBTSxJQUFJLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0lBRXhCLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQzlDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDZCxDQUFDLE9BQU8sR0FBRyxFQUFFO0lBQ2IsR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7SUFDckIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNyQjtHQUNELE1BQU07R0FDTixJQUFJLEVBQUUsQ0FBQztHQUNQO0VBQ0QsQ0FBQztDQUNGOztBQUVELFNBQVNzQyxNQUFJLEVBQUUsRUFBRTs7QUN2bEZqQixNQUFNLEVBQUUsSUFBSSxHQUFHLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7O0FBRXBDLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQztDQUNqQixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSztFQUMzQixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQztFQUNqQyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO0VBQzNDLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0VBQzlDO0NBQ0QsQ0FBQyxDQUFDOztBQUVILElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7Q0FDdkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0NBQ3hCOztBQUVELEdBQUcsQ0FBQyxHQUFHO0NBQ04sSUFBSSxDQUFDLFFBQVEsRUFBRTtFQUNkLEdBQUcsRUFBRSxhQUFvQixLQUFLLGFBQWE7RUFDM0MsVUFBVSxDQUFDLEdBQUcsRUFBRTtHQUNmLEdBQUcsQ0FBQyxTQUFTLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDbEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztHQUNoRjtFQUNELENBQUM7O0NBRUZDLFVBQWlCLENBQUM7RUFDakIsT0FBTyxFQUFFLEdBQUcsS0FBSztHQUNoQixJQUFJLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7R0FDN0IsQ0FBQztFQUNGLENBQUM7Q0FDRixDQUFDOztBQUVGLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMifQ==
