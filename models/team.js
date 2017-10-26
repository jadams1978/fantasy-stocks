const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
    teamname: {
    type: String,
    default: "noname"
  },
  league_name: {
    type: String,
    default: "noname"
  },
  leaguename: {
    type: String
    
  },
  stocks: {
    type: Array
  },
  score: {
    type: Number,
    default: 0
    
  },
  teamOwner:String

});



//const Team = mongoose.model('Team', TeamSchema);

module.exports = mongoose.model('teams', TeamSchema);
