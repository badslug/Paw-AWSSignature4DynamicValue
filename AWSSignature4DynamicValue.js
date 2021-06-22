// AWS Signature Version 4 signing
// https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html

function getLocation(href) {
    var match = href.match(/^(https?:)\/\/(([^:\/?#]*)(?::([0-9]+))?)(\/[^?#]*)(?:\?([^#]*|)(#.*|))?$/);
    return match && {
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function bytesToHex(arr) {
    var result = "";
    var z;

    for (var i = 0; i < arr.length; i++) {
        var str = arr[i].toString(16);

        z = 8 - str.length + 1;
        str = Array(z).join("0") + str;

        result += str;
    }

    return result;
}

function getParametersString(request, search) {
    /* Create the canonicalized query string that you need later in this
     * procedure:
     */
     if (search === null || typeof search === "undefined") {
        return ""
     }

    var params = []

    /* The parameters can come from the GET URI ... */
    var query = search.split('&')
    query.forEach(function(param) {
        var parts = param.split('=',2)
        if (parts.length === 2 && parts[0] !== 'Signature') {
            params.push(parts)
        }
    })

    /* Sort the UTF-8 query string components by parameter name with natural
     * byte ordering. */
    params.sort(function(a, b) {
      if (a[0] > b[0]) {
        return 1
      }
      else if (a[0] < b[0]) {
        return -1
      }
      return 0
    })

    /* URL encode the parameter name and values according to the following
     * rules...(see doc for details).
     * Separate the encoded parameter names from their encoded values with the
     * equals sign ( = ) (ASCII character 61), even if the parameter value is
     * empty.
     * Separate the name-value pairs with an ampersand ( & ) (ASCII code 38).
     *
     * NOTE: Paw already URL encodes parameters before passing them to this
     * extension.
     */
    var stringParams = params.map(function(pair) {
      return pair[0] + '=' + pair[1]
    })
    return stringParams.join('&')
  }

// returns YYYYMMDD day string.
function amzDay(now) {
    var month = now.getUTCMonth() + 1
    if (month < 10) {
        month = '0'+month
    } else {
        month = ''+month
    }
    var day = now.getUTCDate()
    if (day < 10) {
        day = '0'+day
    } else {
        day = ''+day
    }
    return now.getUTCFullYear()+month+day
}

// returns HHmmss time string.
function amzTime(now) {
    var hour = now.getUTCHours()
    if (hour < 10) {
        hour = '0'+hour
    } else {
        hour = ''+hour
    }
    var min = now.getUTCMinutes()
    if (min < 10) {
        min = '0'+min
    } else {
        min = ''+min
    }
    var sec = now.getUTCSeconds()
    if (sec < 10) {
        sec = '0'+sec
    } else {
        sec = ''+sec
    }
    return hour+min+sec
}

function hash256(input) {
    var dv = DynamicValue("com.luckymarmot.HashDynamicValue", {
        input: input,
        hashType: 5,                // SHA256
        encoding: 'Hexadecimal',    // Hexadecimal
        uppercase: false,           // lower case
    })
    return dv.getEvaluatedString()
}

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(h,s){var f={},g=f.lib={},q=function(){},m=g.Base={extend:function(a){q.prototype=this;var c=new q;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
r=g.WordArray=m.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||k).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=m.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new r.init(c,a)}}),l=f.enc={},k=l.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
2),16)<<24-4*(b%8);return new r.init(d,c/2)}},n=l.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new r.init(d,c)}},j=l.Utf8={stringify:function(a){try{return decodeURIComponent(escape(n.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return n.parse(unescape(encodeURIComponent(a)))}},
u=g.BufferedBlockAlgorithm=m.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(d,g);g=d.splice(0,a);c.sigBytes-=b}return new r.init(g,b)},clone:function(){var a=m.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});g.Hasher=u.extend({cfg:m.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){u.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new t.HMAC.init(a,
d)).finalize(c)}}});var t=f.algo={};return f}(Math);
(function(h){for(var s=CryptoJS,f=s.lib,g=f.WordArray,q=f.Hasher,f=s.algo,m=[],r=[],l=function(a){return 4294967296*(a-(a|0))|0},k=2,n=0;64>n;){var j;a:{j=k;for(var u=h.sqrt(j),t=2;t<=u;t++)if(!(j%t)){j=!1;break a}j=!0}j&&(8>n&&(m[n]=l(h.pow(k,0.5))),r[n]=l(h.pow(k,1/3)),n++);k++}var a=[],f=f.SHA256=q.extend({_doReset:function(){this._hash=new g.init(m.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],g=b[2],j=b[3],h=b[4],m=b[5],n=b[6],q=b[7],p=0;64>p;p++){if(16>p)a[p]=
c[d+p]|0;else{var k=a[p-15],l=a[p-2];a[p]=((k<<25|k>>>7)^(k<<14|k>>>18)^k>>>3)+a[p-7]+((l<<15|l>>>17)^(l<<13|l>>>19)^l>>>10)+a[p-16]}k=q+((h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25))+(h&m^~h&n)+r[p]+a[p];l=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&g^f&g);q=n;n=m;m=h;h=j+k|0;j=g;g=f;f=e;e=k+l|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+g|0;b[3]=b[3]+j|0;b[4]=b[4]+h|0;b[5]=b[5]+m|0;b[6]=b[6]+n|0;b[7]=b[7]+q|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=q.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=q._createHelper(f);s.HmacSHA256=q._createHmacHelper(f)})(Math);
(function(){var h=CryptoJS,s=h.enc.Utf8;h.algo.HMAC=h.lib.Base.extend({init:function(f,g){f=this._hasher=new f.init;"string"==typeof g&&(g=s.parse(g));var h=f.blockSize,m=4*h;g.sigBytes>m&&(g=f.finalize(g));g.clamp();for(var r=this._oKey=g.clone(),l=this._iKey=g.clone(),k=r.words,n=l.words,j=0;j<h;j++)k[j]^=1549556828,n[j]^=909522486;r.sigBytes=l.sigBytes=m;this.reset()},reset:function(){var f=this._hasher;f.reset();f.update(this._iKey)},update:function(f){this._hasher.update(f);return this},finalize:function(f){var g=
this._hasher;f=g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f))}})})();

function getSignatureKey(key, dateStamp, regionName, serviceName) {

    // Signatures must use CryptoJS because the built in HMACDynamicValue won't
    // input or output raw byte arrays which is needed for the AWS signature.
    var kDate= CryptoJS.HmacSHA256(dateStamp, "AWS4" + key)
    var kRegion= CryptoJS.HmacSHA256(regionName, kDate)
    var kService=CryptoJS.HmacSHA256(serviceName, kRegion)
    var kSigning= CryptoJS.HmacSHA256("aws4_request", kService)

    // console.log('gsk date', kDate)
    // console.log('gsk region', kRegion)
    // console.log('gsk service', kService)
    // console.log('gsk signing', kSigning)

    return kSigning
}

function signHmac256(key, input) {
    var dv = DynamicValue("com.luckymarmot.HMACDynamicValue", {
      input: input,
      key: key,
      algorithm: 3,             // SHA256
      uppercase: false,         // lower case
      encoding: 'Hexadecimal',  // Hexadecimal
    })
    return dv.getEvaluatedString()
}

// A dummy normalize function until the real one is tested
function normalize(path) {
    return path;
}

// normalize the URI path by removing redundant and relative path components
// this is untested - for safety, I'll make this a separate PR with some unit tests :)
function normalizeLater(path) {
    var parts = path.split('/');
    // remove current directory and empty directory entries
    parts = parts.filter(val => val !== '.' && val !== '');
    // search for relative paths and eliminate them
    for (var index = parts.indexOf('..'); index > 0; index = parts.indexOf('..')) {
        // we pull out both the relative path and its parent
        parts = parts.splice(index, 1);
        if (index < 1) {
            parts = parts.splice(index - 1, 1);
        }
    }
    return parts.length < 1 ? '/' : parts.join('/');
}

// encodeComponents will break up a URI path and encode it's components - optionally doing it once
function encodeComponents(path, once) {
    console.log('encoding once?', once);
    var parts = once ? path.split('/') : normalize(path).split('/');
    var encoded = []
    parts.forEach(part => {
        if (once) {
            encoded.push(encodeURIComponent(part))
        } else {
            encoded.push(encodeURIComponent(encodeURIComponent(part)));
        }
    })
    return encoded.join('/');
}

// See http://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html
var AWSSignature4DynamicValue = function() {
    this.evaluate = function(context) {
        var request = context.getCurrentRequest()
        var uri = getLocation(request.url)
        var region = this.region || 'us-east-1'
        var service = this.service || 'execute-api'

        var daytimeHeader = request.getHeaderByName('X-Amz-Date', false)
        var day = ''        // Just the day portion of the date
        var daytime = ''    // The full date
        if (daytimeHeader) {
            // We prefer getting the header
            daytime = daytimeHeader
            day = daytime.split('T')[0]
        } else {
            var now = new Date()
            day = amzDay(now)
            daytime = day + 'T' + amzTime(now)
        }
        var bodyHash = this.use_header_hash
            ? request.getHeaderByName('x-amz-content-sha256', false)
            : hash256(request.body || '')

        // Search for other signed headers to include. We will assume any headers that begin with X-Amz-<*> will be included
        var headers = {} // The actual headers to sign
        var headersArray = request.getHeadersArray()
        if (headersArray) {
          headersArray.forEach(function(header) {
            var lower = header.name.getEvaluatedString().toLowerCase()
            if (lower.startsWith('x-amz-')) {
              headers[lower] = header.value.getEvaluatedString();
            }
          })
        }

        headers['host'] = uri.host.toLowerCase();

        if (!headers['x-amz-date']) {
          headers['x-amz-date'] = daytime;
        }

        var signedHeaders    = []
        var canonicalHeaders = []

        for (var h of Object.keys(headers).sort()) {
          signedHeaders.push(h);
          canonicalHeaders.push(h + ':' + headers[h]);
        }

        // AWS wants the URI normalized (except for s3 which is not normalized) path URL encoded according to RFC 3986.
        // Each path segment should be URI-encoded **twice** except for s3 which only gets URI-encoded once.
        var target = uri.pathname;
        var canonicalURI = encodeComponents(uri.pathname, service === 's3' || service === 'execute-api');

        // Step 1
        var canonical = request.method + '\n' +
            canonicalURI + '\n' +
            getParametersString(request, uri.search) + '\n' +
            canonicalHeaders.join('\n') + '\n' +
            '\n' +
            signedHeaders.join(';') + '\n' +
            bodyHash

        var canonicalHash = hash256(canonical)
        console.log('canonical')
        console.log(canonical)

        // Step 2
        var scope = day + '/' + region + '/' + service + '/aws4_request'
        var stringToSign = 'AWS4-HMAC-SHA256\n'
            + daytime + '\n'
            + scope + '\n'
            + canonicalHash

        console.log('string to sign')
        console.log(stringToSign)

        // Step 3
        var kSigning = getSignatureKey(this.secret, day, region, service)

        var signature = CryptoJS.HmacSHA256(stringToSign, kSigning)

        // Step 4
        var auth = 'AWS4-HMAC-SHA256 Credential=' + this.key + '/' + scope + ', SignedHeaders=' + signedHeaders.join(';') + ', Signature=' + signature

        if (daytimeHeader === null) {
            // Add the missing header - this doesn't seem to actually "stick"
            console.log("Trying to set X-Amz-Date header")
            request.setHeader('X-Amz-Date', daytime)
        }

        return auth
    }
}

AWSSignature4DynamicValue.identifier = 'com.shigeoka.PawExtensions.AWSSignature4DynamicValue'
AWSSignature4DynamicValue.title = 'AWS Signature 4 Auth'
AWSSignature4DynamicValue.help = 'https://github.com/badslug/Paw-AWSSignature4DynamicValue'
AWSSignature4DynamicValue.inputs = [
      DynamicValueInput('key', 'AWS Access Key', 'SecureValue'),
      DynamicValueInput('secret', 'AWS Secret Key', 'SecureValue'),
      DynamicValueInput('region', 'AWS Region (us-east-1)', 'String'),
      DynamicValueInput('service', 'AWS Service (execute-api)', 'String'),
      DynamicValueInput('use_header_hash', 'Use X-Amz-Content-Sha256 header?', 'Checkbox', { defaultValue: false }),
  ]

registerDynamicValueClass(AWSSignature4DynamicValue)
