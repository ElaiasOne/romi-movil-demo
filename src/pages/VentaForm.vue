<template>
    <ion-page>
        <!-- Header dentro de la página -->
    <ion-header>
      <Toolbar />
    </ion-header>
      <ion-content class="ion-padding">
        <form @submit.prevent="onSubmit" novalidate>
          <h2 class="title">{{ isNew ? 'Nueva venta' : 'Editar venta' }}</h2>
  
          <ion-list inset>
            <ion-item>
              <ion-select v-model="form.clienteId" label="Cliente" label-placement="floating" interface="popover" :error-text="errors.clienteId" :class="{ 'has-error': !!errors.clienteId }">
                <ion-select-option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}</ion-select-option>
              </ion-select>
            </ion-item>
  
            <ion-item>
              <ion-input v-model.number="form.nro" type="number" label="Nro. de venta" label-placement="floating" />
            </ion-item>
  
            <ion-item>
              <ion-datetime-button datetime="fechaId" />
              <ion-modal keep-contents-mounted>
                <ion-datetime id="fechaId" v-model="form.fecha" presentation="date" />
              </ion-modal>
            </ion-item>
  
            <ion-item>
              <ion-segment v-model="form.tipoPago" value="contado">
                <ion-segment-button value="contado">
                  <ion-icon name="cash-outline" />
                  <ion-label>Contado</ion-label>
                </ion-segment-button>
                <ion-segment-button value="cuotas">
                  <ion-icon name="card-outline" />
                  <ion-label>Cuotas</ion-label>
                </ion-segment-button>
              </ion-segment>
            </ion-item>
  
            <template v-if="form.tipoPago==='cuotas'">
              <ion-item>
                <ion-input v-model.number="form.cuotas" type="number" min="1" label="Cantidad de cuotas" label-placement="floating" :error-text="errors.cuotas" :class="{ 'has-error': !!errors.cuotas }" />
              </ion-item>
              <ion-item>
                <ion-input v-model.number="form.pagadas" type="number" min="0" :max="form.cuotas||1" label="Cuotas pagadas" label-placement="floating" />
              </ion-item>
            </template>
  
            <ion-item>
              <ion-input v-model.number="form.total" type="number" min="0" step="0.01" label="Total" label-placement="floating" :error-text="errors.total" :class="{ 'has-error': !!errors.total }" />
            </ion-item>
          </ion-list>
  
          <!-- Detalle simple (opcional) -->
          <ion-list inset>
            <ion-item lines="full">
              <ion-input v-model="detalleDesc" label="Detalle (opcional)" label-placement="floating" placeholder="Ej: Descripción general o ítems..." />
            </ion-item>
          </ion-list>
  
          <div class="kpis" v-if="form.tipoPago==='cuotas'">
            <div class="kpi">
              <span class="kpi-label">Valor cuota</span>
              <strong class="kpi-value">${{ money(valorCuota) }}</strong>
            </div>
            <div class="kpi">
              <span class="kpi-label">Restantes</span>
              <strong class="kpi-value">{{ restantes }}</strong>
            </div>
            <div class="kpi">
              <span class="kpi-label">Saldo</span>
              <strong class="kpi-value">${{ money(saldo) }}</strong>
            </div>
          </div>
  
          <div class="actions">
            <ion-button type="submit" expand="block">Guardar</ion-button>
            <ion-button fill="outline" color="medium" expand="block" @click="goBack">Cancelar</ion-button>
            <ion-button v-if="!isNew" color="danger" fill="clear" expand="block" @click="onDelete">Eliminar</ion-button>
          </div>
        </form>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { computed, onMounted, reactive } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    IonPage, IonContent, IonList, IonItem, IonInput, IonSegment, IonSegmentButton, IonLabel, IonIcon,
    IonButton, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton, IonModal
  } from '@ionic/vue'
  
  type Cliente = { id:string; nombre:string }
  type Venta = {
    id: string
    nro: number
    clienteId: string
    fecha: string
    total: number
    tipoPago: 'contado'|'cuotas'
    cuotas?: number
    pagadas?: number
    detalle?: Array<{ descripcion: string }>
  }
  
  const KEY_V='romi_ventas', KEY_C='romi_clientes'
  const getVentas = ():Venta[] => JSON.parse(localStorage.getItem(KEY_V) || '[]')
  const setVentas = (arr:Venta[]) => localStorage.setItem(KEY_V, JSON.stringify(arr))
  const getClientes = ():Cliente[] => JSON.parse(localStorage.getItem(KEY_C) || '[]')
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))
  
  const route = useRoute()
  const router = useRouter()
  const id = String(route.params.id || 'new')
  const isNew = computed(()=> id==='new')
  
  const clientes = getClientes()
  const hoyIso = new Date().toISOString()
  
  const form = reactive<Venta>({
    id: isNew.value ? uuid() : id,
    nro: Math.floor(1000 + Math.random()*9000),
    clienteId: clientes[0]?.id || '',
    fecha: hoyIso,
    total: 0,
    tipoPago: 'contado',
    cuotas: 1,
    pagadas: 0,
    detalle: [],
  })
  
  const errors = reactive<Record<string,string>>({
    clienteId: '',
    total: '',
    cuotas: '',
  })
  
  const detalleDesc = reactive<string>('')
  
  onMounted(()=>{
    if (!isNew.value){
      const v = getVentas().find(x=>x.id===id)
      if (!v){ alert('Venta no encontrada'); router.replace('/app/ventas'); return }
      Object.assign(form, v)
      detalleDesc.value = (v.detalle && v.detalle[0]?.descripcion) || ''
    }
  })
  
  const valorCuota = computed(()=> form.tipoPago==='cuotas' ? (form.total / Math.max(1, Number(form.cuotas||1))) : 0)
  const restantes = computed(()=> form.tipoPago==='cuotas' ? Math.max(0, Number(form.cuotas||0) - Number(form.pagadas||0)) : 0)
  const saldo = computed(()=> form.tipoPago==='cuotas' ? Math.round(restantes.value * valorCuota.value) : 0)
  function money(n:number){ return n.toLocaleString('es-AR', { maximumFractionDigits: 0 }) }
  
  function validate(){
    errors.clienteId = form.clienteId ? '' : 'Seleccione un cliente'
    errors.total = form.total>0 ? '' : 'Total > 0'
    errors.cuotas = form.tipoPago==='cuotas' && (!(form.cuotas && form.cuotas >= 1)) ? 'Cuotas >=1' : ''
    return !Object.values(errors).some(Boolean)
  }
  
  function onSubmit(){
    if (!validate()) return
    const arr = getVentas()
    const i = arr.findIndex(x=>x.id===form.id)
    const payload:Venta = {
      ...form,
      detalle: detalleDesc.value ? [{ descripcion: detalleDesc.value }] : [],
    }
    if (i===-1) arr.push(payload); else arr[i]=payload
    setVentas(arr)
    router.replace('/app/ventas')
  }
  
  function onDelete(){
    if (!confirm('¿Eliminar venta?')) return
    setVentas(getVentas().filter(v=>v.id!==form.id))
    router.replace('/app/ventas')
  }
  function goBack(){ router.back() }
  </script>
  
  <style scoped>
  .title { margin: 0 0 12px; font-weight: 800; }
  .kpis { display:grid; grid-template-columns: repeat(3, minmax(120px,1fr)); gap:10px 12px; padding:12px 12px 0; }
  .kpi { display:grid; gap:4px; }
  .kpi-label { font-size:12px; color: rgba(0,0,0,.6); }
  .kpi-value { font-size:16px; color: var(--ion-color-primary); font-weight:800; }
  .actions { margin-top:16px; display:grid; gap:8px; }
  .has-error { --highlight-color-focused: var(--ion-color-danger); }
  </style>
  