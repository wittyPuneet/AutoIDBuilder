## Welcome to AutoID

AutoID can generate multipart ids based on a given schema. The ids can be consist of multiple static and incrementing fragments with a combination of test and number. Example:
1. 001 -> 002
2. 0A-999 -> 0B-001
3. STATIC-0A-100 -> STATIC-0A-101
4. AZ-99-STATIC-ZZ-99 -> BA-01-STATIC-0A-01
_and more..._

**In a nutshell, the id is composed of static and dynamic fragments with no limit on how and where they are placed.**


### Usage


```markdown
const AutoID = require('AutoID');

//Define schema for 001
const idSchema = AutoID().newFormat()
    .addPart(false,'number',3)
    .compile();
console.log(idSchema.generateID()) //Prints 001
console.log(idSchema.generateID('001')) //Prints 002

const alphaNumericID = AutoID().newFormat()
    .addPart(false, 'string', 2)  //Add the dynamic string part.
    .addPart(true, '-', 1)        //Add the static string part.
    .addPart(false, 'number', 3)  //Add the dynamic numerical part.
    .compile();
console.log(alphaNumericID.generateID()) //Prints 0A-001
console.log(alphaNumericID.generateID('0A-999')) //Prints 0B-001

const complexID = AutoID().newFormat()
    .addPart(false,'string', 3)   //Add the dynamimc string part.
    .addPart(true,'-AutoID-')     //Add the static part
    .addPart(false, 'string', 2)  //Add the dynamic string part.
    .addPart(true, '-')           //Add the static string part.
    .addPart(false, 'number', 3)  //Add the dynamic numerical part.
    .compile();
console.log(complexID.generateID()) //Prints 00A-AutoID-0A-001# Header 1
```