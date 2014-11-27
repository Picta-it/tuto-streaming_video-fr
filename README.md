# Tutoriel Streaming Vidéo

Ce tutoriel explique comment mettre en place du streaming Vidéo sur votre site.

## Prérequis

Vous devez avoir installé
* [NodeJs](http://www.nodejs.org/)

## Pour tester directement (avec [git](http://git-scm.com/))

NB : Le fichier `video.mp4` n'est pas présent dans les sources.

```bash
git clone git@github.com:Picta-it/tuto-streaming_video-fr.git
cd tuto-streaming_video-fr
npm install
```

Déposez un fichier vidéo à la racine

```bash
node index.js
```

## Tutoriel

### Installation

Nous allons installer les packages de base pour créer notre mini-projet :
* [Express](http://expressjs.com/) : Framework MVC pour NodeJs
* [EJS](https://github.com/tj/ejs) : Générateur de pages à partir de templates

```bash
npm install express
npm install ejs
```

Déposez votre vidéo à la racine avec le nom `video.mp4`. Si votre vidéo à un autre format que `mp4`, il faudra effectuer les modifications dans le fichier `index.js`.

### Création de notre template

Dans le répertoire `views`, créer le fichier my-stream.html.ejs et ajoutez-y le code suivant :

```html
<html>
  <head>
  </head>
  <body>
    <!--
      La balise video permet d'intégrer facilement des vidéos en HTML5.
      L'attribut source vous permet d'indiquer la source du flux vidéo.
    -->
    <video src="http://localhost:3000/video" autoplay="" controls="">
    </video>
  </body>
</html>
```

### Création de notre serveur

Puis créez le fichier index.js :

```Javascript
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
    console.log('Partial file - range: ' + start + ' to ' + end + ' = ' + chunksize);
  
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
    console.log('Whole file: ' + total);
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

  console.log('Video streaming application listening at http://%s:%s', host, port);
});
```

Et voilà

### Lancement du serveur

```Javascript
node index.js
```
