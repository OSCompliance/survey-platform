import './chartSetup';
import type { Ref } from 'react';
import { Bar } from 'react-chartjs-2';
import { SERIES, baseScaleOptions, baseTooltipOptions } from '../../lib/chartTheme';

interface GapRow {
  subCommunity: string;
  gapPp: number;
  sampleSize: number;
}

interface Props {
  data: GapRow[];
  chartRef?: Ref<any>;
}

// Diverging encoding (blue <-> red, per the dataviz skill's diverging pair):
// at/above the district average reads blue, below it reads red. This is a
// polarity job (sign of the gap), not a magnitude job, so a single sequential
// ramp would be the wrong tool here even though every bar happened to be
// negative in the original demo data.
export function GapChart({ data, chartRef }: Props) {
  return (
    <div style={{ position: 'relative', height: 280 }}>
      <Bar
        ref={chartRef}
        data={{
          labels: data.map((d) => d.subCommunity),
          datasets: [
            {
              label: 'Uptake gap vs. average (pp)',
              data: data.map((d) => d.gapPp),
              backgroundColor: data.map((d) => (d.gapPp >= 0 ? SERIES[1] : SERIES[8])),
              borderRadius: 4,
              maxBarThickness: 28,
            },
          ],
        }}
        options={{
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              ...baseTooltipOptions,
              callbacks: {
                label: (ctx) => {
                  const row = data[ctx.dataIndex];
                  return [`${ctx.formattedValue}pp vs. average`, `n = ${row.sampleSize}`];
                },
              },
            },
          },
          scales: {
            x: { ...baseScaleOptions, ticks: { ...baseScaleOptions.ticks, callback: (v) => `${v}pp` } },
            y: { ...baseScaleOptions, grid: { display: false } },
          },
        }}
      />
    </div>
  );
}
