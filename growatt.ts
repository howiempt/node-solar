const rr = require('request').defaults({jar: true});
const request = require('request-promise').defaults({jar: true});
const md5 = require('md5');

const server: string = 'https://server.growatt.com/';

export enum TimeSpan {
    Day = 1,
    Month = 2,
    Year = 3,
    Total = 4
}

export function formatDate(date: Date, timespan: TimeSpan): string {
    let opts = new Intl.DateTimeFormat();
    switch (timespan) {
        case TimeSpan.Day:
            return date.getFullYear() + '-' + ('0'+(date.getMonth()+1)).slice(-2) + '-' + ('0'+(date.getDate())).slice(-2);
            break;
        case TimeSpan.Month:
            return date.getFullYear() + '-' + ('0'+(date.getMonth()+1)).slice(-2);
            break;
        case TimeSpan.Year:
            return date.getFullYear() + '';
            break;
        default:
            return '';
            break;
    }
}

export interface LoginResponse {
    userId: number;
    userLevel: number;
    success: boolean;
}

export interface PlantData {
    plantMoneyText: string;
    plantName: string;
    plantId: number;
    isHaveStorage: boolean;
    todayEnergy: string;
    totalEnergy: string;
    currentPower: string;
}
export interface TotalData {
    currentPowerSum: string;
    CO2Sum: string;
    isHaveStorage: boolean;
    eTotalMoneyText: string;
    todayEnergySum: string;
    totalEnergySum: string;
}
export interface PlantListResponse {
    data: PlantData[];
    totalData: TotalData;
}
export interface PlantDetail {
    plantMoneyText: string;
    plantName: string;
    plantId: number;
    currentEnergy: string;
}
export interface PlantDetailData {
    [key: string]: number;
}
export interface PlantDetailResponse {
    plantData: PlantDetail;
    data: PlantDetailData;
}

export function login(username: string, password: string): Promise<boolean> {
    let passwordHash = md5(password) as string;
    for(let i = 0; i < passwordHash.length; i = i + 2) {
        if (passwordHash[i] === '0') {
            passwordHash = passwordHash.substring(0, i) + 'c' + passwordHash.substring(i + 1);
        }
    }
    
    return request.post({ url: `${server}LoginAPI.do`, form: { 'userName': username, 'password': passwordHash }, jar: true }).then((body: any) => {
        console.log('body', body);
        let data = JSON.parse(body).back;
        return data && data.success;
    });

}

export function getPlantList(): Promise<PlantListResponse> {
    let plantListUrl = `${server}PlantListAPI.do`;
    return request.get(plantListUrl).then((body: any) => { 
       try { 
           return JSON.parse(body).back as PlantListResponse;
       } catch(e) {
           console.log('e', e, body);
        }
       return null;
    }, (reason: any) => {console.log('error', reason);});
}

export function getPlantDetail(plantId: number, timespan: TimeSpan, date: Date): Promise<PlantDetailResponse> {
    let plantDetailUrl = `${server}PlantDetailAPI.do`;
    const dateStr = formatDate(date, timespan);
    const p = { plantId: plantId, type: 0+timespan, date: dateStr };
    return request.get({ url: plantDetailUrl, qs: p }).then((body: any) => {
        return JSON.parse(body).back as PlantDetailResponse;
    });
}
