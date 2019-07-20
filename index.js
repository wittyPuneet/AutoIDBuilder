const DEFAULT_FORMAT = [{isStatic:false, type:'number', length: 5, padChar: "0"}];

/**
 * Entry point for ID creation object.
 * @param {{isStatic:boolean, type:'string', length:number, padChar:string }[]} format
 * @returns {{newFormat:function, getFormat:function,generateID:function()}}
 */
function idFormat(format = DEFAULT_FORMAT) {
    this.isCompiled = false;
    this.length = 0;
    this.format = format;
    this.fragmentCount = this.format.length;
    const _ = this;
    //Validate and compile the format.
    compile();

    function getFormat() {
        return _.format;
    }

    function newFormat() {
        _.format = [];
        _.isCompiled = false;
        _.length = 0;
        _.fragmentCount = 0;
        return { addPart };
    }


    /**
     * Add a part of the id schema.
     * @param {Boolean} isStatic Is this part static?
     * @param {String} type If its static, enter the static value
     * @param {Number} length Length of this part.
     * @param {String} padChar The padding chart to be used. Default is '0'.
     * @param {Array} charArray Custom char array to be used of type string.
     * @returns {{addPart:function, compile: function}}
     */
    function addPart(isStatic, type, length, padChar = '0', charArray) {
        if (typeof isStatic !== 'boolean') throw ('Invalid type. Must be a boolean.');
        if (typeof length !== 'number') throw ('Invalid type. Must be a number.');
        if(length > 1 && padChar.length !== 1) throw('Padding char cannot be greater than length 1');
        const part = { isStatic, type, length };
        if (type === 'string' || type === 'number') {
            part.padChar = padChar;
        }
        _.format.push(part);
        return { addPart, compile }
    }

    /**
     * Compiles and validates the id fragments into a schema.
     * @returns {{newFormat:function, getFormat:function,generateID:function()}}
     */
    function compile() {
        _.fragmentCount = _.format.length;
        if (_.fragmentCount === 0) {
            _.isCompiled = false;
            return;
        }

        //Validate the format.
        validateFormat();

        //Compute the length of the ID.
        _.length = _.format.reduce((accLength, currFragment) => {
            return accLength + currFragment.length;
        },0);
        _.isCompiled = true;
        return { newFormat, getFormat, generateID }
    }


    function validateFormat() {
        _.format.forEach((fragment, index) => {
            isValidFragment(fragment, index);
        });
        return true;
    }



    function isValidFragment({ isStatic, type, length, pad }, fragmentIndex) {
        if (typeof isStatic !== 'boolean')
            throw (fragmentIndex + ': Static flag must be a boolean.');
        if (typeof length !== 'number')
            throw (fragmentIndex + ': Fragment length should be a number.');
        if (!isStatic && (type !== 'string' && type !== 'number'))
            throw (fragmentIndex + ': Dynamic fragments must be either a string or a number.')
        return true;
    }

    /**
     * Increment the numeric part of id fragment.
     * @param {string} val
     * @param {string} padChar
     * @param {number} length
     * @returns {string}
     */
    function incrementNumber(val, padChar, length) {
        let tmpVal = val;
        if (isNaN(padChar))
            tmpVal = string.replace(padChar, "");

        //Conveert to number
        +tmpVal;
        if (isNaN(tmpVal)) throw ('Invalid value suplied for numeric fragment.')

        //Increment the numeric value
        tmpVal++;

        //Convert to string.
        let strValue = tmpVal + "";

        //Checkk if the numeric value has grown so large that we need to
        //roll over other format fragments.
        if (strValue.length > val.length) {
            strValue = "1".padStart(length, padChar)
            return { result: strValue, carry: true };
        } else {
            return { result: strValue.padStart(length, padChar), carry: false };
        }
    }


    function incrementString(val, delta, padChar = "0", startChar, endChar) {
        const PAD = padChar.charCodeAt(0);
        let startIndex = val.length - 1;
        let carryForward = false;

        for (let i = startIndex; i >= 0; i--) {
            carryForward = false;
            let char = val.charCodeAt(i);
            char = char === PAD && PAD !== startChar ? startChar : char + delta;

            if (char > endChar) {
                char = startChar;
                carryForward = true;
            }
            char = String.fromCharCode(char);
            val = setCharAt(val, i, char);
            if (!carryForward)
                break;
        }

        return { result: val, carry: carryForward };
    }

    function setCharAt(str, index, chr) {
        if (index > str.length - 1) return str;
        return str.substr(0, index) + chr + str.substr(index + 1);
    }

    function incrementCharset(val, delta, padChar = "0", charArray, charDict) {
        const PAD = padChar.charCodeAt(0);
        let startIndex = val.length - 1;
        let carryForward = false;
        const endChar = charDict[charArray[charArray.length - 1]];

        for (let i = startIndex; i >= 0; i--) {
          carryForward = false;
          let char = charDict[val.charAt(i)];
          char = char === undefined ? 0 : char + delta;
          if (char > endChar) {
            char = 0;
            carryForward = true;
          }
          char = charArray[char];
          val = setCharAt(val, i, char);
          if (!carryForward)
            break;
        }

        return { result: val, carry: carryForward };
      }

    /**
 *
 * @param {{type:string, val:string, length:number, pad:string}[]} format
 * @param {string} lastID
 */
    function generateID(lastID) {
        const A = 65;
        const Z = 90;
        const strLength = _.length;

        lastID = lastID || _.format.reduce((cum, curr) => {
            if (curr.isStatic) return (cum + curr.type);
            let returnStr = curr.type === 'string' ? 'A' : '0';
            returnStr = cum + returnStr.padStart(curr.length, curr.padChar);
            return returnStr;
        }, "");

        let startIndex = strLength;

        let carryForward = true;
        let result = "";

        for (let index = _.fragmentCount - 1; index >= 0; index--) {
            let formatPart = _.format[index];
            startIndex -= formatPart.length;

            if (formatPart.isStatic) {
                result = formatPart.type + result;
            } else {
                let length = formatPart.length;

                let part = lastID.substring(startIndex, startIndex + length);

                if (carryForward) {
                    let tmpVal = formatPart.type === 'string' ? incrementString(part, 1, formatPart.padChar, A, Z)
                        : incrementNumber(part,formatPart.padChar, part.length);
                    part = tmpVal.result;
                    carryForward = tmpVal.carry;
                }
                result = part + result;
            }
        }
        return result;
    }
    return { newFormat, getFormat, generateID };
}

module.exports = idFormat;