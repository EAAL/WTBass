var fs = require('fs');
var userFile = 'users.json';
var voteFile = 'votes.json';
var picFile = 'pictures.json';
 
var userRows = fs.readFileSync(userFile).toString().split('\n');
var voteRows = fs.readFileSync(voteFile).toString().split('\n');
var picRows = fs.readFileSync(picFile).toString().split('\n');

var users = [];
 for (var i = userRows.length - 1; i >= 0; i--) {
 	if(userRows[i] == "")
 		continue;
	data = JSON.parse(userRows[i]);
	var flag = false;
	for (var j = users.length - 1; j >= 0; j--) {
		if (users[j].id == data.data[0].id ){
			flag = true;
			break;
		}
	};
	if(flag == false){
		users.push(data.data[0]);
		console.dir("Name: " + users[users.length-1].name);
	}
 };

console.dir("Size: " + users.length);

function getUser(id){
	for (var j = users.length - 1; j >= 0; j--) {
		if (users[j].id == id ){
			return users[j];
		}
	};
	return null;
}

// var votes = [];
// for (var i = voteRows.length - 1; i >= 0; i--) {
// // for (var i =1; i >= 0; i--) {
// 	if(voteRows[i] == "")
//  		continue;
// 	data = JSON.parse(voteRows[i]);
// 	tmpUsers = [];
// 	tmpUsers.push(data.voter);
// 	for (var j = data.fn.length - 1; j >= 0; j--) {
// 		tmpUsers.push(data.fn[j].id);
// 	};
// 	for (var k = picRows.length - 1; k >= 0; k--) {
// 		if(picRows[k] == "")
//  			continue;
// 		picData = JSON.parse(picRows[k]);
// 		var matchCount = 0;
// 		var others = []
// 		for (var j = picData.users.length - 1; j >= 0; j--) {
// 			for (var q = tmpUsers.length - 1; q >= 0; q--) {
// 				if(picData.users[j] == 	tmpUsers[q])
// 					matchCount++;
// 				else
// 					others.push(picData.users[j]);
// 			};
// 		};
// 		if(matchCount == tmpUsers.length)
// 		{
// 			votes.push(JSON.stringify({voter : data.voter, fn : tmpUsers , fy : others , yCount : data.yCount, nCount : data.nCount , _id : data._id}));
// 			// console.dir(votes[0]);
// 			// console.dir(picData.pic);
// 			break;
// 		}
// 	};
// };

// var newVoteFile = fs.createWriteStream('newVoteFile.txt');
// newVoteFile.on('error', function(err) { /* error handling */ });
// votes.forEach(function(v) { newVoteFile.write(v + '\n'); });
// newVoteFile.end();
