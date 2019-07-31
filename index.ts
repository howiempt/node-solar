import { PlantListResponse, getPlantList, login, getPlantDetail, TimeSpan, PlantDetailResponse, PlantData } from "./growatt";

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

function getDataClean<T extends PlantListResponse, K extends keyof PlantData>(resp: T, prop: K): string {
    return (resp && resp.data && resp.data.length > 0 && resp.data[0]) ? resp.data[0][prop].toString() : '';
}

app.get("/current", (req: any, res: any) => {
    login(USERNAME, PASSWORD).then((loggedIn: boolean) => {
        if (loggedIn) {
            getPlantList().then((list) => {
                console.log('list', list);
                res.send(getDataClean(list, 'currentPower'));
            });
        }
    });
});

app.get("/today", (req: any, res: any) => {
    login(USERNAME, PASSWORD).then((loggedIn: boolean) => {
        if (loggedIn) {
            getPlantList().then((list) => {
                console.log('list', list);
                res.send(getDataClean(list, 'todayEnergy'));
            });
        }
    });
});

app.get("/total", (req: any, res: any) => {
    login(USERNAME, PASSWORD).then((loggedIn: boolean) => {
        if (loggedIn) {
            getPlantList().then((list) => {
                console.log('list', list);
                res.send(getDataClean(list, 'totalEnergy'));
            });
        }
    });
});

app.get("/", (req: any, res: any) => {
    let doStuff = () => {
        getPlantList().then((list) => {
            console.log('list-1', list);
            let pre = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Solar</title><style>body{margin:0;padding:0;}#b{width:100%;min-height:706px;background-color:white;text-align:center;vertical-align:middle;}.current{font-size:15em;}.total{font-size:3em;}</style></head><body><div id="b">'
            let date = (new Date()).toLocaleString('en-AU', { timeZone: 'Australia/Perth' });
            let dateDisplay = `<br /><span class="today" id="date">${date}</span></div>`;
            let post = '<script>setTimeout(function(){window.location.reload(1);},90000);</script></body></html>'
            let quickPost = '<script>setTimeout(function(){window.location.reload(1);},30000);</script></body></html>';
            let plant = list && list.data && list.data[0];
            if (plant) {
                let currentPower = plant.currentPower;
                let totalEnergy = plant.totalEnergy;
                let todayEnergy = plant.todayEnergy;
                let current = `<span class="current" id="current">${currentPower.split(' ')[0]}<br />${currentPower.split(' ')[1]}</span><br />`;
                let today = `<span class="today" id="today">${todayEnergy}</span> `;
                let total = `(<span class="today" id="total">${totalEnergy}</span>)`;
            res.send(pre+current+today+total+dateDisplay+post);
            } else { 
                res.send(pre+'<span class="today" id="today">Error</span>'+dateDisplay+quickPost);
                login(USERNAME, PASSWORD);
            }
        });
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
