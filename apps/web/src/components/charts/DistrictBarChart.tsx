import './chartSetup';
import type { Ref } from 'react';
import { Bar } from 'react-chartjs-2';
import { SERIES, baseScaleOptions, baseTooltipOptions } from '../../lib/chartTheme';

interface Props {
  data: { district: string; count: number }[];
  chartRef?: Ref<any>;
}

export function DistrictBarChart({ data, chartRef }: Props) {
  return (
    <div style={{ position: 'relative', height: 260 }}>
      <Bar
        ref={chartRef}
        data={{
          labels: data.map((d) => d.district),
          datasets: [
            {
              label: 'Households',
              data: data.map((d) => d.count),
              backgroundColor: SERIES[1],
              borderRadius: 4,
              maxBarThickness: 40,
              categoryPercentage: 0.6,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: baseTooltipOptions,
          },
          scales: {
            y: { beginAtZero: true, ...baseScaleOptions },
            x: { ...baseScaleOptions, grid: { display: false } },
          },
        }}
      />
    </div>
  );
}
