const expressLib = require("express");
const parser = require('body-parser');
const multiparty = require('multiparty');
const fs = require('fs');
//const port = 3001;
const port = process.env.PORT || 3001
var app = expressLib();
var path = require("path");
const plantilla = require("ejs");
const conekta = require("conekta")

const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost/eventsDB")

conekta.api_key = 'key_ZxvvZN5xKq9Nktf7QUMfvg';
conekta.locale = 'es';
conekta.api_version = "2.0.0";
const connectMysql = require("./Services/db_Connect_Mysql");

app.use(expressLib.static(__dirname + '/public'))
app.use(expressLib.static(__dirname + '/Views'))
app.set('views', __dirname + '/Views');
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/eventsDB")

ticketModel = new mongoose.Schema({
    eventID: String,
    tickets: String,
    total: String,
    payMethod: String,
    userName: String,
    datestamp: String,
    phone: String,
    mail: String
}, {
    collection: 'tickets'
});

eventModel = new mongoose.Schema({
    name: String,
    cost: String,
    date: String,
    place: String,
    image: String,
    entradas: String,
    fechaMaxVenta: String,
    maxTicketsCliente: String,
    UbicacionX: String,
    UbicacionY: String,
    Descripcion: String,
    Contacto: String,
    Politicas: String
}, {
    collection: 'events'
});


var ticketModel = mongoose.model('tickets', ticketModel);
var eventModel = mongoose.model('events', eventModel);



/*app.get('/lista', (req, res) => {
    var obj = {};
    connectMysql.query('SELECT * FROM Contactos', function (err, result) {
        if (err) {
            throw err;
        } else {
            res.render("page", {
                data: req.url,
                contactos: result
            });
        }

    });

});*/


app.get('/compraTickets', (req, res) => {
    var id = req.query.id;
    console.log("Info del ticket: " + id);
    eventModel.findOne({
        _id: id
    }, function (err, docs) {
        console.log(docs);
        console.log("going to lista Tickets")
        res.render("page", {
            data: "/compraTickets",
            contactos: docs
        });
    });

});


app.get('/listaTickets', (req, res) => {
    ticketModel.find({}, {}, {
        sort: {
            '_id': -1
        }
    }, function (err, docs) {
        //console.log(docs);
        console.log("going to lista Tickets")
        res.render("page", {
            data: "/listaTickets",
            contactos: docs
        });
    });
});

app.get('/listaEventos', (req, res) => {
    eventModel.find({}, {}, {
        sort: {
            '_id': -1
        }
    }, function (err, docs) {
        //console.log(docs);
        console.log("going to lista Eventos")
        res.render("page", {
            data: "/listaEventos",
            contactos: docs
        });
    });
});

app.get('/nextEvents', (req, res) => {
    eventModel.find({}, {}, {
        sort: {
            '_id': -1
        }
    }, function (err, docs) {
        //console.log(docs);
        console.log("going to lista Eventos")
        res.render("page", {
            data: "/nextEvents",
            contactos: docs
        });
    });
});


app.get('/index', (req, res) => {
    eventModel.find({}, {}, {
        sort: {
            '_id': -1
        }
    }, function (err, docs) {
        //console.log(docs);
        console.log("going to lista Eventos")
        res.render("page", {
            data: "/index",
            contactos: docs
        });
    });
});

app.get('/', (req, res) => {
    eventModel.find({}, {}, {
        sort: {
            '_id': -1
        }
    }, function (err, docs) {
        //console.log(docs);
        console.log("going to lista Eventos")
        res.render("page", {
            data: "/index",
            contactos: docs
        });
    });
});


app.get('*', (req, response) => {

    response.render("page", {
        data: req.url
    });
});



app.post('/creaEventoPost', (req, res) => {
    var form = new multiparty.Form();
    var data = {
        data: {}
    };

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            data.data.err = err;
            res.render("postdata2", data);
            return;
        }

        //No valid file?
        if (!files['archivo'][0].originalFilename || files['archivo'][0].originalFilename === '') {
            fs.unlink(files['archivo'][0].path, (err) => {
                if (err) {
                    console.warn(err, ' File not deleted: ' + files['archivo'][0].path);
                }
                console.log('Temporal file ' + files['archivo'][0].path + ' was deleted');
            });
            data.data.noFile = 'No valid file';
            res.render("postContactData", data);
            return;
        }

        //Copy uploaded file
        var ext = /(\.[\w\d-]*)$/g.exec(files['archivo'][0].originalFilename);
        ext ? ext = ext[0] : ext = '';
        var filename = (new Date()).getTime() + files['archivo'][0].originalFilename;
        console.log("filename: " + filename);
        var fullfile = path.join(__dirname, 'public', 'img/eventos/', filename);
        var fullfileinfo = path.join(__dirname, 'public', 'archivos', filename + '.txt');
        fs.writeFileSync(fullfile, fs.readFileSync(files['archivo'][0].path));

        //Build up info file
        var info = '';
        for (var i in fields) {
            data.data[i] = fields[i];
            info += i + ' : ' + fields[i] + '\n';
        }

        //Prepare for view
        data.data.file = filename + ext;
        data.data.fileInfo = filename + '.txt';

        //Clean up ur dirty work
        fs.unlink(files['archivo'][0].path, (err) => {
            if (err) {
                console.warn(err, ' File not deleted: ' + files['archivo'][0].path);
            } else {
                console.log('Temporal file ' + files['archivo'][0].path + ' was deleted');
                console.log('Price ' + fields["monto"])

            }
        });

        var schemaAux = {
            name: data.data["name"],
            cost: data.data["cost"],
            date: data.data["date"] + " " + data.data["time"],
            place: data.data["place"],
            image: filename,
            entradas: data.data["entradas"],
            fechaMaxVenta: data.data["maxDate"] + " " + data.data["maxTime"],
            maxTicketsCliente: data.data["maxEntradas"],
            UbicacionX: data.data["xLocation"],
            UbicacionY: data.data["yLocation"],
            Descripcion: data.data["descripcion"],
            Contacto: data.data["contact"],
            Politicas: data.data["politics"]
        };

        var events = new eventModel(schemaAux);
        events.save(function (err) {
            //  console.log(events);
            eventModel.find({}, {}, {
                sort: {
                    '_id': -1
                }
            }, function (err, docs) {
                console.log(docs);
                console.log("going to lista Eventos")
                res.render("page", {
                    data: "/listaEventos",
                    contactos: docs
                });
            });
        });


    });
});



app.post('/ticketsPost', (req, res) => {
    var form = new multiparty.Form();
    var data = {
        data: {}
    };

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            data.data.err = err;
            res.render("postdata2", data);
            return;
        }

        var info = '';
        for (var i in fields) {
            data.data[i] = fields[i];
            info += i + ' : ' + fields[i] + '\n';
            console.log(fields[i]);
        }


        var d = new Date();
        var cDate =

            d.getFullYear() + "/" +
            ("00" + (d.getMonth() + 1)).slice(-2) + "/" +
            ("00" + d.getDate()).slice(-2) + " " +
            ("00" + d.getHours()).slice(-2) + ":" +
            ("00" + d.getMinutes()).slice(-2) + ":" +
            ("00" + d.getSeconds()).slice(-2);



        var schemaAux = {
            eventID: data.data["event"],
            tickets: data.data["amount"],
            total: data.data["total"],
            payMethod: data.data["optradio"],
            userName: data.data["userName"],
            datestamp: cDate,
            phone: data.data["phone"],
            mail: data.data["mail"],
        };


        conekta.Order.create({
            "currency": "MXN",
            "customer_info": {
                "name": data.data["userName"] + "",
                "phone": data.data["phone"] + "",
                "email": data.data["mail"] + "",
            },
            "line_items": [{
                "name": data.data["eventName"] + "",
                "description": data.data["event"] + "",
                "unit_price": data.data["total"] * 100,
                "quantity": data.data["amount"] + "",
                "tags": [],
                "type": ""
                    }]
        }, function (err, res) {
            if (err) {
                console.log(err.type);
                return;
            }
            console.log(res.toObject());
        });


        eventModel.findOne({
            _id: data.data["event"]
        }, function (err, doc) {
            doc.entradas = doc.entradas - data.data["amount"];
            doc.save();
        });

        // Restar los tickets comprados en eventos
        /*  console.log(data.data["event"]);
        eventModel.update({
            _id: '5ac6fa7371af850279f7a890'
        }, {
            entradas: 3
        });
/*
        /*   
        
        var query = { name: 'bourne' };
Model.update(query, { name: 'jason bourne' }, options, callback)

// is sent as

Model.update(query, { $set: { name: 'jason bourne' }}, options, callback)
        try {
            eventModel.updateOne({
                _id: data.data["event"]
            }, {
                $set: {
                    entradas: 3
                }
            });
        } catch (e) {
            console.log(e);
        }
*/

        //Salvar los tickets
        var tickets = new ticketModel(schemaAux);
        tickets.save(function (err) {
            console.log(tickets);
            ticketModel.find({}, {}, {
                sort: {
                    '_id': -1
                }
            }, function (err, docs) {
                console.log(docs);
                console.log("going to lista Tickets")
                res.render("page", {
                    data: "/listaTickets",
                    contactos: docs
                });
            });
        });


        //console.log(data.data["event"]);

    }); //Form.Parse

});


app.post('/postContactData', (req, res) => {
    var form = new multiparty.Form();
    var data = {
        data: {}
    };

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            data.data.err = err;
            res.render("postdata2", data);
            return;
        }

        //No valid file?
        if (!files['archivo'][0].originalFilename || files['archivo'][0].originalFilename === '') {
            fs.unlink(files['archivo'][0].path, (err) => {
                if (err) {
                    console.warn(err, ' File not deleted: ' + files['archivo'][0].path);
                }
                console.log('Temporal file ' + files['archivo'][0].path + ' was deleted');
            });
            data.data.noFile = 'No valid file';
            res.render("postContactData", data);
            return;
        }

        //Copy uploaded file
        var ext = /(\.[\w\d-]*)$/g.exec(files['archivo'][0].originalFilename);
        ext ? ext = ext[0] : ext = '';
        var filename = (new Date()).getTime();
        var fullfile = path.join(__dirname, 'public', 'archivos', filename + ext);
        var fullfileinfo = path.join(__dirname, 'public', 'archivos', filename + '.txt');
        fs.writeFileSync(fullfile, fs.readFileSync(files['archivo'][0].path));

        //Build up info file
        var info = '';
        for (var i in fields) {
            data.data[i] = fields[i];
            info += i + ' : ' + fields[i] + '\n';
        }
        fs.writeFileSync(fullfileinfo, info);

        //Prepare for view
        data.data.file = filename + ext;
        data.data.fileInfo = filename + '.txt';

        //Clean up ur dirty work
        fs.unlink(files['archivo'][0].path, (err) => {
            if (err) {
                console.warn(err, ' File not deleted: ' + files['archivo'][0].path);
            } else {
                console.log('Temporal file ' + files['archivo'][0].path + ' was deleted');
                console.log('Price ' + fields["monto"])

            }
        });


        //  connectMysql.connect();



        conekta.Order.create({
            "currency": "MXN",
            "customer_info": {
                "name": "Eduardo",
                "phone": "4131094552",
                "email": "edwardoluhan@gmail.com"
            },
            "line_items": [{
                "name": "Mac Book Air",
                "description": "Air version.",
                "unit_price": Number(fields["monto"]),
                "quantity": 1,
                "tags": ["Mac book", "Air"],
                "type": "physical"
                    }]
        }, function (err, res) {
            if (err) {
                console.log(err.type);
                return;
            }
            console.log(res.toObject());
        });

        res.render("postContactData", data);
    });
});


console.log(`Running at Port ${port}`);
app.listen(port);
