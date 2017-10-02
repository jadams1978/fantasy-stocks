const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
    teamname: {
    type: String,
    default: "noname"
  },
  leaguename: {
    type: String,
    default: "noname"
  },
  stocks: {
    type: Array
  }

});



//const Team = mongoose.model('Team', TeamSchema);

module.exports = mongoose.model('teams', TeamSchema);
