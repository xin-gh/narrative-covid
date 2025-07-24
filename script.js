const tryParseDate = d => {
  return d3.timeParse("%Y-%m-%d")(d) || d3.timeParse("%Y/%m/%d")(d);
};

Promise.all([
  d3.csv("data/covid_data.csv"),
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
]).then(([covidRaw, geoData]) => {
  covidRaw.forEach(d => {
    d.date = tryParseDate(d.date);
    d.total_cases = isNaN(+d.total_cases) ? 0 : +d.total_cases;
  });

  const globalMap = d3.rollup(
    covidRaw,
    v => d3.sum(v, d => d.total_cases),
    d => d.date
  );

  const globalData = Array.from(globalMap, ([date, total_cases]) => ({ date, total_cases }))
    .filter(d => d.date && !isNaN(d.total_cases) && d.total_cases > 0)
    .sort((a, b) => a.date - b.date);

  const margin = { top: 50, right: 50, bottom: 50, left: 80 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svgLine = d3.select("#vis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
    .domain(d3.extent(globalData, d => d.date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(globalData, d => d.total_cases)])
    .nice()
    .range([height, 0]);

  svgLine.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svgLine.append("g")
    .call(d3.axisLeft(y));

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.total_cases));

  svgLine.append("path")
    .datum(globalData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "6px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  const annotations = [
    { date: new Date("2020-03-11"), label: "WHO declares pandemic" },
    { date: new Date("2020-12-14"), label: "First vaccine rollout" },
    { date: new Date("2022-01-01"), label: "Omicron surge" },
    { date: new Date("2023-05-05"), label: "WHO ends global emergency" }
  ];

  annotations.forEach(a => {
    const closest = globalData.find(d => d3.timeFormat("%Y-%m-%d")(d.date) === d3.timeFormat("%Y-%m-%d")(a.date));
    if (closest) {
      svgLine.append("circle")
        .attr("cx", x(a.date))
        .attr("cy", y(closest.total_cases))
        .attr("r", 6)
        .attr("fill", "red")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .on("mouseover", (event) => {
          tooltip
            .html(`<strong>${d3.timeFormat("%B %d, %Y")(a.date)}</strong><br/>${a.label}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`)
            .style("opacity", 1);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });
    }
  });

  const mapWidth = 800;
  const mapHeight = 400;
  const projection = d3.geoNaturalEarth1().scale(140).translate([mapWidth / 2, mapHeight / 2]);
  const path = d3.geoPath().projection(projection);
  const svgMap = d3.select("#map")
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

  const drawMap = (selectedDate) => {
    const filteredData = covidRaw
      .filter(d => d.date && d3.timeFormat("%Y-%m-%d")(d.date) === selectedDate && d.total_cases > 0)
      .reduce((acc, d) => {
        acc[d.location] = d.total_cases;
        return acc;
      }, {});

    const color = d3.scaleSequentialLog()
      .domain([1, d3.max(Object.values(filteredData))])
      .interpolator(d3.interpolateReds);

    svgMap.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const name = d.properties.name;
        return filteredData[name] ? color(filteredData[name]) : "#ccc";
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 0.2)
      .on("click", (event, d) => {
        const name = d.properties.name;
        if (countryList.includes(name)) {
          d3.select("#countryDropdown").property("value", name).dispatch("change");
        }
      })
      .append("title")
      .text(d => {
        const name = d.properties.name;
        const value = filteredData[name];
        return value ? `${name}: ${d3.format(",")(value)} cases` : `${name}: No data`;
      });

    d3.select("#map-title").text(`2. Global Cases by Country (as of ${selectedDate})`);
  };

  const dateInput = document.getElementById("datePicker");
  dateInput.addEventListener("change", () => drawMap(dateInput.value));
  drawMap(dateInput.value);

  const countryList = Array.from(new Set(
    covidRaw.map(d => d.location).filter(loc =>
      geoData.features.map(f => f.properties.name).includes(loc)
    )
  )).sort();

  const dropdown = d3.select("#countryDropdown");
  dropdown.selectAll("option")
    .data(countryList)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  const svgTrend = d3.select("#countryTrend")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const drawCountryTrend = (countryName) => {
    const countryData = covidRaw
      .filter(d => d.location === countryName && d.total_cases > 0)
      .map(d => ({ date: d.date, total_cases: d.total_cases }))
      .sort((a, b) => a.date - b.date);

    svgTrend.selectAll("*").remove();

    const xC = d3.scaleTime()
      .domain(d3.extent(countryData, d => d.date))
      .range([0, width]);

    const yC = d3.scaleLinear()
      .domain([0, d3.max(countryData, d => d.total_cases)])
      .nice()
      .range([height, 0]);

    svgTrend.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xC));

    svgTrend.append("g")
      .call(d3.axisLeft(yC));

    const lineC = d3.line()
      .x(d => xC(d.date))
      .y(d => yC(d.total_cases));

    svgTrend.append("path")
      .datum(countryData)
      .attr("fill", "none")
      .attr("stroke", "indianred")
      .attr("stroke-width", 2)
      .attr("d", lineC);

    d3.select("#trend-title").text(`3. Confirmed Cases Trend in ${countryName}`);
  };

  dropdown.on("change", function () {
    const selected = d3.select(this).property("value");
    drawCountryTrend(selected);
  });

  drawCountryTrend(countryList[0]);
});