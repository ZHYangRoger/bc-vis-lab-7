let data;

async function loadData(url){
    let d = await d3.json(url, d3.autoType);
    return d;
}

async function main(){
    const url = "airports.json";
    data = await loadData(url);
    console.log(data);
}

main();