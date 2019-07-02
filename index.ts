import { getPlantList, login, getPlantDetail, TimeSpan, PlantDetailResponse } from "./growatt";

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const USERNAME: string = process.env.NODE_SOLAR_USERNAME || '';
const PASSWORD: string = process.env.NODE_SOLAR_PASSWORD || '';

let sessionLoggedIn: boolean = false;

login(USERNAME, PASSWORD).then((loggedIn: boolean) => {
    sessionLoggedIn = loggedIn;
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get("/current", (req: any, res: any) => {
    login(USERNAME, PASSWORD).then((loggedIn: boolean) => {
        if (loggedIn) {
            getPlantList().then((list) => {
                console.log('list', list);
                res.send(list.data[0].currentPower);
            });
        }
    });
});

app.get("/today", (req: any, res: any) => {
    login(USERNAME, PASSWORD).then((loggedIn: boolean) => {
        if (loggedIn) {
            getPlantList().then((list) => {
                console.log('list', list);
                res.send(list.data[0].todayEnergy);
            });
        }
    });
});

app.get("/total", (req: any, res: any) => {
    login(USERNAME, PASSWORD).then((loggedIn: boolean) => {
        if (loggedIn) {
            getPlantList().then((list) => {
                console.log('list', list);
                res.send(list.data[0].totalEnergy);
            });
        }
    });
});

app.get("/", (req: any, res: any) => {
    let doStuff = () => {
        getPlantList().then((list) => {
            console.log('list', list);
            let plant = list.data[0];
            let currentPower = plant.currentPower;
            let totalEnergy = plant.totalEnergy;
            let todayEnergy = plant.todayEnergy;
            let date = (new Date()).toLocaleString('en-AU', { timeZone: 'Australia/Perth' });
            let pre = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Solar</title><style>div{width:100%;text-align:center;}.c{font-size:15em;}</style></head><body><div>'
            let current = `<span class="c">${currentPower.split(' ')[0]}<br />${currentPower.split(' ')[1]}</span></div>`;
            let today = `<div><span>${todayEnergy}</span> `;
            let total = `(<span>${totalEnergy}</span>)`;
            let dateDisplay = `<br /><span>${date}</span><br />washer/dryer < 1kW. dishwasher > 4kW</div>`;
            let post = '<script>setTimeout(function(){window.location.reload();},60000);</script></body></html>'
            res.send(pre+current+today+total+dateDisplay+post);
        }, () => { console.log('re-logging in'); login(USERNAME, PASSWORD).then(doStuff); });
    };
    if (!sessionLoggedIn) {
        login(USERNAME, PASSWORD).then(doStuff);
    } else {
        doStuff();
    }
    
});

app.get("/list", (req: any, res: any) => {
    login(USERNAME, PASSWORD).then((loggedIn: boolean) => {
        if (loggedIn) {
            getPlantList().then((list) => {
                console.log('list', list);
                res.send(list);
            });
        }
    });
});

app.get("/plant/:id", (req: any, res: any) => {
    login(USERNAME, PASSWORD).then((loggedIn: boolean) => {
        if (loggedIn) {
            getPlantDetail(req.params.id, TimeSpan.Day, new Date()).then((detail: PlantDetailResponse) => {
                console.log('detail', detail);
                res.send(detail);
            });
        }
    });
});

const serverInstance = app.listen(3000, function () {
    console.log("Listening on port %s...", serverInstance.address().port);
});
