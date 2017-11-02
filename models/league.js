const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeagueSchema = new Schema({
	leaguename:String,
	teams:Array,
	createdBy:String,
	leagueOwner:String,
	schedule:Array
	
 
});



//const Team = mongoose.model('League', LeaugeSchema);

module.exports = mongoose.model('leagues', LeagueSchema);
