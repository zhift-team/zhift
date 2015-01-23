/*  Schema + Mongoose model for Swap

    Swap represents a shift that is offered for trade.

    Usage Example: 
        shiftOfferedInReturn is initially null and is set when a user offers a shift.
        
    @author: Vicky Gong
    
*/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var SwapSchema = new mongoose.Schema({
    shiftUpForSwap: {type: ObjectId, ref: 'Shift', required: true},
    shiftOfferedInReturn: {type: ObjectId, ref: 'Shift'},
    schedule: {type: ObjectId, ref: 'Schedule', required: true}
});

module.exports = mongoose.model('Swap', SwapSchema);
