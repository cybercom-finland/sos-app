// run with "node stories.js"

var fs = require('fs');
var path = require('path');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
//var filepath = path.join(__dirname, process.argv[2])
var filepath1 = path.join(__dirname, '../public/system/assets/img/kyla.jpg');
var filepath2 = path.join(__dirname, '../public/system/assets/img/koti.jpg');
var filepath3 = path.join(__dirname, '../public/system/assets/img/sisarukset.jpg');
var filepath4 = path.join(__dirname, '../public/system/assets/img/vanhempi.jpg');
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

mongoose.connect('mongodb://localhost/mean-dev');

var StorySchema = new Schema(
{
	content: { type: String, required: true },
	header: { type: String, required: true },
	image: { mime: String, bin: Buffer },
	imageType: { type: String }
});

var Story = mongoose.model('Story', StorySchema);

var story1 = new Story();
story1.content = 'Riippumatta taustastaan lasten tulisi saada kasvaa perheessä, joka kannustaa lapsia hyödyntämään omia voimavarojaan. Lapsikylässä lapsen hyvinvoinnista huolehtii sijaisvanhempien ohella koko kylä.';
story1.header = 'Kylä';
story1.imageType = 'image/jpg';

var story2 = new Story();
story2.content = 'Autamme perheitä luomaan ympäristön, jonka lapset tuntevat kodikseen ja johon he voivat palata. Tuemme myös sijaisvanhempien yhteydenpitoa aikuistuneiden lasten kanssa.';
story2.header = 'Koti';
story2.imageType = 'image/jpg';

var story3 = new Story();
story3.content = 'Päämäärämme on auttaa perheitä pysymään koossa. Kun se ei ole mahdollista, pyrimme takaamaan, että sisarukset voivat kasvaa yhdessä, saavat jakaa yhteisen historiansa ja rakentaa yhteistä tulevaisuutta.';
story3.header = 'Sisarukset';
story3.imageType = 'image/jpg';

var story4 = new Story();
story4.content = 'Tavoitteemme on, että lapsi saa kasvaa vanhemman tai huoltajan kanssa turvallisessa, rakastavassa ja pysyvässä suhteessa. Lapsi tarvitsee jatkuvaa rohkaisua, luottamusta ja tukea.';
story4.header = 'Vanhempi';
story4.imageType = 'image/jpg';

fs.readFile(filepath1, function (err, data) {
  if (err) throw err;
  saveImage(story1, data);
  });

fs.readFile(filepath2, function (err, data) { 
  if (err) throw err;
  saveImage(story2, data);
  });

fs.readFile(filepath3, function (err, data) {
  if (err) throw err;
  saveImage(story3, data);
  });

fs.readFile(filepath4, function (err, data) {
  if (err) throw err;
  saveImage(story4, data);
  });


function saveImage(story, image) {
	story.image = new mongodb.Binary(image);
	story.save(function (err) {
		if (err) throw err;
	});
 	console.log('story saved: ' + story)
}

