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
require('./index-0642fb9d.js');
require('./index-2209bb13.js');
var index$2 = require('./index-93f59318.js');
var index$3 = require('./index-8ee93a28.js');
require('yootils');
require('./Repl-78ed57fa.js');
require('./examples-e5967878.js');
require('./ReplWidget-d4657d3e.js');
var app$1 = require('./app-69fe12cd.js');
require('./config-5bec691e.js');
var index$4 = require('./index-16fb8e41.js');
var _layout = require('./_layout-4eb4439b.js');
var index$5 = require('./index-b22b1c38.js');
var index$6 = require('./index-a50b0fc8.js');
var index$7 = require('./index-ff248b74.js');
var index$8 = require('./index-7a08c016.js');
var _slug_ = require('./[slug]-59eb8741.js');
var index$9 = require('./index-95fec46c.js');
var index$a = require('./index-3b75c53e.js');
var embed = require('./embed-6c55722b.js');
var index$b = require('./index-a56f5a28.js');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcm91dGVzL2V4YW1wbGVzL19leGFtcGxlcy5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvZXhhbXBsZXMvaW5kZXguanNvbi5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvZXhhbXBsZXMvW3NsdWddLmpzb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ29sZGVuLWZsZWVjZS9nb2xkZW4tZmxlZWNlLmVzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzdmVsdGVqcy9zaXRlLWtpdC91dGlscy9tYXJrZG93bi5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvdHV0b3JpYWwvaW5kZXguanNvbi5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvdHV0b3JpYWwvcmFuZG9tLW51bWJlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tYmFzaC5qcyIsIi4uLy4uLy4uL3NyYy91dGlscy9oaWdobGlnaHQuanMiLCIuLi8uLi8uLi9zcmMvcm91dGVzL3R1dG9yaWFsL1tzbHVnXS9pbmRleC5qc29uLmpzIiwiLi4vLi4vLi4vc3JjL3V0aWxzL2RiLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9hcHBzL2luZGV4Lmpzb24uanMiLCIuLi8uLi8uLi9zcmMvdXRpbHMvYXV0aC5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYXV0aC9fY29uZmlnLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9hdXRoL2NhbGxiYWNrLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9hdXRoL2xvZ291dC5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYXV0aC9sb2dpbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2guZGVidXJyL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VzY2FwZS1zdHJpbmctcmVnZXhwL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzaW5kcmVzb3JodXMvc2x1Z2lmeS9yZXBsYWNlbWVudHMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHNpbmRyZXNvcmh1cy9zbHVnaWZ5L292ZXJyaWRhYmxlLXJlcGxhY2VtZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ac2luZHJlc29yaHVzL3NsdWdpZnkvaW5kZXguanMiLCIuLi8uLi8uLi9jb25maWcuanMiLCIuLi8uLi8uLi9zcmMvdXRpbHMvc2x1Zy5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYmxvZy9fcG9zdHMuanMiLCIuLi8uLi8uLi9zcmMvcm91dGVzL2Jsb2cvaW5kZXguanNvbi5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYmxvZy9yc3MueG1sLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9ibG9nL1tzbHVnXS5qc29uLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9jaGF0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzdmVsdGVqcy9zaXRlLWtpdC91dGlscy9zbHVnLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9kb2NzL19zZWN0aW9ucy5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvZG9jcy9pbmRleC5qc29uLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9yZXBsL191dGlscy9ib2R5LmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9yZXBsL2NyZWF0ZS5qc29uLmpzIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9yZXBsL2xvY2FsL1suLi5maWxlXS5qcyIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvcmVwbC9baWRdL2luZGV4Lmpzb24uanMiLCIuLi8uLi8uLi9zcmMvcm91dGVzL2ZhcS5qcyIsIi4uLy4uLy4uL3NyYy9ub2RlX21vZHVsZXMvQHNhcHBlci9pbnRlcm5hbC9tYW5pZmVzdC1zZXJ2ZXIubWpzIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL3NlcnZlci5tanMiLCIuLi8uLi8uLi9zcmMvc2VydmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XHJcblxyXG5sZXQgbG9va3VwO1xyXG5jb25zdCB0aXRsZXMgPSBuZXcgTWFwKCk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2V4YW1wbGVzKCkge1xyXG5cdGxvb2t1cCA9IG5ldyBNYXAoKTtcclxuXHJcblx0cmV0dXJuIGZzLnJlYWRkaXJTeW5jKGBjb250ZW50L2V4YW1wbGVzYCkubWFwKGdyb3VwX2RpciA9PiB7XHJcblx0XHRjb25zdCBtZXRhZGF0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGBjb250ZW50L2V4YW1wbGVzLyR7Z3JvdXBfZGlyfS9tZXRhLmpzb25gLCAndXRmLTgnKSk7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dGl0bGU6IG1ldGFkYXRhLnRpdGxlLFxyXG5cdFx0XHRleGFtcGxlczogZnMucmVhZGRpclN5bmMoYGNvbnRlbnQvZXhhbXBsZXMvJHtncm91cF9kaXJ9YCkuZmlsdGVyKGZpbGUgPT4gZmlsZSAhPT0gJ21ldGEuanNvbicpLm1hcChleGFtcGxlX2RpciA9PiB7XHJcblx0XHRcdFx0Y29uc3Qgc2x1ZyA9IGV4YW1wbGVfZGlyLnJlcGxhY2UoL15cXGQrLS8sICcnKTtcclxuXHJcblx0XHRcdFx0aWYgKGxvb2t1cC5oYXMoc2x1ZykpIHRocm93IG5ldyBFcnJvcihgRHVwbGljYXRlIGV4YW1wbGUgc2x1ZyBcIiR7c2x1Z31cImApO1xyXG5cdFx0XHRcdGxvb2t1cC5zZXQoc2x1ZywgYCR7Z3JvdXBfZGlyfS8ke2V4YW1wbGVfZGlyfWApO1xyXG5cclxuXHRcdFx0XHRjb25zdCBtZXRhZGF0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGBjb250ZW50L2V4YW1wbGVzLyR7Z3JvdXBfZGlyfS8ke2V4YW1wbGVfZGlyfS9tZXRhLmpzb25gLCAndXRmLTgnKSk7XHJcblx0XHRcdFx0dGl0bGVzLnNldChzbHVnLCBtZXRhZGF0YS50aXRsZSk7XHJcblxyXG5cdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRzbHVnLFxyXG5cdFx0XHRcdFx0dGl0bGU6IG1ldGFkYXRhLnRpdGxlXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSlcclxuXHRcdH07XHJcblx0fSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRfZXhhbXBsZShzbHVnKSB7XHJcblx0aWYgKCFsb29rdXAgfHwgIWxvb2t1cC5oYXMoc2x1ZykpIGdldF9leGFtcGxlcygpO1xyXG5cclxuXHRjb25zdCBkaXIgPSBsb29rdXAuZ2V0KHNsdWcpO1xyXG5cdGNvbnN0IHRpdGxlID0gdGl0bGVzLmdldChzbHVnKTtcclxuXHJcblx0aWYgKCFkaXIgfHwgIXRpdGxlKSByZXR1cm4gbnVsbDtcclxuXHJcblx0Y29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhgY29udGVudC9leGFtcGxlcy8ke2Rpcn1gKVxyXG5cdFx0LmZpbHRlcihuYW1lID0+IG5hbWVbMF0gIT09ICcuJyAmJiBuYW1lICE9PSAnbWV0YS5qc29uJylcclxuXHRcdC5tYXAobmFtZSA9PiB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0bmFtZSxcclxuXHRcdFx0XHRzb3VyY2U6IGZzLnJlYWRGaWxlU3luYyhgY29udGVudC9leGFtcGxlcy8ke2Rpcn0vJHtuYW1lfWAsICd1dGYtOCcpXHJcblx0XHRcdH07XHJcblx0XHR9KTtcclxuXHJcblx0cmV0dXJuIHsgdGl0bGUsIGZpbGVzIH07XHJcbn1cclxuIiwiaW1wb3J0IHNlbmQgZnJvbSAnQHBvbGthL3NlbmQnO1xyXG5pbXBvcnQgeyBnZXRfZXhhbXBsZXMgfSBmcm9tICcuL19leGFtcGxlcy5qcyc7XHJcblxyXG5sZXQgY2FjaGVkO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xyXG5cdHRyeSB7XHJcblx0XHRpZiAoIWNhY2hlZCB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XHJcblx0XHRcdGNhY2hlZCA9IGdldF9leGFtcGxlcygpLmZpbHRlcihzZWN0aW9uID0+IHNlY3Rpb24udGl0bGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHNlbmQocmVzLCAyMDAsIGNhY2hlZCk7XHJcblx0fSBjYXRjaCAoZSkge1xyXG5cdFx0c2VuZChyZXMsIGUuc3RhdHVzIHx8IDUwMCwge1xyXG5cdFx0XHRtZXNzYWdlOiBlLm1lc3NhZ2VcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XHJcbmltcG9ydCB7IGdldF9leGFtcGxlIH0gZnJvbSAnLi9fZXhhbXBsZXMuanMnO1xyXG5cclxuY29uc3QgY2FjaGUgPSBuZXcgTWFwKCk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XHJcblx0Y29uc3QgeyBzbHVnIH0gPSByZXEucGFyYW1zO1xyXG5cclxuXHRsZXQgZXhhbXBsZSA9IGNhY2hlLmdldChzbHVnKTtcclxuXHJcblx0aWYgKCFleGFtcGxlIHx8IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcclxuXHRcdGV4YW1wbGUgPSBnZXRfZXhhbXBsZShzbHVnKTtcclxuXHRcdGlmIChleGFtcGxlKSBjYWNoZS5zZXQoc2x1ZywgZXhhbXBsZSk7XHJcblx0fVxyXG5cclxuXHRpZiAoZXhhbXBsZSkge1xyXG5cdFx0c2VuZChyZXMsIDIwMCwgZXhhbXBsZSk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHNlbmQocmVzLCA0MDQsIHtcclxuXHRcdFx0ZXJyb3I6ICdub3QgZm91bmQnXHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuIiwiZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbnZhciB3aGl0ZXNwYWNlID0gL1xccy87XHJcbnZhciB2YWxpZElkZW50aWZpZXJDaGFyYWN0ZXJzID0gL1thLXpBLVpfJF1bYS16QS1aMC05XyRdKi87XHJcbnZhciBlbnRpcmVseVZhbGlkSWRlbnRpZmllciA9IG5ldyBSZWdFeHAoJ14nICsgdmFsaWRJZGVudGlmaWVyQ2hhcmFjdGVycy5zb3VyY2UgKyAnJCcpO1xyXG52YXIgbnVtYmVyID0gL15OYU58KD86Wy0rXT8oPzooPzpJbmZpbml0eSl8KD86MFt4WF1bYS1mQS1GMC05XSspfCg/OjBbYkJdWzAxXSspfCg/OjBbb09dWzAtN10rKXwoPzooPzooPzpbMS05XVxcZCp8MCk/XFwuXFxkK3woPzpbMS05XVxcZCp8MClcXC5cXGQqfCg/OlsxLTldXFxkKnwwKSkoPzpbRXxlXVsrfC1dP1xcZCspPykpKS87XHJcbnZhciBTSU5HTEVfUVVPVEUgPSBcIidcIjtcclxudmFyIERPVUJMRV9RVU9URSA9ICdcIic7XHJcbmZ1bmN0aW9uIHNwYWNlcyhuKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gJyc7XHJcbiAgICB3aGlsZSAobi0tKVxyXG4gICAgICAgIHJlc3VsdCArPSAnICc7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRMb2NhdG9yKHNvdXJjZSwgb3B0aW9ucykge1xyXG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cclxuICAgIHZhciBvZmZzZXRMaW5lID0gb3B0aW9ucy5vZmZzZXRMaW5lIHx8IDA7XHJcbiAgICB2YXIgb2Zmc2V0Q29sdW1uID0gb3B0aW9ucy5vZmZzZXRDb2x1bW4gfHwgMDtcclxuICAgIHZhciBvcmlnaW5hbExpbmVzID0gc291cmNlLnNwbGl0KCdcXG4nKTtcclxuICAgIHZhciBzdGFydCA9IDA7XHJcbiAgICB2YXIgbGluZVJhbmdlcyA9IG9yaWdpbmFsTGluZXMubWFwKGZ1bmN0aW9uIChsaW5lLCBpKSB7XHJcbiAgICAgICAgdmFyIGVuZCA9IHN0YXJ0ICsgbGluZS5sZW5ndGggKyAxO1xyXG4gICAgICAgIHZhciByYW5nZSA9IHsgc3RhcnQ6IHN0YXJ0LCBlbmQ6IGVuZCwgbGluZTogaSB9O1xyXG4gICAgICAgIHN0YXJ0ID0gZW5kO1xyXG4gICAgICAgIHJldHVybiByYW5nZTtcclxuICAgIH0pO1xyXG4gICAgdmFyIGkgPSAwO1xyXG4gICAgZnVuY3Rpb24gcmFuZ2VDb250YWlucyhyYW5nZSwgaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gcmFuZ2Uuc3RhcnQgPD0gaW5kZXggJiYgaW5kZXggPCByYW5nZS5lbmQ7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBnZXRMb2NhdGlvbihyYW5nZSwgaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4geyBsaW5lOiBvZmZzZXRMaW5lICsgcmFuZ2UubGluZSwgY29sdW1uOiBvZmZzZXRDb2x1bW4gKyBpbmRleCAtIHJhbmdlLnN0YXJ0LCBjaGFyYWN0ZXI6IGluZGV4IH07XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBsb2NhdGUoc2VhcmNoLCBzdGFydEluZGV4KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzZWFyY2ggPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHNlYXJjaCA9IHNvdXJjZS5pbmRleE9mKHNlYXJjaCwgc3RhcnRJbmRleCB8fCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJhbmdlID0gbGluZVJhbmdlc1tpXTtcclxuICAgICAgICB2YXIgZCA9IHNlYXJjaCA+PSByYW5nZS5lbmQgPyAxIDogLTE7XHJcbiAgICAgICAgd2hpbGUgKHJhbmdlKSB7XHJcbiAgICAgICAgICAgIGlmIChyYW5nZUNvbnRhaW5zKHJhbmdlLCBzZWFyY2gpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldExvY2F0aW9uKHJhbmdlLCBzZWFyY2gpO1xyXG4gICAgICAgICAgICBpICs9IGQ7XHJcbiAgICAgICAgICAgIHJhbmdlID0gbGluZVJhbmdlc1tpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBsb2NhdGU7XHJcbn1cclxuZnVuY3Rpb24gbG9jYXRlKHNvdXJjZSwgc2VhcmNoLCBvcHRpb25zKSB7XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2NhdGUgdGFrZXMgYSB7IHN0YXJ0SW5kZXgsIG9mZnNldExpbmUsIG9mZnNldENvbHVtbiB9IG9iamVjdCBhcyB0aGUgdGhpcmQgYXJndW1lbnQnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBnZXRMb2NhdG9yKHNvdXJjZSwgb3B0aW9ucykoc2VhcmNoLCBvcHRpb25zICYmIG9wdGlvbnMuc3RhcnRJbmRleCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlKHN0ciwgb3B0cykge1xyXG4gICAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXIoc3RyLCBvcHRzKTtcclxuICAgIHJldHVybiBwYXJzZXIudmFsdWU7XHJcbn1cclxuZnVuY3Rpb24gbm9vcCgpIHsgfVxyXG52YXIgUGFyc2VFcnJvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhQYXJzZUVycm9yLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gUGFyc2VFcnJvcihtZXNzYWdlLCBwb3MsIGxvYykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIG1lc3NhZ2UpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMucG9zID0gcG9zO1xyXG4gICAgICAgIF90aGlzLmxvYyA9IGxvYztcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUGFyc2VFcnJvcjtcclxufShFcnJvcikpO1xyXG4vLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lc2NhcGVzXHJcbnZhciBlc2NhcGVhYmxlID0ge1xyXG4gICAgYjogJ1xcYicsXHJcbiAgICBuOiAnXFxuJyxcclxuICAgIGY6ICdcXGYnLFxyXG4gICAgcjogJ1xccicsXHJcbiAgICB0OiAnXFx0JyxcclxuICAgIHY6ICdcXHYnLFxyXG4gICAgMDogJ1xcMCdcclxufTtcclxudmFyIGhleCA9IC9eW2EtZkEtRjAtOV0rJC87XHJcbnZhciBQYXJzZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQYXJzZXIoc3RyLCBvcHRzKSB7XHJcbiAgICAgICAgdGhpcy5zdHIgPSBzdHI7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgICAgICAgdGhpcy5vbkNvbW1lbnQgPSAob3B0cyAmJiBvcHRzLm9uQ29tbWVudCkgfHwgbm9vcDtcclxuICAgICAgICB0aGlzLm9uVmFsdWUgPSAob3B0cyAmJiBvcHRzLm9uVmFsdWUpIHx8IG5vb3A7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMucmVhZFZhbHVlKCk7XHJcbiAgICAgICAgdGhpcy5hbGxvd1doaXRlc3BhY2VPckNvbW1lbnQoKTtcclxuICAgICAgICBpZiAodGhpcy5pbmRleCA8IHRoaXMuc3RyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGNoYXJhY3RlciAnXCIgKyB0aGlzLnBlZWsoKSArIFwiJ1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBQYXJzZXIucHJvdG90eXBlLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMuc3RyLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICB3aGl0ZXNwYWNlLnRlc3QodGhpcy5zdHJbdGhpcy5pbmRleF0pKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcclxuICAgICAgICBpZiAodGhpcy5lYXQoJy8nKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lYXQoJy8nKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gbGluZSBjb21tZW50XHJcbiAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IHRoaXMucmVhZFVudGlsKC8oPzpcXHJcXG58XFxufFxccikvKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub25Db21tZW50KHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdDb21tZW50JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVhdCgnXFxuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5lYXQoJyonKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYmxvY2sgY29tbWVudFxyXG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSB0aGlzLnJlYWRVbnRpbCgvXFwqXFwvLyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ29tbWVudCh7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZDogdGhpcy5pbmRleCxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQ29tbWVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogdGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBibG9jazogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVhdCgnKi8nLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xyXG4gICAgfTtcclxuICAgIFBhcnNlci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSwgaW5kZXgpIHtcclxuICAgICAgICBpZiAoaW5kZXggPT09IHZvaWQgMCkgeyBpbmRleCA9IHRoaXMuaW5kZXg7IH1cclxuICAgICAgICB2YXIgbG9jID0gbG9jYXRlKHRoaXMuc3RyLCBpbmRleCwgeyBvZmZzZXRMaW5lOiAxIH0pO1xyXG4gICAgICAgIHRocm93IG5ldyBQYXJzZUVycm9yKG1lc3NhZ2UsIGluZGV4LCBsb2MpO1xyXG4gICAgfTtcclxuICAgIFBhcnNlci5wcm90b3R5cGUuZWF0ID0gZnVuY3Rpb24gKHN0ciwgcmVxdWlyZWQpIHtcclxuICAgICAgICBpZiAodGhpcy5zdHIuc2xpY2UodGhpcy5pbmRleCwgdGhpcy5pbmRleCArIHN0ci5sZW5ndGgpID09PSBzdHIpIHtcclxuICAgICAgICAgICAgdGhpcy5pbmRleCArPSBzdHIubGVuZ3RoO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVxdWlyZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5lcnJvcihcIkV4cGVjdGVkICdcIiArIHN0ciArIFwiJyBpbnN0ZWFkIG9mICdcIiArIHRoaXMuc3RyW3RoaXMuaW5kZXhdICsgXCInXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcbiAgICBQYXJzZXIucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyW3RoaXMuaW5kZXhdO1xyXG4gICAgfTtcclxuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uIChwYXR0ZXJuKSB7XHJcbiAgICAgICAgdmFyIG1hdGNoID0gcGF0dGVybi5leGVjKHRoaXMuc3RyLnNsaWNlKHRoaXMuaW5kZXgpKTtcclxuICAgICAgICBpZiAoIW1hdGNoIHx8IG1hdGNoLmluZGV4ICE9PSAwKVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB0aGlzLmluZGV4ICs9IG1hdGNoWzBdLmxlbmd0aDtcclxuICAgICAgICByZXR1cm4gbWF0Y2hbMF07XHJcbiAgICB9O1xyXG4gICAgUGFyc2VyLnByb3RvdHlwZS5yZWFkVW50aWwgPSBmdW5jdGlvbiAocGF0dGVybikge1xyXG4gICAgICAgIGlmICh0aGlzLmluZGV4ID49IHRoaXMuc3RyLmxlbmd0aClcclxuICAgICAgICAgICAgdGhpcy5lcnJvcignVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQnKTtcclxuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xyXG4gICAgICAgIHZhciBtYXRjaCA9IHBhdHRlcm4uZXhlYyh0aGlzLnN0ci5zbGljZShzdGFydCkpO1xyXG4gICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICB2YXIgc3RhcnRfMSA9IHRoaXMuaW5kZXg7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSBzdGFydF8xICsgbWF0Y2guaW5kZXg7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0ci5zbGljZShzdGFydF8xLCB0aGlzLmluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IHRoaXMuc3RyLmxlbmd0aDtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdHIuc2xpY2Uoc3RhcnQpO1xyXG4gICAgfTtcclxuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZEFycmF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XHJcbiAgICAgICAgaWYgKCF0aGlzLmVhdCgnWycpKVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB2YXIgYXJyYXkgPSB7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiAnQXJyYXlFeHByZXNzaW9uJyxcclxuICAgICAgICAgICAgZWxlbWVudHM6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xyXG4gICAgICAgIHdoaWxlICh0aGlzLnBlZWsoKSAhPT0gJ10nKSB7XHJcbiAgICAgICAgICAgIGFycmF5LmVsZW1lbnRzLnB1c2godGhpcy5yZWFkVmFsdWUoKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWxsb3dXaGl0ZXNwYWNlT3JDb21tZW50KCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5lYXQoJywnKSlcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuZWF0KCddJykpIHtcclxuICAgICAgICAgICAgdGhpcy5lcnJvcihcIkV4cGVjdGVkICddJyBpbnN0ZWFkIG9mICdcIiArIHRoaXMuc3RyW3RoaXMuaW5kZXhdICsgXCInXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhcnJheS5lbmQgPSB0aGlzLmluZGV4O1xyXG4gICAgICAgIHJldHVybiBhcnJheTtcclxuICAgIH07XHJcbiAgICBQYXJzZXIucHJvdG90eXBlLnJlYWRCb29sZWFuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XHJcbiAgICAgICAgdmFyIHJhdyA9IHRoaXMucmVhZCgvXih0cnVlfGZhbHNlKS8pO1xyXG4gICAgICAgIGlmIChyYXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogdGhpcy5pbmRleCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdMaXRlcmFsJyxcclxuICAgICAgICAgICAgICAgIHJhdzogcmF3LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJhdyA9PT0gJ3RydWUnXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZE51bGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcclxuICAgICAgICBpZiAodGhpcy5lYXQoJ251bGwnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgZW5kOiB0aGlzLmluZGV4LFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ0xpdGVyYWwnLFxyXG4gICAgICAgICAgICAgICAgcmF3OiAnbnVsbCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBQYXJzZXIucHJvdG90eXBlLnJlYWRMaXRlcmFsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5yZWFkQm9vbGVhbigpIHx8XHJcbiAgICAgICAgICAgIHRoaXMucmVhZE51bWJlcigpIHx8XHJcbiAgICAgICAgICAgIHRoaXMucmVhZFN0cmluZygpIHx8XHJcbiAgICAgICAgICAgIHRoaXMucmVhZE51bGwoKSk7XHJcbiAgICB9O1xyXG4gICAgUGFyc2VyLnByb3RvdHlwZS5yZWFkTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XHJcbiAgICAgICAgdmFyIHJhdyA9IHRoaXMucmVhZChudW1iZXIpO1xyXG4gICAgICAgIGlmIChyYXcpIHtcclxuICAgICAgICAgICAgdmFyIHNpZ24gPSByYXdbMF07XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9ICsoc2lnbiA9PT0gJy0nIHx8IHNpZ24gPT09ICcrJyA/IHJhdy5zbGljZSgxKSA6IHJhdyk7XHJcbiAgICAgICAgICAgIGlmIChzaWduID09PSAnLScpXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IC12YWx1ZTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogdGhpcy5pbmRleCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdMaXRlcmFsJyxcclxuICAgICAgICAgICAgICAgIHJhdzogcmF3LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZE9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xyXG4gICAgICAgIGlmICghdGhpcy5lYXQoJ3snKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciBvYmplY3QgPSB7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiAnT2JqZWN0RXhwcmVzc2lvbicsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xyXG4gICAgICAgIHdoaWxlICh0aGlzLnBlZWsoKSAhPT0gJ30nKSB7XHJcbiAgICAgICAgICAgIG9iamVjdC5wcm9wZXJ0aWVzLnB1c2godGhpcy5yZWFkUHJvcGVydHkoKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWxsb3dXaGl0ZXNwYWNlT3JDb21tZW50KCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5lYXQoJywnKSlcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVhdCgnfScsIHRydWUpO1xyXG4gICAgICAgIG9iamVjdC5lbmQgPSB0aGlzLmluZGV4O1xyXG4gICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICB9O1xyXG4gICAgUGFyc2VyLnByb3RvdHlwZS5yZWFkUHJvcGVydHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5hbGxvd1doaXRlc3BhY2VPckNvbW1lbnQoKTtcclxuICAgICAgICB2YXIgcHJvcGVydHkgPSB7XHJcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmluZGV4LFxyXG4gICAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6ICdQcm9wZXJ0eScsXHJcbiAgICAgICAgICAgIGtleTogdGhpcy5yZWFkUHJvcGVydHlLZXkoKSxcclxuICAgICAgICAgICAgdmFsdWU6IHRoaXMucmVhZFZhbHVlKClcclxuICAgICAgICB9O1xyXG4gICAgICAgIHByb3BlcnR5LmVuZCA9IHRoaXMuaW5kZXg7XHJcbiAgICAgICAgcmV0dXJuIHByb3BlcnR5O1xyXG4gICAgfTtcclxuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZElkZW50aWZpZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMucmVhZCh2YWxpZElkZW50aWZpZXJDaGFyYWN0ZXJzKTtcclxuICAgICAgICBpZiAobmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgZW5kOiB0aGlzLmluZGV4LFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lkZW50aWZpZXInLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBQYXJzZXIucHJvdG90eXBlLnJlYWRQcm9wZXJ0eUtleSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIga2V5ID0gdGhpcy5yZWFkU3RyaW5nKCkgfHwgdGhpcy5yZWFkSWRlbnRpZmllcigpO1xyXG4gICAgICAgIGlmICgha2V5KVxyXG4gICAgICAgICAgICB0aGlzLmVycm9yKFwiQmFkIGlkZW50aWZpZXIgYXMgdW5xdW90ZWQga2V5XCIpO1xyXG4gICAgICAgIGlmIChrZXkudHlwZSA9PT0gJ0xpdGVyYWwnKSB7XHJcbiAgICAgICAgICAgIGtleS5uYW1lID0gU3RyaW5nKGtleS52YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYWxsb3dXaGl0ZXNwYWNlT3JDb21tZW50KCk7XHJcbiAgICAgICAgdGhpcy5lYXQoJzonLCB0cnVlKTtcclxuICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgfTtcclxuICAgIFBhcnNlci5wcm90b3R5cGUucmVhZFN0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xyXG4gICAgICAgIC8vIGNvbnN0IHF1b3RlID0gdGhpcy5yZWFkKC9eWydcIl0vKTtcclxuICAgICAgICB2YXIgcXVvdGUgPSB0aGlzLmVhdChTSU5HTEVfUVVPVEUpIHx8IHRoaXMuZWF0KERPVUJMRV9RVU9URSk7XHJcbiAgICAgICAgaWYgKCFxdW90ZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciBlc2NhcGVkID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gJyc7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuaW5kZXggPCB0aGlzLnN0ci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIGNoYXJfMSA9IHRoaXMuc3RyW3RoaXMuaW5kZXgrK107XHJcbiAgICAgICAgICAgIGlmIChlc2NhcGVkKSB7XHJcbiAgICAgICAgICAgICAgICBlc2NhcGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyBsaW5lIGNvbnRpbnVhdGlvbnNcclxuICAgICAgICAgICAgICAgIGlmIChjaGFyXzEgPT09ICdcXG4nKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoYXJfMSA9PT0gJ1xccicpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHJbdGhpcy5pbmRleF0gPT09ICdcXG4nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGV4ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hhcl8xID09PSAneCcgfHwgY2hhcl8xID09PSAndScpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRfMiA9IHRoaXMuaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVuZCA9IHRoaXMuaW5kZXggKz0gKGNoYXJfMSA9PT0gJ3gnID8gMiA6IDQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2RlID0gdGhpcy5zdHIuc2xpY2Uoc3RhcnRfMiwgZW5kKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWhleC50ZXN0KGNvZGUpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9yKFwiSW52YWxpZCBcIiArIChjaGFyXzEgPT09ICd4JyA/ICdoZXhhZGVjaW1hbCcgOiAnVW5pY29kZScpICsgXCIgZXNjYXBlIHNlcXVlbmNlXCIsIHN0YXJ0XzIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQoY29kZSwgMTYpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlICs9IGVzY2FwZWFibGVbY2hhcl8xXSB8fCBjaGFyXzE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoY2hhcl8xID09PSAnXFxcXCcpIHtcclxuICAgICAgICAgICAgICAgIGVzY2FwZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGNoYXJfMSA9PT0gcXVvdGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBlbmQgPSB0aGlzLmluZGV4O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5kOiBlbmQsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0xpdGVyYWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhdzogdGhpcy5zdHIuc2xpY2Uoc3RhcnQsIGVuZCksXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoYXJfMSA9PT0gJ1xcbicpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcihcIkJhZCBzdHJpbmdcIiwgdGhpcy5pbmRleCAtIDEpO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gY2hhcl8xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZXJyb3IoXCJVbmV4cGVjdGVkIGVuZCBvZiBpbnB1dFwiKTtcclxuICAgIH07XHJcbiAgICBQYXJzZXIucHJvdG90eXBlLnJlYWRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmFsbG93V2hpdGVzcGFjZU9yQ29tbWVudCgpO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9ICh0aGlzLnJlYWRBcnJheSgpIHx8XHJcbiAgICAgICAgICAgIHRoaXMucmVhZE9iamVjdCgpIHx8XHJcbiAgICAgICAgICAgIHRoaXMucmVhZExpdGVyYWwoKSk7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25WYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lcnJvcihcIlVuZXhwZWN0ZWQgRU9GXCIpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQYXJzZXI7XHJcbn0oKSk7XHJcblxyXG5mdW5jdGlvbiBldmFsdWF0ZShzdHIpIHtcclxuICAgIHZhciBhc3QgPSBwYXJzZShzdHIpO1xyXG4gICAgcmV0dXJuIGdldFZhbHVlKGFzdCk7XHJcbn1cclxuZnVuY3Rpb24gZ2V0VmFsdWUobm9kZSkge1xyXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ0xpdGVyYWwnKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vZGUudmFsdWU7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS50eXBlID09PSAnQXJyYXlFeHByZXNzaW9uJykge1xyXG4gICAgICAgIHJldHVybiBub2RlLmVsZW1lbnRzLm1hcChnZXRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS50eXBlID09PSAnT2JqZWN0RXhwcmVzc2lvbicpIHtcclxuICAgICAgICB2YXIgb2JqXzEgPSB7fTtcclxuICAgICAgICBub2RlLnByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xyXG4gICAgICAgICAgICBvYmpfMVtwcm9wLmtleS5uYW1lXSA9IGdldFZhbHVlKHByb3AudmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvYmpfMTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlLCBvcHRpb25zKSB7XHJcbiAgICB2YXIgcXVvdGUgPSAob3B0aW9ucyAmJiBvcHRpb25zLnNpbmdsZVF1b3RlcykgPyBcIidcIiA6ICdcIic7XHJcbiAgICB2YXIgaW5kZW50U3RyaW5nID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5zcGFjZXMpID8gc3BhY2VzKG9wdGlvbnMuc3BhY2VzKSA6ICdcXHQnO1xyXG4gICAgcmV0dXJuIHN0cmluZ2lmeVZhbHVlKHZhbHVlLCBxdW90ZSwgJ1xcbicsIGluZGVudFN0cmluZywgdHJ1ZSk7XHJcbn1cclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2pzb241L2pzb241L2Jsb2IvNjViY2M1NTZlYjYyOTk4NGIzM2JiMjE2M2NiYzEwZmJhNDU5NzMwMC9zcmMvc3RyaW5naWZ5LmpzI0wxMTBcclxudmFyIGVzY2FwZWFibGUkMSA9IHtcclxuICAgIFwiJ1wiOiBcIidcIixcclxuICAgICdcIic6ICdcIicsXHJcbiAgICAnXFxcXCc6ICdcXFxcJyxcclxuICAgICdcXGInOiAnYicsXHJcbiAgICAnXFxmJzogJ2YnLFxyXG4gICAgJ1xcbic6ICduJyxcclxuICAgICdcXHInOiAncicsXHJcbiAgICAnXFx0JzogJ3QnLFxyXG4gICAgJ1xcdic6ICd2JyxcclxuICAgICdcXDAnOiAnMCcsXHJcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXHJcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcclxufTtcclxudmFyIGVzY2FwZWFibGVSZWdleCA9IC9bJ1wiXFxcXFxcYlxcZlxcblxcclxcdFxcdlxcMFxcdTIwMjhcXHUyMDI5XS9nO1xyXG5mdW5jdGlvbiBzdHJpbmdpZnlTdHJpbmcoc3RyLCBxdW90ZSkge1xyXG4gICAgdmFyIG90aGVyUXVvdGUgPSBxdW90ZSA9PT0gJ1wiJyA/IFwiJ1wiIDogJ1wiJztcclxuICAgIHJldHVybiBxdW90ZSArIHN0ci5yZXBsYWNlKGVzY2FwZWFibGVSZWdleCwgZnVuY3Rpb24gKGNoYXIpIHtcclxuICAgICAgICByZXR1cm4gY2hhciA9PT0gb3RoZXJRdW90ZSA/IGNoYXIgOiAnXFxcXCcgKyBlc2NhcGVhYmxlJDFbY2hhcl07XHJcbiAgICB9KSArIHF1b3RlO1xyXG59XHJcbmZ1bmN0aW9uIHN0cmluZ2lmeVByb3BlcnR5KGtleSwgdmFsdWUsIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBuZXdsaW5lcykge1xyXG4gICAgcmV0dXJuICgoZW50aXJlbHlWYWxpZElkZW50aWZpZXIudGVzdChrZXkpID8ga2V5IDogc3RyaW5naWZ5U3RyaW5nKGtleSwgcXVvdGUpKSArXHJcbiAgICAgICAgJzogJyArXHJcbiAgICAgICAgc3RyaW5naWZ5VmFsdWUodmFsdWUsIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBuZXdsaW5lcykpO1xyXG59XHJcbmZ1bmN0aW9uIHN0cmluZ2lmeVZhbHVlKHZhbHVlLCBxdW90ZSwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgbmV3bGluZXMpIHtcclxuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xyXG4gICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZyh2YWx1ZSwgcXVvdGUpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGUgPT09ICdudW1iZXInIHx8IHR5cGUgPT09ICdib29sZWFuJyB8fCB2YWx1ZSA9PT0gbnVsbClcclxuICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgIHZhciBlbGVtZW50cyA9IHZhbHVlLm1hcChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5naWZ5VmFsdWUoZWxlbWVudCwgcXVvdGUsIGluZGVudGF0aW9uICsgaW5kZW50U3RyaW5nLCBpbmRlbnRTdHJpbmcsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChuZXdsaW5lcykge1xyXG4gICAgICAgICAgICByZXR1cm4gKFwiW1xcblwiICsgKGluZGVudGF0aW9uICsgaW5kZW50U3RyaW5nKSArXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5qb2luKFwiLFxcblwiICsgKGluZGVudGF0aW9uICsgaW5kZW50U3RyaW5nKSkgK1xyXG4gICAgICAgICAgICAgICAgKFwiXFxuXCIgKyBpbmRlbnRhdGlvbiArIFwiXVwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBcIlsgXCIgKyBlbGVtZW50cy5qb2luKCcsICcpICsgXCIgXVwiO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XHJcbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSBrZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdpZnlQcm9wZXJ0eShrZXksIHZhbHVlW2tleV0sIHF1b3RlLCBpbmRlbnRhdGlvbiArIGluZGVudFN0cmluZywgaW5kZW50U3RyaW5nLCBuZXdsaW5lcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKG5ld2xpbmVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoXCJ7XCIgKyAoaW5kZW50YXRpb24gKyBpbmRlbnRTdHJpbmcpICtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuam9pbihcIixcIiArIChpbmRlbnRhdGlvbiArIGluZGVudFN0cmluZykpICtcclxuICAgICAgICAgICAgICAgIChpbmRlbnRhdGlvbiArIFwifVwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBcInsgXCIgKyBwcm9wZXJ0aWVzLmpvaW4oJywgJykgKyBcIiB9XCI7XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgc3RyaW5naWZ5IFwiICsgdHlwZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhdGNoKHN0ciwgdmFsdWUpIHtcclxuICAgIHZhciBjb3VudHMgPSB7fTtcclxuICAgIGNvdW50c1tTSU5HTEVfUVVPVEVdID0gMDtcclxuICAgIGNvdW50c1tET1VCTEVfUVVPVEVdID0gMDtcclxuICAgIHZhciBpbmRlbnRTdHJpbmcgPSBndWVzc0luZGVudFN0cmluZyhzdHIpO1xyXG4gICAgdmFyIHJvb3QgPSBwYXJzZShzdHIsIHtcclxuICAgICAgICBvblZhbHVlOiBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgICAgICBpZiAobm9kZS50eXBlID09PSAnTGl0ZXJhbCcgJiYgdHlwZW9mIG5vZGUudmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudHNbbm9kZS5yYXdbMF1dICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHZhciBxdW90ZSA9IGNvdW50c1tTSU5HTEVfUVVPVEVdID4gY291bnRzW0RPVUJMRV9RVU9URV0gP1xyXG4gICAgICAgIFNJTkdMRV9RVU9URSA6XHJcbiAgICAgICAgRE9VQkxFX1FVT1RFO1xyXG4gICAgdmFyIG5ld2xpbmVzID0gKC9cXG4vLnRlc3Qoc3RyLnNsaWNlKHJvb3Quc3RhcnQsIHJvb3QuZW5kKSkgfHxcclxuICAgICAgICByb290LnR5cGUgPT09ICdBcnJheUV4cHJlc3Npb24nICYmIHJvb3QuZWxlbWVudHMubGVuZ3RoID09PSAwIHx8XHJcbiAgICAgICAgcm9vdC50eXBlID09PSAnT2JqZWN0RXhwcmVzc2lvbicgJiYgcm9vdC5wcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCk7XHJcbiAgICByZXR1cm4gKHN0ci5zbGljZSgwLCByb290LnN0YXJ0KSArXHJcbiAgICAgICAgcGF0Y2hWYWx1ZShyb290LCB2YWx1ZSwgc3RyLCAnJywgaW5kZW50U3RyaW5nLCBxdW90ZSwgbmV3bGluZXMpICtcclxuICAgICAgICBzdHIuc2xpY2Uocm9vdC5lbmQpKTtcclxufVxyXG5mdW5jdGlvbiBwYXRjaFZhbHVlKG5vZGUsIHZhbHVlLCBzdHIsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIHF1b3RlLCBuZXdsaW5lcykge1xyXG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XHJcbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBpZiAobm9kZS50eXBlID09PSAnTGl0ZXJhbCcgJiYgdHlwZW9mIG5vZGUudmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIC8vIHByZXNlcnZlIHF1b3RlIHN0eWxlXHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdpZnlTdHJpbmcodmFsdWUsIG5vZGUucmF3WzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZyh2YWx1ZSwgcXVvdGUpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGNoTnVtYmVyKG5vZGUucmF3LCB2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZSA9PT0gJ2Jvb2xlYW4nIHx8IHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICBpZiAobm9kZS50eXBlID09PSAnQXJyYXlFeHByZXNzaW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gcGF0Y2hBcnJheShub2RlLCB2YWx1ZSwgc3RyLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBxdW90ZSwgbmV3bGluZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5VmFsdWUodmFsdWUsIHF1b3RlLCBpbmRlbnRhdGlvbiwgaW5kZW50U3RyaW5nLCBuZXdsaW5lcyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBpZiAobm9kZS50eXBlID09PSAnT2JqZWN0RXhwcmVzc2lvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhdGNoT2JqZWN0KG5vZGUsIHZhbHVlLCBzdHIsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIHF1b3RlLCBuZXdsaW5lcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlWYWx1ZSh2YWx1ZSwgcXVvdGUsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIG5ld2xpbmVzKTtcclxuICAgIH1cclxuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzdHJpbmdpZnkgXCIgKyB0eXBlICsgXCJzXCIpO1xyXG59XHJcbmZ1bmN0aW9uIHBhdGNoTnVtYmVyKHJhdywgdmFsdWUpIHtcclxuICAgIHZhciBtYXRjaFJhZGl4ID0gL14oWy0rXSk/MChbYm94Qk9YXSkvLmV4ZWMocmF3KTtcclxuICAgIGlmIChtYXRjaFJhZGl4ICYmIHZhbHVlICUgMSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiAoKG1hdGNoUmFkaXhbMV0gPT09ICcrJyAmJiB2YWx1ZSA+PSAwID8gJysnIDogdmFsdWUgPCAwID8gJy0nIDogJycpICtcclxuICAgICAgICAgICAgJzAnICsgbWF0Y2hSYWRpeFsyXSArXHJcbiAgICAgICAgICAgIE1hdGguYWJzKHZhbHVlKS50b1N0cmluZyhtYXRjaFJhZGl4WzJdID09PSAnYicgfHwgbWF0Y2hSYWRpeFsyXSA9PT0gJ0InID8gMiA6XHJcbiAgICAgICAgICAgICAgICBtYXRjaFJhZGl4WzJdID09PSAnbycgfHwgbWF0Y2hSYWRpeFsyXSA9PT0gJ08nID8gOCA6XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hSYWRpeFsyXSA9PT0gJ3gnIHx8IG1hdGNoUmFkaXhbMl0gPT09ICdYJyA/IDE2IDogbnVsbCkpO1xyXG4gICAgfVxyXG4gICAgdmFyIG1hdGNoID0gL14oWy0rXSk/KFxcLik/Ly5leGVjKHJhdyk7XHJcbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbMF0ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHJldHVybiAoKG1hdGNoWzFdID09PSAnKycgJiYgdmFsdWUgPj0gMCA/ICcrJyA6IHZhbHVlIDwgMCA/ICctJyA6ICcnKSArXHJcbiAgICAgICAgICAgIChtYXRjaFsyXSA/IFN0cmluZyhNYXRoLmFicyh2YWx1ZSkpLnJlcGxhY2UoL14wLywgJycpIDogU3RyaW5nKE1hdGguYWJzKHZhbHVlKSkpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xyXG59XHJcbmZ1bmN0aW9uIHBhdGNoQXJyYXkobm9kZSwgdmFsdWUsIHN0ciwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgcXVvdGUsIG5ld2xpbmVzKSB7XHJcbiAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vZGUuZWxlbWVudHMubGVuZ3RoID09PSAwID8gc3RyLnNsaWNlKG5vZGUuc3RhcnQsIG5vZGUuZW5kKSA6ICdbXSc7XHJcbiAgICB9XHJcbiAgICB2YXIgcHJlY2VkaW5nV2hpdGVzcGFjZSA9IGdldFByZWNlZGluZ1doaXRlc3BhY2Uoc3RyLCBub2RlLnN0YXJ0KTtcclxuICAgIHZhciBlbXB0eSA9IHByZWNlZGluZ1doaXRlc3BhY2UgPT09ICcnO1xyXG4gICAgdmFyIG5ld2xpbmUgPSBlbXB0eSB8fCAvXFxuLy50ZXN0KHByZWNlZGluZ1doaXRlc3BhY2UpO1xyXG4gICAgaWYgKG5vZGUuZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVZhbHVlKHZhbHVlLCBxdW90ZSwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgbmV3bGluZSk7XHJcbiAgICB9XHJcbiAgICB2YXIgaSA9IDA7XHJcbiAgICB2YXIgYyA9IG5vZGUuc3RhcnQ7XHJcbiAgICB2YXIgcGF0Y2hlZCA9ICcnO1xyXG4gICAgdmFyIG5ld2xpbmVzSW5zaWRlVmFsdWUgPSBzdHIuc2xpY2Uobm9kZS5zdGFydCwgbm9kZS5lbmQpLnNwbGl0KCdcXG4nKS5sZW5ndGggPiAxO1xyXG4gICAgZm9yICg7IGkgPCB2YWx1ZS5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gbm9kZS5lbGVtZW50c1tpXTtcclxuICAgICAgICBpZiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBwYXRjaGVkICs9XHJcbiAgICAgICAgICAgICAgICBzdHIuc2xpY2UoYywgZWxlbWVudC5zdGFydCkgK1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGNoVmFsdWUoZWxlbWVudCwgdmFsdWVbaV0sIHN0ciwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgcXVvdGUsIG5ld2xpbmVzSW5zaWRlVmFsdWUpO1xyXG4gICAgICAgICAgICBjID0gZWxlbWVudC5lbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBhcHBlbmQgbmV3IGVsZW1lbnRcclxuICAgICAgICAgICAgaWYgKG5ld2xpbmVzSW5zaWRlVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHBhdGNoZWQgKz1cclxuICAgICAgICAgICAgICAgICAgICBcIixcXG5cIiArIChpbmRlbnRhdGlvbiArIGluZGVudFN0cmluZykgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdpZnlWYWx1ZSh2YWx1ZVtpXSwgcXVvdGUsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGF0Y2hlZCArPVxyXG4gICAgICAgICAgICAgICAgICAgIFwiLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ2lmeVZhbHVlKHZhbHVlW2ldLCBxdW90ZSwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGkgPCBub2RlLmVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgIGMgPSBub2RlLmVsZW1lbnRzW25vZGUuZWxlbWVudHMubGVuZ3RoIC0gMV0uZW5kO1xyXG4gICAgfVxyXG4gICAgcGF0Y2hlZCArPSBzdHIuc2xpY2UoYywgbm9kZS5lbmQpO1xyXG4gICAgcmV0dXJuIHBhdGNoZWQ7XHJcbn1cclxuZnVuY3Rpb24gcGF0Y2hPYmplY3Qobm9kZSwgdmFsdWUsIHN0ciwgaW5kZW50YXRpb24sIGluZGVudFN0cmluZywgcXVvdGUsIG5ld2xpbmVzKSB7XHJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcclxuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBub2RlLnByb3BlcnRpZXMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgID8gc3RyLnNsaWNlKG5vZGUuc3RhcnQsIG5vZGUuZW5kKVxyXG4gICAgICAgICAgICA6ICd7fSc7XHJcbiAgICB9XHJcbiAgICB2YXIgZXhpc3RpbmdQcm9wZXJ0aWVzID0ge307XHJcbiAgICBub2RlLnByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xyXG4gICAgICAgIGV4aXN0aW5nUHJvcGVydGllc1twcm9wLmtleS5uYW1lXSA9IHByb3A7XHJcbiAgICB9KTtcclxuICAgIHZhciBwcmVjZWRpbmdXaGl0ZXNwYWNlID0gZ2V0UHJlY2VkaW5nV2hpdGVzcGFjZShzdHIsIG5vZGUuc3RhcnQpO1xyXG4gICAgdmFyIGVtcHR5ID0gcHJlY2VkaW5nV2hpdGVzcGFjZSA9PT0gJyc7XHJcbiAgICB2YXIgbmV3bGluZSA9IGVtcHR5IHx8IC9cXG4vLnRlc3QocHJlY2VkaW5nV2hpdGVzcGFjZSk7XHJcbiAgICBpZiAobm9kZS5wcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlWYWx1ZSh2YWx1ZSwgcXVvdGUsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIG5ld2xpbmUpO1xyXG4gICAgfVxyXG4gICAgdmFyIGkgPSAwO1xyXG4gICAgdmFyIGMgPSBub2RlLnN0YXJ0O1xyXG4gICAgdmFyIHBhdGNoZWQgPSAnJztcclxuICAgIHZhciBuZXdsaW5lc0luc2lkZVZhbHVlID0gL1xcbi8udGVzdChzdHIuc2xpY2Uobm9kZS5zdGFydCwgbm9kZS5lbmQpKTtcclxuICAgIHZhciBzdGFydGVkID0gZmFsc2U7XHJcbiAgICB2YXIgaW50cm8gPSBzdHIuc2xpY2Uobm9kZS5zdGFydCwgbm9kZS5wcm9wZXJ0aWVzWzBdLnN0YXJ0KTtcclxuICAgIGZvciAoOyBpIDwgbm9kZS5wcm9wZXJ0aWVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIHByb3BlcnR5ID0gbm9kZS5wcm9wZXJ0aWVzW2ldO1xyXG4gICAgICAgIHZhciBwcm9wZXJ0eVZhbHVlID0gdmFsdWVbcHJvcGVydHkua2V5Lm5hbWVdO1xyXG4gICAgICAgIGluZGVudGF0aW9uID0gZ2V0SW5kZW50YXRpb24oc3RyLCBwcm9wZXJ0eS5zdGFydCk7XHJcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBwYXRjaGVkICs9IHN0YXJ0ZWRcclxuICAgICAgICAgICAgICAgID8gc3RyLnNsaWNlKGMsIHByb3BlcnR5LnZhbHVlLnN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgOiBpbnRybyArIHN0ci5zbGljZShwcm9wZXJ0eS5rZXkuc3RhcnQsIHByb3BlcnR5LnZhbHVlLnN0YXJ0KTtcclxuICAgICAgICAgICAgcGF0Y2hlZCArPSBwYXRjaFZhbHVlKHByb3BlcnR5LnZhbHVlLCBwcm9wZXJ0eVZhbHVlLCBzdHIsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIHF1b3RlLCBuZXdsaW5lc0luc2lkZVZhbHVlKTtcclxuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGMgPSBwcm9wZXJ0eS5lbmQ7XHJcbiAgICB9XHJcbiAgICAvLyBhcHBlbmQgbmV3IHByb3BlcnRpZXNcclxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgaWYgKGtleSBpbiBleGlzdGluZ1Byb3BlcnRpZXMpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB2YXIgcHJvcGVydHlWYWx1ZSA9IHZhbHVlW2tleV07XHJcbiAgICAgICAgcGF0Y2hlZCArPVxyXG4gICAgICAgICAgICAoc3RhcnRlZCA/ICcsJyArIChuZXdsaW5lc0luc2lkZVZhbHVlID8gaW5kZW50YXRpb24gOiAnICcpIDogaW50cm8pICtcclxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeVByb3BlcnR5KGtleSwgcHJvcGVydHlWYWx1ZSwgcXVvdGUsIGluZGVudGF0aW9uLCBpbmRlbnRTdHJpbmcsIG5ld2xpbmVzSW5zaWRlVmFsdWUpO1xyXG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBwYXRjaGVkICs9IHN0ci5zbGljZShjLCBub2RlLmVuZCk7XHJcbiAgICByZXR1cm4gcGF0Y2hlZDtcclxufVxyXG5mdW5jdGlvbiBnZXRJbmRlbnRhdGlvbihzdHIsIGkpIHtcclxuICAgIHdoaWxlIChpID4gMCAmJiAhd2hpdGVzcGFjZS50ZXN0KHN0cltpIC0gMV0pKVxyXG4gICAgICAgIGkgLT0gMTtcclxuICAgIHZhciBlbmQgPSBpO1xyXG4gICAgd2hpbGUgKGkgPiAwICYmIHdoaXRlc3BhY2UudGVzdChzdHJbaSAtIDFdKSlcclxuICAgICAgICBpIC09IDE7XHJcbiAgICByZXR1cm4gc3RyLnNsaWNlKGksIGVuZCk7XHJcbn1cclxuZnVuY3Rpb24gZ2V0UHJlY2VkaW5nV2hpdGVzcGFjZShzdHIsIGkpIHtcclxuICAgIHZhciBlbmQgPSBpO1xyXG4gICAgd2hpbGUgKGkgPiAwICYmIHdoaXRlc3BhY2UudGVzdChzdHJbaV0pKVxyXG4gICAgICAgIGkgLT0gMTtcclxuICAgIHJldHVybiBzdHIuc2xpY2UoaSwgZW5kKTtcclxufVxyXG5mdW5jdGlvbiBndWVzc0luZGVudFN0cmluZyhzdHIpIHtcclxuICAgIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJyk7XHJcbiAgICB2YXIgdGFicyA9IDA7XHJcbiAgICB2YXIgc3BhY2VzJCQxID0gMDtcclxuICAgIHZhciBtaW5TcGFjZXMgPSA4O1xyXG4gICAgbGluZXMuZm9yRWFjaChmdW5jdGlvbiAobGluZSkge1xyXG4gICAgICAgIHZhciBtYXRjaCA9IC9eKD86ICt8XFx0KykvLmV4ZWMobGluZSk7XHJcbiAgICAgICAgaWYgKCFtYXRjaClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciB3aGl0ZXNwYWNlJCQxID0gbWF0Y2hbMF07XHJcbiAgICAgICAgaWYgKHdoaXRlc3BhY2UkJDEubGVuZ3RoID09PSBsaW5lLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICh3aGl0ZXNwYWNlJCQxWzBdID09PSAnXFx0Jykge1xyXG4gICAgICAgICAgICB0YWJzICs9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzcGFjZXMkJDEgKz0gMTtcclxuICAgICAgICAgICAgaWYgKHdoaXRlc3BhY2UkJDEubGVuZ3RoID4gMSAmJiB3aGl0ZXNwYWNlJCQxLmxlbmd0aCA8IG1pblNwYWNlcykge1xyXG4gICAgICAgICAgICAgICAgbWluU3BhY2VzID0gd2hpdGVzcGFjZSQkMS5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGlmIChzcGFjZXMkJDEgPiB0YWJzKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIHdoaWxlIChtaW5TcGFjZXMtLSlcclxuICAgICAgICAgICAgcmVzdWx0ICs9ICcgJztcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICdcXHQnO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgeyBwYXJzZSwgZXZhbHVhdGUsIHBhdGNoLCBzdHJpbmdpZnkgfTtcclxuIiwiaW1wb3J0ICogYXMgZmxlZWNlIGZyb20gJ2dvbGRlbi1mbGVlY2UnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RfZnJvbnRtYXR0ZXIobWFya2Rvd24pIHtcclxuXHRjb25zdCBtYXRjaCA9IC8tLS1cXHI/XFxuKFtcXHNcXFNdKz8pXFxyP1xcbi0tLS8uZXhlYyhtYXJrZG93bik7XHJcblx0Y29uc3QgZnJvbnRNYXR0ZXIgPSBtYXRjaFsxXTtcclxuXHRjb25zdCBjb250ZW50ID0gbWFya2Rvd24uc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcclxuXHJcblx0Y29uc3QgbWV0YWRhdGEgPSB7fTtcclxuXHRmcm9udE1hdHRlci5zcGxpdCgnXFxuJykuZm9yRWFjaChwYWlyID0+IHtcclxuXHRcdGNvbnN0IGNvbG9uSW5kZXggPSBwYWlyLmluZGV4T2YoJzonKTtcclxuXHRcdG1ldGFkYXRhW3BhaXIuc2xpY2UoMCwgY29sb25JbmRleCkudHJpbSgpXSA9IHBhaXJcclxuXHRcdFx0LnNsaWNlKGNvbG9uSW5kZXggKyAxKVxyXG5cdFx0XHQudHJpbSgpO1xyXG5cdH0pO1xyXG5cclxuXHRyZXR1cm4geyBtZXRhZGF0YSwgY29udGVudCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdF9tZXRhZGF0YShsaW5lLCBsYW5nKSB7XHJcblx0dHJ5IHtcclxuXHRcdGlmIChsYW5nID09PSAnaHRtbCcgJiYgbGluZS5zdGFydHNXaXRoKCc8IS0tJykgJiYgbGluZS5lbmRzV2l0aCgnLS0+JykpIHtcclxuXHRcdFx0cmV0dXJuIGZsZWVjZS5ldmFsdWF0ZShsaW5lLnNsaWNlKDQsIC0zKS50cmltKCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChcclxuXHRcdFx0bGFuZyA9PT0gJ2pzJyB8fFxyXG5cdFx0XHQobGFuZyA9PT0gJ2pzb24nICYmIGxpbmUuc3RhcnRzV2l0aCgnLyonKSAmJiBsaW5lLmVuZHNXaXRoKCcqLycpKVxyXG5cdFx0KSB7XHJcblx0XHRcdHJldHVybiBmbGVlY2UuZXZhbHVhdGUobGluZS5zbGljZSgyLCAtMikudHJpbSgpKTtcclxuXHRcdH1cclxuXHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdC8vIFRPRE8gcmVwb3J0IHRoZXNlIGVycm9ycywgZG9uJ3QganVzdCBzcXVlbGNoIHRoZW1cclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxufVxyXG5cclxuLy8gbWFwIGxhbmcgdG8gcHJpc20tbGFuZ3VhZ2UtYXR0clxyXG5leHBvcnQgY29uc3QgbGFuZ3MgPSB7XHJcblx0YmFzaDogJ2Jhc2gnLFxyXG5cdGh0bWw6ICdtYXJrdXAnLFxyXG5cdHN2OiAnbWFya3VwJyxcclxuXHRqczogJ2phdmFzY3JpcHQnLFxyXG5cdGNzczogJ2NzcydcclxufTtcclxuXHJcblxyXG4vLyBsaW5rcyByZW5kZXJlclxyXG5leHBvcnQgZnVuY3Rpb24gbGlua19yZW5kZXJlciAoaHJlZiwgdGl0bGUsIHRleHQpIHtcclxuXHRsZXQgdGFyZ2V0X2F0dHIgPSAnJztcclxuXHRsZXQgdGl0bGVfYXR0ciA9ICcnO1xyXG5cclxuXHRpZiAoaHJlZi5zdGFydHNXaXRoKFwiaHR0cFwiKSkge1xyXG5cdFx0dGFyZ2V0X2F0dHIgPSAnIHRhcmdldD1cIl9ibGFua1wiJztcclxuXHR9XHJcblxyXG5cdGlmICh0aXRsZSAhPT0gbnVsbCkge1xyXG5cdFx0dGl0bGVfYXR0ciA9IGAgdGl0bGU9XCIke3RpdGxlfVwiYDtcclxuXHR9XHJcblxyXG5cdHJldHVybiBgPGEgaHJlZj1cIiR7aHJlZn1cIiR7dGFyZ2V0X2F0dHJ9JHt0aXRsZV9hdHRyfT4ke3RleHR9PC9hPmA7XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XHJcbmltcG9ydCB7IGV4dHJhY3RfZnJvbnRtYXR0ZXIgfSBmcm9tICdAc3ZlbHRlanMvc2l0ZS1raXQvdXRpbHMvbWFya2Rvd24nO1xyXG5cclxubGV0IGpzb247XHJcblxyXG5mdW5jdGlvbiBnZXRfc2VjdGlvbnMoKSB7XHJcblx0Y29uc3Qgc2x1Z3MgPSBuZXcgU2V0KCk7XHJcblxyXG5cdGNvbnN0IHNlY3Rpb25zID0gZnMucmVhZGRpclN5bmMoYGNvbnRlbnQvdHV0b3JpYWxgKVxyXG5cdFx0LmZpbHRlcihkaXIgPT4gL15cXGQrLy50ZXN0KGRpcikpXHJcblx0XHQubWFwKGRpciA9PiB7XHJcblx0XHRcdGxldCBtZXRhO1xyXG5cclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRtZXRhID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoYGNvbnRlbnQvdHV0b3JpYWwvJHtkaXJ9L21ldGEuanNvbmAsICd1dGYtOCcpKTtcclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBFcnJvciByZWFkaW5nIG1ldGFkYXRhIGZvciAke2Rpcn1gKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR0aXRsZTogbWV0YS50aXRsZSxcclxuXHRcdFx0XHRjaGFwdGVyczogZnMucmVhZGRpclN5bmMoYGNvbnRlbnQvdHV0b3JpYWwvJHtkaXJ9YClcclxuXHRcdFx0XHRcdC5maWx0ZXIoZGlyID0+IC9eXFxkKy8udGVzdChkaXIpKVxyXG5cdFx0XHRcdFx0Lm1hcCh0dXRvcmlhbCA9PiB7XHJcblx0XHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgbWQgPSBmcy5yZWFkRmlsZVN5bmMoYGNvbnRlbnQvdHV0b3JpYWwvJHtkaXJ9LyR7dHV0b3JpYWx9L3RleHQubWRgLCAndXRmLTgnKTtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCB7IG1ldGFkYXRhIH0gPSBleHRyYWN0X2Zyb250bWF0dGVyKG1kKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2x1ZyA9IHR1dG9yaWFsLnJlcGxhY2UoL15cXGQrLS8sICcnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKHNsdWdzLmhhcyhzbHVnKSkgdGhyb3cgbmV3IEVycm9yKGBEdXBsaWNhdGUgc2x1ZzogJHtzbHVnfWApO1xyXG5cdFx0XHRcdFx0XHRcdHNsdWdzLmFkZChzbHVnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0XHRcdHNsdWcsXHJcblx0XHRcdFx0XHRcdFx0XHR0aXRsZTogbWV0YWRhdGEudGl0bGUsXHJcblx0XHRcdFx0XHRcdFx0XHRzZWN0aW9uX2RpcjogZGlyLFxyXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kaXI6IHR1dG9yaWFsLFxyXG5cdFx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgRXJyb3IgYnVpbGRpbmcgdHV0b3JpYWwgJHtkaXJ9LyR7dHV0b3JpYWx9OiAke2Vyci5tZXNzYWdlfWApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHR9O1xyXG5cdFx0fSk7XHJcblxyXG5cdHJldHVybiBzZWN0aW9ucztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xyXG5cdHRyeSB7XHJcblx0XHRpZiAoIWpzb24gfHwgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xyXG5cdFx0XHRqc29uID0gZ2V0X3NlY3Rpb25zKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0c2VuZChyZXMsIDIwMCwganNvbik7XHJcblx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRzZW5kKHJlcywgNTAwLCB7XHJcblx0XHRcdG1lc3NhZ2U6IGVyci5tZXNzYWdlXHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xyXG5cdGxldCB7IG1pbiA9ICcwJywgbWF4ID0gJzEwMCcgfSA9IHJlcS5xdWVyeTtcclxuXHRtaW4gPSArbWluO1xyXG5cdG1heCA9ICttYXg7XHJcblxyXG5cdHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XHJcblxyXG5cdC8vIHNpbXVsYXRlIGEgbG9uZyBkZWxheVxyXG5cdHNldFRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0Ly8gZmFpbCBzb21ldGltZXNcclxuXHRcdGlmIChNYXRoLnJhbmRvbSgpIDwgMC4zMzMpIHtcclxuXHRcdFx0cmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcblx0XHRcdHJlcy5lbmQoYEZhaWxlZCB0byBnZW5lcmF0ZSByYW5kb20gbnVtYmVyLiBQbGVhc2UgdHJ5IGFnYWluYCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBudW0gPSBtaW4gKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSk7XHJcblx0XHRyZXMuZW5kKFN0cmluZyhudW0pKTtcclxuXHR9LCAxMDAwKTtcclxufSIsIihmdW5jdGlvbihQcmlzbSkge1xyXG5cdC8vICQgc2V0IHwgZ3JlcCAnXltBLVpdW15bOnNwYWNlOl1dKj0nIHwgY3V0IC1kPSAtZjEgfCB0ciAnXFxuJyAnfCdcclxuXHQvLyArIExDX0FMTCwgUkFORE9NLCBSRVBMWSwgU0VDT05EUy5cclxuXHQvLyArIG1ha2Ugc3VyZSBQUzEuLjQgYXJlIGhlcmUgYXMgdGhleSBhcmUgbm90IGFsd2F5cyBzZXQsXHJcblx0Ly8gLSBzb21lIHVzZWxlc3MgdGhpbmdzLlxyXG5cdHZhciBlbnZWYXJzID0gJ1xcXFxiKD86QkFTSHxCQVNIT1BUU3xCQVNIX0FMSUFTRVN8QkFTSF9BUkdDfEJBU0hfQVJHVnxCQVNIX0NNRFN8QkFTSF9DT01QTEVUSU9OX0NPTVBBVF9ESVJ8QkFTSF9MSU5FTk98QkFTSF9SRU1BVENIfEJBU0hfU09VUkNFfEJBU0hfVkVSU0lORk98QkFTSF9WRVJTSU9OfENPTE9SVEVSTXxDT0xVTU5TfENPTVBfV09SREJSRUFLU3xEQlVTX1NFU1NJT05fQlVTX0FERFJFU1N8REVGQVVMVFNfUEFUSHxERVNLVE9QX1NFU1NJT058RElSU1RBQ0t8RElTUExBWXxFVUlEfEdETVNFU1NJT058R0RNX0xBTkd8R05PTUVfS0VZUklOR19DT05UUk9MfEdOT01FX0tFWVJJTkdfUElEfEdQR19BR0VOVF9JTkZPfEdST1VQU3xISVNUQ09OVFJPTHxISVNURklMRXxISVNURklMRVNJWkV8SElTVFNJWkV8SE9NRXxIT1NUTkFNRXxIT1NUVFlQRXxJRlN8SU5TVEFOQ0V8Sk9CfExBTkd8TEFOR1VBR0V8TENfQUREUkVTU3xMQ19BTEx8TENfSURFTlRJRklDQVRJT058TENfTUVBU1VSRU1FTlR8TENfTU9ORVRBUll8TENfTkFNRXxMQ19OVU1FUklDfExDX1BBUEVSfExDX1RFTEVQSE9ORXxMQ19USU1FfExFU1NDTE9TRXxMRVNTT1BFTnxMSU5FU3xMT0dOQU1FfExTX0NPTE9SU3xNQUNIVFlQRXxNQUlMQ0hFQ0t8TUFOREFUT1JZX1BBVEh8Tk9fQVRfQlJJREdFfE9MRFBXRHxPUFRFUlJ8T1BUSU5EfE9SQklUX1NPQ0tFVERJUnxPU1RZUEV8UEFQRVJTSVpFfFBBVEh8UElQRVNUQVRVU3xQUElEfFBTMXxQUzJ8UFMzfFBTNHxQV0R8UkFORE9NfFJFUExZfFNFQ09ORFN8U0VMSU5VWF9JTklUfFNFU1NJT058U0VTU0lPTlRZUEV8U0VTU0lPTl9NQU5BR0VSfFNIRUxMfFNIRUxMT1BUU3xTSExWTHxTU0hfQVVUSF9TT0NLfFRFUk18VUlEfFVQU1RBUlRfRVZFTlRTfFVQU1RBUlRfSU5TVEFOQ0V8VVBTVEFSVF9KT0J8VVBTVEFSVF9TRVNTSU9OfFVTRVJ8V0lORE9XSUR8WEFVVEhPUklUWXxYREdfQ09ORklHX0RJUlN8WERHX0NVUlJFTlRfREVTS1RPUHxYREdfREFUQV9ESVJTfFhER19HUkVFVEVSX0RBVEFfRElSfFhER19NRU5VX1BSRUZJWHxYREdfUlVOVElNRV9ESVJ8WERHX1NFQVR8WERHX1NFQVRfUEFUSHxYREdfU0VTU0lPTl9ERVNLVE9QfFhER19TRVNTSU9OX0lEfFhER19TRVNTSU9OX1BBVEh8WERHX1NFU1NJT05fVFlQRXxYREdfVlROUnxYTU9ESUZJRVJTKVxcXFxiJztcclxuXHR2YXIgaW5zaWRlU3RyaW5nID0ge1xyXG5cdFx0J2Vudmlyb25tZW50Jzoge1xyXG5cdFx0XHRwYXR0ZXJuOiBSZWdFeHAoXCJcXFxcJFwiICsgZW52VmFycyksXHJcblx0XHRcdGFsaWFzOiAnY29uc3RhbnQnXHJcblx0XHR9LFxyXG5cdFx0J3ZhcmlhYmxlJzogW1xyXG5cdFx0XHQvLyBbMF06IEFyaXRobWV0aWMgRW52aXJvbm1lbnRcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHBhdHRlcm46IC9cXCQ/XFwoXFwoW1xcc1xcU10rP1xcKVxcKS8sXHJcblx0XHRcdFx0Z3JlZWR5OiB0cnVlLFxyXG5cdFx0XHRcdGluc2lkZToge1xyXG5cdFx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYSAkIHNpZ24gYXQgdGhlIGJlZ2lubmluZyBoaWdobGlnaHQgJCgoIGFuZCApKSBhcyB2YXJpYWJsZVxyXG5cdFx0XHRcdFx0J3ZhcmlhYmxlJzogW1xyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0cGF0dGVybjogLyheXFwkXFwoXFwoW1xcc1xcU10rKVxcKVxcKS8sXHJcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHQvXlxcJFxcKFxcKC9cclxuXHRcdFx0XHRcdF0sXHJcblx0XHRcdFx0XHQnbnVtYmVyJzogL1xcYjB4W1xcZEEtRmEtZl0rXFxifCg/OlxcYlxcZCtcXC4/XFxkKnxcXEJcXC5cXGQrKSg/OltFZV0tP1xcZCspPy8sXHJcblx0XHRcdFx0XHQvLyBPcGVyYXRvcnMgYWNjb3JkaW5nIHRvIGh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvYmFzaC9tYW51YWwvYmFzaHJlZi5odG1sI1NoZWxsLUFyaXRobWV0aWNcclxuXHRcdFx0XHRcdCdvcGVyYXRvcic6IC8tLT98LT18XFwrXFwrP3xcXCs9fCE9P3x+fFxcKlxcKj98XFwqPXxcXC89P3wlPT98PDw9P3w+Pj0/fDw9P3w+PT98PT0/fCYmP3wmPXxcXF49P3xcXHxcXHw/fFxcfD18XFw/fDovLFxyXG5cdFx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgbm8gJCBzaWduIGF0IHRoZSBiZWdpbm5pbmcgaGlnaGxpZ2h0ICgoIGFuZCApKSBhcyBwdW5jdHVhdGlvblxyXG5cdFx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL1xcKFxcKD98XFwpXFwpP3wsfDsvXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHQvLyBbMV06IENvbW1hbmQgU3Vic3RpdHV0aW9uXHJcblx0XHRcdHtcclxuXHRcdFx0XHRwYXR0ZXJuOiAvXFwkXFwoKD86XFwoW14pXStcXCl8W14oKV0pK1xcKXxgW15gXStgLyxcclxuXHRcdFx0XHRncmVlZHk6IHRydWUsXHJcblx0XHRcdFx0aW5zaWRlOiB7XHJcblx0XHRcdFx0XHQndmFyaWFibGUnOiAvXlxcJFxcKHxeYHxcXCkkfGAkL1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0Ly8gWzJdOiBCcmFjZSBleHBhbnNpb25cclxuXHRcdFx0e1xyXG5cdFx0XHRcdHBhdHRlcm46IC9cXCRcXHtbXn1dK1xcfS8sXHJcblx0XHRcdFx0Z3JlZWR5OiB0cnVlLFxyXG5cdFx0XHRcdGluc2lkZToge1xyXG5cdFx0XHRcdFx0J29wZXJhdG9yJzogLzpbLT0/K10/fFshXFwvXXwjIz98JSU/fFxcXlxcXj98LCw/LyxcclxuXHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9bXFxbXFxdXS8sXHJcblx0XHRcdFx0XHQnZW52aXJvbm1lbnQnOiB7XHJcblx0XHRcdFx0XHRcdHBhdHRlcm46IFJlZ0V4cChcIihcXFxceylcIiArIGVudlZhcnMpLFxyXG5cdFx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRhbGlhczogJ2NvbnN0YW50J1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0L1xcJCg/Olxcdyt8WyM/KiFAJF0pL1xyXG5cdFx0XSxcclxuXHRcdC8vIEVzY2FwZSBzZXF1ZW5jZXMgZnJvbSBlY2hvIGFuZCBwcmludGYncyBtYW51YWxzLCBhbmQgZXNjYXBlZCBxdW90ZXMuXHJcblx0XHQnZW50aXR5JzogL1xcXFwoPzpbYWJjZUVmbnJ0dlxcXFxcIl18Tz9bMC03XXsxLDN9fHhbMC05YS1mQS1GXXsxLDJ9fHVbMC05YS1mQS1GXXs0fXxVWzAtOWEtZkEtRl17OH0pL1xyXG5cdH07XHJcblxyXG5cdFByaXNtLmxhbmd1YWdlcy5iYXNoID0ge1xyXG5cdFx0J3NoZWJhbmcnOiB7XHJcblx0XHRcdHBhdHRlcm46IC9eIyFcXHMqXFwvLiovLFxyXG5cdFx0XHRhbGlhczogJ2ltcG9ydGFudCdcclxuXHRcdH0sXHJcblx0XHQnY29tbWVudCc6IHtcclxuXHRcdFx0cGF0dGVybjogLyhefFteXCJ7XFxcXCRdKSMuKi8sXHJcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcclxuXHRcdH0sXHJcblx0XHQnZnVuY3Rpb24tbmFtZSc6IFtcclxuXHRcdFx0Ly8gYSkgZnVuY3Rpb24gZm9vIHtcclxuXHRcdFx0Ly8gYikgZm9vKCkge1xyXG5cdFx0XHQvLyBjKSBmdW5jdGlvbiBmb28oKSB7XHJcblx0XHRcdC8vIGJ1dCBub3Qg4oCcZm9vIHvigJ1cclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIGEpIGFuZCBjKVxyXG5cdFx0XHRcdHBhdHRlcm46IC8oXFxiZnVuY3Rpb25cXHMrKVxcdysoPz0oPzpcXHMqXFwoPzpcXHMqXFwpKT9cXHMqXFx7KS8sXHJcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcclxuXHRcdFx0XHRhbGlhczogJ2Z1bmN0aW9uJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gYilcclxuXHRcdFx0XHRwYXR0ZXJuOiAvXFxiXFx3Kyg/PVxccypcXChcXHMqXFwpXFxzKlxceykvLFxyXG5cdFx0XHRcdGFsaWFzOiAnZnVuY3Rpb24nXHJcblx0XHRcdH1cclxuXHRcdF0sXHJcblx0XHQvLyBIaWdobGlnaHQgdmFyaWFibGUgbmFtZXMgYXMgdmFyaWFibGVzIGluIGZvciBhbmQgc2VsZWN0IGJlZ2lubmluZ3MuXHJcblx0XHQnZm9yLW9yLXNlbGVjdCc6IHtcclxuXHRcdFx0cGF0dGVybjogLyhcXGIoPzpmb3J8c2VsZWN0KVxccyspXFx3Kyg/PVxccytpblxccykvLFxyXG5cdFx0XHRhbGlhczogJ3ZhcmlhYmxlJyxcclxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxyXG5cdFx0fSxcclxuXHRcdC8vIEhpZ2hsaWdodCB2YXJpYWJsZSBuYW1lcyBhcyB2YXJpYWJsZXMgaW4gdGhlIGxlZnQtaGFuZCBwYXJ0XHJcblx0XHQvLyBvZiBhc3NpZ25tZW50cyAo4oCcPeKAnSBhbmQg4oCcKz3igJ0pLlxyXG5cdFx0J2Fzc2lnbi1sZWZ0Jzoge1xyXG5cdFx0XHRwYXR0ZXJuOiAvKF58W1xcczt8Jl18Wzw+XVxcKClcXHcrKD89XFwrPz0pLyxcclxuXHRcdFx0aW5zaWRlOiB7XHJcblx0XHRcdFx0J2Vudmlyb25tZW50Jzoge1xyXG5cdFx0XHRcdFx0cGF0dGVybjogUmVnRXhwKFwiKF58W1xcXFxzO3wmXXxbPD5dXFxcXCgpXCIgKyBlbnZWYXJzKSxcclxuXHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXHJcblx0XHRcdFx0XHRhbGlhczogJ2NvbnN0YW50J1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0YWxpYXM6ICd2YXJpYWJsZScsXHJcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcclxuXHRcdH0sXHJcblx0XHQnc3RyaW5nJzogW1xyXG5cdFx0XHQvLyBTdXBwb3J0IGZvciBIZXJlLWRvY3VtZW50cyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IZXJlX2RvY3VtZW50XHJcblx0XHRcdHtcclxuXHRcdFx0XHRwYXR0ZXJuOiAvKCg/Ol58W148XSk8PC0/XFxzKikoXFx3Kz8pXFxzKig/Olxccj9cXG58XFxyKSg/OltcXHNcXFNdKSo/KD86XFxyP1xcbnxcXHIpXFwyLyxcclxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxyXG5cdFx0XHRcdGdyZWVkeTogdHJ1ZSxcclxuXHRcdFx0XHRpbnNpZGU6IGluc2lkZVN0cmluZ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQvLyBIZXJlLWRvY3VtZW50IHdpdGggcXVvdGVzIGFyb3VuZCB0aGUgdGFnXHJcblx0XHRcdC8vIOKGkiBObyBleHBhbnNpb24gKHNvIG5vIOKAnGluc2lkZeKAnSkuXHJcblx0XHRcdHtcclxuXHRcdFx0XHRwYXR0ZXJuOiAvKCg/Ol58W148XSk8PC0/XFxzKikoW1wiJ10pKFxcdyspXFwyXFxzKig/Olxccj9cXG58XFxyKSg/OltcXHNcXFNdKSo/KD86XFxyP1xcbnxcXHIpXFwzLyxcclxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxyXG5cdFx0XHRcdGdyZWVkeTogdHJ1ZVxyXG5cdFx0XHR9LFxyXG5cdFx0XHQvLyDigJxOb3JtYWzigJ0gc3RyaW5nXHJcblx0XHRcdHtcclxuXHRcdFx0XHRwYXR0ZXJuOiAvKFtcIiddKSg/OlxcXFxbXFxzXFxTXXxcXCRcXChbXildK1xcKXxgW15gXStgfCg/IVxcMSlbXlxcXFxdKSpcXDEvLFxyXG5cdFx0XHRcdGdyZWVkeTogdHJ1ZSxcclxuXHRcdFx0XHRpbnNpZGU6IGluc2lkZVN0cmluZ1xyXG5cdFx0XHR9XHJcblx0XHRdLFxyXG5cdFx0J2Vudmlyb25tZW50Jzoge1xyXG5cdFx0XHRwYXR0ZXJuOiBSZWdFeHAoXCJcXFxcJD9cIiArIGVudlZhcnMpLFxyXG5cdFx0XHRhbGlhczogJ2NvbnN0YW50J1xyXG5cdFx0fSxcclxuXHRcdCd2YXJpYWJsZSc6IGluc2lkZVN0cmluZy52YXJpYWJsZSxcclxuXHRcdCdmdW5jdGlvbic6IHtcclxuXHRcdFx0cGF0dGVybjogLyhefFtcXHM7fCZdfFs8Pl1cXCgpKD86YWRkfGFwcm9wb3N8YXB0fGFwdGl0dWRlfGFwdC1jYWNoZXxhcHQtZ2V0fGFzcGVsbHxhdXRvbXlzcWxiYWNrdXB8YXdrfGJhc2VuYW1lfGJhc2h8YmN8YmNvbnNvbGV8Ymd8YnppcDJ8Y2FsfGNhdHxjZmRpc2t8Y2hncnB8Y2hrY29uZmlnfGNobW9kfGNob3dufGNocm9vdHxja3N1bXxjbGVhcnxjbXB8Y29sdW1ufGNvbW18Y3B8Y3Jvbnxjcm9udGFifGNzcGxpdHxjdXJsfGN1dHxkYXRlfGRjfGRkfGRkcmVzY3VlfGRlYm9vdHN0cmFwfGRmfGRpZmZ8ZGlmZjN8ZGlnfGRpcnxkaXJjb2xvcnN8ZGlybmFtZXxkaXJzfGRtZXNnfGR1fGVncmVwfGVqZWN0fGVudnxldGh0b29sfGV4cGFuZHxleHBlY3R8ZXhwcnxmZGZvcm1hdHxmZGlza3xmZ3xmZ3JlcHxmaWxlfGZpbmR8Zm10fGZvbGR8Zm9ybWF0fGZyZWV8ZnNja3xmdHB8ZnVzZXJ8Z2F3a3xnaXR8Z3BhcnRlZHxncmVwfGdyb3VwYWRkfGdyb3VwZGVsfGdyb3VwbW9kfGdyb3Vwc3xncnViLW1rY29uZmlnfGd6aXB8aGFsdHxoZWFkfGhnfGhpc3Rvcnl8aG9zdHxob3N0bmFtZXxodG9wfGljb252fGlkfGlmY29uZmlnfGlmZG93bnxpZnVwfGltcG9ydHxpbnN0YWxsfGlwfGpvYnN8am9pbnxraWxsfGtpbGxhbGx8bGVzc3xsaW5rfGxufGxvY2F0ZXxsb2duYW1lfGxvZ3JvdGF0ZXxsb29rfGxwY3xscHJ8bHByaW50fGxwcmludGR8bHByaW50cXxscHJtfGxzfGxzb2Z8bHlueHxtYWtlfG1hbnxtY3xtZGFkbXxta2NvbmZpZ3xta2Rpcnxta2UyZnN8bWtmaWZvfG1rZnN8bWtpc29mc3xta25vZHxta3N3YXB8bW12fG1vcmV8bW9zdHxtb3VudHxtdG9vbHN8bXRyfG11dHR8bXZ8bmFub3xuY3xuZXRzdGF0fG5pY2V8bmx8bm9odXB8bm90aWZ5LXNlbmR8bnBtfG5zbG9va3VwfG9wfG9wZW58cGFydGVkfHBhc3N3ZHxwYXN0ZXxwYXRoY2hrfHBpbmd8cGtpbGx8cG5wbXxwb3BkfHByfHByaW50Y2FwfHByaW50ZW52fHBzfHB1c2hkfHB2fHF1b3RhfHF1b3RhY2hlY2t8cXVvdGFjdGx8cmFtfHJhcnxyY3B8cmVib290fHJlbXN5bmN8cmVuYW1lfHJlbmljZXxyZXZ8cm18cm1kaXJ8cnBtfHJzeW5jfHNjcHxzY3JlZW58c2RpZmZ8c2VkfHNlbmRtYWlsfHNlcXxzZXJ2aWNlfHNmdHB8c2h8c2hlbGxjaGVja3xzaHVmfHNodXRkb3dufHNsZWVwfHNsb2NhdGV8c29ydHxzcGxpdHxzc2h8c3RhdHxzdHJhY2V8c3V8c3Vkb3xzdW18c3VzcGVuZHxzd2Fwb258c3luY3x0YWN8dGFpbHx0YXJ8dGVlfHRpbWV8dGltZW91dHx0b3B8dG91Y2h8dHJ8dHJhY2Vyb3V0ZXx0c29ydHx0dHl8dW1vdW50fHVuYW1lfHVuZXhwYW5kfHVuaXF8dW5pdHN8dW5yYXJ8dW5zaGFyfHVuemlwfHVwZGF0ZS1ncnVifHVwdGltZXx1c2VyYWRkfHVzZXJkZWx8dXNlcm1vZHx1c2Vyc3x1dWRlY29kZXx1dWVuY29kZXx2fHZkaXJ8dml8dmltfHZpcnNofHZtc3RhdHx3YWl0fHdhdGNofHdjfHdnZXR8d2hlcmVpc3x3aGljaHx3aG98d2hvYW1pfHdyaXRlfHhhcmdzfHhkZy1vcGVufHlhcm58eWVzfHplbml0eXx6aXB8enNofHp5cHBlcikoPz0kfFspXFxzO3wmXSkvLFxyXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXHJcblx0XHR9LFxyXG5cdFx0J2tleXdvcmQnOiB7XHJcblx0XHRcdHBhdHRlcm46IC8oXnxbXFxzO3wmXXxbPD5dXFwoKSg/OmlmfHRoZW58ZWxzZXxlbGlmfGZpfGZvcnx3aGlsZXxpbnxjYXNlfGVzYWN8ZnVuY3Rpb258c2VsZWN0fGRvfGRvbmV8dW50aWwpKD89JHxbKVxcczt8Jl0pLyxcclxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxyXG5cdFx0fSxcclxuXHRcdC8vIGh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvYmFzaC9tYW51YWwvaHRtbF9ub2RlL1NoZWxsLUJ1aWx0aW4tQ29tbWFuZHMuaHRtbFxyXG5cdFx0J2J1aWx0aW4nOiB7XHJcblx0XHRcdHBhdHRlcm46IC8oXnxbXFxzO3wmXXxbPD5dXFwoKSg/OlxcLnw6fGJyZWFrfGNkfGNvbnRpbnVlfGV2YWx8ZXhlY3xleGl0fGV4cG9ydHxnZXRvcHRzfGhhc2h8cHdkfHJlYWRvbmx5fHJldHVybnxzaGlmdHx0ZXN0fHRpbWVzfHRyYXB8dW1hc2t8dW5zZXR8YWxpYXN8YmluZHxidWlsdGlufGNhbGxlcnxjb21tYW5kfGRlY2xhcmV8ZWNob3xlbmFibGV8aGVscHxsZXR8bG9jYWx8bG9nb3V0fG1hcGZpbGV8cHJpbnRmfHJlYWR8cmVhZGFycmF5fHNvdXJjZXx0eXBlfHR5cGVzZXR8dWxpbWl0fHVuYWxpYXN8c2V0fHNob3B0KSg/PSR8WylcXHM7fCZdKS8sXHJcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXHJcblx0XHRcdC8vIEFsaWFzIGFkZGVkIHRvIG1ha2UgdGhvc2UgZWFzaWVyIHRvIGRpc3Rpbmd1aXNoIGZyb20gc3RyaW5ncy5cclxuXHRcdFx0YWxpYXM6ICdjbGFzcy1uYW1lJ1xyXG5cdFx0fSxcclxuXHRcdCdib29sZWFuJzoge1xyXG5cdFx0XHRwYXR0ZXJuOiAvKF58W1xcczt8Jl18Wzw+XVxcKCkoPzp0cnVlfGZhbHNlKSg/PSR8WylcXHM7fCZdKS8sXHJcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcclxuXHRcdH0sXHJcblx0XHQnZmlsZS1kZXNjcmlwdG9yJzoge1xyXG5cdFx0XHRwYXR0ZXJuOiAvXFxCJlxcZFxcYi8sXHJcblx0XHRcdGFsaWFzOiAnaW1wb3J0YW50J1xyXG5cdFx0fSxcclxuXHRcdCdvcGVyYXRvcic6IHtcclxuXHRcdFx0Ly8gTG90cyBvZiByZWRpcmVjdGlvbnMgaGVyZSwgYnV0IG5vdCBqdXN0IHRoYXQuXHJcblx0XHRcdHBhdHRlcm46IC9cXGQ/PD58PlxcfHxcXCs9fD09P3whPT98PX58PDxbPC1dP3xbJlxcZF0/Pj58XFxkP1s8Pl0mP3wmWz4mXT98XFx8WyZ8XT98PD0/fD49Py8sXHJcblx0XHRcdGluc2lkZToge1xyXG5cdFx0XHRcdCdmaWxlLWRlc2NyaXB0b3InOiB7XHJcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXlxcZC8sXHJcblx0XHRcdFx0XHRhbGlhczogJ2ltcG9ydGFudCdcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQncHVuY3R1YXRpb24nOiAvXFwkP1xcKFxcKD98XFwpXFwpP3xcXC5cXC58W3t9W1xcXTtcXFxcXS8sXHJcblx0XHQnbnVtYmVyJzoge1xyXG5cdFx0XHRwYXR0ZXJuOiAvKF58XFxzKSg/OlsxLTldXFxkKnwwKSg/OlsuLF1cXGQrKT9cXGIvLFxyXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0LyogUGF0dGVybnMgaW4gY29tbWFuZCBzdWJzdGl0dXRpb24uICovXHJcblx0dmFyIHRvQmVDb3BpZWQgPSBbXHJcblx0XHQnY29tbWVudCcsXHJcblx0XHQnZnVuY3Rpb24tbmFtZScsXHJcblx0XHQnZm9yLW9yLXNlbGVjdCcsXHJcblx0XHQnYXNzaWduLWxlZnQnLFxyXG5cdFx0J3N0cmluZycsXHJcblx0XHQnZW52aXJvbm1lbnQnLFxyXG5cdFx0J2Z1bmN0aW9uJyxcclxuXHRcdCdrZXl3b3JkJyxcclxuXHRcdCdidWlsdGluJyxcclxuXHRcdCdib29sZWFuJyxcclxuXHRcdCdmaWxlLWRlc2NyaXB0b3InLFxyXG5cdFx0J29wZXJhdG9yJyxcclxuXHRcdCdwdW5jdHVhdGlvbicsXHJcblx0XHQnbnVtYmVyJ1xyXG5cdF07XHJcblx0dmFyIGluc2lkZSA9IGluc2lkZVN0cmluZy52YXJpYWJsZVsxXS5pbnNpZGU7XHJcblx0Zm9yKHZhciBpID0gMDsgaSA8IHRvQmVDb3BpZWQubGVuZ3RoOyBpKyspIHtcclxuXHRcdGluc2lkZVt0b0JlQ29waWVkW2ldXSA9IFByaXNtLmxhbmd1YWdlcy5iYXNoW3RvQmVDb3BpZWRbaV1dO1xyXG5cdH1cclxuXHJcblx0UHJpc20ubGFuZ3VhZ2VzLnNoZWxsID0gUHJpc20ubGFuZ3VhZ2VzLmJhc2g7XHJcbn0pKFByaXNtKTtcclxuIiwiaW1wb3J0IHsgbGFuZ3MgfSBmcm9tICdAc3ZlbHRlanMvc2l0ZS1raXQvdXRpbHMvbWFya2Rvd24uanMnO1xyXG5pbXBvcnQgUHJpc21KUyBmcm9tICdwcmlzbWpzJztcclxuaW1wb3J0ICdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tYmFzaCc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGlnaGxpZ2h0KHNvdXJjZSwgbGFuZykge1xyXG5cdGNvbnN0IHBsYW5nID0gbGFuZ3NbbGFuZ10gfHwgJyc7XHJcblx0Y29uc3QgaGlnaGxpZ2h0ZWQgPSBwbGFuZyA/IFByaXNtSlMuaGlnaGxpZ2h0KFxyXG5cdFx0c291cmNlLFxyXG5cdFx0UHJpc21KUy5sYW5ndWFnZXNbcGxhbmddLFxyXG5cdFx0bGFuZyxcclxuXHQpIDogc291cmNlLnJlcGxhY2UoL1smPD5dL2csIGMgPT4gKHsgJyYnOiAnJmFtcDsnLCAnPCc6ICcmbHQ7JywgJz4nOiAnJmd0OycgfSlbY10pO1xyXG5cclxuXHRyZXR1cm4gYDxwcmUgY2xhc3M9J2xhbmd1YWdlLSR7cGxhbmd9Jz48Y29kZT4ke2hpZ2hsaWdodGVkfTwvY29kZT48L3ByZT5gO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnO1xyXG5pbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XHJcbmltcG9ydCB7IGV4dHJhY3RfZnJvbnRtYXR0ZXIsIGV4dHJhY3RfbWV0YWRhdGEsIGxpbmtfcmVuZGVyZXIgfSBmcm9tICdAc3ZlbHRlanMvc2l0ZS1raXQvdXRpbHMvbWFya2Rvd24nO1xyXG5pbXBvcnQgeyBoaWdobGlnaHQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9oaWdobGlnaHQnO1xyXG5cclxuY29uc3QgY2FjaGUgPSBuZXcgTWFwKCk7XHJcblxyXG5mdW5jdGlvbiBmaW5kX3R1dG9yaWFsKHNsdWcpIHtcclxuXHRjb25zdCBzZWN0aW9ucyA9IGZzLnJlYWRkaXJTeW5jKGBjb250ZW50L3R1dG9yaWFsYCk7XHJcblxyXG5cdGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9ucykge1xyXG5cdFx0Y29uc3QgY2hhcHRlcnMgPSBmcy5yZWFkZGlyU3luYyhgY29udGVudC90dXRvcmlhbC8ke3NlY3Rpb259YCkuZmlsdGVyKGRpciA9PiAvXlxcZCsvLnRlc3QoZGlyKSk7XHJcblx0XHRmb3IgKGNvbnN0IGNoYXB0ZXIgb2YgY2hhcHRlcnMpIHtcclxuXHRcdFx0aWYgKHNsdWcgPT09IGNoYXB0ZXIucmVwbGFjZSgvXlxcZCstLywgJycpKSB7XHJcblx0XHRcdFx0cmV0dXJuIHsgc2VjdGlvbiwgY2hhcHRlciB9O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRfdHV0b3JpYWwoc2x1Zykge1xyXG5cdGNvbnN0IGZvdW5kID0gZmluZF90dXRvcmlhbChzbHVnKTtcclxuXHRpZiAoIWZvdW5kKSByZXR1cm4gZm91bmQ7XHJcblxyXG5cdGNvbnN0IGRpciA9IGBjb250ZW50L3R1dG9yaWFsLyR7Zm91bmQuc2VjdGlvbn0vJHtmb3VuZC5jaGFwdGVyfWA7XHJcblxyXG5cdGNvbnN0IG1hcmtkb3duID0gZnMucmVhZEZpbGVTeW5jKGAke2Rpcn0vdGV4dC5tZGAsICd1dGYtOCcpO1xyXG5cdGNvbnN0IGFwcF9hID0gZnMucmVhZGRpclN5bmMoYCR7ZGlyfS9hcHAtYWApO1xyXG5cdGNvbnN0IGFwcF9iID0gZnMuZXhpc3RzU3luYyhgJHtkaXJ9L2FwcC1iYCkgJiYgZnMucmVhZGRpclN5bmMoYCR7ZGlyfS9hcHAtYmApO1xyXG5cclxuXHRjb25zdCB7IGNvbnRlbnQgfSA9IGV4dHJhY3RfZnJvbnRtYXR0ZXIobWFya2Rvd24pO1xyXG5cclxuXHRjb25zdCByZW5kZXJlciA9IG5ldyBtYXJrZWQuUmVuZGVyZXIoKTtcclxuXHJcblx0cmVuZGVyZXIubGluayA9IGxpbmtfcmVuZGVyZXI7XHJcblxyXG5cdHJlbmRlcmVyLmNvZGUgPSAoc291cmNlLCBsYW5nKSA9PiB7XHJcblx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvXiArL2dtLCBtYXRjaCA9PlxyXG5cdFx0XHRtYXRjaC5zcGxpdCgnICAgICcpLmpvaW4oJ1xcdCcpXHJcblx0XHQpO1xyXG5cclxuXHRcdGNvbnN0IGxpbmVzID0gc291cmNlLnNwbGl0KCdcXG4nKTtcclxuXHJcblx0XHRjb25zdCBtZXRhID0gZXh0cmFjdF9tZXRhZGF0YShsaW5lc1swXSwgbGFuZyk7XHJcblxyXG5cdFx0bGV0IHByZWZpeCA9ICcnO1xyXG5cdFx0bGV0IGNsYXNzTmFtZSA9ICdjb2RlLWJsb2NrJztcclxuXHJcblx0XHRpZiAobWV0YSkge1xyXG5cdFx0XHRzb3VyY2UgPSBsaW5lcy5zbGljZSgxKS5qb2luKCdcXG4nKTtcclxuXHRcdFx0Y29uc3QgZmlsZW5hbWUgPSBtZXRhLmZpbGVuYW1lIHx8IChsYW5nID09PSAnaHRtbCcgJiYgJ0FwcC5zdmVsdGUnKTtcclxuXHRcdFx0aWYgKGZpbGVuYW1lKSB7XHJcblx0XHRcdFx0cHJlZml4ID0gYDxzcGFuIGNsYXNzPSdmaWxlbmFtZSc+JHtwcmVmaXh9ICR7ZmlsZW5hbWV9PC9zcGFuPmA7XHJcblx0XHRcdFx0Y2xhc3NOYW1lICs9ICcgbmFtZWQnO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGA8ZGl2IGNsYXNzPScke2NsYXNzTmFtZX0nPiR7cHJlZml4fSR7aGlnaGxpZ2h0KHNvdXJjZSwgbGFuZyl9PC9kaXY+YDtcclxuXHR9O1xyXG5cclxuXHRsZXQgaHRtbCA9IG1hcmtlZChjb250ZW50LCB7IHJlbmRlcmVyIH0pO1xyXG5cdGlmIChmb3VuZC5jaGFwdGVyLnN0YXJ0c1dpdGgoJzAxJykpIHtcclxuXHRcdGNvbnN0IG1ldGEgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhgY29udGVudC90dXRvcmlhbC8ke2ZvdW5kLnNlY3Rpb259L21ldGEuanNvbmApKTtcclxuXHRcdGh0bWwgPSBgPGgyPiR7bWV0YS50aXRsZX08L2gyPlxcbiR7aHRtbH1gO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0X2ZpbGUoc3RhZ2UsIGZpbGUpIHtcclxuXHRcdGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlKTtcclxuXHRcdGNvbnN0IG5hbWUgPSBmaWxlLnNsaWNlKDAsIC1leHQubGVuZ3RoKTtcclxuXHRcdGNvbnN0IHR5cGUgPSBleHQuc2xpY2UoMSk7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bmFtZSxcclxuXHRcdFx0dHlwZSxcclxuXHRcdFx0c291cmNlOiBmcy5yZWFkRmlsZVN5bmMoYCR7ZGlyfS8ke3N0YWdlfS8ke2ZpbGV9YCwgJ3V0Zi04JylcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0aHRtbCxcclxuXHRcdGFwcF9hOiBhcHBfYS5tYXAoZmlsZSA9PiBnZXRfZmlsZSgnYXBwLWEnLCBmaWxlKSksXHJcblx0XHRhcHBfYjogYXBwX2IgJiYgYXBwX2IubWFwKGZpbGUgPT4gZ2V0X2ZpbGUoJ2FwcC1iJywgZmlsZSkpXHJcblx0fTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xyXG5cdGNvbnN0IHsgc2x1ZyB9ID0gcmVxLnBhcmFtcztcclxuXHJcblx0bGV0IHR1dCA9IGNhY2hlLmdldChzbHVnKTtcclxuXHRpZiAoIXR1dCB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XHJcblx0XHR0dXQgPSBnZXRfdHV0b3JpYWwoc2x1Zyk7XHJcblx0XHRjYWNoZS5zZXQoc2x1ZywgdHV0KTtcclxuXHR9XHJcblxyXG5cdGlmICh0dXQpIHtcclxuXHRcdHNlbmQocmVzLCAyMDAsIHR1dCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHNlbmQocmVzLCA0MDQsIHsgbWVzc2FnZTogJ25vdCBmb3VuZCcgfSk7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IFBvb2wgfSBmcm9tICdwZyc7XHJcblxyXG4vLyBVc2VzIGBQRypgIEVOViB2YXJzXHJcbmV4cG9ydCBjb25zdCBEQiA9IHByb2Nlc3MuZW52LlBHSE9TVCA/IG5ldyBQb29sKCkgOiBudWxsO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5KHRleHQsIHZhbHVlcz1bXSkge1xyXG5cdHJldHVybiBEQi5xdWVyeSh0ZXh0LCB2YWx1ZXMpLnRoZW4ociA9PiByLnJvd3MpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZCh0ZXh0LCB2YWx1ZXM9W10pIHtcclxuXHRyZXR1cm4gcXVlcnkodGV4dCwgdmFsdWVzKS50aGVuKGFyciA9PiBhcnJbMF0pO1xyXG59XHJcbiIsImltcG9ydCBzZW5kIGZyb20gJ0Bwb2xrYS9zZW5kJztcclxuaW1wb3J0IHsgcXVlcnkgfSBmcm9tICcuLi8uLi91dGlscy9kYic7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XHJcblx0aWYgKHJlcS51c2VyKSB7XHJcblx0XHRjb25zdCBwYWdlX3NpemUgPSAxMDA7XHJcblx0XHRjb25zdCBvZmZzZXQgPSByZXEucXVlcnkub2Zmc2V0ID8gcGFyc2VJbnQocmVxLnF1ZXJ5Lm9mZnNldCkgOiAwO1xyXG5cdFx0Y29uc3Qgcm93cyA9IGF3YWl0IHF1ZXJ5KGBcclxuXHRcdFx0c2VsZWN0IGcudWlkLCBnLm5hbWUsIGNvYWxlc2NlKGcudXBkYXRlZF9hdCwgZy5jcmVhdGVkX2F0KSBhcyB1cGRhdGVkX2F0XHJcblx0XHRcdGZyb20gZ2lzdHMgZ1xyXG5cdFx0XHR3aGVyZSBnLnVzZXJfaWQgPSAkMVxyXG5cdFx0XHRvcmRlciBieSBpZCBkZXNjXHJcblx0XHRcdGxpbWl0ICR7cGFnZV9zaXplICsgMX1cclxuXHRcdFx0b2Zmc2V0ICQyXHJcblx0XHRgLCBbcmVxLnVzZXIuaWQsIG9mZnNldF0pO1xyXG5cclxuXHRcdHJvd3MuZm9yRWFjaChyb3cgPT4ge1xyXG5cdFx0XHRyb3cudWlkID0gcm93LnVpZC5yZXBsYWNlKC8tL2csICcnKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGNvbnN0IG1vcmUgPSByb3dzLmxlbmd0aCA+IHBhZ2Vfc2l6ZTtcclxuXHRcdHNlbmQocmVzLCAyMDAsIHsgYXBwczogcm93cy5zbGljZSgwLCBwYWdlX3NpemUpLCBvZmZzZXQ6IG1vcmUgPyBvZmZzZXQgKyBwYWdlX3NpemUgOiBudWxsIH0pO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRzZW5kKHJlcywgNDAxKTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgY29va2llIGZyb20gJ2Nvb2tpZSc7XHJcbmltcG9ydCBmbHJ1IGZyb20gJ2ZscnUnO1xyXG5pbXBvcnQgeyBmaW5kLCBxdWVyeSB9IGZyb20gJy4vZGInO1xyXG5cclxuZXhwb3J0IGNvbnN0IHNhbml0aXplX3VzZXIgPSBvYmogPT4gb2JqICYmICh7XHJcblx0dWlkOiBvYmoudWlkLFxyXG5cdHVzZXJuYW1lOiBvYmoudXNlcm5hbWUsXHJcblx0bmFtZTogb2JqLm5hbWUsXHJcblx0YXZhdGFyOiBvYmouYXZhdGFyXHJcbn0pO1xyXG5cclxuY29uc3Qgc2Vzc2lvbl9jYWNoZSA9IGZscnUoMTAwMCk7XHJcblxyXG5leHBvcnQgY29uc3QgY3JlYXRlX3VzZXIgPSBhc3luYyAoZ2hfdXNlciwgYWNjZXNzX3Rva2VuKSA9PiB7XHJcblx0cmV0dXJuIGF3YWl0IGZpbmQoYFxyXG5cdFx0aW5zZXJ0IGludG8gdXNlcnModWlkLCBuYW1lLCB1c2VybmFtZSwgYXZhdGFyLCBnaXRodWJfdG9rZW4pXHJcblx0XHR2YWx1ZXMgKCQxLCAkMiwgJDMsICQ0LCAkNSkgb24gY29uZmxpY3QgKHVpZCkgZG8gdXBkYXRlXHJcblx0XHRzZXQgKG5hbWUsIHVzZXJuYW1lLCBhdmF0YXIsIGdpdGh1Yl90b2tlbiwgdXBkYXRlZF9hdCkgPSAoJDIsICQzLCAkNCwgJDUsIG5vdygpKVxyXG5cdFx0cmV0dXJuaW5nIGlkLCB1aWQsIHVzZXJuYW1lLCBuYW1lLCBhdmF0YXJcclxuXHRgLCBbZ2hfdXNlci5pZCwgZ2hfdXNlci5uYW1lLCBnaF91c2VyLmxvZ2luLCBnaF91c2VyLmF2YXRhcl91cmwsIGFjY2Vzc190b2tlbl0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZV9zZXNzaW9uID0gYXN5bmMgdXNlciA9PiB7XHJcblx0Y29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGZpbmQoYFxyXG5cdFx0aW5zZXJ0IGludG8gc2Vzc2lvbnModXNlcl9pZClcclxuXHRcdHZhbHVlcyAoJDEpXHJcblx0XHRyZXR1cm5pbmcgdWlkXHJcblx0YCwgW3VzZXIuaWRdKTtcclxuXHJcblx0c2Vzc2lvbl9jYWNoZS5zZXQoc2Vzc2lvbi51aWQsIHVzZXIpO1xyXG5cclxuXHRyZXR1cm4gc2Vzc2lvbjtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBkZWxldGVfc2Vzc2lvbiA9IGFzeW5jIHNpZCA9PiB7XHJcblx0YXdhaXQgcXVlcnkoYGRlbGV0ZSBmcm9tIHNlc3Npb25zIHdoZXJlIHVpZCA9ICQxYCwgW3NpZF0pO1xyXG5cdHNlc3Npb25fY2FjaGUuc2V0KHNpZCwgbnVsbCk7XHJcbn07XHJcblxyXG5jb25zdCBnZXRfdXNlciA9IGFzeW5jIHNpZCA9PiB7XHJcblx0aWYgKCFzaWQpIHJldHVybiBudWxsO1xyXG5cclxuXHRpZiAoIXNlc3Npb25fY2FjaGUuaGFzKHNpZCkpIHtcclxuXHRcdHNlc3Npb25fY2FjaGUuc2V0KHNpZCwgYXdhaXQgZmluZChgXHJcblx0XHRcdHNlbGVjdCB1c2Vycy5pZCwgdXNlcnMudWlkLCB1c2Vycy51c2VybmFtZSwgdXNlcnMubmFtZSwgdXNlcnMuYXZhdGFyXHJcblx0XHRcdGZyb20gc2Vzc2lvbnNcclxuXHRcdFx0bGVmdCBqb2luIHVzZXJzIG9uIHNlc3Npb25zLnVzZXJfaWQgPSB1c2Vycy5pZFxyXG5cdFx0XHR3aGVyZSBzZXNzaW9ucy51aWQgPSAkMSBhbmQgZXhwaXJ5ID4gbm93KClcclxuXHRcdGAsIFtzaWRdKSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gc2Vzc2lvbl9jYWNoZS5nZXQoc2lkKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBhdXRoZW50aWNhdGUgPSAoKSA9PiB7XHJcblx0Ly8gdGhpcyBpcyBhIGNvbnZlbmllbnQgdGltZSB0byBjbGVhciBvdXQgZXhwaXJlZCBzZXNzaW9uc1xyXG5cdHF1ZXJ5KGBkZWxldGUgZnJvbSBzZXNzaW9ucyB3aGVyZSBleHBpcnkgPCBub3coKWApO1xyXG5cclxuXHRyZXR1cm4gYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcblx0XHRyZXEuY29va2llcyA9IGNvb2tpZS5wYXJzZShyZXEuaGVhZGVycy5jb29raWUgfHwgJycpO1xyXG5cdFx0cmVxLnVzZXIgPSBhd2FpdCBnZXRfdXNlcihyZXEuY29va2llcy5zaWQpO1xyXG5cclxuXHRcdG5leHQoKTtcclxuXHR9O1xyXG59OyIsImV4cG9ydCBjb25zdCBvYXV0aCA9ICdodHRwczovL2dpdGh1Yi5jb20vbG9naW4vb2F1dGgnO1xyXG5leHBvcnQgY29uc3QgYmFzZXVybCA9IHByb2Nlc3MuZW52LkJBU0VVUkw7XHJcbmV4cG9ydCBjb25zdCBzZWN1cmUgPSBiYXNldXJsICYmIGJhc2V1cmwuc3RhcnRzV2l0aCgnaHR0cHM6Jyk7XHJcblxyXG5leHBvcnQgY29uc3QgY2xpZW50X2lkID0gcHJvY2Vzcy5lbnYuR0lUSFVCX0NMSUVOVF9JRDtcclxuZXhwb3J0IGNvbnN0IGNsaWVudF9zZWNyZXQgPSBwcm9jZXNzLmVudi5HSVRIVUJfQ0xJRU5UX1NFQ1JFVDsiLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XHJcbmltcG9ydCBkZXZhbHVlIGZyb20gJ2RldmFsdWUnO1xyXG5pbXBvcnQgKiBhcyBjb29raWUgZnJvbSAnY29va2llJztcclxuaW1wb3J0ICogYXMgaHR0cGllIGZyb20gJ2h0dHBpZSc7XHJcbmltcG9ydCB7IHBhcnNlLCBzdHJpbmdpZnkgfSBmcm9tICdxdWVyeXN0cmluZyc7XHJcbmltcG9ydCB7IHNhbml0aXplX3VzZXIsIGNyZWF0ZV91c2VyLCBjcmVhdGVfc2Vzc2lvbiB9IGZyb20gJy4uLy4uL3V0aWxzL2F1dGgnO1xyXG5pbXBvcnQgeyBvYXV0aCwgc2VjdXJlLCBjbGllbnRfaWQsIGNsaWVudF9zZWNyZXQgfSBmcm9tICcuL19jb25maWcuanMnO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xyXG5cdHRyeSB7XHJcblx0XHQvLyBUcmFkZSBcImNvZGVcIiBmb3IgXCJhY2Nlc3NfdG9rZW5cIlxyXG5cdFx0Y29uc3QgcjEgPSBhd2FpdCBodHRwaWUucG9zdChgJHtvYXV0aH0vYWNjZXNzX3Rva2VuP2AgKyBzdHJpbmdpZnkoe1xyXG5cdFx0XHRjb2RlOiByZXEucXVlcnkuY29kZSxcclxuXHRcdFx0Y2xpZW50X2lkLFxyXG5cdFx0XHRjbGllbnRfc2VjcmV0LFxyXG5cdFx0fSkpO1xyXG5cclxuXHRcdC8vIE5vdyBmZXRjaCBVc2VyIGRldGFpbHNcclxuXHRcdGNvbnN0IHsgYWNjZXNzX3Rva2VuIH0gPSBwYXJzZShyMS5kYXRhKTtcclxuXHRcdGNvbnN0IHIyID0gYXdhaXQgaHR0cGllLmdldCgnaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2VyJywge1xyXG5cdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0J1VzZXItQWdlbnQnOiAnc3ZlbHRlLmRldicsXHJcblx0XHRcdFx0QXV0aG9yaXphdGlvbjogYHRva2VuICR7YWNjZXNzX3Rva2VufWBcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Y29uc3QgdXNlciA9IGF3YWl0IGNyZWF0ZV91c2VyKHIyLmRhdGEsIGFjY2Vzc190b2tlbik7XHJcblx0XHRjb25zdCBzZXNzaW9uID0gYXdhaXQgY3JlYXRlX3Nlc3Npb24odXNlcik7XHJcblxyXG5cdFx0cmVzLndyaXRlSGVhZCgyMDAsIHtcclxuXHRcdFx0J1NldC1Db29raWUnOiBjb29raWUuc2VyaWFsaXplKCdzaWQnLCBzZXNzaW9uLnVpZCwge1xyXG5cdFx0XHRcdG1heEFnZTogMzE1MzYwMDAsXHJcblx0XHRcdFx0cGF0aDogJy8nLFxyXG5cdFx0XHRcdGh0dHBPbmx5OiB0cnVlLFxyXG5cdFx0XHRcdHNlY3VyZVxyXG5cdFx0XHR9KSxcclxuXHRcdFx0J0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnXHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXMuZW5kKGBcclxuXHRcdFx0PHNjcmlwdD5cclxuXHRcdFx0XHR3aW5kb3cub3BlbmVyLnBvc3RNZXNzYWdlKHtcclxuXHRcdFx0XHRcdHVzZXI6ICR7ZGV2YWx1ZShzYW5pdGl6ZV91c2VyKHVzZXIpKX1cclxuXHRcdFx0XHR9LCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcclxuXHRcdFx0PC9zY3JpcHQ+XHJcblx0XHRgKTtcclxuXHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdGNvbnNvbGUuZXJyb3IoJ0dFVCAvYXV0aC9jYWxsYmFjaycsIGVycik7XHJcblx0XHRzZW5kKHJlcywgNTAwLCBlcnIuZGF0YSwge1xyXG5cdFx0XHQnQ29udGVudC1UeXBlJzogZXJyLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddLFxyXG5cdFx0XHQnQ29udGVudC1MZW5ndGgnOiBlcnIuaGVhZGVyc1snY29udGVudC1sZW5ndGgnXVxyXG5cdFx0fSk7XHJcblx0fVxyXG59IiwiaW1wb3J0IHNlbmQgZnJvbSAnQHBvbGthL3NlbmQnO1xyXG5pbXBvcnQgKiBhcyBjb29raWUgZnJvbSAnY29va2llJztcclxuaW1wb3J0IHsgc2VjdXJlIH0gZnJvbSAnLi9fY29uZmlnLmpzJztcclxuaW1wb3J0IHsgZGVsZXRlX3Nlc3Npb24gfSBmcm9tICcuLi8uLi91dGlscy9hdXRoLmpzJztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXQocmVxLCByZXMpIHtcclxuXHRhd2FpdCBkZWxldGVfc2Vzc2lvbihyZXEuY29va2llcy5zaWQpO1xyXG5cclxuXHRzZW5kKHJlcywgMjAwLCAnJywge1xyXG5cdFx0J1NldC1Db29raWUnOiBjb29raWUuc2VyaWFsaXplKCdzaWQnLCAnJywge1xyXG5cdFx0XHRtYXhBZ2U6IC0xLFxyXG5cdFx0XHRwYXRoOiAnLycsXHJcblx0XHRcdGh0dHBPbmx5OiB0cnVlLFxyXG5cdFx0XHRzZWN1cmVcclxuXHRcdH0pXHJcblx0fSk7XHJcbn0iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XHJcbmltcG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gJ3F1ZXJ5c3RyaW5nJztcclxuaW1wb3J0IHsgb2F1dGgsIGJhc2V1cmwsIGNsaWVudF9pZCB9IGZyb20gJy4vX2NvbmZpZy5qcyc7XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0ID0gY2xpZW50X2lkXHJcblx0PyAocmVxLCByZXMpID0+IHtcclxuXHRcdGNvbnN0IExvY2F0aW9uID0gYCR7b2F1dGh9L2F1dGhvcml6ZT9gICsgc3RyaW5naWZ5KHtcclxuXHRcdFx0c2NvcGU6ICdyZWFkOnVzZXInLFxyXG5cdFx0XHRjbGllbnRfaWQsXHJcblx0XHRcdHJlZGlyZWN0X3VyaTogYCR7YmFzZXVybH0vYXV0aC9jYWxsYmFja2AsXHJcblx0XHR9KTtcclxuXHJcblx0XHRzZW5kKHJlcywgMzAyLCBMb2NhdGlvbiwgeyBMb2NhdGlvbiB9KTtcclxuXHR9XHJcblx0OiAocmVxLCByZXMpID0+IHtcclxuXHRcdHNlbmQocmVzLCA1MDAsIGBcclxuXHRcdFx0PGJvZHkgc3R5bGU9XCJmb250LWZhbWlseTogc2Fucy1zZXJpZjsgYmFja2dyb3VuZDogcmdiKDI1NSwyMTUsMjE1KTsgYm9yZGVyOiAycHggc29saWQgcmVkOyBtYXJnaW46IDA7IHBhZGRpbmc6IDFlbTtcIj5cclxuXHRcdFx0XHQ8aDE+TWlzc2luZyAuZW52IGZpbGU8L2gxPlxyXG5cdFx0XHRcdDxwPkluIG9yZGVyIHRvIHVzZSBHaXRIdWIgYXV0aGVudGljYXRpb24sIHlvdSB3aWxsIG5lZWQgdG8gPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy9kZXZlbG9wZXJzXCI+cmVnaXN0ZXIgYW4gT0F1dGggYXBwbGljYXRpb248L2E+IGFuZCBjcmVhdGUgYSBsb2NhbCAuZW52IGZpbGU6PC9wPlxyXG5cdFx0XHRcdDxwcmU+R0lUSFVCX0NMSUVOVF9JRD1bWU9VUl9BUFBfSURdXFxuR0lUSFVCX0NMSUVOVF9TRUNSRVQ9W1lPVVJfQVBQX1NFQ1JFVF1cXG5CQVNFVVJMPWh0dHA6Ly9sb2NhbGhvc3Q6MzAwMDwvcHJlPlxyXG5cdFx0XHRcdDxwPlRoZSA8Y29kZT5CQVNFVVJMPC9jb2RlPiB2YXJpYWJsZSBzaG91bGQgbWF0Y2ggdGhlIGNhbGxiYWNrIFVSTCBzcGVjaWZpZWQgZm9yIHlvdXIgYXBwLjwvcD5cclxuXHRcdFx0XHQ8cD5TZWUgYWxzbyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3N2ZWx0ZWpzL3N2ZWx0ZS90cmVlL21hc3Rlci9zaXRlI3JlcGwtZ2l0aHViLWludGVncmF0aW9uXCI+aGVyZTwvYT48L3A+XHJcblx0XHRcdDwvYm9keT5cclxuXHRcdGAsIHtcclxuXHRcdFx0J0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnXHJcblx0XHR9KTtcclxuXHR9OyIsIi8qKlxyXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XHJcbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxyXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cclxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxyXG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxyXG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcclxuICovXHJcblxyXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cclxudmFyIElORklOSVRZID0gMSAvIDA7XHJcblxyXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXHJcbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcclxuXHJcbi8qKiBVc2VkIHRvIG1hdGNoIExhdGluIFVuaWNvZGUgbGV0dGVycyAoZXhjbHVkaW5nIG1hdGhlbWF0aWNhbCBvcGVyYXRvcnMpLiAqL1xyXG52YXIgcmVMYXRpbiA9IC9bXFx4YzAtXFx4ZDZcXHhkOC1cXHhmNlxceGY4LVxceGZmXFx1MDEwMC1cXHUwMTdmXS9nO1xyXG5cclxuLyoqIFVzZWQgdG8gY29tcG9zZSB1bmljb2RlIGNoYXJhY3RlciBjbGFzc2VzLiAqL1xyXG52YXIgcnNDb21ib01hcmtzUmFuZ2UgPSAnXFxcXHUwMzAwLVxcXFx1MDM2ZlxcXFx1ZmUyMC1cXFxcdWZlMjMnLFxyXG4gICAgcnNDb21ib1N5bWJvbHNSYW5nZSA9ICdcXFxcdTIwZDAtXFxcXHUyMGYwJztcclxuXHJcbi8qKiBVc2VkIHRvIGNvbXBvc2UgdW5pY29kZSBjYXB0dXJlIGdyb3Vwcy4gKi9cclxudmFyIHJzQ29tYm8gPSAnWycgKyByc0NvbWJvTWFya3NSYW5nZSArIHJzQ29tYm9TeW1ib2xzUmFuZ2UgKyAnXSc7XHJcblxyXG4vKipcclxuICogVXNlZCB0byBtYXRjaCBbY29tYmluaW5nIGRpYWNyaXRpY2FsIG1hcmtzXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db21iaW5pbmdfRGlhY3JpdGljYWxfTWFya3MpIGFuZFxyXG4gKiBbY29tYmluaW5nIGRpYWNyaXRpY2FsIG1hcmtzIGZvciBzeW1ib2xzXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db21iaW5pbmdfRGlhY3JpdGljYWxfTWFya3NfZm9yX1N5bWJvbHMpLlxyXG4gKi9cclxudmFyIHJlQ29tYm9NYXJrID0gUmVnRXhwKHJzQ29tYm8sICdnJyk7XHJcblxyXG4vKiogVXNlZCB0byBtYXAgTGF0aW4gVW5pY29kZSBsZXR0ZXJzIHRvIGJhc2ljIExhdGluIGxldHRlcnMuICovXHJcbnZhciBkZWJ1cnJlZExldHRlcnMgPSB7XHJcbiAgLy8gTGF0aW4tMSBTdXBwbGVtZW50IGJsb2NrLlxyXG4gICdcXHhjMCc6ICdBJywgICdcXHhjMSc6ICdBJywgJ1xceGMyJzogJ0EnLCAnXFx4YzMnOiAnQScsICdcXHhjNCc6ICdBJywgJ1xceGM1JzogJ0EnLFxyXG4gICdcXHhlMCc6ICdhJywgICdcXHhlMSc6ICdhJywgJ1xceGUyJzogJ2EnLCAnXFx4ZTMnOiAnYScsICdcXHhlNCc6ICdhJywgJ1xceGU1JzogJ2EnLFxyXG4gICdcXHhjNyc6ICdDJywgICdcXHhlNyc6ICdjJyxcclxuICAnXFx4ZDAnOiAnRCcsICAnXFx4ZjAnOiAnZCcsXHJcbiAgJ1xceGM4JzogJ0UnLCAgJ1xceGM5JzogJ0UnLCAnXFx4Y2EnOiAnRScsICdcXHhjYic6ICdFJyxcclxuICAnXFx4ZTgnOiAnZScsICAnXFx4ZTknOiAnZScsICdcXHhlYSc6ICdlJywgJ1xceGViJzogJ2UnLFxyXG4gICdcXHhjYyc6ICdJJywgICdcXHhjZCc6ICdJJywgJ1xceGNlJzogJ0knLCAnXFx4Y2YnOiAnSScsXHJcbiAgJ1xceGVjJzogJ2knLCAgJ1xceGVkJzogJ2knLCAnXFx4ZWUnOiAnaScsICdcXHhlZic6ICdpJyxcclxuICAnXFx4ZDEnOiAnTicsICAnXFx4ZjEnOiAnbicsXHJcbiAgJ1xceGQyJzogJ08nLCAgJ1xceGQzJzogJ08nLCAnXFx4ZDQnOiAnTycsICdcXHhkNSc6ICdPJywgJ1xceGQ2JzogJ08nLCAnXFx4ZDgnOiAnTycsXHJcbiAgJ1xceGYyJzogJ28nLCAgJ1xceGYzJzogJ28nLCAnXFx4ZjQnOiAnbycsICdcXHhmNSc6ICdvJywgJ1xceGY2JzogJ28nLCAnXFx4ZjgnOiAnbycsXHJcbiAgJ1xceGQ5JzogJ1UnLCAgJ1xceGRhJzogJ1UnLCAnXFx4ZGInOiAnVScsICdcXHhkYyc6ICdVJyxcclxuICAnXFx4ZjknOiAndScsICAnXFx4ZmEnOiAndScsICdcXHhmYic6ICd1JywgJ1xceGZjJzogJ3UnLFxyXG4gICdcXHhkZCc6ICdZJywgICdcXHhmZCc6ICd5JywgJ1xceGZmJzogJ3knLFxyXG4gICdcXHhjNic6ICdBZScsICdcXHhlNic6ICdhZScsXHJcbiAgJ1xceGRlJzogJ1RoJywgJ1xceGZlJzogJ3RoJyxcclxuICAnXFx4ZGYnOiAnc3MnLFxyXG4gIC8vIExhdGluIEV4dGVuZGVkLUEgYmxvY2suXHJcbiAgJ1xcdTAxMDAnOiAnQScsICAnXFx1MDEwMic6ICdBJywgJ1xcdTAxMDQnOiAnQScsXHJcbiAgJ1xcdTAxMDEnOiAnYScsICAnXFx1MDEwMyc6ICdhJywgJ1xcdTAxMDUnOiAnYScsXHJcbiAgJ1xcdTAxMDYnOiAnQycsICAnXFx1MDEwOCc6ICdDJywgJ1xcdTAxMGEnOiAnQycsICdcXHUwMTBjJzogJ0MnLFxyXG4gICdcXHUwMTA3JzogJ2MnLCAgJ1xcdTAxMDknOiAnYycsICdcXHUwMTBiJzogJ2MnLCAnXFx1MDEwZCc6ICdjJyxcclxuICAnXFx1MDEwZSc6ICdEJywgICdcXHUwMTEwJzogJ0QnLCAnXFx1MDEwZic6ICdkJywgJ1xcdTAxMTEnOiAnZCcsXHJcbiAgJ1xcdTAxMTInOiAnRScsICAnXFx1MDExNCc6ICdFJywgJ1xcdTAxMTYnOiAnRScsICdcXHUwMTE4JzogJ0UnLCAnXFx1MDExYSc6ICdFJyxcclxuICAnXFx1MDExMyc6ICdlJywgICdcXHUwMTE1JzogJ2UnLCAnXFx1MDExNyc6ICdlJywgJ1xcdTAxMTknOiAnZScsICdcXHUwMTFiJzogJ2UnLFxyXG4gICdcXHUwMTFjJzogJ0cnLCAgJ1xcdTAxMWUnOiAnRycsICdcXHUwMTIwJzogJ0cnLCAnXFx1MDEyMic6ICdHJyxcclxuICAnXFx1MDExZCc6ICdnJywgICdcXHUwMTFmJzogJ2cnLCAnXFx1MDEyMSc6ICdnJywgJ1xcdTAxMjMnOiAnZycsXHJcbiAgJ1xcdTAxMjQnOiAnSCcsICAnXFx1MDEyNic6ICdIJywgJ1xcdTAxMjUnOiAnaCcsICdcXHUwMTI3JzogJ2gnLFxyXG4gICdcXHUwMTI4JzogJ0knLCAgJ1xcdTAxMmEnOiAnSScsICdcXHUwMTJjJzogJ0knLCAnXFx1MDEyZSc6ICdJJywgJ1xcdTAxMzAnOiAnSScsXHJcbiAgJ1xcdTAxMjknOiAnaScsICAnXFx1MDEyYic6ICdpJywgJ1xcdTAxMmQnOiAnaScsICdcXHUwMTJmJzogJ2knLCAnXFx1MDEzMSc6ICdpJyxcclxuICAnXFx1MDEzNCc6ICdKJywgICdcXHUwMTM1JzogJ2onLFxyXG4gICdcXHUwMTM2JzogJ0snLCAgJ1xcdTAxMzcnOiAnaycsICdcXHUwMTM4JzogJ2snLFxyXG4gICdcXHUwMTM5JzogJ0wnLCAgJ1xcdTAxM2InOiAnTCcsICdcXHUwMTNkJzogJ0wnLCAnXFx1MDEzZic6ICdMJywgJ1xcdTAxNDEnOiAnTCcsXHJcbiAgJ1xcdTAxM2EnOiAnbCcsICAnXFx1MDEzYyc6ICdsJywgJ1xcdTAxM2UnOiAnbCcsICdcXHUwMTQwJzogJ2wnLCAnXFx1MDE0Mic6ICdsJyxcclxuICAnXFx1MDE0Myc6ICdOJywgICdcXHUwMTQ1JzogJ04nLCAnXFx1MDE0Nyc6ICdOJywgJ1xcdTAxNGEnOiAnTicsXHJcbiAgJ1xcdTAxNDQnOiAnbicsICAnXFx1MDE0Nic6ICduJywgJ1xcdTAxNDgnOiAnbicsICdcXHUwMTRiJzogJ24nLFxyXG4gICdcXHUwMTRjJzogJ08nLCAgJ1xcdTAxNGUnOiAnTycsICdcXHUwMTUwJzogJ08nLFxyXG4gICdcXHUwMTRkJzogJ28nLCAgJ1xcdTAxNGYnOiAnbycsICdcXHUwMTUxJzogJ28nLFxyXG4gICdcXHUwMTU0JzogJ1InLCAgJ1xcdTAxNTYnOiAnUicsICdcXHUwMTU4JzogJ1InLFxyXG4gICdcXHUwMTU1JzogJ3InLCAgJ1xcdTAxNTcnOiAncicsICdcXHUwMTU5JzogJ3InLFxyXG4gICdcXHUwMTVhJzogJ1MnLCAgJ1xcdTAxNWMnOiAnUycsICdcXHUwMTVlJzogJ1MnLCAnXFx1MDE2MCc6ICdTJyxcclxuICAnXFx1MDE1Yic6ICdzJywgICdcXHUwMTVkJzogJ3MnLCAnXFx1MDE1Zic6ICdzJywgJ1xcdTAxNjEnOiAncycsXHJcbiAgJ1xcdTAxNjInOiAnVCcsICAnXFx1MDE2NCc6ICdUJywgJ1xcdTAxNjYnOiAnVCcsXHJcbiAgJ1xcdTAxNjMnOiAndCcsICAnXFx1MDE2NSc6ICd0JywgJ1xcdTAxNjcnOiAndCcsXHJcbiAgJ1xcdTAxNjgnOiAnVScsICAnXFx1MDE2YSc6ICdVJywgJ1xcdTAxNmMnOiAnVScsICdcXHUwMTZlJzogJ1UnLCAnXFx1MDE3MCc6ICdVJywgJ1xcdTAxNzInOiAnVScsXHJcbiAgJ1xcdTAxNjknOiAndScsICAnXFx1MDE2Yic6ICd1JywgJ1xcdTAxNmQnOiAndScsICdcXHUwMTZmJzogJ3UnLCAnXFx1MDE3MSc6ICd1JywgJ1xcdTAxNzMnOiAndScsXHJcbiAgJ1xcdTAxNzQnOiAnVycsICAnXFx1MDE3NSc6ICd3JyxcclxuICAnXFx1MDE3Nic6ICdZJywgICdcXHUwMTc3JzogJ3knLCAnXFx1MDE3OCc6ICdZJyxcclxuICAnXFx1MDE3OSc6ICdaJywgICdcXHUwMTdiJzogJ1onLCAnXFx1MDE3ZCc6ICdaJyxcclxuICAnXFx1MDE3YSc6ICd6JywgICdcXHUwMTdjJzogJ3onLCAnXFx1MDE3ZSc6ICd6JyxcclxuICAnXFx1MDEzMic6ICdJSicsICdcXHUwMTMzJzogJ2lqJyxcclxuICAnXFx1MDE1Mic6ICdPZScsICdcXHUwMTUzJzogJ29lJyxcclxuICAnXFx1MDE0OSc6IFwiJ25cIiwgJ1xcdTAxN2YnOiAnc3MnXHJcbn07XHJcblxyXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xyXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XHJcblxyXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xyXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcclxuXHJcbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xyXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5wcm9wZXJ0eU9mYCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cclxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXHJcbiAqL1xyXG5mdW5jdGlvbiBiYXNlUHJvcGVydHlPZihvYmplY3QpIHtcclxuICByZXR1cm4gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVXNlZCBieSBgXy5kZWJ1cnJgIHRvIGNvbnZlcnQgTGF0aW4tMSBTdXBwbGVtZW50IGFuZCBMYXRpbiBFeHRlbmRlZC1BXHJcbiAqIGxldHRlcnMgdG8gYmFzaWMgTGF0aW4gbGV0dGVycy5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtzdHJpbmd9IGxldHRlciBUaGUgbWF0Y2hlZCBsZXR0ZXIgdG8gZGVidXJyLlxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBkZWJ1cnJlZCBsZXR0ZXIuXHJcbiAqL1xyXG52YXIgZGVidXJyTGV0dGVyID0gYmFzZVByb3BlcnR5T2YoZGVidXJyZWRMZXR0ZXJzKTtcclxuXHJcbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cclxudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcclxuXHJcbi8qKlxyXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXHJcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxyXG4gKiBvZiB2YWx1ZXMuXHJcbiAqL1xyXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcclxuXHJcbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xyXG52YXIgU3ltYm9sID0gcm9vdC5TeW1ib2w7XHJcblxyXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cclxudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcclxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcclxuXHJcbi8qKlxyXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcclxuICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cclxuICovXHJcbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xyXG4gIC8vIEV4aXQgZWFybHkgZm9yIHN0cmluZ3MgdG8gYXZvaWQgYSBwZXJmb3JtYW5jZSBoaXQgaW4gc29tZSBlbnZpcm9ubWVudHMuXHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XHJcbiAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xyXG4gIH1cclxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xyXG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxyXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXHJcbiAqXHJcbiAqIEBzdGF0aWNcclxuICogQG1lbWJlck9mIF9cclxuICogQHNpbmNlIDQuMC4wXHJcbiAqIEBjYXRlZ29yeSBMYW5nXHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XHJcbiAqIC8vID0+IHRydWVcclxuICpcclxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcclxuICogLy8gPT4gdHJ1ZVxyXG4gKlxyXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xyXG4gKiAvLyA9PiBmYWxzZVxyXG4gKlxyXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcclxuICogLy8gPT4gZmFsc2VcclxuICovXHJcbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xyXG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JztcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxyXG4gKlxyXG4gKiBAc3RhdGljXHJcbiAqIEBtZW1iZXJPZiBfXHJcbiAqIEBzaW5jZSA0LjAuMFxyXG4gKiBAY2F0ZWdvcnkgTGFuZ1xyXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cclxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cclxuICogQGV4YW1wbGVcclxuICpcclxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xyXG4gKiAvLyA9PiB0cnVlXHJcbiAqXHJcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xyXG4gKiAvLyA9PiBmYWxzZVxyXG4gKi9cclxuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcclxuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XHJcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcclxuICogYW5kIGB1bmRlZmluZWRgIHZhbHVlcy4gVGhlIHNpZ24gb2YgYC0wYCBpcyBwcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIEBzdGF0aWNcclxuICogQG1lbWJlck9mIF9cclxuICogQHNpbmNlIDQuMC4wXHJcbiAqIEBjYXRlZ29yeSBMYW5nXHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cclxuICogQGV4YW1wbGVcclxuICpcclxuICogXy50b1N0cmluZyhudWxsKTtcclxuICogLy8gPT4gJydcclxuICpcclxuICogXy50b1N0cmluZygtMCk7XHJcbiAqIC8vID0+ICctMCdcclxuICpcclxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xyXG4gKiAvLyA9PiAnMSwyLDMnXHJcbiAqL1xyXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xyXG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xyXG59XHJcblxyXG4vKipcclxuICogRGVidXJycyBgc3RyaW5nYCBieSBjb252ZXJ0aW5nXHJcbiAqIFtMYXRpbi0xIFN1cHBsZW1lbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xhdGluLTFfU3VwcGxlbWVudF8oVW5pY29kZV9ibG9jaykjQ2hhcmFjdGVyX3RhYmxlKVxyXG4gKiBhbmQgW0xhdGluIEV4dGVuZGVkLUFdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xhdGluX0V4dGVuZGVkLUEpXHJcbiAqIGxldHRlcnMgdG8gYmFzaWMgTGF0aW4gbGV0dGVycyBhbmQgcmVtb3ZpbmdcclxuICogW2NvbWJpbmluZyBkaWFjcml0aWNhbCBtYXJrc10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29tYmluaW5nX0RpYWNyaXRpY2FsX01hcmtzKS5cclxuICpcclxuICogQHN0YXRpY1xyXG4gKiBAbWVtYmVyT2YgX1xyXG4gKiBAc2luY2UgMy4wLjBcclxuICogQGNhdGVnb3J5IFN0cmluZ1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHN0cmluZyB0byBkZWJ1cnIuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGRlYnVycmVkIHN0cmluZy5cclxuICogQGV4YW1wbGVcclxuICpcclxuICogXy5kZWJ1cnIoJ2TDqWrDoCB2dScpO1xyXG4gKiAvLyA9PiAnZGVqYSB2dSdcclxuICovXHJcbmZ1bmN0aW9uIGRlYnVycihzdHJpbmcpIHtcclxuICBzdHJpbmcgPSB0b1N0cmluZyhzdHJpbmcpO1xyXG4gIHJldHVybiBzdHJpbmcgJiYgc3RyaW5nLnJlcGxhY2UocmVMYXRpbiwgZGVidXJyTGV0dGVyKS5yZXBsYWNlKHJlQ29tYm9NYXJrLCAnJyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZGVidXJyO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbWF0Y2hPcGVyYXRvcnNSZSA9IC9bfFxcXFx7fSgpW1xcXV4kKyo/Ll0vZztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xyXG5cdGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xyXG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBzdHJpbmcnKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBzdHIucmVwbGFjZShtYXRjaE9wZXJhdG9yc1JlLCAnXFxcXCQmJyk7XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gW1xyXG5cdC8vIEdlcm1hbiB1bWxhdXRzXHJcblx0WyfDnycsICdzcyddLFxyXG5cdFsnw6QnLCAnYWUnXSxcclxuXHRbJ8OEJywgJ0FlJ10sXHJcblx0WyfDticsICdvZSddLFxyXG5cdFsnw5YnLCAnT2UnXSxcclxuXHRbJ8O8JywgJ3VlJ10sXHJcblx0WyfDnCcsICdVZSddLFxyXG5cclxuXHQvLyBWaWV0bmFtZXNlXHJcblx0WyfDoCcsICdhJ10sXHJcblx0WyfDgCcsICdBJ10sXHJcblx0WyfDoScsICdhJ10sXHJcblx0WyfDgScsICdBJ10sXHJcblx0WyfDoicsICdhJ10sXHJcblx0WyfDgicsICdBJ10sXHJcblx0WyfDoycsICdhJ10sXHJcblx0WyfDgycsICdBJ10sXHJcblx0WyfDqCcsICdlJ10sXHJcblx0WyfDiCcsICdFJ10sXHJcblx0WyfDqScsICdlJ10sXHJcblx0WyfDiScsICdFJ10sXHJcblx0WyfDqicsICdlJ10sXHJcblx0WyfDiicsICdFJ10sXHJcblx0WyfDrCcsICdpJ10sXHJcblx0WyfDjCcsICdJJ10sXHJcblx0WyfDrScsICdpJ10sXHJcblx0WyfDjScsICdJJ10sXHJcblx0WyfDsicsICdvJ10sXHJcblx0WyfDkicsICdPJ10sXHJcblx0WyfDsycsICdvJ10sXHJcblx0WyfDkycsICdPJ10sXHJcblx0WyfDtCcsICdvJ10sXHJcblx0WyfDlCcsICdPJ10sXHJcblx0WyfDtScsICdvJ10sXHJcblx0WyfDlScsICdPJ10sXHJcblx0WyfDuScsICd1J10sXHJcblx0WyfDmScsICdVJ10sXHJcblx0WyfDuicsICd1J10sXHJcblx0WyfDmicsICdVJ10sXHJcblx0WyfDvScsICd5J10sXHJcblx0WyfDnScsICdZJ10sXHJcblx0WyfEgycsICdhJ10sXHJcblx0WyfEgicsICdBJ10sXHJcblx0WyfEkCcsICdEJ10sXHJcblx0WyfEkScsICdkJ10sXHJcblx0WyfEqScsICdpJ10sXHJcblx0WyfEqCcsICdJJ10sXHJcblx0WyfFqScsICd1J10sXHJcblx0WyfFqCcsICdVJ10sXHJcblx0WyfGoScsICdvJ10sXHJcblx0WyfGoCcsICdPJ10sXHJcblx0WyfGsCcsICd1J10sXHJcblx0WyfGrycsICdVJ10sXHJcblx0WyfhuqEnLCAnYSddLFxyXG5cdFsn4bqgJywgJ0EnXSxcclxuXHRbJ+G6oycsICdhJ10sXHJcblx0WyfhuqInLCAnQSddLFxyXG5cdFsn4bqlJywgJ2EnXSxcclxuXHRbJ+G6pCcsICdBJ10sXHJcblx0WyfhuqcnLCAnYSddLFxyXG5cdFsn4bqmJywgJ0EnXSxcclxuXHRbJ+G6qScsICdhJ10sXHJcblx0WyfhuqgnLCAnQSddLFxyXG5cdFsn4bqrJywgJ2EnXSxcclxuXHRbJ+G6qicsICdBJ10sXHJcblx0Wyfhuq0nLCAnYSddLFxyXG5cdFsn4bqsJywgJ0EnXSxcclxuXHRbJ+G6rycsICdhJ10sXHJcblx0Wyfhuq4nLCAnQSddLFxyXG5cdFsn4bqxJywgJ2EnXSxcclxuXHRbJ+G6sCcsICdBJ10sXHJcblx0WyfhurMnLCAnYSddLFxyXG5cdFsn4bqyJywgJ0EnXSxcclxuXHRbJ+G6tScsICdhJ10sXHJcblx0WyfhurQnLCAnQSddLFxyXG5cdFsn4bq3JywgJ2EnXSxcclxuXHRbJ+G6ticsICdBJ10sXHJcblx0WyfhurknLCAnZSddLFxyXG5cdFsn4bq4JywgJ0UnXSxcclxuXHRbJ+G6uycsICdlJ10sXHJcblx0WyfhuronLCAnRSddLFxyXG5cdFsn4bq9JywgJ2UnXSxcclxuXHRbJ+G6vCcsICdFJ10sXHJcblx0Wyfhur8nLCAnZSddLFxyXG5cdFsn4bq+JywgJ0UnXSxcclxuXHRbJ+G7gScsICdlJ10sXHJcblx0Wyfhu4AnLCAnRSddLFxyXG5cdFsn4buDJywgJ2UnXSxcclxuXHRbJ+G7gicsICdFJ10sXHJcblx0Wyfhu4UnLCAnZSddLFxyXG5cdFsn4buEJywgJ0UnXSxcclxuXHRbJ+G7hycsICdlJ10sXHJcblx0Wyfhu4YnLCAnRSddLFxyXG5cdFsn4buJJywgJ2knXSxcclxuXHRbJ+G7iCcsICdJJ10sXHJcblx0Wyfhu4snLCAnaSddLFxyXG5cdFsn4buKJywgJ0knXSxcclxuXHRbJ+G7jScsICdvJ10sXHJcblx0Wyfhu4wnLCAnTyddLFxyXG5cdFsn4buPJywgJ28nXSxcclxuXHRbJ+G7jicsICdPJ10sXHJcblx0Wyfhu5EnLCAnbyddLFxyXG5cdFsn4buQJywgJ08nXSxcclxuXHRbJ+G7kycsICdvJ10sXHJcblx0Wyfhu5InLCAnTyddLFxyXG5cdFsn4buVJywgJ28nXSxcclxuXHRbJ+G7lCcsICdPJ10sXHJcblx0Wyfhu5cnLCAnbyddLFxyXG5cdFsn4buWJywgJ08nXSxcclxuXHRbJ+G7mScsICdvJ10sXHJcblx0Wyfhu5gnLCAnTyddLFxyXG5cdFsn4bubJywgJ28nXSxcclxuXHRbJ+G7micsICdPJ10sXHJcblx0Wyfhu50nLCAnbyddLFxyXG5cdFsn4bucJywgJ08nXSxcclxuXHRbJ+G7nycsICdvJ10sXHJcblx0Wyfhu54nLCAnTyddLFxyXG5cdFsn4buhJywgJ28nXSxcclxuXHRbJ+G7oCcsICdPJ10sXHJcblx0Wyfhu6MnLCAnbyddLFxyXG5cdFsn4buiJywgJ08nXSxcclxuXHRbJ+G7pScsICd1J10sXHJcblx0Wyfhu6QnLCAnVSddLFxyXG5cdFsn4bunJywgJ3UnXSxcclxuXHRbJ+G7picsICdVJ10sXHJcblx0Wyfhu6knLCAndSddLFxyXG5cdFsn4buoJywgJ1UnXSxcclxuXHRbJ+G7qycsICd1J10sXHJcblx0Wyfhu6onLCAnVSddLFxyXG5cdFsn4butJywgJ3UnXSxcclxuXHRbJ+G7rCcsICdVJ10sXHJcblx0Wyfhu68nLCAndSddLFxyXG5cdFsn4buuJywgJ1UnXSxcclxuXHRbJ+G7sScsICd1J10sXHJcblx0Wyfhu7AnLCAnVSddLFxyXG5cdFsn4buzJywgJ3knXSxcclxuXHRbJ+G7sicsICdZJ10sXHJcblx0Wyfhu7UnLCAneSddLFxyXG5cdFsn4bu0JywgJ1knXSxcclxuXHRbJ+G7tycsICd5J10sXHJcblx0Wyfhu7YnLCAnWSddLFxyXG5cdFsn4bu5JywgJ3knXSxcclxuXHRbJ+G7uCcsICdZJ10sXHJcblxyXG5cdC8vIEFyYWJpY1xyXG5cdFsn2KEnLCAnZSddLFxyXG5cdFsn2KInLCAnYSddLFxyXG5cdFsn2KMnLCAnYSddLFxyXG5cdFsn2KQnLCAndyddLFxyXG5cdFsn2KUnLCAnaSddLFxyXG5cdFsn2KYnLCAneSddLFxyXG5cdFsn2KcnLCAnYSddLFxyXG5cdFsn2KgnLCAnYiddLFxyXG5cdFsn2KknLCAndCddLFxyXG5cdFsn2KonLCAndCddLFxyXG5cdFsn2KsnLCAndGgnXSxcclxuXHRbJ9isJywgJ2onXSxcclxuXHRbJ9itJywgJ2gnXSxcclxuXHRbJ9iuJywgJ2toJ10sXHJcblx0WyfYrycsICdkJ10sXHJcblx0WyfYsCcsICdkaCddLFxyXG5cdFsn2LEnLCAnciddLFxyXG5cdFsn2LInLCAneiddLFxyXG5cdFsn2LMnLCAncyddLFxyXG5cdFsn2LQnLCAnc2gnXSxcclxuXHRbJ9i1JywgJ3MnXSxcclxuXHRbJ9i2JywgJ2QnXSxcclxuXHRbJ9i3JywgJ3QnXSxcclxuXHRbJ9i4JywgJ3onXSxcclxuXHRbJ9i5JywgJ2UnXSxcclxuXHRbJ9i6JywgJ2doJ10sXHJcblx0WyfZgCcsICdfJ10sXHJcblx0WyfZgScsICdmJ10sXHJcblx0WyfZgicsICdxJ10sXHJcblx0WyfZgycsICdrJ10sXHJcblx0WyfZhCcsICdsJ10sXHJcblx0WyfZhScsICdtJ10sXHJcblx0WyfZhicsICduJ10sXHJcblx0WyfZhycsICdoJ10sXHJcblx0WyfZiCcsICd3J10sXHJcblx0WyfZiScsICdhJ10sXHJcblx0WyfZiicsICd5J10sXHJcblx0WyfZjuKAjicsICdhJ10sXHJcblx0WyfZjycsICd1J10sXHJcblx0WyfZkOKAjicsICdpJ10sXHJcblx0WyfZoCcsICcwJ10sXHJcblx0WyfZoScsICcxJ10sXHJcblx0WyfZoicsICcyJ10sXHJcblx0WyfZoycsICczJ10sXHJcblx0WyfZpCcsICc0J10sXHJcblx0WyfZpScsICc1J10sXHJcblx0WyfZpicsICc2J10sXHJcblx0WyfZpycsICc3J10sXHJcblx0WyfZqCcsICc4J10sXHJcblx0WyfZqScsICc5J10sXHJcblxyXG5cdC8vIFBlcnNpYW4gLyBGYXJzaVxyXG5cdFsn2oYnLCAnY2gnXSxcclxuXHRbJ9qpJywgJ2snXSxcclxuXHRbJ9qvJywgJ2cnXSxcclxuXHRbJ9m+JywgJ3AnXSxcclxuXHRbJ9qYJywgJ3poJ10sXHJcblx0WyfbjCcsICd5J10sXHJcblx0WyfbsCcsICcwJ10sXHJcblx0WyfbsScsICcxJ10sXHJcblx0WyfbsicsICcyJ10sXHJcblx0WyfbsycsICczJ10sXHJcblx0WyfbtCcsICc0J10sXHJcblx0WyfbtScsICc1J10sXHJcblx0WyfbticsICc2J10sXHJcblx0WyfbtycsICc3J10sXHJcblx0WyfbuCcsICc4J10sXHJcblx0WyfbuScsICc5J10sXHJcblxyXG5cdC8vIFBhc2h0b1xyXG5cdFsn2bwnLCAncCddLFxyXG5cdFsn2oEnLCAneiddLFxyXG5cdFsn2oUnLCAnYyddLFxyXG5cdFsn2oknLCAnZCddLFxyXG5cdFsn77qrJywgJ2QnXSxcclxuXHRbJ++6rScsICdyJ10sXHJcblx0WyfakycsICdyJ10sXHJcblx0Wyfvuq8nLCAneiddLFxyXG5cdFsn2pYnLCAnZyddLFxyXG5cdFsn2ponLCAneCddLFxyXG5cdFsn2qsnLCAnZyddLFxyXG5cdFsn2rwnLCAnbiddLFxyXG5cdFsn24AnLCAnZSddLFxyXG5cdFsn25AnLCAnZSddLFxyXG5cdFsn240nLCAnYWknXSxcclxuXHJcblx0Ly8gVXJkdVxyXG5cdFsn2bknLCAndCddLFxyXG5cdFsn2ognLCAnZCddLFxyXG5cdFsn2pEnLCAnciddLFxyXG5cdFsn2ronLCAnbiddLFxyXG5cdFsn24EnLCAnaCddLFxyXG5cdFsn2r4nLCAnaCddLFxyXG5cdFsn25InLCAnZSddLFxyXG5cclxuXHQvLyBSdXNzaWFuXHJcblx0WyfQkCcsICdBJ10sXHJcblx0WyfQsCcsICdhJ10sXHJcblx0WyfQkScsICdCJ10sXHJcblx0WyfQsScsICdiJ10sXHJcblx0WyfQkicsICdWJ10sXHJcblx0WyfQsicsICd2J10sXHJcblx0WyfQkycsICdHJ10sXHJcblx0WyfQsycsICdnJ10sXHJcblx0WyfQlCcsICdEJ10sXHJcblx0WyfQtCcsICdkJ10sXHJcblx0WyfQlScsICdFJ10sXHJcblx0WyfQtScsICdlJ10sXHJcblx0WyfQlicsICdaaCddLFxyXG5cdFsn0LYnLCAnemgnXSxcclxuXHRbJ9CXJywgJ1onXSxcclxuXHRbJ9C3JywgJ3onXSxcclxuXHRbJ9CYJywgJ0knXSxcclxuXHRbJ9C4JywgJ2knXSxcclxuXHRbJ9CZJywgJ0onXSxcclxuXHRbJ9C5JywgJ2onXSxcclxuXHRbJ9CaJywgJ0snXSxcclxuXHRbJ9C6JywgJ2snXSxcclxuXHRbJ9CbJywgJ0wnXSxcclxuXHRbJ9C7JywgJ2wnXSxcclxuXHRbJ9CcJywgJ00nXSxcclxuXHRbJ9C8JywgJ20nXSxcclxuXHRbJ9CdJywgJ04nXSxcclxuXHRbJ9C9JywgJ24nXSxcclxuXHRbJ9CeJywgJ08nXSxcclxuXHRbJ9C+JywgJ28nXSxcclxuXHRbJ9CfJywgJ1AnXSxcclxuXHRbJ9C/JywgJ3AnXSxcclxuXHRbJ9CgJywgJ1InXSxcclxuXHRbJ9GAJywgJ3InXSxcclxuXHRbJ9ChJywgJ1MnXSxcclxuXHRbJ9GBJywgJ3MnXSxcclxuXHRbJ9CiJywgJ1QnXSxcclxuXHRbJ9GCJywgJ3QnXSxcclxuXHRbJ9CjJywgJ1UnXSxcclxuXHRbJ9GDJywgJ3UnXSxcclxuXHRbJ9CkJywgJ0YnXSxcclxuXHRbJ9GEJywgJ2YnXSxcclxuXHRbJ9ClJywgJ0gnXSxcclxuXHRbJ9GFJywgJ2gnXSxcclxuXHRbJ9CmJywgJ0N6J10sXHJcblx0WyfRhicsICdjeiddLFxyXG5cdFsn0KcnLCAnQ2gnXSxcclxuXHRbJ9GHJywgJ2NoJ10sXHJcblx0WyfQqCcsICdTaCddLFxyXG5cdFsn0YgnLCAnc2gnXSxcclxuXHRbJ9CpJywgJ1NoaCddLFxyXG5cdFsn0YknLCAnc2hoJ10sXHJcblx0WyfQqicsICcnXSxcclxuXHRbJ9GKJywgJyddLFxyXG5cdFsn0KsnLCAnWSddLFxyXG5cdFsn0YsnLCAneSddLFxyXG5cdFsn0KwnLCAnJ10sXHJcblx0WyfRjCcsICcnXSxcclxuXHRbJ9CtJywgJ0UnXSxcclxuXHRbJ9GNJywgJ2UnXSxcclxuXHRbJ9CuJywgJ1l1J10sXHJcblx0WyfRjicsICd5dSddLFxyXG5cdFsn0K8nLCAnWWEnXSxcclxuXHRbJ9GPJywgJ3lhJ10sXHJcblx0WyfQgScsICdZbyddLFxyXG5cdFsn0ZEnLCAneW8nXSxcclxuXHJcblx0Ly8gUm9tYW5pYW5cclxuXHRbJ8iZJywgJ3MnXSxcclxuXHRbJ8iYJywgJ3MnXSxcclxuXHRbJ8ibJywgJ3QnXSxcclxuXHRbJ8iaJywgJ3QnXSxcclxuXHJcblx0Ly8gVHVya2lzaFxyXG5cdFsnxZ8nLCAncyddLFxyXG5cdFsnxZ4nLCAncyddLFxyXG5cdFsnw6cnLCAnYyddLFxyXG5cdFsnw4cnLCAnYyddLFxyXG5cdFsnxJ8nLCAnZyddLFxyXG5cdFsnxJ4nLCAnZyddLFxyXG5cdFsnxLEnLCAnaSddLFxyXG5cdFsnxLAnLCAnaSddXHJcbl07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gW1xyXG5cdFsnJicsICcgYW5kICddLFxyXG5cdFsn8J+mhCcsICcgdW5pY29ybiAnXSxcclxuXHRbJ+KZpScsICcgbG92ZSAnXVxyXG5dO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcbmNvbnN0IGRlYnVyciA9IHJlcXVpcmUoJ2xvZGFzaC5kZWJ1cnInKTtcclxuY29uc3QgZXNjYXBlU3RyaW5nUmVnZXhwID0gcmVxdWlyZSgnZXNjYXBlLXN0cmluZy1yZWdleHAnKTtcclxuY29uc3QgYnVpbHRpblJlcGxhY2VtZW50cyA9IHJlcXVpcmUoJy4vcmVwbGFjZW1lbnRzJyk7XHJcbmNvbnN0IGJ1aWx0aW5PdmVycmlkYWJsZVJlcGxhY2VtZW50cyA9IHJlcXVpcmUoJy4vb3ZlcnJpZGFibGUtcmVwbGFjZW1lbnRzJyk7XHJcblxyXG5jb25zdCBkZWNhbWVsaXplID0gc3RyaW5nID0+IHtcclxuXHRyZXR1cm4gc3RyaW5nXHJcblx0XHQucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSkvZywgJyQxICQyJylcclxuXHRcdC5yZXBsYWNlKC8oW0EtWl0rKShbQS1aXVthLXpcXGRdKykvZywgJyQxICQyJyk7XHJcbn07XHJcblxyXG5jb25zdCBkb0N1c3RvbVJlcGxhY2VtZW50cyA9IChzdHJpbmcsIHJlcGxhY2VtZW50cykgPT4ge1xyXG5cdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHJlcGxhY2VtZW50cykge1xyXG5cdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobmV3IFJlZ0V4cChlc2NhcGVTdHJpbmdSZWdleHAoa2V5KSwgJ2cnKSwgdmFsdWUpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHN0cmluZztcclxufTtcclxuXHJcbmNvbnN0IHJlbW92ZU1vb3RTZXBhcmF0b3JzID0gKHN0cmluZywgc2VwYXJhdG9yKSA9PiB7XHJcblx0cmV0dXJuIHN0cmluZ1xyXG5cdFx0LnJlcGxhY2UobmV3IFJlZ0V4cChgJHtzZXBhcmF0b3J9ezIsfWAsICdnJyksIHNlcGFyYXRvcilcclxuXHRcdC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4ke3NlcGFyYXRvcn18JHtzZXBhcmF0b3J9JGAsICdnJyksICcnKTtcclxufTtcclxuXHJcbmNvbnN0IHNsdWdpZnkgPSAoc3RyaW5nLCBvcHRpb25zKSA9PiB7XHJcblx0aWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XHJcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBhIHN0cmluZywgZ290IFxcYCR7dHlwZW9mIHN0cmluZ31cXGBgKTtcclxuXHR9XHJcblxyXG5cdG9wdGlvbnMgPSB7XHJcblx0XHRzZXBhcmF0b3I6ICctJyxcclxuXHRcdGxvd2VyY2FzZTogdHJ1ZSxcclxuXHRcdGRlY2FtZWxpemU6IHRydWUsXHJcblx0XHRjdXN0b21SZXBsYWNlbWVudHM6IFtdLFxyXG5cdFx0Li4ub3B0aW9uc1xyXG5cdH07XHJcblxyXG5cdGNvbnN0IHNlcGFyYXRvciA9IGVzY2FwZVN0cmluZ1JlZ2V4cChvcHRpb25zLnNlcGFyYXRvcik7XHJcblx0Y29uc3QgY3VzdG9tUmVwbGFjZW1lbnRzID0gbmV3IE1hcChbXHJcblx0XHQuLi5idWlsdGluT3ZlcnJpZGFibGVSZXBsYWNlbWVudHMsXHJcblx0XHQuLi5vcHRpb25zLmN1c3RvbVJlcGxhY2VtZW50cyxcclxuXHRcdC4uLmJ1aWx0aW5SZXBsYWNlbWVudHNcclxuXHRdKTtcclxuXHJcblx0c3RyaW5nID0gZG9DdXN0b21SZXBsYWNlbWVudHMoc3RyaW5nLCBjdXN0b21SZXBsYWNlbWVudHMpO1xyXG5cdHN0cmluZyA9IGRlYnVycihzdHJpbmcpO1xyXG5cdHN0cmluZyA9IHN0cmluZy5ub3JtYWxpemUoJ05GS0QnKTtcclxuXHJcblx0aWYgKG9wdGlvbnMuZGVjYW1lbGl6ZSkge1xyXG5cdFx0c3RyaW5nID0gZGVjYW1lbGl6ZShzdHJpbmcpO1xyXG5cdH1cclxuXHJcblx0bGV0IHBhdHRlcm5TbHVnID0gL1teYS16QS1aXFxkXSsvZztcclxuXHJcblx0aWYgKG9wdGlvbnMubG93ZXJjYXNlKSB7XHJcblx0XHRzdHJpbmcgPSBzdHJpbmcudG9Mb3dlckNhc2UoKTtcclxuXHRcdHBhdHRlcm5TbHVnID0gL1teYS16XFxkXSsvZztcclxuXHR9XHJcblxyXG5cdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHBhdHRlcm5TbHVnLCBzZXBhcmF0b3IpO1xyXG5cdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC9cXFxcL2csICcnKTtcclxuXHRzdHJpbmcgPSByZW1vdmVNb290U2VwYXJhdG9ycyhzdHJpbmcsIHNlcGFyYXRvcik7XHJcblxyXG5cdHJldHVybiBzdHJpbmc7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNsdWdpZnk7XHJcbi8vIFRPRE86IFJlbW92ZSB0aGlzIGZvciB0aGUgbmV4dCBtYWpvciByZWxlYXNlXHJcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBzbHVnaWZ5O1xyXG4iLCJleHBvcnQgY29uc3QgU0xVR19QUkVTRVJWRV9VTklDT0RFID0gdHJ1ZTtcclxuZXhwb3J0IGNvbnN0IFNMVUdfU0VQQVJBVE9SID0gJ18nO1xyXG4iLCJpbXBvcnQgc2x1Z2lmeSBmcm9tICdAc2luZHJlc29yaHVzL3NsdWdpZnknO1xyXG5pbXBvcnQge1NMVUdfU0VQQVJBVE9SfSBmcm9tICcuLi8uLi9jb25maWcnO1xyXG5cclxuLyogdXJsLXNhZmUgcHJvY2Vzc29yICovXHJcblxyXG5leHBvcnQgY29uc3QgdXJsc2FmZVNsdWdQcm9jZXNzb3IgPSBzdHJpbmcgPT5cclxuXHRzbHVnaWZ5KHN0cmluZywge1xyXG5cdFx0Y3VzdG9tUmVwbGFjZW1lbnRzOiBbXHQvLyBydW5zIGJlZm9yZSBhbnkgb3RoZXIgdHJhbnNmb3JtYXRpb25zXHJcblx0XHRcdFsnJCcsICdET0xMQVInXSwgLy8gYCRkZXN0cm95YCAmIGNvXHJcblx0XHRcdFsnLScsICdEQVNIJ10sIC8vIGNvbmZsaWN0cyB3aXRoIGBzZXBhcmF0b3JgXHJcblx0XHRdLFxyXG5cdFx0c2VwYXJhdG9yOiBTTFVHX1NFUEFSQVRPUixcclxuXHRcdGRlY2FtZWxpemU6IGZhbHNlLFxyXG5cdFx0bG93ZXJjYXNlOiBmYWxzZVxyXG5cdH0pXHJcblx0XHQucmVwbGFjZSgvRE9MTEFSL2csICckJylcclxuXHRcdC5yZXBsYWNlKC9EQVNIL2csICctJyk7XHJcblxyXG4vKiB1bmljb2RlLXByZXNlcnZlciBwcm9jZXNzb3IgKi9cclxuXHJcbmNvbnN0IGFscGhhTnVtUmVnZXggPSAvW2EtekEtWjAtOV0vO1xyXG5jb25zdCB1bmljb2RlUmVnZXggPSAvXFxwe0xldHRlcn0vdTtcclxuY29uc3QgaXNOb25BbHBoYU51bVVuaWNvZGUgPVxyXG5cdHN0cmluZyA9PiAhYWxwaGFOdW1SZWdleC50ZXN0KHN0cmluZykgJiYgdW5pY29kZVJlZ2V4LnRlc3Qoc3RyaW5nKTtcclxuXHJcbmV4cG9ydCBjb25zdCB1bmljb2RlU2FmZVByb2Nlc3NvciA9IHN0cmluZyA9PlxyXG5cdHN0cmluZy5zcGxpdCgnJylcclxuXHRcdC5yZWR1Y2UoKGFjY3VtLCBjaGFyLCBpbmRleCwgYXJyYXkpID0+IHtcclxuXHRcdFx0Y29uc3QgdHlwZSA9IGlzTm9uQWxwaGFOdW1Vbmljb2RlKGNoYXIpID8gJ3Bhc3MnIDogJ3Byb2Nlc3MnO1xyXG5cclxuXHRcdFx0aWYgKGluZGV4ID09PSAwKSB7XHJcblx0XHRcdFx0YWNjdW0uY3VycmVudCA9IHt0eXBlLCBzdHJpbmc6IGNoYXJ9O1xyXG5cdFx0XHR9IGVsc2UgaWYgKHR5cGUgPT09IGFjY3VtLmN1cnJlbnQudHlwZSkge1xyXG5cdFx0XHRcdGFjY3VtLmN1cnJlbnQuc3RyaW5nICs9IGNoYXI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0YWNjdW0uY2h1bmtzLnB1c2goYWNjdW0uY3VycmVudCk7XHJcblx0XHRcdFx0YWNjdW0uY3VycmVudCA9IHt0eXBlLCBzdHJpbmc6IGNoYXJ9O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoaW5kZXggPT09IGFycmF5Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRhY2N1bS5jaHVua3MucHVzaChhY2N1bS5jdXJyZW50KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGFjY3VtO1xyXG5cdFx0fSwge2NodW5rczogW10sIGN1cnJlbnQ6IHt0eXBlOiAnJywgc3RyaW5nOiAnJ319KVxyXG5cdFx0LmNodW5rc1xyXG5cdFx0LnJlZHVjZSgoYWNjdW0sIGNodW5rKSA9PiB7XHJcblx0XHRcdGNvbnN0IHByb2Nlc3NlZCA9IGNodW5rLnR5cGUgPT09ICdwcm9jZXNzJ1xyXG5cdFx0XHRcdD8gdXJsc2FmZVNsdWdQcm9jZXNzb3IoY2h1bmsuc3RyaW5nKVxyXG5cdFx0XHRcdDogY2h1bmsuc3RyaW5nO1xyXG5cclxuXHRcdFx0cHJvY2Vzc2VkLmxlbmd0aCA+IDAgJiYgYWNjdW0ucHVzaChwcm9jZXNzZWQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGFjY3VtO1xyXG5cdFx0fSwgW10pXHJcblx0XHQuam9pbihTTFVHX1NFUEFSQVRPUik7XHJcblxyXG4vKiBwcm9jZXNzb3IgKi9cclxuXHJcbmV4cG9ydCBjb25zdCBtYWtlU2x1Z1Byb2Nlc3NvciA9IChwcmVzZXJ2ZVVuaWNvZGUgPSBmYWxzZSkgPT4gcHJlc2VydmVVbmljb2RlXHJcblx0PyB1bmljb2RlU2FmZVByb2Nlc3NvclxyXG5cdDogdXJsc2FmZVNsdWdQcm9jZXNzb3I7XHJcblxyXG4vKiBzZXNzaW9uIHByb2Nlc3NvciAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IG1ha2VTZXNzaW9uU2x1Z1Byb2Nlc3NvciA9IChwcmVzZXJ2ZVVuaWNvZGUgPSBmYWxzZSkgPT4ge1xyXG5cdGNvbnN0IHByb2Nlc3NvciA9IG1ha2VTbHVnUHJvY2Vzc29yKHByZXNlcnZlVW5pY29kZSk7XHJcblx0Y29uc3Qgc2VlbiA9IG5ldyBTZXQoKTtcclxuXHJcblx0cmV0dXJuIHN0cmluZyA9PiB7XHJcblx0XHRjb25zdCBzbHVnID0gcHJvY2Vzc29yKHN0cmluZyk7XHJcblxyXG5cdFx0aWYgKHNlZW4uaGFzKHNsdWcpKSB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBzbHVnICR7c2x1Z31gKTtcclxuXHRcdHNlZW4uYWRkKHNsdWcpO1xyXG5cclxuXHRcdHJldHVybiBzbHVnO1xyXG5cdH07XHJcbn07XHJcbiIsImltcG9ydCBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBleHRyYWN0X2Zyb250bWF0dGVyLCBsaW5rX3JlbmRlcmVyIH0gZnJvbSAnQHN2ZWx0ZWpzL3NpdGUta2l0L3V0aWxzL21hcmtkb3duLmpzJztcclxuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnO1xyXG5pbXBvcnQgeyBtYWtlU2x1Z1Byb2Nlc3NvciB9IGZyb20gJy4uLy4uL3V0aWxzL3NsdWcnO1xyXG5pbXBvcnQgeyBoaWdobGlnaHQgfSBmcm9tICcuLi8uLi91dGlscy9oaWdobGlnaHQnO1xyXG5pbXBvcnQgeyBTTFVHX1BSRVNFUlZFX1VOSUNPREUgfSBmcm9tICcuLi8uLi8uLi9jb25maWcnO1xyXG5cclxuY29uc3QgbWFrZVNsdWcgPSBtYWtlU2x1Z1Byb2Nlc3NvcihTTFVHX1BSRVNFUlZFX1VOSUNPREUpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0X3Bvc3RzKCkge1xyXG5cdHJldHVybiBmc1xyXG5cdFx0LnJlYWRkaXJTeW5jKCdjb250ZW50L2Jsb2cnKVxyXG5cdFx0Lm1hcChmaWxlID0+IHtcclxuXHRcdFx0aWYgKHBhdGguZXh0bmFtZShmaWxlKSAhPT0gJy5tZCcpIHJldHVybjtcclxuXHJcblx0XHRcdGNvbnN0IG1hdGNoID0gL14oXFxkKy1cXGQrLVxcZCspLSguKylcXC5tZCQvLmV4ZWMoZmlsZSk7XHJcblx0XHRcdGlmICghbWF0Y2gpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBmaWxlbmFtZSAnJHtmaWxlfSdgKTtcclxuXHJcblx0XHRcdGNvbnN0IFssIHB1YmRhdGUsIHNsdWddID0gbWF0Y2g7XHJcblxyXG5cdFx0XHRjb25zdCBtYXJrZG93biA9IGZzLnJlYWRGaWxlU3luYyhgY29udGVudC9ibG9nLyR7ZmlsZX1gLCAndXRmLTgnKTtcclxuXHJcblx0XHRcdGNvbnN0IHsgY29udGVudCwgbWV0YWRhdGEgfSA9IGV4dHJhY3RfZnJvbnRtYXR0ZXIobWFya2Rvd24pO1xyXG5cclxuXHRcdFx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKGAke3B1YmRhdGV9IEVEVGApOyAvLyBjaGVla3kgaGFja1xyXG5cdFx0XHRtZXRhZGF0YS5wdWJkYXRlID0gcHViZGF0ZTtcclxuXHRcdFx0bWV0YWRhdGEuZGF0ZVN0cmluZyA9IGRhdGUudG9EYXRlU3RyaW5nKCk7XHJcblxyXG5cdFx0XHRjb25zdCByZW5kZXJlciA9IG5ldyBtYXJrZWQuUmVuZGVyZXIoKTtcclxuXHJcblx0XHRcdHJlbmRlcmVyLmxpbmsgPSBsaW5rX3JlbmRlcmVyO1xyXG5cclxuXHRcdFx0cmVuZGVyZXIuY29kZSA9IGhpZ2hsaWdodDtcclxuXHJcblx0XHRcdHJlbmRlcmVyLmhlYWRpbmcgPSAodGV4dCwgbGV2ZWwsIHJhd3RleHQpID0+IHtcclxuXHRcdFx0XHRjb25zdCBmcmFnbWVudCA9IG1ha2VTbHVnKHJhd3RleHQpO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gYFxyXG5cdFx0XHRcdFx0PGgke2xldmVsfT5cclxuXHRcdFx0XHRcdFx0PHNwYW4gaWQ9XCIke2ZyYWdtZW50fVwiIGNsYXNzPVwib2Zmc2V0LWFuY2hvclwiPjwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0PGEgaHJlZj1cImJsb2cvJHtzbHVnfSMke2ZyYWdtZW50fVwiIGNsYXNzPVwiYW5jaG9yXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9hPlxyXG5cdFx0XHRcdFx0XHQke3RleHR9XHJcblx0XHRcdFx0XHQ8L2gke2xldmVsfT5gO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0Y29uc3QgaHRtbCA9IG1hcmtlZChcclxuXHRcdFx0XHRjb250ZW50LnJlcGxhY2UoL15cXHQrL2dtLCBtYXRjaCA9PiBtYXRjaC5zcGxpdCgnXFx0Jykuam9pbignICAnKSksXHJcblx0XHRcdFx0eyByZW5kZXJlciB9XHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdGh0bWwsXHJcblx0XHRcdFx0bWV0YWRhdGEsXHJcblx0XHRcdFx0c2x1Z1xyXG5cdFx0XHR9O1xyXG5cdFx0fSlcclxuXHRcdC5zb3J0KChhLCBiKSA9PiBhLm1ldGFkYXRhLnB1YmRhdGUgPCBiLm1ldGFkYXRhLnB1YmRhdGUgPyAxIDogLTEpO1xyXG59XHJcbiIsImltcG9ydCBzZW5kIGZyb20gJ0Bwb2xrYS9zZW5kJztcclxuaW1wb3J0IGdldF9wb3N0cyBmcm9tICcuL19wb3N0cy5qcyc7XHJcblxyXG5sZXQganNvbjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXQocmVxLCByZXMpIHtcclxuXHRpZiAoIWpzb24gfHwgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xyXG5cdFx0Y29uc3QgcG9zdHMgPSBnZXRfcG9zdHMoKVxyXG5cdFx0XHQuZmlsdGVyKHBvc3QgPT4gIXBvc3QubWV0YWRhdGEuZHJhZnQpXHJcblx0XHRcdC5tYXAocG9zdCA9PiB7XHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdHNsdWc6IHBvc3Quc2x1ZyxcclxuXHRcdFx0XHRcdG1ldGFkYXRhOiBwb3N0Lm1ldGFkYXRhXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0anNvbiA9IEpTT04uc3RyaW5naWZ5KHBvc3RzKTtcclxuXHR9XHJcblxyXG5cdHNlbmQocmVzLCAyMDAsIGpzb24sIHtcclxuXHRcdCdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcblx0XHQnQ2FjaGUtQ29udHJvbCc6IGBtYXgtYWdlPSR7NSAqIDYwICogMWUzfWAgLy8gNSBtaW51dGVzXHJcblx0fSk7XHJcbn1cclxuIiwiaW1wb3J0IHNlbmQgZnJvbSAnQHBvbGthL3NlbmQnO1xyXG5pbXBvcnQgZ2V0X3Bvc3RzIGZyb20gJy4uL2Jsb2cvX3Bvc3RzLmpzJztcclxuXHJcbmNvbnN0IG1vbnRocyA9ICcsSmFuLEZlYixNYXIsQXByLE1heSxKdW4sSnVsLEF1ZyxTZXAsT2N0LE5vdixEZWMnLnNwbGl0KCcsJyk7XHJcblxyXG5mdW5jdGlvbiBmb3JtYXRQdWJkYXRlKHN0cikge1xyXG5cdGNvbnN0IFt5LCBtLCBkXSA9IHN0ci5zcGxpdCgnLScpO1xyXG5cdHJldHVybiBgJHtkfSAke21vbnRoc1srbV19ICR7eX0gMTI6MDAgKzAwMDBgO1xyXG59XHJcblxyXG5jb25zdCByc3MgPSBgXHJcbjw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cIlVURi04XCIgPz5cclxuPHJzcyB2ZXJzaW9uPVwiMi4wXCI+XHJcblxyXG48Y2hhbm5lbD5cclxuXHQ8dGl0bGU+U3ZlbHRlIGJsb2c8L3RpdGxlPlxyXG5cdDxsaW5rPmh0dHBzOi8vc3ZlbHRlLmRldi9ibG9nPC9saW5rPlxyXG5cdDxkZXNjcmlwdGlvbj5OZXdzIGFuZCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbWFnaWNhbCBkaXNhcHBlYXJpbmcgVUkgZnJhbWV3b3JrPC9kZXNjcmlwdGlvbj5cclxuXHQ8aW1hZ2U+XHJcblx0XHQ8dXJsPmh0dHBzOi8vc3ZlbHRlLmRldi9mYXZpY29uLnBuZzwvdXJsPlxyXG5cdFx0PHRpdGxlPlN2ZWx0ZTwvdGl0bGU+XHJcblx0XHQ8bGluaz5odHRwczovL3N2ZWx0ZS5kZXYvYmxvZzwvbGluaz5cclxuXHQ8L2ltYWdlPlxyXG5cdCR7Z2V0X3Bvc3RzKCkuZmlsdGVyKHBvc3QgPT4gIXBvc3QubWV0YWRhdGEuZHJhZnQpLm1hcChwb3N0ID0+IGBcclxuXHRcdDxpdGVtPlxyXG5cdFx0XHQ8dGl0bGU+JHtwb3N0Lm1ldGFkYXRhLnRpdGxlfTwvdGl0bGU+XHJcblx0XHRcdDxsaW5rPmh0dHBzOi8vc3ZlbHRlLmRldi9ibG9nLyR7cG9zdC5zbHVnfTwvbGluaz5cclxuXHRcdFx0PGRlc2NyaXB0aW9uPiR7cG9zdC5tZXRhZGF0YS5kZXNjcmlwdGlvbn08L2Rlc2NyaXB0aW9uPlxyXG5cdFx0XHQ8cHViRGF0ZT4ke2Zvcm1hdFB1YmRhdGUocG9zdC5tZXRhZGF0YS5wdWJkYXRlKX08L3B1YkRhdGU+XHJcblx0XHQ8L2l0ZW0+XHJcblx0YCkuam9pbignJyl9XHJcbjwvY2hhbm5lbD5cclxuXHJcbjwvcnNzPlxyXG5gLnJlcGxhY2UoLz5bXlxcU10rL2dtLCAnPicpLnJlcGxhY2UoL1teXFxTXSs8L2dtLCAnPCcpLnRyaW0oKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXQocmVxLCByZXMpIHtcclxuXHRzZW5kKHJlcywgMjAwLCByc3MsIHtcclxuXHRcdCdDYWNoZS1Db250cm9sJzogYG1heC1hZ2U9JHszMCAqIDYwICogMWUzfWAsXHJcblx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3Jzcyt4bWwnXHJcblx0fSk7XHJcbn1cclxuIiwiaW1wb3J0IHNlbmQgZnJvbSAnQHBvbGthL3NlbmQnO1xyXG5pbXBvcnQgZ2V0X3Bvc3RzIGZyb20gJy4vX3Bvc3RzLmpzJztcclxuXHJcbmxldCBsb29rdXA7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XHJcblx0aWYgKCFsb29rdXAgfHwgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xyXG5cdFx0bG9va3VwID0gbmV3IE1hcCgpO1xyXG5cdFx0Z2V0X3Bvc3RzKCkuZm9yRWFjaChwb3N0ID0+IHtcclxuXHRcdFx0bG9va3VwLnNldChwb3N0LnNsdWcsIHBvc3QpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjb25zdCBwb3N0ID0gbG9va3VwLmdldChyZXEucGFyYW1zLnNsdWcpO1xyXG5cclxuXHRpZiAocG9zdCkge1xyXG5cdFx0cmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsIGBtYXgtYWdlPSR7NSAqIDYwICogMWUzfWApOyAvLyA1IG1pbnV0ZXNcclxuXHRcdHNlbmQocmVzLCAyMDAsIHBvc3QpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRzZW5kKHJlcywgNDA0LCB7IG1lc3NhZ2U6ICdub3QgZm91bmQnIH0pO1xyXG5cdH1cclxufVxyXG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XHJcblx0cmVzLndyaXRlSGVhZCgzMDIsIHsgTG9jYXRpb246ICdodHRwczovL2Rpc2NvcmQuZ2cveXk3NURLcycgfSk7XHJcblx0cmVzLmVuZCgpO1xyXG59IiwiaW1wb3J0IHNsdWdpZnkgZnJvbSAnQHNpbmRyZXNvcmh1cy9zbHVnaWZ5JztcclxuXHJcbmV4cG9ydCBjb25zdCBTTFVHX1BSRVNFUlZFX1VOSUNPREUgPSBmYWxzZTtcclxuZXhwb3J0IGNvbnN0IFNMVUdfU0VQQVJBVE9SID0gJ18nO1xyXG5cclxuLyogdXJsLXNhZmUgcHJvY2Vzc29yICovXHJcblxyXG5leHBvcnQgY29uc3QgdXJsc2FmZVNsdWdQcm9jZXNzb3IgPSAoc3RyaW5nLCBvcHRzKSA9PiB7XHJcblx0Y29uc3QgeyBzZXBhcmF0b3IgPSBTTFVHX1NFUEFSQVRPUiB9ID0gb3B0cyB8fCB7fTtcclxuXHJcblx0cmV0dXJuIHNsdWdpZnkoc3RyaW5nLCB7XHJcblx0XHRjdXN0b21SZXBsYWNlbWVudHM6IFtcdC8vIHJ1bnMgYmVmb3JlIGFueSBvdGhlciB0cmFuc2Zvcm1hdGlvbnNcclxuXHRcdFx0WyckJywgJ0RPTExBUiddLCAvLyBgJGRlc3Ryb3lgICYgY29cclxuXHRcdFx0WyctJywgJ0RBU0gnXSwgLy8gY29uZmxpY3RzIHdpdGggYHNlcGFyYXRvcmBcclxuXHRcdF0sXHJcblx0XHRzZXBhcmF0b3IsXHJcblx0XHRkZWNhbWVsaXplOiBmYWxzZSxcclxuXHRcdGxvd2VyY2FzZTogZmFsc2VcclxuXHR9KVxyXG5cdC5yZXBsYWNlKC9ET0xMQVIvZywgJyQnKVxyXG5cdC5yZXBsYWNlKC9EQVNIL2csICctJyk7XHJcbn1cclxuXHJcbi8qIHVuaWNvZGUtcHJlc2VydmVyIHByb2Nlc3NvciAqL1xyXG5cclxuY29uc3QgYWxwaGFOdW1SZWdleCA9IC9bYS16QS1aMC05XS87XHJcbmNvbnN0IHVuaWNvZGVSZWdleCA9IC9cXHB7TGV0dGVyfS91O1xyXG5jb25zdCBpc05vbkFscGhhTnVtVW5pY29kZSA9XHJcblx0c3RyaW5nID0+ICFhbHBoYU51bVJlZ2V4LnRlc3Qoc3RyaW5nKSAmJiB1bmljb2RlUmVnZXgudGVzdChzdHJpbmcpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHVuaWNvZGVTYWZlUHJvY2Vzc29yID0gKHN0cmluZywgb3B0cykgPT4ge1xyXG5cdGNvbnN0IHsgc2VwYXJhdG9yID0gU0xVR19TRVBBUkFUT1IgfSA9IG9wdHMgfHwge307XHJcblxyXG5cdHJldHVybiBzdHJpbmcuc3BsaXQoJycpXHJcblx0LnJlZHVjZSgoYWNjdW0sIGNoYXIsIGluZGV4LCBhcnJheSkgPT4ge1xyXG5cdFx0Y29uc3QgdHlwZSA9IGlzTm9uQWxwaGFOdW1Vbmljb2RlKGNoYXIpID8gJ3Bhc3MnIDogJ3Byb2Nlc3MnO1xyXG5cclxuXHRcdGlmIChpbmRleCA9PT0gMCkge1xyXG5cdFx0XHRhY2N1bS5jdXJyZW50ID0ge3R5cGUsIHN0cmluZzogY2hhcn07XHJcblx0XHR9IGVsc2UgaWYgKHR5cGUgPT09IGFjY3VtLmN1cnJlbnQudHlwZSkge1xyXG5cdFx0XHRhY2N1bS5jdXJyZW50LnN0cmluZyArPSBjaGFyO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YWNjdW0uY2h1bmtzLnB1c2goYWNjdW0uY3VycmVudCk7XHJcblx0XHRcdGFjY3VtLmN1cnJlbnQgPSB7dHlwZSwgc3RyaW5nOiBjaGFyfVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChpbmRleCA9PT0gYXJyYXkubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRhY2N1bS5jaHVua3MucHVzaChhY2N1bS5jdXJyZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYWNjdW07XHJcblx0fSwge2NodW5rczogW10sIGN1cnJlbnQ6IHt0eXBlOiAnJywgc3RyaW5nOiAnJ319KVxyXG5cdC5jaHVua3NcclxuXHQucmVkdWNlKChhY2N1bSwgY2h1bmspID0+IHtcclxuXHRcdGNvbnN0IHByb2Nlc3NlZCA9IGNodW5rLnR5cGUgPT09ICdwcm9jZXNzJ1xyXG5cdFx0XHQ/IHVybHNhZmVTbHVnUHJvY2Vzc29yKGNodW5rLnN0cmluZylcclxuXHRcdFx0OiBjaHVuay5zdHJpbmc7XHJcblxyXG5cdFx0cHJvY2Vzc2VkLmxlbmd0aCA+IDAgJiYgYWNjdW0ucHVzaChwcm9jZXNzZWQpO1xyXG5cclxuXHRcdHJldHVybiBhY2N1bTtcclxuXHR9LCBbXSlcclxuXHQuam9pbihzZXBhcmF0b3IpO1xyXG59XHJcblxyXG4vKiBzZXNzaW9uIHByb2Nlc3NvciAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IG1ha2Vfc2Vzc2lvbl9zbHVnX3Byb2Nlc3NvciA9ICh7XHJcblx0cHJlc2VydmVfdW5pY29kZSA9IFNMVUdfUFJFU0VSVkVfVU5JQ09ERSxcclxuXHRzZXBhcmF0b3IgPSBTTFVHX1NFUEFSQVRPUlxyXG59KSA9PiB7XHJcblx0Y29uc3QgcHJvY2Vzc29yID0gcHJlc2VydmVfdW5pY29kZSA/IHVuaWNvZGVTYWZlUHJvY2Vzc29yIDogdXJsc2FmZVNsdWdQcm9jZXNzb3I7XHJcblx0Y29uc3Qgc2VlbiA9IG5ldyBTZXQoKTtcclxuXHJcblx0cmV0dXJuIHN0cmluZyA9PiB7XHJcblx0XHRjb25zdCBzbHVnID0gcHJvY2Vzc29yKHN0cmluZywgeyBzZXBhcmF0b3IgfSk7XHJcblxyXG5cdFx0aWYgKHNlZW4uaGFzKHNsdWcpKSB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBzbHVnICR7c2x1Z31gKTtcclxuXHRcdHNlZW4uYWRkKHNsdWcpO1xyXG5cclxuXHRcdHJldHVybiBzbHVnO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgU0xVR19QUkVTRVJWRV9VTklDT0RFLCBTTFVHX1NFUEFSQVRPUiB9IGZyb20gJy4uLy4uLy4uL2NvbmZpZyc7XHJcbmltcG9ydCB7IGV4dHJhY3RfZnJvbnRtYXR0ZXIsIGV4dHJhY3RfbWV0YWRhdGEsIGxpbmtfcmVuZGVyZXIgfSBmcm9tICdAc3ZlbHRlanMvc2l0ZS1raXQvdXRpbHMvbWFya2Rvd24uanMnO1xyXG5pbXBvcnQgeyBtYWtlX3Nlc3Npb25fc2x1Z19wcm9jZXNzb3IgfSBmcm9tICdAc3ZlbHRlanMvc2l0ZS1raXQvdXRpbHMvc2x1Zyc7XHJcbmltcG9ydCB7IGhpZ2hsaWdodCB9IGZyb20gJy4uLy4uL3V0aWxzL2hpZ2hsaWdodCc7XHJcbmltcG9ydCBtYXJrZWQgZnJvbSAnbWFya2VkJztcclxuXHJcbmNvbnN0IGJsb2NrVHlwZXMgPSBbXHJcblx0J2Jsb2NrcXVvdGUnLFxyXG5cdCdodG1sJyxcclxuXHQnaGVhZGluZycsXHJcblx0J2hyJyxcclxuXHQnbGlzdCcsXHJcblx0J2xpc3RpdGVtJyxcclxuXHQncGFyYWdyYXBoJyxcclxuXHQndGFibGUnLFxyXG5cdCd0YWJsZXJvdycsXHJcblx0J3RhYmxlY2VsbCdcclxuXTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xyXG5cdGNvbnN0IG1ha2Vfc2x1ZyA9IG1ha2Vfc2Vzc2lvbl9zbHVnX3Byb2Nlc3Nvcih7XHJcblx0XHRwcmVzZXJ2ZV91bmljb2RlOiBTTFVHX1BSRVNFUlZFX1VOSUNPREUsXHJcblx0XHRzZXBhcmF0b3I6IFNMVUdfU0VQQVJBVE9SXHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBmc1xyXG5cdFx0LnJlYWRkaXJTeW5jKGBjb250ZW50L2RvY3NgKVxyXG5cdFx0LmZpbHRlcihmaWxlID0+IGZpbGVbMF0gIT09ICcuJyAmJiBwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcubWQnKVxyXG5cdFx0Lm1hcChmaWxlID0+IHtcclxuXHRcdFx0Y29uc3QgbWFya2Rvd24gPSBmcy5yZWFkRmlsZVN5bmMoYGNvbnRlbnQvZG9jcy8ke2ZpbGV9YCwgJ3V0Zi04Jyk7XHJcblxyXG5cdFx0XHRjb25zdCB7IGNvbnRlbnQsIG1ldGFkYXRhIH0gPSBleHRyYWN0X2Zyb250bWF0dGVyKG1hcmtkb3duKTtcclxuXHJcblx0XHRcdGNvbnN0IHNlY3Rpb25fc2x1ZyA9IG1ha2Vfc2x1ZyhtZXRhZGF0YS50aXRsZSk7XHJcblxyXG5cdFx0XHRjb25zdCBzdWJzZWN0aW9ucyA9IFtdO1xyXG5cclxuXHRcdFx0Y29uc3QgcmVuZGVyZXIgPSBuZXcgbWFya2VkLlJlbmRlcmVyKCk7XHJcblxyXG5cdFx0XHRsZXQgYmxvY2tfb3BlbiA9IGZhbHNlO1xyXG5cclxuXHRcdFx0cmVuZGVyZXIubGluayA9IGxpbmtfcmVuZGVyZXI7XHJcblxyXG5cdFx0XHRyZW5kZXJlci5ociA9ICgpID0+IHtcclxuXHRcdFx0XHRibG9ja19vcGVuID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0cmV0dXJuICc8ZGl2IGNsYXNzPVwic2lkZS1ieS1zaWRlXCI+PGRpdiBjbGFzcz1cImNvcHlcIj4nO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0cmVuZGVyZXIuY29kZSA9IChzb3VyY2UsIGxhbmcpID0+IHtcclxuXHRcdFx0XHRzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSgvXiArL2dtLCBtYXRjaCA9PlxyXG5cdFx0XHRcdFx0bWF0Y2guc3BsaXQoJyAgICAnKS5qb2luKCdcXHQnKVxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdGNvbnN0IGxpbmVzID0gc291cmNlLnNwbGl0KCdcXG4nKTtcclxuXHJcblx0XHRcdFx0Y29uc3QgbWV0YSA9IGV4dHJhY3RfbWV0YWRhdGEobGluZXNbMF0sIGxhbmcpO1xyXG5cclxuXHRcdFx0XHRsZXQgcHJlZml4ID0gJyc7XHJcblx0XHRcdFx0bGV0IGNsYXNzTmFtZSA9ICdjb2RlLWJsb2NrJztcclxuXHJcblx0XHRcdFx0aWYgKG1ldGEpIHtcclxuXHRcdFx0XHRcdHNvdXJjZSA9IGxpbmVzLnNsaWNlKDEpLmpvaW4oJ1xcbicpO1xyXG5cdFx0XHRcdFx0Y29uc3QgZmlsZW5hbWUgPSBtZXRhLmZpbGVuYW1lIHx8IChsYW5nID09PSAnaHRtbCcgJiYgJ0FwcC5zdmVsdGUnKTtcclxuXHRcdFx0XHRcdGlmIChmaWxlbmFtZSkge1xyXG5cdFx0XHRcdFx0XHRwcmVmaXggPSBgPHNwYW4gY2xhc3M9J2ZpbGVuYW1lJz4ke3ByZWZpeH0gJHtmaWxlbmFtZX08L3NwYW4+YDtcclxuXHRcdFx0XHRcdFx0Y2xhc3NOYW1lICs9ICcgbmFtZWQnO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKG1ldGEgJiYgbWV0YS5oaWRkZW4pIHJldHVybiAnJztcclxuXHJcblx0XHRcdFx0Y29uc3QgaHRtbCA9IGA8ZGl2IGNsYXNzPScke2NsYXNzTmFtZX0nPiR7cHJlZml4fSR7aGlnaGxpZ2h0KHNvdXJjZSwgbGFuZyl9PC9kaXY+YDtcclxuXHJcblx0XHRcdFx0aWYgKGJsb2NrX29wZW4pIHtcclxuXHRcdFx0XHRcdGJsb2NrX29wZW4gPSBmYWxzZTtcclxuXHRcdFx0XHRcdHJldHVybiBgPC9kaXY+PGRpdiBjbGFzcz1cImNvZGVcIj4ke2h0bWx9PC9kaXY+PC9kaXY+YDtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBodG1sO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0cmVuZGVyZXIuaGVhZGluZyA9ICh0ZXh0LCBsZXZlbCwgcmF3dGV4dCkgPT4ge1xyXG5cdFx0XHRcdGxldCBzbHVnO1xyXG5cclxuXHRcdFx0XHRjb25zdCBtYXRjaCA9IC88YSBocmVmPVwiKFteXCJdKylcIj4oLispPFxcL2E+Ly5leGVjKHRleHQpO1xyXG5cdFx0XHRcdGlmIChtYXRjaCkge1xyXG5cdFx0XHRcdFx0c2x1ZyA9IG1hdGNoWzFdO1xyXG5cdFx0XHRcdFx0dGV4dCA9IG1hdGNoWzJdO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRzbHVnID0gbWFrZV9zbHVnKHJhd3RleHQpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGxldmVsID09PSAzIHx8IGxldmVsID09PSA0KSB7XHJcblx0XHRcdFx0XHRjb25zdCB0aXRsZSA9IHRleHRcclxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLzxcXC8/Y29kZT4vZywgJycpXHJcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXC4oXFx3KykoXFwoKC4rKT9cXCkpPy8sIChtLCAkMSwgJDIsICQzKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCQzKSByZXR1cm4gYC4keyQxfSguLi4pYDtcclxuXHRcdFx0XHRcdFx0XHRpZiAoJDIpIHJldHVybiBgLiR7JDF9KClgO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBgLiR7JDF9YDtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0c3Vic2VjdGlvbnMucHVzaCh7IHNsdWcsIHRpdGxlLCBsZXZlbCB9KTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBgXHJcblx0XHRcdFx0XHQ8aCR7bGV2ZWx9PlxyXG5cdFx0XHRcdFx0XHQ8c3BhbiBpZD1cIiR7c2x1Z31cIiBjbGFzcz1cIm9mZnNldC1hbmNob3JcIiAke2xldmVsID4gNCA/ICdkYXRhLXNjcm9sbGlnbm9yZScgOiAnJ30+PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHQ8YSBocmVmPVwiZG9jcyMke3NsdWd9XCIgY2xhc3M9XCJhbmNob3JcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2E+XHJcblx0XHRcdFx0XHRcdCR7dGV4dH1cclxuXHRcdFx0XHRcdDwvaCR7bGV2ZWx9PmA7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRibG9ja1R5cGVzLmZvckVhY2godHlwZSA9PiB7XHJcblx0XHRcdFx0Y29uc3QgZm4gPSByZW5kZXJlclt0eXBlXTtcclxuXHRcdFx0XHRyZW5kZXJlclt0eXBlXSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRjb25zdCBodG1sID0gbWFya2VkKGNvbnRlbnQsIHsgcmVuZGVyZXIgfSk7XHJcblxyXG5cdFx0XHRjb25zdCBoYXNoZXMgPSB7fTtcclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0aHRtbDogaHRtbC5yZXBsYWNlKC9AQChcXGQrKS9nLCAobSwgaWQpID0+IGhhc2hlc1tpZF0gfHwgbSksXHJcblx0XHRcdFx0bWV0YWRhdGEsXHJcblx0XHRcdFx0c3Vic2VjdGlvbnMsXHJcblx0XHRcdFx0c2x1Zzogc2VjdGlvbl9zbHVnLFxyXG5cdFx0XHRcdGZpbGUsXHJcblx0XHRcdH07XHJcblx0XHR9KTtcclxufVxyXG4iLCJpbXBvcnQgc2VuZCBmcm9tICdAcG9sa2Evc2VuZCc7XHJcbmltcG9ydCBnZXRfc2VjdGlvbnMgZnJvbSAnLi9fc2VjdGlvbnMuanMnO1xyXG5cclxubGV0IGpzb247XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XHJcblx0aWYgKCFqc29uIHx8IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcclxuXHRcdGpzb24gPSBnZXRfc2VjdGlvbnMoKTtcclxuXHR9XHJcblxyXG5cdHNlbmQocmVzLCAyMDAsIGpzb24pO1xyXG59XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJvZHkocmVxKSB7XHJcblx0cmV0dXJuIG5ldyBQcm9taXNlKChmdWxmaWwsIHJlamVjdCkgPT4ge1xyXG5cdFx0bGV0IHN0ciA9ICcnO1xyXG5cclxuXHRcdHJlcS5vbignZXJyb3InLCByZWplY3QpO1xyXG5cclxuXHRcdHJlcS5vbignZGF0YScsIGNodW5rID0+IHtcclxuXHRcdFx0c3RyICs9IGNodW5rO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmVxLm9uKCdlbmQnLCAoKSA9PiB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0ZnVsZmlsKEpTT04ucGFyc2Uoc3RyKSk7XHJcblx0XHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9KTtcclxufSIsImltcG9ydCBzZW5kIGZyb20gJ0Bwb2xrYS9zZW5kJztcclxuaW1wb3J0IGJvZHkgZnJvbSAnLi9fdXRpbHMvYm9keS5qcyc7XHJcbmltcG9ydCB7IHF1ZXJ5IH0gZnJvbSAnLi4vLi4vdXRpbHMvZGInO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3QocmVxLCByZXMpIHtcclxuXHRjb25zdCB7IHVzZXIgfSA9IHJlcTtcclxuXHRpZiAoIXVzZXIpIHJldHVybjsgLy8gcmVzcG9uc2UgYWxyZWFkeSBzZW50XHJcblxyXG5cdHRyeSB7XHJcblx0XHRjb25zdCB7IG5hbWUsIGZpbGVzIH0gPSBhd2FpdCBib2R5KHJlcSk7XHJcblxyXG5cdFx0Y29uc3QgW3Jvd10gPSBhd2FpdCBxdWVyeShgXHJcblx0XHRcdGluc2VydCBpbnRvIGdpc3RzKHVzZXJfaWQsIG5hbWUsIGZpbGVzKVxyXG5cdFx0XHR2YWx1ZXMgKCQxLCAkMiwgJDMpIHJldHVybmluZyAqYCwgW3VzZXIuaWQsIG5hbWUsIEpTT04uc3RyaW5naWZ5KGZpbGVzKV0pO1xyXG5cclxuXHRcdHNlbmQocmVzLCAyMDEsIHtcclxuXHRcdFx0dWlkOiByb3cudWlkLnJlcGxhY2UoLy0vZywgJycpLFxyXG5cdFx0XHRuYW1lOiByb3cubmFtZSxcclxuXHRcdFx0ZmlsZXM6IHJvdy5maWxlcyxcclxuXHRcdFx0b3duZXI6IHVzZXIudWlkLFxyXG5cdFx0fSk7XHJcblx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRzZW5kKHJlcywgNTAwLCB7XHJcblx0XHRcdGVycm9yOiBlcnIubWVzc2FnZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IGNyZWF0ZVJlYWRTdHJlYW0gfSBmcm9tICdmcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XHJcblx0Y29uc3QgcGF0aCA9IHJlcS5wYXJhbXMuZmlsZS5qb2luKCcvJyk7XHJcblx0aWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAnZGV2ZWxvcG1lbnQnIHx8ICgnLycgKyBwYXRoKS5pbmNsdWRlcygnLy4nKSkge1xyXG5cdFx0cmVzLndyaXRlSGVhZCg0MDMpO1xyXG5cdFx0cmVzLmVuZCgpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRjcmVhdGVSZWFkU3RyZWFtKCcuLi8nICsgcGF0aClcclxuXHRcdC5vbignZXJyb3InLCAoKSA9PiB7XHJcblx0XHRcdHJlcy53cml0ZUhlYWQoNDAzKTtcclxuXHRcdFx0cmVzLmVuZCgpO1xyXG5cdFx0fSlcclxuXHRcdC5waXBlKHJlcyk7XHJcblx0cmVzLndyaXRlSGVhZCgyMDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2phdmFzY3JpcHQnIH0pO1xyXG59XHJcbiIsImltcG9ydCBzZW5kIGZyb20gJ0Bwb2xrYS9zZW5kJztcclxuaW1wb3J0IGJvZHkgZnJvbSAnLi4vX3V0aWxzL2JvZHkuanMnO1xyXG5pbXBvcnQgKiBhcyBodHRwaWUgZnJvbSAnaHR0cGllJztcclxuaW1wb3J0IHsgcXVlcnksIGZpbmQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9kYic7XHJcbmltcG9ydCB7IGdldF9leGFtcGxlIH0gZnJvbSAnLi4vLi4vZXhhbXBsZXMvX2V4YW1wbGVzLmpzJztcclxuXHJcbmNvbnN0IHsgR0lUSFVCX0NMSUVOVF9JRCwgR0lUSFVCX0NMSUVOVF9TRUNSRVQgfSA9IHByb2Nlc3MuZW52O1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0X2dpc3QocmVxLCByZXMpIHtcclxuXHRjb25zdCBiYXNlID0gYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vZ2lzdHMvJHtyZXEucGFyYW1zLmlkfWA7XHJcblx0Y29uc3QgdXJsID0gYCR7YmFzZX0/Y2xpZW50X2lkPSR7R0lUSFVCX0NMSUVOVF9JRH0mY2xpZW50X3NlY3JldD0ke0dJVEhVQl9DTElFTlRfU0VDUkVUfWA7XHJcblxyXG5cdHRyeSB7XHJcblx0XHRjb25zdCB7IGRhdGEgfSA9IGF3YWl0IGh0dHBpZS5nZXQodXJsLCB7XHJcblx0XHRcdGhlYWRlcnM6IHtcclxuXHRcdFx0XHQnVXNlci1BZ2VudCc6ICdodHRwczovL3N2ZWx0ZS5kZXYnXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGNyZWF0ZSBvd25lciBpZiBuZWNlc3NhcnkuLi5cclxuXHRcdGxldCB1c2VyID0gYXdhaXQgZmluZChgc2VsZWN0ICogZnJvbSB1c2VycyB3aGVyZSB1aWQgPSAkMWAsIFtkYXRhLm93bmVyLmlkXSk7XHJcblxyXG5cdFx0aWYgKCF1c2VyKSB7XHJcblx0XHRcdGNvbnN0IHsgaWQsIG5hbWUsIGxvZ2luLCBhdmF0YXJfdXJsIH0gPSBkYXRhLm93bmVyO1xyXG5cclxuXHRcdFx0dXNlciA9IGF3YWl0IGZpbmQoYFxyXG5cdFx0XHRcdGluc2VydCBpbnRvIHVzZXJzKHVpZCwgbmFtZSwgdXNlcm5hbWUsIGF2YXRhcilcclxuXHRcdFx0XHR2YWx1ZXMgKCQxLCAkMiwgJDMsICQ0KVxyXG5cdFx0XHRcdHJldHVybmluZyAqXHJcblx0XHRcdGAsIFtpZCwgbmFtZSwgbG9naW4sIGF2YXRhcl91cmxdKTtcclxuXHRcdH1cclxuXHJcblx0XHRkZWxldGUgZGF0YS5maWxlc1snUkVBRE1FLm1kJ107XHJcblx0XHRkZWxldGUgZGF0YS5maWxlc1snbWV0YS5qc29uJ107XHJcblxyXG5cdFx0Y29uc3QgZmlsZXMgPSBPYmplY3Qua2V5cyhkYXRhLmZpbGVzKS5tYXAoa2V5ID0+IHtcclxuXHRcdFx0Y29uc3QgbmFtZSA9IGtleS5yZXBsYWNlKC9cXC5odG1sJC8sICcuc3ZlbHRlJyk7XHJcblxyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdG5hbWUsXHJcblx0XHRcdFx0c291cmNlOiBkYXRhLmZpbGVzW2tleV0uY29udGVudFxyXG5cdFx0XHR9O1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gYWRkIGdpc3QgdG8gZGF0YWJhc2UuLi5cclxuXHRcdGF3YWl0IHF1ZXJ5KGBcclxuXHRcdFx0aW5zZXJ0IGludG8gZ2lzdHModWlkLCB1c2VyX2lkLCBuYW1lLCBmaWxlcylcclxuXHRcdFx0dmFsdWVzICgkMSwgJDIsICQzLCAkNClcclxuXHRcdGAsIFtyZXEucGFyYW1zLmlkLCB1c2VyLmlkLCBkYXRhLmRlc2NyaXB0aW9uLCBKU09OLnN0cmluZ2lmeShmaWxlcyldKTtcclxuXHJcblx0XHRzZW5kKHJlcywgMjAwLCB7XHJcblx0XHRcdHVpZDogcmVxLnBhcmFtcy5pZCxcclxuXHRcdFx0bmFtZTogZGF0YS5kZXNjcmlwdGlvbixcclxuXHRcdFx0ZmlsZXMsXHJcblx0XHRcdG93bmVyOiBkYXRhLm93bmVyLmlkXHJcblx0XHR9KTtcclxuXHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdHNlbmQocmVzLCBlcnIuc3RhdHVzQ29kZSwgeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0KHJlcSwgcmVzKSB7XHJcblx0Ly8gaXMgdGhpcyBhbiBleGFtcGxlP1xyXG5cdGNvbnN0IGV4YW1wbGUgPSBnZXRfZXhhbXBsZShyZXEucGFyYW1zLmlkKTtcclxuXHJcblx0aWYgKGV4YW1wbGUpIHtcclxuXHRcdHJldHVybiBzZW5kKHJlcywgMjAwLCB7XHJcblx0XHRcdHJlbGF4ZWQ6IHRydWUsXHJcblx0XHRcdHVpZDogcmVxLnBhcmFtcy5pZCxcclxuXHRcdFx0bmFtZTogZXhhbXBsZS50aXRsZSxcclxuXHRcdFx0ZmlsZXM6IGV4YW1wbGUuZmlsZXMsXHJcblx0XHRcdG93bmVyOiBudWxsXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xyXG5cdFx0Ly8gSW4gZGV2LCBwcm94eSByZXF1ZXN0cyB0byBsb2FkIHBhcnRpY3VsYXIgUkVQTHMgdG8gdGhlIHJlYWwgc2VydmVyLlxyXG5cdFx0Ly8gVGhpcyBhdm9pZHMgbmVlZGluZyB0byBjb25uZWN0IHRvIHRoZSByZWFsIGRhdGFiYXNlIHNlcnZlci5cclxuXHRcdHJlcS5waXBlKFxyXG5cdFx0XHRyZXF1aXJlKCdodHRwcycpLnJlcXVlc3QoeyBob3N0OiAnc3ZlbHRlLmRldicsIHBhdGg6IHJlcS51cmwgfSlcclxuXHRcdCkub25jZSgncmVzcG9uc2UnLCByZXNfcHJveHkgPT4ge1xyXG5cdFx0XHRyZXNfcHJveHkucGlwZShyZXMpO1xyXG5cdFx0XHRyZXMud3JpdGVIZWFkKHJlc19wcm94eS5zdGF0dXNDb2RlLCByZXNfcHJveHkuaGVhZGVycyk7XHJcblx0XHR9KS5vbmNlKCdlcnJvcicsICgpID0+IHJlcy5lbmQoKSk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHRjb25zdCBbcm93XSA9IGF3YWl0IHF1ZXJ5KGBcclxuXHRcdHNlbGVjdCBnLiosIHUudWlkIGFzIG93bmVyIGZyb20gZ2lzdHMgZ1xyXG5cdFx0bGVmdCBqb2luIHVzZXJzIHUgb24gZy51c2VyX2lkID0gdS5pZFxyXG5cdFx0d2hlcmUgZy51aWQgPSAkMSBsaW1pdCAxXHJcblx0YCwgW3JlcS5wYXJhbXMuaWRdKTsgLy8gdmlhIGZpbGVuYW1lIHBhdHRlcm5cclxuXHJcblx0aWYgKCFyb3cpIHtcclxuXHRcdHJldHVybiBpbXBvcnRfZ2lzdChyZXEsIHJlcyk7XHJcblx0fVxyXG5cclxuXHRzZW5kKHJlcywgMjAwLCB7XHJcblx0XHR1aWQ6IHJvdy51aWQucmVwbGFjZSgvLS9nLCAnJyksXHJcblx0XHRuYW1lOiByb3cubmFtZSxcclxuXHRcdGZpbGVzOiByb3cuZmlsZXMsXHJcblx0XHRvd25lcjogcm93Lm93bmVyXHJcblx0fSk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwYXRjaChyZXEsIHJlcykge1xyXG5cdGNvbnN0IHsgdXNlciB9ID0gcmVxO1xyXG5cdGlmICghdXNlcikgcmV0dXJuO1xyXG5cclxuXHRsZXQgaWQ7XHJcblx0Y29uc3QgdWlkID0gcmVxLnBhcmFtcy5pZDtcclxuXHJcblx0dHJ5IHtcclxuXHRcdGNvbnN0IFtyb3ddID0gYXdhaXQgcXVlcnkoYHNlbGVjdCAqIGZyb20gZ2lzdHMgd2hlcmUgdWlkID0gJDEgbGltaXQgMWAsIFt1aWRdKTtcclxuXHRcdGlmICghcm93KSByZXR1cm4gc2VuZChyZXMsIDQwNCwgeyBlcnJvcjogJ0dpc3Qgbm90IGZvdW5kJyB9KTtcclxuXHRcdGlmIChyb3cudXNlcl9pZCAhPT0gdXNlci5pZCkgcmV0dXJuIHNlbmQocmVzLCA0MDMsIHsgZXJyb3I6ICdJdGVtIGRvZXMgbm90IGJlbG9uZyB0byB5b3UnIH0pO1xyXG5cdFx0aWQgPSByb3cuaWQ7XHJcblx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRjb25zb2xlLmVycm9yKCdQQVRDSCAvZ2lzdHMgQCBzZWxlY3QnLCBlcnIpO1xyXG5cdFx0cmV0dXJuIHNlbmQocmVzLCA1MDApO1xyXG5cdH1cclxuXHJcblx0dHJ5IHtcclxuXHRcdGNvbnN0IG9iaiA9IGF3YWl0IGJvZHkocmVxKTtcclxuXHRcdG9iai51cGRhdGVkX2F0ID0gJ25vdygpJztcclxuXHRcdGxldCBrO1xyXG5cdFx0Y29uc3QgY29scyA9IFtdO1xyXG5cdFx0Y29uc3QgdmFscyA9IFtdO1xyXG5cdFx0Zm9yIChrIGluIG9iaikge1xyXG5cdFx0XHRjb2xzLnB1c2goayk7XHJcblx0XHRcdHZhbHMucHVzaChrID09PSAnZmlsZXMnID8gSlNPTi5zdHJpbmdpZnkob2JqW2tdKSA6IG9ialtrXSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgdG1wID0gdmFscy5tYXAoKHgsIGkpID0+IGAkJHtpICsgMX1gKS5qb2luKCcsJyk7XHJcblx0XHRjb25zdCBzZXQgPSBgc2V0ICgke2NvbHMuam9pbignLCcpfSkgPSAoJHt0bXB9KWA7XHJcblxyXG5cdFx0Y29uc3QgW3Jvd10gPSBhd2FpdCBxdWVyeShgdXBkYXRlIGdpc3RzICR7c2V0fSB3aGVyZSBpZCA9ICR7aWR9IHJldHVybmluZyAqYCwgdmFscyk7XHJcblxyXG5cdFx0c2VuZChyZXMsIDIwMCwge1xyXG5cdFx0XHR1aWQ6IHJvdy51aWQucmVwbGFjZSgvLS9nLCAnJyksXHJcblx0XHRcdG5hbWU6IHJvdy5uYW1lLFxyXG5cdFx0XHRmaWxlczogcm93LmZpbGVzLFxyXG5cdFx0XHRvd25lcjogdXNlci51aWQsXHJcblx0XHR9KTtcclxuXHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdGNvbnNvbGUuZXJyb3IoJ1BBVENIIC9naXN0cyBAIHVwZGF0ZScsIGVycik7XHJcblx0XHRzZW5kKHJlcywgNTAwLCB7IGVycm9yOiBlcnIubWVzc2FnZSB9KTtcclxuXHR9XHJcbn1cclxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldChyZXEsIHJlcykge1xyXG5cdHJlcy53cml0ZUhlYWQoMzAyLCB7IExvY2F0aW9uOiAnaHR0cHM6Ly9naXRodWIuY29tL3N2ZWx0ZWpzL3N2ZWx0ZS93aWtpL0ZBUScgfSk7XHJcblx0cmVzLmVuZCgpO1xyXG59IiwiLy8gVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBieSBTYXBwZXIg4oCUIGRvIG5vdCBlZGl0IGl0IVxuaW1wb3J0ICogYXMgcm91dGVfMCBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2V4YW1wbGVzL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzEgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9leGFtcGxlcy9bc2x1Z10uanNvbi5qc1wiO1xuaW1wb3J0ICogYXMgcm91dGVfMiBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3R1dG9yaWFsL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzMgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy90dXRvcmlhbC9yYW5kb20tbnVtYmVyLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV80IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvdHV0b3JpYWwvW3NsdWddL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzUgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9hcHBzL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzYgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9hdXRoL2NhbGxiYWNrLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV83IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvYXV0aC9sb2dvdXQuanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzggZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9hdXRoL2xvZ2luLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV85IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvYmxvZy9pbmRleC5qc29uLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV8xMCBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2Jsb2cvcnNzLnhtbC5qc1wiO1xuaW1wb3J0ICogYXMgcm91dGVfMTEgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9ibG9nL1tzbHVnXS5qc29uLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV8xMiBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2NoYXQuanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzEzIGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvZG9jcy9pbmRleC5qc29uLmpzXCI7XG5pbXBvcnQgKiBhcyByb3V0ZV8xNCBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3JlcGwvY3JlYXRlLmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzE1IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvcmVwbC9sb2NhbC9bLi4uZmlsZV0uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzE2IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvcmVwbC9baWRdL2luZGV4Lmpzb24uanNcIjtcbmltcG9ydCAqIGFzIHJvdXRlXzE3IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvZmFxLmpzXCI7XG5pbXBvcnQgY29tcG9uZW50XzAgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9pbmRleC5zdmVsdGVcIjtcbmltcG9ydCBjb21wb25lbnRfMSwgeyBwcmVsb2FkIGFzIHByZWxvYWRfMSB9IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvZXhhbXBsZXMvaW5kZXguc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzIsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzIgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3R1dG9yaWFsL19sYXlvdXQuc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzMsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzMgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3R1dG9yaWFsL2luZGV4LnN2ZWx0ZVwiO1xuaW1wb3J0IGNvbXBvbmVudF80LCB7IHByZWxvYWQgYXMgcHJlbG9hZF80IH0gZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy90dXRvcmlhbC9bc2x1Z10vaW5kZXguc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzUsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzUgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2FwcHMvaW5kZXguc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzYsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzYgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2Jsb2cvaW5kZXguc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzcsIHsgcHJlbG9hZCBhcyBwcmVsb2FkXzcgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL2Jsb2cvW3NsdWddLnN2ZWx0ZVwiO1xuaW1wb3J0IGNvbXBvbmVudF84LCB7IHByZWxvYWQgYXMgcHJlbG9hZF84IH0gZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9kb2NzL2luZGV4LnN2ZWx0ZVwiO1xuaW1wb3J0IGNvbXBvbmVudF85LCB7IHByZWxvYWQgYXMgcHJlbG9hZF85IH0gZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9yZXBsL2luZGV4LnN2ZWx0ZVwiO1xuaW1wb3J0IGNvbXBvbmVudF8xMCwgeyBwcmVsb2FkIGFzIHByZWxvYWRfMTAgfSBmcm9tIFwiLi4vLi4vLi4vcm91dGVzL3JlcGwvZW1iZWQuc3ZlbHRlXCI7XG5pbXBvcnQgY29tcG9uZW50XzExLCB7IHByZWxvYWQgYXMgcHJlbG9hZF8xMSB9IGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvcmVwbC9baWRdL2luZGV4LnN2ZWx0ZVwiO1xuaW1wb3J0IHJvb3QgZnJvbSBcIi4uLy4uLy4uL3JvdXRlcy9fbGF5b3V0LnN2ZWx0ZVwiO1xuaW1wb3J0IGVycm9yIGZyb20gXCIuLi8uLi8uLi9yb3V0ZXMvX2Vycm9yLnN2ZWx0ZVwiO1xuXG5jb25zdCBkID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuXG5leHBvcnQgY29uc3QgbWFuaWZlc3QgPSB7XG5cdHNlcnZlcl9yb3V0ZXM6IFtcblx0XHR7XG5cdFx0XHQvLyBleGFtcGxlcy9pbmRleC5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL2V4YW1wbGVzLmpzb24kLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8wLFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIGV4YW1wbGVzL1tzbHVnXS5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL2V4YW1wbGVzXFwvKFteXFwvXSs/KS5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfMSxcblx0XHRcdHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gdHV0b3JpYWwvaW5kZXguanNvbi5qc1xuXHRcdFx0cGF0dGVybjogL15cXC90dXRvcmlhbC5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfMixcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyB0dXRvcmlhbC9yYW5kb20tbnVtYmVyLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3R1dG9yaWFsXFwvcmFuZG9tLW51bWJlclxcLz8kLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8zLFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIHR1dG9yaWFsL1tzbHVnXS9pbmRleC5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3R1dG9yaWFsXFwvKFteXFwvXSs/KS5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfNCxcblx0XHRcdHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gYXBwcy9pbmRleC5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL2FwcHMuanNvbiQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzUsXG5cdFx0XHRwYXJhbXM6ICgpID0+ICh7fSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gYXV0aC9jYWxsYmFjay5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9hdXRoXFwvY2FsbGJhY2tcXC8/JC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfNixcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBhdXRoL2xvZ291dC5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9hdXRoXFwvbG9nb3V0XFwvPyQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzcsXG5cdFx0XHRwYXJhbXM6ICgpID0+ICh7fSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gYXV0aC9sb2dpbi5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9hdXRoXFwvbG9naW5cXC8/JC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfOCxcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL2luZGV4Lmpzb24uanNcblx0XHRcdHBhdHRlcm46IC9eXFwvYmxvZy5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfOSxcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL3Jzcy54bWwuanNcblx0XHRcdHBhdHRlcm46IC9eXFwvYmxvZ1xcL3Jzcy54bWwkLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8xMCxcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL1tzbHVnXS5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL2Jsb2dcXC8oW15cXC9dKz8pLmpzb24kLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8xMSxcblx0XHRcdHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSlcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gY2hhdC5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9jaGF0XFwvPyQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzEyLFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIGRvY3MvaW5kZXguanNvbi5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9kb2NzLmpzb24kLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8xMyxcblx0XHRcdHBhcmFtczogKCkgPT4gKHt9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyByZXBsL2NyZWF0ZS5qc29uLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3JlcGxcXC9jcmVhdGUuanNvbiQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzE0LFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIHJlcGwvbG9jYWwvWy4uLmZpbGVdLmpzXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3JlcGxcXC9sb2NhbFxcLyguKykkLyxcblx0XHRcdGhhbmRsZXJzOiByb3V0ZV8xNSxcblx0XHRcdHBhcmFtczogbWF0Y2ggPT4gKHsgZmlsZTogZChtYXRjaFsxXSkuc3BsaXQoJy8nKSB9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyByZXBsL1tpZF0vaW5kZXguanNvbi5qc1xuXHRcdFx0cGF0dGVybjogL15cXC9yZXBsXFwvKFteXFwvXSs/KS5qc29uJC8sXG5cdFx0XHRoYW5kbGVyczogcm91dGVfMTYsXG5cdFx0XHRwYXJhbXM6IG1hdGNoID0+ICh7IGlkOiBkKG1hdGNoWzFdKSB9KVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBmYXEuanNcblx0XHRcdHBhdHRlcm46IC9eXFwvZmFxXFwvPyQvLFxuXHRcdFx0aGFuZGxlcnM6IHJvdXRlXzE3LFxuXHRcdFx0cGFyYW1zOiAoKSA9PiAoe30pXG5cdFx0fVxuXHRdLFxuXG5cdHBhZ2VzOiBbXG5cdFx0e1xuXHRcdFx0Ly8gaW5kZXguc3ZlbHRlXG5cdFx0XHRwYXR0ZXJuOiAvXlxcLyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcImluZGV4XCIsIGZpbGU6IFwiaW5kZXguc3ZlbHRlXCIsIGNvbXBvbmVudDogY29tcG9uZW50XzAgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBleGFtcGxlcy9pbmRleC5zdmVsdGVcblx0XHRcdHBhdHRlcm46IC9eXFwvZXhhbXBsZXNcXC8/JC8sXG5cdFx0XHRwYXJ0czogW1xuXHRcdFx0XHR7IG5hbWU6IFwiZXhhbXBsZXNcIiwgZmlsZTogXCJleGFtcGxlcy9pbmRleC5zdmVsdGVcIiwgY29tcG9uZW50OiBjb21wb25lbnRfMSwgcHJlbG9hZDogcHJlbG9hZF8xIH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gdHV0b3JpYWwvaW5kZXguc3ZlbHRlXG5cdFx0XHRwYXR0ZXJuOiAvXlxcL3R1dG9yaWFsXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcInR1dG9yaWFsX19sYXlvdXRcIiwgZmlsZTogXCJ0dXRvcmlhbC9fbGF5b3V0LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF8yLCBwcmVsb2FkOiBwcmVsb2FkXzIgfSxcblx0XHRcdFx0eyBuYW1lOiBcInR1dG9yaWFsXCIsIGZpbGU6IFwidHV0b3JpYWwvaW5kZXguc3ZlbHRlXCIsIGNvbXBvbmVudDogY29tcG9uZW50XzMsIHByZWxvYWQ6IHByZWxvYWRfMyB9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdC8vIHR1dG9yaWFsL1tzbHVnXS9pbmRleC5zdmVsdGVcblx0XHRcdHBhdHRlcm46IC9eXFwvdHV0b3JpYWxcXC8oW15cXC9dKz8pXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcInR1dG9yaWFsX19sYXlvdXRcIiwgZmlsZTogXCJ0dXRvcmlhbC9fbGF5b3V0LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF8yLCBwcmVsb2FkOiBwcmVsb2FkXzIgfSxcblx0XHRcdFx0eyBuYW1lOiBcInR1dG9yaWFsXyRzbHVnXCIsIGZpbGU6IFwidHV0b3JpYWwvW3NsdWddL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF80LCBwcmVsb2FkOiBwcmVsb2FkXzQsIHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSkgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBhcHBzL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9hcHBzXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcImFwcHNcIiwgZmlsZTogXCJhcHBzL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF81LCBwcmVsb2FkOiBwcmVsb2FkXzUgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9ibG9nXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcImJsb2dcIiwgZmlsZTogXCJibG9nL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF82LCBwcmVsb2FkOiBwcmVsb2FkXzYgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBibG9nL1tzbHVnXS5zdmVsdGVcblx0XHRcdHBhdHRlcm46IC9eXFwvYmxvZ1xcLyhbXlxcL10rPylcXC8/JC8sXG5cdFx0XHRwYXJ0czogW1xuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHR7IG5hbWU6IFwiYmxvZ18kc2x1Z1wiLCBmaWxlOiBcImJsb2cvW3NsdWddLnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF83LCBwcmVsb2FkOiBwcmVsb2FkXzcsIHBhcmFtczogbWF0Y2ggPT4gKHsgc2x1ZzogZChtYXRjaFsxXSkgfSkgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyBkb2NzL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9kb2NzXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcImRvY3NcIiwgZmlsZTogXCJkb2NzL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF84LCBwcmVsb2FkOiBwcmVsb2FkXzggfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyByZXBsL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9yZXBsXFwvPyQvLFxuXHRcdFx0cGFydHM6IFtcblx0XHRcdFx0eyBuYW1lOiBcInJlcGxcIiwgZmlsZTogXCJyZXBsL2luZGV4LnN2ZWx0ZVwiLCBjb21wb25lbnQ6IGNvbXBvbmVudF85LCBwcmVsb2FkOiBwcmVsb2FkXzkgfVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHQvLyByZXBsL2VtYmVkLnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9yZXBsXFwvZW1iZWRcXC8/JC8sXG5cdFx0XHRwYXJ0czogW1xuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHR7IG5hbWU6IFwicmVwbF9lbWJlZFwiLCBmaWxlOiBcInJlcGwvZW1iZWQuc3ZlbHRlXCIsIGNvbXBvbmVudDogY29tcG9uZW50XzEwLCBwcmVsb2FkOiBwcmVsb2FkXzEwIH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0Ly8gcmVwbC9baWRdL2luZGV4LnN2ZWx0ZVxuXHRcdFx0cGF0dGVybjogL15cXC9yZXBsXFwvKFteXFwvXSs/KVxcLz8kLyxcblx0XHRcdHBhcnRzOiBbXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdHsgbmFtZTogXCJyZXBsXyRpZFwiLCBmaWxlOiBcInJlcGwvW2lkXS9pbmRleC5zdmVsdGVcIiwgY29tcG9uZW50OiBjb21wb25lbnRfMTEsIHByZWxvYWQ6IHByZWxvYWRfMTEsIHBhcmFtczogbWF0Y2ggPT4gKHsgaWQ6IGQobWF0Y2hbMV0pIH0pIH1cblx0XHRcdF1cblx0XHR9XG5cdF0sXG5cblx0cm9vdCxcblx0cm9vdF9wcmVsb2FkOiAoKSA9PiB7fSxcblx0ZXJyb3Jcbn07XG5cbmV4cG9ydCBjb25zdCBidWlsZF9kaXIgPSBcIl9fc2FwcGVyX18vZGV2XCI7XG5cbmV4cG9ydCBjb25zdCBzcmNfZGlyID0gXCJzcmNcIjtcblxuZXhwb3J0IGNvbnN0IGRldiA9IHRydWU7IiwiaW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGRldiwgYnVpbGRfZGlyLCBzcmNfZGlyLCBtYW5pZmVzdCB9IGZyb20gJy4vaW50ZXJuYWwvbWFuaWZlc3Qtc2VydmVyJztcclxuaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tICdzdmVsdGUvc3RvcmUnO1xyXG5pbXBvcnQgU3RyZWFtIGZyb20gJ3N0cmVhbSc7XHJcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xyXG5pbXBvcnQgVXJsIGZyb20gJ3VybCc7XHJcbmltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XHJcbmltcG9ydCB6bGliIGZyb20gJ3psaWInO1xyXG5pbXBvcnQgQXBwIGZyb20gJy4vaW50ZXJuYWwvQXBwLnN2ZWx0ZSc7XHJcblxyXG5mdW5jdGlvbiBnZXRfc2VydmVyX3JvdXRlX2hhbmRsZXIocm91dGVzKSB7XHJcblx0YXN5bmMgZnVuY3Rpb24gaGFuZGxlX3JvdXRlKHJvdXRlLCByZXEsIHJlcywgbmV4dCkge1xyXG5cdFx0cmVxLnBhcmFtcyA9IHJvdXRlLnBhcmFtcyhyb3V0ZS5wYXR0ZXJuLmV4ZWMocmVxLnBhdGgpKTtcclxuXHJcblx0XHRjb25zdCBtZXRob2QgPSByZXEubWV0aG9kLnRvTG93ZXJDYXNlKCk7XHJcblx0XHQvLyAnZGVsZXRlJyBjYW5ub3QgYmUgZXhwb3J0ZWQgZnJvbSBhIG1vZHVsZSBiZWNhdXNlIGl0IGlzIGEga2V5d29yZCxcclxuXHRcdC8vIHNvIGNoZWNrIGZvciAnZGVsJyBpbnN0ZWFkXHJcblx0XHRjb25zdCBtZXRob2RfZXhwb3J0ID0gbWV0aG9kID09PSAnZGVsZXRlJyA/ICdkZWwnIDogbWV0aG9kO1xyXG5cdFx0Y29uc3QgaGFuZGxlX21ldGhvZCA9IHJvdXRlLmhhbmRsZXJzW21ldGhvZF9leHBvcnRdO1xyXG5cdFx0aWYgKGhhbmRsZV9tZXRob2QpIHtcclxuXHRcdFx0aWYgKHByb2Nlc3MuZW52LlNBUFBFUl9FWFBPUlQpIHtcclxuXHRcdFx0XHRjb25zdCB7IHdyaXRlLCBlbmQsIHNldEhlYWRlciB9ID0gcmVzO1xyXG5cdFx0XHRcdGNvbnN0IGNodW5rcyA9IFtdO1xyXG5cdFx0XHRcdGNvbnN0IGhlYWRlcnMgPSB7fTtcclxuXHJcblx0XHRcdFx0Ly8gaW50ZXJjZXB0IGRhdGEgc28gdGhhdCBpdCBjYW4gYmUgZXhwb3J0ZWRcclxuXHRcdFx0XHRyZXMud3JpdGUgPSBmdW5jdGlvbihjaHVuaykge1xyXG5cdFx0XHRcdFx0Y2h1bmtzLnB1c2goQnVmZmVyLmZyb20oY2h1bmspKTtcclxuXHRcdFx0XHRcdHdyaXRlLmFwcGx5KHJlcywgYXJndW1lbnRzKTtcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRyZXMuc2V0SGVhZGVyID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcclxuXHRcdFx0XHRcdGhlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0c2V0SGVhZGVyLmFwcGx5KHJlcywgYXJndW1lbnRzKTtcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRyZXMuZW5kID0gZnVuY3Rpb24oY2h1bmspIHtcclxuXHRcdFx0XHRcdGlmIChjaHVuaykgY2h1bmtzLnB1c2goQnVmZmVyLmZyb20oY2h1bmspKTtcclxuXHRcdFx0XHRcdGVuZC5hcHBseShyZXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0XHRcdFx0cHJvY2Vzcy5zZW5kKHtcclxuXHRcdFx0XHRcdFx0X19zYXBwZXJfXzogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0ZXZlbnQ6ICdmaWxlJyxcclxuXHRcdFx0XHRcdFx0dXJsOiByZXEudXJsLFxyXG5cdFx0XHRcdFx0XHRtZXRob2Q6IHJlcS5tZXRob2QsXHJcblx0XHRcdFx0XHRcdHN0YXR1czogcmVzLnN0YXR1c0NvZGUsXHJcblx0XHRcdFx0XHRcdHR5cGU6IGhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddLFxyXG5cdFx0XHRcdFx0XHRib2R5OiBCdWZmZXIuY29uY2F0KGNodW5rcykudG9TdHJpbmcoKVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgaGFuZGxlX25leHQgPSAoZXJyKSA9PiB7XHJcblx0XHRcdFx0aWYgKGVycikge1xyXG5cdFx0XHRcdFx0cmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcblx0XHRcdFx0XHRyZXMuZW5kKGVyci5tZXNzYWdlKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cHJvY2Vzcy5uZXh0VGljayhuZXh0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGF3YWl0IGhhbmRsZV9tZXRob2QocmVxLCByZXMsIGhhbmRsZV9uZXh0KTtcclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlcnIpO1xyXG5cdFx0XHRcdGhhbmRsZV9uZXh0KGVycik7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIG5vIG1hdGNoaW5nIGhhbmRsZXIgZm9yIG1ldGhvZFxyXG5cdFx0XHRwcm9jZXNzLm5leHRUaWNrKG5leHQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIGZ1bmN0aW9uIGZpbmRfcm91dGUocmVxLCByZXMsIG5leHQpIHtcclxuXHRcdGZvciAoY29uc3Qgcm91dGUgb2Ygcm91dGVzKSB7XHJcblx0XHRcdGlmIChyb3V0ZS5wYXR0ZXJuLnRlc3QocmVxLnBhdGgpKSB7XHJcblx0XHRcdFx0aGFuZGxlX3JvdXRlKHJvdXRlLCByZXEsIHJlcywgbmV4dCk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0bmV4dCgpO1xyXG5cdH07XHJcbn1cclxuXHJcbi8qIVxyXG4gKiBjb29raWVcclxuICogQ29weXJpZ2h0KGMpIDIwMTItMjAxNCBSb21hbiBTaHR5bG1hblxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNSBEb3VnbGFzIENocmlzdG9waGVyIFdpbHNvblxyXG4gKiBNSVQgTGljZW5zZWRcclxuICovXHJcblxyXG4vKipcclxuICogTW9kdWxlIGV4cG9ydHMuXHJcbiAqIEBwdWJsaWNcclxuICovXHJcblxyXG52YXIgcGFyc2VfMSA9IHBhcnNlO1xyXG52YXIgc2VyaWFsaXplXzEgPSBzZXJpYWxpemU7XHJcblxyXG4vKipcclxuICogTW9kdWxlIHZhcmlhYmxlcy5cclxuICogQHByaXZhdGVcclxuICovXHJcblxyXG52YXIgZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O1xyXG52YXIgZW5jb2RlID0gZW5jb2RlVVJJQ29tcG9uZW50O1xyXG52YXIgcGFpclNwbGl0UmVnRXhwID0gLzsgKi87XHJcblxyXG4vKipcclxuICogUmVnRXhwIHRvIG1hdGNoIGZpZWxkLWNvbnRlbnQgaW4gUkZDIDcyMzAgc2VjIDMuMlxyXG4gKlxyXG4gKiBmaWVsZC1jb250ZW50ID0gZmllbGQtdmNoYXIgWyAxKiggU1AgLyBIVEFCICkgZmllbGQtdmNoYXIgXVxyXG4gKiBmaWVsZC12Y2hhciAgID0gVkNIQVIgLyBvYnMtdGV4dFxyXG4gKiBvYnMtdGV4dCAgICAgID0gJXg4MC1GRlxyXG4gKi9cclxuXHJcbnZhciBmaWVsZENvbnRlbnRSZWdFeHAgPSAvXltcXHUwMDA5XFx1MDAyMC1cXHUwMDdlXFx1MDA4MC1cXHUwMGZmXSskLztcclxuXHJcbi8qKlxyXG4gKiBQYXJzZSBhIGNvb2tpZSBoZWFkZXIuXHJcbiAqXHJcbiAqIFBhcnNlIHRoZSBnaXZlbiBjb29raWUgaGVhZGVyIHN0cmluZyBpbnRvIGFuIG9iamVjdFxyXG4gKiBUaGUgb2JqZWN0IGhhcyB0aGUgdmFyaW91cyBjb29raWVzIGFzIGtleXMobmFtZXMpID0+IHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICogQHJldHVybiB7b2JqZWN0fVxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gcGFyc2Uoc3RyLCBvcHRpb25zKSB7XHJcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhcmd1bWVudCBzdHIgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gIH1cclxuXHJcbiAgdmFyIG9iaiA9IHt9O1xyXG4gIHZhciBvcHQgPSBvcHRpb25zIHx8IHt9O1xyXG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdChwYWlyU3BsaXRSZWdFeHApO1xyXG4gIHZhciBkZWMgPSBvcHQuZGVjb2RlIHx8IGRlY29kZTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIHBhaXIgPSBwYWlyc1tpXTtcclxuICAgIHZhciBlcV9pZHggPSBwYWlyLmluZGV4T2YoJz0nKTtcclxuXHJcbiAgICAvLyBza2lwIHRoaW5ncyB0aGF0IGRvbid0IGxvb2sgbGlrZSBrZXk9dmFsdWVcclxuICAgIGlmIChlcV9pZHggPCAwKSB7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBrZXkgPSBwYWlyLnN1YnN0cigwLCBlcV9pZHgpLnRyaW0oKTtcclxuICAgIHZhciB2YWwgPSBwYWlyLnN1YnN0cigrK2VxX2lkeCwgcGFpci5sZW5ndGgpLnRyaW0oKTtcclxuXHJcbiAgICAvLyBxdW90ZWQgdmFsdWVzXHJcbiAgICBpZiAoJ1wiJyA9PSB2YWxbMF0pIHtcclxuICAgICAgdmFsID0gdmFsLnNsaWNlKDEsIC0xKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBvbmx5IGFzc2lnbiBvbmNlXHJcbiAgICBpZiAodW5kZWZpbmVkID09IG9ialtrZXldKSB7XHJcbiAgICAgIG9ialtrZXldID0gdHJ5RGVjb2RlKHZhbCwgZGVjKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBvYmo7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXJpYWxpemUgZGF0YSBpbnRvIGEgY29va2llIGhlYWRlci5cclxuICpcclxuICogU2VyaWFsaXplIHRoZSBhIG5hbWUgdmFsdWUgcGFpciBpbnRvIGEgY29va2llIHN0cmluZyBzdWl0YWJsZSBmb3JcclxuICogaHR0cCBoZWFkZXJzLiBBbiBvcHRpb25hbCBvcHRpb25zIG9iamVjdCBzcGVjaWZpZWQgY29va2llIHBhcmFtZXRlcnMuXHJcbiAqXHJcbiAqIHNlcmlhbGl6ZSgnZm9vJywgJ2JhcicsIHsgaHR0cE9ubHk6IHRydWUgfSlcclxuICogICA9PiBcImZvbz1iYXI7IGh0dHBPbmx5XCJcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbFxyXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICogQHB1YmxpY1xyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIHNlcmlhbGl6ZShuYW1lLCB2YWwsIG9wdGlvbnMpIHtcclxuICB2YXIgb3B0ID0gb3B0aW9ucyB8fCB7fTtcclxuICB2YXIgZW5jID0gb3B0LmVuY29kZSB8fCBlbmNvZGU7XHJcblxyXG4gIGlmICh0eXBlb2YgZW5jICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gZW5jb2RlIGlzIGludmFsaWQnKTtcclxuICB9XHJcblxyXG4gIGlmICghZmllbGRDb250ZW50UmVnRXhwLnRlc3QobmFtZSkpIHtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FyZ3VtZW50IG5hbWUgaXMgaW52YWxpZCcpO1xyXG4gIH1cclxuXHJcbiAgdmFyIHZhbHVlID0gZW5jKHZhbCk7XHJcblxyXG4gIGlmICh2YWx1ZSAmJiAhZmllbGRDb250ZW50UmVnRXhwLnRlc3QodmFsdWUpKSB7XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhcmd1bWVudCB2YWwgaXMgaW52YWxpZCcpO1xyXG4gIH1cclxuXHJcbiAgdmFyIHN0ciA9IG5hbWUgKyAnPScgKyB2YWx1ZTtcclxuXHJcbiAgaWYgKG51bGwgIT0gb3B0Lm1heEFnZSkge1xyXG4gICAgdmFyIG1heEFnZSA9IG9wdC5tYXhBZ2UgLSAwO1xyXG4gICAgaWYgKGlzTmFOKG1heEFnZSkpIHRocm93IG5ldyBFcnJvcignbWF4QWdlIHNob3VsZCBiZSBhIE51bWJlcicpO1xyXG4gICAgc3RyICs9ICc7IE1heC1BZ2U9JyArIE1hdGguZmxvb3IobWF4QWdlKTtcclxuICB9XHJcblxyXG4gIGlmIChvcHQuZG9tYWluKSB7XHJcbiAgICBpZiAoIWZpZWxkQ29udGVudFJlZ0V4cC50ZXN0KG9wdC5kb21haW4pKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBkb21haW4gaXMgaW52YWxpZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ciArPSAnOyBEb21haW49JyArIG9wdC5kb21haW47XHJcbiAgfVxyXG5cclxuICBpZiAob3B0LnBhdGgpIHtcclxuICAgIGlmICghZmllbGRDb250ZW50UmVnRXhwLnRlc3Qob3B0LnBhdGgpKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBwYXRoIGlzIGludmFsaWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBzdHIgKz0gJzsgUGF0aD0nICsgb3B0LnBhdGg7XHJcbiAgfVxyXG5cclxuICBpZiAob3B0LmV4cGlyZXMpIHtcclxuICAgIGlmICh0eXBlb2Ygb3B0LmV4cGlyZXMudG9VVENTdHJpbmcgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIGV4cGlyZXMgaXMgaW52YWxpZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ciArPSAnOyBFeHBpcmVzPScgKyBvcHQuZXhwaXJlcy50b1VUQ1N0cmluZygpO1xyXG4gIH1cclxuXHJcbiAgaWYgKG9wdC5odHRwT25seSkge1xyXG4gICAgc3RyICs9ICc7IEh0dHBPbmx5JztcclxuICB9XHJcblxyXG4gIGlmIChvcHQuc2VjdXJlKSB7XHJcbiAgICBzdHIgKz0gJzsgU2VjdXJlJztcclxuICB9XHJcblxyXG4gIGlmIChvcHQuc2FtZVNpdGUpIHtcclxuICAgIHZhciBzYW1lU2l0ZSA9IHR5cGVvZiBvcHQuc2FtZVNpdGUgPT09ICdzdHJpbmcnXHJcbiAgICAgID8gb3B0LnNhbWVTaXRlLnRvTG93ZXJDYXNlKCkgOiBvcHQuc2FtZVNpdGU7XHJcblxyXG4gICAgc3dpdGNoIChzYW1lU2l0ZSkge1xyXG4gICAgICBjYXNlIHRydWU6XHJcbiAgICAgICAgc3RyICs9ICc7IFNhbWVTaXRlPVN0cmljdCc7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xheCc6XHJcbiAgICAgICAgc3RyICs9ICc7IFNhbWVTaXRlPUxheCc7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3N0cmljdCc6XHJcbiAgICAgICAgc3RyICs9ICc7IFNhbWVTaXRlPVN0cmljdCc7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ25vbmUnOlxyXG4gICAgICAgIHN0ciArPSAnOyBTYW1lU2l0ZT1Ob25lJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gc2FtZVNpdGUgaXMgaW52YWxpZCcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHN0cjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyeSBkZWNvZGluZyBhIHN0cmluZyB1c2luZyBhIGRlY29kaW5nIGZ1bmN0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXHJcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGRlY29kZVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIHRyeURlY29kZShzdHIsIGRlY29kZSkge1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZGVjb2RlKHN0cik7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIHN0cjtcclxuICB9XHJcbn1cclxuXHJcbnZhciBjb29raWUgPSB7XHJcblx0cGFyc2U6IHBhcnNlXzEsXHJcblx0c2VyaWFsaXplOiBzZXJpYWxpemVfMVxyXG59O1xyXG5cclxudmFyIGNoYXJzID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpfJCc7XHJcbnZhciB1bnNhZmVDaGFycyA9IC9bPD5cXGJcXGZcXG5cXHJcXHRcXDBcXHUyMDI4XFx1MjAyOV0vZztcclxudmFyIHJlc2VydmVkID0gL14oPzpkb3xpZnxpbnxmb3J8aW50fGxldHxuZXd8dHJ5fHZhcnxieXRlfGNhc2V8Y2hhcnxlbHNlfGVudW18Z290b3xsb25nfHRoaXN8dm9pZHx3aXRofGF3YWl0fGJyZWFrfGNhdGNofGNsYXNzfGNvbnN0fGZpbmFsfGZsb2F0fHNob3J0fHN1cGVyfHRocm93fHdoaWxlfHlpZWxkfGRlbGV0ZXxkb3VibGV8ZXhwb3J0fGltcG9ydHxuYXRpdmV8cmV0dXJufHN3aXRjaHx0aHJvd3N8dHlwZW9mfGJvb2xlYW58ZGVmYXVsdHxleHRlbmRzfGZpbmFsbHl8cGFja2FnZXxwcml2YXRlfGFic3RyYWN0fGNvbnRpbnVlfGRlYnVnZ2VyfGZ1bmN0aW9ufHZvbGF0aWxlfGludGVyZmFjZXxwcm90ZWN0ZWR8dHJhbnNpZW50fGltcGxlbWVudHN8aW5zdGFuY2VvZnxzeW5jaHJvbml6ZWQpJC87XHJcbnZhciBlc2NhcGVkID0ge1xyXG4gICAgJzwnOiAnXFxcXHUwMDNDJyxcclxuICAgICc+JzogJ1xcXFx1MDAzRScsXHJcbiAgICAnLyc6ICdcXFxcdTAwMkYnLFxyXG4gICAgJ1xcXFwnOiAnXFxcXFxcXFwnLFxyXG4gICAgJ1xcYic6ICdcXFxcYicsXHJcbiAgICAnXFxmJzogJ1xcXFxmJyxcclxuICAgICdcXG4nOiAnXFxcXG4nLFxyXG4gICAgJ1xccic6ICdcXFxccicsXHJcbiAgICAnXFx0JzogJ1xcXFx0JyxcclxuICAgICdcXDAnOiAnXFxcXDAnLFxyXG4gICAgJ1xcdTIwMjgnOiAnXFxcXHUyMDI4JyxcclxuICAgICdcXHUyMDI5JzogJ1xcXFx1MjAyOSdcclxufTtcclxudmFyIG9iamVjdFByb3RvT3duUHJvcGVydHlOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE9iamVjdC5wcm90b3R5cGUpLnNvcnQoKS5qb2luKCdcXDAnKTtcclxuZnVuY3Rpb24gZGV2YWx1ZSh2YWx1ZSkge1xyXG4gICAgdmFyIGNvdW50cyA9IG5ldyBNYXAoKTtcclxuICAgIGZ1bmN0aW9uIHdhbGsodGhpbmcpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaW5nID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzdHJpbmdpZnkgYSBmdW5jdGlvblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvdW50cy5oYXModGhpbmcpKSB7XHJcbiAgICAgICAgICAgIGNvdW50cy5zZXQodGhpbmcsIGNvdW50cy5nZXQodGhpbmcpICsgMSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY291bnRzLnNldCh0aGluZywgMSk7XHJcbiAgICAgICAgaWYgKCFpc1ByaW1pdGl2ZSh0aGluZykpIHtcclxuICAgICAgICAgICAgdmFyIHR5cGUgPSBnZXRUeXBlKHRoaW5nKTtcclxuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdOdW1iZXInOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnU3RyaW5nJzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ0Jvb2xlYW4nOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnRGF0ZSc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdSZWdFeHAnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ0FycmF5JzpcclxuICAgICAgICAgICAgICAgICAgICB0aGluZy5mb3JFYWNoKHdhbGspO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnU2V0JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ01hcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbSh0aGluZykuZm9yRWFjaCh3YWxrKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvdG8gIT09IE9iamVjdC5wcm90b3R5cGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG8gIT09IG51bGwgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pLnNvcnQoKS5qb2luKCdcXDAnKSAhPT0gb2JqZWN0UHJvdG9Pd25Qcm9wZXJ0eU5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzdHJpbmdpZnkgYXJiaXRyYXJ5IG5vbi1QT0pPc1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHModGhpbmcpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHN0cmluZ2lmeSBQT0pPcyB3aXRoIHN5bWJvbGljIGtleXNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaW5nKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIHdhbGsodGhpbmdba2V5XSk7IH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgd2Fsayh2YWx1ZSk7XHJcbiAgICB2YXIgbmFtZXMgPSBuZXcgTWFwKCk7XHJcbiAgICBBcnJheS5mcm9tKGNvdW50cylcclxuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChlbnRyeSkgeyByZXR1cm4gZW50cnlbMV0gPiAxOyB9KVxyXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBiWzFdIC0gYVsxXTsgfSlcclxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAoZW50cnksIGkpIHtcclxuICAgICAgICBuYW1lcy5zZXQoZW50cnlbMF0sIGdldE5hbWUoaSkpO1xyXG4gICAgfSk7XHJcbiAgICBmdW5jdGlvbiBzdHJpbmdpZnkodGhpbmcpIHtcclxuICAgICAgICBpZiAobmFtZXMuaGFzKHRoaW5nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmFtZXMuZ2V0KHRoaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHRoaW5nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5naWZ5UHJpbWl0aXZlKHRoaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHR5cGUgPSBnZXRUeXBlKHRoaW5nKTtcclxuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSAnTnVtYmVyJzpcclxuICAgICAgICAgICAgY2FzZSAnU3RyaW5nJzpcclxuICAgICAgICAgICAgY2FzZSAnQm9vbGVhbic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJPYmplY3QoXCIgKyBzdHJpbmdpZnkodGhpbmcudmFsdWVPZigpKSArIFwiKVwiO1xyXG4gICAgICAgICAgICBjYXNlICdSZWdFeHAnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaW5nLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhc2UgJ0RhdGUnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibmV3IERhdGUoXCIgKyB0aGluZy5nZXRUaW1lKCkgKyBcIilcIjtcclxuICAgICAgICAgICAgY2FzZSAnQXJyYXknOlxyXG4gICAgICAgICAgICAgICAgdmFyIG1lbWJlcnMgPSB0aGluZy5tYXAoZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIGkgaW4gdGhpbmcgPyBzdHJpbmdpZnkodikgOiAnJzsgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFpbCA9IHRoaW5nLmxlbmd0aCA9PT0gMCB8fCAodGhpbmcubGVuZ3RoIC0gMSBpbiB0aGluZykgPyAnJyA6ICcsJztcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIltcIiArIG1lbWJlcnMuam9pbignLCcpICsgdGFpbCArIFwiXVwiO1xyXG4gICAgICAgICAgICBjYXNlICdTZXQnOlxyXG4gICAgICAgICAgICBjYXNlICdNYXAnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibmV3IFwiICsgdHlwZSArIFwiKFtcIiArIEFycmF5LmZyb20odGhpbmcpLm1hcChzdHJpbmdpZnkpLmpvaW4oJywnKSArIFwiXSlcIjtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHZhciBvYmogPSBcIntcIiArIE9iamVjdC5rZXlzKHRoaW5nKS5tYXAoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gc2FmZUtleShrZXkpICsgXCI6XCIgKyBzdHJpbmdpZnkodGhpbmdba2V5XSk7IH0pLmpvaW4oJywnKSArIFwifVwiO1xyXG4gICAgICAgICAgICAgICAgdmFyIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaW5nKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcm90byA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGluZykubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwiT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKG51bGwpLFwiICsgb2JqICsgXCIpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIk9iamVjdC5jcmVhdGUobnVsbClcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdmFyIHN0ciA9IHN0cmluZ2lmeSh2YWx1ZSk7XHJcbiAgICBpZiAobmFtZXMuc2l6ZSkge1xyXG4gICAgICAgIHZhciBwYXJhbXNfMSA9IFtdO1xyXG4gICAgICAgIHZhciBzdGF0ZW1lbnRzXzEgPSBbXTtcclxuICAgICAgICB2YXIgdmFsdWVzXzEgPSBbXTtcclxuICAgICAgICBuYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lLCB0aGluZykge1xyXG4gICAgICAgICAgICBwYXJhbXNfMS5wdXNoKG5hbWUpO1xyXG4gICAgICAgICAgICBpZiAoaXNQcmltaXRpdmUodGhpbmcpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZXNfMS5wdXNoKHN0cmluZ2lmeVByaW1pdGl2ZSh0aGluZykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gZ2V0VHlwZSh0aGluZyk7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnTnVtYmVyJzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ1N0cmluZyc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdCb29sZWFuJzpcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXNfMS5wdXNoKFwiT2JqZWN0KFwiICsgc3RyaW5naWZ5KHRoaW5nLnZhbHVlT2YoKSkgKyBcIilcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdSZWdFeHAnOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlc18xLnB1c2godGhpbmcudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdEYXRlJzpcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXNfMS5wdXNoKFwibmV3IERhdGUoXCIgKyB0aGluZy5nZXRUaW1lKCkgKyBcIilcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdBcnJheSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzXzEucHVzaChcIkFycmF5KFwiICsgdGhpbmcubGVuZ3RoICsgXCIpXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaW5nLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50c18xLnB1c2gobmFtZSArIFwiW1wiICsgaSArIFwiXT1cIiArIHN0cmluZ2lmeSh2KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdTZXQnOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlc18xLnB1c2goXCJuZXcgU2V0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlbWVudHNfMS5wdXNoKG5hbWUgKyBcIi5cIiArIEFycmF5LmZyb20odGhpbmcpLm1hcChmdW5jdGlvbiAodikgeyByZXR1cm4gXCJhZGQoXCIgKyBzdHJpbmdpZnkodikgKyBcIilcIjsgfSkuam9pbignLicpKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ01hcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzXzEucHVzaChcIm5ldyBNYXBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50c18xLnB1c2gobmFtZSArIFwiLlwiICsgQXJyYXkuZnJvbSh0aGluZykubWFwKGZ1bmN0aW9uIChfYSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgayA9IF9hWzBdLCB2ID0gX2FbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcInNldChcIiArIHN0cmluZ2lmeShrKSArIFwiLCBcIiArIHN0cmluZ2lmeSh2KSArIFwiKVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLmpvaW4oJy4nKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlc18xLnB1c2goT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaW5nKSA9PT0gbnVsbCA/ICdPYmplY3QuY3JlYXRlKG51bGwpJyA6ICd7fScpO1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaW5nKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50c18xLnB1c2goXCJcIiArIG5hbWUgKyBzYWZlUHJvcChrZXkpICsgXCI9XCIgKyBzdHJpbmdpZnkodGhpbmdba2V5XSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc3RhdGVtZW50c18xLnB1c2goXCJyZXR1cm4gXCIgKyBzdHIpO1xyXG4gICAgICAgIHJldHVybiBcIihmdW5jdGlvbihcIiArIHBhcmFtc18xLmpvaW4oJywnKSArIFwiKXtcIiArIHN0YXRlbWVudHNfMS5qb2luKCc7JykgKyBcIn0oXCIgKyB2YWx1ZXNfMS5qb2luKCcsJykgKyBcIikpXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGdldE5hbWUobnVtKSB7XHJcbiAgICB2YXIgbmFtZSA9ICcnO1xyXG4gICAgZG8ge1xyXG4gICAgICAgIG5hbWUgPSBjaGFyc1tudW0gJSBjaGFycy5sZW5ndGhdICsgbmFtZTtcclxuICAgICAgICBudW0gPSB+fihudW0gLyBjaGFycy5sZW5ndGgpIC0gMTtcclxuICAgIH0gd2hpbGUgKG51bSA+PSAwKTtcclxuICAgIHJldHVybiByZXNlcnZlZC50ZXN0KG5hbWUpID8gbmFtZSArIFwiX1wiIDogbmFtZTtcclxufVxyXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZSh0aGluZykge1xyXG4gICAgcmV0dXJuIE9iamVjdCh0aGluZykgIT09IHRoaW5nO1xyXG59XHJcbmZ1bmN0aW9uIHN0cmluZ2lmeVByaW1pdGl2ZSh0aGluZykge1xyXG4gICAgaWYgKHR5cGVvZiB0aGluZyA9PT0gJ3N0cmluZycpXHJcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZyh0aGluZyk7XHJcbiAgICBpZiAodGhpbmcgPT09IHZvaWQgMClcclxuICAgICAgICByZXR1cm4gJ3ZvaWQgMCc7XHJcbiAgICBpZiAodGhpbmcgPT09IDAgJiYgMSAvIHRoaW5nIDwgMClcclxuICAgICAgICByZXR1cm4gJy0wJztcclxuICAgIHZhciBzdHIgPSBTdHJpbmcodGhpbmcpO1xyXG4gICAgaWYgKHR5cGVvZiB0aGluZyA9PT0gJ251bWJlcicpXHJcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eKC0pPzBcXC4vLCAnJDEuJyk7XHJcbiAgICByZXR1cm4gc3RyO1xyXG59XHJcbmZ1bmN0aW9uIGdldFR5cGUodGhpbmcpIHtcclxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGhpbmcpLnNsaWNlKDgsIC0xKTtcclxufVxyXG5mdW5jdGlvbiBlc2NhcGVVbnNhZmVDaGFyKGMpIHtcclxuICAgIHJldHVybiBlc2NhcGVkW2NdIHx8IGM7XHJcbn1cclxuZnVuY3Rpb24gZXNjYXBlVW5zYWZlQ2hhcnMoc3RyKSB7XHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UodW5zYWZlQ2hhcnMsIGVzY2FwZVVuc2FmZUNoYXIpO1xyXG59XHJcbmZ1bmN0aW9uIHNhZmVLZXkoa2V5KSB7XHJcbiAgICByZXR1cm4gL15bXyRhLXpBLVpdW18kYS16QS1aMC05XSokLy50ZXN0KGtleSkgPyBrZXkgOiBlc2NhcGVVbnNhZmVDaGFycyhKU09OLnN0cmluZ2lmeShrZXkpKTtcclxufVxyXG5mdW5jdGlvbiBzYWZlUHJvcChrZXkpIHtcclxuICAgIHJldHVybiAvXltfJGEtekEtWl1bXyRhLXpBLVowLTldKiQvLnRlc3Qoa2V5KSA/IFwiLlwiICsga2V5IDogXCJbXCIgKyBlc2NhcGVVbnNhZmVDaGFycyhKU09OLnN0cmluZ2lmeShrZXkpKSArIFwiXVwiO1xyXG59XHJcbmZ1bmN0aW9uIHN0cmluZ2lmeVN0cmluZyhzdHIpIHtcclxuICAgIHZhciByZXN1bHQgPSAnXCInO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgY2hhciA9IHN0ci5jaGFyQXQoaSk7XHJcbiAgICAgICAgdmFyIGNvZGUgPSBjaGFyLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgaWYgKGNoYXIgPT09ICdcIicpIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9ICdcXFxcXCInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChjaGFyIGluIGVzY2FwZWQpIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IGVzY2FwZWRbY2hhcl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGNvZGUgPj0gMHhkODAwICYmIGNvZGUgPD0gMHhkZmZmKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXh0ID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xyXG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSBiZWdpbm5pbmcgb2YgYSBbaGlnaCwgbG93XSBzdXJyb2dhdGUgcGFpcixcclxuICAgICAgICAgICAgLy8gYWRkIHRoZSBuZXh0IHR3byBjaGFyYWN0ZXJzLCBvdGhlcndpc2UgZXNjYXBlXHJcbiAgICAgICAgICAgIGlmIChjb2RlIDw9IDB4ZGJmZiAmJiAobmV4dCA+PSAweGRjMDAgJiYgbmV4dCA8PSAweGRmZmYpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gY2hhciArIHN0clsrK2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiXFxcXHVcIiArIGNvZGUudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBjaGFyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc3VsdCArPSAnXCInO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLy8gQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL3RtcHZhci9qc2RvbS9ibG9iL2FhODViMmFiZjA3NzY2ZmY3YmY1YzFmNmRhYWZiMzcyNmYyZjJkYjUvbGliL2pzZG9tL2xpdmluZy9ibG9iLmpzXHJcblxyXG4vLyBmaXggZm9yIFwiUmVhZGFibGVcIiBpc24ndCBhIG5hbWVkIGV4cG9ydCBpc3N1ZVxyXG5jb25zdCBSZWFkYWJsZSA9IFN0cmVhbS5SZWFkYWJsZTtcclxuXHJcbmNvbnN0IEJVRkZFUiA9IFN5bWJvbCgnYnVmZmVyJyk7XHJcbmNvbnN0IFRZUEUgPSBTeW1ib2woJ3R5cGUnKTtcclxuXHJcbmNsYXNzIEJsb2Ige1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpc1tUWVBFXSA9ICcnO1xyXG5cclxuXHRcdGNvbnN0IGJsb2JQYXJ0cyA9IGFyZ3VtZW50c1swXTtcclxuXHRcdGNvbnN0IG9wdGlvbnMgPSBhcmd1bWVudHNbMV07XHJcblxyXG5cdFx0Y29uc3QgYnVmZmVycyA9IFtdO1xyXG5cdFx0bGV0IHNpemUgPSAwO1xyXG5cclxuXHRcdGlmIChibG9iUGFydHMpIHtcclxuXHRcdFx0Y29uc3QgYSA9IGJsb2JQYXJ0cztcclxuXHRcdFx0Y29uc3QgbGVuZ3RoID0gTnVtYmVyKGEubGVuZ3RoKTtcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGNvbnN0IGVsZW1lbnQgPSBhW2ldO1xyXG5cdFx0XHRcdGxldCBidWZmZXI7XHJcblx0XHRcdFx0aWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBCdWZmZXIpIHtcclxuXHRcdFx0XHRcdGJ1ZmZlciA9IGVsZW1lbnQ7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZWxlbWVudCkpIHtcclxuXHRcdFx0XHRcdGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGVsZW1lbnQuYnVmZmVyLCBlbGVtZW50LmJ5dGVPZmZzZXQsIGVsZW1lbnQuYnl0ZUxlbmd0aCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcclxuXHRcdFx0XHRcdGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGVsZW1lbnQpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJsb2IpIHtcclxuXHRcdFx0XHRcdGJ1ZmZlciA9IGVsZW1lbnRbQlVGRkVSXTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0YnVmZmVyID0gQnVmZmVyLmZyb20odHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnID8gZWxlbWVudCA6IFN0cmluZyhlbGVtZW50KSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHNpemUgKz0gYnVmZmVyLmxlbmd0aDtcclxuXHRcdFx0XHRidWZmZXJzLnB1c2goYnVmZmVyKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXNbQlVGRkVSXSA9IEJ1ZmZlci5jb25jYXQoYnVmZmVycyk7XHJcblxyXG5cdFx0bGV0IHR5cGUgPSBvcHRpb25zICYmIG9wdGlvbnMudHlwZSAhPT0gdW5kZWZpbmVkICYmIFN0cmluZyhvcHRpb25zLnR5cGUpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRpZiAodHlwZSAmJiAhL1teXFx1MDAyMC1cXHUwMDdFXS8udGVzdCh0eXBlKSkge1xyXG5cdFx0XHR0aGlzW1RZUEVdID0gdHlwZTtcclxuXHRcdH1cclxuXHR9XHJcblx0Z2V0IHNpemUoKSB7XHJcblx0XHRyZXR1cm4gdGhpc1tCVUZGRVJdLmxlbmd0aDtcclxuXHR9XHJcblx0Z2V0IHR5cGUoKSB7XHJcblx0XHRyZXR1cm4gdGhpc1tUWVBFXTtcclxuXHR9XHJcblx0dGV4dCgpIHtcclxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpc1tCVUZGRVJdLnRvU3RyaW5nKCkpO1xyXG5cdH1cclxuXHRhcnJheUJ1ZmZlcigpIHtcclxuXHRcdGNvbnN0IGJ1ZiA9IHRoaXNbQlVGRkVSXTtcclxuXHRcdGNvbnN0IGFiID0gYnVmLmJ1ZmZlci5zbGljZShidWYuYnl0ZU9mZnNldCwgYnVmLmJ5dGVPZmZzZXQgKyBidWYuYnl0ZUxlbmd0aCk7XHJcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFiKTtcclxuXHR9XHJcblx0c3RyZWFtKCkge1xyXG5cdFx0Y29uc3QgcmVhZGFibGUgPSBuZXcgUmVhZGFibGUoKTtcclxuXHRcdHJlYWRhYmxlLl9yZWFkID0gZnVuY3Rpb24gKCkge307XHJcblx0XHRyZWFkYWJsZS5wdXNoKHRoaXNbQlVGRkVSXSk7XHJcblx0XHRyZWFkYWJsZS5wdXNoKG51bGwpO1xyXG5cdFx0cmV0dXJuIHJlYWRhYmxlO1xyXG5cdH1cclxuXHR0b1N0cmluZygpIHtcclxuXHRcdHJldHVybiAnW29iamVjdCBCbG9iXSc7XHJcblx0fVxyXG5cdHNsaWNlKCkge1xyXG5cdFx0Y29uc3Qgc2l6ZSA9IHRoaXMuc2l6ZTtcclxuXHJcblx0XHRjb25zdCBzdGFydCA9IGFyZ3VtZW50c1swXTtcclxuXHRcdGNvbnN0IGVuZCA9IGFyZ3VtZW50c1sxXTtcclxuXHRcdGxldCByZWxhdGl2ZVN0YXJ0LCByZWxhdGl2ZUVuZDtcclxuXHRcdGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHJlbGF0aXZlU3RhcnQgPSAwO1xyXG5cdFx0fSBlbHNlIGlmIChzdGFydCA8IDApIHtcclxuXHRcdFx0cmVsYXRpdmVTdGFydCA9IE1hdGgubWF4KHNpemUgKyBzdGFydCwgMCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZWxhdGl2ZVN0YXJ0ID0gTWF0aC5taW4oc3RhcnQsIHNpemUpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHJlbGF0aXZlRW5kID0gc2l6ZTtcclxuXHRcdH0gZWxzZSBpZiAoZW5kIDwgMCkge1xyXG5cdFx0XHRyZWxhdGl2ZUVuZCA9IE1hdGgubWF4KHNpemUgKyBlbmQsIDApO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmVsYXRpdmVFbmQgPSBNYXRoLm1pbihlbmQsIHNpemUpO1xyXG5cdFx0fVxyXG5cdFx0Y29uc3Qgc3BhbiA9IE1hdGgubWF4KHJlbGF0aXZlRW5kIC0gcmVsYXRpdmVTdGFydCwgMCk7XHJcblxyXG5cdFx0Y29uc3QgYnVmZmVyID0gdGhpc1tCVUZGRVJdO1xyXG5cdFx0Y29uc3Qgc2xpY2VkQnVmZmVyID0gYnVmZmVyLnNsaWNlKHJlbGF0aXZlU3RhcnQsIHJlbGF0aXZlU3RhcnQgKyBzcGFuKTtcclxuXHRcdGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbXSwgeyB0eXBlOiBhcmd1bWVudHNbMl0gfSk7XHJcblx0XHRibG9iW0JVRkZFUl0gPSBzbGljZWRCdWZmZXI7XHJcblx0XHRyZXR1cm4gYmxvYjtcclxuXHR9XHJcbn1cclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEJsb2IucHJvdG90eXBlLCB7XHJcblx0c2l6ZTogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXHJcblx0dHlwZTogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXHJcblx0c2xpY2U6IHsgZW51bWVyYWJsZTogdHJ1ZSB9XHJcbn0pO1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJsb2IucHJvdG90eXBlLCBTeW1ib2wudG9TdHJpbmdUYWcsIHtcclxuXHR2YWx1ZTogJ0Jsb2InLFxyXG5cdHdyaXRhYmxlOiBmYWxzZSxcclxuXHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHRjb25maWd1cmFibGU6IHRydWVcclxufSk7XHJcblxyXG4vKipcclxuICogZmV0Y2gtZXJyb3IuanNcclxuICpcclxuICogRmV0Y2hFcnJvciBpbnRlcmZhY2UgZm9yIG9wZXJhdGlvbmFsIGVycm9yc1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgRmV0Y2hFcnJvciBpbnN0YW5jZVxyXG4gKlxyXG4gKiBAcGFyYW0gICBTdHJpbmcgICAgICBtZXNzYWdlICAgICAgRXJyb3IgbWVzc2FnZSBmb3IgaHVtYW5cclxuICogQHBhcmFtICAgU3RyaW5nICAgICAgdHlwZSAgICAgICAgIEVycm9yIHR5cGUgZm9yIG1hY2hpbmVcclxuICogQHBhcmFtICAgU3RyaW5nICAgICAgc3lzdGVtRXJyb3IgIEZvciBOb2RlLmpzIHN5c3RlbSBlcnJvclxyXG4gKiBAcmV0dXJuICBGZXRjaEVycm9yXHJcbiAqL1xyXG5mdW5jdGlvbiBGZXRjaEVycm9yKG1lc3NhZ2UsIHR5cGUsIHN5c3RlbUVycm9yKSB7XHJcbiAgRXJyb3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcclxuXHJcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcclxuICB0aGlzLnR5cGUgPSB0eXBlO1xyXG5cclxuICAvLyB3aGVuIGVyci50eXBlIGlzIGBzeXN0ZW1gLCBlcnIuY29kZSBjb250YWlucyBzeXN0ZW0gZXJyb3IgY29kZVxyXG4gIGlmIChzeXN0ZW1FcnJvcikge1xyXG4gICAgdGhpcy5jb2RlID0gdGhpcy5lcnJubyA9IHN5c3RlbUVycm9yLmNvZGU7XHJcbiAgfVxyXG5cclxuICAvLyBoaWRlIGN1c3RvbSBlcnJvciBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzIGZyb20gZW5kLXVzZXJzXHJcbiAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3Rvcik7XHJcbn1cclxuXHJcbkZldGNoRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xyXG5GZXRjaEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZldGNoRXJyb3I7XHJcbkZldGNoRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnRmV0Y2hFcnJvcic7XHJcblxyXG5sZXQgY29udmVydDtcclxudHJ5IHtcclxuXHRjb252ZXJ0ID0gcmVxdWlyZSgnZW5jb2RpbmcnKS5jb252ZXJ0O1xyXG59IGNhdGNoIChlKSB7fVxyXG5cclxuY29uc3QgSU5URVJOQUxTID0gU3ltYm9sKCdCb2R5IGludGVybmFscycpO1xyXG5cclxuLy8gZml4IGFuIGlzc3VlIHdoZXJlIFwiUGFzc1Rocm91Z2hcIiBpc24ndCBhIG5hbWVkIGV4cG9ydCBmb3Igbm9kZSA8MTBcclxuY29uc3QgUGFzc1Rocm91Z2ggPSBTdHJlYW0uUGFzc1Rocm91Z2g7XHJcblxyXG4vKipcclxuICogQm9keSBtaXhpblxyXG4gKlxyXG4gKiBSZWY6IGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNib2R5XHJcbiAqXHJcbiAqIEBwYXJhbSAgIFN0cmVhbSAgYm9keSAgUmVhZGFibGUgc3RyZWFtXHJcbiAqIEBwYXJhbSAgIE9iamVjdCAgb3B0cyAgUmVzcG9uc2Ugb3B0aW9uc1xyXG4gKiBAcmV0dXJuICBWb2lkXHJcbiAqL1xyXG5mdW5jdGlvbiBCb2R5KGJvZHkpIHtcclxuXHR2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuXHR2YXIgX3JlZiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge30sXHJcblx0ICAgIF9yZWYkc2l6ZSA9IF9yZWYuc2l6ZTtcclxuXHJcblx0bGV0IHNpemUgPSBfcmVmJHNpemUgPT09IHVuZGVmaW5lZCA/IDAgOiBfcmVmJHNpemU7XHJcblx0dmFyIF9yZWYkdGltZW91dCA9IF9yZWYudGltZW91dDtcclxuXHRsZXQgdGltZW91dCA9IF9yZWYkdGltZW91dCA9PT0gdW5kZWZpbmVkID8gMCA6IF9yZWYkdGltZW91dDtcclxuXHJcblx0aWYgKGJvZHkgPT0gbnVsbCkge1xyXG5cdFx0Ly8gYm9keSBpcyB1bmRlZmluZWQgb3IgbnVsbFxyXG5cdFx0Ym9keSA9IG51bGw7XHJcblx0fSBlbHNlIGlmIChpc1VSTFNlYXJjaFBhcmFtcyhib2R5KSkge1xyXG5cdFx0Ly8gYm9keSBpcyBhIFVSTFNlYXJjaFBhcmFtc1xyXG5cdFx0Ym9keSA9IEJ1ZmZlci5mcm9tKGJvZHkudG9TdHJpbmcoKSk7XHJcblx0fSBlbHNlIGlmIChpc0Jsb2IoYm9keSkpIDsgZWxzZSBpZiAoQnVmZmVyLmlzQnVmZmVyKGJvZHkpKSA7IGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChib2R5KSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJykge1xyXG5cdFx0Ly8gYm9keSBpcyBBcnJheUJ1ZmZlclxyXG5cdFx0Ym9keSA9IEJ1ZmZlci5mcm9tKGJvZHkpO1xyXG5cdH0gZWxzZSBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGJvZHkpKSB7XHJcblx0XHQvLyBib2R5IGlzIEFycmF5QnVmZmVyVmlld1xyXG5cdFx0Ym9keSA9IEJ1ZmZlci5mcm9tKGJvZHkuYnVmZmVyLCBib2R5LmJ5dGVPZmZzZXQsIGJvZHkuYnl0ZUxlbmd0aCk7XHJcblx0fSBlbHNlIGlmIChib2R5IGluc3RhbmNlb2YgU3RyZWFtKSA7IGVsc2Uge1xyXG5cdFx0Ly8gbm9uZSBvZiB0aGUgYWJvdmVcclxuXHRcdC8vIGNvZXJjZSB0byBzdHJpbmcgdGhlbiBidWZmZXJcclxuXHRcdGJvZHkgPSBCdWZmZXIuZnJvbShTdHJpbmcoYm9keSkpO1xyXG5cdH1cclxuXHR0aGlzW0lOVEVSTkFMU10gPSB7XHJcblx0XHRib2R5LFxyXG5cdFx0ZGlzdHVyYmVkOiBmYWxzZSxcclxuXHRcdGVycm9yOiBudWxsXHJcblx0fTtcclxuXHR0aGlzLnNpemUgPSBzaXplO1xyXG5cdHRoaXMudGltZW91dCA9IHRpbWVvdXQ7XHJcblxyXG5cdGlmIChib2R5IGluc3RhbmNlb2YgU3RyZWFtKSB7XHJcblx0XHRib2R5Lm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0Y29uc3QgZXJyb3IgPSBlcnIubmFtZSA9PT0gJ0Fib3J0RXJyb3InID8gZXJyIDogbmV3IEZldGNoRXJyb3IoYEludmFsaWQgcmVzcG9uc2UgYm9keSB3aGlsZSB0cnlpbmcgdG8gZmV0Y2ggJHtfdGhpcy51cmx9OiAke2Vyci5tZXNzYWdlfWAsICdzeXN0ZW0nLCBlcnIpO1xyXG5cdFx0XHRfdGhpc1tJTlRFUk5BTFNdLmVycm9yID0gZXJyb3I7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcbkJvZHkucHJvdG90eXBlID0ge1xyXG5cdGdldCBib2R5KCkge1xyXG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTXS5ib2R5O1xyXG5cdH0sXHJcblxyXG5cdGdldCBib2R5VXNlZCgpIHtcclxuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uZGlzdHVyYmVkO1xyXG5cdH0sXHJcblxyXG5cdC8qKlxyXG4gICogRGVjb2RlIHJlc3BvbnNlIGFzIEFycmF5QnVmZmVyXHJcbiAgKlxyXG4gICogQHJldHVybiAgUHJvbWlzZVxyXG4gICovXHJcblx0YXJyYXlCdWZmZXIoKSB7XHJcblx0XHRyZXR1cm4gY29uc3VtZUJvZHkuY2FsbCh0aGlzKS50aGVuKGZ1bmN0aW9uIChidWYpIHtcclxuXHRcdFx0cmV0dXJuIGJ1Zi5idWZmZXIuc2xpY2UoYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlT2Zmc2V0ICsgYnVmLmJ5dGVMZW5ndGgpO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0LyoqXHJcbiAgKiBSZXR1cm4gcmF3IHJlc3BvbnNlIGFzIEJsb2JcclxuICAqXHJcbiAgKiBAcmV0dXJuIFByb21pc2VcclxuICAqL1xyXG5cdGJsb2IoKSB7XHJcblx0XHRsZXQgY3QgPSB0aGlzLmhlYWRlcnMgJiYgdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJyc7XHJcblx0XHRyZXR1cm4gY29uc3VtZUJvZHkuY2FsbCh0aGlzKS50aGVuKGZ1bmN0aW9uIChidWYpIHtcclxuXHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oXHJcblx0XHRcdC8vIFByZXZlbnQgY29weWluZ1xyXG5cdFx0XHRuZXcgQmxvYihbXSwge1xyXG5cdFx0XHRcdHR5cGU6IGN0LnRvTG93ZXJDYXNlKClcclxuXHRcdFx0fSksIHtcclxuXHRcdFx0XHRbQlVGRkVSXTogYnVmXHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0LyoqXHJcbiAgKiBEZWNvZGUgcmVzcG9uc2UgYXMganNvblxyXG4gICpcclxuICAqIEByZXR1cm4gIFByb21pc2VcclxuICAqL1xyXG5cdGpzb24oKSB7XHJcblx0XHR2YXIgX3RoaXMyID0gdGhpcztcclxuXHJcblx0XHRyZXR1cm4gY29uc3VtZUJvZHkuY2FsbCh0aGlzKS50aGVuKGZ1bmN0aW9uIChidWZmZXIpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZShidWZmZXIudG9TdHJpbmcoKSk7XHJcblx0XHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRcdHJldHVybiBCb2R5LlByb21pc2UucmVqZWN0KG5ldyBGZXRjaEVycm9yKGBpbnZhbGlkIGpzb24gcmVzcG9uc2UgYm9keSBhdCAke190aGlzMi51cmx9IHJlYXNvbjogJHtlcnIubWVzc2FnZX1gLCAnaW52YWxpZC1qc29uJykpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHQvKipcclxuICAqIERlY29kZSByZXNwb25zZSBhcyB0ZXh0XHJcbiAgKlxyXG4gICogQHJldHVybiAgUHJvbWlzZVxyXG4gICovXHJcblx0dGV4dCgpIHtcclxuXHRcdHJldHVybiBjb25zdW1lQm9keS5jYWxsKHRoaXMpLnRoZW4oZnVuY3Rpb24gKGJ1ZmZlcikge1xyXG5cdFx0XHRyZXR1cm4gYnVmZmVyLnRvU3RyaW5nKCk7XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHQvKipcclxuICAqIERlY29kZSByZXNwb25zZSBhcyBidWZmZXIgKG5vbi1zcGVjIGFwaSlcclxuICAqXHJcbiAgKiBAcmV0dXJuICBQcm9taXNlXHJcbiAgKi9cclxuXHRidWZmZXIoKSB7XHJcblx0XHRyZXR1cm4gY29uc3VtZUJvZHkuY2FsbCh0aGlzKTtcclxuXHR9LFxyXG5cclxuXHQvKipcclxuICAqIERlY29kZSByZXNwb25zZSBhcyB0ZXh0LCB3aGlsZSBhdXRvbWF0aWNhbGx5IGRldGVjdGluZyB0aGUgZW5jb2RpbmcgYW5kXHJcbiAgKiB0cnlpbmcgdG8gZGVjb2RlIHRvIFVURi04IChub24tc3BlYyBhcGkpXHJcbiAgKlxyXG4gICogQHJldHVybiAgUHJvbWlzZVxyXG4gICovXHJcblx0dGV4dENvbnZlcnRlZCgpIHtcclxuXHRcdHZhciBfdGhpczMgPSB0aGlzO1xyXG5cclxuXHRcdHJldHVybiBjb25zdW1lQm9keS5jYWxsKHRoaXMpLnRoZW4oZnVuY3Rpb24gKGJ1ZmZlcikge1xyXG5cdFx0XHRyZXR1cm4gY29udmVydEJvZHkoYnVmZmVyLCBfdGhpczMuaGVhZGVycyk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn07XHJcblxyXG4vLyBJbiBicm93c2VycywgYWxsIHByb3BlcnRpZXMgYXJlIGVudW1lcmFibGUuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEJvZHkucHJvdG90eXBlLCB7XHJcblx0Ym9keTogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXHJcblx0Ym9keVVzZWQ6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdGFycmF5QnVmZmVyOiB7IGVudW1lcmFibGU6IHRydWUgfSxcclxuXHRibG9iOiB7IGVudW1lcmFibGU6IHRydWUgfSxcclxuXHRqc29uOiB7IGVudW1lcmFibGU6IHRydWUgfSxcclxuXHR0ZXh0OiB7IGVudW1lcmFibGU6IHRydWUgfVxyXG59KTtcclxuXHJcbkJvZHkubWl4SW4gPSBmdW5jdGlvbiAocHJvdG8pIHtcclxuXHRmb3IgKGNvbnN0IG5hbWUgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoQm9keS5wcm90b3R5cGUpKSB7XHJcblx0XHQvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZTogZnV0dXJlIHByb29mXHJcblx0XHRpZiAoIShuYW1lIGluIHByb3RvKSkge1xyXG5cdFx0XHRjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihCb2R5LnByb3RvdHlwZSwgbmFtZSk7XHJcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgbmFtZSwgZGVzYyk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENvbnN1bWUgYW5kIGNvbnZlcnQgYW4gZW50aXJlIEJvZHkgdG8gYSBCdWZmZXIuXHJcbiAqXHJcbiAqIFJlZjogaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI2NvbmNlcHQtYm9keS1jb25zdW1lLWJvZHlcclxuICpcclxuICogQHJldHVybiAgUHJvbWlzZVxyXG4gKi9cclxuZnVuY3Rpb24gY29uc3VtZUJvZHkoKSB7XHJcblx0dmFyIF90aGlzNCA9IHRoaXM7XHJcblxyXG5cdGlmICh0aGlzW0lOVEVSTkFMU10uZGlzdHVyYmVkKSB7XHJcblx0XHRyZXR1cm4gQm9keS5Qcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKGBib2R5IHVzZWQgYWxyZWFkeSBmb3I6ICR7dGhpcy51cmx9YCkpO1xyXG5cdH1cclxuXHJcblx0dGhpc1tJTlRFUk5BTFNdLmRpc3R1cmJlZCA9IHRydWU7XHJcblxyXG5cdGlmICh0aGlzW0lOVEVSTkFMU10uZXJyb3IpIHtcclxuXHRcdHJldHVybiBCb2R5LlByb21pc2UucmVqZWN0KHRoaXNbSU5URVJOQUxTXS5lcnJvcik7XHJcblx0fVxyXG5cclxuXHRsZXQgYm9keSA9IHRoaXMuYm9keTtcclxuXHJcblx0Ly8gYm9keSBpcyBudWxsXHJcblx0aWYgKGJvZHkgPT09IG51bGwpIHtcclxuXHRcdHJldHVybiBCb2R5LlByb21pc2UucmVzb2x2ZShCdWZmZXIuYWxsb2MoMCkpO1xyXG5cdH1cclxuXHJcblx0Ly8gYm9keSBpcyBibG9iXHJcblx0aWYgKGlzQmxvYihib2R5KSkge1xyXG5cdFx0Ym9keSA9IGJvZHkuc3RyZWFtKCk7XHJcblx0fVxyXG5cclxuXHQvLyBib2R5IGlzIGJ1ZmZlclxyXG5cdGlmIChCdWZmZXIuaXNCdWZmZXIoYm9keSkpIHtcclxuXHRcdHJldHVybiBCb2R5LlByb21pc2UucmVzb2x2ZShib2R5KTtcclxuXHR9XHJcblxyXG5cdC8vIGlzdGFuYnVsIGlnbm9yZSBpZjogc2hvdWxkIG5ldmVyIGhhcHBlblxyXG5cdGlmICghKGJvZHkgaW5zdGFuY2VvZiBTdHJlYW0pKSB7XHJcblx0XHRyZXR1cm4gQm9keS5Qcm9taXNlLnJlc29sdmUoQnVmZmVyLmFsbG9jKDApKTtcclxuXHR9XHJcblxyXG5cdC8vIGJvZHkgaXMgc3RyZWFtXHJcblx0Ly8gZ2V0IHJlYWR5IHRvIGFjdHVhbGx5IGNvbnN1bWUgdGhlIGJvZHlcclxuXHRsZXQgYWNjdW0gPSBbXTtcclxuXHRsZXQgYWNjdW1CeXRlcyA9IDA7XHJcblx0bGV0IGFib3J0ID0gZmFsc2U7XHJcblxyXG5cdHJldHVybiBuZXcgQm9keS5Qcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdGxldCByZXNUaW1lb3V0O1xyXG5cclxuXHRcdC8vIGFsbG93IHRpbWVvdXQgb24gc2xvdyByZXNwb25zZSBib2R5XHJcblx0XHRpZiAoX3RoaXM0LnRpbWVvdXQpIHtcclxuXHRcdFx0cmVzVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGFib3J0ID0gdHJ1ZTtcclxuXHRcdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYFJlc3BvbnNlIHRpbWVvdXQgd2hpbGUgdHJ5aW5nIHRvIGZldGNoICR7X3RoaXM0LnVybH0gKG92ZXIgJHtfdGhpczQudGltZW91dH1tcylgLCAnYm9keS10aW1lb3V0JykpO1xyXG5cdFx0XHR9LCBfdGhpczQudGltZW91dCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaGFuZGxlIHN0cmVhbSBlcnJvcnNcclxuXHRcdGJvZHkub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycikge1xyXG5cdFx0XHRpZiAoZXJyLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xyXG5cdFx0XHRcdC8vIGlmIHRoZSByZXF1ZXN0IHdhcyBhYm9ydGVkLCByZWplY3Qgd2l0aCB0aGlzIEVycm9yXHJcblx0XHRcdFx0YWJvcnQgPSB0cnVlO1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIG90aGVyIGVycm9ycywgc3VjaCBhcyBpbmNvcnJlY3QgY29udGVudC1lbmNvZGluZ1xyXG5cdFx0XHRcdHJlamVjdChuZXcgRmV0Y2hFcnJvcihgSW52YWxpZCByZXNwb25zZSBib2R5IHdoaWxlIHRyeWluZyB0byBmZXRjaCAke190aGlzNC51cmx9OiAke2Vyci5tZXNzYWdlfWAsICdzeXN0ZW0nLCBlcnIpKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ym9keS5vbignZGF0YScsIGZ1bmN0aW9uIChjaHVuaykge1xyXG5cdFx0XHRpZiAoYWJvcnQgfHwgY2h1bmsgPT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChfdGhpczQuc2l6ZSAmJiBhY2N1bUJ5dGVzICsgY2h1bmsubGVuZ3RoID4gX3RoaXM0LnNpemUpIHtcclxuXHRcdFx0XHRhYm9ydCA9IHRydWU7XHJcblx0XHRcdFx0cmVqZWN0KG5ldyBGZXRjaEVycm9yKGBjb250ZW50IHNpemUgYXQgJHtfdGhpczQudXJsfSBvdmVyIGxpbWl0OiAke190aGlzNC5zaXplfWAsICdtYXgtc2l6ZScpKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGFjY3VtQnl0ZXMgKz0gY2h1bmsubGVuZ3RoO1xyXG5cdFx0XHRhY2N1bS5wdXNoKGNodW5rKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGJvZHkub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYgKGFib3J0KSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjbGVhclRpbWVvdXQocmVzVGltZW91dCk7XHJcblxyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdHJlc29sdmUoQnVmZmVyLmNvbmNhdChhY2N1bSwgYWNjdW1CeXRlcykpO1xyXG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0XHQvLyBoYW5kbGUgc3RyZWFtcyB0aGF0IGhhdmUgYWNjdW11bGF0ZWQgdG9vIG11Y2ggZGF0YSAoaXNzdWUgIzQxNClcclxuXHRcdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYENvdWxkIG5vdCBjcmVhdGUgQnVmZmVyIGZyb20gcmVzcG9uc2UgYm9keSBmb3IgJHtfdGhpczQudXJsfTogJHtlcnIubWVzc2FnZX1gLCAnc3lzdGVtJywgZXJyKSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogRGV0ZWN0IGJ1ZmZlciBlbmNvZGluZyBhbmQgY29udmVydCB0byB0YXJnZXQgZW5jb2RpbmdcclxuICogcmVmOiBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDExL1dELWh0bWw1LTIwMTEwMTEzL3BhcnNpbmcuaHRtbCNkZXRlcm1pbmluZy10aGUtY2hhcmFjdGVyLWVuY29kaW5nXHJcbiAqXHJcbiAqIEBwYXJhbSAgIEJ1ZmZlciAgYnVmZmVyICAgIEluY29taW5nIGJ1ZmZlclxyXG4gKiBAcGFyYW0gICBTdHJpbmcgIGVuY29kaW5nICBUYXJnZXQgZW5jb2RpbmdcclxuICogQHJldHVybiAgU3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBjb252ZXJ0Qm9keShidWZmZXIsIGhlYWRlcnMpIHtcclxuXHRpZiAodHlwZW9mIGNvbnZlcnQgIT09ICdmdW5jdGlvbicpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcignVGhlIHBhY2thZ2UgYGVuY29kaW5nYCBtdXN0IGJlIGluc3RhbGxlZCB0byB1c2UgdGhlIHRleHRDb252ZXJ0ZWQoKSBmdW5jdGlvbicpO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgY3QgPSBoZWFkZXJzLmdldCgnY29udGVudC10eXBlJyk7XHJcblx0bGV0IGNoYXJzZXQgPSAndXRmLTgnO1xyXG5cdGxldCByZXMsIHN0cjtcclxuXHJcblx0Ly8gaGVhZGVyXHJcblx0aWYgKGN0KSB7XHJcblx0XHRyZXMgPSAvY2hhcnNldD0oW147XSopL2kuZXhlYyhjdCk7XHJcblx0fVxyXG5cclxuXHQvLyBubyBjaGFyc2V0IGluIGNvbnRlbnQgdHlwZSwgcGVlayBhdCByZXNwb25zZSBib2R5IGZvciBhdCBtb3N0IDEwMjQgYnl0ZXNcclxuXHRzdHIgPSBidWZmZXIuc2xpY2UoMCwgMTAyNCkudG9TdHJpbmcoKTtcclxuXHJcblx0Ly8gaHRtbDVcclxuXHRpZiAoIXJlcyAmJiBzdHIpIHtcclxuXHRcdHJlcyA9IC88bWV0YS4rP2NoYXJzZXQ9KFsnXCJdKSguKz8pXFwxL2kuZXhlYyhzdHIpO1xyXG5cdH1cclxuXHJcblx0Ly8gaHRtbDRcclxuXHRpZiAoIXJlcyAmJiBzdHIpIHtcclxuXHRcdHJlcyA9IC88bWV0YVtcXHNdKz9odHRwLWVxdWl2PShbJ1wiXSljb250ZW50LXR5cGVcXDFbXFxzXSs/Y29udGVudD0oWydcIl0pKC4rPylcXDIvaS5leGVjKHN0cik7XHJcblxyXG5cdFx0aWYgKHJlcykge1xyXG5cdFx0XHRyZXMgPSAvY2hhcnNldD0oLiopL2kuZXhlYyhyZXMucG9wKCkpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8geG1sXHJcblx0aWYgKCFyZXMgJiYgc3RyKSB7XHJcblx0XHRyZXMgPSAvPFxcP3htbC4rP2VuY29kaW5nPShbJ1wiXSkoLis/KVxcMS9pLmV4ZWMoc3RyKTtcclxuXHR9XHJcblxyXG5cdC8vIGZvdW5kIGNoYXJzZXRcclxuXHRpZiAocmVzKSB7XHJcblx0XHRjaGFyc2V0ID0gcmVzLnBvcCgpO1xyXG5cclxuXHRcdC8vIHByZXZlbnQgZGVjb2RlIGlzc3VlcyB3aGVuIHNpdGVzIHVzZSBpbmNvcnJlY3QgZW5jb2RpbmdcclxuXHRcdC8vIHJlZjogaHR0cHM6Ly9oc2l2b25lbi5maS9lbmNvZGluZy1tZW51L1xyXG5cdFx0aWYgKGNoYXJzZXQgPT09ICdnYjIzMTInIHx8IGNoYXJzZXQgPT09ICdnYmsnKSB7XHJcblx0XHRcdGNoYXJzZXQgPSAnZ2IxODAzMCc7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyB0dXJuIHJhdyBidWZmZXJzIGludG8gYSBzaW5nbGUgdXRmLTggYnVmZmVyXHJcblx0cmV0dXJuIGNvbnZlcnQoYnVmZmVyLCAnVVRGLTgnLCBjaGFyc2V0KS50b1N0cmluZygpO1xyXG59XHJcblxyXG4vKipcclxuICogRGV0ZWN0IGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxyXG4gKiByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRpbm4vbm9kZS1mZXRjaC9pc3N1ZXMvMjk2I2lzc3VlY29tbWVudC0zMDc1OTgxNDNcclxuICpcclxuICogQHBhcmFtICAgT2JqZWN0ICBvYmogICAgIE9iamVjdCB0byBkZXRlY3QgYnkgdHlwZSBvciBicmFuZFxyXG4gKiBAcmV0dXJuICBTdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKG9iaikge1xyXG5cdC8vIER1Y2stdHlwaW5nIGFzIGEgbmVjZXNzYXJ5IGNvbmRpdGlvbi5cclxuXHRpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIG9iai5hcHBlbmQgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIG9iai5kZWxldGUgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIG9iai5nZXQgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIG9iai5nZXRBbGwgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIG9iai5oYXMgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIG9iai5zZXQgIT09ICdmdW5jdGlvbicpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8vIEJyYW5kLWNoZWNraW5nIGFuZCBtb3JlIGR1Y2stdHlwaW5nIGFzIG9wdGlvbmFsIGNvbmRpdGlvbi5cclxuXHRyZXR1cm4gb2JqLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdVUkxTZWFyY2hQYXJhbXMnIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBVUkxTZWFyY2hQYXJhbXNdJyB8fCB0eXBlb2Ygb2JqLnNvcnQgPT09ICdmdW5jdGlvbic7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIFczQyBgQmxvYmAgb2JqZWN0ICh3aGljaCBgRmlsZWAgaW5oZXJpdHMgZnJvbSlcclxuICogQHBhcmFtICB7Kn0gb2JqXHJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBpc0Jsb2Iob2JqKSB7XHJcblx0cmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmouYXJyYXlCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai50eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlb2Ygb2JqLnN0cmVhbSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IubmFtZSA9PT0gJ3N0cmluZycgJiYgL14oQmxvYnxGaWxlKSQvLnRlc3Qob2JqLmNvbnN0cnVjdG9yLm5hbWUpICYmIC9eKEJsb2J8RmlsZSkkLy50ZXN0KG9ialtTeW1ib2wudG9TdHJpbmdUYWddKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENsb25lIGJvZHkgZ2l2ZW4gUmVzL1JlcSBpbnN0YW5jZVxyXG4gKlxyXG4gKiBAcGFyYW0gICBNaXhlZCAgaW5zdGFuY2UgIFJlc3BvbnNlIG9yIFJlcXVlc3QgaW5zdGFuY2VcclxuICogQHJldHVybiAgTWl4ZWRcclxuICovXHJcbmZ1bmN0aW9uIGNsb25lKGluc3RhbmNlKSB7XHJcblx0bGV0IHAxLCBwMjtcclxuXHRsZXQgYm9keSA9IGluc3RhbmNlLmJvZHk7XHJcblxyXG5cdC8vIGRvbid0IGFsbG93IGNsb25pbmcgYSB1c2VkIGJvZHlcclxuXHRpZiAoaW5zdGFuY2UuYm9keVVzZWQpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcignY2Fubm90IGNsb25lIGJvZHkgYWZ0ZXIgaXQgaXMgdXNlZCcpO1xyXG5cdH1cclxuXHJcblx0Ly8gY2hlY2sgdGhhdCBib2R5IGlzIGEgc3RyZWFtIGFuZCBub3QgZm9ybS1kYXRhIG9iamVjdFxyXG5cdC8vIG5vdGU6IHdlIGNhbid0IGNsb25lIHRoZSBmb3JtLWRhdGEgb2JqZWN0IHdpdGhvdXQgaGF2aW5nIGl0IGFzIGEgZGVwZW5kZW5jeVxyXG5cdGlmIChib2R5IGluc3RhbmNlb2YgU3RyZWFtICYmIHR5cGVvZiBib2R5LmdldEJvdW5kYXJ5ICE9PSAnZnVuY3Rpb24nKSB7XHJcblx0XHQvLyB0ZWUgaW5zdGFuY2UgYm9keVxyXG5cdFx0cDEgPSBuZXcgUGFzc1Rocm91Z2goKTtcclxuXHRcdHAyID0gbmV3IFBhc3NUaHJvdWdoKCk7XHJcblx0XHRib2R5LnBpcGUocDEpO1xyXG5cdFx0Ym9keS5waXBlKHAyKTtcclxuXHRcdC8vIHNldCBpbnN0YW5jZSBib2R5IHRvIHRlZWQgYm9keSBhbmQgcmV0dXJuIHRoZSBvdGhlciB0ZWVkIGJvZHlcclxuXHRcdGluc3RhbmNlW0lOVEVSTkFMU10uYm9keSA9IHAxO1xyXG5cdFx0Ym9keSA9IHAyO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGJvZHk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtcyB0aGUgb3BlcmF0aW9uIFwiZXh0cmFjdCBhIGBDb250ZW50LVR5cGVgIHZhbHVlIGZyb20gfG9iamVjdHxcIiBhc1xyXG4gKiBzcGVjaWZpZWQgaW4gdGhlIHNwZWNpZmljYXRpb246XHJcbiAqIGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNjb25jZXB0LWJvZHlpbml0LWV4dHJhY3RcclxuICpcclxuICogVGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgaW5zdGFuY2UuYm9keSBpcyBwcmVzZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gICBNaXhlZCAgaW5zdGFuY2UgIEFueSBvcHRpb25zLmJvZHkgaW5wdXRcclxuICovXHJcbmZ1bmN0aW9uIGV4dHJhY3RDb250ZW50VHlwZShib2R5KSB7XHJcblx0aWYgKGJvZHkgPT09IG51bGwpIHtcclxuXHRcdC8vIGJvZHkgaXMgbnVsbFxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdC8vIGJvZHkgaXMgc3RyaW5nXHJcblx0XHRyZXR1cm4gJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCc7XHJcblx0fSBlbHNlIGlmIChpc1VSTFNlYXJjaFBhcmFtcyhib2R5KSkge1xyXG5cdFx0Ly8gYm9keSBpcyBhIFVSTFNlYXJjaFBhcmFtc1xyXG5cdFx0cmV0dXJuICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCc7XHJcblx0fSBlbHNlIGlmIChpc0Jsb2IoYm9keSkpIHtcclxuXHRcdC8vIGJvZHkgaXMgYmxvYlxyXG5cdFx0cmV0dXJuIGJvZHkudHlwZSB8fCBudWxsO1xyXG5cdH0gZWxzZSBpZiAoQnVmZmVyLmlzQnVmZmVyKGJvZHkpKSB7XHJcblx0XHQvLyBib2R5IGlzIGJ1ZmZlclxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fSBlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYm9keSkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXScpIHtcclxuXHRcdC8vIGJvZHkgaXMgQXJyYXlCdWZmZXJcclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH0gZWxzZSBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGJvZHkpKSB7XHJcblx0XHQvLyBib2R5IGlzIEFycmF5QnVmZmVyVmlld1xyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fSBlbHNlIGlmICh0eXBlb2YgYm9keS5nZXRCb3VuZGFyeSA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0Ly8gZGV0ZWN0IGZvcm0gZGF0YSBpbnB1dCBmcm9tIGZvcm0tZGF0YSBtb2R1bGVcclxuXHRcdHJldHVybiBgbXVsdGlwYXJ0L2Zvcm0tZGF0YTtib3VuZGFyeT0ke2JvZHkuZ2V0Qm91bmRhcnkoKX1gO1xyXG5cdH0gZWxzZSBpZiAoYm9keSBpbnN0YW5jZW9mIFN0cmVhbSkge1xyXG5cdFx0Ly8gYm9keSBpcyBzdHJlYW1cclxuXHRcdC8vIGNhbid0IHJlYWxseSBkbyBtdWNoIGFib3V0IHRoaXNcclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyBCb2R5IGNvbnN0cnVjdG9yIGRlZmF1bHRzIG90aGVyIHRoaW5ncyB0byBzdHJpbmdcclxuXHRcdHJldHVybiAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgRmV0Y2ggU3RhbmRhcmQgdHJlYXRzIHRoaXMgYXMgaWYgXCJ0b3RhbCBieXRlc1wiIGlzIGEgcHJvcGVydHkgb24gdGhlIGJvZHkuXHJcbiAqIEZvciB1cywgd2UgaGF2ZSB0byBleHBsaWNpdGx5IGdldCBpdCB3aXRoIGEgZnVuY3Rpb24uXHJcbiAqXHJcbiAqIHJlZjogaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI2NvbmNlcHQtYm9keS10b3RhbC1ieXRlc1xyXG4gKlxyXG4gKiBAcGFyYW0gICBCb2R5ICAgIGluc3RhbmNlICAgSW5zdGFuY2Ugb2YgQm9keVxyXG4gKiBAcmV0dXJuICBOdW1iZXI/ICAgICAgICAgICAgTnVtYmVyIG9mIGJ5dGVzLCBvciBudWxsIGlmIG5vdCBwb3NzaWJsZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0VG90YWxCeXRlcyhpbnN0YW5jZSkge1xyXG5cdGNvbnN0IGJvZHkgPSBpbnN0YW5jZS5ib2R5O1xyXG5cclxuXHJcblx0aWYgKGJvZHkgPT09IG51bGwpIHtcclxuXHRcdC8vIGJvZHkgaXMgbnVsbFxyXG5cdFx0cmV0dXJuIDA7XHJcblx0fSBlbHNlIGlmIChpc0Jsb2IoYm9keSkpIHtcclxuXHRcdHJldHVybiBib2R5LnNpemU7XHJcblx0fSBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIoYm9keSkpIHtcclxuXHRcdC8vIGJvZHkgaXMgYnVmZmVyXHJcblx0XHRyZXR1cm4gYm9keS5sZW5ndGg7XHJcblx0fSBlbHNlIGlmIChib2R5ICYmIHR5cGVvZiBib2R5LmdldExlbmd0aFN5bmMgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdC8vIGRldGVjdCBmb3JtIGRhdGEgaW5wdXQgZnJvbSBmb3JtLWRhdGEgbW9kdWxlXHJcblx0XHRpZiAoYm9keS5fbGVuZ3RoUmV0cmlldmVycyAmJiBib2R5Ll9sZW5ndGhSZXRyaWV2ZXJzLmxlbmd0aCA9PSAwIHx8IC8vIDEueFxyXG5cdFx0Ym9keS5oYXNLbm93bkxlbmd0aCAmJiBib2R5Lmhhc0tub3duTGVuZ3RoKCkpIHtcclxuXHRcdFx0Ly8gMi54XHJcblx0XHRcdHJldHVybiBib2R5LmdldExlbmd0aFN5bmMoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyBib2R5IGlzIHN0cmVhbVxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogV3JpdGUgYSBCb2R5IHRvIGEgTm9kZS5qcyBXcml0YWJsZVN0cmVhbSAoZS5nLiBodHRwLlJlcXVlc3QpIG9iamVjdC5cclxuICpcclxuICogQHBhcmFtICAgQm9keSAgICBpbnN0YW5jZSAgIEluc3RhbmNlIG9mIEJvZHlcclxuICogQHJldHVybiAgVm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gd3JpdGVUb1N0cmVhbShkZXN0LCBpbnN0YW5jZSkge1xyXG5cdGNvbnN0IGJvZHkgPSBpbnN0YW5jZS5ib2R5O1xyXG5cclxuXHJcblx0aWYgKGJvZHkgPT09IG51bGwpIHtcclxuXHRcdC8vIGJvZHkgaXMgbnVsbFxyXG5cdFx0ZGVzdC5lbmQoKTtcclxuXHR9IGVsc2UgaWYgKGlzQmxvYihib2R5KSkge1xyXG5cdFx0Ym9keS5zdHJlYW0oKS5waXBlKGRlc3QpO1xyXG5cdH0gZWxzZSBpZiAoQnVmZmVyLmlzQnVmZmVyKGJvZHkpKSB7XHJcblx0XHQvLyBib2R5IGlzIGJ1ZmZlclxyXG5cdFx0ZGVzdC53cml0ZShib2R5KTtcclxuXHRcdGRlc3QuZW5kKCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdC8vIGJvZHkgaXMgc3RyZWFtXHJcblx0XHRib2R5LnBpcGUoZGVzdCk7XHJcblx0fVxyXG59XHJcblxyXG4vLyBleHBvc2UgUHJvbWlzZVxyXG5Cb2R5LlByb21pc2UgPSBnbG9iYWwuUHJvbWlzZTtcclxuXHJcbi8qKlxyXG4gKiBoZWFkZXJzLmpzXHJcbiAqXHJcbiAqIEhlYWRlcnMgY2xhc3Mgb2ZmZXJzIGNvbnZlbmllbnQgaGVscGVyc1xyXG4gKi9cclxuXHJcbmNvbnN0IGludmFsaWRUb2tlblJlZ2V4ID0gL1teXFxeX2BhLXpBLVpcXC0wLTkhIyQlJicqKy58fl0vO1xyXG5jb25zdCBpbnZhbGlkSGVhZGVyQ2hhclJlZ2V4ID0gL1teXFx0XFx4MjAtXFx4N2VcXHg4MC1cXHhmZl0vO1xyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVOYW1lKG5hbWUpIHtcclxuXHRuYW1lID0gYCR7bmFtZX1gO1xyXG5cdGlmIChpbnZhbGlkVG9rZW5SZWdleC50ZXN0KG5hbWUpIHx8IG5hbWUgPT09ICcnKSB7XHJcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGAke25hbWV9IGlzIG5vdCBhIGxlZ2FsIEhUVFAgaGVhZGVyIG5hbWVgKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlVmFsdWUodmFsdWUpIHtcclxuXHR2YWx1ZSA9IGAke3ZhbHVlfWA7XHJcblx0aWYgKGludmFsaWRIZWFkZXJDaGFyUmVnZXgudGVzdCh2YWx1ZSkpIHtcclxuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYCR7dmFsdWV9IGlzIG5vdCBhIGxlZ2FsIEhUVFAgaGVhZGVyIHZhbHVlYCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRmluZCB0aGUga2V5IGluIHRoZSBtYXAgb2JqZWN0IGdpdmVuIGEgaGVhZGVyIG5hbWUuXHJcbiAqXHJcbiAqIFJldHVybnMgdW5kZWZpbmVkIGlmIG5vdCBmb3VuZC5cclxuICpcclxuICogQHBhcmFtICAgU3RyaW5nICBuYW1lICBIZWFkZXIgbmFtZVxyXG4gKiBAcmV0dXJuICBTdHJpbmd8VW5kZWZpbmVkXHJcbiAqL1xyXG5mdW5jdGlvbiBmaW5kKG1hcCwgbmFtZSkge1xyXG5cdG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XHJcblx0Zm9yIChjb25zdCBrZXkgaW4gbWFwKSB7XHJcblx0XHRpZiAoa2V5LnRvTG93ZXJDYXNlKCkgPT09IG5hbWUpIHtcclxuXHRcdFx0cmV0dXJuIGtleTtcclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5cclxuY29uc3QgTUFQID0gU3ltYm9sKCdtYXAnKTtcclxuY2xhc3MgSGVhZGVycyB7XHJcblx0LyoqXHJcbiAgKiBIZWFkZXJzIGNsYXNzXHJcbiAgKlxyXG4gICogQHBhcmFtICAgT2JqZWN0ICBoZWFkZXJzICBSZXNwb25zZSBoZWFkZXJzXHJcbiAgKiBAcmV0dXJuICBWb2lkXHJcbiAgKi9cclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdGxldCBpbml0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQ7XHJcblxyXG5cdFx0dGhpc1tNQVBdID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcblx0XHRpZiAoaW5pdCBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcclxuXHRcdFx0Y29uc3QgcmF3SGVhZGVycyA9IGluaXQucmF3KCk7XHJcblx0XHRcdGNvbnN0IGhlYWRlck5hbWVzID0gT2JqZWN0LmtleXMocmF3SGVhZGVycyk7XHJcblxyXG5cdFx0XHRmb3IgKGNvbnN0IGhlYWRlck5hbWUgb2YgaGVhZGVyTmFtZXMpIHtcclxuXHRcdFx0XHRmb3IgKGNvbnN0IHZhbHVlIG9mIHJhd0hlYWRlcnNbaGVhZGVyTmFtZV0pIHtcclxuXHRcdFx0XHRcdHRoaXMuYXBwZW5kKGhlYWRlck5hbWUsIHZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXZSBkb24ndCB3b3JyeSBhYm91dCBjb252ZXJ0aW5nIHByb3AgdG8gQnl0ZVN0cmluZyBoZXJlIGFzIGFwcGVuZCgpXHJcblx0XHQvLyB3aWxsIGhhbmRsZSBpdC5cclxuXHRcdGlmIChpbml0ID09IG51bGwpIDsgZWxzZSBpZiAodHlwZW9mIGluaXQgPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdGNvbnN0IG1ldGhvZCA9IGluaXRbU3ltYm9sLml0ZXJhdG9yXTtcclxuXHRcdFx0aWYgKG1ldGhvZCAhPSBudWxsKSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBtZXRob2QgIT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0hlYWRlciBwYWlycyBtdXN0IGJlIGl0ZXJhYmxlJyk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBzZXF1ZW5jZTxzZXF1ZW5jZTxCeXRlU3RyaW5nPj5cclxuXHRcdFx0XHQvLyBOb3RlOiBwZXIgc3BlYyB3ZSBoYXZlIHRvIGZpcnN0IGV4aGF1c3QgdGhlIGxpc3RzIHRoZW4gcHJvY2VzcyB0aGVtXHJcblx0XHRcdFx0Y29uc3QgcGFpcnMgPSBbXTtcclxuXHRcdFx0XHRmb3IgKGNvbnN0IHBhaXIgb2YgaW5pdCkge1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBwYWlyICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgcGFpcltTeW1ib2wuaXRlcmF0b3JdICE9PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0VhY2ggaGVhZGVyIHBhaXIgbXVzdCBiZSBpdGVyYWJsZScpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cGFpcnMucHVzaChBcnJheS5mcm9tKHBhaXIpKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xyXG5cdFx0XHRcdFx0aWYgKHBhaXIubGVuZ3RoICE9PSAyKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0VhY2ggaGVhZGVyIHBhaXIgbXVzdCBiZSBhIG5hbWUvdmFsdWUgdHVwbGUnKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHRoaXMuYXBwZW5kKHBhaXJbMF0sIHBhaXJbMV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyByZWNvcmQ8Qnl0ZVN0cmluZywgQnl0ZVN0cmluZz5cclxuXHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhpbml0KSkge1xyXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBpbml0W2tleV07XHJcblx0XHRcdFx0XHR0aGlzLmFwcGVuZChrZXksIHZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb3ZpZGVkIGluaXRpYWxpemVyIG11c3QgYmUgYW4gb2JqZWN0Jyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuICAqIFJldHVybiBjb21iaW5lZCBoZWFkZXIgdmFsdWUgZ2l2ZW4gbmFtZVxyXG4gICpcclxuICAqIEBwYXJhbSAgIFN0cmluZyAgbmFtZSAgSGVhZGVyIG5hbWVcclxuICAqIEByZXR1cm4gIE1peGVkXHJcbiAgKi9cclxuXHRnZXQobmFtZSkge1xyXG5cdFx0bmFtZSA9IGAke25hbWV9YDtcclxuXHRcdHZhbGlkYXRlTmFtZShuYW1lKTtcclxuXHRcdGNvbnN0IGtleSA9IGZpbmQodGhpc1tNQVBdLCBuYW1lKTtcclxuXHRcdGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpc1tNQVBdW2tleV0uam9pbignLCAnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG4gICogSXRlcmF0ZSBvdmVyIGFsbCBoZWFkZXJzXHJcbiAgKlxyXG4gICogQHBhcmFtICAgRnVuY3Rpb24gIGNhbGxiYWNrICBFeGVjdXRlZCBmb3IgZWFjaCBpdGVtIHdpdGggcGFyYW1ldGVycyAodmFsdWUsIG5hbWUsIHRoaXNBcmcpXHJcbiAgKiBAcGFyYW0gICBCb29sZWFuICAgdGhpc0FyZyAgIGB0aGlzYCBjb250ZXh0IGZvciBjYWxsYmFjayBmdW5jdGlvblxyXG4gICogQHJldHVybiAgVm9pZFxyXG4gICovXHJcblx0Zm9yRWFjaChjYWxsYmFjaykge1xyXG5cdFx0bGV0IHRoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcclxuXHJcblx0XHRsZXQgcGFpcnMgPSBnZXRIZWFkZXJzKHRoaXMpO1xyXG5cdFx0bGV0IGkgPSAwO1xyXG5cdFx0d2hpbGUgKGkgPCBwYWlycy5sZW5ndGgpIHtcclxuXHRcdFx0dmFyIF9wYWlycyRpID0gcGFpcnNbaV07XHJcblx0XHRcdGNvbnN0IG5hbWUgPSBfcGFpcnMkaVswXSxcclxuXHRcdFx0ICAgICAgdmFsdWUgPSBfcGFpcnMkaVsxXTtcclxuXHJcblx0XHRcdGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIG5hbWUsIHRoaXMpO1xyXG5cdFx0XHRwYWlycyA9IGdldEhlYWRlcnModGhpcyk7XHJcblx0XHRcdGkrKztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG4gICogT3ZlcndyaXRlIGhlYWRlciB2YWx1ZXMgZ2l2ZW4gbmFtZVxyXG4gICpcclxuICAqIEBwYXJhbSAgIFN0cmluZyAgbmFtZSAgIEhlYWRlciBuYW1lXHJcbiAgKiBAcGFyYW0gICBTdHJpbmcgIHZhbHVlICBIZWFkZXIgdmFsdWVcclxuICAqIEByZXR1cm4gIFZvaWRcclxuICAqL1xyXG5cdHNldChuYW1lLCB2YWx1ZSkge1xyXG5cdFx0bmFtZSA9IGAke25hbWV9YDtcclxuXHRcdHZhbHVlID0gYCR7dmFsdWV9YDtcclxuXHRcdHZhbGlkYXRlTmFtZShuYW1lKTtcclxuXHRcdHZhbGlkYXRlVmFsdWUodmFsdWUpO1xyXG5cdFx0Y29uc3Qga2V5ID0gZmluZCh0aGlzW01BUF0sIG5hbWUpO1xyXG5cdFx0dGhpc1tNQVBdW2tleSAhPT0gdW5kZWZpbmVkID8ga2V5IDogbmFtZV0gPSBbdmFsdWVdO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcbiAgKiBBcHBlbmQgYSB2YWx1ZSBvbnRvIGV4aXN0aW5nIGhlYWRlclxyXG4gICpcclxuICAqIEBwYXJhbSAgIFN0cmluZyAgbmFtZSAgIEhlYWRlciBuYW1lXHJcbiAgKiBAcGFyYW0gICBTdHJpbmcgIHZhbHVlICBIZWFkZXIgdmFsdWVcclxuICAqIEByZXR1cm4gIFZvaWRcclxuICAqL1xyXG5cdGFwcGVuZChuYW1lLCB2YWx1ZSkge1xyXG5cdFx0bmFtZSA9IGAke25hbWV9YDtcclxuXHRcdHZhbHVlID0gYCR7dmFsdWV9YDtcclxuXHRcdHZhbGlkYXRlTmFtZShuYW1lKTtcclxuXHRcdHZhbGlkYXRlVmFsdWUodmFsdWUpO1xyXG5cdFx0Y29uc3Qga2V5ID0gZmluZCh0aGlzW01BUF0sIG5hbWUpO1xyXG5cdFx0aWYgKGtleSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHRoaXNbTUFQXVtrZXldLnB1c2godmFsdWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpc1tNQVBdW25hbWVdID0gW3ZhbHVlXTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG4gICogQ2hlY2sgZm9yIGhlYWRlciBuYW1lIGV4aXN0ZW5jZVxyXG4gICpcclxuICAqIEBwYXJhbSAgIFN0cmluZyAgIG5hbWUgIEhlYWRlciBuYW1lXHJcbiAgKiBAcmV0dXJuICBCb29sZWFuXHJcbiAgKi9cclxuXHRoYXMobmFtZSkge1xyXG5cdFx0bmFtZSA9IGAke25hbWV9YDtcclxuXHRcdHZhbGlkYXRlTmFtZShuYW1lKTtcclxuXHRcdHJldHVybiBmaW5kKHRoaXNbTUFQXSwgbmFtZSkgIT09IHVuZGVmaW5lZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG4gICogRGVsZXRlIGFsbCBoZWFkZXIgdmFsdWVzIGdpdmVuIG5hbWVcclxuICAqXHJcbiAgKiBAcGFyYW0gICBTdHJpbmcgIG5hbWUgIEhlYWRlciBuYW1lXHJcbiAgKiBAcmV0dXJuICBWb2lkXHJcbiAgKi9cclxuXHRkZWxldGUobmFtZSkge1xyXG5cdFx0bmFtZSA9IGAke25hbWV9YDtcclxuXHRcdHZhbGlkYXRlTmFtZShuYW1lKTtcclxuXHRcdGNvbnN0IGtleSA9IGZpbmQodGhpc1tNQVBdLCBuYW1lKTtcclxuXHRcdGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRkZWxldGUgdGhpc1tNQVBdW2tleV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuICAqIFJldHVybiByYXcgaGVhZGVycyAobm9uLXNwZWMgYXBpKVxyXG4gICpcclxuICAqIEByZXR1cm4gIE9iamVjdFxyXG4gICovXHJcblx0cmF3KCkge1xyXG5cdFx0cmV0dXJuIHRoaXNbTUFQXTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG4gICogR2V0IGFuIGl0ZXJhdG9yIG9uIGtleXMuXHJcbiAgKlxyXG4gICogQHJldHVybiAgSXRlcmF0b3JcclxuICAqL1xyXG5cdGtleXMoKSB7XHJcblx0XHRyZXR1cm4gY3JlYXRlSGVhZGVyc0l0ZXJhdG9yKHRoaXMsICdrZXknKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG4gICogR2V0IGFuIGl0ZXJhdG9yIG9uIHZhbHVlcy5cclxuICAqXHJcbiAgKiBAcmV0dXJuICBJdGVyYXRvclxyXG4gICovXHJcblx0dmFsdWVzKCkge1xyXG5cdFx0cmV0dXJuIGNyZWF0ZUhlYWRlcnNJdGVyYXRvcih0aGlzLCAndmFsdWUnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG4gICogR2V0IGFuIGl0ZXJhdG9yIG9uIGVudHJpZXMuXHJcbiAgKlxyXG4gICogVGhpcyBpcyB0aGUgZGVmYXVsdCBpdGVyYXRvciBvZiB0aGUgSGVhZGVycyBvYmplY3QuXHJcbiAgKlxyXG4gICogQHJldHVybiAgSXRlcmF0b3JcclxuICAqL1xyXG5cdFtTeW1ib2wuaXRlcmF0b3JdKCkge1xyXG5cdFx0cmV0dXJuIGNyZWF0ZUhlYWRlcnNJdGVyYXRvcih0aGlzLCAna2V5K3ZhbHVlJyk7XHJcblx0fVxyXG59XHJcbkhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdO1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEhlYWRlcnMucHJvdG90eXBlLCBTeW1ib2wudG9TdHJpbmdUYWcsIHtcclxuXHR2YWx1ZTogJ0hlYWRlcnMnLFxyXG5cdHdyaXRhYmxlOiBmYWxzZSxcclxuXHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHRjb25maWd1cmFibGU6IHRydWVcclxufSk7XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhIZWFkZXJzLnByb3RvdHlwZSwge1xyXG5cdGdldDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXHJcblx0Zm9yRWFjaDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXHJcblx0c2V0OiB7IGVudW1lcmFibGU6IHRydWUgfSxcclxuXHRhcHBlbmQ6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdGhhczogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXHJcblx0ZGVsZXRlOiB7IGVudW1lcmFibGU6IHRydWUgfSxcclxuXHRrZXlzOiB7IGVudW1lcmFibGU6IHRydWUgfSxcclxuXHR2YWx1ZXM6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdGVudHJpZXM6IHsgZW51bWVyYWJsZTogdHJ1ZSB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gZ2V0SGVhZGVycyhoZWFkZXJzKSB7XHJcblx0bGV0IGtpbmQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICdrZXkrdmFsdWUnO1xyXG5cclxuXHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoaGVhZGVyc1tNQVBdKS5zb3J0KCk7XHJcblx0cmV0dXJuIGtleXMubWFwKGtpbmQgPT09ICdrZXknID8gZnVuY3Rpb24gKGspIHtcclxuXHRcdHJldHVybiBrLnRvTG93ZXJDYXNlKCk7XHJcblx0fSA6IGtpbmQgPT09ICd2YWx1ZScgPyBmdW5jdGlvbiAoaykge1xyXG5cdFx0cmV0dXJuIGhlYWRlcnNbTUFQXVtrXS5qb2luKCcsICcpO1xyXG5cdH0gOiBmdW5jdGlvbiAoaykge1xyXG5cdFx0cmV0dXJuIFtrLnRvTG93ZXJDYXNlKCksIGhlYWRlcnNbTUFQXVtrXS5qb2luKCcsICcpXTtcclxuXHR9KTtcclxufVxyXG5cclxuY29uc3QgSU5URVJOQUwgPSBTeW1ib2woJ2ludGVybmFsJyk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVIZWFkZXJzSXRlcmF0b3IodGFyZ2V0LCBraW5kKSB7XHJcblx0Y29uc3QgaXRlcmF0b3IgPSBPYmplY3QuY3JlYXRlKEhlYWRlcnNJdGVyYXRvclByb3RvdHlwZSk7XHJcblx0aXRlcmF0b3JbSU5URVJOQUxdID0ge1xyXG5cdFx0dGFyZ2V0LFxyXG5cdFx0a2luZCxcclxuXHRcdGluZGV4OiAwXHJcblx0fTtcclxuXHRyZXR1cm4gaXRlcmF0b3I7XHJcbn1cclxuXHJcbmNvbnN0IEhlYWRlcnNJdGVyYXRvclByb3RvdHlwZSA9IE9iamVjdC5zZXRQcm90b3R5cGVPZih7XHJcblx0bmV4dCgpIHtcclxuXHRcdC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxyXG5cdFx0aWYgKCF0aGlzIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSAhPT0gSGVhZGVyc0l0ZXJhdG9yUHJvdG90eXBlKSB7XHJcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1ZhbHVlIG9mIGB0aGlzYCBpcyBub3QgYSBIZWFkZXJzSXRlcmF0b3InKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgX0lOVEVSTkFMID0gdGhpc1tJTlRFUk5BTF07XHJcblx0XHRjb25zdCB0YXJnZXQgPSBfSU5URVJOQUwudGFyZ2V0LFxyXG5cdFx0ICAgICAga2luZCA9IF9JTlRFUk5BTC5raW5kLFxyXG5cdFx0ICAgICAgaW5kZXggPSBfSU5URVJOQUwuaW5kZXg7XHJcblxyXG5cdFx0Y29uc3QgdmFsdWVzID0gZ2V0SGVhZGVycyh0YXJnZXQsIGtpbmQpO1xyXG5cdFx0Y29uc3QgbGVuID0gdmFsdWVzLmxlbmd0aDtcclxuXHRcdGlmIChpbmRleCA+PSBsZW4pIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxyXG5cdFx0XHRcdGRvbmU6IHRydWVcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzW0lOVEVSTkFMXS5pbmRleCA9IGluZGV4ICsgMTtcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR2YWx1ZTogdmFsdWVzW2luZGV4XSxcclxuXHRcdFx0ZG9uZTogZmFsc2VcclxuXHRcdH07XHJcblx0fVxyXG59LCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0LmdldFByb3RvdHlwZU9mKFtdW1N5bWJvbC5pdGVyYXRvcl0oKSkpKTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShIZWFkZXJzSXRlcmF0b3JQcm90b3R5cGUsIFN5bWJvbC50b1N0cmluZ1RhZywge1xyXG5cdHZhbHVlOiAnSGVhZGVyc0l0ZXJhdG9yJyxcclxuXHR3cml0YWJsZTogZmFsc2UsXHJcblx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0Y29uZmlndXJhYmxlOiB0cnVlXHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIEV4cG9ydCB0aGUgSGVhZGVycyBvYmplY3QgaW4gYSBmb3JtIHRoYXQgTm9kZS5qcyBjYW4gY29uc3VtZS5cclxuICpcclxuICogQHBhcmFtICAgSGVhZGVycyAgaGVhZGVyc1xyXG4gKiBAcmV0dXJuICBPYmplY3RcclxuICovXHJcbmZ1bmN0aW9uIGV4cG9ydE5vZGVDb21wYXRpYmxlSGVhZGVycyhoZWFkZXJzKSB7XHJcblx0Y29uc3Qgb2JqID0gT2JqZWN0LmFzc2lnbih7IF9fcHJvdG9fXzogbnVsbCB9LCBoZWFkZXJzW01BUF0pO1xyXG5cclxuXHQvLyBodHRwLnJlcXVlc3QoKSBvbmx5IHN1cHBvcnRzIHN0cmluZyBhcyBIb3N0IGhlYWRlci4gVGhpcyBoYWNrIG1ha2VzXHJcblx0Ly8gc3BlY2lmeWluZyBjdXN0b20gSG9zdCBoZWFkZXIgcG9zc2libGUuXHJcblx0Y29uc3QgaG9zdEhlYWRlcktleSA9IGZpbmQoaGVhZGVyc1tNQVBdLCAnSG9zdCcpO1xyXG5cdGlmIChob3N0SGVhZGVyS2V5ICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdG9ialtob3N0SGVhZGVyS2V5XSA9IG9ialtob3N0SGVhZGVyS2V5XVswXTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBvYmo7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBIZWFkZXJzIG9iamVjdCBmcm9tIGFuIG9iamVjdCBvZiBoZWFkZXJzLCBpZ25vcmluZyB0aG9zZSB0aGF0IGRvXHJcbiAqIG5vdCBjb25mb3JtIHRvIEhUVFAgZ3JhbW1hciBwcm9kdWN0aW9ucy5cclxuICpcclxuICogQHBhcmFtICAgT2JqZWN0ICBvYmogIE9iamVjdCBvZiBoZWFkZXJzXHJcbiAqIEByZXR1cm4gIEhlYWRlcnNcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUhlYWRlcnNMZW5pZW50KG9iaikge1xyXG5cdGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xyXG5cdGZvciAoY29uc3QgbmFtZSBvZiBPYmplY3Qua2V5cyhvYmopKSB7XHJcblx0XHRpZiAoaW52YWxpZFRva2VuUmVnZXgudGVzdChuYW1lKSkge1xyXG5cdFx0XHRjb250aW51ZTtcclxuXHRcdH1cclxuXHRcdGlmIChBcnJheS5pc0FycmF5KG9ialtuYW1lXSkpIHtcclxuXHRcdFx0Zm9yIChjb25zdCB2YWwgb2Ygb2JqW25hbWVdKSB7XHJcblx0XHRcdFx0aWYgKGludmFsaWRIZWFkZXJDaGFyUmVnZXgudGVzdCh2YWwpKSB7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGhlYWRlcnNbTUFQXVtuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRoZWFkZXJzW01BUF1bbmFtZV0gPSBbdmFsXTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0aGVhZGVyc1tNQVBdW25hbWVdLnB1c2godmFsKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAoIWludmFsaWRIZWFkZXJDaGFyUmVnZXgudGVzdChvYmpbbmFtZV0pKSB7XHJcblx0XHRcdGhlYWRlcnNbTUFQXVtuYW1lXSA9IFtvYmpbbmFtZV1dO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gaGVhZGVycztcclxufVxyXG5cclxuY29uc3QgSU5URVJOQUxTJDEgPSBTeW1ib2woJ1Jlc3BvbnNlIGludGVybmFscycpO1xyXG5cclxuLy8gZml4IGFuIGlzc3VlIHdoZXJlIFwiU1RBVFVTX0NPREVTXCIgYXJlbid0IGEgbmFtZWQgZXhwb3J0IGZvciBub2RlIDwxMFxyXG5jb25zdCBTVEFUVVNfQ09ERVMgPSBodHRwLlNUQVRVU19DT0RFUztcclxuXHJcbi8qKlxyXG4gKiBSZXNwb25zZSBjbGFzc1xyXG4gKlxyXG4gKiBAcGFyYW0gICBTdHJlYW0gIGJvZHkgIFJlYWRhYmxlIHN0cmVhbVxyXG4gKiBAcGFyYW0gICBPYmplY3QgIG9wdHMgIFJlc3BvbnNlIG9wdGlvbnNcclxuICogQHJldHVybiAgVm9pZFxyXG4gKi9cclxuY2xhc3MgUmVzcG9uc2Uge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0bGV0IGJvZHkgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IG51bGw7XHJcblx0XHRsZXQgb3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XHJcblxyXG5cdFx0Qm9keS5jYWxsKHRoaXMsIGJvZHksIG9wdHMpO1xyXG5cclxuXHRcdGNvbnN0IHN0YXR1cyA9IG9wdHMuc3RhdHVzIHx8IDIwMDtcclxuXHRcdGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRzLmhlYWRlcnMpO1xyXG5cclxuXHRcdGlmIChib2R5ICE9IG51bGwgJiYgIWhlYWRlcnMuaGFzKCdDb250ZW50LVR5cGUnKSkge1xyXG5cdFx0XHRjb25zdCBjb250ZW50VHlwZSA9IGV4dHJhY3RDb250ZW50VHlwZShib2R5KTtcclxuXHRcdFx0aWYgKGNvbnRlbnRUeXBlKSB7XHJcblx0XHRcdFx0aGVhZGVycy5hcHBlbmQoJ0NvbnRlbnQtVHlwZScsIGNvbnRlbnRUeXBlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXNbSU5URVJOQUxTJDFdID0ge1xyXG5cdFx0XHR1cmw6IG9wdHMudXJsLFxyXG5cdFx0XHRzdGF0dXMsXHJcblx0XHRcdHN0YXR1c1RleHQ6IG9wdHMuc3RhdHVzVGV4dCB8fCBTVEFUVVNfQ09ERVNbc3RhdHVzXSxcclxuXHRcdFx0aGVhZGVycyxcclxuXHRcdFx0Y291bnRlcjogb3B0cy5jb3VudGVyXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Z2V0IHVybCgpIHtcclxuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQxXS51cmwgfHwgJyc7XHJcblx0fVxyXG5cclxuXHRnZXQgc3RhdHVzKCkge1xyXG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTJDFdLnN0YXR1cztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG4gICogQ29udmVuaWVuY2UgcHJvcGVydHkgcmVwcmVzZW50aW5nIGlmIHRoZSByZXF1ZXN0IGVuZGVkIG5vcm1hbGx5XHJcbiAgKi9cclxuXHRnZXQgb2soKSB7XHJcblx0XHRyZXR1cm4gdGhpc1tJTlRFUk5BTFMkMV0uc3RhdHVzID49IDIwMCAmJiB0aGlzW0lOVEVSTkFMUyQxXS5zdGF0dXMgPCAzMDA7XHJcblx0fVxyXG5cclxuXHRnZXQgcmVkaXJlY3RlZCgpIHtcclxuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQxXS5jb3VudGVyID4gMDtcclxuXHR9XHJcblxyXG5cdGdldCBzdGF0dXNUZXh0KCkge1xyXG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTJDFdLnN0YXR1c1RleHQ7XHJcblx0fVxyXG5cclxuXHRnZXQgaGVhZGVycygpIHtcclxuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQxXS5oZWFkZXJzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcbiAgKiBDbG9uZSB0aGlzIHJlc3BvbnNlXHJcbiAgKlxyXG4gICogQHJldHVybiAgUmVzcG9uc2VcclxuICAqL1xyXG5cdGNsb25lKCkge1xyXG5cdFx0cmV0dXJuIG5ldyBSZXNwb25zZShjbG9uZSh0aGlzKSwge1xyXG5cdFx0XHR1cmw6IHRoaXMudXJsLFxyXG5cdFx0XHRzdGF0dXM6IHRoaXMuc3RhdHVzLFxyXG5cdFx0XHRzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXHJcblx0XHRcdGhlYWRlcnM6IHRoaXMuaGVhZGVycyxcclxuXHRcdFx0b2s6IHRoaXMub2ssXHJcblx0XHRcdHJlZGlyZWN0ZWQ6IHRoaXMucmVkaXJlY3RlZFxyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG5Cb2R5Lm1peEluKFJlc3BvbnNlLnByb3RvdHlwZSk7XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZXNwb25zZS5wcm90b3R5cGUsIHtcclxuXHR1cmw6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdHN0YXR1czogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXHJcblx0b2s6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdHJlZGlyZWN0ZWQ6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdHN0YXR1c1RleHQ6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdGhlYWRlcnM6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdGNsb25lOiB7IGVudW1lcmFibGU6IHRydWUgfVxyXG59KTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZXNwb25zZS5wcm90b3R5cGUsIFN5bWJvbC50b1N0cmluZ1RhZywge1xyXG5cdHZhbHVlOiAnUmVzcG9uc2UnLFxyXG5cdHdyaXRhYmxlOiBmYWxzZSxcclxuXHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHRjb25maWd1cmFibGU6IHRydWVcclxufSk7XHJcblxyXG5jb25zdCBJTlRFUk5BTFMkMiA9IFN5bWJvbCgnUmVxdWVzdCBpbnRlcm5hbHMnKTtcclxuXHJcbi8vIGZpeCBhbiBpc3N1ZSB3aGVyZSBcImZvcm1hdFwiLCBcInBhcnNlXCIgYXJlbid0IGEgbmFtZWQgZXhwb3J0IGZvciBub2RlIDwxMFxyXG5jb25zdCBwYXJzZV91cmwgPSBVcmwucGFyc2U7XHJcbmNvbnN0IGZvcm1hdF91cmwgPSBVcmwuZm9ybWF0O1xyXG5cclxuY29uc3Qgc3RyZWFtRGVzdHJ1Y3Rpb25TdXBwb3J0ZWQgPSAnZGVzdHJveScgaW4gU3RyZWFtLlJlYWRhYmxlLnByb3RvdHlwZTtcclxuXHJcbi8qKlxyXG4gKiBDaGVjayBpZiBhIHZhbHVlIGlzIGFuIGluc3RhbmNlIG9mIFJlcXVlc3QuXHJcbiAqXHJcbiAqIEBwYXJhbSAgIE1peGVkICAgaW5wdXRcclxuICogQHJldHVybiAgQm9vbGVhblxyXG4gKi9cclxuZnVuY3Rpb24gaXNSZXF1ZXN0KGlucHV0KSB7XHJcblx0cmV0dXJuIHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGlucHV0W0lOVEVSTkFMUyQyXSA9PT0gJ29iamVjdCc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQWJvcnRTaWduYWwoc2lnbmFsKSB7XHJcblx0Y29uc3QgcHJvdG8gPSBzaWduYWwgJiYgdHlwZW9mIHNpZ25hbCA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKHNpZ25hbCk7XHJcblx0cmV0dXJuICEhKHByb3RvICYmIHByb3RvLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdBYm9ydFNpZ25hbCcpO1xyXG59XHJcblxyXG4vKipcclxuICogUmVxdWVzdCBjbGFzc1xyXG4gKlxyXG4gKiBAcGFyYW0gICBNaXhlZCAgIGlucHV0ICBVcmwgb3IgUmVxdWVzdCBpbnN0YW5jZVxyXG4gKiBAcGFyYW0gICBPYmplY3QgIGluaXQgICBDdXN0b20gb3B0aW9uc1xyXG4gKiBAcmV0dXJuICBWb2lkXHJcbiAqL1xyXG5jbGFzcyBSZXF1ZXN0IHtcclxuXHRjb25zdHJ1Y3RvcihpbnB1dCkge1xyXG5cdFx0bGV0IGluaXQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xyXG5cclxuXHRcdGxldCBwYXJzZWRVUkw7XHJcblxyXG5cdFx0Ly8gbm9ybWFsaXplIGlucHV0XHJcblx0XHRpZiAoIWlzUmVxdWVzdChpbnB1dCkpIHtcclxuXHRcdFx0aWYgKGlucHV0ICYmIGlucHV0LmhyZWYpIHtcclxuXHRcdFx0XHQvLyBpbiBvcmRlciB0byBzdXBwb3J0IE5vZGUuanMnIFVybCBvYmplY3RzOyB0aG91Z2ggV0hBVFdHJ3MgVVJMIG9iamVjdHNcclxuXHRcdFx0XHQvLyB3aWxsIGZhbGwgaW50byB0aGlzIGJyYW5jaCBhbHNvIChzaW5jZSB0aGVpciBgdG9TdHJpbmcoKWAgd2lsbCByZXR1cm5cclxuXHRcdFx0XHQvLyBgaHJlZmAgcHJvcGVydHkgYW55d2F5KVxyXG5cdFx0XHRcdHBhcnNlZFVSTCA9IHBhcnNlX3VybChpbnB1dC5ocmVmKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBjb2VyY2UgaW5wdXQgdG8gYSBzdHJpbmcgYmVmb3JlIGF0dGVtcHRpbmcgdG8gcGFyc2VcclxuXHRcdFx0XHRwYXJzZWRVUkwgPSBwYXJzZV91cmwoYCR7aW5wdXR9YCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aW5wdXQgPSB7fTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHBhcnNlZFVSTCA9IHBhcnNlX3VybChpbnB1dC51cmwpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBtZXRob2QgPSBpbml0Lm1ldGhvZCB8fCBpbnB1dC5tZXRob2QgfHwgJ0dFVCc7XHJcblx0XHRtZXRob2QgPSBtZXRob2QudG9VcHBlckNhc2UoKTtcclxuXHJcblx0XHRpZiAoKGluaXQuYm9keSAhPSBudWxsIHx8IGlzUmVxdWVzdChpbnB1dCkgJiYgaW5wdXQuYm9keSAhPT0gbnVsbCkgJiYgKG1ldGhvZCA9PT0gJ0dFVCcgfHwgbWV0aG9kID09PSAnSEVBRCcpKSB7XHJcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlcXVlc3Qgd2l0aCBHRVQvSEVBRCBtZXRob2QgY2Fubm90IGhhdmUgYm9keScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBpbnB1dEJvZHkgPSBpbml0LmJvZHkgIT0gbnVsbCA/IGluaXQuYm9keSA6IGlzUmVxdWVzdChpbnB1dCkgJiYgaW5wdXQuYm9keSAhPT0gbnVsbCA/IGNsb25lKGlucHV0KSA6IG51bGw7XHJcblxyXG5cdFx0Qm9keS5jYWxsKHRoaXMsIGlucHV0Qm9keSwge1xyXG5cdFx0XHR0aW1lb3V0OiBpbml0LnRpbWVvdXQgfHwgaW5wdXQudGltZW91dCB8fCAwLFxyXG5cdFx0XHRzaXplOiBpbml0LnNpemUgfHwgaW5wdXQuc2l6ZSB8fCAwXHJcblx0XHR9KTtcclxuXHJcblx0XHRjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5pdC5oZWFkZXJzIHx8IGlucHV0LmhlYWRlcnMgfHwge30pO1xyXG5cclxuXHRcdGlmIChpbnB1dEJvZHkgIT0gbnVsbCAmJiAhaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XHJcblx0XHRcdGNvbnN0IGNvbnRlbnRUeXBlID0gZXh0cmFjdENvbnRlbnRUeXBlKGlucHV0Qm9keSk7XHJcblx0XHRcdGlmIChjb250ZW50VHlwZSkge1xyXG5cdFx0XHRcdGhlYWRlcnMuYXBwZW5kKCdDb250ZW50LVR5cGUnLCBjb250ZW50VHlwZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRsZXQgc2lnbmFsID0gaXNSZXF1ZXN0KGlucHV0KSA/IGlucHV0LnNpZ25hbCA6IG51bGw7XHJcblx0XHRpZiAoJ3NpZ25hbCcgaW4gaW5pdCkgc2lnbmFsID0gaW5pdC5zaWduYWw7XHJcblxyXG5cdFx0aWYgKHNpZ25hbCAhPSBudWxsICYmICFpc0Fib3J0U2lnbmFsKHNpZ25hbCkpIHtcclxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgc2lnbmFsIHRvIGJlIGFuIGluc3RhbmNlb2YgQWJvcnRTaWduYWwnKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzW0lOVEVSTkFMUyQyXSA9IHtcclxuXHRcdFx0bWV0aG9kLFxyXG5cdFx0XHRyZWRpcmVjdDogaW5pdC5yZWRpcmVjdCB8fCBpbnB1dC5yZWRpcmVjdCB8fCAnZm9sbG93JyxcclxuXHRcdFx0aGVhZGVycyxcclxuXHRcdFx0cGFyc2VkVVJMLFxyXG5cdFx0XHRzaWduYWxcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gbm9kZS1mZXRjaC1vbmx5IG9wdGlvbnNcclxuXHRcdHRoaXMuZm9sbG93ID0gaW5pdC5mb2xsb3cgIT09IHVuZGVmaW5lZCA/IGluaXQuZm9sbG93IDogaW5wdXQuZm9sbG93ICE9PSB1bmRlZmluZWQgPyBpbnB1dC5mb2xsb3cgOiAyMDtcclxuXHRcdHRoaXMuY29tcHJlc3MgPSBpbml0LmNvbXByZXNzICE9PSB1bmRlZmluZWQgPyBpbml0LmNvbXByZXNzIDogaW5wdXQuY29tcHJlc3MgIT09IHVuZGVmaW5lZCA/IGlucHV0LmNvbXByZXNzIDogdHJ1ZTtcclxuXHRcdHRoaXMuY291bnRlciA9IGluaXQuY291bnRlciB8fCBpbnB1dC5jb3VudGVyIHx8IDA7XHJcblx0XHR0aGlzLmFnZW50ID0gaW5pdC5hZ2VudCB8fCBpbnB1dC5hZ2VudDtcclxuXHR9XHJcblxyXG5cdGdldCBtZXRob2QoKSB7XHJcblx0XHRyZXR1cm4gdGhpc1tJTlRFUk5BTFMkMl0ubWV0aG9kO1xyXG5cdH1cclxuXHJcblx0Z2V0IHVybCgpIHtcclxuXHRcdHJldHVybiBmb3JtYXRfdXJsKHRoaXNbSU5URVJOQUxTJDJdLnBhcnNlZFVSTCk7XHJcblx0fVxyXG5cclxuXHRnZXQgaGVhZGVycygpIHtcclxuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQyXS5oZWFkZXJzO1xyXG5cdH1cclxuXHJcblx0Z2V0IHJlZGlyZWN0KCkge1xyXG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTJDJdLnJlZGlyZWN0O1xyXG5cdH1cclxuXHJcblx0Z2V0IHNpZ25hbCgpIHtcclxuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMUyQyXS5zaWduYWw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuICAqIENsb25lIHRoaXMgcmVxdWVzdFxyXG4gICpcclxuICAqIEByZXR1cm4gIFJlcXVlc3RcclxuICAqL1xyXG5cdGNsb25lKCkge1xyXG5cdFx0cmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMpO1xyXG5cdH1cclxufVxyXG5cclxuQm9keS5taXhJbihSZXF1ZXN0LnByb3RvdHlwZSk7XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmVxdWVzdC5wcm90b3R5cGUsIFN5bWJvbC50b1N0cmluZ1RhZywge1xyXG5cdHZhbHVlOiAnUmVxdWVzdCcsXHJcblx0d3JpdGFibGU6IGZhbHNlLFxyXG5cdGVudW1lcmFibGU6IGZhbHNlLFxyXG5cdGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG59KTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFJlcXVlc3QucHJvdG90eXBlLCB7XHJcblx0bWV0aG9kOiB7IGVudW1lcmFibGU6IHRydWUgfSxcclxuXHR1cmw6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdGhlYWRlcnM6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxyXG5cdHJlZGlyZWN0OiB7IGVudW1lcmFibGU6IHRydWUgfSxcclxuXHRjbG9uZTogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXHJcblx0c2lnbmFsOiB7IGVudW1lcmFibGU6IHRydWUgfVxyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgUmVxdWVzdCB0byBOb2RlLmpzIGh0dHAgcmVxdWVzdCBvcHRpb25zLlxyXG4gKlxyXG4gKiBAcGFyYW0gICBSZXF1ZXN0ICBBIFJlcXVlc3QgaW5zdGFuY2VcclxuICogQHJldHVybiAgT2JqZWN0ICAgVGhlIG9wdGlvbnMgb2JqZWN0IHRvIGJlIHBhc3NlZCB0byBodHRwLnJlcXVlc3RcclxuICovXHJcbmZ1bmN0aW9uIGdldE5vZGVSZXF1ZXN0T3B0aW9ucyhyZXF1ZXN0KSB7XHJcblx0Y29uc3QgcGFyc2VkVVJMID0gcmVxdWVzdFtJTlRFUk5BTFMkMl0ucGFyc2VkVVJMO1xyXG5cdGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhyZXF1ZXN0W0lOVEVSTkFMUyQyXS5oZWFkZXJzKTtcclxuXHJcblx0Ly8gZmV0Y2ggc3RlcCAxLjNcclxuXHRpZiAoIWhlYWRlcnMuaGFzKCdBY2NlcHQnKSkge1xyXG5cdFx0aGVhZGVycy5zZXQoJ0FjY2VwdCcsICcqLyonKTtcclxuXHR9XHJcblxyXG5cdC8vIEJhc2ljIGZldGNoXHJcblx0aWYgKCFwYXJzZWRVUkwucHJvdG9jb2wgfHwgIXBhcnNlZFVSTC5ob3N0bmFtZSkge1xyXG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT25seSBhYnNvbHV0ZSBVUkxzIGFyZSBzdXBwb3J0ZWQnKTtcclxuXHR9XHJcblxyXG5cdGlmICghL15odHRwcz86JC8udGVzdChwYXJzZWRVUkwucHJvdG9jb2wpKSB7XHJcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPbmx5IEhUVFAoUykgcHJvdG9jb2xzIGFyZSBzdXBwb3J0ZWQnKTtcclxuXHR9XHJcblxyXG5cdGlmIChyZXF1ZXN0LnNpZ25hbCAmJiByZXF1ZXN0LmJvZHkgaW5zdGFuY2VvZiBTdHJlYW0uUmVhZGFibGUgJiYgIXN0cmVhbURlc3RydWN0aW9uU3VwcG9ydGVkKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NhbmNlbGxhdGlvbiBvZiBzdHJlYW1lZCByZXF1ZXN0cyB3aXRoIEFib3J0U2lnbmFsIGlzIG5vdCBzdXBwb3J0ZWQgaW4gbm9kZSA8IDgnKTtcclxuXHR9XHJcblxyXG5cdC8vIEhUVFAtbmV0d29yay1vci1jYWNoZSBmZXRjaCBzdGVwcyAyLjQtMi43XHJcblx0bGV0IGNvbnRlbnRMZW5ndGhWYWx1ZSA9IG51bGw7XHJcblx0aWYgKHJlcXVlc3QuYm9keSA9PSBudWxsICYmIC9eKFBPU1R8UFVUKSQvaS50ZXN0KHJlcXVlc3QubWV0aG9kKSkge1xyXG5cdFx0Y29udGVudExlbmd0aFZhbHVlID0gJzAnO1xyXG5cdH1cclxuXHRpZiAocmVxdWVzdC5ib2R5ICE9IG51bGwpIHtcclxuXHRcdGNvbnN0IHRvdGFsQnl0ZXMgPSBnZXRUb3RhbEJ5dGVzKHJlcXVlc3QpO1xyXG5cdFx0aWYgKHR5cGVvZiB0b3RhbEJ5dGVzID09PSAnbnVtYmVyJykge1xyXG5cdFx0XHRjb250ZW50TGVuZ3RoVmFsdWUgPSBTdHJpbmcodG90YWxCeXRlcyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdGlmIChjb250ZW50TGVuZ3RoVmFsdWUpIHtcclxuXHRcdGhlYWRlcnMuc2V0KCdDb250ZW50LUxlbmd0aCcsIGNvbnRlbnRMZW5ndGhWYWx1ZSk7XHJcblx0fVxyXG5cclxuXHQvLyBIVFRQLW5ldHdvcmstb3ItY2FjaGUgZmV0Y2ggc3RlcCAyLjExXHJcblx0aWYgKCFoZWFkZXJzLmhhcygnVXNlci1BZ2VudCcpKSB7XHJcblx0XHRoZWFkZXJzLnNldCgnVXNlci1BZ2VudCcsICdub2RlLWZldGNoLzEuMCAoK2h0dHBzOi8vZ2l0aHViLmNvbS9iaXRpbm4vbm9kZS1mZXRjaCknKTtcclxuXHR9XHJcblxyXG5cdC8vIEhUVFAtbmV0d29yay1vci1jYWNoZSBmZXRjaCBzdGVwIDIuMTVcclxuXHRpZiAocmVxdWVzdC5jb21wcmVzcyAmJiAhaGVhZGVycy5oYXMoJ0FjY2VwdC1FbmNvZGluZycpKSB7XHJcblx0XHRoZWFkZXJzLnNldCgnQWNjZXB0LUVuY29kaW5nJywgJ2d6aXAsZGVmbGF0ZScpO1xyXG5cdH1cclxuXHJcblx0bGV0IGFnZW50ID0gcmVxdWVzdC5hZ2VudDtcclxuXHRpZiAodHlwZW9mIGFnZW50ID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRhZ2VudCA9IGFnZW50KHBhcnNlZFVSTCk7XHJcblx0fVxyXG5cclxuXHRpZiAoIWhlYWRlcnMuaGFzKCdDb25uZWN0aW9uJykgJiYgIWFnZW50KSB7XHJcblx0XHRoZWFkZXJzLnNldCgnQ29ubmVjdGlvbicsICdjbG9zZScpO1xyXG5cdH1cclxuXHJcblx0Ly8gSFRUUC1uZXR3b3JrIGZldGNoIHN0ZXAgNC4yXHJcblx0Ly8gY2h1bmtlZCBlbmNvZGluZyBpcyBoYW5kbGVkIGJ5IE5vZGUuanNcclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHBhcnNlZFVSTCwge1xyXG5cdFx0bWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcclxuXHRcdGhlYWRlcnM6IGV4cG9ydE5vZGVDb21wYXRpYmxlSGVhZGVycyhoZWFkZXJzKSxcclxuXHRcdGFnZW50XHJcblx0fSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBhYm9ydC1lcnJvci5qc1xyXG4gKlxyXG4gKiBBYm9ydEVycm9yIGludGVyZmFjZSBmb3IgY2FuY2VsbGVkIHJlcXVlc3RzXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBBYm9ydEVycm9yIGluc3RhbmNlXHJcbiAqXHJcbiAqIEBwYXJhbSAgIFN0cmluZyAgICAgIG1lc3NhZ2UgICAgICBFcnJvciBtZXNzYWdlIGZvciBodW1hblxyXG4gKiBAcmV0dXJuICBBYm9ydEVycm9yXHJcbiAqL1xyXG5mdW5jdGlvbiBBYm9ydEVycm9yKG1lc3NhZ2UpIHtcclxuICBFcnJvci5jYWxsKHRoaXMsIG1lc3NhZ2UpO1xyXG5cclxuICB0aGlzLnR5cGUgPSAnYWJvcnRlZCc7XHJcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcclxuXHJcbiAgLy8gaGlkZSBjdXN0b20gZXJyb3IgaW1wbGVtZW50YXRpb24gZGV0YWlscyBmcm9tIGVuZC11c2Vyc1xyXG4gIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHRoaXMuY29uc3RydWN0b3IpO1xyXG59XHJcblxyXG5BYm9ydEVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcclxuQWJvcnRFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBYm9ydEVycm9yO1xyXG5BYm9ydEVycm9yLnByb3RvdHlwZS5uYW1lID0gJ0Fib3J0RXJyb3InO1xyXG5cclxuLy8gZml4IGFuIGlzc3VlIHdoZXJlIFwiUGFzc1Rocm91Z2hcIiwgXCJyZXNvbHZlXCIgYXJlbid0IGEgbmFtZWQgZXhwb3J0IGZvciBub2RlIDwxMFxyXG5jb25zdCBQYXNzVGhyb3VnaCQxID0gU3RyZWFtLlBhc3NUaHJvdWdoO1xyXG5jb25zdCByZXNvbHZlX3VybCA9IFVybC5yZXNvbHZlO1xyXG5cclxuLyoqXHJcbiAqIEZldGNoIGZ1bmN0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbSAgIE1peGVkICAgIHVybCAgIEFic29sdXRlIHVybCBvciBSZXF1ZXN0IGluc3RhbmNlXHJcbiAqIEBwYXJhbSAgIE9iamVjdCAgIG9wdHMgIEZldGNoIG9wdGlvbnNcclxuICogQHJldHVybiAgUHJvbWlzZVxyXG4gKi9cclxuZnVuY3Rpb24gZmV0Y2godXJsLCBvcHRzKSB7XHJcblxyXG5cdC8vIGFsbG93IGN1c3RvbSBwcm9taXNlXHJcblx0aWYgKCFmZXRjaC5Qcm9taXNlKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ25hdGl2ZSBwcm9taXNlIG1pc3NpbmcsIHNldCBmZXRjaC5Qcm9taXNlIHRvIHlvdXIgZmF2b3JpdGUgYWx0ZXJuYXRpdmUnKTtcclxuXHR9XHJcblxyXG5cdEJvZHkuUHJvbWlzZSA9IGZldGNoLlByb21pc2U7XHJcblxyXG5cdC8vIHdyYXAgaHR0cC5yZXF1ZXN0IGludG8gZmV0Y2hcclxuXHRyZXR1cm4gbmV3IGZldGNoLlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0Ly8gYnVpbGQgcmVxdWVzdCBvYmplY3RcclxuXHRcdGNvbnN0IHJlcXVlc3QgPSBuZXcgUmVxdWVzdCh1cmwsIG9wdHMpO1xyXG5cdFx0Y29uc3Qgb3B0aW9ucyA9IGdldE5vZGVSZXF1ZXN0T3B0aW9ucyhyZXF1ZXN0KTtcclxuXHJcblx0XHRjb25zdCBzZW5kID0gKG9wdGlvbnMucHJvdG9jb2wgPT09ICdodHRwczonID8gaHR0cHMgOiBodHRwKS5yZXF1ZXN0O1xyXG5cdFx0Y29uc3Qgc2lnbmFsID0gcmVxdWVzdC5zaWduYWw7XHJcblxyXG5cdFx0bGV0IHJlc3BvbnNlID0gbnVsbDtcclxuXHJcblx0XHRjb25zdCBhYm9ydCA9IGZ1bmN0aW9uIGFib3J0KCkge1xyXG5cdFx0XHRsZXQgZXJyb3IgPSBuZXcgQWJvcnRFcnJvcignVGhlIHVzZXIgYWJvcnRlZCBhIHJlcXVlc3QuJyk7XHJcblx0XHRcdHJlamVjdChlcnJvcik7XHJcblx0XHRcdGlmIChyZXF1ZXN0LmJvZHkgJiYgcmVxdWVzdC5ib2R5IGluc3RhbmNlb2YgU3RyZWFtLlJlYWRhYmxlKSB7XHJcblx0XHRcdFx0cmVxdWVzdC5ib2R5LmRlc3Ryb3koZXJyb3IpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLmJvZHkpIHJldHVybjtcclxuXHRcdFx0cmVzcG9uc2UuYm9keS5lbWl0KCdlcnJvcicsIGVycm9yKTtcclxuXHRcdH07XHJcblxyXG5cdFx0aWYgKHNpZ25hbCAmJiBzaWduYWwuYWJvcnRlZCkge1xyXG5cdFx0XHRhYm9ydCgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgYWJvcnRBbmRGaW5hbGl6ZSA9IGZ1bmN0aW9uIGFib3J0QW5kRmluYWxpemUoKSB7XHJcblx0XHRcdGFib3J0KCk7XHJcblx0XHRcdGZpbmFsaXplKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIHNlbmQgcmVxdWVzdFxyXG5cdFx0Y29uc3QgcmVxID0gc2VuZChvcHRpb25zKTtcclxuXHRcdGxldCByZXFUaW1lb3V0O1xyXG5cclxuXHRcdGlmIChzaWduYWwpIHtcclxuXHRcdFx0c2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRBbmRGaW5hbGl6ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmluYWxpemUoKSB7XHJcblx0XHRcdHJlcS5hYm9ydCgpO1xyXG5cdFx0XHRpZiAoc2lnbmFsKSBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydEFuZEZpbmFsaXplKTtcclxuXHRcdFx0Y2xlYXJUaW1lb3V0KHJlcVRpbWVvdXQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChyZXF1ZXN0LnRpbWVvdXQpIHtcclxuXHRcdFx0cmVxLm9uY2UoJ3NvY2tldCcsIGZ1bmN0aW9uIChzb2NrZXQpIHtcclxuXHRcdFx0XHRyZXFUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYG5ldHdvcmsgdGltZW91dCBhdDogJHtyZXF1ZXN0LnVybH1gLCAncmVxdWVzdC10aW1lb3V0JykpO1xyXG5cdFx0XHRcdFx0ZmluYWxpemUoKTtcclxuXHRcdFx0XHR9LCByZXF1ZXN0LnRpbWVvdXQpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXEub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycikge1xyXG5cdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYHJlcXVlc3QgdG8gJHtyZXF1ZXN0LnVybH0gZmFpbGVkLCByZWFzb246ICR7ZXJyLm1lc3NhZ2V9YCwgJ3N5c3RlbScsIGVycikpO1xyXG5cdFx0XHRmaW5hbGl6ZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmVxLm9uKCdyZXNwb25zZScsIGZ1bmN0aW9uIChyZXMpIHtcclxuXHRcdFx0Y2xlYXJUaW1lb3V0KHJlcVRpbWVvdXQpO1xyXG5cclxuXHRcdFx0Y29uc3QgaGVhZGVycyA9IGNyZWF0ZUhlYWRlcnNMZW5pZW50KHJlcy5oZWFkZXJzKTtcclxuXHJcblx0XHRcdC8vIEhUVFAgZmV0Y2ggc3RlcCA1XHJcblx0XHRcdGlmIChmZXRjaC5pc1JlZGlyZWN0KHJlcy5zdGF0dXNDb2RlKSkge1xyXG5cdFx0XHRcdC8vIEhUVFAgZmV0Y2ggc3RlcCA1LjJcclxuXHRcdFx0XHRjb25zdCBsb2NhdGlvbiA9IGhlYWRlcnMuZ2V0KCdMb2NhdGlvbicpO1xyXG5cclxuXHRcdFx0XHQvLyBIVFRQIGZldGNoIHN0ZXAgNS4zXHJcblx0XHRcdFx0Y29uc3QgbG9jYXRpb25VUkwgPSBsb2NhdGlvbiA9PT0gbnVsbCA/IG51bGwgOiByZXNvbHZlX3VybChyZXF1ZXN0LnVybCwgbG9jYXRpb24pO1xyXG5cclxuXHRcdFx0XHQvLyBIVFRQIGZldGNoIHN0ZXAgNS41XHJcblx0XHRcdFx0c3dpdGNoIChyZXF1ZXN0LnJlZGlyZWN0KSB7XHJcblx0XHRcdFx0XHRjYXNlICdlcnJvcic6XHJcblx0XHRcdFx0XHRcdHJlamVjdChuZXcgRmV0Y2hFcnJvcihgcmVkaXJlY3QgbW9kZSBpcyBzZXQgdG8gZXJyb3I6ICR7cmVxdWVzdC51cmx9YCwgJ25vLXJlZGlyZWN0JykpO1xyXG5cdFx0XHRcdFx0XHRmaW5hbGl6ZSgpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRjYXNlICdtYW51YWwnOlxyXG5cdFx0XHRcdFx0XHQvLyBub2RlLWZldGNoLXNwZWNpZmljIHN0ZXA6IG1ha2UgbWFudWFsIHJlZGlyZWN0IGEgYml0IGVhc2llciB0byB1c2UgYnkgc2V0dGluZyB0aGUgTG9jYXRpb24gaGVhZGVyIHZhbHVlIHRvIHRoZSByZXNvbHZlZCBVUkwuXHJcblx0XHRcdFx0XHRcdGlmIChsb2NhdGlvblVSTCAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRcdC8vIGhhbmRsZSBjb3JydXB0ZWQgaGVhZGVyXHJcblx0XHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHRcdGhlYWRlcnMuc2V0KCdMb2NhdGlvbicsIGxvY2F0aW9uVVJMKTtcclxuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiBub2RlanMgc2VydmVyIHByZXZlbnQgaW52YWxpZCByZXNwb25zZSBoZWFkZXJzLCB3ZSBjYW4ndCB0ZXN0IHRoaXMgdGhyb3VnaCBub3JtYWwgcmVxdWVzdFxyXG5cdFx0XHRcdFx0XHRcdFx0cmVqZWN0KGVycik7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSAnZm9sbG93JzpcclxuXHRcdFx0XHRcdFx0Ly8gSFRUUC1yZWRpcmVjdCBmZXRjaCBzdGVwIDJcclxuXHRcdFx0XHRcdFx0aWYgKGxvY2F0aW9uVVJMID09PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vIEhUVFAtcmVkaXJlY3QgZmV0Y2ggc3RlcCA1XHJcblx0XHRcdFx0XHRcdGlmIChyZXF1ZXN0LmNvdW50ZXIgPj0gcmVxdWVzdC5mb2xsb3cpIHtcclxuXHRcdFx0XHRcdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYG1heGltdW0gcmVkaXJlY3QgcmVhY2hlZCBhdDogJHtyZXF1ZXN0LnVybH1gLCAnbWF4LXJlZGlyZWN0JykpO1xyXG5cdFx0XHRcdFx0XHRcdGZpbmFsaXplKCk7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgNiAoY291bnRlciBpbmNyZW1lbnQpXHJcblx0XHRcdFx0XHRcdC8vIENyZWF0ZSBhIG5ldyBSZXF1ZXN0IG9iamVjdC5cclxuXHRcdFx0XHRcdFx0Y29uc3QgcmVxdWVzdE9wdHMgPSB7XHJcblx0XHRcdFx0XHRcdFx0aGVhZGVyczogbmV3IEhlYWRlcnMocmVxdWVzdC5oZWFkZXJzKSxcclxuXHRcdFx0XHRcdFx0XHRmb2xsb3c6IHJlcXVlc3QuZm9sbG93LFxyXG5cdFx0XHRcdFx0XHRcdGNvdW50ZXI6IHJlcXVlc3QuY291bnRlciArIDEsXHJcblx0XHRcdFx0XHRcdFx0YWdlbnQ6IHJlcXVlc3QuYWdlbnQsXHJcblx0XHRcdFx0XHRcdFx0Y29tcHJlc3M6IHJlcXVlc3QuY29tcHJlc3MsXHJcblx0XHRcdFx0XHRcdFx0bWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcclxuXHRcdFx0XHRcdFx0XHRib2R5OiByZXF1ZXN0LmJvZHksXHJcblx0XHRcdFx0XHRcdFx0c2lnbmFsOiByZXF1ZXN0LnNpZ25hbCxcclxuXHRcdFx0XHRcdFx0XHR0aW1lb3V0OiByZXF1ZXN0LnRpbWVvdXRcclxuXHRcdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0XHRcdC8vIEhUVFAtcmVkaXJlY3QgZmV0Y2ggc3RlcCA5XHJcblx0XHRcdFx0XHRcdGlmIChyZXMuc3RhdHVzQ29kZSAhPT0gMzAzICYmIHJlcXVlc3QuYm9keSAmJiBnZXRUb3RhbEJ5dGVzKHJlcXVlc3QpID09PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdFx0cmVqZWN0KG5ldyBGZXRjaEVycm9yKCdDYW5ub3QgZm9sbG93IHJlZGlyZWN0IHdpdGggYm9keSBiZWluZyBhIHJlYWRhYmxlIHN0cmVhbScsICd1bnN1cHBvcnRlZC1yZWRpcmVjdCcpKTtcclxuXHRcdFx0XHRcdFx0XHRmaW5hbGl6ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8gSFRUUC1yZWRpcmVjdCBmZXRjaCBzdGVwIDExXHJcblx0XHRcdFx0XHRcdGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMzAzIHx8IChyZXMuc3RhdHVzQ29kZSA9PT0gMzAxIHx8IHJlcy5zdGF0dXNDb2RlID09PSAzMDIpICYmIHJlcXVlc3QubWV0aG9kID09PSAnUE9TVCcpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXF1ZXN0T3B0cy5tZXRob2QgPSAnR0VUJztcclxuXHRcdFx0XHRcdFx0XHRyZXF1ZXN0T3B0cy5ib2R5ID0gdW5kZWZpbmVkO1xyXG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RPcHRzLmhlYWRlcnMuZGVsZXRlKCdjb250ZW50LWxlbmd0aCcpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgMTVcclxuXHRcdFx0XHRcdFx0cmVzb2x2ZShmZXRjaChuZXcgUmVxdWVzdChsb2NhdGlvblVSTCwgcmVxdWVzdE9wdHMpKSk7XHJcblx0XHRcdFx0XHRcdGZpbmFsaXplKCk7XHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHByZXBhcmUgcmVzcG9uc2VcclxuXHRcdFx0cmVzLm9uY2UoJ2VuZCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRpZiAoc2lnbmFsKSBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydEFuZEZpbmFsaXplKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGxldCBib2R5ID0gcmVzLnBpcGUobmV3IFBhc3NUaHJvdWdoJDEoKSk7XHJcblxyXG5cdFx0XHRjb25zdCByZXNwb25zZV9vcHRpb25zID0ge1xyXG5cdFx0XHRcdHVybDogcmVxdWVzdC51cmwsXHJcblx0XHRcdFx0c3RhdHVzOiByZXMuc3RhdHVzQ29kZSxcclxuXHRcdFx0XHRzdGF0dXNUZXh0OiByZXMuc3RhdHVzTWVzc2FnZSxcclxuXHRcdFx0XHRoZWFkZXJzOiBoZWFkZXJzLFxyXG5cdFx0XHRcdHNpemU6IHJlcXVlc3Quc2l6ZSxcclxuXHRcdFx0XHR0aW1lb3V0OiByZXF1ZXN0LnRpbWVvdXQsXHJcblx0XHRcdFx0Y291bnRlcjogcmVxdWVzdC5jb3VudGVyXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHQvLyBIVFRQLW5ldHdvcmsgZmV0Y2ggc3RlcCAxMi4xLjEuM1xyXG5cdFx0XHRjb25zdCBjb2RpbmdzID0gaGVhZGVycy5nZXQoJ0NvbnRlbnQtRW5jb2RpbmcnKTtcclxuXHJcblx0XHRcdC8vIEhUVFAtbmV0d29yayBmZXRjaCBzdGVwIDEyLjEuMS40OiBoYW5kbGUgY29udGVudCBjb2RpbmdzXHJcblxyXG5cdFx0XHQvLyBpbiBmb2xsb3dpbmcgc2NlbmFyaW9zIHdlIGlnbm9yZSBjb21wcmVzc2lvbiBzdXBwb3J0XHJcblx0XHRcdC8vIDEuIGNvbXByZXNzaW9uIHN1cHBvcnQgaXMgZGlzYWJsZWRcclxuXHRcdFx0Ly8gMi4gSEVBRCByZXF1ZXN0XHJcblx0XHRcdC8vIDMuIG5vIENvbnRlbnQtRW5jb2RpbmcgaGVhZGVyXHJcblx0XHRcdC8vIDQuIG5vIGNvbnRlbnQgcmVzcG9uc2UgKDIwNClcclxuXHRcdFx0Ly8gNS4gY29udGVudCBub3QgbW9kaWZpZWQgcmVzcG9uc2UgKDMwNClcclxuXHRcdFx0aWYgKCFyZXF1ZXN0LmNvbXByZXNzIHx8IHJlcXVlc3QubWV0aG9kID09PSAnSEVBRCcgfHwgY29kaW5ncyA9PT0gbnVsbCB8fCByZXMuc3RhdHVzQ29kZSA9PT0gMjA0IHx8IHJlcy5zdGF0dXNDb2RlID09PSAzMDQpIHtcclxuXHRcdFx0XHRyZXNwb25zZSA9IG5ldyBSZXNwb25zZShib2R5LCByZXNwb25zZV9vcHRpb25zKTtcclxuXHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIEZvciBOb2RlIHY2K1xyXG5cdFx0XHQvLyBCZSBsZXNzIHN0cmljdCB3aGVuIGRlY29kaW5nIGNvbXByZXNzZWQgcmVzcG9uc2VzLCBzaW5jZSBzb21ldGltZXNcclxuXHRcdFx0Ly8gc2VydmVycyBzZW5kIHNsaWdodGx5IGludmFsaWQgcmVzcG9uc2VzIHRoYXQgYXJlIHN0aWxsIGFjY2VwdGVkXHJcblx0XHRcdC8vIGJ5IGNvbW1vbiBicm93c2Vycy5cclxuXHRcdFx0Ly8gQWx3YXlzIHVzaW5nIFpfU1lOQ19GTFVTSCBpcyB3aGF0IGNVUkwgZG9lcy5cclxuXHRcdFx0Y29uc3QgemxpYk9wdGlvbnMgPSB7XHJcblx0XHRcdFx0Zmx1c2g6IHpsaWIuWl9TWU5DX0ZMVVNILFxyXG5cdFx0XHRcdGZpbmlzaEZsdXNoOiB6bGliLlpfU1lOQ19GTFVTSFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0Ly8gZm9yIGd6aXBcclxuXHRcdFx0aWYgKGNvZGluZ3MgPT0gJ2d6aXAnIHx8IGNvZGluZ3MgPT0gJ3gtZ3ppcCcpIHtcclxuXHRcdFx0XHRib2R5ID0gYm9keS5waXBlKHpsaWIuY3JlYXRlR3VuemlwKHpsaWJPcHRpb25zKSk7XHJcblx0XHRcdFx0cmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UoYm9keSwgcmVzcG9uc2Vfb3B0aW9ucyk7XHJcblx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBmb3IgZGVmbGF0ZVxyXG5cdFx0XHRpZiAoY29kaW5ncyA9PSAnZGVmbGF0ZScgfHwgY29kaW5ncyA9PSAneC1kZWZsYXRlJykge1xyXG5cdFx0XHRcdC8vIGhhbmRsZSB0aGUgaW5mYW1vdXMgcmF3IGRlZmxhdGUgcmVzcG9uc2UgZnJvbSBvbGQgc2VydmVyc1xyXG5cdFx0XHRcdC8vIGEgaGFjayBmb3Igb2xkIElJUyBhbmQgQXBhY2hlIHNlcnZlcnNcclxuXHRcdFx0XHRjb25zdCByYXcgPSByZXMucGlwZShuZXcgUGFzc1Rocm91Z2gkMSgpKTtcclxuXHRcdFx0XHRyYXcub25jZSgnZGF0YScsIGZ1bmN0aW9uIChjaHVuaykge1xyXG5cdFx0XHRcdFx0Ly8gc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzc1MTk4MjhcclxuXHRcdFx0XHRcdGlmICgoY2h1bmtbMF0gJiAweDBGKSA9PT0gMHgwOCkge1xyXG5cdFx0XHRcdFx0XHRib2R5ID0gYm9keS5waXBlKHpsaWIuY3JlYXRlSW5mbGF0ZSgpKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGJvZHkgPSBib2R5LnBpcGUoemxpYi5jcmVhdGVJbmZsYXRlUmF3KCkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UoYm9keSwgcmVzcG9uc2Vfb3B0aW9ucyk7XHJcblx0XHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGZvciBiclxyXG5cdFx0XHRpZiAoY29kaW5ncyA9PSAnYnInICYmIHR5cGVvZiB6bGliLmNyZWF0ZUJyb3RsaURlY29tcHJlc3MgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRib2R5ID0gYm9keS5waXBlKHpsaWIuY3JlYXRlQnJvdGxpRGVjb21wcmVzcygpKTtcclxuXHRcdFx0XHRyZXNwb25zZSA9IG5ldyBSZXNwb25zZShib2R5LCByZXNwb25zZV9vcHRpb25zKTtcclxuXHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIG90aGVyd2lzZSwgdXNlIHJlc3BvbnNlIGFzLWlzXHJcblx0XHRcdHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGJvZHksIHJlc3BvbnNlX29wdGlvbnMpO1xyXG5cdFx0XHRyZXNvbHZlKHJlc3BvbnNlKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHdyaXRlVG9TdHJlYW0ocmVxLCByZXF1ZXN0KTtcclxuXHR9KTtcclxufVxyXG4vKipcclxuICogUmVkaXJlY3QgY29kZSBtYXRjaGluZ1xyXG4gKlxyXG4gKiBAcGFyYW0gICBOdW1iZXIgICBjb2RlICBTdGF0dXMgY29kZVxyXG4gKiBAcmV0dXJuICBCb29sZWFuXHJcbiAqL1xyXG5mZXRjaC5pc1JlZGlyZWN0ID0gZnVuY3Rpb24gKGNvZGUpIHtcclxuXHRyZXR1cm4gY29kZSA9PT0gMzAxIHx8IGNvZGUgPT09IDMwMiB8fCBjb2RlID09PSAzMDMgfHwgY29kZSA9PT0gMzA3IHx8IGNvZGUgPT09IDMwODtcclxufTtcclxuXHJcbi8vIGV4cG9zZSBQcm9taXNlXHJcbmZldGNoLlByb21pc2UgPSBnbG9iYWwuUHJvbWlzZTtcclxuXHJcbmZ1bmN0aW9uIGdldF9wYWdlX2hhbmRsZXIoXHJcblx0bWFuaWZlc3QsXHJcblx0c2Vzc2lvbl9nZXR0ZXJcclxuKSB7XHJcblx0Y29uc3QgZ2V0X2J1aWxkX2luZm8gPSBkZXZcclxuXHRcdD8gKCkgPT4gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKGJ1aWxkX2RpciwgJ2J1aWxkLmpzb24nKSwgJ3V0Zi04JykpXHJcblx0XHQ6IChhc3NldHMgPT4gKCkgPT4gYXNzZXRzKShKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oYnVpbGRfZGlyLCAnYnVpbGQuanNvbicpLCAndXRmLTgnKSkpO1xyXG5cclxuXHRjb25zdCB0ZW1wbGF0ZSA9IGRldlxyXG5cdFx0PyAoKSA9PiByZWFkX3RlbXBsYXRlKHNyY19kaXIpXHJcblx0XHQ6IChzdHIgPT4gKCkgPT4gc3RyKShyZWFkX3RlbXBsYXRlKGJ1aWxkX2RpcikpO1xyXG5cclxuXHRjb25zdCBoYXNfc2VydmljZV93b3JrZXIgPSBmcy5leGlzdHNTeW5jKHBhdGguam9pbihidWlsZF9kaXIsICdzZXJ2aWNlLXdvcmtlci5qcycpKTtcclxuXHJcblx0Y29uc3QgeyBzZXJ2ZXJfcm91dGVzLCBwYWdlcyB9ID0gbWFuaWZlc3Q7XHJcblx0Y29uc3QgZXJyb3Jfcm91dGUgPSBtYW5pZmVzdC5lcnJvcjtcclxuXHJcblx0ZnVuY3Rpb24gYmFpbChyZXEsIHJlcywgZXJyKSB7XHJcblx0XHRjb25zb2xlLmVycm9yKGVycik7XHJcblxyXG5cdFx0Y29uc3QgbWVzc2FnZSA9IGRldiA/IGVzY2FwZV9odG1sKGVyci5tZXNzYWdlKSA6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InO1xyXG5cclxuXHRcdHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG5cdFx0cmVzLmVuZChgPHByZT4ke21lc3NhZ2V9PC9wcmU+YCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVfZXJyb3IocmVxLCByZXMsIHN0YXR1c0NvZGUsIGVycm9yKSB7XHJcblx0XHRoYW5kbGVfcGFnZSh7XHJcblx0XHRcdHBhdHRlcm46IG51bGwsXHJcblx0XHRcdHBhcnRzOiBbXHJcblx0XHRcdFx0eyBuYW1lOiBudWxsLCBjb21wb25lbnQ6IGVycm9yX3JvdXRlIH1cclxuXHRcdFx0XVxyXG5cdFx0fSwgcmVxLCByZXMsIHN0YXR1c0NvZGUsIGVycm9yIHx8IG5ldyBFcnJvcignVW5rbm93biBlcnJvciBpbiBwcmVsb2FkIGZ1bmN0aW9uJykpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gaGFuZGxlX3BhZ2UocGFnZSwgcmVxLCByZXMsIHN0YXR1cyA9IDIwMCwgZXJyb3IgPSBudWxsKSB7XHJcblx0XHRjb25zdCBpc19zZXJ2aWNlX3dvcmtlcl9pbmRleCA9IHJlcS5wYXRoID09PSAnL3NlcnZpY2Utd29ya2VyLWluZGV4Lmh0bWwnO1xyXG5cdFx0Y29uc3QgYnVpbGRfaW5mb1xyXG5cclxuXHJcblxyXG5cclxuID0gZ2V0X2J1aWxkX2luZm8oKTtcclxuXHJcblx0XHRyZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcblx0XHRyZXMuc2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJywgZGV2ID8gJ25vLWNhY2hlJyA6ICdtYXgtYWdlPTYwMCcpO1xyXG5cclxuXHRcdC8vIHByZWxvYWQgbWFpbi5qcyBhbmQgY3VycmVudCByb3V0ZVxyXG5cdFx0Ly8gVE9ETyBkZXRlY3Qgb3RoZXIgc3R1ZmYgd2UgY2FuIHByZWxvYWQ/IGltYWdlcywgQ1NTLCBmb250cz9cclxuXHRcdGxldCBwcmVsb2FkZWRfY2h1bmtzID0gQXJyYXkuaXNBcnJheShidWlsZF9pbmZvLmFzc2V0cy5tYWluKSA/IGJ1aWxkX2luZm8uYXNzZXRzLm1haW4gOiBbYnVpbGRfaW5mby5hc3NldHMubWFpbl07XHJcblx0XHRpZiAoIWVycm9yICYmICFpc19zZXJ2aWNlX3dvcmtlcl9pbmRleCkge1xyXG5cdFx0XHRwYWdlLnBhcnRzLmZvckVhY2gocGFydCA9PiB7XHJcblx0XHRcdFx0aWYgKCFwYXJ0KSByZXR1cm47XHJcblxyXG5cdFx0XHRcdC8vIHVzaW5nIGNvbmNhdCBiZWNhdXNlIGl0IGNvdWxkIGJlIGEgc3RyaW5nIG9yIGFuIGFycmF5LiB0aGFua3Mgd2VicGFjayFcclxuXHRcdFx0XHRwcmVsb2FkZWRfY2h1bmtzID0gcHJlbG9hZGVkX2NodW5rcy5jb25jYXQoYnVpbGRfaW5mby5hc3NldHNbcGFydC5uYW1lXSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChidWlsZF9pbmZvLmJ1bmRsZXIgPT09ICdyb2xsdXAnKSB7XHJcblx0XHRcdC8vIFRPRE8gYWRkIGRlcGVuZGVuY2llcyBhbmQgQ1NTXHJcblx0XHRcdGNvbnN0IGxpbmsgPSBwcmVsb2FkZWRfY2h1bmtzXHJcblx0XHRcdFx0LmZpbHRlcihmaWxlID0+IGZpbGUgJiYgIWZpbGUubWF0Y2goL1xcLm1hcCQvKSlcclxuXHRcdFx0XHQubWFwKGZpbGUgPT4gYDwke3JlcS5iYXNlVXJsfS9jbGllbnQvJHtmaWxlfT47cmVsPVwibW9kdWxlcHJlbG9hZFwiYClcclxuXHRcdFx0XHQuam9pbignLCAnKTtcclxuXHJcblx0XHRcdHJlcy5zZXRIZWFkZXIoJ0xpbmsnLCBsaW5rKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IGxpbmsgPSBwcmVsb2FkZWRfY2h1bmtzXHJcblx0XHRcdFx0LmZpbHRlcihmaWxlID0+IGZpbGUgJiYgIWZpbGUubWF0Y2goL1xcLm1hcCQvKSlcclxuXHRcdFx0XHQubWFwKChmaWxlKSA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCBhcyA9IC9cXC5jc3MkLy50ZXN0KGZpbGUpID8gJ3N0eWxlJyA6ICdzY3JpcHQnO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGA8JHtyZXEuYmFzZVVybH0vY2xpZW50LyR7ZmlsZX0+O3JlbD1cInByZWxvYWRcIjthcz1cIiR7YXN9XCJgO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LmpvaW4oJywgJyk7XHJcblxyXG5cdFx0XHRyZXMuc2V0SGVhZGVyKCdMaW5rJywgbGluayk7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3Qgc2Vzc2lvbiA9IHNlc3Npb25fZ2V0dGVyKHJlcSwgcmVzKTtcclxuXHJcblx0XHRsZXQgcmVkaXJlY3Q7XHJcblx0XHRsZXQgcHJlbG9hZF9lcnJvcjtcclxuXHJcblx0XHRjb25zdCBwcmVsb2FkX2NvbnRleHQgPSB7XHJcblx0XHRcdHJlZGlyZWN0OiAoc3RhdHVzQ29kZSwgbG9jYXRpb24pID0+IHtcclxuXHRcdFx0XHRpZiAocmVkaXJlY3QgJiYgKHJlZGlyZWN0LnN0YXR1c0NvZGUgIT09IHN0YXR1c0NvZGUgfHwgcmVkaXJlY3QubG9jYXRpb24gIT09IGxvY2F0aW9uKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDb25mbGljdGluZyByZWRpcmVjdHNgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0bG9jYXRpb24gPSBsb2NhdGlvbi5yZXBsYWNlKC9eXFwvL2csICcnKTsgLy8gbGVhZGluZyBzbGFzaCAob25seSlcclxuXHRcdFx0XHRyZWRpcmVjdCA9IHsgc3RhdHVzQ29kZSwgbG9jYXRpb24gfTtcclxuXHRcdFx0fSxcclxuXHRcdFx0ZXJyb3I6IChzdGF0dXNDb2RlLCBtZXNzYWdlKSA9PiB7XHJcblx0XHRcdFx0cHJlbG9hZF9lcnJvciA9IHsgc3RhdHVzQ29kZSwgbWVzc2FnZSB9O1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRmZXRjaDogKHVybCwgb3B0cykgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IHBhcnNlZCA9IG5ldyBVcmwuVVJMKHVybCwgYGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9jZXNzLmVudi5QT1JUfSR7cmVxLmJhc2VVcmwgPyByZXEuYmFzZVVybCArICcvJyA6Jyd9YCk7XHJcblxyXG5cdFx0XHRcdGlmIChvcHRzKSB7XHJcblx0XHRcdFx0XHRvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0cyk7XHJcblxyXG5cdFx0XHRcdFx0Y29uc3QgaW5jbHVkZV9jb29raWVzID0gKFxyXG5cdFx0XHRcdFx0XHRvcHRzLmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScgfHxcclxuXHRcdFx0XHRcdFx0b3B0cy5jcmVkZW50aWFscyA9PT0gJ3NhbWUtb3JpZ2luJyAmJiBwYXJzZWQub3JpZ2luID09PSBgaHR0cDovLzEyNy4wLjAuMToke3Byb2Nlc3MuZW52LlBPUlR9YFxyXG5cdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRpZiAoaW5jbHVkZV9jb29raWVzKSB7XHJcblx0XHRcdFx0XHRcdG9wdHMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdHMuaGVhZGVycyk7XHJcblxyXG5cdFx0XHRcdFx0XHRjb25zdCBjb29raWVzID0gT2JqZWN0LmFzc2lnbihcclxuXHRcdFx0XHRcdFx0XHR7fSxcclxuXHRcdFx0XHRcdFx0XHRjb29raWUucGFyc2UocmVxLmhlYWRlcnMuY29va2llIHx8ICcnKSxcclxuXHRcdFx0XHRcdFx0XHRjb29raWUucGFyc2Uob3B0cy5oZWFkZXJzLmNvb2tpZSB8fCAnJylcclxuXHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdGNvbnN0IHNldF9jb29raWUgPSByZXMuZ2V0SGVhZGVyKCdTZXQtQ29va2llJyk7XHJcblx0XHRcdFx0XHRcdChBcnJheS5pc0FycmF5KHNldF9jb29raWUpID8gc2V0X2Nvb2tpZSA6IFtzZXRfY29va2llXSkuZm9yRWFjaChzdHIgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG1hdGNoID0gLyhbXj1dKyk9KFteO10rKS8uZXhlYyhzdHIpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChtYXRjaCkgY29va2llc1ttYXRjaFsxXV0gPSBtYXRjaFsyXTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHRjb25zdCBzdHIgPSBPYmplY3Qua2V5cyhjb29raWVzKVxyXG5cdFx0XHRcdFx0XHRcdC5tYXAoa2V5ID0+IGAke2tleX09JHtjb29raWVzW2tleV19YClcclxuXHRcdFx0XHRcdFx0XHQuam9pbignOyAnKTtcclxuXHJcblx0XHRcdFx0XHRcdG9wdHMuaGVhZGVycy5jb29raWUgPSBzdHI7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gZmV0Y2gocGFyc2VkLmhyZWYsIG9wdHMpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdGxldCBwcmVsb2FkZWQ7XHJcblx0XHRsZXQgbWF0Y2g7XHJcblx0XHRsZXQgcGFyYW1zO1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdGNvbnN0IHJvb3RfcHJlbG9hZGVkID0gbWFuaWZlc3Qucm9vdF9wcmVsb2FkXHJcblx0XHRcdFx0PyBtYW5pZmVzdC5yb290X3ByZWxvYWQuY2FsbChwcmVsb2FkX2NvbnRleHQsIHtcclxuXHRcdFx0XHRcdGhvc3Q6IHJlcS5oZWFkZXJzLmhvc3QsXHJcblx0XHRcdFx0XHRwYXRoOiByZXEucGF0aCxcclxuXHRcdFx0XHRcdHF1ZXJ5OiByZXEucXVlcnksXHJcblx0XHRcdFx0XHRwYXJhbXM6IHt9XHJcblx0XHRcdFx0fSwgc2Vzc2lvbilcclxuXHRcdFx0XHQ6IHt9O1xyXG5cclxuXHRcdFx0bWF0Y2ggPSBlcnJvciA/IG51bGwgOiBwYWdlLnBhdHRlcm4uZXhlYyhyZXEucGF0aCk7XHJcblxyXG5cclxuXHRcdFx0bGV0IHRvUHJlbG9hZCA9IFtyb290X3ByZWxvYWRlZF07XHJcblx0XHRcdGlmICghaXNfc2VydmljZV93b3JrZXJfaW5kZXgpIHtcclxuXHRcdFx0XHR0b1ByZWxvYWQgPSB0b1ByZWxvYWQuY29uY2F0KHBhZ2UucGFydHMubWFwKHBhcnQgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKCFwYXJ0KSByZXR1cm4gbnVsbDtcclxuXHJcblx0XHRcdFx0XHQvLyB0aGUgZGVlcGVzdCBsZXZlbCBpcyB1c2VkIGJlbG93LCB0byBpbml0aWFsaXNlIHRoZSBzdG9yZVxyXG5cdFx0XHRcdFx0cGFyYW1zID0gcGFydC5wYXJhbXMgPyBwYXJ0LnBhcmFtcyhtYXRjaCkgOiB7fTtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gcGFydC5wcmVsb2FkXHJcblx0XHRcdFx0XHRcdD8gcGFydC5wcmVsb2FkLmNhbGwocHJlbG9hZF9jb250ZXh0LCB7XHJcblx0XHRcdFx0XHRcdFx0aG9zdDogcmVxLmhlYWRlcnMuaG9zdCxcclxuXHRcdFx0XHRcdFx0XHRwYXRoOiByZXEucGF0aCxcclxuXHRcdFx0XHRcdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LFxyXG5cdFx0XHRcdFx0XHRcdHBhcmFtc1xyXG5cdFx0XHRcdFx0XHR9LCBzZXNzaW9uKVxyXG5cdFx0XHRcdFx0XHQ6IHt9O1xyXG5cdFx0XHRcdH0pKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHJlbG9hZGVkID0gYXdhaXQgUHJvbWlzZS5hbGwodG9QcmVsb2FkKTtcclxuXHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0XHRyZXR1cm4gYmFpbChyZXEsIHJlcywgZXJyKVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwcmVsb2FkX2Vycm9yID0geyBzdGF0dXNDb2RlOiA1MDAsIG1lc3NhZ2U6IGVyciB9O1xyXG5cdFx0XHRwcmVsb2FkZWQgPSBbXTsgLy8gYXBwZWFzZSBUeXBlU2NyaXB0XHJcblx0XHR9XHJcblxyXG5cdFx0dHJ5IHtcclxuXHRcdFx0aWYgKHJlZGlyZWN0KSB7XHJcblx0XHRcdFx0Y29uc3QgbG9jYXRpb24gPSBVcmwucmVzb2x2ZSgocmVxLmJhc2VVcmwgfHwgJycpICsgJy8nLCByZWRpcmVjdC5sb2NhdGlvbik7XHJcblxyXG5cdFx0XHRcdHJlcy5zdGF0dXNDb2RlID0gcmVkaXJlY3Quc3RhdHVzQ29kZTtcclxuXHRcdFx0XHRyZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsIGxvY2F0aW9uKTtcclxuXHRcdFx0XHRyZXMuZW5kKCk7XHJcblxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHByZWxvYWRfZXJyb3IpIHtcclxuXHRcdFx0XHRoYW5kbGVfZXJyb3IocmVxLCByZXMsIHByZWxvYWRfZXJyb3Iuc3RhdHVzQ29kZSwgcHJlbG9hZF9lcnJvci5tZXNzYWdlKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IHNlZ21lbnRzID0gcmVxLnBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7XHJcblxyXG5cdFx0XHQvLyBUT0RPIG1ha2UgdGhpcyBsZXNzIGNvbmZ1c2luZ1xyXG5cdFx0XHRjb25zdCBsYXlvdXRfc2VnbWVudHMgPSBbc2VnbWVudHNbMF1dO1xyXG5cdFx0XHRsZXQgbCA9IDE7XHJcblxyXG5cdFx0XHRwYWdlLnBhcnRzLmZvckVhY2goKHBhcnQsIGkpID0+IHtcclxuXHRcdFx0XHRsYXlvdXRfc2VnbWVudHNbbF0gPSBzZWdtZW50c1tpICsgMV07XHJcblx0XHRcdFx0aWYgKCFwYXJ0KSByZXR1cm4gbnVsbDtcclxuXHRcdFx0XHRsKys7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Y29uc3QgcHJvcHMgPSB7XHJcblx0XHRcdFx0c3RvcmVzOiB7XHJcblx0XHRcdFx0XHRwYWdlOiB7XHJcblx0XHRcdFx0XHRcdHN1YnNjcmliZTogd3JpdGFibGUoe1xyXG5cdFx0XHRcdFx0XHRcdGhvc3Q6IHJlcS5oZWFkZXJzLmhvc3QsXHJcblx0XHRcdFx0XHRcdFx0cGF0aDogcmVxLnBhdGgsXHJcblx0XHRcdFx0XHRcdFx0cXVlcnk6IHJlcS5xdWVyeSxcclxuXHRcdFx0XHRcdFx0XHRwYXJhbXNcclxuXHRcdFx0XHRcdFx0fSkuc3Vic2NyaWJlXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0cHJlbG9hZGluZzoge1xyXG5cdFx0XHRcdFx0XHRzdWJzY3JpYmU6IHdyaXRhYmxlKG51bGwpLnN1YnNjcmliZVxyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdHNlc3Npb246IHdyaXRhYmxlKHNlc3Npb24pXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzZWdtZW50czogbGF5b3V0X3NlZ21lbnRzLFxyXG5cdFx0XHRcdHN0YXR1czogZXJyb3IgPyBzdGF0dXMgOiAyMDAsXHJcblx0XHRcdFx0ZXJyb3I6IGVycm9yID8gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yIDogeyBtZXNzYWdlOiBlcnJvciB9IDogbnVsbCxcclxuXHRcdFx0XHRsZXZlbDA6IHtcclxuXHRcdFx0XHRcdHByb3BzOiBwcmVsb2FkZWRbMF1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGxldmVsMToge1xyXG5cdFx0XHRcdFx0c2VnbWVudDogc2VnbWVudHNbMF0sXHJcblx0XHRcdFx0XHRwcm9wczoge31cclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRpZiAoIWlzX3NlcnZpY2Vfd29ya2VyX2luZGV4KSB7XHJcblx0XHRcdFx0bGV0IGwgPSAxO1xyXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcGFnZS5wYXJ0cy5sZW5ndGg7IGkgKz0gMSkge1xyXG5cdFx0XHRcdFx0Y29uc3QgcGFydCA9IHBhZ2UucGFydHNbaV07XHJcblx0XHRcdFx0XHRpZiAoIXBhcnQpIGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdHByb3BzW2BsZXZlbCR7bCsrfWBdID0ge1xyXG5cdFx0XHRcdFx0XHRjb21wb25lbnQ6IHBhcnQuY29tcG9uZW50LFxyXG5cdFx0XHRcdFx0XHRwcm9wczogcHJlbG9hZGVkW2kgKyAxXSB8fCB7fSxcclxuXHRcdFx0XHRcdFx0c2VnbWVudDogc2VnbWVudHNbaV1cclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25zdCB7IGh0bWwsIGhlYWQsIGNzcyB9ID0gQXBwLnJlbmRlcihwcm9wcyk7XHJcblxyXG5cdFx0XHRjb25zdCBzZXJpYWxpemVkID0ge1xyXG5cdFx0XHRcdHByZWxvYWRlZDogYFske3ByZWxvYWRlZC5tYXAoZGF0YSA9PiB0cnlfc2VyaWFsaXplKGRhdGEpKS5qb2luKCcsJyl9XWAsXHJcblx0XHRcdFx0c2Vzc2lvbjogc2Vzc2lvbiAmJiB0cnlfc2VyaWFsaXplKHNlc3Npb24sIGVyciA9PiB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBzZXJpYWxpemUgc2Vzc2lvbiBkYXRhOiAke2Vyci5tZXNzYWdlfWApO1xyXG5cdFx0XHRcdH0pLFxyXG5cdFx0XHRcdGVycm9yOiBlcnJvciAmJiB0cnlfc2VyaWFsaXplKHByb3BzLmVycm9yKVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0bGV0IHNjcmlwdCA9IGBfX1NBUFBFUl9fPXske1tcclxuXHRcdFx0XHRlcnJvciAmJiBgZXJyb3I6JHtzZXJpYWxpemVkLmVycm9yfSxzdGF0dXM6JHtzdGF0dXN9YCxcclxuXHRcdFx0XHRgYmFzZVVybDpcIiR7cmVxLmJhc2VVcmx9XCJgLFxyXG5cdFx0XHRcdHNlcmlhbGl6ZWQucHJlbG9hZGVkICYmIGBwcmVsb2FkZWQ6JHtzZXJpYWxpemVkLnByZWxvYWRlZH1gLFxyXG5cdFx0XHRcdHNlcmlhbGl6ZWQuc2Vzc2lvbiAmJiBgc2Vzc2lvbjoke3NlcmlhbGl6ZWQuc2Vzc2lvbn1gXHJcblx0XHRcdF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJywnKX19O2A7XHJcblxyXG5cdFx0XHRpZiAoaGFzX3NlcnZpY2Vfd29ya2VyKSB7XHJcblx0XHRcdFx0c2NyaXB0ICs9IGBpZignc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKW5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKCcke3JlcS5iYXNlVXJsfS9zZXJ2aWNlLXdvcmtlci5qcycpO2A7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IGZpbGUgPSBbXS5jb25jYXQoYnVpbGRfaW5mby5hc3NldHMubWFpbikuZmlsdGVyKGZpbGUgPT4gZmlsZSAmJiAvXFwuanMkLy50ZXN0KGZpbGUpKVswXTtcclxuXHRcdFx0Y29uc3QgbWFpbiA9IGAke3JlcS5iYXNlVXJsfS9jbGllbnQvJHtmaWxlfWA7XHJcblxyXG5cdFx0XHRpZiAoYnVpbGRfaW5mby5idW5kbGVyID09PSAncm9sbHVwJykge1xyXG5cdFx0XHRcdGlmIChidWlsZF9pbmZvLmxlZ2FjeV9hc3NldHMpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGxlZ2FjeV9tYWluID0gYCR7cmVxLmJhc2VVcmx9L2NsaWVudC9sZWdhY3kvJHtidWlsZF9pbmZvLmxlZ2FjeV9hc3NldHMubWFpbn1gO1xyXG5cdFx0XHRcdFx0c2NyaXB0ICs9IGAoZnVuY3Rpb24oKXt0cnl7ZXZhbChcImFzeW5jIGZ1bmN0aW9uIHgoKXt9XCIpO3ZhciBtYWluPVwiJHttYWlufVwifWNhdGNoKGUpe21haW49XCIke2xlZ2FjeV9tYWlufVwifTt2YXIgcz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO3RyeXtuZXcgRnVuY3Rpb24oXCJpZigwKWltcG9ydCgnJylcIikoKTtzLnNyYz1tYWluO3MudHlwZT1cIm1vZHVsZVwiO3MuY3Jvc3NPcmlnaW49XCJ1c2UtY3JlZGVudGlhbHNcIjt9Y2F0Y2goZSl7cy5zcmM9XCIke3JlcS5iYXNlVXJsfS9jbGllbnQvc2hpbXBvcnRAJHtidWlsZF9pbmZvLnNoaW1wb3J0fS5qc1wiO3Muc2V0QXR0cmlidXRlKFwiZGF0YS1tYWluXCIsbWFpbik7fWRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocyk7fSgpKTtgO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRzY3JpcHQgKz0gYHZhciBzPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7dHJ5e25ldyBGdW5jdGlvbihcImlmKDApaW1wb3J0KCcnKVwiKSgpO3Muc3JjPVwiJHttYWlufVwiO3MudHlwZT1cIm1vZHVsZVwiO3MuY3Jvc3NPcmlnaW49XCJ1c2UtY3JlZGVudGlhbHNcIjt9Y2F0Y2goZSl7cy5zcmM9XCIke3JlcS5iYXNlVXJsfS9jbGllbnQvc2hpbXBvcnRAJHtidWlsZF9pbmZvLnNoaW1wb3J0fS5qc1wiO3Muc2V0QXR0cmlidXRlKFwiZGF0YS1tYWluXCIsXCIke21haW59XCIpfWRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocylgO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRzY3JpcHQgKz0gYDwvc2NyaXB0PjxzY3JpcHQgc3JjPVwiJHttYWlufVwiPmA7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCBzdHlsZXM7XHJcblxyXG5cdFx0XHQvLyBUT0RPIG1ha2UgdGhpcyBjb25zaXN0ZW50IGFjcm9zcyBhcHBzXHJcblx0XHRcdC8vIFRPRE8gZW1iZWQgYnVpbGRfaW5mbyBpbiBwbGFjZWhvbGRlci50c1xyXG5cdFx0XHRpZiAoYnVpbGRfaW5mby5jc3MgJiYgYnVpbGRfaW5mby5jc3MubWFpbikge1xyXG5cdFx0XHRcdGNvbnN0IGNzc19jaHVua3MgPSBuZXcgU2V0KCk7XHJcblx0XHRcdFx0aWYgKGJ1aWxkX2luZm8uY3NzLm1haW4pIGNzc19jaHVua3MuYWRkKGJ1aWxkX2luZm8uY3NzLm1haW4pO1xyXG5cdFx0XHRcdHBhZ2UucGFydHMuZm9yRWFjaChwYXJ0ID0+IHtcclxuXHRcdFx0XHRcdGlmICghcGFydCkgcmV0dXJuO1xyXG5cdFx0XHRcdFx0Y29uc3QgY3NzX2NodW5rc19mb3JfcGFydCA9IGJ1aWxkX2luZm8uY3NzLmNodW5rc1twYXJ0LmZpbGVdO1xyXG5cclxuXHRcdFx0XHRcdGlmIChjc3NfY2h1bmtzX2Zvcl9wYXJ0KSB7XHJcblx0XHRcdFx0XHRcdGNzc19jaHVua3NfZm9yX3BhcnQuZm9yRWFjaChmaWxlID0+IHtcclxuXHRcdFx0XHRcdFx0XHRjc3NfY2h1bmtzLmFkZChmaWxlKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdHN0eWxlcyA9IEFycmF5LmZyb20oY3NzX2NodW5rcylcclxuXHRcdFx0XHRcdC5tYXAoaHJlZiA9PiBgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCJjbGllbnQvJHtocmVmfVwiPmApXHJcblx0XHRcdFx0XHQuam9pbignJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0c3R5bGVzID0gKGNzcyAmJiBjc3MuY29kZSA/IGA8c3R5bGU+JHtjc3MuY29kZX08L3N0eWxlPmAgOiAnJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHVzZXJzIGNhbiBzZXQgYSBDU1Agbm9uY2UgdXNpbmcgcmVzLmxvY2Fscy5ub25jZVxyXG5cdFx0XHRjb25zdCBub25jZV9hdHRyID0gKHJlcy5sb2NhbHMgJiYgcmVzLmxvY2Fscy5ub25jZSkgPyBgIG5vbmNlPVwiJHtyZXMubG9jYWxzLm5vbmNlfVwiYCA6ICcnO1xyXG5cclxuXHRcdFx0Y29uc3QgYm9keSA9IHRlbXBsYXRlKClcclxuXHRcdFx0XHQucmVwbGFjZSgnJXNhcHBlci5iYXNlJScsICgpID0+IGA8YmFzZSBocmVmPVwiJHtyZXEuYmFzZVVybH0vXCI+YClcclxuXHRcdFx0XHQucmVwbGFjZSgnJXNhcHBlci5zY3JpcHRzJScsICgpID0+IGA8c2NyaXB0JHtub25jZV9hdHRyfT4ke3NjcmlwdH08L3NjcmlwdD5gKVxyXG5cdFx0XHRcdC5yZXBsYWNlKCclc2FwcGVyLmh0bWwlJywgKCkgPT4gaHRtbClcclxuXHRcdFx0XHQucmVwbGFjZSgnJXNhcHBlci5oZWFkJScsICgpID0+IGA8bm9zY3JpcHQgaWQ9J3NhcHBlci1oZWFkLXN0YXJ0Jz48L25vc2NyaXB0PiR7aGVhZH08bm9zY3JpcHQgaWQ9J3NhcHBlci1oZWFkLWVuZCc+PC9ub3NjcmlwdD5gKVxyXG5cdFx0XHRcdC5yZXBsYWNlKCclc2FwcGVyLnN0eWxlcyUnLCAoKSA9PiBzdHlsZXMpO1xyXG5cclxuXHRcdFx0cmVzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XHJcblx0XHRcdHJlcy5lbmQoYm9keSk7XHJcblx0XHR9IGNhdGNoKGVycikge1xyXG5cdFx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0XHRiYWlsKHJlcSwgcmVzLCBlcnIpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGhhbmRsZV9lcnJvcihyZXEsIHJlcywgNTAwLCBlcnIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gZnVuY3Rpb24gZmluZF9yb3V0ZShyZXEsIHJlcywgbmV4dCkge1xyXG5cdFx0aWYgKHJlcS5wYXRoID09PSAnL3NlcnZpY2Utd29ya2VyLWluZGV4Lmh0bWwnKSB7XHJcblx0XHRcdGNvbnN0IGhvbWVQYWdlID0gcGFnZXMuZmluZChwYWdlID0+IHBhZ2UucGF0dGVybi50ZXN0KCcvJykpO1xyXG5cdFx0XHRoYW5kbGVfcGFnZShob21lUGFnZSwgcmVxLCByZXMpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yIChjb25zdCBwYWdlIG9mIHBhZ2VzKSB7XHJcblx0XHRcdGlmIChwYWdlLnBhdHRlcm4udGVzdChyZXEucGF0aCkpIHtcclxuXHRcdFx0XHRoYW5kbGVfcGFnZShwYWdlLCByZXEsIHJlcyk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aGFuZGxlX2Vycm9yKHJlcSwgcmVzLCA0MDQsICdOb3QgZm91bmQnKTtcclxuXHR9O1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkX3RlbXBsYXRlKGRpciA9IGJ1aWxkX2Rpcikge1xyXG5cdHJldHVybiBmcy5yZWFkRmlsZVN5bmMoYCR7ZGlyfS90ZW1wbGF0ZS5odG1sYCwgJ3V0Zi04Jyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRyeV9zZXJpYWxpemUoZGF0YSwgZmFpbCkge1xyXG5cdHRyeSB7XHJcblx0XHRyZXR1cm4gZGV2YWx1ZShkYXRhKTtcclxuXHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdGlmIChmYWlsKSBmYWlsKGVycik7XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVzY2FwZV9odG1sKGh0bWwpIHtcclxuXHRjb25zdCBjaGFycyA9IHtcclxuXHRcdCdcIicgOiAncXVvdCcsXHJcblx0XHRcIidcIjogJyMzOScsXHJcblx0XHQnJic6ICdhbXAnLFxyXG5cdFx0JzwnIDogJ2x0JyxcclxuXHRcdCc+JyA6ICdndCdcclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gaHRtbC5yZXBsYWNlKC9bXCInJjw+XS9nLCBjID0+IGAmJHtjaGFyc1tjXX07YCk7XHJcbn1cclxuXHJcbnZhciBtaW1lX3JhdyA9IFwiYXBwbGljYXRpb24vYW5kcmV3LWluc2V0XFx0XFx0XFx0ZXpcXG5hcHBsaWNhdGlvbi9hcHBsaXh3YXJlXFx0XFx0XFx0XFx0YXdcXG5hcHBsaWNhdGlvbi9hdG9tK3htbFxcdFxcdFxcdFxcdGF0b21cXG5hcHBsaWNhdGlvbi9hdG9tY2F0K3htbFxcdFxcdFxcdFxcdGF0b21jYXRcXG5hcHBsaWNhdGlvbi9hdG9tc3ZjK3htbFxcdFxcdFxcdFxcdGF0b21zdmNcXG5hcHBsaWNhdGlvbi9jY3htbCt4bWxcXHRcXHRcXHRcXHRjY3htbFxcbmFwcGxpY2F0aW9uL2NkbWktY2FwYWJpbGl0eVxcdFxcdFxcdGNkbWlhXFxuYXBwbGljYXRpb24vY2RtaS1jb250YWluZXJcXHRcXHRcXHRjZG1pY1xcbmFwcGxpY2F0aW9uL2NkbWktZG9tYWluXFx0XFx0XFx0XFx0Y2RtaWRcXG5hcHBsaWNhdGlvbi9jZG1pLW9iamVjdFxcdFxcdFxcdFxcdGNkbWlvXFxuYXBwbGljYXRpb24vY2RtaS1xdWV1ZVxcdFxcdFxcdFxcdGNkbWlxXFxuYXBwbGljYXRpb24vY3Utc2VlbWVcXHRcXHRcXHRcXHRjdVxcbmFwcGxpY2F0aW9uL2Rhdm1vdW50K3htbFxcdFxcdFxcdGRhdm1vdW50XFxuYXBwbGljYXRpb24vZG9jYm9vayt4bWxcXHRcXHRcXHRcXHRkYmtcXG5hcHBsaWNhdGlvbi9kc3NjK2RlclxcdFxcdFxcdFxcdGRzc2NcXG5hcHBsaWNhdGlvbi9kc3NjK3htbFxcdFxcdFxcdFxcdHhkc3NjXFxuYXBwbGljYXRpb24vZWNtYXNjcmlwdFxcdFxcdFxcdFxcdGVjbWFcXG5hcHBsaWNhdGlvbi9lbW1hK3htbFxcdFxcdFxcdFxcdGVtbWFcXG5hcHBsaWNhdGlvbi9lcHViK3ppcFxcdFxcdFxcdFxcdGVwdWJcXG5hcHBsaWNhdGlvbi9leGlcXHRcXHRcXHRcXHRcXHRleGlcXG5hcHBsaWNhdGlvbi9mb250LXRkcGZyXFx0XFx0XFx0XFx0cGZyXFxuYXBwbGljYXRpb24vZ21sK3htbFxcdFxcdFxcdFxcdGdtbFxcbmFwcGxpY2F0aW9uL2dweCt4bWxcXHRcXHRcXHRcXHRncHhcXG5hcHBsaWNhdGlvbi9neGZcXHRcXHRcXHRcXHRcXHRneGZcXG5hcHBsaWNhdGlvbi9oeXBlcnN0dWRpb1xcdFxcdFxcdFxcdHN0a1xcbmFwcGxpY2F0aW9uL2lua21sK3htbFxcdFxcdFxcdFxcdGluayBpbmttbFxcbmFwcGxpY2F0aW9uL2lwZml4XFx0XFx0XFx0XFx0aXBmaXhcXG5hcHBsaWNhdGlvbi9qYXZhLWFyY2hpdmVcXHRcXHRcXHRqYXJcXG5hcHBsaWNhdGlvbi9qYXZhLXNlcmlhbGl6ZWQtb2JqZWN0XFx0XFx0c2VyXFxuYXBwbGljYXRpb24vamF2YS12bVxcdFxcdFxcdFxcdGNsYXNzXFxuYXBwbGljYXRpb24vamF2YXNjcmlwdFxcdFxcdFxcdFxcdGpzXFxuYXBwbGljYXRpb24vanNvblxcdFxcdFxcdFxcdGpzb24gbWFwXFxuYXBwbGljYXRpb24vanNvbm1sK2pzb25cXHRcXHRcXHRcXHRqc29ubWxcXG5hcHBsaWNhdGlvbi9sb3N0K3htbFxcdFxcdFxcdFxcdGxvc3R4bWxcXG5hcHBsaWNhdGlvbi9tYWMtYmluaGV4NDBcXHRcXHRcXHRocXhcXG5hcHBsaWNhdGlvbi9tYWMtY29tcGFjdHByb1xcdFxcdFxcdGNwdFxcbmFwcGxpY2F0aW9uL21hZHMreG1sXFx0XFx0XFx0XFx0bWFkc1xcbmFwcGxpY2F0aW9uL21hcmNcXHRcXHRcXHRcXHRtcmNcXG5hcHBsaWNhdGlvbi9tYXJjeG1sK3htbFxcdFxcdFxcdFxcdG1yY3hcXG5hcHBsaWNhdGlvbi9tYXRoZW1hdGljYVxcdFxcdFxcdFxcdG1hIG5iIG1iXFxuYXBwbGljYXRpb24vbWF0aG1sK3htbFxcdFxcdFxcdFxcdG1hdGhtbFxcbmFwcGxpY2F0aW9uL21ib3hcXHRcXHRcXHRcXHRtYm94XFxuYXBwbGljYXRpb24vbWVkaWFzZXJ2ZXJjb250cm9sK3htbFxcdFxcdG1zY21sXFxuYXBwbGljYXRpb24vbWV0YWxpbmsreG1sXFx0XFx0XFx0bWV0YWxpbmtcXG5hcHBsaWNhdGlvbi9tZXRhbGluazQreG1sXFx0XFx0XFx0bWV0YTRcXG5hcHBsaWNhdGlvbi9tZXRzK3htbFxcdFxcdFxcdFxcdG1ldHNcXG5hcHBsaWNhdGlvbi9tb2RzK3htbFxcdFxcdFxcdFxcdG1vZHNcXG5hcHBsaWNhdGlvbi9tcDIxXFx0XFx0XFx0XFx0bTIxIG1wMjFcXG5hcHBsaWNhdGlvbi9tcDRcXHRcXHRcXHRcXHRcXHRtcDRzXFxuYXBwbGljYXRpb24vbXN3b3JkXFx0XFx0XFx0XFx0ZG9jIGRvdFxcbmFwcGxpY2F0aW9uL214ZlxcdFxcdFxcdFxcdFxcdG14ZlxcbmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVxcdGJpbiBkbXMgbHJmIG1hciBzbyBkaXN0IGRpc3R6IHBrZyBicGsgZHVtcCBlbGMgZGVwbG95XFxuYXBwbGljYXRpb24vb2RhXFx0XFx0XFx0XFx0XFx0b2RhXFxuYXBwbGljYXRpb24vb2VicHMtcGFja2FnZSt4bWxcXHRcXHRcXHRvcGZcXG5hcHBsaWNhdGlvbi9vZ2dcXHRcXHRcXHRcXHRcXHRvZ3hcXG5hcHBsaWNhdGlvbi9vbWRvYyt4bWxcXHRcXHRcXHRcXHRvbWRvY1xcbmFwcGxpY2F0aW9uL29uZW5vdGVcXHRcXHRcXHRcXHRvbmV0b2Mgb25ldG9jMiBvbmV0bXAgb25lcGtnXFxuYXBwbGljYXRpb24vb3hwc1xcdFxcdFxcdFxcdG94cHNcXG5hcHBsaWNhdGlvbi9wYXRjaC1vcHMtZXJyb3IreG1sXFx0XFx0XFx0eGVyXFxuYXBwbGljYXRpb24vcGRmXFx0XFx0XFx0XFx0XFx0cGRmXFxuYXBwbGljYXRpb24vcGdwLWVuY3J5cHRlZFxcdFxcdFxcdHBncFxcbmFwcGxpY2F0aW9uL3BncC1zaWduYXR1cmVcXHRcXHRcXHRhc2Mgc2lnXFxuYXBwbGljYXRpb24vcGljcy1ydWxlc1xcdFxcdFxcdFxcdHByZlxcbmFwcGxpY2F0aW9uL3BrY3MxMFxcdFxcdFxcdFxcdHAxMFxcbmFwcGxpY2F0aW9uL3BrY3M3LW1pbWVcXHRcXHRcXHRcXHRwN20gcDdjXFxuYXBwbGljYXRpb24vcGtjczctc2lnbmF0dXJlXFx0XFx0XFx0cDdzXFxuYXBwbGljYXRpb24vcGtjczhcXHRcXHRcXHRcXHRwOFxcbmFwcGxpY2F0aW9uL3BraXgtYXR0ci1jZXJ0XFx0XFx0XFx0YWNcXG5hcHBsaWNhdGlvbi9wa2l4LWNlcnRcXHRcXHRcXHRcXHRjZXJcXG5hcHBsaWNhdGlvbi9wa2l4LWNybFxcdFxcdFxcdFxcdGNybFxcbmFwcGxpY2F0aW9uL3BraXgtcGtpcGF0aFxcdFxcdFxcdHBraXBhdGhcXG5hcHBsaWNhdGlvbi9wa2l4Y21wXFx0XFx0XFx0XFx0cGtpXFxuYXBwbGljYXRpb24vcGxzK3htbFxcdFxcdFxcdFxcdHBsc1xcbmFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcXHRcXHRcXHRcXHRhaSBlcHMgcHNcXG5hcHBsaWNhdGlvbi9wcnMuY3d3XFx0XFx0XFx0XFx0Y3d3XFxuYXBwbGljYXRpb24vcHNrYyt4bWxcXHRcXHRcXHRcXHRwc2tjeG1sXFxuYXBwbGljYXRpb24vcmRmK3htbFxcdFxcdFxcdFxcdHJkZlxcbmFwcGxpY2F0aW9uL3JlZ2luZm8reG1sXFx0XFx0XFx0XFx0cmlmXFxuYXBwbGljYXRpb24vcmVsYXgtbmctY29tcGFjdC1zeW50YXhcXHRcXHRybmNcXG5hcHBsaWNhdGlvbi9yZXNvdXJjZS1saXN0cyt4bWxcXHRcXHRcXHRybFxcbmFwcGxpY2F0aW9uL3Jlc291cmNlLWxpc3RzLWRpZmYreG1sXFx0XFx0cmxkXFxuYXBwbGljYXRpb24vcmxzLXNlcnZpY2VzK3htbFxcdFxcdFxcdHJzXFxuYXBwbGljYXRpb24vcnBraS1naG9zdGJ1c3RlcnNcXHRcXHRcXHRnYnJcXG5hcHBsaWNhdGlvbi9ycGtpLW1hbmlmZXN0XFx0XFx0XFx0bWZ0XFxuYXBwbGljYXRpb24vcnBraS1yb2FcXHRcXHRcXHRcXHRyb2FcXG5hcHBsaWNhdGlvbi9yc2QreG1sXFx0XFx0XFx0XFx0cnNkXFxuYXBwbGljYXRpb24vcnNzK3htbFxcdFxcdFxcdFxcdHJzc1xcbmFwcGxpY2F0aW9uL3J0ZlxcdFxcdFxcdFxcdFxcdHJ0ZlxcbmFwcGxpY2F0aW9uL3NibWwreG1sXFx0XFx0XFx0XFx0c2JtbFxcbmFwcGxpY2F0aW9uL3NjdnAtY3YtcmVxdWVzdFxcdFxcdFxcdHNjcVxcbmFwcGxpY2F0aW9uL3NjdnAtY3YtcmVzcG9uc2VcXHRcXHRcXHRzY3NcXG5hcHBsaWNhdGlvbi9zY3ZwLXZwLXJlcXVlc3RcXHRcXHRcXHRzcHFcXG5hcHBsaWNhdGlvbi9zY3ZwLXZwLXJlc3BvbnNlXFx0XFx0XFx0c3BwXFxuYXBwbGljYXRpb24vc2RwXFx0XFx0XFx0XFx0XFx0c2RwXFxuYXBwbGljYXRpb24vc2V0LXBheW1lbnQtaW5pdGlhdGlvblxcdFxcdHNldHBheVxcbmFwcGxpY2F0aW9uL3NldC1yZWdpc3RyYXRpb24taW5pdGlhdGlvblxcdFxcdHNldHJlZ1xcbmFwcGxpY2F0aW9uL3NoZit4bWxcXHRcXHRcXHRcXHRzaGZcXG5hcHBsaWNhdGlvbi9zbWlsK3htbFxcdFxcdFxcdFxcdHNtaSBzbWlsXFxuYXBwbGljYXRpb24vc3BhcnFsLXF1ZXJ5XFx0XFx0XFx0cnFcXG5hcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cyt4bWxcXHRcXHRcXHRzcnhcXG5hcHBsaWNhdGlvbi9zcmdzXFx0XFx0XFx0XFx0Z3JhbVxcbmFwcGxpY2F0aW9uL3NyZ3MreG1sXFx0XFx0XFx0XFx0Z3J4bWxcXG5hcHBsaWNhdGlvbi9zcnUreG1sXFx0XFx0XFx0XFx0c3J1XFxuYXBwbGljYXRpb24vc3NkbCt4bWxcXHRcXHRcXHRcXHRzc2RsXFxuYXBwbGljYXRpb24vc3NtbCt4bWxcXHRcXHRcXHRcXHRzc21sXFxuYXBwbGljYXRpb24vdGVpK3htbFxcdFxcdFxcdFxcdHRlaSB0ZWljb3JwdXNcXG5hcHBsaWNhdGlvbi90aHJhdWQreG1sXFx0XFx0XFx0XFx0dGZpXFxuYXBwbGljYXRpb24vdGltZXN0YW1wZWQtZGF0YVxcdFxcdFxcdHRzZFxcbmFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy1sYXJnZVxcdFxcdHBsYlxcbmFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy1zbWFsbFxcdFxcdHBzYlxcbmFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy12YXJcXHRcXHRcXHRwdmJcXG5hcHBsaWNhdGlvbi92bmQuM2dwcDIudGNhcFxcdFxcdFxcdHRjYXBcXG5hcHBsaWNhdGlvbi92bmQuM20ucG9zdC1pdC1ub3Rlc1xcdFxcdHB3blxcbmFwcGxpY2F0aW9uL3ZuZC5hY2NwYWMuc2ltcGx5LmFzb1xcdFxcdGFzb1xcbmFwcGxpY2F0aW9uL3ZuZC5hY2NwYWMuc2ltcGx5LmltcFxcdFxcdGltcFxcbmFwcGxpY2F0aW9uL3ZuZC5hY3Vjb2JvbFxcdFxcdFxcdGFjdVxcbmFwcGxpY2F0aW9uL3ZuZC5hY3Vjb3JwXFx0XFx0XFx0XFx0YXRjIGFjdXRjXFxuYXBwbGljYXRpb24vdm5kLmFkb2JlLmFpci1hcHBsaWNhdGlvbi1pbnN0YWxsZXItcGFja2FnZSt6aXBcXHRhaXJcXG5hcHBsaWNhdGlvbi92bmQuYWRvYmUuZm9ybXNjZW50cmFsLmZjZHRcXHRcXHRmY2R0XFxuYXBwbGljYXRpb24vdm5kLmFkb2JlLmZ4cFxcdFxcdFxcdGZ4cCBmeHBsXFxuYXBwbGljYXRpb24vdm5kLmFkb2JlLnhkcCt4bWxcXHRcXHRcXHR4ZHBcXG5hcHBsaWNhdGlvbi92bmQuYWRvYmUueGZkZlxcdFxcdFxcdHhmZGZcXG5hcHBsaWNhdGlvbi92bmQuYWhlYWQuc3BhY2VcXHRcXHRcXHRhaGVhZFxcbmFwcGxpY2F0aW9uL3ZuZC5haXJ6aXAuZmlsZXNlY3VyZS5hemZcXHRcXHRhemZcXG5hcHBsaWNhdGlvbi92bmQuYWlyemlwLmZpbGVzZWN1cmUuYXpzXFx0XFx0YXpzXFxuYXBwbGljYXRpb24vdm5kLmFtYXpvbi5lYm9va1xcdFxcdFxcdGF6d1xcbmFwcGxpY2F0aW9uL3ZuZC5hbWVyaWNhbmR5bmFtaWNzLmFjY1xcdFxcdGFjY1xcbmFwcGxpY2F0aW9uL3ZuZC5hbWlnYS5hbWlcXHRcXHRcXHRhbWlcXG5hcHBsaWNhdGlvbi92bmQuYW5kcm9pZC5wYWNrYWdlLWFyY2hpdmVcXHRcXHRhcGtcXG5hcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWNlcnRpZmljYXRlLWlzc3VlLWluaXRpYXRpb25cXHRjaWlcXG5hcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWZ1bmRzLXRyYW5zZmVyLWluaXRpYXRpb25cXHRmdGlcXG5hcHBsaWNhdGlvbi92bmQuYW50aXguZ2FtZS1jb21wb25lbnRcXHRcXHRhdHhcXG5hcHBsaWNhdGlvbi92bmQuYXBwbGUuaW5zdGFsbGVyK3htbFxcdFxcdG1wa2dcXG5hcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybFxcdFxcdFxcdG0zdThcXG5hcHBsaWNhdGlvbi92bmQuYXJpc3RhbmV0d29ya3Muc3dpXFx0XFx0c3dpXFxuYXBwbGljYXRpb24vdm5kLmFzdHJhZWEtc29mdHdhcmUuaW90YVxcdFxcdGlvdGFcXG5hcHBsaWNhdGlvbi92bmQuYXVkaW9ncmFwaFxcdFxcdFxcdGFlcFxcbmFwcGxpY2F0aW9uL3ZuZC5ibHVlaWNlLm11bHRpcGFzc1xcdFxcdG1wbVxcbmFwcGxpY2F0aW9uL3ZuZC5ibWlcXHRcXHRcXHRcXHRibWlcXG5hcHBsaWNhdGlvbi92bmQuYnVzaW5lc3NvYmplY3RzXFx0XFx0XFx0cmVwXFxuYXBwbGljYXRpb24vdm5kLmNoZW1kcmF3K3htbFxcdFxcdFxcdGNkeG1sXFxuYXBwbGljYXRpb24vdm5kLmNoaXBudXRzLmthcmFva2UtbW1kXFx0XFx0bW1kXFxuYXBwbGljYXRpb24vdm5kLmNpbmRlcmVsbGFcXHRcXHRcXHRjZHlcXG5hcHBsaWNhdGlvbi92bmQuY2xheW1vcmVcXHRcXHRcXHRjbGFcXG5hcHBsaWNhdGlvbi92bmQuY2xvYW50by5ycDlcXHRcXHRcXHRycDlcXG5hcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFxcdFxcdFxcdGM0ZyBjNGQgYzRmIGM0cCBjNHVcXG5hcHBsaWNhdGlvbi92bmQuY2x1ZXRydXN0LmNhcnRvbW9iaWxlLWNvbmZpZ1xcdFxcdGMxMWFtY1xcbmFwcGxpY2F0aW9uL3ZuZC5jbHVldHJ1c3QuY2FydG9tb2JpbGUtY29uZmlnLXBrZ1xcdGMxMWFtelxcbmFwcGxpY2F0aW9uL3ZuZC5jb21tb25zcGFjZVxcdFxcdFxcdGNzcFxcbmFwcGxpY2F0aW9uL3ZuZC5jb250YWN0LmNtc2dcXHRcXHRcXHRjZGJjbXNnXFxuYXBwbGljYXRpb24vdm5kLmNvc21vY2FsbGVyXFx0XFx0XFx0Y21jXFxuYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXJcXHRcXHRcXHRjbGt4XFxuYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIua2V5Ym9hcmRcXHRcXHRjbGtrXFxuYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIucGFsZXR0ZVxcdFxcdGNsa3BcXG5hcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci50ZW1wbGF0ZVxcdFxcdGNsa3RcXG5hcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci53b3JkYmFua1xcdFxcdGNsa3dcXG5hcHBsaWNhdGlvbi92bmQuY3JpdGljYWx0b29scy53YnMreG1sXFx0XFx0d2JzXFxuYXBwbGljYXRpb24vdm5kLmN0Yy1wb3NtbFxcdFxcdFxcdHBtbFxcbmFwcGxpY2F0aW9uL3ZuZC5jdXBzLXBwZFxcdFxcdFxcdHBwZFxcbmFwcGxpY2F0aW9uL3ZuZC5jdXJsLmNhclxcdFxcdFxcdGNhclxcbmFwcGxpY2F0aW9uL3ZuZC5jdXJsLnBjdXJsXFx0XFx0XFx0cGN1cmxcXG5hcHBsaWNhdGlvbi92bmQuZGFydFxcdFxcdFxcdFxcdGRhcnRcXG5hcHBsaWNhdGlvbi92bmQuZGF0YS12aXNpb24ucmR6XFx0XFx0XFx0cmR6XFxuYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVxcdFxcdFxcdHV2ZiB1dnZmIHV2ZCB1dnZkXFxuYXBwbGljYXRpb24vdm5kLmRlY2UudHRtbCt4bWxcXHRcXHRcXHR1dnQgdXZ2dFxcbmFwcGxpY2F0aW9uL3ZuZC5kZWNlLnVuc3BlY2lmaWVkXFx0XFx0dXZ4IHV2dnhcXG5hcHBsaWNhdGlvbi92bmQuZGVjZS56aXBcXHRcXHRcXHR1dnogdXZ2elxcbmFwcGxpY2F0aW9uL3ZuZC5kZW5vdm8uZmNzZWxheW91dC1saW5rXFx0XFx0ZmVfbGF1bmNoXFxuYXBwbGljYXRpb24vdm5kLmRuYVxcdFxcdFxcdFxcdGRuYVxcbmFwcGxpY2F0aW9uL3ZuZC5kb2xieS5tbHBcXHRcXHRcXHRtbHBcXG5hcHBsaWNhdGlvbi92bmQuZHBncmFwaFxcdFxcdFxcdFxcdGRwZ1xcbmFwcGxpY2F0aW9uL3ZuZC5kcmVhbWZhY3RvcnlcXHRcXHRcXHRkZmFjXFxuYXBwbGljYXRpb24vdm5kLmRzLWtleXBvaW50XFx0XFx0XFx0a3B4eFxcbmFwcGxpY2F0aW9uL3ZuZC5kdmIuYWl0XFx0XFx0XFx0XFx0YWl0XFxuYXBwbGljYXRpb24vdm5kLmR2Yi5zZXJ2aWNlXFx0XFx0XFx0c3ZjXFxuYXBwbGljYXRpb24vdm5kLmR5bmFnZW9cXHRcXHRcXHRcXHRnZW9cXG5hcHBsaWNhdGlvbi92bmQuZWNvd2luLmNoYXJ0XFx0XFx0XFx0bWFnXFxuYXBwbGljYXRpb24vdm5kLmVubGl2ZW5cXHRcXHRcXHRcXHRubWxcXG5hcHBsaWNhdGlvbi92bmQuZXBzb24uZXNmXFx0XFx0XFx0ZXNmXFxuYXBwbGljYXRpb24vdm5kLmVwc29uLm1zZlxcdFxcdFxcdG1zZlxcbmFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5xdWlja2FuaW1lXFx0XFx0cWFtXFxuYXBwbGljYXRpb24vdm5kLmVwc29uLnNhbHRcXHRcXHRcXHRzbHRcXG5hcHBsaWNhdGlvbi92bmQuZXBzb24uc3NmXFx0XFx0XFx0c3NmXFxuYXBwbGljYXRpb24vdm5kLmVzemlnbm8zK3htbFxcdFxcdFxcdGVzMyBldDNcXG5hcHBsaWNhdGlvbi92bmQuZXpwaXgtYWxidW1cXHRcXHRcXHRlejJcXG5hcHBsaWNhdGlvbi92bmQuZXpwaXgtcGFja2FnZVxcdFxcdFxcdGV6M1xcbmFwcGxpY2F0aW9uL3ZuZC5mZGZcXHRcXHRcXHRcXHRmZGZcXG5hcHBsaWNhdGlvbi92bmQuZmRzbi5tc2VlZFxcdFxcdFxcdG1zZWVkXFxuYXBwbGljYXRpb24vdm5kLmZkc24uc2VlZFxcdFxcdFxcdHNlZWQgZGF0YWxlc3NcXG5hcHBsaWNhdGlvbi92bmQuZmxvZ3JhcGhpdFxcdFxcdFxcdGdwaFxcbmFwcGxpY2F0aW9uL3ZuZC5mbHV4dGltZS5jbGlwXFx0XFx0XFx0ZnRjXFxuYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcXHRcXHRcXHRmbSBmcmFtZSBtYWtlciBib29rXFxuYXBwbGljYXRpb24vdm5kLmZyb2dhbnMuZm5jXFx0XFx0XFx0Zm5jXFxuYXBwbGljYXRpb24vdm5kLmZyb2dhbnMubHRmXFx0XFx0XFx0bHRmXFxuYXBwbGljYXRpb24vdm5kLmZzYy53ZWJsYXVuY2hcXHRcXHRcXHRmc2NcXG5hcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c1xcdFxcdFxcdG9hc1xcbmFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzMlxcdFxcdFxcdG9hMlxcbmFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzM1xcdFxcdFxcdG9hM1xcbmFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzZ3BcXHRcXHRcXHRmZzVcXG5hcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c3Byc1xcdFxcdGJoMlxcbmFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZGRkXFx0XFx0XFx0ZGRkXFxuYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kb2N1d29ya3NcXHRcXHR4ZHdcXG5hcHBsaWNhdGlvbi92bmQuZnVqaXhlcm94LmRvY3V3b3Jrcy5iaW5kZXJcXHR4YmRcXG5hcHBsaWNhdGlvbi92bmQuZnV6enlzaGVldFxcdFxcdFxcdGZ6c1xcbmFwcGxpY2F0aW9uL3ZuZC5nZW5vbWF0aXgudHV4ZWRvXFx0XFx0dHhkXFxuYXBwbGljYXRpb24vdm5kLmdlb2dlYnJhLmZpbGVcXHRcXHRcXHRnZ2JcXG5hcHBsaWNhdGlvbi92bmQuZ2VvZ2VicmEudG9vbFxcdFxcdFxcdGdndFxcbmFwcGxpY2F0aW9uL3ZuZC5nZW9tZXRyeS1leHBsb3JlclxcdFxcdGdleCBncmVcXG5hcHBsaWNhdGlvbi92bmQuZ2VvbmV4dFxcdFxcdFxcdFxcdGd4dFxcbmFwcGxpY2F0aW9uL3ZuZC5nZW9wbGFuXFx0XFx0XFx0XFx0ZzJ3XFxuYXBwbGljYXRpb24vdm5kLmdlb3NwYWNlXFx0XFx0XFx0ZzN3XFxuYXBwbGljYXRpb24vdm5kLmdteFxcdFxcdFxcdFxcdGdteFxcbmFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua21sK3htbFxcdFxcdGttbFxcbmFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua216XFx0XFx0a216XFxuYXBwbGljYXRpb24vdm5kLmdyYWZlcVxcdFxcdFxcdFxcdGdxZiBncXNcXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWFjY291bnRcXHRcXHRcXHRnYWNcXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWhlbHBcXHRcXHRcXHRnaGZcXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWlkZW50aXR5LW1lc3NhZ2VcXHRcXHRnaW1cXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWluamVjdG9yXFx0XFx0XFx0Z3J2XFxuYXBwbGljYXRpb24vdm5kLmdyb292ZS10b29sLW1lc3NhZ2VcXHRcXHRndG1cXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXRvb2wtdGVtcGxhdGVcXHRcXHR0cGxcXG5hcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXZjYXJkXFx0XFx0XFx0dmNnXFxuYXBwbGljYXRpb24vdm5kLmhhbCt4bWxcXHRcXHRcXHRcXHRoYWxcXG5hcHBsaWNhdGlvbi92bmQuaGFuZGhlbGQtZW50ZXJ0YWlubWVudCt4bWxcXHR6bW1cXG5hcHBsaWNhdGlvbi92bmQuaGJjaVxcdFxcdFxcdFxcdGhiY2lcXG5hcHBsaWNhdGlvbi92bmQuaGhlLmxlc3Nvbi1wbGF5ZXJcXHRcXHRsZXNcXG5hcHBsaWNhdGlvbi92bmQuaHAtaHBnbFxcdFxcdFxcdFxcdGhwZ2xcXG5hcHBsaWNhdGlvbi92bmQuaHAtaHBpZFxcdFxcdFxcdFxcdGhwaWRcXG5hcHBsaWNhdGlvbi92bmQuaHAtaHBzXFx0XFx0XFx0XFx0aHBzXFxuYXBwbGljYXRpb24vdm5kLmhwLWpseXRcXHRcXHRcXHRcXHRqbHRcXG5hcHBsaWNhdGlvbi92bmQuaHAtcGNsXFx0XFx0XFx0XFx0cGNsXFxuYXBwbGljYXRpb24vdm5kLmhwLXBjbHhsXFx0XFx0XFx0cGNseGxcXG5hcHBsaWNhdGlvbi92bmQuaHlkcm9zdGF0aXguc29mLWRhdGFcXHRcXHRzZmQtaGRzdHhcXG5hcHBsaWNhdGlvbi92bmQuaWJtLm1pbmlwYXlcXHRcXHRcXHRtcHlcXG5hcHBsaWNhdGlvbi92bmQuaWJtLm1vZGNhcFxcdFxcdFxcdGFmcCBsaXN0YWZwIGxpc3QzODIwXFxuYXBwbGljYXRpb24vdm5kLmlibS5yaWdodHMtbWFuYWdlbWVudFxcdFxcdGlybVxcbmFwcGxpY2F0aW9uL3ZuZC5pYm0uc2VjdXJlLWNvbnRhaW5lclxcdFxcdHNjXFxuYXBwbGljYXRpb24vdm5kLmljY3Byb2ZpbGVcXHRcXHRcXHRpY2MgaWNtXFxuYXBwbGljYXRpb24vdm5kLmlnbG9hZGVyXFx0XFx0XFx0aWdsXFxuYXBwbGljYXRpb24vdm5kLmltbWVydmlzaW9uLWl2cFxcdFxcdFxcdGl2cFxcbmFwcGxpY2F0aW9uL3ZuZC5pbW1lcnZpc2lvbi1pdnVcXHRcXHRcXHRpdnVcXG5hcHBsaWNhdGlvbi92bmQuaW5zb3JzLmlnbVxcdFxcdFxcdGlnbVxcbmFwcGxpY2F0aW9uL3ZuZC5pbnRlcmNvbi5mb3JtbmV0XFx0XFx0eHB3IHhweFxcbmFwcGxpY2F0aW9uL3ZuZC5pbnRlcmdlb1xcdFxcdFxcdGkyZ1xcbmFwcGxpY2F0aW9uL3ZuZC5pbnR1LnFib1xcdFxcdFxcdHFib1xcbmFwcGxpY2F0aW9uL3ZuZC5pbnR1LnFmeFxcdFxcdFxcdHFmeFxcbmFwcGxpY2F0aW9uL3ZuZC5pcHVucGx1Z2dlZC5yY3Byb2ZpbGVcXHRcXHRyY3Byb2ZpbGVcXG5hcHBsaWNhdGlvbi92bmQuaXJlcG9zaXRvcnkucGFja2FnZSt4bWxcXHRcXHRpcnBcXG5hcHBsaWNhdGlvbi92bmQuaXMteHByXFx0XFx0XFx0XFx0eHByXFxuYXBwbGljYXRpb24vdm5kLmlzYWMuZmNzXFx0XFx0XFx0ZmNzXFxuYXBwbGljYXRpb24vdm5kLmphbVxcdFxcdFxcdFxcdGphbVxcbmFwcGxpY2F0aW9uL3ZuZC5qY3AuamF2YW1lLm1pZGxldC1ybXNcXHRcXHRybXNcXG5hcHBsaWNhdGlvbi92bmQuamlzcFxcdFxcdFxcdFxcdGppc3BcXG5hcHBsaWNhdGlvbi92bmQuam9vc3Quam9kYS1hcmNoaXZlXFx0XFx0am9kYVxcbmFwcGxpY2F0aW9uL3ZuZC5rYWhvb3R6XFx0XFx0XFx0XFx0a3R6IGt0clxcbmFwcGxpY2F0aW9uL3ZuZC5rZGUua2FyYm9uXFx0XFx0XFx0a2FyYm9uXFxuYXBwbGljYXRpb24vdm5kLmtkZS5rY2hhcnRcXHRcXHRcXHRjaHJ0XFxuYXBwbGljYXRpb24vdm5kLmtkZS5rZm9ybXVsYVxcdFxcdFxcdGtmb1xcbmFwcGxpY2F0aW9uL3ZuZC5rZGUua2l2aW9cXHRcXHRcXHRmbHdcXG5hcHBsaWNhdGlvbi92bmQua2RlLmtvbnRvdXJcXHRcXHRcXHRrb25cXG5hcHBsaWNhdGlvbi92bmQua2RlLmtwcmVzZW50ZXJcXHRcXHRcXHRrcHIga3B0XFxuYXBwbGljYXRpb24vdm5kLmtkZS5rc3ByZWFkXFx0XFx0XFx0a3NwXFxuYXBwbGljYXRpb24vdm5kLmtkZS5rd29yZFxcdFxcdFxcdGt3ZCBrd3RcXG5hcHBsaWNhdGlvbi92bmQua2VuYW1lYWFwcFxcdFxcdFxcdGh0a2VcXG5hcHBsaWNhdGlvbi92bmQua2lkc3BpcmF0aW9uXFx0XFx0XFx0a2lhXFxuYXBwbGljYXRpb24vdm5kLmtpbmFyXFx0XFx0XFx0XFx0a25lIGtucFxcbmFwcGxpY2F0aW9uL3ZuZC5rb2FuXFx0XFx0XFx0XFx0c2twIHNrZCBza3Qgc2ttXFxuYXBwbGljYXRpb24vdm5kLmtvZGFrLWRlc2NyaXB0b3JcXHRcXHRzc2VcXG5hcHBsaWNhdGlvbi92bmQubGFzLmxhcyt4bWxcXHRcXHRcXHRsYXN4bWxcXG5hcHBsaWNhdGlvbi92bmQubGxhbWFncmFwaGljcy5saWZlLWJhbGFuY2UuZGVza3RvcFxcdGxiZFxcbmFwcGxpY2F0aW9uL3ZuZC5sbGFtYWdyYXBoaWNzLmxpZmUtYmFsYW5jZS5leGNoYW5nZSt4bWxcXHRsYmVcXG5hcHBsaWNhdGlvbi92bmQubG90dXMtMS0yLTNcXHRcXHRcXHQxMjNcXG5hcHBsaWNhdGlvbi92bmQubG90dXMtYXBwcm9hY2hcXHRcXHRcXHRhcHJcXG5hcHBsaWNhdGlvbi92bmQubG90dXMtZnJlZWxhbmNlXFx0XFx0XFx0cHJlXFxuYXBwbGljYXRpb24vdm5kLmxvdHVzLW5vdGVzXFx0XFx0XFx0bnNmXFxuYXBwbGljYXRpb24vdm5kLmxvdHVzLW9yZ2FuaXplclxcdFxcdFxcdG9yZ1xcbmFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1zY3JlZW5jYW1cXHRcXHRcXHRzY21cXG5hcHBsaWNhdGlvbi92bmQubG90dXMtd29yZHByb1xcdFxcdFxcdGx3cFxcbmFwcGxpY2F0aW9uL3ZuZC5tYWNwb3J0cy5wb3J0cGtnXFx0XFx0cG9ydHBrZ1xcbmFwcGxpY2F0aW9uL3ZuZC5tY2RcXHRcXHRcXHRcXHRtY2RcXG5hcHBsaWNhdGlvbi92bmQubWVkY2FsY2RhdGFcXHRcXHRcXHRtYzFcXG5hcHBsaWNhdGlvbi92bmQubWVkaWFzdGF0aW9uLmNka2V5XFx0XFx0Y2RrZXlcXG5hcHBsaWNhdGlvbi92bmQubWZlclxcdFxcdFxcdFxcdG13ZlxcbmFwcGxpY2F0aW9uL3ZuZC5tZm1wXFx0XFx0XFx0XFx0bWZtXFxuYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguZmxvXFx0XFx0XFx0ZmxvXFxuYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguaWd4XFx0XFx0XFx0aWd4XFxuYXBwbGljYXRpb24vdm5kLm1pZlxcdFxcdFxcdFxcdG1pZlxcbmFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMuZGFmXFx0XFx0XFx0ZGFmXFxuYXBwbGljYXRpb24vdm5kLm1vYml1cy5kaXNcXHRcXHRcXHRkaXNcXG5hcHBsaWNhdGlvbi92bmQubW9iaXVzLm1ia1xcdFxcdFxcdG1ia1xcbmFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubXF5XFx0XFx0XFx0bXF5XFxuYXBwbGljYXRpb24vdm5kLm1vYml1cy5tc2xcXHRcXHRcXHRtc2xcXG5hcHBsaWNhdGlvbi92bmQubW9iaXVzLnBsY1xcdFxcdFxcdHBsY1xcbmFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMudHhmXFx0XFx0XFx0dHhmXFxuYXBwbGljYXRpb24vdm5kLm1vcGh1bi5hcHBsaWNhdGlvblxcdFxcdG1wblxcbmFwcGxpY2F0aW9uL3ZuZC5tb3BodW4uY2VydGlmaWNhdGVcXHRcXHRtcGNcXG5hcHBsaWNhdGlvbi92bmQubW96aWxsYS54dWwreG1sXFx0XFx0XFx0eHVsXFxuYXBwbGljYXRpb24vdm5kLm1zLWFydGdhbHJ5XFx0XFx0XFx0Y2lsXFxuYXBwbGljYXRpb24vdm5kLm1zLWNhYi1jb21wcmVzc2VkXFx0XFx0Y2FiXFxuYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXFx0XFx0XFx0eGxzIHhsbSB4bGEgeGxjIHhsdCB4bHdcXG5hcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuYWRkaW4ubWFjcm9lbmFibGVkLjEyXFx0XFx0eGxhbVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5iaW5hcnkubWFjcm9lbmFibGVkLjEyXFx0eGxzYlxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5tYWNyb2VuYWJsZWQuMTJcXHRcXHR4bHNtXFxuYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlxcdHhsdG1cXG5hcHBsaWNhdGlvbi92bmQubXMtZm9udG9iamVjdFxcdFxcdFxcdGVvdFxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1odG1saGVscFxcdFxcdFxcdGNobVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1pbXNcXHRcXHRcXHRcXHRpbXNcXG5hcHBsaWNhdGlvbi92bmQubXMtbHJtXFx0XFx0XFx0XFx0bHJtXFxuYXBwbGljYXRpb24vdm5kLm1zLW9mZmljZXRoZW1lXFx0XFx0XFx0dGhteFxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1wa2kuc2VjY2F0XFx0XFx0XFx0Y2F0XFxuYXBwbGljYXRpb24vdm5kLm1zLXBraS5zdGxcXHRcXHRcXHRzdGxcXG5hcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludFxcdFxcdFxcdHBwdCBwcHMgcG90XFxuYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuYWRkaW4ubWFjcm9lbmFibGVkLjEyXFx0XFx0cHBhbVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnByZXNlbnRhdGlvbi5tYWNyb2VuYWJsZWQuMTJcXHRwcHRtXFxuYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuc2xpZGUubWFjcm9lbmFibGVkLjEyXFx0XFx0c2xkbVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnNsaWRlc2hvdy5tYWNyb2VuYWJsZWQuMTJcXHRcXHRwcHNtXFxuYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyXFx0XFx0cG90bVxcbmFwcGxpY2F0aW9uL3ZuZC5tcy1wcm9qZWN0XFx0XFx0XFx0bXBwIG1wdFxcbmFwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLmRvY3VtZW50Lm1hY3JvZW5hYmxlZC4xMlxcdGRvY21cXG5hcHBsaWNhdGlvbi92bmQubXMtd29yZC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcXHRkb3RtXFxuYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXFx0XFx0XFx0d3BzIHdrcyB3Y20gd2RiXFxuYXBwbGljYXRpb24vdm5kLm1zLXdwbFxcdFxcdFxcdFxcdHdwbFxcbmFwcGxpY2F0aW9uL3ZuZC5tcy14cHNkb2N1bWVudFxcdFxcdFxcdHhwc1xcbmFwcGxpY2F0aW9uL3ZuZC5tc2VxXFx0XFx0XFx0XFx0bXNlcVxcbmFwcGxpY2F0aW9uL3ZuZC5tdXNpY2lhblxcdFxcdFxcdG11c1xcbmFwcGxpY2F0aW9uL3ZuZC5tdXZlZS5zdHlsZVxcdFxcdFxcdG1zdHlcXG5hcHBsaWNhdGlvbi92bmQubXluZmNcXHRcXHRcXHRcXHR0YWdsZXRcXG5hcHBsaWNhdGlvbi92bmQubmV1cm9sYW5ndWFnZS5ubHVcXHRcXHRubHVcXG5hcHBsaWNhdGlvbi92bmQubml0ZlxcdFxcdFxcdFxcdG50ZiBuaXRmXFxuYXBwbGljYXRpb24vdm5kLm5vYmxlbmV0LWRpcmVjdG9yeVxcdFxcdG5uZFxcbmFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC1zZWFsZXJcXHRcXHRcXHRubnNcXG5hcHBsaWNhdGlvbi92bmQubm9ibGVuZXQtd2ViXFx0XFx0XFx0bm53XFxuYXBwbGljYXRpb24vdm5kLm5va2lhLm4tZ2FnZS5kYXRhXFx0XFx0bmdkYXRcXG5hcHBsaWNhdGlvbi92bmQubm9raWEubi1nYWdlLnN5bWJpYW4uaW5zdGFsbFxcdG4tZ2FnZVxcbmFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5yYWRpby1wcmVzZXRcXHRcXHRycHN0XFxuYXBwbGljYXRpb24vdm5kLm5va2lhLnJhZGlvLXByZXNldHNcXHRcXHRycHNzXFxuYXBwbGljYXRpb24vdm5kLm5vdmFkaWdtLmVkbVxcdFxcdFxcdGVkbVxcbmFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5lZHhcXHRcXHRcXHRlZHhcXG5hcHBsaWNhdGlvbi92bmQubm92YWRpZ20uZXh0XFx0XFx0XFx0ZXh0XFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5jaGFydFxcdFxcdG9kY1xcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuY2hhcnQtdGVtcGxhdGVcXHRvdGNcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmRhdGFiYXNlXFx0XFx0b2RiXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5mb3JtdWxhXFx0XFx0b2RmXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5mb3JtdWxhLXRlbXBsYXRlXFx0b2RmdFxcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3NcXHRcXHRvZGdcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmdyYXBoaWNzLXRlbXBsYXRlXFx0b3RnXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5pbWFnZVxcdFxcdG9kaVxcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuaW1hZ2UtdGVtcGxhdGVcXHRvdGlcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvblxcdFxcdG9kcFxcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uLXRlbXBsYXRlXFx0b3RwXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldFxcdFxcdG9kc1xcbmFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXQtdGVtcGxhdGVcXHRvdHNcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHRcXHRcXHRcXHRvZHRcXG5hcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtbWFzdGVyXFx0XFx0b2RtXFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXRlbXBsYXRlXFx0b3R0XFxuYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXdlYlxcdFxcdG90aFxcbmFwcGxpY2F0aW9uL3ZuZC5vbHBjLXN1Z2FyXFx0XFx0XFx0eG9cXG5hcHBsaWNhdGlvbi92bmQub21hLmRkMit4bWxcXHRcXHRcXHRkZDJcXG5hcHBsaWNhdGlvbi92bmQub3Blbm9mZmljZW9yZy5leHRlbnNpb25cXHRcXHRveHRcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwucHJlc2VudGF0aW9uXFx0cHB0eFxcbmFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5zbGlkZVxcdHNsZHhcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwuc2xpZGVzaG93XFx0cHBzeFxcbmFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC50ZW1wbGF0ZVxcdHBvdHhcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldFxcdHhsc3hcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC50ZW1wbGF0ZVxcdHhsdHhcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudFxcdGRvY3hcXG5hcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC50ZW1wbGF0ZVxcdGRvdHhcXG5hcHBsaWNhdGlvbi92bmQub3NnZW8ubWFwZ3VpZGUucGFja2FnZVxcdFxcdG1ncFxcbmFwcGxpY2F0aW9uL3ZuZC5vc2dpLmRwXFx0XFx0XFx0XFx0ZHBcXG5hcHBsaWNhdGlvbi92bmQub3NnaS5zdWJzeXN0ZW1cXHRcXHRcXHRlc2FcXG5hcHBsaWNhdGlvbi92bmQucGFsbVxcdFxcdFxcdFxcdHBkYiBwcWEgb3ByY1xcbmFwcGxpY2F0aW9uL3ZuZC5wYXdhYWZpbGVcXHRcXHRcXHRwYXdcXG5hcHBsaWNhdGlvbi92bmQucGcuZm9ybWF0XFx0XFx0XFx0c3RyXFxuYXBwbGljYXRpb24vdm5kLnBnLm9zYXNsaVxcdFxcdFxcdGVpNlxcbmFwcGxpY2F0aW9uL3ZuZC5waWNzZWxcXHRcXHRcXHRcXHRlZmlmXFxuYXBwbGljYXRpb24vdm5kLnBtaS53aWRnZXRcXHRcXHRcXHR3Z1xcbmFwcGxpY2F0aW9uL3ZuZC5wb2NrZXRsZWFyblxcdFxcdFxcdHBsZlxcbmFwcGxpY2F0aW9uL3ZuZC5wb3dlcmJ1aWxkZXI2XFx0XFx0XFx0cGJkXFxuYXBwbGljYXRpb24vdm5kLnByZXZpZXdzeXN0ZW1zLmJveFxcdFxcdGJveFxcbmFwcGxpY2F0aW9uL3ZuZC5wcm90ZXVzLm1hZ2F6aW5lXFx0XFx0bWd6XFxuYXBwbGljYXRpb24vdm5kLnB1Ymxpc2hhcmUtZGVsdGEtdHJlZVxcdFxcdHFwc1xcbmFwcGxpY2F0aW9uL3ZuZC5wdmkucHRpZDFcXHRcXHRcXHRwdGlkXFxuYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXFx0XFx0cXhkIHF4dCBxd2QgcXd0IHF4bCBxeGJcXG5hcHBsaWNhdGlvbi92bmQucmVhbHZuYy5iZWRcXHRcXHRcXHRiZWRcXG5hcHBsaWNhdGlvbi92bmQucmVjb3JkYXJlLm11c2ljeG1sXFx0XFx0bXhsXFxuYXBwbGljYXRpb24vdm5kLnJlY29yZGFyZS5tdXNpY3htbCt4bWxcXHRcXHRtdXNpY3htbFxcbmFwcGxpY2F0aW9uL3ZuZC5yaWcuY3J5cHRvbm90ZVxcdFxcdFxcdGNyeXB0b25vdGVcXG5hcHBsaWNhdGlvbi92bmQucmltLmNvZFxcdFxcdFxcdFxcdGNvZFxcbmFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWFcXHRcXHRcXHRybVxcbmFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWEtdmJyXFx0XFx0cm12YlxcbmFwcGxpY2F0aW9uL3ZuZC5yb3V0ZTY2Lmxpbms2Nit4bWxcXHRcXHRsaW5rNjZcXG5hcHBsaWNhdGlvbi92bmQuc2FpbGluZ3RyYWNrZXIudHJhY2tcXHRcXHRzdFxcbmFwcGxpY2F0aW9uL3ZuZC5zZWVtYWlsXFx0XFx0XFx0XFx0c2VlXFxuYXBwbGljYXRpb24vdm5kLnNlbWFcXHRcXHRcXHRcXHRzZW1hXFxuYXBwbGljYXRpb24vdm5kLnNlbWRcXHRcXHRcXHRcXHRzZW1kXFxuYXBwbGljYXRpb24vdm5kLnNlbWZcXHRcXHRcXHRcXHRzZW1mXFxuYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmZvcm1kYXRhXFx0XFx0aWZtXFxuYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmZvcm10ZW1wbGF0ZVxcdGl0cFxcbmFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5pbnRlcmNoYW5nZVxcdGlpZlxcbmFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5wYWNrYWdlXFx0XFx0aXBrXFxuYXBwbGljYXRpb24vdm5kLnNpbXRlY2gtbWluZG1hcHBlclxcdFxcdHR3ZCB0d2RzXFxuYXBwbGljYXRpb24vdm5kLnNtYWZcXHRcXHRcXHRcXHRtbWZcXG5hcHBsaWNhdGlvbi92bmQuc21hcnQudGVhY2hlclxcdFxcdFxcdHRlYWNoZXJcXG5hcHBsaWNhdGlvbi92bmQuc29sZW50LnNka20reG1sXFx0XFx0XFx0c2RrbSBzZGtkXFxuYXBwbGljYXRpb24vdm5kLnNwb3RmaXJlLmR4cFxcdFxcdFxcdGR4cFxcbmFwcGxpY2F0aW9uL3ZuZC5zcG90ZmlyZS5zZnNcXHRcXHRcXHRzZnNcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmNhbGNcXHRcXHRzZGNcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmRyYXdcXHRcXHRzZGFcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmltcHJlc3NcXHRcXHRzZGRcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLm1hdGhcXHRcXHRzbWZcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlclxcdFxcdHNkdyB2b3JcXG5hcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlci1nbG9iYWxcXHRzZ2xcXG5hcHBsaWNhdGlvbi92bmQuc3RlcG1hbmlhLnBhY2thZ2VcXHRcXHRzbXppcFxcbmFwcGxpY2F0aW9uL3ZuZC5zdGVwbWFuaWEuc3RlcGNoYXJ0XFx0XFx0c21cXG5hcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5jYWxjXFx0XFx0XFx0c3hjXFxuYXBwbGljYXRpb24vdm5kLnN1bi54bWwuY2FsYy50ZW1wbGF0ZVxcdFxcdHN0Y1xcbmFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmRyYXdcXHRcXHRcXHRzeGRcXG5hcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5kcmF3LnRlbXBsYXRlXFx0XFx0c3RkXFxuYXBwbGljYXRpb24vdm5kLnN1bi54bWwuaW1wcmVzc1xcdFxcdFxcdHN4aVxcbmFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmltcHJlc3MudGVtcGxhdGVcXHRzdGlcXG5hcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5tYXRoXFx0XFx0XFx0c3htXFxuYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyXFx0XFx0XFx0c3h3XFxuYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyLmdsb2JhbFxcdFxcdHN4Z1xcbmFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLndyaXRlci50ZW1wbGF0ZVxcdFxcdHN0d1xcbmFwcGxpY2F0aW9uL3ZuZC5zdXMtY2FsZW5kYXJcXHRcXHRcXHRzdXMgc3VzcFxcbmFwcGxpY2F0aW9uL3ZuZC5zdmRcXHRcXHRcXHRcXHRzdmRcXG5hcHBsaWNhdGlvbi92bmQuc3ltYmlhbi5pbnN0YWxsXFx0XFx0XFx0c2lzIHNpc3hcXG5hcHBsaWNhdGlvbi92bmQuc3luY21sK3htbFxcdFxcdFxcdHhzbVxcbmFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwuZG0rd2J4bWxcXHRcXHRcXHRiZG1cXG5hcHBsaWNhdGlvbi92bmQuc3luY21sLmRtK3htbFxcdFxcdFxcdHhkbVxcbmFwcGxpY2F0aW9uL3ZuZC50YW8uaW50ZW50LW1vZHVsZS1hcmNoaXZlXFx0dGFvXFxuYXBwbGljYXRpb24vdm5kLnRjcGR1bXAucGNhcFxcdFxcdFxcdHBjYXAgY2FwIGRtcFxcbmFwcGxpY2F0aW9uL3ZuZC50bW9iaWxlLWxpdmV0dlxcdFxcdFxcdHRtb1xcbmFwcGxpY2F0aW9uL3ZuZC50cmlkLnRwdFxcdFxcdFxcdHRwdFxcbmFwcGxpY2F0aW9uL3ZuZC50cmlzY2FwZS5teHNcXHRcXHRcXHRteHNcXG5hcHBsaWNhdGlvbi92bmQudHJ1ZWFwcFxcdFxcdFxcdFxcdHRyYVxcbmFwcGxpY2F0aW9uL3ZuZC51ZmRsXFx0XFx0XFx0XFx0dWZkIHVmZGxcXG5hcHBsaWNhdGlvbi92bmQudWlxLnRoZW1lXFx0XFx0XFx0dXR6XFxuYXBwbGljYXRpb24vdm5kLnVtYWppblxcdFxcdFxcdFxcdHVtalxcbmFwcGxpY2F0aW9uL3ZuZC51bml0eVxcdFxcdFxcdFxcdHVuaXR5d2ViXFxuYXBwbGljYXRpb24vdm5kLnVvbWwreG1sXFx0XFx0XFx0dW9tbFxcbmFwcGxpY2F0aW9uL3ZuZC52Y3hcXHRcXHRcXHRcXHR2Y3hcXG5hcHBsaWNhdGlvbi92bmQudmlzaW9cXHRcXHRcXHRcXHR2c2QgdnN0IHZzcyB2c3dcXG5hcHBsaWNhdGlvbi92bmQudmlzaW9uYXJ5XFx0XFx0XFx0dmlzXFxuYXBwbGljYXRpb24vdm5kLnZzZlxcdFxcdFxcdFxcdHZzZlxcbmFwcGxpY2F0aW9uL3ZuZC53YXAud2J4bWxcXHRcXHRcXHR3YnhtbFxcbmFwcGxpY2F0aW9uL3ZuZC53YXAud21sY1xcdFxcdFxcdHdtbGNcXG5hcHBsaWNhdGlvbi92bmQud2FwLndtbHNjcmlwdGNcXHRcXHRcXHR3bWxzY1xcbmFwcGxpY2F0aW9uL3ZuZC53ZWJ0dXJib1xcdFxcdFxcdHd0YlxcbmFwcGxpY2F0aW9uL3ZuZC53b2xmcmFtLnBsYXllclxcdFxcdFxcdG5icFxcbmFwcGxpY2F0aW9uL3ZuZC53b3JkcGVyZmVjdFxcdFxcdFxcdHdwZFxcbmFwcGxpY2F0aW9uL3ZuZC53cWRcXHRcXHRcXHRcXHR3cWRcXG5hcHBsaWNhdGlvbi92bmQud3Quc3RmXFx0XFx0XFx0XFx0c3RmXFxuYXBwbGljYXRpb24vdm5kLnhhcmFcXHRcXHRcXHRcXHR4YXJcXG5hcHBsaWNhdGlvbi92bmQueGZkbFxcdFxcdFxcdFxcdHhmZGxcXG5hcHBsaWNhdGlvbi92bmQueWFtYWhhLmh2LWRpY1xcdFxcdFxcdGh2ZFxcbmFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtc2NyaXB0XFx0XFx0aHZzXFxuYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi12b2ljZVxcdFxcdFxcdGh2cFxcbmFwcGxpY2F0aW9uL3ZuZC55YW1haGEub3BlbnNjb3JlZm9ybWF0XFx0XFx0XFx0b3NmXFxuYXBwbGljYXRpb24vdm5kLnlhbWFoYS5vcGVuc2NvcmVmb3JtYXQub3NmcHZnK3htbFxcdG9zZnB2Z1xcbmFwcGxpY2F0aW9uL3ZuZC55YW1haGEuc21hZi1hdWRpb1xcdFxcdHNhZlxcbmFwcGxpY2F0aW9uL3ZuZC55YW1haGEuc21hZi1waHJhc2VcXHRcXHRzcGZcXG5hcHBsaWNhdGlvbi92bmQueWVsbG93cml2ZXItY3VzdG9tLW1lbnVcXHRcXHRjbXBcXG5hcHBsaWNhdGlvbi92bmQuenVsXFx0XFx0XFx0XFx0emlyIHppcnpcXG5hcHBsaWNhdGlvbi92bmQuenphenouZGVjayt4bWxcXHRcXHRcXHR6YXpcXG5hcHBsaWNhdGlvbi92b2ljZXhtbCt4bWxcXHRcXHRcXHR2eG1sXFxuYXBwbGljYXRpb24vd2FzbVxcdFxcdFxcdFxcdHdhc21cXG5hcHBsaWNhdGlvbi93aWRnZXRcXHRcXHRcXHRcXHR3Z3RcXG5hcHBsaWNhdGlvbi93aW5obHBcXHRcXHRcXHRcXHRobHBcXG5hcHBsaWNhdGlvbi93c2RsK3htbFxcdFxcdFxcdFxcdHdzZGxcXG5hcHBsaWNhdGlvbi93c3BvbGljeSt4bWxcXHRcXHRcXHR3c3BvbGljeVxcbmFwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZFxcdFxcdFxcdDd6XFxuYXBwbGljYXRpb24veC1hYml3b3JkXFx0XFx0XFx0XFx0YWJ3XFxuYXBwbGljYXRpb24veC1hY2UtY29tcHJlc3NlZFxcdFxcdFxcdGFjZVxcbmFwcGxpY2F0aW9uL3gtYXBwbGUtZGlza2ltYWdlXFx0XFx0XFx0ZG1nXFxuYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblxcdFxcdFxcdGFhYiB4MzIgdTMyIHZveFxcbmFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1tYXBcXHRcXHRcXHRhYW1cXG5hcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtc2VnXFx0XFx0XFx0YWFzXFxuYXBwbGljYXRpb24veC1iY3Bpb1xcdFxcdFxcdFxcdGJjcGlvXFxuYXBwbGljYXRpb24veC1iaXR0b3JyZW50XFx0XFx0XFx0dG9ycmVudFxcbmFwcGxpY2F0aW9uL3gtYmxvcmJcXHRcXHRcXHRcXHRibGIgYmxvcmJcXG5hcHBsaWNhdGlvbi94LWJ6aXBcXHRcXHRcXHRcXHRielxcbmFwcGxpY2F0aW9uL3gtYnppcDJcXHRcXHRcXHRcXHRiejIgYm96XFxuYXBwbGljYXRpb24veC1jYnJcXHRcXHRcXHRcXHRjYnIgY2JhIGNidCBjYnogY2I3XFxuYXBwbGljYXRpb24veC1jZGxpbmtcXHRcXHRcXHRcXHR2Y2RcXG5hcHBsaWNhdGlvbi94LWNmcy1jb21wcmVzc2VkXFx0XFx0XFx0Y2ZzXFxuYXBwbGljYXRpb24veC1jaGF0XFx0XFx0XFx0XFx0Y2hhdFxcbmFwcGxpY2F0aW9uL3gtY2hlc3MtcGduXFx0XFx0XFx0XFx0cGduXFxuYXBwbGljYXRpb24veC1jb25mZXJlbmNlXFx0XFx0XFx0bnNjXFxuYXBwbGljYXRpb24veC1jcGlvXFx0XFx0XFx0XFx0Y3Bpb1xcbmFwcGxpY2F0aW9uL3gtY3NoXFx0XFx0XFx0XFx0Y3NoXFxuYXBwbGljYXRpb24veC1kZWJpYW4tcGFja2FnZVxcdFxcdFxcdGRlYiB1ZGViXFxuYXBwbGljYXRpb24veC1kZ2MtY29tcHJlc3NlZFxcdFxcdFxcdGRnY1xcbmFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcXHRcXHRcXHRkaXIgZGNyIGR4ciBjc3QgY2N0IGN4dCB3M2QgZmdkIHN3YVxcbmFwcGxpY2F0aW9uL3gtZG9vbVxcdFxcdFxcdFxcdHdhZFxcbmFwcGxpY2F0aW9uL3gtZHRibmN4K3htbFxcdFxcdFxcdG5jeFxcbmFwcGxpY2F0aW9uL3gtZHRib29rK3htbFxcdFxcdFxcdGR0YlxcbmFwcGxpY2F0aW9uL3gtZHRicmVzb3VyY2UreG1sXFx0XFx0XFx0cmVzXFxuYXBwbGljYXRpb24veC1kdmlcXHRcXHRcXHRcXHRkdmlcXG5hcHBsaWNhdGlvbi94LWVudm95XFx0XFx0XFx0XFx0ZXZ5XFxuYXBwbGljYXRpb24veC1ldmFcXHRcXHRcXHRcXHRldmFcXG5hcHBsaWNhdGlvbi94LWZvbnQtYmRmXFx0XFx0XFx0XFx0YmRmXFxuYXBwbGljYXRpb24veC1mb250LWdob3N0c2NyaXB0XFx0XFx0XFx0Z3NmXFxuYXBwbGljYXRpb24veC1mb250LWxpbnV4LXBzZlxcdFxcdFxcdHBzZlxcbmFwcGxpY2F0aW9uL3gtZm9udC1wY2ZcXHRcXHRcXHRcXHRwY2ZcXG5hcHBsaWNhdGlvbi94LWZvbnQtc25mXFx0XFx0XFx0XFx0c25mXFxuYXBwbGljYXRpb24veC1mb250LXR5cGUxXFx0XFx0XFx0cGZhIHBmYiBwZm0gYWZtXFxuYXBwbGljYXRpb24veC1mcmVlYXJjXFx0XFx0XFx0XFx0YXJjXFxuYXBwbGljYXRpb24veC1mdXR1cmVzcGxhc2hcXHRcXHRcXHRzcGxcXG5hcHBsaWNhdGlvbi94LWdjYS1jb21wcmVzc2VkXFx0XFx0XFx0Z2NhXFxuYXBwbGljYXRpb24veC1nbHVseFxcdFxcdFxcdFxcdHVseFxcbmFwcGxpY2F0aW9uL3gtZ251bWVyaWNcXHRcXHRcXHRcXHRnbnVtZXJpY1xcbmFwcGxpY2F0aW9uL3gtZ3JhbXBzLXhtbFxcdFxcdFxcdGdyYW1wc1xcbmFwcGxpY2F0aW9uL3gtZ3RhclxcdFxcdFxcdFxcdGd0YXJcXG5hcHBsaWNhdGlvbi94LWhkZlxcdFxcdFxcdFxcdGhkZlxcbmFwcGxpY2F0aW9uL3gtaW5zdGFsbC1pbnN0cnVjdGlvbnNcXHRcXHRpbnN0YWxsXFxuYXBwbGljYXRpb24veC1pc285NjYwLWltYWdlXFx0XFx0XFx0aXNvXFxuYXBwbGljYXRpb24veC1qYXZhLWpubHAtZmlsZVxcdFxcdFxcdGpubHBcXG5hcHBsaWNhdGlvbi94LWxhdGV4XFx0XFx0XFx0XFx0bGF0ZXhcXG5hcHBsaWNhdGlvbi94LWx6aC1jb21wcmVzc2VkXFx0XFx0XFx0bHpoIGxoYVxcbmFwcGxpY2F0aW9uL3gtbWllXFx0XFx0XFx0XFx0bWllXFxuYXBwbGljYXRpb24veC1tb2JpcG9ja2V0LWVib29rXFx0XFx0XFx0cHJjIG1vYmlcXG5hcHBsaWNhdGlvbi94LW1zLWFwcGxpY2F0aW9uXFx0XFx0XFx0YXBwbGljYXRpb25cXG5hcHBsaWNhdGlvbi94LW1zLXNob3J0Y3V0XFx0XFx0XFx0bG5rXFxuYXBwbGljYXRpb24veC1tcy13bWRcXHRcXHRcXHRcXHR3bWRcXG5hcHBsaWNhdGlvbi94LW1zLXdtelxcdFxcdFxcdFxcdHdtelxcbmFwcGxpY2F0aW9uL3gtbXMteGJhcFxcdFxcdFxcdFxcdHhiYXBcXG5hcHBsaWNhdGlvbi94LW1zYWNjZXNzXFx0XFx0XFx0XFx0bWRiXFxuYXBwbGljYXRpb24veC1tc2JpbmRlclxcdFxcdFxcdFxcdG9iZFxcbmFwcGxpY2F0aW9uL3gtbXNjYXJkZmlsZVxcdFxcdFxcdGNyZFxcbmFwcGxpY2F0aW9uL3gtbXNjbGlwXFx0XFx0XFx0XFx0Y2xwXFxuYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXFx0XFx0XFx0ZXhlIGRsbCBjb20gYmF0IG1zaVxcbmFwcGxpY2F0aW9uL3gtbXNtZWRpYXZpZXdcXHRcXHRcXHRtdmIgbTEzIG0xNFxcbmFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVxcdFxcdFxcdHdtZiB3bXogZW1mIGVtelxcbmFwcGxpY2F0aW9uL3gtbXNtb25leVxcdFxcdFxcdFxcdG1ueVxcbmFwcGxpY2F0aW9uL3gtbXNwdWJsaXNoZXJcXHRcXHRcXHRwdWJcXG5hcHBsaWNhdGlvbi94LW1zc2NoZWR1bGVcXHRcXHRcXHRzY2RcXG5hcHBsaWNhdGlvbi94LW1zdGVybWluYWxcXHRcXHRcXHR0cm1cXG5hcHBsaWNhdGlvbi94LW1zd3JpdGVcXHRcXHRcXHRcXHR3cmlcXG5hcHBsaWNhdGlvbi94LW5ldGNkZlxcdFxcdFxcdFxcdG5jIGNkZlxcbmFwcGxpY2F0aW9uL3gtbnpiXFx0XFx0XFx0XFx0bnpiXFxuYXBwbGljYXRpb24veC1wa2NzMTJcXHRcXHRcXHRcXHRwMTIgcGZ4XFxuYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0aWZpY2F0ZXNcXHRcXHRwN2Igc3BjXFxuYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0cmVxcmVzcFxcdFxcdFxcdHA3clxcbmFwcGxpY2F0aW9uL3gtcmFyLWNvbXByZXNzZWRcXHRcXHRcXHRyYXJcXG5hcHBsaWNhdGlvbi94LXJlc2VhcmNoLWluZm8tc3lzdGVtc1xcdFxcdHJpc1xcbmFwcGxpY2F0aW9uL3gtc2hcXHRcXHRcXHRcXHRzaFxcbmFwcGxpY2F0aW9uL3gtc2hhclxcdFxcdFxcdFxcdHNoYXJcXG5hcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFxcdFxcdFxcdHN3ZlxcbmFwcGxpY2F0aW9uL3gtc2lsdmVybGlnaHQtYXBwXFx0XFx0XFx0eGFwXFxuYXBwbGljYXRpb24veC1zcWxcXHRcXHRcXHRcXHRzcWxcXG5hcHBsaWNhdGlvbi94LXN0dWZmaXRcXHRcXHRcXHRcXHRzaXRcXG5hcHBsaWNhdGlvbi94LXN0dWZmaXR4XFx0XFx0XFx0XFx0c2l0eFxcbmFwcGxpY2F0aW9uL3gtc3VicmlwXFx0XFx0XFx0XFx0c3J0XFxuYXBwbGljYXRpb24veC1zdjRjcGlvXFx0XFx0XFx0XFx0c3Y0Y3Bpb1xcbmFwcGxpY2F0aW9uL3gtc3Y0Y3JjXFx0XFx0XFx0XFx0c3Y0Y3JjXFxuYXBwbGljYXRpb24veC10M3ZtLWltYWdlXFx0XFx0XFx0dDNcXG5hcHBsaWNhdGlvbi94LXRhZHNcXHRcXHRcXHRcXHRnYW1cXG5hcHBsaWNhdGlvbi94LXRhclxcdFxcdFxcdFxcdHRhclxcbmFwcGxpY2F0aW9uL3gtdGNsXFx0XFx0XFx0XFx0dGNsXFxuYXBwbGljYXRpb24veC10ZXhcXHRcXHRcXHRcXHR0ZXhcXG5hcHBsaWNhdGlvbi94LXRleC10Zm1cXHRcXHRcXHRcXHR0Zm1cXG5hcHBsaWNhdGlvbi94LXRleGluZm9cXHRcXHRcXHRcXHR0ZXhpbmZvIHRleGlcXG5hcHBsaWNhdGlvbi94LXRnaWZcXHRcXHRcXHRcXHRvYmpcXG5hcHBsaWNhdGlvbi94LXVzdGFyXFx0XFx0XFx0XFx0dXN0YXJcXG5hcHBsaWNhdGlvbi94LXdhaXMtc291cmNlXFx0XFx0XFx0c3JjXFxuYXBwbGljYXRpb24veC14NTA5LWNhLWNlcnRcXHRcXHRcXHRkZXIgY3J0XFxuYXBwbGljYXRpb24veC14ZmlnXFx0XFx0XFx0XFx0ZmlnXFxuYXBwbGljYXRpb24veC14bGlmZit4bWxcXHRcXHRcXHRcXHR4bGZcXG5hcHBsaWNhdGlvbi94LXhwaW5zdGFsbFxcdFxcdFxcdFxcdHhwaVxcbmFwcGxpY2F0aW9uL3gteHpcXHRcXHRcXHRcXHR4elxcbmFwcGxpY2F0aW9uL3gtem1hY2hpbmVcXHRcXHRcXHRcXHR6MSB6MiB6MyB6NCB6NSB6NiB6NyB6OFxcbmFwcGxpY2F0aW9uL3hhbWwreG1sXFx0XFx0XFx0XFx0eGFtbFxcbmFwcGxpY2F0aW9uL3hjYXAtZGlmZit4bWxcXHRcXHRcXHR4ZGZcXG5hcHBsaWNhdGlvbi94ZW5jK3htbFxcdFxcdFxcdFxcdHhlbmNcXG5hcHBsaWNhdGlvbi94aHRtbCt4bWxcXHRcXHRcXHRcXHR4aHRtbCB4aHRcXG5hcHBsaWNhdGlvbi94bWxcXHRcXHRcXHRcXHRcXHR4bWwgeHNsXFxuYXBwbGljYXRpb24veG1sLWR0ZFxcdFxcdFxcdFxcdGR0ZFxcbmFwcGxpY2F0aW9uL3hvcCt4bWxcXHRcXHRcXHRcXHR4b3BcXG5hcHBsaWNhdGlvbi94cHJvYyt4bWxcXHRcXHRcXHRcXHR4cGxcXG5hcHBsaWNhdGlvbi94c2x0K3htbFxcdFxcdFxcdFxcdHhzbHRcXG5hcHBsaWNhdGlvbi94c3BmK3htbFxcdFxcdFxcdFxcdHhzcGZcXG5hcHBsaWNhdGlvbi94dit4bWxcXHRcXHRcXHRcXHRteG1sIHhodm1sIHh2bWwgeHZtXFxuYXBwbGljYXRpb24veWFuZ1xcdFxcdFxcdFxcdHlhbmdcXG5hcHBsaWNhdGlvbi95aW4reG1sXFx0XFx0XFx0XFx0eWluXFxuYXBwbGljYXRpb24vemlwXFx0XFx0XFx0XFx0XFx0emlwXFxuYXVkaW8vYWRwY21cXHRcXHRcXHRcXHRcXHRhZHBcXG5hdWRpby9iYXNpY1xcdFxcdFxcdFxcdFxcdGF1IHNuZFxcbmF1ZGlvL21pZGlcXHRcXHRcXHRcXHRcXHRtaWQgbWlkaSBrYXIgcm1pXFxuYXVkaW8vbXA0XFx0XFx0XFx0XFx0XFx0bTRhIG1wNGFcXG5hdWRpby9tcGVnXFx0XFx0XFx0XFx0XFx0bXBnYSBtcDIgbXAyYSBtcDMgbTJhIG0zYVxcbmF1ZGlvL29nZ1xcdFxcdFxcdFxcdFxcdG9nYSBvZ2cgc3B4XFxuYXVkaW8vczNtXFx0XFx0XFx0XFx0XFx0czNtXFxuYXVkaW8vc2lsa1xcdFxcdFxcdFxcdFxcdHNpbFxcbmF1ZGlvL3ZuZC5kZWNlLmF1ZGlvXFx0XFx0XFx0XFx0dXZhIHV2dmFcXG5hdWRpby92bmQuZGlnaXRhbC13aW5kc1xcdFxcdFxcdFxcdGVvbFxcbmF1ZGlvL3ZuZC5kcmFcXHRcXHRcXHRcXHRcXHRkcmFcXG5hdWRpby92bmQuZHRzXFx0XFx0XFx0XFx0XFx0ZHRzXFxuYXVkaW8vdm5kLmR0cy5oZFxcdFxcdFxcdFxcdGR0c2hkXFxuYXVkaW8vdm5kLmx1Y2VudC52b2ljZVxcdFxcdFxcdFxcdGx2cFxcbmF1ZGlvL3ZuZC5tcy1wbGF5cmVhZHkubWVkaWEucHlhXFx0XFx0cHlhXFxuYXVkaW8vdm5kLm51ZXJhLmVjZWxwNDgwMFxcdFxcdFxcdGVjZWxwNDgwMFxcbmF1ZGlvL3ZuZC5udWVyYS5lY2VscDc0NzBcXHRcXHRcXHRlY2VscDc0NzBcXG5hdWRpby92bmQubnVlcmEuZWNlbHA5NjAwXFx0XFx0XFx0ZWNlbHA5NjAwXFxuYXVkaW8vdm5kLnJpcFxcdFxcdFxcdFxcdFxcdHJpcFxcbmF1ZGlvL3dlYm1cXHRcXHRcXHRcXHRcXHR3ZWJhXFxuYXVkaW8veC1hYWNcXHRcXHRcXHRcXHRcXHRhYWNcXG5hdWRpby94LWFpZmZcXHRcXHRcXHRcXHRcXHRhaWYgYWlmZiBhaWZjXFxuYXVkaW8veC1jYWZcXHRcXHRcXHRcXHRcXHRjYWZcXG5hdWRpby94LWZsYWNcXHRcXHRcXHRcXHRcXHRmbGFjXFxuYXVkaW8veC1tYXRyb3NrYVxcdFxcdFxcdFxcdG1rYVxcbmF1ZGlvL3gtbXBlZ3VybFxcdFxcdFxcdFxcdFxcdG0zdVxcbmF1ZGlvL3gtbXMtd2F4XFx0XFx0XFx0XFx0XFx0d2F4XFxuYXVkaW8veC1tcy13bWFcXHRcXHRcXHRcXHRcXHR3bWFcXG5hdWRpby94LXBuLXJlYWxhdWRpb1xcdFxcdFxcdFxcdHJhbSByYVxcbmF1ZGlvL3gtcG4tcmVhbGF1ZGlvLXBsdWdpblxcdFxcdFxcdHJtcFxcbmF1ZGlvL3gtd2F2XFx0XFx0XFx0XFx0XFx0d2F2XFxuYXVkaW8veG1cXHRcXHRcXHRcXHRcXHR4bVxcbmNoZW1pY2FsL3gtY2R4XFx0XFx0XFx0XFx0XFx0Y2R4XFxuY2hlbWljYWwveC1jaWZcXHRcXHRcXHRcXHRcXHRjaWZcXG5jaGVtaWNhbC94LWNtZGZcXHRcXHRcXHRcXHRcXHRjbWRmXFxuY2hlbWljYWwveC1jbWxcXHRcXHRcXHRcXHRcXHRjbWxcXG5jaGVtaWNhbC94LWNzbWxcXHRcXHRcXHRcXHRcXHRjc21sXFxuY2hlbWljYWwveC14eXpcXHRcXHRcXHRcXHRcXHR4eXpcXG5mb250L2NvbGxlY3Rpb25cXHRcXHRcXHRcXHRcXHR0dGNcXG5mb250L290ZlxcdFxcdFxcdFxcdFxcdG90ZlxcbmZvbnQvdHRmXFx0XFx0XFx0XFx0XFx0dHRmXFxuZm9udC93b2ZmXFx0XFx0XFx0XFx0XFx0d29mZlxcbmZvbnQvd29mZjJcXHRcXHRcXHRcXHRcXHR3b2ZmMlxcbmltYWdlL2JtcFxcdFxcdFxcdFxcdFxcdGJtcFxcbmltYWdlL2NnbVxcdFxcdFxcdFxcdFxcdGNnbVxcbmltYWdlL2czZmF4XFx0XFx0XFx0XFx0XFx0ZzNcXG5pbWFnZS9naWZcXHRcXHRcXHRcXHRcXHRnaWZcXG5pbWFnZS9pZWZcXHRcXHRcXHRcXHRcXHRpZWZcXG5pbWFnZS9qcGVnXFx0XFx0XFx0XFx0XFx0anBlZyBqcGcganBlXFxuaW1hZ2Uva3R4XFx0XFx0XFx0XFx0XFx0a3R4XFxuaW1hZ2UvcG5nXFx0XFx0XFx0XFx0XFx0cG5nXFxuaW1hZ2UvcHJzLmJ0aWZcXHRcXHRcXHRcXHRcXHRidGlmXFxuaW1hZ2Uvc2dpXFx0XFx0XFx0XFx0XFx0c2dpXFxuaW1hZ2Uvc3ZnK3htbFxcdFxcdFxcdFxcdFxcdHN2ZyBzdmd6XFxuaW1hZ2UvdGlmZlxcdFxcdFxcdFxcdFxcdHRpZmYgdGlmXFxuaW1hZ2Uvdm5kLmFkb2JlLnBob3Rvc2hvcFxcdFxcdFxcdHBzZFxcbmltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcXHRcXHRcXHRcXHR1dmkgdXZ2aSB1dmcgdXZ2Z1xcbmltYWdlL3ZuZC5kanZ1XFx0XFx0XFx0XFx0XFx0ZGp2dSBkanZcXG5pbWFnZS92bmQuZHZiLnN1YnRpdGxlXFx0XFx0XFx0XFx0c3ViXFxuaW1hZ2Uvdm5kLmR3Z1xcdFxcdFxcdFxcdFxcdGR3Z1xcbmltYWdlL3ZuZC5keGZcXHRcXHRcXHRcXHRcXHRkeGZcXG5pbWFnZS92bmQuZmFzdGJpZHNoZWV0XFx0XFx0XFx0XFx0ZmJzXFxuaW1hZ2Uvdm5kLmZweFxcdFxcdFxcdFxcdFxcdGZweFxcbmltYWdlL3ZuZC5mc3RcXHRcXHRcXHRcXHRcXHRmc3RcXG5pbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1tbXJcXHRcXHRcXHRtbXJcXG5pbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1ybGNcXHRcXHRcXHRybGNcXG5pbWFnZS92bmQubXMtbW9kaVxcdFxcdFxcdFxcdG1kaVxcbmltYWdlL3ZuZC5tcy1waG90b1xcdFxcdFxcdFxcdHdkcFxcbmltYWdlL3ZuZC5uZXQtZnB4XFx0XFx0XFx0XFx0bnB4XFxuaW1hZ2Uvdm5kLndhcC53Ym1wXFx0XFx0XFx0XFx0d2JtcFxcbmltYWdlL3ZuZC54aWZmXFx0XFx0XFx0XFx0XFx0eGlmXFxuaW1hZ2Uvd2VicFxcdFxcdFxcdFxcdFxcdHdlYnBcXG5pbWFnZS94LTNkc1xcdFxcdFxcdFxcdFxcdDNkc1xcbmltYWdlL3gtY211LXJhc3RlclxcdFxcdFxcdFxcdHJhc1xcbmltYWdlL3gtY214XFx0XFx0XFx0XFx0XFx0Y214XFxuaW1hZ2UveC1mcmVlaGFuZFxcdFxcdFxcdFxcdGZoIGZoYyBmaDQgZmg1IGZoN1xcbmltYWdlL3gtaWNvblxcdFxcdFxcdFxcdFxcdGljb1xcbmltYWdlL3gtbXJzaWQtaW1hZ2VcXHRcXHRcXHRcXHRzaWRcXG5pbWFnZS94LXBjeFxcdFxcdFxcdFxcdFxcdHBjeFxcbmltYWdlL3gtcGljdFxcdFxcdFxcdFxcdFxcdHBpYyBwY3RcXG5pbWFnZS94LXBvcnRhYmxlLWFueW1hcFxcdFxcdFxcdFxcdHBubVxcbmltYWdlL3gtcG9ydGFibGUtYml0bWFwXFx0XFx0XFx0XFx0cGJtXFxuaW1hZ2UveC1wb3J0YWJsZS1ncmF5bWFwXFx0XFx0XFx0cGdtXFxuaW1hZ2UveC1wb3J0YWJsZS1waXhtYXBcXHRcXHRcXHRcXHRwcG1cXG5pbWFnZS94LXJnYlxcdFxcdFxcdFxcdFxcdHJnYlxcbmltYWdlL3gtdGdhXFx0XFx0XFx0XFx0XFx0dGdhXFxuaW1hZ2UveC14Yml0bWFwXFx0XFx0XFx0XFx0XFx0eGJtXFxuaW1hZ2UveC14cGl4bWFwXFx0XFx0XFx0XFx0XFx0eHBtXFxuaW1hZ2UveC14d2luZG93ZHVtcFxcdFxcdFxcdFxcdHh3ZFxcbm1lc3NhZ2UvcmZjODIyXFx0XFx0XFx0XFx0XFx0ZW1sIG1pbWVcXG5tb2RlbC9pZ2VzXFx0XFx0XFx0XFx0XFx0aWdzIGlnZXNcXG5tb2RlbC9tZXNoXFx0XFx0XFx0XFx0XFx0bXNoIG1lc2ggc2lsb1xcbm1vZGVsL3ZuZC5jb2xsYWRhK3htbFxcdFxcdFxcdFxcdGRhZVxcbm1vZGVsL3ZuZC5kd2ZcXHRcXHRcXHRcXHRcXHRkd2ZcXG5tb2RlbC92bmQuZ2RsXFx0XFx0XFx0XFx0XFx0Z2RsXFxubW9kZWwvdm5kLmd0d1xcdFxcdFxcdFxcdFxcdGd0d1xcbm1vZGVsL3ZuZC5tdHNcXHRcXHRcXHRcXHRcXHRtdHNcXG5tb2RlbC92bmQudnR1XFx0XFx0XFx0XFx0XFx0dnR1XFxubW9kZWwvdnJtbFxcdFxcdFxcdFxcdFxcdHdybCB2cm1sXFxubW9kZWwveDNkK2JpbmFyeVxcdFxcdFxcdFxcdHgzZGIgeDNkYnpcXG5tb2RlbC94M2QrdnJtbFxcdFxcdFxcdFxcdFxcdHgzZHYgeDNkdnpcXG5tb2RlbC94M2QreG1sXFx0XFx0XFx0XFx0XFx0eDNkIHgzZHpcXG50ZXh0L2NhY2hlLW1hbmlmZXN0XFx0XFx0XFx0XFx0YXBwY2FjaGVcXG50ZXh0L2NhbGVuZGFyXFx0XFx0XFx0XFx0XFx0aWNzIGlmYlxcbnRleHQvY3NzXFx0XFx0XFx0XFx0XFx0Y3NzXFxudGV4dC9jc3ZcXHRcXHRcXHRcXHRcXHRjc3ZcXG50ZXh0L2h0bWxcXHRcXHRcXHRcXHRcXHRodG1sIGh0bVxcbnRleHQvbjNcXHRcXHRcXHRcXHRcXHRcXHRuM1xcbnRleHQvcGxhaW5cXHRcXHRcXHRcXHRcXHR0eHQgdGV4dCBjb25mIGRlZiBsaXN0IGxvZyBpblxcbnRleHQvcHJzLmxpbmVzLnRhZ1xcdFxcdFxcdFxcdGRzY1xcbnRleHQvcmljaHRleHRcXHRcXHRcXHRcXHRcXHRydHhcXG50ZXh0L3NnbWxcXHRcXHRcXHRcXHRcXHRzZ21sIHNnbVxcbnRleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXNcXHRcXHRcXHR0c3ZcXG50ZXh0L3Ryb2ZmXFx0XFx0XFx0XFx0XFx0dCB0ciByb2ZmIG1hbiBtZSBtc1xcbnRleHQvdHVydGxlXFx0XFx0XFx0XFx0XFx0dHRsXFxudGV4dC91cmktbGlzdFxcdFxcdFxcdFxcdFxcdHVyaSB1cmlzIHVybHNcXG50ZXh0L3ZjYXJkXFx0XFx0XFx0XFx0XFx0dmNhcmRcXG50ZXh0L3ZuZC5jdXJsXFx0XFx0XFx0XFx0XFx0Y3VybFxcbnRleHQvdm5kLmN1cmwuZGN1cmxcXHRcXHRcXHRcXHRkY3VybFxcbnRleHQvdm5kLmN1cmwubWN1cmxcXHRcXHRcXHRcXHRtY3VybFxcbnRleHQvdm5kLmN1cmwuc2N1cmxcXHRcXHRcXHRcXHRzY3VybFxcbnRleHQvdm5kLmR2Yi5zdWJ0aXRsZVxcdFxcdFxcdFxcdHN1YlxcbnRleHQvdm5kLmZseVxcdFxcdFxcdFxcdFxcdGZseVxcbnRleHQvdm5kLmZtaS5mbGV4c3RvclxcdFxcdFxcdFxcdGZseFxcbnRleHQvdm5kLmdyYXBodml6XFx0XFx0XFx0XFx0Z3ZcXG50ZXh0L3ZuZC5pbjNkLjNkbWxcXHRcXHRcXHRcXHQzZG1sXFxudGV4dC92bmQuaW4zZC5zcG90XFx0XFx0XFx0XFx0c3BvdFxcbnRleHQvdm5kLnN1bi5qMm1lLmFwcC1kZXNjcmlwdG9yXFx0XFx0amFkXFxudGV4dC92bmQud2FwLndtbFxcdFxcdFxcdFxcdHdtbFxcbnRleHQvdm5kLndhcC53bWxzY3JpcHRcXHRcXHRcXHRcXHR3bWxzXFxudGV4dC94LWFzbVxcdFxcdFxcdFxcdFxcdHMgYXNtXFxudGV4dC94LWNcXHRcXHRcXHRcXHRcXHRjIGNjIGN4eCBjcHAgaCBoaCBkaWNcXG50ZXh0L3gtZm9ydHJhblxcdFxcdFxcdFxcdFxcdGYgZm9yIGY3NyBmOTBcXG50ZXh0L3gtamF2YS1zb3VyY2VcXHRcXHRcXHRcXHRqYXZhXFxudGV4dC94LW5mb1xcdFxcdFxcdFxcdFxcdG5mb1xcbnRleHQveC1vcG1sXFx0XFx0XFx0XFx0XFx0b3BtbFxcbnRleHQveC1wYXNjYWxcXHRcXHRcXHRcXHRcXHRwIHBhc1xcbnRleHQveC1zZXRleHRcXHRcXHRcXHRcXHRcXHRldHhcXG50ZXh0L3gtc2Z2XFx0XFx0XFx0XFx0XFx0c2Z2XFxudGV4dC94LXV1ZW5jb2RlXFx0XFx0XFx0XFx0XFx0dXVcXG50ZXh0L3gtdmNhbGVuZGFyXFx0XFx0XFx0XFx0dmNzXFxudGV4dC94LXZjYXJkXFx0XFx0XFx0XFx0XFx0dmNmXFxudmlkZW8vM2dwcFxcdFxcdFxcdFxcdFxcdDNncFxcbnZpZGVvLzNncHAyXFx0XFx0XFx0XFx0XFx0M2cyXFxudmlkZW8vaDI2MVxcdFxcdFxcdFxcdFxcdGgyNjFcXG52aWRlby9oMjYzXFx0XFx0XFx0XFx0XFx0aDI2M1xcbnZpZGVvL2gyNjRcXHRcXHRcXHRcXHRcXHRoMjY0XFxudmlkZW8vanBlZ1xcdFxcdFxcdFxcdFxcdGpwZ3ZcXG52aWRlby9qcG1cXHRcXHRcXHRcXHRcXHRqcG0ganBnbVxcbnZpZGVvL21qMlxcdFxcdFxcdFxcdFxcdG1qMiBtanAyXFxudmlkZW8vbXA0XFx0XFx0XFx0XFx0XFx0bXA0IG1wNHYgbXBnNFxcbnZpZGVvL21wZWdcXHRcXHRcXHRcXHRcXHRtcGVnIG1wZyBtcGUgbTF2IG0ydlxcbnZpZGVvL29nZ1xcdFxcdFxcdFxcdFxcdG9ndlxcbnZpZGVvL3F1aWNrdGltZVxcdFxcdFxcdFxcdFxcdHF0IG1vdlxcbnZpZGVvL3ZuZC5kZWNlLmhkXFx0XFx0XFx0XFx0dXZoIHV2dmhcXG52aWRlby92bmQuZGVjZS5tb2JpbGVcXHRcXHRcXHRcXHR1dm0gdXZ2bVxcbnZpZGVvL3ZuZC5kZWNlLnBkXFx0XFx0XFx0XFx0dXZwIHV2dnBcXG52aWRlby92bmQuZGVjZS5zZFxcdFxcdFxcdFxcdHV2cyB1dnZzXFxudmlkZW8vdm5kLmRlY2UudmlkZW9cXHRcXHRcXHRcXHR1dnYgdXZ2dlxcbnZpZGVvL3ZuZC5kdmIuZmlsZVxcdFxcdFxcdFxcdGR2YlxcbnZpZGVvL3ZuZC5mdnRcXHRcXHRcXHRcXHRcXHRmdnRcXG52aWRlby92bmQubXBlZ3VybFxcdFxcdFxcdFxcdG14dSBtNHVcXG52aWRlby92bmQubXMtcGxheXJlYWR5Lm1lZGlhLnB5dlxcdFxcdHB5dlxcbnZpZGVvL3ZuZC51dnZ1Lm1wNFxcdFxcdFxcdFxcdHV2dSB1dnZ1XFxudmlkZW8vdm5kLnZpdm9cXHRcXHRcXHRcXHRcXHR2aXZcXG52aWRlby93ZWJtXFx0XFx0XFx0XFx0XFx0d2VibVxcbnZpZGVvL3gtZjR2XFx0XFx0XFx0XFx0XFx0ZjR2XFxudmlkZW8veC1mbGlcXHRcXHRcXHRcXHRcXHRmbGlcXG52aWRlby94LWZsdlxcdFxcdFxcdFxcdFxcdGZsdlxcbnZpZGVvL3gtbTR2XFx0XFx0XFx0XFx0XFx0bTR2XFxudmlkZW8veC1tYXRyb3NrYVxcdFxcdFxcdFxcdG1rdiBtazNkIG1rc1xcbnZpZGVvL3gtbW5nXFx0XFx0XFx0XFx0XFx0bW5nXFxudmlkZW8veC1tcy1hc2ZcXHRcXHRcXHRcXHRcXHRhc2YgYXN4XFxudmlkZW8veC1tcy12b2JcXHRcXHRcXHRcXHRcXHR2b2JcXG52aWRlby94LW1zLXdtXFx0XFx0XFx0XFx0XFx0d21cXG52aWRlby94LW1zLXdtdlxcdFxcdFxcdFxcdFxcdHdtdlxcbnZpZGVvL3gtbXMtd214XFx0XFx0XFx0XFx0XFx0d214XFxudmlkZW8veC1tcy13dnhcXHRcXHRcXHRcXHRcXHR3dnhcXG52aWRlby94LW1zdmlkZW9cXHRcXHRcXHRcXHRcXHRhdmlcXG52aWRlby94LXNnaS1tb3ZpZVxcdFxcdFxcdFxcdG1vdmllXFxudmlkZW8veC1zbXZcXHRcXHRcXHRcXHRcXHRzbXZcXG54LWNvbmZlcmVuY2UveC1jb29sdGFsa1xcdFxcdFxcdFxcdGljZVxcblwiO1xyXG5cclxuY29uc3QgbWFwID0gbmV3IE1hcCgpO1xyXG5cclxubWltZV9yYXcuc3BsaXQoJ1xcbicpLmZvckVhY2goKHJvdykgPT4ge1xyXG5cdGNvbnN0IG1hdGNoID0gLyguKz8pXFx0KyguKykvLmV4ZWMocm93KTtcclxuXHRpZiAoIW1hdGNoKSByZXR1cm47XHJcblxyXG5cdGNvbnN0IHR5cGUgPSBtYXRjaFsxXTtcclxuXHRjb25zdCBleHRlbnNpb25zID0gbWF0Y2hbMl0uc3BsaXQoJyAnKTtcclxuXHJcblx0ZXh0ZW5zaW9ucy5mb3JFYWNoKGV4dCA9PiB7XHJcblx0XHRtYXAuc2V0KGV4dCwgdHlwZSk7XHJcblx0fSk7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gbG9va3VwKGZpbGUpIHtcclxuXHRjb25zdCBtYXRjaCA9IC9cXC4oW15cXC5dKykkLy5leGVjKGZpbGUpO1xyXG5cdHJldHVybiBtYXRjaCAmJiBtYXAuZ2V0KG1hdGNoWzFdKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWlkZGxld2FyZShvcHRzXHJcblxyXG5cclxuID0ge30pIHtcclxuXHRjb25zdCB7IHNlc3Npb24sIGlnbm9yZSB9ID0gb3B0cztcclxuXHJcblx0bGV0IGVtaXR0ZWRfYmFzZXBhdGggPSBmYWxzZTtcclxuXHJcblx0cmV0dXJuIGNvbXBvc2VfaGFuZGxlcnMoaWdub3JlLCBbXHJcblx0XHQocmVxLCByZXMsIG5leHQpID0+IHtcclxuXHRcdFx0aWYgKHJlcS5iYXNlVXJsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRsZXQgeyBvcmlnaW5hbFVybCB9ID0gcmVxO1xyXG5cdFx0XHRcdGlmIChyZXEudXJsID09PSAnLycgJiYgb3JpZ2luYWxVcmxbb3JpZ2luYWxVcmwubGVuZ3RoIC0gMV0gIT09ICcvJykge1xyXG5cdFx0XHRcdFx0b3JpZ2luYWxVcmwgKz0gJy8nO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmVxLmJhc2VVcmwgPSBvcmlnaW5hbFVybFxyXG5cdFx0XHRcdFx0PyBvcmlnaW5hbFVybC5zbGljZSgwLCAtcmVxLnVybC5sZW5ndGgpXHJcblx0XHRcdFx0XHQ6ICcnO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoIWVtaXR0ZWRfYmFzZXBhdGggJiYgcHJvY2Vzcy5zZW5kKSB7XHJcblx0XHRcdFx0cHJvY2Vzcy5zZW5kKHtcclxuXHRcdFx0XHRcdF9fc2FwcGVyX186IHRydWUsXHJcblx0XHRcdFx0XHRldmVudDogJ2Jhc2VwYXRoJyxcclxuXHRcdFx0XHRcdGJhc2VwYXRoOiByZXEuYmFzZVVybFxyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRlbWl0dGVkX2Jhc2VwYXRoID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHJlcS5wYXRoID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRyZXEucGF0aCA9IHJlcS51cmwucmVwbGFjZSgvXFw/LiovLCAnJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG5leHQoKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0ZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4oYnVpbGRfZGlyLCAnc2VydmljZS13b3JrZXIuanMnKSkgJiYgc2VydmUoe1xyXG5cdFx0XHRwYXRobmFtZTogJy9zZXJ2aWNlLXdvcmtlci5qcycsXHJcblx0XHRcdGNhY2hlX2NvbnRyb2w6ICduby1jYWNoZSwgbm8tc3RvcmUsIG11c3QtcmV2YWxpZGF0ZSdcclxuXHRcdH0pLFxyXG5cclxuXHRcdGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKGJ1aWxkX2RpciwgJ3NlcnZpY2Utd29ya2VyLmpzLm1hcCcpKSAmJiBzZXJ2ZSh7XHJcblx0XHRcdHBhdGhuYW1lOiAnL3NlcnZpY2Utd29ya2VyLmpzLm1hcCcsXHJcblx0XHRcdGNhY2hlX2NvbnRyb2w6ICduby1jYWNoZSwgbm8tc3RvcmUsIG11c3QtcmV2YWxpZGF0ZSdcclxuXHRcdH0pLFxyXG5cclxuXHRcdHNlcnZlKHtcclxuXHRcdFx0cHJlZml4OiAnL2NsaWVudC8nLFxyXG5cdFx0XHRjYWNoZV9jb250cm9sOiBkZXYgPyAnbm8tY2FjaGUnIDogJ21heC1hZ2U9MzE1MzYwMDAsIGltbXV0YWJsZSdcclxuXHRcdH0pLFxyXG5cclxuXHRcdGdldF9zZXJ2ZXJfcm91dGVfaGFuZGxlcihtYW5pZmVzdC5zZXJ2ZXJfcm91dGVzKSxcclxuXHJcblx0XHRnZXRfcGFnZV9oYW5kbGVyKG1hbmlmZXN0LCBzZXNzaW9uIHx8IG5vb3ApXHJcblx0XS5maWx0ZXIoQm9vbGVhbikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21wb3NlX2hhbmRsZXJzKGlnbm9yZSwgaGFuZGxlcnMpIHtcclxuXHRjb25zdCB0b3RhbCA9IGhhbmRsZXJzLmxlbmd0aDtcclxuXHJcblx0ZnVuY3Rpb24gbnRoX2hhbmRsZXIobiwgcmVxLCByZXMsIG5leHQpIHtcclxuXHRcdGlmIChuID49IHRvdGFsKSB7XHJcblx0XHRcdHJldHVybiBuZXh0KCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aGFuZGxlcnNbbl0ocmVxLCByZXMsICgpID0+IG50aF9oYW5kbGVyKG4rMSwgcmVxLCByZXMsIG5leHQpKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiAhaWdub3JlXHJcblx0XHQ/IChyZXEsIHJlcywgbmV4dCkgPT4gbnRoX2hhbmRsZXIoMCwgcmVxLCByZXMsIG5leHQpXHJcblx0XHQ6IChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG5cdFx0XHRpZiAoc2hvdWxkX2lnbm9yZShyZXEucGF0aCwgaWdub3JlKSkge1xyXG5cdFx0XHRcdG5leHQoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRudGhfaGFuZGxlcigwLCByZXEsIHJlcywgbmV4dCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3VsZF9pZ25vcmUodXJpLCB2YWwpIHtcclxuXHRpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSByZXR1cm4gdmFsLnNvbWUoeCA9PiBzaG91bGRfaWdub3JlKHVyaSwgeCkpO1xyXG5cdGlmICh2YWwgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiB2YWwudGVzdCh1cmkpO1xyXG5cdGlmICh0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdmFsKHVyaSk7XHJcblx0cmV0dXJuIHVyaS5zdGFydHNXaXRoKHZhbC5jaGFyQ29kZUF0KDApID09PSA0NyA/IHZhbCA6IGAvJHt2YWx9YCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlcnZlKHsgcHJlZml4LCBwYXRobmFtZSwgY2FjaGVfY29udHJvbCB9XHJcblxyXG5cclxuXHJcbikge1xyXG5cdGNvbnN0IGZpbHRlciA9IHBhdGhuYW1lXHJcblx0XHQ/IChyZXEpID0+IHJlcS5wYXRoID09PSBwYXRobmFtZVxyXG5cdFx0OiAocmVxKSA9PiByZXEucGF0aC5zdGFydHNXaXRoKHByZWZpeCk7XHJcblxyXG5cdGNvbnN0IGNhY2hlID0gbmV3IE1hcCgpO1xyXG5cclxuXHRjb25zdCByZWFkID0gZGV2XHJcblx0XHQ/IChmaWxlKSA9PiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKGJ1aWxkX2RpciwgZmlsZSkpXHJcblx0XHQ6IChmaWxlKSA9PiAoY2FjaGUuaGFzKGZpbGUpID8gY2FjaGUgOiBjYWNoZS5zZXQoZmlsZSwgZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShidWlsZF9kaXIsIGZpbGUpKSkpLmdldChmaWxlKTtcclxuXHJcblx0cmV0dXJuIChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG5cdFx0aWYgKGZpbHRlcihyZXEpKSB7XHJcblx0XHRcdGNvbnN0IHR5cGUgPSBsb29rdXAocmVxLnBhdGgpO1xyXG5cclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRjb25zdCBmaWxlID0gZGVjb2RlVVJJQ29tcG9uZW50KHJlcS5wYXRoLnNsaWNlKDEpKTtcclxuXHRcdFx0XHRjb25zdCBkYXRhID0gcmVhZChmaWxlKTtcclxuXHJcblx0XHRcdFx0cmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgdHlwZSk7XHJcblx0XHRcdFx0cmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsIGNhY2hlX2NvbnRyb2wpO1xyXG5cdFx0XHRcdHJlcy5lbmQoZGF0YSk7XHJcblx0XHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRcdHJlcy5zdGF0dXNDb2RlID0gNDA0O1xyXG5cdFx0XHRcdHJlcy5lbmQoJ25vdCBmb3VuZCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRuZXh0KCk7XHJcblx0XHR9XHJcblx0fTtcclxufVxyXG5cclxuZnVuY3Rpb24gbm9vcCgpe31cclxuXHJcbmV4cG9ydCB7IG1pZGRsZXdhcmUgfTtcclxuIiwiaW1wb3J0IHBvbGthIGZyb20gJ3BvbGthJztcclxuaW1wb3J0IHNlbmQgZnJvbSAnQHBvbGthL3NlbmQnO1xyXG5pbXBvcnQgc2lydiBmcm9tICdzaXJ2JztcclxuaW1wb3J0ICogYXMgc2FwcGVyIGZyb20gJ0BzYXBwZXIvc2VydmVyJztcclxuaW1wb3J0IHsgc2FuaXRpemVfdXNlciwgYXV0aGVudGljYXRlIH0gZnJvbSAnLi91dGlscy9hdXRoJztcclxuXHJcbmNvbnN0IHsgUE9SVCA9IDMwMDAgfSA9IHByb2Nlc3MuZW52O1xyXG5cclxuY29uc3QgYXBwID0gcG9sa2Eoe1xyXG5cdG9uRXJyb3I6IChlcnIsIHJlcSwgcmVzKSA9PiB7XHJcblx0XHRjb25zdCBlcnJvciA9IGVyci5tZXNzYWdlIHx8IGVycjtcclxuXHRcdGNvbnN0IGNvZGUgPSBlcnIuY29kZSB8fCBlcnIuc3RhdHVzIHx8IDUwMDtcclxuXHRcdHJlcy5oZWFkZXJzU2VudCB8fCBzZW5kKHJlcywgY29kZSwgeyBlcnJvciB9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxuaWYgKHByb2Nlc3MuZW52LlBHSE9TVCkge1xyXG5cdGFwcC51c2UoYXV0aGVudGljYXRlKCkpO1xyXG59XHJcblxyXG5hcHAudXNlKFxyXG5cdHNpcnYoJ3N0YXRpYycsIHtcclxuXHRcdGRldjogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcsXHJcblx0XHRzZXRIZWFkZXJzKHJlcykge1xyXG5cdFx0XHRyZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xyXG5cdFx0XHRyZXMuaGFzSGVhZGVyKCdDYWNoZS1Db250cm9sJykgfHwgcmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsICdtYXgtYWdlPTYwMCcpOyAvLyAxMG1pbiBkZWZhdWx0XHJcblx0XHR9XHJcblx0fSksXHJcblxyXG5cdHNhcHBlci5taWRkbGV3YXJlKHtcclxuXHRcdHNlc3Npb246IHJlcSA9PiAoe1xyXG5cdFx0XHR1c2VyOiBzYW5pdGl6ZV91c2VyKHJlcS51c2VyKVxyXG5cdFx0fSlcclxuXHR9KVxyXG4pO1xyXG5cclxuYXBwLmxpc3RlbihQT1JUKTtcclxuIl0sIm5hbWVzIjpbImZzIiwiZ2V0IiwiZmxlZWNlLmV2YWx1YXRlIiwiZnMucmVhZGRpclN5bmMiLCJmcy5yZWFkRmlsZVN5bmMiLCJjYWNoZSIsImZzLmV4aXN0c1N5bmMiLCJwYXRoLmV4dG5hbWUiLCJQb29sIiwiY29va2llLnBhcnNlIiwiaHR0cGllLnBvc3QiLCJzdHJpbmdpZnkiLCJwYXJzZSIsImh0dHBpZS5nZXQiLCJjb29raWUuc2VyaWFsaXplIiwiZGV2YWx1ZSIsImdsb2JhbCIsIlN5bWJvbCIsImJ1aWx0aW5PdmVycmlkYWJsZVJlcGxhY2VtZW50cyIsImJ1aWx0aW5SZXBsYWNlbWVudHMiLCJkZWJ1cnIiLCJzbHVnaWZ5IiwicGF0aCIsImpzb24iLCJsb29rdXAiLCJTTFVHX1BSRVNFUlZFX1VOSUNPREUiLCJTTFVHX1NFUEFSQVRPUiIsInVybHNhZmVTbHVnUHJvY2Vzc29yIiwiYWxwaGFOdW1SZWdleCIsInVuaWNvZGVSZWdleCIsImlzTm9uQWxwaGFOdW1Vbmljb2RlIiwidW5pY29kZVNhZmVQcm9jZXNzb3IiLCJnZXRfc2VjdGlvbnMiLCJjcmVhdGVSZWFkU3RyZWFtIiwiY29tcG9uZW50XzAiLCJjb21wb25lbnRfMSIsInByZWxvYWRfMSIsImNvbXBvbmVudF8yIiwicHJlbG9hZF8yIiwiY29tcG9uZW50XzMiLCJwcmVsb2FkXzMiLCJjb21wb25lbnRfNCIsInByZWxvYWRfNCIsImNvbXBvbmVudF81IiwicHJlbG9hZF81IiwiY29tcG9uZW50XzYiLCJwcmVsb2FkXzYiLCJjb21wb25lbnRfNyIsInByZWxvYWRfNyIsImNvbXBvbmVudF84IiwicHJlbG9hZF84IiwiY29tcG9uZW50XzkiLCJwcmVsb2FkXzkiLCJjb21wb25lbnRfMTAiLCJwcmVsb2FkXzEwIiwiY29tcG9uZW50XzExIiwicHJlbG9hZF8xMSIsInJvb3QiLCJlcnJvciIsImZpbmQiLCJ3cml0YWJsZSIsIkFwcCIsIm5vb3AiLCJzYXBwZXIubWlkZGxld2FyZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSSxNQUFNLENBQUM7QUFDWCxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUV6QixBQUFPLFNBQVMsWUFBWSxHQUFHO0NBQzlCLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztDQUVuQixPQUFPQSxXQUFFLENBQUMsV0FB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RUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUc7RUFDN0UsTUFBTSxFQUFFLEdBQUcsR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHO0VBQzdFLE1BQU0sRUFBRSxHQUFHLEdBQUcsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHO0VBQ25ELE1BQU0sRUFBRSxHQUFHLEdBQUcsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHO0VBQ25ELE1BQU0sRUFBRSxHQUFHLEdBQUcsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRztFQUN0QyxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJO0VBQzFCLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUk7RUFDMUIsTUFBTSxFQUFFLElBQUk7O0VBRVosUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzVDLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUM1QyxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDMUUsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDM0QsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDM0QsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDM0QsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMxRSxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUc7RUFDN0IsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzVDLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDMUUsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMxRSxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUMzRCxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDNUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzVDLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUM1QyxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDNUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDM0QsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDM0QsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHO0VBQzVDLFFBQVEsRUFBRSxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRztFQUM1QyxRQUFRLEVBQUUsR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDekYsUUFBUSxFQUFFLEdBQUcsR0FBRyxRQUFRLEVBQUUs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RyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzs7Q0FHVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7Q0FDWCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7Q0FDWCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7Q0FDWCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7Q0FDWCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7Q0FDWCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7Q0FDWCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7Q0FDWCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7OztDQUdWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQzs7O0NBR1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDOzs7Q0FHWCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7OztDQUdWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztDQUNaLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztDQUNaLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztDQUNULENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztDQUNULENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztDQUNULENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztDQUNULENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNWLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztDQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQzs7O0NBR1gsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzs7Q0FHVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixDQUFDOztBQ3JVRiwyQkFBYyxHQUFHO0NBQ2hCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztDQUNkLENBQUMs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
