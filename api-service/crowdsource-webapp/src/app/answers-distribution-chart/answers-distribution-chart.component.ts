import { AfterViewInit, Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, ParamMap, Router } from '@angular/router';
import {
  AnswerSummary,
  CrowdsourceApiService,
} from '../crowdsource-api.service';
import { RelativeToxicityAnswer, ToxicityOption } from '../relative-toxicity-job/relative-toxicity-job.component';
import * as d3 from 'd3';

interface QuestionsToAnswersMap {
  [questionId: string]: AnswerSummary<RelativeToxicityAnswer>[];
}

const TOXICITY_OPTION_MAP = {};
TOXICITY_OPTION_MAP[ToxicityOption.MUCH_MORE_TOXIC] = 0;
TOXICITY_OPTION_MAP[ToxicityOption.MORE_TOXIC] = 1;
TOXICITY_OPTION_MAP[ToxicityOption.SLIGHTLY_MORE_TOXIC] = 2;
TOXICITY_OPTION_MAP[ToxicityOption.ABOUT_THE_SAME] = 3;
TOXICITY_OPTION_MAP[ToxicityOption.SLIGHTLY_LESS_TOXIC] = 4;
TOXICITY_OPTION_MAP[ToxicityOption.LESS_TOXIC] = 5;
TOXICITY_OPTION_MAP[ToxicityOption.MUCH_LESS_TOXIC] = 6;

const BAR_COLORS_MAP = {};
BAR_COLORS_MAP[ToxicityOption.MUCH_MORE_TOXIC] = '#B71C1C';
BAR_COLORS_MAP[ToxicityOption.MORE_TOXIC] = '#D32F2F';
BAR_COLORS_MAP[ToxicityOption.SLIGHTLY_MORE_TOXIC] = '#EF5350';
BAR_COLORS_MAP[ToxicityOption.ABOUT_THE_SAME] = '#FBC02D';
BAR_COLORS_MAP[ToxicityOption.SLIGHTLY_LESS_TOXIC] = '#43A047';
BAR_COLORS_MAP[ToxicityOption.LESS_TOXIC] = '#388E3C';
BAR_COLORS_MAP[ToxicityOption.MUCH_LESS_TOXIC] = '#2E7D32';

/** Describes a bar in the graph. */
interface ToxicityOptionSummary {
  bucketName: ToxicityOption;
  count: number;
}

/**
 */
@Component({
  selector: 'app-answers-distribution-chart',
  templateUrl: './answers-distribution-chart.component.html',
  styleUrls: ['./answers-distribution-chart.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AnswersDistributionChartComponent implements AfterViewInit {
  @Input() answers: AnswerSummary<RelativeToxicityAnswer>[] = [];
  @ViewChild('chart') chart: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private crowdSourceApiService: CrowdsourceApiService) { }

  ngAfterViewInit(): void {
    this.renderGraph();
  }

  getGraphData(): ToxicityOptionSummary[] {
    const toxicityKeys = Object.keys(TOXICITY_OPTION_MAP);
    const bucketCount = toxicityKeys.length;
    const data = [];
    for (let i = 0; i < bucketCount; i++) {
      data[i] = {bucketName: toxicityKeys[i], count: 0};
    }
    this.answers.forEach((d: AnswerSummary<RelativeToxicityAnswer>) => {
      data[TOXICITY_OPTION_MAP[d.answer.toxicityOption]].count += 1;
    });
    return data;
  }

  renderGraph() {
    const margin = {top: 20, right: 20, bottom: 120, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const x = d3.scaleBand().rangeRound([0, width]).padding(.05);
    const y = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(x);

    const data = this.getGraphData();
    // Sets the ToxicityOptions as the domain of the x axis.
    x.domain(data.map((d) => d.bucketName));
    y.domain([0, d3.max(data, (d) =>  d.count )]);

    const svg = d3.select(this.chart.nativeElement).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform',
              'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.1em')
        .attr('transform', 'rotate(-60)' );

    svg.selectAll('bar')
      .data(data)
    .enter().append('rect')
      .style('fill', (d) => BAR_COLORS_MAP[d.bucketName])
      .attr('x', (d) => x(d.bucketName))
      .attr('width', x.bandwidth())
      .attr('y', (d) => y(d.count))
      .attr('height', (d) => height - y(d.count));

    // Adds labels to the bars
    svg.selectAll('.text')
      .data(data)
    .enter().append('text')
      .attr('class', 'label')
      .attr('x', (d) => x(d.bucketName) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.count) + 10)
      .attr('dy', '.75em')
      .text((d) => d.count > 0 ? d.count : '');

  }
}
