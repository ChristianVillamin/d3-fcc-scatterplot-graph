const dataURL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const svgWidth = 1000;
const svgHeight = 500;
const svgPadding = 60;
const svgPaddingTop = 90;

d3.select('#container')
  .style('width', `${svgWidth}px`)
  .style('height', `${svgHeight}px`);

d3.select('#title').style('left', `${svgWidth / 2}px`);

// SVG
const svg = d3
  .select('#container')
  .append('svg')
  .attr('class', 'svg-container')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// Dataset
d3.json(dataURL).then(dataset => visualize(dataset));

const visualize = dataset => {
  // X-AXIS
  const years = dataset.map(d => new Date(d.Year, 0));

  const yearsSorted = dataset
    .map(d => d.Year)
    .filter((x, i, s) => s.indexOf(x) === i)
    .sort((a, b) => a - b);

  const xScale = d3
    .scaleTime()
    .domain([
      new Date(yearsSorted[0] - 1, 0),
      new Date(yearsSorted[yearsSorted.length - 1] + 1, 0)
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

  const yScale = d3
    .scaleTime()
    .domain([d3.min(times), d3.max(times)])
    .range([svgPaddingTop, svgHeight - svgPadding]);

  const yAxis = d3
    .axisLeft()
    .scale(yScale)
    .tickFormat(d3.timeFormat('%M:%S'));

  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${svgPadding}, 0)`)
    .call(yAxis);

  // Tooltip
  const tooltip = d3.select('#tooltip');

  // CIRCLES
  svg
    .selectAll('circles')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('data-xvalue', d => d.Year)
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
        .style('visibility', 'visible');
    })
    .on('mouseout', () => {
      tooltip.style('visibility', 'hidden');
    });
};
