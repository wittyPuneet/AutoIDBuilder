const AutoID = require('../index');

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
console.log(complexID.generateID()) //Prints 00A-AutoID-0A-001