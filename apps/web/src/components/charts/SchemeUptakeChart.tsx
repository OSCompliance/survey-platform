import './chartSetup';
import type { Ref } from 'react';
import { Bar } from 'react-chartjs-2';
import { SCHEMES } from '../../lib/constants';
import { SERIES, baseLegendOptions, baseScaleOptions, baseTooltipOptions } from '../../lib/chartTheme';

interface UptakeRow {
  religion: string;
  scheme: string;
  percentage: number;
}

interface Props {
  data: UptakeRow[];
  chartRef?: Ref<any>;
}

export function SchemeUptakeChart({ data, chartRef }: Props) {
  const muslim = SCHEMES.map((scheme) => data.find((d) => d.scheme === scheme && d.religion === 'Muslim')?.percentage ?? 0);
  const nonMuslim = SCHEMES.map((scheme) => {
    const rows = data.filter((d) => d.scheme === scheme && d.religion !== 'Muslim');
    if (!rows.length) return 0;
    return Math.round((rows.reduce((s, r) => s + r.percentage, 0) / rows.length) * 10) / 10;
  });

  return (
    <div style={{ position: 'relative', height: 280 }}>
      <Bar
        ref={chartRef}
        data={{
          labels: SCHEMES,
          datasets: [
            { label: 'Muslim households', data: muslim, backgroundColor: SERIES[1], borderRadius: 4, maxBarThickness: 28 },
            { label: 'Non-Muslim households', data: nonMuslim, backgroundColor: SERIES[2], borderRadius: 4, maxBarThickness: 28 },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', ...baseLegendOptions },
            tooltip: { ...baseTooltipOptions, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}%` } },
          },
          scales: {
            y: { beginAtZero: true, max: 100, ...baseScaleOptions, ticks: { ...baseScaleOptions.ticks, callback: (v) => `${v}%` } },
            x: { ...baseScaleOptions, grid: { display: false } },
          },
        }}
      />
    </div>
  );
}
