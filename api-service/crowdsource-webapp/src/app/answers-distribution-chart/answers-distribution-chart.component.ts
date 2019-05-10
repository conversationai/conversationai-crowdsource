import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
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

const TOXICITY_OPTION_MAP = {
};
TOXICITY_OPTION_MAP[ToxicityOption.MUCH_MORE_TOXIC] = 0;
TOXICITY_OPTION_MAP[ToxicityOption.MORE_TOXIC] = 1;
TOXICITY_OPTION_MAP[ToxicityOption.SLIGHTLY_MORE_TOXIC] = 2;
TOXICITY_OPTION_MAP[ToxicityOption.ABOUT_THE_SAME] = 3;
TOXICITY_OPTION_MAP[ToxicityOption.SLIGHTLY_LESS_TOXIC] = 4;
TOXICITY_OPTION_MAP[ToxicityOption.LESS_TOXIC] = 5;
TOXICITY_OPTION_MAP[ToxicityOption.MUCH_LESS_TOXIC] = 6;

/**
 */
@Component({
  selector: 'app-answers-distribution-chart',
  templateUrl: './answers-distribution-chart.component.html',
  styleUrls: ['./answers-distribution-chart.component.css'],
})
export class AnswersDistributionChartComponent implements AfterViewInit {
  @Input() answers: AnswerSummary<RelativeToxicityAnswer>[] = [];
  @ViewChild('chart') chart: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private crowdSourceApiService: CrowdsourceApiService) { }

  ngAfterViewInit(): void {
    console.log('AfterViewInit in graph component');
    this.renderGraph();
  }

  renderGraph() {
    let margin = {top: 20, right: 20, bottom: 70, left: 40},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;


    let x = d3.scaleBand().rangeRound([0, width]).padding(.05);
    //let x = d3.scaleOrdinal().rangeRoundBands([0, width], .05);

    let y = d3.scaleLinear().range([height, 0]);

    let xAxis = d3.axisBottom(x);

    let yAxis = d3.axisLeft(y)
        .ticks(10);

    let svg = d3.select(this.chart.nativeElement).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");


    const toxicityKeys = Object.keys(TOXICITY_OPTION_MAP);
    const bucketCount = toxicityKeys.length;
    const data = [];
    for (let i = 0; i < bucketCount; i++) {
      data[i] = {bucketName: toxicityKeys[i], count: 0};
    }
    console.log(data);
    this.answers.forEach((d: AnswerSummary<RelativeToxicityAnswer>) => {
      data[TOXICITY_OPTION_MAP[d.answer.toxicityOption]].count += 1;
    });

    console.log(data);

    x.domain(data.map(function(d) {
      return d.bucketName;
    }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value ($)");

    svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function(d) { return x(d.bucketName); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.count); })
      .attr("height", function(d) {
        return height - y(d.count);
      });

  }
}
