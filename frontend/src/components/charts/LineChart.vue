<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'LineChart',
  props: {
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    let chart = null

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }

    const initChart = () => {
      if (chart) {
        chart.destroy()
      }

      const ctx = chartCanvas.value.getContext('2d')
      chart = new Chart(ctx, {
        type: 'line',
        data: props.data,
        options: {
          ...defaultOptions,
          ...props.options
        }
      })
    }

    watch(() => props.data, () => {
      initChart()
    }, { deep: true })

    onMounted(() => {
      initChart()
    })

    return {
      chartCanvas
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style> 