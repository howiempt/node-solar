# node-solar :partly_sunny:
node express app reporting growatt solar power values

hastily ported from [https://github.com/Sjord/growatt_api_client](https://github.com/Sjord/growatt_api_client) :sunglasses:

# endpoints:
```
<url>/
```
returns a dummy page used to display current kW, daily total kWh and system total kWh (and a small note for my appliance demands!). this will refresh every minute and is optimised for display on a kindle keyboard (kindle 3?) experimental browser.

```
<url>/current
```
returns current value only (eg. 3.12 kW, 158 W)

```
<url>/today
```
returns today total value only (eg. 6.12 kWh)

```
<url>/total
```
returns total value only (eg. 3.12 mWh)

```
<url>/list
```
returns raw json data for the list of plants


```
<url>/plant/:id
```
returns detailed 30min values for the day for given plant

# building and using

to run locally:
```
npm start
```

my docker run script (stop, kill, build, run):
```
docker stop solar
docker rm solar
docker build -t node-solar ./solar
docker run -dit -p 88:3000 --env-file ./env.list --restart unless-stopped --name solar node-solar
```

example env.list (required, login for your growatt account):
```
NODE_SOLAR_USERNAME=username
NODE_SOLAR_PASSWORD=password
```