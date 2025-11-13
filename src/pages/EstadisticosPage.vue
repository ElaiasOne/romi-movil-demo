<template>
    <ion-page>
        <!-- Header dentro de la página -->
    <ion-header>
      <Toolbar />
    </ion-header>
      <ion-content class="ion-padding">
        <h2 class="title">Estadísticos</h2>
  
        <!-- KPIs -->
        <div class="kpi-grid">
          <ion-card class="kpi">
            <ion-card-header>
              <div class="kpi-label">Ingresos del mes</div>
              <div class="kpi-value">${{ formatMoney(kpis.ingresosMes) }}</div>
            </ion-card-header>
            <ion-card-content class="kpi-sub">vs mes anterior: {{ kpis.deltaMes }}%</ion-card-content>
          </ion-card>
  
          <ion-card class="kpi">
            <ion-card-header>
              <div class="kpi-label">Tickets</div>
              <div class="kpi-value">{{ kpis.ticketsMes }}</div>
            </ion-card-header>
            <ion-card-content class="kpi-sub">Ticket promedio: ${{ formatMoney(kpis.ticketPromedio) }}</ion-card-content>
          </ion-card>
  
          <ion-card class="kpi">
            <ion-card-header>
              <div class="kpi-label">Clientes activos</div>
              <div class="kpi-value">{{ kpis.clientesActivos }}</div>
            </ion-card-header>
            <ion-card-content class="kpi-sub">Total clientes: {{ kpis.clientesTotal }}</ion-card-content>
          </ion-card>
  
          <ion-card class="kpi">
            <ion-card-header>
              <div class="kpi-label">Artículos activos</div>
              <div class="kpi-value">{{ kpis.articulosActivos }}</div>
            </ion-card-header>
            <ion-card-content class="kpi-sub">Total artículos: {{ kpis.articulosTotal }}</ion-card-content>
          </ion-card>
        </div>
  
        <!-- Chart -->
        <ion-card class="chart-card">
          <ion-card-header>
            <div class="chart-title">Ventas por mes (últimos 6)</div>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-wrap">
              <svg :viewBox="`0 0 ${vw} ${vh}`" class="chart">
                <!-- Ejes -->
                <line :x1="pad" :y1="pad" :x2="pad" :y2="vh-pad" class="axis"/>
                <line :x1="pad" :y1="vh-pad" :x2="vw-pad" :y2="vh-pad" class="axis"/>
  
                <!-- Líneas horizontales -->
                <g v-for="(g,i) in 4" :key="'gl'+i">
                  <line
                    :x1="pad"
                    :x2="vw-pad"
                    :y1="gridY(i)"
                    :y2="gridY(i)"
                    class="grid"
                  />
                  <text :x="pad-6" :y="gridY(i)+4" class="grid-label" text-anchor="end">
                    ${{ formatMoney((maxY*(4-i)/4)) }}
                  </text>
                </g>
  
                <!-- Barras -->
                <g v-for="(m,i) in series" :key="m.mes">
                  <rect
                    :x="barX(i)"
                    :y="barY(m.monto)"
                    :width="barW"
                    :height="barH(m.monto)"
                    class="bar"
                    rx="4" ry="4"
                  />
                  <text :x="barX(i)+barW/2" :y="vh-pad+14" class="tick" text-anchor="middle">{{ shortMonth(m.mes) }}</text>
                  <text :x="barX(i)+barW/2" :y="barY(m.monto)-6" class="bar-label" text-anchor="middle">
                    ${{ formatMoney(m.monto) }}
                  </text>
                </g>
              </svg>
            </div>
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardContent
  } from '@ionic/vue'
  
  type VentaMes = { mes: string; monto: number; tickets: number }
  
  const KEY_VENTAS = 'romi_ventas_mensuales'
  const KEY_ART = 'romi_articulos'
  const KEY_CLI = 'romi_clientes'
  
  const now = new Date()
  const serie = ref<VentaMes[]>([])
  
  function monthKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  }
  function lastNMonths(n=6) {
    const arr: string[] = []
    const base = new Date(now)
    base.setDate(1)
    for (let i=n-1; i>=0; i--) {
      const d = new Date(base)
      d.setMonth(base.getMonth() - i)
      arr.push(monthKey(d))
    }
    return arr
  }
  
  // Demo: si no hay ventas guardadas, generamos una serie consistente
  function seedVentas() {
    const raw = localStorage.getItem(KEY_VENTAS)
    if (raw) return
    const months = lastNMonths(6)
    const seeded = months.map((m, idx) => {
      const base = 800000 + idx*50000 // curva ascendente
      const jitter = Math.round((Math.random()-0.5)*100000)
      const monto = Math.max(250000, base + jitter)
      const tickets = Math.round(monto / (20000 + Math.random()*15000))
      return { mes: m, monto, tickets }
    })
    localStorage.setItem(KEY_VENTAS, JSON.stringify(seeded))
  }
  
  function loadVentas() {
    const raw = localStorage.getItem(KEY_VENTAS)
    serie.value = raw ? JSON.parse(raw) : []
  }
  
  const kpis = computed(() => {
    const arr = serie.value
    const mm = arr[arr.length-1] || { monto:0, tickets:0 }
    const prev = arr[arr.length-2] || { monto:0, tickets:0 }
    const deltaMes = prev.monto ? (((mm.monto - prev.monto)/prev.monto)*100).toFixed(1) : '0.0'
    const ticketPromedio = mm.tickets ? (mm.monto/mm.tickets) : 0
  
    const arts = JSON.parse(localStorage.getItem(KEY_ART)||'[]')
    const clis = JSON.parse(localStorage.getItem(KEY_CLI)||'[]')
  
    return {
      ingresosMes: mm.monto,
      ticketsMes: mm.tickets,
      ticketPromedio,
      deltaMes,
      articulosTotal: arts.length,
      articulosActivos: arts.filter((a:any)=>a.activo).length,
      clientesTotal: clis.length,
      clientesActivos: clis.filter((c:any)=>c.activo).length,
    }
  })
  
  // —— SVG chart helpers
  const vw = 680, vh = 300
  const pad = 42
  const barGap = 16
  const n = 6
  const barW = computed(() => {
    const w = vw - pad*2
    return (w - barGap*(n-1)) / n
  })
  const maxY = computed(() => {
    const max = Math.max(...serie.value.map(s=>s.monto), 1)
    // redondear hacia arriba a múltiplos “lindos”
    const pow = Math.pow(10, String(Math.floor(max)).length-2)
    return Math.ceil(max / pow) * pow
  })
  function yScale(val:number) {
    const h = vh - pad*2
    return vh - pad - (val / maxY.value) * h
  }
  function barX(i:number){ return pad + i*(barW.value + barGap) }
  function barY(v:number){ return yScale(v) }
  function barH(v:number){ return (vh - pad) - yScale(v) }
  function gridY(i:number){ // 0..3
    const h = vh - pad*2
    return pad + (i*(h/4))
  }
  function shortMonth(mkey:string){
    const [y,m] = mkey.split('-').map(Number)
    const d = new Date(y, m-1, 1)
    return d.toLocaleString('es-AR', { month:'short' })
  }
  function formatMoney(v:number){ return v.toLocaleString('es-AR', { maximumFractionDigits: 0 }) }
  
  const series = computed(()=> serie.value)
  
  onMounted(()=>{
    seedVentas()
    loadVentas()
  })
  </script>
  
  <style scoped>
  .title { margin: 0 0 12px; font-weight: 800; }
  
  /* KPIs */
  .kpi-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
  @media (min-width: 920px) {
    .kpi-grid { grid-template-columns: repeat(4, 1fr); }
  }
  .kpi { border-radius: 16px; }
  .kpi-label { font-size: 12px; color: rgba(0,0,0,.6); }
  .kpi-value { font-size: 22px; font-weight: 800; }
  .kpi-sub { color: rgba(0,0,0,.6); }
  
  /* Chart */
  .chart-card { border-radius: 16px; margin-top: 12px; }
  .chart-title { font-weight: 700; }
  .chart-wrap { width: 100%; overflow-x: auto; }
  .chart { width: 100%; min-width: 640px; height: auto; display: block; }
  
  .axis { stroke: rgba(0,0,0,.25); stroke-width: 1; }
  .grid { stroke: rgba(0,0,0,.08); stroke-width: 1; }
  .grid-label { font-size: 10px; fill: rgba(0,0,0,.6); }
  .tick { font-size: 11px; fill: rgba(0,0,0,.8); }
  .bar { fill: var(--ion-color-primary); opacity: .85; }
  .bar-label { font-size: 10px; fill: rgba(0,0,0,.8); }
  </style>
  