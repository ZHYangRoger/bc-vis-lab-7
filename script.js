let data;

async function loadData(url){
    let d = await d3.json(url, d3.autoType);
    return d;
}

async function main(){
    //load data
    const url = "airports.json";
    data = await loadData(url);
    console.log(data);

    //placeholder
    let margin = {top: 20, right: 10, bottom: 20, left: 45};
    const width = 650 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const svg = d3.select("force-chart")
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    
}

main();