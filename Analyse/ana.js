var fs = require('fs');
var userFile = 'users.json';
var voteFile = 'NEWVOTES.json';
var picFile = 'pictures.json';
 
var userRows = fs.readFileSync(userFile).toString().split('\n');
var voteRows = fs.readFileSync(voteFile).toString().split('\n');
var picRows = fs.readFileSync(picFile).toString().split('\n');

var users = {};
var userSize = 0;
var newUserFile = fs.createWriteStream('newUserFile.txt');
// Find users in pictures
 for (var i = picRows.length - 1; i >= 0; i--) {
 	if(picRows[i] == "")
 		continue;
	data = JSON.parse(picRows[i]);
	var flag = false;
	for (var k = data.users.length - 1; k >= 0; k--) {
		if (data.users[k] in users ){
			continue;
		}
		users[data.users[k]] = userSize;
		newUserFile.write(userSize + " " + data.users[k] + "\n");
		userSize++;
	};
 };
newUserFile.end();

console.dir("Size: " + userSize);


//Make two dimensional array to store edges
var mat = new Array(userSize);
var voteCount = new Array(userSize);
for (var i = userSize-1; i >= 0; i--) {
	mat[i] = new Array(userSize);
	for (var j = mat[i].length - 1; j >= 0; j--) {
			mat[i][j] = 0;
	};
	voteCount[i] = 0;
};


var newVoteFile = fs.createWriteStream('newVoteFiles.json');
//Iterate all votes to make influence graph
for (var i = voteRows.length - 1; i >= 0; i--) {
	if(voteRows[i] == "")
 		continue;
	data = JSON.parse(voteRows[i]);
	tmpFN =[]
	for (var i = data.fn.length - 1; i >= 0; i--) {
		tmpFN.push({id : data.fn[i].id});
	};
	tmpFY =[]
	for (var i = data.fy.length - 1; i >= 0; i--) {
		tmpFY.push({id:data.fy[i].id});
	};
	newVoteFile.write(JSON.stringify({voter : data.voter, fn : tmpFN , fy : tmpFY , yCount : data.yCount, nCount : data.nCount , _id : data._id}));
	// if(data.yCount > 0 && data.nCount > 0)
	// 	continue;
	// var x = users[data.voter];
	// voteCount[x] += data.yCount;
	// voteCount[x] += data.nCount;
	// // Add weight to edges
	// if(data.yCount > 0)
	// {

	// 	for (var j = data.fy.length - 1; j >= 0; j--) {
	// 		var y = users[data.fy[j]];
	// 		mat[x][y] += data.yCount;
	// 	};
	// }
	// if(data.nCount > 0)
	// {
	// 	for (var j = data.fn.length - 1; j >= 0; j--) {
	// 		var y = users[data.fn[j]];
	// 		mat[x][y] += data.nCount;
	// 	};
	// }
};

newVoteFile.end()


// // var newMatFile = fs.createWriteStream('newMatFile.txt');
// var newMatFile = fs.createWriteStream('Community.txt');
// newMatFile.on('error', function(err) { /* error handling */ });
// for (var i = userSize - 1; i >= 0; i--) {
// 	// newMatFile.write(i.toString());
// 	for (var j = userSize - 1; j >= 0; j--) {
// 		// if(mat[i][j]*1.0 / voteCount[i] > 0.6)
// 		if(mat[i][j] > 0)
// 			// newMatFile.write(i + " " + j + " " + mat[i][j] + '\n');
// 			newMatFile.write(j + " " + i + '\n');
// 			// newMatFile.write( " " + j );
// 	};
// 	// newMatFile.write('\n');
// };
// newMatFile.end();

// Store edges to show in Gephi
// var newMatFile = fs.createWriteStream('newMatFile.txt');
// newMatFile.on('error', function(err) { /* error handling */ });
// for (var i = userSize - 1; i >= 0; i--) {
// 	newMatFile.write(i.toString());
// 	for (var j = userSize - 1; j >= 0; j--) {
// 		if(mat[i][j]*1.0 / voteCount[i] > 0.6)
// 			// newMatFile.write(i + " " + j + " " + mat[i][j] + '\n');
// 			// newMatFile.write(j + " " + i + '\n');
// 			newMatFile.write( " " + j );
// 	};
// 	newMatFile.write('\n');
// };
// newMatFile.end();
