<template>
    <ion-page>
      <!-- Header dentro de la página -->
    <ion-header>
      <Toolbar />
    </ion-header>
      <ion-content class="ion-padding">
        <div class="header-row">
          <h2 class="title">Ventas</h2>
          <ion-searchbar v-model="q" debounce="250" placeholder="Buscar por cliente o nro..." class="search"/>
        </div>
  
        <ion-segment v-model="filtro" value="todas" class="segment">
          <ion-segment-button value="todas"><ion-label>Todas</ion-label></ion-segment-button>
          <ion-segment-button value="pendientes"><ion-label>Con cuotas</ion-label></ion-segment-button>
          <ion-segment-button value="canceladas"><ion-label>Canceladas</ion-label></ion-segment-button>
        </ion-segment>
  
        <div class="kpi-row">
          <ion-chip outline color="primary"><strong>{{ filtradas.length }}</strong>&nbsp; ventas</ion-chip>
          <ion-chip outline color="success">Saldo pendiente: <strong>${{ money(totalSaldoPendiente) }}</strong></ion-chip>
        </div>
  
        <div class="grid" v-if="!loading">
          <ion-card v-for="v in filtradas" :key="v.id" class="card" :class="statusClass(v)">
            <ion-card-header>
              <div class="top">
                <div class="left">
                  <strong>#{{ v.nro }}</strong>
                  <ion-badge :color="v.tipoPago==='contado' ? 'success' : (restantes(v)===0 ? 'medium' : 'warning')">
                    {{ v.tipoPago==='contado' ? 'Contado' : labelCuotas(v) }}
                  </ion-badge>
                </div>
                <small class="muted">{{ fmtDate(v.fecha) }}</small>
              </div>
              <div class="cliente">
                <ion-icon name="people-outline" />
                <span>{{ nombreCliente(v.clienteId) }}</span>
              </div>
            </ion-card-header>
  
            <ion-card-content>
              <div class="row">
                <div class="col">
                  <span class="label">Total</span>
                  <div class="value">${{ money(v.total) }}</div>
                </div>
                <div class="col" v-if="v.tipoPago==='cuotas'">
                  <span class="label">Pagadas</span>
                  <div class="value">{{ v.pagadas }}/{{ v.cuotas }}</div>
                </div>
                <div class="col" v-if="v.tipoPago==='cuotas'">
                  <span class="label">Saldo</span>
                  <div class="value">${{ money(saldo(v)) }}</div>
                </div>
              </div>
  
              <div class="actions">
                <ion-button size="small" @click="goEdit(v.id)">Ver/Editar</ion-button>
                <ion-button v-if="v.tipoPago==='cuotas' && restantes(v)>0" size="small" color="success" @click="registrarPago(v)">
                  Registrar pago
                </ion-button>
                <ion-button size="small" fill="clear" color="danger" @click="remove(v.id)">Eliminar</ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
  
        <div v-if="!loading && filtradas.length===0" class="empty">
          <ion-icon name="receipt-outline" class="empty-icon" />
          <p>Sin ventas para el filtro actual.</p>
          <ion-button @click="goNew">Nueva venta</ion-button>
        </div>
  
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button @click="goNew"><ion-icon name="add" /></ion-fab-button>
        </ion-fab>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
  IonCard, IonCardHeader, IonCardContent, IonBadge, IonButton, IonChip,
  IonFab, IonFabButton, IonIcon,
  // 👇 IMPORTANTE: hook de Ionic
  onIonViewDidEnter
} from '@ionic/vue'

type Venta = {
  id: string
  nro: number
  clienteId: string
  fecha: string
  total: number
  tipoPago: 'contado' | 'cuotas'
  cuotas?: number
  pagadas?: number
  detalle?: Array<{ articuloId: string; descripcion: string; cantidad: number; precio: number }>
}

const KEY_V = 'romi_ventas'
const KEY_C = 'romi_clientes'
const getVentas = ():Venta[] => JSON.parse(localStorage.getItem(KEY_V) || '[]')
const setVentas = (arr:Venta[]) => localStorage.setItem(KEY_V, JSON.stringify(arr))
const getClientes = () => JSON.parse(localStorage.getItem(KEY_C) || '[]')
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

const router = useRouter()
const loading = ref(true)
const list = ref<Venta[]>([])
const q = ref('')
const filtro = ref<'todas'|'pendientes'|'canceladas'>('todas')

function seedIfEmpty(){
  if (getVentas().length===0){
    const c = getClientes()
    const clienteId = c[0]?.id || 'demo'
    const baseNro = 1000 + Math.floor(Math.random()*100)
    const seed:Venta[] = [
      { id: uuid(), nro: baseNro,   clienteId, fecha: new Date().toISOString(), total: 120000, tipoPago:'contado' },
      { id: uuid(), nro: baseNro+1, clienteId, fecha: new Date().toISOString(), total: 240000, tipoPago:'cuotas', cuotas: 6, pagadas: 2 },
      { id: uuid(), nro: baseNro+2, clienteId, fecha: new Date().toISOString(), total:  80000, tipoPago:'cuotas', cuotas: 3, pagadas: 3 },
    ]
    setVentas(seed)
  }
}

function load(){
  list.value = getVentas()
}

function restantes(v:Venta){ return (v.cuotas||0) - (v.pagadas||0) }
function saldo(v:Venta){
  if (v.tipoPago==='contado') return 0
  const cuota = (v.total / (v.cuotas||1))
  const s = Math.max(0, Math.round((v.cuotas!- (v.pagadas||0)) * cuota))
  return s
}
function money(n:number){ return n.toLocaleString('es-AR',{maximumFractionDigits:0}) }
function fmtDate(iso:string){ return new Date(iso).toLocaleDateString('es-AR') }
function nombreCliente(id:string){
  const c = getClientes().find((x:any)=>x.id===id)
  return c ? c.nombre : 'Cliente'
}
function labelCuotas(v:Venta){
  const r = restantes(v)
  return r===0 ? 'Cancelada' : `${v.pagadas||0}/${v.cuotas} cuotas`
}
function statusClass(v:Venta){
  if (v.tipoPago==='contado') return 'card-ok'
  if (restantes(v)===0) return 'card-ok'
  return 'card-pend'
}

const filtradas = computed(()=>{
  const term = q.value.trim().toLowerCase()
  let arr = list.value.filter(v=>{
    const cliente = nombreCliente(v.clienteId).toLowerCase()
    const match = term==='' || cliente.includes(term) || String(v.nro).includes(term)
    return match
  })
  if (filtro.value==='pendientes') arr = arr.filter(v => v.tipoPago==='cuotas' && restantes(v)>0)
  if (filtro.value==='canceladas') arr = arr.filter(v => (v.tipoPago==='contado') || (v.tipoPago==='cuotas' && restantes(v)===0))
  return arr.sort((a,b)=> new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
})

const totalSaldoPendiente = computed(()=> filtradas.value.reduce((acc,v)=> acc + saldo(v), 0))

function goNew(){ router.push('/app/venta/new') }
function goEdit(id:string){ router.push(`/app/venta/${id}`) }
function remove(id:string){
  if (!confirm('¿Eliminar venta?')) return
  setVentas(getVentas().filter(v=>v.id!==id))
  load()
}
function registrarPago(v:Venta){
  const arr = getVentas()
  const i = arr.findIndex(x=>x.id===v.id)
  if (i>-1 && arr[i].tipoPago==='cuotas'){
    const pag = Math.min((arr[i].pagadas||0) + 1, arr[i].cuotas||1)
    arr[i].pagadas = pag
    setVentas(arr)
    load()
  }
}

// Primera carga
onMounted(()=>{
  seedIfEmpty()
  load()
  setTimeout(()=> loading.value=false, 300)
})

// Cada vez que volvés a la vista de Ventas
onIonViewDidEnter(() => {
  load()
})
</script>

  
  <style scoped>
  .title { margin: 0 0 6px; font-weight: 800; }
  .header-row { display:grid; grid-template-columns: 1fr; gap:8px; }
  @media (min-width: 520px){ .header-row { grid-template-columns: minmax(140px, 280px) 1fr; align-items:end; } }
  .kpi-row { display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 10px; }
  .grid { display:grid; gap:12px; }
  @media (min-width: 720px){ .grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px){ .grid { grid-template-columns: repeat(3, 1fr); } }
  .card { border-radius: 16px; overflow:hidden; }
  .card-ok { outline: 2px solid #2ecc7040; }
  .card-pend { outline: 2px dashed #f39c1240; }
  .top { display:flex; justify-content:space-between; align-items:center; }
  .left { display:flex; gap:8px; align-items:center; }
  .cliente { display:flex; gap:6px; align-items:center; margin-top:6px; }
  .muted { color: rgba(0,0,0,.55); }
  .row { display:grid; grid-template-columns: repeat(3, minmax(100px,1fr)); gap: 10px; margin: 6px 0 10px; }
  .col { display:grid; gap:4px; }
  .label { font-size:12px; color: rgba(0,0,0,.55); }
  .value { font-size:18px; font-weight:800; }
  .actions { display:flex; gap:6px; flex-wrap:wrap; }
  .empty { margin-top: 32px; display:grid; place-items:center; gap:12px; color: rgba(0,0,0,.6); }
  .empty-icon { font-size:36px; opacity:.5; }
  </style>
  