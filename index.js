d3.json(
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
).then(dataset => {
  const svgWidth = 1000;
  const svgHeight = 500;
  const svgPadding = 60;
  const svgPaddingTop = 90;

  const container = d3
    .select('body')
    .append('div')
    .attr('id', 'container')
    .style('position', 'absolute')
    .style('top', '50%')
    .style('left', '50%')
    .style('transform', 'translate(-50%, -50%)')
    .style('width', `${svgWidth}px`)
    .style('height', `${svgHeight}px`)
    .style('box-shadow', '0 0 5px gray')
    .style('background-color', 'white');

  const title = d3
    .select('#container')
    .append('h1')
    .attr('id', 'title')
    .text('Doping in Professional Bicycle Racing')
    .style('position', 'absolute')
    .style('top', '25px')
    .style('left', `${svgWidth / 2}px`)
    .style('transform', 'translate(-50%, -50%)')
    .style('width', '100%')
    .style('text-align', 'center');

  const svg = d3
    .select('#container')
    .append('svg')
    .attr('class', 'svg-container')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .style('background-color', 'white');

  // X-AXIS
  const years = dataset.map(d => new Date(d.Year, 0));

  const years2 = dataset
    .map(d => d.Year)
    .filter((x, i, s) => s.indexOf(x) === i)
    .sort((a, b) => a - b);

  const xScale = d3
    .scaleTime()
    // .domain([d3.min(years), d3.max(years)])
    .domain([
      new Date(years2[0] - 1, 0),
      new Date(years2[years2.length - 1] + 1, 0)
    ])
    .range([svgPadding, svgWidth - svgPadding]);

  const xAxis = d3.axisBottom().scale(xScale);

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${svgHeight - svgPadding})`)
    .call(xAxis);

  // Y-AXIS
  const times = dataset.map(d => {
    const split = d.Time.split(':');
    const theDate = new Date();
    theDate.setMinutes(split[0]);
    theDate.setSeconds(split[1]);
    return theDate;
  });

  const timeFormat = d3.timeFormat('%M:%S');

  const yScale = d3
    .scaleTime()
    .domain([d3.min(times), d3.max(times)])
    .range([svgPaddingTop, svgHeight - svgPadding]);

  const yAxis = d3
    .axisLeft()
    .scale(yScale)
    .tickFormat(timeFormat);

  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${svgPadding}, 0)`)
    .call(yAxis);

  // Tooltip
  const tooltip = d3
    .select('#container')
    .append('p')
    .html('')
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('transform', 'translate(-50%, -50%)')
    .style('pointer-events', 'none');

  // Legend
  const legend = d3
    .select('#container')
    .append('p')
    .html(
      `<span class="green">No doping allegation</span>
       <span class="red">With doping allegation</span>`
    )
    .attr('id', 'legend')
    .style('position', 'absolute')
    .style('top', '60px')
    .style('left', '50%')
    .style('transform', 'translate(-50%, -50%)')
    .style('pointer-events', 'none');

  // CIRCLES
  svg
    .selectAll('circles')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('data-xvalue', d => d.Year)
    // .attr('data-yvalue', d => d.Time)
    .attr('data-yvalue', (d, i) => times[i])
    .attr('cx', (d, i) => xScale(years[i]))
    .attr('cy', (d, i) => yScale(times[i]))
    .attr('r', '8px')
    .attr('fill', d => (d.Doping === '' ? 'green' : 'red'))
    .on('mouseover', (d, i) => {
      tooltip
        .html(
          `${d.Name}: ${d.Nationality}
          <br/>Year: ${d.Year}, Time: ${d.Time}
          <br/>${d.Doping}`
        )
        .attr('data-year', d.Year)
        .style('top', `${yScale(times[i]) - 40}px`)
        .style('left', `${xScale(years[i])}px`)
        .style('opacity', 1);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });
});
