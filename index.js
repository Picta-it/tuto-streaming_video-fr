var express   = require('express');
var app       = express();

var fs        = require('fs');

// On définit ejs comme "machine" pour les templates
app.engine( 'html', require('ejs').renderFile);

// On fournit la page html par défault sur /
app.get('/', function ( req, res) {
  res.render('my-stream.html.ejs')
})

// On fournit le stream video sur /video
app.get('/video', function ( req, res) {
  // Nom de la vidéo
  var path    = 'video.mp4';
  // On récupère les informations du fichier viddéo
  var stat    = fs.statSync(path);

  // On récupère la taille de la vidéo
  var total   = stat.size;

  // Si on demande une partie du fichier, on passe part là
  if (req.headers['range']) {
    // On récupère les indications sur la partie du fichier à envoyer
    var range         = req.headers.range;
    // On met les informations dans un tabeau
    var parts         = range.replace(/bytes=/, "").split("-");
    // On prend la valeur indiquant le début dans le fichier
    var partialstart  = parts[0];
    // On prend la valeur indiquant la fin dans le fichier
    var partialend    = parts[1];
  
    // On met ça au format integer
    var start         = parseInt(partialstart, 10);
    var end           = partialend ? parseInt(partialend, 10) : total-1;

    // On mesure la taille du fichier
    var chunksize     = (end-start)+1;

    // On l'affiche
    console.log('Partial file\nrange: ' + start + ' to ' + end + ' = ' + chunksize);
  
    // On crée le stream du morceau de fichier
    var file          = fs.createReadStream(path, {start: start, end: end});

    // On crée l'entête (le code HTTP 206 indique que l'on ne fournit qu'une partie du fichier)
    res.writeHead(206, {
      'Content-Range' :   'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges' :   'bytes',
      'Content-Length':   chunksize,
      'Content-Type'  :   'video/mp4' }); 
    // On envoie le fichier au client
    file.pipe(res);
  }
  // Si on veut l'intégralité, c'est par ici
  else {
    console.log('ALL: ' + total);
    // On crée l'entête
    res.writeHead(200, { 
      'Content-Length':     total,
      'Content-Type'  :     'video/mp4'
    }); 

    // On crée le stream au client
    fs.createReadStream(path).pipe(res);
  }   
});

// On lance le serveur sur le port 3000
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
